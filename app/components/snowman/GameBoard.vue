<script setup lang="ts">
import { useSnowmanGame } from '~/composables/useSnowmanGame';
import { useWordOfDay } from '~/composables/useWordOfDay';
import { useSnowmanStats } from '~/composables/useSnowmanStats';
import { useConfetti } from '~/composables/useConfetti';

const { state, wrongCount, MAX_WRONG, initGame, guessLetter } = useSnowmanGame();
const { wordEntry, dateKey } = useWordOfDay(50);
const { getStats } = useSnowmanStats();
const { launchFireworks } = useConfetti();

const showModal = ref(false);
const currentStats = ref(getStats());

watch(() => state.gameStatus, (status) => {
  if (status === 'won' || status === 'lost') {
    currentStats.value = getStats();
    setTimeout(() => { showModal.value = true; }, 600);
  }
  if (status === 'won') {
    setTimeout(launchFireworks, 300);
  }
});

onMounted(() => {
  initGame(wordEntry, dateKey);
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});

function handleKeydown(e: KeyboardEvent) {
  if (state.gameStatus !== 'playing') return;
  if (/^[a-zA-Z]$/.test(e.key)) {
    guessLetter(e.key.toUpperCase());
  }
}

const triesLeft = computed(() => MAX_WRONG - wrongCount.value);
const gameResult = computed(() => state.gameStatus as 'won' | 'lost');
</script>

<template>
  <div class="flex flex-col items-center gap-5 p-4 max-w-md mx-auto">

    <!-- Header -->
    <div class="flex flex-col items-center gap-1 w-full">
      <div class="w-full flex justify-start">
        <NuxtLink to="/" class="text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
          ← Games
        </NuxtLink>
      </div>
      <p class="text-sm font-semibold text-amber-500 uppercase tracking-widest">
        {{ state.theme }}
      </p>
      <p class="text-slate-600 dark:text-slate-300 text-center text-sm">{{ state.clue }}</p>
    </div>

    <!-- Tries remaining -->
    <p class="text-sm text-slate-500 dark:text-slate-400">
      <span
        class="font-bold"
        :class="triesLeft <= 2 ? 'text-rose-500' : 'text-slate-700 dark:text-slate-200'"
      >{{ triesLeft }}</span>
      {{ triesLeft === 1 ? 'try' : 'tries' }} left
    </p>

    <!-- Snowman figure -->
    <SnowmanFigure :wrong-count="wrongCount" />

    <!-- Word display -->
    <SnowmanWordDisplay
      :word="state.word"
      :guessed-letters="state.guessedLetters"
    />

    <!-- Letter grid -->
    <SnowmanLetterGrid
      :guessed-letters="state.guessedLetters"
      :word="state.word"
      :game-status="state.gameStatus"
      @guess="guessLetter"
    />

    <!-- Stats panel -->
    <SnowmanStatsPanel :stats="currentStats" />

    <!-- Result modal -->
    <SnowmanResultModal
      v-if="showModal && state.gameStatus !== 'playing'"
      :status="gameResult"
      :word="state.word"
      :stats="currentStats"
      @close="showModal = false"
    />

  </div>
</template>
