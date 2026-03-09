import type { WordSearchStats } from '~/types/game'

const STATS_KEY = 'wordsearch-stats'

function defaultStats(): WordSearchStats {
  return {
    gamesPlayed: 0,
    currentStreak: 0,
    maxStreak: 0,
    bestTime: null,
    lastPlayedDate: null,
    lastWonDate: null,
  }
}

function loadStats(): WordSearchStats {
  try {
    const raw = localStorage.getItem(STATS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return defaultStats()
}

function saveStats(stats: WordSearchStats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats))
}

export function useWordSearchStats() {
  function recordResult(elapsedSeconds: number, dateKey: string) {
    const s = loadStats()

    if (s.lastPlayedDate === dateKey) return

    s.gamesPlayed++
    s.lastPlayedDate = dateKey

    if (s.bestTime === null || elapsedSeconds < s.bestTime) {
      s.bestTime = elapsedSeconds
    }

    const yesterday = new Date(dateKey)
    yesterday.setDate(yesterday.getDate() - 1)
    const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`

    s.currentStreak = s.lastWonDate === yKey ? s.currentStreak + 1 : 1
    s.maxStreak = Math.max(s.maxStreak, s.currentStreak)
    s.lastWonDate = dateKey

    saveStats(s)
  }

  function getStats(): WordSearchStats {
    return loadStats()
  }

  return { recordResult, getStats }
}
