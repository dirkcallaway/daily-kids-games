<script setup lang="ts">
import type { GameMode } from '~/types/game'
import { useSimonGame } from '~/composables/useSimonGame'
import { useSimonStats } from '~/composables/useSimonStats'
import { useConfetti } from '~/composables/useConfetti'

const {
  state,
  activeColor,
  wrongFlash,
  sequenceLengthComputed,
  muted,
  initGame,
  playSequence,
  handleInput,
  toggleMute,
  loadMutePreference,
} = useSimonGame()

const { getStats } = useSimonStats()
const { launchFireworks } = useConfetti()

const showModal = ref(false)
const currentStats = ref(getStats())
const mode = ref<GameMode>('normal')

const maxLives = computed(() => mode.value === 'hard' ? 1 : 3)

const statusMessage = computed(() => {
  switch (state.gameStatus) {
    case 'idle':            return 'Get ready…'
    case 'playing_sequence': return 'Watch carefully…'
    case 'awaiting_input':  return 'Your turn! 🎯'
    case 'won':             return '🎉 You did it!'
    case 'lost':            return 'Game over!'
    default:                return ''
  }
})

const padDisabled = computed(() =>
  state.gameStatus !== 'awaiting_input'
)

function loadGame(selectedMode: GameMode) {
  const now = new Date()
  const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  initGame(dateKey, selectedMode)
}

watch(() => state.gameStatus, async (status) => {
  if (status === 'won') {
    currentStats.value = getStats()
    launchFireworks()
    setTimeout(() => { showModal.value = true }, 800)
  }
  if (status === 'lost') {
    currentStats.value = getStats()
    setTimeout(() => { showModal.value = true }, 600)
  }
  if (status === 'idle') {
    await new Promise(r => setTimeout(r, 600))
    if (state.gameStatus === 'idle') playSequence()
  }
})

onMounted(() => {
  loadMutePreference()
  const savedMode = (localStorage.getItem('simon-mode-pref') ?? 'normal') as GameMode
  mode.value = savedMode
  loadGame(savedMode)
  setTimeout(() => {
    if (state.gameStatus === 'idle') playSequence()
  }, 800)
})

function switchMode(newMode: GameMode) {
  if (newMode === mode.value) return
  if (state.currentRound > 1 && state.gameStatus !== 'won' && state.gameStatus !== 'lost') {
    if (!confirm('Switch mode? Your current progress will be lost.')) return
  }
  mode.value = newMode
  localStorage.setItem('simon-mode-pref', newMode)
  showModal.value = false
  loadGame(newMode)
  setTimeout(() => {
    if (state.gameStatus === 'idle') playSequence()
  }, 800)
}

function replaySequence() {
  if (state.gameStatus === 'idle' || state.gameStatus === 'awaiting_input') {
    playSequence()
  }
}
</script>

<template>
  <div class="flex flex-col items-center gap-4 p-4 max-w-md mx-auto">

    <!-- Header -->
    <div class="flex flex-col items-center gap-2 w-full">
      <div class="w-full flex justify-between items-center">
        <NuxtLink
          to="/"
          class="text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          ← Games
        </NuxtLink>
        <button
          class="text-xl p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          :title="muted ? 'Unmute' : 'Mute'"
          @click="toggleMute"
        >
          {{ muted ? '🔇' : '🔊' }}
        </button>
      </div>

      <!-- Mode toggle -->
      <div class="flex rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600 text-sm font-semibold">
        <button
          class="px-4 py-2.5 transition-colors"
          :class="mode === 'normal'
            ? 'bg-amber-400 text-white'
            : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400'"
          @click="switchMode('normal')"
        >
          Easy
        </button>
        <button
          class="px-4 py-2.5 transition-colors"
          :class="mode === 'hard'
            ? 'bg-amber-600 text-white'
            : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400'"
          @click="switchMode('hard')"
        >
          Hard
        </button>
      </div>

      <h1 class="text-lg font-bold text-slate-700 dark:text-slate-200">Simon Says</h1>
    </div>

    <!-- Round & lives -->
    <div class="flex flex-col items-center gap-2 w-full">
      <p class="text-sm font-semibold text-slate-500 dark:text-slate-400">
        Round {{ state.gameStatus === 'won' ? sequenceLengthComputed : state.currentRound }}
        of {{ sequenceLengthComputed }}
      </p>
      <SimonLivesDisplay :lives-left="state.livesLeft" :max-lives="maxLives" />
    </div>

    <!-- Color pad -->
    <SimonPad
      :active-color="activeColor"
      :wrong-flash="wrongFlash"
      :disabled="padDisabled"
      @color-press="handleInput"
    />

    <!-- Status message -->
    <p class="text-base font-semibold text-slate-600 dark:text-slate-300 min-h-6 text-center">
      {{ statusMessage }}
    </p>

    <!-- Watch again button — always occupies space so the layout below stays fixed -->
    <button
      class="text-xs text-slate-400 dark:text-slate-500 underline hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
      :class="state.gameStatus === 'awaiting_input' ? '' : 'invisible pointer-events-none'"
      @click="replaySequence"
    >
      Watch again
    </button>

    <!-- Stats -->
    <div class="w-full border-t border-slate-200 dark:border-slate-700 pt-4">
      <SimonStatsPanel :stats="currentStats" :mode="mode" />
    </div>

    <!-- Result modal -->
    <SimonResultModal
      v-if="showModal && (state.gameStatus === 'won' || state.gameStatus === 'lost')"
      :status="state.gameStatus"
      :current-round="state.currentRound"
      :sequence-length="sequenceLengthComputed"
      :mode="mode"
      :stats="currentStats"
      @close="showModal = false"
    />

  </div>
</template>
