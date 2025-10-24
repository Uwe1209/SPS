// Feedback.js
<<<<<<< HEAD
import React from "react";
=======
>>>>>>> 217dbb287f57b9f55efba5ef5a9d47b2c1115ead
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

export default function FeedbackScreen({ navigation }) {
  return (
    <View style={styles.background}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color="black" />
        </TouchableOpacity>
        <View style={styles.iconRow}>
          <Ionicons name="mail-outline" size={22} color="black" style={styles.headerIcon} />
          <Ionicons name="trash-outline" size={22} color="black" style={styles.headerIcon} />
          <MaterialIcons name="error-outline" size={22} color="black" style={styles.headerIcon}/>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>Feedback</Text>

      {/* Mail Row */}
      <View style={styles.mailRow}>
        <View style={styles.avatar} />
        <Text style={styles.mailTitle}>Feedback</Text>
        <Text style={styles.mailDay}>Tuesday</Text>
      </View>

      {/* Content */}
      <Text style={styles.mailPreview}>xxxxxxxx</Text>

      {/* Reply Button */}
      <View style={styles.replyWrap}>
        <TouchableOpacity style={styles.replyBtn}>
          <Text style={styles.replyText}>Reply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#fefae0",
    padding: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 14,
  },
  iconRow: {
    flexDirection: "row",
    marginLeft: "auto",
  },
  headerIcon: {
    marginHorizontal: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },
  mailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ddd",
    marginRight: 10,
  },
  mailTitle: {
    fontWeight: "bold",
    fontSize: 16,
    flex: 1,
  },
  mailDay: {
    fontSize: 14,
    color: "#333",
  },
  mailPreview: {
    fontSize: 15,
    color: "#444",
    marginBottom: 20,
  },
  replyWrap: {
    flex: 1,
    justifyContent: "flex-end",
  },
  replyBtn: {
    backgroundColor: "#8B7355",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  replyText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});
