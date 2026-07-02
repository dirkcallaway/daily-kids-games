// Shared date helpers for the daily puzzle cycle.

export const DAILY_EPOCH = new Date('2026-04-01').getTime()

/** Local calendar date as YYYY-MM-DD — the key for "today's" puzzle. */
export function getTodayKey(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

/** Whole days since the puzzle epoch for a YYYY-MM-DD key. */
export function getDayIndex(dateKey: string): number {
  return Math.floor((new Date(dateKey).getTime() - DAILY_EPOCH) / 86400000)
}

/** The YYYY-MM-DD key for the day before the given key. */
export function getYesterdayKey(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number) as [number, number, number]
  const yesterday = new Date(y, m - 1, d - 1)
  return `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`
}
