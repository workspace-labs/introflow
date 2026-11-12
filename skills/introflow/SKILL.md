---
name: introflow
description: "Use when someone needs to describe a software project to people outside it: a client, a judge, a manager, new staff, or a friend who asks \"what is this project?\". Makes a project description PDF that shows and describes every window and every feature of the project, as many pages as the project needs (a contents page, the windows grouped in parts, a page or more for each window, the features), in the app's own colours, on white paper for printing, or both. The agent reads the project and drafts every word; the owner only confirms or corrects, and may ask for a short four-page introduction or a deeper book instead. Also when asked for a project intro, a project overview, a product description, a one-pager about an app, or to update one. Not for how the screens flow step by step (that is an app flow), not for how a process works (that is a workflow), not for a status report or a pitch deck."
---

# introflow

A description of a project, for people **outside** it. A4 lying on its side, in the app's own colours.

**How long is it?** As long as the project. Two things decide, and you are neither of them:

- **The project** decides what exists: its windows and its features. If it has sixty windows, there are
  sixty to describe. Never pick "the important ones" yourself.
- **The owner** decides what to make from it: a simple introduction, the full description, or a book.

Never set a number of pages, and never stop because "this is enough". If the owner does not say, make the
**full description: every window, every feature.** Leaving something out is the owner's decision, not yours.

| The owner asks for | What it is | In `intro.md` |
|---|---|---|
| **Full** (the normal one) | Every window and every feature: a contents page, an introduction, an opening page for each part, a page or more for each window, the features, what makes it different, a conclusion | `- depth: full` or nothing |
| **Simple** | Four pages, up to four windows: to answer "what is this?" quickly | `- depth: simple` |
| **A book** | The full description, written deeper: more about each window and each feature | `- depth: book` |
| Something of their own | "Only the Orders part", "everything except Settings" | full, with only those windows |

It is two files in the project's `docs/intro/`: **`intro.md`**, the text copy (the master, which any agent can
read), and **`intro.html`**, the page that draws it, plus the PDF printed from that page. A browser is the
only need: nothing to install.

## When

- Someone outside the project must understand it: "describe the project", "make the project intro", "the
  client wants to see everything it does", "a document for the judges".
- A description exists and the project changed: update the same one.
- **Not** for the screens' order and taps (the frameflow skill draws app flows), not for a whole process
  (the workflow-project skill draws workflows), not for build status, dates or a sales deck.

## The principle: you write, the owner corrects

People find it hard to describe their own project from nothing, and easy to correct a draft. So **you read
the project and write every word first**. The owner answers a few short questions, then says "yes" or
"no, change this". Never make the owner write the description.

## 1. Ask four things

Ask them together, as choices. Known already from the conversation? Do not ask, use it.

1. **How much?** Full (everything, recommended), simple (four pages), or a book. Or their own words.
2. **Who will read it?** A client, a judge, a manager, new staff, a friend. It sets the words you choose.
3. **Which language?** English or Arabic.
4. **Which paper?** **App colour** (to send or show on a screen), **white** (for a client who prints: the
   page spends no ink, only the screens stay dark) or **both** (two PDFs, same words, same pages).

## 2. Read the whole project, and list everything

Read before you write, and **change nothing** in the project. For a full description or a book, find
**every window and every feature**: [references/words.md](references/words.md) says where to look and how
not to miss one.

Then **show the owner the list before writing a word**, grouped in parts, and wait for their yes:

> I found 4 parts, 18 windows and 9 features:
> **Stock** — Stock, Item, New item, Counting, Labels
> **Orders** — To order, Suppliers, A supplier, On the way …
> **Features of the whole app** — Works offline, Daily backup …
> Is anything missing, or anything you want left out?

This list is how nothing is forgotten. The owner adds what you missed and removes what they do not want
shown. Never draw a full description from a list the owner has not seen.

- **Parts.** Group the windows the way the app itself does (its menu, its tabs, its areas). A small app of
  a few windows needs no parts.
- **Screens.** A real picture of **every** window, with demo data: never real names, phone numbers or
  passwords. Use the app flow's screenshots when they exist. Otherwise take them yourself only with a tool
  you already have, or ask the owner for them. Never install anything to get one. Copy them into
  `docs/intro/screenshots/`. A window with no picture is still described; the page draws a
  "Screenshot missing" box. Say which pictures are missing.
- **Colours.** `stage` is the app's background colour and `accent` its main button colour, read from the
  app or its design notes. Never invent them.
- **The drawing.** One quiet background drawing from the app's own world: `rings` (maps, radar, compass),
  `squares` (grids, calendars, activity), `dots` (anything else that wants texture) or `none`. Say which you
  picked and why in one line; the owner may change it. Unsure: `none`.

## 3. Draft the words, and mark your guesses

Write `docs/intro/intro.md` in the shape in [references/intro-format.md](references/intro-format.md).

**The introduction** (`## introduction`) is a few paragraphs that set the reader up: what the project is,
the situation it was made for, and what this document covers. **The conclusion** (`## conclusion`) closes
it: what the project does well, who it suits, and where it stands today. Write both for a full description
or a book, from what the project's files say; anything you worked out yourself is a `?` paragraph. They are
plain paragraphs, not a second list of features.

