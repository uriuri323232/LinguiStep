import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Btn, ProgressBar } from '../components/ui';
import { categories, isDue, allWords, wordOfDay } from '../data';
import { speak } from '../speech';
import { iso, useProgress } from '../store';
import { radius, useTheme } from '../theme';

const DAYS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];

function greeting() {
  const h = new Date().getHours();
  return h < 5 ? 'לילה טוב 🌙' : h < 12 ? 'בוקר טוב ☀️' : h < 18 ? 'צהריים טובים 👋' : 'ערב טוב 🌆';
}

export default function HomeScreen({ go }) {
  const t = useTheme();
  const { s, streak, todayCount, level, levelPct, toggleFav } = useProgress();
  const mistakes = Object.keys(s.mistakes).length;
  const knownTotal = Object.keys(s.known).length;
  const dueN = allWords.filter((w) => isDue(s, w.id)).length;
  const wod = wordOfDay();
  const card = { backgroundColor: t.card, borderRadius: radius, borderWidth: 1, borderColor: t.line, padding: 16 };

  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 864e5);
    return { label: DAYS[d.getDay()], n: (s.hist || {})[iso(d)] || 0, today: i === 6 };
  });
  const maxN = Math.max(1, ...week.map((x) => x.n));

  const tiles = [
    { icon: '🃏', label: 'כרטיסיות', sub: 'לימוד חופשי', on: () => go('cards') },
    { icon: '🎯', label: 'חידון מהיר', sub: '10 שאלות', on: () => go('quiz', { start: 'en2he' }) },
    { icon: '🧠', label: 'חזרה חכמה', sub: dueN ? `${dueN} מילים מחכות` : 'מילים חדשות לתרגול', on: () => go('cards', { cat: 'due' }) },
    { icon: '🔁', label: 'חזרה על טעויות', sub: `${mistakes} מילים`, on: () => go('quiz', { start: 'mistakes' }) },
  ];

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 30 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 26, fontWeight: '800', color: t.ink }}>{greeting()}</Text>
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

      <View style={[card, { flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: t.muted, fontWeight: '700', fontSize: 12 }}>המילה של היום · {wod.emoji} {wod.categoryName}</Text>
          <Text style={{ color: t.ink, fontSize: 28, fontWeight: '800', marginTop: 4, textAlign: 'left', writingDirection: 'ltr' }}>{wod.en}</Text>
          <Text style={{ color: t.accent, fontSize: 18, fontWeight: '700', marginTop: 2 }}>{wod.he}</Text>
        </View>
        <Btn label="השמע" onPress={() => speak(wod.en)} style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: t.soft, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 22 }}>🔊</Text>
        </Btn>
        <Btn label="מועדף" onPress={() => toggleFav(wod.id)} style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: t.soft, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 22 }}>{s.fav[wod.id] ? '⭐' : '☆'}</Text>
        </Btn>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {tiles.map((b) => (
          <Btn key={b.label} onPress={b.on} style={{ width: '48%', ...card, gap: 4, paddingVertical: 14 }}>
            <Text style={{ fontSize: 26 }}>{b.icon}</Text>
            <Text style={{ color: t.ink, fontWeight: '800', fontSize: 15 }}>{b.label}</Text>
            <Text style={{ color: t.muted, fontSize: 12 }}>{b.sub}</Text>
          </Btn>
        ))}
      </View>

      <View style={card}>
        <Text style={{ fontWeight: '800', color: t.ink, fontSize: 16, marginBottom: 12 }}>📈 הפעילות שלך השבוע</Text>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 90 }}>
          {week.map((x, i) => (
            <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
              <Text style={{ fontSize: 10, color: t.muted }}>{x.n || ''}</Text>
              <View style={{ width: 18, height: Math.max(4, (x.n / maxN) * 56), borderRadius: 6, backgroundColor: x.today ? t.accent : t.line }} />
              <Text style={{ fontSize: 11, marginTop: 4, color: x.today ? t.accent : t.muted, fontWeight: x.today ? '800' : '600' }}>{x.label}</Text>
            </View>
          ))}
        </View>
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
    </ScrollView>
  );
}
