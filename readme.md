#untitled_unmastered //
we all will be untitled, never to be mastered.

A raw, industrial Engineering Command Center. A blank canvas featuring 102 modular instruments, a drag-to-arrange grid, synthesized audio feedback, per-module recoloring, and saveable workspace schematics. It uses a clean, schematic "blueprint" aesthetic with thin 1px lines, monospace text, and zero UI clutter.

Built entirely with pure, vanilla HTML5, CSS3, and ES-module JavaScript. No build steps, no dependencies, no backend, and absolutely no tracking.

Live Demo: https://twinsailsstudios.github.io/untitled_unmastered-/

How it works
The workspace starts completely empty so you can build your own custom setup from scratch.

+ ADD MODULE opens the Module Library—102 different tools, filterable by group chips (FLOW · TIME · LEDGER · GRIND · DEV · LOG · SYS) and searchable by name.

Drag to Rearrange: Click and drag a tile by its title bar to reorder it within the grid. A placeholder holds the slot while the grid reflows, and your layout saves instantly.

EDIT Mode: Puts the workspace into "jiggle mode"—tiles wiggle and show an ✕ so you can quickly delete them.

Modular Resizing (↔ / ↕): Use the buttons on any tile to change its footprint. Width spans 1–3 grid columns, and height scales the body. Both dimensions persist automatically per module.

Synthesized Audio (♪): Built-in synthesized sound effects for every button click, module heartbeat (like the Pomodoro or Metronome), countdowns, and alarms. You can toggle this on or off instantly in the masthead.

Per-Tile Paintbrush (✦): Click the paintbrush icon on a tile to recolor just that specific module (background, main text, and accent colors). It overrides the global theme independently and includes a quick reset button.

Schematics System: Save your entire current grid layout and the internal data of every single module under a custom name. Clear the canvas for a fresh setup, and reload your saved configurations later without losing anything. Perfect for parking a set of modules you aren't using right now without wiping their data.

SWAP Layouts: Instantly toggles between Logic view (dense text) and Assembly view (open layout).

19 Theme Presets: Choose from themes like B&W (white-on-black default), Paper (black-on-white), Blueprint, Amber CRT, Terminal, Crimson, Cobalt, Mint, Rust, and more, or use the custom 3-color theme builder to make your own.

Osci-Sync: A responsive bottom oscilloscope that pulses live to your keystrokes and active module heartbeats (Pomodoro, Metronome, Tabata, or Interval).

Local Storage Sync: Your layout, module order, tile sizes, custom colors, and the internal state of every single module persist automatically in localStorage. Nothing ever leaves your browser except for the optional public GitHub profile fetch in the Paper Trail module.

The 102 modules — what each one does
TIME
Stopwatch — Standard precision timer with start, stop, lap functionality, and a dedicated lap log.

Countdown — Set custom minutes; counts down and flashes aggressively at zero.

World Clock — Live synchronized time across UTC, New York, London, and Tokyo.

Time Since — Tracks the exact elapsed time since a specific date and time.

Days Until — Displays the total whole days remaining before a target deadline.

Age Calculator — Breaks down your exact age in years, days, and hours from a birthdate.

Alarm At — Triggers a visual alert when your local clock hits a set time.

Lap Average — Tap to log laps and instantly see your last lap alongside a running average.

FLOW
Fire & Ice Pomodoro — Set your Fire (work) minutes; Ice (recovery) auto-calculates at a 1:2 ratio, and the cycle automatically flips between states.

Metronome — Adjustable BPM generator with a synchronized visual pulse and audio heartbeat.

Breathing Guide — A responsive box-breathing ring locked to a 4-second pace per phase.

BPM Tapper — Tap a beat manually to read back the active tempo.

Interval Trainer — Looping work and rest intervals with a live phase tagger.

Work Sessions — Clock in and out to maintain a clean log of your exact session durations.

Tabata Timer — High-intensity 20/10-style rounds tracking work, rest, and round counts.

Chess Clock — A two-sided countdown timer; tap your side to pass the turn to the opponent.

Break Reminder — Background monitor that nudges you to stand up every N minutes.

