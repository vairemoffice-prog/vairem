(() => {
  'use strict';

  const AJAX_PAGES = new Set(['index.html', 'katalog.html']);

  function pageNameOf(url) {
    const name = url.pathname.split('/').pop();
    return name === '' ? 'index.html' : name;
  }

  let renderedPage = pageNameOf(new URL(location.href));
  let navSeq = 0;

  // ---------- menu open/close ----------

  let menuOpen = false;
  const overlay = document.getElementById('menu-overlay');
  const toggle = document.getElementById('menu-toggle');
  const closeBtn = document.getElementById('menu-close');
  const scrim = document.getElementById('menu-scrim');
  const drawer = document.querySelector('.menu-drawer');

  function setMenu(open) {
    menuOpen = open;
    overlay.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
  }

  let suppressToggleClick = false;

  toggle.addEventListener('click', () => {
    if (suppressToggleClick) { suppressToggleClick = false; return; }
    setMenu(true);
  });
  closeBtn.addEventListener('click', () => setMenu(false));
  scrim.addEventListener('click', () => setMenu(false));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menuOpen) setMenu(false);
  });

  if (window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let closeTimer = null;
    function openNow() { window.clearTimeout(closeTimer); setMenu(true); }
    function closeSoon() { window.clearTimeout(closeTimer); closeTimer = window.setTimeout(() => setMenu(false), 200); }
    toggle.addEventListener('mouseenter', openNow);
    toggle.addEventListener('mouseleave', closeSoon);
    drawer.addEventListener('mouseenter', openNow);
    drawer.addEventListener('mouseleave', closeSoon);
  }

  // ---------- keep the drawer positioned under whatever header is on screen ----------

  function updateOverlayTop() {
    const header = document.querySelector('#page-content header');
    if (header) overlay.style.top = header.getBoundingClientRect().height + 'px';
  }
  updateOverlayTop();
  window.addEventListener('resize', updateOverlayTop);

  // ---------- let each user drag the menu toggle to any vertical position ----------

  const TOGGLE_POS_KEY = 'vairem-menu-toggle-top';

  function currentHeaderHeight() {
    const header = document.querySelector('#page-content header');
    return header ? header.getBoundingClientRect().height : 76;
  }

  function clampToggleTop(px) {
    const min = currentHeaderHeight() + 8;
    const max = window.innerHeight - toggle.offsetHeight - 8;
    return Math.min(Math.max(px, min), max);
  }

  function applyStoredTogglePos() {
    let stored = null;
    try { stored = localStorage.getItem(TOGGLE_POS_KEY); } catch (e) {}
    if (stored === null) return;
    const frac = parseFloat(stored);
    if (isNaN(frac)) return;
    toggle.style.top = clampToggleTop(frac * window.innerHeight) + 'px';
    toggle.style.transform = 'none';
  }
  applyStoredTogglePos();

  window.addEventListener('resize', () => {
    if (toggle.style.top) toggle.style.top = clampToggleTop(parseFloat(toggle.style.top)) + 'px';
  });

  (function initToggleDrag() {
    let dragging = false;
    let moved = false;
    let startClientY = 0;
    let startTop = 0;

    toggle.addEventListener('pointerdown', e => {
      if (e.button !== undefined && e.button !== 0) return;
      dragging = true;
      moved = false;
      startClientY = e.clientY;
      startTop = toggle.getBoundingClientRect().top;
      toggle.setPointerCapture(e.pointerId);
    });

    toggle.addEventListener('pointermove', e => {
      if (!dragging) return;
      const dy = e.clientY - startClientY;
      if (!moved && Math.abs(dy) < 4) return;
      moved = true;
      toggle.style.top = clampToggleTop(startTop + dy) + 'px';
      toggle.style.transform = 'none';
      toggle.style.cursor = 'grabbing';
    });

    function endDrag() {
      if (!dragging) return;
      dragging = false;
      toggle.style.cursor = '';
      if (moved) {
        suppressToggleClick = true;
        const frac = parseFloat(toggle.style.top) / window.innerHeight;
        try { localStorage.setItem(TOGGLE_POS_KEY, String(frac)); } catch (e) {}
      }
    }

    toggle.addEventListener('pointerup', endDrag);
    toggle.addEventListener('pointercancel', endDrag);
  })();

  // ---------- scroll helper ----------

  function scrollToHash(hash) {
    if (!hash) { window.scrollTo({ top: 0 }); return; }
    const el = document.getElementById(hash.slice(1));
    if (el) el.scrollIntoView();
  }

  // ---------- fetch + swap navigation (KATALOG / INDEKS / METODA / 01 ISO / LIST only) ----------

  async function pageSwap(url, push) {
    const targetPage = pageNameOf(url);

    if (targetPage === renderedPage) {
      if (push) history.pushState({}, '', url.href);
      scrollToHash(url.hash);
      return;
    }

    const seq = ++navSeq;
    let html;
    try {
      const res = await fetch(url.pathname);
      if (!res.ok) throw new Error('bad status');
      html = await res.text();
    } catch (e) {
      window.location.href = url.href;
      return;
    }
    if (seq !== navSeq) return;

    const doc = new DOMParser().parseFromString(html, 'text/html');
    const newContent = doc.getElementById('page-content');
    const container = document.getElementById('page-content');
    if (!newContent || !container) {
      window.location.href = url.href;
      return;
    }

    const newStyle = doc.getElementById('page-style');
    let styleTag = document.getElementById('page-style');
    if (newStyle) {
      if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'page-style';
        document.head.appendChild(styleTag);
      }
      styleTag.textContent = newStyle.textContent;
    } else if (styleTag) {
      styleTag.textContent = '';
    }

    document.title = doc.title;
    container.innerHTML = newContent.innerHTML;
    renderedPage = targetPage;

    if (push) history.pushState({}, '', url.href);

    container.querySelectorAll('script').forEach(oldScript => {
      const s = document.createElement('script');
      for (const attr of oldScript.attributes) s.setAttribute(attr.name, attr.value);
      s.textContent = oldScript.textContent;
      s.async = false;
      oldScript.replaceWith(s);
    });

    updateOverlayTop();
    if (toggle.style.top) toggle.style.top = clampToggleTop(parseFloat(toggle.style.top)) + 'px';
    scrollToHash(url.hash);
    document.dispatchEvent(new CustomEvent('vairem:content-swapped'));
  }

  window.addEventListener('popstate', () => {
    const url = new URL(location.href);
    const targetPage = pageNameOf(url);
    if (AJAX_PAGES.has(targetPage)) {
      pageSwap(url, false);
    } else {
      location.reload();
    }
  });

  // ---------- menu link click / hover-to-navigate ----------

  const menuLinks = document.querySelectorAll('.menu-nav a, .menu-section-label--link');

  menuLinks.forEach(a => {
    a.addEventListener('click', e => {
      const url = new URL(a.getAttribute('href'), location.href);
      setMenu(false);
      if (AJAX_PAGES.has(pageNameOf(url)) && pageNameOf(url) !== renderedPage) {
        e.preventDefault();
        pageSwap(url, true);
      }
    });
  });

  if (window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    menuLinks.forEach(link => {
      let navTimer = null;
      link.addEventListener('mouseenter', () => {
        window.clearTimeout(navTimer);
        navTimer = window.setTimeout(() => {
          const url = new URL(link.getAttribute('href'), location.href);
          if (AJAX_PAGES.has(pageNameOf(url))) {
            pageSwap(url, true);
          } else {
            window.location.href = url.href;
          }
        }, 500);
      });
      link.addEventListener('mouseleave', () => window.clearTimeout(navTimer));
    });
  }
})();
