import { WORD_LIST } from '~/data/words'
import { buildWordSearchGrid, GRID_SIZE } from '~/utils/wordSearchGrid'
import { getTodayKey, getDayIndex } from '~/utils/daily'
import { lcgRandom, seededShuffle } from '~/utils/random'

const WORDS_PER_PUZZLE = 5

export function useWordSearchDay() {
  const dateKey = getTodayKey()
  const dayIndex = getDayIndex(dateKey)

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
    .filter(e => e.word.length <= GRID_SIZE)
    .slice(0, WORDS_PER_PUZZLE)

  const words = selected.map(e => e.word.toUpperCase())
  const clues = selected.map(e => e.clue)

  // Build grid with a different seed offset to decouple word selection from layout
  const { grid, placements } = buildWordSearchGrid(words, Math.abs(dayIndex) + 100)

  return { theme: todayTheme, words, clues, grid, placements, dateKey, dayIndex }
}
