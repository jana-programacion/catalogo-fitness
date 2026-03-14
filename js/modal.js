// ── Modal de detalle de producto ──
const productModal = document.getElementById('productModal');
const productModalBackdrop = document.getElementById('productModalBackdrop');

const COLOR_HEX = {
  negro: '#1c1c1e', blanco: '#f5f5f5', rosa: '#f48fb1', rojo: '#e53935',
  azul: '#1e88e5', verde: '#43a047', amarillo: '#fdd835', naranja: '#fb8c00',
  gris: '#9e9e9e', violeta: '#8e24aa', lila: '#ce93d8', beige: '#d7b89c',
  marron: '#795548', celeste: '#81d4fa', fucsia: '#e91e63', turquesa: '#00bcd4',
  bordo: '#7b0d0d', blanco_roto: '#f5f0e8',
};

function openProductModal(productId) {
  const p = products.find(x => x.id == productId);
  if (!p) return;

  const allImages = [];
  if (p.imageUrl) allImages.push(p.imageUrl);
  p.extraImages.forEach(u => { if (u && !allImages.includes(u)) allImages.push(u); });

  const galleryEl = document.getElementById('modalGallery');
  const detailsEl = document.getElementById('modalDetails');

  // Galería
  const mainImgHtml = allImages.length > 0
    ? `<img class="modal-main-img" id="modalMainImg" src="${allImages[0]}" alt="${p.name}">`
    : `<div class="modal-main-placeholder">👕</div>`;
  const thumbsHtml = allImages.length > 1
    ? `<div class="modal-thumbnails">` +
      allImages.map((url, i) =>
        `<img class="modal-thumb${i === 0 ? ' active' : ''}" src="${url}" data-idx="${i}" alt="Vista ${i + 1}">`
      ).join('') + `</div>`
    : '';
  galleryEl.innerHTML = mainImgHtml + thumbsHtml;

  // Parsear colores y talles
  const colorList = p.colors ? p.colors.split(',').map(c => c.trim()).filter(Boolean) : [];
  const sizeList  = p.sizes  ? p.sizes.split(',').map(s => s.trim()).filter(Boolean)  : [];

  // Chips de colores
  const colorsHtml = colorList.length ? `
    <div class="modal-option-group">
      <span class="modal-option-label">Color: <strong id="selectedColorLabel">—</strong></span>
      <div class="modal-color-chips">
        ${colorList.map(c => {
          const hex = COLOR_HEX[c.toLowerCase().replace(' ', '_')] || '#cccccc';
          const isLight = hex === '#f5f5f5' || hex === '#f5f0e8' || hex === '#fdd835';
          return `<button class="color-chip${isLight ? ' light' : ''}" data-color="${c}" style="background:${hex}" title="${c}"></button>`;
        }).join('')}
      </div>
    </div>` : '';

  // Chips de talles
  const sizesHtml = sizeList.length ? `
    <div class="modal-option-group">
      <span class="modal-option-label">Talle: <strong id="selectedSizeLabel">—</strong></span>
      <div class="modal-size-chips">
        ${sizeList.map(s => `<button class="size-chip" data-size="${s}">${s}</button>`).join('')}
      </div>
    </div>` : '';

  const badgeHtml = p.badge ? `<span class="modal-badge">${p.badge}</span>` : '';
  const priceHtml = p.price
    ? `<span class="modal-price">$${p.price.toLocaleString('es-AR')}</span>`
    : `<span class="modal-price" style="font-size:18px;color:var(--text-mid)">Consultar precio</span>`;

  detailsEl.innerHTML = `
    ${badgeHtml}
    <h2 class="modal-name">${p.name}</h2>
    ${p.description ? `<p class="modal-desc">${p.description}</p>` : ''}
    ${priceHtml}
    ${colorsHtml}
    ${sizesHtml}
    <p class="modal-selection-error" id="modalSelectionError"></p>
    <button class="modal-add-btn" data-id="${p.id}">🛒 Agregar al carrito</button>
    <button class="modal-share-btn" id="modalShareBtn">🔗 Compartir producto</button>
  `;

  // Estado de selección
  let selectedColor = colorList.length === 0 ? null : '';
  let selectedSize  = sizeList.length  === 0 ? null : '';

  // Clicks en chips de color
  detailsEl.querySelectorAll('.color-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      detailsEl.querySelectorAll('.color-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedColor = btn.dataset.color;
      document.getElementById('selectedColorLabel').textContent = selectedColor;
      document.getElementById('modalSelectionError').textContent = '';
    });
  });

  // Clicks en chips de talle
  detailsEl.querySelectorAll('.size-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      detailsEl.querySelectorAll('.size-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedSize = btn.dataset.size;
      document.getElementById('selectedSizeLabel').textContent = selectedSize;
      document.getElementById('modalSelectionError').textContent = '';
    });
  });

  // Miniaturas
  galleryEl.addEventListener('click', e => {
    const thumb = e.target.closest('.modal-thumb');
    if (!thumb) return;
    const mainImg = document.getElementById('modalMainImg');
    if (mainImg) mainImg.src = allImages[parseInt(thumb.dataset.idx)];
    galleryEl.querySelectorAll('.modal-thumb').forEach(t => t.classList.toggle('active', t === thumb));
  });

  // Compartir enlace
  const shareBtn = document.getElementById('modalShareBtn');
  shareBtn.addEventListener('click', () => {
    const url = `${location.origin}${location.pathname}?product=${p.id}`;
    navigator.clipboard.writeText(url).then(() => {
      shareBtn.textContent = '✓ Enlace copiado';
      setTimeout(() => { shareBtn.textContent = '🔗 Compartir producto'; }, 2000);
    }).catch(() => {
      prompt('Copiá este enlace:', url);
    });
  });

  // Agregar al carrito con validación
  detailsEl.querySelector('.modal-add-btn').addEventListener('click', () => {
    const errorEl = document.getElementById('modalSelectionError');
    if (selectedColor === '') { errorEl.textContent = 'Por favor elegí un color.'; return; }
    if (selectedSize  === '') { errorEl.textContent = 'Por favor elegí un talle.'; return; }
    addToCart(p.id, selectedColor, selectedSize);
    closeProductModal();
    openCart();
  });

  history.replaceState(null, '', `?product=${p.id}`);
  productModal.classList.add('open');
  productModalBackdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeProductModal() {
  history.replaceState(null, '', location.pathname);
  productModal.classList.remove('open');
  productModalBackdrop.classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('productModalClose').addEventListener('click', closeProductModal);
productModalBackdrop.addEventListener('click', closeProductModal);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeProductModal(); });

// Clicks en la grilla: siempre abrir modal (para elegir talle/color)
grid.addEventListener('click', e => {
  const btn = e.target.closest('.add-cart-btn');
  const card = e.target.closest('.product-card');
  if ((btn || card) && card) {
    e.preventDefault();
    e.stopPropagation();
    openProductModal(card.dataset.productId);
  }
});
