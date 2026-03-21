<script setup lang="ts">
defineProps<{ wrongCount: number }>();
</script>

<template>
  <svg
    viewBox="0 0 120 160"
    class="w-40 h-48 sm:w-48 sm:h-56"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <!-- Gallows (always visible) -->
    <line x1="10" y1="155" x2="110" y2="155" stroke-width="4" class="stroke-slate-700 dark:stroke-slate-300" />
    <line x1="30" y1="155" x2="30" y2="10" stroke-width="4" class="stroke-slate-700 dark:stroke-slate-300" />
    <line x1="30" y1="10" x2="80" y2="10" stroke-width="4" class="stroke-slate-700 dark:stroke-slate-300" />
    <line x1="80" y1="10" x2="80" y2="35" stroke-width="3" class="stroke-slate-700 dark:stroke-slate-300" />

    <!-- Head -->
    <circle
      v-if="wrongCount >= 1"
      cx="80" cy="47" r="12"
      fill="none"
      stroke-width="3"
      class="stroke-rose-500 transition-opacity duration-300"
    />

    <!-- Body -->
    <line
      v-if="wrongCount >= 2"
      x1="80" y1="59" x2="80" y2="105"
      stroke-width="3"
      class="stroke-rose-500 transition-opacity duration-300"
    />

    <!-- Left arm -->
    <line
      v-if="wrongCount >= 3"
      x1="80" y1="70" x2="55" y2="90"
      stroke-width="3"
      class="stroke-rose-500 transition-opacity duration-300"
    />

    <!-- Right arm -->
    <line
      v-if="wrongCount >= 4"
      x1="80" y1="70" x2="105" y2="90"
      stroke-width="3"
      class="stroke-rose-500 transition-opacity duration-300"
    />

    <!-- Left leg -->
    <line
      v-if="wrongCount >= 5"
      x1="80" y1="105" x2="55" y2="135"
      stroke-width="3"
      class="stroke-rose-500 transition-opacity duration-300"
    />

    <!-- Right leg -->
    <line
      v-if="wrongCount >= 6"
      x1="80" y1="105" x2="105" y2="135"
      stroke-width="3"
      class="stroke-rose-500 transition-opacity duration-300"
    />
  </svg>
</template>
