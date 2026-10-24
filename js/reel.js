// Photo reel (carousel) on the home page: photos move one at a time. Buttons, dots, swipe/drag,
// arrow keys and a slow auto-advance that stops on hover/focus/interaction and for reduced motion.
(() => {
  'use strict';

  const root = document.getElementById('photo-reel');
  if (!root) return;
  const viewport = root.querySelector('.reel-viewport');
  const track = root.querySelector('.reel-track');
  const slides = [...root.querySelectorAll('.reel-slide')];
  const dots = [...root.querySelectorAll('.reel-dot')];
  if (!viewport || !track || slides.length < 2) return;

  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const AUTO_MS = 6000;
  let index = 0;
  let dragX = 0;
  let timer = null;
  let paused = false;

  // offset that centres slide i in the viewport
  const offsetFor = i => {
    const s = slides[i];
    return viewport.clientWidth / 2 - (s.offsetLeft + s.offsetWidth / 2);
  };

  function render(extra) {
    track.style.transform = 'translateX(' + (offsetFor(index) + (extra || 0)).toFixed(1) + 'px)';
    slides.forEach((s, i) => s.classList.toggle('is-active', i === index));
    dots.forEach((d, i) => {
      d.classList.toggle('is-active', i === index);
      d.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });
  }

  const go = i => { index = (i + slides.length) % slides.length; render(0); restart(); };
  const next = () => go(index + 1);
  const prev = () => go(index - 1);

  // ---- auto-advance ----
  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  function start() { if (!reduced && !paused && !timer && inView) timer = setInterval(() => go(index + 1), AUTO_MS); }
  function restart() { stop(); start(); }
  let inView = false;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { inView = entries.some(e => e.isIntersecting); inView ? start() : stop(); }, { threshold: 0.3 }).observe(root);
  }
  root.addEventListener('mouseenter', () => { paused = true; stop(); });
  root.addEventListener('mouseleave', () => { paused = false; start(); });
  root.addEventListener('focusin', () => { paused = true; stop(); });
  root.addEventListener('focusout', () => { paused = false; start(); });

  // ---- controls ----
  root.querySelector('[data-reel="prev"]').addEventListener('click', prev);
  root.querySelector('[data-reel="next"]').addEventListener('click', next);
  dots.forEach(d => d.addEventListener('click', () => go(Number(d.dataset.reelGo))));
  viewport.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
  });

  // ---- swipe / drag ----
  let startX = null, startY = 0, moved = false;
  viewport.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    startX = e.clientX; startY = e.clientY; dragX = 0; moved = false;
  });
  viewport.addEventListener('pointermove', e => {
    if (startX === null) return;
    const dx = e.clientX - startX, dy = e.clientY - startY;
    if (!moved && Math.abs(dx) < 6) return;
    if (!moved && Math.abs(dy) > Math.abs(dx)) { startX = null; return; } // vertical scroll, not a swipe
    if (!moved) { moved = true; viewport.classList.add('is-dragging'); try { viewport.setPointerCapture(e.pointerId); } catch (_) {} }
    dragX = dx;
    render(dragX);
  });
  const end = () => {
    if (startX === null) return;
    startX = null;
    viewport.classList.remove('is-dragging');
    const threshold = Math.min(120, viewport.clientWidth * 0.15);
    if (moved && dragX <= -threshold) next();
    else if (moved && dragX >= threshold) prev();
    else render(0);
    dragX = 0;
  };
  viewport.addEventListener('pointerup', end);
  viewport.addEventListener('pointercancel', end);

  window.addEventListener('resize', () => render(0));
  window.addEventListener('load', () => render(0));
  render(0);
})();
