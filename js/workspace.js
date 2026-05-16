// The workspace is the grid the operator builds for themselves. It starts
// empty; modules are pulled in from the library, dragged into whatever order
// makes sense, recoloured one at a time, and removed in an edit ("jiggle")
// mode that should feel familiar to anyone who's rearranged a phone home
// screen.

import { $, el, store, scopedStore, PREFIX } from './util.js';
import { REGISTRY, findModule } from './registry.js';
import { applyVarsTo, clearVarsOn } from './themes.js';

const LAYOUT_KEY = 'layout';

export function initWorkspace() {
  const grid = $('#grid');
  const emptyState = $('#empty');
  const editBtn = $('#edit-btn');
  const library = $('#library');
  const libraryGrid = $('#lib-grid');
  const librarySearch = $('#lib-search');

  let layout = store.get(LAYOUT_KEY, []).filter(findModule);
  const cleanups = new Map();
  let editing = false;
  let activeGroup = 'ALL';

  const groups = ['ALL', ...new Set(REGISTRY.map(m => m.group))];

  function saveLayout() {
    store.set(LAYOUT_KEY, layout);
  }

  function syncEmptyState() {
    emptyState.hidden = layout.length > 0;
    grid.hidden = layout.length === 0;
  }

  const clampSize = n => Math.min(3, Math.max(1, Number(n) || 1));

  // Width = grid-column span; height = a taller body. Both are classes the
  // stylesheet keys off, persisted per module.
  function applyWidth(tile, n) {
    tile.classList.remove('tile--w1', 'tile--w2', 'tile--w3');
    tile.classList.add('tile--w' + clampSize(n));
  }

  function applyHeight(tile, n) {
    tile.classList.remove('tile--h1', 'tile--h2', 'tile--h3');
    tile.classList.add('tile--h' + clampSize(n));
  }

  // ---- per-module colour (the paintbrush) ---------------------------------

  function readTriplet(id) {
    const saved = scopedStore(id).get('__theme', null);
    if (Array.isArray(saved)) return saved;
    const root = getComputedStyle(document.documentElement);
    const hex = name => {
      const v = root.getPropertyValue(name).trim();
      return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v) ? v : null;
    };
    return [hex('--paper') || '#000000', hex('--ink') || '#ffffff',
            hex('--accent') || '#ffffff'];
  }

  function openPaintPopover(tile, id) {
    tile.querySelector('.paintpop')?.remove();
    const [bg, main, accent] = readTriplet(id);

    const bgIn = el('input', { type: 'color', value: bg });
    const mainIn = el('input', { type: 'color', value: main });
    const accentIn = el('input', { type: 'color', value: accent });

    const pop = el('div.paintpop',
      el('div.paintpop__row', el('span', 'bg'), bgIn),
      el('div.paintpop__row', el('span', 'main'), mainIn),
      el('div.paintpop__row', el('span', 'accent'), accentIn),
      el('div.btnrow',
        el('button.btn', {
          onclick: () => {
            applyVarsTo(tile, bgIn.value, mainIn.value, accentIn.value);
            scopedStore(id).set('__theme',
              [bgIn.value, mainIn.value, accentIn.value]);
            pop.remove();
          },
        }, 'Apply'),
        el('button.btn.ghost', {
          onclick: () => {
            clearVarsOn(tile);
            scopedStore(id).remove('__theme');
            pop.remove();
          },
        }, 'Reset')));

    // live preview while picking
    [bgIn, mainIn, accentIn].forEach(input =>
      input.addEventListener('input', () =>
        applyVarsTo(tile, bgIn.value, mainIn.value, accentIn.value)));

    tile.append(pop);
    const dismiss = e => {
      if (!pop.contains(e.target) && !e.target.closest('.tile__paint')) {
        pop.remove();
        document.removeEventListener('pointerdown', dismiss, true);
      }
    };
    setTimeout(() => document.addEventListener('pointerdown', dismiss, true), 0);
  }

  // ---- build a tile -------------------------------------------------------

  function buildTile(id) {
    const def = findModule(id);
    if (!def) return null;

    const tile = el('section.tile', { 'data-id': id });

    const removeBadge = el('button.tile__x', {
      title: 'remove',
      onclick: e => { e.stopPropagation(); removeModule(id); },
    }, '✕');

    const paintBtn = el('button.tile__paint', {
      title: 'recolour this module',
      onclick: e => { e.stopPropagation(); openPaintPopover(tile, id); },
    }, '✦');

    // Two size controls: width (column span) and height (body reach).
    const labels = ['S', 'M', 'L'];
    let width = clampSize(scopedStore(id).get('__w', 1));
    let height = clampSize(scopedStore(id).get('__h', 1));

    const widthBtn = el('button.tile__size', {
      title: 'width',
      onclick: e => {
        e.stopPropagation();
        width = width % 3 + 1;
        scopedStore(id).set('__w', width);
        applyWidth(tile, width);
        widthBtn.textContent = '↔ ' + labels[width - 1];
      },
    }, '↔ ' + labels[width - 1]);

    const heightBtn = el('button.tile__size', {
      title: 'height',
      onclick: e => {
        e.stopPropagation();
        height = height % 3 + 1;
        scopedStore(id).set('__h', height);
        applyHeight(tile, height);
        heightBtn.textContent = '↕ ' + labels[height - 1];
      },
    }, '↕ ' + labels[height - 1]);

    const bar = el('div.tile__bar',
      el('span.tile__tag', def.tag),
      el('span.tile__name', def.name),
      widthBtn,
      heightBtn,
      paintBtn,
      el('span.tile__grp', def.group));

    const body = el('div.tile__body');
    tile.append(removeBadge, bar, body);
    applyWidth(tile, width);
    applyHeight(tile, height);

    // restore a saved per-module colour, if any
    const savedTheme = scopedStore(id).get('__theme', null);
    if (Array.isArray(savedTheme)) applyVarsTo(tile, ...savedTheme);

    try {
      const teardown = def.mount(body, scopedStore(id));
      cleanups.set(id, typeof teardown === 'function' ? teardown : () => {});
    } catch (err) {
      body.append(el('p.tip', '✗ module failed: ' + err.message));
      cleanups.set(id, () => {});
      console.error('[' + def.tag + ']', err);
    }

    enableDrag(tile);
    return tile;
  }

  function renderAll() {
    grid.innerHTML = '';
    layout.forEach(id => {
      const tile = buildTile(id);
      if (tile) grid.append(tile);
    });
    syncEmptyState();
  }

  function addModule(id) {
    if (layout.includes(id) || !findModule(id)) return;
    layout.push(id);
    saveLayout();

    const tile = buildTile(id);
    grid.append(tile);
    syncEmptyState();
    refreshLibrary();

    tile.animate?.(
      [{ opacity: 0, transform: 'scale(.82)' }, { opacity: 1, transform: 'none' }],
      { duration: 320, easing: 'cubic-bezier(.16,.84,.34,1)' });
  }

  function removeModule(id) {
    const tile = grid.querySelector(`.tile[data-id="${CSS.escape(id)}"]`);
    try { cleanups.get(id)?.(); } catch {}
    cleanups.delete(id);
    layout = layout.filter(x => x !== id);
    saveLayout();

    if (tile) {
      const fade = tile.animate?.(
        [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.82)' }],
        { duration: 240, easing: 'ease-in' });
      if (fade) fade.onfinish = () => { tile.remove(); syncEmptyState(); };
      else { tile.remove(); syncEmptyState(); }
    }
    refreshLibrary();
  }

  // ---- edit / jiggle mode -------------------------------------------------

  function setEditing(on) {
    editing = on;
    document.body.classList.toggle('is-editing', on);
    editBtn.textContent = on ? 'Done' : 'Edit';
    editBtn.classList.toggle('btn--active', on);
  }
  editBtn.addEventListener('click', () => setEditing(!editing));

  // ---- drag to reorder ----------------------------------------------------
  //
  // The dragged tile is lifted out of flow (position:fixed) and follows the
  // pointer while a placeholder holds its grid slot, so the layout never
  // collapses. Move/up listeners live on `window` so a fast drag can't
  // strand a tile; on drop only the transient left/top/width are cleared,
  // never the whole cssText, so a recoloured tile keeps its colour.

  let dragging = false;

  function enableDrag(tile) {
    const handle = tile.querySelector('.tile__bar');

    handle.addEventListener('pointerdown', e => {
      if (e.button || dragging) return;
      if (e.target.closest('button, input, select, a')) return;
      e.preventDefault();
      dragging = true;

      const rect = tile.getBoundingClientRect();
      const grabX = e.clientX - rect.left;
      const grabY = e.clientY - rect.top;

      const placeholder = el('div.tile-ph');
      placeholder.style.height = rect.height + 'px';
      grid.insertBefore(placeholder, tile.nextSibling);

      tile.classList.add('tile--drag');
      tile.style.width = rect.width + 'px';
      tile.style.left = rect.left + 'px';
      tile.style.top = rect.top + 'px';
      document.body.classList.add('is-dragging');

      const onMove = ev => {
        tile.style.left = (ev.clientX - grabX) + 'px';
        tile.style.top = (ev.clientY - grabY) + 'px';
        const ref = tileBeforePoint(ev.clientX, ev.clientY);
        if (ref === placeholder) return;
        if (ref === null) grid.append(placeholder);
        else grid.insertBefore(placeholder, ref);
      };

      const onUp = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
        grid.insertBefore(tile, placeholder);
        placeholder.remove();
        tile.classList.remove('tile--drag');
        ['left', 'top', 'width'].forEach(p => tile.style.removeProperty(p));
        document.body.classList.remove('is-dragging');
        layout = [...grid.querySelectorAll('.tile')].map(t => t.dataset.id);
        saveLayout();
        dragging = false;
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    });
  }

  // The tile whose centre is just past the pointer — the dragged tile slots
  // in ahead of it. null means "append at the end".
  function tileBeforePoint(x, y) {
    const others = [...grid.querySelectorAll('.tile:not(.tile--drag)')];
    let best = null;
    let bestDistance = Infinity;
    for (const other of others) {
      const r = other.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const isPastPointer = y < cy ||
        (Math.abs(y - cy) < r.height / 2 && x < cx);
      const distance = Math.hypot(x - cx, y - cy);
      if (isPastPointer && distance < bestDistance) {
        bestDistance = distance;
        best = other;
      }
    }
    return best;
  }

  // ---- the module library + filtering -------------------------------------

  const filterBar = el('div.lib-filters');
  groups.forEach(group => {
    filterBar.append(el('button.lib-chip' + (group === 'ALL' ? '.is-on' : ''), {
      onclick: () => {
        activeGroup = group;
        [...filterBar.children].forEach(c =>
          c.classList.toggle('is-on', c.textContent === group));
        refreshLibrary();
      },
    }, group));
  });
  $('#lib-grid').before(filterBar);

  function refreshLibrary() {
    const query = librarySearch.value.trim().toLowerCase();
    libraryGrid.innerHTML = '';

    const matches = REGISTRY.filter(m => {
      if (activeGroup !== 'ALL' && m.group !== activeGroup) return false;
      if (!query) return true;
      return (m.name + ' ' + m.group + ' ' + m.tag).toLowerCase().includes(query);
    });

    if (!matches.length) {
      libraryGrid.append(el('p.tip', 'no modules match that filter'));
      return;
    }

    matches.forEach(m => {
      const placed = layout.includes(m.id);
      libraryGrid.append(el('button.libcard' + (placed ? '.libcard--in' : ''), {
        disabled: placed,
        onclick: () => addModule(m.id),
      },
        el('span.libcard__tag', m.tag),
        el('span.libcard__name', m.name),
        el('span.libcard__grp', m.group),
        el('span.libcard__act', placed ? 'placed' : '+ add')));
    });
  }

  function openLibrary(open) {
    library.toggleAttribute('data-open', open);
    library.setAttribute('aria-hidden', String(!open));
    if (open) {
      refreshLibrary();
      librarySearch.focus();
    }
  }

  $('#add-btn').addEventListener('click', () => openLibrary(true));
  $('#empty-add').addEventListener('click', () => openLibrary(true));
  $('#lib-close').addEventListener('click', () => openLibrary(false));
  library.addEventListener('click', e => {
    if (e.target === library) openLibrary(false);
  });
  librarySearch.addEventListener('input', refreshLibrary);
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && library.hasAttribute('data-open')) {
      openLibrary(false);
    }
  });

  // ---- schematics: snapshot the whole grid + its data ---------------------
  //
  // A schematic is the layout plus a copy of every module's stored data
  // (state, per-tile colour, size). You can save the grind modules you've
  // built up, clear them off the canvas, and reload them later untouched.

  const SCHEMATICS_KEY = 'schematics';
  const schPanel = $('#schematic-panel');
  const schName = $('#sch-name');
  const schList = $('#sch-list');

  const moduleDataKeys = () => {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX + 'm.')) keys.push(k);
    }
    return keys;
  };

  function captureSchematic() {
    const data = {};
    for (const k of moduleDataKeys()) data[k] = localStorage.getItem(k);
    return { layout: [...layout], data, savedAt: new Date().toLocaleString() };
  }

  function loadSchematic(snapshot) {
    for (const [k, v] of Object.entries(snapshot.data || {})) {
      try { localStorage.setItem(k, v); } catch {}
    }
    cleanups.forEach(fn => { try { fn(); } catch {} });
    cleanups.clear();
    layout = (snapshot.layout || []).filter(findModule);
    saveLayout();
    renderAll();
    refreshLibrary();
  }

  function renderSchematics() {
    const all = store.get(SCHEMATICS_KEY, {});
    schList.innerHTML = '';
    const names = Object.keys(all);
    if (!names.length) {
      schList.append(el('p.tip', 'no saved schematics yet'));
      return;
    }
    names.forEach(name => {
      const snap = all[name];
      schList.append(el('li',
        el('span', `› ${name}`),
        el('time', `${snap.layout?.length || 0} mod · ${snap.savedAt || ''}`),
        el('button.btn.mini', {
          onclick: () => { loadSchematic(snap); toggleSchematics(false); },
        }, 'load'),
        el('button.btn.mini', {
          onclick: () => {
            const next = store.get(SCHEMATICS_KEY, {});
            delete next[name];
            store.set(SCHEMATICS_KEY, next);
            renderSchematics();
          },
        }, 'del')));
    });
  }

  function toggleSchematics(open) {
    schPanel.toggleAttribute('data-open', open);
    schPanel.setAttribute('aria-hidden', String(!open));
    if (open) renderSchematics();
  }

  $('#schematic-btn').addEventListener('click', () => toggleSchematics(true));
  $('#sch-close').addEventListener('click', () => toggleSchematics(false));
  schPanel.addEventListener('click', e => {
    if (e.target === schPanel) toggleSchematics(false);
  });
  $('#sch-save').addEventListener('click', () => {
    const name = schName.value.trim();
    if (!name) { schName.focus(); return; }
    const all = store.get(SCHEMATICS_KEY, {});
    all[name] = captureSchematic();
    store.set(SCHEMATICS_KEY, all);
    schName.value = '';
    renderSchematics();
  });
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && schPanel.hasAttribute('data-open')) {
      toggleSchematics(false);
    }
  });

  renderAll();
  refreshLibrary();
}
