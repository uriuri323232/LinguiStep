import React, { useRef } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme';
import { categories } from '../data';
import { tap } from '../speech';

// Button with a small press animation and haptic tick.
export function Btn({ onPress, style, children, disabled, haptic = true }) {
  const sc = useRef(new Animated.Value(1)).current;
  const flat = StyleSheet.flatten(style) || {};
  return (
    <Pressable
      disabled={disabled}
      style={{ flex: flat.flex, alignSelf: flat.alignSelf, width: flat.width }}
      onPressIn={() => Animated.spring(sc, { toValue: 0.96, useNativeDriver: true, speed: 40, bounciness: 0 }).start()}
      onPressOut={() => Animated.spring(sc, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 6 }).start()}
      onPress={() => { if (haptic) tap(); onPress && onPress(); }}
    >
      <Animated.View style={[style, { transform: [{ scale: sc }] }, disabled && { opacity: 0.45 }]}>{children}</Animated.View>
    </Pressable>
  );
}

export function ProgressBar({ value, color, height = 8, track }) {
  const t = useTheme();
  return (
    <View style={{ height, borderRadius: height, backgroundColor: track || t.line, overflow: 'hidden' }}>
      <View style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%`, height: '100%', borderRadius: height, backgroundColor: color || t.accent }} />
    </View>
  );
}

export function CategoryChips({ value, onChange }) {
  const t = useTheme();
  const items = [{ id: 'all', name: 'הכל', emoji: '📚' }, ...categories];
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 4 }}>
      {items.map((c) => {
        const on = c.id === value;
        return (
          <Btn key={c.id} onPress={() => onChange(c.id)}
            style={{ paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, backgroundColor: on ? t.accent : t.card, borderWidth: 1, borderColor: on ? t.accent : t.line }}>
            <Text style={{ color: on ? t.onAccent : t.ink, fontWeight: '700' }}>{c.emoji} {c.name}</Text>
          </Btn>
        );
      })}
    </ScrollView>
  );
}
