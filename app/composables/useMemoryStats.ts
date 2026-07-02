import type { MemoryStats } from '~/types/game'
import { createStatsStorage, recordWinStreak } from '~/utils/stats'

const STATS_KEY = 'memory-stats'

const storage = createStatsStorage<MemoryStats>(STATS_KEY, () => ({
  gamesPlayed: 0,
  currentStreak: 0,
  maxStreak: 0,
  bestTime: null,
  totalTime: 0,
  lastPlayedDate: null,
  lastWonDate: null,
}))

export function useMemoryStats() {
  function recordResult(elapsedSeconds: number, dateKey: string) {
    const s = storage.load()

    if (s.lastPlayedDate === dateKey) return

    s.gamesPlayed++
    s.lastPlayedDate = dateKey
    s.totalTime += elapsedSeconds

    if (s.bestTime === null || elapsedSeconds < s.bestTime) {
      s.bestTime = elapsedSeconds
    }

    recordWinStreak(s, dateKey)

    storage.save(s)
  }

  function getStats(): MemoryStats {
    return storage.load()
  }

  function getAverageTime(): number | null {
    const s = storage.load()
    if (s.gamesPlayed === 0) return null
    return Math.round(s.totalTime / s.gamesPlayed)
  }

  return { recordResult, getStats, getAverageTime }
}
