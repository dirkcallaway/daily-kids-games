<script setup lang="ts">
import type { Tile } from '~/types/game';

defineProps<{
  tiles: Tile[];
}>();

const emit = defineEmits<{
  tilePlaced: [tileId: string];
}>();
</script>

<template>
  <div
    class="grid gap-2 w-full mx-auto"
    :style="`grid-template-columns: repeat(${tiles.length}, minmax(0, 1fr)); max-width: calc(${tiles.length} * 3rem + ${tiles.length - 1} * 0.5rem)`"
  >
    <UnscrambleLetterTile
      v-for="tile in tiles"
      :key="tile.id"
      :tile="tile"
      @click="emit('tilePlaced', tile.id)"
    />
  </div>
</template>
