# AGENTS.md: working on introflow

For coding agents changing this repository. What the skill does is in `README.md`; what it must never do
is in `docs/scope.md`; why it is built this way is in `docs/adr/`.

## Test

```bash
cd introflow        # your clone
node --test
```

Node.js 18 or newer, for the tests only. The skill itself needs nothing but a browser.

`tests/fit.test.js` and `tests/missing-picture.test.js` open the real template in the Chrome or Edge already
on the computer (headless, with a throwaway profile, on a disposable copy): the first checks that a page is
drawn cleanly or refused and that the cover's name has its proper size; the second takes a picture of the
page and reads its pixels. Their shared helper is `tests/support/page.js`. With no such browser those tests
are skipped and say so; nothing is installed.

## Look at the pages

The tests check the reading rules, the colour rules, and whether a page is drawn or refused. They cannot see
whether a page looks right. After any change to the
template, draw both examples and a real project on **both papers** and look at every page: copy
`skills/introflow/assets/template/` to a scratch folder, paste a text copy between the two `intro` lines of
`intro.html`, then print with the commands in `skills/introflow/references/pdf.md`.

## Rules for this repository

- Keep `skills/introflow/` clean: it is installed and uploaded as it is. No test files, no drawn PDFs.
- The look lives in `skills/introflow/assets/template/introflow/introflow.css` and the colour rules in
  `theme.js`. They are the owner's decisions (ADR 0003, and ADR 0004 for the cover's name): never change fonts, the page
  shape, how colours are worked out or how the name is sized without his yes.
- `model.js`, `theme.js` and `strings.js` never touch the page (no `document`); only `render.js` does. That
  keeps them testable in Node.
- After the first release, every change bumps `VERSION` in
  `skills/introflow/assets/template/introflow/model.js` and adds a dated `CHANGELOG.md` entry. Until 0.1.0 is
  released, corrections are recorded under 0.1.0.
- After a change, rebuild `dist/introflow.zip` (command in `README.md`).
- Never commit or push without the owner's word. Never put a path from the owner's computer in anything
  published.
