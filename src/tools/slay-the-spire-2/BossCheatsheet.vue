<template>
  <div class="boss-cheatsheet flex flex-col w-full text-foreground font-sans p-4 md:p-6" :class="isEmbedded ? 'p-1 md:p-2 min-h-0' : 'min-h-screen'">
    <!-- Standalone Header (Auto-hidden in Kraken embed mode) -->
    <header v-if="!isEmbedded" class="flex items-center justify-between pb-4 mb-4 border-b border-border">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-rose-500 to-red-700 flex items-center justify-center text-lg shadow-sm">
          ⚠️
        </div>
        <div>
          <h1 class="font-title text-xl font-bold tracking-wide">Slay the Spire 2</h1>
          <div class="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">Boss & Elite Cheatsheet • Kraken Tools</div>
        </div>
      </div>

      <div class="text-xs text-muted-foreground">
        Act {{ selectedAct }} Encounters
      </div>
    </header>

    <!-- Act Selection Tabs & Filters -->
    <section class="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border border-border bg-card/60 backdrop-blur-md mb-4">
      <!-- Act Tabs -->
      <div class="flex items-center gap-1.5 flex-wrap">
        <button
          v-for="act in acts"
          :key="act.id"
          class="px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all border select-none cursor-pointer flex items-center gap-1.5"
          :class="selectedAct === act.id
            ? 'bg-primary/20 text-primary border-primary/50 shadow-sm'
            : 'bg-white/5 text-muted-foreground border-white/5 hover:bg-white/10 hover:text-foreground'"
          @click="selectedAct = act.id">
          <span>{{ act.icon }}</span>
          <span>Act {{ act.id }}: {{ act.name }}</span>
        </button>
      </div>

      <!-- Type Filter & Search -->
      <div class="flex items-center gap-2 flex-1 max-w-md">
        <div class="relative flex-1">
          <Input
            v-model="searchQuery"
            placeholder="Search enemy name, passive, tips..."
            class="pl-8"
          />
          <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">🔍</span>
          <button
            v-if="searchQuery"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
            @click="searchQuery = ''">
            ✕
          </button>
        </div>

        <select
          v-model="selectedType"
          class="h-8 rounded-md border border-border bg-input/40 px-2.5 text-xs text-secondary-foreground outline-none cursor-pointer">
          <option value="all">All Encounters</option>
          <option value="Elite">Elites Only</option>
          <option value="Boss">Bosses Only</option>
        </select>
      </div>
    </section>

    <!-- Target / Pinned Encounter Banner -->
    <div
      v-if="targetEncounter"
      class="mb-4 p-3.5 rounded-xl border border-rose-500/40 bg-gradient-to-r from-rose-500/10 via-card/70 to-card/50 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-sm">
      <div class="flex items-center gap-3">
        <span class="text-3xl select-none">{{ targetEncounter.icon }}</span>
        <div>
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/20 px-1.5 py-0.5 rounded">
              Current Target • Act {{ targetEncounter.act }} {{ targetEncounter.type }}
            </span>
            <span class="text-xs text-muted-foreground font-mono">HP: {{ targetEncounter.hp }}</span>
          </div>
          <h2 class="font-title text-base font-bold text-foreground mt-0.5">
            {{ targetEncounter.name }}
          </h2>
          <p class="text-xs text-secondary-foreground line-clamp-1 mt-0.5">
            {{ targetEncounter.tips }}
          </p>
        </div>
      </div>

      <button
        class="text-xs font-semibold px-2.5 py-1 rounded-md bg-white/10 text-muted-foreground hover:text-foreground hover:bg-white/15 transition-colors cursor-pointer self-end md:self-auto"
        @click="targetId = null">
        Clear Target
      </button>
    </div>

    <!-- Encounter Cards Grid -->
    <div v-if="filteredEncounters.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="enc in filteredEncounters"
        :key="enc.id"
        class="flex flex-col justify-between p-4 rounded-xl border transition-all duration-200"
        :class="targetId === enc.id
          ? 'bg-rose-500/[0.04] border-rose-500/50 shadow-md ring-1 ring-rose-500/30'
          : 'bg-card/50 border-border hover:border-white/20 hover:bg-card/75'">

        <div>
          <!-- Header: Icon, Name, Type, Target Button -->
          <div class="flex items-start justify-between gap-2 pb-3 mb-3 border-b border-white/5">
            <div class="flex items-center gap-3">
              <span class="text-3xl select-none filter drop-shadow-sm">{{ enc.icon }}</span>
              <div>
                <h3 class="font-title text-base font-bold tracking-tight text-foreground">
                  {{ enc.name }}
                </h3>
                <div class="flex items-center gap-2 mt-1">
                  <Badge :variant="enc.type === 'Boss' ? 'rare' : 'uncommon'">
                    {{ enc.type }}
                  </Badge>
                  <span class="text-[11px] text-muted-foreground font-mono font-medium">
                    {{ enc.hp }} HP
                  </span>
                </div>
              </div>
            </div>

            <!-- Set Target Button -->
            <button
              class="px-2.5 py-1 rounded-md text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
              :class="targetId === enc.id
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'bg-white/5 text-muted-foreground border border-white/5 hover:bg-white/10 hover:text-foreground'"
              @click="toggleTarget(enc.id)">
              <span>{{ targetId === enc.id ? '🎯 Targeted' : 'Track Target' }}</span>
            </button>
          </div>

          <!-- Dangerous Passives / Triggers -->
          <div class="mb-3 p-2.5 rounded-lg bg-rose-500/[0.06] border border-rose-500/20">
            <div class="flex items-center gap-1.5 text-xs font-bold text-rose-400 mb-1">
              <span>⚡</span>
              <span>Dangerous Passive / Reaction</span>
            </div>
            <p class="text-xs text-foreground/90 leading-relaxed font-sans">
              {{ enc.passives }}
            </p>
          </div>

          <!-- Turn Patterns -->
          <div class="mb-3">
            <div class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Turn Pattern / Actions
            </div>
            <p class="text-xs text-muted-foreground leading-relaxed font-sans">
              {{ enc.turnPattern }}
            </p>
          </div>
        </div>

        <!-- Strategy Tip -->
        <div class="mt-2 pt-2.5 border-t border-white/5 flex items-start gap-2 text-xs text-sky-300 bg-sky-500/[0.04] p-2.5 rounded-lg border border-sky-500/10">
          <span class="text-sm select-none">💡</span>
          <p class="text-xs text-sky-200/90 leading-relaxed font-sans">
            <strong class="text-sky-300">Tactical Tip:</strong> {{ enc.tips }}
          </p>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border rounded-xl">
      <span class="text-3xl mb-2">🔍</span>
      <h3 class="font-title text-sm font-semibold text-foreground">No encounters found</h3>
      <p class="text-xs text-muted-foreground mt-1 max-w-sm">
        No bosses or elites match your current filter. Try resetting search or selecting a different Act.
      </p>
      <Button variant="outline" size="sm" class="mt-4" @click="resetFilters">
        Reset Filters
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import { useKrakenEmbed } from '@/composables/useKrakenEmbed';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import rawEncounters from './encounters.json';

