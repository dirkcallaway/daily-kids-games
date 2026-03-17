<script setup lang="ts">
import type { EmojiEquation, EmojiVar } from '~/types/game'

defineProps<{
  equations: EmojiEquation[]
  emojis: EmojiVar[]
}>()
</script>

<template>
  <div class="flex flex-col items-center gap-2">
    <div
      v-for="(eq, i) in equations"
      :key="i"
      class="flex items-center gap-3 text-2xl font-bold"
    >
      <span>{{ emojis[eq.aIdx]!.symbol }}</span>
      <span class="text-slate-500 dark:text-slate-400 text-xl">{{ eq.op }}</span>
      <span>{{ emojis[eq.bIdx]!.symbol }}</span>
      <span class="text-slate-500 dark:text-slate-400 text-xl">=</span>
      <span class="text-slate-800 dark:text-slate-100">{{ eq.result }}</span>
    </div>
  </div>
</template>
