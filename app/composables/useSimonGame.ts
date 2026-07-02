import type { GameMode, SimonColor, SimonGameState } from '~/types/game'
import { cleanOldDailyStates, loadJSON, saveJSON } from '~/utils/gameStorage'
import { getDayIndex } from '~/utils/daily'
import { useSimonStats } from '~/composables/useSimonStats'

const NORMAL_LENGTH = 8
const HARD_LENGTH = 10
const NORMAL_LIVES = 3
const HARD_LIVES = 1
const SPEED = {
  normal: { startFlash: 600, decayFlash: 20, floorFlash: 320, startGap: 250, decayGap: 10, floorGap: 150 },
  hard:   { startFlash: 450, decayFlash: 30, floorFlash: 200, startGap: 250, decayGap: 15, floorGap: 120 },
}

function getFlashMs(round: number, mode: GameMode): number {
  const s = SPEED[mode]
  return Math.max(s.floorFlash, s.startFlash - (round - 1) * s.decayFlash)
}

function getGapMs(round: number, mode: GameMode): number {
  const s = SPEED[mode]
  return Math.max(s.floorGap, s.startGap - (round - 1) * s.decayGap)
}

const STATE_PREFIX = 'simon-state-'

const COLOR_FREQS: Record<number, number> = {
  0: 220,
  1: 277,
  2: 330,
  3: 392,
}

function stateKey(dateKey: string, mode: GameMode) {
  return `${STATE_PREFIX}${dateKey}-${mode}`
}

function generateSequence(dayIndex: number, length: number, mode: GameMode): SimonColor[] {
  const modeOffset = mode === 'hard' ? 500000 : 0
  let seed = (dayIndex + modeOffset) >>> 0
  seed = (Math.imul(seed ^ (seed >>> 16), 0x45d9f3b)) >>> 0
  seed = (Math.imul(seed ^ (seed >>> 16), 0x45d9f3b)) >>> 0
  seed = (seed ^ (seed >>> 16)) >>> 0

  // mulberry32 PRNG — its output is well-distributed across ALL bits.
  // (A plain LCG's low 2 bits are near-cyclic, so `seed % 4` produced a
  // predictable staircase pattern that made sequences feel repetitive.)
  let a = seed
  const rand = () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  // Draw from the top of the [0,1) range and avoid three of the same color
  // in a row, so patterns stay varied without a fixed cycle.
  const seq: SimonColor[] = []
  for (let i = 0; i < length; i++) {
    let color = Math.floor(rand() * 4) as SimonColor
    if (i >= 2 && seq[i - 1] === seq[i - 2] && seq[i - 1] === color) {
      color = ((color + 1) % 4) as SimonColor
    }
    seq.push(color)
  }
  return seq
}

let audioCtx: AudioContext | null = null

function getAudioCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume()
    }
    return audioCtx
  } catch {
    return null
  }
}

function playTone(color: SimonColor, duration = 0.35, muted = false) {
  if (muted) return
  const ctx = getAudioCtx()
  if (!ctx) return
  try {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = COLOR_FREQS[color]!
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    osc.start()
    osc.stop(ctx.currentTime + duration)
  } catch {}
}

