<template>
  <div class="deck-builder flex flex-col w-full min-h-screen text-foreground font-sans p-4 md:p-6" :class="{ 'p-1 md:p-2': isEmbedded }">
    <!-- Standalone Header (Auto-hidden in Kraken embed mode) -->
    <header v-if="!isEmbedded" class="flex items-center justify-between pb-4 mb-4 border-b border-border">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-lg shadow-sm">
          ⚔️
        </div>
        <div>
          <h1 class="font-title text-xl font-bold tracking-wide">Slay the Spire 2</h1>
          <div class="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">Deck & Synergy Planner • Kraken Tools</div>
        </div>
      </div>

      <Button variant="default" size="sm" @click="openExportModal">
        <span>📤</span>
        <span>Share / Export</span>
      </Button>
    </header>

    <!-- Filter & Control Rail -->
    <section class="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border border-border bg-card/60 backdrop-blur-md mb-4">
      <!-- Character Class Tabs -->
      <div class="flex items-center gap-1.5 flex-wrap">
        <button
          v-for="c in classes"
          :key="c.id"
          class="px-3 py-1.5 rounded-md text-xs font-semibold transition-all border select-none"
          :class="selectedClass === c.id
            ? 'bg-primary/20 text-primary border-primary/50 shadow-sm'
            : 'bg-white/5 text-muted-foreground border-white/5 hover:bg-white/10 hover:text-foreground'"
          @click="selectedClass = c.id">
          <span>{{ c.icon }}</span>
          <span class="ml-1">{{ c.label }}</span>
        </button>
      </div>

      <!-- Search & Card Type Filter -->
      <div class="flex items-center gap-2 flex-1 max-w-md">
        <div class="relative flex-1">
          <Input
            v-model="searchQuery"
            placeholder="Search cards, keywords, or mechanics..."
            class="pl-8"
          />
          <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">🔍</span>
        </div>

        <select
          v-model="selectedType"
          class="h-8 rounded-md border border-border bg-input/40 px-2.5 text-xs text-secondary-foreground outline-none cursor-pointer">
          <option value="all">All Types</option>
          <option value="Attack">Attacks</option>
          <option value="Skill">Skills</option>
          <option value="Power">Powers</option>
        </select>
      </div>
    </section>

    <!-- Main Workspace -->
    <main class="grid grid-cols-1 lg:grid-cols-[1fr_310px] gap-4 items-start">
      <!-- Cards Catalog Grid -->
      <section class="flex flex-col gap-3">
        <div class="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>{{ filteredCards.length }} cards available</span>
          <span>Click any card to add to deck</span>
        </div>

        <div v-if="filteredCards.length > 0" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          <Card
            v-for="card in filteredCards"
            :key="card.id"
            class="group p-3.5 flex flex-col gap-2.5 cursor-pointer hover:-translate-y-0.5 hover:border-primary/60 transition-all select-none"
            @click="addCard(card.id)">
            <div class="flex items-center justify-between gap-2">
              <!-- Energy Cost Crystal -->
              <div class="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-black font-title font-bold text-xs flex items-center justify-center shadow-sm shrink-0">
                {{ card.cost }}
              </div>
              <CardTitle class="flex-1 truncate text-sm" :title="card.name">{{ card.name }}</CardTitle>
            </div>

            <div class="flex items-center justify-between text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">
              <span>{{ card.type }}</span>
              <Badge :variant="badgeVariantForRarity(card.rarity)">
                {{ card.rarity }}
              </Badge>
            </div>

            <CardDescription class="min-h-[44px]">
              {{ card.description }}
            </CardDescription>

            <div class="flex flex-wrap gap-1 mt-auto pt-1">
              <span
                v-for="keyword in card.keywords"
                :key="keyword"
                class="px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-[10px] text-muted-foreground font-medium">
                {{ keyword }}
              </span>
            </div>

            <div v-if="deck[card.id]" class="text-right text-[11px] font-bold text-primary pt-1">
              In Deck: ×{{ deck[card.id] }}
            </div>
          </Card>
        </div>

        <div v-else class="p-12 text-center text-sm text-muted-foreground border border-dashed border-border rounded-lg">
          No cards match your filter criteria.
        </div>
      </section>

      <!-- Sticky Deck Tray -->
      <aside class="sticky top-4 flex flex-col gap-3 p-4 rounded-lg border border-border bg-card/60 backdrop-blur-md">
        <div class="flex items-center justify-between pb-2 border-b border-border">
          <div class="flex items-center gap-2">
            <h2 class="font-title font-bold text-sm tracking-wide">Current Deck</h2>
            <Badge variant="primary">{{ totalCards }} Cards</Badge>
          </div>
          <Button
            v-if="totalCards > 0"
            variant="danger"
            size="sm"
            @click="clearDeck">
            Clear
          </Button>
        </div>

        <!-- Quick Stats Breakdown -->
        <div class="grid grid-cols-3 gap-2 p-2 rounded bg-black/20 text-center">
          <div>
            <div class="text-xs font-bold text-foreground">{{ avgEnergy }}</div>
            <div class="text-[10px] uppercase text-muted-foreground font-medium">Avg Cost</div>
          </div>
          <div>
            <div class="text-xs font-bold text-foreground">{{ attackCount }}</div>
            <div class="text-[10px] uppercase text-muted-foreground font-medium">Attacks</div>
          </div>
          <div>
            <div class="text-xs font-bold text-foreground">{{ skillCount }}</div>
            <div class="text-[10px] uppercase text-muted-foreground font-medium">Skills</div>
          </div>
        </div>

        <!-- Scrollable Deck List -->
        <div class="flex flex-col gap-1.5 max-h-[440px] overflow-y-auto pr-1">
          <div
            v-for="entry in deckEntries"
            :key="entry.card.id"
            class="group flex items-center justify-between p-2 rounded border border-border/60 bg-white/[0.02] hover:bg-white/5 transition-colors">
            <div class="flex items-center gap-2 min-w-0">
              <div class="w-4 h-4 rounded-full bg-amber-500 text-black text-[10px] font-bold flex items-center justify-center shrink-0">
                {{ entry.card.cost }}
              </div>
              <span class="text-xs font-medium truncate" :title="entry.card.name">{{ entry.card.name }}</span>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <span class="text-xs font-bold text-primary">×{{ entry.count }}</span>
              <button
                class="text-muted-foreground hover:text-red-400 text-xs px-1"
                title="Remove"
                @click="removeCard(entry.card.id)">
                ✕
              </button>
            </div>
          </div>

          <div v-if="totalCards === 0" class="py-8 text-center text-xs text-muted-foreground leading-relaxed">
            Your deck is empty.<br />Click any card to add it to your synergy deck.
          </div>
        </div>

        <Button
          variant="primary"
          size="default"
          class="w-full mt-2"
          @click="openExportModal">
          <span>📋</span>
          <span>Export Build</span>
        </Button>
      </aside>
    </main>

    <!-- Export / Import Dialog -->
    <Dialog v-model:open="exportModalOpen">
      <DialogContent>
        <DialogTitle class="font-title text-base font-bold">Deck Code</DialogTitle>
        <p class="text-xs text-muted-foreground -mt-2">
          Copy your deck code to share with others or paste an existing code below to import a build.
        </p>

        <textarea
          v-model="deckCodeString"
          class="w-full h-24 p-2.5 rounded-md border border-border bg-input/40 font-mono text-xs text-primary resize-none outline-none focus:ring-1 focus:ring-primary"
          placeholder="Paste deck code here..."></textarea>

        <div class="flex justify-end gap-2 mt-2">
          <Button variant="outline" size="sm" @click="importDeckCode">
            📥 Import Code
          </Button>
          <Button variant="primary" size="sm" @click="copyDeckCode">
            <span>{{ copied ? '✓ Copied!' : '📋 Copy Code' }}</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useKrakenEmbed } from '@/composables/useKrakenEmbed';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import rawCards from './cards.json';

