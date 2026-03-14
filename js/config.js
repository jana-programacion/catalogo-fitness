// ── Configuración global ──
// Feature flags
const PROMO_2DA_PRENDA = true; // 20% off en la prenda más barata del carrito (requiere 2+ prendas)
const SHEETS_API = 'https://script.google.com/macros/s/AKfycbyLUp_SIZafExSc1VB3neUrnHBRiliKATG3A5KqsY01mxLaMpSGdbLZNK_nvqGOJ5K_MA/exec';
const WHATSAPP_NUMBER = '5493489617189';

const heroSlides = [
  { imageUrl: '', placeholder: '🏋️‍♀️' },
  { imageUrl: '', placeholder: '👟' },
  { imageUrl: '', placeholder: '💪' },
];

// ── Estado compartido ──
let products = [];
let activeCategory = 'Todos';
let activeSort = 'destacados';
let cart = [];
