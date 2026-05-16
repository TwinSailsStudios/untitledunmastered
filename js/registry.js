// The module catalogue. Each entry knows how to build itself into a tile
// body and is handed its own scoped storage so it can remember state between
// sessions. Modules don't reach outside their own root element, which is
// what makes the workspace free to add, remove and reorder them at will.

import {
  el, bus, formatClock, formatMoney, clamp, todayKey, pad2,
} from './util.js';
import { sfx } from './sfx.js';

// ---- little UI helpers so the modules below stay readable -----------------

const button = (label, onClick, variant) =>
  el('button.btn' + (variant ? '.' + variant : ''), { onclick: onClick }, label);

const field = (label, control) =>
  el('label.field', el('span', label), control);

const numberInput = (value, attrs = {}) =>
  el('input', { type: 'number', value, ...attrs });

const textInput = (placeholder, attrs = {}) =>
  el('input', { type: 'text', placeholder, ...attrs });

const output = () => el('output.out');
const inputRow = (...controls) => el('div.rowset', ...controls);
const hint = text => el('p.tip', text);

// A handful of philosophers for the journal/quote modules. The last couple
// are deliberately not Greek — a small wink for anyone reading the source.
const QUOTES = [
  ['The unexamined life is not worth living.', 'Socrates'],
  ['We are what we repeatedly do. Excellence is a habit.', 'Aristotle'],
  ['No man ever steps in the same river twice.', 'Heraclitus'],
  ['There is nothing permanent except change.', 'Heraclitus'],
  ['First say what you would be; then do what you must.', 'Epictetus'],
  ['Wonder is the beginning of wisdom.', 'Socrates'],
  ['Reach for the stars so if you fall you land on a cloud.', 'Ye'],
  ['Having money is not everything, not having it is.', 'Ye'],
];

const modules = [];
function register(id, name, group, mount) {
  modules.push({ id, name, group, mount });
}

// ===========================================================================
//  Time & flow
// ===========================================================================

register('pomodoro', 'Fire & Ice Pomodoro', 'FLOW', (root, save) => {
  let fireMinutes = save.get('fire', 50);
  let phase = 'idle';            // idle | fire | ice
  let remaining = 0;
  let total = 0;
  let timer = null;

  const iceMinutes = () => Math.round(fireMinutes * 0.5);

  const clock = el('div.bigclock', '00:00');
  const fireField = numberInput(fireMinutes, { min: 1, max: 240 });
  const iceReadout = output();
  iceReadout.textContent = iceMinutes();

  const rail = el('div.rail', el('div.rail__fill'));
  const railFill = rail.firstChild;

  const startBtn = button('Ignite', start);
  const holdBtn = button('Hold', pause, 'ghost');
  const purgeBtn = button('Purge', reset, 'ghost');
  holdBtn.disabled = true;

  function paint() {
    clock.textContent = formatClock(remaining);
    railFill.style.width = total ? (100 - (remaining / total) * 100) + '%' : '0%';
    root.closest('.tile')?.classList.toggle('tile--fire', phase === 'fire');
  }

  function enter(nextPhase) {
    phase = nextPhase;
    total = (phase === 'fire' ? fireMinutes : iceMinutes()) * 60;
    remaining = total;
    paint();
  }

  function tick() {
    remaining -= 1;
    if (remaining <= 0) enter(phase === 'fire' ? 'ice' : 'fire');
    bus.emit('heartbeat', { phase });
    paint();
  }

  function start() {
    if (timer) return;
    if (phase === 'idle') enter('fire');
    timer = setInterval(tick, 1000);
    startBtn.disabled = true;
    holdBtn.disabled = false;
  }

  function pause() {
    clearInterval(timer);
    timer = null;
    startBtn.disabled = false;
    holdBtn.disabled = true;
  }

  function reset() {
    pause();
    phase = 'idle';
    remaining = total = 0;
    paint();
  }

  fireField.oninput = () => {
    fireMinutes = clamp(Number(fireField.value) || 1, 1, 240);
    save.set('fire', fireMinutes);
    iceReadout.textContent = iceMinutes();
    if (phase === 'idle') paint();
  };

  root.append(
    clock,
    inputRow(field('Fire (min)', fireField), field('Ice — auto 1:2', iceReadout)),
    el('div.btnrow', startBtn, holdBtn, purgeBtn),
    rail,
  );
  paint();
  return () => pause();
});

register('stopwatch', 'Stopwatch', 'TIME', (root) => {
  let elapsed = 0;
  let startedAt = 0;
  let timer = null;
  const laps = [];

  const display = el('div.bigclock', '00:00:00');
  const lapList = el('ul.loglist');

  const render = () =>
    display.textContent = formatClock((elapsed + (timer ? Date.now() - startedAt : 0)) / 1000);

  const toggle = button('Start', () => {
    if (timer) {
      elapsed += Date.now() - startedAt;
      clearInterval(timer);
      timer = null;
      toggle.textContent = 'Start';
    } else {
      startedAt = Date.now();
      timer = setInterval(render, 100);
      toggle.textContent = 'Stop';
    }
  });

  root.append(
    display,
    el('div.btnrow',
      toggle,
      button('Lap', () => {
        laps.unshift(display.textContent);
        lapList.prepend(el('li', '› ' + laps[0]));
      }, 'ghost'),
      button('Reset', () => {
        clearInterval(timer);
        timer = null;
        elapsed = 0;
        laps.length = 0;
        lapList.innerHTML = '';
        toggle.textContent = 'Start';
        render();
      }, 'ghost'),
    ),
    lapList,
  );
  render();
  return () => clearInterval(timer);
});

register('countdown', 'Countdown', 'TIME', (root, save) => {
  let remaining = 0;
  let timer = null;

  const display = el('div.bigclock', '00:00');
  const minutes = numberInput(save.get('min', 10), { min: 0, max: 600 });
  const paint = () => display.textContent = formatClock(remaining);

  root.append(
    display,
    field('Minutes', minutes),
    el('div.btnrow',
      button('Start', () => {
        if (timer) return;
        remaining = (Number(minutes.value) || 0) * 60;
        save.set('min', Number(minutes.value));
        timer = setInterval(() => {
          remaining -= 1;
          if (remaining <= 0) {
            clearInterval(timer);
            timer = null;
            remaining = 0;
            display.classList.add('flash');
            sfx.alert();
            setTimeout(() => display.classList.remove('flash'), 1200);
          }
          paint();
        }, 1000);
      }),
      button('Stop', () => { clearInterval(timer); timer = null; }, 'ghost'),
    ),
  );
  paint();
  return () => clearInterval(timer);
});

register('worldclock', 'World Clock', 'TIME', (root) => {
  const zones = ['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo'];
  const grid = el('div.kv');
  const cells = zones.map(zone => {
    const value = el('b');
    grid.append(el('div', el('span', zone.split('/').pop()), value));
    return [zone, value];
  });

  const update = () => cells.forEach(([zone, value]) => {
    try {
      value.textContent = new Intl.DateTimeFormat('en-GB', {
        timeZone: zone, hour: '2-digit', minute: '2-digit', second: '2-digit',
      }).format(new Date());
    } catch {
      value.textContent = '--';
    }
  });

  root.append(grid);
  update();
  const timer = setInterval(update, 1000);
  return () => clearInterval(timer);
});

register('metronome', 'Metronome', 'FLOW', (root, save) => {
  let bpm = save.get('bpm', 100);
  let timer = null;
  let running = false;

  const pulse = el('div.pulser');
  const bpmField = numberInput(bpm, { min: 30, max: 300 });
  const label = el('b.metro__bpm', bpm + ' BPM');

  function beat() {
    pulse.classList.remove('pulser--hit');
    void pulse.offsetWidth;            // restart the CSS animation
    pulse.classList.add('pulser--hit');
    bus.emit('heartbeat', {});
  }

  const toggle = button('Start', () => {
    running = !running;
    toggle.textContent = running ? 'Stop' : 'Start';
    clearInterval(timer);
    if (running) {
      beat();
      timer = setInterval(beat, 60000 / bpm);
    }
  });

  bpmField.oninput = () => {
    bpm = clamp(Number(bpmField.value) || 30, 30, 300);
    save.set('bpm', bpm);
    label.textContent = bpm + ' BPM';
    if (running) {
      clearInterval(timer);
      timer = setInterval(beat, 60000 / bpm);
    }
  };

  root.append(pulse, label, field('BPM', bpmField), el('div.btnrow', toggle));
  return () => clearInterval(timer);
});

register('breathe', 'Breathing Guide', 'FLOW', (root) => {
  const phases = ['Inhale', 'Hold', 'Exhale', 'Hold'];
  let index = 0;

  const ring = el('div.breath');
  const caption = el('b.breath__cap', phases[0]);

  function step() {
    ring.dataset.phase = String(index);
    caption.textContent = phases[index];
    index = (index + 1) % phases.length;
  }

  root.append(ring, caption, hint('box breathing · 4s per phase'));
  step();
  const timer = setInterval(step, 4000);
  return () => clearInterval(timer);
});

register('bpmtap', 'BPM Tapper', 'FLOW', (root) => {
  let taps = [];
  const display = el('div.bigclock', '---');

  root.append(
    display,
    el('div.btnrow',
      button('Tap', () => {
        const now = Date.now();
        taps.push(now);
        taps = taps.filter(t => now - t < 5000);
        if (taps.length > 1) {
          const avg = (taps[taps.length - 1] - taps[0]) / (taps.length - 1);
          display.textContent = Math.round(60000 / avg);
        }
      }),
      button('Reset', () => { taps = []; display.textContent = '---'; }, 'ghost'),
    ),
    hint('tap along to the beat'),
  );
});

register('interval', 'Interval Trainer', 'FLOW', (root, save) => {
  let work = save.get('work', 30);
  let rest = save.get('rest', 15);
  let phase = 'WORK';
  let remaining = 0;
  let timer = null;

  const display = el('div.bigclock', '00:00');
  const workField = numberInput(work, { min: 5 });
  const restField = numberInput(rest, { min: 5 });
  const tag = el('b.metro__bpm', 'IDLE');
  const paint = () => display.textContent = formatClock(remaining);

  workField.oninput = () => save.set('work', work = Number(workField.value) || 5);
  restField.oninput = () => save.set('rest', rest = Number(restField.value) || 5);

  root.append(
    display, tag,
    inputRow(field('Work (s)', workField), field('Rest (s)', restField)),
    el('div.btnrow',
      button('Start', () => {
        if (timer) return;
        phase = 'WORK';
        remaining = work;
        tag.textContent = phase;
        timer = setInterval(() => {
          remaining -= 1;
          if (remaining <= 0) {
            phase = phase === 'WORK' ? 'REST' : 'WORK';
            remaining = phase === 'WORK' ? work : rest;
            tag.textContent = phase;
            bus.emit('heartbeat', {});
          }
          paint();
        }, 1000);
      }),
      button('Stop', () => {
        clearInterval(timer);
        timer = null;
        tag.textContent = 'IDLE';
      }, 'ghost'),
    ),
  );
  paint();
  return () => clearInterval(timer);
});

