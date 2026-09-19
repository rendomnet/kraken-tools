import { ref, onMounted, onUnmounted } from 'vue';

function getUrlParam(key: string): string | null {
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const searchVal = searchParams.get(key);
    if (searchVal) return searchVal;

    const hash = window.location.hash;
    const qIndex = hash.indexOf('?');
    if (qIndex !== -1) {
      const hashParams = new URLSearchParams(hash.slice(qIndex));
      return hashParams.get(key);
    }
  } catch (e) {}
  return null;
}

function checkIsEmbedded(): boolean {
  try {
    if (window.self !== window.top) return true;
    const embed = getUrlParam('embed');
    if (embed === 'kraken' || embed === 'true') return true;
  } catch (e) {
    return true;
  }
  return false;
}

export function useKrakenEmbed() {
  const isEmbedded = ref(checkIsEmbedded());
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

  if (isEmbedded.value) {
    document.documentElement.classList.add('is-embedded');
    document.body?.classList.add('is-embedded');
  }

  onMounted(() => {
    const embedParam = getUrlParam('embed');
    const inIframe = checkIsEmbedded();

    if (embedParam === 'kraken' || embedParam === 'true' || inIframe) {
      isEmbedded.value = true;
      document.documentElement.classList.add('is-embedded');
      document.body.classList.add('is-embedded');
    }

    const initialAccent = getUrlParam('accent');
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
