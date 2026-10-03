// Ambient background music: generated live with the Web Audio API (no audio file,
// no licensing). It plays whenever the site is opened. If the browser blocks autoplay,
// sound begins at the first click/key press. Switching it off holds across subpages
// for the current visit only (sessionStorage), so the next visit starts with music.
(() => {
  'use strict';

    const VOLUME = 0.7;
  const CHORD_SECONDS = 9;
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

  let ctx = null, master = null, timer = null, step = 0, playing = false;
  const KEY = 'vairem-music-off';
  let wanted = true;
  try { wanted = sessionStorage.getItem(KEY) !== '1'; } catch (e) {}

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
    ctx.vairemInput = filter;
    ctx.onstatechange = () => { if (playing && ctx.state === 'running') begin(); };
    return true;
  }

  function playChord(freqs) {
    const now = ctx.currentTime;
    const len = CHORD_SECONDS + 3;
    freqs.forEach((f, i) => {
      [-3, 3].forEach(detune => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = i === 0 ? 'sine' : 'triangle';
        osc.frequency.value = f;
        osc.detune.value = detune;
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.05, now + 4);
        g.gain.linearRampToValueAtTime(0, now + len);
        osc.connect(g); g.connect(ctx.vairemInput);
        osc.start(now);
        osc.stop(now + len + 0.1);
      });
    });
  }

  function tick() {
    playChord(CHORDS[step++ % CHORDS.length]);
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
    tick();
    timer = setInterval(tick, CHORD_SECONDS * 1000);
  }

  function stop() {
    if (!playing) return;
    playing = false;
    clearInterval(timer);
    timer = null;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
    setTimeout(() => { if (!playing && ctx) ctx.suspend(); }, 2000);
    render();
  }

  // ---------- button ----------

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'music-toggle mono';
  btn.innerHTML =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>' +
    '<path class="music-off-line" d="M3 3l18 18"/></svg>';

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
    if (playing) {
      wanted = false;
      stop();
    } else {
      wanted = true;
      start();
    }
    try { sessionStorage.setItem(KEY, wanted ? '0' : '1'); } catch (err) {}
  });

  function onFirstGesture(e) {
    if (btn.contains(e.target)) return;
    removeGesture();
    if (wanted) start();
    if (ctx && ctx.state !== 'running') ctx.resume().catch(() => {});
  }
  function removeGesture() {
    ['pointerdown', 'keydown', 'touchstart'].forEach(t => document.removeEventListener(t, onFirstGesture, true));
  }
  ['pointerdown', 'keydown', 'touchstart'].forEach(t => document.addEventListener(t, onFirstGesture, true));

  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  document.body.appendChild(btn);
  render();
  if (wanted) start();
})();