register('timesince', 'Time Since', 'TIME', (root, save) => {
  const mark = el('input', { type: 'datetime-local', value: save.get('mark', '') });
  const result = output();

  function update() {
    if (!mark.value) { result.textContent = '--'; return; }
    const diffMs = Date.now() - new Date(mark.value).getTime();
    const secs = Math.abs(diffMs) / 1000;
    const days = Math.floor(secs / 86400);
    const hours = Math.floor((secs % 86400) / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    result.textContent = `${days}d ${hours}h ${mins}m ${diffMs < 0 ? '(future)' : 'ago'}`;
  }

  mark.oninput = () => { save.set('mark', mark.value); update(); };
  root.append(field('Mark', mark), result);
  update();
  const timer = setInterval(update, 1000);
  return () => clearInterval(timer);
});

register('sessions', 'Work Sessions', 'FLOW', (root, save) => {
  let openedAt = save.get('open', null);
  let log = save.get('log', []);

  const status = el('b.metro__bpm', openedAt ? 'RUNNING' : 'IDLE');
  const list = el('ul.loglist');

  function render() {
    list.innerHTML = '';
    log.slice(0, 20).forEach(entry =>
      list.append(el('li', `› ${entry.duration} — ${entry.at}`)));
  }

  const toggle = button(openedAt ? 'Stop' : 'Start', () => {
    if (openedAt) {
      const duration = formatClock((Date.now() - openedAt) / 1000);
      log.unshift({ duration, at: new Date().toLocaleString() });
      openedAt = null;
      save.set('log', log);
      save.set('open', null);
    } else {
      openedAt = Date.now();
      save.set('open', openedAt);
    }
    toggle.textContent = openedAt ? 'Stop' : 'Start';
    status.textContent = openedAt ? 'RUNNING' : 'IDLE';
    render();
  });

  root.append(
    status,
    el('div.btnrow', toggle, button('Clear', () => {
      log = [];
      save.set('log', []);
      render();
    }, 'ghost')),
    list,
  );
  render();
});

// ===========================================================================
//  Money & tracking
// ===========================================================================

register('moneyjar', 'Universal Money Jar', 'LEDGER', (root, save) => {
  const rate = numberInput(save.get('rate', 8.5), { step: 0.01 });
  const goal = numberInput(save.get('goal', 35), { step: 0.5 });
  const logged = numberInput(save.get('logged', 0), { step: 0.25 });

  const earned = el('b');
  const forecast = el('b');
  const bar = el('div.bar', el('div.bar__fill'));

  function recalc() {
    const r = Number(rate.value) || 0;
    const g = Number(goal.value) || 0;
    const l = Number(logged.value) || 0;
    earned.textContent = formatMoney(r * l);
    forecast.textContent = formatMoney(r * g);
    bar.firstChild.style.width = (g ? clamp((l / g) * 100, 0, 100) : 0) + '%';
    save.set('rate', r);
    save.set('goal', g);
    save.set('logged', l);
  }

  [rate, goal, logged].forEach(input => input.oninput = recalc);
  root.append(
    inputRow(field('Rate / hr', rate), field('Goal hrs', goal), field('Logged hrs', logged)),
    el('div.kv',
      el('div', el('span', 'Earned'), earned),
      el('div', el('span', 'Forecast'), forecast)),
    bar,
  );
  recalc();
});

register('tipsplit', 'Tip & Split', 'LEDGER', (root) => {
  const bill = numberInput(0, { step: 0.01 });
  const tip = numberInput(18, { step: 1 });
  const people = numberInput(1, { min: 1 });
  const result = output();

  function recalc() {
    const total = (Number(bill.value) || 0) * (1 + (Number(tip.value) || 0) / 100);
    const per = total / Math.max(1, Number(people.value) || 1);
    result.textContent = `${formatMoney(total)} total · ${formatMoney(per)} each`;
  }

  [bill, tip, people].forEach(input => input.oninput = recalc);
  root.append(inputRow(field('Bill', bill), field('Tip %', tip), field('Split', people)), result);
  recalc();
});

register('unitconv', 'Unit Converter', 'LEDGER', (root) => {
  const factors = {
    'km → mi': 0.621371, 'mi → km': 1.60934, 'kg → lb': 2.20462,
    'lb → kg': 0.453592, 'C → F': null, 'cm → in': 0.393701,
  };
  const select = el('select', ...Object.keys(factors).map(k => el('option', k)));
  const value = numberInput(0, { step: 'any' });
  const result = output();

  function recalc() {
    const key = select.value;
    const v = Number(value.value) || 0;
    result.textContent = (key === 'C → F' ? v * 9 / 5 + 32 : v * factors[key]).toFixed(4);
  }

  select.onchange = recalc;
  value.oninput = recalc;
  root.append(field('Conversion', select), field('Value', value), result);
  recalc();
});

register('percent', 'Percentage', 'LEDGER', (root) => {
  const a = numberInput(0);
  const b = numberInput(0);
  const result = output();

  function recalc() {
    const x = Number(a.value) || 0;
    const y = Number(b.value) || 0;
    result.textContent =
      `${x}% of ${y} = ${(x / 100 * y).toFixed(2)} · ` +
      `ratio ${y ? (x / y * 100).toFixed(2) : 0}%`;
  }

  [a, b].forEach(input => input.oninput = recalc);
  root.append(inputRow(field('Percent', a), field('Of', b)), result);
  recalc();
});

register('ratecard', 'Rate Card', 'LEDGER', (root, save) => {
  let cards = save.get('cards', []);
  const eventName = textInput('event');
  const rate = numberInput(0, { step: 0.01 });
  const list = el('ul.loglist');

  function render() {
    list.innerHTML = '';
    cards.forEach((card, i) => list.append(el('li',
      `› ${card.event} — ${formatMoney(card.rate)}/hr`,
      button('✕', () => { cards.splice(i, 1); save.set('cards', cards); render(); }, 'mini'))));
  }

  root.append(
    inputRow(field('Event', eventName), field('Rate', rate)),
    button('Add', () => {
      if (!eventName.value) return;
      cards.unshift({ event: eventName.value, rate: Number(rate.value) });
      save.set('cards', cards);
      eventName.value = '';
      render();
    }),
    list,
  );
  render();
});

register('earnticker', 'Earnings Ticker', 'LEDGER', (root, save) => {
  let rate = save.get('rate', 8.5);
  let startedAt = null;
  let timer = null;

  const rateField = numberInput(rate, { step: 0.01 });
  const display = el('div.bigclock', '$0.00');

  const toggle = button('Clock in', () => {
    if (startedAt) {
      clearInterval(timer);
      timer = null;
      startedAt = null;
      toggle.textContent = 'Clock in';
    } else {
      startedAt = Date.now();
      toggle.textContent = 'Clock out';
      timer = setInterval(() => {
        display.textContent = formatMoney((Date.now() - startedAt) / 3.6e6 * rate);
      }, 200);
    }
  });

  rateField.oninput = () => save.set('rate', rate = Number(rateField.value) || 0);
  root.append(display, field('Rate / hr', rateField), el('div.btnrow', toggle));
  return () => clearInterval(timer);
});

register('budget', 'Budget Jar', 'LEDGER', (root, save) => {
  let entries = save.get('log', []);
  const label = textInput('label');
  const amount = numberInput(0, { step: 0.01 });
  const net = el('b');
  const list = el('ul.loglist');

  function render() {
    list.innerHTML = '';
    let sum = 0;
    entries.forEach((entry, i) => {
      sum += entry.amount;
      list.append(el('li', `› ${entry.label}: ${formatMoney(entry.amount)}`,
        button('✕', () => { entries.splice(i, 1); save.set('log', entries); render(); }, 'mini')));
    });
    net.textContent = formatMoney(sum);
  }

  root.append(
    inputRow(field('Label', label), field('Amount (±)', amount)),
    button('Log', () => {
      if (!label.value) return;
      entries.unshift({ label: label.value, amount: Number(amount.value) || 0 });
      save.set('log', entries);
      label.value = '';
      amount.value = 0;
      render();
    }),
    el('div.kv', el('div', el('span', 'Net'), net)),
    list,
  );
  render();
});

// ===========================================================================
//  Consistency & grind
// ===========================================================================

register('streak', 'Grit Streak', 'GRIND', (root, save) => {
  let ledger = new Set(save.get('ledger', []));
  const heartRow = el('div.streak');
  const count = el('b.metro__bpm', '0d');

  function consecutiveDays() {
    let n = 0;
    const day = new Date();
    while (ledger.has(todayKey(day))) {
      n += 1;
      day.setDate(day.getDate() - 1);
    }
    return n;
  }

  function render() {
    heartRow.innerHTML = '';
    for (let i = 20; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      const key = todayKey(day);
      const cell = el('span.heart');
      if (ledger.has(key)) cell.classList.add('heart--on');
      if (i === 0) cell.classList.add('heart--today');
      cell.title = key;
      cell.style.animationDelay = (21 - i) * 50 + 'ms';
      heartRow.append(cell);
    }
    count.textContent = consecutiveDays() + 'd';
  }

  function logToday() {
    const key = todayKey();
    if (ledger.has(key)) return;
    ledger.add(key);
    save.set('ledger', [...ledger]);
    render();
  }

  bus.on('grit', logToday);
  root.append(
    count, heartRow,
    el('div.btnrow',
      button('Log today', logToday),
      button('Reset', () => {
        ledger = new Set();
        save.set('ledger', []);
        render();
      }, 'ghost')),
  );
  render();
});

register('habits', 'Habit Grid', 'GRIND', (root, save) => {
  let habits = save.get('habits', []);
  const nameInput = textInput('habit');
  const wrap = el('div.habits');

  function streakFor(habit) {
    let n = 0;
    const day = new Date();
    while ((habit.days || []).includes(todayKey(day))) {
      n += 1;
      day.setDate(day.getDate() - 1);
    }
    return n;
  }

  function render() {
    wrap.innerHTML = '';
    const today = todayKey();
    habits.forEach((habit, i) => {
      const done = (habit.days || []).includes(today);
      const toggle = el('button.habit__name' + (done ? '.on' : ''), {
        onclick: () => {
          habit.days = habit.days || [];
          const at = habit.days.indexOf(today);
          if (at < 0) habit.days.push(today);
          else habit.days.splice(at, 1);
          save.set('habits', habits);
          render();
        },
      }, habit.name);
      wrap.append(el('div.habit__row',
        toggle,
        el('span.habit__n', streakFor(habit) + 'd'),
        button('✕', () => { habits.splice(i, 1); save.set('habits', habits); render(); }, 'mini')));
    });
  }

  root.append(
    inputRow(field('New habit', nameInput)),
    button('Add', () => {
      if (!nameInput.value) return;
      habits.push({ name: nameInput.value, days: [] });
      save.set('habits', habits);
      nameInput.value = '';
      render();
    }),
    wrap,
  );
  render();
});

register('goalcount', 'Daily Goal', 'GRIND', (root, save) => {
  const target = numberInput(save.get('target', 8), { min: 1 });
  let day = save.get('day', todayKey());
  let count = save.get('count', 0);
  if (day !== todayKey()) {
    day = todayKey();
    count = 0;
    save.set('day', day);
    save.set('count', 0);
  }

  const display = el('div.bigclock');
  const bar = el('div.bar', el('div.bar__fill'));

  function paint() {
    display.textContent = `${count} / ${target.value}`;
    bar.firstChild.style.width =
      clamp(count / (Number(target.value) || 1) * 100, 0, 100) + '%';
  }

  target.oninput = () => { save.set('target', Number(target.value)); paint(); };
  root.append(
    display, bar, field('Target', target),
    el('div.btnrow',
      button('+1', () => { count += 1; save.set('count', count); bus.emit('grit'); paint(); }),
      button('−1', () => { count = Math.max(0, count - 1); save.set('count', count); paint(); }, 'ghost')),
  );
  paint();
});

register('tally', 'Tally Counter', 'GRIND', (root, save) => {
  let count = save.get('count', 0);
  const display = el('div.bigclock', String(count));
  const set = value => {
    count = value;
    save.set('count', count);
    display.textContent = count;
  };
  root.append(
    display,
    el('div.btnrow',
      button('+', () => set(count + 1)),
      button('−', () => set(Math.max(0, count - 1)), 'ghost'),
      button('Reset', () => set(0), 'ghost')),
  );
});

register('water', 'Water Intake', 'GRIND', (root, save) => {
  let day = save.get('day', todayKey());
  let count = save.get('count', 0);
  if (day !== todayKey()) {
    count = 0;
    save.set('day', todayKey());
    save.set('count', 0);
  }

  const dots = el('div.dots');
  function render() {
    dots.innerHTML = '';
    for (let i = 0; i < 8; i++) {
      dots.append(el('span.dot' + (i < count ? '.dot--on' : '')));
    }
  }

  root.append(
    dots,
    el('div.btnrow',
      button('+ Glass', () => {
        count = Math.min(8, count + 1);
        save.set('count', count);
        save.set('day', todayKey());
        render();
      }),
      button('−', () => { count = Math.max(0, count - 1); save.set('count', count); render(); }, 'ghost')),
    hint('target 8 / day'),
  );
  render();
});

register('reps', 'Rep Counter', 'GRIND', (root, save) => {
  let sets = save.get('sets', []);
  let current = 0;
  const display = el('div.bigclock', '0');
  const list = el('ul.loglist');

  function render() {
    list.innerHTML = '';
    sets.forEach(s => list.append(el('li', '› set: ' + s)));
  }

  root.append(
    display,
    el('div.btnrow',
      button('Rep', () => { current += 1; display.textContent = current; }),
      button('Set ✓', () => {
        if (!current) return;
        sets.unshift(current);
        save.set('sets', sets);
        current = 0;
        display.textContent = 0;
        render();
      }, 'ghost'),
      button('Clear', () => { sets = []; save.set('sets', []); render(); }, 'ghost')),
    list,
  );
  render();
});

// ===========================================================================
//  Dev tools
// ===========================================================================

register('github', 'GitHub Paper Trail', 'DEV', (root, save) => {
  const handle = textInput('github handle', { value: save.get('handle', 'torvalds') });
  const feed = el('ul.loglist');
  const status = el('b.metro__bpm', 'IDLE');

  const relative = iso => {
    const secs = (Date.now() - new Date(iso)) / 1000;
    if (secs < 3600) return Math.floor(secs / 60) + 'm';
    if (secs < 86400) return Math.floor(secs / 3600) + 'h';
    return Math.floor(secs / 86400) + 'd';
  };

  async function sync() {
    const name = handle.value.trim() || 'torvalds';
    save.set('handle', name);
    status.textContent = 'SYNC…';
    try {
      const res = await fetch(
        `https://api.github.com/users/${encodeURIComponent(name)}/events/public`);
      if (!res.ok) throw new Error('http ' + res.status);
      const events = await res.json();
      const commits = [];
      for (const event of events) {
        if (event.type !== 'PushEvent') continue;
        for (const commit of (event.payload?.commits || [])) {
          commits.push({ message: commit.message.split('\n')[0], at: event.created_at });
        }
      }
      if (!commits.length) throw new Error('no push events');
      feed.innerHTML = '';
      commits.slice(0, 8).forEach(c =>
        feed.append(el('li', `› ${c.message} `, el('time', relative(c.at) + ' ago'))));
      status.textContent = 'SYNCED';
    } catch {
      // Network policy may block GitHub — fall back to a labelled sample
      // rather than leaving the panel empty.
      feed.innerHTML = '';
      ['feat: thermal cycle', 'fix: rail desync', 'refactor: bus channels']
        .forEach(m => feed.append(el('li', '› ' + m, el('time', 'sample'))));
      status.textContent = 'OFFLINE';
    }
  }

  handle.onkeydown = e => { if (e.key === 'Enter') sync(); };
  root.append(inputRow(field('Handle', handle)), button('Pull', sync), feed);
  sync();
});

// A few of the dev modules share the same shape: an input, some buttons and
// a monospace output. This helper keeps them from repeating themselves.
function devTool(id, name, build) {
  register(id, name, 'DEV', build);
}

devTool('jsonfmt', 'JSON Formatter', (root) => {
  const input = el('textarea', { placeholder: '{ }' });
  const out = el('pre.codeout');
  root.append(input, el('div.btnrow', button('Format', () => {
    try {
      out.textContent = JSON.stringify(JSON.parse(input.value), null, 2);
      out.classList.remove('err');
    } catch (e) {
      out.textContent = '✗ ' + e.message;
      out.classList.add('err');
    }
  })), out);
});

devTool('base64', 'Base64', (root) => {
  const input = el('textarea', { placeholder: 'text' });
  const out = el('pre.codeout');
  root.append(input, el('div.btnrow',
    button('Encode', () => {
      try { out.textContent = btoa(unescape(encodeURIComponent(input.value))); }
      catch (e) { out.textContent = e.message; }
    }),
    button('Decode', () => {
      try { out.textContent = decodeURIComponent(escape(atob(input.value.trim()))); }
      catch (e) { out.textContent = e.message; }
    }, 'ghost'),
  ), out);
});

devTool('urlcode', 'URL Encode', (root) => {
  const input = el('textarea', { placeholder: 'text' });
  const out = el('pre.codeout');
  root.append(input, el('div.btnrow',
    button('Encode', () => out.textContent = encodeURIComponent(input.value)),
    button('Decode', () => {
      try { out.textContent = decodeURIComponent(input.value); }
      catch (e) { out.textContent = e.message; }
    }, 'ghost'),
  ), out);
});

devTool('hash', 'Hash', (root) => {
  const input = el('textarea', { placeholder: 'input' });
  const out = el('pre.codeout');
  const djb2 = str => {
    let h = 5381;
    for (const ch of str) h = ((h << 5) + h + ch.charCodeAt(0)) >>> 0;
    return h.toString(16);
  };
  root.append(input, el('div.btnrow',
    button('Hash', () => out.textContent = 'djb2: ' + djb2(input.value))), out);
});

devTool('uuid', 'UUID', (root) => {
  const out = el('pre.codeout');
  const generate = () => {
    out.textContent = crypto.randomUUID
      ? crypto.randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
          const r = Math.random() * 16 | 0;
          return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
        });
  };
  root.append(el('div.btnrow', button('Generate', generate)), out);
  generate();
});

