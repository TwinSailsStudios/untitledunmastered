// Theme handling. A theme is three colours — background, the main colour
// used for text and the 1px lines, and an accent. Everything else (faint
// grid lines, muted text) is derived so a hand-typed custom theme looks as
// finished as the presets. The same derivation is reused per-module when
// you recolour a single tile with its paintbrush.

import { $, el, store } from './util.js';

export const PRESETS = {
  // name           background   main (text/lines)  accent
  'b&w':           ['#000000',  '#ffffff',         '#ffffff'],  // white on black
  'paper':         ['#ffffff',  '#0a0a0a',         '#0a0a0a'],  // black on white
  'blueprint':     ['#070d18',  '#cfe6ff',         '#52b4ff'],
  'amber-crt':     ['#140d00',  '#ffb000',         '#ffce5c'],
  'terminal':      ['#010a04',  '#37ff79',         '#7dffae'],
  'crimson':       ['#0a0000',  '#f3d6d6',         '#ff3b30'],
  'cobalt':        ['#04070f',  '#c5d4ea',         '#4d7cff'],
  'graphite':      ['#1a1a1a',  '#d6d6d6',         '#9aa0a6'],
  'sand':          ['#161009',  '#e8d8b8',         '#c8973f'],
  'vapor':         ['#0c0614',  '#e6d4ff',         '#ff4fd8'],
  'oceanic':       ['#04141a',  '#bfe9f0',         '#27c4d9'],
  'forest':        ['#06140b',  '#cfe8d0',         '#4caf50'],
  'rose':          ['#160810',  '#f3d4e4',         '#ff6fae'],
  'solar':         ['#1a1200',  '#f0e2b0',         '#ffd000'],
  'ultraviolet':   ['#0a0618',  '#d8ccff',         '#8a5cff'],
  'mint':          ['#03120e',  '#cdeee2',         '#3fd9a2'],
  'rust':          ['#140a05',  '#e8cdb8',         '#d2691e'],
  'ice':           ['#f4f8fb',  '#0a1a24',         '#1f6f8b'],  // light
  'noir':          ['#0b0b0b',  '#e6e6e6',         '#bdbdbd'],
};

const STORE_KEY = 'theme';

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const full = clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

const rgba = ([r, g, b], a) => `rgba(${r}, ${g}, ${b}, ${a})`;

// The single source of truth for "three colours -> all the CSS variables".
export function cssVarsFor(background, main, accent) {
  const m = hexToRgb(main);
  return {
    '--paper': background,
    '--ink': main,
    '--accent': accent,
    '--line': main,
    '--line-soft': rgba(m, 0.26),
    '--grid': rgba(m, 0.06),
    '--mute': rgba(m, 0.55),
  };
}

// Write those variables onto any element. Pass the documentElement for a
// global theme, or a single .tile for a per-module override.
export function applyVarsTo(target, background, main, accent) {
  const vars = cssVarsFor(background, main, accent);
  for (const [name, value] of Object.entries(vars)) {
    target.style.setProperty(name, value);
  }
}

export function clearVarsOn(target) {
  for (const name of Object.keys(cssVarsFor('#000', '#000', '#000'))) {
    target.style.removeProperty(name);
  }
}

function applyPreset(name) {
  const colors = PRESETS[name];
  if (!colors) return;
  applyVarsTo(document.documentElement, ...colors);
  store.set(STORE_KEY, { kind: 'preset', name });
}

function applyCustom(background, main, accent) {
  applyVarsTo(document.documentElement, background, main, accent);
  store.set(STORE_KEY, { kind: 'custom', colors: [background, main, accent] });
}

export function initThemes() {
  const select = $('#theme-select');
  const openBuilderBtn = $('#theme-build-btn');
  const builder = $('#theme-builder');
  const closeBtn = $('#tb-close');
  const bgInput = $('#tb-bg');
  const mainInput = $('#tb-main');
  const accentInput = $('#tb-accent');
  const applyBtn = $('#tb-apply');
  const preview = $('#tb-preview');

  select.innerHTML = '';
  for (const name of Object.keys(PRESETS)) {
    select.append(el('option', { value: name }, name.toUpperCase()));
  }
  select.append(el('option', { value: 'custom' }, 'CUSTOM…'));

  const saved = store.get(STORE_KEY, { kind: 'preset', name: 'b&w' });
  if (saved.kind === 'custom' && Array.isArray(saved.colors)) {
    applyVarsTo(document.documentElement, ...saved.colors);
    select.value = 'custom';
    [bgInput.value, mainInput.value, accentInput.value] = saved.colors;
  } else {
    const name = PRESETS[saved.name] ? saved.name : 'b&w';
    applyPreset(name);
    select.value = name;
    [bgInput.value, mainInput.value, accentInput.value] = PRESETS[name];
  }

  function refreshPreview() {
    preview.style.background = bgInput.value;
    preview.style.color = mainInput.value;
    preview.style.borderColor = mainInput.value;
    preview.querySelector('.tb-dot').style.background = accentInput.value;
  }
  refreshPreview();

  function toggleBuilder(open) {
    builder.toggleAttribute('data-open', open);
    builder.setAttribute('aria-hidden', String(!open));
  }

  select.addEventListener('change', () => {
    if (select.value === 'custom') {
      toggleBuilder(true);
    } else {
      applyPreset(select.value);
      [bgInput.value, mainInput.value, accentInput.value] = PRESETS[select.value];
      refreshPreview();
    }
  });

  openBuilderBtn.addEventListener('click', () => toggleBuilder(true));
  closeBtn.addEventListener('click', () => toggleBuilder(false));
  builder.addEventListener('click', e => {
    if (e.target === builder) toggleBuilder(false);
  });
  [bgInput, mainInput, accentInput].forEach(input =>
    input.addEventListener('input', refreshPreview));

  applyBtn.addEventListener('click', () => {
    applyCustom(bgInput.value, mainInput.value, accentInput.value);
    select.value = 'custom';
    toggleBuilder(false);
  });

  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && builder.hasAttribute('data-open')) {
      toggleBuilder(false);
    }
  });
}
