import { EMOJI_PAIRS, COLOR_PAIRS, LETTER_PAIRS } from '~/data/memoryCards'
import type { MemoryCardType, MemoryCard } from '~/types/game'
import { getTodayKey, getDayIndex } from '~/utils/daily'
import { lcgRandom, seededShuffle } from '~/utils/random'

const CARD_TYPES: MemoryCardType[] = ['emoji', 'color', 'letter']

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
  const dateKey = getTodayKey()
  const dayIndex = getDayIndex(dateKey)
  const safeIndex = ((dayIndex % CARD_TYPES.length) + CARD_TYPES.length) % CARD_TYPES.length
  const cardType: MemoryCardType = CARD_TYPES[safeIndex]!

  const cards = buildDailyCards(dayIndex, cardType)

  return { cards, cardType, dateKey, dayIndex }
}
