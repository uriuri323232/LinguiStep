import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Btn, CategoryChips, ProgressBar } from '../components/ui';
import { allWords, poolOf, shuffle } from '../data';
import { bad, good, speak } from '../speech';
import { useProgress } from '../store';
import { radius, useTheme } from '../theme';

const LENS = [5, 10, 20];
const MODES = [
  { k: 'en2he', icon: '🇬🇧', title: 'אנגלית ← עברית', sub: 'רואים מילה, בוחרים תרגום' },
  { k: 'he2en', icon: '🇮🇱', title: 'עברית ← אנגלית', sub: 'רואים תרגום, בוחרים מילה' },
  { k: 'listen', icon: '🎧', title: 'האזנה', sub: 'שומעים מילה, בוחרים תרגום' },
  { k: 'type', icon: '⌨️', title: 'הקלדה', sub: 'רואים עברית, כותבים באנגלית' },
  { k: 'spell', icon: '✍️', title: 'כתיב', sub: 'שומעים מילה וכותבים אותה' },
];
const TYPED = (m) => m === 'type' || m === 'spell';

const clean = (x) => x.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
const noTo = (x) => clean(x).replace(/^to /, '');
const isRight = (text, accept) => accept.some((a) => clean(a) === clean(text) || noTo(a) === noTo(text));

function build(pool, mode, len) {
  const picked = shuffle(pool).slice(0, len);
  if (TYPED(mode)) {
    return picked.map((w) => ({
      id: w.id, en: w.en, he: w.he, ask: mode === 'type' ? w.he : w.en, right: w.en,
      accept: mode === 'type' ? allWords.filter((x) => x.he === w.he).map((x) => x.en) : [w.en],
    }));
  }
  const field = mode === 'he2en' ? 'en' : 'he';
  return picked.map((w) => {
    const right = w[field];
    const wrong = [];
    // prefer distractors from the same topic, so the question is a real test
    const near = shuffle(allWords.filter((x) => x.category === w.category && x.id !== w.id)).slice(0, 2);
    for (const x of [...near, ...shuffle(allWords)]) {
      if (x[field] !== right && !wrong.includes(x[field])) wrong.push(x[field]);
      if (wrong.length === 3) break;
    }
    return { id: w.id, en: w.en, he: w.he, ask: mode === 'he2en' ? w.he : w.en, right, options: shuffle([right, ...wrong]) };
  });
}

