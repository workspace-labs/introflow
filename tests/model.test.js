// The reading rules: good text copies are read correctly; broken ones are refused in plain words.
// Run from the repository root: node --test
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parse, VERSION, LIMITS } = require("../skills/introflow/assets/template/introflow/model.js");
const strings = require("../skills/introflow/assets/template/introflow/strings.js");

const EXAMPLES = path.join(__dirname, "../skills/introflow/examples");
const GOOD = fs.readFileSync(path.join(EXAMPLES, "trailhead-simple.md"), "utf8");   // a simple, four-page introduction
const FULL = fs.readFileSync(path.join(EXAMPLES, "trailhead-tablet.md"), "utf8");   // a full description, with parts

// The good example with one line swapped (the line is found by its start) or lines added at the end.
function change(start, replacement) {
  const lines = GOOD.split("\n");
  const at = lines.findIndex((l) => l.startsWith(start));
  assert.ok(at >= 0, `the example has no line starting "${start}"`);
  if (replacement === null) lines.splice(at, 1); else lines[at] = replacement;
  return { result: parse(lines.join("\n")), line: at + 1 };
}

function refusedWith(result, words, line) {
  assert.equal(result.ok, false, "expected a refusal");
  const hit = result.problems.find((p) => p.text.includes(words) && (line === undefined || p.line === line));
  assert.ok(hit, `no problem${line ? " on line " + line : ""} containing "${words}". Got:\n` +
    result.problems.map((p) => `  ${p.line}: ${p.text}`).join("\n"));
}

test("the version is a real version number", () => {
  assert.match(VERSION, /^\d+\.\d+\.\d+$/);
});

test("every example in the skill reads with no problems", () => {
  const files = fs.readdirSync(EXAMPLES).filter((f) => f.endsWith(".md"));
  assert.ok(files.length >= 3);
  for (const file of files) {
    const result = parse(fs.readFileSync(path.join(EXAMPLES, file), "utf8"));
    assert.deepEqual(result.problems, [], file);
  }
});

test("the good example is read into its parts", () => {
  const { intro } = parse(GOOD);
  assert.equal(intro.name, "Trailhead");
  assert.equal(intro.kind, "tablet");
  assert.equal(intro.screens, "upright");
  assert.equal(intro.stage, "#0c1613");
  assert.equal(intro.paper, "app");
  assert.deepEqual(intro.facts.map((f) => f.icon), ["tablet", "offline", "people"]);
  assert.equal(intro.what.steps.length, 4);
  assert.equal(intro.what.order, "steps");
  assert.equal(intro.what.main, 3);
  assert.deepEqual(intro.what.steps[1].cut, { x: 0, y: 18 });
  assert.equal(intro.what.steps[2].cut, null);
  assert.equal(intro.guesses, 2);
  assert.equal(intro.who[2].guess, true);
  assert.equal(intro.who[0].guess, false);
});

test("defaults: a phone's screens are upright, a website's wide, the paper is the app's, the language English", () => {
  const phone = parse(GOOD.replace("- kind: tablet\n- screens: upright\n- language: en\n", "- kind: phone\n")).intro;
  assert.equal(phone.screens, "upright");
  assert.equal(phone.language, "en");
  const site = parse(GOOD.replace("- kind: tablet\n- screens: upright\n", "- kind: website\n")).intro;
  assert.equal(site.screens, "wide");
  assert.equal(parse(GOOD.replace("- paper: app\n", "")).intro.paper, "app");
});

test("a tag after | is read apart from the screen's name", () => {
  const step = parse(GOOD).intro.what.steps[0];
  assert.equal(step.name, "Routes");
  assert.equal(step.tag, "Before the walk");
  const plain = parse(GOOD.replace("1. Routes | Before the walk:", "1. Routes:")).intro.what.steps[0];
  assert.equal(plain.name, "Routes");
  assert.equal(plain.tag, "");
});

