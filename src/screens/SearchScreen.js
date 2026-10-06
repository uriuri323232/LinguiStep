import React, { useMemo, useState } from 'react';
import { FlatList, Text, TextInput, View } from 'react-native';
import { Btn } from '../components/ui';
import { allWords } from '../data';
import { speak } from '../speech';
import { useProgress } from '../store';
import { radius, useTheme } from '../theme';

const FILTERS = [['all', 'הכל'], ['known', 'ידועות'], ['new', 'חדשות']];

export default function SearchScreen() {
  const t = useTheme();
  const { s, markKnown } = useProgress();
  const [q, setQ] = useState('');
  const [f, setF] = useState('all');

  const results = useMemo(() => {
    const x = q.trim().toLowerCase();
    return allWords.filter((w) =>
      (!x || w.en.toLowerCase().includes(x) || w.he.includes(x)) &&
      (f === 'all' || (f === 'known' ? !!s.known[w.id] : !s.known[w.id])));
  }, [q, f, s.known]);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <TextInput
        value={q} onChangeText={setQ} placeholder="🔍 חיפוש באנגלית או בעברית" placeholderTextColor={t.muted}
        textAlign="right" autoCorrect={false} autoCapitalize="none"
        style={{ backgroundColor: t.card, borderWidth: 1, borderColor: t.line, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 13, fontSize: 16, color: t.ink }}
      />
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 10, alignItems: 'center' }}>
        {FILTERS.map(([k, label]) => (
          <Btn key={k} onPress={() => setF(k)} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: f === k ? t.accent : t.card, borderWidth: 1, borderColor: f === k ? t.accent : t.line }}>
            <Text style={{ color: f === k ? t.onAccent : t.ink, fontWeight: '700' }}>{label}</Text>
          </Btn>
        ))}
        <Text style={{ color: t.muted, marginStart: 'auto' }}>{results.length} מילים</Text>
      </View>
      <FlatList
        style={{ marginTop: 10 }}
        data={results} keyExtractor={(w) => w.id} keyboardShouldPersistTaps="handled"
        initialNumToRender={20} windowSize={9}
        contentContainerStyle={{ paddingBottom: 20, gap: 8 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: t.muted, marginTop: 40 }}>לא נמצאו מילים. נסה כתיב אחר.</Text>}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: t.card, borderRadius: radius - 4, borderWidth: 1, borderColor: t.line, padding: 12 }}>
            <Btn onPress={() => speak(item.en)} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 42, height: 42, borderRadius: 13, backgroundColor: item.color + '26', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 17, fontWeight: '800', color: t.ink }}>{item.en}</Text>
                <Text style={{ fontSize: 15, color: t.accent, fontWeight: '600', writingDirection: 'rtl', textAlign: 'left' }}>{item.he}</Text>
              </View>
              <Text style={{ fontSize: 18 }}>🔊</Text>
            </Btn>
            <Btn onPress={() => markKnown(item.id, !s.known[item.id])} style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: s.known[item.id] ? t.goodSoft : t.soft }}>
              <Text style={{ fontSize: 18 }}>{s.known[item.id] ? '✅' : '☑️'}</Text>
            </Btn>
          </View>
        )}
      />
    </View>
  );
}
