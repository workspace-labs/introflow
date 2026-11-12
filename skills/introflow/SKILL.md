---
name: introflow
description: "Use when someone needs to tell people outside a project what the project is: a client, a judge, a manager or a friend who asks \"what is this project?\". Makes a four-page project introduction PDF (a cover with the app's real screens, who it is for and why, what it does, what makes it different) in the app's own colours, on white paper for printing, or both. The agent reads the project and drafts every word; the owner only confirms or corrects. Also when asked for a project intro, a one-pager about an app, a project overview for a client, or to update one. Not for how the screens flow (that is an app flow), not for how a process works (that is a workflow), not for a status report or a pitch deck."
---

# introflow

A short introduction to a project, for people **outside** it. Four pages, A4 lying on its side:

1. **The cover**: the name, what it is in two or three sentences, the app's real screens, three facts.
2. **Who it is for, and why.**
3. **What it does**: the main screen large, the others beside it as readable cuts.
4. **What makes it different**, every screen once more, and where to go next.

It is two files in the project's `docs/intro/`: **`intro.md`**, the text copy (the master, which any agent can
read), and **`intro.html`**, the page that draws it, plus the PDF printed from that page. A browser is the
only need: nothing to install.

## When

- Someone outside the project must understand it quickly: "make the project intro", "a one-pager for the
  client", "the judge asked what this is".
- An introduction exists and the project changed: update the same one.
- **Not** for the screens' order and taps (the frameflow skill draws app flows), not for a whole process
  (the workflow-project skill draws workflows), not for build status, dates or a sales deck.

## The principle: you write, the owner corrects

People find it hard to describe their own project from nothing, and easy to correct a draft. So **you read
the project and write every word first**. The owner answers three short questions, then says "yes" or
"no, change this". Never make the owner write the introduction.

## 1. Ask three things

Ask them together, as choices. Known already from the conversation? Do not ask, use it.

1. **Who will read it?** A client, a judge, a manager, a friend. It sets the words you choose.
2. **Which language?** English or Arabic.
3. **Which paper?** **App colour** (to send or show on a screen), **white** (for a client who prints: the
   page spends no ink, only the screens stay dark) or **both** (two PDFs, same words, same pages).

## 2. Read the project

Read before you write, and **change nothing** in the project: its README, its scope or about document, its
app flow if it has one, its design notes, and its screens. How to read it, and what each page needs, is in
[references/words.md](references/words.md).

- **Screens.** Real pictures of the real app, with demo data: never real names, phone numbers or
  passwords. Use the app flow's screenshots when they exist. Otherwise take them yourself only with a tool
  you already have, or ask the owner for them. Never install anything to get one. Copy them into
  `docs/intro/screenshots/`.
- **Colours.** `stage` is the app's background colour and `accent` its main button colour, read from the
  app or its design notes. Never invent them.
- **The drawing.** One quiet background drawing from the app's own world: `rings` (maps, radar, compass),
  `squares` (grids, calendars, activity), `dots` (anything else that wants texture) or `none`. Say which you
  picked and why in one line; the owner may change it. Unsure: `none`.

## 3. Draft the words, and mark your guesses

Write `docs/intro/intro.md` in the shape in [references/intro-format.md](references/intro-format.md).

- **A fact the files hold** is written as a normal line: `- For whom: …`
- **Something you worked out yourself** (usually *why it was built* and *what makes it different*) is
  written as a guess: `? Why it was built: …`. The page prints a "To confirm" tag on it.
- **A fact the files do not hold is never invented.** Leave it out and ask.
- Plain words for an outside reader: no code names, no file names, no build status.

## 4. Show the words, before any design

Show the owner the draft **as words in the chat**: the about line, the facts, and each page's lines, with
your guesses clearly marked. Say plainly what the project's files did not tell you.

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
   a refusal.
4. **Look at every page** as a picture if you can. Is every screen the right one and readable? Is any
   page thin or crowded? Does each cut show the part its caption talks about? If you cannot render pages,
   say so plainly when you hand it over.

## 6. Hand it over

Two to four plain sentences: which PDFs you made and where, what is still marked "To confirm", and what the
files could not tell you. Then ask: *"Is it right to send, or do you want changes?"*

- **Changes** → change `intro.md`, raise `version` by one, keep `status: draft`, draw again.
- **Agreed** → every guess is confirmed (no `?` left), then set `status: approved` and
  `approved: YYYY-MM-DD`, and draw it again. The page refuses to be approved while a guess remains.

## Rules

- `intro.md` is the master. When the page and the file disagree, the file wins: copy it in again.
- Never change the template's layout or fonts. Colours come only from `stage`, `accent` and the paper.
- Both papers come from the same `intro.md`, so they can never disagree.
- Read only: never change, move or delete anything in the project outside `docs/intro/`.
- Never install anything without the person's yes. No network: pictures are files next to the page.
- An Arabic introduction is its own text copy with its own pictures and cuts: an Arabic screen is
  mirrored, so a cut's numbers change.

## Limits

Say these when they matter:

- Four pages, always. Up to 3 facts, 2 to 4 lines on each inside page, 2 to 4 screens.
- English and Arabic only.
- A page that is too full is refused, not squeezed: shorten the lines it names. So is a word too wide for
  its place, such as a long web address or three long facts: shorten it, or leave the address out.
- The cover's name is the one thing the page may make smaller: a name too wide beside the screens is drawn
  a little smaller, only until it is clear of them, and never below 30 px. A name still too wide at 30 px
  is refused and the page says so. Tell the owner; the name is theirs to shorten or to write in small letters.
- White paper saves the page's ink, not the screens': a dark app's screens stay dark.
- Screens should all be one shape (all upright or all wide).

## Files

| File | What it is |
|---|---|
| `references/words.md` | how to read a project, what each page needs, and how to show the draft |
| `references/intro-format.md` | the shape of `intro.md`, and what the page refuses |
| `references/pdf.md` | checking the drawn page and making one PDF or both, on any computer |
| `assets/template/` | the page (`intro.html`) and its `introflow/` folder: the look, the colour rules, the reading and drawing code, and the fonts (SIL Open Font License) |
| `examples/` | complete text copies: a tablet app in English, a phone app in Arabic |
