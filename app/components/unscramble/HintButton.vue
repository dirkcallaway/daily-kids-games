<script setup lang="ts">
defineProps<{
  hintUsed: boolean;
}>();

const emit = defineEmits<{
  hint: [];
}>();
</script>

<template>
  <button
    class="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors"
    :class="hintUsed
      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
      : 'bg-amber-100 text-amber-600 hover:bg-amber-200'"
    :disabled="hintUsed"
    @click="emit('hint')"
  >
    💡 {{ hintUsed ? 'Hint used' : 'Hint' }}
  </button>
</template>
