# Changelog

All notable changes to this project. The version is `VERSION` in
`skills/introflow/assets/template/introflow/model.js`.

## [0.2.0] - 2026-11-12

The skill is no longer a four-page skill. The owner's rule (ADR 0005): **the project and its owner decide
how long the description is**; the agent and the page set no number. 0.1.0 had turned one short document he
once asked for into the limit of the whole skill.

### Changed

- **A full description is the default**: every window and every feature the text copy holds, as many pages
  as that takes. There is no limit on windows, features or pages (tested with 60 windows and 30 features).
- **The page lays itself out.** A contents page with real page numbers, an opening page for each part, a
  page for each window that runs on to further pages when it has more to say, the features, what makes it
  different.
- **`depth`**: `full` (default), `simple` (the four pages of 0.1.0, up to four windows) or `book` (drawn as
  full; the agent writes deeper). A simple introduction that is given more than it can hold says to use
  `- depth: full`.
- **The agent lists everything first.** `SKILL.md` now has it find every window and feature, show the owner
  the list grouped in parts, and wait for a yes before writing.
- A full one is called "Project description" on its pages; a simple one stays "Project introduction".
- `0.1.0` text copies without a `depth` line are now drawn as full descriptions. Add `- depth: simple` to
  keep the four pages.

### Added

- **Parts** (`### Title: one line`) group the windows like chapters.
- Under a window: `more:` (longer paragraphs), `sees:`, `does:` and `feature:` (a feature of that window).
- `## features`, for the features of the whole app. A guess (`?`) there blocks approval too.
- `## introduction` and `## conclusion`: paragraphs the agent drafts, drawn after the contents and as the
  last page (asked for by the owner). Both optional; not in a simple introduction.
- A window with little to say is drawn with a larger screen; one whose last page would be nearly empty is
  laid out again with a smaller one.
- The icons and background drawings moved to their own file (`art.js`).

### Corrected after independent review 1 of 0.2.0 (before release)

- **F06** A wide window's paragraphs could come out of order (0, 1, 3, 2, 4) when its last page was
  balanced. Blocks are now taken in reading order only.
- **F07** The sentence of a part with one window was lost with its skipped opening page. It now opens that
  window's page.
- **F08** A simple introduction with two cards had lost its larger words and screens. Restored.
- **F09**, **F10** A refusal no longer advises leaving a line out; the references agree that "who" holds 1 to 4.

## [0.1.0] - 2026-11-12

The first version. Born when the owner sent an app flow to a friend, who asked "what is this project?":
nothing in the set said what the project is.

### Added

- **A four-page project introduction**, A4 lying on its side: the cover, who it is for and why, what it
  does, what makes it different.
- **The Night bridge look**, picked by the owner from six: three devices on the cover, the main screen
  large inside, the others as readable cuts.
- **Two papers from one text copy**: the app's own colours, or white paper for printing. "Both" prints the
  same page twice (`?paper=app`, `?paper=white`).
- **The app's own colours** on every page, worked out from `stage` and `accent`; small labels are kept
  readable on either paper.
- **The agent drafts, the owner corrects**: guesses are written with `?`, tagged "To confirm" on the page,
  and block `status: approved` until confirmed.
- Frames for a phone, tablet, desktop window and browser; upright or wide screens; three background
  drawings (`rings`, `squares`, `dots`) or none.
- English and Arabic (right to left).
- A page that is too full, or a line that does not fit the shape, is refused with numbered problems.

### Corrected after independent reviews 1 and 2 (before any release)

- **F01** A page could say "ready" while a very long word, or three wide facts, were cut off or pushed off the
  page. Now every page is also checked sideways: nothing wider than its own box, nothing nearer than 24 px
  to the page's edge, and on the cover no word may meet a screen. A phone held sideways no longer breaks the
  last page's row of screens.
- **The cover's name** (the owner's decision, ADR 0004): a name that fits keeps the size its length gives
  it. One that would reach a screen is made smaller one pixel at a time, only until it is clear, and never
  below 30 px; a name still not clear at 30 px is refused by name. (Review 2 found a first correction that
  shrank names needlessly and could step to 29 px.)
- **F02** Some allowed colours gave unreadable words (a mid-grey app; a mid-grey accent circle; labels on
  cards). Every text colour is now readable (4.5:1) on all three surfaces it is printed on: the page, a card
  and the glow. A mid-tone page gets pure black or pure white ink. The "Screenshot missing" words are lighter,
  so they stay readable (6.4:1) on the cover's two dimmed outer screens (review 2: they were 4.1:1 there).
- **F03** Saving both papers by hand now gives two different file names.
- **F04**, **F05** The test record names both examples correctly; the picture's fonts are credited and carry
  their licence.
