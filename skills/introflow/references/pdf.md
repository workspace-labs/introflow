# Making the PDF

The introduction page draws itself in any browser. The PDF is that page, printed. Never install a browser or
anything else to get one.

## Contents

- 1. Check the page drew
- 2. Print it yourself, when Chrome or Edge is already there
- 3. One paper, or both
- 4. Otherwise, the person prints it
- What "ready" and "refused" mean

## 1. Check the page drew

When the page finishes it marks itself: `<html data-introflow="ready">`, or `"refused"` with a numbered list
of problems in the page. If you can run Chrome or Edge from the command line (next section), read the drawn
page first:

```bash
"<browser>" --headless --disable-gpu --virtual-time-budget=10000 --dump-dom "file:///full/path/docs/intro/intro.html"
```

- The output contains `data-introflow="ready"` → print it.
- It contains `data-introflow="refused"` → the problems are in the `<section class="problems">` list, each
  with its line in `intro.md`, or the name of the page that is too full. Fix them in `intro.md`, copy it
  into the page again, and check again.

## 2. Print it yourself, when Chrome or Edge is already there

Look for an installed Chrome or Edge. Use the first that exists; do not install one.

| System | Where to look |
|---|---|
| macOS | `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` · `/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge` |
| Windows | `C:\Program Files\Google\Chrome\Application\chrome.exe` · `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe` · `C:\Program Files\Microsoft\Edge\Application\msedge.exe` |
| Linux | `google-chrome` · `chromium` · `chromium-browser` · `microsoft-edge` on the PATH |

Then print (one line):

```bash
"<browser>" --headless --disable-gpu --no-pdf-header-footer --virtual-time-budget=10000 --print-to-pdf="docs/intro/<Project> - Project intro.pdf" "file:///full/path/docs/intro/intro.html"
```

Windows PowerShell:

```powershell
& "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --headless --disable-gpu --no-pdf-header-footer --virtual-time-budget=10000 --print-to-pdf="C:\path\docs\intro\Project - Project intro.pdf" "file:///C:/path/docs/intro/intro.html"
```

- The page address must be a full `file:///` path; on Windows use forward slashes after `file:///C:/`.
- `--virtual-time-budget` gives the fonts and screenshots time to load before printing.
- An older browser that does not know `--no-pdf-header-footer` uses `--print-to-pdf-no-header` instead.
- Check the PDF exists, is not empty, and has **four pages**. The page sets A4 on its side by itself.

## 3. One paper, or both

The paper in `intro.md` (`- paper: app` or `- paper: white`) is what the page prints by default. To print
the other paper **from the same file**, add `?paper=white` or `?paper=app` to the page address:

```bash
"<browser>" … --print-to-pdf="docs/intro/<Project> - Project intro.pdf"         "file:///full/path/docs/intro/intro.html?paper=app"
"<browser>" … --print-to-pdf="docs/intro/<Project> - Project intro (print).pdf" "file:///full/path/docs/intro/intro.html?paper=white"
```

- **App colour** is named `<Project> - Project intro.pdf`; **white paper** is named
  `<Project> - Project intro (print).pdf`, so the wrong one is never sent.
- From version 2 on, add the version to both: `<Project> - Project intro v2.pdf` and
  `<Project> - Project intro v2 (print).pdf`.
- "Both" is these two commands. The words and pages are the same, because both read the same `intro.md`.
- Look at **both** PDFs page by page. The white one is not a copy of the dark one: check it on its own.

## 4. Otherwise, the person prints it

When you cannot run a browser (no command line, no Chrome or Edge, or Claude in the browser), hand over the
`docs/intro/` folder and tell the person, in these words or close to them:

> Open `intro.html` in Chrome, Edge or Safari. At the top, choose **App colour** or **White paper**. Press
> Print, choose **Save as PDF**, then set **Paper A4**, **Landscape** (the page lies on its side),
> **Margins None**, turn **Background graphics** on (in Safari: **Print backgrounds**) and **Headers and
> footers** off. Save **App colour** as "<Project> - Project intro.pdf" and **White paper** as
> "<Project> - Project intro (print).pdf". For both papers, do it once for each, with its own name.

Give the person the exact names with the project's name already filled in, and from version 2 on with the
version in both (`… - Project intro v2.pdf`, `… - Project intro v2 (print).pdf`), as in section 3. The two
names must never be the same, or the second save replaces the first.

If the page shows a red "introflow can't draw this introduction yet" box instead of the pages, ask the
person to paste the list into the chat, then fix those lines.

## What "ready" and "refused" mean

| The page shows | Meaning | What you do |
|---|---|---|
| The cover and three more pages | Every line was read and every word fits | Print |
| A red box with numbered problems | A line is wrong, or a page is too full | Fix `intro.md` by the lines it names, copy it in again, check again |
| A grey box "Turn on JavaScript…" | The browser blocks scripts for files | Try another browser |
