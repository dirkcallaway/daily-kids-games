<script setup lang="ts">
import type { SimonAllStats, GameMode } from '~/types/game'

const props = defineProps<{
  status: 'won' | 'lost'
  currentRound: number
  sequenceLength: number
  mode: GameMode
  stats: SimonAllStats
}>()

const emit = defineEmits<{ (e: 'close'): void }>()
</script>

<template>
  <div
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    @click.self="emit('close')"
  >
    <div
      class="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl flex flex-col gap-4 animate-modal-in"
    >
      <!-- Result -->
      <div class="text-center">
        <div class="text-4xl mb-2">{{ status === 'won' ? '🎉' : '💪' }}</div>
        <h2 class="text-2xl font-bold text-slate-800 dark:text-slate-100">
          {{ status === 'won' ? 'Simon Says… Amazing!' : 'Nice Try!' }}
        </h2>
        <p class="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          <template v-if="status === 'won'">
            You remembered all {{ sequenceLength }} colors!
          </template>
          <template v-else>
            You made it to round {{ currentRound }} of {{ sequenceLength }}.
          </template>
        </p>
        <div class="mt-1 text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide font-semibold">
          {{ mode === 'hard' ? 'Hard' : 'Easy' }} mode
        </div>
      </div>

      <!-- Stats -->
      <div class="border-t border-slate-200 dark:border-slate-700 pt-4">
        <SimonStatsPanel :stats="stats" :mode="mode" />
      </div>

      <!-- Close -->
      <button
        class="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-white font-bold text-lg transition-colors"
        @click="emit('close')"
      >
        Done
      </button>
    </div>
  </div>
</template>
