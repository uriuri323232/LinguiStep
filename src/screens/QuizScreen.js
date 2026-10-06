import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import CategoryChips from '../components/CategoryChips';
import { wordsOf, allWords, shuffle } from '../data';
import { speak } from '../speech';
import { load, save } from '../storage';
import { colors, radius } from '../theme';

const LEN = 10;

function buildQuiz(cat, dir) {
  const pool = wordsOf(cat);
  const picked = shuffle(pool).slice(0, Math.min(LEN, pool.length));
  const field = dir === 'en2he' ? 'he' : 'en';
  return picked.map((w) => {
    const ask = dir === 'en2he' ? w.en : w.he;
    const right = w[field];
    const wrong = [];
    for (const x of shuffle(allWords)) {
      if (x[field] !== right && !wrong.includes(x[field])) wrong.push(x[field]);
      if (wrong.length === 3) break;
    }
    return { ask, right, en: w.en, options: shuffle([right, ...wrong]) };
  });
}

export default function QuizScreen() {
  const [cat, setCat] = useState('all');
  const [dir, setDir] = useState('en2he');
  const [quiz, setQuiz] = useState(null);
  const [qi, setQi] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState(null);
  const [best, setBest] = useState(0);

  useEffect(() => { load('bestScore', 0).then(setBest); }, []);

  const start = () => { setQuiz(buildQuiz(cat, dir)); setQi(0); setScore(0); setPicked(null); };
  const finished = quiz && qi >= quiz.length;

  useEffect(() => {
    if (finished) {
      const pct = Math.round((score / quiz.length) * 100);
      if (pct > best) { setBest(pct); save('bestScore', pct); }
    }
  }, [finished]);

  const choose = (opt) => {
    if (picked != null) return;
    setPicked(opt);
    if (opt === quiz[qi].right) setScore((s) => s + 1);
  };
  const next = () => { setPicked(null); setQi((i) => i + 1); };

  if (!quiz) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.title}>חידון</Text>
        <Text style={styles.sub}>בחר נושא וכיוון, ואז התחל. שיא אישי: {best}%</Text>
        <CategoryChips value={cat} onChange={setCat} />
        <View style={styles.dirRow}>
          {[['en2he', 'אנגלית ← עברית'], ['he2en', 'עברית ← אנגלית']].map(([k, label]) => (
            <TouchableOpacity key={k} onPress={() => setDir(k)} style={[styles.dir, dir === k && styles.dirOn]}>
              <Text style={[styles.dirText, dir === k && { color: '#fff' }]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.start} onPress={start}><Text style={styles.startText}>התחל חידון</Text></TouchableOpacity>
      </View>
    );
  }

  if (finished) {
    const pct = Math.round((score / quiz.length) * 100);
    return (
      <View style={[styles.wrap, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.big}>{score} / {quiz.length}</Text>
        <Text style={styles.sub}>{pct === 100 ? 'מושלם! 🎉' : pct >= 70 ? 'כל הכבוד! 👏' : 'התחלה טובה, נסה שוב 💪'}</Text>
        <Text style={styles.sub}>שיא אישי: {best}%</Text>
        <TouchableOpacity style={styles.start} onPress={start}><Text style={styles.startText}>חידון חדש</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setQuiz(null)}><Text style={styles.link}>חזרה לבחירת נושא</Text></TouchableOpacity>
      </View>
    );
  }

  const q = quiz[qi];
  return (
    <View style={styles.wrap}>
      <View style={styles.meta}>
        <Text style={styles.metaText}>שאלה {qi + 1} מתוך {quiz.length}</Text>
        <Text style={styles.metaText}>ניקוד: {score}</Text>
      </View>
      <View style={styles.bar}><View style={[styles.barFill, { width: `${(qi / quiz.length) * 100}%` }]} /></View>
      <View style={styles.q}>
        <Text style={[styles.ask, dir === 'he2en' && { writingDirection: 'rtl' }]}>{q.ask}</Text>
        {dir === 'en2he' && (
          <TouchableOpacity onPress={() => speak(q.en)}><Text style={styles.link}>🔊 השמע</Text></TouchableOpacity>
        )}
        <Text style={styles.sub}>בחר את התרגום הנכון</Text>
      </View>
      <View style={styles.opts}>
        {q.options.map((o) => {
          const isRight = o === q.right;
          const show = picked != null;
          return (
            <TouchableOpacity key={o} disabled={show} onPress={() => choose(o)}
              style={[styles.opt, show && isRight && styles.good, show && picked === o && !isRight && styles.bad]}>
              <Text style={[styles.optText, dir === 'en2he' && { writingDirection: 'rtl' }]}>{o}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {picked != null && (
        <TouchableOpacity style={styles.start} onPress={next}>
          <Text style={styles.startText}>{qi === quiz.length - 1 ? 'לתוצאות' : 'לשאלה הבאה'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16, gap: 12 },
  title: { fontSize: 26, fontWeight: '800', color: colors.ink, textAlign: 'center' },
  sub: { color: colors.muted, textAlign: 'center', fontSize: 14 },
  big: { fontSize: 56, fontWeight: '800', color: colors.ink },
  link: { color: colors.accent, fontWeight: '700', textAlign: 'center', marginTop: 8 },
  dirRow: { flexDirection: 'row', gap: 8 },
  dir: { flex: 1, padding: 13, borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, alignItems: 'center' },
  dirOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  dirText: { fontWeight: '700', color: colors.ink },
  start: { backgroundColor: colors.accent, padding: 16, borderRadius: 14, alignItems: 'center', alignSelf: 'stretch', marginTop: 6 },
  startText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  metaText: { color: colors.muted },
  bar: { height: 6, backgroundColor: colors.line, borderRadius: 6, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: colors.accent },
  q: { backgroundColor: colors.card, borderRadius: radius, borderWidth: 1, borderColor: colors.line, padding: 24, alignItems: 'center', gap: 6 },
  ask: { fontSize: 34, fontWeight: '800', color: colors.ink, textAlign: 'center' },
  opts: { gap: 10 },
  opt: { backgroundColor: colors.card, borderWidth: 2, borderColor: colors.line, borderRadius: 14, padding: 16, alignItems: 'center' },
  optText: { fontSize: 19, fontWeight: '700', color: colors.ink, textAlign: 'center' },
  good: { borderColor: colors.good, backgroundColor: colors.goodSoft },
  bad: { borderColor: colors.bad, backgroundColor: colors.badSoft },
});
