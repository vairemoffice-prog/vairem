(() => {
  'use strict';

  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fineHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // ---------- inertia (smooth) scroll ----------

  function initSmoothScroll() {
    if (reducedMotion || !fineHover) return;

    let current = window.scrollY;
    let target = window.scrollY;
    let ticking = false;

    function maxScroll() {
      return Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
    }

    function step() {
      current += (target - current) * 0.12;
      if (Math.abs(target - current) < 0.5) {
        current = target;
        window.scrollTo(0, current);
        ticking = false;
        return;
      }
      window.scrollTo(0, current);
      requestAnimationFrame(step);
    }

    function requestTick() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(step);
      }
    }

    window.addEventListener('wheel', e => {
      if (e.ctrlKey) return; // let pinch-zoom through
      e.preventDefault();
      target = Math.min(Math.max(target + e.deltaY, 0), maxScroll());
      requestTick();
    }, { passive: false });

    // stay in sync with scroll changes we didn't drive ourselves
    // (hash jumps, AJAX page swaps, browser back/forward)
    window.addEventListener('scroll', () => {
      if (!ticking) { current = window.scrollY; target = window.scrollY; }
    });
  }

  // ---------- custom cursor ----------

  function initCustomCursor() {
    if (reducedMotion || !fineHover) return;

    const dot = document.createElement('div');
    dot.className = 'fx-cursor';
    document.body.appendChild(dot);
    document.documentElement.classList.add('fx-cursor-active');

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let cx = x;
    let cy = y;
    let shown = false;

    window.addEventListener('mousemove', e => {
      x = e.clientX;
      y = e.clientY;
      if (!shown) { cx = x; cy = y; shown = true; dot.classList.add('fx-cursor--shown'); }
    });
    window.addEventListener('mouseleave', () => dot.classList.remove('fx-cursor--shown'));

    document.addEventListener('mouseover', e => {
      dot.classList.toggle('fx-cursor--hover', !!e.target.closest('a, button, .btn, [data-add]'));
    });

    function raf() {
      cx += (x - cx) * 0.18;
      cy += (y - cy) * 0.18;
      dot.style.transform = `translate(${cx}px, ${cy}px)`;
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // ---------- magnetic buttons ----------

  function initMagnetic() {
    if (reducedMotion || !fineHover) return;

    const SELECTOR = '.btn';

    function attach(el) {
      if (el.dataset.fxMagnet) return;
      el.dataset.fxMagnet = '1';
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.transition = 'transform 0.06s linear';
        el.style.transform = `translate(${dx * 0.25}px, ${dy * 0.25}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transition = 'transform 0.35s cubic-bezier(0.2, 1, 0.3, 1)';
        el.style.transform = 'translate(0, 0)';
      });
    }

    function scan() {
      document.querySelectorAll(SELECTOR).forEach(attach);
    }
    scan();
    document.addEventListener('vairem:content-swapped', scan);
  }

  // ---------- generic scroll-reveal (index.html has its own richer version already) ----------

  function initGenericReveal() {
    const SELECTOR = [
      '#page-content h1', '#page-content h2', '#page-content h3',
      '#page-content p', '#page-content article',
      '#page-content .cat-product', '#page-content .cat-add-row',
      '#page-content .co-step-panel', '#page-content .co-summary',
      '#page-content .legal-main > *'
    ].join(', ');

    const observer = (!reducedMotion && 'IntersectionObserver' in window)
      ? new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add('fx-visible');
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' })
      : null;

    function scan() {
      if (document.getElementById('hero-datasheet-rows')) return; // index.html: already handled by app.js

      document.querySelectorAll(SELECTOR).forEach(el => {
        if (el.dataset.fxRevealBound) return;
        el.dataset.fxRevealBound = '1';
        if (reducedMotion) return;
        el.classList.add('fx-reveal');
        if (observer) observer.observe(el);
        else el.classList.add('fx-visible');
      });
    }
    scan();
    document.addEventListener('vairem:content-swapped', scan);
  }

  initSmoothScroll();
  initCustomCursor();
  initMagnetic();
  initGenericReveal();
})();
