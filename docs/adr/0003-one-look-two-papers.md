# 0003. One look, on two papers, in the app's own colours

- Status: accepted
- Date: 2026-11-12
- Decided by: the owner (he picked "Night bridge" from six looks; asked for a white version because colour
  printing costs a client more; set the rule "app colour, white, or both")

## Context

Six looks were shown on two real projects (an upright tablet app and a sideways one, in English and Arabic).
The owner picked Night bridge: dark, wide, three devices on the cover, the main screen large inside. A dark
page is costly to print.

## Decision

- The look is fixed: the page shape, the parts, and the type (Alexandria for English and Arabic, IBM Plex
  Mono for small English labels).
- Every colour is worked out in `theme.js` from the app's `stage` and `accent` and the paper.
- `paper: app` wears the app's background. `paper: white` keeps the same layout on white: no glow, white
  cards with a thin line, a pale drawing. Only the screens stay dark, because that is how the app looks.
- "Both" is the same page printed twice (`?paper=app`, `?paper=white`), so the two PDFs cannot disagree.
- The agent asks which paper each time.

## Consequences

- Screens that are upright and screens that are wide need their own arrangement of the same parts; both
  live in `introflow.css` under `.wide`.
- White paper saves the page's ink, not the screens'. The saving was not measured.
- Large soft shadows are not used: an earlier skill's glow printed as a flat block in one PDF viewer.
