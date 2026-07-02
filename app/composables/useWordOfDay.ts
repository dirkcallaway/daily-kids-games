import { WORD_LIST } from '~/data/words';
import { getTodayKey, getDayIndex } from '~/utils/daily';

export function useWordOfDay(offset = 0) {
  const dateKey = getTodayKey();
  const dayIndex = getDayIndex(dateKey) % WORD_LIST.length;
  const safeIndex =
    ((dayIndex + offset) % WORD_LIST.length + WORD_LIST.length) % WORD_LIST.length;

  const wordEntry = WORD_LIST[safeIndex]!;

  return { wordEntry, dateKey, dayIndex: safeIndex };
}
