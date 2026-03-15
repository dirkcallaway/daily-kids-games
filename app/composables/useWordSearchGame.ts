import { reactive } from 'vue'
import type { WordSearchGameState, WordSearchCell, WordSearchPlacement, WordSearchDirection } from '~/types/game'
import { useWordSearchStats } from '~/composables/useWordSearchStats'
import { DIRECTION_DELTAS } from '~/utils/wordSearchGrid'

const STATE_PREFIX = 'wordsearch-state'

function stateKey(dateKey: string): string {
  return `${STATE_PREFIX}-${dateKey}`
}

function buildFreshState(
  theme: string,
  words: string[],
  clues: string[],
  grid: WordSearchCell[][],
  placements: WordSearchPlacement[],
  dateKey: string
): WordSearchGameState {
  return {
    theme,
    words,
    clues,
    grid,
    placements,
    foundWords: [],
    selectStart: null,
    elapsedSeconds: 0,
    gameStatus: 'playing',
    dateKey,
    statsRecorded: false,
  }
}

const state = reactive<WordSearchGameState>(
  buildFreshState('', [], [], [], [], '')
)

let timerHandle: ReturnType<typeof setInterval> | null = null

export function useWordSearchGame() {
  const { recordResult } = useWordSearchStats()

  function initGame(
    theme: string,
    words: string[],
    clues: string[],
    grid: WordSearchCell[][],
    placements: WordSearchPlacement[],
    dateKey: string
  ) {
    // Clean stale state keys from prior days
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(STATE_PREFIX) && !key.includes(dateKey)) {
        localStorage.removeItem(key)
      }
    }

    const saved = localStorage.getItem(stateKey(dateKey))
    const loaded: WordSearchGameState = saved
      ? JSON.parse(saved)
      : buildFreshState(theme, words, clues, grid, placements, dateKey)

    Object.assign(state, loaded)

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

  function getDirection(
    r1: number, c1: number,
    r2: number, c2: number
  ): WordSearchDirection | null {
    if (r1 === r2 && c2 > c1) return 'right'
    if (r1 === r2 && c2 < c1) return 'left'
    if (c1 === c2 && r2 > r1) return 'down'
    if (c1 === c2 && r2 < r1) return 'up'
    return null
  }

  function extractWord(
    grid: WordSearchCell[][],
    startRow: number,
    startCol: number,
    direction: WordSearchDirection,
    endRow: number,
    endCol: number
  ): string {
    const [dRow, dCol] = DIRECTION_DELTAS[direction]
    let result = ''
    let r = startRow
    let c = startCol
    while (true) {
      result += grid[r]![c]!.letter
      if (r === endRow && c === endCol) break
      r += dRow
      c += dCol
      if (r < 0 || r >= state.grid.length || c < 0 || c >= (state.grid[0]?.length ?? 10)) break
    }
    return result
  }

  function reverseStr(s: string): string {
    return s.split('').reverse().join('')
  }

  function markFoundCells(placement: WordSearchPlacement) {
    const [dRow, dCol] = DIRECTION_DELTAS[placement.direction]
    for (let i = 0; i < placement.word.length; i++) {
      const r = placement.row + dRow * i
      const c = placement.col + dCol * i
      state.grid[r]![c]!.isFound = true
    }
  }

  function selectCell(row: number, col: number) {
    if (state.gameStatus !== 'playing') return

    if (state.selectStart === null) {
      // Start timer on very first tap
      if (state.elapsedSeconds === 0 && timerHandle === null) {
        startTimer()
      }
      state.selectStart = [row, col]
      saveState()
      return
    }

    const [startRow, startCol] = state.selectStart

    // Same cell tapped again — cancel selection
    if (startRow === row && startCol === col) {
      state.selectStart = null
      saveState()
      return
    }

    const direction = getDirection(startRow, startCol, row, col)

    if (direction === null) {
      // Not a straight line — treat this tap as new start
      state.selectStart = [row, col]
      saveState()
      return
    }

    const selectedWord = extractWord(state.grid, startRow, startCol, direction, row, col)
    const reversed = reverseStr(selectedWord)

    // Find a matching unfound word
    const match = state.words.find(w =>
      !state.foundWords.includes(w) && (selectedWord === w || reversed === w)
    )

    if (match) {
      // Validate against actual placement by computing the word's two endpoints
      // and checking that the player's selection connects them (in either order).
      // This handles all directions and palindromes without relying on oppositeDir.
      const placement = state.placements.find(p => {
        if (p.word !== match) return false
        const [dRow, dCol] = DIRECTION_DELTAS[p.direction]
        const wordEndRow = p.row + dRow * (p.word.length - 1)
        const wordEndCol = p.col + dCol * (p.word.length - 1)
        const forwardMatch  = startRow === p.row     && startCol === p.col     && row === wordEndRow && col === wordEndCol
        const backwardMatch = startRow === wordEndRow && startCol === wordEndCol && row === p.row     && col === p.col
        return forwardMatch || backwardMatch
      })

      if (placement) {
        state.foundWords.push(match)
        markFoundCells(placement)

        if (state.foundWords.length === state.words.length) {
          state.gameStatus = 'won'
          stopTimer()

          if (!state.statsRecorded) {
            recordResult(state.elapsedSeconds, state.dateKey)
            state.statsRecorded = true
          }
        }
      }
    }

    state.selectStart = null
    saveState()
  }

  return { state, initGame, selectCell, stopTimer }
}
