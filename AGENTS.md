# AGENTS.md: working on introflow

For coding agents changing this repository. What the skill does is in `README.md`; what it must never do
is in `docs/scope.md`; why it is built this way is in `docs/adr/`.

## Test

```bash
cd introflow        # your clone
node --test
```

Node.js 18 or newer, for the tests only. The skill itself needs nothing but a browser.

## Look at the pages

The tests check the reading rules and the colour rules. They cannot see the page. After any change to the
template, draw both examples and a real project on **both papers** and look at every page: copy
`skills/introflow/assets/template/` to a scratch folder, paste a text copy between the two `intro` lines of
`intro.html`, then print with the commands in `skills/introflow/references/pdf.md`.

## Rules for this repository

- Keep `skills/introflow/` clean: it is installed and uploaded as it is. No test files, no drawn PDFs.
- The look lives in `skills/introflow/assets/template/introflow/introflow.css` and the colour rules in
  `theme.js`. They are the owner's decisions (ADR 0003): never change fonts, the page shape or how colours
  are worked out without his yes.
- `model.js`, `theme.js` and `strings.js` never touch the page (no `document`); only `render.js` does. That
  keeps them testable in Node.
- Every change bumps `VERSION` in `skills/introflow/assets/template/introflow/model.js` and adds a dated
  `CHANGELOG.md` entry.
- After a change, rebuild `dist/introflow.zip` (command in `README.md`).
- Never commit or push without the owner's word. Never put a path from the owner's computer in anything
  published.
