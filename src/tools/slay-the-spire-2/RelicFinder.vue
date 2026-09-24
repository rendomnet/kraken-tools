<template>
  <div class="relic-finder flex flex-col w-full text-foreground font-sans" :class="isEmbedded ? 'p-0 min-h-0' : 'p-4 md:p-6 min-h-screen'">
    <!-- Standalone Header (Auto-hidden in Kraken embed mode) -->
    <header v-if="!isEmbedded" class="flex items-center justify-between pb-4 mb-4 border-b border-border">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-lg shadow-sm">
          🏆
        </div>
        <div>
          <h1 class="font-title text-xl font-bold tracking-wide">Slay the Spire 2</h1>
          <div class="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">Relic Quick-Finder • Kraken Tools</div>
        </div>
      </div>

      <div class="text-xs text-muted-foreground">
        <span class="font-medium text-foreground">{{ filteredRelics.length }}</span> of {{ relics.length }} Relics
      </div>
    </header>

    <!-- Filter & Control Rail -->
    <section class="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border border-border bg-card/60 backdrop-blur-md mb-4">
      <!-- Character Class Tabs -->
      <div class="flex items-center gap-1.5 flex-wrap">
        <button
          v-for="c in classes"
          :key="c.id"
          class="px-3 py-1.5 rounded-md text-xs font-semibold transition-all border select-none cursor-pointer"
          :class="selectedClass === c.id
            ? 'bg-primary/20 text-primary border-primary/50 shadow-sm'
            : 'bg-white/5 text-muted-foreground border-white/5 hover:bg-white/10 hover:text-foreground'"
          @click="selectedClass = c.id">
          <span>{{ c.icon }}</span>
          <span class="ml-1">{{ c.label }}</span>
        </button>
      </div>

      <!-- Search, Rarity & Pinned Filter -->
      <div class="flex items-center gap-2 flex-1 max-w-lg flex-wrap sm:flex-nowrap">
        <div class="relative flex-1 min-w-[160px]">
          <Input
            v-model="searchQuery"
            placeholder="Search relics, keywords, synergies..."
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
          v-model="selectedRarity"
          class="h-8 rounded-md border border-border bg-input/40 px-2.5 text-xs text-secondary-foreground outline-none cursor-pointer">
          <option value="all">All Rarities</option>
          <option value="Starter">Starter</option>
          <option value="Common">Common</option>
          <option value="Uncommon">Uncommon</option>
          <option value="Rare">Rare</option>
          <option value="Boss">Boss</option>
          <option value="Shop">Shop</option>
        </select>

        <button
          class="h-8 px-2.5 rounded-md border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer select-none whitespace-nowrap"
          :class="showPinnedOnly
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            : 'bg-white/5 text-muted-foreground border-white/5 hover:bg-white/10 hover:text-foreground'"
          @click="showPinnedOnly = !showPinnedOnly">
          <span>⭐</span>
          <span>Pinned ({{ pinnedIds.length }})</span>
        </button>
      </div>
    </section>

    <!-- Active Tag Filter Pill (if user clicked a tag) -->
    <div v-if="activeTagFilter" class="flex items-center gap-2 mb-3 px-1 text-xs">
      <span class="text-muted-foreground">Filtering by synergy:</span>
      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 font-medium">
        #{{ activeTagFilter }}
        <button class="hover:text-foreground cursor-pointer ml-1" @click="activeTagFilter = null">✕</button>
      </span>
    </div>

    <!-- Relics Grid -->
    <div v-if="filteredRelics.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      <div
        v-for="relic in filteredRelics"
        :key="relic.id"
        class="group relative flex flex-col justify-between p-3.5 rounded-xl border transition-all duration-200"
        :class="isPinned(relic.id)
          ? 'bg-amber-500/[0.04] border-amber-500/40 shadow-sm'
          : 'bg-card/50 border-border hover:border-white/20 hover:bg-card/80'">
        
        <!-- Relic Top Info -->
        <div>
          <div class="flex items-start justify-between gap-2 mb-2">
            <div class="flex items-center gap-2.5">
              <span class="text-2xl filter drop-shadow-sm select-none">{{ relic.icon }}</span>
              <div>
                <h3 class="font-title text-sm font-bold tracking-tight text-foreground leading-snug">
                  {{ relic.name }}
                </h3>
                <div class="flex items-center gap-1.5 mt-0.5">
                  <Badge :variant="badgeVariantForRarity(relic.rarity)">
                    {{ relic.rarity }}
                  </Badge>
                  <span class="text-[10px] text-muted-foreground capitalize font-medium">
                    {{ relic.class === 'all' ? 'All Classes' : relic.class }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Pin Button -->
            <button
              class="w-7 h-7 rounded-md flex items-center justify-center text-xs transition-colors cursor-pointer"
              :class="isPinned(relic.id)
                ? 'text-amber-400 bg-amber-400/10'
                : 'text-muted-foreground/40 hover:text-amber-300 hover:bg-white/5'"
              :title="isPinned(relic.id) ? 'Unpin relic' : 'Pin relic for quick access'"
              @click.stop="togglePin(relic.id)">
              {{ isPinned(relic.id) ? '★' : '☆' }}
            </button>
          </div>

          <!-- Description -->
          <p class="text-xs text-muted-foreground leading-relaxed mt-2.5">
            {{ relic.description }}
          </p>
        </div>

        <!-- Tags / Synergies -->
        <div v-if="relic.tags && relic.tags.length > 0" class="flex flex-wrap items-center gap-1 mt-3 pt-2.5 border-t border-white/5">
          <button
            v-for="tag in relic.tags"
            :key="tag"
            class="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
            @click.stop="activeTagFilter = tag">
            #{{ tag }}
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border rounded-xl">
      <span class="text-3xl mb-2">🔍</span>
      <h3 class="font-title text-sm font-semibold text-foreground">No relics found</h3>
      <p class="text-xs text-muted-foreground mt-1 max-w-sm">
        No relics match your current filters. Try resetting search query, changing class, or clearing synergy tags.
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
import { Badge, type BadgeVariants } from '@/components/ui/badge';
import rawRelics from './relics.json';

interface RelicItem {
  id: string;
  name: string;
  class: 'all' | 'ironclad' | 'silent' | 'necrobinder';
  rarity: 'Starter' | 'Common' | 'Uncommon' | 'Rare' | 'Boss' | 'Shop' | 'Event';
  icon: string;
  description: string;
  tags: string[];
}

const { isEmbedded } = useKrakenEmbed();
const relics = ref<RelicItem[]>(rawRelics as RelicItem[]);

const classes = [
  { id: 'all', label: 'All Classes', icon: '⚔️' },
  { id: 'ironclad', label: 'Ironclad', icon: '🔥' },
  { id: 'silent', label: 'Silent', icon: '🗡️' },
  { id: 'necrobinder', label: 'Necrobinder', icon: '💀' },
];

const selectedClass = ref('all');
const selectedRarity = ref('all');
const searchQuery = ref('');
const activeTagFilter = ref<string | null>(null);
const showPinnedOnly = ref(false);
const pinnedIds = ref<string[]>([]);

const STORAGE_KEY = 'sts2_pinned_relics';

onMounted(() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      pinnedIds.value = JSON.parse(saved);
    }
  } catch (e) {}
});

