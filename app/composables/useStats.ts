import type { AllStats, ModeStats, GameMode } from '~/types/game';

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

function loadStats(): AllStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { normal: defaultModeStats(), hard: defaultModeStats() };
}

function saveStats(stats: AllStats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function useStats() {
  function recordResult(
    mode: GameMode,
    won: boolean,
    guessCount: number,
    dateKey: string,
  ) {
    const stats = loadStats();
    const s = stats[mode];

    // Guard against recording the same day twice
    if (s.lastPlayedDate === dateKey) return;

    s.gamesPlayed++;
    s.lastPlayedDate = dateKey;

    if (won) {
      s.gamesWon++;
      s.guessDistribution[guessCount] =
        (s.guessDistribution[guessCount] ?? 0) + 1;

      const yesterday = new Date(dateKey);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

      s.currentStreak =
        s.lastWonDate === yesterdayKey ? s.currentStreak + 1 : 1;
      s.maxStreak = Math.max(s.maxStreak, s.currentStreak);
      s.lastWonDate = dateKey;
    } else {
      s.currentStreak = 0;
    }

    saveStats(stats);
  }

  function getStats(): AllStats {
    return loadStats();
  }

  return { recordResult, getStats };
}
