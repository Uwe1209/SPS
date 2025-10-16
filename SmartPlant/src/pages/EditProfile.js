import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Image } from "react-native";
import { getFullProfile} from "../firebase/UserProfile/UserUpdate";
import { updateUserProfile } from "../firebase/UserProfile/ProfileUpdate";
import { storage } from "../firebase/FirebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";

export default function EditProfile({ navigation, route }) {
  // Get email passed from MyProfile
  const { email } = route.params; 
  const [profile, setProfile] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile info from Firebase
  useEffect(() => {
    if (!email) {   
      Alert.alert("Error", "No email provided. Please log in.");
      return;
    }
    const fetchProfile = async () => {
      try {
        const data = await getFullProfile(email);
        setProfile(data);
        setImageUri(data.profile_pic || null);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [email]);

  // Update text fields
  const handleChange = (key, value) => setProfile({ ...profile, [key]: value });

  // Pick image from gallery
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access camera roll is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  // Upload image to Firebase Storage
  const uploadImage = async (uri, email) => {
    if (!uri) return null;
    try {
      console.log("Uploading from:", uri);
      const response = await fetch(uri);
      const blob = await response.blob();
      const filename = `profile_pictures/${email}_${Date.now()}.jpg`;
      const imageRef = ref(storage, filename);
      await uploadBytes(imageRef, blob);
      const downloadURL = await getDownloadURL(imageRef);
      return downloadURL;
    } catch (error) {
      console.error(" Error uploading image:", error);
      throw error;
    }
  };

  // Handle updated profile
  const handleSave = async () => {
    try {
      let updatedProfile = { ...profile };

      // Upload new image if changed
      if (imageUri && imageUri !== profile.profile_pic) {
        const downloadURL = await uploadImage(imageUri, email);
        updatedProfile.profile_pic = downloadURL;
      }

      // Password validation 
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          Alert.alert("Error", "Passwords do not match");
          return;
        }
        updatedProfile.password = newPassword; // hardcoded for your setup
      }

      // Update Firestore profile
      await updateUserProfile(email, updatedProfile);

      Alert.alert("Success", "Profile updated!");
      navigation.replace("Profile", { userEmail: email });
    } catch (err) {
      console.error("Error updating profile:", err);
      Alert.alert("Error", "Failed to update profile");
    }
  };

  if (!profile) {
    return (
      <View style={styles.loadingstyle}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit profile</Text>
      </View>


      {/* Profile Picture */}
      <TouchableOpacity style={styles.profileContainer} onPress={pickImage}>
        <Image
          source={imageUri ? { uri: imageUri } : require("../../assets/user2.png")}
          style={styles.profileImage}
        />
        <Text style={styles.changeText}>Change Profile Picture</Text>
      </TouchableOpacity>

      {/* Editable fields input */}
      <InputField label="Full Name" value={profile.full_name} onChange={(v) => handleChange("full_name", v)} />
      <InputField label="Phone" value={profile.phone_number || ""} onChange={(v) => handleChange("phone_number", v)} />
      <InputField label="Address" value={profile.address || ""} onChange={(v) => handleChange("address", v)} />
      <InputField label="Gender" value={profile.gender || ""} onChange={(v) => handleChange("gender", v)} />
      <InputField label="Date of Birth" value={profile.date_of_birth || ""} onChange={(v) => handleChange("date_of_birth", v)} />
      <InputField label="NRIC" value={profile.nric || ""} onChange={(v) => handleChange("nric", v)} />
      <InputField label="District" value={profile.division || ""} onChange={(v) => handleChange("division", v)} />
      <InputField label="Postcode" value={profile.postcode || ""} onChange={(v) => handleChange("postcode", v)} />
      <InputField label="Race" value={profile.race || ""} onChange={(v) => handleChange("race", v)} />
      <InputField label="Occupation" value={profile.occupation || ""} onChange={(v) => handleChange("occupation", v)} />
      <InputField label="New Password" value={newPassword} onChange={setNewPassword} secureTextEntry={true}/>
      <InputField label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} secureTextEntry={true}/>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

{/* Input layout */}
const InputField = ({ label, value, onChange }) => (
  <View style={styles.container}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChange}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fefae0",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  back: {
    fontSize: 22,
    marginRight: 10,
    marginTop: 30,
  },
  headerTitle: {
    fontSize: 20,
    marginTop: 30,
    textAlign: "center",
    width: "80%",
  },
  profileContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 100,
    backgroundColor: "#ddd",
    alignSelf: "center",
    marginVertical: 15,
  },
  changeImageText: {
    textAlign: "center",
    color: "blue",
    marginTop: 5,
  },
  saveButton: { 
    backgroundColor: "#5A7B60", 
    padding: 12, 
    borderRadius: 8, 
    marginTop: 20 
  },
  saveText: { 
    color: "#fff", 
    textAlign: "center", 
    fontWeight: "bold" 
  },
  loadingstyle:{
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center"
  },
  inputContainer:{
    marginBottom: 12,
  },
  label: {
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginTop: 4,
  },
});

