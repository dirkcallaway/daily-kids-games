<script setup lang="ts">
import type { EmojiGuess, EmojiVar } from '~/types/game'

defineProps<{
  guesses: EmojiGuess[]
  emojis: EmojiVar[]
  maxGuesses: number
}>()
</script>

<template>
  <div class="flex flex-col gap-2 w-full">
    <div
      v-for="(guess, gi) in guesses"
      :key="gi"
      class="flex gap-3 justify-center"
    >
      <div
        v-for="(emoji, ei) in emojis"
        :key="ei"
        class="flex flex-col items-center"
      >
        <span class="text-xl">{{ emoji.symbol }}</span>
        <div
          class="w-12 h-9 flex items-center justify-center rounded-lg font-bold text-sm text-white"
          :class="guess.feedback[ei] === 'correct'
            ? 'bg-green-500'
            : 'bg-red-400'"
        >
          {{ guess.values[ei] }}
        </div>
      </div>
    </div>

    <!-- Empty future rows -->
    <div
      v-for="i in (maxGuesses - guesses.length)"
      :key="`empty-${i}`"
      class="flex gap-3 justify-center"
    >
      <div
        v-for="(emoji, ei) in emojis"
        :key="ei"
        class="flex flex-col items-center"
      >
        <span class="text-xl opacity-0">{{ emoji.symbol }}</span>
        <div class="w-12 h-9 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700" />
      </div>
    </div>
  </div>
</template>
