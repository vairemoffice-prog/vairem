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

    // keyboard scrolling gets the same inertia (arrows, space, page up/down, home/end)
    window.addEventListener('keydown', e => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON|A|VIDEO|AUDIO)$/.test(t.tagName))) return;
      const page = window.innerHeight * 0.9;
      let next = null;
      switch (e.key) {
        case 'ArrowDown': next = target + 90; break;
        case 'ArrowUp': next = target - 90; break;
        case 'PageDown': next = target + page; break;
        case 'PageUp': next = target - page; break;
        case ' ': next = target + (e.shiftKey ? -page : page); break;
        case 'Home': next = 0; break;
        case 'End': next = maxScroll(); break;
        default: return;
      }
      e.preventDefault();
      target = Math.min(Math.max(next, 0), maxScroll());
      requestTick();
    });

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
    dot.innerHTML = '<span class="fx-cursor-arrow"></span>';
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
      dot.classList.toggle('fx-cursor--hover', !!e.target.closest('a, button, .btn, [data-add], .music-splash'));
    });

    function raf() {
      cx += (x - cx) * 0.55;
      cy += (y - cy) * 0.55;
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

    const SELECTOR = '.btn, .list-form button, .contact-form button, .menu-toggle';
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
        // The side MENU tab positions itself with `transform` (and is draggable), so it is pulled
        // with the separate `translate` property instead of replacing its transform.
        const isTab = el.classList.contains('menu-toggle');
        const prop = isTab ? 'translate' : 'transform';
        if (dist < reach && el.style.cursor !== 'grabbing') {
          const pull = (1 - dist / reach) * STRENGTH;
          const x = (dx * pull).toFixed(2);
          const y = (dy * pull).toFixed(2);
          el.style[prop] = isTab ? `${x}px ${y}px` : `translate(${x}px, ${y}px)`;
        } else if (el.style[prop]) {
          el.style[prop] = '';
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
      '#page-content .legal-main > *:not(.wrap)'
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


  // ---------- showcase scroll (home page) ----------
  // After the welcome screen, the home page glides from top to bottom and back again, without
  // stopping, as a slow showcase. Any touch, click, wheel, key press or manual scroll hands control
  // back to the visitor for good (until the page is reloaded). Not run with reduced motion.

  function initShowcaseScroll() {
    if (reducedMotion || !document.getElementById('hero-region') || location.hash) return;

    const PERIOD = 150000;   // ms for one full trip down and back
    const START_DELAY = 3500; // ms after the welcome screen is gone
    let running = false;
    let stopped = false;
    let phase0 = 0;
    let t0 = 0;
    let lastY = -1;
    let rafId = 0;

    const maxScroll = () => Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);

    function stop() {
      if (stopped) return;
      stopped = true;
      running = false;
      cancelAnimationFrame(rafId);
      INPUTS.forEach(t => window.removeEventListener(t, onInput, true));
      document.removeEventListener('vairem:content-swapped', stop);
    }
    const INPUTS = ['wheel', 'touchstart', 'pointerdown', 'mousedown', 'keydown'];

    function frame(now) {
      if (!running) return;
      const max = maxScroll();
      if (max < 50 || !document.getElementById('hero-region')) { stop(); return; }
      // somebody else moved the page (scrollbar drag, anchor jump, momentum): hand over control
      if (lastY >= 0 && Math.abs(window.scrollY - lastY) > 3) { stop(); return; }
      // position follows a cosine: top -> bottom -> top; no abrupt stop at either end
      const phase = phase0 + ((now - t0) / PERIOD) * Math.PI * 2;
      const y = max * (0.5 - 0.5 * Math.cos(phase));
      window.scrollTo(0, y);
      lastY = window.scrollY;
      rafId = requestAnimationFrame(frame);
    }

    function begin() {
      if (stopped) return;
      running = true;
      const max = maxScroll();
      const y = window.scrollY;
      // start from wherever the page is now
      phase0 = Math.acos(Math.min(Math.max(1 - (2 * y) / Math.max(max, 1), -1), 1));
      t0 = performance.now();
      lastY = -1;
      rafId = requestAnimationFrame(frame);
    }

    // input on the welcome screen (entering the site) must not cancel the showcase
    const onInput = () => {
      if (document.documentElement.classList.contains('music-splash-open')) return;
      stop();
    };
    INPUTS.forEach(t => window.addEventListener(t, onInput, { capture: true, passive: true }));
    document.addEventListener('vairem:content-swapped', stop);
    document.addEventListener('visibilitychange', () => {
      if (stopped) return;
      if (document.hidden) { running = false; cancelAnimationFrame(rafId); }
      else if (!running && started) begin();
    });

    // wait until the welcome screen (if any) is dismissed, then a short pause so the hero can be seen
    let started = false;
    let quietSince = 0;
    const poll = setInterval(() => {
      if (stopped) { clearInterval(poll); return; }
      const blocked = document.documentElement.classList.contains('music-splash-open');
      if (blocked) { quietSince = 0; return; }
      if (!quietSince) quietSince = Date.now();
      if (Date.now() - quietSince >= START_DELAY) {
        clearInterval(poll);
        started = true;
        begin();
      }
    }, 250);
  }

  initSmoothScroll();
  initCustomCursor();
  initMagnetic();
  initGenericReveal();
  initShowcaseScroll();
})();
