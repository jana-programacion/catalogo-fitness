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

// ── Init ──
loadProducts();
