untitled_unmastered //
we all will be untitled, never to be mastered.

untitled_unmastered is a raw, minimalist task planner built entirely around customizability. It's loosely inspired by Kendrick Lamar's album, Untitled Unmastered.

The core concept of the site is "modules." You can add, drag, drop, and tweak these modules to build a workspace that perfectly fits your workflow. Once you're happy with your setup, you can save it as a "schematic" and start a fresh one.

You can build and save schematics for practically anything. I'm not always the best at explaining it, so if you're interested, definitely check out the live site and play around with it!

FUN FACT:

untitled_unmastered was originally going to be called Corkboard, inspired by those classic 90s physical corkboard planners. (iykyk)

HOW AI WAS USED IN THIS PROJECT:

Because this was my very first CSS and JavaScript project, AI was a lifesaver for some heavy debugging.
It helped me out a ton with the embed modules (Picture & Video), as well as dialing in the sound effects and the shaking animations during edit mode.
It also generated the credits module and the tip calculator (which honestly took me about an hour just to get a working prototype going 😭).
I also used GitHub's built-in Copilot to help write clean commit messages.
If I had to break it down, this project is about 70% me and 30% AI.

Live: https://twinsailsstudios.github.io/untitledunmastered/

How it works
The workspace starts as a blank canvas. It's up to you to compose your own command center.

+ ADD MODULE opens the Module Library. There are currently 102 instruments/modules,
filterable by group chips (FLOW · TIME · LEDGER · GRIND · DEV · LOG ·
SYS) and searchable by name.

Drag a tile by its title bar to reorder it within the grid —
a placeholder holds the slot and the grid reflows; your custom order is always saved.

EDIT enters jiggle mode — tiles wiggle and show a ✕ so you can quickly remove them.

↔ / ↕ buttons on each tile resize it: width spans 1–3 grid
columns, while the height grows the body. Both settings persist per module.

Not to brag, but there are some UI sound effects! This part was mostly handled by AI. I'll probably update it later with richer sound design, and maybe even add some lo-fi beats for the Pomodoro and other focus timers.

✦ paintbrush on each tile recolours just that module
(background / main / accent), totally independent of the global theme, complete with a
clean reset button.

Schematics — save your whole grid and every module's internal data under a custom
name, clear the canvas, and load it all back later untouched. It's perfect for
parking a set of modules you're done with without losing your progress.

SWAP toggles between Logic (dense text) ↔ Assembly (open layout).

THEME — 19 presets (B&W = white-on-black default, Paper =
black-on-white, plus Blueprint, Amber CRT, Terminal, Crimson, Cobalt,
Graphite, Sand, Vapor, Oceanic, Forest, Rose, Solar, Ultraviolet, Mint,
Rust, Ice, Noir) and a custom 3-colour builder to make it your own.

Osci-Sync — the bottom oscilloscope pulses to your keystrokes and any
module heartbeat (Pomodoro / Metronome / Tabata / Interval).

Layout, order, sizes, per-tile colours, and every module's state securely persist
in your browser's localStorage. Nothing ever leaves the browser except for the optional public
GitHub fetch in the Paper Trail module.

The 102 modules — what each one does
TIME
Stopwatch — start/stop/lap timer with a running lap log.

Countdown — set the minutes, watch it count down, and it flashes at zero.

World Clock — live time across UTC, NY, London, and Tokyo.

Time Since — elapsed time since a chosen date/time.

Days Until — whole days remaining until a target date.

Age Calculator — exact age in years / days / hours from a given birthdate.

Alarm At — fires a visual alert at a specific clock time.

Lap Average — tap your laps, and it shows the last and running average.

FLOW
Fire & Ice Pomodoro — set Fire (work) minutes; Ice (recovery)
auto-derives at a 1:2 ratio and the cycle auto-flips for you.

Metronome — adjustable BPM with a visual pulse + heartbeat.

Breathing Guide — a calming box-breathing ring, 4s per phase.

BPM Tapper — tap out a beat, and it reads back the tempo.

Interval Trainer — repeating work/rest seconds with phase tagging.

Work Sessions — clock in/out; neatly logs each session's duration.

Tabata Timer — 20/10-style rounds with work/rest and a round counter.

Chess Clock — two-sided countdown; tap to pass the turn.

Break Reminder — a friendly nudge to stand up every N minutes.

LEDGER
Universal Money Jar — rate × goal × logged hours → live earned cash and a
forecast with a progress bar.

Tip & Split — bill + tip % across N people, showing the total and per-head cost.

Unit Converter — km/mi, kg/lb, °C/°F, cm/in.

Percentage — "x% of y" and ratio percentages.

Rate Card — saved list of events and their respective hourly rates.

Earnings Ticker — clock in and watch your money accrue live.

Budget Jar — a running ± ledger with your net total.

Work Hours — in/out time minus break → exact hours worked.

Compound Interest — principal/rate/years → your future value.

Loan / EMI — amount/rate/months → monthly payment and total cost.

Savings Goal — target goal vs. saved, showing the % and amount remaining.

Markup / Margin — cost & price → markup %, margin %, and pure profit.

