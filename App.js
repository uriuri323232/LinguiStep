import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Btn } from './src/components/ui';
import FlashcardsScreen from './src/screens/FlashcardsScreen';
import HomeScreen from './src/screens/HomeScreen';
import MoreScreen from './src/screens/MoreScreen';
import QuizScreen from './src/screens/QuizScreen';
import SearchScreen from './src/screens/SearchScreen';
import ErrorBoundary from './src/ErrorBoundary';
import { configure } from './src/speech';
import { ProgressProvider, useProgress } from './src/store';
import { ThemeContext, dark, light } from './src/theme';

const TABS = [
  { key: 'home', label: 'בית', icon: '🏠', Screen: HomeScreen },
  { key: 'cards', label: 'כרטיסיות', icon: '🃏', Screen: FlashcardsScreen },
  { key: 'quiz', label: 'חידון', icon: '🎯', Screen: QuizScreen },
  { key: 'search', label: 'חיפוש', icon: '🔍', Screen: SearchScreen },
  { key: 'more', label: 'עוד', icon: '⚙️', Screen: MoreScreen },
];

function Shell() {
  const { s, ready } = useProgress();
  const scheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const isDark = s.theme === 'dark' || (s.theme === 'system' && scheme === 'dark');
  const t = isDark ? dark : light;
  const [route, setRoute] = useState({ tab: 'home' });
  // Passing params remounts the screen (so it picks them up); plain tab presses keep screen state.
  const go = (tab, params) => setRoute(params ? { tab, ...params, k: `${tab}-${Date.now()}` } : { tab });
  const Active = TABS.find((x) => x.key === route.tab).Screen;

  useEffect(() => { configure({ rate: s.rate, haptics: s.haptics }); }, [s.rate, s.haptics]);

  return (
    <ThemeContext.Provider value={t}>
      <View style={{ flex: 1, backgroundColor: t.bg, paddingTop: insets.top }}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        {!ready ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={t.accent} size="large" /></View>
        ) : (
          <>
            <View style={{ flex: 1 }}><Active key={route.k || route.tab} route={route} go={go} /></View>
            <View style={{ flexDirection: 'row', backgroundColor: t.card, borderTopWidth: 1, borderTopColor: t.line, paddingTop: 6, paddingHorizontal: 6, paddingBottom: Math.max(insets.bottom, 8), gap: 4 }}>
              {TABS.map((x) => {
                const on = route.tab === x.key;
                return (
                  <Btn key={x.key} label={x.label} onPress={() => go(x.key)} style={{ flex: 1, alignItems: 'center', paddingVertical: 7, borderRadius: 16, backgroundColor: on ? t.soft : 'transparent' }}>
                    <Text style={{ fontSize: 21, opacity: on ? 1 : 0.55 }}>{x.icon}</Text>
                    <Text style={{ fontSize: 11, fontWeight: '800', color: on ? t.accent : t.muted, marginTop: 2 }} numberOfLines={1}>{x.label}</Text>
                  </Btn>
                );
              })}
            </View>
          </>
        )}
      </View>
    </ThemeContext.Provider>
  );
}

export default function App() {
  return <ErrorBoundary><SafeAreaProvider><ProgressProvider><Shell /></ProgressProvider></SafeAreaProvider></ErrorBoundary>;
}
