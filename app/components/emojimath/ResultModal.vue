<script setup lang="ts">
import type { AllStats, EmojiVar, GameMode } from '~/types/game'

const props = defineProps<{
  status: 'won' | 'lost'
  emojis: EmojiVar[]
  mode: GameMode
  stats: AllStats
}>()

const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div
      class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col items-center gap-4"
      style="animation: modal-in 0.3s ease both"
    >

      <div class="text-center">
        <p class="text-4xl mb-1">{{ status === 'won' ? '🎉' : '😢' }}</p>
        <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100">
          {{ status === 'won' ? 'You solved it!' : 'Better luck tomorrow!' }}
        </h2>
      </div>

      <!-- Answer reveal -->
      <div class="flex gap-4 flex-wrap justify-center">
        <div
          v-for="emoji in emojis"
          :key="emoji.symbol"
          class="flex flex-col items-center gap-1"
        >
          <span class="text-3xl">{{ emoji.symbol }}</span>
          <span class="text-lg font-bold text-slate-800 dark:text-slate-100">= {{ emoji.value }}</span>
        </div>
      </div>

      <hr class="w-full border-slate-200 dark:border-slate-700" />

      <EmojimathStatsPanel :stats="stats" :mode="mode" />

      <p class="text-sm text-slate-400 dark:text-slate-500 text-center">Come back tomorrow for a new puzzle!</p>

      <button
        class="w-full py-3 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm"
        @click="emit('close')"
      >
        Close
      </button>
    </div>
  </div>
</template>