watch(
  pinnedIds,
  (val) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val));
    } catch (e) {}
  },
  { deep: true },
);

function isPinned(id: string): boolean {
  return pinnedIds.value.includes(id);
}

function togglePin(id: string) {
  if (isPinned(id)) {
    pinnedIds.value = pinnedIds.value.filter((i) => i !== id);
  } else {
    pinnedIds.value.push(id);
  }
}

function badgeVariantForRarity(rarity: string): BadgeVariants['variant'] {
  switch (rarity) {
    case 'Starter': return 'starter';
    case 'Common': return 'common';
    case 'Uncommon': return 'uncommon';
    case 'Rare': return 'rare';
    case 'Boss': return 'primary';
    case 'Shop': return 'default';
    default: return 'default';
  }
}

const filteredRelics = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  return relics.value.filter((relic) => {
    const matchClass = selectedClass.value === 'all' || relic.class === selectedClass.value || relic.class === 'all';
    const matchRarity = selectedRarity.value === 'all' || relic.rarity === selectedRarity.value;
    const matchTag = !activeTagFilter.value || relic.tags.includes(activeTagFilter.value);
    const matchPinned = !showPinnedOnly.value || isPinned(relic.id);
    const matchQuery =
      !query ||
      relic.name.toLowerCase().includes(query) ||
      relic.description.toLowerCase().includes(query) ||
      relic.tags.some((t) => t.toLowerCase().includes(query));

    return matchClass && matchRarity && matchTag && matchPinned && matchQuery;
  });
});

function resetFilters() {
  selectedClass.value = 'all';
  selectedRarity.value = 'all';
  searchQuery.value = '';
  activeTagFilter.value = null;
  showPinnedOnly.value = false;
}
</script>
