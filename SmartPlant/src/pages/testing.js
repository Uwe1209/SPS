import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import PlantSuggestionCard from "../components/PlantSuggestionCard";

export default function PlantPreviewScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <PlantSuggestionCard
        name="Aloe Vera"
        confidence={95.23}
        image={require("../../assets/good.jpg")}
        onPress={() => console.log("See more pressed")}
      />

      <PlantSuggestionCard
        name="Snake Plant"
        confidence={82.47}
        image={require("../../assets/good.jpg")}
        onPress={() => console.log("See more pressed")}
      />

      <PlantSuggestionCard
        name="Monstera Deliciosa"
        confidence={74.11}
        image={require("../../assets/good.jpg")}
        onPress={() => console.log("See more pressed")}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
});
