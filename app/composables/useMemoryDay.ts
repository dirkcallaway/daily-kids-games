import { EMOJI_PAIRS, COLOR_PAIRS, LETTER_PAIRS } from '~/data/memoryCards'
import type { MemoryCardType, MemoryCard } from '~/types/game'

const EPOCH = new Date('2026-04-01').getTime()
const CARD_TYPES: MemoryCardType[] = ['emoji', 'color', 'letter']

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
    const temp = result[i] as T
    result[i] = result[j] as T
    result[j] = temp
  }
  return result
}

export function buildDailyCards(dayIndex: number, cardType: MemoryCardType): MemoryCard[] {
  const pairs =
    cardType === 'emoji' ? EMOJI_PAIRS
    : cardType === 'color' ? COLOR_PAIRS
    : LETTER_PAIRS

  const flat: Array<{ pairKey: string; value: string }> = []
  for (const pair of pairs) {
    flat.push({ pairKey: pair.pairKey, value: pair.valueA })
    flat.push({ pairKey: pair.pairKey, value: pair.valueB })
  }

  // Use raw dayIndex (not safeIndex) so shuffle is unique every calendar day
  const rng = lcgRandom(Math.abs(dayIndex) + 1)
  const shuffled = seededShuffle(flat, rng)

  return shuffled.map((item, i) => ({
    id: i,
    face: { value: item.value, pairKey: item.pairKey },
    cardType,
    isFlipped: false,
    isMatched: false,
  }))
}

export function buildReplayCards(dayIndex: number, cardType: MemoryCardType, replayCount: number): MemoryCard[] {
  const pairs =
    cardType === 'emoji' ? EMOJI_PAIRS
    : cardType === 'color' ? COLOR_PAIRS
    : LETTER_PAIRS

  const flat: Array<{ pairKey: string; value: string }> = []
  for (const pair of pairs) {
    flat.push({ pairKey: pair.pairKey, value: pair.valueA })
    flat.push({ pairKey: pair.pairKey, value: pair.valueB })
  }

  const rng = lcgRandom(Math.abs(dayIndex) + 1 + replayCount * 1000)
  const shuffled = seededShuffle(flat, rng)

  return shuffled.map((item, i) => ({
    id: i,
    face: { value: item.value, pairKey: item.pairKey },
    cardType,
    isFlipped: false,
    isMatched: false,
  }))
}

export function useMemoryDay() {
  const now = new Date()
  const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const today = new Date(dateKey).getTime()

  const dayIndex = Math.floor((today - EPOCH) / 86400000)
  const safeIndex = ((dayIndex % CARD_TYPES.length) + CARD_TYPES.length) % CARD_TYPES.length
  const cardType: MemoryCardType = CARD_TYPES[safeIndex]!

  const cards = buildDailyCards(dayIndex, cardType)

  return { cards, cardType, dateKey, dayIndex }
}
