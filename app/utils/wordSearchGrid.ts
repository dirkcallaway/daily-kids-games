import type { WordSearchCell, WordSearchPlacement, WordSearchDirection } from '~/types/game'

const GRID_SIZE = 12
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

const DIRECTION_DELTAS: Record<WordSearchDirection, [number, number]> = {
  right: [0, 1],
  left:  [0, -1],
  down:  [1, 0],
  up:    [-1, 0],
}

const ALL_DIRECTIONS: WordSearchDirection[] = ['right', 'left', 'down', 'up']

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

function makeEmptyGrid(): WordSearchCell[][] {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => ({ letter: '', wordIndices: [], isFound: false }))
  )
}

function canPlace(
  grid: WordSearchCell[][],
  word: string,
  startRow: number,
  startCol: number,
  direction: WordSearchDirection
): boolean {
  const [dRow, dCol] = DIRECTION_DELTAS[direction]
  for (let i = 0; i < word.length; i++) {
    const r = startRow + dRow * i
    const c = startCol + dCol * i
    const cell = grid[r]![c]!
    if (cell.letter !== '' && cell.letter !== word[i]) return false
  }
  return true
}

function doPlace(
  grid: WordSearchCell[][],
  word: string,
  wordIndex: number,
  startRow: number,
  startCol: number,
  direction: WordSearchDirection
): void {
  const [dRow, dCol] = DIRECTION_DELTAS[direction]
  for (let i = 0; i < word.length; i++) {
    const r = startRow + dRow * i
    const c = startCol + dCol * i
    const cell = grid[r]![c]!
    cell.letter = word[i]!
    if (!cell.wordIndices.includes(wordIndex)) {
      cell.wordIndices.push(wordIndex)
    }
  }
}

function generateCandidates(
  word: string,
  rng: () => number
): Array<{ row: number; col: number; direction: WordSearchDirection }> {
  const candidates: Array<{ row: number; col: number; direction: WordSearchDirection }> = []

  for (const direction of ALL_DIRECTIONS) {
    const [dRow, dCol] = DIRECTION_DELTAS[direction]
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const endR = r + dRow * (word.length - 1)
        const endC = c + dCol * (word.length - 1)
        if (endR < 0 || endR >= GRID_SIZE || endC < 0 || endC >= GRID_SIZE) continue
        candidates.push({ row: r, col: c, direction })
      }
    }
  }

  return seededShuffle(candidates, rng)
}

function bruteForcePlace(
  grid: WordSearchCell[][],
  word: string,
  wordIndex: number
): WordSearchPlacement | null {
  for (const direction of ALL_DIRECTIONS) {
    const [dRow, dCol] = DIRECTION_DELTAS[direction]
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const endR = r + dRow * (word.length - 1)
        const endC = c + dCol * (word.length - 1)
        if (endR < 0 || endR >= GRID_SIZE || endC < 0 || endC >= GRID_SIZE) continue
        if (canPlace(grid, word, r, c, direction)) {
          doPlace(grid, word, wordIndex, r, c, direction)
          return { word, row: r, col: c, direction }
        }
      }
    }
  }
  return null
}

export function buildWordSearchGrid(
  words: string[],
  seed: number
): { grid: WordSearchCell[][]; placements: WordSearchPlacement[] } {
  const grid = makeEmptyGrid()
  const placements: WordSearchPlacement[] = []
  const rng = lcgRandom(seed)

  // Sort longest-first so hardest-to-place words go in first
  const indexed = words.map((w, i) => ({ word: w, origIndex: i }))
  indexed.sort((a, b) => b.word.length - a.word.length)

  for (const { word, origIndex } of indexed) {
    if (word.length > GRID_SIZE) continue  // safety guard

    const candidates = generateCandidates(word, rng)
    let placed = false

    for (const { row, col, direction } of candidates) {
      if (canPlace(grid, word, row, col, direction)) {
        doPlace(grid, word, origIndex, row, col, direction)
        placements.push({ word, row, col, direction })
        placed = true
        break
      }
    }

    if (!placed) {
      const fallback = bruteForcePlace(grid, word, origIndex)
      if (fallback) placements.push(fallback)
    }
  }

  // Fill empty cells with random letters
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r]![c]!.letter === '') {
        grid[r]![c]!.letter = ALPHABET[Math.floor(rng() * 26)]!
      }
    }
  }

  return { grid, placements }
}

export { DIRECTION_DELTAS, ALL_DIRECTIONS }
