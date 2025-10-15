// pages/HomepageUser.js
import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import BottomNav from "../components/Navigation";

export default function HomepageUser({ navigation }) {
  const route = useRoute();

  const [posts, setPosts] = useState([
    // seed with one placeholder post (optional)
    { id: 1, image: null, caption: "Hello jungle!", author: "Gibson", time: "1d" },
  ]);

  // When we navigate back from CreatePost with { newPost }, prepend it once.
  useFocusEffect(
    useCallback(() => {
      const newPost = route.params?.newPost;
      if (newPost) {
        setPosts((prev) => [newPost, ...prev]);
        // clear param so it doesn't add again on next focus
        navigation.setParams?.({ newPost: undefined });
      }
    }, [route.params?.newPost])
  );

  const openPost = () => navigation.navigate("CreatePost");
  const openDetail = (post) => navigation.navigate("PostDetail", { id: post.id });

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
          onPress={() => navigation.navigate("PlantDetailUser")}
        >
          <View style={styles.recentThumb} />
          <View style={{ flex: 1 }}>
            <Text style={styles.recentTitle}>Plant ✓</Text>
            <Text style={styles.recentMeta}>17 December 2025</Text>
            <Text style={styles.recentMeta}>27 Jalan Song</Text>
          </View>
          <Text style={styles.linkText}>See More →</Text>
        </TouchableOpacity>

        {/* Feed list */}
        {posts.map((p) => (
          <TouchableOpacity key={p.id} style={styles.feedCard} onPress={() => openDetail(p)}>
            <View style={styles.feedHeader}>
              <View style={styles.feedAvatar} />
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.feedName}>{p.author}</Text>
                <Text style={styles.feedMeta}>{p.time} — Kuching</Text>
              </View>
              <Text style={styles.detailsPill}>Details</Text>
            </View>
            {p.image ? (
              <Image source={{ uri: p.image }} style={styles.feedImage} />
            ) : (
              <View style={styles.feedImage} />
            )}
            {p.caption ? <Text style={{ marginTop: 8 }}>{p.caption}</Text> : null}
            <View style={styles.feedActions}>
              <Ionicons name="heart-outline" size={20} />
              <Ionicons name="chatbubble-ellipses-outline" size={20} style={{ marginLeft: 14 }} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Floating action button to create post */}
      <TouchableOpacity style={styles.fab} onPress={openPost}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <BottomNav navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: "#F6F1E9" },
  container: { flexGrow: 1, padding: 16, paddingBottom: 110 },

  greetingCard: {
    backgroundColor: "#FFF", borderRadius: 16, padding: 16,
    flexDirection: "row", alignItems: "center", gap: 12, marginTop: 20,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#D7E3D8" },
  greetingTitle: { fontSize: 16, fontWeight: "600", color: "#2b2b2b" },
  greetingSub: { fontSize: 14, color: "#2b2b2b", marginTop: 2 },
  greetingMeta: { fontSize: 12, color: "#4c6b50", marginTop: 6 },

  sectionTitle: { marginTop: 18, marginBottom: 8, fontWeight: "700", color: "#2b2b2b" },
  recentCard: { backgroundColor: "#E7F0E5", borderRadius: 16, padding: 12, flexDirection: "row", alignItems: "center", gap: 12 },
  recentThumb: { width: 72, height: 72, borderRadius: 12, backgroundColor: "#FFF", borderWidth: 1, borderColor: "#d8e3d8" },
  recentTitle: { fontWeight: "700", color: "#2b2b2b", marginBottom: 4 },
  recentMeta: { color: "#2b2b2b", opacity: 0.7, fontSize: 12 },
  linkText: { color: "#2b2b2b", opacity: 0.8, fontWeight: "600" },

  feedCard: { marginTop: 16, backgroundColor: "#FFF", borderRadius: 12, padding: 12 },
  feedHeader: { flexDirection: "row", alignItems: "center" },
  feedAvatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#D7E3D8" },
  feedName: { fontWeight: "700", color: "#2b2b2b" },
  feedMeta: { color: "#2b2b2b", opacity: 0.7, fontSize: 12 },
  detailsPill: { marginLeft: "auto", backgroundColor: "#E7F0E5", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  feedImage: { height: 140, backgroundColor: "#5A7B60", borderRadius: 10, marginTop: 12 },
  feedActions: { flexDirection: "row", alignItems: "center", marginTop: 10 },

  fab: {
    position: "absolute", right: 20, bottom: 80,
    width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center",
    backgroundColor: "#6EA564", elevation: 6,
  },
});