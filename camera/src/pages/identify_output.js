import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";

export default function ResultScreen() {
  return (
    <View style={styles.container}>
      {/* Image Preview Box */}
      <View style={styles.imageBox}>
        <Image
          source={{ uri: "https://via.placeholder.com/150" }} //a placeholder.. i dk what this is for
          style={styles.image}
        />
        <TouchableOpacity style={styles.iconButton}>
          <View style={styles.circle} />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <Text style={styles.title}>AI Identification Result</Text>

      {/* Result Row */}
      <View style={styles.resultRow}>
        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>Plant Name</Text>
          <Text style={styles.resultValue}>Plant</Text>
        </View>
        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>Accuracy</Text>
          <Text style={styles.resultValue}>70%</Text>
        </View>
      </View>

      {/* Done Button */}
      <TouchableOpacity style={styles.doneButton}>
        <Text style={{color: "white",fontWeight: "bold",fontSize: 18,}}>Done</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8E1", // could not find the color code
    alignItems: "center",
    padding: 20,
  },
  imageBox: {
    width: 220,
    height: 220,
    backgroundColor: "#D9D9D9", // gray placeholder
    borderRadius: 4,
    marginTop: 30,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 4,
  },
  iconButton: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  circle: {
    width: 20,
    height: 20,
    backgroundColor: "gray",
    borderRadius: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 10,
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginVertical: 20,
  },
  resultCard: {
    backgroundColor: "#496D4C",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: "center",
    minWidth: 100,
  },
  resultLabel: {
    color: "white",
    fontSize: 12,
    marginBottom: 4,
  },
  resultValue: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  doneButton: {
    backgroundColor: "#496D4C",
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 16,
    marginTop: "auto", 
    marginBottom: 30,
  },

});
