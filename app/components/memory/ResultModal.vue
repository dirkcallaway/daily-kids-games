<script setup lang="ts">
import type { MemoryStats } from '~/types/game'

const props = defineProps<{
  elapsedSeconds: number
  stats: MemoryStats
  averageTime: number | null
}>()

const emit = defineEmits<{
  close: []
  replay: []
}>()

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = String(seconds % 60).padStart(2, '0')
  return `${m}:${s}`
}
</script>

<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div
      class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col items-center gap-4"
      style="animation: modal-in 0.3s ease both"
    >
      <div class="text-center">
        <p class="text-4xl mb-1">🏆</p>
        <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100">You matched them all!</h2>
        <p class="text-slate-500 dark:text-slate-400 mt-1">
          Time: <span class="font-bold text-teal-600 dark:text-teal-400">{{ formatTime(elapsedSeconds) }}</span>
        </p>
      </div>

      <hr class="w-full border-slate-200 dark:border-slate-700" />

      <MemoryStatsPanel :stats="stats" :average-time="averageTime" />

      <p class="text-sm text-slate-400 dark:text-slate-500 text-center">
        Come back tomorrow for a new card type!
      </p>

      <button
        class="w-full py-3 rounded-lg bg-teal-500 hover:bg-teal-400 text-white font-semibold text-sm transition-colors"
        @click="emit('replay')"
      >
        Play Again
      </button>

      <button
        class="w-full py-3 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm transition-colors"
        @click="emit('close')"
      >
        Close
      </button>
    </div>
  </div>
</template>
