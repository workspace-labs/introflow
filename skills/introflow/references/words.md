# Reading the project and writing the words

## Contents

- Where the facts live
- What each page needs
- Facts and guesses
- When the files are thin
- Showing the draft
- Writing for an outside reader

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
| `## who` | 2 to 4 | For whom · where it runs · why it was built. |
| `## what` | 2 to 4 screens | One screen each: its name and what the reader sees it do. |
| `## different` | 2 to 4 | What a reader would not expect, in plain words. Not a feature list. |

**Steps or windows?** If the screens follow one another (first this, then that), set `order: steps`: they
are numbered, and each may carry a short tag such as "Before the exercise". If they are separate places in
the app, set `order: windows`: no numbers. Numbers must tell the truth.

**The main screen** (`main:`) is the one that shows the app at its best. It stands large on page 3 and in
the middle of the cover.

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

Show words only, in the chat, grouped by page. Mark guesses so they cannot be missed:

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
