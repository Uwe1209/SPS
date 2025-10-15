import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from "react-native";

export default function MyProfile({ navigation }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My profile</Text>
      </View>

      {/* Profile Picture */}
      <View style={styles.profileSection}>
        <Text style={styles.profileLabel}>Profile picture</Text>
        <TouchableOpacity>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>
      <Image
        source={require("../../assets/user2.png")}
        style={styles.profileImage}
      />

      {/* Contact Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>Bryan@gmail.com</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Phone Number</Text>
          <Text style={styles.value}>0143980012</Text>
        </View>
      </View>

      {/* Personal Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Details</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>Bryan</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Date of Birth</Text>
          <Text style={styles.value}>2004</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>NRIC</Text>
          <Text style={styles.value}>*******000</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Gender</Text>
          <Text style={styles.value}>Male</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Address</Text>
          <Text style={styles.value}>xxxx</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>District</Text>
          <Text style={styles.value}>Kuching</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Postcode</Text>
          <Text style={styles.value}>94300</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Race</Text>
          <Text style={styles.value}>Chinese</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Occupation</Text>
          <Text style={styles.value}>Student</Text>
        </View>
      </View>

      {/* Security Centre */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security Centre</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Change Password</Text>
          <Text style={styles.value}>*******</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fefae0",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  back: {
    fontSize: 22,
    marginRight: 10,
    marginTop: 30,
  },
  headerTitle: {
    fontSize: 20,
    marginTop: 30,
    textAlign: "center",
    width: "80%",
  },
  profileSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  profileLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  editText: {
    fontSize: 16,
    color: "blue",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 100,
    backgroundColor: "#ddd",
    alignSelf: "center",
    marginVertical: 15,
  },
  section: {
    marginVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    paddingVertical: 5,
  },
  label: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  value: {
    flex: 2,
    fontSize: 15,
    color: "#333",
    textAlign: "right",
  },
});
