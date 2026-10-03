// Upbeat background music: generated live with the Web Audio API (no audio file,
// no licensing). It plays whenever the site is opened. If the browser blocks autoplay,
// sound begins at the first click/key press. Switching it off holds across subpages
// for the current visit only (sessionStorage), so the next visit starts with music.
(() => {
  'use strict';

  const VOLUME = 0.6;
  const BPM = 112;
  const STEP = 60 / BPM / 4; // one 16th note, in seconds
  // Chords: Am – F – C – G, two bars (32 sixteenths) each. [bass, arpeggio notes] in Hz.
  const CHORDS = [
    { bass: 55.0, arp: [220.0, 261.63, 329.63, 440.0] },
    { bass: 43.65, arp: [174.61, 220.0, 261.63, 349.23] },
    { bass: 65.41, arp: [196.0, 261.63, 329.63, 392.0] },
    { bass: 49.0, arp: [196.0, 246.94, 293.66, 392.0] },
  ];
  // Arpeggio pattern per bar (index into chord notes, -1 = rest).
  const ARP = [0, -1, 1, -1, 2, 1, -1, 3, 2, -1, 1, -1, 0, 1, 2, 3];
  const LABELS = {
    pl: ['Włącz muzykę', 'Wyłącz muzykę'],
    en: ['Turn music on', 'Turn music off'],
    es: ['Activar música', 'Silenciar música'],
    uk: ['Увімкнути музику', 'Вимкнути музику'],
    fr: ['Activer la musique', 'Couper la musique'],
  };

  let ctx = null, master = null, timer = null, step = 0, nextTime = 0, playing = false;
  const KEY = 'vairem-music-off';
  let wanted = true;
  try { wanted = sessionStorage.getItem(KEY) !== '1'; } catch (e) {}

  function build() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0;
    // Dry bus plus a bouncy echo for the arpeggio.
    const bus = ctx.createGain();
    const delay = ctx.createDelay(1);
    delay.delayTime.value = STEP * 3;
    const fb = ctx.createGain();
    fb.gain.value = 0.35;
    const wet = ctx.createGain();
    wet.gain.value = 0.4;
    delay.connect(fb); fb.connect(delay); delay.connect(wet);
    bus.connect(master); bus.connect(delay); wet.connect(master);
    master.connect(ctx.destination);
    ctx.vairemBus = bus;
    // Short noise buffer for hi-hats.
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.1), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    ctx.vairemNoise = buf;
    ctx.onstatechange = () => { if (playing && ctx.state === 'running') begin(); };
    return true;
  }

  function tone(type, freq, t, dur, peak, dest) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(dest || ctx.vairemBus);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  function kick(t) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(42, t + 0.14);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.7, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    osc.connect(g); g.connect(ctx.vairemBus);
    osc.start(t);
    osc.stop(t + 0.35);
  }

  function hat(t, peak) {
    const src = ctx.createBufferSource();
    src.buffer = ctx.vairemNoise;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 7000;
    const g = ctx.createGain();
    g.gain.setValueAtTime(peak, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
    src.connect(hp); hp.connect(g); g.connect(ctx.vairemBus);
    src.start(t);
    src.stop(t + 0.1);
  }

  function schedule(i, t) {
    const chord = CHORDS[Math.floor(i / 32) % CHORDS.length];
    const s16 = i % 16;
    if (s16 % 4 === 0) kick(t);
    if (s16 % 4 === 2) hat(t, 0.16);
    else if (s16 % 2 === 1) hat(t, 0.05);
    // Bass: on the beat and a syncopated hit before the next beat.
    if (s16 % 8 === 0 || s16 === 6 || s16 === 14) tone('triangle', chord.bass * (s16 === 14 ? 2 : 1), t, STEP * 3, 0.45);
    const n = ARP[s16];
    if (n >= 0) tone('triangle', chord.arp[n], t, STEP * 2.5, 0.2);
    if (s16 === 0 && i % 32 === 0) tone('sine', chord.arp[0] / 2, t, STEP * 30, 0.1);
  }

  function pump() {
    while (nextTime < ctx.currentTime + 0.25) {
      schedule(step++, nextTime);
      nextTime += STEP;
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
    master.gain.setTargetAtTime(VOLUME, ctx.currentTime, 0.6);
    nextTime = ctx.currentTime + 0.05;
    pump();
    timer = setInterval(pump, 50);
  }

  function stop() {
    if (!playing) return;
    playing = false;
    clearInterval(timer);
    timer = null;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
    setTimeout(() => { if (!playing && ctx) ctx.suspend(); }, 1500);
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
