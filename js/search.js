// ── Búsqueda y filtros ──
const noResults = document.getElementById('noResults');
const desktopSearch = document.getElementById('desktopSearch');
const mobileSearchInput = document.getElementById('mobileSearchInput');
const mobileProductSearchInput = document.getElementById('mobileProductSearchInput');

const normalize = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

function getSearchQuery() {
  return desktopSearch.value || mobileSearchInput.value || mobileProductSearchInput.value || '';
}

const loadMoreWrap = document.getElementById('loadMoreWrap');

function getSimilarProducts(q) {
  const words = normalize(q).split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return products
    .map(p => {
      const haystack = normalize(p.name + ' ' + p.description + ' ' + p.category);
      const hWords = haystack.split(/\s+/);
      let score = 0;
      words.forEach(w => {
        if (hWords.includes(w)) score += 3;
        else if (hWords.some(hw => hw.startsWith(w) || w.startsWith(hw))) score += 2;
        else if (haystack.includes(w)) score += 1;
      });
      return { p, score };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(x => x.p);
}

function cardHtml(p) {
  const img = p.imageUrl ? `<img src="${p.imageUrl}" alt="${p.name}" loading="lazy">` : `<span class="placeholder-icon">👕</span>`;
  const badge = p.badge ? `<span class="badge">${p.badge}</span>` : '';
  const price = p.price ? `$${p.price.toLocaleString('es-AR')}` : 'Consultar';
  return `<div class="product-card" data-product-id="${p.id}" data-name="${p.name.toLowerCase()}" data-desc="${p.description.toLowerCase()}" data-category="${p.category}">
    <div class="product-img">${img}${badge}<div class="add-cart-overlay"><button class="add-cart-btn" data-id="${p.id}" aria-label="Agregar al carrito">🛒</button></div></div>
    <div class="product-info"><h3>${p.name}</h3><span class="price">${price}</span></div>
  </div>`;
}

function applyFilters() {
  const q = normalize(getSearchQuery());
  const words = q.split(/\s+/).filter(Boolean);
  const cards = grid.querySelectorAll('.product-card');
  let matchCount = 0;

  cards.forEach(card => {
    const haystack = normalize(card.dataset.name + ' ' + card.dataset.desc + ' ' + card.dataset.category);
    const matchesSearch = !q || words.every(w => haystack.includes(w));
    const matchesCat = activeCategory === 'Todos' || card.dataset.category === activeCategory;
    const matches = matchesSearch && matchesCat;
    if (matches) {
      matchCount++;
      card.style.display = matchCount <= visibleLimit ? '' : 'none';
    } else {
      card.style.display = 'none';
    }
  });

  loadMoreWrap.style.display = matchCount > visibleLimit ? '' : 'none';

  if (matchCount === 0 && products.length > 0) {
    const rawQ = getSearchQuery().trim();
    const similar = rawQ ? getSimilarProducts(rawQ) : [];
    noResults.innerHTML = `
      <span>🔍</span>
      <p>No encontramos resultados para "<strong>${rawQ || 'tu búsqueda'}</strong>"</p>
      ${similar.length ? `
        <p class="no-results-suggest">Quizás te puede interesar:</p>
        <div class="no-results-cards">${similar.map(cardHtml).join('')}</div>
      ` : ''}
    `;
    noResults.style.display = '';
  } else {
    noResults.style.display = 'none';
  }
}

document.getElementById('loadMoreBtn').addEventListener('click', () => {
  visibleLimit += 12;
  applyFilters();
});

function syncSearch(value, source) {
  if (source !== desktopSearch) desktopSearch.value = value;
  if (source !== mobileSearchInput) mobileSearchInput.value = value;
  if (source !== mobileProductSearchInput) mobileProductSearchInput.value = value;
  visibleLimit = 12;
  applyFilters();
}

document.getElementById('mobileCatSelect').addEventListener('change', e => {
  setCategory(e.target.value);
});

document.getElementById('sortSelect').addEventListener('change', e => {
  activeSort = e.target.value;
  visibleLimit = 12;
  renderProducts();
  applyFilters();
});

desktopSearch.addEventListener('input', e => syncSearch(e.target.value, desktopSearch));
mobileSearchInput.addEventListener('input', e => syncSearch(e.target.value, mobileSearchInput));
mobileProductSearchInput.addEventListener('input', e => syncSearch(e.target.value, mobileProductSearchInput));

[desktopSearch, mobileSearchInput, mobileProductSearchInput].forEach(input => {
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (input === mobileSearchInput) closeMobileNav();
      applyFilters();
      grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
