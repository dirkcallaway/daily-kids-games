import type { SnowmanGameState, WordEntry } from '~/types/game';
import { useSnowmanStats } from '~/composables/useSnowmanStats';

const MAX_WRONG = 6;

const STATE_PREFIX = 'snowman-state-';

function stateKey(dateKey: string) {
  return `${STATE_PREFIX}${dateKey}`;
}

function cleanOldState(currentDateKey: string) {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STATE_PREFIX) && key !== stateKey(currentDateKey)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));
}

export function useSnowmanGame() {
  const { recordResult } = useSnowmanStats();

  const state = reactive<SnowmanGameState>({
    word: '',
    theme: '',
    clue: '',
    guessedLetters: [],
    gameStatus: 'playing',
    dateKey: '',
    statsRecorded: false,
  });

  const wrongLetters = computed(() =>
    state.guessedLetters.filter(l => !state.word.includes(l))
  );

  const wrongCount = computed(() => wrongLetters.value.length);

  function isLetterGuessed(letter: string) {
    return state.guessedLetters.includes(letter);
  }

  function isLetterCorrect(letter: string) {
    return state.word.includes(letter) && state.guessedLetters.includes(letter);
  }

  function isLetterWrong(letter: string) {
    return !state.word.includes(letter) && state.guessedLetters.includes(letter);
  }

  function persist() {
    localStorage.setItem(stateKey(state.dateKey), JSON.stringify({
      word: state.word,
      theme: state.theme,
      clue: state.clue,
      guessedLetters: state.guessedLetters,
      gameStatus: state.gameStatus,
      dateKey: state.dateKey,
      statsRecorded: state.statsRecorded,
    }));
  }

  function initGame(wordEntry: WordEntry, dateKey: string) {
    cleanOldState(dateKey);

    const saved = localStorage.getItem(stateKey(dateKey));
    if (saved) {
      try {
        const parsed: SnowmanGameState = JSON.parse(saved);
        state.word = parsed.word;
        state.theme = parsed.theme;
        state.clue = parsed.clue;
        state.guessedLetters = parsed.guessedLetters;
        state.gameStatus = parsed.gameStatus;
        state.dateKey = parsed.dateKey;
        state.statsRecorded = parsed.statsRecorded;
        return;
      } catch {}
    }

    state.word = wordEntry.word.toUpperCase();
    state.theme = wordEntry.theme;
    state.clue = wordEntry.clue;
    state.guessedLetters = [];
    state.gameStatus = 'playing';
    state.dateKey = dateKey;
    state.statsRecorded = false;
    persist();
  }

  function guessLetter(letter: string) {
    if (state.gameStatus !== 'playing') return;
    const upper = letter.toUpperCase();
    if (state.guessedLetters.includes(upper)) return;

    state.guessedLetters.push(upper);

    const wordLetters = state.word.split('');
    const allRevealed = wordLetters.every(l => state.guessedLetters.includes(l));

    if (allRevealed) {
      state.gameStatus = 'won';
    } else if (wrongCount.value >= MAX_WRONG) {
      state.gameStatus = 'lost';
    }

    if (state.gameStatus !== 'playing' && !state.statsRecorded) {
      recordResult(state.gameStatus === 'won', state.dateKey);
      state.statsRecorded = true;
    }

    persist();
  }

  return {
    state,
    wrongLetters,
    wrongCount,
    MAX_WRONG,
    isLetterGuessed,
    isLetterCorrect,
    isLetterWrong,
    initGame,
    guessLetter,
  };
}
