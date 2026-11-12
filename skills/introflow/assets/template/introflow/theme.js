/* introflow: every colour the pages use, worked out from the app's own two colours (its background and its
   main button colour) and the paper (the app's colour, or white for printing).
   Pure numbers: no page access, so Node's tests run it. */
(function (root) {
  "use strict";

  // With no colours given, the intro wears introflow's own: a deep ink page and a blue.
  var DEFAULT = { stage: "#0b1020", accent: "#3d5afe" };
  var PAPERS = ["app", "white"];
  var HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
  // Small labels are written in the accent: below this they cannot be read (WCAG AA for small text).
  var LABEL_CONTRAST = 4.5;

  // "#abc" or "#AABBCC" → "#aabbcc"; anything else → "".
  function hex(value) {
    var m = HEX.exec(String(value || "").trim());
    if (!m) return "";
    var h = m[1].toLowerCase();
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return "#" + h;
  }

  function rgb(h) { return [1, 3, 5].map(function (i) { return parseInt(h.slice(i, i + 2), 16); }); }

  // How light a colour is, 0 (black) to 1 (white), the way the eye weighs red, green and blue (WCAG).
  function luminance(h) {
    var c = rgb(h).map(function (v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }

  function contrast(a, b) {
    var la = luminance(a), lb = luminance(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }

  // `part` of colour a, the rest colour b.
  function mix(a, b, part) {
    var x = rgb(a), y = rgb(b);
    return "#" + x.map(function (v, i) {
      return ("0" + Math.round(v * part + y[i] * (1 - part)).toString(16)).slice(-2);
    }).join("");
  }

  // A colour, pushed towards `towards` only as far as it takes to be readable on every one of `surfaces`.
  function readable(colour, surfaces, towards) {
    var list = [].concat(surfaces);
    for (var part = 1; part >= 0; part -= 0.05) {
      var c = mix(colour, towards, part);
      if (list.every(function (s) { return contrast(c, s) >= LABEL_CONTRAST; })) return c;
    }
    return towards;
  }

  /* stage and accent are hex (or empty for introflow's own); paper is "app" or "white".
     White paper keeps the layout and spends no ink on the page itself: only the screens stay dark.
     Words are printed on three surfaces: the page, a card, and the soft glow behind the screens. Every text
     colour is readable (4.5:1) on all three, whatever the app's colours are. */
  function theme(stage, accent, paper) {
    var appBg = hex(stage) || DEFAULT.stage;
    var acc = hex(accent) || DEFAULT.accent;
    var white = paper === "white";
    var bg = white ? "#ffffff" : appBg;
    // The ink: light or dark, whichever reads better on this page. On light paper it carries a little of a
    // dark app's own colour. A mid-tone page gets the strongest ink there is, pure white or pure black.
    var lightInk = "#eef2f6", darkInk = luminance(appBg) < 0.1 ? mix(appBg, "#1b1e26", 0.5) : "#14161f";
    var dark = contrast(lightInk, bg) >= contrast(darkInk, bg);
    var ink = dark ? lightInk : darkInk;
    if (contrast(ink, bg) < 7) {
      dark = contrast("#ffffff", bg) >= contrast("#000000", bg);
      ink = dark ? "#ffffff" : "#000000";
    }
    // A card and the glow are kept only where the ink still reads on them; otherwise they are the page itself.
    var card = dark ? mix(acc, bg, 0.06) : "#ffffff";
    if (contrast(ink, card) < LABEL_CONTRAST) card = bg;
    var glow = dark ? mix(acc, bg, 0.24) : bg;
    if (contrast(ink, glow) < LABEL_CONTRAST) glow = bg;
    var surfaces = [bg, card, glow];
    return {
      paper: white ? "white" : "app", dark: dark, bg: bg, ink: ink, acc: acc, surfaces: surfaces,
      ink2: readable(mix(ink, bg, 0.8), surfaces, ink),
      ink3: readable(mix(ink, bg, 0.58), surfaces, ink),
      label: readable(acc, surfaces, ink),
      // the number on an accent circle: pure black or pure white, whichever reads better (one always reaches 4.5:1)
      onAcc: contrast("#000000", acc) >= contrast("#ffffff", acc) ? "#000000" : "#ffffff",
      line: dark ? mix(acc, bg, 0.22) : mix(ink, bg, 0.16),
      card: card,
      glow: glow,
      motif: dark ? mix(acc, bg, 0.26) : mix(acc, bg, 0.3),
      gold: readable(dark ? "#f0c04a" : "#8a5a00", surfaces, ink)
    };
  }

  var api = { DEFAULT: DEFAULT, PAPERS: PAPERS, LABEL_CONTRAST: LABEL_CONTRAST, hex: hex, luminance: luminance, contrast: contrast, mix: mix, readable: readable, theme: theme };
  root.Introflow = root.Introflow || {};
  root.Introflow.theme = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
