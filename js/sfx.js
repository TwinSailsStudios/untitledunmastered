// Synthesised sound effects — no audio files, just short Web Audio blips so
// the whole thing stays a single static folder. Browsers won't let audio
// start until the user interacts, so the context is created lazily and
// resumed on the first gesture (see main.js).

import { store } from './util.js';

let ctx = null;
let master = null;
let enabled = store.get('sfx_on', true);

function ensureContext() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0.18;
  master.connect(ctx.destination);
  return ctx;
}

export function resumeAudio() {
  const c = ensureContext();
  if (c && c.state === 'suspended') c.resume();
}

export function isSoundOn() {
  return enabled;
}

export function setSoundOn(on) {
  enabled = on;
  store.set('sfx_on', on);
  if (on) resumeAudio();
}

// One short tone with a quick percussive envelope.
function tone(freq, duration = 0.07, type = 'square', gain = 1) {
  if (!enabled) return;
  const c = ensureContext();
  if (!c) return;
  if (c.state === 'suspended') c.resume();

  const osc = c.createOscillator();
  const env = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;

  const now = c.currentTime;
  env.gain.setValueAtTime(0, now);
  env.gain.linearRampToValueAtTime(gain, now + 0.005);
  env.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(env);
  env.connect(master);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

// Named effects used around the app.
export const sfx = {
  click: () => tone(420, 0.05, 'square', 0.7),
  tick:  () => tone(900, 0.04, 'square', 0.9),
  ok:    () => { tone(660, 0.07); setTimeout(() => tone(990, 0.09), 70); },
  alert: () => { tone(740, 0.12, 'sawtooth'); setTimeout(() => tone(740, 0.12, 'sawtooth'), 160); },
  thunk: () => tone(180, 0.08, 'triangle', 0.9),
  blip:  () => tone(540, 0.05, 'sine', 0.8),
};
