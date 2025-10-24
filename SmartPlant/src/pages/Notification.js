import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import BottomNav from "../components/Navigation";

const NAV_HEIGHT = 60;     // from your BottomNav styles
const NAV_MARGIN_TOP = 150; // from your BottomNav styles

export default function NotificationsScreen({ navigation }) {
  const renderRow = (key) => (
    <View key={key} style={styles.row}>
      <View style={styles.leftCircle} />
      <View style={styles.centerPill} />
      <View style={styles.rightBadge} />
    </View>
  );

  return (
    <View style={styles.background}>
      <ScrollView
        style={styles.scroller}
        contentContainerStyle={[
          styles.container,
          { paddingBottom: NAV_HEIGHT + 8 }, // room for the bar itself
        ]}
      >

        {/* Title */}
        <View style={styles.titleRow}>
          <Text style={styles.title}>Notifications</Text>
          <View style={styles.dots}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        {/* Section: New */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>1 New Notifications</Text>
          </View>
          <View style={styles.rowsWrap}>
            {Array.from({ length: 4 }).map((_, i) => renderRow(`new-${i}`))}
          </View>
        </View>

        {/* Section: Past (no bottom margin so it hugs the padding) */}
        <View style={[styles.section, styles.lastSection]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>Past Notifications</Text>
          </View>
          <View style={styles.rowsWrap}>
            {Array.from({ length: 8 }).map((_, i) => renderRow(`past-${i}`))}
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Nav (unchanged) */}
      <BottomNav navigation={navigation} />
    </View>
  );
}

/* ===== STYLES ===== */
const GREEN = "#6EA564";
const BG = "#fefae0";

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: BG },

  // This negative margin cancels the nav's marginTop=150 gap.
  scroller: { marginBottom: -NAV_MARGIN_TOP },

  container: {
    flexGrow: 1,
    backgroundColor: BG,
    paddingTop: 20,
    paddingHorizontal: 20,
    // paddingBottom is provided dynamically above
  },

  /* header */
  titleRow: { flexDirection: "row", alignItems: "center", marginTop: 40, marginBottom: 10 },
  title: { fontSize: 26, fontWeight: "bold", color: "#111" },
  dots: { marginLeft: "auto", flexDirection: "row", columnGap: 6, paddingRight: 2 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#e5e2db" },

  /* sections */
  section: { marginTop: 10, marginBottom: 18 },
  lastSection: { marginBottom: 0 },
  sectionHeader: {
    backgroundColor: GREEN,
    borderRadius: 16,
    paddingVertical: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  sectionHeaderText: { color: "#fff", fontWeight: "800" },

  /* rows */
  rowsWrap: { rowGap: 12 },
  row: { flexDirection: "row", alignItems: "center" },
  leftCircle: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: "#fff",
    borderWidth: 1.5, borderColor: GREEN, marginRight: 10,
  },
  centerPill: {
    flex: 1, height: 42, borderRadius: 12, backgroundColor: "#fff",
    borderWidth: 1.5, borderColor: GREEN,
  },
  rightBadge: {
    width: 36, height: 36, borderRadius: 8, backgroundColor: "#fff",
    borderWidth: 1.5, borderColor: GREEN, marginLeft: 10,
  },
});

