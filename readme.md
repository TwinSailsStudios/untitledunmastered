# untitled_unmastered //
## we all will be untitled, never to be mastered.
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/77aa486e-5d32-4ec6-b90b-3d394a285e6d" />

### I built untitled_unmastered as a raw, minimalist task planner focused entirely on customizability. It's loosely inspired by Kendrick Lamar's album, Untitled Unmastered, mostly because this project started as a collection of scrapped ideas merged into one.

The whole site is built around modules. You can add, drag, drop, and tweak these modules to build a workspace that perfectly fits your workflow. Once you're happy with your setup, you can save it as a schematic and start a fresh canvas.

You can build and save schematics for practically anything. I'm not always the best at explaining it, so if you're interested, definitely check out the live site and play around with it!

FUN FACT:
untitled_unmastered was originally going to be called Corkboard, inspired by those classic 90s physical corkboard planners. (iykyk)

### HOW AI WAS USED IN THIS PROJECT:
Because this was my very first CSS and JavaScript project, AI was a lifesaver for some heavy debugging. It helped me out a ton with the embed modules (Picture & Video), as well as dialing in the sound effects and the shaking animations during edit mode. 

It also generated the credits module and the tip calculator (which honestly took me about an hour just to get a working prototype going 😭). I used GitHub Copilot to help write clean commit messages, and AI helped with some of the site design. 

If I had to break it down, this project is about 70% me and 30% AI. Some of the module ideas were brainstormed with AI but coded by me. I want to eventually rebuild this without using AI as a crutch, so I'll probably remaster this in the future.

## Live: https://twinsailsstudios.github.io/untitledunmastered/

### How it works
The workspace starts as a blank canvas. It's up to you to compose your own command center.

Clicking + ADD MODULE opens the Module Library. There are currently 102 instruments and modules in there. You can filter them by group (FLOW, TIME, LEDGER, GRIND, DEV, LOG, SYS) or just search by name.

You can drag tiles by the title bar to move them around. The grid auto-adjusts, and your custom layout saves automatically.

Hitting EDIT puts you in edit mode (who woulda guessed). The tiles wiggle Apple-style and show an X so you can easily delete them.

Use the resize buttons on each tile to make them 1-3 columns wide or stretch them taller. Both of these settings save per module.

Not to brag, but there are some UI sound effects! This part was mostly handled by AI. I'll probably update it later with richer sound design, and maybe even add some lo-fi beats for the Pomodoro and other focus timers.

The paintbrush icon lets you recolor individual modules (background, main, accent) without messing with your global theme. There's also a quick reset button if you mess it up.

Schematics let you save your current layout and data under a custom name, clear the board, and load it all back up later. It's perfect for saving a specific workspace you're done with without losing your progress.

SWAP flips the view between Logic (text-heavy) and Assembly (open layout).

For themes, there are 19 presets (B&W, Paper, Blueprint, Amber CRT, Terminal, etc.) plus a custom 3-color builder to make it your own.

The oscilloscope at the bottom actually reacts to your typing and to any active timers (like the Pomodoro or Metronome). lwky tuff ngl.

Everything from your layout and order to sizes and colors securely persists in your browser's localStorage. Nothing ever leaves your browser except for the optional GitHub fetch in the Paper Trail module.

## WHAT EACH MODULE DOES: 
(best way to see is to just use the site and find out)

### TIME
* Stopwatch: A basic start, stop, and lap timer that keeps a log of your laps.
* Countdown: Set the minutes and it flashes when the time is up.
* World Clock: Live times for UTC, NY, London, and Tokyo.
* Time Since: Tracks exactly how much time has passed since a specific date.
* Days Until: Counts down the whole days left until a target date.
* Age Calculator: Finds your exact age down to the hour.
* Alarm At: Triggers a visual alert at a specific clock time.
* Lap Average: Tap out laps to see your current and running average.

### FLOW
* Fire & Ice Pomodoro: Set your work (Fire) time, and it automatically calculates a rest (Ice) period and flips between them.
* Metronome: Adjustable BPM with a visual pulse that links to the heartbeat.
* Breathing Guide: A 4-second box-breathing visual ring to help you chill.
* BPM Tapper: Tap along to a beat to find its tempo.
* Interval Trainer: Set up repeating work and rest timers with phase tags.
* Work Sessions: A simple punch-in and punch-out clock that logs your sessions.
* Tabata Timer: Classic 20-seconds-on, 10-seconds-off rounds with a counter.
* Chess Clock: Tap to pass the turn between two countdown timers.
* Break Reminder: Tells you to stand up and stretch every few minutes.

### LEDGER
* Universal Money Jar: Enter your hourly rate and goal, then watch your cash stack up live as you work.
* Tip & Split: Calculates the tip and splits the bill evenly across your group.
* Unit Converter: Swap between km/mi, kg/lb, C/F, and cm/in.
* Percentage: Quick math for finding percentages and ratios.
* Rate Card: Save a list of different gigs and what you charge for them hourly.
* Earnings Ticker: Clock in and see your money go up in real time.
* Budget Jar: A basic plus/minus ledger for tracking your cash.
* Work Hours: Subtracts your breaks to give you exact hours worked.
* Compound Interest: Plug in your principal, rate, and time to see future value.
* Loan / EMI: Figure out monthly payments and total costs for loans.
* Savings Goal: Track how close you are to a savings target with a progress bar.
* Markup / Margin: Put in cost and price to get your profit margins.
* Hourly to Salary: Converts your hourly wage into weekly, monthly, and yearly pay.
* Break-even: Figure out how many units you need to sell to cover fixed costs.
* ROI: Calculate your return on investment percentage.
* Invoice Lines: Add up quantities and prices for a running total.
* Split Tab: Keeps track of who owes who money.
* Net from Gross: Subtracts a flat tax percentage to show your take-home pay.

