// Small shared helpers used across the app. Nothing clever here on purpose —
// keeping the moving parts boring makes the modules easier to reason about.

// Prefix for every localStorage key we own. Exported so the schematics
// feature can snapshot/restore module data by raw key.
export const PREFIX = 'uu_';

export const $  = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// Tiny element builder. Usage:
//   el('div.card#main', { onclick: fn }, 'text', childNode)
// The props object is optional — el('span', 'hi') works too.
export function el(spec, props, ...children) {
  const tagMatch = spec.match(/^[a-z0-9]+/i);
  const node = document.createElement(tagMatch ? tagMatch[0] : 'div');

  const classes = [...spec.matchAll(/\.([\w-]+)/g)].map(m => m[1]);
  if (classes.length) node.className = classes.join(' ');

  const idMatch = spec.match(/#([\w-]+)/);
  if (idMatch) node.id = idMatch[1];

  // If the second argument isn't a plain props object, it's really the first
  // child (a string, number, array or DOM node). This is the trap that bit
  // us before — Object.entries('text') hands back index keys.
  const isProps = props && typeof props === 'object' &&
    !props.nodeType && !Array.isArray(props);
  if (!isProps) {
    if (props !== undefined) children.unshift(props);
    props = {};
  }

  for (const [key, value] of Object.entries(props)) {
    if (value == null || value === false) continue;

    if (key === 'class') {
      node.className += ' ' + value;
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(node.style, value);
    } else if (key === 'html') {
      node.innerHTML = value;
    } else if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key in node && key !== 'list') {
      try { node[key] = value; } catch { node.setAttribute(key, value); }
    } else {
      node.setAttribute(key, value);
    }
  }

  appendChildren(node, children);
  return node;
}

function appendChildren(node, children) {
  for (const child of children) {
    if (child == null || child === false || child === true) continue;
    if (Array.isArray(child)) {
      appendChildren(node, child);
    } else {
      node.append(child.nodeType ? child : document.createTextNode(String(child)));
    }
  }
}

// localStorage wrapper that never throws (private mode, quota, etc).
export const store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch {}
  },
  remove(key) {
    try { localStorage.removeItem(PREFIX + key); } catch {}
  },
};

// Each module gets its own little corner of storage so two modules can't
// stomp on each other's keys.
export function scopedStore(moduleId) {
  return {
    get: (key, fallback) => store.get(`m.${moduleId}.${key}`, fallback),
    set: (key, value) => store.set(`m.${moduleId}.${key}`, value),
    remove: (key) => store.remove(`m.${moduleId}.${key}`),
  };
}

// Bare-bones event bus. The Pomodoro/metronome heartbeat and global
// keystrokes ride on this so the oscilloscope stays decoupled.
function createBus() {
  const channels = new Map();
  return {
    on(name, fn) {
      if (!channels.has(name)) channels.set(name, new Set());
      channels.get(name).add(fn);
    },
    off(name, fn) {
      channels.get(name)?.delete(fn);
    },
    emit(name, payload) {
      channels.get(name)?.forEach(fn => {
        try { fn(payload); } catch (err) { console.warn(err); }
      });
    },
  };
}
export const bus = createBus();

export function pad2(n) {
  return String(Math.floor(Math.abs(n))).padStart(2, '0');
}

export function formatClock(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return (h ? pad2(h) + ':' : '') + pad2(m) + ':' + pad2(sec);
}

export function formatMoney(amount, symbol = '$') {
  return symbol + Number(amount || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function todayKey(date = new Date()) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}
