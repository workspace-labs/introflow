// The drawn page: an introduction is either drawn cleanly ("ready") or refused, never clipped or squeezed.
// These checks open the real template in a browser (see support/page.js). Skipped, with a reason, without one.
const test = require("node:test");
const assert = require("node:assert/strict");
const { skip, TRAILHEAD, FULL, CLINIC, draw, line } = require("./support/page.js");

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

// ---------- the full description: as many pages as the project needs ----------

// A made-up project of any size, with no pictures.
function project(windows, { partsOf = 0, more = 0, features = 0 } = {}) {
  const lines = ["# Big Suite", "- kind: desktop", "- about: A large made-up suite, used only to check that a description has no page limit.",
    "## facts", "- Device [desktop]: Desktop app", "## who", "- For whom: A whole company.", "## what"];
  for (let i = 1; i <= windows; i++) {
    if (partsOf && (i - 1) % partsOf === 0) lines.push(`### Area ${(i - 1) / partsOf + 1}: Everything in this area`);
    lines.push(`${i}. Window ${i}: What window ${i} is for, in one plain sentence.`);
    for (let k = 0; k < more; k++) lines.push(`   more: ${"A paragraph about this window, long enough to wrap onto more lines of the page. ".repeat(4).trim()}`);
  }
  if (features) { lines.push("## features"); for (let i = 1; i <= features; i++) lines.push(`- Feature ${i}: What feature ${i} does for the people who use it.`); }
  lines.push("## different", "- No limit: The description is as long as the project.");
  return lines.join("\n") + "\n";
}
function drawn(result, what, pageWords = (n, m) => `Page ${n} of ${m}`) {
  assert.equal(result.state, "ready", `${what} should draw. Problems: ${result.problems.join(" | ")}`);
  // every page but the cover is numbered "Page n of m", in order, and m is the real number of pages
  assert.equal(result.feet.length, result.pages - 1, `${what}: every page but the cover has a footer`);
  result.feet.forEach((words, i) => assert.equal(words, pageWords(i + 2, result.pages), `${what}: the footer of page ${i + 2}`));
  // the contents page points at the page where each thing really starts
  for (const [ref, page] of result.refs) assert.equal(result.ids[page - 1], ref, `${what}: the contents send "${ref}" to page ${page}`);
}

test("the full example draws: a contents page, an opening page for each part, a page for every window", { skip }, () => {
  for (const paper of ["app", "white"]) {
    for (const shots of [true, false]) {
      const result = draw(FULL, { paper, shots });
      drawn(result, `the full example on ${paper}${shots ? " with pictures" : ""}`);
      assert.equal(result.kinds[0], "cover");
      assert.equal(result.kinds[1], "inside");
      assert.equal(result.ids.filter((id) => /^part\d+$/.test(id)).length, 2, "two parts, two opening pages");
      assert.deepEqual(result.refs.map((r) => r[0]), ["introduction", "who", "w0", "w1", "w2", "w3", "features", "different", "conclusion"]);
      assert.equal(result.kinds[2], "prose", "the introduction follows the contents");
      assert.equal(result.kinds[result.kinds.length - 1], "prose", "the conclusion is the last page");
      assert.ok(result.pages > 4, "longer than a simple introduction");
    }
  }
});

test("there is no page limit: 60 windows in 6 parts, with 30 features, are all drawn", { skip }, () => {
  const result = draw(project(60, { partsOf: 10, more: 1, features: 30 }));
  drawn(result, "60 windows");
  assert.equal(result.refs.filter((r) => /^w\d+$/.test(r[0])).length, 60, "all 60 windows are in the contents");
  assert.equal(result.ids.filter((id) => /^part\d+$/.test(id)).length, 6, "six parts, six opening pages");
  assert.ok(result.kinds.filter((k) => k === "inside").length >= 3, "the contents themselves run over several pages");
  assert.ok(result.pages >= 60 + 6 + 3, `at least a page a window: got ${result.pages}`);
});

test("a window with a lot to say runs on to further pages instead of being squeezed or refused", { skip }, () => {
  const result = draw(project(2, { more: 8 }));
  drawn(result, "two windows with eight paragraphs each");
  assert.ok(result.kinds.filter((k) => k === "window").length > 2, "the windows needed more than a page each");
});

