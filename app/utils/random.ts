// Shared seeded PRNG helpers so daily puzzle generation stays deterministic
// (same puzzle for every player on a given day).

/** Linear congruential generator returning floats in [0, 1). */
export function lcgRandom(seed: number): () => number {
  let s = (seed >>> 0) || 1
  return () => {
    s = (1664525 * s + 1013904223) >>> 0
    return s / 0x100000000
  }
}

/** Fisher–Yates shuffle driven by a seeded rng; returns a new array. */
export function seededShuffle<T>(arr: T[], rng: () => number): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    const temp = result[i] as T
    result[i] = result[j] as T
    result[j] = temp
  }
  return result
}
