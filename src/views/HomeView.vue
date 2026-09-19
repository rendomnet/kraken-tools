<template>
  <div class="flex flex-col items-center justify-center min-h-screen text-foreground p-6 max-w-4xl mx-auto">
    <div class="text-center mb-10">
      <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-3xl shadow-lg mx-auto mb-4">
        🐙
      </div>
      <h1 class="font-title text-3xl font-bold tracking-tight mb-2">Kraken Tools Hub</h1>
      <p class="text-sm text-muted-foreground max-w-md mx-auto">
        Official and community game tools designed to integrate directly into Kraken Launcher.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      <RouterLink
        to="/slay-the-spire-2/deck-builder"
        class="group flex flex-col gap-2 p-5 rounded-xl border border-border bg-card/60 backdrop-blur-md hover:border-primary/60 hover:-translate-y-0.5 transition-all shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-bold uppercase tracking-widest text-primary">Slay the Spire 2</span>
          <span class="text-xs text-muted-foreground group-hover:text-primary transition-colors">Open →</span>
        </div>
        <h2 class="font-title text-lg font-bold">Deck & Synergy Planner</h2>
        <p class="text-xs text-muted-foreground leading-relaxed">
          Explore Ironclad, Silent, and Necrobinder card synergies, manage starter builds, and export deck codes.
        </p>
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>
