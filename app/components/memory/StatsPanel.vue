<script setup lang="ts">
import type { MemoryStats } from '~/types/game'

const props = defineProps<{
  stats: MemoryStats
  averageTime: number | null
}>()

function formatTime(seconds: number | null): string {
  if (seconds === null) return '--'
  const m = Math.floor(seconds / 60)
  const s = String(seconds % 60).padStart(2, '0')
  return `${m}:${s}`
}
</script>

<template>
  <div class="w-full">
    <div class="flex justify-center gap-4 text-center">
      <div>
        <p class="text-2xl font-bold dark:text-slate-100">{{ stats.gamesPlayed }}</p>
        <p class="text-xs text-slate-500 dark:text-slate-400">Played</p>
      </div>
      <div>
        <p class="text-2xl font-bold dark:text-slate-100">{{ stats.currentStreak }}</p>
        <p class="text-xs text-slate-500 dark:text-slate-400">Streak</p>
      </div>
      <div>
        <p class="text-2xl font-bold dark:text-slate-100">{{ formatTime(stats.bestTime) }}</p>
        <p class="text-xs text-slate-500 dark:text-slate-400">Best</p>
      </div>
      <div>
        <p class="text-2xl font-bold dark:text-slate-100">{{ formatTime(averageTime) }}</p>
        <p class="text-xs text-slate-500 dark:text-slate-400">Avg</p>
      </div>
    </div>
  </div>
</template>
