import type { HangmanStats } from '~/types/game';

const STATS_KEY = 'hangman-stats';

function defaultStats(): HangmanStats {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    lastPlayedDate: null,
    lastWonDate: null,
  };
}

function loadStats(): HangmanStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return defaultStats();
}

function saveStats(stats: HangmanStats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function useHangmanStats() {
  function recordResult(won: boolean, dateKey: string) {
    const stats = loadStats();

    if (stats.lastPlayedDate === dateKey) return;

    stats.gamesPlayed++;
    stats.lastPlayedDate = dateKey;

    if (won) {
      stats.gamesWon++;

      const yesterday = new Date(dateKey);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

      stats.currentStreak = stats.lastWonDate === yesterdayKey ? stats.currentStreak + 1 : 1;
      stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
      stats.lastWonDate = dateKey;
    } else {
      stats.currentStreak = 0;
    }

    saveStats(stats);
  }

  function getStats(): HangmanStats {
    return loadStats();
  }

  return { recordResult, getStats };
}