devTool('regex', 'Regex Tester', (root) => {
  const pattern = textInput('pattern');
  const flags = textInput('flags (gi)');
  const subject = el('textarea', { placeholder: 'test string' });
  const out = el('pre.codeout');

  function run() {
    try {
      const matches = [...subject.value.matchAll(
        new RegExp(pattern.value, (flags.value || '') + 'g'))];
      out.textContent = matches.length
        ? matches.map(m => `· ${m[0]} @${m.index}`).join('\n')
        : 'no match';
      out.classList.remove('err');
    } catch (e) {
      out.textContent = '✗ ' + e.message;
      out.classList.add('err');
    }
  }

  [pattern, flags, subject].forEach(input => input.oninput = run);
  root.append(inputRow(field('Pattern', pattern), field('Flags', flags)), subject, out);
});

devTool('charcount', 'Char Count', (root) => {
  const input = el('textarea', { placeholder: 'type…' });
  const chars = el('b');
  const words = el('b');
  const lines = el('b');
  input.oninput = () => {
    chars.textContent = input.value.length;
    words.textContent = (input.value.trim().match(/\S+/g) || []).length;
    lines.textContent = input.value.split('\n').length;
  };
  root.append(input, el('div.kv',
    el('div', el('span', 'Chars'), chars),
    el('div', el('span', 'Words'), words),
    el('div', el('span', 'Lines'), lines)));
  input.oninput();
});

devTool('caseconv', 'Case Converter', (root) => {
  const input = el('textarea', { placeholder: 'text' });
  const out = el('pre.codeout');
  const apply = fn => out.textContent = fn(input.value);
  root.append(input, el('div.btnrow',
    button('UPPER', () => apply(s => s.toUpperCase())),
    button('lower', () => apply(s => s.toLowerCase()), 'ghost'),
    button('snake', () => apply(s => s.trim().replace(/\s+/g, '_').toLowerCase()), 'ghost'),
    button('Title', () => apply(s => s.replace(/\w\S*/g,
      t => t[0].toUpperCase() + t.slice(1).toLowerCase())), 'ghost'),
  ), out);
});

devTool('lorem', 'Lorem', (root) => {
  const words = ('lorem ipsum dolor sit amet consectetur adipiscing elit sed ' +
    'do eiusmod tempor incididunt ut labore').split(' ');
  const out = el('pre.codeout');
  const count = numberInput(40, { min: 1, max: 400 });
  const generate = () => {
    let s = '';
    for (let i = 0; i < (Number(count.value) || 40); i++) {
      s += words[Math.floor(Math.random() * words.length)] + ' ';
    }
    out.textContent = s.trim() + '.';
  };
  root.append(field('Words', count), el('div.btnrow', button('Generate', generate)), out);
  generate();
});

