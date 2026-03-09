import { WORD_LIST } from '~/data/words'
import { buildWordSearchGrid } from '~/utils/wordSearchGrid'

const EPOCH = new Date('2026-04-01').getTime()
const WORDS_PER_PUZZLE = 5

function lcgRandom(seed: number) {
  let s = (seed >>> 0) || 1
  return () => {
    s = (1664525 * s + 1013904223) >>> 0
    return s / 0x100000000
  }
}

function seededShuffle<T>(arr: T[], rng: () => number): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    const temp = result[i] as T
    result[i] = result[j] as T
    result[j] = temp
  }
  return result
}

export function useWordSearchDay() {
  const now = new Date()
  const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const today = new Date(dateKey).getTime()
  const dayIndex = Math.floor((today - EPOCH) / 86400000)

  // Group words by theme
  const themeMap = new Map<string, typeof WORD_LIST>()
  for (const entry of WORD_LIST) {
    if (!themeMap.has(entry.theme)) themeMap.set(entry.theme, [])
    themeMap.get(entry.theme)!.push(entry)
  }

  // Filter to themes with enough words and sort for determinism
  const validThemes = [...themeMap.entries()]
    .filter(([, entries]) => entries.length >= WORDS_PER_PUZZLE)
    .map(([theme]) => theme)
    .sort()

  // Pick today's theme
  const themeIndex = ((dayIndex % validThemes.length) + validThemes.length) % validThemes.length
  const todayTheme = validThemes[themeIndex]!
  const themeWords = themeMap.get(todayTheme)!

  // Seeded-shuffle theme words and pick 5 (use dayIndex+1 for word selection)
  const wordRng = lcgRandom(Math.abs(dayIndex) + 1)
  const shuffled = seededShuffle(themeWords, wordRng)
  const selected = shuffled
    .filter(e => e.word.length <= 12)
    .slice(0, WORDS_PER_PUZZLE)

  const words = selected.map(e => e.word.toUpperCase())
  const clues = selected.map(e => e.clue)

  // Build grid with a different seed offset to decouple word selection from layout
  const { grid, placements } = buildWordSearchGrid(words, Math.abs(dayIndex) + 100)

  return { theme: todayTheme, words, clues, grid, placements, dateKey, dayIndex }
}
