// ── Búsqueda y filtros ──
const noResults = document.getElementById('noResults');
const desktopSearch = document.getElementById('desktopSearch');
const mobileSearchInput = document.getElementById('mobileSearchInput');
const mobileProductSearchInput = document.getElementById('mobileProductSearchInput');

const normalize = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

function getSearchQuery() {
  return desktopSearch.value || mobileSearchInput.value || mobileProductSearchInput.value || '';
}

function applyFilters() {
  const q = normalize(getSearchQuery());
  const words = q.split(/\s+/).filter(Boolean);
  const cards = grid.querySelectorAll('.product-card');
  let visibleCount = 0;

  cards.forEach(card => {
    const haystack = normalize(card.dataset.name + ' ' + card.dataset.desc + ' ' + card.dataset.category);
    const matchesSearch = !q || words.every(w => haystack.includes(w));
    const matchesCat = activeCategory === 'Todos' || card.dataset.category === activeCategory;
    const show = matchesSearch && matchesCat;
    card.style.display = show ? '' : 'none';
    if (show) visibleCount++;
  });

  noResults.style.display = visibleCount === 0 && products.length > 0 ? '' : 'none';
}

function syncSearch(value, source) {
  if (source !== desktopSearch) desktopSearch.value = value;
  if (source !== mobileSearchInput) mobileSearchInput.value = value;
  if (source !== mobileProductSearchInput) mobileProductSearchInput.value = value;
  applyFilters();
}

document.getElementById('sortSelect').addEventListener('change', e => {
  activeSort = e.target.value;
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
      applyFilters();
      grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
