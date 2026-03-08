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
