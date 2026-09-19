// Slay the Spire 2 - Deck & Synergy Planner
(function () {
  let allCards = [];
  let currentClass = 'all';
  let currentType = 'all';
  let searchQuery = '';
  let deck = {}; // { [cardId]: count }

  // DOM Elements
  const cardsGrid = document.getElementById('cardsGrid');
  const cardCountElem = document.getElementById('cardCount');
  const deckListElem = document.getElementById('deckList');
  const totalDeckCountElem = document.getElementById('totalDeckCount');
  const avgEnergyElem = document.getElementById('avgEnergy');
  const atkCountElem = document.getElementById('atkCount');
  const sklCountElem = document.getElementById('sklCount');
  const searchInput = document.getElementById('searchInput');
  const typeSelect = document.getElementById('typeSelect');
  const classTabs = document.querySelectorAll('.class-tab');
  const clearDeckBtn = document.getElementById('clearDeckBtn');
  const exportDeckBtn = document.getElementById('exportDeckBtn');
  const importDeckBtn = document.getElementById('importDeckBtn');
  const exportModal = document.getElementById('exportModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const copyCodeBtn = document.getElementById('copyCodeBtn');
  const loadCodeBtn = document.getElementById('loadCodeBtn');
  const exportCodeBox = document.getElementById('exportCodeBox');

  // Check ?embed=kraken
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('embed') === 'kraken' || urlParams.get('embed') === 'true') {
    document.body.classList.add('is-embedded');
  }

  // Load Cards Database
  async function loadCards() {
    try {
      const res = await fetch('cards.json');
      allCards = await res.json();
      loadSavedDeck();
      renderCards();
      renderDeck();
    } catch (err) {
      console.error('Failed to load cards.json:', err);
      cardsGrid.innerHTML = `<div class="deck-empty-state">Failed to load card database.</div>`;
    }
  }

  // Filter Cards
  function getFilteredCards() {
    return allCards.filter(card => {
      const matchClass = currentClass === 'all' || card.class === currentClass;
      const matchType = currentType === 'all' || card.type.toLowerCase() === currentType.toLowerCase();
      const matchQuery = !searchQuery || 
        card.name.toLowerCase().includes(searchQuery) ||
        card.description.toLowerCase().includes(searchQuery) ||
        card.keywords.some(k => k.toLowerCase().includes(searchQuery));
      return matchClass && matchType && matchQuery;
    });
  }

  // Render Card Grid
  function renderCards() {
    const cards = getFilteredCards();
    cardCountElem.textContent = `${cards.length} cards available`;

    if (cards.length === 0) {
      cardsGrid.innerHTML = `<div class="deck-empty-state" style="grid-column: 1 / -1;">No cards match your filter criteria.</div>`;
      return;
    }

    cardsGrid.innerHTML = cards.map(card => {
      const inDeck = deck[card.id] || 0;
      return `
        <div class="game-card" data-id="${card.id}" data-class="${card.class}">
          <div class="card-header">
            <div class="card-energy">${card.cost}</div>
            <div class="card-title">${card.name}</div>
          </div>
          <div class="card-meta-bar">
            <span>${card.type}</span>
            <span class="rarity-badge rarity-${card.rarity}">${card.rarity}</span>
          </div>
          <div class="card-description">${card.description}</div>
          <div class="card-keywords">
            ${card.keywords.map(k => `<span class="keyword-tag">${k}</span>`).join('')}
          </div>
          ${inDeck > 0 ? `<div style="font-size: 0.75rem; color: #38bdf8; font-weight: 700; text-align: right; margin-top: 4px;">In Deck: ${inDeck}</div>` : ''}
        </div>
      `;
    }).join('');

    // Attach click to add
    cardsGrid.querySelectorAll('.game-card').forEach(elem => {
      elem.addEventListener('click', () => {
        const id = elem.getAttribute('data-id');
        addCardToDeck(id);
      });
    });
  }

  // Deck Management
  function addCardToDeck(id) {
    deck[id] = (deck[id] || 0) + 1;
    saveDeck();
    renderDeck();
    renderCards();
  }

  function removeCardFromDeck(id) {
    if (!deck[id]) return;
    deck[id]--;
    if (deck[id] <= 0) {
      delete deck[id];
    }
    saveDeck();
    renderDeck();
    renderCards();
  }

  function renderDeck() {
    const cardMap = new Map(allCards.map(c => [c.id, c]));
    const entries = Object.entries(deck);
    
    let totalCards = 0;
    let totalEnergy = 0;
    let atkCount = 0;
    let sklCount = 0;

    entries.forEach(([id, qty]) => {
      totalCards += qty;
      const card = cardMap.get(id);
      if (card) {
        totalEnergy += card.cost * qty;
        if (card.type === 'Attack') atkCount += qty;
        if (card.type === 'Skill') sklCount += qty;
      }
    });

    totalDeckCountElem.textContent = `${totalCards} Cards`;
    avgEnergyElem.textContent = totalCards > 0 ? (totalEnergy / totalCards).toFixed(1) : '0';
    atkCountElem.textContent = atkCount;
    sklCountElem.textContent = sklCount;

    if (entries.length === 0) {
      deckListElem.innerHTML = `
        <div class="deck-empty-state">
          Your deck is empty.<br>Click any card to add it to your synergy deck.
        </div>
      `;
      return;
    }

    deckListElem.innerHTML = entries.map(([id, qty]) => {
      const card = cardMap.get(id);
      if (!card) return '';
      return `
        <div class="deck-item">
          <div class="deck-item-left">
            <div class="deck-item-energy">${card.cost}</div>
            <div class="deck-item-name" title="${card.name}">${card.name}</div>
          </div>
          <div style="display: flex; align-items: center;">
            <span class="deck-item-qty">×${qty}</span>
            <button class="deck-item-remove" data-id="${id}" title="Remove card">✕</button>
          </div>
        </div>
      `;
    }).join('');

    deckListElem.querySelectorAll('.deck-item-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeCardFromDeck(btn.getAttribute('data-id'));
      });
    });
  }

  function saveDeck() {
    try {
      localStorage.setItem('sts2_planner_deck', JSON.stringify(deck));
    } catch (e) {}
  }

  function loadSavedDeck() {
    try {
      const saved = localStorage.getItem('sts2_planner_deck');
      if (saved) {
        deck = JSON.parse(saved);
      }
    } catch (e) {}
  }

  // Event Listeners
  classTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      classTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentClass = tab.getAttribute('data-class');
      renderCards();
    });
  });

  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    renderCards();
  });

  typeSelect.addEventListener('change', (e) => {
    currentType = e.target.value;
    renderCards();
  });

  clearDeckBtn.addEventListener('click', () => {
    if (Object.keys(deck).length === 0) return;
    if (confirm('Clear all cards from your active deck?')) {
      deck = {};
      saveDeck();
      renderDeck();
      renderCards();
    }
  });

  // Export / Import
  exportDeckBtn.addEventListener('click', () => {
    const payload = {
      v: 1,
      game: 'slay-the-spire-2',
      deck: deck
    };
    exportCodeBox.value = btoa(JSON.stringify(payload));
    exportModal.classList.add('active');
  });

  modalCloseBtn.addEventListener('click', () => {
    exportModal.classList.remove('active');
  });

  exportModal.addEventListener('click', (e) => {
    if (e.target === exportModal) {
      exportModal.classList.remove('active');
    }
  });

  copyCodeBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(exportCodeBox.value);
      copyCodeBtn.textContent = '✓ Copied!';
      setTimeout(() => { copyCodeBtn.textContent = '📋 Copy Code'; }, 2000);
    } catch (e) {
      exportCodeBox.select();
    }
  });

  loadCodeBtn.addEventListener('click', () => {
    const raw = exportCodeBox.value.trim();
    if (!raw) return;
    try {
      const parsed = JSON.parse(atob(raw));
      if (parsed && parsed.deck) {
        deck = parsed.deck;
        saveDeck();
        renderDeck();
        renderCards();
        exportModal.classList.remove('active');
      } else {
        alert('Invalid deck code format.');
      }
    } catch (err) {
      alert('Could not decode deck string. Please check the code.');
    }
  });

  // Kickoff
  loadCards();
})();
