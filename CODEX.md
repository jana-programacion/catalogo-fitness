Claude · MD
Copiar

# My Clothes Fitness — Catálogo Web
 
## Resumen del proyecto
Catálogo web estático (GitHub Pages) para **My Clothes Fitness**, un emprendimiento de ropa deportiva con entregas locales. El sitio funciona como vitrina de productos con carrito que envía el pedido por WhatsApp.
 
## Stack técnico
- **Frontend**: HTML/CSS/JS vanilla, single file (`index.html`)
- **Hosting**: GitHub Pages con dominio personalizado via Namecheap
- **Datos**: Google Sheets como CMS → Apps Script (`doGet`) devuelve JSON → fetch desde el frontend
- **Imágenes**: Hosteadas en postimg.cc
 
## Arquitectura de datos
 
### Google Sheets → Apps Script → Frontend
1. Los productos se cargan en una Google Sheet con estas columnas:
   - `name` — nombre del producto
   - `description` — descripción corta
   - `price` — precio numérico (vacío = "Consultar")
   - `imageUrl` — URL de la imagen (postimg.cc)
   - `category` — categoría para filtros (Tops, Shorts, Calzas, Conjuntos, Bikers, Catsuits, Musculosas, Crop Tops, Remeras, Hombre)
   - `colors` — colores disponibles separados por coma
   - `sizes` — talles separados por coma (S,M,L para mujer; M,L,XL,XXL para hombre)
   - `featured` — TRUE/FALSE, determina qué productos aparecen en la sección Favoritos
   - `badge` — etiqueta que aparece sobre la imagen ("Nuevo", "Oferta", "Últimas unidades", etc.)
 
2. Apps Script expone un endpoint `doGet()` que lee la sheet y devuelve JSON
3. El frontend hace `fetch()` al endpoint al cargar la página
 
### Apps Script (`Código.gs`)
```javascript
function doGet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('NOMBRE_DE_LA_HOJA');
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  
  var products = [];
  for (var i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = data[i][j];
    }
    obj.id = i;
    obj.price = obj.price ? Number(obj.price) : null;
    obj.featured = (obj.featured === true || obj.featured === 'TRUE');
    products.push(obj);
  }
 
  return ContentService
    .createTextOutput(JSON.stringify(products))
    .setMimeType(ContentService.MimeType.JSON);
}
```
 
### URL del endpoint Apps Script
```
const SHEETS_API = 'https://script.google.com/macros/s/AKfycbwoYGOm8207FxdAyEoTgH_i5u5evv5zf5BNlRjIJaA3kmVJrmnEjHhAhPuLhEvO5USU/exec';
```
> **IMPORTANTE**: Usar siempre la URL de `script.google.com/macros/s/.../exec`, NO la de `script.googleusercontent.com` (esa da error CORS con fetch).
> La URL no cambia mientras no se cree una nueva implementación en Apps Script.
 
## Funcionalidades del frontend
 
### Estructura de la página
1. **Top stripe** — degradado celeste decorativo (6px)
2. **Marquee banner** — texto scrolleando con info de envíos
3. **Promo bar** — barra de promo estática
4. **Navbar sticky** — hamburguesa (mobile), logo, buscador (desktop), cuenta, carrito con badge
5. **Hero carousel** — 3 slides con autoplay 5s, flechas, dots, swipe táctil
6. **Productos** — barra de búsqueda mobile, filtros por categoría (pills), grilla de productos
7. **Trust bar** — 3 columnas: envío, pagos, seguridad
8. **Favoritos** — productos con `featured: true` en la sheet
9. **Footer** — páginas, contacto (WhatsApp), Instagram
10. **Botones flotantes** — WhatsApp e Instagram fijos abajo a la derecha
 
### Búsqueda
- 3 inputs sincronizados: desktop navbar, mobile overlay (hamburguesa), barra sobre productos (mobile only)
- Filtra en tiempo real por nombre + descripción
- Ignora acentos y mayúsculas (normalización NFD)
- Búsqueda multi-palabra: todas las palabras deben matchear
- Se combina con el filtro de categoría activo
- Enter hace scroll suave a la grilla
 
### Filtros por categoría
- Se generan automáticamente desde la columna `category` de la sheet
- Botón "Todos" + una pill por cada categoría única
- En mobile hacen scroll horizontal (no wrappean)
- Se combinan con la búsqueda de texto
 
### Carrito
- Botón 🛒 en cada card, visible en hover (desktop) o siempre visible (mobile)
- Feedback visual: ícono cambia a ✓ por 800ms al agregar
- Badge animado en el ícono del carrito en el navbar
- Drawer lateral derecho con items, cantidad +/−, total
- Productos sin precio muestran "Consultar", total marca con asterisco (*)
- Botón "Consultar por WhatsApp" arma mensaje automático con detalle del pedido
 
### Loading & Error states
- Spinner "Cargando productos..." mientras fetchea
- Si falla el fetch, muestra mensaje con botón "Reintentar"
 
### Badges
- Si un producto tiene valor en `badge` (ej: "Nuevo"), se muestra como etiqueta sobre la imagen
- Estilo: pill celeste, posición top-left
 
### Responsive (3 breakpoints)
- **1024px** (tablet): grilla 3 columnas
- **768px** (tablet chico): hamburguesa, grilla 2 columnas, barra de búsqueda sobre productos, trust bar apilada, categorías scroll horizontal
- **480px** (celular): todo compacto, oculta descripciones y talles
 
## Contacto / Redes
- **WhatsApp**: 5493489617189
- **Instagram**: @my.clothesfitness
- **Zona de entrega**: Zárate y Campana, Buenos Aires, Argentina
 
## Paleta de colores
```css
--sky-50: #f0f7ff;   --sky-100: #e0efff;   --sky-200: #baddff;
--sky-300: #8ec8ff;   --sky-400: #5aafff;   --sky-500: #3b94e6;
--sky-600: #2a6db3;   --sky-700: #1e4f80;
--cream: #fafcff;     --text-dark: #2c3e50;
--text-mid: #5a7a9b;  --text-light: #8bacc8;
--border: #d6e6f5;    --white: #ffffff;
```
Tipografías: **Cormorant Garamond** (títulos/logo) + **Jost** (body/UI).
 
## Convenciones de código
- Archivos simples. index.html index.js index.css
- Abiertos a la modularización en caso de que sea necesario.
- CSS variables para colores, responsive con media queries
- JS vanilla, sin frameworks ni dependencias (mandatory)
- Productos se renderizan dinámicamente desde el array fetcheado
- Event delegation para botones de carrito y qty
- `object-fit: cover` con `aspect-ratio: 1` para imágenes de producto (maneja tamaños distintos)
 
## Troubleshooting conocido
 
### Apps Script
- **"doGet not found"**: El código no se guardó antes de deployear, o está en un archivo separado. Guardar → Nueva implementación.
- **"Cannot read properties of null (reading 'getDataRange')"**: El nombre de la hoja en `getSheetByName()` no coincide con la pestaña real de la sheet.
- **CORS / "Failed to fetch"**: Se está usando la URL de `googleusercontent.com` en vez de `script.google.com/macros/s/.../exec`.
 
### GitHub Pages + Namecheap
- DNS: 4 registros A (185.199.108-111.153) + CNAME www → usuario.github.io
- Propagación: 10min a 48h, verificar con dnschecker.org
- HTTPS: se activa desde Settings → Pages → Enforce HTTPS (después de propagar DNS)
 
## Archivos del proyecto
```
catalogo-fitness/
├── index.html          # Toda la app (HTML + CSS + JS)
├── CLAUDE.md           # Este archivo
└── README.md
```