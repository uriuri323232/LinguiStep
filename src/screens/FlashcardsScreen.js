import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Text, View, Pressable } from 'react-native';
import { Btn, CategoryChips, ProgressBar } from '../components/ui';
import { shuffle, wordsOf } from '../data';
import { speak, good } from '../speech';
import { useProgress } from '../store';
import { radius, useTheme } from '../theme';

export default function FlashcardsScreen({ route }) {
  const t = useTheme();
  const { s, award, markKnown } = useProgress();
  const [cat, setCat] = useState(route.cat || 'all');
  const [hideKnown, setHide] = useState(false);
  const [order, setOrder] = useState(null);
  const [idx, setIdx] = useState(0);
  const flip = useRef(new Animated.Value(0)).current;
  const flipped = useRef(false);

  const base = useMemo(() => wordsOf(cat), [cat]);
  const deck = useMemo(() => (order || base).filter((w) => !hideKnown || !s.known[w.id]), [order, base, hideKnown, s.known]);
  const i = Math.min(idx, Math.max(0, deck.length - 1));
  const word = deck[i];
  const knownInCat = base.filter((w) => s.known[w.id]).length;

  useEffect(() => { setOrder(null); setIdx(0); }, [cat]);
  useEffect(() => { flip.setValue(0); flipped.current = false; }, [word && word.id]);
  useEffect(() => { if (s.auto && word) speak(word.en); }, [word && word.id]);

  const doFlip = () => {
    Animated.spring(flip, { toValue: flipped.current ? 0 : 180, friction: 8, tension: 12, useNativeDriver: true }).start();
    flipped.current = !flipped.current;
  };
  const next = () => setIdx(Math.min(i + 1, deck.length - 1));
  const prev = () => setIdx(Math.max(i - 1, 0));
  const onKnow = () => { markKnown(word.id, true); award(3); good(); if (!hideKnown) next(); };
  const onLater = () => { markKnown(word.id, false); award(1); next(); };

  const frontRot = flip.interpolate({ inputRange: [0, 180], outputRange: ['0deg', '180deg'] });
  const backRot = flip.interpolate({ inputRange: [0, 180], outputRange: ['180deg', '360deg'] });
  const face = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backfaceVisibility: 'hidden', borderRadius: radius + 6, alignItems: 'center', justifyContent: 'center', padding: 22, elevation: 5, shadowColor: t.shadow, shadowOpacity: 0.18, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } };

  return (
    <View style={{ flex: 1, paddingTop: 8 }}>
      <CategoryChips value={cat} onChange={setCat} />
      <View style={{ paddingHorizontal: 20, marginTop: 12, gap: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: t.muted }}>{deck.length ? `${i + 1} מתוך ${deck.length}` : '—'}</Text>
          <Text style={{ color: t.muted }}>✅ {knownInCat} / {base.length} ידועות</Text>
        </View>
        <ProgressBar value={deck.length ? (i + 1) / deck.length : 0} height={8} />
      </View>

      {!word ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30, gap: 12 }}>
          <Text style={{ fontSize: 64 }}>🎉</Text>
          <Text style={{ color: t.ink, fontSize: 20, fontWeight: '800', textAlign: 'center' }}>ידעת את כל המילים בנושא הזה!</Text>
          <Btn onPress={() => setHide(false)} style={{ backgroundColor: t.accent, paddingHorizontal: 22, paddingVertical: 13, borderRadius: 14 }}>
            <Text style={{ color: t.onAccent, fontWeight: '800' }}>הצג את כל המילים שוב</Text>
          </Btn>
        </View>
      ) : (
        <>
          <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
            <Pressable onPress={doFlip} style={{ height: 320 }}>
              <Animated.View style={[face, { backgroundColor: t.card, borderWidth: 1, borderColor: t.line, transform: [{ perspective: 1000 }, { rotateY: frontRot }] }]}>
                <View style={{ position: 'absolute', top: 16, left: 16, backgroundColor: word.color + '26', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999 }}>
                  <Text style={{ color: t.ink, fontWeight: '700', fontSize: 12 }}>{word.emoji} {word.categoryName}</Text>
                </View>
                {s.known[word.id] && <Text style={{ position: 'absolute', top: 14, right: 16, fontSize: 22 }}>✅</Text>}
                <Text style={{ fontSize: 40, fontWeight: '800', color: t.ink, textAlign: 'center' }}>{word.en}</Text>
                <Text style={{ marginTop: 16, color: t.muted }}>הקש כדי לראות תרגום</Text>
              </Animated.View>
              <Animated.View style={[face, { backgroundColor: word.color, transform: [{ perspective: 1000 }, { rotateY: backRot }] }]}>
                <Text style={{ fontSize: 38, fontWeight: '800', color: '#fff', textAlign: 'center', writingDirection: 'rtl' }}>{word.he}</Text>
                <Text style={{ marginTop: 16, color: '#fff', opacity: 0.8 }}>הקש כדי לחזור</Text>
              </Animated.View>
            </Pressable>
          </View>

          <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 16 }}>
            <Btn onPress={onLater} style={{ flex: 1, backgroundColor: t.badSoft, borderRadius: 16, paddingVertical: 15, alignItems: 'center' }}>
              <Text style={{ color: t.bad, fontWeight: '800', fontSize: 15 }}>🔁 עוד לא</Text>
            </Btn>
            <Btn onPress={onKnow} style={{ flex: 1, backgroundColor: t.goodSoft, borderRadius: 16, paddingVertical: 15, alignItems: 'center' }}>
              <Text style={{ color: t.good, fontWeight: '800', fontSize: 15 }}>✅ ידעתי</Text>
            </Btn>
          </View>

          <View style={{ flexDirection: 'row', gap: 8, padding: 16 }}>
            <Btn onPress={prev} disabled={i === 0} style={{ flex: 1, backgroundColor: t.card, borderWidth: 1, borderColor: t.line, borderRadius: 14, paddingVertical: 12, alignItems: 'center' }}>
              <Text style={{ color: t.ink, fontWeight: '700' }}>›</Text>
            </Btn>
            <Btn onPress={() => speak(word.en)} style={{ flex: 2, backgroundColor: t.soft, borderRadius: 14, paddingVertical: 12, alignItems: 'center' }}>
              <Text style={{ color: t.ink, fontWeight: '700' }}>🔊 השמע</Text>
            </Btn>
            <Btn onPress={() => { setOrder(shuffle(base)); setIdx(0); }} style={{ flex: 2, backgroundColor: t.soft, borderRadius: 14, paddingVertical: 12, alignItems: 'center' }}>
              <Text style={{ color: t.ink, fontWeight: '700' }}>🔀 ערבב</Text>
            </Btn>
            <Btn onPress={() => setHide(!hideKnown)} style={{ flex: 2, backgroundColor: hideKnown ? t.accent : t.soft, borderRadius: 14, paddingVertical: 12, alignItems: 'center' }}>
              <Text style={{ color: hideKnown ? t.onAccent : t.ink, fontWeight: '700' }}>👁 רק חדשות</Text>
            </Btn>
            <Btn onPress={next} disabled={i >= deck.length - 1} style={{ flex: 1, backgroundColor: t.card, borderWidth: 1, borderColor: t.line, borderRadius: 14, paddingVertical: 12, alignItems: 'center' }}>
              <Text style={{ color: t.ink, fontWeight: '700' }}>‹</Text>
            </Btn>
          </View>
        </>
      )}
    </View>
  );
}
