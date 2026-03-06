<script setup lang="ts">
import { useGameState } from '~/composables/useGameState';
import { useWordOfDay } from '~/composables/useWordOfDay';

const { state, initGame, placeTile, removeLast, submitGuess } = useGameState();
const { wordEntry, dateKey } = useWordOfDay();

onMounted(() => {
  initGame('normal', wordEntry, dateKey);
});

const emptyRowCount = computed(() =>
  Math.max(0, state.maxGuesses - state.guesses.length - 1)
);

const allSlotsFilled = computed(() =>
  state.currentGuess.every(v => v !== null)
);
</script>

<template>
  <div class="flex flex-col items-center gap-6 p-4 max-w-md mx-auto">

    <!-- Header -->
    <div class="text-center">
      <p class="text-sm font-semibold text-indigo-500 uppercase tracking-widest">
        {{ state.wordEntry.theme }}
      </p>
      <p class="text-slate-600 mt-1">{{ state.wordEntry.clue }}</p>
    </div>

    <!-- Guess rows -->
    <div class="flex flex-col gap-2">
      <UnscrambleGuessRow
        v-for="(guess, i) in state.guesses"
        :key="i"
        :guess="guess"
        :word-length="state.wordEntry.word.length"
        :current-guess="[]"
        :locked-positions="[]"
        :is-current="false"
      />

      <!-- Current row (only if game still playing) -->
      <UnscrambleGuessRow
        v-if="state.gameStatus === 'playing'"
        :guess="null"
        :word-length="state.wordEntry.word.length"
        :current-guess="state.currentGuess"
        :locked-positions="state.lockedPositions"
        :is-current="true"
      />

      <!-- Empty future rows -->
      <UnscrambleGuessRow
        v-for="i in emptyRowCount"
        :key="`empty-${i}`"
        :guess="null"
        :word-length="state.wordEntry.word.length"
        :current-guess="[]"
        :locked-positions="[]"
        :is-current="false"
      />
    </div>

    <!-- Tile bank -->
    <UnscrambleTileBank
      :tiles="state.scrambledTiles"
      @tile-placed="placeTile"
    />

    <!-- Controls -->
    <div class="flex gap-3">
      <button
        class="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 font-semibold"
        @click="removeLast"
      >
        ← Back
      </button>
      <button
        class="px-4 py-2 rounded-lg font-semibold transition-colors"
        :class="allSlotsFilled
          ? 'bg-indigo-500 text-white'
          : 'bg-slate-200 text-slate-400 cursor-not-allowed'"
        :disabled="!allSlotsFilled"
        @click="submitGuess"
      >
        Submit
      </button>
    </div>

  </div>
</template>
