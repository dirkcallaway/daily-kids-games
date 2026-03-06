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
  <div class="flex flex-wrap justify-center gap-2 p-4">
    <UnscrambleLetterTile
      v-for="tile in tiles"
      :key="tile.id"
      :tile="tile"
      @click="emit('tilePlaced', tile.id)"
    />
  </div>
</template>
