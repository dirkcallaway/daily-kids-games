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
        title="Word Search"
        description="Find the hidden words"
        route="/wordsearch"
        color="green"
        :available="true"
      />
      <HubGameCard
        title="Emoji Equations"
        description="Solve the emoji math puzzle"
        route="/emojimath"
        color="rose"
        :available="true"
      />
      <HubGameCard
        title="Snowman"
        description="Guess the mystery word letter by letter"
        route="/snowman"
        color="amber"
        :available="true"
      />
      <HubGameCard
        title="Simon Says"
        description="Repeat the color pattern"
        route="/simon"
        color="amber"
        :available="true"
      />
    </div>
  </div>
</template>
