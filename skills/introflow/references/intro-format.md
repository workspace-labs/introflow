# The text copy: `intro.md`

One short Markdown file in a fixed shape. The page reads it and refuses, by line number, anything that does
not fit. A complete file is in `examples/`.

## Contents

- A complete small file
- The settings
- `## facts`
- `## who` and `## different`
- `## what`
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
- main: 2
1. Trip plan | Before the walk: Who is coming, the kit list and the turn-back time.
   shot: screenshots/1-plan.png
   cut: 0%, 18%
2. Route map | On the trail: The whole route on a map that works without signal.
   shot: screenshots/2-map.png

## different
- Works without signal: Maps are saved on the tablet before the walk.
? A turn-back time: The plan holds the hour the group turns back if it is running late.
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

Leave out `stage` and `accent` and the pages wear introflow's own colours.

## `## facts`

One to three lines: `- Label [icon]: Value`. The icon is optional.

Icons: `phone`, `tablet`, `desktop`, `globe`, `offline`, `pen`, `lock`, `people`, `clock`, `print`.

Label up to 16 characters, value up to 30.

## `## who` and `## different`

Two to four lines each.

- `- Label: text` is a fact from the project's records.
- `? Label: text` is a guess, still to confirm. The page prints "To confirm" on it, and refuses
  `status: approved` while one remains.

`who`: label up to 28 characters, text up to 200. `different`: label up to 34, text up to 140.

## `## what`

Three optional settings, then two to four numbered screens.

| Setting | What it is |
|---|---|
| `- order:` | `steps` (the screens follow one another: they are numbered) or `windows` (default: no numbers). |
| `- main:` | The number of the screen shown largest. Default 1. |
| `- sub:` | One line under the page's title (up to 80 characters). |

A screen:

```markdown
2. Live map | During the exercise: Every contact on one map, with the top priority.
   shot: screenshots/2-live-map.png
   cut: 3%, 27%
```

- `2.` its number, in order from 1.
- The name (up to 24 characters). After `|`, an optional tag (up to 28). After `:`, the caption (up to 120).
- `shot:` its picture: a `.png`, `.jpg`, `.jpeg` or `.webp` file next to the page, as plain folder and
  file names. Leave it out and the page draws a "Screenshot missing" box.
- `cut:` where its readable cut starts: how far from the picture's left edge and from its top, in percent.
  The cut shows about two thirds of an upright screen's width, or about half of a wide one's. Aim it at the
  part the caption talks about. The main screen is shown whole and needs no cut.

## What the page refuses

Each refusal is a numbered sentence with its line:

- no name on the first line, a second `#` line, an unknown section or setting, a setting written twice;
- a missing `kind` or `about`, a missing section, too few or too many lines in a section;
- a colour that is not hex, a date that is not a real day, a version that is not a whole number;
- screens numbered out of order, a picture path with a web link, `..`, a leading `/` or an odd character,
  a `cut:` with no `shot:`, a `main:` that names no screen;
- `status: approved` with no `approved:` day, or with a `?` guess still in the file;
- words longer than their place, and any page too full to draw cleanly (shorten the lines it names);
- a closing script tag or `<!--` anywhere in the text.
