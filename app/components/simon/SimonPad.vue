<script setup lang="ts">
import type { SimonColor } from '~/types/game'

const props = defineProps<{
  activeColor: SimonColor | null
  wrongFlash: boolean
  disabled: boolean
}>()

const emit = defineEmits<{
  (e: 'color-press', color: SimonColor): void
}>()

const COLORS: { color: SimonColor; base: string; lit: string; label: string }[] = [
  { color: 0, base: 'bg-red-400   dark:bg-red-700',  lit: 'bg-red-300   dark:bg-red-400',  label: 'Red'    },
  { color: 1, base: 'bg-blue-400  dark:bg-blue-700', lit: 'bg-blue-200  dark:bg-blue-400', label: 'Blue'   },
  { color: 2, base: 'bg-yellow-300 dark:bg-yellow-600', lit: 'bg-yellow-100 dark:bg-yellow-300', label: 'Yellow' },
  { color: 3, base: 'bg-green-400 dark:bg-green-700', lit: 'bg-green-200 dark:bg-green-400', label: 'Green'  },
]

function isLit(color: SimonColor) {
  return props.activeColor === color
}

function press(color: SimonColor) {
  if (props.disabled) return
  emit('color-press', color)
}
</script>

<template>
  <div
    class="grid grid-cols-2 gap-3 w-full max-w-xs mx-auto"
    :class="{ 'animate-shake': wrongFlash }"
  >
    <button
      v-for="{ color, base, lit, label } in COLORS"
      :key="color"
      :aria-label="label"
      :disabled="disabled"
      class="aspect-square rounded-2xl transition-all duration-100 shadow-md select-none"
      :class="[
        isLit(color) ? lit + ' scale-105 shadow-xl' : base,
        disabled ? 'cursor-default opacity-90' : 'cursor-pointer active:scale-95 hover:brightness-110',
      ]"
      @click="press(color)"
    />
  </div>
</template>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%       { transform: translateX(-8px); }
  40%       { transform: translateX(8px); }
  60%       { transform: translateX(-6px); }
  80%       { transform: translateX(6px); }
}
.animate-shake {
  animation: shake 0.4s ease-in-out;
}
</style>
