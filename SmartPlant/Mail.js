// App.js (JavaScript)
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const colors = {
  bg: '#F7EEDA',
  chip: '#B18C5B',
  chipActive: '#B99563',
  divider: '#D7C9AA',
  nav: '#D6C1A1',
  text: '#111',
  sub: '#6f6f6f',
  white: '#fff',
};

export default function App() {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All'); // 'Unread' | 'Flagged' | 'To Me' | 'All'
  const [starred, setStarred] = useState({}); // { [id]: boolean }

  // Demo data
  const sections = useMemo(
    () => [
      {
        title: 'Yesterday',
        data: [
          { id: '1', title: 'Feedback', preview: 'xxxxxxxx', dayLabel: 'Tuesday' },
          { id: '2', title: 'Report', preview: 'xxxxxxxx', dayLabel: 'Tuesday' },
        ],
      },
      {
        title: 'This Week',
        data: [{ id: '3', title: '', preview: '', dateLabel: '07/05/2025' }],
      },
    ],
    []
  );

  // Simple search filter (extend with Unread/Flagged/To Me logic later)
  const filtered = useMemo(() => {
    if (!query.trim()) return sections;
    const q = query.toLowerCase();
    return sections
      .map(s => ({
        ...s,
        data: s.data.filter(d => (`${d.title} ${d.preview}`).toLowerCase().includes(q)),
      }))
      .filter(s => s.data.length);
  }, [query, sections]);

  return (
    <View style={styles.screen}>
      {/* Top bar */}
      <View style={styles.topRow}>
        <TouchableOpacity>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Mail Management</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color="#8e8e8e" />
        <TextInput
          placeholder="Search..."
          placeholderTextColor="#b7b7b7"
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {/* Filter chips */}
      <View style={styles.chipsRow}>
        {['Unread', 'Flagged', 'To Me'].map(label => {
          const active = activeFilter === label;
          return (
            <TouchableOpacity
              key={label}
              onPress={() => setActiveFilter(prev => (prev === label ? 'All' : label))}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List */}
      <SectionList
        sections={filtered}
        keyExtractor={(item) => item.id}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
        SectionSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeaderWrap}>
            <Text style={styles.sectionHeader}>{section.title}</Text>
            {section.title === 'This Week' && (
              <Text style={styles.sectionRightDate}>{section.data[0]?.dateLabel}</Text>
            )}
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            {/* round avatar placeholder */}
            <View style={styles.dot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{item.title || ' '}</Text>
              {!!item.preview && <Text style={styles.itemPreview}>{item.preview}</Text>}
            </View>
            {item.dayLabel ? (
              <Text style={styles.itemDayLabel}>{item.dayLabel}</Text>
            ) : (
              <View style={{ width: 4 }} />
            )}
            <TouchableOpacity
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={() => setStarred(s => ({ ...s, [item.id]: !s[item.id] }))}
            >
              <MaterialIcons
                name={starred[item.id] ? 'star' : 'star-border'}
                size={20}
                color={colors.text}
              />
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Bottom nav (bell highlighted) */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={[styles.navItem, { opacity: 0.6 }]}>
          <Ionicons name="home" size={26} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, { opacity: 0.6 }]}>
          <Ionicons name="map" size={26} color={colors.text} />
        </TouchableOpacity>

        {/* spacer under the floating circle */}
        <View style={{ width: 70 }} />

        <TouchableOpacity style={[styles.navItem, styles.activeIcon]}>
          <Ionicons name="notifications" size={26} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, { opacity: 0.6 }]}>
          <Ionicons name="person" size={26} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Floating center circle (FAB) */}
      <View pointerEvents="box-none" style={styles.fabContainer}>
        <TouchableOpacity style={styles.fab}>
          <Ionicons name="wifi" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* =========================
   STYLES
   ========================= */
const styles = StyleSheet.create({
  // Main screen wrapper (adds safe padding without SafeAreaView)
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 8 : 14, // push content down
  },

  // Top bar
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 2,          // fine-tune this if title still feels high
    paddingBottom: 10,      // slightly more bottom padding to push the title down
  },
  screenTitle: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '800',
    fontSize: 16,
    color: colors.text,
  },

  // Search
  searchWrap: {
    marginHorizontal: 16,
    marginTop: 6,
    backgroundColor: colors.white,
    borderRadius: 14,
    height: 42,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  searchInput: { marginLeft: 8, flex: 1, fontSize: 15, color: colors.text },

  // Chips
  chipsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  chip: {
    backgroundColor: colors.chip,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  chipActive: { backgroundColor: colors.chipActive },
  chipText: { color: colors.white, fontWeight: '700' },
  chipTextActive: { color: colors.white },

  // Sections / items
  sectionHeaderWrap: {
    paddingTop: 6,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  sectionHeader: { fontWeight: '800', color: colors.text },
  sectionRightDate: { marginLeft: 'auto', color: colors.sub, fontSize: 12 },
  divider: { height: 1, backgroundColor: colors.divider, marginLeft: 56 },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  dot: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: '#E3E0D7',
    marginRight: 14,
    marginLeft: 8,
  },
  itemTitle: { fontWeight: '800', color: colors.text, marginBottom: 2 },
  itemPreview: { color: colors.sub, marginTop: 2 },
  itemDayLabel: { color: colors.sub, fontSize: 12, marginHorizontal: 10 },

  // Bottom bar + FAB
  bottomBar: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    height: 64,
    backgroundColor: colors.nav,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  navItem: { padding: 10 },
  activeIcon: { opacity: 1 },

  fabContainer: {
    position: 'absolute',
    left: 0, right: 0,
    bottom: 30,
    alignItems: 'center',
  },
  fab: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: colors.nav,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 4, borderColor: colors.nav,
  },
});
