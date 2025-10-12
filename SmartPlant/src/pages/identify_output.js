import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, ActivityIndicator  } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

export default function ResultScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { prediction, imageURI } = route.params || {};

  const [heatmapURI, setHeatmapURI] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [showHeatmap, setShowHeatmap] = React.useState(false); // toggle overlay

  // prediction is expected to be an array like:
  // [{ class: "Nepenthes_tentaculata", confidence: 0.7321 }, {...}, {...}]

  console.log("Predictions received:", prediction);

  const constructHeatmap = async () => {
    if (heatmapURI) {
      // toggle overlay
      setShowHeatmap(!showHeatmap);
      return;
    }

    const formData = new FormData();
    formData.append("image", {
      uri: imageURI,
      type: "image/jpeg",
      name: "photo.jpg",
    });

    try {
      setLoading(true);

      const response = await fetch("http://192.168.95.1:3000/heatmap", {
        method: "POST",
        headers: { "Content-Type": "multipart/form-data" },
        body: formData,
      });

      const data = await response.json();
      setLoading(false);

      if (data.heatmap) {
        setHeatmapURI(data.heatmap);
        setShowHeatmap(true);
      } else {
        alert("Heatmap not returned from server.");
      }
    } catch (err) {
      console.log("Upload error:", err);
      setLoading(false);
      alert("Failed to generate heatmap. Check backend connection.");
    }
  };



  return (
    <View style={styles.container}>
      {/* Image Preview Box */}
      {/* <View style={styles.imageBox}>
        <Image source={{ uri: imageURI }} style={styles.image} />
        <TouchableOpacity style={styles.iconButton}>
          <View style={styles.circle} onLongPress={constructHeatmap}/>
        </TouchableOpacity>
      </View> */}
      <View style={styles.imageBox}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#00ff3cff" />
            <Text style={{ color: "white", marginTop: 10 }}>Generating...</Text>
          </View>
        )}
        <Image
          source={{ uri: showHeatmap && heatmapURI ? heatmapURI : imageURI }}
          style={styles.image}
        />

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => {
            if (heatmapURI) {

              setShowHeatmap(!showHeatmap);
            } else {
              // generate heatmap first
              constructHeatmap();
            }
          }}
        >
          <View style={styles.circle} />
        </TouchableOpacity>
      </View>


      {/* Title */}
      <Text style={styles.title}>AI Identification Result</Text>

      {/* Top 3 Results */}
      <FlatList
        data={prediction || []}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.resultCard}>
            <Text style={styles.resultRank}>#{index + 1}</Text>
            <Text style={styles.resultLabel}>{item.class}</Text>
            <Text style={styles.resultValue}>
              {(item.confidence * 100).toFixed(2)}%
            </Text>
          </View>
        )}
        contentContainerStyle={styles.resultsContainer}
      />

      {/* Done Button */}
      <TouchableOpacity style={styles.doneButton} onPress={() => navigation.goBack()}>
        <Text style={{ color: "white", fontWeight: "bold", fontSize: 18 }}>Done</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8E1",
    alignItems: "center",
    padding: 20,
  },
  imageBox: {
    width: 220,
    height: 220,
    backgroundColor: "#D9D9D9",
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
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 12,
  },
  resultsContainer: {
    width: "100%",
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  resultCard: {
    backgroundColor: "#496D4C",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: "center",
    marginVertical: 6,
  },
  resultRank: {
    color: "white", // gold for ranking
    fontWeight: "bold",
    marginBottom: 4,
  },
  resultLabel: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 4,
  },
  resultValue: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  doneButton: {
    backgroundColor: "#496D4C",
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 16,
    marginTop: "auto",
    marginBottom: 30,
  },
  loadingOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 1000,
    },
});
