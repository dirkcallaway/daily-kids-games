<script setup lang="ts">
const props = defineProps<{
  word: string;
  guessedLetters: string[];
}>();

const letters = computed(() =>
  props.word.split('').map(l => ({
    letter: l,
    revealed: props.guessedLetters.includes(l),
  }))
);
</script>

<template>
  <div class="flex flex-wrap justify-center gap-2">
    <div
      v-for="(item, i) in letters"
      :key="i"
      class="flex flex-col items-center"
    >
      <span class="text-2xl font-bold w-8 text-center text-slate-800 dark:text-slate-100 min-h-[2rem]">
        {{ item.revealed ? item.letter : '\u00a0' }}
      </span>
      <div class="w-8 h-0.5 bg-slate-400 dark:bg-slate-500 mt-1" />
    </div>
  </div>
</template>
