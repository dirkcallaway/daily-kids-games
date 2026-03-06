import { reactive } from 'vue';
import type { GameState, GameMode, GuessLetter, Tile } from '~/types/game';
import { scrambleWord } from '~/utils/scramble';
import { useStats } from '~/composables/useStats';

const STATE_PREFIX = 'unscramble-state';

function stateKey(dateKey: string, mode: GameMode): string {
  return `${STATE_PREFIX}-${dateKey}-${mode}`;
}

function buildFreshState(mode: GameMode, wordEntry: GameState['wordEntry'], dateKey: string): GameState {
  return {
    mode,
    wordEntry,
    scrambledTiles: scrambleWord(wordEntry.word, dateKey),
    guesses: [],
    currentGuess: Array(wordEntry.word.length).fill(null),
    currentTileIds: Array(wordEntry.word.length).fill(null),
    lockedPositions: Array(wordEntry.word.length).fill(null),
    hintUsed: false,
    hintPosition: null,
    gameStatus: 'playing',
    maxGuesses: mode === 'hard' ? 5 : 6,
    dateKey,
  };
}

const state = reactive<GameState>(buildFreshState('normal', { word: 'LOADING', theme: '', clue: '' }, ''));

export function useGameState() {
  const { recordResult } = useStats();

  function initGame(mode: GameMode, wordEntry: GameState['wordEntry'], dateKey: string) {
    // Clean up old state keys
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(STATE_PREFIX) && !key.includes(dateKey)) {
        localStorage.removeItem(key);
      }
    }

    const saved = localStorage.getItem(stateKey(dateKey, mode));
    const loaded: GameState = saved ? JSON.parse(saved) : buildFreshState(mode, wordEntry, dateKey);
    Object.assign(state, loaded);
  }

  function saveState() {
    localStorage.setItem(stateKey(state.dateKey, state.mode), JSON.stringify(state));
  }

  function placeTile(tileId: string) {
    if (state.gameStatus !== 'playing') return;
    const tile = state.scrambledTiles.find(t => t.id === tileId);
    if (!tile || tile.isUsed) return;

    const nextSlot = state.currentGuess.findIndex(
      (v, i) => v === null && state.lockedPositions[i] === null
    );
    if (nextSlot === -1) return;

    tile.isUsed = true;
    state.currentGuess[nextSlot] = tile.letter;
    state.currentTileIds[nextSlot] = tileId;
  }

  function removeLast() {
    if (state.gameStatus !== 'playing') return;

    // Find last non-locked filled slot
    let lastSlot = -1;
    for (let i = state.currentGuess.length - 1; i >= 0; i--) {
      if (state.currentGuess[i] !== null && state.lockedPositions[i] === null) {
        lastSlot = i;
        break;
      }
    }
    if (lastSlot === -1) return;

    const tileId = state.currentTileIds[lastSlot];
    if (tileId) {
      const tile = state.scrambledTiles.find(t => t.id === tileId);
      if (tile) tile.isUsed = false;
    }

    state.currentGuess[lastSlot] = null;
    state.currentTileIds[lastSlot] = null;
  }

  function submitGuess() {
    if (state.gameStatus !== 'playing') return;

    // Ensure all slots filled
    if (state.currentGuess.some(v => v === null)) return;

    const word = state.wordEntry.word;
    const letters: GuessLetter[] = state.currentGuess.map((letter, i) => ({
      letter: letter!,
      state: letter === word[i] ? 'correct' : 'absent',
    }));

    const isCorrect = letters.every(l => l.state === 'correct');
    state.guesses.push({ letters, isComplete: true, isCorrect });

    if (isCorrect) {
      state.gameStatus = 'won';
      recordResult(state.mode, true, state.guesses.length, state.dateKey);
      saveState();
      return;
    }

    if (state.guesses.length >= state.maxGuesses) {
      state.gameStatus = 'lost';
      recordResult(state.mode, false, state.guesses.length, state.dateKey);
      saveState();
      return;
    }

    if (state.mode === 'normal') {
      // Lock correct positions
      letters.forEach((l, i) => {
        if (l.state === 'correct') state.lockedPositions[i] = l.letter;
      });

      // Rebuild tile bank from non-locked letters
      const nonLockedLetters = word.split('').filter((_, i) => state.lockedPositions[i] === null);
      state.scrambledTiles = scrambleWord(nonLockedLetters.join(''), state.dateKey + state.guesses.length);

      // Pre-fill next row with locked positions
      state.currentGuess = state.lockedPositions.map(l => l);
      state.currentTileIds = Array(word.length).fill(null);
    } else {
      // Hard mode: fresh slate
      state.scrambledTiles = scrambleWord(word, state.dateKey);
      state.currentGuess = Array(word.length).fill(null);
      state.currentTileIds = Array(word.length).fill(null);
    }

    saveState();
  }

  function useHint() {
    if (state.hintUsed || state.mode === 'hard' || state.gameStatus !== 'playing') return;

    const firstNonLocked = state.lockedPositions.findIndex(l => l === null);
    if (firstNonLocked === -1) return;

    const correctLetter = state.wordEntry.word[firstNonLocked]!;
    state.lockedPositions[firstNonLocked] = correctLetter;
    state.currentGuess[firstNonLocked] = correctLetter;
    state.hintUsed = true;
    state.hintPosition = firstNonLocked;

    // Mark the matching tile as used
    const tile = state.scrambledTiles.find(
      t => t.letter === correctLetter && !t.isUsed
    );
    if (tile) tile.isUsed = true;

    saveState();
  }

  return { state, initGame, placeTile, removeLast, submitGuess, useHint };
}
