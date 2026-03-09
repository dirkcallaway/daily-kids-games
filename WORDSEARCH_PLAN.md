# Word Search Game — Implementation Plan

## Summary

A daily themed word search where players find 5 words hidden in a 12×12 grid. Each day a new theme (e.g. "Animals", "Food", "Space") is selected, and 5 words from that theme are seeded into the grid. Words run in 4 directions only (left→right, right→left, top→bottom, bottom→top — no diagonals). Single mode, no difficulty levels.

---

## 1. TypeScript Types (`app/types/game.ts`)

Append to end of file:

```typescript
// --- Word Search Types ---

export type WordSearchDirection = 'right' | 'left' | 'down' | 'up'

export interface WordSearchPlacement {
  word: string
  row: number       // starting row (0-indexed)
  col: number       // starting col (0-indexed)
  direction: WordSearchDirection
}

export interface WordSearchCell {
  letter: string
  wordIndices: number[]   // which word indices occupy this cell (supports overlaps)
  isFound: boolean
}

export interface WordSearchGameState {
  theme: string
  words: string[]           // 5 words for the day, uppercase
  clues: string[]           // parallel clues
  grid: WordSearchCell[][]  // 12x12
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
  bestTime: number | null   // seconds
  lastPlayedDate: string | null
  lastWonDate: string | null
}
```

---

## 2. New Files to Create

### `app/utils/wordSearchGrid.ts`

Pure utility — no Vue/Nuxt dependencies. Exports `buildWordSearchGrid(words, seed, gridSize=12)`.

**Algorithm:**
1. Sort words longest-first (harder to place → place first)
2. For each word, generate a shuffled list of all valid (row, col, direction) candidates using seeded RNG
3. Try each candidate with `canPlace` (cell is empty OR already has the matching letter)
4. On match, `doPlace` (write letter + push wordIndex to cell)
5. If no candidate works, brute-force scan all 576 (12×12×4) combos as fallback
6. Fill empty cells with random A–Z letters

Key helpers:
- `lcgRandom(seed)` — same LCG used in memory game
- `canPlace` — checks boundary + existing letters don't conflict
- `doPlace` — writes letters and `wordIndices` to cells (supports overlap)
- `generateCandidates` — all valid starts for a word in a direction, seeded-shuffled

### `app/composables/useWordSearchDay.ts`

Daily seed provider, mirrors `useMemoryDay.ts`.

1. Compute `dateKey` and `dayIndex` from EPOCH (2026-04-01)
2. Group `WORD_LIST` by theme
3. Filter to themes with ≥ 5 words, sort for determinism
4. Pick theme: `dayIndex % validThemeCount`
5. Seeded-shuffle that theme's words, take first 5
6. Call `buildWordSearchGrid(words, dayIndex + 100)` (offset decouples word selection from grid layout)
7. Return `{ theme, words, clues, grid, placements, dateKey, dayIndex }`

### `app/composables/useWordSearchGame.ts`

Module-level `reactive<WordSearchGameState>` singleton.

**`initGame(theme, words, clues, grid, placements, dateKey)`**
- Clean stale localStorage keys
- Load saved state or build fresh
- Resume timer if was playing

**`selectCell(row, col)`** — core interaction:
1. If no `selectStart`: set it, start timer on first interaction
2. Same cell tapped again: cancel (clear `selectStart`)
3. Check if start→end forms a valid direction (`getDirection`)
4. Not aligned: treat second tap as new `selectStart`
5. Extract word string along the line
6. Match against unfound words (forward or reversed)
7. Validate match against placements (confirms real placement, not coincidental spelling)
8. If match: push to `foundWords`, mark cells `isFound`, check win
9. On win: stop timer, record stats (once), show modal

**`getDirection(r1,c1,r2,c2)`** returns `'right'|'left'|'down'|'up'|null`

**Timer:** same pattern as `useMemoryGame` — `setInterval` every second, save to localStorage every 5s

### `app/composables/useWordSearchStats.ts`

Copy `useMemoryStats.ts` structure. Stats: `gamesPlayed`, `currentStreak`, `maxStreak`, `bestTime`, `lastPlayedDate`, `lastWonDate`. Dedup guard: `if (s.lastPlayedDate === dateKey) return`.

