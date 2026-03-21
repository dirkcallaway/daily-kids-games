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
  <div
    class="grid gap-2 w-full mx-auto"
    :style="`grid-template-columns: repeat(${wordLength}, minmax(0, 1fr)); max-width: calc(${wordLength} * 3rem + ${wordLength - 1} * 0.5rem)`"
  >
    <!-- Completed row -->
    <template v-if="guess">
      <UnscrambleAnswerSlot
        v-for="(gl, i) in guess.letters"
        :key="i"
        :letter="gl.letter"
        :state="gl.state"
        :index="i"
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
