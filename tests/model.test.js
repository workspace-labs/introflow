// The reading rules: good text copies are read correctly; broken ones are refused in plain words.
// Run from the repository root: node --test
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parse, VERSION, LIMITS } = require("../skills/introflow/assets/template/introflow/model.js");
const strings = require("../skills/introflow/assets/template/introflow/strings.js");

const EXAMPLES = path.join(__dirname, "../skills/introflow/examples");
const GOOD = fs.readFileSync(path.join(EXAMPLES, "trailhead-tablet.md"), "utf8");

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
  assert.ok(files.length >= 2);
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
  refusedWith(parse(GOOD.replace("## who", "## users")), "is not a section");
  refusedWith(parse(GOOD + "- One: more line.\n- And: another line.\n"), "2 to 4 lines; it has 6");
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
  refusedWith(change("   shot: screenshots/3-plan.png", null).result, "cut: needs the screen's picture");
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