devTool('colormono', 'Color → Mono', (root) => {
  const picker = el('input', { type: 'color', value: '#888888' });
  const swatch = el('div.swatch');
  const value = el('b');
  picker.oninput = () => {
    const hex = picker.value;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luma = Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);
    const mono = '#' + luma.toString(16).padStart(2, '0').repeat(3);
    swatch.style.background = mono;
    value.textContent = mono.toUpperCase();
  };
  root.append(field('Pick', picker), swatch,
    el('div.kv', el('div', el('span', 'Mono'), value)));
  picker.oninput();
});

devTool('snippets', 'Snippet Vault', (root, save) => {
  let snippets = save.get('snippets', []);
  const label = textInput('label');
  const body = el('textarea', { placeholder: 'snippet' });
  const list = el('ul.loglist');

  function render() {
    list.innerHTML = '';
    snippets.forEach((snip, i) => {
      list.append(el('li', {
        onclick: () => navigator.clipboard?.writeText(snip.body),
      }, `› ${snip.label}`, button('✕', e => {
        e.stopPropagation();
        snippets.splice(i, 1);
        save.set('snippets', snippets);
        render();
      }, 'mini')));
    });
  }

  root.append(
    inputRow(field('Label', label)), body,
    button('Save', () => {
      if (!label.value) return;
      snippets.unshift({ label: label.value, body: body.value });
      save.set('snippets', snippets);
      label.value = '';
      body.value = '';
      render();
    }),
    hint('click a snippet to copy'),
    list,
  );
  render();
});

