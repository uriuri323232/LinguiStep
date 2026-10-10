import React, { useRef } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme';
import { categories } from '../data';
import { tap } from '../speech';

// Button with a small press animation and haptic tick.
export function Btn({ onPress, style, children, disabled, haptic = true, label }) {
  const sc = useRef(new Animated.Value(1)).current;
  const flat = StyleSheet.flatten(style) || {};
  return (
    <Pressable
      disabled={disabled} accessibilityRole="button" accessibilityLabel={label}
      style={{ flex: flat.flex, alignSelf: flat.alignSelf, width: flat.width }}
      onPressIn={() => Animated.spring(sc, { toValue: 0.96, useNativeDriver: true, speed: 40, bounciness: 0 }).start()}
      onPressOut={() => Animated.spring(sc, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 6 }).start()}
      onPress={() => { if (haptic) tap(); onPress && onPress(); }}
    >
      <Animated.View style={[style, { transform: [{ scale: sc }] }, disabled && { opacity: 0.4 }]}>{children}</Animated.View>
    </Pressable>
  );
}

export function ProgressBar({ value, color, height = 8, track }) {
  const t = useTheme();
  return (
    <View style={{ height, borderRadius: height, backgroundColor: track || t.line, overflow: 'hidden' }}>
      <View style={{ width: `${Math.max(0, Math.min(1, value || 0)) * 100}%`, height: '100%', borderRadius: height, backgroundColor: color || t.accent }} />
    </View>
  );
}

export const SPECIAL = { due: ['🧠', 'חזרה חכמה'], fav: ['⭐', 'מועדפים'], mistakes: ['🔁', 'טעויות'] };

// Horizontal topic picker. `special` adds pools that depend on saved progress (due / fav / mistakes).
export function CategoryChips({ value, onChange, special = [] }) {
  const t = useTheme();
  const items = [{ id: 'all', name: 'הכל', emoji: '📚' }, ...special.map((k) => ({ id: k, emoji: SPECIAL[k][0], name: SPECIAL[k][1] })), ...categories];
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

// Small round-ish tool button with an icon and a caption.
export function Tool({ icon, label, onPress, on, disabled }) {
  const t = useTheme();
  return (
    <Btn onPress={onPress} disabled={disabled} label={label}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 14, backgroundColor: on ? t.accent : t.soft }}>
      <Text style={{ fontSize: 20 }}>{icon}</Text>
      <Text style={{ fontSize: 10, fontWeight: '700', marginTop: 2, color: on ? t.onAccent : t.muted }} numberOfLines={1}>{label}</Text>
    </Btn>
  );
}
