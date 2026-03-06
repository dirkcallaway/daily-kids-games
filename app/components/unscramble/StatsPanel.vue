<script setup lang="ts">
import type { AllStats, GameMode } from '~/types/game';

const props = defineProps<{
  stats: AllStats;
  mode: GameMode;
}>();

const s = computed(() => props.stats[props.mode]);

const maxCount = computed(() =>
  Math.max(1, ...Object.values(s.value.guessDistribution))
);
</script>

<template>
  <div class="w-full">
    <div class="flex justify-center gap-4 text-center mb-4">
      <div>
        <p class="text-2xl font-bold dark:text-slate-100">{{ s.gamesPlayed }}</p>
        <p class="text-xs text-slate-500 dark:text-slate-400">Played</p>
      </div>
      <div>
        <p class="text-2xl font-bold dark:text-slate-100">
          {{ s.gamesPlayed ? Math.round((s.gamesWon / s.gamesPlayed) * 100) : 0 }}%
        </p>
        <p class="text-xs text-slate-500 dark:text-slate-400">Win %</p>
      </div>
      <div>
        <p class="text-2xl font-bold dark:text-slate-100">{{ s.currentStreak }}</p>
        <p class="text-xs text-slate-500 dark:text-slate-400">Streak</p>
      </div>
      <div>
        <p class="text-2xl font-bold dark:text-slate-100">{{ s.maxStreak }}</p>
        <p class="text-xs text-slate-500 dark:text-slate-400">Best</p>
      </div>
    </div>

    <!-- Guess distribution -->
    <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 text-center">
      Guess Distribution
    </p>
    <div class="flex flex-col gap-1">
      <div
        v-for="n in (mode === 'hard' ? 5 : 6)"
        :key="n"
        class="flex items-center gap-2 text-sm"
      >
        <span class="w-3 text-slate-500 dark:text-slate-400 font-semibold">{{ n }}</span>
        <div class="flex-1 bg-slate-100 dark:bg-slate-700 rounded overflow-hidden">
          <div
            class="h-5 rounded flex items-center justify-end pr-1 text-xs font-bold text-white transition-all"
            :class="s.guessDistribution[n] ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-600'"
            :style="{ width: `${((s.guessDistribution[n] ?? 0) / maxCount) * 100}%`, minWidth: s.guessDistribution[n] ? '1.5rem' : '0' }"
          >
            {{ s.guessDistribution[n] ?? 0 }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
