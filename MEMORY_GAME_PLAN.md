# Memory Match Game — Implementation Plan

## Context
Adding a second game to the daily kids games hub. Memory Match is a 5x4 grid (20 tiles, 10 pairs) where players flip cards looking for matches. Card type rotates daily (emoji → color → letter). Timer counts up. Stats track days played/streaks/best time in localStorage. Replay is allowed without re-recording stats.

---

## Files to Create

```
app/data/memoryCards.ts
app/composables/useMemoryDay.ts
app/composables/useMemoryStats.ts
app/composables/useMemoryGame.ts
app/components/memory/MemoryCard.vue
app/components/memory/TimerDisplay.vue
app/components/memory/StatsPanel.vue
app/components/memory/ResultModal.vue
app/components/memory/GameBoard.vue
app/pages/memory/index.vue
```

## Files to Modify

```
app/types/game.ts          ← add Memory interfaces
app/pages/index.vue        ← add Memory Match HubGameCard
app/components/hub/GameCard.vue  ← add 'teal' to color prop union
```

---

## TypeScript Types (append to `app/types/game.ts`)

```typescript
export type MemoryCardType = 'emoji' | 'color' | 'letter';

export interface MemoryCardFace {
  value: string;    // emoji char | Tailwind bg class | letter char
  pairKey: string;  // canonical match key (uppercase letter for letter pairs)
}

export interface MemoryCard {
  id: number;
  face: MemoryCardFace;
  cardType: MemoryCardType;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface MemoryGameState {
  cards: MemoryCard[];
  flippedIds: number[];       // max 2 at a time
  matchedPairKeys: string[];
  moves: number;
  elapsedSeconds: number;
  gameStatus: 'playing' | 'won';
  cardType: MemoryCardType;
  dateKey: string;
  statsRecorded: boolean;     // prevents re-recording on replay
  isReplaying: boolean;
}

export interface MemoryStats {
  gamesPlayed: number;
  currentStreak: number;
  maxStreak: number;
  bestTime: number | null;    // seconds; null = never completed
  totalTime: number;          // sum of all completion times (for avg calc)
  lastPlayedDate: string | null;
  lastWonDate: string | null;
}
```

---

## Card Content Data (`app/data/memoryCards.ts`)

10 pairs per type:

- **Emojis**: 🐱 🐶 🐸 🦁 🐰 🐧 🦊 🐻 🐵 🐢
- **Colors**: Tailwind bg classes — red-400, orange-400, yellow-300, green-400, teal-400, blue-400, indigo-400, purple-400, pink-400, rose-400. Cards render as solid color squares (no text label).
- **Letters**: A/a, B/b, C/c, D/d, E/e, F/f, G/g, H/h, I/i, J/j. Uppercase + lowercase form a pair (pairKey = uppercase letter).

---

## Composables

### `useMemoryDay.ts`
- Same epoch/dayIndex pattern as `useWordOfDay.ts` (EPOCH = 2026-04-01)
- `safeIndex = ((dayIndex % 3) + 3) % 3` → selects card type from `['emoji', 'color', 'letter']`
- Raw `dayIndex` (not safeIndex) seeds the shuffle so permutation is unique every calendar day even when type repeats
- LCG shuffle: inline the same `lcgRandom` + `seededShuffle` logic from `app/utils/scramble.ts` (no import needed — self-contained)
- Returns: `{ cards: MemoryCard[], cardType, dateKey, dayIndex }`

### `useMemoryStats.ts`
- localStorage key: `'memory-stats'`
- `recordResult(elapsedSeconds, dateKey)`: guard `if (s.lastPlayedDate === dateKey) return`, update bestTime/totalTime/streak
- Streak: same yesterday-key logic as `useStats.ts`
- `getStats()`, `getAverageTime()` (derived at read time: `Math.round(totalTime / gamesPlayed)`, not stored)

