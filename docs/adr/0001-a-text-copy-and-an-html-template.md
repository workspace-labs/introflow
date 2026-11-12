# 0001. A text copy is the master; an HTML template draws it

- Status: accepted
- Date: 2026-11-12
- Decided by: the builder, following the owner's two earlier decisions for frameflow (its ADRs 0001, 0002)

## Context

introflow is the sibling of frameflow and must work the same way for the same people: on a stranger's clean
computer, in any agent, with nothing to install, and updatable later without starting again.

## Options weighed

1. **The agent writes the HTML itself each time.** No reader to build, but the look drifts from one
   introduction to the next, which is what the owner rejected for his documents.
2. **A drawing tool in Python** (as workflow-project). Strict, but needs Python and a package, and the
   pages here are mostly screenshots and type, which a browser already draws well.
3. **A short Markdown file in a fixed shape, read by a fixed HTML page** (as frameflow).

## Decision

Option 3. `intro.md` is the master. `intro.html` carries an exact copy of it and draws the pages; the PDF is
that page printed. The reader (`model.js`) refuses anything that does not fit the shape.

## Consequences

- The reading rules run in Node's tests with no browser.
- A fit check in the page (not in Node) refuses a page that is too full; it can only be exercised by
  drawing real pages.
- The colour arithmetic was copied from frameflow's `theme.js` rather than shared, so each skill stays one
  self-contained folder. If the two drift, that is the place to look.
