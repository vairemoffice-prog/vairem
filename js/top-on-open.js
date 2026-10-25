// Every page opens at the very top: the browser must not restore an old scroll position
// (refresh, back button, bfcache). A link with an anchor (index.html#metoda) still jumps to
// its section, but a refresh always starts from the top.
(function () {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  var nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
  if (nav && nav.type === 'reload' && location.hash) {
    history.replaceState(null, '', location.pathname + location.search);
  }
  function top() { if (!location.hash) window.scrollTo(0, 0); }
  top();
  document.addEventListener('DOMContentLoaded', top);
  window.addEventListener('load', function () { top(); setTimeout(top, 150); });
  window.addEventListener('pageshow', function (e) { if (e.persisted) top(); });
})();
