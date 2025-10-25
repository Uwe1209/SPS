// pages/TopSuggestions.js
import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import BottomNav from "../components/Navigation";

export default function TopSuggestions({ navigation }) {
  const cards = [
    { id: 1, title: "Plant ✓", date: "17 December 2025", confidence: "90% Confidence" },
    { id: 2, title: "Plant ✓", date: "17 December 2025", confidence: "85% Confidence" },
    { id: 3, title: "Plant ✓", date: "17 December 2025", confidence: "84% Confidence" },
  ];

  return (
    <View style={styles.background}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Top Suggestion</Text>
        {cards.map((c) => (
          <TouchableOpacity key={c.id} style={styles.card} onPress={() => navigation.navigate("PlantDetailUser")}>
            <View style={styles.thumb} />
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{c.title}</Text>
              <Text style={styles.meta}>{c.date}</Text>
              <Text style={styles.meta}>{c.confidence}</Text>
            </View>
            <Text style={styles.link}>See More →</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <BottomNav navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: "#FFF8EE" },
  container: { flexGrow: 1, padding: 16, paddingBottom: 110 },
  header: { fontSize: 16, fontWeight: "800", marginBottom: 10 },
  card: { backgroundColor: "#E7F0E5", borderRadius: 16, padding: 12, flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  thumb: { width: 72, height: 72, borderRadius: 12, backgroundColor: "#FFF" },
  title: { fontWeight: "800" }, meta: { fontSize: 12, color: "#2b2b2b" },
  link: { fontWeight: "700" },
});