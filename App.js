import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import FlashcardsScreen from './src/screens/FlashcardsScreen';
import QuizScreen from './src/screens/QuizScreen';
import SearchScreen from './src/screens/SearchScreen';
import { colors } from './src/theme';

const TABS = [
  { key: 'cards', label: 'כרטיסיות', icon: '🃏', Screen: FlashcardsScreen },
  { key: 'quiz', label: 'חידון', icon: '🎯', Screen: QuizScreen },
  { key: 'search', label: 'חיפוש', icon: '🔍', Screen: SearchScreen },
];

export default function App() {
  const [tab, setTab] = useState('cards');
  const Active = TABS.find((t) => t.key === tab).Screen;
  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>English Offline</Text>
        <Text style={styles.sub}>אוצר מילים באנגלית, בלי אינטרנט</Text>
      </View>
      <View style={styles.body}><Active /></View>
      <View style={styles.tabs}>
        {TABS.map((t) => (
          <TouchableOpacity key={t.key} style={styles.tab} onPress={() => setTab(t.key)}>
            <Text style={[styles.icon, tab !== t.key && { opacity: 0.45 }]}>{t.icon}</Text>
            <Text style={[styles.label, tab === t.key && styles.labelOn]}>{t.label}</Text>
            {tab === t.key && <View style={styles.dot} />}
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  title: { fontSize: 24, fontWeight: '800', color: colors.ink },
  sub: { color: colors.muted, fontSize: 13 },
  body: { flex: 1 },
  tabs: { flexDirection: 'row', backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.line, paddingBottom: 6 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  icon: { fontSize: 22 },
  label: { fontSize: 12, color: colors.muted, marginTop: 2, fontWeight: '600' },
  labelOn: { color: colors.accent },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.accent, marginTop: 3 },
});
