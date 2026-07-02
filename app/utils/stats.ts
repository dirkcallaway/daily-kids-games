// Shared building blocks for the per-game stats stores.
import { getYesterdayKey } from '~/utils/daily'

/** localStorage-backed store for a stats object, guarded against corruption. */
export function createStatsStorage<T>(key: string, defaults: () => T) {
  function load(): T {
    try {
      const raw = localStorage.getItem(key)
      if (raw) return JSON.parse(raw)
    } catch {}
    return defaults()
  }
  function save(stats: T) {
    localStorage.setItem(key, JSON.stringify(stats))
  }
  return { load, save }
}

interface StreakFields {
  currentStreak: number
  maxStreak: number
  lastWonDate: string | null
}

/** Extend (or restart) the daily win streak for a win on dateKey. */
export function recordWinStreak(s: StreakFields, dateKey: string) {
  s.currentStreak = s.lastWonDate === getYesterdayKey(dateKey) ? s.currentStreak + 1 : 1
  s.maxStreak = Math.max(s.maxStreak, s.currentStreak)
  s.lastWonDate = dateKey
}
