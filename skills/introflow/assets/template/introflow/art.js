/* introflow: the small drawings the page uses, as plain SVG text: the icons beside the facts and the
   background drawings a project can pick from. No page access here. */
(function (root) {
  "use strict";

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

  var api = { ICONS: ICONS, MOTIFS: MOTIFS };
  root.Introflow = root.Introflow || {};
  root.Introflow.art = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
