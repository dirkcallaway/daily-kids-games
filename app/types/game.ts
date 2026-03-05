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
