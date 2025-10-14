// screens/PlantManagementList.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";

const COLORS = ["#C36B6B", "#3F6B4F", "#A7D27B", "#9CA3AF", "#EDEDE0", "#333333"];

export default function PlantManagementList({ navigation }) {
  const tiles = Array.from({ length: 18 }).map((_, i) => ({
    id: i + 1,
    label: `Plant ${i + 1}`,  
    color: COLORS[i % COLORS.length],
  }));

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
      <Text style={styles.title}>Plant Management</Text>

      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput placeholder="Search" style={styles.search} />
      </View>

      {/* Filter chips */}
      <View style={styles.chipsRow}>
        {["Common", "Rare", "Endangered"].map((c) => (
          <TouchableOpacity key={c} style={styles.chip}>
            <Text style={styles.chipText}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Grid */}
      <View style={styles.grid}>
        {tiles.map((t) => (
          <TouchableOpacity
            key={t.id}
            style={[styles.tile, { backgroundColor: t.color }]}
            onPress={() => navigation.navigate("PlantManagementDetail", { id: t.id })}
          >
            <Text style={styles.tileLabel}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F1E9", padding: 16 },
  title: { fontSize: 16, fontWeight: "700", marginBottom: 10, color: "#2b2b2b" },
  searchRow: { marginBottom: 10 },
  search: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: "#e2e8e2",
  },
  chipsRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  chip: { backgroundColor: "#D7EBD7", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  chipText: { fontWeight: "600", color: "#2b2b2b" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tile: {
    width: "31%",
    height: 96,
    borderRadius: 8,
    alignItems: "flex-start",
    justifyContent: "flex-end",
    padding: 6,
  },
  tileLabel: { color: "#fff", fontWeight: "700" },
});