// The colour rules: every page colour comes from the app's two colours and the paper, and every word stays
// readable on the surface it is printed on (the page, a card, the glow behind the screens).
// The contrast arithmetic below is written here on purpose, apart from theme.js, so the tests do not grade
// the code with its own ruler.
const test = require("node:test");
const assert = require("node:assert/strict");
const { theme, hex, DEFAULT } = require("../skills/introflow/assets/template/introflow/theme.js");

const TEXT = 4.5;   // WCAG AA for small text

function light(colour) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(colour.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function ratio(a, b) {
  const [hi, lo] = [light(a), light(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
// The lowest contrast of a text colour over every surface words are printed on.
function worst(colour, t) { return Math.min(...[t.bg, t.card, t.glow].map((s) => ratio(colour, s))); }

function readableEverywhere(stage, accent, paper) {
  const t = theme(stage, accent, paper);
  const where = `${stage || "default"} / ${accent || "default"} on ${paper}`;
  for (const key of ["ink", "ink2", "ink3", "label", "gold"]) {
    assert.ok(worst(t[key], t) >= TEXT, `${key} ${t[key]} is ${worst(t[key], t).toFixed(3)}:1 on its weakest surface: ${where}`);
  }
  assert.ok(ratio(t.onAcc, t.acc) >= TEXT, `number on its accent circle is ${ratio(t.onAcc, t.acc).toFixed(3)}:1: ${where}`);
  return t;
}

test("hex reads short and long colours and refuses the rest", () => {
  assert.equal(hex("#ABC"), "#aabbcc");
  assert.equal(hex(" #0a0E0d "), "#0a0e0d");
  assert.equal(hex("green"), "");
  assert.equal(hex("#12345"), "");
});

test("white paper is white whatever the app's colour; the app's paper is the app's background", () => {
  assert.equal(theme("#030713", "#0075ff", "white").bg, "#ffffff");
  assert.equal(theme("#030713", "#0075ff", "white").dark, false);
  assert.equal(theme("#030713", "#0075ff", "app").bg, "#030713");
  assert.equal(theme("#030713", "#0075ff", "app").dark, true);
  assert.equal(theme("", "", "app").bg, DEFAULT.stage);
});

test("review F02: a mid-grey app is readable (it was 2.8:1 labels, 1.7:1 on the To confirm tag)", () => {
  const t = readableEverywhere("#999999", "#777777", "app");
  assert.equal(t.ink, "#000000", "a mid-tone page gets the strongest ink there is");
});

test("review F02: the number on a mid-grey accent circle is readable (it was white at 4.4:1)", () => {
  const t = readableEverywhere("#ffffff", "#787878", "white");
  assert.equal(t.onAcc, "#000000");
});

test("review F02: a label is readable on a card, not only on the page (it was 4.395:1 on the card)", () => {
  const t = readableEverywhere("#0b1020", "#0044aa", "app");
  assert.ok(ratio(t.label, t.card) >= TEXT);
});

test("review F02: quiet text is small text and reaches 4.5:1, on white paper and on a light app", () => {
  for (const [stage, accent, paper] of [["#030713", "#0075ff", "white"], ["#f4f7fb", "#1f6feb", "app"], ["#f4f7fb", "#1f6feb", "white"]]) {
    const t = readableEverywhere(stage, accent, paper);
    assert.ok(worst(t.ink3, t) >= TEXT);
  }
});

test("controls: dark apps, light apps, pale and weak accents stay readable on both papers", () => {
  const apps = [["#030713", "#0075ff"], ["#070807", "#34d399"], ["#0c1613", "#f2a33a"], ["#f4f7fb", "#1f6feb"],
    ["#ffffff", "#ffd400"], ["#ffffff", "#fff3b0"], ["#101010", "#222222"], ["#000000", "#000000"], ["#ffffff", "#ffffff"], ["", ""]];
  for (const [stage, accent] of apps) for (const paper of ["app", "white"]) readableEverywhere(stage, accent, paper);
});

test("a sweep of 2,430 colour combinations: no allowed one gives unreadable words", () => {
  const steps = ["00", "40", "80", "99", "c0", "ff"];
  const colours = [];
  for (const r of steps) for (const g of ["00", "80", "ff"]) for (const b of ["00", "ff"]) colours.push(`#${r}${g}${b}`);
  const greys = ["#333333", "#555555", "#707070", "#777777", "#787878", "#808080", "#8c8c8c", "#999999", "#b0b0b0"];
  const stages = greys.concat(colours.slice(0, 18)), accents = greys.concat(colours);
  let pairs = 0;
  for (const stage of stages) for (const accent of accents) for (const paper of ["app", "white"]) { readableEverywhere(stage, accent, paper); pairs++; }
  // 27 stages x 45 accents x 2 papers
  assert.equal(stages.length, 27);
  assert.equal(accents.length, 45);
  assert.equal(pairs, 2430);
});

test("an app's own colours are kept when they are already readable", () => {
  assert.equal(theme("#070807", "#34d399", "app").label, "#34d399");
  assert.equal(theme("#070807", "#34d399", "app").ink, "#eef2f6");
  assert.notEqual(theme("#070807", "#34d399", "white").label, "#34d399");
});
