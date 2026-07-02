import { reactive } from 'vue'
import type { EmojiVar, EmojiEquation, EmojiMathGameState, GameMode } from '~/types/game'
import { cleanOldDailyStates, loadJSON, saveJSON } from '~/utils/gameStorage'
import { useEmojiMathStats } from '~/composables/useEmojiMathStats'

const STATE_PREFIX = 'emojimath-state'
const MAX_GUESSES = 5

function stateKey(dateKey: string, mode: GameMode): string {
  return `${STATE_PREFIX}-${dateKey}-${mode}`
}

function buildFreshState(
  emojis: EmojiVar[],
  equations: EmojiEquation[],
  dateKey: string,
  mode: GameMode,
): EmojiMathGameState {
  return {
    dateKey,
    mode,
    emojis,
    equations,
    guesses: [],
    currentValues: new Array(emojis.length).fill(null),
    gameStatus: 'playing',
    hintUsed: false,
    hintIndex: null,
    statsRecorded: false,
  }
}

const state = reactive<EmojiMathGameState>(
  buildFreshState([], [], '', 'normal')
)

export function useEmojiMathGame() {
  const { recordResult } = useEmojiMathStats()

  function initGame(
    mode: GameMode,
    emojis: EmojiVar[],
    equations: EmojiEquation[],
    dateKey: string,
  ) {
    cleanOldDailyStates(STATE_PREFIX, dateKey)
    const loaded = loadJSON<EmojiMathGameState>(stateKey(dateKey, mode))
    Object.assign(state, loaded ?? buildFreshState(emojis, equations, dateKey, mode))
  }

  function saveState() {
    saveJSON(stateKey(state.dateKey, state.mode), state)
  }

  function setCurrentValue(emojiIdx: number, value: number | null) {
    if (state.gameStatus !== 'playing') return
    // Don't allow overwriting a hinted value
    if (state.hintIndex === emojiIdx) return
    state.currentValues[emojiIdx] = value
  }

  function submitGuess() {
    if (state.gameStatus !== 'playing') return
    if (state.currentValues.some(v => v === null)) return

    const values = state.currentValues as number[]
    const feedback = values.map((v, i) => v === state.emojis[i]!.value ? 'correct' : 'wrong') as ('correct' | 'wrong')[]

    state.guesses.push({ values: [...values], feedback })

    const won = feedback.every(f => f === 'correct')

    if (won) {
      state.gameStatus = 'won'
      if (!state.statsRecorded) {
        recordResult(state.mode, true, state.guesses.length, state.dateKey)
        state.statsRecorded = true
      }
    } else if (state.guesses.length >= MAX_GUESSES) {
      state.gameStatus = 'lost'
      if (!state.statsRecorded) {
        recordResult(state.mode, false, state.guesses.length, state.dateKey)
        state.statsRecorded = true
      }
    } else {
      // Reset inputs for next attempt, but keep hint value locked
      const next = new Array(state.emojis.length).fill(null)
      if (state.hintIndex !== null) {
        next[state.hintIndex] = state.emojis[state.hintIndex]!.value
      }
      state.currentValues = next
    }

    saveState()
  }

  function useHint() {
    if (state.hintUsed || state.gameStatus !== 'playing') return

    // Pick an emoji that hasn't been correctly identified in the last guess
    const lastGuess = state.guesses.at(-1)
    let candidateIndices = state.emojis.map((_, i) => i)

    if (lastGuess) {
      // Prefer revealing one the player got wrong last time
      const wrongIndices = lastGuess.feedback
        .map((f, i) => f === 'wrong' ? i : -1)
        .filter(i => i !== -1)
      if (wrongIndices.length > 0) candidateIndices = wrongIndices
    }

    // Pick the first candidate (deterministic, not random, so hint is consistent on reload)
    const hintIdx = candidateIndices[0]!

    state.hintUsed = true
    state.hintIndex = hintIdx
    state.currentValues[hintIdx] = state.emojis[hintIdx]!.value

    saveState()
  }

  return { state, initGame, setCurrentValue, submitGuess, useHint, MAX_GUESSES }
}