LEDGER
Universal Money Jar — Input your rate, goal, and logged hours to get live calculations of earnings and forecasts with a progress bar.

Tip & Split — Calculates a bill total plus tip percentage across N people, breaking down the total and cost per head.

Unit Converter — Quick conversions for distance (km/mi), weight (kg/lb), temp (°C/°F), and length (cm/in).

Percentage — Solves "x% of y" queries and structural ratio percentages.

Rate Card — A saved references list of your standard events and their corresponding hourly rates.

Earnings Ticker — Clock in to watch your earnings accrue live down to the second.

Budget Jar — A simple, running positive/negative ledger that tallies your net total.

Work Hours — Input your check-in and check-out times, subtract breaks, and output total hours worked.

Compound Interest — Principal, rate, and years calculation to find your future investment value.

Loan / EMI — Input loan amount, interest rate, and months to output your exact monthly payment and total cost.

Savings Goal — Tracks your financial progress against a set target, showing percentages and amount remaining.

Markup / Margin — Input wholesale cost and retail price to output markup %, margin %, and net profit.

Hourly → Salary — Translates an hourly rate into estimated weekly, monthly, and yearly salaries based on standard hours.

Break-even — Fixed costs divided by unit margin to calculate your exact break-even point in units.

ROI — Compares invested capital vs returns to output a net profit and clean ROI %.

Invoice Lines — Quantity × price line-item generator with an active running total.

Split Tab — Records who paid what on a group trip or dinner, calculating exactly who owes who.

Net from Gross — Deducts a flat tax percentage from gross income to output net pay and total tax withheld.

GRIND
Grit Streak — Heartbeat cells that fill in for every active day to track your consecutive daily streak.

Habit Grid — Monitor multiple daily habits simultaneously with individual streak counters.

Daily Goal — A simple counter measured against a daily target with a tracking progress bar.

Tally Counter — A plain, distraction-free increment and decrement clicker.

Water Intake — Tracks 8 glasses of water a day with a daily manual reset.

Rep Counter — Count individual workout reps and bank your completed sets.

Focus Ratio — Compares active focus minutes against distraction minutes to give you an absolute focus percentage.

Pomodoro Count — Tracks the total number of complete Pomodoro blocks finished today.

Anti-Todo — A running retrospective log of tasks you have already knocked out.

DEV
GitHub Paper Trail — Fetches recent public commits for any valid GitHub handle (falls back to an offline sample if disconnected).

JSON Formatter — Validates and pretty-prints raw JSON strings with proper indentation.

JSON Minify — Strips whitespace to compress a JSON block down into a single line.

Base64 — Quick tool to encode or decode text strings.

URL Encode — Encodes or decodes URI components safely.

String Escape — Escapes or unescapes strings specifically for JSON compliance.

Hash — Generates a rapid djb2 hash of any text input.

UUID — Generates a standard v4 unique identifier string.

Regex Tester — Evaluates regex patterns and flags against a test string with live match highlighting.

Char Count — Instantly counts total characters, words, and lines.

Case Converter — Converts text blocks between UPPER, lower, snake_case, and Title Case.

Lorem — Generates N words of standard placeholder text.

Color → Mono — Calculates the luminance of any picked hex color and outputs it as a gray hex.

Snippet Vault — A central repository for saved code snippets; click any entry to copy it to your clipboard.

Markdown Scratch — A minimal text pad providing a live preview of small Markdown blocks.

Markdown Table — Convert raw CSV rows into a properly formatted Markdown structural table.

Line Diff — Runs a line-by-line structural diff comparison between two text blocks.

Number Base — Converts decimal inputs directly into binary, octal, and hexadecimal.

Epoch ↔ Date — Converts Unix epoch seconds to ISO dates and vice versa.

Slugify — Converts standard text strings into URL-safe, lowercase slugs.

HTML Entities — Escapes and unescapes raw HTML characters.

Query String — Parses complex query strings like ?a=1&b=2 into clean key-value pairs.

Text Reverse — Reverses the order of characters, words, or full lines.

Word Frequency — Analyzes pasted text blocks to output the highest-repeating word counts.

