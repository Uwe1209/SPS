// pages/PlantDetailUser.js
import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import BottomNav from "../components/Navigation";

export default function PlantDetailUser({ navigation }) {
  return (
    <View style={styles.background}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.banner} />

        <View style={styles.card}>
          <Text style={styles.label}>Common Name:</Text>
          <Text style={styles.value}>—</Text>
          <Text style={styles.label}>Scientific Name:</Text>
          <Text style={styles.value}>—</Text>
          <Text style={styles.label}>Conservations Status:</Text>
          <View style={styles.hr} />

          <Text style={[styles.section, { marginTop: 8 }]}>Sighting Details</Text>
          <Text style={styles.sub}>Submitted By: Gibson</Text>
          <Text style={styles.sub}>Date Identified: 12 June 2025</Text>
          <Text style={styles.sub}>Location:</Text>
          <View style={styles.location} />

          <Text style={[styles.section, { marginTop: 10 }]}>Identification</Text>
          <Text style={styles.sub}>Confidence Score</Text>
          <Text style={styles.quote}>“AI identified this with 94% confidence.”</Text>

          <TouchableOpacity style={styles.suggestion} onPress={() => navigation.navigate("TopSuggestions")}>
            <Text style={styles.suggestionText}>Top Suggestion</Text>
          </TouchableOpacity>

          <Text style={[styles.section, { marginTop: 10 }]}>Comments</Text>
          <View style={styles.input} />

          <Text style={[styles.section, { marginTop: 10 }]}>Action</Text>
          <TouchableOpacity style={styles.report} onPress={() => navigation.navigate("ReportError")}>
            <Text style={styles.reportText}>⚠ Report an Error!</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomNav navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: "#FFF8EE" },
  container: { flexGrow: 1, paddingBottom: 110 },
  banner: { height: 140, backgroundColor: "#5A7B60" },
  card: { backgroundColor: "#FFF", padding: 16 },
  label: { fontWeight: "700", color: "#222", marginTop: 6 },
  value: { color: "#333" },
  hr: { height: 1, backgroundColor: "#ddd", marginVertical: 8 },
  section: { fontWeight: "800", color: "#222" },
  sub: { color: "#444", marginTop: 4 },
  location: { height: 80, borderRadius: 8, backgroundColor: "#CFD4D0", marginTop: 4 },
  quote: { marginTop: 6, fontStyle: "italic", color: "#333" },
  suggestion: { marginTop: 8, backgroundColor: "#E0F0E0", alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  suggestionText: { fontWeight: "700", color: "#2b2b2b" },
  input: { height: 44, backgroundColor: "#F4F4F4", borderRadius: 10, marginTop: 8 },
  report: { marginTop: 6, paddingVertical: 10, alignItems: "flex-start" },
  reportText: { color: "#b05555", fontWeight: "700" },
});