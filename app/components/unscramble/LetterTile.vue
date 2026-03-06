<script setup lang="ts">
import type { Tile } from '~/types/game';

const props = defineProps<{
  tile: Tile;
}>();

const emit = defineEmits<{
  click: [tileId: string];
}>();

const colors = [
  'bg-red-400', 'bg-orange-400', 'bg-yellow-400',
  'bg-green-400', 'bg-teal-400', 'bg-blue-400',
  'bg-indigo-400', 'bg-purple-400', 'bg-pink-400',
];

const color = computed(() => {
  const index = props.tile.id.split('-')[1];
  return colors[Number(index) % colors.length];
});
</script>

<template>
  <button
    class="flex items-center justify-center w-12 h-12 rounded-lg font-bold text-xl uppercase text-white shadow-md transition-all active:scale-90"
    :class="[color, tile.isUsed ? 'opacity-0 pointer-events-none' : 'opacity-100']"
    @click="emit('click', tile.id)"
  >
    {{ tile.letter }}
  </button>
</template>