devTool('markdown', 'Markdown Scratch', (root, save) => {
  const input = el('textarea', {
    placeholder: '# heading\n**bold** *italic*',
    value: save.get('md', ''),
  });
  const out = el('div.mdout');

  function render() {
    save.set('md', input.value);
    out.innerHTML = input.value
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/^### (.*)$/gm, '<h4>$1</h4>')
      .replace(/^## (.*)$/gm, '<h3>$1</h3>')
      .replace(/^# (.*)$/gm, '<h2>$1</h2>')
      .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
      .replace(/\*(.+?)\*/g, '<i>$1</i>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }

  input.oninput = render;
  root.append(input, out);
  render();
});

devTool('diff', 'Line Diff', (root) => {
  const a = el('textarea', { placeholder: 'A' });
  const b = el('textarea', { placeholder: 'B' });
  const out = el('pre.codeout');

  function run() {
    const left = a.value.split('\n');
    const right = b.value.split('\n');
    const max = Math.max(left.length, right.length);
    let result = '';
    for (let i = 0; i < max; i++) {
      const same = left[i] === right[i];
      const mark = same ? '  '
        : left[i] === undefined ? '+ '
        : right[i] === undefined ? '- '
        : '~ ';
      result += mark + (right[i] ?? left[i] ?? '') + '\n';
    }
    out.textContent = result || '(empty)';
  }

  [a, b].forEach(input => input.oninput = run);
  root.append(a, b, el('div.btnrow', button('Diff', run)), out);
});

// ===========================================================================
//  Logs & notes
// ===========================================================================

register('journal', 'Socratic Journal', 'LOG', (root, save) => {
  const [text, who] = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  let entries = save.get('entries', []);
  const input = el('textarea', { placeholder: '> commit a thought…' });
  const list = el('ul.loglist');

  function render() {
    list.innerHTML = '';
    entries.forEach(entry => list.append(el('li',
      el('time', new Date(entry.at).toLocaleString()),
      el('span', entry.text))));
  }

  root.append(
    el('blockquote.quote', `"${text}" — ${who}`),
    input,
    el('div.btnrow', button('Inscribe', () => {
      const value = input.value.trim();
      if (!value) return;
      entries.unshift({ text: value, at: Date.now() });
      save.set('entries', entries);
      input.value = '';
      bus.emit('grit');
      render();
    })),
    list,
  );
  render();
});

register('notepad', 'Quick Notepad', 'LOG', (root, save) => {
  const input = el('textarea', {
    placeholder: 'persistent scratch…',
    value: save.get('text', ''),
  });
  input.style.minHeight = '160px';
  input.oninput = () => save.set('text', input.value);
  root.append(input, hint('autosaves locally'));
});

register('canvas', 'Scratch Canvas', 'LOG', (root) => {
  const canvas = el('canvas.scratch');
  const ctx = canvas.getContext('2d');
  let drawing = false;

  function applyStyle() {
    ctx.strokeStyle = getComputedStyle(document.documentElement)
      .getPropertyValue('--ink') || '#fff';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
  }

  // Resize the backing store to match the element's real pixel size so a
  // wider tile gives more room instead of stretching the bitmap. The
  // existing drawing is snapshotted and pasted back at the same origin.
  function fit() {
    const w = Math.max(1, Math.floor(canvas.clientWidth));
    const h = Math.max(1, Math.floor(canvas.clientHeight) || 220);
    if (canvas.width === w && canvas.height === h) return;
    let snapshot = null;
    if (canvas.width && canvas.height) {
      try { snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height); }
      catch {}
    }
    canvas.width = w;
    canvas.height = h;
    if (snapshot) { try { ctx.putImageData(snapshot, 0, 0); } catch {} }
    applyStyle();
  }

  const point = e => {
    const rect = canvas.getBoundingClientRect();
    return [
      (e.touches?.[0]?.clientX ?? e.clientX) - rect.left,
      (e.touches?.[0]?.clientY ?? e.clientY) - rect.top,
    ];
  };

  canvas.onpointerdown = e => { drawing = true; ctx.beginPath(); ctx.moveTo(...point(e)); };
  canvas.onpointermove = e => { if (drawing) { ctx.lineTo(...point(e)); ctx.stroke(); } };
  const stopDraw = () => { drawing = false; };
  window.addEventListener('pointerup', stopDraw);

  let observer = null;
  if (typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(() => fit());
    observer.observe(canvas);
  }

  root.append(canvas, el('div.btnrow',
    button('Clear', () => ctx.clearRect(0, 0, canvas.width, canvas.height), 'ghost')));
  requestAnimationFrame(fit);

  return () => {
    observer?.disconnect();
    window.removeEventListener('pointerup', stopDraw);
  };
});

register('todo', 'Checklist', 'LOG', (root, save) => {
  let items = save.get('items', []);
  const input = textInput('task');
  const list = el('ul.checklist');

  function render() {
    list.innerHTML = '';
    items.forEach((item, i) => {
      list.append(el('li' + (item.done ? '.done' : ''),
        el('button.chk', {
          onclick: () => { item.done = !item.done; save.set('items', items); render(); },
        }, item.done ? '■' : '□'),
        el('span', item.text),
        button('✕', () => { items.splice(i, 1); save.set('items', items); render(); }, 'mini')));
    });
  }

  function add() {
    if (!input.value.trim()) return;
    items.push({ text: input.value.trim(), done: false });
    save.set('items', items);
    input.value = '';
    render();
  }

  input.onkeydown = e => { if (e.key === 'Enter') add(); };
  root.append(inputRow(field('Task', input)), button('Add', add), list);
  render();
});

register('kanban', 'Kanban-lite', 'LOG', (root, save) => {
  let columns = save.get('columns', { TODO: [], WIP: [], DONE: [] });
  const order = ['TODO', 'WIP', 'DONE'];
  const wrap = el('div.kanban');
  const input = textInput('card → TODO');

  function render() {
    wrap.innerHTML = '';
    order.forEach(name => {
      const column = el('div.kanban__col', el('h5', name));
      columns[name].forEach((card, idx) => {
        column.append(el('div.kanban__card', {
          onclick: () => {
            const at = order.indexOf(name);
            columns[name].splice(idx, 1);
            if (at < 2) columns[order[at + 1]].push(card);
            save.set('columns', columns);
            render();
          },
        }, card));
      });
      wrap.append(column);
    });
  }

  input.onkeydown = e => {
    if (e.key === 'Enter' && input.value.trim()) {
      columns.TODO.push(input.value.trim());
      save.set('columns', columns);
      input.value = '';
      render();
    }
  };

  root.append(inputRow(field('New card', input)),
    hint('click a card to advance it'), wrap);
  render();
});

register('decision', 'Decision Matrix', 'LOG', (root, save) => {
  let options = save.get('options', []);
  const name = textInput('option');
  const weight = numberInput(5, { min: 0, max: 10 });
  const list = el('ul.loglist');

  function render() {
    list.innerHTML = '';
    [...options].sort((a, b) => b.weight - a.weight).forEach(option =>
      list.append(el('li', `› ${option.name}`, el('time', 'score ' + option.weight))));
  }

  root.append(
    inputRow(field('Option', name), field('Score', weight)),
    button('Add', () => {
      if (!name.value) return;
      options.push({ name: name.value, weight: Number(weight.value) || 0 });
      save.set('options', options);
      name.value = '';
      render();
    }),
    button('Clear', () => { options = []; save.set('options', []); render(); }, 'ghost'),
    list,
  );
  render();
});

register('bookmarks', 'Bookmark Rail', 'LOG', (root, save) => {
  let marks = save.get('marks', []);
  const label = textInput('label');
  const url = textInput('https://');
  const list = el('ul.loglist');

  function render() {
    list.innerHTML = '';
    marks.forEach((mark, i) => list.append(el('li',
      el('a', { href: mark.url, target: '_blank', rel: 'noopener' }, '› ' + mark.label),
      button('✕', () => { marks.splice(i, 1); save.set('marks', marks); render(); }, 'mini'))));
  }

  root.append(
    inputRow(field('Label', label), field('URL', url)),
    button('Pin', () => {
      if (!url.value) return;
      marks.unshift({ label: label.value || url.value, url: url.value });
      save.set('marks', marks);
      label.value = url.value = '';
      render();
    }),
    list,
  );
  render();
});

register('quote', 'Socratic Quote', 'LOG', (root) => {
  const block = el('blockquote.quote');
  const roll = () => {
    const [text, who] = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    block.textContent = `"${text}" — ${who}`;
  };
  root.append(block, el('div.btnrow', button('Roll', roll, 'ghost')));
  roll();
});

// ===========================================================================
//  System
// ===========================================================================

register('diagnostics', 'Raw Diagnostics', 'SYS', (root) => {
  const startedAt = Date.now();
  let keystrokes = 0;
  let window60 = [];

  const uptime = el('b');
  const velocity = el('b');
  const keys = el('b');
  const coords = el('b');

  const onKey = () => {
    keystrokes += 1;
    window60.push(Date.now());
    keys.textContent = keystrokes;
  };
  bus.on('keystroke', onKey);

  let lat = 24.7 + Math.random() * 0.4;
  let lon = -81 - Math.random() * 0.4;

  root.append(el('div.kv',
    el('div', el('span', 'Uptime'), uptime),
    el('div', el('span', 'Vel kp/m'), velocity),
    el('div', el('span', 'Keys'), keys),
    el('div', el('span', 'Coord'), coords)));

  const timer = setInterval(() => {
    const secs = (Date.now() - startedAt) / 1000;
    uptime.textContent =
      `${pad2(secs / 3600)}:${pad2((secs % 3600) / 60)}:${pad2(secs % 60)}`;
    window60 = window60.filter(t => t > Date.now() - 60000);
    velocity.textContent = window60.length.toFixed(2);
    lat += (Math.random() - 0.5) * 6e-4;
    lon += (Math.random() - 0.5) * 6e-4;
    coords.textContent = `${lat.toFixed(3)}, ${lon.toFixed(3)}`;
  }, 1000);

  return () => { clearInterval(timer); bus.off('keystroke', onKey); };
});

register('timeline', 'Project Gauntlet', 'SYS', (root, save) => {
  const start = el('input', { type: 'date', value: save.get('start', '2026-05-01') });
  const end = el('input', { type: 'date', value: save.get('end', '2026-06-15') });
  const bar = el('div.bar', el('div.bar__fill'));
  const percent = el('b');

  function update() {
    save.set('start', start.value);
    save.set('end', end.value);
    const a = new Date(start.value);
    const b = new Date(end.value);
    const pct = clamp((Date.now() - a) / ((b - a) || 1) * 100, 0, 100);
    bar.firstChild.style.width = pct + '%';
    percent.textContent = pct.toFixed(2) + '%';
  }

  [start, end].forEach(input => input.oninput = update);
  root.append(
    inputRow(field('Start', start), field('End', end)),
    el('div.kv', el('div', el('span', 'Gauntlet'), percent)),
    bar,
  );
  update();
  const timer = setInterval(update, 30000);
  return () => clearInterval(timer);
});

register('vault', 'Tech Asset Vault', 'SYS', (root, save) => {
  let assets = save.get('assets', []);
  const url = textInput('image url');
  const tag = textInput('tag');
  const grid = el('div.vault');

  function render() {
    grid.innerHTML = '';
    assets.forEach((asset, i) => {
      const img = el('img', { src: asset.url, loading: 'lazy', alt: asset.tag || 'asset' });
      img.onerror = () => img.replaceWith(
        el('div.vault__broken', `[ ${(asset.tag || 'asset').toUpperCase()} ]`));
      grid.append(el('figure.vault__item', img,
        el('figcaption',
          el('span', asset.tag || 'untagged'),
          button('✕', () => { assets.splice(i, 1); save.set('assets', assets); render(); }, 'mini'))));
    });
  }

  root.append(
    inputRow(field('URL', url), field('Tag', tag)),
    button('Mount', () => {
      if (!url.value) return;
      assets.unshift({ url: url.value, tag: tag.value });
      save.set('assets', assets);
      url.value = tag.value = '';
      render();
    }),
    grid,
  );
  render();
});

register('sysinfo', 'System Info', 'SYS', (root) => {
  const grid = el('div.kv');
  const add = (label, value) => grid.append(el('div', el('span', label), el('b', value)));
  add('Cores', navigator.hardwareConcurrency || '—');
  add('Lang', navigator.language);
  add('Screen', `${screen.width}×${screen.height}`);
  add('Viewport', `${innerWidth}×${innerHeight}`);
  add('Platform', navigator.platform || '—');
  add('Online', navigator.onLine ? 'yes' : 'no');
  root.append(grid);
});

register('credits', 'Credits', 'SYS', (root) => {
  root.append(el('div.credits',
    el('h3', 'untitled_unmastered'),
    el('p.credits__creed', '"we all will be untitled, never to be mastered."'),
    el('hr'),
    el('p', 'A raw Engineering Command Center. Blank canvas, fifty modular ' +
      'instruments, a grid you arrange yourself.'),
    el('dl.credits__dl',
      el('dt', 'Concept'), el('dd', 'TwinSailsStudios'),
      el('dt', 'Design'), el('dd', 'Blueprint / CAD-schematic'),
      el('dt', 'Stack'), el('dd', 'Vanilla HTML · CSS · ES modules'),
      el('dt', 'State'), el('dd', 'localStorage · no backend'),
      el('dt', 'Modules'), el('dd', '50 + workspace editor'),
      el('dt', 'Build'), el('dd', 'hand-wired, no framework')),
    el('hr'),
    // "we never gonna stop, last name ever, first name greatest" — keep going.
    el('p.credits__small', 'Built to be owned, not mastered. ' +
      'No one man should have all that power — so it ships open. ' +
      'Fork it, break it, make it yours.')));
});

// ===========================================================================
//  Second wave — fifty more instruments
// ===========================================================================

// ---- more dev tools -------------------------------------------------------

devTool('numbase', 'Number Base', (root) => {
  const value = textInput('decimal');
  const out = el('pre.codeout');
  value.oninput = () => {
    const n = parseInt(value.value, 10);
    if (Number.isNaN(n)) { out.textContent = '—'; return; }
    out.textContent =
      `bin  ${n.toString(2)}\noct  ${n.toString(8)}\n` +
      `hex  ${n.toString(16).toUpperCase()}\ndec  ${n}`;
  };
  root.append(field('Decimal', value), out);
  value.oninput();
});

devTool('epoch', 'Epoch ↔ Date', (root) => {
  const epoch = textInput('unix seconds');
  const out = el('pre.codeout');
  epoch.oninput = () => {
    const n = Number(epoch.value);
    out.textContent = n
      ? new Date(n * 1000).toISOString()
      : 'now: ' + Math.floor(Date.now() / 1000);
  };
  root.append(field('Epoch', epoch),
    el('div.btnrow', button('Now', () => {
      epoch.value = Math.floor(Date.now() / 1000);
      epoch.oninput();
    })), out);
  epoch.oninput();
});

devTool('slugify', 'Slugify', (root) => {
  const input = textInput('Some Title Here');
  const out = el('pre.codeout');
  input.oninput = () => out.textContent = input.value
    .toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || '—';
  root.append(field('Text', input), out);
  input.oninput();
});

devTool('htmlentities', 'HTML Entities', (root) => {
  const input = el('textarea', { placeholder: '<tag> & "quote"' });
  const out = el('pre.codeout');
  const escape = s => s.replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  root.append(input, el('div.btnrow',
    button('Escape', () => out.textContent = escape(input.value)),
    button('Unescape', () => {
      const d = document.createElement('textarea');
      d.innerHTML = input.value;
      out.textContent = d.value;
    }, 'ghost')), out);
});

devTool('querystring', 'Query String', (root) => {
  const input = textInput('?a=1&b=two');
  const out = el('pre.codeout');
  input.oninput = () => {
    try {
      const params = new URLSearchParams(input.value.replace(/^\?/, ''));
      const lines = [...params].map(([k, v]) => `${k} = ${v}`);
      out.textContent = lines.join('\n') || '—';
    } catch (e) {
      out.textContent = e.message;
    }
  };
  root.append(field('Query', input), out);
  input.oninput();
});

devTool('textreverse', 'Text Reverse', (root) => {
  const input = el('textarea', { placeholder: 'text' });
  const out = el('pre.codeout');
  root.append(input, el('div.btnrow',
    button('Chars', () => out.textContent = [...input.value].reverse().join('')),
    button('Words', () => out.textContent =
      input.value.split(/\s+/).reverse().join(' '), 'ghost'),
    button('Lines', () => out.textContent =
      input.value.split('\n').reverse().join('\n'), 'ghost')), out);
});

devTool('wordfreq', 'Word Frequency', (root) => {
  const input = el('textarea', { placeholder: 'paste text…' });
  const out = el('pre.codeout');
  input.oninput = () => {
    const counts = {};
    for (const w of input.value.toLowerCase().match(/[a-z']+/g) || []) {
      counts[w] = (counts[w] || 0) + 1;
    }
    out.textContent = Object.entries(counts)
      .sort((a, b) => b[1] - a[1]).slice(0, 12)
      .map(([w, n]) => `${n}  ${w}`).join('\n') || '—';
  };
  root.append(input, out);
});

devTool('dedupe', 'Dedupe Lines', (root) => {
  const input = el('textarea', { placeholder: 'one per line' });
  const out = el('pre.codeout');
  root.append(input, el('div.btnrow', button('Dedupe', () => {
    const seen = new Set();
    out.textContent = input.value.split('\n')
      .filter(line => !seen.has(line) && seen.add(line)).join('\n');
  })), out);
});

devTool('sortlines', 'Sort Lines', (root) => {
  const input = el('textarea', { placeholder: 'lines…' });
  const out = el('pre.codeout');
  const sortBy = fn => out.textContent =
    input.value.split('\n').sort(fn).join('\n');
  root.append(input, el('div.btnrow',
    button('A→Z', () => sortBy()),
    button('Z→A', () => sortBy((a, b) => b.localeCompare(a)), 'ghost'),
    button('Length', () => sortBy((a, b) => a.length - b.length), 'ghost')), out);
});

devTool('trimlines', 'Clean Lines', (root) => {
  const input = el('textarea', { placeholder: 'messy text' });
  const out = el('pre.codeout');
  root.append(input, el('div.btnrow', button('Clean', () => {
    out.textContent = input.value.split('\n')
      .map(l => l.trim()).filter(Boolean).join('\n');
  })), out);
});

devTool('mdtable', 'Markdown Table', (root) => {
  const input = el('textarea', { placeholder: 'csv rows, comma separated' });
  const out = el('pre.codeout');
  input.oninput = () => {
    const rows = input.value.trim().split('\n').map(r => r.split(','));
    if (!rows[0]) { out.textContent = '—'; return; }
    const header = '| ' + rows[0].join(' | ') + ' |';
    const rule = '| ' + rows[0].map(() => '---').join(' | ') + ' |';
    const body = rows.slice(1).map(r => '| ' + r.join(' | ') + ' |');
    out.textContent = [header, rule, ...body].join('\n');
  };
  root.append(input, out);
});

devTool('httpstatus', 'HTTP Status', (root) => {
  const codes = {
    200: 'OK', 201: 'Created', 204: 'No Content', 301: 'Moved Permanently',
    302: 'Found', 304: 'Not Modified', 400: 'Bad Request',
    401: 'Unauthorized', 403: 'Forbidden', 404: 'Not Found',
    409: 'Conflict', 418: "I'm a teapot", 429: 'Too Many Requests',
    500: 'Internal Server Error', 502: 'Bad Gateway', 503: 'Unavailable',
  };
  const input = textInput('e.g. 404');
  const out = el('pre.codeout');
  input.oninput = () =>
    out.textContent = codes[input.value.trim()] || '— unknown —';
  root.append(field('Code', input), out);
  input.oninput();
});

devTool('mimetypes', 'MIME Lookup', (root) => {
  const map = {
    json: 'application/json', html: 'text/html', css: 'text/css',
    js: 'text/javascript', png: 'image/png', jpg: 'image/jpeg',
    svg: 'image/svg+xml', pdf: 'application/pdf', zip: 'application/zip',
    mp4: 'video/mp4', mp3: 'audio/mpeg', txt: 'text/plain', csv: 'text/csv',
  };
  const input = textInput('extension');
  const out = el('pre.codeout');
  input.oninput = () =>
    out.textContent = map[input.value.trim().replace('.', '')] || '—';
  root.append(field('Ext', input), out);
  input.oninput();
});

devTool('asciitable', 'ASCII Table', (root) => {
  const out = el('pre.codeout');
  let s = '';
  for (let i = 32; i < 127; i++) s += `${i} ${String.fromCharCode(i)}   `;
  out.textContent = s;
  root.append(out);
});

devTool('cssshadow', 'CSS Box Shadow', (root) => {
  const x = numberInput(0);
  const y = numberInput(4);
  const blur = numberInput(12);
  const out = el('pre.codeout');
  const box = el('div.swatch');
  const update = () => {
    const css = `${x.value}px ${y.value}px ${blur.value}px rgba(0,0,0,.4)`;
    box.style.boxShadow = css;
    out.textContent = 'box-shadow: ' + css + ';';
  };
  [x, y, blur].forEach(i => i.oninput = update);
  root.append(inputRow(field('X', x), field('Y', y), field('Blur', blur)),
    box, out);
  update();
});

devTool('cubicbezier', 'Cubic Bezier', (root) => {
  const a = numberInput(0.16, { step: 0.01 });
  const b = numberInput(0.84, { step: 0.01 });
  const c = numberInput(0.34, { step: 0.01 });
  const d = numberInput(1, { step: 0.01 });
  const out = el('pre.codeout');
  const update = () =>
    out.textContent = `cubic-bezier(${a.value}, ${b.value}, ${c.value}, ${d.value})`;
  [a, b, c, d].forEach(i => i.oninput = update);
  root.append(inputRow(field('x1', a), field('y1', b), field('x2', c), field('y2', d)),
    out);
  update();
});

devTool('jsonminify', 'JSON Minify', (root) => {
  const input = el('textarea', { placeholder: '{ }' });
  const out = el('pre.codeout');
  root.append(input, el('div.btnrow', button('Minify', () => {
    try {
      out.textContent = JSON.stringify(JSON.parse(input.value));
      out.classList.remove('err');
    } catch (e) {
      out.textContent = '✗ ' + e.message;
      out.classList.add('err');
    }
  })), out);
});

devTool('csvjson', 'CSV → JSON', (root) => {
  const input = el('textarea', { placeholder: 'a,b\n1,2' });
  const out = el('pre.codeout');
  input.oninput = () => {
    const lines = input.value.trim().split('\n');
    if (lines.length < 2) { out.textContent = '—'; return; }
    const head = lines[0].split(',');
    const rows = lines.slice(1).map(line => {
      const cells = line.split(',');
      return Object.fromEntries(head.map((h, i) => [h.trim(), cells[i]?.trim()]));
    });
    out.textContent = JSON.stringify(rows, null, 2);
  };
  root.append(input, out);
});

devTool('jwtdecode', 'JWT Decode', (root) => {
  const input = el('textarea', { placeholder: 'header.payload.signature' });
  const out = el('pre.codeout');
  input.oninput = () => {
    try {
      const [h, p] = input.value.split('.');
      const decode = s => JSON.parse(atob(s.replace(/-/g, '+').replace(/_/g, '/')));
      out.textContent =
        JSON.stringify(decode(h), null, 2) + '\n--\n' +
        JSON.stringify(decode(p), null, 2);
      out.classList.remove('err');
    } catch (e) {
      out.textContent = '✗ ' + e.message;
      out.classList.add('err');
    }
  };
  root.append(input, out);
});

devTool('escapestr', 'String Escape', (root) => {
  const input = el('textarea', { placeholder: 'line one\nline two' });
  const out = el('pre.codeout');
  root.append(input, el('div.btnrow',
    button('Escape', () => out.textContent = JSON.stringify(input.value)),
    button('Unescape', () => {
      try { out.textContent = JSON.parse(input.value); }
      catch (e) { out.textContent = e.message; }
    }, 'ghost')), out);
});

// ---- more time & flow -----------------------------------------------------

register('tabata', 'Tabata Timer', 'FLOW', (root, save) => {
  const workSecs = save.get('work', 20);
  const restSecs = save.get('rest', 10);
  let rounds = save.get('rounds', 8);
  let phase = 'IDLE';
  let remaining = 0;
  let round = 0;
  let timer = null;

  const display = el('div.bigclock', '00:00');
  const tag = el('b.metro__bpm', 'IDLE · 0/' + rounds);

  function paint() {
    display.textContent = formatClock(remaining);
    tag.textContent = `${phase} · ${round}/${rounds}`;
  }

  root.append(display, tag, el('div.btnrow',
    button('Start', () => {
      if (timer) return;
      phase = 'WORK';
      round = 1;
      remaining = workSecs;
      paint();
      timer = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          if (phase === 'WORK') {
            phase = 'REST';
            remaining = restSecs;
          } else {
            round += 1;
            if (round > rounds) {
              clearInterval(timer);
              timer = null;
              phase = 'DONE';
            } else {
              phase = 'WORK';
              remaining = workSecs;
            }
          }
          bus.emit('heartbeat', {});
        }
        paint();
      }, 1000);
    }),
    button('Stop', () => {
      clearInterval(timer);
      timer = null;
      phase = 'IDLE';
      paint();
    }, 'ghost')));
  paint();
  return () => clearInterval(timer);
});

register('chessclock', 'Chess Clock', 'FLOW', (root, save) => {
  const base = save.get('base', 300);
  let left = [base, base];
  let active = null;
  let timer = null;

  const sides = [el('div.bigclock'), el('div.bigclock')];
  const paint = () => sides.forEach((s, i) => {
    s.textContent = formatClock(left[i]);
    s.classList.toggle('flash', active === i);
  });

  function switchTo(i) {
    active = i;
    clearInterval(timer);
    timer = setInterval(() => {
      left[active] = Math.max(0, left[active] - 1);
      paint();
    }, 1000);
    paint();
  }

  root.append(
    el('div.btnrow',
      el('button.btn', { onclick: () => switchTo(0) }, 'Left'),
      sides[0]),
    el('div.btnrow',
      el('button.btn', { onclick: () => switchTo(1) }, 'Right'),
      sides[1]),
    el('div.btnrow', button('Reset', () => {
      clearInterval(timer);
      timer = null;
      active = null;
      left = [base, base];
      paint();
    }, 'ghost')));
  paint();
  return () => clearInterval(timer);
});

register('daysuntil', 'Days Until', 'TIME', (root, save) => {
  const target = el('input', { type: 'date', value: save.get('date', '') });
  const out = output();
  function update() {
    if (!target.value) { out.textContent = '—'; return; }
    const diff = Math.ceil(
      (new Date(target.value) - new Date()) / 86400000);
    out.textContent = diff === 0 ? 'today'
      : diff > 0 ? `${diff} days to go` : `${-diff} days ago`;
  }
  target.oninput = () => { save.set('date', target.value); update(); };
  root.append(field('Target date', target), out);
  update();
});

register('agecalc', 'Age Calculator', 'TIME', (root, save) => {
  const born = el('input', { type: 'date', value: save.get('born', '') });
  const out = el('pre.codeout');
  function update() {
    if (!born.value) { out.textContent = '—'; return; }
    const ms = Date.now() - new Date(born.value).getTime();
    const years = ms / 31557600000;
    out.textContent =
      `${years.toFixed(2)} years\n${Math.floor(ms / 86400000)} days\n` +
      `${Math.floor(ms / 3600000)} hours`;
  }
  born.oninput = () => { save.set('born', born.value); update(); };
  root.append(field('Born', born), out);
  update();
});

register('alarm', 'Alarm At', 'TIME', (root, save) => {
  const at = el('input', { type: 'time', value: save.get('at', '') });
  const status = el('b.metro__bpm', 'unset');
  let timer = null;
  function arm() {
    save.set('at', at.value);
    clearInterval(timer);
    if (!at.value) { status.textContent = 'unset'; return; }
    status.textContent = 'armed ' + at.value;
    timer = setInterval(() => {
      const now = new Date();
      const hhmm = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
      if (hhmm === at.value) {
        status.textContent = '● RINGING';
        status.classList.add('flash');
        sfx.alert();
        clearInterval(timer);
      }
    }, 1000);
  }
  at.oninput = arm;
  root.append(field('Time', at), status);
  arm();
  return () => clearInterval(timer);
});

register('breakreminder', 'Break Reminder', 'FLOW', (root, save) => {
  const every = numberInput(save.get('every', 25), { min: 1 });
  const status = el('b.metro__bpm', 'idle');
  let timer = null;
  every.oninput = () => save.set('every', Number(every.value));
  root.append(field('Every (min)', every), status, el('div.btnrow',
    button('Arm', () => {
      clearInterval(timer);
      let left = (Number(every.value) || 25) * 60;
      timer = setInterval(() => {
        left -= 1;
        status.textContent = 'next break in ' + formatClock(left);
        if (left <= 0) {
          status.textContent = '● STAND UP';
          status.classList.add('flash');
          left = (Number(every.value) || 25) * 60;
          setTimeout(() => status.classList.remove('flash'), 4000);
        }
      }, 1000);
    }),
    button('Stop', () => { clearInterval(timer); status.textContent = 'idle'; }, 'ghost')));
  return () => clearInterval(timer);
});

register('lapavg', 'Lap Average', 'TIME', (root) => {
  const laps = [];
  let last = null;
  const out = el('pre.codeout');
  root.append(el('div.btnrow',
    button('Lap', () => {
      const now = Date.now();
      if (last) laps.push(now - last);
      last = now;
      const avg = laps.length
        ? laps.reduce((a, b) => a + b, 0) / laps.length / 1000 : 0;
      out.textContent =
        `laps ${laps.length}\nlast ${(laps.at(-1) / 1000 || 0).toFixed(2)}s\n` +
        `avg  ${avg.toFixed(2)}s`;
    }),
    button('Reset', () => { laps.length = 0; last = null; out.textContent = '—'; }, 'ghost')),
    out);
  out.textContent = '—';
});

register('focusratio', 'Focus Ratio', 'GRIND', (root) => {
  const focus = numberInput(0, { min: 0 });
  const distract = numberInput(0, { min: 0 });
  const bar = el('div.bar', el('div.bar__fill'));
  const out = output();
  function update() {
    const f = Number(focus.value) || 0;
    const d = Number(distract.value) || 0;
    const pct = f + d ? (f / (f + d)) * 100 : 0;
    bar.firstChild.style.width = pct + '%';
    out.textContent = pct.toFixed(0) + '% focused';
  }
  [focus, distract].forEach(i => i.oninput = update);
  root.append(inputRow(field('Focus min', focus), field('Distract min', distract)),
    bar, out);
  update();
});

register('worktime', 'Work Hours', 'LEDGER', (root) => {
  const start = el('input', { type: 'time' });
  const end = el('input', { type: 'time' });
  const breakMin = numberInput(30, { min: 0 });
  const out = output();
  function update() {
    if (!start.value || !end.value) { out.textContent = '—'; return; }
    const [sh, sm] = start.value.split(':').map(Number);
    const [eh, em] = end.value.split(':').map(Number);
    let mins = (eh * 60 + em) - (sh * 60 + sm) - (Number(breakMin.value) || 0);
    if (mins < 0) mins += 1440;
    out.textContent = `${(mins / 60).toFixed(2)} h (${mins} min)`;
  }
  [start, end, breakMin].forEach(i => i.oninput = update);
  root.append(inputRow(field('In', start), field('Out', end)),
    field('Break (min)', breakMin), out);
  update();
});

register('pomocount', 'Pomodoro Count', 'GRIND', (root, save) => {
  let day = save.get('day', todayKey());
  let count = save.get('count', 0);
  if (day !== todayKey()) { count = 0; save.set('day', todayKey()); save.set('count', 0); }
  const display = el('div.bigclock', String(count));
  const sync = v => {
    count = Math.max(0, v);
    save.set('count', count);
    save.set('day', todayKey());
    display.textContent = count;
  };
  root.append(display, hint('pomodoros completed today'),
    el('div.btnrow',
      button('+ Pomo', () => { sync(count + 1); bus.emit('grit'); }),
      button('−', () => sync(count - 1), 'ghost')));
});

// ---- more ledger ----------------------------------------------------------

register('compound', 'Compound Interest', 'LEDGER', (root) => {
  const principal = numberInput(1000, { step: 100 });
  const rate = numberInput(5, { step: 0.1 });
  const years = numberInput(10, { min: 1 });
  const out = output();
  function update() {
    const p = Number(principal.value) || 0;
    const r = (Number(rate.value) || 0) / 100;
    const t = Number(years.value) || 0;
    out.textContent = formatMoney(p * Math.pow(1 + r, t));
  }
  [principal, rate, years].forEach(i => i.oninput = update);
  root.append(inputRow(field('Principal', principal), field('Rate %', rate),
    field('Years', years)), out);
  update();
});

register('loan', 'Loan / EMI', 'LEDGER', (root) => {
  const amount = numberInput(10000, { step: 100 });
  const rate = numberInput(6, { step: 0.1 });
  const months = numberInput(36, { min: 1 });
  const out = output();
  function update() {
    const p = Number(amount.value) || 0;
    const r = (Number(rate.value) || 0) / 1200;
    const n = Number(months.value) || 1;
    const emi = r ? p * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1) : p / n;
    out.textContent = `${formatMoney(emi)} / mo · ${formatMoney(emi * n)} total`;
  }
  [amount, rate, months].forEach(i => i.oninput = update);
  root.append(inputRow(field('Amount', amount), field('Rate %', rate),
    field('Months', months)), out);
  update();
});

register('savegoal', 'Savings Goal', 'LEDGER', (root, save) => {
  const goal = numberInput(save.get('goal', 1000), { step: 50 });
  const saved = numberInput(save.get('saved', 0), { step: 10 });
  const bar = el('div.bar', el('div.bar__fill'));
  const out = output();
  function update() {
    const g = Number(goal.value) || 0;
    const s = Number(saved.value) || 0;
    const pct = g ? clamp(s / g * 100, 0, 100) : 0;
    bar.firstChild.style.width = pct + '%';
    out.textContent = `${pct.toFixed(0)}% · ${formatMoney(Math.max(0, g - s))} to go`;
    save.set('goal', g);
    save.set('saved', s);
  }
  [goal, saved].forEach(i => i.oninput = update);
  root.append(inputRow(field('Goal', goal), field('Saved', saved)), bar, out);
  update();
});

register('markup', 'Markup / Margin', 'LEDGER', (root) => {
  const cost = numberInput(0, { step: 0.01 });
  const price = numberInput(0, { step: 0.01 });
  const out = el('pre.codeout');
  function update() {
    const c = Number(cost.value) || 0;
    const p = Number(price.value) || 0;
    const markup = c ? ((p - c) / c) * 100 : 0;
    const margin = p ? ((p - c) / p) * 100 : 0;
    out.textContent =
      `markup  ${markup.toFixed(1)}%\nmargin  ${margin.toFixed(1)}%\n` +
      `profit  ${formatMoney(p - c)}`;
  }
  [cost, price].forEach(i => i.oninput = update);
  root.append(inputRow(field('Cost', cost), field('Price', price)), out);
  update();
});

register('hourly2salary', 'Hourly → Salary', 'LEDGER', (root) => {
  const rate = numberInput(25, { step: 0.5 });
  const hours = numberInput(40, { min: 1 });
  const out = el('pre.codeout');
  function update() {
    const r = Number(rate.value) || 0;
    const h = Number(hours.value) || 0;
    out.textContent =
      `week   ${formatMoney(r * h)}\nmonth  ${formatMoney(r * h * 52 / 12)}\n` +
      `year   ${formatMoney(r * h * 52)}`;
  }
  [rate, hours].forEach(i => i.oninput = update);
  root.append(inputRow(field('Rate/hr', rate), field('Hrs/wk', hours)), out);
  update();
});

register('breakeven', 'Break-even', 'LEDGER', (root) => {
  const fixed = numberInput(1000, { step: 50 });
  const price = numberInput(20, { step: 0.5 });
  const variable = numberInput(8, { step: 0.5 });
  const out = output();
  function update() {
    const f = Number(fixed.value) || 0;
    const margin = (Number(price.value) || 0) - (Number(variable.value) || 0);
    out.textContent = margin > 0
      ? `${Math.ceil(f / margin)} units to break even`
      : 'price must exceed unit cost';
  }
  [fixed, price, variable].forEach(i => i.oninput = update);
  root.append(inputRow(field('Fixed', fixed), field('Price', price),
    field('Unit cost', variable)), out);
  update();
});

register('roi', 'ROI', 'LEDGER', (root) => {
  const invested = numberInput(0, { step: 10 });
  const returned = numberInput(0, { step: 10 });
  const out = output();
  function update() {
    const i = Number(invested.value) || 0;
    const r = Number(returned.value) || 0;
    out.textContent = i
      ? `${(((r - i) / i) * 100).toFixed(1)}% · ${formatMoney(r - i)} net`
      : '—';
  }
  [invested, returned].forEach(x => x.oninput = update);
  root.append(inputRow(field('Invested', invested), field('Returned', returned)), out);
  update();
});

register('invoice', 'Invoice Lines', 'LEDGER', (root, save) => {
  let lines = save.get('lines', []);
  const desc = textInput('description');
  const qty = numberInput(1, { min: 1 });
  const price = numberInput(0, { step: 0.01 });
  const list = el('ul.loglist');
  const total = el('b');
  function render() {
    list.innerHTML = '';
    let sum = 0;
    lines.forEach((line, i) => {
      const amount = line.qty * line.price;
      sum += amount;
      list.append(el('li',
        `› ${line.qty}× ${line.desc} = ${formatMoney(amount)}`,
        button('✕', () => { lines.splice(i, 1); save.set('lines', lines); render(); }, 'mini')));
    });
    total.textContent = formatMoney(sum);
  }
  root.append(
    inputRow(field('Item', desc), field('Qty', qty), field('Price', price)),
    button('Add line', () => {
      if (!desc.value) return;
      lines.push({ desc: desc.value, qty: Number(qty.value) || 1, price: Number(price.value) || 0 });
      save.set('lines', lines);
      desc.value = '';
      render();
    }),
    el('div.kv', el('div', el('span', 'Total'), total)),
    list);
  render();
});

register('splittab', 'Split Tab', 'LEDGER', (root, save) => {
  let people = save.get('people', []);
  const name = textInput('name');
  const paid = numberInput(0, { step: 0.01 });
  const list = el('ul.loglist');
  const out = el('pre.codeout');
  function render() {
    list.innerHTML = '';
    let sum = 0;
    people.forEach((p, i) => {
      sum += p.paid;
      list.append(el('li', `› ${p.name}: ${formatMoney(p.paid)}`,
        button('✕', () => { people.splice(i, 1); save.set('people', people); render(); }, 'mini')));
    });
    const share = people.length ? sum / people.length : 0;
    out.textContent = people.map(p => {
      const delta = p.paid - share;
      return `${p.name} ${delta >= 0 ? 'gets' : 'owes'} ${formatMoney(Math.abs(delta))}`;
    }).join('\n') || '—';
  }
  root.append(
    inputRow(field('Name', name), field('Paid', paid)),
    button('Add', () => {
      if (!name.value) return;
      people.push({ name: name.value, paid: Number(paid.value) || 0 });
      save.set('people', people);
      name.value = '';
      paid.value = 0;
      render();
    }),
    list, out);
  render();
});

register('netgross', 'Net from Gross', 'LEDGER', (root) => {
  const gross = numberInput(0, { step: 0.01 });
  const taxRate = numberInput(20, { step: 0.5 });
  const out = output();
  function update() {
    const g = Number(gross.value) || 0;
    const t = (Number(taxRate.value) || 0) / 100;
    out.textContent = `${formatMoney(g * (1 - t))} net · ${formatMoney(g * t)} tax`;
  }
  [gross, taxRate].forEach(i => i.oninput = update);
  root.append(inputRow(field('Gross', gross), field('Tax %', taxRate)), out);
  update();
});

// ---- more logs, grind & system -------------------------------------------

register('mood', 'Mood Log', 'LOG', (root, save) => {
  let log = save.get('log', []);
  const faces = ['▁', '▃', '▅', '▆', '█'];
  const list = el('ul.loglist');
  function render() {
    list.innerHTML = '';
    log.slice(0, 14).forEach(entry =>
      list.append(el('li', `› ${faces[entry.level]} `, el('time', entry.at))));
  }
  root.append(
    el('div.btnrow', ...faces.map((f, i) =>
      button(f, () => {
        log.unshift({ level: i, at: new Date().toLocaleString() });
        save.set('log', log);
        render();
      }))),
    list);
  render();
});

register('gratitude', 'Gratitude 3', 'LOG', (root, save) => {
  const today = todayKey();
  let entries = save.get('entries', {});
  const inputs = [0, 1, 2].map(i =>
    textInput('grateful for…', { value: entries[today]?.[i] || '' }));
  function persist() {
    entries[today] = inputs.map(i => i.value);
    save.set('entries', entries);
  }
  inputs.forEach(i => i.oninput = persist);
  root.append(...inputs.map((inp, i) => field('#' + (i + 1), inp)),
    hint('three things, every day'));
});

register('winday', 'Win of the Day', 'LOG', (root, save) => {
  let wins = save.get('wins', []);
  const input = textInput("today's win");
  const list = el('ul.loglist');
  function render() {
    list.innerHTML = '';
    wins.forEach(w => list.append(el('li', `› ${w.text}`, el('time', w.day))));
  }
  function add() {
    if (!input.value.trim()) return;
    wins.unshift({ text: input.value.trim(), day: todayKey() });
    save.set('wins', wins);
    input.value = '';
    bus.emit('grit');
    render();
  }
  input.onkeydown = e => { if (e.key === 'Enter') add(); };
  root.append(inputRow(field('Win', input)), button('Log win', add), list);
  render();
});

register('antitodo', 'Anti-Todo', 'GRIND', (root, save) => {
  let done = save.get('done', []);
  const input = textInput('something you did');
  const list = el('ul.loglist');
  function render() {
    list.innerHTML = '';
    done.slice(0, 30).forEach(d =>
      list.append(el('li', `✓ ${d.text}`, el('time', d.at))));
  }
  function add() {
    if (!input.value.trim()) return;
    done.unshift({ text: input.value.trim(), at: new Date().toLocaleTimeString() });
    save.set('done', done);
    input.value = '';
    render();
  }
  input.onkeydown = e => { if (e.key === 'Enter') add(); };
  root.append(inputRow(field('Did', input)), button('Log it', add),
    hint('a list of what you already finished'), list);
  render();
});

register('reading', 'Reading List', 'LOG', (root, save) => {
  let books = save.get('books', []);
  const title = textInput('title');
  const list = el('ul.checklist');
  function render() {
    list.innerHTML = '';
    books.forEach((b, i) => {
      list.append(el('li' + (b.done ? '.done' : ''),
        el('button.chk', {
          onclick: () => { b.done = !b.done; save.set('books', books); render(); },
        }, b.done ? '■' : '□'),
        el('span', b.title),
        button('✕', () => { books.splice(i, 1); save.set('books', books); render(); }, 'mini')));
    });
  }
  function add() {
    if (!title.value.trim()) return;
    books.push({ title: title.value.trim(), done: false });
    save.set('books', books);
    title.value = '';
    render();
  }
  title.onkeydown = e => { if (e.key === 'Enter') add(); };
  root.append(inputRow(field('Book', title)), button('Add', add), list);
  render();
});

register('ideainbox', 'Idea Inbox', 'LOG', (root, save) => {
  let ideas = save.get('ideas', []);
  const input = el('textarea', { placeholder: 'capture a raw idea…' });
  const list = el('ul.loglist');
  function render() {
    list.innerHTML = '';
    ideas.forEach((idea, i) =>
      list.append(el('li', el('span', idea.text),
        button('✕', () => { ideas.splice(i, 1); save.set('ideas', ideas); render(); }, 'mini'))));
  }
  root.append(input, button('Capture', () => {
    if (!input.value.trim()) return;
    ideas.unshift({ text: input.value.trim() });
    save.set('ideas', ideas);
    input.value = '';
    render();
  }), list);
  render();
});

register('eisenhower', 'Eisenhower Matrix', 'LOG', (root, save) => {
  let tasks = save.get('tasks', []);
  const input = textInput('task');
  const quadrants = [
    ['DO', 'urgent + important'],
    ['PLAN', 'important, not urgent'],
    ['DELEGATE', 'urgent, not important'],
    ['DROP', 'neither'],
  ];
  const grid = el('div.kanban');
  function render() {
    grid.innerHTML = '';
    quadrants.forEach(([key, label], q) => {
      const col = el('div.kanban__col', el('h5', key));
      tasks.forEach((t, i) => {
        if (t.q !== q) return;
        col.append(el('div.kanban__card', {
          onclick: () => { t.q = (t.q + 1) % 4; save.set('tasks', tasks); render(); },
        }, t.text));
      });
      col.append(el('p.tip', label));
      grid.append(col);
    });
  }
  input.onkeydown = e => {
    if (e.key === 'Enter' && input.value.trim()) {
      tasks.push({ text: input.value.trim(), q: 0 });
      save.set('tasks', tasks);
      input.value = '';
      render();
    }
  };
  root.append(inputRow(field('New task', input)),
    hint('click a card to rotate quadrant'), grid);
  render();
});

register('randompick', 'Random Picker', 'LOG', (root) => {
  const input = el('textarea', { placeholder: 'one option per line' });
  const out = el('div.bigclock', '—');
  root.append(input, el('div.btnrow',
    button('Pick', () => {
      const options = input.value.split('\n').map(s => s.trim()).filter(Boolean);
      out.textContent = options.length
        ? options[Math.floor(Math.random() * options.length)]
        : '—';
    }),
    button('Coin', () => out.textContent = Math.random() < 0.5 ? 'HEADS' : 'TAILS', 'ghost'),
    button('D6', () => out.textContent = 1 + Math.floor(Math.random() * 6), 'ghost')),
    out);
});

register('keyboardtester', 'Keyboard Tester', 'SYS', (root) => {
  const display = el('div.bigclock', '—');
  const detail = el('pre.codeout');
  const onKey = e => {
    display.textContent = e.key === ' ' ? '␣' : e.key;
    detail.textContent =
      `key   ${e.key}\ncode  ${e.code}\nkeyCode ${e.keyCode}\n` +
      `mods  ${[e.ctrlKey && 'ctrl', e.altKey && 'alt',
        e.shiftKey && 'shift', e.metaKey && 'meta'].filter(Boolean).join(' ') || '—'}`;
  };
  window.addEventListener('keydown', onKey);
  root.append(display, detail, hint('press any key'));
  return () => window.removeEventListener('keydown', onKey);
});

register('manifesto', 'Manifesto', 'SYS', (root) => {
  root.append(el('div.credits',
    el('h3', 'the unmastered creed'),
    el('p.credits__creed', '"we all will be untitled, never to be mastered."'),
    el('hr'),
    el('p', 'Ship raw. Iterate in the open. The grind is the point — the ' +
      'polish is a side effect.'),
    el('p', 'Tools should bend to the operator, not the other way around. ' +
      'Fifty-plus instruments, a blank grid, your rules.'),
    el('hr'),
    // "Name one genius that ain't crazy." keep building anyway.
    el('p.credits__small', 'Stay paranoid about the work, generous with ' +
      'the credit. Reach for the stars; the cloud will catch you.')));
});

// ---- camera / media -------------------------------------------------------

register('video', 'Video', 'SYS', (root) => {
  let stream = null;
  let recorder = null;
  let chunks = [];

  const stage = el('div.media');
  const urlInput = textInput('youtube url');
  const status = el('p.tip', 'paste a YouTube link, or record from camera');

  function ytId(url) {
    const m = url.match(
      /(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
    return m ? m[1] : null;
  }

  function showEmbed() {
    const id = ytId(urlInput.value.trim());
    if (!id) { status.textContent = "couldn't find a video id in that url"; return; }
    stopStream();
    stage.innerHTML = '';
    stage.append(el('iframe.media__frame', {
      src: `https://www.youtube.com/embed/${id}`,
      allow: 'accelerometer; encrypted-media; picture-in-picture',
      allowfullscreen: 'true',
    }));
    status.textContent = 'embedded';
  }

  function stopStream() {
    if (recorder && recorder.state !== 'inactive') recorder.stop();
    stream?.getTracks().forEach(t => t.stop());
    stream = null;
  }

  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      status.textContent = 'camera not available in this browser';
      return;
    }
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stage.innerHTML = '';
      const video = el('video.media__frame', {
        autoplay: true, muted: true, playsinline: true,
      });
      video.srcObject = stream;
      stage.append(video);
      status.textContent = 'camera live — record when ready';
    } catch (err) {
      status.textContent = 'camera denied: ' + err.message;
    }
  }

  function toggleRecord(btn) {
    if (!stream) { status.textContent = 'start the camera first'; return; }
    if (recorder && recorder.state === 'recording') {
      recorder.stop();
      btn.textContent = 'Record';
      return;
    }
    chunks = [];
    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = e => e.data.size && chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      stage.innerHTML = '';
      stage.append(el('video.media__frame', { src: url, controls: true }));
      status.append(' · ', el('a', { href: url, download: 'recording.webm' }, 'download'));
    };
    recorder.start();
    btn.textContent = 'Stop';
    status.textContent = '● recording';
  }

  const recordBtn = button('Record', () => toggleRecord(recordBtn));

  root.append(
    stage,
    el('div.media__url', urlInput, button('Embed', showEmbed)),
    el('div.btnrow',
      button('Camera', startCamera),
      recordBtn,
      button('Stop cam', () => { stopStream(); status.textContent = 'stopped'; }, 'ghost')),
    status,
  );

  return () => stopStream();
});

