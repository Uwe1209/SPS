import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";

export default function BottomNav({ navigation }) {
  const route = useRoute(); // get current active route

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity
        style={[styles.tab, route.name === "Home" && styles.activeTab]}
        onPress={() => navigation.navigate("Home")}
      >
        <Ionicons name="home" size={28} color="black" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, route.name === "MapPage" && styles.activeTab]}
        onPress={() => navigation.navigate("MapPage")}
      >
        <Ionicons name="map" size={28} color="black" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.cameraNav, route.name === "Camera" && styles.activeTab]}
        onPress={() => navigation.navigate("Camera")}
      >
        <Ionicons name="camera" size={28} color="black" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, route.name === "Notification" && styles.activeTab]}
        onPress={() => navigation.navigate("Notification")}
      >
        <Ionicons name="notifications" size={28} color="black" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, route.name === "Profile" && styles.activeTab]}
        onPress={() => navigation.navigate("Profile")}
      >
        <FontAwesome name="user" size={28} color="black" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#578C5B",
    height: 60,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
    marginTop: 150,
    padding: 0,
    zIndex: 1,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cameraNav: {
    backgroundColor: "#578C5B",
    borderRadius: 50,
    width: 55,
    height: 55,
    marginTop: -20,
    justifyContent: "center",
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#95D26D", // light green
    borderRadius: 20,
  },
});
