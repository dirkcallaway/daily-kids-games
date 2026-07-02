import type { AllStats, ModeStats, GameMode } from '~/types/game';
import { createStatsStorage, recordWinStreak } from '~/utils/stats';

const STATS_KEY = 'unscramble-stats';

function defaultModeStats(): ModeStats {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: {},
    lastWonDate: null,
    lastPlayedDate: null,
  };
}

const storage = createStatsStorage<AllStats>(STATS_KEY, () => ({
  normal: defaultModeStats(),
  hard: defaultModeStats(),
}));

export function useStats() {
  function recordResult(
    mode: GameMode,
    won: boolean,
    guessCount: number,
    dateKey: string,
  ) {
    const stats = storage.load();
    const s = stats[mode];

    // Guard against recording the same day twice
    if (s.lastPlayedDate === dateKey) return;

    s.gamesPlayed++;
    s.lastPlayedDate = dateKey;

    if (won) {
      s.gamesWon++;
      s.guessDistribution[guessCount] =
        (s.guessDistribution[guessCount] ?? 0) + 1;
      recordWinStreak(s, dateKey);
    } else {
      s.currentStreak = 0;
    }

    storage.save(stats);
  }

  function getStats(): AllStats {
    return storage.load();
  }

  return { recordResult, getStats };
}
