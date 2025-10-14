// pages/HomepageExpert.js  (or screens/HomepageExpert.js)
import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomNav from "../components/Navigation";

export default function HomepageExpert({ navigation }) {
  return (
    <View style={styles.background}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Greeting */}
        <View style={styles.greetingCard}>
          <View style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.greetingTitle}>Good Morning</Text>
            <Text style={styles.greetingSub}>Bryan</Text>
            <Text style={styles.greetingMeta}>10 🌱 identified so far!</Text>
          </View>
        </View>

        {/* Recent */}
        <Text style={styles.sectionTitle}>Recent</Text>
        <TouchableOpacity
          style={styles.recentCard}
          onPress={() => navigation.navigate("PlantManagementDetail", { id: 1 })}
        >
          <View style={styles.recentThumb} />
          <View style={{ flex: 1 }}>
            <Text style={styles.recentTitle}>Plant ✓</Text>
            <Text style={styles.recentMeta}>17 December 2025</Text>
            <Text style={styles.recentMeta}>27 Jalan Song</Text>
          </View>
          <Text style={styles.linkText}>See More →</Text>
        </TouchableOpacity>

        {/* Plant Management summary */}
        <TouchableOpacity
          style={styles.pmCard}
          onPress={() => navigation.navigate("PlantManagementList")}
        >
          <Text style={styles.pmTitle}>Plant Management</Text>
          <Text style={styles.pmCount}>88</Text>
        </TouchableOpacity>

        {/* Feed */}
        <View style={styles.feedItem}>
          <View style={styles.feedAvatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.feedName}>Gibson</Text>
            <Text style={styles.feedMeta}>1d — Kuching</Text>
          </View>
        </View>

        {/* Banner */}
        <View style={styles.banner} />
      </ScrollView>

      <BottomNav navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: "#F6F1E9" },
  container: { flexGrow: 1, padding: 16, paddingBottom: 80 },
  greetingCard: {
    backgroundColor: "#FFF", borderRadius: 16, padding: 16,
    flexDirection: "row", alignItems: "center", gap: 12, marginTop: 20,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#D7E3D8" },
  greetingTitle: { fontSize: 16, fontWeight: "600", color: "#2b2b2b" },
  greetingSub: { fontSize: 14, color: "#2b2b2b", marginTop: 2 },
  greetingMeta: { fontSize: 12, color: "#4c6b50", marginTop: 6 },
  sectionTitle: { marginTop: 18, marginBottom: 8, fontWeight: "700", color: "#2b2b2b" },
  recentCard: {
    backgroundColor: "#E7F0E5", borderRadius: 16, padding: 12,
    flexDirection: "row", alignItems: "center", gap: 12,
  },
  recentThumb: {
    width: 72, height: 72, borderRadius: 12, backgroundColor: "#FFF",
    borderWidth: 1, borderColor: "#d8e3d8",
  },
  recentTitle: { fontWeight: "700", color: "#2b2b2b", marginBottom: 4 },
  recentMeta: { color: "#2b2b2b", opacity: 0.7, fontSize: 12 },
  linkText: { color: "#2b2b2b", opacity: 0.8, fontWeight: "600" },
  pmCard: {
    marginTop: 12, backgroundColor: "#D1E7D2", borderRadius: 16,
    padding: 18, alignItems: "center", justifyContent: "center",
  },
  pmTitle: { color: "#2b2b2b", fontWeight: "700" },
  pmCount: { marginTop: 6, fontSize: 28, fontWeight: "800", color: "#2b2b2b" },
  feedItem: {
    marginTop: 12, backgroundColor: "#FFF", borderRadius: 12, padding: 12,
    flexDirection: "row", alignItems: "center", gap: 12,
  },
  feedAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#D7E3D8" },
  feedName: { fontWeight: "700", color: "#2b2b2b" },
  feedMeta: { color: "#2b2b2b", opacity: 0.7, fontSize: 12 },
  banner: { marginTop: 12, height: 160, borderRadius: 12, backgroundColor: "#5A7B60" },
});