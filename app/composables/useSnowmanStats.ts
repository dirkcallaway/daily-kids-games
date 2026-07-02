import type { SnowmanStats } from '~/types/game';
import { createStatsStorage, recordWinStreak } from '~/utils/stats';

const STATS_KEY = 'snowman-stats';

const storage = createStatsStorage<SnowmanStats>(STATS_KEY, () => ({
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  lastPlayedDate: null,
  lastWonDate: null,
}));

export function useSnowmanStats() {
  function recordResult(won: boolean, dateKey: string) {
    const stats = storage.load();

    if (stats.lastPlayedDate === dateKey) return;

    stats.gamesPlayed++;
    stats.lastPlayedDate = dateKey;

    if (won) {
      stats.gamesWon++;
      recordWinStreak(stats, dateKey);
    } else {
      stats.currentStreak = 0;
    }

    storage.save(stats);
  }

  function getStats(): SnowmanStats {
    return storage.load();
  }

  return { recordResult, getStats };
}
