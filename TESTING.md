# How introflow was tested

## 0.1.0, approved after independent review 3, 12 November 2026

An independent reviewer (Codex) reviewed commit `7e51940` (review 1: five findings, F01 to F05) and then the
corrections (review 2: F03, F04 and F05 closed; F01 and F02 reopened), then the second corrections
(review 3: **approved**, F01 and F02 closed against the owner's decision in ADR 0004).

| What | Result |
|---|---|
| Automated tests | **39 passed, 0 failed, 0 skipped** on Node.js 20 with Chrome: 15 reading rules, 9 colour rules, 11 that draw the real page and read its verdict and the name's size, 3 that take a picture of the page and read its pixels, 1 control |
| The round-3 tests against the engine review 2 looked at | 39 tests: **33 pass, 6 fail** there (the four name tests and both missing-picture pixel tests). All pass on the corrected engine |
| F01, the cover's name (ADR 0004, the owner's decision) | A name that fits keeps the size its length gives it, read from the drawn page: NORDIK 98 px, Trailhead 67, NORTHSTAR 67, a 22-character name 30, WALKWAY 86 beside a phone's screens. A name that would reach a screen is made smaller only until it is clear: beside an upright tablet WALKWAY is 75 px, HARBOUR 81, MOUNTAINMAPS 49, and the tests check each is within one pixel of the largest size that is clear. No name is drawn below 30 px: 17 capital O are drawn at 31, 18 at exactly 30, 19 are refused by name; 28 capital W are refused in every frame |
| F02, the "Screenshot missing" words | Read from a picture of the page: **6.429:1** on the two dimmed outer screens (they were 4.128:1), 9.314:1 on the centre screen and on white paper. The dimming is still there on the app's paper, and only there. Both ways to reach the box are covered: a picture that will not load, and a screen with no picture named |
| The reviewer's own files | Still refused: `long-url.md`, `wide-fact.md`, its four maximum-length files. `name-walkway.md` draws at 75 px (review 2 saw 72) and `name-floor.md` at 31 px (review 2 saw 29). Its grey-colour file still draws |
| Colour sweep | 2,430 combinations of app colours and paper (27 backgrounds, 45 accents, 2 papers): every text colour reaches 4.5:1 on the page, a card and the glow. The test uses its own contrast arithmetic, not the code's |
| Pages looked at | Four introductions redrawn on both papers with no refusal: the Trailhead example with its four demo screens, the Arabic phone example with no pictures, and two private real projects that are not in this repository. The no-picture cover looked at as a picture |
| Public pictures and examples | The README's pictures show **Trailhead, a made-up walking-club app** (`docs/decisions/hero-options/demo-app/`), drawn by the skill on both papers. The two examples are both made up: `trailhead-tablet.md` (the same Trailhead, in English) and `clinic-booking-phone-ar.md` (عيادتي, a separate made-up clinic booking app in Arabic, with no pictures). No real project appears in this repository |
| PDF | A4 landscape, four sheets, in headless Chrome |
| Independent review | Review 1: changes required. Review 2: F03 to F05 closed, F01 and F02 reopened (it reran the 32 tests of that round on Node.js 22: all passed). Review 3: **approved** by Codex. It reran the 39 tests on Node.js 22 (all passed), checked 336 name cases against its own measurement (no mismatch) and measured the missing-picture words from pixels (6.429:1 dimmed, 9.314:1 otherwise). It noted, without requiring a change, that two tests are tolerant: the gap bound for the name allows one extra pixel for some names, and the pixel test takes the lightest pixel as the words |
| An owner decision that differs from the reviewer's correction | Review 2 required the name never to be made smaller. Under that rule a seven-capital name was refused beside an upright tablet where it is clear at 81 to 84 px. The owner was shown both and chose to let the name get smaller (ADR 0004). Review 3 checked the code against that decision and approved it |
| Not tried | Windows, Linux, Edge, Firefox, Safari's own Print dialog, a real printer, a desktop-app or website project with real screens, a native Arabic read, a fresh-session dry run of `SKILL.md` with an owner, Node.js 18, a full planted-bug campaign |
