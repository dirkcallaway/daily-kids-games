import type { GameMode, SimonAllStats, SimonModeStats } from '~/types/game'
import { createStatsStorage, recordWinStreak } from '~/utils/stats'

const STATS_KEY = 'simon-stats'

function defaultModeStats(): SimonModeStats {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    bestRound: 0,
    lastPlayedDate: null,
    lastWonDate: null,
  }
}

const storage = createStatsStorage<SimonAllStats>(STATS_KEY, () => ({
  normal: defaultModeStats(),
  hard: defaultModeStats(),
}))

export function useSimonStats() {
  function recordResult(mode: GameMode, won: boolean, roundReached: number, dateKey: string) {
    const stats = storage.load()
    const s = stats[mode]

    if (s.lastPlayedDate === dateKey) return

    s.gamesPlayed++
    s.lastPlayedDate = dateKey
    s.bestRound = Math.max(s.bestRound, roundReached)

    if (won) {
      s.gamesWon++
      recordWinStreak(s, dateKey)
    } else {
      s.currentStreak = 0
    }

    storage.save(stats)
  }

  function getStats(): SimonAllStats {
    return storage.load()
  }

  return { recordResult, getStats }
}
