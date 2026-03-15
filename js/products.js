// ── Fetch, caché y render de productos ──
const CACHE_KEY = 'catalogo_products_v1';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

const grid = document.getElementById('productsGrid');
const loadingEl = document.getElementById('productsLoading');
const errorEl = document.getElementById('productsError');
const catFiltersEl = document.getElementById('categoryFilters');

function parseProducts(data) {
  return data.map((p, i) => ({
    id: p.id || i + 1,
    name: String(p.name || '').trim(),
    description: String(p.description || '').trim(),
    price: p.price ? Number(p.price) : null,
    imageUrl: String(p.imageUrl || '').trim(),
    category: String(p.category || '').trim(),
    colors: String(p.colors || '').trim(),
    sizes: String(p.sizes || '').trim(),
    featured: p.featured === true || p.featured === 'TRUE' || p.featured === 'true',
    badge: String(p.badge || '').trim(),
    extraImages: String(p.extraImages || '').trim().split(',').map(u => u.trim()).filter(Boolean),
  })).filter(p => p.name);
}

function renderAll() {
  loadingEl.classList.add('hidden');
  renderCategories();
  renderProducts();
  applyFilters();
  loadCart();
}

async function fetchAndCache() {
  // Usa la promesa prefetcheada desde el <head> si existe, evita una segunda request
  const promise = window._productsFetch || fetch(SHEETS_API).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
  window._productsFetch = null;
  const data = await promise;
  if (!data || !Array.isArray(data)) throw new Error('respuesta inválida');
  const parsed = parseProducts(data);
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: parsed }));
  } catch (e) { /* localStorage lleno, ignorar */ }
  return parsed;
}

async function loadProducts() {
  errorEl.style.display = 'none';

  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    if (cached && cached.data && cached.data.length > 0) {
      products = cached.data;
      renderAll();
      if (Date.now() - cached.ts > CACHE_TTL) {
        fetchAndCache().then(fresh => { products = fresh; renderAll(); })
          .catch(() => { /* fallo silencioso */ });
      }
      return;
    }
  } catch (e) { /* caché corrupto, ignorar */ }

  loadingEl.classList.remove('hidden');
  grid.innerHTML = '';

  try {
    products = await fetchAndCache();
    renderAll();
  } catch (err) {
    console.error('Error loading products:', err);
    loadingEl.classList.add('hidden');
    errorEl.style.display = '';
  }
}

document.getElementById('retryBtn').addEventListener('click', loadProducts);

// ── Categorías ──
function renderCategories() {
  const cats = [...new Set(products.map(p => p.category).filter(Boolean))];

  // Filtros de categoría
  catFiltersEl.innerHTML = '';
  const allBtn = document.createElement('button');
  allBtn.className = 'cat-btn active';
  allBtn.textContent = 'Todos';
  allBtn.addEventListener('click', () => setCategory('Todos'));
  catFiltersEl.appendChild(allBtn);
  cats.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'cat-btn';
    btn.textContent = cat;
    btn.addEventListener('click', () => setCategory(cat));
    catFiltersEl.appendChild(btn);
  });

  // Select móvil de categorías
  const mobileCatSelect = document.getElementById('mobileCatSelect');
  if (mobileCatSelect) {
    mobileCatSelect.innerHTML = '<option value="Todos">Categoría: Todos</option>' +
      cats.map(c => `<option value="${c}">${c}</option>`).join('');
    mobileCatSelect.value = activeCategory;
  }

  // Dropdown del nav "Productos ▾"
  const navDropdown = document.getElementById('productosDropdown');
  if (navDropdown) {
    navDropdown.innerHTML = '';
    cats.forEach(cat => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = '#productsSection';
      a.textContent = cat;
      a.addEventListener('click', e => {
        e.preventDefault();
        setCategory(cat);
        document.getElementById('productsSection').scrollIntoView({ behavior: 'smooth' });
      });
      li.appendChild(a);
      navDropdown.appendChild(li);
    });
  }
}

function setCategory(cat) {
  activeCategory = cat;
  visibleLimit = 12;
  catFiltersEl.querySelectorAll('.cat-btn').forEach(b =>
    b.classList.toggle('active', b.textContent === cat)
  );
  const mobileCatSelect = document.getElementById('mobileCatSelect');
  if (mobileCatSelect) mobileCatSelect.value = cat;
  applyFilters();
}

// ── Ordenamiento ──
function getSortedProducts() {
  const list = [...products];
  if (activeSort === 'precio-asc') {
    list.sort((a, b) => {
      if (!a.price && !b.price) return 0;
      if (!a.price) return 1;
      if (!b.price) return -1;
      return a.price - b.price;
    });
  } else if (activeSort === 'precio-desc') {
    list.sort((a, b) => {
      if (!a.price && !b.price) return 0;
      if (!a.price) return 1;
      if (!b.price) return -1;
      return b.price - a.price;
    });
  } else {
    // Destacados primero
    list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }
  return list;
}

// ── Grid de productos ──
function renderProducts() {
  grid.innerHTML = '';
  getSortedProducts().forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.productId = p.id;
    card.dataset.name = p.name.toLowerCase();
    card.dataset.desc = p.description.toLowerCase();
    card.dataset.category = p.category;
    card.style.animationDelay = `${Math.min(i * 0.04, 0.8)}s`;

    const imgContent = p.imageUrl
      ? `<img src="${p.imageUrl}" alt="${p.name}" loading="lazy">`
      : `<span class="placeholder-icon">👕</span>`;
    const badgeHtml = p.badge ? `<span class="badge">${p.badge}</span>` : '';
    const priceText = p.price ? `$${p.price.toLocaleString('es-AR')}` : 'Consultar';
    const sizesHtml = p.sizes ? `<p class="sizes">Talles: ${p.sizes}</p>` : '';

    card.innerHTML = `
      <div class="product-img">
        ${imgContent}
        ${badgeHtml}
        <div class="add-cart-overlay">
          <button class="add-cart-btn" data-id="${p.id}" aria-label="Agregar al carrito">🛒</button>
        </div>
      </div>
      <div class="product-info">
        <h3>${p.name}</h3>
        <p class="description">${p.description}</p>
        <span class="price">${priceText}</span>
        ${sizesHtml}
      </div>
    `;
    grid.appendChild(card);
  });
}

