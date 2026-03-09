<script setup lang="ts">
import type { WordSearchStats } from '~/types/game'

const props = defineProps<{
  elapsedSeconds: number
  stats: WordSearchStats
}>()

const emit = defineEmits<{
  close: []
}>()

function formatTime(seconds: number | null): string {
  if (seconds === null) return '--:--'
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
        <p class="text-4xl mb-1">🔍</p>
        <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100">You found them all!</h2>
        <p class="text-slate-500 dark:text-slate-400 mt-1">
          Time: <span class="font-bold text-green-600 dark:text-green-400">{{ formatTime(elapsedSeconds) }}</span>
        </p>
      </div>

      <hr class="w-full border-slate-200 dark:border-slate-700" />

      <div class="flex justify-center gap-8 text-center w-full">
        <div>
          <p class="text-2xl font-bold text-slate-800 dark:text-slate-100">{{ stats.gamesPlayed }}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400">Played</p>
        </div>
        <div>
          <p class="text-2xl font-bold text-slate-800 dark:text-slate-100">{{ stats.currentStreak }}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400">Streak</p>
        </div>
        <div>
          <p class="text-2xl font-bold text-slate-800 dark:text-slate-100">{{ formatTime(stats.bestTime) }}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400">Best</p>
        </div>
      </div>

      <p class="text-sm text-slate-400 dark:text-slate-500 text-center">
        Come back tomorrow for a new theme!
      </p>

      <button
        class="w-full py-3 rounded-lg bg-green-500 hover:bg-green-400 text-white font-semibold text-sm transition-colors"
        @click="emit('close')"
      >
        Done
      </button>
    </div>
  </div>
</template>
