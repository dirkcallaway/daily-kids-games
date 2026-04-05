import type { SnowmanStats } from '~/types/game';

const STATS_KEY = 'snowman-stats';

function defaultStats(): SnowmanStats {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    lastPlayedDate: null,
    lastWonDate: null,
  };
}

function loadStats(): SnowmanStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return defaultStats();
}

function saveStats(stats: SnowmanStats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function useSnowmanStats() {
  function recordResult(won: boolean, dateKey: string) {
    const stats = loadStats();

    if (stats.lastPlayedDate === dateKey) return;

    stats.gamesPlayed++;
    stats.lastPlayedDate = dateKey;

    if (won) {
      stats.gamesWon++;

      const [y, m, d] = dateKey.split('-').map(Number) as [number, number, number];
      const yesterday = new Date(y, m - 1, d - 1);
      const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

      stats.currentStreak = stats.lastWonDate === yesterdayKey ? stats.currentStreak + 1 : 1;
      stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
      stats.lastWonDate = dateKey;
    } else {
      stats.currentStreak = 0;
    }

    saveStats(stats);
  }

  function getStats(): SnowmanStats {
    return loadStats();
  }

  return { recordResult, getStats };
}
