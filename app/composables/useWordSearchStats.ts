import type { WordSearchStats } from '~/types/game'
import { createStatsStorage, recordWinStreak } from '~/utils/stats'

const STATS_KEY = 'wordsearch-stats'

const storage = createStatsStorage<WordSearchStats>(STATS_KEY, () => ({
  gamesPlayed: 0,
  currentStreak: 0,
  maxStreak: 0,
  bestTime: null,
  lastPlayedDate: null,
  lastWonDate: null,
}))

export function useWordSearchStats() {
  function recordResult(elapsedSeconds: number, dateKey: string) {
    const s = storage.load()

    if (s.lastPlayedDate === dateKey) return

    s.gamesPlayed++
    s.lastPlayedDate = dateKey

    if (s.bestTime === null || elapsedSeconds < s.bestTime) {
      s.bestTime = elapsedSeconds
    }

    recordWinStreak(s, dateKey)

    storage.save(s)
  }

  function getStats(): WordSearchStats {
    return storage.load()
  }

  return { recordResult, getStats }
}
