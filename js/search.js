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

  noResults.style.display = matchCount === 0 && products.length > 0 ? '' : 'none';
  loadMoreWrap.style.display = matchCount > visibleLimit ? '' : 'none';
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
