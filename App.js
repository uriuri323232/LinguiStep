import React, { useState } from 'react';
import { ActivityIndicator, Platform, SafeAreaView, StatusBar as RNStatusBar, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Btn } from './src/components/ui';
import FlashcardsScreen from './src/screens/FlashcardsScreen';
import HomeScreen from './src/screens/HomeScreen';
import QuizScreen from './src/screens/QuizScreen';
import SearchScreen from './src/screens/SearchScreen';
import ErrorBoundary from './src/ErrorBoundary';
import { ProgressProvider, useProgress } from './src/store';
import { ThemeContext, dark, light } from './src/theme';

const TABS = [
  { key: 'home', label: 'בית', icon: '🏠', Screen: HomeScreen },
  { key: 'cards', label: 'כרטיסיות', icon: '🃏', Screen: FlashcardsScreen },
  { key: 'quiz', label: 'חידון', icon: '🎯', Screen: QuizScreen },
  { key: 'search', label: 'חיפוש', icon: '🔍', Screen: SearchScreen },
];

function Shell() {
  const { s, ready } = useProgress();
  const t = s.dark ? dark : light;
  const [route, setRoute] = useState({ tab: 'home' });
  // Passing params remounts the screen (so it picks them up); plain tab presses keep screen state.
  const go = (tab, params) => setRoute(params ? { tab, ...params, k: `${tab}-${Date.now()}` } : { tab });
  const Active = TABS.find((x) => x.key === route.tab).Screen;

  return (
    <ThemeContext.Provider value={t}>
      <SafeAreaView style={{ flex: 1, backgroundColor: t.bg, paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0 }}>
        <StatusBar style={s.dark ? 'light' : 'dark'} />
        {!ready ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={t.accent} size="large" /></View>
        ) : (
          <>
            <View style={{ flex: 1 }}><Active key={route.k || route.tab} route={route} go={go} /></View>
            <View style={{ flexDirection: 'row', backgroundColor: t.card, borderTopWidth: 1, borderTopColor: t.line, paddingBottom: 6, paddingTop: 6, paddingHorizontal: 6, gap: 4 }}>
              {TABS.map((x) => {
                const on = route.tab === x.key;
                return (
                  <Btn key={x.key} onPress={() => go(x.key)} style={{ flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 16, backgroundColor: on ? t.soft : 'transparent' }}>
                    <Text style={{ fontSize: 22, opacity: on ? 1 : 0.55 }}>{x.icon}</Text>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: on ? t.accent : t.muted, marginTop: 2 }}>{x.label}</Text>
                  </Btn>
                );
              })}
            </View>
          </>
        )}
      </SafeAreaView>
    </ThemeContext.Provider>
  );
}

export default function App() {
  return <ErrorBoundary><ProgressProvider><Shell /></ProgressProvider></ErrorBoundary>;
}
