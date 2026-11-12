// The drawn page: an introduction is either drawn cleanly ("ready") or refused, never clipped or squeezed.
// These checks open the real template in a browser (see support/page.js). Skipped, with a reason, without one.
const test = require("node:test");
const assert = require("node:assert/strict");
const { skip, TRAILHEAD, CLINIC, draw, line } = require("./support/page.js");

const SMALLEST_NAME = 30;   // px: no cover is ever drawn with a smaller name

function ready(result, what) {
  assert.equal(result.state, "ready", `${what} should draw. Problems: ${result.problems.join(" | ")}`);
  assert.equal(result.pages, 4, what);
  assert.ok(result.nameSize >= SMALLEST_NAME, `${what}: the name was drawn at ${result.nameSize} px, below ${SMALLEST_NAME}`);
}
function refused(result, words, what) {
  assert.equal(result.state, "refused", `${what} must be refused, not drawn clipped or squeezed`);
  assert.ok(result.problems.some((p) => p.includes(words)), `${what}: no problem containing "${words}". Got: ${result.problems.join(" | ")}`);
}
const named = (name, text = TRAILHEAD) => line(text, "# Trailhead", "# " + name);
const framed = (kind, screens, text = TRAILHEAD) => text.replace("- kind: tablet\n- screens: upright", `- kind: ${kind}\n- screens: ${screens}`);

test("both examples draw four clean pages on both papers", { skip }, () => {
  for (const paper of ["app", "white"]) {
    ready(draw(TRAILHEAD, { paper }), `Trailhead without pictures on ${paper}`);
    ready(draw(TRAILHEAD, { paper, shots: true }), `Trailhead with its pictures and cuts on ${paper}`);
    ready(draw(CLINIC, { paper }), `the Arabic phone example on ${paper}`);
  }
});

test("review F01-A: one very long word in the about line is refused (it was drawn 2,239 px wide, clipped, and called ready)", { skip }, () => {
  const about = "- about: https://walking.example.com/routes/" + "abc".repeat(65);
  refused(draw(line(TRAILHEAD, "- about:", about), { shots: true }), "wider than their place", "a 229-character word");
});

test("review F01-B: three facts as wide as their limit allows are refused (the third was drawn off the page, and called ready)", { skip }, () => {
  let text = TRAILHEAD;
  for (const [start, label] of [["- Device [tablet]", "Device [tablet]"], ["- Maps [offline]", "Maps [offline]"], ["- For [people]", "For [people]"]]) {
    text = line(text, start, `- ${label}: ${"W".repeat(30)}`);
  }
  for (const paper of ["app", "white"]) refused(draw(text, { paper, shots: true }), "wider than their place", `three 30-W facts on ${paper}`);
});

test("a long word inside a card, and inside a caption, is refused on its own page", { skip }, () => {
  refused(draw(line(TRAILHEAD, "- For whom:", "- For whom: " + "x".repeat(190))), "Who it is for", "an unbroken 190-letter word in a card");
  refused(draw(line(TRAILHEAD, "1. Routes", "1. Routes: " + "y".repeat(118))), "What it does", "an unbroken 118-letter caption");
});

// The cover's name (ADR 0004, the owner's decision): it starts at the size its length gives it; if at that
// size it would reach a screen, it is made smaller only until it is clear, never below 30 px; a name still
// not clear at 30 px is refused. The starting sizes below are the ones the first delivery (7e51940) gave these
// names, as the reviewer measured them: plain numbers, not worked out with the page's own arithmetic.

// How far the drawn name is from the nearest screen beside it, in px (left-to-right pages).
function gapToScreens(probe) {
  const [, top, right, bottom] = probe.name.box;
  const beside = probe.fans.map((f) => f.dev).filter((d) => d[1] < bottom && d[3] > top);
  assert.ok(beside.length > 0, "no screen sits beside the name");
  return Math.min(...beside.map((d) => d[0])) - right;
}

test("a name that fits keeps the size its length gives it: it is not made smaller", { skip }, () => {
  for (const [name, size] of [["NORDIK", 98], ["Trailhead", 67], ["NORTHSTAR", 67], ["Trailhead Walking Club", 30]]) {
    const result = draw(named(name), { shots: true, probe: true });
    ready(result, `the name ${name}`);
    assert.equal(result.nameSize, size, `${name} must be drawn at ${size} px`);
    assert.equal(result.probe.name.font, size + "px", `${name}: the size the browser really used`);
    assert.ok(gapToScreens(result.probe) >= -1, `${name} is clear of the screens`);
  }
  // beside a phone's narrower screens there is room for seven wide capitals at their full size
  const onPhone = draw(framed("phone", "upright", named("WALKWAY")));
  ready(onPhone, "WALKWAY beside a phone");
  assert.equal(onPhone.nameSize, 86);
});

