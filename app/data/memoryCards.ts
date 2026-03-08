export interface CardPair {
  pairKey: string
  valueA: string
  valueB: string
}

export const EMOJI_PAIRS: CardPair[] = [
  { pairKey: 'cat',     valueA: '🐱', valueB: '🐱' },
  { pairKey: 'dog',     valueA: '🐶', valueB: '🐶' },
  { pairKey: 'frog',    valueA: '🐸', valueB: '🐸' },
  { pairKey: 'lion',    valueA: '🦁', valueB: '🦁' },
  { pairKey: 'rabbit',  valueA: '🐰', valueB: '🐰' },
  { pairKey: 'penguin', valueA: '🐧', valueB: '🐧' },
  { pairKey: 'fox',     valueA: '🦊', valueB: '🦊' },
  { pairKey: 'bear',    valueA: '🐻', valueB: '🐻' },
  { pairKey: 'monkey',  valueA: '🐵', valueB: '🐵' },
  { pairKey: 'turtle',  valueA: '🐢', valueB: '🐢' },
]

// value is a Tailwind bg class — the card face renders as a solid color square
export const COLOR_PAIRS: CardPair[] = [
  { pairKey: 'red',    valueA: 'bg-red-400',    valueB: 'bg-red-400'    },
  { pairKey: 'orange', valueA: 'bg-orange-400', valueB: 'bg-orange-400' },
  { pairKey: 'yellow', valueA: 'bg-yellow-300', valueB: 'bg-yellow-300' },
  { pairKey: 'green',  valueA: 'bg-green-400',  valueB: 'bg-green-400'  },
  { pairKey: 'teal',   valueA: 'bg-teal-400',   valueB: 'bg-teal-400'   },
  { pairKey: 'blue',   valueA: 'bg-blue-400',   valueB: 'bg-blue-400'   },
  { pairKey: 'indigo', valueA: 'bg-indigo-400', valueB: 'bg-indigo-400' },
  { pairKey: 'purple', valueA: 'bg-purple-400', valueB: 'bg-purple-400' },
  { pairKey: 'pink',   valueA: 'bg-pink-400',   valueB: 'bg-pink-400'   },
  { pairKey: 'rose',   valueA: 'bg-rose-400',   valueB: 'bg-rose-400'   },
]

// pairKey is uppercase — uppercase + lowercase of the same letter form a pair
export const LETTER_PAIRS: CardPair[] = [
  { pairKey: 'A', valueA: 'A', valueB: 'a' },
  { pairKey: 'B', valueA: 'B', valueB: 'b' },
  { pairKey: 'C', valueA: 'C', valueB: 'c' },
  { pairKey: 'D', valueA: 'D', valueB: 'd' },
  { pairKey: 'E', valueA: 'E', valueB: 'e' },
  { pairKey: 'F', valueA: 'F', valueB: 'f' },
  { pairKey: 'G', valueA: 'G', valueB: 'g' },
  { pairKey: 'H', valueA: 'H', valueB: 'h' },
  { pairKey: 'I', valueA: 'I', valueB: 'i' },
  { pairKey: 'J', valueA: 'J', valueB: 'j' },
]
