# untitled_unmastered //

> we all will be untitled, never to be mastered.

untitled_unmastered is a raw, minimalist task planner built on customizability. It's loosly based off of Kendrick Lamar's album: "Untitled Unmastered".
The main gimmick of the site is modules, you can add modules, drag and drop modules, and customize everything to your liking. Once your done, save the schematic and make a new one.
You can save and load schematics for many things. I'm not too good at explaining so if your intrested, check out the site.

FUN FACT:

untitled_unmastered was supposed to be called Corkboard, based off of 90's corkboard planning. (iykyk)

HOW AI WAS USED IN THIS PROJECT:

AI was used for some heavy debugging since this is my first CSS & Javascript project.
It helped me alot with the embed modules (Picture & Video), aswell as the sound and shaking animations while editing.
It generated the credits module, as well as the tip calculator (it took me like an hour js to get a working prototype 😭)
I did also use github's built in copilot to generate commit messages.
if i had to say this is like 70% me and 30% ai.

**Live:** https://twinsailsstudios.github.io/untitledunmastered/

---

## How it works

The workspace starts **empty** — you compose your own command center.

- **`+ ADD MODULE`** opens the **Module Library** — 102 instruments,
  filterable by group chips (FLOW · TIME · LEDGER · GRIND · DEV · LOG ·
  SYS) and searchable by name.
- **Drag a tile** by its title bar to **reorder** it within the grid —
  a placeholder holds the slot and the grid reflows; order is saved.
- **`EDIT`** enters jiggle mode — tiles wiggle and show a `✕` to remove.
- **↔ / ↕** buttons on each tile resize it: width spans 1–3 grid
  columns, height grows the body. Both persist per module.
- **♪ Sound** — synthesised effects on every button, each module
  heartbeat (Pomodoro / Metronome / Tabata …), countdowns and alarms;
  toggle in the masthead.
- **✦ paintbrush** on each tile recolours just that module
  (background / main / accent), independent of the global theme, with a
  clean reset.
- **Schematics** — save the whole grid *and every module's data* under a
  name, clear the canvas, and load it back later untouched. Good for
  parking a set of modules you're done with without losing their data.
- **SWAP** toggles Logic (dense text) ↔ Assembly (open layout).
- **THEME** — 19 presets (B&W = white-on-black default, Paper =
  black-on-white, plus Blueprint, Amber CRT, Terminal, Crimson, Cobalt,
  Graphite, Sand, Vapor, Oceanic, Forest, Rose, Solar, Ultraviolet, Mint,
  Rust, Ice, Noir) and a custom 3-colour builder.
- **Osci-Sync** — the bottom oscilloscope pulses to keystrokes and any
  module heartbeat (Pomodoro / Metronome / Tabata / Interval).
- Layout, order, sizes, per-tile colour and every module's state persist
  in `localStorage`. Nothing leaves the browser except the optional public
  GitHub fetch in Paper Trail.

---

## The 102 modules — what each one does

### TIME
- **Stopwatch** — start/stop/lap timer with a lap log.
- **Countdown** — set minutes, counts down, flashes at zero.
- **World Clock** — live time across UTC, NY, London, Tokyo.
- **Time Since** — elapsed time since a chosen date/time.
- **Days Until** — whole days remaining to a target date.
- **Age Calculator** — exact age in years / days / hours from a birthdate.
- **Alarm At** — fires a visual alert at a set clock time.
- **Lap Average** — tap laps, shows last and running average.

### FLOW
- **Fire & Ice Pomodoro** — set Fire (work) minutes; Ice (recovery)
  auto-derives at the 1:2 ratio and the cycle auto-flips.
- **Metronome** — adjustable BPM with a visual pulse + heartbeat.
- **Breathing Guide** — box-breathing ring, 4s per phase.
- **BPM Tapper** — tap a beat, reads back the tempo.
- **Interval Trainer** — repeating work/rest seconds with phase tag.
- **Work Sessions** — clock in/out; logs each session's duration.
- **Tabata Timer** — 20/10-style rounds with work/rest and round count.
- **Chess Clock** — two-sided countdown; tap to pass the turn.
- **Break Reminder** — nudges you to stand up every N minutes.

### LEDGER
- **Universal Money Jar** — rate × goal × logged hours → live earned and
  forecast with a progress bar.
- **Tip & Split** — bill + tip % across N people, total and per-head.
- **Unit Converter** — km/mi, kg/lb, °C/°F, cm/in.
- **Percentage** — "x% of y" and ratio percentages.
- **Rate Card** — saved list of events and their hourly rates.
- **Earnings Ticker** — clock in and watch money accrue live.
- **Budget Jar** — running ± ledger with net total.
- **Work Hours** — in/out time minus break → hours worked.
- **Compound Interest** — principal/rate/years → future value.
- **Loan / EMI** — amount/rate/months → monthly payment and total.
- **Savings Goal** — goal vs saved, % and amount remaining.
- **Markup / Margin** — cost & price → markup %, margin %, profit.
- **Hourly → Salary** — rate × hours → week / month / year.
- **Break-even** — fixed cost ÷ unit margin → break-even units.
- **ROI** — invested vs returned → ROI % and net.
- **Invoice Lines** — qty × price line items with a running total.
- **Split Tab** — who paid what → who owes / is owed.
- **Net from Gross** — gross minus a flat tax % → net and tax.

