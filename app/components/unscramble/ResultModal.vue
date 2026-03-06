<script setup lang="ts">
import type { AllStats, GameMode } from '~/types/game';

const props = defineProps<{
  status: 'won' | 'lost';
  word: string;
  mode: GameMode;
  stats: AllStats;
}>();

const emit = defineEmits<{
  close: [];
}>();
</script>

<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col items-center gap-4">

      <div class="text-center">
        <p class="text-4xl mb-1">{{ status === 'won' ? '🎉' : '😢' }}</p>
        <h2 class="text-xl font-bold text-slate-800">
          {{ status === 'won' ? 'You got it!' : 'Better luck tomorrow!' }}
        </h2>
        <p class="text-slate-500 mt-1">
          The word was <span class="font-bold text-indigo-600">{{ word }}</span>
        </p>
      </div>

      <hr class="w-full border-slate-200" />

      <UnscrambleStatsPanel :stats="stats" :mode="mode" />

      <p class="text-sm text-slate-400 text-center">Come back tomorrow for a new word!</p>

      <button
        class="w-full py-2 rounded-lg bg-slate-100 text-slate-600 font-semibold text-sm"
        @click="emit('close')"
      >
        Close
      </button>
    </div>
  </div>
</template>
