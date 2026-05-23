<script setup lang="ts">
const props = defineProps<{
  livesLeft: number
  maxLives: number
}>()
</script>

<template>
  <div class="flex gap-1 justify-center" aria-label="Lives remaining">
    <span
      v-for="i in maxLives"
      :key="i"
      class="text-2xl transition-all duration-300"
      :class="i <= livesLeft ? 'opacity-100' : 'opacity-25 grayscale'"
    >❤️</span>
  </div>
</template>
