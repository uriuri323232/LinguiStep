import React from 'react';
import { ScrollView, Switch, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Btn, ProgressBar } from '../components/ui';
import { categories } from '../data';
import { useProgress } from '../store';
import { radius, useTheme } from '../theme';

const GOALS = [10, 20, 30, 50];

export default function HomeScreen({ go }) {
  const t = useTheme();
  const { s, update, streak, todayCount, level, levelPct } = useProgress();
  const mistakes = Object.keys(s.mistakes).length;
  const knownTotal = Object.keys(s.known).length;
  const card = { backgroundColor: t.card, borderRadius: radius, borderWidth: 1, borderColor: t.line, padding: 16 };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 30 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ fontSize: 28, fontWeight: '800', color: t.ink }}>שלום 👋</Text>
          <Text style={{ color: t.muted, marginTop: 2 }}>בוא נלמד כמה מילים היום</Text>
        </View>
        <View style={{ backgroundColor: t.card, borderWidth: 1, borderColor: t.line, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 }}>
          <Text style={{ fontWeight: '800', color: t.ink }}>🔥 {streak} ימים</Text>
        </View>
      </View>

      <LinearGradient colors={[t.accent, t.accent2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: radius + 4, padding: 20, gap: 10 }}>
        <Text style={{ color: '#fff', opacity: 0.85, fontWeight: '600' }}>הרמה שלך</Text>
        <Text style={{ color: '#fff', fontSize: 40, fontWeight: '800' }}>רמה {level}</Text>
        <ProgressBar value={levelPct} color="#fff" track="rgba(255,255,255,0.3)" height={10} />
        <Text style={{ color: '#fff', opacity: 0.9 }}>{s.xp % 100} / 100 נקודות לרמה הבאה · {knownTotal} מילים ידועות</Text>
      </LinearGradient>

      <View style={card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
          <Text style={{ fontWeight: '800', color: t.ink, fontSize: 16 }}>🎯 היעד היומי</Text>
          <Text style={{ color: t.muted, fontWeight: '700' }}>{Math.min(todayCount, s.goal)} / {s.goal}</Text>
        </View>
        <ProgressBar value={todayCount / s.goal} color={todayCount >= s.goal ? t.good : t.sun} height={10} />
        <Text style={{ color: t.muted, marginTop: 8 }}>{todayCount >= s.goal ? 'כל הכבוד, השגת את היעד להיום! 🎉' : 'כל תשובה בחידון או כרטיסייה נחשבת.'}</Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        {[
          { icon: '🃏', label: 'כרטיסיות', on: () => go('cards') },
          { icon: '🎯', label: 'חידון מהיר', on: () => go('quiz', { start: 'en2he' }) },
          { icon: '🔁', label: `טעויות (${mistakes})`, on: () => go('quiz', { start: 'mistakes' }) },
        ].map((b) => (
          <Btn key={b.label} onPress={b.on} style={{ flex: 1, ...card, alignItems: 'center', gap: 6, paddingVertical: 16 }}>
            <Text style={{ fontSize: 28 }}>{b.icon}</Text>
            <Text style={{ color: t.ink, fontWeight: '700', fontSize: 13 }}>{b.label}</Text>
          </Btn>
        ))}
      </View>

      <Text style={{ fontSize: 20, fontWeight: '800', color: t.ink, marginTop: 4 }}>נושאים</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {categories.map((c) => {
          const known = c.words.filter((_, i) => s.known[`${c.id}:${i}`]).length;
          return (
            <Btn key={c.id} onPress={() => go('cards', { cat: c.id })} style={{ width: '48%', ...card, gap: 8, padding: 14 }}>
              <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: c.color + '26', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 24 }}>{c.emoji}</Text>
              </View>
              <Text style={{ color: t.ink, fontWeight: '800', fontSize: 15 }} numberOfLines={1}>{c.name}</Text>
              <ProgressBar value={known / c.words.length} color={c.color} height={6} />
              <Text style={{ color: t.muted, fontSize: 12 }}>{known} / {c.words.length} מילים</Text>
            </Btn>
          );
        })}
      </View>

      <Text style={{ fontSize: 20, fontWeight: '800', color: t.ink, marginTop: 4 }}>הגדרות</Text>
      <View style={[card, { gap: 14 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: t.ink, fontWeight: '700' }}>🌙 מצב כהה</Text>
          <Switch value={s.dark} onValueChange={(v) => update((p) => ({ ...p, dark: v }))} trackColor={{ true: t.accent }} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: t.ink, fontWeight: '700' }}>🔊 הקראה אוטומטית בכרטיסיות</Text>
          <Switch value={s.auto} onValueChange={(v) => update((p) => ({ ...p, auto: v }))} trackColor={{ true: t.accent }} />
        </View>
        <View>
          <Text style={{ color: t.ink, fontWeight: '700', marginBottom: 8 }}>יעד יומי (מילים)</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {GOALS.map((g) => (
              <Btn key={g} onPress={() => update((p) => ({ ...p, goal: g }))}
                style={{ flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', backgroundColor: s.goal === g ? t.accent : t.soft }}>
                <Text style={{ fontWeight: '800', color: s.goal === g ? t.onAccent : t.ink }}>{g}</Text>
              </Btn>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
