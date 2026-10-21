// Scroll-driven motion for the home page: Lenis smooth scroll + GSAP ScrollTrigger scenes.
// Everything here is an enhancement: with reduced motion, without the libraries, or on error the
// page keeps its plain layout (the older rAF fallbacks in app.js / effects.js take over).
(() => {
  'use strict';

  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !window.gsap || !window.ScrollTrigger) return;

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  window.__vairemMotion = true; // tells app.js / effects.js that this file owns scroll effects

  const root = document.documentElement;
  const narrow = () => window.innerWidth <= 860;

  // ---------- Lenis smooth scroll, driven by the GSAP ticker ----------

  let lenis = null;
  if (window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true, anchors: false });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    window.__vairemLenis = lenis;

    // pause while an overlay owns the screen (welcome screen, cart drawer)
    const syncLock = () => {
      const cart = document.getElementById('cart-overlay');
      const locked = root.classList.contains('music-splash-open') || (cart && !cart.hidden);
      if (locked) lenis.stop(); else lenis.start();
    };
    new MutationObserver(syncLock).observe(root, { attributes: true, attributeFilter: ['class'] });
    const cartOverlay = document.getElementById('cart-overlay');
    if (cartOverlay) new MutationObserver(syncLock).observe(cartOverlay, { attributes: true, attributeFilter: ['hidden'] });
    document.querySelectorAll('.cart-drawer, .cart-items').forEach(el => el.setAttribute('data-lenis-prevent', ''));
    syncLock();
  }

  // ---------- advertising photos: pinned scene, photos grow from small and cross-fade ----------

  const adSection = document.getElementById('ad-scroll');
  if (adSection) {
    const frames = [...adSection.querySelectorAll('[data-ad-frame]')];
    const caption = adSection.querySelector('.ad-caption');
    if (frames.length >= 2) {
      adSection.classList.add('is-scrub');
      const SMALL = 0.3;
      gsap.set(frames, { clearProps: 'transform,opacity' });
      gsap.set(frames, { xPercent: -50, yPercent: -50, left: '50%', top: '50%', scale: SMALL, opacity: 0, force3D: true });
      gsap.set(frames.map(f => f.querySelector('img')), { scale: 1.18 });
      if (caption) gsap.set(caption, { opacity: 0, y: 24 });

      // one timeline across the whole section (length 1 = full scroll range)
      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: { trigger: adSection, start: 'top top', end: 'bottom bottom', scrub: 0.8 }
      });
      tl.to(frames[0], { opacity: 1, duration: 0.1, ease: 'none' }, 0)
        .to(frames[0], { scale: 1, duration: 0.3 }, 0)
        .to(frames[0].querySelector('img'), { scale: 1, duration: 0.3 }, 0)
        .to(frames[0], { opacity: 0, scale: 1.08, duration: 0.23 }, 0.55)
        .to(frames[1], { opacity: 1, duration: 0.14, ease: 'none' }, 0.42)
        .to(frames[1], { scale: 1, duration: 0.36 }, 0.42)
        .to(frames[1].querySelector('img'), { scale: 1, duration: 0.36 }, 0.42);
      if (caption) tl.to(caption, { opacity: 1, y: 0, duration: 0.14 }, 0.82);
      tl.to({}, { duration: 0.04 }, 0.96); // pad so the timeline length is exactly 1
    }
  }

  // ---------- section titles: typography slides across the screen (parallax) ----------

  if (!narrow()) {
    document.querySelectorAll('.section-head').forEach(head => {
      const title = head.querySelector('.section-title');
      const note = head.querySelector('.section-note');
      // title and note converge into place by the time the heading is mid-screen, then hold
      const trigger = { trigger: head, start: 'top bottom', end: 'center center', scrub: 0.5 };
      if (title) {
        title.style.cssText += ';translate:var(--tx,0px) 0;will-change:translate;';
        gsap.fromTo(title, { '--tx': '5vw' }, { '--tx': '0vw', ease: 'none', scrollTrigger: trigger });
      }
      if (note) {
        note.style.cssText += ';translate:var(--tx,0px) 0;will-change:translate;';
        gsap.fromTo(note, { '--tx': '-5vw' }, { '--tx': '0vw', ease: 'none', scrollTrigger: trigger });
      }
    });

    // method cards: number and copy drift at different depths inside their (fixed) card
    document.querySelectorAll('.metoda-card').forEach(card => {
      const trigger = { trigger: card, start: 'top bottom', end: 'bottom top', scrub: 0.7 };
      [['.metoda-index', 7], ['.metoda-copy', -2.5]].forEach(([sel, depth]) => {
        const el = card.querySelector(sel);
        if (!el) return;
        el.style.cssText += ';translate:0 var(--py,0px);will-change:translate;';
        gsap.fromTo(el, { '--py': depth + 'vh' }, { '--py': -depth + 'vh', ease: 'none', scrollTrigger: trigger });
      });
    });
  }

  // layout may change after fonts / images load or the language is switched
  window.addEventListener('load', () => ScrollTrigger.refresh());
  document.addEventListener('vairem:content-swapped', () => ScrollTrigger.refresh());
})();
