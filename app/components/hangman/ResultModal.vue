<script setup lang="ts">
import type { HangmanStats } from '~/types/game';

const props = defineProps<{
  status: 'won' | 'lost';
  word: string;
  stats: HangmanStats;
}>();

const emit = defineEmits<{
  close: [];
}>();

const winPct = computed(() => {
  if (props.stats.gamesPlayed === 0) return 0;
  return Math.round((props.stats.gamesWon / props.stats.gamesPlayed) * 100);
});
</script>

<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div
      class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col items-center gap-4"
      style="animation: modal-in 0.3s ease both"
    >
      <div class="text-center">
        <p class="text-4xl mb-1">{{ status === 'won' ? '🎉' : '😬' }}</p>
        <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100">
          {{ status === 'won' ? 'You got it!' : 'Better luck tomorrow!' }}
        </h2>
        <p v-if="status === 'lost'" class="text-slate-500 dark:text-slate-400 mt-1">
          The word was <span class="font-bold text-amber-500">{{ word }}</span>
        </p>
      </div>

      <hr class="w-full border-slate-200 dark:border-slate-700" />

      <div class="flex justify-center gap-8 text-center w-full">
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

      <p class="text-sm text-slate-400 dark:text-slate-500 text-center">
        Come back tomorrow for a new word!
      </p>

      <button
        class="w-full py-3 rounded-lg font-semibold text-sm transition-colors"
        :class="status === 'won'
          ? 'bg-amber-500 hover:bg-amber-400 text-white'
          : 'bg-slate-500 hover:bg-slate-400 text-white'"
        @click="emit('close')"
      >
        Done
      </button>
    </div>
  </div>
</template>
