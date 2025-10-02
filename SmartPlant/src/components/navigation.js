// BottomNav.js
import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";//icons

export default function BottomNav({ navigation }) {
  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate("Home")}>
        <Ionicons name="home" size={28} color="black" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate("Map")}>
        <Ionicons name="map" size={28} color="black" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.cameraNav} onPress={() => navigation.navigate("Camera")}>
        <Ionicons name="camera" size={28} color="black" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate("Notifications")}>
        <Ionicons name="notifications" size={28} color="black" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.userNav} onPress={() => navigation.navigate("Profile")}>
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
  userNav: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#95D26D",
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
  },
});