---

## 3. Components

### `app/components/wordsearch/GameBoard.vue`

Orchestrator. Calls all composables, passes data to children.

- Header: back link + title + theme badge
- `<MemoryTimerDisplay :seconds="state.elapsedSeconds" />` (reuse directly)
- `<WordsearchWordList :words :clues :found-words />`
- `<WordsearchGrid :grid :select-start @cell-click="selectCell" />`
- `<WordsearchResultModal v-if="showModal && won" :elapsed :stats @close />`

On `gameStatus === 'won'`: delay 600ms then show modal, confetti at 300ms.

### `app/components/wordsearch/Grid.vue`

"Dumb" display component. 12×12 CSS grid, `aspect-square` for both container and cells.

```html
<div class="grid gap-0.5 w-full aspect-square select-none touch-none"
     :style="{ gridTemplateColumns: 'repeat(12, minmax(0, 1fr))' }">
  <template v-for="(row, rowIdx) in grid" :key="rowIdx">
    <button v-for="(cell, colIdx) in row" :key="`${rowIdx}-${colIdx}`"
            class="aspect-square flex items-center justify-center rounded text-xs font-bold uppercase"
            :class="cellClass(rowIdx, colIdx, cell)"
            @click="emit('cellClick', rowIdx, colIdx)"
            @mouseover="hoverCell = [rowIdx, colIdx]">
      {{ cell.letter }}
    </button>
  </template>
</div>
```

**Cell colors:**
- Default: `bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100`
- Found: `bg-green-400 dark:bg-green-600 text-white`
- Selected start: `bg-blue-400 dark:bg-blue-600 text-white ring-2 ring-blue-600`
- In-progress line (start→hover, local ref only): `bg-blue-200 dark:bg-blue-900`

The in-progress highlight uses a local `hoverCell` ref (not persisted) — compute cells on the line between `selectStart` and `hoverCell`.

### `app/components/wordsearch/WordList.vue`

`grid-cols-2 sm:grid-cols-3` layout. Each word card shows the word (strikethrough + green when found) and clue below it in small text.

### `app/components/wordsearch/ResultModal.vue`

Same structure as `MemoryResultModal.vue`. Shows: emoji 🔍, time taken, stats row (Played / Streak / Best), "Come back tomorrow!" message, Done button. Uses `modal-in` keyframe from `main.css`. No replay button.

### `app/pages/wordsearch/index.vue`

```html
<template>
  <ClientOnly>
    <WordsearchGameBoard />
  </ClientOnly>
</template>
```

---

## 4. Enable Hub Card (`app/pages/index.vue`)

Change line 35: `:available="false"` → `:available="true"` on the Word Search card.

---

## 5. Build Order

1. Types (`app/types/game.ts`)
2. `app/utils/wordSearchGrid.ts`
3. `app/composables/useWordSearchDay.ts`
4. `app/composables/useWordSearchStats.ts`
5. `app/composables/useWordSearchGame.ts`
6. `app/components/wordsearch/WordList.vue`
7. `app/components/wordsearch/Grid.vue`
8. `app/components/wordsearch/ResultModal.vue`
9. `app/components/wordsearch/GameBoard.vue`
10. `app/pages/wordsearch/index.vue`
11. Enable hub card in `app/pages/index.vue`

---

## 6. Key Design Notes

- **Overlap support:** `wordIndices: number[]` per cell handles 2 words sharing a letter at the same cell — both get colored green when each is found
- **Backwards selection:** Player can tap end-to-start; `selectCell` checks `selectedWord === reverseStr(word)` and validates against `oppositeDir(placement.direction)`
- **Grid size:** 12×12 = 144 cells, 5 words × max 12 letters = 60 cells max — very sparse, placement failures essentially impossible
- **localStorage size:** ~5 KB per day, well within limits
- **Touch targets:** ~36–38px per cell on a 375px phone — acceptable for word search; `touch-none` prevents scroll conflict
- **Reuse:** `MemoryTimerDisplay` works as-is (takes `:seconds`); `useConfetti` works as-is