interface CardItem {
  id: string;
  name: string;
  class: string;
  type: string;
  rarity: 'Starter' | 'Common' | 'Uncommon' | 'Rare';
  cost: number;
  description: string;
  keywords: string[];
}

const cards = ref<CardItem[]>(rawCards as CardItem[]);
const { isEmbedded } = useKrakenEmbed();

const classes = [
  { id: 'all', label: 'All Classes', icon: '⚔️' },
  { id: 'ironclad', label: 'Ironclad', icon: '🔥' },
  { id: 'silent', label: 'Silent', icon: '🗡️' },
  { id: 'necrobinder', label: 'Necrobinder', icon: '💀' },
];

const selectedClass = ref('all');
const selectedType = ref('all');
const searchQuery = ref('');
const deck = ref<Record<string, number>>({});

const exportModalOpen = ref(false);
const deckCodeString = ref('');
const copied = ref(false);

const STORAGE_KEY = 'sts2_planner_deck_v2';

onMounted(() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      deck.value = JSON.parse(saved);
    }
  } catch (e) {}
});

watch(
  deck,
  (val) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val));
    } catch (e) {}
  },
  { deep: true },
);

function badgeVariantForRarity(rarity: string): 'starter' | 'common' | 'uncommon' | 'rare' {
  switch (rarity) {
    case 'Starter': return 'starter';
    case 'Common': return 'common';
    case 'Uncommon': return 'uncommon';
    case 'Rare': return 'rare';
    default: return 'starter';
  }
}

