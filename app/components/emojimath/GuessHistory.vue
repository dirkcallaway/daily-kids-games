<script setup lang="ts">
import type { EmojiGuess, EmojiVar } from '~/types/game'

defineProps<{
  guesses: EmojiGuess[]
  emojis: EmojiVar[]
  maxGuesses: number
}>()
</script>

<template>
  <div class="flex flex-col items-center gap-1 w-full">
    <!-- Emoji column headers (shown once) -->
    <div class="flex gap-2 justify-center mb-0.5">
      <div
        v-for="(emoji, ei) in emojis"
        :key="ei"
        class="w-11 text-center text-xl"
      >
        {{ emoji.symbol }}
      </div>
    </div>

    <!-- Completed guess rows -->
    <div
      v-for="(guess, gi) in guesses"
      :key="gi"
      class="flex gap-2 justify-center"
    >
      <div
        v-for="(emoji, ei) in emojis"
        :key="ei"
        class="w-11 h-8 flex items-center justify-center rounded-lg font-bold text-sm text-white"
        :class="guess.feedback[ei] === 'correct' ? 'bg-green-500' : 'bg-red-400'"
      >
        {{ guess.values[ei] }}
      </div>
    </div>

    <!-- Empty future rows -->
    <div
      v-for="i in (maxGuesses - guesses.length)"
      :key="`empty-${i}`"
      class="flex gap-2 justify-center"
    >
      <div
        v-for="(emoji, ei) in emojis"
        :key="ei"
        class="w-11 h-8 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700"
      />
    </div>
  </div>
</template>
