<script setup lang="ts">
import type { HangmanStats } from '~/types/game';

const props = defineProps<{
  stats: HangmanStats;
}>();

const winPct = computed(() => {
  if (props.stats.gamesPlayed === 0) return 0;
  return Math.round((props.stats.gamesWon / props.stats.gamesPlayed) * 100);
});
</script>

<template>
  <div class="w-full">
    <div class="flex justify-center gap-4 text-center">
      <div>
        <p class="text-2xl font-bold text-slate-800 dark:text-slate-100">{{ stats.gamesPlayed }}</p>
        <p class="text-xs text-slate-500 dark:text-slate-400">Played</p>
      </div>
      <div>
        <p class="text-2xl font-bold text-slate-800 dark:text-slate-100">{{ winPct }}%</p>
        <p class="text-xs text-slate-500 dark:text-slate-400">Win %</p>
      </div>
      <div>
        <p class="text-2xl font-bold text-slate-800 dark:text-slate-100">{{ stats.currentStreak }}</p>
        <p class="text-xs text-slate-500 dark:text-slate-400">Streak</p>
      </div>
      <div>
        <p class="text-2xl font-bold text-slate-800 dark:text-slate-100">{{ stats.maxStreak }}</p>
        <p class="text-xs text-slate-500 dark:text-slate-400">Best</p>
      </div>
    </div>
  </div>
</template>
