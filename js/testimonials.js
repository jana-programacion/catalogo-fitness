// ── Testimonios: ticker automático ──
const testimonials = [
  { 
    comment: 'Muy buena la calidad y la atención, para entrenar vienen perfectas las prendas.', 
    name: 'Ticiano' 
  },
  { 
    comment: 'Super cómodo para ir a patinar!!! 😍', 
    name: 'Jana' 
  },
  { 
    comment: 'Tal cual las fotos, sin sorpresas!', 
    name: 'Pablo' 
  },
  { 
    comment: 'Las mejores prendas para ir al gym. Las recomiendo a todas mis amigas 💕', 
    name: 'Celeste' 
  },
];

const testimonialsTrackEl = document.getElementById('testimonialsTrack');

// Duplicamos para el loop infinito
[...testimonials, ...testimonials].forEach(t => {
  const card = document.createElement('div');
  card.className = 'testimonial-card';
  card.innerHTML = `
    <div class="testimonial-stars">★★★★★</div>
    <p class="testimonial-comment">"${t.comment}"</p>
    <span class="testimonial-name">— ${t.name}</span>
  `;
  testimonialsTrackEl.appendChild(card);
});