For each window: its name, one line of what it is for, then as much as the project really says about it:
longer paragraphs (`more:`), what the user sees (`sees:`) and does (`does:`), and the features that live in
that window (`feature:`). Features of the whole app go in `## features`.

- **A fact the files or the screen hold** is written as a normal line: `- For whom: …`
- **Something you worked out yourself** (usually *why it was built* and *what makes it different*) is
  written as a guess: `? Why it was built: …`. The page prints a "To confirm" tag on it.
- **A fact the files do not hold is never invented.** Leave it out and ask.
- Describe what is there, not what you imagine: a window you could not open gets its name and what the
  project's files say about it, and you tell the owner it is thin.
- Plain words for an outside reader: no code names, no file names, no build status.

## 4. Show the words, before any design

Show the owner the draft **as words in the chat**, with your guesses clearly marked. For a long description
show it part by part, not all at once. Say plainly what the project's files did not tell you.

- **"Yes"** on a guess → change its `?` to `-`.
- **A correction**, even in rough words → rewrite the line properly, keep their meaning, show it again.
- Go round until they say the words are right. Never draw a PDF with words the owner has not seen.

## 5. Draw it

1. **Copy** into `docs/intro/` every file of this skill's `assets/template/` folder that is not there yet:
   `intro.html`, and the `introflow/` folder with everything in it. Copy the files; never retype them. Never
   replace a file that is already there, except the template's own files when this skill is newer.
2. In `docs/intro/intro.html`, replace only the text between `<script type="text/markdown" id="intro">`
   and `</script>` with the exact text of `intro.md`, starting at the left edge. Change nothing else in the
   template: the look is fixed. The text must contain no closing script tag and no `<!--`.
3. Check the page drew and make the PDF or PDFs: [references/pdf.md](references/pdf.md). If it refuses,
   fix `intro.md` by the lines it names, copy it in again, check again. Never edit the template to silence
   a refusal, and **never cut windows or features to make it draw**: shorten one line, or split one
   paragraph in two.
4. **Look at every page** as a picture if you can. Is every window there, with the right screen? Does the
   contents page list them all? Does each cut show the part its words talk about? If you cannot render
   pages, say so plainly when you hand it over.

The page lays the pages out itself: a window with a lot to say runs on to further pages; the contents and
the page numbers follow. You never count pages or decide where one breaks.

## 6. Hand it over

Two to four plain sentences: how many parts, windows and pages; which PDFs you made and where; what is
still marked "To confirm"; which pictures are missing. Then ask: *"Is it right to send, or do you want
changes?"*

- **Changes** → change `intro.md`, raise `version` by one, keep `status: draft`, draw again.
- **Agreed** → every guess is confirmed (no `?` left), then set `status: approved` and
  `approved: YYYY-MM-DD`, and draw it again. The page refuses to be approved while a guess remains.

## Rules

- The project and the owner decide the length. You never do.
- `intro.md` is the master. When the page and the file disagree, the file wins: copy it in again.
- Never change the template's layout or fonts. Colours come only from `stage`, `accent` and the paper.
- Both papers come from the same `intro.md`, so they can never disagree.
- Read only: never change, move or delete anything in the project outside `docs/intro/`.
- Never install anything without the person's yes. No network: pictures are files next to the page.
- An Arabic description is its own text copy with its own pictures and cuts: an Arabic screen is
  mirrored, so a cut's numbers change.

## Limits

Say these when they matter:

- There is **no limit** on windows, features or pages in a full description. A simple introduction is four
  pages and up to four windows by definition.
- The introduction and the conclusion hold up to 12 paragraphs each; a simple introduction has neither.
- One window holds at most 8 longer paragraphs, 6 "sees" and 6 "does" lines and 12 features of its own.
  When a window has more, join lines or describe it as two windows. Never drop one to fit: leaving
  something out is the owner's decision.
- English and Arabic only.
- A single line too long for its place, or one paragraph too long for a whole page, is refused, not
  squeezed: shorten or split the lines it names. So is a word too wide for its place, such as a long web
  address.
- The cover's name is the one thing the page may make smaller: a name too wide beside the screens is drawn
  a little smaller, only until it is clear of them, and never below 30 px. A name still too wide at 30 px
  is refused and the page says so. Tell the owner; the name is theirs to shorten or to write in small letters.
- White paper saves the page's ink, not the screens': a dark app's screens stay dark.
- Screens should all be one shape (all upright or all wide).

## Files

| File | What it is |
|---|---|
| `references/words.md` | how to find every window and feature, what each page needs, and how to show the draft |
| `references/intro-format.md` | the shape of `intro.md`, and what the page refuses |
| `references/pdf.md` | checking the drawn page and making one PDF or both, on any computer |
| `assets/template/` | the page (`intro.html`) and its `introflow/` folder: the look, the colour rules, the reading and drawing code, and the fonts (SIL Open Font License) |
| `examples/` | complete text copies: a full description of a tablet app, the same app as a simple introduction, and a simple introduction of a phone app in Arabic |
