import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import CategoryChips from '../components/CategoryChips';
import { wordsOf, shuffle } from '../data';
import { speak } from '../speech';
import { load, save } from '../storage';
import { colors, radius } from '../theme';

export default function FlashcardsScreen() {
  const [cat, setCat] = useState('all');
  const [order, setOrder] = useState(null); // null = original order
  const [idx, setIdx] = useState(0);
  const [known, setKnown] = useState({});
  const flip = useRef(new Animated.Value(0)).current;
  const flipped = useRef(false);

  const base = useMemo(() => wordsOf(cat), [cat]);
  const deck = order || base;
  const word = deck[idx];

  useEffect(() => { load('known', {}).then(setKnown); }, []);
  useEffect(() => { setOrder(null); setIdx(0); }, [cat]);
  useEffect(() => { flip.setValue(0); flipped.current = false; }, [idx, cat, order]);

  const doFlip = () => {
    Animated.spring(flip, { toValue: flipped.current ? 0 : 180, friction: 8, tension: 10, useNativeDriver: true }).start();
    flipped.current = !flipped.current;
  };
  const go = (d) => { const n = idx + d; if (n >= 0 && n < deck.length) setIdx(n); };
  const toggleKnown = () => {
    const next = { ...known, [word.id]: !known[word.id] };
    setKnown(next); save('known', next);
  };
  const knownCount = deck.filter((w) => known[w.id]).length;

  const frontRot = flip.interpolate({ inputRange: [0, 180], outputRange: ['0deg', '180deg'] });
  const backRot = flip.interpolate({ inputRange: [0, 180], outputRange: ['180deg', '360deg'] });

  if (!word) return null;
  return (
    <View style={styles.wrap}>
      <CategoryChips value={cat} onChange={setCat} />
      <View style={styles.meta}>
        <Text style={styles.metaText}>מילה {idx + 1} מתוך {deck.length}</Text>
        <Text style={styles.metaText}>✅ {knownCount} ידועות</Text>
      </View>
      <View style={styles.bar}><View style={[styles.barFill, { width: `${((idx + 1) / deck.length) * 100}%` }]} /></View>

      <View style={styles.cardArea}>
        <TouchableOpacity activeOpacity={0.95} onPress={doFlip} style={styles.touch}>
          <Animated.View style={[styles.face, { transform: [{ perspective: 1000 }, { rotateY: frontRot }] }]}>
            <Text style={styles.cat}>{word.emoji} {word.categoryName}</Text>
            <Text style={styles.en}>{word.en}</Text>
            <Text style={styles.hint}>הקש כדי לראות תרגום</Text>
          </Animated.View>
          <Animated.View style={[styles.face, styles.back, { transform: [{ perspective: 1000 }, { rotateY: backRot }] }]}>
            <Text style={styles.he}>{word.he}</Text>
            <Text style={[styles.hint, { color: '#C9D3EA' }]}>הקש כדי לחזור</Text>
          </Animated.View>
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.round} onPress={() => speak(word.en)} accessibilityLabel="השמע הגייה">
          <Text style={styles.roundText}>🔊 השמע</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.round, known[word.id] && styles.roundOn]} onPress={toggleKnown}>
          <Text style={styles.roundText}>{known[word.id] ? '✅ ידועה' : '☑️ סמן כידועה'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.round} onPress={() => { setOrder(shuffle(base)); setIdx(0); }}>
          <Text style={styles.roundText}>🔀 ערבב</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.nav}>
        <TouchableOpacity style={[styles.navBtn, idx === 0 && styles.disabled]} disabled={idx === 0} onPress={() => go(-1)}>
          <Text style={styles.navText}>‹ הקודמת</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navBtn, styles.primary, idx === deck.length - 1 && styles.disabled]} disabled={idx === deck.length - 1} onPress={() => go(1)}>
          <Text style={[styles.navText, { color: '#fff' }]}>הבאה ›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingTop: 8 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 10 },
  metaText: { color: colors.muted, fontSize: 14 },
  bar: { height: 6, backgroundColor: colors.line, borderRadius: 6, marginHorizontal: 20, marginTop: 8, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: colors.accent },
  cardArea: { flex: 1, padding: 20, justifyContent: 'center' },
  touch: { height: 300 },
  face: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backfaceVisibility: 'hidden',
    backgroundColor: colors.card, borderRadius: radius, borderWidth: 1, borderColor: colors.line,
    alignItems: 'center', justifyContent: 'center', padding: 20, elevation: 3,
    shadowColor: '#14213D', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 6 },
  },
  back: { backgroundColor: colors.ink, borderColor: colors.ink },
  cat: { position: 'absolute', top: 14, left: 14, backgroundColor: colors.sun, color: '#3A2A00', fontWeight: '700', fontSize: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, overflow: 'hidden' },
  en: { fontSize: 38, fontWeight: '800', color: colors.ink, textAlign: 'center' },
  he: { fontSize: 36, fontWeight: '800', color: '#fff', textAlign: 'center', writingDirection: 'rtl' },
  hint: { marginTop: 14, color: colors.muted, fontSize: 13 },
  actions: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, justifyContent: 'center' },
  round: { flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, paddingVertical: 12, borderRadius: 14, alignItems: 'center' },
  roundOn: { backgroundColor: colors.goodSoft, borderColor: colors.good },
  roundText: { color: colors.ink, fontWeight: '600', fontSize: 13 },
  nav: { flexDirection: 'row', gap: 10, padding: 16 },
  navBtn: { flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, paddingVertical: 15, borderRadius: 14, alignItems: 'center' },
  primary: { backgroundColor: colors.accent, borderColor: colors.accent },
  navText: { fontWeight: '700', color: colors.ink, fontSize: 16 },
  disabled: { opacity: 0.4 },
});
