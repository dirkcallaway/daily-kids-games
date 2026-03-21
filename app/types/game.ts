export type GameMode = 'normal' | 'hard'
export type LetterState = 'correct' | 'absent' | 'pending' | 'locked'

export interface GuessLetter {
  letter: string
  state: LetterState
}

export interface GuessRecord {
  letters: GuessLetter[]
  isComplete: boolean
  isCorrect: boolean
}

export interface Tile {
  id: string
  letter: string
  isUsed: boolean
}

export interface WordEntry {
  word: string
  theme: string
  clue: string
}

export interface GameState {
  mode: GameMode
  wordEntry: WordEntry
  scrambledTiles: Tile[]
  guesses: GuessRecord[]
  currentGuess: (string | null)[]
  currentTileIds: (string | null)[]
  lockedPositions: (string | null)[]
  hintUsed: boolean
  hintPosition: number | null
  gameStatus: 'playing' | 'won' | 'lost'
  maxGuesses: number
  dateKey: string
}

export interface ModeStats {
  gamesPlayed: number
  gamesWon: number
  currentStreak: number
  maxStreak: number
  guessDistribution: Record<number, number>
  lastWonDate: string | null
  lastPlayedDate: string | null
}

export interface AllStats {
  normal: ModeStats
  hard: ModeStats
}

// --- Memory Match Types ---

export type MemoryCardType = 'emoji' | 'color' | 'letter'

export interface MemoryCardFace {
  value: string   // emoji char | Tailwind bg class | letter char
  pairKey: string // canonical match key (uppercase letter for letter pairs)
}

export interface MemoryCard {
  id: number
  face: MemoryCardFace
  cardType: MemoryCardType
  isFlipped: boolean
  isMatched: boolean
}

export interface MemoryGameState {
  cards: MemoryCard[]
  flippedIds: number[]
  matchedPairKeys: string[]
  moves: number
  elapsedSeconds: number
  gameStatus: 'playing' | 'won'
  cardType: MemoryCardType
  dateKey: string
  statsRecorded: boolean
  isReplaying: boolean
  _replayCount: number
}

export interface MemoryStats {
  gamesPlayed: number
  currentStreak: number
  maxStreak: number
  bestTime: number | null
  totalTime: number
  lastPlayedDate: string | null
  lastWonDate: string | null
}

// --- Word Search Types ---

export type WordSearchDirection = 'right' | 'left' | 'down' | 'up'

export interface WordSearchPlacement {
  word: string
  row: number
  col: number
  direction: WordSearchDirection
}

export interface WordSearchCell {
  letter: string
  wordIndices: number[]
  isFound: boolean
}

export interface WordSearchGameState {
  theme: string
  words: string[]
  clues: string[]
  grid: WordSearchCell[][]
  placements: WordSearchPlacement[]
  foundWords: string[]
  selectStart: [number, number] | null
  elapsedSeconds: number
  gameStatus: 'playing' | 'won'
  dateKey: string
  statsRecorded: boolean
}

export interface WordSearchStats {
  gamesPlayed: number
  currentStreak: number
  maxStreak: number
  bestTime: number | null
  lastPlayedDate: string | null
  lastWonDate: string | null
}

// --- Hangman Types ---

export interface HangmanGameState {
  word: string
  theme: string
  clue: string
  guessedLetters: string[]
  gameStatus: 'playing' | 'won' | 'lost'
  dateKey: string
  statsRecorded: boolean
}

export interface HangmanStats {
  gamesPlayed: number
  gamesWon: number
  currentStreak: number
  maxStreak: number
  lastPlayedDate: string | null
  lastWonDate: string | null
}

// --- Emoji Math Types ---

export type EmojiOp = '+' | '−' | '×' | '÷'

export interface EmojiVar {
  symbol: string  // e.g. '🐱'
  value: number   // hidden answer
}

export interface EmojiEquation {
  aIdx: number    // index into EmojiVar[]
  op: EmojiOp
  bIdx: number
  result: number
}

export interface EmojiGuess {
  values: number[]
  feedback: ('correct' | 'wrong')[]
}

export interface EmojiMathGameState {
  dateKey: string
  mode: GameMode
  emojis: EmojiVar[]
  equations: EmojiEquation[]
  guesses: EmojiGuess[]
  currentValues: (number | null)[]
  gameStatus: 'playing' | 'won' | 'lost'
  hintUsed: boolean
  hintIndex: number | null
  statsRecorded: boolean
}
