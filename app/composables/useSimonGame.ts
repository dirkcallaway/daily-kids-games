import type { GameMode, SimonColor, SimonGameState } from '~/types/game'
import { useSimonStats } from '~/composables/useSimonStats'

const EPOCH = new Date('2026-04-01').getTime()

const NORMAL_LENGTH = 8
const HARD_LENGTH = 10
const NORMAL_LIVES = 3
const HARD_LIVES = 1
const FLASH_MS: Record<GameMode, number> = { normal: 600, hard: 450 }
const GAP_MS = 250

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

function cleanOldStates(dateKey: string) {
  const keysToRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith(STATE_PREFIX) && !key.includes(dateKey)) {
      keysToRemove.push(key)
    }
  }
  keysToRemove.forEach(k => localStorage.removeItem(k))
}

function getDayIndex(dateKey: string) {
  return Math.floor((new Date(dateKey).getTime() - EPOCH) / 86400000)
}

function generateSequence(dayIndex: number, length: number, mode: GameMode): SimonColor[] {
  let seed = Math.abs(dayIndex) * 1000 + (mode === 'hard' ? 500000 : 0) + 1
  const next = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff
    return (Math.abs(seed) % 4) as SimonColor
  }
  return Array.from({ length }, next)
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
    osc.frequency.value = COLOR_FREQS[color]
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
    localStorage.setItem(stateKey(state.dateKey, state.mode), JSON.stringify({
      dateKey: state.dateKey,
      mode: state.mode,
      currentRound: state.currentRound,
      livesLeft: state.livesLeft,
      gameStatus: state.gameStatus,
      statsRecorded: state.statsRecorded,
    }))
  }

  function initGame(dateKey: string, mode: GameMode) {
    cleanOldStates(dateKey)

    state.dateKey = dateKey
    state.mode = mode
    sequenceLength = mode === 'hard' ? HARD_LENGTH : NORMAL_LENGTH
    sequence = generateSequence(getDayIndex(dateKey), sequenceLength, mode)

    const saved = localStorage.getItem(stateKey(dateKey, mode))
    if (saved) {
      try {
        const parsed: SimonGameState = JSON.parse(saved)
        state.currentRound = parsed.currentRound
        state.livesLeft = parsed.livesLeft
        state.gameStatus = parsed.gameStatus === 'playing_sequence' || parsed.gameStatus === 'awaiting_input'
          ? 'idle'
          : parsed.gameStatus
        state.statsRecorded = parsed.statsRecorded
        return
      } catch {}
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

    const flashMs = FLASH_MS[state.mode]

    for (let i = 0; i < state.currentRound; i++) {
      const color = sequence[i]!
      activeColor.value = color
      playTone(color, flashMs / 1000, muted.value)
      await delay(flashMs)
      activeColor.value = null
      await delay(GAP_MS)
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
