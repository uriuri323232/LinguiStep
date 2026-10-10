import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, I18nManager, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { Btn, CategoryChips, ProgressBar, Tool } from '../components/ui';
import { poolOf, shuffle } from '../data';
import { good, speak } from '../speech';
import { useProgress } from '../store';
import { radius, useTheme } from '../theme';

const sizeFor = (txt) => (txt.length > 26 ? 24 : txt.length > 16 ? 30 : txt.length > 10 ? 36 : 42);

export default function FlashcardsScreen({ route }) {
  const t = useTheme();
  const { height } = useWindowDimensions();
  const { s, review, toggleFav } = useProgress();
  const [cat, setCat] = useState(route.cat || 'all');
  const [hideKnown, setHide] = useState(false);
  const [order, setOrder] = useState(null);
  const [idx, setIdx] = useState(0);
  const flip = useRef(new Animated.Value(0)).current;
  const flipped = useRef(false);

  // The deck is a snapshot taken when the topic changes, so it doesn't shift under your fingers while you review.
  const base = useMemo(() => poolOf(cat, s), [cat]); // eslint-disable-line react-hooks/exhaustive-deps
  const deck = useMemo(() => (order || base).filter((w) => !hideKnown || !s.known[w.id]), [order, base, hideKnown, s.known]);
  const i = Math.min(idx, Math.max(0, deck.length - 1));
  const word = deck[i];
  const knownInCat = base.filter((w) => s.known[w.id]).length;
  const prevArrow = I18nManager.isRTL ? '›' : '‹';
  const nextArrow = I18nManager.isRTL ? '‹' : '›';

  useEffect(() => { setOrder(null); setIdx(0); }, [cat]);
  useEffect(() => { flip.setValue(0); flipped.current = false; }, [word && word.id]);
  useEffect(() => { if (s.auto && word) speak(word.en); }, [word && word.id]);

  const doFlip = () => {
    Animated.spring(flip, { toValue: flipped.current ? 0 : 180, friction: 8, tension: 12, useNativeDriver: true }).start();
    flipped.current = !flipped.current;
  };
  const next = () => setIdx(Math.min(i + 1, deck.length - 1));
  const prev = () => setIdx(Math.max(i - 1, 0));
  const onKnow = () => { review(word.id, true); good(); if (!hideKnown) next(); };
  const onLater = () => { review(word.id, false); next(); };

  const frontRot = flip.interpolate({ inputRange: [0, 180], outputRange: ['0deg', '180deg'] });
  const backRot = flip.interpolate({ inputRange: [0, 180], outputRange: ['180deg', '360deg'] });
  const face = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backfaceVisibility: 'hidden', borderRadius: radius + 6, alignItems: 'center', justifyContent: 'center', padding: 22, elevation: 5, shadowColor: t.shadow, shadowOpacity: 0.18, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } };
  const cardH = Math.max(230, Math.min(360, height * 0.36));

  const emptyText = cat === 'fav' ? 'עוד לא סימנת מועדפים. לחץ ⭐ בכרטיסייה כדי להוסיף.'
    : cat === 'mistakes' ? 'אין כרגע טעויות לחזרה. כל הכבוד!'
    : hideKnown ? 'ידעת את כל המילים בנושא הזה! 🎉' : 'אין מילים בקבוצה הזו כרגע.';

  const front = word ? (s.heFirst ? word.he : word.en) : '';
  const back = word ? (s.heFirst ? word.en : word.he) : '';
  const dir = (isHe) => ({ writingDirection: isHe ? 'rtl' : 'ltr', textAlign: 'center' });

  return (
    <View style={{ flex: 1, paddingTop: 8 }}>
      <CategoryChips value={cat} onChange={setCat} special={['due', 'fav', 'mistakes']} />
      <View style={{ paddingHorizontal: 20, marginTop: 12, gap: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: t.muted }}>{deck.length ? `${i + 1} מתוך ${deck.length}` : '—'}</Text>
          <Text style={{ color: t.muted }}>✅ {knownInCat} / {base.length} ידועות</Text>
        </View>
        <ProgressBar value={deck.length ? (i + 1) / deck.length : 0} height={8} />
      </View>

      {!word ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30, gap: 12 }}>
          <Text style={{ fontSize: 56 }}>🗂️</Text>
          <Text style={{ color: t.ink, fontSize: 18, fontWeight: '800', textAlign: 'center' }}>{emptyText}</Text>
          {hideKnown && (
            <Btn onPress={() => setHide(false)} style={{ backgroundColor: t.accent, paddingHorizontal: 22, paddingVertical: 13, borderRadius: 14 }}>
              <Text style={{ color: t.onAccent, fontWeight: '800' }}>הצג את כל המילים שוב</Text>
            </Btn>
          )}
        </View>
      ) : (
        <>
          <View style={{ flex: 1, paddingHorizontal: 20, justifyContent: 'center' }}>
            <Pressable onPress={doFlip} style={{ height: cardH }} accessibilityRole="button" accessibilityLabel="הפוך כרטיסייה">
              <Animated.View style={[face, { backgroundColor: t.card, borderWidth: 1, borderColor: t.line, transform: [{ perspective: 1000 }, { rotateY: frontRot }] }]}>
                <View style={{ position: 'absolute', top: 14, start: 14, backgroundColor: word.color + '26', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999 }}>
                  <Text style={{ color: t.ink, fontWeight: '700', fontSize: 12 }}>{word.emoji} {word.categoryName}</Text>
                </View>
                {s.known[word.id] && <Text style={{ position: 'absolute', top: 12, end: 16, fontSize: 22 }}>✅</Text>}
                <Text numberOfLines={3} adjustsFontSizeToFit style={[{ fontSize: sizeFor(front), fontWeight: '800', color: t.ink }, dir(s.heFirst)]}>{front}</Text>
                <Text style={{ marginTop: 16, color: t.muted }}>הקש כדי לראות תרגום</Text>
              </Animated.View>
              <Animated.View style={[face, { backgroundColor: word.color, transform: [{ perspective: 1000 }, { rotateY: backRot }] }]}>
                <Text numberOfLines={3} adjustsFontSizeToFit style={[{ fontSize: sizeFor(back) - 2, fontWeight: '800', color: '#fff' }, dir(!s.heFirst)]}>{back}</Text>
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

          <View style={{ flexDirection: 'row', gap: 6, padding: 16, alignItems: 'stretch' }}>
            <Btn onPress={prev} disabled={i === 0} label="הקודם" style={{ width: 44, backgroundColor: t.card, borderWidth: 1, borderColor: t.line, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: t.ink, fontWeight: '800', fontSize: 22 }}>{prevArrow}</Text>
            </Btn>
            <Tool icon={s.fav[word.id] ? '⭐' : '☆'} label="מועדף" on={!!s.fav[word.id]} onPress={() => toggleFav(word.id)} />
            <Tool icon="🔊" label="השמע" onPress={() => speak(word.en)} />
            <Tool icon="🔀" label="ערבב" onPress={() => { setOrder(shuffle(base)); setIdx(0); }} />
            <Tool icon="👁" label="רק חדשות" on={hideKnown} onPress={() => setHide(!hideKnown)} />
            <Btn onPress={next} disabled={i >= deck.length - 1} label="הבא" style={{ width: 44, backgroundColor: t.card, borderWidth: 1, borderColor: t.line, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: t.ink, fontWeight: '800', fontSize: 22 }}>{nextArrow}</Text>
            </Btn>
          </View>
        </>
      )}
    </View>
  );
}
