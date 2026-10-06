// Pink "scroll to top" arrow for every page. The home page ships its own
// button (wired up in app.js); on all other pages this script creates it.
(function () {
  if (document.getElementById('scroll-top-btn')) return;

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.id = 'scroll-top-btn';
  btn.className = 'scroll-top-btn';
  btn.setAttribute('aria-label', 'Do góry');
  btn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">' +
    '<path d="M12 19V5M5 12l7-7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  document.body.appendChild(btn);

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  btn.addEventListener('click', function () {
    var start = window.scrollY;
    if (start === 0) return;
    if (reduced) { window.scrollTo(0, 0); return; }
    var t0 = performance.now();
    (function step(now) {
      var p = Math.min((now - t0) / 420, 1);
      window.scrollTo(0, start * Math.pow(1 - p, 3));
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  });
})();