test("a guess may be shown in a draft, but never approved", () => {
  assert.equal(parse(GOOD).ok, true);
  const approved = GOOD.replace("- status: draft", "- status: approved\n- approved: 2026-11-14");
  const result = parse(approved);
  refusedWith(result, "still a guess");
  assert.equal(result.problems.filter((p) => p.text.includes("still a guess")).length, 2);
  assert.equal(parse(approved.replace(/^\? /gm, "- ")).ok, true);
});

test("approval needs its day, and a draft has none", () => {
  refusedWith(parse(GOOD.replace(/^\? /gm, "- ").replace("- status: draft", "- status: approved")), "needs the day it was approved");
  refusedWith(parse(GOOD.replace("- status: draft", "- status: draft\n- approved: 2026-11-14")), "only for status: approved");
});

test("missing and broken settings are refused by line", () => {
  refusedWith(change("- kind:", null).result, "Add the kind of project");
  refusedWith(change("- about:", null).result, "Add what the project is");
  let c = change("- kind:", "- kind: watch"); refusedWith(c.result, "is not a kind", c.line);
  c = change("- stage:", "- stage: dark green"); refusedWith(c.result, "is not a colour", c.line);
  c = change("- paper:", "- paper: grey"); refusedWith(c.result, "is not a paper", c.line);
  c = change("- drawing:", "- drawing: waves"); refusedWith(c.result, "is not a drawing", c.line);
  c = change("- date:", "- date: 2026-02-30"); refusedWith(c.result, "YYYY-MM-DD", c.line);
  c = change("- version:", "- version: 1.5"); refusedWith(c.result, "whole number", c.line);
  c = change("- version:", "- colour: red"); refusedWith(c.result, "is not a setting", c.line);
  c = change("- version:", "- kind: phone"); refusedWith(c.result, "set twice", c.line);
});

test("sections: all four are needed, once, with the right number of lines", () => {
  refusedWith(parse(GOOD.split("## different")[0]), "## different is missing");
  refusedWith(parse(GOOD + "\n## facts\n- Device: Tablet\n"), "written twice");
  assert.equal(parse(GOOD).intro.features.length, 0, "## features may be left out");
  refusedWith(parse(GOOD.replace("## who", "## users")), "is not a section");
  refusedWith(parse(GOOD + "- One: more line.\n- And: another line.\n"), "2 to 4 lines in a simple introduction; it has 6");
  refusedWith(change("- For [people]", "- For [people]: Walking clubs\n- Price: Free").result, "1 to 3 lines; it has 4");
});

test("facts: unknown icons and long words are refused", () => {
  let c = change("- Device [tablet]", "- Device [rocket]: Android tablet"); refusedWith(c.result, "is not an icon", c.line);
  c = change("- Device [tablet]", "- Device [tablet]: " + "x".repeat(LIMITS.factValue + 1)); refusedWith(c.result, "too long", c.line);
  assert.equal(change("- Device [tablet]", "- Device: Android tablet").result.intro.facts[0].icon, "");
});

test("screens: numbering, pictures and cuts", () => {
  let c = change("2. Trip plan", "3. Trip plan: Who is coming."); refusedWith(c.result, "should be 2", c.line);
  c = change("   shot: screenshots/3-plan.png", "   shot: https://example.com/a.png"); refusedWith(c.result, "plain folder and file names", c.line);
  c = change("   shot: screenshots/3-plan.png", "   shot: ../app-flow/2.png"); refusedWith(c.result, "plain folder and file names", c.line);
  c = change("   shot: screenshots/3-plan.png", "   shot: screenshots/2-stock.gif"); refusedWith(c.result, ".png, .jpg", c.line);
  c = change("   cut: 0%, 18%", "   cut: 140%, 28%"); refusedWith(c.result, "two numbers from 0 to 100", c.line);
  c = change("   cut: 0%, 18%", "   cut: left"); refusedWith(c.result, "two numbers from 0 to 100", c.line);
  refusedWith(change("   shot: screenshots/3-plan.png", null).result, "cut: needs the window's picture");
  c = change("- main:", "- main: 9"); refusedWith(c.result, "from 1 to 4", c.line);
  c = change("- order:", "- order: random"); refusedWith(c.result, "order: is steps", c.line);
  c = change("2. Trip plan", "2. Trip plan: " + "y".repeat(LIMITS.stepCaption + 1)); refusedWith(c.result, "caption is too long", c.line);
});