### GRIND
- **Grit Streak** — heartbeat cells that fill per active day; counts the
  consecutive streak.
- **Habit Grid** — multiple habits, daily toggle, per-habit streak.
- **Daily Goal** — counter against a target with a progress bar.
- **Tally Counter** — plain increment/decrement counter.
- **Water Intake** — eight glasses a day, resets daily.
- **Rep Counter** — count reps, bank sets.
- **Focus Ratio** — focus vs distraction minutes → % focused.
- **Pomodoro Count** — pomodoros completed today.
- **Anti-Todo** — a log of what you *already* finished.

### DEV
- **GitHub Paper Trail** — recent public push commits for any handle
  (falls back to a labelled sample offline).
- **JSON Formatter** — pretty-print / validate JSON.
- **JSON Minify** — collapse JSON to one line.
- **Base64** — encode / decode text.
- **URL Encode** — encode / decode URI components.
- **String Escape** — JSON-escape / unescape a string.
- **Hash** — quick djb2 hash of input.
- **UUID** — generate a v4 UUID.
- **Regex Tester** — pattern + flags against a test string, live matches.
- **Char Count** — chars / words / lines.
- **Case Converter** — UPPER / lower / snake / Title.
- **Lorem** — N words of placeholder text.
- **Color → Mono** — luminance of a picked colour as a grey hex.
- **Snippet Vault** — saved snippets, click to copy.
- **Markdown Scratch** — live tiny-Markdown preview.
- **Markdown Table** — CSV rows → a Markdown table.
- **Line Diff** — line-by-line diff of two blocks.
- **Number Base** — decimal → bin / oct / hex.
- **Epoch ↔ Date** — Unix seconds ↔ ISO date.
- **Slugify** — text → url-safe slug.
- **HTML Entities** — escape / unescape HTML.
- **Query String** — parse `?a=1&b=2` into pairs.
- **Text Reverse** — reverse chars / words / lines.
- **Word Frequency** — top word counts in pasted text.
- **Dedupe Lines** — drop duplicate lines.
- **Sort Lines** — A→Z, Z→A, by length.
- **Clean Lines** — trim and drop blank lines.
- **HTTP Status** — code → meaning.
- **MIME Lookup** — file extension → MIME type.
- **ASCII Table** — printable ASCII reference.
- **CSS Box Shadow** — sliders → a `box-shadow` value + preview.
- **Cubic Bezier** — four control points → a `cubic-bezier()`.
- **CSV → JSON** — header row + rows → JSON array.
- **JWT Decode** — decode a JWT's header and payload.

### LOG
- **Socratic Journal** — timestamped log under a rotating philosopher
  quote.
- **Quick Notepad** — a single autosaving scratch pad.
- **Scratch Canvas** — freehand B&W sketch pad.
- **Checklist** — add / tick / remove tasks.
- **Kanban-lite** — TODO → WIP → DONE, click a card to advance.
- **Decision Matrix** — scored options, sorted high to low.
- **Bookmark Rail** — labelled links, opens in a new tab.
- **Socratic Quote** — rolls a random philosopher line.
- **Mood Log** — five-level mood, timestamped history.
- **Gratitude 3** — three things, kept per day.
- **Win of the Day** — log a daily win (counts as grit).
- **Reading List** — books with a read/unread toggle.
- **Idea Inbox** — fast capture for raw ideas.
- **Eisenhower Matrix** — DO / PLAN / DELEGATE / DROP quadrants.
- **Random Picker** — pick from a list, coin flip, or D6.

### SYS
- **Raw Diagnostics** — uptime, keystroke velocity, drifting coordinates.
- **Project Gauntlet** — start/end dates → a live % progress bar.
- **Tech Asset Vault** — tagged image gallery (desaturated, hover-reveal).
- **System Info** — cores, language, screen, viewport, platform, online.
- **Keyboard Tester** — shows key, code and modifiers for any keypress.
- **Video** — embed a YouTube URL, or record from your camera and
  download the clip.
- **Picture** — take a photo from your camera and download it.
- **Credits** — what this is and who made it.
- **Manifesto** — the unmastered creed.

---
## Structure

```
index.html         # shell: masthead, empty state, grid, modals
css/blueprint.css   # tokens, grid/tiles, jiggle, sizing, motion
js/util.js          # element builder el(), scoped store, pub/sub bus
js/registry.js      # the 102 self-contained module factories
js/sfx.js           # synthesised Web Audio sound effects
js/themes.js        # preset table + custom 3-colour theme builder
js/workspace.js     # grid, add/remove, drag, sizing, paint, schematics
js/main.js          # bootstrap: theme, workmode, osci, credits, workspace
```

orginally built for flavortown
