// Mail.js
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { Ionicons, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import React from "react";

export default function MailScreen({ navigation }) {
  // star state per item
  const [stars, setStars] = React.useState({
    feedback: false,
    report: false,
  });

  const toggleStar = (key) => {
    setStars((s) => ({ ...s, [key]: !s[key] }));
  };

  return (
    <View style={styles.background}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" style={styles.iconBack} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mail Management</Text>
          <View style={styles.headerRightSpacer} />
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <Ionicons name="search" style={styles.iconSearch} />
          <TextInput
            placeholder="Search..."
            placeholderTextColor="#aaa"
            style={styles.searchInput}
          />
        </View>

        {/* Filter Chips */}
        <View style={styles.chipsRow}>
          <TouchableOpacity style={styles.chip}>
            <Text style={styles.chipText}>Unread</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chip}>
            <Text style={styles.chipText}>Flagged</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chip}>
            <Text style={styles.chipText}>To Me</Text>
          </TouchableOpacity>
        </View>

        {/* Yesterday Section */}
        <Text style={styles.sectionTitle}>Yesterday</Text>

        {/* Row: Feedback (navigates) */}
        <TouchableOpacity
          style={styles.mailRow}
          onPress={() => navigation.navigate("Feedback")}
          activeOpacity={0.7}
        >
          <View style={styles.avatar} />
          <View style={styles.mailTextWrap}>
            <Text style={styles.mailTitle}>Feedback</Text>
            <Text style={styles.mailPreview}>xxxxxxxx</Text>
          </View>

          <View style={styles.rightWrap}>
            <Text style={styles.mailDay}>Tuesday</Text>

            {/* Star is its own touchable so pressing it won't navigate */}
            <TouchableOpacity
              onPress={() => toggleStar("feedback")}
              accessibilityRole="button"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialIcons
                name={stars.feedback ? "star" : "star-border"}
                style={[styles.iconStar, stars.feedback && styles.iconStarActive]}
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* Row: Report (static row, star is reactive) */}
        <View style={styles.mailRow}>
          <View style={styles.avatar} />
          <View style={styles.mailTextWrap}>
            <Text style={styles.mailTitle}>Report</Text>
            <Text style={styles.mailPreview}>xxxxxxxx</Text>
          </View>

          <View style={styles.rightWrap}>
            <Text style={styles.mailDay}>Tuesday</Text>
            <TouchableOpacity
              onPress={() => toggleStar("report")}
              accessibilityRole="button"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialIcons
                name={stars.report ? "star" : "star-border"}
                style={[styles.iconStar, stars.report && styles.iconStarActive]}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        {/* This Week Section */}
          <Text style={styles.sectionTitle}>This Week</Text>
            <View style={styles.mailRow}>
            <View style={styles.avatar} />
            <View style={styles.mailTextWrap} />
            <View style={styles.rightWrap}>
            <Text style={styles.mailDay}>07/05/2025</Text>
            </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate("Profile")}>
          <Ionicons name="home" style={styles.iconNav} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate("Map")}>
          <Ionicons name="map" style={styles.iconNav} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.cameraNav}>
          <Ionicons name="wifi" style={styles.iconCenter} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.bellNav}>
          <Ionicons name="notifications" style={styles.iconNav} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate("Profile")}>
          <FontAwesome name="user" style={styles.iconNav} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#fefae0",
  },
  container: {
    flexGrow: 1,
    backgroundColor: "#fefae0",
    padding: 20,
    paddingBottom: 120,
  },

  /* Header */
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 12,
  },
  iconBack: { fontSize: 24, color: "black" },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 18,
    color: "#111",
  },
  headerRightSpacer: { width: 24 },

  /* Search */
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 40,
    marginBottom: 14,
  },
  iconSearch: { fontSize: 18, color: "#888" },
  searchInput: {
    marginLeft: 6,
    flex: 1,
    fontSize: 15,
    color: "#111",
  },

  /* Chips */
  chipsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  chip: {
    backgroundColor: "#B18C5B",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 10,
  },
  chipText: { color: "#fff", fontWeight: "600" },

  /* Sections */
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 8,
    fontSize: 15,
    color: "#111",
  },
  divider: { height: 1, backgroundColor: "#ccc", marginVertical: 10 },

  /* Mail rows */
  mailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#ddd",
    marginRight: 12,
  },
  mailTextWrap: { flex: 1 },
  mailTitle: { fontWeight: "bold", fontSize: 15, marginBottom: 2, color: "#111" },
  mailPreview: { color: "#555", fontSize: 13 },

  /* Right column */
  rightWrap: {
    width: 80,
    alignItems: "flex-end",
    rowGap: 6,
  },
  mailDay: { fontSize: 13, color: "#333" },
  iconStar: { fontSize: 22, color: "black" },
  iconStarActive: { color: "#D4AF37" }, // gold star when active

  /* Bottom nav */
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#D6C1A1",
    height: 60,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  tab: { flex: 1, alignItems: "center", justifyContent: "center" },

  /* Nav icons */
  iconNav: { fontSize: 26, color: "black" },
  iconCenter: { fontSize: 26, color: "black" },

  cameraNav: {
    backgroundColor: "#D6C1A1",
    borderRadius: 50,
    width: 55,
    height: 55,
    marginTop: -20,
    justifyContent: "center",
    alignItems: "center",
  },
  bellNav: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E3D3A5",
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
  },
});
