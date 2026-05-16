// Entry point. Wires the global chrome (theme, work-mode density, the
// oscilloscope, the credits panel) and then hands the grid to the workspace.
// Each piece is started independently so one failure can't take the whole
// command center down with it.

import { $, store, bus } from './util.js';
import { initThemes } from './themes.js';
import { initWorkspace } from './workspace.js';
import { sfx, resumeAudio, isSoundOn, setSoundOn } from './sfx.js';

// Every keystroke feeds the oscilloscope and the diagnostics module.
window.addEventListener('keydown', () => bus.emit('keystroke'));

// Audio can only start after a gesture — resume on the first one.
['pointerdown', 'keydown'].forEach(type =>
  window.addEventListener(type, resumeAudio, { once: true }));

// Sound for everything: any button anywhere clicks, and every module
// heartbeat (Pomodoro / Metronome / Tabata / Interval …) ticks.
document.addEventListener('click', e => {
  if (e.target.closest('button')) sfx.click();
}, true);
bus.on('heartbeat', () => sfx.tick());
bus.on('grit', () => sfx.ok());

function initSoundToggle() {
  const btn = $('#sound-btn');
  const paint = () => {
    btn.textContent = isSoundOn() ? '♪ Sound' : '× Muted';
    btn.classList.toggle('btn--active', isSoundOn());
  };
  btn.addEventListener('click', () => { setSoundOn(!isSoundOn()); paint(); });
  paint();
}

// Logic mode favours dense text; Assembly mode opens the layout up for
// planning physical builds. It's just an attribute the stylesheet keys off.
function initWorkModeSwap() {
  const root = document.documentElement;
  const toggle = $('#workmode-toggle');
  const apply = mode => {
    root.dataset.workmode = mode;
    store.set('workmode', mode);
  };
  apply(store.get('workmode', 'logic'));
  toggle.addEventListener('click', () =>
    apply(root.dataset.workmode === 'logic' ? 'assembly' : 'logic'));
}

// The strip along the bottom. It hums quietly at rest and spikes on
// keystrokes or any module heartbeat (Pomodoro, metronome, intervals).
function initOscilloscope() {
  const canvas = $('#osci');
  const ctx = canvas.getContext('2d');
  let energy = 0.06;
  let pulse = 0;
  let phase = 0;

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.clientWidth * ratio;
    canvas.height = canvas.clientHeight * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }
  window.addEventListener('resize', resize);

  bus.on('keystroke', () => energy = Math.min(1, energy + 0.16));
  bus.on('heartbeat', () => pulse = 1);

  function frame() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const mid = h / 2;

    energy = Math.max(0.06, energy * 0.965);
    pulse *= 0.88;

    const ink = getComputedStyle(document.documentElement)
      .getPropertyValue('--accent').trim() || '#fff';

    ctx.clearRect(0, 0, w, h);

    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, mid);
    ctx.lineTo(w, mid);
    ctx.stroke();

    ctx.globalAlpha = 1;
    ctx.beginPath();
    const amplitude = h * 0.38 * (energy + pulse * 0.9);
    for (let x = 0; x <= w; x += 2) {
      const t = x * 0.05 + phase;
      const y = mid
        + Math.sin(t) * amplitude
        + Math.sin(t * 2.7) * amplitude * 0.22
        + (pulse > 0.02 ? Math.sin(t * 9) * pulse * 6 : 0);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.lineWidth = 1.4;
    ctx.stroke();

    phase += 0.14;
    requestAnimationFrame(frame);
  }

  resize();
  requestAnimationFrame(frame);
}

// The credits panel is always one click away from the masthead so it isn't
// buried behind the module library.
function initCredits() {
  const panel = $('#credits-panel');
  const open = $('#credits-btn');
  const close = $('#credits-close');
  const toggle = show => {
    panel.toggleAttribute('data-open', show);
    panel.setAttribute('aria-hidden', String(!show));
  };
  open.addEventListener('click', () => toggle(true));
  close.addEventListener('click', () => toggle(false));
  panel.addEventListener('click', e => { if (e.target === panel) toggle(false); });
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && panel.hasAttribute('data-open')) toggle(false);
  });
}

// Type "ye" anywhere (not in a field) and the masthead nods back for a beat.
// Left for whoever goes digging — that's the point of a wing.
function initEasterEgg() {
  const target = 'ye';
  let progress = 0;
  window.addEventListener('keydown', e => {
    const tag = e.target?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    progress = e.key.toLowerCase() === target[progress] ? progress + 1 : 0;
    if (progress === target.length) {
      progress = 0;
      const id = $('.masthead__id');
      id.setAttribute('title', 'Reach for the stars so if you fall you land on a cloud.');
      id.animate?.(
        [{ opacity: 1 }, { opacity: 0.25 }, { opacity: 1 }],
        { duration: 700, easing: 'ease-in-out' });
    }
  });
}

const boot = [
  ['theme', initThemes],
  ['workmode', initWorkModeSwap],
  ['oscilloscope', initOscilloscope],
  ['credits', initCredits],
  ['sound', initSoundToggle],
  ['easter-egg', initEasterEgg],
  ['workspace', initWorkspace],
];

for (const [name, start] of boot) {
  try {
    start();
  } catch (err) {
    console.error(`failed to start ${name}:`, err);
  }
}

// "We're all self-conscious, I'm just the first to admit it." Ship anyway.
console.log('untitled_unmastered — online. blank canvas, 102 instruments.');
