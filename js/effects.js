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
