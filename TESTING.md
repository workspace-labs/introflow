# How introflow was tested

## 0.2.0, 12 November 2026: no page limit (approved after independent review 2)

0.2.0 replaces the four fixed pages with a description as long as the project (ADR 0005). An independent
reviewer (Codex) reviewed it once and required five corrections (F06 to F10). They were corrected, and its second review
**approved** 0.2.0 with F06 to F10 closed. The reviewer's own evidence includes 150 windows in 20 parts
drawn as one document, and 72 draws comparing the simple introduction with 0.1.0 with no difference in what
it measured. It did not run other operating systems or browsers, a printer, or a fresh agent following
`SKILL.md`.

| What | Result |
|---|---|
| Automated tests | **57 passed, 0 failed, 0 skipped** on Node.js 20 with Chrome: 23 reading rules, 9 colour rules, 21 that draw the real page and read its verdict, pages and page numbers, 3 that read pixels, 1 control |
| Review 1 of 0.2.0 | The three new browser tests (paragraph order on eight layouts and both papers, the lone part's sentence printed once, the two-card sizes 17 / 21 / 210 px) and the changed refusal wording fail on the engine the reviewer looked at (4 of 57) and pass now. The reviewer's own two fixtures now draw in order and print the sentence. The reviewer also drew 150 windows in 20 parts; that is its evidence, not rerun here |
| No limit | The reader accepts 250 windows and 120 features. The page drew 60 windows in 6 parts with 30 features as one document; every footer says "Page n of m" in order, and every contents entry points at the page where its window really starts |
| Running on | A window with eight long paragraphs runs over further pages and is not refused. A part of one window gets no opening page. One window with no parts draws as cover, contents, who, window, different |
| Frames and languages | The full example drew in all four frames, upright and wide, and the Arabic example as a full description, right to left |
| A fault the tests caught | The opening page of a part was too cramped for a phone app and was refused. Corrected |
| Introduction and conclusion | Drawn after the contents and as the last page, listed in the contents; twelve long paragraphs run over further pages; a guess in them is tagged and blocks approval. The Trailhead example's two pages looked at on both papers |
| Pages looked at | Three full descriptions on both papers, every page as one contact sheet: the Trailhead example (12 pages before the introduction and conclusion were added, 14 after), and two private real projects not in this repository (16 pages with eight sideways windows in four parts; 10 pages with six upright windows) |
| 0.1.0 behaviour kept | All tests of 0.1.0 still pass against a simple introduction: the fit, name, colour and missing-picture checks |
| Not tried | Everything listed as not tried under 0.1.0, and also: a description of more than 60 windows drawn in a browser, printing a very long description to PDF on a slow machine, a real desktop or website project, `depth: book` (it draws exactly like full; how deep the agent writes is not tested), a fresh agent following the new `SKILL.md` |
| Known weak spot | A page can still come out nearly empty when a window's text ends just past a page |

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
