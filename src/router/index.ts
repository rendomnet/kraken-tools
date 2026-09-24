import { createRouter, createWebHashHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import DeckBuilder from '@/tools/slay-the-spire-2/DeckBuilder.vue';
import RelicFinder from '@/tools/slay-the-spire-2/RelicFinder.vue';
import BossCheatsheet from '@/tools/slay-the-spire-2/BossCheatsheet.vue';

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/slay-the-spire-2/deck-builder',
      name: 'sts2-deck-builder',
      component: DeckBuilder,
    },
    {
      path: '/slay-the-spire-2/relic-finder',
      name: 'sts2-relic-finder',
      component: RelicFinder,
    },
    {
      path: '/slay-the-spire-2/boss-cheatsheet',
      name: 'sts2-boss-cheatsheet',
      component: BossCheatsheet,
    },
  ],
});

