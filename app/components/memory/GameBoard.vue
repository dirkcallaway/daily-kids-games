<script setup lang="ts">
import { useMemoryGame } from '~/composables/useMemoryGame'
import { useMemoryDay } from '~/composables/useMemoryDay'
import { useMemoryStats } from '~/composables/useMemoryStats'
import { useConfetti } from '~/composables/useConfetti'

const { cards, cardType, dateKey } = useMemoryDay()
const { state, initGame, flipCard, replay, stopTimer } = useMemoryGame()
const { getStats, getAverageTime } = useMemoryStats()
const { launchFireworks } = useConfetti()

const showModal = ref(false)
const currentStats = ref(getStats())
const currentAvg = ref(getAverageTime())

const cardTypeLabel = computed(() => {
  if (cardType === 'emoji') return 'Animals'
  if (cardType === 'color') return 'Colors'
  return 'Letters'
})

watch(() => state.gameStatus, (status) => {
  if (status === 'won') {
    currentStats.value = getStats()
    currentAvg.value = getAverageTime()
    setTimeout(() => { showModal.value = true }, 600)
    setTimeout(launchFireworks, 300)
  }
})

onMounted(() => initGame(cards, cardType, dateKey))
onUnmounted(() => stopTimer())

function handleReplay() {
  showModal.value = false
  replay()
}
</script>

<template>
  <div class="flex flex-col items-center gap-4 p-4 max-w-sm mx-auto">

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
      <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Memory Match</h1>
      <p class="text-sm font-semibold text-teal-500 uppercase tracking-widest">{{ cardTypeLabel }}</p>
    </div>

    <!-- Timer -->
    <MemoryTimerDisplay :seconds="state.elapsedSeconds" />

    <!-- 5x4 Card Grid -->
    <div class="grid grid-cols-5 gap-2 w-full">
      <MemoryCard
        v-for="card in state.cards"
        :key="card.id"
        :card="card"
        @flip="flipCard"
      />
    </div>

    <!-- Progress -->
    <p class="text-sm text-slate-500 dark:text-slate-400">
      {{ state.matchedPairKeys.length }} / 10 pairs found
    </p>

    <!-- Result modal -->
    <MemoryResultModal
      v-if="showModal && state.gameStatus === 'won'"
      :elapsed-seconds="state.elapsedSeconds"
      :stats="currentStats"
      :average-time="currentAvg"
      @replay="handleReplay"
      @close="showModal = false"
    />
  </div>
</template>
