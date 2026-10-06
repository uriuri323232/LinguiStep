import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Btn, CategoryChips, ProgressBar } from '../components/ui';
import { allWords, shuffle, wordById, wordsOf } from '../data';
import { bad, good, speak } from '../speech';
import { useProgress } from '../store';
import { radius, useTheme } from '../theme';

const LEN = 10;
const MODES = [
  { k: 'en2he', icon: '🇬🇧', title: 'אנגלית ← עברית', sub: 'רואים מילה, בוחרים תרגום' },
  { k: 'he2en', icon: '🇮🇱', title: 'עברית ← אנגלית', sub: 'רואים תרגום, בוחרים מילה' },
  { k: 'listen', icon: '🎧', title: 'האזנה', sub: 'שומעים מילה, בוחרים תרגום' },
];

function build(pool, mode) {
  const m = mode === 'he2en' ? 'he2en' : 'en2he';
  const field = m === 'he2en' ? 'en' : 'he';
  return shuffle(pool).slice(0, LEN).map((w) => {
    const right = w[field];
    const wrong = [];
    for (const x of shuffle(allWords)) {
      if (x[field] !== right && !wrong.includes(x[field])) wrong.push(x[field]);
      if (wrong.length === 3) break;
    }
    return { id: w.id, en: w.en, ask: m === 'he2en' ? w.he : w.en, right, options: shuffle([right, ...wrong]) };
  });
}