function playWrongTone(muted = false) {
  if (muted) return
  const ctx = getAudioCtx()
  if (!ctx) return
  try {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 150
    osc.type = 'sawtooth'
    gain.gain.setValueAtTime(0.25, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
    osc.start()
    osc.stop(ctx.currentTime + 0.4)
  } catch {}
}

export function useSimonGame() {
  const { recordResult } = useSimonStats()

  const muted = ref(false)

  const state = reactive<SimonGameState>({
    dateKey: '',
    mode: 'normal',
    currentRound: 1,
    livesLeft: NORMAL_LIVES,
    gameStatus: 'idle',
    statsRecorded: false,
  })

  const activeColor = ref<SimonColor | null>(null)
  const inputIndex = ref(0)
  const wrongFlash = ref(false)

  let sequence: SimonColor[] = []
  let sequenceLength = NORMAL_LENGTH

  const sequenceLengthComputed = computed(() =>
    state.mode === 'hard' ? HARD_LENGTH : NORMAL_LENGTH
  )

  function persist() {
    saveJSON(stateKey(state.dateKey, state.mode), {
      dateKey: state.dateKey,
      mode: state.mode,
      currentRound: state.currentRound,
      livesLeft: state.livesLeft,
      gameStatus: state.gameStatus,
      statsRecorded: state.statsRecorded,
    })
  }

  function initGame(dateKey: string, mode: GameMode) {
    cleanOldDailyStates(STATE_PREFIX, dateKey)

    state.dateKey = dateKey
    state.mode = mode
    sequenceLength = mode === 'hard' ? HARD_LENGTH : NORMAL_LENGTH
    sequence = generateSequence(getDayIndex(dateKey), sequenceLength, mode)

    const parsed = loadJSON<SimonGameState>(stateKey(dateKey, mode))
    if (parsed) {
      state.currentRound = parsed.currentRound
      state.livesLeft = parsed.livesLeft
      state.gameStatus = parsed.gameStatus === 'playing_sequence' || parsed.gameStatus === 'awaiting_input'
        ? 'idle'
        : parsed.gameStatus
      state.statsRecorded = parsed.statsRecorded
      return
    }

    state.currentRound = 1
    state.livesLeft = mode === 'hard' ? HARD_LIVES : NORMAL_LIVES
    state.gameStatus = 'idle'
    state.statsRecorded = false
    persist()
  }

  async function playSequence() {
    if (state.gameStatus === 'won' || state.gameStatus === 'lost') return
    state.gameStatus = 'playing_sequence'
    inputIndex.value = 0

    await delay(400)

    const flashMs = getFlashMs(state.currentRound, state.mode)

    for (let i = 0; i < state.currentRound; i++) {
      const color = sequence[i]!
      activeColor.value = color
      playTone(color, flashMs / 1000, muted.value)
      await delay(flashMs)
      activeColor.value = null
      await delay(getGapMs(state.currentRound, state.mode))
    }

    state.gameStatus = 'awaiting_input'
  }

  async function handleInput(color: SimonColor) {
    if (state.gameStatus !== 'awaiting_input') return

    playTone(color, 0.25, muted.value)
    activeColor.value = color
    await delay(180)
    activeColor.value = null

    if (color === sequence[inputIndex.value]) {
      inputIndex.value++

      if (inputIndex.value === state.currentRound) {
        if (state.currentRound === sequenceLength) {
          state.gameStatus = 'won'
          if (!state.statsRecorded) {
            recordResult(state.mode, true, state.currentRound, state.dateKey)
            state.statsRecorded = true
          }
          persist()
        } else {
          state.currentRound++
          persist()
          await delay(600)
          await playSequence()
        }
      }
    } else {
      wrongFlash.value = true
      playWrongTone(muted.value)
      await delay(300)
      wrongFlash.value = false

      state.livesLeft--

      if (state.livesLeft === 0) {
        state.gameStatus = 'lost'
        if (!state.statsRecorded) {
          recordResult(state.mode, false, state.currentRound, state.dateKey)
          state.statsRecorded = true
        }
        persist()
      } else {
        persist()
        await delay(800)
        await playSequence()
      }
    }
  }

  function toggleMute() {
    muted.value = !muted.value
    localStorage.setItem('simon-mute', String(muted.value))
  }

  function loadMutePreference() {
    muted.value = localStorage.getItem('simon-mute') === 'true'
  }

  return {
    state,
    activeColor,
    wrongFlash,
    inputIndex,
    sequenceLengthComputed,
    muted,
    initGame,
    playSequence,
    handleInput,
    toggleMute,
    loadMutePreference,
  }
}

function delay(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}
