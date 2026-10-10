import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { load, save } from './storage';
import { INTERVALS, dayNo } from './data';

const DEF = {
  known: {}, mistakes: {}, fav: {}, srs: {}, hist: {}, qs: { played: 0, correct: 0, total: 0 },
  xp: 0, streak: 0, lastDay: '', today: { day: '', count: 0 }, best: 0,
  theme: 'system', auto: false, haptics: true, rate: 0.85, heFirst: false, goal: 20,
};
const KEYS = ['known', 'mistakes', 'fav', 'srs', 'hist', 'qs', 'xp', 'streak', 'lastDay', 'today', 'best', 'goal'];
const Ctx = createContext(null);

const pad = (n) => String(n).padStart(2, '0');
export const iso = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const dayKey = (d = new Date()) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
const yesterday = () => dayKey(new Date(Date.now() - 864e5));

// Adds xp, counts one activity for today's goal and keeps the day streak.
function bump(p, xp) {
  const d = dayKey();
  const today = p.today.day === d ? p.today : { day: d, count: 0 };
  let streak = p.streak;
  if (p.lastDay !== d) streak = p.lastDay === yesterday() ? p.streak + 1 : 1;
  const hist = { ...p.hist, [iso()]: ((p.hist || {})[iso()] || 0) + 1 };
  const keys = Object.keys(hist).sort();
  while (keys.length > 60) delete hist[keys.shift()];
  return { ...p, xp: p.xp + xp, streak, lastDay: d, today: { day: d, count: today.count + 1 }, hist };
}

export function ProgressProvider({ children }) {
  const [s, setS] = useState(DEF);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    load('state_v2', DEF).then((v) => {
      const m = { ...DEF, ...v };
      if (v && v.theme === undefined && typeof v.dark === 'boolean') m.theme = v.dark ? 'dark' : 'light'; // migrate old setting
      setS(m); setReady(true);
    });
  }, []);

  const update = useCallback((fn) => setS((prev) => { const n = fn(prev); save('state_v2', n); return n; }), []);
  const award = useCallback((xp) => update((p) => bump(p, xp)), [update]);

  const markKnown = useCallback((id, yes) => update((p) => {
    const known = { ...p.known };
    if (yes) known[id] = true; else delete known[id];
    return { ...p, known };
  }), [update]);

  // One flashcard answer: updates "known", the review schedule and the xp in a single save.
  const review = useCallback((id, ok) => update((p) => {
    const c = p.srs[id];
    const box = ok ? Math.min((c ? c[0] : 0) + 1, 5) : 0;
    const known = { ...p.known }, mistakes = { ...p.mistakes };
    if (ok) { known[id] = true; delete mistakes[id]; } else delete known[id];
    return bump({ ...p, known, mistakes, srs: { ...p.srs, [id]: [box, dayNo() + INTERVALS[box]] } }, ok ? (p.known[id] ? 1 : 3) : 1);
  }), [update]);

  const toggleFav = useCallback((id) => update((p) => {
    const fav = { ...p.fav };
    if (fav[id]) delete fav[id]; else fav[id] = true;
    return { ...p, fav };
  }), [update]);

  const addMistake = useCallback((id) => update((p) => ({ ...p, mistakes: { ...p.mistakes, [id]: true } })), [update]);
  const clearMistake = useCallback((id) => update((p) => { const m = { ...p.mistakes }; delete m[id]; return { ...p, mistakes: m }; }), [update]);

  const exportData = useCallback(() => { const o = {}; KEYS.forEach((k) => { o[k] = s[k]; }); return JSON.stringify(o); }, [s]);
  const importData = useCallback((text) => {
    const o = JSON.parse(text);
    if (!o || typeof o !== 'object' || typeof o.known !== 'object' || o.known === null) throw new Error('bad');
    update((p) => { const n = { ...p }; KEYS.forEach((k) => { if (o[k] !== undefined) n[k] = o[k]; }); return n; });
  }, [update]);
  const reset = useCallback(() => update((p) => ({ ...DEF, theme: p.theme, auto: p.auto, haptics: p.haptics, rate: p.rate, heFirst: p.heFirst })), [update]);

  const activeStreak = s.lastDay === dayKey() || s.lastDay === yesterday() ? s.streak : 0;
  const todayCount = s.today.day === dayKey() ? s.today.count : 0;
  const level = Math.floor(s.xp / 100) + 1;
  const levelPct = (s.xp % 100) / 100;

  const value = { s, ready, update, award, markKnown, review, toggleFav, addMistake, clearMistake, exportData, importData, reset, streak: activeStreak, todayCount, level, levelPct };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const useProgress = () => useContext(Ctx);
