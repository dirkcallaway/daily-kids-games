<script setup lang="ts">
import type { LetterState } from '~/types/game';

const props = defineProps<{
  letter: string | null;
  state: LetterState;
  index?: number;
}>();

const bgColor = computed(() => {
  if (props.state === 'correct') return 'bg-green-400 border-green-400 text-white';
  if (props.state === 'absent') return 'bg-slate-400 border-slate-400 text-white';
  if (props.state === 'locked') return 'bg-blue-400 border-blue-400 text-white';
  return props.letter ? 'bg-white dark:bg-slate-700 border-indigo-400' : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600';
});

const animationStyle = computed(() => {
  const delay = `${(props.index ?? 0) * 0.15}s`;
  if (props.state === 'correct' || props.state === 'absent') {
    return { animation: `reveal 0.5s ease ${delay} both` };
  }
  if (props.state === 'pending' && props.letter) {
    return { animation: 'pop 0.2s ease both' };
  }
  return {};
});
</script>

<template>
  <div
    class="flex items-center justify-center w-12 h-12 border-2 rounded-lg font-bold text-xl uppercase transition-colors"
    :class="bgColor"
    :style="animationStyle"
  >
    {{ letter ?? '' }}
  </div>
</template>
