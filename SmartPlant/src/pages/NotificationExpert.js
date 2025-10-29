import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import BottomNav from "../components/NavigationExpert";

// 🔒 暫時註解掉 Firebase 與 hooks
// import { useNotificationsExpert } from "../firebase/notification_expert/useNotificationExpert";
// import { markNotificationReadExpert } from "../firebase/notification_expert/markReadExpert";
// import { respondValidation } from "../firebase/notification_expert/respondValidation";
// import { auth } from "../firebase/FirebaseConfig";

const NAV_HEIGHT = 60;
const NAV_MARGIN_TOP = 150;

export default function NotificationExpert({ navigation }) {
  // 🔒 暫時移除 Firebase 使用者資訊
  // const userId = auth.currentUser ? auth.currentUser.uid : null;
  // const items = useNotificationsExpert(userId);

  // 🔧 暫時用假資料測試畫面
  const items = [
    {
      id: "1",
      title: "Plant Validation Request",
      message: "Please validate plant: Nepenthes gracilis",
      type: "validation_request",
      read: false,
      payload: { requestId: "REQ001" },
    },
    {
      id: "2",
      title: "Validation Result",
      message: "Validation completed successfully.",
      type: "validation_result",
      read: true,
      payload: { result: "Accepted" },
    },
  ];

  const newItems = items.filter((n) => !n.read);
  const pastItems = items.filter((n) => n.read);

  // 🔒 暫時移除連 Firebase function
  const onOpenTask = (n) => {
    console.log("Open validation task:", n);
    // navigation.navigate("ValidationTask", { request: n.payload, notiId: n.id });
  };

  const onOpenResult = (n) => {
    console.log("Open validation result:", n);
    // navigation.navigate("ValidationResult", { result: n.payload, notiId: n.id });
  };

  const renderRow = (n) => {
    const isReq = n.type === "validation_request";
    const isResult = n.type === "validation_result";

    return (
      <View key={n.id} style={[styles.row, n.read ? styles.rowRead : styles.rowUnread]}>
        <View style={[styles.leftDot, !n.read && styles.leftDotActive]} />
        <View style={{ flex: 1 }}>
          <Text style={styles.rowTitle} numberOfLines={1}>{n.title}</Text>
          <Text style={styles.rowMsg} numberOfLines={1}>{n.message}</Text>

          {/* 行動按鈕 */}
          {/*[styles.ctaBtn, styles.primary]} onPress={() => onOpenTask(n)}>
                <Text style={styles.ctaText}>Review</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.ctaBtn, styles.ghost]}>
                <Text style={styles.ghostText}>Dismiss</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.ctaBtn, styles.ghost]}>
                <Text style={styles.ghostText}>Decline</Text>
              </TouchableOpacity>
            </View>
          )}

          {isResult && (
            <View style={styles.ctaRow}>
              <TouchableOpacity style={[styles.ctaBtn, styles.primary]} onPress={() => onOpenResult(n)}>
                <Text style={styles.ctaText}>View Result</Text>
              </TouchableOpacity>
            </View>
          )*/} 
        </View> 

        <Text style={styles.tag}>{tag(n.type)}</Text>
      </View>
    );
  };

  return (
    <View style={styles.background}>
      <ScrollView
        style={styles.scroller}
        contentContainerStyle={[styles.container, { paddingBottom: NAV_HEIGHT + NAV_MARGIN_TOP + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleRow}>
          <Text style={styles.title}>Notifications</Text>
          <View style={styles.dots}>
            <View style={styles.dot} /><View style={styles.dot} /><View style={styles.dot} />
          </View>
        </View>

        {/* 新通知區 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{newItems.length} New Notifications</Text>
          </View>
          <View style={styles.rowsWrap}>
            {newItems.length ? newItems.map(renderRow) : (
              <Text style={styles.empty}>No new notifications</Text>
            )}
          </View>
        </View>

        {/* 舊通知區 */}
        <View style={[styles.section, styles.lastSection]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>Past Notifications</Text>
          </View>
          <View style={styles.rowsWrap}>
            {pastItems.length ? pastItems.map(renderRow) : (
              <Text style={styles.empty}>No past notifications</Text>
            )}
          </View>
        </View>
      </ScrollView>

      <BottomNav navigation={navigation} />
    </View>
  );
}

const tag = (t) =>
  t === "validation_request" ? "Validate" :
  t === "validation_result" ? "Result" :
  "Info";

/* ---------- styles ---------- */
const GREEN = "#6EA564";
const BG = "#fefae0";

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: BG },
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
  row: { flexDirection: "row", alignItems: "flex-start", backgroundColor: "#fff", borderRadius: 12, padding: 12 },
  rowUnread: { borderWidth: 1.5, borderColor: GREEN },
  rowRead: { opacity: 0.65 },
  leftDot: { width: 12, height: 12, borderRadius: 6, marginRight: 10, backgroundColor: "#cfcfcf", marginTop: 6 },
  leftDotActive: { backgroundColor: GREEN },

  rowTitle: { fontWeight: "700", color: "#111" },
  rowMsg: { color: "#444", marginTop: 4 },

  ctaRow: { flexDirection: "row", columnGap: 8, marginTop: 10 },
  ctaBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  primary: { backgroundColor: GREEN },
  ctaText: { color: "#fff", fontWeight: "700" },
  ghost: { backgroundColor: "#E7F0E5" },
  ghostText: { color: "#2b2b2b", fontWeight: "700" },

  tag: { marginLeft: 10, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: "#E7F0E5", color: "#2b2b2b" },
  empty: { textAlign: "center", color: "#666", paddingVertical: 10 },
});
