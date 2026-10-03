// Calm piano background music (in the spirit of minimalist piano): generated live with the Web Audio API (no audio file,
// no licensing). It plays whenever the site is opened. If the browser blocks autoplay,
// sound begins at the first click/key press. Switching it off holds across subpages
// for the current visit only (sessionStorage), so the next visit starts with music.
(() => {
  'use strict';

  const VOLUME = 0.9;
  const BPM = 72;
  const STEP = 60 / BPM / 2; // one 8th note, in seconds
  const midi = m => 440 * Math.pow(2, (m - 69) / 12);
  // Eight bars (Am F C G Am F G Em), then it loops. Each bar = 8 eighths.
  // bass / arp (rolling right-hand pattern) / mel (melody pool) are MIDI notes.
  const BARS = [
    { bass: 45, arp: [57, 60, 64, 69], mel: [72, 76, 69] },
    { bass: 41, arp: [53, 57, 60, 65], mel: [69, 72, 77] },
    { bass: 48, arp: [55, 60, 64, 67], mel: [72, 76, 79] },
    { bass: 43, arp: [55, 59, 62, 67], mel: [71, 74, 79] },
    { bass: 45, arp: [57, 60, 64, 69], mel: [72, 76, 81] },
    { bass: 41, arp: [53, 57, 60, 65], mel: [77, 72, 69] },
    { bass: 43, arp: [55, 59, 62, 67], mel: [74, 79, 71] },
    { bass: 40, arp: [55, 59, 64, 67], mel: [76, 71, 74] },
  ];
  const ARP = [0, 1, 2, 3, 2, 1, 2, 1];
  // Melody: [eighth in bar, index into mel, length in eighths]
  const MELODY = [
    [[0, 1, 4], [4, 0, 4]],
    [[0, 1, 3], [3, 0, 1], [4, 2, 4]],
    [[0, 0, 4], [4, 1, 4]],
    [[0, 2, 3], [3, 1, 1], [4, 0, 4]],
    [[0, 1, 4], [4, 2, 2], [6, 1, 2]],
    [[0, 0, 3], [3, 1, 1], [4, 2, 4]],
    [[0, 1, 4], [4, 0, 2], [6, 2, 2]],
    [[0, 0, 8]],
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
    // Soft bus + synthetic hall reverb.
    const bus = ctx.createBiquadFilter();
    bus.type = 'lowpass';
    bus.frequency.value = 3200;
    const len = Math.floor(ctx.sampleRate * 3);
    const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5);
    }
    const reverb = ctx.createConvolver();
    reverb.buffer = ir;
    const wet = ctx.createGain();
    wet.gain.value = 0.35;
    bus.connect(master); bus.connect(reverb); reverb.connect(wet); wet.connect(master);
    master.connect(ctx.destination);
    ctx.vairemBus = bus;
    ctx.onstatechange = () => { if (playing && ctx.state === 'running') begin(); };
    return true;
  }

  // A piano-like note: a few decaying harmonics with a soft hammer attack.
  function piano(m, t, dur, vel) {
    const f = midi(m);
    const out = ctx.createGain();
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(vel, t + 0.006);
    out.gain.exponentialRampToValueAtTime(vel * 0.35, t + 0.35);
    out.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    out.connect(ctx.vairemBus);
    [[1, 1], [2, 0.42], [3, 0.2], [4, 0.1], [5, 0.04]].forEach(([h, a]) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f * h * (1 + 0.0004 * h * h);
      g.gain.value = a;
      osc.connect(g); g.connect(out);
      osc.start(t);
      osc.stop(t + dur + 0.05);
    });
  }

  function schedule(i, t) {
    const bar = Math.floor(i / 8) % BARS.length;
    const e = i % 8;
    const chord = BARS[bar];
    const human = () => (Math.random() - 0.5) * 0.012;
    if (e === 0) piano(chord.bass, t, 4, 0.34);
    if (e === 4) piano(chord.bass + 12, t, 2.5, 0.12);
    piano(chord.arp[ARP[e]], t + Math.max(0, human()), 2.2, 0.1 + Math.random() * 0.025);
    MELODY[bar].forEach(([at, mi, len]) => {
      if (at === e) piano(chord.mel[mi], t, Math.min(4.5, len * STEP + 1.8), 0.22);
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
    master.gain.setTargetAtTime(VOLUME, ctx.currentTime, 0.6);
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
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
    setTimeout(() => { if (!playing && ctx) ctx.suspend(); }, 1500);
    render();
  }

  // ---------- button ----------

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'music-toggle mono';
  btn.innerHTML = '<span class="music-bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span>';

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
