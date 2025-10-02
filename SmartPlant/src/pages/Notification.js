import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import BottomNav from "../components/navigation";

export default function NotificationsScreen({ navigation }) {
  // simple helpers to render placeholder rows
  const renderRow = (key) => (
    <View key={key} style={styles.row}>
      <View style={styles.leftCircle} />
      <View style={styles.centerPill} />
      <View style={styles.rightBadge} />
    </View>
  );

  return (
    <View style={styles.background}>
      <ScrollView contentContainerStyle={styles.container}>
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

        {/* Section: Past */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>Past Notifications</Text>
          </View>
          <View style={styles.rowsWrap}>
            {Array.from({ length: 8 }).map((_, i) => renderRow(`past-${i}`))}
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Nav */}
      <BottomNav navigation={navigation} />
      
    </View>
  );
}

const styles = StyleSheet.create({
  /* page */
  background: {
    flex: 1,
    backgroundColor: "#fefae0",
  },
  container: {
    flexGrow: 1,
    backgroundColor: "#fefae0",
    padding: 20,
    paddingBottom: 60,
  },

  /* header */
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#111",
  },
  dots: {
    marginLeft: "auto",
    flexDirection: "row",
    columnGap: 6,
    paddingRight: 2,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#e5e2db",
  },

  /* sections */
  section: {
    marginTop: 10,
    marginBottom: 18,
  },
  sectionHeader: {
    backgroundColor: "#6EA564",
    borderRadius: 16,
    paddingVertical: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  sectionHeaderText: {
    color: "#fff",
    fontWeight: "800",
  },

  /* rows */
  rowsWrap: {
    rowGap: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  leftCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#6EA564",
    marginRight: 10,
  },
  centerPill: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#6EA564",
  },
  rightBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#6EA564",
    marginLeft: 10,
  },


});