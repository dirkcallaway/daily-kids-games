<script setup lang="ts">
import type { GameMode } from '~/types/game';
import { useGameState } from '~/composables/useGameState';
import { useWordOfDay } from '~/composables/useWordOfDay';

const { state, initGame, placeTile, removeLast, submitGuess } = useGameState();
const { wordEntry, dateKey } = useWordOfDay();

onMounted(() => {
  const savedMode = (localStorage.getItem('unscramble-mode-pref') ?? 'normal') as GameMode;
  initGame(savedMode, wordEntry, dateKey);
});

function switchMode(newMode: GameMode) {
  localStorage.setItem('unscramble-mode-pref', newMode);
  initGame(newMode, wordEntry, dateKey);
};

const hasStarted = computed(() => state.guesses.length > 0);

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
    <div class="flex flex-col items-center gap-2 w-full">
      <UnscrambleModeToggle
        :mode="state.mode"
        :has-started="hasStarted"
        @switch="switchMode"
      />
      <template v-if="state.mode === 'normal'">
        <p class="text-sm font-semibold text-indigo-500 uppercase tracking-widest">
          {{ state.wordEntry.theme }}
        </p>
        <p class="text-slate-600 text-center">{{ state.wordEntry.clue }}</p>
      </template>
      <template v-else>
        <p class="text-sm font-semibold text-rose-500 uppercase tracking-widest">Hard Mode</p>
        <p class="text-slate-400 text-sm text-center">No clues. Figure it out!</p>
      </template>
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
