<script setup lang="ts">
defineProps<{ wrongCount: number }>();
</script>

<template>
  <svg
    viewBox="0 0 120 160"
    class="w-40 h-48 sm:w-48 sm:h-56"
    stroke-linecap="round"
    stroke-linejoin="round"
    fill="none"
  >
    <!-- Ground (always visible) -->
    <line x1="10" y1="145" x2="110" y2="145" stroke-width="3" class="stroke-slate-300 dark:stroke-slate-600" />

    <!-- Large circle (base) -->
    <circle
      v-if="wrongCount >= 1"
      cx="60" cy="123" r="22"
      stroke-width="3"
      class="stroke-sky-300 dark:stroke-sky-400 transition-opacity duration-300"
    />

    <!-- Medium circle (middle) -->
    <circle
      v-if="wrongCount >= 2"
      cx="60" cy="85" r="16"
      stroke-width="3"
      class="stroke-sky-300 dark:stroke-sky-400 transition-opacity duration-300"
    />

    <!-- Small circle (head) -->
    <circle
      v-if="wrongCount >= 3"
      cx="60" cy="57" r="12"
      stroke-width="3"
      class="stroke-sky-300 dark:stroke-sky-400 transition-opacity duration-300"
    />

    <!-- Left arm -->
    <line
      v-if="wrongCount >= 4"
      x1="44" y1="85" x2="18" y2="70"
      stroke-width="3"
      class="stroke-slate-600 dark:stroke-slate-400 transition-opacity duration-300"
    />

    <!-- Right arm -->
    <line
      v-if="wrongCount >= 5"
      x1="76" y1="85" x2="102" y2="70"
      stroke-width="3"
      class="stroke-slate-600 dark:stroke-slate-400 transition-opacity duration-300"
    />

    <!-- Hat (brim + top) -->
    <g v-if="wrongCount >= 6" class="transition-opacity duration-300">
      <rect x="44" y="43" width="32" height="5" rx="1" class="fill-slate-700 dark:fill-slate-300" stroke="none" />
      <rect x="50" y="23" width="20" height="20" rx="2" class="fill-slate-700 dark:fill-slate-300" stroke="none" />
    </g>
  </svg>
</template>
