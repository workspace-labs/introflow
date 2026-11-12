# The text copy: `intro.md`

One short Markdown file in a fixed shape. The page reads it and refuses, by line number, anything that does
not fit. A complete file is in `examples/`.

## Contents

- A complete small file
- The settings
- `## facts`
- `## introduction` and `## conclusion`
- `## who`, `## features` and `## different`
- `## what`: the windows
- Parts
- What the page refuses

## A complete small file

```markdown
# Trailhead

- kind: tablet
- about: A tablet app for walking clubs. The leader picks a route, plans the trip and follows the map without signal.
- stage: #0c1613
- accent: #f2a33a
- drawing: rings

## facts
- Device [tablet]: Android tablet
- Maps [offline]: Work without signal

## who
- For whom: The walk leader of a small club: the person who chooses the route and brings everyone back.
? Why it was built: Because paper maps and group chats do not show, in one place, who is coming and when to turn back.

## what
- order: steps
### Before the walk: Choosing where to go, and getting everyone ready
1. Routes | Before the walk: Every saved walk with its distance, time and difficulty.
   shot: screenshots/1-routes.png
   sees: Every saved route, as a card
   does: Opens a route to see its map
2. Trip plan | Before the walk: Who is coming, the kit list and the turn-back time.
   shot: screenshots/2-plan.png
   cut: 0%, 18%
   more: The plan is one page the whole group can check before leaving the car park.
   feature: Turn-back time: The hour the group turns back if the top is not reached.
### On the trail
3. Route map | On the trail: The whole route on a map that works without signal.
   shot: screenshots/3-map.png

## features
- Works without signal: Maps and plans are saved on the tablet before the walk.

## different
- One tablet for the group: Nothing to install on anyone's phone.
```

## The settings

Under the name, before the first section. One per line: `- key: value`.

| Setting | Needed | What it is |
|---|---|---|
| `kind` | yes | `phone`, `tablet`, `desktop` or `website`. It sets the frame around each screen. |
| `about` | yes | What the project is, in two or three sentences (up to 260 characters). |
| `screens` | no | `upright` or `wide`: the shape of the screenshots. Default: upright for a phone or tablet, wide for a desktop app or website. A tablet held sideways is `wide`. |
| `language` | no | `en` (default) or `ar`. With `ar`, write the whole file in Arabic; every page reads right to left. |
| `stage` | no | The app's background colour, as hex (`#070807`). |
| `accent` | no | The app's main button colour, as hex. |
| `drawing` | no | The background drawing: `rings`, `squares`, `dots` or `none` (default). |
| `paper` | no | `app` (default): the app's own colour. `white`: white paper for printing. |
| `client` | no | Who it is for: printed as "Prepared for …". |
| `by` | no | Who prepared it. |
| `date` | no | `YYYY-MM-DD`. |
| `version` | no | A whole number. Default 1. |
| `status` | no | `draft` (default) or `approved`. |
| `approved` | with `approved` | The day it was approved, `YYYY-MM-DD`. |
| `next` | no | One closing line on the last page: where the reader goes next (up to 120 characters). |
| `depth` | no | `full` (default): every window and feature the file holds, as many pages as that takes. `simple`: four pages, 2 to 4 windows, no parts, no features, no longer text. `book`: drawn like `full`; it records that the owner asked for the deeper version. |

Leave out `stage` and `accent` and the pages wear introflow's own colours.

## `## facts`

One to three lines: `- Label [icon]: Value`. The icon is optional.

Icons: `phone`, `tablet`, `desktop`, `globe`, `offline`, `pen`, `lock`, `people`, `clock`, `print`.

Label up to 16 characters, value up to 30.

## `## introduction` and `## conclusion`

Paragraphs. Each paragraph is one line starting with `-`, or with `?` when it is a guess still to confirm:

```markdown
## introduction
- Trailhead is a tablet app for small walking clubs. It keeps everything a walk needs in one place.
- This document describes the app as it is today: who it is for, every window in it, and what it can do.

## conclusion
- Trailhead does a small job well: it gets a group out, around and back, with a plan everyone has seen.
? It suits clubs of up to about a dozen walkers.
```

- 1 to 12 paragraphs each, up to 700 characters a paragraph. Long ones run on to further pages.
- The introduction is drawn after the contents; the conclusion is the last page. Both are in the contents.
- Both may be left out. A simple introduction has neither.

