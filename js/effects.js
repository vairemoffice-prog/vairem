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
      current += (target - current) * 0.09;
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
  // A true proximity field: buttons start pulling toward the cursor before
  // it even touches them, with a stronger pull than a simple on-hover version.

  function initMagnetic() {
    if (reducedMotion || !fineHover) return;

    const SELECTOR = '.btn';
    const RADIUS = 90;
    const STRENGTH = 0.45;

    let elements = [];
    function scan() {
      elements = Array.from(document.querySelectorAll(SELECTOR));
    }
    scan();
    document.addEventListener('vairem:content-swapped', scan);

    let mouseX = -9999;
    let mouseY = -9999;
    window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

    function raf() {
      elements.forEach(el => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = mouseX - cx;
        const dy = mouseY - cy;
        const dist = Math.hypot(dx, dy);
        const reach = RADIUS + Math.max(r.width, r.height) / 2;
        if (dist < reach) {
          const pull = (1 - dist / reach) * STRENGTH;
          el.style.transform = `translate(${(dx * pull).toFixed(2)}px, ${(dy * pull).toFixed(2)}px)`;
        } else if (el.style.transform) {
          el.style.transform = '';
        }
      });
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // ---------- generic scroll-reveal ----------
  // Same per-character dissolve-in mechanic (and .reveal/.reveal-chars/.char
  // CSS) as index.html's own reveal system in app.js, so text on every other
  // page appears identically. Elements with nested markup (buttons, images)
  // fall back to a whole-block fade, exactly like app.js does.

  function initGenericReveal() {
    if (reducedMotion) return;

    const SELECTOR = [
      '#page-content h1', '#page-content h2', '#page-content h3',
      '#page-content p', '#page-content article',
      '#page-content .cat-add-row',
      '#page-content .co-step-panel', '#page-content .co-summary',
      '#page-content .legal-main > *'
    ].join(', ');

    const observer = ('IntersectionObserver' in window)
      ? new IntersectionObserver(entries => {
        entries.forEach(entry => {
          entry.target.classList.toggle('is-visible', entry.isIntersecting);
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' })
      : null;

    function wrapChars(el) {
      const nodes = Array.from(el.childNodes);
      const isLeaf = nodes.length > 0 && nodes.every(n =>
        n.nodeType === Node.TEXT_NODE || (n.nodeType === Node.ELEMENT_NODE && n.tagName === 'BR')
      );
      if (!isLeaf) return false;

      let i = 0;
      const frag = document.createDocumentFragment();
      nodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          frag.appendChild(document.createElement('br'));
          return;
        }
        node.textContent.split(/(\s+)/).forEach(chunk => {
          if (chunk === '') return;
          if (/^\s+$/.test(chunk)) {
            frag.appendChild(document.createTextNode(chunk));
            return;
          }
          const wordSpan = document.createElement('span');
          wordSpan.className = 'word';
          Array.from(chunk).forEach(ch => {
            const charSpan = document.createElement('span');
            charSpan.className = 'char';
            charSpan.style.setProperty('--i', i++);
            charSpan.textContent = ch;
            wordSpan.appendChild(charSpan);
          });
          frag.appendChild(wordSpan);
        });
      });
      el.innerHTML = '';
      el.appendChild(frag);
      return true;
    }

    function scan() {
      if (document.getElementById('hero-datasheet-rows')) return; // index.html: already handled by app.js

      const groupIndex = new Map();
      document.querySelectorAll(SELECTOR).forEach(el => {
        if (!el.dataset.revealMode) {
          const isChars = wrapChars(el);
          el.dataset.revealMode = isChars ? 'chars' : 'block';
          el.classList.add(isChars ? 'reveal-chars' : 'reveal');
        }

        const parent = el.parentElement;
        const n = groupIndex.get(parent) || 0;
        groupIndex.set(parent, n + 1);
        const delay = Math.min(n * 50, 300);
        if (el.dataset.revealMode === 'chars') {
          el.style.setProperty('--group-delay', delay + 'ms');
        } else {
          el.style.transitionDelay = delay + 'ms';
        }

        if (!el.dataset.revealObserved) {
          el.dataset.revealObserved = '1';
          if (observer) observer.observe(el);
          else el.classList.add('is-visible');
        }
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
