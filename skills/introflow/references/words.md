# Reading the project and writing the words

## Contents

- Finding every window and every feature
- Where the facts live
- What each page needs
- Facts and guesses
- When the files are thin
- Showing the draft
- Writing for an outside reader

## Finding every window and every feature

For a full description or a book, the list must be complete. A window you did not find is a window the
reader never learns about. Look in more than one place, because each misses things:

| Where | What it gives you |
|---|---|
| The app's own navigation: its menu, dock, tabs, sidebar | The main windows, and how the app groups them (your parts) |
| The routes, screens or windows in the code (a router file, a `screens/` or `windows/` folder) | Windows that no menu shows: a detail page, a form, a settings panel, a first-run screen |
| Dialogs, pop-ups, sheets and wizards | Small windows that are easy to miss and often hold a whole feature |
| `docs/app-flow/app-flow.md`, the README, the changelog, the scope | Features by name, and what each was built to do |
| The settings window | Features that are switches: languages, backup, notifications, themes |
| What the app prints or exports | Reports, labels, PDFs, backups: each is a feature a reader cares about |

Then, before writing:

- **Count and group.** Write the list as parts, windows and features, and say the three numbers.
- **Show the owner and wait.** They know what you missed. They also decide what is left out.
- **A window is a place the user can be.** A feature is something the app does: it may live in one window
  (write it under that window with `feature:`) or across the whole app (write it in `## features`).
- **Small windows count.** A pop-up or a settings panel gets its own numbered entry, with a short
  description. It is the owner, not you, who may say "leave the small ones out".
- **Do not pad.** A window with little to it gets a line or two. The page gives it a larger picture instead.

## Where the facts live

Read in this order and stop when a page is answered. Read only; change nothing.

| What you need | Where it usually is |
|---|---|
| What the project is | `README.md` (its first lines), `docs/scope.md`, an "about" line in `docs/app-flow/app-flow.md` |
| Who it is for | `docs/scope.md` ("who it is for"), the README, a product brief |
| What it does, screen by screen | `docs/app-flow/app-flow.md` and its screenshots, the app's routes or windows |
| The facts (device, network, languages) | scope, README, the build notes |
| Colours | `DESIGN.md`, the app's theme file, or the screens themselves |
| Why it was built | sometimes a decision record or the first lines of the scope; often nowhere |

Do not read private or unrelated folders to find more. What this list does not answer, the owner answers.

## What each page needs

| Page | Lines | What a good line says |
|---|---|---|
| Cover: `about` | 2 or 3 sentences | What it is, for whom, and the one thing they do with it. |
| `## facts` | up to 3 | Hard facts a reader checks first: device, network, languages, price, input. |
| `## introduction` | a few paragraphs | What the project is, the situation it was made for, what this document covers. Not in a simple introduction. |
| `## who` | 1 to 4 (2 to 4 read best) | For whom · where it runs · why it was built. |
| `## what` | every window (2 to 4 in a simple introduction) | Each window: its name, one line of what it is for, then what the user sees and does there, and its own features. |
| `## features` | every feature of the whole app | Its name and what it does for the person using it. Left out of a simple introduction. |
| `## different` | 1 to 8 (2 to 4 in a simple introduction) | What a reader would not expect, in plain words. Not a feature list. |
| `## conclusion` | a few paragraphs | What the project does well, who it suits, where it stands today. No new facts, no promises about the future unless the files make them. Not in a simple introduction. |

**Steps or windows?** If the screens follow one another (first this, then that), set `order: steps`: they
are numbered, and each may carry a short tag such as "Before the exercise". If they are separate places in
the app, set `order: windows`: no numbers. Numbers must tell the truth.

**The main screen** (`main:`) is the one that shows the app at its best. It stands in the middle of the
cover and beside "who it is for".

**How much to write for one window.** One line always. Then only what is true and useful: a paragraph or
two on what the window is and why it matters (`more:`), what the user sees, what they do, and the features
that live there. For **a book**, write more of the same, never filler: how the parts of the window work
together, what happens in the unusual cases, why it was made this way if the files say so.

## Facts and guesses

- Written in the project's files, or plainly visible on a screen → a fact: `- Label: text`.
- Worked out by you from clues → a guess: `? Label: text`.
- Not in the files and not something you can work out → leave it out, and ask.

"Why it was built" and "what makes it different" are almost always guesses: you can see what the app does,
but not what the owner lived through or what people use instead. Draft them anyway, so the owner has
something to correct.

## When the files are thin

Say it plainly, before the draft: *"This project's files do not say who it is for."* Then ask that one
thing. A thin project gets a shorter introduction (two lines on a page is allowed), never an invented one.

## Showing the draft

Show words only, in the chat, grouped by page; for a long description, one part at a time. Mark guesses so
they cannot be missed:

> **Who it is for, and why**
> - For whom: The walk leader of a small club: the person who chooses the route and brings everyone back.
> - Where it runs: On one Android tablet, with maps saved on it, so it works where there is no signal.
> - Why it was built: Because paper maps and group chats do not show who is coming and when to turn back. **← my guess, is it right?**

Ask one thing at the end: *"Are the words right, especially the lines marked as my guess?"*

## Writing for an outside reader

- The reader has never seen the project. Use the words on the app's own screens, not the code's.
- Short sentences. One idea in a line. No "seamless", "powerful", "cutting-edge".
- Say what it does, not what it is built with.
- If the owner says some words must not be used for outside readers, follow that everywhere.
