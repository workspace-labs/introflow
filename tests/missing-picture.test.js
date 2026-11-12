// The "Screenshot missing" box, as it is finally drawn. On the app's paper the cover's two outer screens are
// dimmed (a brightness filter on the whole device), and the box is dimmed with them. No colour token can show
// that, so this test takes a picture of the real page and reads the pixels.
// Review F02, round 2: the words were 4.128:1 on the dimmed screens.
const test = require("node:test");
const assert = require("node:assert/strict");
const { skip, SCALE, TRAILHEAD, draw, line } = require("./support/page.js");

const TEXT = 4.5;   // WCAG AA for small text; the words here are 11 px

// Contrast arithmetic written here, apart from theme.js.
function light(c) {
  const [r, g, b] = c.map((v) => v / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function ratio(a, b) { const [hi, lo] = [light(a), light(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); }
const near = (a, b) => a.every((v, i) => Math.abs(v - b[i]) <= 1);

// The same example with no shot: lines at all, so the page draws the box itself instead of replacing a picture.
function withoutShotLines(text) {
  return text.split("\n").filter((l) => !/^\s+(shot|cut)\s*:/.test(l)).join("\n");
}

/* Reads one screen's box from the picture: the commonest colour around its middle is the box, the lightest is
   the words. Pixels under another screen (the centre one lies over the outer two) are left out. */
function read(png, fan, over) {
  const [l, t, r, b] = fan.box, cx = (l + r) / 2, cy = (t + b) / 2;
  const seen = new Map();
  let words = null, lightest = -1, total = 0;
  for (let y = Math.round((cy - 26) * SCALE); y <= (cy + 26) * SCALE; y++) {
    for (let x = Math.round((cx - 80) * SCALE); x <= (cx + 80) * SCALE; x++) {
      const px = x / SCALE, py = y / SCALE;
      if (over.some((o) => px > o[0] - 4 && px < o[2] + 4 && py > o[1] - 4 && py < o[3] + 4)) continue;
      const c = png.at(x, y), key = c.join(",");
      seen.set(key, (seen.get(key) || 0) + 1);
      total++;
      if (light(c) > lightest) { lightest = light(c); words = c; }
    }
  }
  const [key, count] = [...seen].sort((a, b2) => b2[1] - a[1])[0];
  const box = key.split(",").map(Number);
  return { box, words, share: count / total, ratio: ratio(words, box) };
}

function check(text, paper, what) {
  const page = draw(text, { paper, pixels: true });
  assert.equal(page.state, "ready", `${what}: ${page.problems.join(" | ")}`);
  const fans = page.probe.fans;
  assert.equal(fans.length, 3, `${what}: the cover shows three screens`);
  const centre = fans.find((f) => /\bf2\b/.test(f.cls));
  const measured = {};
  for (const fan of fans) {
    const outer = fan !== centre, where = `${what}, ${outer ? "an outer screen" : "the centre screen"} (${fan.cls})`;
    assert.ok(fan.box, `${where}: there is no "Screenshot missing" box`);
    assert.equal(fan.text, "Screenshot missing", where);
    assert.equal(fan.font, "11px", `${where}: these are small words`);
    // the dimmed device art is part of the look on the app's paper: it must still be there, and only there
    assert.equal(fan.filter, outer && paper === "app" ? "brightness(0.8)" : "none", `${where}: the dimming`);
    const m = read(page.png, fan, outer ? [centre.dev] : []);
    assert.ok(m.share > 0.5, `${where}: the picture was not read inside the box (commonest colour is only ${(m.share * 100).toFixed(0)}% of it)`);
    // the box's own colour is #1a2135 (26, 33, 53); dimmed to 80% it is (21, 26, 42)
    assert.ok(near(m.box, outer && paper === "app" ? [21, 26, 42] : [26, 33, 53]), `${where}: read ${m.box} as the box colour`);
    assert.ok(m.ratio >= TEXT, `${where}: the words are ${m.ratio.toFixed(3)}:1 on the box as drawn (words ${m.words}, box ${m.box})`);
    measured[fan.cls] = Number(m.ratio.toFixed(3));
  }
  return measured;
}

test("review F02 (round 2): a picture that will not load is replaced by a box whose words can be read, dimmed or not", { skip }, () => {
  // the example names four pictures; none is beside this disposable copy, so each one fails to load
  check(TRAILHEAD, "app", "broken pictures on the app's paper");
});

test("review F02 (round 2): a screen with no picture named draws the same readable box", { skip }, () => {
  check(withoutShotLines(TRAILHEAD), "app", "no pictures named, on the app's paper");
});

test("control: on white paper nothing is dimmed, and the box is readable there too", { skip }, () => {
  check(TRAILHEAD, "white", "broken pictures on white paper");
});

test("control: the test's own example really has no picture lines left", () => {
  assert.equal(/shot:|cut:/.test(withoutShotLines(TRAILHEAD)), false);
  assert.match(line(TRAILHEAD, "# Trailhead", "# X"), /^# X/);
});
