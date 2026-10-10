import vocabulary from './vocabulary.json';

export const categories = vocabulary.categories;

// ids are "category:position", so new words must only be appended to the end of a category.
export const allWords = categories.flatMap((c) =>
  c.words.map((w, i) => ({ ...w, id: `${c.id}:${i}`, category: c.id, categoryName: c.name, emoji: c.emoji, color: c.color }))
);

export const wordsOf = (categoryId) =>
  categoryId === 'all' ? allWords : allWords.filter((w) => w.category === categoryId);

export const wordById = Object.fromEntries(allWords.map((w) => [w.id, w]));

export const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// ---- spaced repetition (Leitner boxes) ----
export const dayNo = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 6e4) / 864e5);
export const INTERVALS = [0, 1, 3, 7, 14, 30]; // days until next review, per box
export const isDue = (s, id) => !!(s.srs && s.srs[id] && s.srs[id][1] <= dayNo());

// Word pools, including the special ones that depend on saved progress.
export const poolOf = (cat, s) => {
  if (cat === 'fav') return allWords.filter((w) => s.fav && s.fav[w.id]);
  if (cat === 'mistakes') return allWords.filter((w) => s.mistakes && s.mistakes[w.id]);
  if (cat === 'due') {
    const due = allWords.filter((w) => isDue(s, w.id));
    const fresh = allWords.filter((w) => !(s.srs && s.srs[w.id]) && !s.known[w.id]).slice(0, 5);
    return [...due, ...fresh];
  }
  return wordsOf(cat);
};

const WOD_POOL = allWords.filter((w) => w.category !== 'body' && w.category !== 'phrases');
export const wordOfDay = () => WOD_POOL[dayNo() % WOD_POOL.length];
