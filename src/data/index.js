import vocabulary from './vocabulary.json';

export const categories = vocabulary.categories;

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
