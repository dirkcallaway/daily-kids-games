import type { Tile } from '~/types/game'

function hashSeed(dateKey: string, word: string): number {
  const str = dateKey + word
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0
  }
  return hash
}

function lcgRandom(seed: number) {
  let state = seed
  return () => {
    state = (1664525 * state + 1013904223) >>> 0
    return state / 0x100000000
  }
}

function shuffleWithRange(arr: string[], rng: () => number): string[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    const temp = result[i] as string
    result[i] = result[j] as string
    result[j] = temp
  }
  return result
}

export function scrambleWord(word: string, dateKey: string): Tile[] {
  const letters = word.split('')
  const seed = hashSeed(dateKey, word)
  const rng = lcgRandom(seed)

  let shuffled = shuffleWithRange(letters, rng)

  // Ensure scramble never equals the original word
  let attempts = 0
  while (shuffled.join('') === word && attempts < 100) {
    shuffled = shuffleWithRange(shuffled, lcgRandom(seed + ++attempts))
  }

  return shuffled.map((letter, i) => ({
    id: `tile-${i}`,
    letter,
    isUsed: false,
  }))
}
