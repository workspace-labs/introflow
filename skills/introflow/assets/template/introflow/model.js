/* introflow: reads the text copy (intro.md) into an introduction, or refuses it in plain words.
   No page access here (no `document`), so the same file runs in a browser and in Node's tests.
   The shape it reads is documented in references/intro-format.md. */
(function (root) {
  "use strict";

  // The colour rules live in theme.js: loaded before this file on the page, required in Node's tests.
  var colours = (root.Introflow && root.Introflow.theme) || require("./theme.js");

  var VERSION = "0.2.0";

  var KINDS = ["phone", "tablet", "desktop", "website"];
  var SHAPES = ["upright", "wide"];
  var LANGUAGES = ["en", "ar"];
  var DRAWINGS = ["rings", "squares", "dots", "none"];
  var ORDERS = ["steps", "windows"];
  var STATUSES = ["draft", "approved"];
  // How much the owner asked for. "simple" is a short four-page introduction of up to four windows. "full"
  // (the default) describes every window and feature the text copy holds, as many pages as that takes.
  // "book" is drawn exactly like "full": the difference is how much the agent writes.
  var DEPTHS = ["simple", "full", "book"];
  var ICONS = ["phone", "tablet", "desktop", "globe", "offline", "pen", "lock", "people", "clock", "print"];
  var SETTINGS = ["kind", "screens", "language", "about", "stage", "accent", "drawing", "paper", "client", "by",
    "date", "version", "status", "approved", "next", "depth"];
  var WHAT_SETTINGS = ["order", "main", "sub"];
  var SECTIONS = ["facts", "introduction", "who", "what", "features", "different", "conclusion"];
  var NEEDED = ["facts", "who", "what", "different"];   // the introduction, the features and the conclusion may be left out
  var PROSE = ["introduction", "conclusion"];          // sections made of paragraphs
  /* How many lines each section may hold: [fewest, most]. The project and the owner decide how long the
     description is, so the windows and the features have no upper limit. A page-sized part (the three facts on
     the cover, the cards beside one screen) has one. A "simple" introduction is four pages by definition. */
  var COUNTS = { facts: [1, 3], introduction: [1, 12], who: [1, 4], what: [1, Infinity], features: [1, Infinity], different: [1, 8], conclusion: [1, 12] };
  var SIMPLE = { what: [2, 4], different: [2, 4] };
  // Under one window: how many of each line, at most. More than a page holds simply continues on the next.
  var PER_WINDOW = { more: 8, sees: 6, does: 6, feature: 12 };
  var LIMITS = {
    name: 28, about: 260, person: 60, next: 120, sub: 80,
    factLabel: 16, factValue: 30, whoLabel: 28, whoText: 200,
    stepName: 24, stepTag: 28, stepCaption: 200, differentLabel: 34, differentText: 140,
    partTitle: 34, partLine: 120, more: 600, point: 120, featureName: 34, featureText: 300, paragraph: 700
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
  // "### Stock: Everything on the shelves" opens a part of the app; the line after the colon is optional.
  var PART = /^###\s+(.+?)\s*(?::\s+(.+?)\s*)?$/;
  // Under a window: a longer paragraph, what the user sees, what the user does, a feature of that window.
  var DETAIL = /^\s+(more|sees|does|feature)\s*:\s*(.*?)\s*$/i;
  var NAMED = /^(.+?)\s*:\s+(.+)$/;
  // A paragraph of the introduction or the conclusion: "- text", or "? text" for a guess.
  var PARAGRAPH = /^\s*([-*?])\s+(.+?)\s*$/;
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
          problem(n, quote(m[1]) + " is not a section. The sections are: ## facts, ## introduction, ## who, ## what, ## features, ## different, ## conclusion.");
          section = { key: "", items: [], settings: {}, parts: [] };
        } else if (sections[key]) {
          problem(n, "## " + key + " is written twice (also on line " + sections[key].line + "). Keep one.");
          section = sections[key];
        } else {
          section = sections[key] = { key: key, line: n, items: [], settings: {}, parts: [] };
        }
        continue;
      }

      if (TITLE.test(raw)) {
        problem(n, "Only one # line is allowed: the project's name. Start a section with ## instead.");
        continue;
      }

      if (!section) { readSetting(n, raw); continue; }
      if (PART.test(raw) && section.key !== "what") { problem(n, "A part (a line starting with ###) belongs inside ## what, above its windows."); continue; }
      if (section.key === "facts") readFact(n, raw);
      else if (section.key === "what") readWhat(n, raw);
      else if (PROSE.indexOf(section.key) >= 0) readParagraph(n, raw);
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

    function readParagraph(n, raw) {
      var m = PARAGRAPH.exec(raw);
      if (!m) { problem(n, "A paragraph here is one line starting with - (or with ? for a guess). I can't read: " + quote(raw)); return; }
      tooLong(n, "The paragraph", m[2], LIMITS.paragraph);
      section.items.push({ text: m[2], guess: m[1] === "?", line: n });
    }

    function readCard(n, raw) {
      var m = CARD.exec(raw);
      if (!m) { problem(n, "A line here looks like: - Label: its text (or ? Label: its text for a guess). I can't read: " + quote(raw)); return; }
      var limit = section.key === "who" ? [LIMITS.whoLabel, LIMITS.whoText]
        : section.key === "features" ? [LIMITS.featureName, LIMITS.featureText] : [LIMITS.differentLabel, LIMITS.differentText];
      tooLong(n, "The label", m[2], limit[0]);
      tooLong(n, "The text", m[3], limit[1]);
      section.items.push({ label: m[2], text: m[3], guess: m[1] === "?", line: n });
    }

    function readWhat(n, raw) {
      var m;
      if ((m = PART.exec(raw))) {
        tooLong(n, "The part's title", m[1], LIMITS.partTitle);
        if (m[2]) tooLong(n, "The part's line", m[2], LIMITS.partLine);
        if (section.items.length && !section.parts.length) problem(n, "When the windows are grouped in parts, every window sits under a part. Move this ### line above the first window.");
        section.parts.push({ title: m[1], line: m[2] || "", at: n, first: section.items.length });
        lastStep = null;
        return;
      }
      if ((m = DETAIL.exec(raw))) {
        var kind = m[1].toLowerCase(), value = m[2];
        if (!lastStep) { problem(n, "A " + kind + ": line must sit under a numbered window."); return; }
        if (!value) { problem(n, "The " + kind + ": line is empty."); return; }
        if (lastStep[kind].length >= PER_WINDOW[kind]) { problem(n, "A window holds at most " + PER_WINDOW[kind] + " " + kind + ": lines. Join two of them into one, or describe the rest as a second window: nothing needs to be left out."); return; }
        if (kind === "feature") {
          var f = NAMED.exec(value);
          if (!f) { problem(n, "A feature looks like: feature: Its name: what it does."); return; }
          tooLong(n, "The feature's name", f[1], LIMITS.featureName);
          tooLong(n, "The feature's text", f[2], LIMITS.featureText);
          lastStep.feature.push({ label: f[1], text: f[2], line: n });
        } else {
          tooLong(n, "The " + kind + ": line", value, kind === "more" ? LIMITS.more : LIMITS.point);
          lastStep[kind].push(value);
        }
        return;
      }
      if ((m = SHOT.exec(raw))) {
        if (!lastStep) { problem(n, "A shot: line must sit under a numbered window."); return; }
        if (lastStep.shot) { problem(n, "This window already has a shot: line. Keep one."); return; }
        var bad = pathProblem(m[1]);
        if (bad) problem(n, bad); else lastStep.shot = m[1];
        return;
      }
      if (CUT_ANY.test(raw)) {
        m = CUT.exec(raw);
        if (!lastStep) problem(n, "A cut: line must sit under a numbered window.");
        else if (!m || Number(m[1]) > 100 || Number(m[2]) > 100) problem(n, "A cut: line is two numbers from 0 to 100: how far the cut starts from the picture's left edge and from its top, in percent. Like: cut: 3%, 27%");
        else if (lastStep.cut) problem(n, "This window already has a cut: line. Keep one.");
        else { lastStep.cut = { x: Number(m[1]), y: Number(m[2]) }; lastStep.cutLine = n; }
        return;
      }
      if ((m = STEP.exec(raw))) {
        var number = Number(m[1]);
        if (number !== section.items.length + 1) problem(n, "Windows are numbered 1, 2, 3 in order, through every part. This one should be " + (section.items.length + 1) + ".");
        tooLong(n, "The window's name", m[2], LIMITS.stepName);
        if (m[3]) tooLong(n, "The window's tag", m[3], LIMITS.stepTag);
        tooLong(n, "The window's caption", m[4], LIMITS.stepCaption);
        lastStep = { name: m[2], tag: m[3] || "", caption: m[4], shot: "", cut: null, more: [], sees: [], does: [], feature: [], part: section.parts.length - 1, line: n };
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
      problem(n, "A window looks like: 1. Live map: what it shows. (Add a tag with |, like: 1. Live map | During the exercise: …). I can't read: " + quote(raw));
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
    var depth = oneOf("depth", DEPTHS, "full");
    var simple = depth === "simple";

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
      var sec = sections[key], range = (simple && SIMPLE[key]) || COUNTS[key];
      if (!sec) { if (NEEDED.indexOf(key) >= 0) problem(end, "The section ## " + key + " is missing."); return; }
      var count = sec.items.length, most = range[1] === Infinity ? "" : " to " + range[1];
      if (count < range[0] || count > range[1]) {
        problem(sec.line, "## " + key + " holds " + (most ? range[0] + most : "at least " + range[0]) + " lines" +
          (simple && SIMPLE[key] ? " in a simple introduction" : "") + "; it has " + count + "." +
          (simple && count > range[1] ? " To describe every window, use - depth: full." : ""));
      }
    });
    // A simple introduction is four fixed pages: it has no place for parts, features or longer text.
    if (simple && sections.what) {
      if (sections.what.parts.length) problem(sections.what.parts[0].at, "A simple introduction has no parts. Remove the ### lines, or use - depth: full.");
      sections.what.items.forEach(function (step) {
        if (step.more.length || step.sees.length || step.does.length || step.feature.length) {
          problem(step.line, "A simple introduction shows only a window's name and caption. Remove its more:, sees:, does: and feature: lines, or use - depth: full.");
        }
      });
    }
    if (simple && sections.features) problem(sections.features.line, "A simple introduction has no features page. Remove ## features, or use - depth: full.");
    PROSE.forEach(function (key) {
      if (simple && sections[key]) problem(sections[key].line, "A simple introduction is four pages and has no " + key + " page. Remove ## " + key + ", or use - depth: full.");
    });
    if (sections.what) sections.what.parts.forEach(function (part, i, all) {
      var next = i + 1 < all.length ? all[i + 1].first : sections.what.items.length;
      if (next === part.first) problem(part.at, "The part " + quote(part.title) + " has no windows under it.");
    });

    // A guess is the AI's own reading. It may be shown in a draft, never approved as a fact.
    var guesses = 0;
    ["introduction", "who", "features", "different", "conclusion"].forEach(function (key) {
      (sections[key] ? sections[key].items : []).forEach(function (item) {
        if (!item.guess) return;
        guesses++;
        if (status === "approved") problem(item.line, "This line is still a guess (it starts with ?). When the owner confirms it, change ? to - ; only then can the status be approved.");
      });
    });

    var what = sections.what || { items: [], settings: {}, parts: [] };
    var ws = what.settings;
    var order = "windows";
    if (ws.order !== undefined) {
      if (ORDERS.indexOf(ws.order.toLowerCase()) >= 0) order = ws.order.toLowerCase();
      else problem(ws.orderLine, "order: is steps (the windows follow one another, so they are numbered) or windows (they do not).");
    }
    var main = 1;
    if (ws.main !== undefined) {
      if (/^\d+$/.test(ws.main) && Number(ws.main) >= 1 && Number(ws.main) <= what.items.length) main = Number(ws.main);
      else problem(ws.mainLine, "main: is the number of the window shown largest, from 1 to " + what.items.length + ".");
    }
    if (ws.sub) tooLong(ws.subLine, "The sub line", ws.sub, LIMITS.sub);
    what.items.forEach(function (step) {
      if (step.cut && !step.shot) problem(step.cutLine, "cut: needs the window's picture. Add a shot: line above it.");
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
        approved: s.approved || "", next: s.next || "", guesses: guesses, depth: depth,
        facts: items("facts"), introduction: items("introduction"), who: items("who"), features: items("features"),
        different: items("different"), conclusion: items("conclusion"),
        what: {
          order: order, main: main, sub: ws.sub || "", steps: what.items,
          parts: what.parts.map(function (part) { return { title: part.title, line: part.line }; })
        }
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

  var api = { VERSION: VERSION, KINDS: KINDS, ICONS: ICONS, DRAWINGS: DRAWINGS, DEPTHS: DEPTHS, LIMITS: LIMITS, COUNTS: COUNTS, SIMPLE: SIMPLE, PER_WINDOW: PER_WINDOW, parse: parse };
  root.Introflow = root.Introflow || {};
  root.Introflow.model = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
