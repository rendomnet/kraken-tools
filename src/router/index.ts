import { createRouter, createWebHashHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import DeckBuilder from '@/tools/slay-the-spire-2/DeckBuilder.vue';

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
  ],
});
