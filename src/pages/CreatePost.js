// pages/CreatePost.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import BottomNav from "../components/Navigation";

export default function CreatePost({ navigation }) {
  const [image, setImage] = React.useState(null);
  const [caption, setCaption] = React.useState("");

  // handle both old and new expo-image-picker shapes
  const getAssetUri = (result) => {
    if (!result) return null;
    // new API
    if (typeof result.canceled !== "undefined") {
      if (result.canceled) return null;
      return result.assets?.[0]?.uri ?? null;
    }
    // old API (<= v13)
    if (result.cancelled) return null;
    return result.uri ?? null;
  };

  const ensurePerms = async () => {
    const { status: cam } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: lib } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (cam !== "granted" || lib !== "granted") {
      Alert.alert("Permission required", "Camera & library permissions are needed.");
      return false;
    }
    return true;
  };

  const pickFromLibrary = async () => {
    if (!(await ensurePerms())) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    const uri = getAssetUri(res);
    if (uri) setImage(uri);
  };

  const takePhoto = async () => {
    if (!(await ensurePerms())) return;
    const res = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    const uri = getAssetUri(res);
    if (uri) setImage(uri);
  };

  // navigate to whichever home exists (User first, then Expert)
  const navigateHomeWithPost = (post) => {
    let nav = navigation;
    while (nav) {
      const state = nav.getState?.();
      const hasUser = state?.routes?.some((r) => r.name === "HomepageUser");
      const hasExpert = state?.routes?.some((r) => r.name === "HomepageExpert");
      if (hasUser) return nav.navigate("HomepageUser", { newPost: post });
      if (hasExpert) return nav.navigate("HomepageExpert", { newPost: post });
      nav = nav.getParent?.();
    }
    // fallback if nothing found
    navigation.goBack();
  };

  const submit = () => {
    if (!image && !caption.trim()) {
      Alert.alert("Nothing to post", "Add a photo or write a caption first.");
      return;
    }
    const post = {
      id: Date.now(),
      image,
      caption: caption.trim(),
      author: "You",
      time: "now",
    };
    navigateHomeWithPost(post);
  };

  return (
    <View style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.title}>Create Post</Text>

        <View style={styles.imageBox}>
          {image ? <Image source={{ uri: image }} style={styles.preview} /> : <Text>No image selected</Text>}
        </View>

        <View style={styles.row}>
          <TouchableOpacity style={styles.btn} onPress={takePhoto}><Text style={styles.btnText}>Camera</Text></TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={pickFromLibrary}><Text style={styles.btnText}>Library</Text></TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Write a caption..."
          value={caption}
          onChangeText={setCaption}
        />

        <TouchableOpacity style={[styles.postBtn, styles.postBtnSmall]} onPress={submit}>
          <Text style={styles.postTextSmall}>Post</Text>
        </TouchableOpacity>
      </View>

      <BottomNav navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: "#F6F1E9" },
  container: { flex: 1, padding: 16, paddingBottom: 110 },
  title: { fontSize: 22, fontWeight: "800", marginTop: 16, marginBottom: 10 },
  imageBox: { height: 220, backgroundColor: "#FFF", borderRadius: 12, alignItems: "center", justifyContent: "center" },
  preview: { width: "100%", height: "100%", borderRadius: 12 },
  row: { flexDirection: "row", gap: 12, marginVertical: 12 },
  btn: { flex: 1, backgroundColor: "#D1E7D2", borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  btnText: { 
    fontWeight: "700", color: "#2b2b2b" 
},
  
  input: { 
  backgroundColor: "#FFF", borderRadius: 12, padding: 12, marginTop: 6 },
  postBtn: {
  backgroundColor: "#6EA564",
  marginTop: 16,
  borderRadius: 8,
},

postBtnSmall: {
  alignSelf: "flex-end",
  paddingVertical: 6,
  paddingHorizontal: 12,
},

postTextSmall: {
  color: "#fff",
  fontWeight: "800",
  fontSize: 13,
},

  postText: { color: "#fff", fontWeight: "800" },
});