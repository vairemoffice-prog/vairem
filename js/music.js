// Ambient pad background music: generated live with the Web Audio API (no audio file,
// no licensing). It plays whenever the site is opened. If the browser blocks autoplay,
// sound begins at the first click/tap. Switching it off holds across subpages for the
// current visit (sessionStorage); a page refresh or a new visit starts with music again.
(() => {
  'use strict';

  const VOLUME = 1.1; // the pad is soft, so the master gain is above 1
  const STEP = 9; // seconds per chord
  // Slow, soft progression (Hz): Am9 – Fmaj7 – Cmaj7 – G6
  const CHORDS = [
    [110.0, 164.81, 220.0, 261.63, 329.63],
    [87.31, 174.61, 220.0, 261.63, 329.63],
    [130.81, 196.0, 246.94, 329.63, 392.0],
    [98.0, 196.0, 246.94, 293.66, 329.63],
  ];
  const LABELS = {
    pl: ['Włącz muzykę', 'Wyłącz muzykę'],
    en: ['Turn music on', 'Turn music off'],
    es: ['Activar música', 'Silenciar música'],
    uk: ['Увімкнути музику', 'Вимкнути музику'],
    fr: ['Activer la musique', 'Couper la musique'],
  };

  let ctx = null, master = null, timer = null, step = 0, nextTime = 0, playing = false;
  const KEY = 'vairem-music-off';
  const POS_KEY = 'vairem-music-step';
  let wanted = true;
  try {
    // A page refresh always brings the music back; moving between subpages keeps "off".
    const nav = performance.getEntriesByType('navigation')[0];
    if (nav && nav.type === 'reload') sessionStorage.removeItem(KEY);
    wanted = sessionStorage.getItem(KEY) !== '1';
    // Continue where the previous page left off (a page change reloads the script).
    step = (parseInt(sessionStorage.getItem(POS_KEY), 10) || 0);
  } catch (e) {}

  function build() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1100;
    // Simple echo for a roomy, soft sound.
    const delay = ctx.createDelay(1);
    delay.delayTime.value = 0.45;
    const fb = ctx.createGain();
    fb.gain.value = 0.42;
    const wet = ctx.createGain();
    wet.gain.value = 0.45;
    delay.connect(fb); fb.connect(delay); delay.connect(wet);
    filter.connect(master); filter.connect(delay); wet.connect(master);
    master.connect(ctx.destination);
    ctx.vairemBus = filter;
    ctx.onstatechange = () => {
      if (ctx.state === 'running') {
        GESTURES.forEach(t => document.removeEventListener(t, onGesture, true));
        if (playing) begin();
      }
    };
    return true;
  }

  // One slow pad chord; chords overlap and cross-fade.
  function schedule(i, t) {
    const freqs = CHORDS[i % CHORDS.length];
    const len = STEP + 3;
    freqs.forEach((f, k) => {
      [-3, 3].forEach(detune => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = k === 0 ? 'sine' : 'triangle';
        osc.frequency.value = f;
        osc.detune.value = detune;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.05, t + 4);
        g.gain.linearRampToValueAtTime(0, t + len);
        osc.connect(g); g.connect(ctx.vairemBus);
        osc.start(t);
        osc.stop(t + len + 0.1);
      });
    });
  }

  function pump() {
    // Look ahead ~1.2 s so playback survives timer throttling in background tabs.
    while (nextTime < ctx.currentTime + 1.2) {
      schedule(step++, nextTime);
      nextTime += STEP;
    }
    try { sessionStorage.setItem(POS_KEY, String(step)); } catch (e) {}
  }

  // Timer in a Web Worker: not throttled when the tab is in the background.
  function makeTimer(fn, ms) {
    try {
      const url = URL.createObjectURL(new Blob(['setInterval(function(){postMessage(0)},' + ms + ')']));
      const w = new Worker(url);
      w.onmessage = fn;
      return { stop() { w.terminate(); URL.revokeObjectURL(url); } };
    } catch (e) {
      const id = setInterval(fn, ms);
      return { stop() { clearInterval(id); } };
    }
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
    if (timer) return;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(VOLUME, ctx.currentTime, 1.2);
    nextTime = ctx.currentTime + 0.05;
    pump();
    timer = makeTimer(pump, 100);
  }

  function stop() {
    if (!playing) return;
    playing = false;
    if (timer) timer.stop();
    timer = null;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
    setTimeout(() => { if (!playing && ctx) ctx.suspend(); }, 1500);
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

  function hideSplash() {
    if (!splash) return;
    const el = splash;
    splash = null;
    el.classList.remove('is-visible');
    setTimeout(() => el.remove(), 600);
    document.documentElement.classList.remove('music-splash-open');
    if (splashKey) document.removeEventListener('keydown', splashKey, true);
    splashKey = null;
  }

  function showSplash() {
    if (splash || !wanted || !ctx || ctx.state === 'running') return;
    const lang = ENTER[document.documentElement.lang] ? document.documentElement.lang : 'pl';
    splash = document.createElement('div');
    splash.className = 'music-splash';
    splash.setAttribute('role', 'dialog');
    splash.setAttribute('aria-modal', 'true');
    splash.setAttribute('aria-label', 'VAIREM');
    splash.innerHTML =
      '<img class="music-splash-logo music-splash-logo--day" src="assets/img/logo-vairem-signature.webp" alt="Vairem" width="400" height="260">' +
      '<img class="music-splash-logo music-splash-logo--night" src="assets/img/logo-vairem-signature-night.webp" alt="" width="400" height="260">' +
      '<button type="button" class="music-splash-enter mono">' + ENTER[lang] + '</button>';
    // Any click/tap on the screen or any key (arrows, space, enter...) enters the site.
    const enter = () => {
      wanted = true;
      try { sessionStorage.removeItem(KEY); } catch (err) {}
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
