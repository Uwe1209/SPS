import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert} from "react-native";
import { getFullProfile } from "../firebase/UserProfile/UserUpdate";

export default function MyProfile({ navigation, route }) {
  // Extracting email and updated profile info 
  const { userEmail, updatedProfile } = route.params || {};
  // Storing status
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile info from Firebase
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!userEmail) {
          Alert.alert("Error", "No email provided. Please log in.");
          return;
        }
        const data = await getFullProfile(userEmail);
        //console.log("Fetched full profile:", data);
        setProfile(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userEmail, updatedProfile]);

  // Show loading
  if (loading) {
    return (
      <View style={styles.loadingstyle}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
  // Show message if cannot be fetched
  if (!profile) {
    return (
      <View style={loadingstyle}>
        <Text>No profile data available as no login</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate("Profile");
            }
          }}
        >
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My profile</Text>
      </View>

      {/* Profile Picture */}
      <View style={styles.profileSection}>
        <Text style={styles.profileLabel}>Profile picture</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("EditProfile", { email: profile.email })} >
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>
      <Image
        source={profile.profile_pic ? { uri: profile.profile_pic } : require("../../assets/user2.png")}
        style={styles.profileImage}
      />

      {/* Contact Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{profile.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Phone Number</Text>
          <Text style={styles.value}>{profile.phone_number || "N/A"}</Text>
        </View>
      </View>

      {/* Personal Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Details</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{profile.full_name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Date of Birth</Text>
          <Text style={styles.value}>{profile.date_of_birth || "N/A"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>NRIC</Text>
          <Text style={styles.value}>{profile.nric || "*******000"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Gender</Text>
          <Text style={styles.value}>{profile.gender|| "N/A"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Address</Text>
          <Text style={styles.value}>{profile.address || "N/A"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>District</Text>
          <Text style={styles.value}>{profile.division || "N/A"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Postcode</Text>
          <Text style={styles.value}>{profile.postcode || "N/A"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Race</Text>
          <Text style={styles.value}>{profile.race || "N/A"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Occupation</Text>
          <Text style={styles.value}>{profile.occupation || "N/A"}</Text>
        </View>
      </View>

      {/* Security Centre */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security Centre</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Change Password</Text>
          <Text style={styles.value}>*******</Text>
        </View>
      </View>
    </ScrollView>
  );
}

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
  profileSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  profileLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  editText: {
    fontSize: 16,
    color: "blue",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 100,
    backgroundColor: "#ddd",
    alignSelf: "center",
    marginVertical: 15,
  },
  section: {
    marginVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    paddingVertical: 5,
  },
  label: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  value: {
    flex: 2,
    fontSize: 15,
    color: "#333",
    textAlign: "right",
  },
  loadingstyle:{
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center"
  }
});
