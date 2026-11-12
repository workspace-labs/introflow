/* introflow: reads the text copy (intro.md) into an introduction, or refuses it in plain words.
   No page access here (no `document`), so the same file runs in a browser and in Node's tests.
   The shape it reads is documented in references/intro-format.md. */
(function (root) {
  "use strict";

  // The colour rules live in theme.js: loaded before this file on the page, required in Node's tests.
  var colours = (root.Introflow && root.Introflow.theme) || require("./theme.js");

  var VERSION = "0.1.0";

  var KINDS = ["phone", "tablet", "desktop", "website"];
  var SHAPES = ["upright", "wide"];
  var LANGUAGES = ["en", "ar"];
  var DRAWINGS = ["rings", "squares", "dots", "none"];
  var ORDERS = ["steps", "windows"];
  var STATUSES = ["draft", "approved"];
  var ICONS = ["phone", "tablet", "desktop", "globe", "offline", "pen", "lock", "people", "clock", "print"];
  var SETTINGS = ["kind", "screens", "language", "about", "stage", "accent", "drawing", "paper", "client", "by",
    "date", "version", "status", "approved", "next"];
  var WHAT_SETTINGS = ["order", "main", "sub"];
  var SECTIONS = ["facts", "who", "what", "different"];
  // How many lines each section may hold: [fewest, most].
  var COUNTS = { facts: [1, 3], who: [2, 4], what: [2, 4], different: [2, 4] };
  var LIMITS = {
    name: 28, about: 260, person: 60, next: 120, sub: 80,
    factLabel: 16, factValue: 30, whoLabel: 28, whoText: 200,
    stepName: 24, stepTag: 28, stepCaption: 120, differentLabel: 34, differentText: 140
  };
  var PICTURE = /\.(png|jpe?g|webp)$/i;

  var TITLE = /^#\s+(.+?)\s*$/;
  var SECTION = /^##\s+(.+?)\s*$/;
  var SETTING = /^\s*[-*]\s+([A-Za-z][A-Za-z-]*)\s*:\s*(.*?)\s*$/;
  // "- Label: text" is a fact from the records; "? Label: text" is the AI's own guess, still to confirm.
  var CARD = /^\s*([-*?])\s+(.+?)\s*:\s+(.+?)\s*$/;
  var FACT = /^\s*[-*]\s+(.+?)\s*(?:\[\s*([A-Za-z]+)\s*\])?\s*:\s+(.+?)\s*$/;
  var STEP = /^(\d+)\.\s+(.+?)\s*(?:\|\s*(.+?)\s*)?:\s+(.+?)\s*$/;
  var SHOT = /^\s+shot\s*:\s*(.*?)\s*$/i;
  var CUT = /^\s+cut\s*:\s*(\d+(?:\.\d+)?)\s*%?\s*,\s*(\d+(?:\.\d+)?)\s*%?\s*$/i;
  var CUT_ANY = /^\s+cut\s*:/i;
  // A picture's path is file and folder names split by "/". These characters make a browser or Windows read it
  // as more than a name (":" for a web link or a drive, "\", "%", "?", "#"), or no file can have them.
  var PATH_BAD_CHAR = /[<>:"\\|?*%#\u0000-\u001f\u007f]/;

  function quote(text) { return '"' + String(text).trim() + '"'; }

  function parse(text) {
    var problems = [];
    var project = { name: "", line: 0, settings: {} };
    var sections = {};          // key → { line, items: [], settings: {} }
    var settingLines = {};
    var section = null;
    var lastStep = null;
    var seenTitle = false;

    function problem(line, message) { problems.push({ line: line, text: message }); }
    function tooLong(line, what, value, limit) {
      if (value.length > limit) problem(line, what + " is too long (" + value.length + " characters; the most is " + limit + "). Shorten it.");
    }

    var lines = String(text == null ? "" : text).replace(/\r\n?/g, "\n").split("\n");
    for (var i = 0; i < lines.length; i++) {
      var n = i + 1, raw = lines[i], m;
      if (!raw.trim()) continue;

      // HTML reads script delimiters before this reader runs, so they are refused in the master text itself.
      if (/<\/script(?=[\t\f\r />]|$)/i.test(raw) || raw.indexOf("<!--") >= 0) {
        problem(n, "This text would break the page's embedded copy. Remove closing script tags and HTML comment openings before copying it into intro.html.");
      }

      if (!seenTitle) {
        seenTitle = true;
        project.line = n;
        m = TITLE.exec(raw);
        if (m && raw.indexOf("##") !== 0) { project.name = m[1]; tooLong(n, "The project's name", m[1], LIMITS.name); }
        else problem(n, "The file must start with the project's name, as a line like: # Trailhead");
        continue;
      }

      if ((m = SECTION.exec(raw))) {
        var key = m[1].toLowerCase();
        lastStep = null;
        if (SECTIONS.indexOf(key) < 0) {
          problem(n, quote(m[1]) + " is not a section. The sections are: ## facts, ## who, ## what, ## different.");
          section = { key: "", items: [], settings: {} };
        } else if (sections[key]) {
          problem(n, "## " + key + " is written twice (also on line " + sections[key].line + "). Keep one.");
          section = sections[key];
        } else {
          section = sections[key] = { key: key, line: n, items: [], settings: {} };
        }
        continue;
      }

      if (TITLE.test(raw)) {
        problem(n, "Only one # line is allowed: the project's name. Start a section with ## instead.");
        continue;
      }

      if (!section) { readSetting(n, raw); continue; }
      if (section.key === "facts") readFact(n, raw);
      else if (section.key === "what") readWhat(n, raw);
      else if (section.key) readCard(n, raw);
    }

    function readSetting(n, raw) {
      var m = SETTING.exec(raw);
      if (!m) {
        problem(n, "I can't read this line before the first section: " + quote(raw) + ". Settings look like: - kind: tablet.");
        return;
      }
      var key = m[1].toLowerCase();
      if (SETTINGS.indexOf(key) < 0) problem(n, quote(m[1]) + " is not a setting. The settings are: " + SETTINGS.join(", ") + ".");
      else if (settingLines[key]) problem(n, quote(key) + " is set twice (also on line " + settingLines[key] + "). Keep one.");
      else { project.settings[key] = m[2]; settingLines[key] = n; }
    }

    function readFact(n, raw) {
      var m = FACT.exec(raw);
      if (!m) { problem(n, "A fact looks like: - Device [tablet]: Android tablet. I can't read: " + quote(raw)); return; }
      var icon = (m[2] || "").toLowerCase();
      if (icon && ICONS.indexOf(icon) < 0) problem(n, quote(m[2]) + " is not an icon. The icons are: " + ICONS.join(", ") + ".");
      tooLong(n, "The fact's label", m[1], LIMITS.factLabel);
      tooLong(n, "The fact's value", m[3], LIMITS.factValue);
      section.items.push({ label: m[1], icon: icon, value: m[3], line: n });
    }

    function readCard(n, raw) {
      var m = CARD.exec(raw);
      if (!m) { problem(n, "A line here looks like: - Label: its text (or ? Label: its text for a guess). I can't read: " + quote(raw)); return; }
      var who = section.key === "who";
      tooLong(n, "The label", m[2], who ? LIMITS.whoLabel : LIMITS.differentLabel);
      tooLong(n, "The text", m[3], who ? LIMITS.whoText : LIMITS.differentText);
      section.items.push({ label: m[2], text: m[3], guess: m[1] === "?", line: n });
    }

    function readWhat(n, raw) {
      var m;
      if ((m = SHOT.exec(raw))) {
        if (!lastStep) { problem(n, "A shot: line must sit under a numbered screen."); return; }
        if (lastStep.shot) { problem(n, "This screen already has a shot: line. Keep one."); return; }
        var bad = pathProblem(m[1]);
        if (bad) problem(n, bad); else lastStep.shot = m[1];
        return;
      }
      if (CUT_ANY.test(raw)) {
        m = CUT.exec(raw);
        if (!lastStep) problem(n, "A cut: line must sit under a numbered screen.");
        else if (!m || Number(m[1]) > 100 || Number(m[2]) > 100) problem(n, "A cut: line is two numbers from 0 to 100: how far the cut starts from the picture's left edge and from its top, in percent. Like: cut: 3%, 27%");
        else if (lastStep.cut) problem(n, "This screen already has a cut: line. Keep one.");
        else { lastStep.cut = { x: Number(m[1]), y: Number(m[2]) }; lastStep.cutLine = n; }
        return;
      }
      if ((m = STEP.exec(raw))) {
        var number = Number(m[1]);
        if (number !== section.items.length + 1) problem(n, "Screens are numbered 1, 2, 3 in order. This one should be " + (section.items.length + 1) + ".");
        tooLong(n, "The screen's name", m[2], LIMITS.stepName);
        if (m[3]) tooLong(n, "The screen's tag", m[3], LIMITS.stepTag);
        tooLong(n, "The screen's caption", m[4], LIMITS.stepCaption);
        lastStep = { name: m[2], tag: m[3] || "", caption: m[4], shot: "", cut: null, line: n };
        section.items.push(lastStep);
        return;
      }
      m = SETTING.exec(raw);
      if (m && WHAT_SETTINGS.indexOf(m[1].toLowerCase()) >= 0) {
        var key = m[1].toLowerCase();
        if (section.settings[key] !== undefined) problem(n, quote(key) + " is set twice in ## what. Keep one.");
        else { section.settings[key] = m[2]; section.settings[key + "Line"] = n; }
        return;
      }
      problem(n, "A screen looks like: 1. Live map: what it shows. (Add a tag with |, like: 1. Live map | During the exercise: …). I can't read: " + quote(raw));
    }

    function pathProblem(value) {
      if (!value) return "The shot: line needs a picture's path, like: shot: screenshots/1-overview.png";
      if (value.charAt(0) === "/" || value.split("/").indexOf("..") >= 0 || PATH_BAD_CHAR.test(value)) {
        return "A picture's path is plain folder and file names next to this page, like screenshots/1-overview.png: no web links, no .., no leading /, none of < > : \" \\ | ? * % #.";
      }
      if (!PICTURE.test(value)) return "A picture must be a .png, .jpg, .jpeg or .webp file.";
      return "";
    }

    // ----- the whole file, after every line is read -----
    var s = project.settings, end = lines.length || 1;
    if (!seenTitle) problem(1, "The file is empty. It must start with the project's name, as a line like: # Trailhead");

    function oneOf(key, list, fallback) {
      var value = (s[key] || "").toLowerCase();
      if (!value) return fallback;
      if (list.indexOf(value) < 0) { problem(settingLines[key], quote(s[key]) + " is not a " + key + ". Use one of: " + list.join(", ") + "."); return fallback; }
      return value;
    }

    if (!s.kind) problem(project.line || 1, "Add the kind of project under its name: - kind: phone, tablet, desktop or website.");
    var kind = oneOf("kind", KINDS, "tablet");
    var screens = oneOf("screens", SHAPES, kind === "desktop" || kind === "website" ? "wide" : "upright");
    var language = oneOf("language", LANGUAGES, "en");
    var drawing = oneOf("drawing", DRAWINGS, "none");
    var paper = oneOf("paper", colours.PAPERS, "app");
    var status = oneOf("status", STATUSES, "draft");

    if (!s.about) problem(project.line || 1, "Add what the project is, in two or three sentences: - about: …");
    else tooLong(settingLines.about, "The about line", s.about, LIMITS.about);
    ["client", "by"].forEach(function (key) { if (s[key]) tooLong(settingLines[key], quote(key), s[key], LIMITS.person); });
    if (s.next) tooLong(settingLines.next, "The next line", s.next, LIMITS.next);
    ["stage", "accent"].forEach(function (key) {
      if (s[key] && !colours.hex(s[key])) problem(settingLines[key], quote(s[key]) + " is not a colour. Write it as hex, like #0a0e0d.");
    });

    var version = 1;
    if (s.version !== undefined) {
      if (/^[1-9]\d{0,3}$/.test(s.version)) version = Number(s.version);
      else problem(settingLines.version, "The version is a whole number: 1, 2, 3 …");
    }
    ["date", "approved"].forEach(function (key) {
      if (s[key] && !isDay(s[key])) problem(settingLines[key], quote(key) + " is a day written as YYYY-MM-DD, like 2026-11-12.");
    });
    if (status === "approved" && !s.approved) problem(settingLines.status, "An approved introduction needs the day it was approved: - approved: YYYY-MM-DD");
    if (status !== "approved" && s.approved) problem(settingLines.approved, "approved: is only for status: approved. A draft has no approval day.");

    SECTIONS.forEach(function (key) {
      var sec = sections[key], range = COUNTS[key];
      if (!sec) { problem(end, "The section ## " + key + " is missing."); return; }
      if (sec.items.length < range[0] || sec.items.length > range[1]) {
        problem(sec.line, "## " + key + " holds " + range[0] + " to " + range[1] + " lines; it has " + sec.items.length + ".");
      }
    });

    // A guess is the AI's own reading. It may be shown in a draft, never approved as a fact.
    var guesses = 0;
    ["who", "different"].forEach(function (key) {
      (sections[key] ? sections[key].items : []).forEach(function (item) {
        if (!item.guess) return;
        guesses++;
        if (status === "approved") problem(item.line, "This line is still a guess (it starts with ?). When the owner confirms it, change ? to - ; only then can the status be approved.");
      });
    });

    var what = sections.what || { items: [], settings: {} };
    var ws = what.settings;
    var order = "windows";
    if (ws.order !== undefined) {
      if (ORDERS.indexOf(ws.order.toLowerCase()) >= 0) order = ws.order.toLowerCase();
      else problem(ws.orderLine, "order: is steps (the screens follow one another, so they are numbered) or windows (they do not).");
    }
    var main = 1;
    if (ws.main !== undefined) {
      if (/^\d+$/.test(ws.main) && Number(ws.main) >= 1 && Number(ws.main) <= what.items.length) main = Number(ws.main);
      else problem(ws.mainLine, "main: is the number of the screen shown largest, from 1 to " + what.items.length + ".");
    }
    if (ws.sub) tooLong(ws.subLine, "The sub line", ws.sub, LIMITS.sub);
    what.items.forEach(function (step) {
      if (step.cut && !step.shot) problem(step.cutLine, "cut: needs the screen's picture. Add a shot: line above it.");
    });

    problems.sort(function (a, b) { return a.line - b.line; });
    function items(key) { return sections[key] ? sections[key].items : []; }
    return {
      ok: problems.length === 0,
      problems: problems,
      intro: {
        name: project.name, kind: kind, screens: screens, language: language, about: s.about || "",
        stage: colours.hex(s.stage), accent: colours.hex(s.accent), drawing: drawing, paper: paper,
        client: s.client || "", by: s.by || "", date: s.date || "", version: version, status: status,
        approved: s.approved || "", next: s.next || "", guesses: guesses,
        facts: items("facts"), who: items("who"), different: items("different"),
        what: { order: order, main: main, sub: ws.sub || "", steps: what.items }
      }
    };
  }

  // A real calendar day, written YYYY-MM-DD.
  function isDay(value) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!m) return false;
    var d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
    return d.getUTCFullYear() === Number(m[1]) && d.getUTCMonth() === Number(m[2]) - 1 && d.getUTCDate() === Number(m[3]);
  }

  var api = { VERSION: VERSION, KINDS: KINDS, ICONS: ICONS, DRAWINGS: DRAWINGS, LIMITS: LIMITS, COUNTS: COUNTS, parse: parse };
  root.Introflow = root.Introflow || {};
  root.Introflow.model = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
