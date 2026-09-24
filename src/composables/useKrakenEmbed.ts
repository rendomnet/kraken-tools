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
  const activeFont = ref('Rajdhani');
  let resizeObserver: ResizeObserver | null = null;

  function applyAccent(color: string) {
    if (!color) return;
    accentColor.value = color;
    document.documentElement.style.setProperty('--kraken-accent', color);
    document.documentElement.style.setProperty('--primary', color);
    document.documentElement.style.setProperty('--kraken-accent-glow', `${color}35`);
  }

  function applyFont(font: string) {
    if (!font) return;
    const cleanFont = font.replace(/^["']|["']$/g, '').trim();
    if (!cleanFont) return;
    activeFont.value = cleanFont;
    const fontValue = `"${cleanFont}", 'Outfit', sans-serif`;
    document.documentElement.style.setProperty('--font-family-sans', fontValue);
    if (document.body) {
      document.body.style.setProperty('--font-family-sans', fontValue);
      document.body.style.fontFamily = fontValue;
    }
  }

  let lastSentHeight = 0;

  function sendHeight() {
    if (!isEmbedded.value) return;
    try {
      const rootEl = (document.getElementById('app')?.firstElementChild || document.getElementById('app')) as HTMLElement | null;
      if (!rootEl) return;
      const rectHeight = Math.ceil(rootEl.offsetHeight || rootEl.getBoundingClientRect().height);
      if (rectHeight > 0 && Math.abs(rectHeight - lastSentHeight) >= 8) {
        lastSentHeight = rectHeight;
        window.parent.postMessage({
          type: 'KRAKEN_RESIZE',
          height: rectHeight,
        }, '*');
      }
    } catch (e) {}
  }

  const eagerFont = getUrlParam('font');
  if (eagerFont) {
    applyFont(decodeURIComponent(eagerFont));
  }

  function handleMessage(event: MessageEvent) {
    if (event.data && event.data.type === 'KRAKEN_THEME') {
      if (event.data.accent) {
        applyAccent(event.data.accent);
      }
      if (event.data.font) {
        applyFont(event.data.font);
      }
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

    const initialFont = getUrlParam('font');
    if (initialFont) {
      applyFont(decodeURIComponent(initialFont));
    }

    window.addEventListener('message', handleMessage);

    if (isEmbedded.value && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        sendHeight();
      });
      const appEl = document.getElementById('app');
      if (appEl?.firstElementChild) {
        resizeObserver.observe(appEl.firstElementChild);
      } else if (appEl) {
        resizeObserver.observe(appEl);
      }
      // Send initial height after paint
      setTimeout(sendHeight, 50);
      setTimeout(sendHeight, 300);
    }
  });

  onUnmounted(() => {
    window.removeEventListener('message', handleMessage);
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
  });

  return {
    isEmbedded,
    accentColor,
    activeFont,
    applyAccent,
    applyFont,
    sendHeight,
  };
}
