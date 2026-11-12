// The colour rules: every page colour comes from the app's two colours and the paper, and stays readable.
const test = require("node:test");
const assert = require("node:assert/strict");
const { theme, hex, contrast, LABEL_CONTRAST, DEFAULT } = require("../skills/introflow/assets/template/introflow/theme.js");

const APPS = [["#030713", "#0075ff"], ["#070807", "#34d399"], ["#f4f7fb", "#1f6feb"], ["#ffffff", "#ffd400"], ["#101010", "#222222"], ["", ""]];

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

test("labels and text stay readable on both papers, for dark apps, light apps and weak accents", () => {
  for (const [stage, accent] of APPS) {
    for (const paper of ["app", "white"]) {
      const t = theme(stage, accent, paper);
      const where = `${stage || "default"} / ${accent || "default"} on ${paper}`;
      assert.ok(contrast(t.label, t.bg) >= LABEL_CONTRAST, `label on page: ${where}`);
      assert.ok(contrast(t.ink, t.bg) >= 7, `ink on page: ${where}`);
      assert.ok(contrast(t.ink2, t.bg) >= LABEL_CONTRAST, `second text on page: ${where}`);
      assert.ok(contrast(t.ink3, t.bg) >= 3, `quiet text on page: ${where}`);
      assert.ok(contrast(t.onAcc, t.acc) >= LABEL_CONTRAST, `number on its accent circle: ${where}`);
      assert.ok(contrast(t.gold, t.bg) >= LABEL_CONTRAST, `the "to confirm" tag: ${where}`);
    }
  }
});

test("the accent itself is kept when it is already readable", () => {
  assert.equal(theme("#070807", "#34d399", "app").label, "#34d399");
  assert.notEqual(theme("#070807", "#34d399", "white").label, "#34d399");
});
