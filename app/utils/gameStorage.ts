// Shared persistence helpers for daily game state in localStorage.

/** Remove persisted daily-state entries under prefix that aren't for the given day. */
export function cleanOldDailyStates(prefix: string, dateKey: string) {
  const stale: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith(prefix) && !key.includes(dateKey)) stale.push(key)
  }
  stale.forEach(k => localStorage.removeItem(k))
}

/** Parse a JSON localStorage entry, or null if missing or corrupted. */
export function loadJSON<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

export function saveJSON(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}
