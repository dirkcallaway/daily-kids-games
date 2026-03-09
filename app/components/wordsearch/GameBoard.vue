<script setup lang="ts">
import { useWordSearchDay } from '~/composables/useWordSearchDay'
import { useWordSearchGame } from '~/composables/useWordSearchGame'
import { useWordSearchStats } from '~/composables/useWordSearchStats'
import { useConfetti } from '~/composables/useConfetti'

const { theme, words, clues, grid, placements, dateKey } = useWordSearchDay()
const { state, initGame, selectCell, stopTimer } = useWordSearchGame()
const { getStats } = useWordSearchStats()
const { launchFireworks } = useConfetti()

const showModal = ref(false)
const currentStats = ref(getStats())

watch(() => state.gameStatus, (status) => {
  if (status === 'won') {
    currentStats.value = getStats()
    setTimeout(() => { showModal.value = true }, 600)
    setTimeout(launchFireworks, 300)
  }
})

onMounted(() => initGame(theme, words, clues, grid, placements, dateKey))
onUnmounted(() => stopTimer())
</script>

<template>
  <div class="flex flex-col items-center gap-4 p-4 max-w-lg mx-auto">

    <!-- Header -->
    <div class="flex flex-col items-center gap-1 w-full">
      <div class="w-full flex justify-start">
        <NuxtLink
          to="/"
          class="text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          ← Games
        </NuxtLink>
      </div>
      <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Word Search</h1>
      <p class="text-sm font-semibold text-green-500 uppercase tracking-widest">{{ state.theme }}</p>
    </div>

    <!-- Timer -->
    <MemoryTimerDisplay :seconds="state.elapsedSeconds" />

    <!-- Word list -->
    <WordsearchWordList
      :words="state.words"
      :clues="state.clues"
      :found-words="state.foundWords"
    />

    <!-- 12×12 grid -->
    <WordsearchGrid
      :grid="state.grid"
      :select-start="state.selectStart"
      @cell-click="selectCell"
    />

    <!-- Progress -->
    <p class="text-sm text-slate-500 dark:text-slate-400">
      {{ state.foundWords.length }} / {{ state.words.length }} words found
    </p>

    <!-- Result modal -->
    <WordsearchResultModal
      v-if="showModal && state.gameStatus === 'won'"
      :elapsed-seconds="state.elapsedSeconds"
      :stats="currentStats"
      @close="showModal = false"
    />

  </div>
</template>