test("text that would break the page's embedded copy is refused", () => {
  refusedWith(parse(GOOD.replace("Every saved walk", "Every </script> saved walk")), "embedded copy");
  refusedWith(parse(GOOD.replace("Every saved walk", "Every </SCRIPT > saved walk")), "embedded copy");
  refusedWith(parse(GOOD.replace("Every saved walk", "Every <!-- saved walk")), "embedded copy");
});

test("an empty file and a file with no name are refused", () => {
  refusedWith(parse(""), "The file is empty");
  refusedWith(parse("- kind: phone"), "must start with the project's name");
  refusedWith(parse("# One\n# Two\n- kind: phone"), "Only one # line");
});

test("Windows line endings read the same", () => {
  assert.deepEqual(parse(GOOD.replace(/\n/g, "\r\n")).intro, parse(GOOD).intro);
});

test("dates are written by hand, the same on any computer; both languages have every word", () => {
  assert.equal(strings.day("2026-11-12", "en"), "12 November 2026");
  assert.equal(strings.day("2026-11-12", "ar"), "12 نوفمبر 2026");
  assert.equal(strings.day("soon", "en"), "");
  assert.deepEqual(Object.keys(strings.WORDS.ar).sort(), Object.keys(strings.WORDS.en).sort());
});

// ---------- the full description: the project and its owner decide the length ----------

test("the default is a full description, and it has no upper limit on windows or features", () => {
  assert.equal(parse(FULL).intro.depth, "full");
  assert.equal(parse(GOOD).intro.depth, "simple");
  const lines = ["# Big Suite", "- kind: desktop", "- about: A made-up suite.", "## facts", "- Device: Desktop", "## who", "- For whom: A company.", "## what"];
  for (let i = 1; i <= 250; i++) lines.push(`${i}. Window ${i}: What it is for.`);
  lines.push("## features");
  for (let i = 1; i <= 120; i++) lines.push(`- Feature ${i}: What it does.`);
  lines.push("## different", "- One thing: It is long.");
  const result = parse(lines.join("\n"));
  assert.deepEqual(result.problems, []);
  assert.equal(result.intro.what.steps.length, 250);
  assert.equal(result.intro.features.length, 120);
});

test("a full description may also be very small: one window, one line in each section", () => {
  const result = parse("# Tiny\n- kind: phone\n- about: One screen.\n## facts\n- Device: Phone\n## who\n- For whom: Me.\n## what\n1. Home: The only window.\n## different\n- Small: One window.\n");
  assert.deepEqual(result.problems, []);
});

test("parts group the windows, and each window knows its part", () => {
  const { intro, problems } = parse(FULL);
  assert.deepEqual(problems, []);
  assert.deepEqual(intro.what.parts.map((p) => p.title), ["Before the walk", "On the trail"]);
  assert.equal(intro.what.parts[0].line, "Choosing where to go, and getting everyone ready");
  assert.deepEqual(intro.what.steps.map((s) => s.part), [0, 0, 1, 1]);
  assert.deepEqual(parse(GOOD).intro.what.parts, []);
});

test("a window carries longer text, what the user sees and does, and its own features", () => {
  const plan = parse(FULL).intro.what.steps[1];
  assert.equal(plan.name, "Trip plan");
  assert.equal(plan.more.length, 1);
  assert.deepEqual(plan.sees, ["Who is coming, and who leads", "The kit list, with what is still missing"]);
  assert.equal(plan.does.length, 2);
  assert.deepEqual(plan.feature.map((f) => f.label), ["Turn-back time", "Shared kit list"]);
});

