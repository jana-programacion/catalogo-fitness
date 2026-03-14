// ── Testimonios: ticker automático ──
const testimonials = [
  { comment: 'Calidad increíble y súper cómodas para entrenar. Las uso todos los días y no pierden la forma ni el color.', name: 'Nombre Persona' },
  { comment: 'Los talles son exactos y la atención fue excelente. Llegaron rapidísimo y bien empaquetadas.', name: 'Nombre Persona' },
  { comment: 'Me encantaron los colores disponibles. Son exactamente como se ven en las fotos, sin sorpresas.', name: 'Nombre Persona' },
  { comment: 'Las mejores prendas que compré para ir al gimnasio. Las recomiendo a todas mis amigas.', name: 'Nombre Persona' },
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
