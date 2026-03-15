<script setup lang="ts">
import type { WordSearchCell, WordSearchDirection } from '~/types/game'

const props = defineProps<{
  grid: WordSearchCell[][]
  selectStart: [number, number] | null
}>()

const emit = defineEmits<{
  cellClick: [row: number, col: number]
}>()

const hoverCell = ref<[number, number] | null>(null)
const gridSize = computed(() => props.grid[0]?.length ?? 10)

const DIRECTION_DELTAS: Record<WordSearchDirection, [number, number]> = {
  right: [0, 1],
  left:  [0, -1],
  down:  [1, 0],
  up:    [-1, 0],
}

function getDirection(
  r1: number, c1: number,
  r2: number, c2: number
): WordSearchDirection | null {
  if (r1 === r2 && c2 > c1) return 'right'
  if (r1 === r2 && c2 < c1) return 'left'
  if (c1 === c2 && r2 > r1) return 'down'
  if (c1 === c2 && r2 < r1) return 'up'
  return null
}

function isOnLine(
  sr: number, sc: number,
  er: number, ec: number,
  row: number, col: number,
  dir: WordSearchDirection
): boolean {
  const [dRow, dCol] = DIRECTION_DELTAS[dir]
  let r = sr
  let c = sc
  while (true) {
    if (r === row && c === col) return true
    if (r === er && c === ec) break
    r += dRow
    c += dCol
    if (r < 0 || r >= gridSize.value || c < 0 || c >= gridSize.value) break
  }
  return false
}

function cellClass(row: number, col: number, cell: WordSearchCell): string {
  if (cell.isFound) {
    return 'bg-green-400 dark:bg-green-600 text-white'
  }

  const isStart = props.selectStart?.[0] === row && props.selectStart?.[1] === col
  if (isStart) {
    return 'bg-blue-500 dark:bg-blue-600 text-white ring-2 ring-blue-600 dark:ring-blue-400'
  }

  // In-progress line preview
  if (props.selectStart && hoverCell.value) {
    const [sr, sc] = props.selectStart
    const [hr, hc] = hoverCell.value
    const dir = getDirection(sr, sc, hr, hc)
    if (dir && isOnLine(sr, sc, hr, hc, row, col, dir)) {
      return 'bg-blue-200 dark:bg-blue-900 text-slate-800 dark:text-slate-100'
    }
  }

  return 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-600'
}
</script>

<template>
  <div
    class="grid gap-0.5 w-full aspect-square select-none touch-none"
    :style="{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }"
    @mouseleave="hoverCell = null"
  >
    <template v-for="(row, rowIdx) in grid" :key="rowIdx">
      <button
        v-for="(cell, colIdx) in row"
        :key="`${rowIdx}-${colIdx}`"
        class="aspect-square flex items-center justify-center rounded text-xs font-bold uppercase transition-colors duration-100 cursor-pointer"
        :class="cellClass(rowIdx, colIdx, cell)"
        @click="emit('cellClick', rowIdx, colIdx)"
        @mouseover="hoverCell = [rowIdx, colIdx]"
      >
        {{ cell.letter }}
      </button>
    </template>
  </div>
</template>
