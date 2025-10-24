import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from "react-native";
import BottomNav from "../components/Navigation";
import { getFullProfile } from "../firebase/UserProfile/UserUpdate";
import { auth } from "../firebase/FirebaseConfig";
import { useFocusEffect } from '@react-navigation/native';

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
      setLoading(true);
      try {
        const user = auth.currentUser; 
        if (!user) {
          Alert.alert("Error", "No logged-in user found. Please log in again.");
          navigation.replace("Login");
          return;
        }

        const email = user.email;
        const data = await getFullProfile(email);
        setProfile(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
  
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.loadingstyle}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.loadingstyle}>
        <Text>Profile not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.background}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Profile</Text>

        {/* Profile Image */}
        <View style={styles.profileContainer}>
          <Image
            source={profile.profile_pic ? { uri: profile.profile_pic } : require("../../assets/user2.png")}
            style={styles.profileImage}
          />
          <Text style={styles.username}>{profile.full_name}</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => navigation.navigate("MyProfile", { userEmail: profile.email })}

          >
            <Text style={styles.menuText}>My Profile</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Uploaded Post</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate("Saved")} 
          >
            <Text style={styles.menuText}>Saved</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate("Setting")} 
          >
            <Text style={styles.menuText}>Settings</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} 
          onPress={async () => {
              try {
                await auth.signOut();
                navigation.replace("LoginSelection");
              } catch (error) {
                console.error("Error logging out:", error);
              }
            }}>
            <Text style={styles.menuText}>Log Out</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          {/* Temporary link to Admin Dashboard */}
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate("AdminDashboard")} 
          >
            <Text style={styles.menuText}>Admin Dashboard (temp)</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Fixed Bottom Nav */}
      <BottomNav navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  background:{
    flex: 1, 
    backgroundColor: "#fefae0", 
  },
  container: {
    flexGrow: 1,
    backgroundColor: "#fefae0",
    alignItems: "center",
    padding: 20,
  },
  title: {
    marginTop: 40,
    fontSize: 26,
    fontWeight: "bold",
    marginVertical: 10,
  },
  profileContainer: {
    alignItems: "center",
    marginVertical: 20,
    width: "100%",
  },
  profileImage: {
    width: 100,
    height: 100,
    aspectRatio: 1,
    borderRadius: 100,
    resizeMode: "cover",
    backgroundColor: "#ddd",
  },
  username: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "500",
  },
  menuContainer: {
    width: "100%",
    marginTop: 20,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  menuText: {
    fontSize: 16,
  },
  arrow: {
    fontSize: 18,
    color: "#333",
  },
  loadingstyle:{
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center"
  }
});

