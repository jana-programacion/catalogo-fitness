// ── Navegación móvil ──
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  mobileNav.classList.toggle('open');
  document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
});

function closeMobileNav() {
  hamburger.classList.remove('active');
  mobileNav.classList.remove('open');
  document.body.style.overflow = '';
}

// ── Promo popup ──
if (PROMO_2DA_PRENDA && !sessionStorage.getItem('promoSeen')) {
  const promoBackdrop = document.getElementById('promoModalBackdrop');
  const promoModal    = document.getElementById('promoModal');

  function openPromoModal() {
    promoBackdrop.classList.add('open');
    promoModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closePromoModal() {
    promoBackdrop.classList.remove('open');
    promoModal.classList.remove('open');
    document.body.style.overflow = '';
    sessionStorage.setItem('promoSeen', '1');
  }

  document.getElementById('promoModalClose').addEventListener('click', closePromoModal);
  promoBackdrop.addEventListener('click', closePromoModal);
  document.getElementById('promoModalCta').addEventListener('click', () => {
    closePromoModal();
    document.getElementById('productsSection').scrollIntoView({ behavior: 'smooth' });
  });

  setTimeout(openPromoModal, 1200);
}

// ── Init ──
loadProducts().then(() => {
  const pid = new URLSearchParams(location.search).get('product');
  if (pid) {
    const p = products.find(x => String(x.id) === pid);
    if (p) openProductModal(p.id);
  }
});
