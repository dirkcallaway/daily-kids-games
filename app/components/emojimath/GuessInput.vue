<script setup lang="ts">
import type { EmojiVar } from '~/types/game'

const props = defineProps<{
  emojis: EmojiVar[]
  currentValues: (number | null)[]
  hintIndex: number | null
  hintUsed: boolean
  disabled: boolean
}>()

const emit = defineEmits<{
  update: [emojiIdx: number, value: number | null]
  submit: []
  hint: []
}>()

const allFilled = computed(() => props.currentValues.every(v => v !== null))

function onInput(idx: number, e: Event) {
  const raw = (e.target as HTMLInputElement).value
  const parsed = raw === '' ? null : parseInt(raw, 10)
  emit('update', idx, Number.isNaN(parsed) ? null : parsed)
}
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <!-- Emoji input row -->
    <div class="flex gap-2 flex-wrap justify-center">
      <div
        v-for="(emoji, i) in emojis"
        :key="i"
        class="flex flex-col items-center gap-0.5"
      >
        <span class="text-2xl">{{ emoji.symbol }}</span>
        <input
          type="number"
          min="1"
          max="99"
          :value="currentValues[i] ?? ''"
          :disabled="disabled || hintIndex === i"
          :class="[
            'w-14 h-9 text-center text-base font-bold rounded-lg border-2 transition-colors',
            'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100',
            hintIndex === i
              ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 cursor-not-allowed'
              : 'border-slate-300 dark:border-slate-600 focus:border-rose-400 focus:outline-none',
          ]"
          @input="onInput(i, $event)"
        />
      </div>
    </div>

    <!-- Buttons -->
    <div class="flex gap-2">
      <button
        :disabled="hintUsed || disabled"
        class="flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold text-sm transition-colors"
        :class="hintUsed || disabled
          ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
          : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200'"
        @click="emit('hint')"
      >
        💡 {{ hintUsed ? 'Hint used' : 'Hint' }}
      </button>
      <button
        :disabled="!allFilled || disabled"
        class="px-5 py-1.5 rounded-lg font-semibold transition-colors"
        :class="allFilled && !disabled
          ? 'bg-rose-500 text-white hover:bg-rose-600'
          : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'"
        @click="emit('submit')"
      >
        Submit
      </button>
    </div>
  </div>
</template>
