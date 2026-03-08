import type { MemoryStats } from '~/types/game'

const STATS_KEY = 'memory-stats'

function defaultStats(): MemoryStats {
  return {
    gamesPlayed: 0,
    currentStreak: 0,
    maxStreak: 0,
    bestTime: null,
    totalTime: 0,
    lastPlayedDate: null,
    lastWonDate: null,
  }
}

function loadStats(): MemoryStats {
  try {
    const raw = localStorage.getItem(STATS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return defaultStats()
}

function saveStats(stats: MemoryStats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats))
}

export function useMemoryStats() {
  function recordResult(elapsedSeconds: number, dateKey: string) {
    const s = loadStats()

    if (s.lastPlayedDate === dateKey) return

    s.gamesPlayed++
    s.lastPlayedDate = dateKey
    s.totalTime += elapsedSeconds

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

  function getStats(): MemoryStats {
    return loadStats()
  }

  function getAverageTime(): number | null {
    const s = loadStats()
    if (s.gamesPlayed === 0) return null
    return Math.round(s.totalTime / s.gamesPlayed)
  }

  return { recordResult, getStats, getAverageTime }
}
