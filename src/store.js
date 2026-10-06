import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { load, save } from './storage';

const DEF = { known: {}, mistakes: {}, xp: 0, streak: 0, lastDay: '', today: { day: '', count: 0 }, best: 0, dark: false, auto: false, goal: 20 };
const Ctx = createContext(null);

const dayKey = (d = new Date()) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
const yesterday = () => dayKey(new Date(Date.now() - 864e5));

export function ProgressProvider({ children }) {
  const [s, setS] = useState(DEF);
  const [ready, setReady] = useState(false);

  useEffect(() => { load('state_v2', DEF).then((v) => { setS({ ...DEF, ...v }); setReady(true); }); }, []);

  const update = useCallback((fn) => setS((prev) => { const n = fn(prev); save('state_v2', n); return n; }), []);

  const award = useCallback((xp) => update((p) => {
    const d = dayKey();
    const today = p.today.day === d ? p.today : { day: d, count: 0 };
    let streak = p.streak;
    if (p.lastDay !== d) streak = p.lastDay === yesterday() ? p.streak + 1 : 1;
    return { ...p, xp: p.xp + xp, streak, lastDay: d, today: { day: d, count: today.count + 1 } };
  }), [update]);

  const markKnown = useCallback((id, yes) => update((p) => {
    const known = { ...p.known };
    if (yes) known[id] = true; else delete known[id];
    return { ...p, known };
  }), [update]);

  const addMistake = useCallback((id) => update((p) => ({ ...p, mistakes: { ...p.mistakes, [id]: true } })), [update]);
  const clearMistake = useCallback((id) => update((p) => { const m = { ...p.mistakes }; delete m[id]; return { ...p, mistakes: m }; }), [update]);

  const activeStreak = s.lastDay === dayKey() || s.lastDay === yesterday() ? s.streak : 0;
  const todayCount = s.today.day === dayKey() ? s.today.count : 0;
  const level = Math.floor(s.xp / 100) + 1;
  const levelPct = (s.xp % 100) / 100;

  const value = { s, ready, update, award, markKnown, addMistake, clearMistake, streak: activeStreak, todayCount, level, levelPct };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const useProgress = () => useContext(Ctx);