interface EncounterItem {
  id: string;
  name: string;
  act: number;
  type: 'Elite' | 'Boss';
  icon: string;
  hp: string;
  passives: string;
  turnPattern: string;
  tips: string;
}

const { isEmbedded } = useKrakenEmbed();
const encounters = ref<EncounterItem[]>(rawEncounters as EncounterItem[]);

const acts = [
  { id: 1, name: 'Exordium', icon: '🌲' },
  { id: 2, name: 'The City', icon: '🏰' },
  { id: 3, name: 'The Beyond', icon: '🌌' },
];

const selectedAct = ref(1);
const selectedType = ref('all');
const searchQuery = ref('');
const targetId = ref<string | null>(null);

const STORAGE_KEY = 'sts2_target_encounter';

onMounted(() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      targetId.value = saved;
    }
  } catch (e) {}
});

watch(targetId, (val) => {
  try {
    if (val) {
      localStorage.setItem(STORAGE_KEY, val);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (e) {}
});

function toggleTarget(id: string) {
  if (targetId.value === id) {
    targetId.value = null;
  } else {
    targetId.value = id;
  }
}

const targetEncounter = computed(() => {
  if (!targetId.value) return null;
  return encounters.value.find((e) => e.id === targetId.value) || null;
});

const filteredEncounters = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  return encounters.value.filter((enc) => {
    const matchAct = enc.act === selectedAct.value;
    const matchType = selectedType.value === 'all' || enc.type === selectedType.value;
    const matchQuery =
      !query ||
      enc.name.toLowerCase().includes(query) ||
      enc.passives.toLowerCase().includes(query) ||
      enc.turnPattern.toLowerCase().includes(query) ||
      enc.tips.toLowerCase().includes(query);

    return matchAct && matchType && matchQuery;
  });
});

function resetFilters() {
  selectedType.value = 'all';
  searchQuery.value = '';
}
</script>
