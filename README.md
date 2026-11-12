# introflow

![introflow: the same project introduction cover on two papers, the app's own colour and white paper for printing](media/introflow-hero.png)

**Tell anyone outside your project what it is, in four pages.**

An agent skill that makes a short **project introduction** for a client, a judge, a manager or a friend who
asks "what is this project?". The agent reads the project and drafts every word; you only confirm or
correct. Then it draws a four-page PDF with the app's real screens, in **the app's own colours**, on
**white paper for printing**, or both.

The skill is the folder [`skills/introflow/`](skills/introflow/): its instructions,
[`SKILL.md`](skills/introflow/SKILL.md), and a page template that draws the introduction in any browser.
**Nothing to install.**

**Version 0.1.0** · 39 automated tests (14 of them open the real page in a browser) · [how it was tested](TESTING.md)

---

## What you get

In your project's `docs/intro/`:

| File | What it is |
|---|---|
| `intro.md` | the introduction as short, readable text: the master copy any agent can read and update |
| `intro.html` | the page that draws it (open it in Chrome, Edge or Safari) |
| `<Project> - Project intro.pdf` | the PDF in the app's own colours, to send or show on a screen |
| `<Project> - Project intro (print).pdf` | the same pages on white paper, for a client who prints |
| `screenshots/` | the app's real screens, with demo data |

The PDF is four pages, A4 lying on its side:

1. **The cover**: the name, what it is in two or three sentences, the app's screens, three facts.
2. **Who it is for, and why.**
3. **What it does**: the main screen large, the others beside it as readable cuts.
4. **What makes it different**, every screen once more, and where to go next.

Four frames: **phone**, **tablet**, **desktop window** and **browser**, with screens upright or wide.
English by default; **Arabic** turns every page right to left.

## How it works

1. The agent asks three things: **who will read it**, **which language**, and **which paper** (app colour,
   white, or both).
2. It **reads the project** (README, scope, app flow, screens) and changes nothing in it.
3. It **drafts every word** and shows them to you as plain text. What it worked out itself (usually *why it
   was built* and *what makes it different*) is marked as a guess. A fact the files do not hold is asked,
   never invented.
4. You say **yes** or **change this**. Only then it draws: **the page draws itself**, and refuses with
   numbered problems if a line is wrong or a page is too full.
5. It makes the PDF or PDFs with the Chrome or Edge you already have, or tells you the exact Print settings.
6. A guess stays tagged "To confirm" until you confirm it, and the introduction cannot be marked
   **approved** while one remains.

## Install

By hand, for Claude Code (macOS or Linux, Bash). The copy refuses an existing folder; back up an existing
installation before choosing to replace it:

```bash
skill_root="$HOME/.claude/skills"
skill_target="$skill_root/introflow"
if [ -e "$skill_target" ] || [ -L "$skill_target" ]; then
  printf '%s\n' "Already exists: $skill_target. Back it up before updating." >&2
  false
else
  mkdir -p "$skill_root" && cp -R introflow/skills/introflow "$skill_target"
fi
```

**Claude app (chat and Cowork)**: make the zip, then upload it in **Customize → Skills**.

```bash
cd introflow
mkdir -p dist && (cd skills && zip -r -X -FS ../dist/introflow.zip introflow -x '*.DS_Store')
```

**Codex, GitHub Copilot, Cursor and ChatGPT**: where your tool supports agent skills, install the same
folder. Not tested yet.

## Try it without an agent

Open [`skills/introflow/assets/template/intro.html`](skills/introflow/assets/template/intro.html) in a
browser. To see an example, paste the text of one of the files in
[`skills/introflow/examples/`](skills/introflow/examples/) between the two `intro` lines in that file, and
reload. Screens without a picture show a "Screenshot missing" box.

## The text copy

```markdown
# Trailhead

- kind: tablet
- about: A tablet app for walking clubs. The leader picks a route, plans the trip and follows the map without signal.
- stage: #0c1613
- accent: #f2a33a
- drawing: rings

## facts
- Device [tablet]: Android tablet
- Maps [offline]: Work without signal

## who
- For whom: The walk leader of a small club: the person who chooses the route and brings everyone back.
? Why it was built: Because paper maps and group chats do not show, in one place, who is coming and when to turn back.

## what
- order: steps
- main: 2
1. Trip plan | Before the walk: Who is coming, the kit list and the turn-back time.
   shot: screenshots/1-plan.png
   cut: 0%, 18%
2. Route map | On the trail: The whole route on a map that works without signal.
   shot: screenshots/2-map.png

## different
- Works without signal: Maps are saved on the tablet before the walk.
? A turn-back time: The plan holds the hour the group turns back if it is running late.
```

A line starting with `?` is the agent's guess, still to confirm. The full shape is in
[`references/intro-format.md`](skills/introflow/references/intro-format.md).

## Its family

introflow is the third of three skills that describe a project before and after it is built:
[workflow-project](https://github.com/workspace-labs/workflow-project) draws how the whole project works,
[frameflow](https://github.com/workspace-labs/frameflow) draws its screens, and introflow says what it is.

## Licence

MIT (see [`LICENSE`](LICENSE)). The fonts are under the SIL Open Font License (see [`CREDITS.md`](CREDITS.md)).
