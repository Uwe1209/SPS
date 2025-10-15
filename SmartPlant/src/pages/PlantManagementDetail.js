// screens/PlantManagementDetail.js
import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";

export default function PlantManagementDetail({ route, navigation }) {
  const { id } = route.params || {};
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
      {/* Top banner */}
      <View style={styles.banner} />

      {/* Content */}
      <View style={styles.card}>
        <Text style={styles.sectionHeader}>Common Name:</Text>
        <Text style={styles.value}>—</Text>

        <Text style={styles.sectionHeader}>Scientific Name:</Text>
        <Text style={styles.value}>—</Text>

        <Text style={styles.sectionHeader}>Conservations Status:</Text>
        <View style={styles.divider} />

        <Text style={[styles.sectionHeader, { marginTop: 10 }]}>Sighting Details</Text>
        <Text style={styles.fieldLabel}>Submitted by:</Text>
        <Text style={styles.value}>Gibson</Text>
        <Text style={styles.fieldLabel}>Date identified:</Text>
        <Text style={styles.value}>12 June 2025</Text>
        <Text style={styles.fieldLabel}>Location:</Text>
        <View style={styles.locationBox} />

        <Text style={[styles.sectionHeader, { marginTop: 10 }]}>Identification</Text>
        <Text style={styles.fieldLabel}>Confidence Score</Text>
        <View style={styles.quote}>
          <Text style={styles.quoteText}>“AI identified this with 94% confidence.”</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.btn, styles.approve]} onPress={() => navigation.goBack()}>
          <Text style={styles.btnText}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.reject]} onPress={() => navigation.goBack()}>
          <Text style={styles.btnText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F1E9" },
  banner: { height: 160, backgroundColor: "#5A7B60" },
  card: { backgroundColor: "#FFF5EB", padding: 16 },
  sectionHeader: { fontWeight: "700", color: "#2b2b2b", marginTop: 6 },
  fieldLabel: { color: "#2b2b2b", opacity: 0.7, marginTop: 6 },
  value: { color: "#2b2b2b", marginBottom: 4 },
  divider: { height: 1, backgroundColor: "#cfcfcf", marginVertical: 8 },
  locationBox: { height: 90, borderRadius: 8, backgroundColor: "#CFD4D0", marginTop: 4 },
  quote: { marginTop: 8, paddingVertical: 12, borderTopWidth: 1, borderColor: "#cfcfcf" },
  quoteText: { fontStyle: "italic", color: "#2b2b2b" },
  actions: {
    backgroundColor: "#FFF5EB",
    paddingHorizontal: 16,
    paddingBottom: 24,
    flexDirection: "row",
    gap: 12,
  },
  btn: { flex: 1, borderRadius: 10, paddingVertical: 14, alignItems: "center" },
  approve: { backgroundColor: "#8CC28F" },
  reject: { backgroundColor: "#D36363" },
  btnText: { color: "#fff", fontWeight: "700" },
});