### GRIND
* Grit Streak: Fills up a cell for every day you're active to track your consecutive streak.
* Habit Grid: Track multiple daily habits and their individual streaks.
* Daily Goal: A simple progress bar for a daily target.
* Tally Counter: A basic clicker to count up or down.
* Water Intake: Track your 8 glasses a day (resets automatically).
* Rep Counter: Count your reps and bank your workout sets.
* Focus Ratio: Compares focus time vs distraction time to give you a percentage.
* Pomodoro Count: Logs how many focus sessions you finished today.
* Anti-Todo: A reverse to-do list that just shows what you've already accomplished.

### DEV
* GitHub Paper Trail: Pulls recent public commits for any GitHub username.
* JSON Formatter: Pretty-prints and validates JSON code.
* JSON Minify: Squashes JSON into a single line.
* Base64: Encode or decode text quickly.
* URL Encode: Make text URL-safe or decode it.
* String Escape: Add or remove JSON escape characters.
* Hash: Generates a quick djb2 hash.
* UUID: Spits out a random v4 UUID instantly.
* Regex Tester: Test regular expressions against text and see live matches.
* Char Count: Counts characters, words, and lines.
* Case Converter: Swap text between uppercase, lowercase, snake_case, and Title Case.
* Lorem: Generate placeholder text easily.
* Color to Mono: Turns a color hex into its grayscale equivalent.
* Snippet Vault: Save code snippets and copy them with one click.
* Markdown Scratch: A mini live-preview editor for Markdown.
* Markdown Table: Turns CSV data into a formatted Markdown table.
* Line Diff: Compares two blocks of text line-by-line.
* Number Base: Convert numbers between decimal, binary, octal, and hex.
* Epoch & Date: Swap between Unix timestamps and readable dates.
* Slugify: Turns regular text into a URL-friendly slug.
* HTML Entities: Safely escape or unescape HTML tags.
* Query String: Turns URL parameters into readable pairs.
* Text Reverse: Flips text backwards.
* Word Frequency: Finds the most used words in a block of text.
* Dedupe Lines: Removes duplicate lines instantly.
* Sort Lines: Sort text alphabetically or by line length.
* Clean Lines: Removes extra spaces and blank lines.
* HTTP Status: Look up what an HTTP status code actually means.
* MIME Lookup: Find the MIME type for a file extension.
* ASCII Table: A quick reference sheet for ASCII characters.
* CSS Box Shadow: Sliders that generate CSS shadow code with a live preview.
* Cubic Bezier: Tweak a curve to get the exact CSS bezier values.
* CSV to JSON: Converts spreadsheet data into a JSON array.
* JWT Decode: Peeks inside a JSON Web Token payload.

### LOG
* Socratic Journal: A time-stamped journal under a rotating philosophy quote.
* Quick Notepad: A simple scratchpad that autosaves.
* Scratch Canvas: A black and white drawing pad for quick doodles.
* Checklist: A basic to-do list you can check off.
* Kanban-lite: A mini board to move tasks from To Do, to WIP, to Done.
* Decision Matrix: Score different options to see which one ranks highest.
* Bookmark Rail: Save links that open in a new tab.
* Socratic Quote: Generates a random philosophical quote.
* Mood Log: Track how you're feeling on a 5-level scale with history.
* Gratitude 3: Write down three things you're grateful for every day.
* Win of the Day: Log one big victory, which also counts toward your grit streak.
* Reading List: Keep track of books you want to read or have finished.
* Idea Inbox: A quick place to dump random ideas.
* Eisenhower Matrix: Sort tasks by urgency and importance.
* Random Picker: Pick a random item from a list, flip a coin, or roll a die.

### SYS
* Raw Diagnostics: Shows uptime, typing speed, and mouse coordinates.
* Project Gauntlet: A progress bar for your project timeline based on start and end dates.
* Tech Asset Vault: A small gallery for images with a hover reveal.
* System Info: Shows your browser, screen size, and OS details.
* Keyboard Tester: Shows the exact keycode and modifiers for any button you press.
* Video: Embed a YouTube link or record a quick clip from your webcam.
* Picture: Snap a quick photo with your webcam.
* Credits: Tells you who made the site.
* Manifesto: The core philosophy behind the project.

```text
Structure
index.html         # shell: masthead, empty state, grid, modals
css/blueprint.css  # tokens, grid/tiles, jiggle, sizing, motion
js/util.js         # element builder el(), scoped store, pub/sub bus
js/registry.js     # the 102 self-contained module factories
js/sfx.js          # synthesized Web Audio sound effects
js/themes.js       # preset table + custom 3-color theme builder
js/workspace.js    # grid, add/remove, drag, sizing, paint, schematics
js/main.js         # bootstrap: theme, workmode, osci, credits, workspace
