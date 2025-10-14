// pages/PostDetail.js
import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomNav from "../components/Navigation";

export default function PostDetail({ navigation, route }) {
  const { id } = route.params || {};
  return (
    <View style={styles.background}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatar} />
          <View>
            <Text style={styles.name}>Gibson</Text>
            <Text style={styles.meta}>1d — Kuching</Text>
          </View>
          <TouchableOpacity style={styles.details} onPress={() => navigation.navigate("PlantDetailUser")}>
            <Text style={styles.detailsText}>Details</Text>
          </TouchableOpacity>
        </View>

        {/* Photo placeholder */}
        <View style={styles.photo} />

        {/* Comments */}
        <View style={styles.actions}>
          <Ionicons name="heart-outline" size={22} />
          <Ionicons name="chatbubble-ellipses-outline" size={22} style={{ marginLeft: 14 }} />
        </View>

      </ScrollView>

      <BottomNav navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: "#FFF8EE" },
  container: { flexGrow: 1, padding: 16, paddingBottom: 110 },
  header: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#D7E3D8", marginRight: 8 },
  name: { fontWeight: "700" }, meta: { fontSize: 12, opacity: 0.7 },
  details: { marginLeft: "auto", backgroundColor: "#E7F0E5", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  detailsText: { fontWeight: "700" },
  photo: { height: 200, backgroundColor: "#5A7B60", borderRadius: 10, marginTop: 12 },
  actions: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  comment: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  bullet: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#C0C0C0", marginRight: 10 },
  commentText: { color: "#222" },
});