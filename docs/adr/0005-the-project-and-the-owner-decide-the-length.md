# 0005. The project and the owner decide how long the description is

- Status: accepted
- Date: 2026-11-12
- Decided by: the owner ("the skill must show and describe all windows and features in the project, not few
  things"; "who has the authorize? the project and human"; and, when the builder suggested "about 25 pages":
  would 4 or 25 be enough for someone who built a big software?)
- Supersedes: the four fixed pages of 0.1.0

## Context

0.1.0 drew four pages and refused more than four windows. That shape came from one document the owner had
asked for, a short introduction of an unfinished project for one reader. The builder turned that one request
into the whole skill. Run on a finished app with twenty windows, 0.1.0 would have left most of it out.

## Decision

- **The project** decides what exists: every window and every feature is listed and described.
- **The owner** decides what to make from it: a simple introduction (four pages, up to four windows), the
  full description (the default), a book (the same, written deeper), or a selection in their own words.
- **The agent and the page set no number.** No limit on windows, features or pages. With no instruction, the
  full description is made. Leaving something out is the owner's decision.
- The agent lists everything it found, grouped in parts, and gets the owner's yes that the list is complete
  before it writes.
- The page lays the document out itself: a contents page, an opening page for each part, a page for each
  window whose text runs on to further pages when it needs to, the features, what makes it different.

## What still has a limit, and why

- A single line has a length (a name, a caption): a line longer than its place is refused, as before.
- One window holds at most 8 paragraphs, 6 + 6 points and 12 features of its own. Past that it reads better
  as two windows; the limit is on one entry, never on the project.
- Three facts sit on the cover, because they are drawn side by side on one fixed page.
- A simple introduction is four pages by definition, and each refusal there names `- depth: full`.

## Consequences

- `render.js` now lays pages out by measuring: blocks are put in a fixed box and the first that does not fit
  opens the next page. This can only be tested in a browser.
- The length of a full description is not known until it is drawn. The contents page and every footer take
  their numbers from the finished document.
- `depth: book` draws exactly like `full`. The difference is how much the agent writes, which no test checks.
- A window whose last page would hold only a line or two is laid out again with a smaller screen, and failing
  that the blocks before it move on with it. A nearly empty page can still happen.
- The skill's promise changed, so its name for the document did too: a full one is a "Project description",
  a simple one stays a "Project introduction". The repository's public pictures and README were corrected.
