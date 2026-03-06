<script setup lang="ts">
import type { GuessRecord, GameState } from '~/types/game';

const props = defineProps<{
  guess: GuessRecord | null;
  wordLength: number;
  currentGuess: (string | null)[];
  lockedPositions: (string | null)[];
  isCurrent: boolean;
}>();
</script>

<template>
  <div class="flex gap-2 justify-center">
    <!-- Completed row -->
    <template v-if="guess">
      <UnscrambleAnswerSlot
        v-for="(gl, i) in guess.letters"
        :key="i"
        :letter="gl.letter"
        :state="gl.state"
      />
    </template>

    <!-- Current active row -->
    <template v-else-if="isCurrent">
      <UnscrambleAnswerSlot
        v-for="i in wordLength"
        :key="i - 1"
        :letter="currentGuess[i - 1] ?? null"
        :state="lockedPositions[i - 1] !== null ? 'locked' : 'pending'"
      />
    </template>

    <!-- Empty future row -->
    <template v-else>
      <UnscrambleAnswerSlot
        v-for="i in wordLength"
        :key="i - 1"
        :letter="null"
        state="pending"
      />
    </template>
  </div>
</template>
