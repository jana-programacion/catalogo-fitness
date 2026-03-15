// ── Carrito ──
const CART_KEY = 'catalogo_cart_v1';

function saveCart() {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(
      cart.map(({ key, product, color, size, qty }) => ({ key, pid: product.id, color, size, qty }))
    ));
  } catch(e) {}
}

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    cart = saved.map(({ key, pid, color, size, qty }) => {
      const product = products.find(p => p.id == pid);
      return product ? { key, product, color, size, qty } : null;
    }).filter(Boolean);
    updateCartUI();
  } catch(e) { cart = []; }
}

const cartBadge = document.getElementById('cartBadge');
const cartDrawer = document.getElementById('cartDrawer');
const cartBackdrop = document.getElementById('cartBackdrop');
const cartItemsEl = document.getElementById('cartItems');
const cartEmptyEl = document.getElementById('cartEmpty');
const cartFooterEl = document.getElementById('cartFooter');
const cartTotalEl = document.getElementById('cartTotal');

function openCart() {
  cartDrawer.classList.add('open');
  cartBackdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  cartDrawer.classList.remove('open');
  cartBackdrop.classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('openCart').addEventListener('click', openCart);
document.getElementById('closeCart').addEventListener('click', closeCart);
cartBackdrop.addEventListener('click', closeCart);

function cartKey(pid, color, size) {
  return `${pid}|${color || ''}|${size || ''}`;
}

function addToCart(pid, color, size) {
  const product = products.find(p => p.id === pid);
  if (!product) return;
  const key = cartKey(pid, color, size);
  const existing = cart.find(c => c.key === key);
  if (existing) existing.qty++;
  else cart.push({ key, product, color: color || null, size: size || null, qty: 1 });
  updateCartUI();
}

function changeQty(key, delta) {
  const item = cart.find(c => c.key === key);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(c => c.key !== key);
  updateCartUI();
}

function calcDiscount() {
  if (!PROMO_2DA_PRENDA) return 0;
  // Expandir cada ítem por su qty en unidades individuales con precio
  const units = [];
  cart.forEach(c => {
    if (c.product.price) {
      for (let i = 0; i < c.qty; i++) units.push(c.product.price);
    }
  });
  if (units.length < 2) return 0;
  // La unidad más barata recibe 20% off
  const cheapest = Math.min(...units);
  return Math.round(cheapest * 0.20);
}

function updateCartUI() {
  const totalItems = cart.reduce((s, c) => s + c.qty, 0);
  const subtotal   = cart.reduce((s, c) => s + (c.product.price || 0) * c.qty, 0);
  const discount   = calcDiscount();
  const totalPrice = subtotal - discount;
  const hasConsultar = cart.some(c => !c.product.price);

  cartBadge.textContent = totalItems;
  if (totalItems > 0) {
    cartBadge.classList.add('visible');
    cartBadge.classList.remove('bump');
    void cartBadge.offsetWidth;
    cartBadge.classList.add('bump');
  } else {
    cartBadge.classList.remove('visible');
  }

  if (cart.length === 0) {
    cartEmptyEl.style.display = '';
    cartFooterEl.style.display = 'none';
    cartItemsEl.querySelectorAll('.cart-item').forEach(el => el.remove());
    return;
  }

  cartEmptyEl.style.display = 'none';
  cartFooterEl.style.display = '';
  cartItemsEl.querySelectorAll('.cart-item').forEach(el => el.remove());

  cart.forEach(({ key, product, color, size, qty }) => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    const img = product.imageUrl
      ? `<img src="${product.imageUrl}" alt="${product.name}">`
      : `<span class="ci-placeholder">👕</span>`;
    const ciPrice = product.price ? `$${(product.price * qty).toLocaleString('es-AR')}` : 'Consultar';
    const variantsHtml = (color || size)
      ? `<span class="ci-variants">${[color, size].filter(Boolean).join(' · ')}</span>`
      : '';
    div.innerHTML = `
      <div class="cart-item-img">${img}</div>
      <div class="cart-item-details">
        <h4>${product.name}</h4>
        ${variantsHtml}
        <span class="ci-price">${ciPrice}</span>
      </div>
      <div class="cart-item-qty">
        <button class="qty-btn" data-key="${key}" data-delta="-1">−</button>
        <span>${qty}</span>
        <button class="qty-btn" data-key="${key}" data-delta="1">+</button>
      </div>
    `;
    cartItemsEl.appendChild(div);
  });

  // Filas de descuento
  const subtotalRow  = document.getElementById('cartSubtotalRow');
  const discountRow  = document.getElementById('cartDiscountRow');
  const subtotalEl   = document.getElementById('cartSubtotal');
  const discountEl   = document.getElementById('cartDiscount');

  if (discount > 0) {
    subtotalRow.style.display  = '';
    discountRow.style.display  = '';
    subtotalEl.textContent     = `$${subtotal.toLocaleString('es-AR')}`;
    discountEl.textContent     = `− $${discount.toLocaleString('es-AR')}`;
  } else {
    subtotalRow.style.display  = 'none';
    discountRow.style.display  = 'none';
  }

  cartTotalEl.textContent = `$${totalPrice.toLocaleString('es-AR')}${hasConsultar ? '*' : ''}`;
  saveCart();
}

cartItemsEl.addEventListener('click', e => {
  const btn = e.target.closest('.qty-btn');
  if (!btn) return;
  changeQty(btn.dataset.key, parseInt(btn.dataset.delta));
});

document.getElementById('checkoutBtn').addEventListener('click', () => {
  let msg = '¡Hola! Me gustaría consultar por estos productos:\n\n';
  cart.forEach(({ product, color, size, qty }) => {
    const ps = product.price ? `$${(product.price * qty).toLocaleString('es-AR')}` : 'A consultar';
    const variants = [color, size].filter(Boolean).join(', ');
    msg += `• ${product.name}${variants ? ` (${variants})` : ''} x${qty} — ${ps}\n`;
  });
  const subtotal = cart.reduce((s, c) => s + (c.product.price || 0) * c.qty, 0);
  const discount = calcDiscount();
  if (discount > 0) msg += `\nDescuento 2da prenda 20% off: − $${discount.toLocaleString('es-AR')}`;
  msg += `\nTotal: $${(subtotal - discount).toLocaleString('es-AR')}`;
  if (cart.some(c => !c.product.price)) msg += ' (algunos productos sujetos a consulta)';
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
});
