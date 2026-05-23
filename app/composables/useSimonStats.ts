import type { GameMode, SimonAllStats, SimonModeStats } from '~/types/game'

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

function loadStats(): SimonAllStats {
  try {
    const raw = localStorage.getItem(STATS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { normal: defaultModeStats(), hard: defaultModeStats() }
}

function saveStats(stats: SimonAllStats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats))
}

export function useSimonStats() {
  function recordResult(mode: GameMode, won: boolean, roundReached: number, dateKey: string) {
    const stats = loadStats()
    const s = stats[mode]

    if (s.lastPlayedDate === dateKey) return

    s.gamesPlayed++
    s.lastPlayedDate = dateKey
    s.bestRound = Math.max(s.bestRound, roundReached)

    if (won) {
      s.gamesWon++

      const [y, m, d] = dateKey.split('-').map(Number) as [number, number, number]
      const yesterday = new Date(y, m - 1, d - 1)
      const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`

      s.currentStreak = s.lastWonDate === yesterdayKey ? s.currentStreak + 1 : 1
      s.maxStreak = Math.max(s.maxStreak, s.currentStreak)
      s.lastWonDate = dateKey
    } else {
      s.currentStreak = 0
    }

    saveStats(stats)
  }

  function getStats(): SimonAllStats {
    return loadStats()
  }

  return { recordResult, getStats }
}
