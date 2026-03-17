import type { EmojiVar, EmojiEquation, EmojiOp, GameMode } from '~/types/game'
import { EMOJI_POOL } from '~/data/emojiPool'

const EPOCH = new Date('2026-04-01').getTime()

function lcgRandom(seed: number) {
  let state = (seed >>> 0) || 1
  return () => {
    state = (1664525 * state + 1013904223) >>> 0
    return state / 0x100000000
  }
}

function seededShuffle<T>(arr: T[], rng: () => number): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    const temp = result[i]!; result[i] = result[j]!; result[j] = temp
  }
  return result
}

function computeResult(a: number, op: EmojiOp, b: number): number {
  switch (op) {
    case '+': return a + b
    case '−': return a - b
    case '×': return a * b
    case '÷': return a / b
  }
}

function isValidResult(result: number): boolean {
  return Number.isInteger(result) && result > 0 && result <= 99
}

// Verify uniqueness by brute-force over [1..20] candidates
function hasUniqueSolution(emojis: EmojiVar[], equations: EmojiEquation[]): boolean {
  const n = emojis.length
  const range = Array.from({ length: 20 }, (_, i) => i + 1)
  let solutionCount = 0

  function check(candidate: number[]): boolean {
    return equations.every(eq =>
      computeResult(candidate[eq.aIdx]!, eq.op, candidate[eq.bIdx]!) === eq.result
    )
  }

  if (n === 2) {
    for (const a of range) {
      for (const b of range) {
        if (check([a, b])) {
          if (++solutionCount > 1) return false
        }
      }
    }
  } else {
    for (const a of range) {
      for (const b of range) {
        for (const c of range) {
          if (check([a, b, c])) {
            if (++solutionCount > 1) return false
          }
        }
      }
    }
  }

  return solutionCount === 1
}

export function generatePuzzle(dayIndex: number, mode: GameMode): {
  emojis: EmojiVar[]
  equations: EmojiEquation[]
} {
  const seed = Math.abs(dayIndex) + 1 + (mode === 'hard' ? 500000 : 0)
  const rng = lcgRandom(seed)

  const emojiCount = mode === 'normal' ? 2 : 3

  // Pick distinct emoji symbols
  const shuffledPool = seededShuffle([...EMOJI_POOL], rng)
  const symbols = shuffledPool.slice(0, emojiCount)

  // Pick distinct values from range (shuffle range, take first N)
  const valueMax = mode === 'normal' ? 12 : 10
  const valueRange = Array.from({ length: valueMax - 1 }, (_, i) => i + 2) // [2..valueMax]
  const shuffledValues = seededShuffle(valueRange, rng)
  const values = shuffledValues.slice(0, emojiCount)

  const emojis: EmojiVar[] = symbols.map((symbol, i) => ({ symbol, value: values[i]! }))

  if (mode === 'normal') {
    // Easy: + and − on the same pair → guaranteed unique solution
    const [a, b] = values as [number, number]
    const eq1: EmojiEquation = { aIdx: 0, bIdx: 1, op: '+', result: a + b }
    const eq2: EmojiEquation = a >= b
      ? { aIdx: 0, bIdx: 1, op: '−', result: a - b }
      : { aIdx: 1, bIdx: 0, op: '−', result: b - a }

    const equations = rng() > 0.5 ? [eq1, eq2] : [eq2, eq1]
    return { emojis, equations }
  }

  // Hard: 3 pairs (0,1), (1,2), (0,2), each gets a random valid op
  const pairs: [number, number][] = [[0, 1], [1, 2], [0, 2]]
  const allOps: EmojiOp[] = ['+', '−', '×', '÷']
  const equations: EmojiEquation[] = []

  for (const [aIdx, bIdx] of pairs) {
    const a = values[aIdx]!
    const b = values[bIdx]!
    const shuffledOps = seededShuffle([...allOps], rng)

    let placed = false
    for (const op of shuffledOps) {
      const result = computeResult(a, op, b)
      if (isValidResult(result)) {
        equations.push({ aIdx, bIdx, op, result })
        placed = true
        break
      }
      // For subtraction yielding negative, try reversed pair
      if (op === '−') {
        const revResult = b - a
        if (isValidResult(revResult)) {
          equations.push({ aIdx: bIdx, bIdx: aIdx, op, result: revResult })
          placed = true
          break
        }
      }
    }

    if (!placed) {
      equations.push({ aIdx, bIdx, op: '+', result: a + b })
    }
  }

  // Verify uniqueness; if multiple solutions exist, fall back to all-addition
  if (!hasUniqueSolution(emojis, equations)) {
    const [a, b, c] = values as [number, number, number]
    return {
      emojis,
      equations: [
        { aIdx: 0, bIdx: 1, op: '+', result: a + b },
        { aIdx: 1, bIdx: 2, op: '+', result: b + c },
        { aIdx: 0, bIdx: 2, op: '+', result: a + c },
      ],
    }
  }

  return { emojis, equations: seededShuffle(equations, rng) }
}

export function useEmojiMathDay(mode: GameMode) {
  const now = new Date()
  const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const today = new Date(dateKey).getTime()
  const dayIndex = Math.floor((today - EPOCH) / 86400000)

  const { emojis, equations } = generatePuzzle(dayIndex, mode)

  return { emojis, equations, dateKey, dayIndex }
}
