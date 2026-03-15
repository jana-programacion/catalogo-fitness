# My Clothes Fitness — Catálogo Web

## Resumen
Catálogo web estático (GitHub Pages) para **My Clothes Fitness**, ropa deportiva con entregas locales en Zárate y Campana, Buenos Aires. El sitio funciona como vitrina de productos con carrito que envía el pedido por WhatsApp.

## Stack
- **Frontend**: HTML/CSS/JS vanilla — sin frameworks ni dependencias (mandatory)
- **Hosting**: GitHub Pages con dominio personalizado via Namecheap
- **CMS**: Google Sheets → Apps Script (`doGet`) → JSON → `fetch()` en el frontend
- **Imágenes**: Cloudinary (`res.cloudinary.com/dgamrfddt/...`) o postimg.cc (legacy)

## Estructura de archivos
```
catalogo-fitness/
├── index.html          # HTML de la app + prefetch script en <head>
├── css/
│   └── styles.css      # Todos los estilos (variables, componentes, responsive)
├── js/
│   ├── config.js       # API URL, feature flags, estado global compartido, heroSlides
│   ├── carousel.js     # Carrusel hero (autoplay, swipe, dots)
│   ├── products.js     # Fetch, caché localStorage, render de grilla y categorías
│   ├── search.js       # Búsqueda, filtros, ordenamiento, load-more
│   ├── cart.js         # Carrito, descuentos, mensaje WhatsApp
│   ├── modal.js        # Modal de detalle de producto (galería, swipe, lightbox)
│   ├── testimonials.js # Ticker infinito de testimonios
│   └── nav.js          # Hamburguesa mobile, promo popup, init de la app
├── CLAUDE.md           # Este archivo (instrucciones para Claude)
└── CODEX.md            # Alias de este archivo para Codex/Copilot
```

## Columnas de Google Sheets

| Columna | Descripción |
|---------|-------------|
| `name` | Nombre del producto |
| `description` | Descripción corta |
| `price` | Precio numérico (vacío = "Consultar") |
| `imageUrl` | URL imagen principal |
| `extraImages` | Imágenes adicionales separadas por `\|` (pipe). Fallback legacy: `,https://` para URLs con comas internas (ej: Cloudinary con parámetros de transformación) |
| `category` | Categoría para filtros (se genera automáticamente en la UI) |
| `colors` | Colores disponibles separados por coma |
| `sizes` | Talles separados por coma (S,M,L / M,L,XL,XXL) |
| `featured` | TRUE/FALSE — aparece primero en la grilla |
| `badge` | Etiqueta sobre la imagen ("Nuevo", "Oferta", "Últimas unidades", etc.) |

## Apps Script endpoint
```js
// En js/config.js y duplicado en el prefetch de <head> (corre antes de cargar scripts)
const SHEETS_API = 'https://script.google.com/macros/s/AKfycbyLUp_SIZafExSc1VB3neUrnHBRiliKATG3A5KqsY01mxLaMpSGdbLZNK_nvqGOJ5K_MA/exec';
```
> Usar siempre `script.google.com/macros/s/.../exec`, NO `script.googleusercontent.com` (da error CORS).
> La URL no cambia a menos que se cree una nueva implementación en Apps Script.

## Contacto / Redes
- **WhatsApp**: 5493489617189
- **Instagram**: @my.clothesfitness

## Paleta de colores
```
--sky-50:  #f0f7ff   --sky-100: #e0efff   --sky-200: #baddff   --sky-300: #8ec8ff
--sky-400: #5aafff   --sky-500: #3b94e6   --sky-600: #2a6db3   --sky-700: #1e4f80
--cream:   #fafcff   --text-dark: #2c3e50  --text-mid: #5a7a9b  --text-light: #8bacc8
--border:  #d6e6f5   --white: #ffffff
```
Tipografías: **Barlow Condensed** (headers/logo) · **Cormorant Garamond** (títulos serif) · **Jost** (body/UI)

## Convenciones de código
- JS vanilla sin dependencias (mandatory)
- Estado global en `config.js`: `products`, `cart`, `activeCategory`, `activeSort`, `visibleLimit`
- Caché de productos en `localStorage` (5 min TTL) + prefetch anticipado desde `<head>`
- `object-fit: cover; object-position: center 25%` en imágenes del modal de producto
- Event delegation para clicks en grilla de productos y carrito
- Responsive: 1024px (3 cols) · 768px (2 cols + hamburguesa) · 480px (compacto) · 640px (modal bottom sheet)

## Troubleshooting conocido
- **CORS / fetch error**: usar URL `script.google.com/macros/s/.../exec`, no `googleusercontent.com`
- **"doGet not found"**: guardar el código en Apps Script antes de deployear → crear Nueva implementación
- **extraImages con error 400**: las URLs de Cloudinary tienen comas en los parámetros de transformación — separar con `|` en la Sheet
- **DNS GitHub Pages**: 4 registros A (185.199.108/109/110/111.153) + CNAME `www` → `usuario.github.io`
