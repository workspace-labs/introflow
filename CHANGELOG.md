# Changelog

All notable changes to this project. The version is `VERSION` in
`skills/introflow/assets/template/introflow/model.js`.

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