Hourly → Salary — rate × hours → breaks down your week / month / year.

Break-even — fixed cost ÷ unit margin → break-even units required.

ROI — invested vs. returned → ROI % and your net gain.

Invoice Lines — qty × price line items with a running total.

Split Tab — tracks who paid what → perfectly calculates who owes / is owed.

Net from Gross — gross minus a flat tax % → your take-home net and tax paid.

GRIND
Grit Streak — heartbeat cells that fill per active day; tracks your
consecutive streak.

Habit Grid — tracks multiple habits with a daily toggle and per-habit streak.

Daily Goal — simple counter against a target with a progress bar.

Tally Counter — your standard increment/decrement clicker.

Water Intake — tracks eight glasses a day, resetting daily.

Rep Counter — count your reps, bank your sets.

Focus Ratio — focus vs. distraction minutes → your total % focused.

Pomodoro Count — how many pomodoros you crushed today.

Anti-Todo — a satisfying log of what you've already finished.

DEV
GitHub Paper Trail — recent public push commits for any handle
(falls back to a labelled sample if you're offline).

JSON Formatter — beautifully pretty-print / validate JSON.

JSON Minify — collapse your JSON down to a single line.

Base64 — quickly encode / decode text.

URL Encode — encode / decode URI components.

String Escape — JSON-escape / unescape any string.

Hash — quick djb2 hash of your input.

UUID — instantly generate a v4 UUID.

Regex Tester — pattern + flags against a test string, showing live matches.

Char Count — tracks chars / words / lines.

Case Converter — swap between UPPER / lower / snake / Title case.

Lorem — generate N words of placeholder text.

Color → Mono — calculates the luminance of a picked colour as a grey hex.

Snippet Vault — save your snippets, click to copy them.

Markdown Scratch — a live, tiny-Markdown previewer.

Markdown Table — converts CSV rows → a clean Markdown table.

Line Diff — line-by-line comparison of two text blocks.

Number Base — decimal → bin / oct / hex conversion.

Epoch ↔ Date — swap between Unix seconds ↔ ISO date.

Slugify — text → perfectly url-safe slug.

HTML Entities — escape / unescape HTML safely.

Query String — parse ?a=1&b=2 into readable pairs.

Text Reverse — flip your chars / words / lines backward.

Word Frequency — finds the top word counts in pasted text.

Dedupe Lines — quickly drop duplicate lines.

Sort Lines — sort A→Z, Z→A, or by line length.

Clean Lines — trim spaces and drop blank lines.

HTTP Status — lookup an HTTP code → get its meaning.

MIME Lookup — file extension → its standard MIME type.

ASCII Table — a handy printable ASCII reference.

CSS Box Shadow — use sliders → get a box-shadow value + live preview.

Cubic Bezier — tweak four control points → get your cubic-bezier().

CSV → JSON — header row + rows → nicely formatted JSON array.

JWT Decode — safely decode a JWT's header and payload.

LOG
Socratic Journal — a timestamped log nested under a rotating philosopher's
quote.

Quick Notepad — a single, reliable autosaving scratch pad.

Scratch Canvas — freehand B&W sketch pad for quick doodles.

Checklist — easily add / tick / remove your tasks.

Kanban-lite — TODO → WIP → DONE, just click a card to advance it.

Decision Matrix — scored options, automatically sorted high to low.

Bookmark Rail — labelled links that pop open in a new tab.

Socratic Quote — rolls a random, thought-provoking philosopher line.

Mood Log — a five-level mood tracker with a timestamped history.

Gratitude 3 — log three things you're grateful for, kept day-by-day.

Win of the Day — log a daily victory (counts towards your grit).

Reading List — track your books with a simple read/unread toggle.

Idea Inbox — fast capture for raw, unfiltered ideas.

Eisenhower Matrix — categorize into DO / PLAN / DELEGATE / DROP quadrants.

Random Picker — pick randomly from a list, flip a coin, or roll a D6.

SYS
Raw Diagnostics — displays your uptime, keystroke velocity, and drifting coordinates.

Project Gauntlet — start/end dates → a live % progress bar of your timeline.

Tech Asset Vault — a tagged image gallery (desaturated, with a neat hover-reveal).

System Info — view your cores, language, screen, viewport, platform, and online status.

Keyboard Tester — shows the key, code, and active modifiers for any keypress.

Video — embed a YouTube URL, or record straight from your camera and
download the clip.

Picture — snap a photo from your webcam and download it immediately.

Credits — a rundown of what this project is and who made it.

Manifesto — the unmastered creed.

Structure
index.html         # shell: masthead, empty state, grid, modals
css/blueprint.css  # tokens, grid/tiles, jiggle, sizing, motion
js/util.js         # element builder el(), scoped store, pub/sub bus
js/registry.js     # the 102 self-contained module factories
js/sfx.js          # synthesised Web Audio sound effects
js/themes.js       # preset table + custom 3-colour theme builder
js/workspace.js    # grid, add/remove, drag, sizing, paint, schematics
js/main.js         # bootstrap: theme, workmode, osci, credits, workspace
(P.S. This project was originally built for Flavortown!)
