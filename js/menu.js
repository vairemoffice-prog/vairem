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

  toggle.addEventListener('click', () => setMenu(true));
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
    scrollToHash(url.hash);
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
