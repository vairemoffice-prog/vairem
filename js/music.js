// Background music: a looping recording, "Night Music" by Alex-Morgan (Pixabay Content License,
// details in docs/muzyka-licencja.md). It plays whenever the site is opened. If the browser blocks
// autoplay, sound begins at the first click/tap. Switching it off holds across subpages for the
// current visit (sessionStorage); a page refresh or a new visit starts with music again.
(() => {
  'use strict';

  const VOLUME = 0.04; // about -40 dBFS average for this track; raise it to make the music louder
  const SRC = 'assets/audio/night-music.mp3';
  const LABELS = {
    pl: ['Włącz muzykę', 'Wyłącz muzykę'],
    en: ['Turn music on', 'Turn music off'],
    es: ['Activar música', 'Silenciar música'],
    uk: ['Увімкнути музику', 'Вимкнути музику'],
    fr: ['Activer la musique', 'Couper la musique'],
  };

  let ctx = null, master = null, audio = null, saveTimer = null, started = false, playing = false;
  const KEY = 'vairem-music-off';
  const POS_KEY = 'vairem-music-pos';
  let wanted = true, resumeAt = 0;
  try {
    // A page refresh always brings the music back; moving between subpages keeps "off".
    const nav = performance.getEntriesByType('navigation')[0];
    if (nav && nav.type === 'reload') sessionStorage.removeItem(KEY);
    wanted = sessionStorage.getItem(KEY) !== '1';
    // Continue where the previous page left off (a page change reloads the script).
    resumeAt = parseFloat(sessionStorage.getItem(POS_KEY)) || 0;
  } catch (e) {}

  function savePos() {
    try { if (audio) sessionStorage.setItem(POS_KEY, String(audio.currentTime)); } catch (e) {}
  }

  function build() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    // The recording streams through an <audio> element (a decoded copy would take ~60 MB of memory).
    audio = new Audio();
    audio.loop = true;
    audio.preload = 'auto';
    audio.addEventListener('loadedmetadata', () => {
      if (resumeAt > 0 && resumeAt < audio.duration) { try { audio.currentTime = resumeAt; } catch (e) {} }
      resumeAt = 0;
    });
    audio.src = SRC;
    ctx.createMediaElementSource(audio).connect(master);
    window.addEventListener('pagehide', savePos);
    ctx.onstatechange = () => {
      if (ctx.state === 'running') {
        GESTURES.forEach(t => document.removeEventListener(t, onGesture, true));
        if (playing) begin();
      }
    };
    return true;
  }

  function start() {
    if (playing) return;
    if (!ctx && !build()) return;
    playing = true;
    render();
    ctx.resume().catch(() => {});
    if (ctx.state === 'running') begin();
  }

  // Runs once the audio context is actually running (not blocked by autoplay policy).
  function begin() {
    if (started) return;
    started = true;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(VOLUME, ctx.currentTime, 1.2);
    audio.play().catch(() => {});
    saveTimer = setInterval(savePos, 2000);
  }

  function stop() {
    if (!playing) return;
    playing = false;
    started = false;
    clearInterval(saveTimer);
    savePos();
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
    setTimeout(() => { if (!playing && ctx) { audio.pause(); ctx.suspend(); } }, 1500);
    render();
  }

  // ---------- button ----------

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'music-toggle mono';
  btn.innerHTML = '<svg class="music-note" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></svg><span class="music-bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>';

  function render() {
    const lang = LABELS[document.documentElement.lang] || LABELS.pl;
    const label = playing ? lang[1] : lang[0];
    btn.setAttribute('aria-label', label);
    btn.title = label;
    btn.setAttribute('aria-pressed', String(playing));
    btn.classList.toggle('is-on', playing);
  }

  btn.addEventListener('click', e => {
    e.stopPropagation();
    if (playing && ctx && ctx.state !== 'running') {
      // Autoplay was blocked: this tap is the gesture that lets the sound start.
      unlock();
      return;
    }
    if (playing) {
      wanted = false;
      stop();
    } else {
      wanted = true;
      start();
    }
    try { sessionStorage.setItem(KEY, wanted ? '0' : '1'); } catch (err) {}
  });

  // Mobile browsers (iOS especially) only unlock audio on a finished tap (click/touchend),
  // so keep listening until the audio context is really running.
  const GESTURES = ['click', 'touchend', 'pointerup', 'keydown'];

  function unlock() {
    if (!ctx) return;
    ctx.resume().catch(() => {});
    if (playing && audio && audio.paused && ctx.state === 'running') audio.play().catch(() => {});
    try { // a silent blip helps older iOS Safari wake up the audio output
      const src = ctx.createBufferSource();
      src.buffer = ctx.createBuffer(1, 1, 22050);
      src.connect(ctx.destination);
      src.start(0);
    } catch (err) {}
  }

  function onGesture(e) {
    if (btn.contains(e.target)) return;
    if (wanted) start();
    unlock();
  }

  // Listen for the first gesture even before the context exists (autoplay blocked).
  GESTURES.forEach(t => document.addEventListener(t, onGesture, true));

  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  document.body.appendChild(btn);
  render();
  if (wanted) start();

  // ---------- welcome screen ----------
  // If the browser blocked autoplay, show a quiet "enter" screen: the click on it is the
  // gesture that lets the music start right away.

  const ENTER = { pl: 'WEJDŹ', en: 'ENTER', es: 'ENTRAR', uk: 'УВІЙТИ', fr: 'ENTRER' };
  let splash = null, splashKey = null;
  const ENTERED_KEY = 'vairem-entered';
  const isHome = () => /(^|\/)(index\.html)?$/.test(location.pathname);
  const isReload = () => {
    const nav = performance.getEntriesByType('navigation')[0];
    return !!nav && nav.type === 'reload';
  };
  const alreadyEntered = () => { try { return sessionStorage.getItem(ENTERED_KEY) === '1'; } catch (e) { return false; } };
  // High-resolution logo (1195 px wide) so it stays sharp on retina and large screens.
  const LOGO_DAY = 'assets/img/logo-vairem-signature-1200.webp';
  const LOGO_NIGHT = 'assets/img/logo-vairem-signature-night-1200.webp';
  if (wanted) [LOGO_DAY, LOGO_NIGHT].forEach(src => { new Image().src = src; }); // warm the cache

  function hideSplash() {
    if (!splash) return;
    const el = splash;
    splash = null;
    // Slow cross-fade: the welcome screen dissolves while the hero fades in underneath.
    el.classList.remove('is-visible');
    el.classList.add('is-leaving');
    setTimeout(() => el.remove(), 1700);
    document.documentElement.classList.remove('music-splash-open');
    if (splashKey) document.removeEventListener('keydown', splashKey, true);
    splashKey = null;
  }

  function showSplash() {
    if (splash || !wanted || !ctx || ctx.state === 'running') return;
    if (!isHome() || (alreadyEntered() && !isReload())) return; // only the home page, and not again on the way back
    const lang = ENTER[document.documentElement.lang] ? document.documentElement.lang : 'pl';
    splash = document.createElement('div');
    splash.className = 'music-splash';
    splash.setAttribute('role', 'dialog');
    splash.setAttribute('aria-modal', 'true');
    splash.setAttribute('aria-label', 'VAIREM');
    splash.innerHTML =
      '<img class="music-splash-logo music-splash-logo--day" src="' + LOGO_DAY + '" alt="Vairem" width="1195" height="777" decoding="async">' +
      '<img class="music-splash-logo music-splash-logo--night" src="' + LOGO_NIGHT + '" alt="" width="1195" height="777" decoding="async">' +
      '<button type="button" class="music-splash-enter mono">' + ENTER[lang] + '</button>';
    // Any click/tap on the screen or any key (arrows, space, enter...) enters the site.
    const enter = () => {
      wanted = true;
      try { sessionStorage.removeItem(KEY); sessionStorage.setItem(ENTERED_KEY, '1'); } catch (err) {}
      start();
      unlock();
      hideSplash();
    };
    splash.addEventListener('click', e => { e.stopPropagation(); enter(); });
    splash.addEventListener('touchend', e => { e.preventDefault(); enter(); }, { passive: false });
    splashKey = e => {
      if (['Tab', 'Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(e.key)) return;
      e.preventDefault();
      enter();
    };
    document.addEventListener('keydown', splashKey, true);
    document.body.appendChild(splash);
    document.documentElement.classList.add('music-splash-open');
    requestAnimationFrame(() => splash && splash.classList.add('is-visible'));
    splash.querySelector('button').focus({ preventScroll: true });
  }

  // Give autoplay a moment to succeed; if it did not, ask for the one click.
  if (wanted) setTimeout(showSplash, 700);
  if (ctx) ctx.addEventListener('statechange', () => { if (ctx.state === 'running') hideSplash(); });
})();