const filteredCards = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  return cards.value.filter((card) => {
    const matchClass = selectedClass.value === 'all' || card.class === selectedClass.value;
    const matchType = selectedType.value === 'all' || card.type.toLowerCase() === selectedType.value.toLowerCase();
    const matchQuery =
      !query ||
      card.name.toLowerCase().includes(query) ||
      card.description.toLowerCase().includes(query) ||
      card.keywords.some((k) => k.toLowerCase().includes(query));
    return matchClass && matchType && matchQuery;
  });
});

const cardMap = computed(() => new Map(cards.value.map((c) => [c.id, c])));

const deckEntries = computed(() => {
  return Object.entries(deck.value)
    .filter(([_, count]) => count > 0)
    .map(([id, count]) => {
      const card = cardMap.value.get(id);
      return card ? { card, count } : null;
    })
    .filter((entry): entry is { card: CardItem; count: number } => entry !== null);
});

const totalCards = computed(() => {
  return Object.values(deck.value).reduce((sum, count) => sum + count, 0);
});

const avgEnergy = computed(() => {
  if (totalCards.value === 0) return '0';
  let energyTotal = 0;
  deckEntries.value.forEach((entry) => {
    energyTotal += entry.card.cost * entry.count;
  });
  return (energyTotal / totalCards.value).toFixed(1);
});

const attackCount = computed(() => {
  return deckEntries.value
    .filter((e) => e.card.type === 'Attack')
    .reduce((sum, e) => sum + e.count, 0);
});

const skillCount = computed(() => {
  return deckEntries.value
    .filter((e) => e.card.type === 'Skill')
    .reduce((sum, e) => sum + e.count, 0);
});

function addCard(id: string) {
  deck.value[id] = (deck.value[id] || 0) + 1;
}

function removeCard(id: string) {
  if (!deck.value[id]) return;
  deck.value[id]--;
  if (deck.value[id] <= 0) {
    delete deck.value[id];
  }
}

function clearDeck() {
  if (confirm('Clear all cards from your active deck?')) {
    deck.value = {};
  }
}

function openExportModal() {
  const payload = {
    v: 2,
    game: 'slay-the-spire-2',
    deck: deck.value,
  };
  deckCodeString.value = btoa(JSON.stringify(payload));
  copied.value = false;
  exportModalOpen.value = true;
}

async function copyDeckCode() {
  try {
    await navigator.clipboard.writeText(deckCodeString.value);
    copied.value = true;
    setTimeout(() => { copied.value = false; }, 2000);
  } catch (e) {}
}

function importDeckCode() {
  const raw = deckCodeString.value.trim();
  if (!raw) return;
  try {
    const parsed = JSON.parse(atob(raw));
    if (parsed && parsed.deck) {
      deck.value = parsed.deck;
      exportModalOpen.value = false;
    } else {
      alert('Invalid deck code format.');
    }
  } catch (e) {
    alert('Could not decode deck code. Please check string.');
  }
}
</script>
