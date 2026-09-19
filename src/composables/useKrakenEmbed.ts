import { ref, onMounted, onUnmounted } from 'vue';

export function useKrakenEmbed() {
  const isEmbedded = ref(false);
  const accentColor = ref('#38bdf8');

  function applyAccent(color: string) {
    if (!color) return;
    accentColor.value = color;
    document.documentElement.style.setProperty('--kraken-accent', color);
    document.documentElement.style.setProperty('--primary', color);
    document.documentElement.style.setProperty('--kraken-accent-glow', `${color}35`);
  }

  function handleMessage(event: MessageEvent) {
    if (event.data && event.data.type === 'KRAKEN_THEME' && event.data.accent) {
      applyAccent(event.data.accent);
    }
  }

  onMounted(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const embedParam = urlParams.get('embed');
    const inIframe = window.self !== window.top;

    if (embedParam === 'kraken' || embedParam === 'true' || inIframe) {
      isEmbedded.value = true;
      document.body.classList.add('is-embedded');
    }

    const initialAccent = urlParams.get('accent');
    if (initialAccent) {
      applyAccent(decodeURIComponent(initialAccent));
    }

    window.addEventListener('message', handleMessage);
  });

  onUnmounted(() => {
    window.removeEventListener('message', handleMessage);
  });

  return {
    isEmbedded,
    accentColor,
    applyAccent,
  };
}
