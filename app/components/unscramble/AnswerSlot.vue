<script setup lang="ts">
import type { LetterState } from '~/types/game';

const props = defineProps<{
  letter: string | null;
  state: LetterState;
}>();

const bgColor = computed(() => {
  if (props.state === 'correct') return 'bg-green-400 border-green-400 text-white';
  if (props.state === 'absent') return 'bg-slate-400 border-slate-400 text-white';
  if (props.state === 'locked') return 'bg-blue-400 border-blue-400 text-white';
  return props.letter ? 'bg-white border-indigo-400' : 'bg-white border-slate-300';
});
</script>

<template>
  <div
    class="flex items-center justify-center w-12 h-12 border-2 rounded-lg font-bold text-xl uppercase transition-colors"
    :class="bgColor"
  >
    {{ letter ?? '' }}
  </div>
</template>
