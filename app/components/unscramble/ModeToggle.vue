<script setup lang="ts">
import type { GameMode } from '~/types/game';

const props = defineProps<{
  mode: GameMode;
  hasStarted: boolean;
}>();

const emit = defineEmits<{
  switch: [mode: GameMode];
}>();

function trySwitch(newMode: GameMode) {
  if (newMode === props.mode) return;
  if (props.hasStarted) {
    const confirmed = confirm('Switch mode? Your current game progress will be lost.');
    if (!confirmed) return;
  }
  emit('switch', newMode);
}
</script>

<template>
  <div class="flex rounded-lg overflow-hidden border border-slate-300 text-sm font-semibold">
    <button
      class="px-4 py-1.5 transition-colors"
      :class="mode === 'normal' ? 'bg-indigo-500 text-white' : 'bg-white text-slate-500'"
      @click="trySwitch('normal')"
    >
      Normal
    </button>
    <button
      class="px-4 py-1.5 transition-colors"
      :class="mode === 'hard' ? 'bg-rose-500 text-white' : 'bg-white text-slate-500'"
      @click="trySwitch('hard')"
    >
      Hard
    </button>
  </div>
</template>
