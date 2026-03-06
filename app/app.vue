<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
    <button
      @click="toggle"
      class="fixed top-3 right-3 z-50 w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-200"
      :class="isDark ? 'bg-slate-700 hover:bg-slate-600 text-yellow-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'"
      aria-label="Toggle dark mode"
    >
      <span v-if="isDark" class="text-base leading-none">☀</span>
      <span v-else class="text-base leading-none">🌙</span>
    </button>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useDarkMode } from '~/composables/useDarkMode'

const { isDark, toggle, init } = useDarkMode()

onMounted(() => {
  init()
})
</script>
