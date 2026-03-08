<template>
  <div class="text-2xl font-mono font-bold text-slate-700 dark:text-slate-200 tabular-nums">
    {{ formatted }}
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ seconds: number }>()

const formatted = computed(() => {
  const m = Math.floor(props.seconds / 60)
  const s = String(props.seconds % 60).padStart(2, '0')
  return `${m}:${s}`
})
</script>
