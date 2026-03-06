import { WORD_LIST } from '~/data/words';

const EPOCH = new Date('2026-04-01').getTime();

export function useWordOfDay() {
  const now = new Date();
  const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const today = new Date(dateKey).getTime();
  const dayIndex = Math.floor((today - EPOCH) / 86400000) % WORD_LIST.length;
  const safeIndex =
    ((dayIndex % WORD_LIST.length) + WORD_LIST.length) % WORD_LIST.length;

  const wordEntry = WORD_LIST[safeIndex]!;

  return { wordEntry, dateKey, dayIndex: safeIndex };
}
