// pages/ReportError.js
import React from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import BottomNav from "../components/Navigation";

export default function ReportError({ navigation }) {
  const [title, setTitle] = React.useState("");
  const [details, setDetails] = React.useState("");

  const upload = async () => {
    await ImagePicker.requestMediaLibraryPermissionsAsync();
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!res.canceled) Alert.alert("Uploaded", "Screenshot attached (mock).");
  };

  return (
    <View style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.header}>Report</Text>

        <Text style={styles.label}>What is the error about?</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} />

        <Text style={[styles.label, { marginTop: 10 }]}>
          Please describe the error in detail. Please provide reasons if possible.
        </Text>
        <TextInput
          style={[styles.input, { height: 110 }]}
          value={details}
          onChangeText={setDetails}
          multiline
        />

        <Text style={styles.help}>
          You can upload a screenshot, a photo from a book to a reputable source here. (Optional)
        </Text>
        <TouchableOpacity style={styles.smallBtn} onPress={upload}>
          <Text>Upload</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.submit} onPress={() => navigation.goBack()}>
          <Text style={{ color: "#fff", fontWeight: "800" }}>Submit</Text>
        </TouchableOpacity>
      </View>

      <BottomNav navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: "#FFF8EE" },
  container: { flex: 1, padding: 16, paddingBottom: 110 },
  header: { fontSize: 18, fontWeight: "800", marginBottom: 8 },
  label: { fontWeight: "600", marginTop: 6 },
  input: { backgroundColor: "#fff", borderRadius: 8, borderWidth: 1, borderColor: "#cfcfcf", padding: 10, marginTop: 4 },
  help: { fontSize: 12, color: "#444", marginTop: 8 },
  smallBtn: { alignSelf: "flex-end", backgroundColor: "#eee", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginTop: 6 },
  submit: { alignSelf: "center", marginTop: 18, backgroundColor: "#6EA564", paddingHorizontal: 22, paddingVertical: 10, borderRadius: 8 },
});