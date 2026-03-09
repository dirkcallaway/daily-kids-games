<template>
  <div class="max-w-md mx-auto p-6">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-slate-800 dark:text-slate-100">Daily Kids Games</h1>
      <p class="text-slate-500 dark:text-slate-400 mt-2">A new puzzle every day</p>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <HubGameCard
        title="Word Unscramble"
        description="Unscramble the daily word"
        route="/unscramble"
        color="indigo"
        :available="true"
      />
      <HubGameCard
        title="Memory Match"
        description="Find all the matching pairs"
        route="/memory"
        color="teal"
        :available="true"
      />
      <HubGameCard
        title="Mystery Word"
        description="Guess the hidden word"
        route="/mystery"
        color="amber"
        :available="false"
      />
      <HubGameCard
        title="Word Search"
        description="Find the hidden words"
        route="/wordsearch"
        color="green"
        :available="true"
      />
      <HubGameCard
        title="Spelling Bee"
        description="Make words from letters"
        route="/spelling"
        color="rose"
        :available="false"
      />
    </div>
  </div>
</template>
