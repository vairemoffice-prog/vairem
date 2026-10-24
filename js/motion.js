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

  // one failing effect (e.g. an older browser) must never take the others down or hide content
  const safe = (name, fn) => { try { fn(); } catch (err) { if (window.console) console.warn('[motion] ' + name + ' disabled:', err); } };

  const root = document.documentElement;
  const narrow = () => window.innerWidth <= 860;

  // ---------- Lenis smooth scroll, driven by the GSAP ticker ----------

  let lenis = null;
  if (window.Lenis) safe('lenis', () => {
    const instance = new window.Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true, anchors: false });
    lenis = instance;
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
  });
  if (lenis && !window.__vairemLenis) lenis = null;

  // ---------- menu: hides when scrolling down, returns when scrolling up ----------

  const header = document.querySelector('.site-header');
  if (header) safe('menu', () => {
    let lastY = window.scrollY;
    let hidden = false;
    const setHidden = h => { if (h !== hidden) { hidden = h; header.classList.toggle('is-hidden', h); } };
    const onScrollY = () => {
      const y = window.scrollY;
      const menuOpen = !!header.querySelector('[aria-expanded="true"]');
      const cart = document.getElementById('cart-overlay');
      if (y < 120 || menuOpen || (cart && !cart.hidden)) setHidden(false);
      else if (y > lastY + 4) setHidden(true);
      else if (y < lastY - 4) setHidden(false);
      lastY = y;
    };
    window.addEventListener('scroll', onScrollY, { passive: true });
    header.addEventListener('focusin', () => setHidden(false));
  });

  // ---------- photos: pinned scene. Photo 1 grows from small, then slides out to the left while
  // ---------- photo 2 slides in from the right (separately, never on top of each other) ----------

  const adSection = document.getElementById('photo-scene');
  if (adSection) safe('photo scene', () => {
    const stage = adSection.querySelector('.photo-stage');
    const frames = [...adSection.querySelectorAll('[data-photo-frame]')];
    const caption = adSection.querySelector('.photo-caption');
    if (!stage || frames.length < 2) return;
    const SMALL = 0.3;
    // distance a photo travels to leave (or enter) the screen completely, plus a small margin
    const travel = () => stage.clientWidth / 2 + frames[0].offsetWidth / 2 + 24;
    try {
      adSection.classList.add('is-scrub');
      gsap.set(frames, { clearProps: 'transform,opacity' });
      gsap.set(frames[0], { scale: SMALL, opacity: 1 }); // visible (small) as soon as the section scrolls into view
      gsap.set(frames[1], { scale: 1, opacity: 0, x: travel });
      if (caption) gsap.set(caption, { opacity: 0, y: 24 });

      // one timeline across the whole section (length 1 = full scroll range)
      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          trigger: adSection, start: 'top top', end: 'bottom bottom', scrub: 0.8, invalidateOnRefresh: true,
          onUpdate: self => { if (caption) caption.classList.toggle('is-on', self.progress > 0.9); }
        }
      });
      tl.to(frames[0], { scale: 1, duration: 0.3 }, 0)                       // photo 1 grows
        .set(frames[1], { opacity: 1 }, 0.5)                                  // photo 2 waits off-screen right
        .to(frames[0], { x: () => -travel(), duration: 0.35 }, 0.5)          // photo 1 leaves to the left
        .to(frames[1], { x: 0, duration: 0.35 }, 0.5);                       // photo 2 arrives from the right
      if (caption) tl.to(caption, { opacity: 1, y: 0, duration: 0.1 }, 0.87);
      tl.to({}, { duration: 0.03 }, 0.97); // pad so the timeline length is exactly 1
      window.__vairemAdScene = true; // app.js keeps its own fallback off only when this succeeded
    } catch (err) {
      // back to plain stacked photos: always visible
      adSection.classList.remove('is-scrub');
      // clear only what was animated; the inline --ar custom property on each frame must stay
      gsap.set(frames, { clearProps: 'transform,opacity' });
      if (caption) gsap.set(caption, { clearProps: 'transform,opacity' });
      throw err;
    }
  });

  // ---------- section titles: typography slides across the screen (parallax) ----------

  if (!narrow()) safe('typography', () => {
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
  });

  // ---------- worlds: a light mist over the method section (the background never darkens) ----------

  const metodaSection = document.getElementById('metoda');
  if (metodaSection) safe('mist', () => {
    gsap.timeline({
      scrollTrigger: { trigger: metodaSection, start: 'top 80%', end: 'bottom 20%', scrub: 0.6 }
    })
      .fromTo(root, { '--mist-a': 0 }, { '--mist-a': 0.22, ease: 'none', duration: 0.25 })
      .to(root, { '--mist-a': 0.22, ease: 'none', duration: 0.5 })
      .to(root, { '--mist-a': 0, ease: 'none', duration: 0.25 });
  });

  // ---------- inertia: headings lean into the scroll direction and settle back ----------

  if (lenis && !narrow()) safe('inertia', () => {
    const heads = [...document.querySelectorAll('.section-head')];
    if (heads.length) {
      const skew = gsap.quickTo(heads, 'skewX', { duration: 0.6, ease: 'power3.out' });
      gsap.ticker.add(() => {
        const v = lenis.velocity || 0;
        skew(Math.max(-7, Math.min(7, -v * 0.35)));
      });
    }
  });

  // layout may change after fonts / images load or the language is switched
  window.addEventListener('load', () => ScrollTrigger.refresh());
  document.addEventListener('vairem:content-swapped', () => ScrollTrigger.refresh());
})();