## `## who`, `## features` and `## different`

`who`: 1 to 4 lines. `different`: 1 to 8 (2 to 4 in a simple introduction). `features`: the features of the whole
app, as many as there are; the section may be left out, and a simple introduction has none.

- `- Label: text` is a fact from the project's records.
- `? Label: text` is a guess, still to confirm. The page prints "To confirm" on it, and refuses
  `status: approved` while one remains.

`who`: label up to 28 characters, text up to 200. `different`: label up to 34, text up to 140. `features`:
name up to 34, text up to 300.

## `## what`: the windows

Three optional settings, then the windows, numbered 1, 2, 3 in order. **There is no upper limit** (a simple
introduction holds 2 to 4).

| Setting | What it is |
|---|---|
| `- order:` | `steps` (the windows follow one another: they are numbered on the page) or `windows` (default: no numbers shown). |
| `- main:` | The number of the window shown on the cover and beside "who it is for". Default 1. |
| `- sub:` | One line under the title of a simple introduction's "What it does" page (up to 80 characters). |

A window:

```markdown
2. Trip plan | Before the walk: Who is coming, the kit list and the turn-back time.
   shot: screenshots/2-plan.png
   cut: 0%, 18%
   more: The plan is one page the whole group can check before leaving the car park.
   sees: Who is coming, and who leads
   does: Ticks each item as it is packed
   feature: Turn-back time: The hour the group turns back if the top is not reached.
```

- `2.` its number. The name (up to 24 characters). After `|`, an optional tag (up to 28). After `:`, one
  line of what the window is for (up to 200).
- `shot:` its picture: a `.png`, `.jpg`, `.jpeg` or `.webp` file next to the page, as plain folder and
  file names. Leave it out and the page draws a "Screenshot missing" box.
- `cut:` where its "closer look" starts: how far from the picture's left edge and from its top, in percent.
  Aim it at the part the words talk about. Leave it out and there is no closer look.
- `more:` a longer paragraph (up to 600 characters). Up to 8 of them; each is one paragraph.
- `sees:` one thing the user sees there, `does:` one thing they do (up to 120 characters each; up to 6 of each).
- `feature:` a feature that lives in this window: `feature: Its name: what it does` (name up to 34, text up
  to 300; up to 12).

A window with a lot to say simply runs on to further pages. A simple introduction uses only the first line,
`shot:` and `cut:`.

## Parts

A larger app's windows are grouped in parts, like chapters. A line starting with `###` opens a part; the
windows under it belong to it, until the next `###`:

```markdown
### Stock: Everything on the shelves, and how it changes
```

- The title (up to 34 characters), then optionally `:` and one line about the part (up to 120).
- With parts, every window sits under one: the first `###` comes before window 1.
- The windows keep one numbering, 1, 2, 3, straight through all the parts.
- A part with two or more windows gets an opening page that shows them all, small. The contents page lists
  the parts and their windows with their page numbers.
- A small app needs no parts. A simple introduction has none.

## What the page refuses

Each refusal is a numbered sentence with its line:

- no name on the first line, a second `#` line, an unknown section or setting, a setting written twice;
- a missing `kind` or `about`, a missing section, too few lines in a section, or too many where a page sets
  the limit (the three facts, the lines under one window);
- in a simple introduction: more than four windows, parts, a features section, or `more:`, `sees:`, `does:`
  and `feature:` lines (each refusal says `- depth: full` is the way to show everything);
- a paragraph of the introduction or conclusion that does not start with `-` or `?`;
- a part with no windows, a window above the first part, a `###` line outside `## what`;
- a colour that is not hex, a date that is not a real day, a version that is not a whole number;
- screens numbered out of order, a picture path with a web link, `..`, a leading `/` or an odd character,
  a `cut:` with no `shot:`, a `main:` that names no screen;
- `status: approved` with no `approved:` day, or with a `?` guess still in the file;
- words longer than their limit, a fixed page too full to draw cleanly, and one paragraph or card too long
  to fit a page even alone (shorten or split the lines it names; a window's text otherwise runs on to more pages);
- a word wider than its place, running off the page or meeting a screen: a very long unbroken word such as
  a web address, or facts too wide to sit side by side;
- a name too wide for the cover even at its smallest size: a name that would reach the screens is first made
  smaller, only until it is clear and never below 30 px; one still not clear at 30 px is refused;
- a closing script tag or `<!--` anywhere in the text.
