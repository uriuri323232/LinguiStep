import React from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { categories } from '../data';
import { colors } from '../theme';

export default function CategoryChips({ value, onChange }) {
  const items = [{ id: 'all', name: 'הכל', emoji: '📚' }, ...categories];
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row} style={styles.scroll}>
      {items.map((c) => {
        const on = c.id === value;
        return (
          <TouchableOpacity key={c.id} onPress={() => onChange(c.id)} style={[styles.chip, on && styles.chipOn]}>
            <Text style={[styles.text, on && styles.textOn]}>{c.emoji} {c.name}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0 },
  row: { paddingHorizontal: 16, gap: 8, paddingVertical: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  chipOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  text: { color: colors.ink, fontWeight: '600' },
  textOn: { color: '#fff' },
});
