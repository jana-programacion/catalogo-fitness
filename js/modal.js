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
  let currentImgIdx = 0;
  const expandBtn = `<button class="modal-img-expand" id="modalImgExpand" title="Ver imagen completa"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg></button>`;
  const nextBtn = allImages.length > 1 ? `<button class="modal-img-next" id="modalImgNext">›</button>` : '';
  const mainImgHtml = allImages.length > 0
    ? `<div class="modal-img-wrap loading"><img class="modal-main-img" id="modalMainImg" src="${allImages[0]}" alt="${p.name}">${nextBtn}${expandBtn}</div>`
    : `<div class="modal-img-wrap"><div class="modal-main-placeholder">👕</div>${expandBtn}</div>`;
  const thumbsHtml = allImages.length > 1
    ? `<div class="modal-thumbnails">` +
      allImages.map((url, i) =>
        `<img class="modal-thumb${i === 0 ? ' active' : ''}" src="${url}" data-idx="${i}" alt="Vista ${i + 1}">`
      ).join('') + `</div>`
    : '';
  galleryEl.innerHTML = mainImgHtml + thumbsHtml;

  // Shimmer: marcar como loaded cuando la imagen termina de cargar
  const mainImgEl = document.getElementById('modalMainImg');
  if (mainImgEl) {
    const wrap = mainImgEl.closest('.modal-img-wrap');
    const onMainLoad = () => { mainImgEl.classList.add('loaded'); if (wrap) wrap.classList.remove('loading'); };
    if (mainImgEl.complete && mainImgEl.naturalWidth > 0) onMainLoad();
    else mainImgEl.addEventListener('load', onMainLoad);
  }
  galleryEl.querySelectorAll('.modal-thumb').forEach(img => {
    const onLoad = () => img.classList.add('loaded');
    if (img.complete && img.naturalWidth > 0) onLoad();
    else img.addEventListener('load', onLoad);
  });

  function goToImage(idx) {
    currentImgIdx = Math.max(0, Math.min(idx, allImages.length - 1));
    const mainImg = document.getElementById('modalMainImg');
    if (mainImg) mainImg.src = allImages[currentImgIdx];
    galleryEl.querySelectorAll('.modal-thumb').forEach((t, i) => t.classList.toggle('active', i === currentImgIdx));
    const nextBtn = document.getElementById('modalImgNext');
    if (nextBtn) nextBtn.style.display = currentImgIdx === allImages.length - 1 ? 'none' : 'flex';
  }

  // Parsear colores y talles
  const colorList = p.colors ? p.colors.split(',').map(c => c.trim()).filter(Boolean) : [];
  const sizeList  = p.sizes  ? p.sizes.split(',').map(s => s.trim()).filter(Boolean)  : [];

  // Chips de colores
  const askColorsMsg = encodeURIComponent(`Hola! Vi la prenda "${p.name}" en la página y quería consultar si tienen otros colores disponibles.`);
  const askColorsLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${askColorsMsg}`;

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
    <a class="modal-ask-colors" href="${askColorsLink}" target="_blank" rel="noopener">¿No encontrás tu color? Consultanos</a>
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
    <div class="modal-actions-row">
      <button class="modal-add-btn" data-id="${p.id}">🛒 Agregar al carrito</button>
      <button class="modal-share-btn" id="modalShareBtn" title="Compartir producto">🔗</button>
    </div>
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
    if (thumb) { goToImage(parseInt(thumb.dataset.idx)); return; }
    const next = e.target.closest('.modal-img-next');
    if (next) { goToImage(currentImgIdx + 1); return; }
  });

  // Swipe táctil en la imagen
  if (allImages.length > 1) {
    const imgWrap = galleryEl.querySelector('.modal-img-wrap');
    let touchStartX = 0;
    let swipeImg = null;
    let goLeft = false;

    imgWrap.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
      const img = document.getElementById('modalMainImg');
      if (img) img.style.transition = 'none';
    }, { passive: true });

    imgWrap.addEventListener('touchmove', e => {
      const dx = e.touches[0].clientX - touchStartX;
      const img = document.getElementById('modalMainImg');
      if (!img) return;

      // Al primer movimiento significativo, crear la imagen entrante
      if (!swipeImg && Math.abs(dx) > 8) {
        goLeft = dx < 0;
        const incomingIdx = currentImgIdx + (goLeft ? 1 : -1);
        if (incomingIdx < 0 || incomingIdx >= allImages.length) return; // en el límite, ignorar
        swipeImg = document.createElement('img');
        swipeImg.className = 'modal-swipe-img';
        swipeImg.src = allImages[incomingIdx];
        swipeImg.style.transition = 'none';
        swipeImg.style.transform = `translateX(${goLeft ? '100%' : '-100%'})`;
        imgWrap.appendChild(swipeImg);
      }

      // Mover ambas imágenes juntas siguiendo el dedo
      img.style.transform = `translateX(${dx}px)`;
      if (swipeImg) {
        swipeImg.style.transform = `translateX(calc(${goLeft ? '100%' : '-100%'} + ${dx}px))`;
      }
    }, { passive: true });

    imgWrap.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const img = document.getElementById('modalMainImg');
      if (!img) return;

      if (swipeImg && Math.abs(dx) > 40) {
        // Completar la transición
        img.style.transition = 'transform 0.22s ease';
        img.style.transform = `translateX(${goLeft ? '-100%' : '100%'})`;
        swipeImg.style.transition = 'transform 0.22s ease';
        swipeImg.style.transform = 'translateX(0)';
        setTimeout(() => {
          goToImage(currentImgIdx + (goLeft ? 1 : -1));
          const newImg = document.getElementById('modalMainImg');
          if (newImg) { newImg.style.transition = 'none'; newImg.style.transform = 'translateX(0)'; }
          swipeImg.remove(); swipeImg = null;
        }, 220);
      } else {
        // Volver a la posición original
        img.style.transition = 'transform 0.2s ease';
        img.style.transform = 'translateX(0)';
        if (swipeImg) {
          swipeImg.style.transition = 'transform 0.2s ease';
          swipeImg.style.transform = `translateX(${goLeft ? '100%' : '-100%'})`;
          setTimeout(() => { if (swipeImg) { swipeImg.remove(); swipeImg = null; } }, 200);
        }
      }
    }, { passive: true });
  }

  // Expandir imagen
  document.getElementById('modalImgExpand').addEventListener('click', () => {
    const src = allImages.length > 0 ? allImages[currentImgIdx] : null;
    if (!src) return;
    const lb = document.createElement('div');
    lb.className = 'img-lightbox';
    lb.innerHTML = `<img class="img-lightbox-img" src="${src}"><button class="img-lightbox-close">✕</button>`;
    document.body.appendChild(lb);
    requestAnimationFrame(() => lb.classList.add('open'));
    const close = () => { lb.classList.remove('open'); setTimeout(() => lb.remove(), 300); };
    lb.querySelector('.img-lightbox-close').addEventListener('click', e => { e.stopPropagation(); close(); });
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    document.addEventListener('keydown', function onKey(e) {
      if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onKey); }
    });
  });

  // Compartir enlace
  const shareBtn = document.getElementById('modalShareBtn');
  shareBtn.addEventListener('click', () => {
    const url = `${location.origin}${location.pathname}?product=${p.id}`;
    if (navigator.share) {
      navigator.share({ title: p.name, url });
    } else {
      navigator.clipboard.writeText(url).then(() => {
        shareBtn.textContent = '✓';
        setTimeout(() => { shareBtn.textContent = '🔗'; }, 2000);
      }).catch(() => {
        prompt('Copiá este enlace:', url);
      });
    }
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
function handleProductClick(e) {
  const card = e.target.closest('.product-card');
  if (card) {
    e.preventDefault();
    e.stopPropagation();
    openProductModal(card.dataset.productId);
  }
}
grid.addEventListener('click', handleProductClick);
document.getElementById('noResults').addEventListener('click', handleProductClick);