### `useMemoryGame.ts`
- Module-level `reactive<MemoryGameState>` singleton (same pattern as `useGameState.ts`)
- `initGame(freshCards, cardType, dateKey)`: load from `memory-state-{dateKey}` or init fresh; clean stale keys
- `flipCard(cardId)`: guard already-flipped/matched/2-cards-up; start timer on first flip; after 2 flipped → `setTimeout(checkMatch, 800)`
- `checkMatch()` (private): match → set `isMatched`, push pairKey, check win; no match → reset `isFlipped`; on win → stop timer, call `recordResult` if `!state.statsRecorded`, set `statsRecorded = true`
- Timer: module-level `timerHandle`, `setInterval` 1s, save every 5s
- `replay()`: re-shuffle with seed offset `(dayIndex + replayCount * 1000)`, reset all transient state, leave `statsRecorded` unchanged
- `stopTimer()`: exported, called in `onUnmounted`

---

## Components

### `MemoryCard.vue`
- Props: `card: MemoryCard`
- Emits: `flip: [id]`
- CSS 3D flip via `<style scoped>`: `.card-inner { transform-style: preserve-3d; transition: transform 0.5s }`, `.is-flipped { transform: rotateY(180deg) }`, front/back with `backface-visibility: hidden`, front pre-rotated `rotateY(180deg)`
- Back face: indigo-500 with `?` — click handler here only
- Front face: renders emoji text, letter text, or empty div with color bg class
- `is-flipped` class active when `card.isFlipped || card.isMatched`

### `TimerDisplay.vue`
- Props: `seconds: number`
- Formats to `M:SS` (e.g., `1:05`), `0:00` when 0

### `StatsPanel.vue`
- Props: `stats: MemoryStats`, `averageTime: number | null`
- 4 stat boxes: Played / Streak / Best / Avg — same visual pattern as `unscramble/StatsPanel.vue`
- Helper: `formatTime(s: number | null)` → `'--'` or `M:SS`

### `ResultModal.vue`
- Props: `elapsedSeconds`, `stats`, `averageTime`
- Emits: `close`, `replay`
- Structure mirrors `unscramble/ResultModal.vue`: dark overlay, white/slate-800 card, trophy emoji, time, `<MemoryStatsPanel>`, Play Again + Close buttons

### `GameBoard.vue`
- Orchestrates all composables + components
- `watch(state.gameStatus)` → modal after 600ms + confetti after 300ms (same timing as Unscramble)
- Grid: `grid grid-cols-5 gap-2 max-w-sm mx-auto` with `aspect-square` cards (~56px on 375px screen)
- Header: back-to-games link, card type badge, `<TimerDisplay>`
- `onMounted` → `initGame`, `onUnmounted` → `stopTimer`

### `pages/memory/index.vue`
- Identical pattern to `pages/unscramble/index.vue` — `<ClientOnly><MemoryGameBoard /></ClientOnly>`

---

## Hub Update (`pages/index.vue`)
Add alongside existing cards:
```vue
<HubGameCard title="Memory Match" description="Find all the matching pairs" route="/memory" color="teal" :available="true" />
```
Also add `'teal'` to the `color` prop union in `GameCard.vue`.

---

## Implementation Order
1. Types (`game.ts`)
2. Card data (`memoryCards.ts`)
3. `useMemoryDay.ts`
4. `useMemoryStats.ts`
5. `useMemoryGame.ts`
6. `MemoryCard.vue` (test flip animation in isolation)
7. `TimerDisplay.vue`
8. `StatsPanel.vue`
9. `ResultModal.vue`
10. `GameBoard.vue`
11. `pages/memory/index.vue`
12. Hub page + `GameCard.vue` color update

---

## Verification Checklist
- Refresh mid-game → same board restores from localStorage
- Complete game → modal appears, confetti fires, stats recorded
- Play Again → new shuffle, timer resets, stats NOT re-recorded
- Navigate away mid-game → return, timer not still running
- Dark mode on all new components
- 375px screen (iPhone SE) → 5-col grid ~56px cards, readable
- Manually set `lastWonDate` to yesterday → streak increments on next play
