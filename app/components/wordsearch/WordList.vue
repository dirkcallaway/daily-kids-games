<script setup lang="ts">
defineProps<{
  words: string[]
  clues: string[]
  foundWords: string[]
}>()
</script>

<template>
  <div class="w-full grid grid-cols-2 gap-2 sm:grid-cols-3">
    <div
      v-for="(word, i) in words"
      :key="word"
      class="flex flex-col items-start px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 transition-all"
      :class="foundWords.includes(word) ? 'opacity-60' : ''"
    >
      <span
        class="text-sm font-bold uppercase tracking-wide transition-all"
        :class="foundWords.includes(word)
          ? 'line-through text-green-600 dark:text-green-400'
          : 'text-slate-800 dark:text-slate-100'"
      >
        {{ word }}
      </span>
      <span class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
        {{ clues[i] }}
      </span>
    </div>
  </div>
</template>
