import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { allWords } from '../data';
import { speak } from '../speech';
import { colors, radius } from '../theme';

export default function SearchScreen() {
  const [q, setQ] = useState('');
  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return allWords;
    return allWords.filter((w) => w.en.toLowerCase().includes(t) || w.he.includes(t));
  }, [q]);

  return (
    <View style={styles.wrap}>
      <TextInput
        style={styles.input}
        value={q}
        onChangeText={setQ}
        placeholder="חיפוש באנגלית או בעברית"
        placeholderTextColor={colors.muted}
        textAlign="right"
        autoCorrect={false}
        autoCapitalize="none"
      />
      <Text style={styles.count}>{results.length} מילים</Text>
      <FlatList
        data={results}
        keyExtractor={(w) => w.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 20, gap: 8 }}
        ListEmptyComponent={<Text style={styles.empty}>לא נמצאו מילים. נסה כתיב אחר.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => speak(item.en)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.en}>{item.en}</Text>
              <Text style={styles.cat}>{item.emoji} {item.categoryName}</Text>
            </View>
            <Text style={styles.he}>{item.he}</Text>
            <Text style={styles.spk}>🔊</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16 },
  input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: colors.ink },
  count: { color: colors.muted, marginVertical: 10, textAlign: 'right' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderRadius: radius - 4, borderWidth: 1, borderColor: colors.line, padding: 14 },
  en: { fontSize: 18, fontWeight: '700', color: colors.ink },
  cat: { fontSize: 12, color: colors.muted, marginTop: 2 },
  he: { fontSize: 18, fontWeight: '600', color: colors.accent, writingDirection: 'rtl' },
  spk: { fontSize: 18 },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 40 },
});
