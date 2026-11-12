# Scope

## What it does

- Makes a **project description** for people outside the project: every window and every feature, as many
  pages as the project needs. The project decides what there is; the owner decides what to make from it
  (the full description, a simple four-page introduction, or a deeper book). The skill sets no number (ADR 0005).
- **The agent reads the project, lists everything it found, and drafts every word.** The owner answers four
  questions (how much, reader, language, paper), confirms the list is complete, then confirms or corrects
  the draft.
- Shows the **app's real screens**, in a frame that follows the kind of project (phone, tablet, desktop
  window, browser), upright or wide.
- **Follows the app**: the pages take the app's own background and main button colour.
- **Two papers**: the app's colour, or white for printing, or both, from one text copy.
- Saves a **text copy** (`intro.md`) next to the page. It is the master any agent can read and update.
- English by default; **Arabic** (right to left) when asked.

## What it will NOT do

- No choosing for the owner what to leave out, and no page limit of its own.
- No invented facts. What the project's files do not say is asked; what the agent worked out is marked as a
  guess until the owner confirms it.
- No changes to the project it reads: it writes only inside `docs/intro/`.
- No app flow (frameflow's job), no workflow (workflow-project's job), no status report, no sales deck.
- No installing anything, no network access, no data collection, no accounts.
- No redesign by the agent: the agent writes the text copy; the template owns the look.
- No dashboards, number tiles or charts.

## How good it must be

- **Clean or refused.** A line that does not fit the shape, or a page too full to draw cleanly, shows a
  numbered list of plain-language problems instead of a messy page. Words are never squeezed to fit, with
  one exception the owner decided: the cover's name may be made a little smaller, never below 30 px (ADR 0004).
- **Readable on both papers.** Labels in the app's accent are adjusted until they can be read (WCAG AA) on
  the app's colour and on white.
- **Nothing to install.** A browser is the only need. The fonts travel inside the template.
- **An approved introduction holds no guesses.**