export default function QuizScreen({ route }) {
  const t = useTheme();
  const { s, update, award, addMistake, clearMistake } = useProgress();
  const [cat, setCat] = useState('all');
  const [mode, setMode] = useState('en2he');
  const [len, setLen] = useState(10);
  const [quiz, setQuiz] = useState(null);
  const [qi, setQi] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [gained, setGained] = useState(0);
  const [picked, setPicked] = useState(null);
  const [text, setText] = useState('');
  const [checked, setChecked] = useState(null);
  const [missed, setMissed] = useState([]);
  const [note, setNote] = useState('');

  const start = (m = mode, c = cat, l = len) => {
    const pool = poolOf(c, s);
    if (pool.length === 0) { setNote(c === 'mistakes' ? 'אין כרגע טעויות לחזרה. כל הכבוד! 🎉' : c === 'fav' ? 'עוד לא סימנת מועדפים.' : 'אין מילים בקבוצה הזו.'); return; }
    setNote(''); setMode(m); setCat(c); setLen(l);
    setQuiz(build(pool, m, l)); setQi(0); setScore(0); setCombo(0); setGained(0); setPicked(null); setText(''); setChecked(null); setMissed([]);
  };

  useEffect(() => {
    if (route.start === 'mistakes') start('en2he', 'mistakes');
    else if (route.start) start(route.start);
  }, []);

  const finished = quiz && qi >= quiz.length;
  const q = quiz && quiz[qi];
  const answered = picked != null || checked != null;

  useEffect(() => { if (q && (mode === 'listen' || mode === 'spell')) speak(q.en); }, [qi, quiz]);
  useEffect(() => {
    if (finished) {
      const pct = Math.round((score / quiz.length) * 100);
      update((p) => ({ ...p, best: Math.max(p.best, pct), qs: { played: p.qs.played + 1, correct: p.qs.correct + score, total: p.qs.total + quiz.length } }));
    }
  }, [finished]);

  const result = (ok) => {
    if (ok) {
      const c = combo + 1; const xp = 5 + Math.min(c - 1, 5);
      setScore(score + 1); setCombo(c); setGained(gained + xp); award(xp); clearMistake(q.id); good();
    } else { setCombo(0); setMissed([...missed, q]); addMistake(q.id); award(1); bad(); }
  };
  const choose = (o) => { if (answered) return; setPicked(o); result(o === q.right); };
  const submit = (skip) => {
    if (answered || (!skip && !text.trim())) return;
    const ok = !skip && isRight(text, q.accept);
    setChecked(ok); result(ok);
  };
  const nextQ = () => { setPicked(null); setChecked(null); setText(''); setQi(qi + 1); };

  if (!quiz) {
    return (
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }} keyboardShouldPersistTaps="handled">
        <Text style={{ fontSize: 28, fontWeight: '800', color: t.ink }}>חידון 🎯</Text>
        <Text style={{ color: t.muted }}>שיא אישי: {s.best}% · כל תשובה נכונה מעניקה נקודות, ורצף תשובות מוסיף בונוס.</Text>
        <CategoryChips value={cat} onChange={setCat} special={['mistakes', 'fav']} />
        <Text style={{ color: t.ink, fontWeight: '800' }}>מספר שאלות</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {LENS.map((n) => (
            <Btn key={n} onPress={() => setLen(n)} style={{ flex: 1, paddingVertical: 11, borderRadius: 12, alignItems: 'center', backgroundColor: len === n ? t.accent : t.soft }}>
              <Text style={{ fontWeight: '800', color: len === n ? t.onAccent : t.ink }}>{n}</Text>
            </Btn>
          ))}
        </View>
        <Text style={{ color: t.ink, fontWeight: '800' }}>סוג החידון</Text>
        {MODES.map((m) => (
          <Btn key={m.k} onPress={() => setMode(m.k)} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: mode === m.k ? t.soft : t.card, borderRadius: radius, borderWidth: 2, borderColor: mode === m.k ? t.accent : t.line, padding: 14 }}>
            <Text style={{ fontSize: 28 }}>{m.icon}</Text>
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
        {!!note && <Text style={{ color: t.muted, textAlign: 'center' }}>{note}</Text>}
      </ScrollView>
    );
  }

  if (finished) {
    const pct = Math.round((score / quiz.length) * 100);
    const stars = pct === 100 ? 3 : pct >= 70 ? 2 : pct >= 40 ? 1 : 0;
    return (
      <ScrollView contentContainerStyle={{ padding: 24, alignItems: 'center', gap: 12 }}>
        <Text style={{ fontSize: 44 }}>{'⭐'.repeat(stars) || '💪'}</Text>
        <Text style={{ fontSize: 60, fontWeight: '800', color: t.ink }}>{score}/{quiz.length}</Text>
        <Text style={{ color: t.ink, fontSize: 18, fontWeight: '700' }}>
          {pct === 100 ? 'מושלם! ענית נכון על הכול' : pct >= 70 ? 'כל הכבוד!' : 'התחלה טובה, עוד סיבוב ותשתפר'}
        </Text>
        <Text style={{ color: t.muted }}>הרווחת {gained} נקודות · שיא אישי {Math.max(s.best, pct)}%</Text>
        {missed.length > 0 && (
          <View style={{ alignSelf: 'stretch', backgroundColor: t.card, borderRadius: radius, borderWidth: 1, borderColor: t.line, padding: 14, gap: 8 }}>
            <Text style={{ color: t.ink, fontWeight: '800' }}>כדאי לחזור על</Text>
            {missed.map((m) => (
              <Btn key={m.id} onPress={() => speak(m.en)} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: t.ink, fontWeight: '700' }}>🔊 {m.en}</Text>
                <Text style={{ color: t.accent, fontWeight: '700' }}>{m.he}</Text>
              </Btn>
            ))}
          </View>
        )}
        <Btn onPress={() => start()} style={{ alignSelf: 'stretch', backgroundColor: t.accent, borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8 }}>
          <Text style={{ color: t.onAccent, fontWeight: '800', fontSize: 16 }}>סיבוב נוסף</Text>
        </Btn>
        <Btn onPress={() => setQuiz(null)} style={{ alignSelf: 'stretch', backgroundColor: t.card, borderWidth: 1, borderColor: t.line, borderRadius: 16, paddingVertical: 15, alignItems: 'center' }}>
          <Text style={{ color: t.ink, fontWeight: '700' }}>חזרה להגדרות</Text>
        </Btn>
      </ScrollView>
    );
  }

  const audioOnly = mode === 'listen' || mode === 'spell';
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} keyboardShouldPersistTaps="handled">
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: t.muted }}>שאלה {qi + 1} מתוך {quiz.length}</Text>
        <Text style={{ color: t.ink, fontWeight: '800' }}>{combo >= 2 ? `🔥 רצף ${combo}  ` : ''}⭐ {score}</Text>
      </View>
      <ProgressBar value={qi / quiz.length} height={8} />
      <View style={{ backgroundColor: t.card, borderRadius: radius + 4, borderWidth: 1, borderColor: t.line, padding: 26, alignItems: 'center', gap: 10, marginTop: 4 }}>
        {audioOnly ? (
          <Btn label="השמע שוב" onPress={() => speak(q.en)} style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: t.soft, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 44 }}>🔊</Text>
          </Btn>
        ) : (
          <Text style={{ fontSize: q.ask.length > 18 ? 28 : 36, fontWeight: '800', color: t.ink, textAlign: 'center', writingDirection: mode === 'en2he' ? 'ltr' : 'rtl' }}>{q.ask}</Text>
        )}
        {mode === 'en2he' && <Btn onPress={() => speak(q.en)}><Text style={{ color: t.accent, fontWeight: '700' }}>🔊 השמע</Text></Btn>}
        <Text style={{ color: t.muted, textAlign: 'center' }}>
          {mode === 'listen' ? 'הקש כדי לשמוע שוב, ובחר את התרגום' : mode === 'spell' ? 'הקש כדי לשמוע שוב, וכתוב את המילה באנגלית' : mode === 'type' ? 'כתוב את המילה באנגלית' : 'בחר את התשובה הנכונה'}
        </Text>
      </View>

      {TYPED(mode) ? (
        <>
          <TextInput
            value={text} onChangeText={setText} onSubmitEditing={() => submit(false)} editable={!answered}
            placeholder="Type here…" placeholderTextColor={t.muted} autoCapitalize="none" autoCorrect={false} autoFocus returnKeyType="done"
            style={{ backgroundColor: checked === true ? t.goodSoft : checked === false ? t.badSoft : t.card, borderWidth: 2, borderColor: checked === true ? t.good : checked === false ? t.bad : t.line, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, fontSize: 20, color: t.ink, textAlign: 'left', writingDirection: 'ltr' }}
          />
          {checked === false && (
            <Btn onPress={() => speak(q.en)} style={{ backgroundColor: t.card, borderRadius: 14, borderWidth: 1, borderColor: t.line, padding: 14, alignItems: 'center', gap: 4 }}>
              <Text style={{ color: t.muted }}>התשובה הנכונה</Text>
              <Text style={{ color: t.ink, fontSize: 22, fontWeight: '800', writingDirection: 'ltr' }}>🔊 {q.en}</Text>
              <Text style={{ color: t.accent, fontWeight: '700' }}>{q.he}</Text>
            </Btn>
          )}
          {checked === true && <Text style={{ color: t.good, fontWeight: '800', textAlign: 'center' }}>✅ נכון! {q.he}</Text>}
          {!answered && (
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Btn onPress={() => submit(true)} style={{ flex: 1, backgroundColor: t.soft, borderRadius: 16, paddingVertical: 15, alignItems: 'center' }}>
                <Text style={{ color: t.ink, fontWeight: '800' }}>לא יודע</Text>
              </Btn>
              <Btn onPress={() => submit(false)} disabled={!text.trim()} style={{ flex: 2, backgroundColor: t.accent, borderRadius: 16, paddingVertical: 15, alignItems: 'center' }}>
                <Text style={{ color: t.onAccent, fontWeight: '800', fontSize: 16 }}>בדוק</Text>
              </Btn>
            </View>
          )}
        </>
      ) : (
        q.options.map((o) => {
          const show = picked != null; const right = o === q.right; const wrong = show && picked === o && !right;
          return (
            <Btn key={o} disabled={show && !right && !wrong} onPress={() => choose(o)}
              style={{ backgroundColor: show && right ? t.goodSoft : wrong ? t.badSoft : t.card, borderWidth: 2, borderColor: show && right ? t.good : wrong ? t.bad : t.line, borderRadius: 16, padding: 16, alignItems: 'center' }}>
              <Text style={{ fontSize: 19, fontWeight: '700', color: t.ink, textAlign: 'center', writingDirection: mode === 'he2en' ? 'ltr' : 'rtl' }}>{show && right ? '✅ ' : wrong ? '❌ ' : ''}{o}</Text>
            </Btn>
          );
        })
      )}

      {answered && (
        <Btn onPress={nextQ} style={{ backgroundColor: t.accent, borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 4 }}>
          <Text style={{ color: t.onAccent, fontWeight: '800', fontSize: 16 }}>{qi === quiz.length - 1 ? 'לתוצאות' : 'לשאלה הבאה'}</Text>
        </Btn>
      )}
    </ScrollView>
  );
}