Dedupe Lines — Strips out all duplicate lines from a pasted text block.

Sort Lines — Sorts text lines alphabetically (A→Z, Z→A) or sorted by character length.

Clean Lines — Trims trailing whitespace and drops empty lines from a text block.

HTTP Status — Input a status code to look up its official semantic meaning.

MIME Lookup — Input a file extension to find its matching MIME type string.

ASCII Table — A clean reference sheet for all printable ASCII characters.

CSS Box Shadow — Tweak sliders to generate clean box-shadow CSS rules with a live visual preview.

Cubic Bezier — Adjust four control points to output a valid cubic-bezier() CSS timing function.

CSV → JSON — Parses a header row + rows into a formatted JSON array.

JWT Decode — Decodes and prints the header and payload objects of a standard JSON Web Token.

LOG
Socratic Journal — A timestamped logging system that rotates random philosopher quotes as you write.

Quick Notepad — A distraction-free, single-pane scratchpad that autosaves your inputs.

Scratch Canvas — A minimal, freehand black-and-white digital sketchpad.

Checklist — A straightforward tool to quickly add, check off, or delete tasks.

Kanban-lite — A basic TODO → WIP → DONE project board; click a card to advance it to the next column.

Decision Matrix — Input options and score them across variables; sorts automatically from high to low.

Bookmark Rail — A simple dock for labeled hyperlinks that open directly in a new browser tab.

Socratic Quote — Rolls a completely random philosopher line on command.

Mood Log — A 5-level mood tracker that charts your mental state in a timestamped history.

Gratitude 3 — A daily logs module to record three specific things you're grateful for.

Win of the Day — Log one primary daily victory (directly hooks into your grit tracking).

Reading List — Keep a digital catalog of your books with a quick read/unread state toggle.

Idea Inbox — A high-speed capture pad designed for dropping raw ideas before they vanish.

Eisenhower Matrix — Sorts your tasks into four classic quadrants: DO, PLAN, DELEGATE, or DROP.

Random Picker — Quick choice generator featuring a list picker, random coin flipper, or standard D6 dice roller.

SYS
Raw Diagnostics — Live technical readouts showing application uptime, typing velocity, and shifting coordinate matrices.

Project Gauntlet — Input project start and target deadlines to display a live, ticking % progress bar.

Tech Asset Vault — A tagged image gallery displayed in a desaturated, hover-to-reveal aesthetic.

System Info — Reads hardware cores, browser language, screen resolution, active viewport dimensions, platform architecture, and online status.

Keyboard Tester — Captures any keypress to output the exact key string, underlying code, and active modifiers.

Video — Embed any public YouTube stream URL, or record raw clips directly from your connected camera to download locally.

Picture — Take photos directly from your web camera and download the snapshots instantly.

Credits — Underlying technical attributions and project authorship.

Manifesto — The official, unmastered creative creed.

Running it
Because this project is a purely static site, it runs out of the box. To run it locally or host it:

Bash
# Locally (ES modules require a local HTTP server context, not file://)
python3 -m http.server 8080   # then open http://localhost:8080
The live project is hosted on GitHub Pages deployed directly from main (using the repository root, with a .nojekyll file included to bypass processing). Pushing any update to main redeploys the site live in roughly one minute. Because there is no build step, it can be deployed on any static provider (Netlify, Vercel, or Cloudflare Pages) simply by pointing the provider to the repository root with no build commands required.

Project Structure
index.html          # Core application shell: masthead, empty states, grid container, modals
css/blueprint.css   # System tokens, layout grids, jiggle animation configurations, resizing rules
js/util.js          # Helper library: el() builder, scoped data storage controls, pub/sub event bus
js/registry.js      # Monolithic registry housing the 102 self-contained module factories
js/sfx.js           # Sound effects engine built on native Web Audio synthesis
js/themes.js        # Theme database table and the 3-color custom theme generator logic
js/workspace.js     # Workspace controller: grid reflow, module addition/deletion, drag physics, painting, schematics
js/main.js          # Application bootstrap: initial theme load, workmode states, oscilloscope wiring, initialization
All application state is kept entirely in browser localStorage under the uu_ namespace.
