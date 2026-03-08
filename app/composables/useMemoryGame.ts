import { reactive } from 'vue'
import type { MemoryCard, MemoryCardType, MemoryGameState } from '~/types/game'
import { useMemoryStats } from '~/composables/useMemoryStats'
import { buildReplayCards } from '~/composables/useMemoryDay'

const STATE_PREFIX = 'memory-state'

function stateKey(dateKey: string): string {
  return `${STATE_PREFIX}-${dateKey}`
}

function buildFreshState(cards: MemoryCard[], cardType: MemoryCardType, dateKey: string): MemoryGameState {
  return {
    cards,
    flippedIds: [],
    matchedPairKeys: [],
    moves: 0,
    elapsedSeconds: 0,
    gameStatus: 'playing',
    cardType,
    dateKey,
    statsRecorded: false,
    isReplaying: false,
    _replayCount: 0,
  }
}

const state = reactive<MemoryGameState>(
  buildFreshState([], 'emoji', '')
)

let timerHandle: ReturnType<typeof setInterval> | null = null
let checkMatchHandle: ReturnType<typeof setTimeout> | null = null

export function useMemoryGame() {
  const { recordResult } = useMemoryStats()

  function initGame(freshCards: MemoryCard[], cardType: MemoryCardType, dateKey: string) {
    // Clean up stale state keys from prior days
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(STATE_PREFIX) && !key.includes(dateKey)) {
        localStorage.removeItem(key)
      }
    }

    const saved = localStorage.getItem(stateKey(dateKey))
    const loaded: MemoryGameState = saved
      ? JSON.parse(saved)
      : buildFreshState(freshCards, cardType, dateKey)

    Object.assign(state, loaded)

    // If game was already won (loaded from storage), don't restart timer
    if (state.gameStatus === 'playing' && state.elapsedSeconds > 0) {
      startTimer()
    }
  }

  function saveState() {
    localStorage.setItem(stateKey(state.dateKey), JSON.stringify(state))
  }

  function startTimer() {
    if (timerHandle !== null) return
    timerHandle = setInterval(() => {
      state.elapsedSeconds++
      if (state.elapsedSeconds % 5 === 0) saveState()
    }, 1000)
  }

  function stopTimer() {
    if (timerHandle !== null) {
      clearInterval(timerHandle)
      timerHandle = null
    }
  }

  function flipCard(cardId: number) {
    if (state.gameStatus !== 'playing') return

    const card = state.cards.find(c => c.id === cardId)
    if (!card || card.isFlipped || card.isMatched) return
    if (state.flippedIds.length >= 2) return

    // Start timer on very first flip
    if (state.elapsedSeconds === 0 && timerHandle === null) {
      startTimer()
    }

    card.isFlipped = true
    state.flippedIds.push(cardId)

    if (state.flippedIds.length === 2) {
      // Prevent further clicks while evaluating the pair
      checkMatchHandle = setTimeout(() => {
        checkMatch()
        checkMatchHandle = null
      }, 800)
    }
  }

  function checkMatch() {
    if (state.flippedIds.length !== 2) return

    const [idA, idB] = state.flippedIds as [number, number]
    const cardA = state.cards.find(c => c.id === idA)!
    const cardB = state.cards.find(c => c.id === idB)!

    state.moves++

    if (cardA.face.pairKey === cardB.face.pairKey) {
      cardA.isMatched = true
      cardB.isMatched = true
      state.matchedPairKeys.push(cardA.face.pairKey)
      state.flippedIds = []

      if (state.matchedPairKeys.length === 10) {
        state.gameStatus = 'won'
        stopTimer()

        if (!state.statsRecorded) {
          recordResult(state.elapsedSeconds, state.dateKey)
          state.statsRecorded = true
        }
      }
    } else {
      cardA.isFlipped = false
      cardB.isFlipped = false
      state.flippedIds = []
    }

    saveState()
  }

  function replay() {
    stopTimer()
    if (checkMatchHandle !== null) {
      clearTimeout(checkMatchHandle)
      checkMatchHandle = null
    }

    const nextReplayCount = state._replayCount + 1
    const newCards = buildReplayCards(
      // Use a stable numeric seed derived from dateKey
      hashDateKey(state.dateKey),
      state.cardType,
      nextReplayCount
    )

    Object.assign(state, {
      cards: newCards,
      flippedIds: [],
      matchedPairKeys: [],
      moves: 0,
      elapsedSeconds: 0,
      gameStatus: 'playing',
      isReplaying: true,
      _replayCount: nextReplayCount,
      // statsRecorded intentionally NOT reset
    })

    saveState()
  }

  return { state, initGame, flipCard, replay, stopTimer }
}

// Derive a numeric seed from a YYYY-MM-DD string
function hashDateKey(dateKey: string): number {
  let hash = 0
  for (let i = 0; i < dateKey.length; i++) {
    hash = (hash * 31 + dateKey.charCodeAt(i)) >>> 0
  }
  return hash
}
