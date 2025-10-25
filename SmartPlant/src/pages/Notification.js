// pages/Notification.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import BottomNav from "../components/Navigation";
import { useNotifications } from "../firebase/notification_user/useNotification";
import { markNotificationRead } from "../firebase/notification_user/markRead";
import { auth } from "../firebase/FirebaseConfig";

const NAV_HEIGHT = 60;      // bottom bar height
const NAV_MARGIN_TOP = 150; // the bar's marginTop in your Navigation.js

export default function NotificationsScreen({ navigation }) {
  
  const userId = auth.currentUser ? auth.currentUser.uid : null;

  const items = useNotifications(userId);

  const newItems = items.filter(n => !n.read);
  const pastItems = items.filter(n => n.read);

  const renderRow = (n) => (
    <TouchableOpacity
      key={n.id}
      style={[styles.row, n.read ? styles.rowRead : styles.rowUnread]}
      onPress={() => markNotificationRead(n.id)}
      activeOpacity={0.7}
    >
      <View style={[styles.leftDot, !n.read && styles.leftDotActive]} />
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle} numberOfLines={1}>{n.title || "Notification"}</Text>
        <Text style={styles.rowMsg} numberOfLines={1}>{n.message || ""}</Text>
      </View>
      <Text style={styles.tag}>{tag(n.type)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.background}>
      <ScrollView
        style={styles.scroller} // cancels the nav's big marginTop gap
        contentContainerStyle={[
          styles.container,
          // room for the fixed bar + its marginTop so the last card is reachable
          { paddingBottom: NAV_HEIGHT + NAV_MARGIN_TOP + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >

        {/* Title */}
        <View style={styles.titleRow}>
          <Text style={styles.title}>Notifications</Text>
          <View style={styles.dots}><View style={styles.dot} /><View style={styles.dot} /><View style={styles.dot} /></View>
        </View>

        {/* New */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{newItems.length || 0} New Notifications</Text>
          </View>
          <View style={styles.rowsWrap}>
            {newItems.length ? newItems.map(renderRow) : <Text style={styles.empty}>No new notifications</Text>}
          </View>
        </View>

        {/* Past */}
        <View style={[styles.section, styles.lastSection]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>Past Notifications</Text>
          </View>
          <View style={styles.rowsWrap}>
            {pastItems.length ? pastItems.map(renderRow) : <Text style={styles.empty}>No past notifications</Text>}
          </View>
        </View>
      </ScrollView>

      <BottomNav navigation={navigation} />
    </View>
  );
}

const tag = (t) =>
  t === "plant_identified" ? "Plant" :
  t === "post_like"       ? "Like"  :
  t === "post_comment"    ? "Comment" :
  t === "admin_reply"     ? "Admin" : "Info";

/* ---------- styles at bottom ---------- */
const GREEN = "#6EA564";
const BG = "#fefae0";

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: BG },

  // Negative margin to neutralize BottomNav's marginTop=150 so scrolling reaches the end
  scroller: { marginBottom: -NAV_MARGIN_TOP },

  container: { flexGrow: 1, padding: 20 },

  titleRow: { flexDirection: "row", alignItems: "center", marginTop: 40, marginBottom: 12 },
  title: { fontSize: 26, fontWeight: "bold", color: "#111" },
  dots: { marginLeft: "auto", flexDirection: "row", columnGap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#e5e2db" },

  section: { marginTop: 10, marginBottom: 18 },
  lastSection: { marginBottom: 0 },
  sectionHeader: { backgroundColor: GREEN, borderRadius: 16, paddingVertical: 8, alignItems: "center", marginBottom: 12 },
  sectionHeaderText: { color: "#fff", fontWeight: "800" },

  rowsWrap: { rowGap: 10 },
  row: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 12, padding: 12 },
  rowUnread: { borderWidth: 1.5, borderColor: GREEN },
  rowRead: { opacity: 0.65 },
  leftDot: { width: 12, height: 12, borderRadius: 6, marginRight: 10, backgroundColor: "#cfcfcf" },
  leftDotActive: { backgroundColor: GREEN },
  rowTitle: { fontWeight: "700", color: "#111" },
  rowMsg: { color: "#444", marginTop: 2 },
  tag: { marginLeft: 10, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: "#E7F0E5", color: "#2b2b2b" },
  empty: { textAlign: "center", color: "#666", paddingVertical: 10 },
});