test("a part with one window has no opening page of its own; a small project needs no parts at all", { skip }, () => {
  const lonely = draw(project(3, { partsOf: 1 }));
  drawn(lonely, "three parts of one window each");
  assert.equal(lonely.kinds.filter((k) => k === "part").length, 0);
  const small = draw(project(1));
  drawn(small, "one window, no parts");
  assert.deepEqual(small.kinds, ["cover", "inside", "who", "window", "different"]);
});

test("a full description is drawn in every frame and shape, and in Arabic", { skip }, () => {
  for (const kind of ["phone", "tablet", "desktop", "website"]) {
    for (const screens of ["upright", "wide"]) {
      drawn(draw(FULL.replace("- kind: tablet\n- screens: upright", `- kind: ${kind}\n- screens: ${screens}`), { paper: screens === "wide" ? "white" : "app" }), `full, ${kind}, ${screens}`);
    }
  }
  const arabic = CLINIC.replace("- depth: simple\n", "").replace("## different", "## features\n- تذكير: رسالة قبل الموعد.\n\n## different");
  const result = draw(arabic);
  drawn(result, "the Arabic example as a full description", (n, m) => `صفحة ${n} من ${m}`);
  assert.equal(result.kinds.filter((k) => k === "window").length, 3);
});

test("a long introduction runs on to further pages, and its contents entry still points at its first page", { skip }, () => {
  const long = Array.from({ length: 12 }, (_, i) => `- Paragraph ${i + 1}. ` + "A sentence of plain words that fills the line and wraps. ".repeat(10).trim()).join("\n");
  const result = draw(FULL.replace(/## introduction[\s\S]*?## who/, "## introduction\n" + long + "\n\n## who"));
  drawn(result, "twelve long paragraphs of introduction");
  assert.ok(result.kinds.filter((k) => k === "prose").length >= 3, "the introduction took more than one page");
});

test("one paragraph too long for a whole page is refused by the window's name, not cut off", { skip }, () => {
  const text = project(1).replace("1. Window 1: What window 1 is for, in one plain sentence.", "1. Window 1: What it is for.\n" +
    Array.from({ length: 8 }, () => "   more: " + "word ".repeat(119).trim()).join("\n"));
  const result = draw(text);
  assert.equal(result.state, "ready", "eight long paragraphs flow over pages: " + result.problems.join(" | "));
  refused(draw(project(1).replace("- For whom: A whole company.", "- For whom: " + "x".repeat(190))), "Who it is for", "an unbroken word on a fixed page");
});

// ---------- review of 0.2.0, round 1 ----------

// The numbers of the SEQn_ markers found on each page, page by page.
function marksByPage(result) { return result.sheets.map((html) => [...html.matchAll(/SEQ(\d+)_/g)].map((m) => Number(m[1]))); }
// Within a window's first page, reading order is the words' column, then the room under the screen.
function marksInReadingOrder(result) {
  const out = [];
  for (const html of result.sheets) {
    const under = /<div class="under">([\s\S]*?)<\/div><\/div><div class="box">/.exec(html);
    const rest = under ? html.replace(under[1], "") : html;
    for (const part of [rest, under ? under[1] : ""]) for (const m of part.matchAll(/SEQ(\d+)_/g)) out.push(Number(m[1]));
  }
  return out;
}
function sequenced(kind, screens, count, language = "") {
  const lines = ["# Order Check", `- kind: ${kind}`, `- screens: ${screens}`, language, "- about: A made-up app, used only to check that paragraphs keep their order.",
    "## facts", "- Device: Tablet", "## who", "- For whom: A tester.", "## what", "1. Window: What it is for."];
  for (let i = 0; i < count; i++) lines.push(`   more: SEQ${i}_ ` + "Sentence explains the window and its use. ".repeat(8).slice(0, 300).trim());
  lines.push("## different", "- Order: Paragraphs stay in order.");
  return lines.filter(Boolean).join("\n") + "\n";
}

test("review F06: a window's paragraphs keep their order when its last page is balanced (they came out 0, 1, 3, 2, 4)", { skip }, () => {
  for (const [kind, screens, count, language] of [["tablet", "wide", 5, ""], ["tablet", "wide", 7, ""], ["tablet", "wide", 8, ""], ["desktop", "wide", 6, ""],
    ["tablet", "upright", 6, ""], ["tablet", "upright", 8, ""], ["phone", "upright", 7, ""], ["tablet", "wide", 5, "- language: ar"]]) {
    for (const paper of kind === "tablet" && count === 5 ? ["app", "white"] : ["app"]) {
      const what = `${count} paragraphs, ${kind} ${screens} ${language} on ${paper}`;
      const result = draw(sequenced(kind, screens, count, language), { paper });
      assert.equal(result.state, "ready", `${what}: ${result.problems.join(" | ")}`);
      const expected = Array.from({ length: count }, (_, i) => i);
      assert.deepEqual(marksInReadingOrder(result), expected, `${what}: every paragraph once, in the order it was written`);
      // and no paragraph sits on an earlier page than one written before it
      const pages = marksByPage(result).filter((p) => p.length);
      pages.forEach((p, i) => { if (i) assert.ok(Math.min(...p) > Math.max(...pages[i - 1]), `${what}: page order ${JSON.stringify(pages)}`); });
    }
  }
});

test("review F07: a part of one window has no opening page, and its sentence is still printed, once", { skip }, () => {
  const base = "# Parts Check\n- kind: tablet\n- about: A made-up app.\n## facts\n- Device: Tablet\n## who\n- For whom: A tester.\n## what\n";
  const tail = "## different\n- One: Thing.\n";
  const count = (result, words) => result.sheets.join("").split(words).length - 1;
  for (const [paper, language] of [["app", ""], ["white", ""], ["app", "- language: ar\n"]]) {
    const single = draw(base.replace("- kind: tablet\n", "- kind: tablet\n" + language) + "### Part 1: PARTLINE1 Describes the group.\n1. Only: The only window.\n### Part 2: PARTLINE2 Describes the pair.\n2. First: One.\n3. Second: Two.\n" + tail, { paper });
    assert.equal(single.state, "ready", single.problems.join(" | "));
    assert.equal(single.ids.filter((id) => /^part\d+$/.test(id)).length, 1, "only the part of two windows gets an opening page");
    assert.equal(count(single, "PARTLINE1"), 1, `the lone part's sentence is printed once (${paper} ${language})`);
    assert.equal(count(single, "PARTLINE2"), 1, "the other part's sentence is printed once, on its opening page");
    assert.ok(single.sheets[single.ids.indexOf("w0")].includes("PARTLINE1"), "it is on that window's own page");
  }
  // a lone part with no sentence adds nothing
  const bare = draw(base + "### Quiet part\n1. Only: The only window.\n" + tail);
  assert.equal(bare.state, "ready");
  assert.equal(bare.sheets.join("").includes('class="partline"'), false);
});

test("review F08: a simple introduction with two cards keeps its larger words and screens (they shrank to 14.5, 18 and 170 px)", { skip }, () => {
  // three windows and two cards: the shape the larger sizes were made for (four screens at 210 px leave no room for the closing line)
  const two = TRAILHEAD.replace(/- One kit list for the group:.*\n/, "").replace(/\? A log that teaches:.*\n/, "").replace(/4\. Trip log[\s\S]*?cut: 0%, 30%\n/, "");
  assert.equal(/4\. Trip log/.test(two), false, "the fixture has three windows");
  assert.equal((two.split("## different")[1].match(/^[-?] /gm) || []).length, 2, "the fixture has two cards");
  for (const paper of ["app", "white"]) {
    const page = draw(two, { paper, shots: true, probe: true });
    assert.equal(page.state, "ready", page.problems.join(" | "));
    assert.deepEqual(page.probe.different, { p: "17px", h3: "21px", dev: "210px" }, `two cards on ${paper}`);
  }
  // four cards keep the ordinary sizes
  const four = draw(TRAILHEAD, { shots: true, probe: true });
  assert.deepEqual(four.probe.different, { p: "14.5px", h3: "18px", dev: "170px" });
});