register('picture', 'Picture', 'SYS', (root) => {
  let stream = null;
  const stage = el('div.media');
  const status = el('p.tip', 'start the camera, then snap a photo');
  const canvas = el('canvas', { style: { display: 'none' } });

  function stopStream() {
    stream?.getTracks().forEach(t => t.stop());
    stream = null;
  }

  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      status.textContent = 'camera not available in this browser';
      return;
    }
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stage.innerHTML = '';
      const video = el('video.media__frame', {
        autoplay: true, muted: true, playsinline: true,
      });
      video.srcObject = stream;
      stage.append(video);
      status.textContent = 'camera live';
    } catch (err) {
      status.textContent = 'camera denied: ' + err.message;
    }
  }

  function snap() {
    const video = stage.querySelector('video');
    if (!video) { status.textContent = 'start the camera first'; return; }
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    const data = canvas.toDataURL('image/png');
    stopStream();
    stage.innerHTML = '';
    stage.append(el('img.media__frame', { src: data, alt: 'photo' }));
    status.innerHTML = '';
    status.append('captured · ',
      el('a', { href: data, download: 'photo.png' }, 'download'));
    sfx.blip();
  }

  root.append(
    stage, canvas,
    el('div.btnrow',
      button('Camera', startCamera),
      button('Snap', snap),
      button('Stop cam', () => { stopStream(); status.textContent = 'stopped'; }, 'ghost')),
    status,
  );

  return () => stopStream();
});

// Stamp the MODULE_NN tags in catalogue order so they stay sequential even
// if the list above gets reordered.
modules.forEach((m, i) => { m.tag = 'MODULE_' + pad2(i + 1); });

export const REGISTRY = modules;
export const findModule = id => modules.find(m => m.id === id);
