<script setup lang="ts">
const props = defineProps<{
  guessedLetters: string[];
  word: string;
  gameStatus: string;
}>();

const emit = defineEmits<{
  (e: 'guess', letter: string): void;
}>();

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function getState(letter: string) {
  if (!props.guessedLetters.includes(letter)) return 'idle';
  return props.word.includes(letter) ? 'correct' : 'wrong';
}
</script>

<template>
  <div class="flex flex-wrap justify-center gap-1.5 max-w-xs">
    <button
      v-for="letter in ALPHABET"
      :key="letter"
      :disabled="getState(letter) !== 'idle' || gameStatus !== 'playing'"
      class="w-9 h-9 rounded-lg font-bold text-sm transition-colors"
      :class="{
        'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600': getState(letter) === 'idle' && gameStatus === 'playing',
        'bg-green-400 dark:bg-green-600 text-white cursor-default': getState(letter) === 'correct',
        'bg-rose-300 dark:bg-rose-700 text-white cursor-default': getState(letter) === 'wrong',
        'opacity-50 cursor-default bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100': getState(letter) === 'idle' && gameStatus !== 'playing',
      }"
      @click="emit('guess', letter)"
    >
      {{ letter }}
    </button>
  </div>
</template>
