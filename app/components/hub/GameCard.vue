<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
  route: string;
  color: 'indigo' | 'amber' | 'green' | 'rose';
  available: boolean;
}>();
</script>

<template>
  <NuxtLink
    :to="available ? route : ''"
    class="relative block rounded-2xl overflow-hidden shadow-md transition-transform"
    :class="available ? 'hover:scale-105 active:scale-95' : 'cursor-default'"
  >
    <div
      class="h-32 w-full"
      :class="{
        'bg-indigo-500': color === 'indigo',
        'bg-amber-500': color === 'amber',
        'bg-green-500': color === 'green',
        'bg-rose-500': color === 'rose',
      }" />
    <div class="p-4 bg-white">
      <h2 class="font-bold text-slate-800 text-lg">{{ title }}</h2>
      <p class="text-slate-500 text-sm mt-0.5">{{ description }}</p>
    </div>

    <!-- Coming soon overlay -->
    <div
      v-if="!available"
      class="absolute top-0 left-0 right-0 h-32 bg-white/70 flex items-center justify-center"
    >
      <span class="bg-slate-800 text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
        Coming Soon
      </span>
    </div>
  </NuxtLink>
</template>
