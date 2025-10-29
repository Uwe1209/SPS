import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function PlantSuggestionCard({ name, confidence, onPress }) {
  return (
    <View style={styles.card}>
      {/* Placeholder for image */}
      <View style={styles.imagePlaceholder} />

      <View style={styles.textContainer}>
        <Text style={styles.plantName}>{name}</Text>
        <Text style={styles.confidenceText}>{confidence}% Confidence</Text>

        <TouchableOpacity onPress={onPress}>
          <Text style={styles.seeMore}>See More →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#5E8C61",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  imagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: "#D9D9D9",
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  plantName: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 6,
  },
  confidenceText: {
    color: "white",
    fontSize: 14,
    marginBottom: 10,
  },
  seeMore: {
    color: "white",
    fontWeight: "500",
  },
});