test("parts and window lines that do not fit the shape are refused by line", () => {
  refusedWith(parse(FULL.replace("### On the trail: Finding the way, and remembering it\n", "### On the trail\n### Empty part\n")), "has no windows under it");
  refusedWith(parse(FULL.replace("### Before the walk: Choosing where to go, and getting everyone ready\n", "")), "every window sits under a part");
  refusedWith(parse(FULL.replace("## features", "### Lost part\n## features")), "has no windows under it");
  refusedWith(parse(FULL.replace("## different", "## different\n### A part here")), "belongs inside ## what");
  refusedWith(parse(FULL.replace("   feature: Turn-back time: The hour", "   feature: Turn-back time, the hour")), "A feature looks like");
  refusedWith(parse(FULL.replace("- order: steps", "   more: Too early.\n- order: steps")), "must sit under a numbered window");
  refusedWith(parse(FULL.replace("   does: Starts the walk", "   does: " + "z".repeat(LIMITS.point + 1))), "too long");
  const seven = "   sees: One more thing\n".repeat(7);
  refusedWith(parse(FULL.replace("   does: Opens a route to see its map\n", seven)), "at most 6 sees: lines");
  // review F09: the advice keeps the content; it never tells the agent to leave something out
  const over = parse(FULL.replace("   does: Opens a route to see its map\n", seven)).problems.find((p) => p.text.includes("at most 6 sees"));
  assert.match(over.text, /nothing needs to be left out/);
  assert.doesNotMatch(over.text, /leave one out/);
});

test("a simple introduction is four pages: more than four windows, parts, features and longer text are refused, with the way out", () => {
  const simple = FULL.replace("- kind: tablet", "- kind: tablet\n- depth: simple");
  const result = parse(simple);
  refusedWith(result, "A simple introduction has no parts");
  refusedWith(result, "shows only a window's name and caption");
  refusedWith(result, "has no features page");
  const five = GOOD.replace("\n## different", "5. Extra: A fifth window.\n\n## different");
  refusedWith(parse(five), "use - depth: full");
  assert.equal(parse(five.replace("- depth: simple\n", "")).ok, true, "the same file is fine as a full description");
  refusedWith(parse(GOOD.replace("- depth: simple", "- depth: huge")), "is not a depth");
  assert.equal(parse(FULL.replace("- kind: tablet", "- kind: tablet\n- depth: book")).intro.depth, "book");
});

test("a guess among the features also blocks approval", () => {
  const approved = FULL.replace("- status: draft", "- status: approved\n- approved: 2026-11-14");
  assert.equal(parse(approved).problems.filter((p) => p.text.includes("still a guess")).length, 4);
});

test("an introduction and a conclusion are paragraphs; both may be left out; a guess in them blocks approval", () => {
  const { intro, problems } = parse(FULL);
  assert.deepEqual(problems, []);
  assert.equal(intro.introduction.length, 3);
  assert.equal(intro.conclusion.length, 3);
  assert.deepEqual(intro.conclusion.map((p) => p.guess), [false, true, false]);
  const without = FULL.slice(0, FULL.indexOf("## conclusion")).replace(/## introduction[\s\S]*?## who/, "## who");
  assert.deepEqual(parse(without).problems, []);
  assert.deepEqual(parse(without).intro.introduction, []);
  refusedWith(parse(FULL.replace("## conclusion\n", "## conclusion\nA line with no dash.\n")), "A paragraph here is one line starting with -");
  refusedWith(parse(FULL.replace("- Trailhead does a small job well", "- " + "w".repeat(LIMITS.paragraph + 1))), "The paragraph is too long");
  refusedWith(parse(FULL + "- one\n".repeat(10)), "## conclusion holds 1 to 12 lines; it has 13");
  const simple = parse(FULL.replace("- kind: tablet", "- kind: tablet\n- depth: simple"));
  refusedWith(simple, "has no introduction page");
  refusedWith(simple, "has no conclusion page");
});
