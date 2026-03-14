// ── Carrusel hero ──
const track = document.getElementById('carouselTrack');
const dotsContainer = document.getElementById('carouselDots');
let currentSlide = 0;
let autoplayTimer;

heroSlides.forEach((slide, i) => {
  const div = document.createElement('div');
  div.className = 'carousel-slide';
  div.innerHTML = slide.imageUrl
    ? `<img src="${slide.imageUrl}" alt="Slide ${i + 1}" loading="lazy">`
    : `<div class="slide-placeholder">${slide.placeholder}</div>`;
  track.appendChild(div);

  const dot = document.createElement('button');
  dot.className = `carousel-dot${i === 0 ? ' active' : ''}`;
  dot.addEventListener('click', () => goToSlide(i));
  dotsContainer.appendChild(dot);
});

function goToSlide(n) {
  currentSlide = ((n % heroSlides.length) + heroSlides.length) % heroSlides.length;
  track.style.transform = `translateX(-${currentSlide * 100}%)`;
  dotsContainer.querySelectorAll('.carousel-dot').forEach((d, i) =>
    d.classList.toggle('active', i === currentSlide)
  );
  resetAutoplay();
}

function resetAutoplay() {
  clearInterval(autoplayTimer);
  autoplayTimer = setInterval(() => goToSlide(currentSlide + 1), 5000);
}

document.getElementById('carouselPrev').addEventListener('click', () => goToSlide(currentSlide - 1));
document.getElementById('carouselNext').addEventListener('click', () => goToSlide(currentSlide + 1));
resetAutoplay();

let touchStartX = 0;
track.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
track.addEventListener('touchend', e => {
  const d = e.changedTouches[0].screenX - touchStartX;
  if (Math.abs(d) > 50) goToSlide(currentSlide + (d > 0 ? -1 : 1));
}, { passive: true });