test("a name too wide at its size is made smaller only until it is clear of the screens (it was refused, or drawn over them)", { skip }, () => {
  for (const [name, full] of [["WALKWAY", 86], ["HARBOUR", 86], ["MOUNTAINMAPS", 50]]) {
    for (const paper of ["app", "white"]) {
      const result = draw(named(name), { paper, shots: true, probe: true });
      ready(result, `${name} beside an upright tablet on ${paper}`);
      assert.ok(result.nameSize < full, `${name} does not fit at ${full} px beside an upright tablet, so it is smaller: got ${result.nameSize}`);
      const [left, , right] = result.probe.name.box, gap = gapToScreens(result.probe);
      assert.ok(gap >= -1, `${name} at ${result.nameSize} px is clear of the screens (gap ${gap.toFixed(1)} px)`);
      // one pixel larger and the name would be wider by its width divided by its size: it would reach the screen
      const onePixelMore = (right - left) / result.nameSize;
      assert.ok(gap < onePixelMore + 1.5, `${name} at ${result.nameSize} px is ${gap.toFixed(1)} px short of the screens: it was made smaller than it needed to be`);
    }
  }
});

test("review F01 (round 2): no name is ever drawn below 30 px (seventeen wide letters were drawn at 29 px)", { skip }, () => {
  // 17 wide letters start at 35 px and are clear at 31; 18 start at 33 and are clear exactly at the floor
  for (const [count, start] of [[17, 35], [18, 33]]) {
    for (const paper of ["app", "white"]) {
      const result = draw(named("O".repeat(count)), { paper, shots: true, probe: true });
      ready(result, `${count} capital O beside an upright tablet on ${paper}`);
      assert.ok(result.nameSize >= SMALLEST_NAME && result.nameSize < start, `${count} capital O: drawn at ${result.nameSize} px`);
      assert.ok(gapToScreens(result.probe) >= -1, `${count} capital O is clear of the screens`);
    }
  }
  assert.equal(draw(named("O".repeat(18)), { shots: true }).nameSize, SMALLEST_NAME, "18 capital O land exactly on the floor");
  // 19 would need less than 30 px: refused, not squeezed below the floor
  for (const paper of ["app", "white"]) {
    refused(draw(named("O".repeat(19)), { paper, shots: true }), "even at its smallest size (30 px)", `19 capital O beside an upright tablet on ${paper}`);
  }
  // beside wide screens there is more room: the same 19 letters keep their own size
  const wide = draw(framed("tablet", "wide", named("O".repeat(19))));
  ready(wide, "19 capital O beside wide screens");
  assert.equal(wide.nameSize, 31);
});

test("a name far too wide is refused by name in every frame, and a long name in small letters is not", { skip }, () => {
  for (const [kind, screens] of [["tablet", "upright"], ["tablet", "wide"], ["phone", "upright"], ["desktop", "wide"]]) {
    refused(draw(framed(kind, screens, named("W".repeat(28)))), 'The name "' + "W".repeat(28) + '" is too wide for the cover', `28 capital W, ${kind} ${screens}`);
  }
  // a long name in ordinary letters starts at the 30 px floor and fits there: the floor is a size, not a refusal
  const long = draw(named("A walking club for all of us"), { shots: true });
  ready(long, "a 28-character name in small letters");
  assert.equal(long.nameSize, 30);
});

test("a page too full from top to bottom is still refused, and one that fits is not", { skip }, () => {
  const long = "A long line that fills its card with plain short words so that it wraps onto several lines of the page. ".repeat(2).slice(0, 198);
  let text = line(TRAILHEAD, "- For whom:", `- For whom: ${long}\n- More: ${long}`);
  text = line(text, "- Where it runs:", `- Where it runs: ${long}`);
  text = line(text, "? Why it was built:", `? Why it was built: ${long}`);
  ready(draw(text, { shots: true }), "four cards of 198 characters beside an upright screen (they fit)");
  // beside a wide screen the cards' column is narrower: the same words no longer fit
  refused(draw(text.replace("- screens: upright", "- screens: wide")), "too full", "the same four cards beside a wide screen");
});

test("controls: every frame, upright and wide, draws short content without a false refusal", { skip }, () => {
  for (const kind of ["phone", "tablet", "desktop", "website"]) {
    for (const screens of ["upright", "wide"]) {
      ready(draw(framed(kind, screens), { paper: screens === "wide" ? "white" : "app" }), `${kind}, ${screens}`);
    }
  }
});

test("controls: Arabic, right to left, with wide screens", { skip }, () => {
  ready(draw(CLINIC.replace("- kind: phone", "- kind: tablet\n- screens: wide")), "the Arabic example on wide screens");
});
