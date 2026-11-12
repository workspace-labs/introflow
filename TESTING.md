# How introflow was tested

## 0.1.0, 12 November 2026

| What | Result |
|---|---|
| Automated tests | **19 passed, 0 failed** on Node.js 20 (15 reading rules, 4 colour rules) |
| Found by the tests | White numbers on a mid-blue accent circle were below the readable limit; the rule now picks whichever of dark and white reads better |
| Pages looked at | Three introductions drawn on **both papers** with no refusal, every page looked at as a picture: an upright tablet app in English with 4 real screens, a sideways tablet app in Arabic with 4 real screens, and a phone app in Arabic with no pictures (the "Screenshot missing" boxes) |
| Refusals seen working | A page too full (while building), an approved file with guesses, and the reading rules in the tests |
| Public pictures | The README's pictures and every example show **Trailhead, a made-up demo app** (`docs/decisions/hero-options/demo-app/`), drawn by the skill on both papers. No real project appears anywhere in this repository |
| PDF | A4 landscape, four sheets, in headless Chrome; the cover also drawn by the Mac's own PDF engine to check the tilted devices print with clean edges |
| Independent review | **Not yet.** No second AI has reviewed it |
| Not tried | Windows, Linux, Edge, Firefox, Safari's own Print dialog, a real printer, a desktop-app or website project with real screens, a native Arabic read, a fresh-session dry run of `SKILL.md`, Node.js 18 and 22, planted-bug (mutation) checks |
