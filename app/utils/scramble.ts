import type { Tile } from '~/types/game'
import { lcgRandom, seededShuffle } from '~/utils/random'

function hashSeed(dateKey: string, word: string): number {
  const str = dateKey + word
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0
  }
  return hash
}

export function scrambleWord(word: string, dateKey: string): Tile[] {
  const letters = word.split('')
  const seed = hashSeed(dateKey, word)
  const rng = lcgRandom(seed)

  let shuffled = seededShuffle(letters, rng)

  // Ensure scramble never equals the original word
  let attempts = 0
  while (shuffled.join('') === word && attempts < 100) {
    shuffled = seededShuffle(shuffled, lcgRandom(seed + ++attempts))
  }

  return shuffled.map((letter, i) => ({
    id: `tile-${i}`,
    letter,
    isUsed: false,
  }))
}
