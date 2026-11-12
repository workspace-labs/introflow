# 0004. The cover's name may be made smaller, only as far as it takes to clear the screens

- Status: accepted
- Date: 2026-11-12
- Decided by: the owner. He was shown the same cover drawn both ways (option A: never shrink, refuse;
  option B: shrink a little) and answered "b".

## Context

The cover's name is sized from its length: `max(30, min(98, floor(400 / (length × 0.66))))` px. That is an
estimate. A name in wide capitals is wider than the estimate and, at that size, reaches the fanned screens.

The skill's rule everywhere else is "clean or refused": words that do not fit are refused, never squeezed.
Independent review 2 held the name to the same rule and reopened a first correction that had shrunk it (and
that could also step below 30 px).

Under that rule, measured on four layouts: a six-capital name is drawn everywhere; seven capitals with
wide letters are refused beside an upright tablet, some of them beside wide screens too. A name refused at
86 px would have been clear of the screens at 80 to 84 px.

## Options weighed

- **A. Never shrink the name; refuse it.** One rule for every word, as in the owner's other skills. But the
  owner of a project cannot shorten its name, and writing it in small letters changes how the name looks.
- **B. Let the name, and only the name, get smaller: only until it is clear of the screens and the page's
  edge, and never below 30 px.** A real name is drawn a few pixels smaller instead of being refused.

## Decision

Option B.

- The name starts at the size its length gives it. A name that is clear at that size is not touched.
- Otherwise it is made smaller one pixel at a time, and stops at the first size where it is clear.
- It is never drawn below 30 px. A name still not clear at 30 px is refused, by name.
- This is the only place the page changes a size to make words fit. Every other word is still refused when
  it does not fit.

## Consequences

- The same name can be a different size on two covers, when the screens beside it leave different room (an
  upright tablet leaves the least).
- "Clear of the screens" is judged against each screen's bounding box, not its tilted outline: beside wide
  screens that is a few pixels stricter than the outline.
- Tests must check three things: a name that fits keeps its size; a name that does not fit is drawn at the
  largest size that is clear; nothing is ever drawn below 30 px.