export default function QuizScreen({ route }) {
  const t = useTheme();
  const { s, update, award, addMistake, clearMistake } = useProgress();
  const [cat, setCat] = useState('all');
  const [mode, setMode] = useState('en2he');
  const [quiz, setQuiz] = useState(null);
  const [qi, setQi] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [gained, setGained] = useState(0);
  const [picked, setPicked] = useState(null);
  const [note, setNote] = useState('');
  const [reviewing, setReviewing] = useState(false);

  const start = (m = mode, pool = wordsOf(cat), review = false) => {
    if (pool.length === 0) { setNote('אין כרגע טעויות לחזרה. כל הכבוד! 🎉'); return; }
    setNote(''); setMode(m); setReviewing(review);
    setQuiz(build(pool, m)); setQi(0); setScore(0); setCombo(0); setGained(0); setPicked(null);
  };

  useEffect(() => {
    if (route.start === 'mistakes') start('en2he', Object.keys(s.mistakes).map((id) => wordById[id]).filter(Boolean), true);
    else if (route.start) start(route.start);
  }, []);

  const finished = quiz && qi >= quiz.length;
  const q = quiz && quiz[qi];

  useEffect(() => { if (q && mode === 'listen') speak(q.en); }, [qi, quiz]);
  useEffect(() => {
    if (finished) {
      const pct = Math.round((score / quiz.length) * 100);
      if (pct > s.best) update((p) => ({ ...p, best: pct }));
    }
  }, [finished]);

  const choose = (o) => {
    if (picked != null) return;
    setPicked(o);
    if (o === q.right) {
      const c = combo + 1; const xp = 5 + Math.min(c - 1, 5);
      setScore(score + 1); setCombo(c); setGained(gained + xp); award(xp); clearMistake(q.id); good();
    } else { setCombo(0); addMistake(q.id); award(1); bad(); }
  };

  if (!quiz) {
    return (
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        <Text style={{ fontSize: 28, fontWeight: '800', color: t.ink }}>חידון 🎯</Text>
        <Text style={{ color: t.muted }}>שיא אישי: {s.best}% · כל תשובה נכונה מעניקה נקודות, ורצף תשובות מוסיף בונוס.</Text>
        <CategoryChips value={cat} onChange={setCat} />
        {MODES.map((m) => (
          <Btn key={m.k} onPress={() => setMode(m.k)} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: mode === m.k ? t.soft : t.card, borderRadius: radius, borderWidth: 2, borderColor: mode === m.k ? t.accent : t.line, padding: 16 }}>
            <Text style={{ fontSize: 30 }}>{m.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: t.ink, fontWeight: '800', fontSize: 16 }}>{m.title}</Text>
              <Text style={{ color: t.muted, marginTop: 2 }}>{m.sub}</Text>
            </View>
            {mode === m.k && <Text style={{ fontSize: 20 }}>✔️</Text>}
          </Btn>
        ))}
        <Btn onPress={() => start()} style={{ alignSelf: 'stretch' }}>
          <LinearGradient colors={[t.accent, t.accent2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ borderRadius: 16, paddingVertical: 17, alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 17 }}>התחל חידון</Text>
          </LinearGradient>
        </Btn>
        <Btn onPress={() => start('en2he', Object.keys(s.mistakes).map((id) => wordById[id]).filter(Boolean), true)}
          style={{ backgroundColor: t.card, borderRadius: 16, borderWidth: 1, borderColor: t.line, paddingVertical: 15, alignItems: 'center' }}>
          <Text style={{ color: t.ink, fontWeight: '700' }}>🔁 חזרה על טעויות ({Object.keys(s.mistakes).length})</Text>
        </Btn>
        {!!note && <Text style={{ color: t.muted, textAlign: 'center' }}>{note}</Text>}
      </ScrollView>
    );
  }

  if (finished) {
    const pct = Math.round((score / quiz.length) * 100);
    const stars = pct === 100 ? 3 : pct >= 70 ? 2 : pct >= 40 ? 1 : 0;
    return (
      <View style={{ flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <Text style={{ fontSize: 44 }}>{'⭐'.repeat(stars) || '💪'}</Text>
        <Text style={{ fontSize: 60, fontWeight: '800', color: t.ink }}>{score}/{quiz.length}</Text>
        <Text style={{ color: t.ink, fontSize: 18, fontWeight: '700' }}>
          {pct === 100 ? 'מושלם! ענית נכון על הכול' : pct >= 70 ? 'כל הכבוד!' : 'התחלה טובה, עוד סיבוב ותשתפר'}
        </Text>
        <Text style={{ color: t.muted }}>הרווחת {gained} נקודות · שיא אישי {Math.max(s.best, pct)}%</Text>
        <Btn onPress={() => start(mode, reviewing ? Object.keys(s.mistakes).map((id) => wordById[id]).filter(Boolean) : wordsOf(cat), reviewing)}
          style={{ alignSelf: 'stretch', backgroundColor: t.accent, borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8 }}>
          <Text style={{ color: t.onAccent, fontWeight: '800', fontSize: 16 }}>סיבוב נוסף</Text>
        </Btn>
        <Btn onPress={() => setQuiz(null)} style={{ alignSelf: 'stretch', backgroundColor: t.card, borderWidth: 1, borderColor: t.line, borderRadius: 16, paddingVertical: 15, alignItems: 'center' }}>
          <Text style={{ color: t.ink, fontWeight: '700' }}>חזרה לבחירת נושא</Text>
        </Btn>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: t.muted }}>שאלה {qi + 1} מתוך {quiz.length}</Text>
        <Text style={{ color: t.ink, fontWeight: '800' }}>{combo >= 2 ? `🔥 רצף ${combo}  ` : ''}⭐ {score}</Text>
      </View>
      <ProgressBar value={qi / quiz.length} height={8} />
      <View style={{ backgroundColor: t.card, borderRadius: radius + 4, borderWidth: 1, borderColor: t.line, padding: 26, alignItems: 'center', gap: 10, marginTop: 4 }}>
        {mode === 'listen' ? (
          <Btn onPress={() => speak(q.en)} style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: t.soft, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 44 }}>🔊</Text>
          </Btn>
        ) : (
          <Text style={{ fontSize: 36, fontWeight: '800', color: t.ink, textAlign: 'center', writingDirection: mode === 'he2en' ? 'rtl' : 'ltr' }}>{q.ask}</Text>
        )}
        {mode === 'en2he' && <Btn onPress={() => speak(q.en)}><Text style={{ color: t.accent, fontWeight: '700' }}>🔊 השמע</Text></Btn>}
        <Text style={{ color: t.muted }}>{mode === 'listen' ? 'הקש כדי לשמוע שוב, ובחר את התרגום' : 'בחר את התשובה הנכונה'}</Text>
      </View>
      {q.options.map((o) => {
        const show = picked != null; const right = o === q.right; const wrong = show && picked === o && !right;
        return (
          <Btn key={o} disabled={show} onPress={() => choose(o)}
            style={{ backgroundColor: show && right ? t.goodSoft : wrong ? t.badSoft : t.card, borderWidth: 2, borderColor: show && right ? t.good : wrong ? t.bad : t.line, borderRadius: 16, padding: 16, alignItems: 'center', opacity: 1 }}>
            <Text style={{ fontSize: 19, fontWeight: '700', color: t.ink, textAlign: 'center', writingDirection: mode === 'he2en' ? 'ltr' : 'rtl' }}>{show && right ? '✅ ' : wrong ? '❌ ' : ''}{o}</Text>
          </Btn>
        );
      })}
      {picked != null && (
        <Btn onPress={() => { setPicked(null); setQi(qi + 1); }} style={{ backgroundColor: t.accent, borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 4 }}>
          <Text style={{ color: t.onAccent, fontWeight: '800', fontSize: 16 }}>{qi === quiz.length - 1 ? 'לתוצאות' : 'לשאלה הבאה'}</Text>
        </Btn>
      )}
    </ScrollView>
  );
}
