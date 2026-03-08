# Project Memory: Daily Kids Games

## Stack
- Nuxt 3 / Vue 3 Composition API, TypeScript, Tailwind CSS
- localStorage for state + stats persistence
- canvas-confetti for fireworks (useConfetti.ts)

## Architecture Patterns
- Daily seeding: EPOCH = 2026-04-01, dayIndex = days since epoch, dateKey = YYYY-MM-DD
- Game state: module-level `reactive<T>` singleton in composable, persisted to localStorage
- State key format: `{game}-state-{dateKey}` (clean stale keys on init)
- Stats key format: `{game}-stats`
- Guard duplicate stat recording: `if (s.lastPlayedDate === dateKey) return`
- Components auto-imported by Nuxt using folder prefix (e.g. `components/memory/GameBoard.vue` → `<MemoryGameBoard />`)
- Pages use `<ClientOnly>` wrapper to avoid SSR issues with localStorage

## Games
### Unscramble (`/unscramble`)
- Word list in `app/data/words.ts`
- Normal + hard modes, 6/5 guesses, hint system
- Stats: gamesPlayed, gamesWon, currentStreak, maxStreak, guessDistribution

### Memory Match (`/memory`)
- 5x4 grid, 10 pairs, card type rotates daily: emoji → color → letter (cycle of 3)
- Card flip: CSS 3D transform in `<style scoped>` of MemoryCard.vue
- Stats: gamesPlayed, currentStreak, maxStreak, bestTime, totalTime (avg derived at read)
- Replay allowed without re-recording stats (statsRecorded flag in state)
- Data: `app/data/memoryCards.ts`
- Composables: `useMemoryDay.ts`, `useMemoryStats.ts`, `useMemoryGame.ts`

## Key Files
- `app/types/game.ts` — all TypeScript interfaces
- `app/assets/css/main.css` — global keyframes (modal-in, reveal, pop)
- `app/components/hub/GameCard.vue` — hub card, colors: indigo|amber|green|rose|teal
- `app/pages/index.vue` — hub home page
