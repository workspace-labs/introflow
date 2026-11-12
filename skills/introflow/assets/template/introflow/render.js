/* introflow: draws the pages from the text copy inside intro.html.
   The only file that touches the page. It never changes the look: it fills the parts introflow.css styles.

   A "simple" introduction is four fixed pages. A "full" description (the default) has no fixed length: a
   contents page, then a page for every window, with the windows' longer text flowing on to further pages,
   then the features. The project and its owner decide how long it is; nothing here sets a ceiling. */
(function () {
  "use strict";

  var I = window.Introflow, S = I.strings, ICONS = I.art.ICONS, MOTIFS = I.art.MOTIFS;
  var EDGE = 24;            // the least room between any word and the page's edge, in px
  var NAME_SMALLEST = 30;   // the cover's name is never drawn smaller than this, in px
  var CONTENTS_ROWS = 13;   // rows in one column of a contents page; two columns a page
  var LEAST_ON_A_PAGE = 220;   // a window's further page should hold at least this much, in px, or the layout is tried again

  function esc(text) {
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function hits(a, b) { return a.left < b.right - 1 && a.right > b.left + 1 && a.top < b.bottom - 1 && a.bottom > b.top + 1; }

  function draw() {
    var source = document.getElementById("intro");
    var result = I.model.parse(source ? source.textContent : "");
    var intro = result.intro, w = S.words(intro.language);
    var simple = intro.depth === "simple", docName = simple ? w.intro : w.description;
    document.documentElement.lang = w.lang;
    document.documentElement.dir = w.dir;
    document.title = (intro.name || "Project") + " · " + docName;
    if (!result.ok) return refuse(w, result.problems.map(function (p) { return S.fill(w.line, { n: p.line }) + p.text; }));

    // "both papers" prints the same page twice: ?paper=white or ?paper=app overrides the text copy for one printing.
    var asked = new URLSearchParams(location.search).get("paper");
    var paper = I.theme.PAPERS.indexOf(asked) >= 0 ? asked : intro.paper;
    var t = I.theme.theme(intro.stage, intro.accent, paper);
    var vars = { bg: t.bg, ink: t.ink, ink2: t.ink2, ink3: t.ink3, label: t.label, acc: t.acc, "on-acc": t.onAcc, line: t.line, card: t.card, glow: t.glow, motif: t.motif, gold: t.gold };
    Object.keys(vars).forEach(function (k) { document.documentElement.style.setProperty("--" + k, vars[k]); });
    document.body.className = "paper-" + t.paper + " " + intro.screens + " kind-" + intro.kind + " depth-" + (simple ? "simple" : "full");

    var steps = intro.what.steps, parts = intro.what.parts, main = steps[intro.what.main - 1];
    var rest = steps.filter(function (s) { return s !== main; });
    var name = '<span class="nm">' + esc(intro.name) + "</span>";
    var numbered = intro.what.order === "steps";
    var sizes = {};      // picture path → its real width and height; a picture that will not load is left out
    var full = [];       // what does not fit, in plain words; anything here refuses the whole document

    // ---------- the parts every page is made of ----------
    function shot(step) {
      var size = sizes[step.shot];
      // The picture's own shape is written on it, so the page can be measured before the picture is painted.
      return size ? '<img class="scr" src="' + esc(step.shot) + '" alt="' + esc(step.name) + '" style="aspect-ratio:' + size.w + " / " + size.h + '">'
        : '<div class="scr missing">' + esc(w.shotMissing) + "</div>";
    }
    function dev(step, cls) {
      var bar = intro.kind === "desktop" || intro.kind === "website" ? '<div class="bar"><i></i><i></i><i></i></div>' : "";
      return '<div class="dev kind-' + intro.kind + " " + (cls || "") + '">' + bar + shot(step) + "</div>";
    }
    function cut(step, cls) {
      var c = step.cut || { x: 0, y: 0 }, size = sizes[step.shot];
      var inner = size ? '<img src="' + esc(step.shot) + '" alt="" style="aspect-ratio:' + size.w + " / " + size.h + '" data-x="' + c.x + '" data-y="' + c.y + '">'
        : '<div class="scr missing">' + esc(w.shotMissing) + "</div>";
      return '<div class="cut ' + (cls || "") + '">' + inner + "</div>";
    }
    function num(step) { return numbered ? "<b>" + (steps.indexOf(step) + 1) + "</b>" : ""; }
    function guess(item) { return item.guess ? '<span class="guess">' + esc(w.toConfirm) + "</span>" : ""; }
    function head(right) {
      return '<div class="top"><span class="lab">' + name + " · " + esc(docName) + '</span><span class="lab quiet">' + esc(right) + "</span></div>";
    }
    // Every page after the cover: its kind, the id the contents page points at, its title for messages.
    function page(kind, id, title, right, body) {
      return '<section class="page ' + kind + '"' + (id ? ' data-id="' + id + '"' : "") + ' data-title="' + esc(title) + '"><div class="deco"></div>' +
        '<div class="flow">' + head(right) + body + '</div><div class="foot"><span></span><span></span></div></section>';
    }
    function card(c) { return '<div class="card"><h3>' + esc(c.label) + guess(c) + "</h3><p>" + esc(c.text) + "</p></div>"; }
    function strip(list) {
      return '<div class="strip">' + list.map(function (s) { return "<figure>" + dev(s) + "<figcaption>" + esc(s.name) + "</figcaption></figure>"; }).join("") + "</div>";
    }
    function next() {
      return intro.next ? '<div class="next"><b>' + (w.dir === "rtl" ? "←" : "→") + "</b><span>" + esc(intro.next) + "</span></div>" : "";
    }

    // ---------- the pages both depths share ----------
    function cover() {
      var state = intro.status === "approved" ? S.fill(w.approvedOn, { date: S.day(intro.approved, intro.language) }) : w.draft;
      var kicker = [docName, S.day(intro.date, intro.language)].filter(Boolean).map(esc).join(" · ");
      var forWhom = [state, intro.client && S.fill(w.preparedFor, { t: intro.client }), intro.by && S.fill(w.preparedBy, { t: intro.by })].filter(Boolean).map(esc).join(" · ");
      var size = Math.max(30, Math.min(98, Math.floor(400 / (Math.max(intro.name.length, 1) * 0.66))));
      var fan = rest.length >= 2
        ? dev(rest[0], "fan f1") + dev(rest[rest.length - 1], "fan f3") + dev(main, "fan f2")
        : dev(main, "fan f2 alone");
      var facts = intro.facts.map(function (f) {
        return '<div class="fact"><svg viewBox="0 0 24 24">' + ICONS[f.icon || "dot"] + "</svg><div><small>" + esc(f.label) + "</small><strong>" + esc(f.value) + "</strong></div></div>";
      }).join("");
      return '<section class="page cover" data-title="' + esc(w.cover) + '"><div class="deco">' + MOTIFS[intro.drawing]() + fan + "</div>" +
        '<div class="txt"><div class="lab">' + kicker + "</div>" + (forWhom ? '<div class="lab quiet who-for">' + forWhom + "</div>" : "") +
        '<div class="name" style="font-size:' + size + 'px">' + name + '</div><p class="lead">' + esc(intro.about) + '</p></div><div class="facts">' + facts + "</div></section>";
    }
    function who() {
      return page("who", "who", w.who, w.who, "<h2>" + esc(w.who) + '</h2><div class="cols"><div class="cards n' + intro.who.length + '">' +
        intro.who.map(function (c) { return '<div class="card"><div class="lab">' + esc(c.label) + guess(c) + "</div><p>" + esc(c.text) + "</p></div>"; }).join("") +
        "</div>" + dev(main) + "</div>");
    }

    // ---------- "simple": the four fixed pages ----------
    function simplePages(sheets) {
      sheets.insertAdjacentHTML("beforeend", cover() + who() +
        page("what", "what", w.what, w.what, "<h2>" + esc(w.what) + "</h2>" + (intro.what.sub ? '<p class="sub">' + esc(intro.what.sub) + "</p>" : "") +
          '<div class="cols"><div class="main">' + dev(main) + '<span class="lab">' + esc(main.tag) + "</span><h3>" + num(main) + esc(main.name) + '</h3><p class="t">' + esc(main.caption) + '</p></div><div class="rows">' +
          rest.map(function (s) {
            return '<div class="rowx">' + cut(s) + "<div>" + (s.tag ? '<span class="lab">' + esc(s.tag) + "</span>" : "") + "<h3>" + num(s) + esc(s.name) + '</h3><p class="t">' + esc(s.caption) + "</p></div></div>";
          }).join("") + "</div></div>") +
        page("different" + (intro.different.length <= 2 ? " few" : ""), "different", w.different, w.different, "<h2>" + esc(w.different) + '</h2><div class="grid">' +
          intro.different.map(card).join("") + '</div><div class="closing">' + strip(steps) + next() + "</div>"));
    }

    // ---------- "full": as many pages as the project needs ----------
    /* Puts blocks on pages one after another. make(again) adds a new page to the document and returns the
       boxes inside it that hold the blocks, in reading order; `again` is true for every page after the first.
       A block that reaches past its box goes to the next box, then to the next page. One that does not fit
       even alone in an empty box of a new page is reported, not squeezed. */
    function flowOn(blocks, make, title) {
      var boxes = make(false), at = 0;
      blocks.forEach(function (html) {
        for (;;) {
          var box = boxes[at], empty = !box.children.length || box.classList.contains("under");
          box.insertAdjacentHTML("beforeend", html);
          var block = box.lastElementChild;
          if (!past(box, block)) return;
          if (empty && at === 0 && boxes.fresh) { full.push(S.fill(w.fitBlock, { t: title })); return; }
          block.remove();
          if (at + 1 < boxes.length) at++;
          else { boxes = make(true); boxes.fresh = true; at = 0; }
        }
      });
    }
    // How much of a box its blocks take, from its top to the foot of the last one, in px.
    function filled(box) { return box.children.length ? box.lastElementChild.getBoundingClientRect().bottom - box.getBoundingClientRect().top : 0; }
    function past(box, block) { return block.getBoundingClientRect().bottom > box.getBoundingClientRect().bottom + 0.5; }
    function add(sheets, html) { sheets.insertAdjacentHTML("beforeend", html); return sheets.lastElementChild; }

    // The contents: every part, every window, and the pages around them. Page numbers are filled in last.
    function contents(sheets) {
      var rows = [];
      if (intro.introduction.length) rows.push({ ref: "introduction", text: w.introduction });
      rows.push({ ref: "who", text: w.who });
      steps.forEach(function (s, i) {
        if (parts.length && (i === 0 || steps[i - 1].part !== s.part)) rows.push({ part: parts[s.part].title });
        rows.push({ ref: "w" + i, text: s.name, n: numbered ? i + 1 : 0 });
      });
      if (parts.length) rows.push({ part: w.theProject });
      if (intro.features.length) rows.push({ ref: "features", text: w.features });
      rows.push({ ref: "different", text: w.different });
      if (intro.conclusion.length) rows.push({ ref: "conclusion", text: w.conclusion });
      // A part's heading never sits alone at the foot of a column: it moves on with its first window.
      var slots = [];
      rows.forEach(function (row) {
        if (row.part && slots.length % CONTENTS_ROWS === CONTENTS_ROWS - 1) slots.push(null);
        slots.push(row);
      });
      for (var at = 0; at < slots.length; at += CONTENTS_ROWS * 2) {
        var columns = [slots.slice(at, at + CONTENTS_ROWS), slots.slice(at + CONTENTS_ROWS, at + CONTENTS_ROWS * 2)].map(function (column) {
          return '<div class="col">' + column.map(function (row) {
            if (!row) return '<div class="row gap"></div>';
            if (row.part) return '<div class="row part lab">' + esc(row.part) + "</div>";
            return '<div class="row">' + (row.n ? "<i>" + row.n + "</i>" : "") + "<span>" + esc(row.text) + '</span><b data-ref="' + row.ref + '"></b></div>';
          }).join("") + "</div>";
        }).join("");
        add(sheets, page("inside", "", w.inside, w.inside, "<h2>" + esc(at ? S.fill(w.continued, { t: w.inside }) : w.inside) + "</h2>" +
          (at ? "" : '<p class="sub" data-count></p>') + '<div class="toc">' + columns + "</div>"));
      }
    }

    // A part's opening page, like a chapter's: its number, its name, its line, and every window in it, small.
    function partPages(sheets, index) {
      var part = parts[index], mine = steps.filter(function (s) { return s.part === index; });
      var right = S.fill(w.partOf, { n: index + 1, m: parts.length });
      var few = mine.length <= 3;   // a few windows are shown larger, each with its line
      flowOn(mine.map(function (s) {
        return "<figure>" + dev(s) + "<figcaption>" + num(s) + "<span>" + esc(s.name) + "</span></figcaption>" + (few ? '<p class="says">' + esc(s.caption) + "</p>" : "") + "</figure>";
      }), function (again) {
        var p = add(sheets, page("part" + (few ? " few" : ""), again ? "" : "part" + index, part.title, right,
          '<div class="chapter"><span class="count">' + (index + 1) + '</span><div><span class="lab">' + esc(right) + "</span><h2>" +
          esc(again ? S.fill(w.continued, { t: part.title }) : part.title) + "</h2>" + (part.line && !again ? '<p class="sub">' + esc(part.line) + "</p>" : "") +
          '</div></div><div class="box figures"></div>'));
        return [p.querySelector(".box")];
      }, part.title);
    }

    // One window: its screen large, and beside it everything the text copy says about it, over as many pages as it takes.
    function windowPages(sheets, step, index) {
      var right = (parts.length ? parts[step.part].title + " · " : "") + S.fill(w.windowOf, { n: index + 1, m: steps.length });
      var list = function (label, items) {
        return items.length ? '<div class="card"><div class="lab">' + esc(label) + "</div><ul>" + items.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div>" : "";
      };
      var part = parts.length ? parts[step.part] : null;
      var alone = part && steps.filter(function (s) { return s.part === step.part; }).length === 1;
      var partLine = alone && part.line ? '<p class="partline"><b>' + esc(part.title) + "</b>" + esc(part.line) + "</p>" : "";
      var head = '<div class="blk head">' + partLine + (step.tag ? '<span class="lab">' + esc(step.tag) + "</span>" : "") + "<h2>" + num(step) + "<span>" + esc(step.name) + '</span></h2><p class="lead2">' + esc(step.caption) + "</p></div>";
      var more = step.more.map(function (text) { return '<p class="blk more">' + esc(text) + "</p>"; });
      var pair = step.sees.length || step.does.length
        ? ['<div class="blk pair' + (step.sees.length && step.does.length ? "" : " one") + '">' + list(w.sees, step.sees) + list(w.does, step.does) + "</div>"] : [];
      var look = step.cut ? ['<div class="blk look"><div class="lab">' + esc(w.closer) + "</div>" + cut(step, "big") + "</div>"] : [];
      var feats = step.feature.map(function (f, i) {
        return '<div class="blk feat">' + (i ? "" : '<div class="lab">' + esc(w.inThisWindow) + "</div>") + "<h3>" + esc(f.label) + "</h3><p>" + esc(f.text) + "</p></div>";
      });
      /* Beside an upright screen the words run down one column. A wide screen leaves room under itself:
         the closer look and what the user sees and does go there, next to the picture they are about. */
      var wide = intro.screens === "wide";
      var under = wide ? look.concat(pair) : [];
      // One try at laying the window out. `dense` draws its screen a little smaller, which leaves more room for words.
      function attempt(dense) {
      var first = sheets.children.length;
      var blocks = wide ? [head].concat(more, feats) : [head].concat(more, pair, look, feats);
      flowOn(blocks, function (again) {
        if (again) {
          var c = add(sheets, page("window on", "", step.name, right, '<div class="lab again">' + esc(S.fill(w.continued, { t: step.name })) +
            '</div><div class="cols"><div class="box"></div><div class="box"></div></div>'));
          return Array.prototype.slice.call(c.querySelectorAll(".box"));
        }
        // a window with little to say gets a larger screen instead of an empty column
        var thin = !step.more.length && !step.feature.length;
        var p = add(sheets, page("window" + (thin ? " thin" : "") + (dense ? " dense" : ""), "w" + index, step.name, right, '<div class="cols"><div class="pic">' + dev(step) + '<div class="under"></div></div><div class="box"></div></div>'));
        var below = p.querySelector(".under");
        // what does not fit under the screen joins the words beside it, after the paragraphs
        under.forEach(function (html) {
          below.insertAdjacentHTML("beforeend", html);
          if (past(below, below.lastElementChild)) { below.lastElementChild.remove(); blocks.splice(1 + more.length, 0, html); }
        });
        // beside a wide screen, words that run past their column go on under the screen before a new page is opened
        return wide ? [p.querySelector(".box"), below] : [p.querySelector(".box")];
      }, step.name);
      return Array.prototype.slice.call(sheets.children, first);
      }
      /* A further page that would hold only a line or two is a wasted page. When that happens the window is
         laid out once more with its screen a little smaller; the words keep their size. */
      var problems = full.length, made = attempt(false), tail = made[made.length - 1];
      if (made.length > 1 && filled(tail.querySelector(".box")) < LEAST_ON_A_PAGE) {
        made.forEach(function (p) { p.remove(); });
        full.length = problems;
        made = attempt(true);
        tail = made[made.length - 1];
      }
      // Still only a line or two on the last page: the blocks just before it move on with it, so that page is worth turning to.
      if (made.length > 1) {
        var into = tail.querySelector(".box"), before = made[made.length - 2];
        // The boxes of the page before, in READING order: on a first page the words' column comes before the
        // room under the screen, although the page's markup holds them the other way round. Blocks are taken
        // from the end of that order only, so no block ever passes one that comes after it.
        var order = before.classList.contains("on") ? Array.prototype.slice.call(before.querySelectorAll(".box"))
          : [before.querySelector(".box"), before.querySelector(".under")];
        var sources = order.filter(function (b) { return b && b.children.length; });
        while (filled(into) < LEAST_ON_A_PAGE && sources.length) {
          var from = sources[sources.length - 1];
          if (from.children.length <= 1 && sources.length === 1) break;   // the window's heading stays on its first page
          into.insertBefore(from.lastElementChild, into.firstChild);
          if (!from.children.length) sources.pop();
        }
      }
      var last = sheets.lastElementChild;
      if (last.classList.contains("on")) {
        var cols = last.querySelectorAll(".box"), items = cols[0].children;
        if (!cols[1].children.length && items.length > 1) {
          var half = cols[0].getBoundingClientRect().top + (items[items.length - 1].getBoundingClientRect().bottom - cols[0].getBoundingClientRect().top) / 2;
          var moving = Array.prototype.filter.call(items, function (el, i) { return i > 0 && el.getBoundingClientRect().top >= half - 1; });
          moving.forEach(function (el) { cols[1].appendChild(el); });
        }
      }
    }

    // Cards that run on: the project-wide features, and what makes it different.
    function cardPages(sheets, kind, id, title, cards, tail) {
      flowOn(cards.map(function (c) { return card(c); }).concat(tail || []), function (again) {
        var p = add(sheets, page(kind + (cards.length <= 6 ? " roomy" : ""), again ? "" : id, title, title, "<h2>" + esc(again ? S.fill(w.continued, { t: title }) : title) + '</h2><div class="box cards2"></div>'));
        return [p.querySelector(".box")];
      }, title);
    }

    // The introduction and the conclusion: paragraphs beside the main screen, running on in two columns.
    function prosePages(sheets, id, title, paragraphs) {
      flowOn(paragraphs.map(function (p) { return '<p class="blk prose">' + esc(p.text) + (p.guess ? " " + guess(p) : "") + "</p>"; }), function (again) {
        var p = add(sheets, page("prose" + (again ? " on" : ""), again ? "" : id, title, title, "<h2>" + esc(again ? S.fill(w.continued, { t: title }) : title) + '</h2><div class="cols">' +
          (again ? '<div class="box"></div><div class="box"></div>' : '<div class="box"></div>' + dev(main)) + "</div>"));
        return Array.prototype.slice.call(p.querySelectorAll(".box"));
      }, title);
    }

    function fullPages(sheets) {
      add(sheets, cover());
      contents(sheets);
      if (intro.introduction.length) prosePages(sheets, "introduction", w.introduction, intro.introduction);
      add(sheets, who());
      steps.forEach(function (step, i) {
        var opens = parts.length && (i === 0 || steps[i - 1].part !== step.part);
        // a part of one window needs no opening page: that window's own page carries the part's name
        if (opens && steps.filter(function (s) { return s.part === step.part; }).length > 1) partPages(sheets, step.part);
        windowPages(sheets, step, i);
      });
      if (intro.features.length) cardPages(sheets, "features", "features", w.features, intro.features);
      // every window already has its own page here, so the closing row of small screens is left to the simple introduction
      cardPages(sheets, "different", "different", w.different, intro.different, intro.next ? ['<div class="wide-block">' + next() + "</div>"] : []);
      if (intro.conclusion.length) prosePages(sheets, "conclusion", w.conclusion, intro.conclusion);
    }

    // ---------- build, number, check ----------
    var here = location.pathname.split("/").pop() || "intro.html";
    document.body.insertAdjacentHTML("beforeend",
      '<div class="hint"><span>' + esc(w.printHint) + "</span>" +
      '<a href="' + here + '?paper=app" aria-current="' + (t.paper === "app") + '">' + esc(w.paperApp) + "</a>" +
      '<a href="' + here + '?paper=white" aria-current="' + (t.paper === "white") + '">' + esc(w.paperWhite) + '</a></div><main class="sheets"></main>');
    var sheets = document.querySelector(".sheets");

    // Pages are measured as they are built, so the fonts and every picture's shape must be known first.
    load().then(function () {
      if (simple) simplePages(sheets); else fullPages(sheets);
      var pages = sheets.querySelectorAll(".page");
      Array.prototype.forEach.call(pages, function (p, i) {
        var foot = p.querySelectorAll(".foot span");
        if (!foot.length) return;
        foot[0].innerHTML = name + " · " + esc(docName) + (i === pages.length - 1 ? " · " + esc(w.madeWith) : "");
        foot[1].textContent = S.fill(w.pageOf, { n: i + 1, m: pages.length });
      });
      Array.prototype.forEach.call(sheets.querySelectorAll("[data-ref]"), function (cell) {
        var target = sheets.querySelector('.page[data-id="' + cell.getAttribute("data-ref") + '"]');
        cell.textContent = Array.prototype.indexOf.call(pages, target) + 1;
      });
      var count = sheets.querySelector("[data-count]");
      if (count) count.textContent = S.fill(steps.length === 1 ? w.insideOne : w.insideSub, { p: pages.length, n: steps.length });
      placeCuts();
      full = full.concat(tooFull(w));
      // the same complaint about one window or page is said once
      full = full.filter(function (line, i) { return full.indexOf(line) === i; });
      if (full.length) { document.querySelector(".hint").remove(); sheets.remove(); return refuse(w, full); }
      fitScreen();
      window.addEventListener("resize", fitScreen);
      document.documentElement.setAttribute("data-introflow", "ready");
    }).catch(function (error) {
      refuse(S.words("en"), [S.words("en").notDrawn + (error && error.message ? error.message : error)]);
    });

    // A picture that will not load is simply not in `sizes`: its place gets a plain "Screenshot missing" box.
    function load() {
      var seen = {};
      var waits = steps.filter(function (s) { return s.shot && !seen[s.shot] && (seen[s.shot] = true); }).map(function (s) {
        return new Promise(function (done) {
          var img = new Image();
          img.onload = function () { if (img.naturalWidth) sizes[s.shot] = { w: img.naturalWidth, h: img.naturalHeight }; done(); };
          img.onerror = done;
          img.src = s.shot;
        });
      });
      if (document.fonts && document.fonts.load) {
        var sample = intro.name + w.who + "0123456789";
        ["400", "600", "700", "800"].forEach(function (weight) { waits.push(document.fonts.load(weight + ' 16px "Alexandria"', sample).catch(function () {})); });
        waits.push(document.fonts.load('400 12px "Plex Mono"').catch(function () {}));
      }
      return Promise.all(waits);
    }
  }

  // Slide each cut to its point, but never past the picture's own edge.
  function placeCuts() {
    Array.prototype.forEach.call(document.querySelectorAll(".cut img"), function (img) {
      var box = img.parentNode;
      var maxX = Math.max(0, (img.clientWidth - box.clientWidth) / img.clientWidth * 100);
      var maxY = Math.max(0, (img.clientHeight - box.clientHeight) / img.clientHeight * 100);
      var x = Math.min(Number(img.dataset.x), maxX), y = Math.min(Number(img.dataset.y), maxY);
      img.style.transform = "translate(" + -x + "%, " + -y + "%)";
    });
  }

  // Words that do not fit are refused, never squeezed, cut off or hidden. Three things are checked on every
  // page: nothing runs below its place, nothing is wider than its own box, and nothing leaves the page.
  // The cover also keeps its words clear of the screens. Art that is clipped on purpose (the drawing, the
  // fanned screens, a picture's cut) lives in .deco or .cut and is never counted.
  // One exception, by the owner's decision (ADR 0004): the cover's name, and only the name, may be made a
  // little smaller, because a project cannot change its name to suit a page.
  function runsWide(page) {
    var box = page.getBoundingClientRect();
    var parts = page.querySelectorAll(":scope > :not(.deco), :scope > :not(.deco) *:not(.cut):not(.cut *)");
    return Array.prototype.some.call(parts, function (el) {
      var r = el.getBoundingClientRect();
      if (!r.width && !r.height) return false;
      // The cover's name is one line by design and may be wider than the text under it: it is judged on its
      // own, in tooFull. So the name is skipped here, and the box that holds it is not judged by its own width.
      if (el.closest(".name")) return false;
      if (r.left < box.left + EDGE || r.right > box.right - EDGE) return true;
      if (el.querySelector(":scope > .name")) return false;
      return el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 1;
    });
  }

  function tooFull(w) {
    var full = [];
    var cover = document.querySelector(".cover"), box = cover.getBoundingClientRect();
    var txt = cover.querySelector(".txt"), facts = cover.querySelector(".facts");
    var screens = Array.prototype.map.call(cover.querySelectorAll(".fan"), function (s) { return s.getBoundingClientRect(); });
    function meetsScreen(el) { var r = el.getBoundingClientRect(); return screens.some(function (s) { return hits(r, s); }); }
    // The name starts at the size its length gives it (set where the cover is built). If at that size it
    // would reach a screen or the page's edge, it is made smaller one pixel at a time, only until it is clear,
    // and never below NAME_SMALLEST. A name that fits is not touched; one that is still not clear at the
    // smallest size is refused (ADR 0004).
    var name = cover.querySelector(".name"), word = name.querySelector(".nm"), size = parseFloat(name.style.fontSize);
    function nameReaches() { var r = word.getBoundingClientRect(); return r.left < box.left + EDGE || r.right > box.right - EDGE || meetsScreen(word); }
    while (nameReaches() && size - 1 >= NAME_SMALLEST) { size -= 1; name.style.fontSize = size + "px"; }
    if (nameReaches()) full.push(S.fill(w.fitName, { t: word.textContent }));
    if (txt.getBoundingClientRect().bottom > facts.getBoundingClientRect().top - 10) full.push(w.fitCover);
    var meets = Array.prototype.some.call(cover.querySelectorAll(".txt .lab, .lead, .fact"), meetsScreen);
    if (meets || runsWide(cover)) full.push(S.fill(w.fitWide, { t: w.cover }));
    // Every other page, however many there are.
    Array.prototype.forEach.call(document.querySelectorAll(".page:not(.cover)"), function (page) {
      var title = page.getAttribute("data-title");
      var flow = page.querySelector(".flow"), limit = page.querySelector(".foot").getBoundingClientRect().top - 8;
      var lowest = Math.max.apply(null, Array.prototype.map.call(flow.querySelectorAll("*:not(.cut *)"), function (el) { return el.getBoundingClientRect().bottom; }));
      if (lowest > limit) full.push(S.fill(w.fitPage, { t: title }));
      if (runsWide(page)) full.push(S.fill(w.fitWide, { t: title }));
    });
    return full;
  }

  function fitScreen() {
    document.documentElement.style.setProperty("--zoom", Math.min(1, (window.innerWidth - 44) / 1122));
  }

  function refuse(w, list) {
    document.documentElement.setAttribute("data-introflow", "refused");
    document.body.insertAdjacentHTML("beforeend", '<section class="problems"><h1>' + esc(w.cantDraw) + "</h1><p>" + esc(w.fixThese) + "</p><ol>" +
      list.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") + "</ol></section>");
  }

  try { draw(); } catch (error) {
    refuse(S.words("en"), [S.words("en").notDrawn + (error && error.message ? error.message : error)]);
  }
})();
