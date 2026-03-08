<template>
  <div class="card-perspective w-full aspect-square">
    <div class="card-inner" :class="{ 'is-flipped': card.isFlipped || card.isMatched }">
      <!-- Back face -->
      <div
        class="card-face card-back rounded-xl bg-indigo-500 dark:bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold cursor-pointer select-none shadow-md hover:bg-indigo-400 dark:hover:bg-indigo-500 transition-colors"
        @click="emit('flip', card.id)"
      >
        ?
      </div>

      <!-- Front face -->
      <div
        class="card-face card-front rounded-xl shadow-md flex items-center justify-center select-none"
        :class="frontBgClass"
      >
        <span v-if="card.cardType !== 'color'" class="text-2xl font-bold" :class="textClass">
          {{ card.face.value }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MemoryCard } from '~/types/game'

const props = defineProps<{ card: MemoryCard }>()
const emit = defineEmits<{ flip: [id: number] }>()

const frontBgClass = computed(() => {
  if (props.card.cardType === 'color') {
    return props.card.face.value // e.g. 'bg-red-400'
  }
  return 'bg-white dark:bg-slate-700'
})

const textClass = computed(() => {
  return props.card.cardType === 'letter' ? 'text-slate-800 dark:text-slate-100' : ''
})
</script>

<style scoped>
.card-perspective {
  perspective: 600px;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.5s ease;
}

.card-inner.is-flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.card-front {
  transform: rotateY(180deg);
}
</style>
