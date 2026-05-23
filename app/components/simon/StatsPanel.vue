<script setup lang="ts">
import type { SimonAllStats, GameMode } from '~/types/game'

const props = defineProps<{
  stats: SimonAllStats
  mode: GameMode
}>()

const s = computed(() => props.stats[props.mode])
const winPct = computed(() =>
  s.value.gamesPlayed === 0 ? 0 : Math.round((s.value.gamesWon / s.value.gamesPlayed) * 100)
)
</script>

<template>
  <div class="w-full grid grid-cols-4 gap-2 text-center">
    <div v-for="{ label, value } in [
      { label: 'Played',  value: s.gamesPlayed },
      { label: 'Win %',   value: winPct + '%' },
      { label: 'Streak',  value: s.currentStreak },
      { label: 'Best Round', value: s.bestRound || '—' },
    ]" :key="label" class="flex flex-col gap-0.5">
      <span class="text-xl font-bold text-slate-800 dark:text-slate-100">{{ value }}</span>
      <span class="text-xs text-slate-500 dark:text-slate-400 leading-tight">{{ label }}</span>
    </div>
  </div>
</template>
