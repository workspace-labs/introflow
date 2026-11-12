/* introflow: draws the four pages from the text copy inside intro.html.
   The only file that touches the page. It never changes the look: it fills the parts introflow.css styles. */
(function () {
  "use strict";

  var I = window.Introflow, S = I.strings;
  var ICONS = {
    phone: '<rect x="7" y="2" width="10" height="20" rx="2.5"/><path d="M11 18.5h2"/>',
    tablet: '<rect x="5" y="2" width="14" height="20" rx="2.5"/><path d="M10.5 18.5h3"/>',
    desktop: '<rect x="2.5" y="4" width="19" height="13" rx="2"/><path d="M8.5 21h7M12 17v4"/>',
    globe: '<circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19M12 2.5c3.2 3.2 3.2 15.8 0 19M12 2.5c-3.2 3.2-3.2 15.8 0 19"/>',
    offline: '<path d="M2.5 9a14.5 14.5 0 0 1 19 0M5.8 12.6a9.6 9.6 0 0 1 12.4 0M9 16.2a4.6 4.6 0 0 1 6 0M3.5 3.5l17 17"/><circle cx="12" cy="19.6" r=".6"/>',
    pen: '<path d="M4 20l1-4.2L16.2 4.6a1.9 1.9 0 0 1 2.7 0l.5.5a1.9 1.9 0 0 1 0 2.7L8.2 19z M14.5 6.5l3 3"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10.5" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
    people: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.8a3.5 3.5 0 0 1 0 6.4M17.5 14a6.5 6.5 0 0 1 4 6"/>',
    clock: '<circle cx="12" cy="12" r="9.5"/><path d="M12 6.5V12l3.5 2.2"/>',
    print: '<path d="M7 8V3h10v5M7 17H4.5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h15a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H17"/><rect x="7" y="14" width="10" height="7" rx="1"/>',
    dot: '<circle cx="12" cy="12" r="4"/>'
  };
  // The background drawings a project can pick from. `soft` ones fade out towards the text.
  var MOTIFS = {
    rings: function () {
      var c = [76, 152, 228, 304, 372].map(function (r) { return '<circle cx="380" cy="380" r="' + r + '"/>'; }).join("");
      return '<svg class="motif" viewBox="0 0 760 760" fill="none" stroke="currentColor" stroke-width="1">' + c +
        '<path d="M380 70v620M70 380h620"/><circle cx="380" cy="380" r="340" stroke-width="10" stroke-dasharray="1.5 28.17"/></svg>';
    },
    squares: function () {
      var lv = [.14, .14, .14, .34, .14, .58, .14, .14, .9, .34, .14, .14, .58], s = "";
      for (var i = 0; i < 13; i++) for (var j = 0; j < 13; j++) {
        s += '<rect x="' + (20 + i * 56) + '" y="' + (20 + j * 56) + '" width="44" height="44" rx="10" opacity="' + lv[(i * 7 + j * 3 + i * j) % 13] + '"/>';
      }
      return '<svg class="motif soft" viewBox="0 0 760 760" fill="currentColor">' + s + "</svg>";
    },
    dots: function () {
      var s = "";
      for (var i = 0; i < 19; i++) for (var j = 0; j < 19; j++) s += '<circle cx="' + (20 + i * 40) + '" cy="' + (20 + j * 40) + '" r="2.4"/>';
      return '<svg class="motif soft" viewBox="0 0 760 760" fill="currentColor">' + s + "</svg>";
    },
    none: function () { return ""; }
  };

  function esc(text) {
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function draw() {
    var source = document.getElementById("intro");
    var result = I.model.parse(source ? source.textContent : "");
    var intro = result.intro, w = S.words(intro.language);
    document.documentElement.lang = w.lang;
    document.documentElement.dir = w.dir;
    document.title = (intro.name || "Project") + " · " + w.intro;
    if (!result.ok) return refuse(w, result.problems.map(function (p) { return S.fill(w.line, { n: p.line }) + p.text; }));

    // "both papers" prints the same page twice: ?paper=white or ?paper=app overrides the text copy for one printing.
    var asked = new URLSearchParams(location.search).get("paper");
    var paper = I.theme.PAPERS.indexOf(asked) >= 0 ? asked : intro.paper;
    var t = I.theme.theme(intro.stage, intro.accent, paper);
    var vars = { bg: t.bg, ink: t.ink, ink2: t.ink2, ink3: t.ink3, label: t.label, acc: t.acc, "on-acc": t.onAcc, line: t.line, card: t.card, glow: t.glow, motif: t.motif, gold: t.gold };
    Object.keys(vars).forEach(function (k) { document.documentElement.style.setProperty("--" + k, vars[k]); });
    document.body.className = "paper-" + t.paper + " " + intro.screens + " kind-" + intro.kind;

    var steps = intro.what.steps, main = steps[intro.what.main - 1], rest = steps.filter(function (s) { return s !== main; });
    var name = '<span class="nm">' + esc(intro.name) + "</span>";
    var numbered = intro.what.order === "steps";

    function shot(step) {
      return step.shot ? '<img class="scr" src="' + esc(step.shot) + '" alt="' + esc(step.name) + '">' : '<div class="scr missing">' + esc(w.shotMissing) + "</div>";
    }
    function dev(step, cls) {
      var bar = intro.kind === "desktop" || intro.kind === "website" ? '<div class="bar"><i></i><i></i><i></i></div>' : "";
      return '<div class="dev kind-' + intro.kind + " " + (cls || "") + '">' + bar + shot(step) + "</div>";
    }
    function cut(step) {
      var c = step.cut || { x: 0, y: 0 };
      var inner = step.shot ? '<img src="' + esc(step.shot) + '" alt="" data-x="' + c.x + '" data-y="' + c.y + '">' : '<div class="scr missing">' + esc(w.shotMissing) + "</div>";
      return '<div class="cut">' + inner + "</div>";
    }
    function num(step) { return numbered ? "<b>" + (steps.indexOf(step) + 1) + "</b>" : ""; }
    function guess(item) { return item.guess ? '<span class="guess">' + esc(w.toConfirm) + "</span>" : ""; }
    function head(n, title) {
      return '<div class="top"><span class="lab">' + name + " · " + esc(w.intro) + '</span><span class="lab quiet">' + n + " · " + esc(title) + "</span></div>";
    }
    function foot(n, last) {
      return '<div class="foot"><span>' + name + " · " + esc(w.intro) + (last ? " · " + esc(w.madeWith) : "") + "</span><span>" + S.fill(w.pageOf, { n: n, m: 4 }) + "</span></div>";
    }

    var state = intro.status === "approved" ? S.fill(w.approvedOn, { date: S.day(intro.approved, intro.language) }) : w.draft;
    var kicker = [w.intro, S.day(intro.date, intro.language)].filter(Boolean).map(esc).join(" · ");
    var forWhom = [state, intro.client && S.fill(w.preparedFor, { t: intro.client }), intro.by && S.fill(w.preparedBy, { t: intro.by })].filter(Boolean).map(esc).join(" · ");
    var size = Math.max(30, Math.min(98, Math.floor(400 / (Math.max(intro.name.length, 1) * 0.66))));
    var fan = rest.length >= 2
      ? dev(rest[0], "fan f1") + dev(rest[rest.length - 1], "fan f3") + dev(main, "fan f2")
      : dev(main, "fan f2 alone");
    var facts = intro.facts.map(function (f) {
      return '<div class="fact"><svg viewBox="0 0 24 24">' + ICONS[f.icon || "dot"] + "</svg><div><small>" + esc(f.label) + "</small><strong>" + esc(f.value) + "</strong></div></div>";
    }).join("");

    var pages = [
      '<section class="page cover"><div class="deco">' + MOTIFS[intro.drawing]() + fan + "</div>" +
        '<div class="txt"><div class="lab">' + kicker + "</div>" + (forWhom ? '<div class="lab quiet who-for">' + forWhom + "</div>" : "") +
        '<div class="name" style="font-size:' + size + 'px">' + name + '</div><p class="lead">' + esc(intro.about) + '</p></div><div class="facts">' + facts + "</div></section>",

      '<section class="page who"><div class="deco"></div><div class="flow">' + head(1, w.who) + "<h2>" + esc(w.who) + '</h2><div class="cols"><div class="cards n' + intro.who.length + '">' +
        intro.who.map(function (c) { return '<div class="card"><div class="lab">' + esc(c.label) + guess(c) + "</div><p>" + esc(c.text) + "</p></div>"; }).join("") +
        "</div>" + dev(main) + "</div></div>" + foot(2) + "</section>",

      '<section class="page what"><div class="deco"></div><div class="flow">' + head(2, w.what) + "<h2>" + esc(w.what) + "</h2>" + (intro.what.sub ? '<p class="sub">' + esc(intro.what.sub) + "</p>" : "") +
        '<div class="cols"><div class="main">' + dev(main) + '<span class="lab">' + esc(main.tag) + "</span><h3>" + num(main) + esc(main.name) + '</h3><p class="t">' + esc(main.caption) + '</p></div><div class="rows">' +
        rest.map(function (s) {
          return '<div class="rowx">' + cut(s) + "<div>" + (s.tag ? '<span class="lab">' + esc(s.tag) + "</span>" : "") + "<h3>" + num(s) + esc(s.name) + '</h3><p class="t">' + esc(s.caption) + "</p></div></div>";
        }).join("") + "</div></div></div>" + foot(3) + "</section>",

      '<section class="page different"><div class="deco"></div><div class="flow' + (intro.different.length <= 2 ? " few" : "") + '">' + head(3, w.different) + "<h2>" + esc(w.different) + '</h2><div class="grid">' +
        intro.different.map(function (c) { return '<div class="card"><h3>' + esc(c.label) + guess(c) + "</h3><p>" + esc(c.text) + "</p></div>"; }).join("") +
        '</div><div class="closing"><div class="strip">' + steps.map(function (s) { return "<figure>" + dev(s) + "<figcaption>" + esc(s.name) + "</figcaption></figure>"; }).join("") + "</div>" +
        (intro.next ? '<div class="next"><b>' + (w.dir === "rtl" ? "←" : "→") + "</b><span>" + esc(intro.next) + "</span></div>" : "") + "</div>" +
        "</div>" + foot(4, true) + "</section>"
    ];

    var here = location.pathname.split("/").pop() || "intro.html";
    document.body.insertAdjacentHTML("beforeend",
      '<div class="hint"><span>' + esc(w.printHint) + "</span>" +
      '<a href="' + here + '?paper=app" aria-current="' + (t.paper === "app") + '">' + esc(w.paperApp) + "</a>" +
      '<a href="' + here + '?paper=white" aria-current="' + (t.paper === "white") + '">' + esc(w.paperWhite) + "</a></div>" +
      '<main class="sheets">' + pages.join("") + "</main>");

    settle().then(function () {
      placeCuts();
      var full = tooFull(w);
      if (full.length) { document.querySelector(".hint").remove(); document.querySelector(".sheets").remove(); return refuse(w, full); }
      fitScreen();
      window.addEventListener("resize", fitScreen);
      document.documentElement.setAttribute("data-introflow", "ready");
    });

    // A picture that will not load becomes a plain "Screenshot missing" box: the page never breaks.
    function settle() {
      var waits = Array.prototype.map.call(document.images, function (img) {
        return new Promise(function (done) {
          function missing() {
            var box = document.createElement("div");
            box.className = "scr missing";
            box.textContent = w.shotMissing;
            img.replaceWith(box);
            done();
          }
          if (img.complete) return img.naturalWidth ? done() : missing();
          img.addEventListener("load", done);
          img.addEventListener("error", missing);
        });
      });
      if (document.fonts && document.fonts.ready) waits.push(document.fonts.ready);
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
  var EDGE = 24;            // the least room between any word and the page's edge, in px
  var NAME_SMALLEST = 30;   // the cover's name is never drawn smaller than this, in px

  function hits(a, b) { return a.left < b.right - 1 && a.right > b.left + 1 && a.top < b.bottom - 1 && a.bottom > b.top + 1; }

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
    [["who", w.who], ["what", w.what], ["different", w.different]].forEach(function (p) {
      var page = document.querySelector(".page." + p[0]);
      var flow = page.querySelector(".flow"), limit = page.querySelector(".foot").getBoundingClientRect().top - 8;
      var lowest = Math.max.apply(null, Array.prototype.map.call(flow.querySelectorAll("*:not(.cut *)"), function (el) { return el.getBoundingClientRect().bottom; }));
      if (lowest > limit) full.push(S.fill(w.fitPage, { t: p[1] }));
      if (runsWide(page)) full.push(S.fill(w.fitWide, { t: p[1] }));
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
