<script setup lang="ts">
import type { GameMode } from '~/types/game'
import { useEmojiMathGame } from '~/composables/useEmojiMathGame'
import { useEmojiMathDay } from '~/composables/useEmojiMathDay'
import { useEmojiMathStats } from '~/composables/useEmojiMathStats'
import { useConfetti } from '~/composables/useConfetti'

const { state, initGame, setCurrentValue, submitGuess, useHint, MAX_GUESSES } = useEmojiMathGame()
const { getStats } = useEmojiMathStats()
const { launchFireworks } = useConfetti()

const showModal = ref(false)
const currentStats = ref(getStats())

const mode = ref<GameMode>('normal')

function loadPuzzle(selectedMode: GameMode) {
  const { emojis, equations, dateKey } = useEmojiMathDay(selectedMode)
  initGame(selectedMode, emojis, equations, dateKey)
}

watch(() => state.gameStatus, (status) => {
  if (status === 'won' || status === 'lost') {
    currentStats.value = getStats()
    setTimeout(() => { showModal.value = true }, 600)
  }
  if (status === 'won') {
    setTimeout(launchFireworks, 300)
  }
})

onMounted(() => {
  const savedMode = (localStorage.getItem('emojimath-mode-pref') ?? 'normal') as GameMode
  mode.value = savedMode
  loadPuzzle(savedMode)
})

function switchMode(newMode: GameMode) {
  if (newMode === mode.value) return
  if (state.guesses.length > 0) {
    const confirmed = confirm('Switch mode? Your current game progress will be lost.')
    if (!confirmed) return
  }
  mode.value = newMode
  localStorage.setItem('emojimath-mode-pref', newMode)
  loadPuzzle(newMode)
}

const gameResult = computed(() => state.gameStatus as 'won' | 'lost')
const isPlaying = computed(() => state.gameStatus === 'playing')
</script>

<template>
  <div class="flex flex-col items-center gap-3 p-4 max-w-md mx-auto">

    <!-- Header -->
    <div class="flex flex-col items-center gap-2 w-full">
      <div class="w-full flex justify-start">
        <NuxtLink to="/" class="text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
          ← Games
        </NuxtLink>
      </div>

      <!-- Mode toggle -->
      <div class="flex rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600 text-sm font-semibold">
        <button
          class="px-4 py-2.5 transition-colors"
          :class="mode === 'normal' ? 'bg-rose-500 text-white' : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400'"
          @click="switchMode('normal')"
        >
          Easy
        </button>
        <button
          class="px-4 py-2.5 transition-colors"
          :class="mode === 'hard' ? 'bg-rose-600 text-white' : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400'"
          @click="switchMode('hard')"
        >
          Hard
        </button>
      </div>

      <h1 class="text-lg font-bold text-slate-700 dark:text-slate-200">Emoji Equations</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 text-center">
        {{ mode === 'normal'
          ? 'Find the value of each emoji'
          : '3 emojis, all operations — figure it out!' }}
      </p>
    </div>

    <!-- Equations -->
    <div class="bg-slate-50 dark:bg-slate-800/50 rounded-2xl px-6 py-3">
      <EmojimathEquationDisplay
        v-if="state.equations.length"
        :equations="state.equations"
        :emojis="state.emojis"
      />
    </div>

    <!-- Guess history -->
    <EmojimathGuessHistory
      v-if="state.emojis.length"
      :guesses="state.guesses"
      :emojis="state.emojis"
      :max-guesses="MAX_GUESSES"
    />

    <!-- Input area -->
    <EmojimathGuessInput
      v-if="state.emojis.length"
      :emojis="state.emojis"
      :current-values="state.currentValues"
      :hint-index="state.hintIndex"
      :hint-used="state.hintUsed"
      :disabled="!isPlaying"
      @update="setCurrentValue"
      @submit="submitGuess"
      @hint="useHint"
    />

    <!-- Result modal -->
    <EmojimathResultModal
      v-if="showModal && !isPlaying"
      :status="gameResult"
      :emojis="state.emojis"
      :mode="mode"
      :stats="currentStats"
      @close="showModal = false"
    />

  </div>
</template>
