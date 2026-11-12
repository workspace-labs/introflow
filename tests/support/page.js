// Shared by the tests that open the real template in a browser. Not a test itself.
// It uses the Chrome or Edge already on this computer, headless, with a throwaway profile, on a disposable
// copy of the template. With no such browser the tests are skipped, and say so. Nothing is installed.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const zlib = require("node:zlib");
const { spawnSync } = require("node:child_process");

const ROOT = path.join(__dirname, "../..");
const TEMPLATE = path.join(ROOT, "skills/introflow/assets/template");
const EXAMPLES = path.join(ROOT, "skills/introflow/examples");
const DEMO_SHOTS = path.join(ROOT, "docs/decisions/hero-options/demo-app/screenshots");
const TRAILHEAD = fs.readFileSync(path.join(EXAMPLES, "trailhead-tablet.md"), "utf8");
const CLINIC = fs.readFileSync(path.join(EXAMPLES, "clinic-booking-phone-ar.md"), "utf8");

const BROWSER = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/microsoft-edge"
].find((p) => fs.existsSync(p));
const skip = BROWSER ? false : "no Chrome or Edge found on this computer";

// A wide window, so the page is shown at its real size (no on-screen zoom) and the whole cover is in view.
const WINDOW = "1300,1000";
const SCALE = 2;   // device pixels per page pixel in the pictures taken for the pixel checks

// Added to the disposable copy only, never to the template: once the page has marked itself, it writes down
// where the cover's screens are and how they are styled, so a test can find them in a picture of the page.
const PROBE = `<script>(function wait(){var d=document.documentElement;if(!d.getAttribute("data-introflow"))return setTimeout(wait,50);
var fans=Array.prototype.map.call(document.querySelectorAll(".cover .fan"),function(f){var b=f.querySelector(".scr.missing"),r=f.getBoundingClientRect(),m=b&&b.getBoundingClientRect(),c=b&&getComputedStyle(b);
return{cls:f.className,filter:getComputedStyle(f).filter,dev:[r.left,r.top,r.right,r.bottom],box:m&&[m.left,m.top,m.right,m.bottom],font:c&&c.fontSize,text:b&&b.textContent};});
var w=document.querySelector(".cover .name .nm"),n=w&&w.getBoundingClientRect(),p=document.querySelector(".cover"),g=p&&p.getBoundingClientRect();
d.setAttribute("data-probe",JSON.stringify({fans:fans,name:n&&{box:[n.left,n.top,n.right,n.bottom],font:getComputedStyle(w).fontSize},page:g&&[g.left,g.top,g.right,g.bottom]}));})();</script>`;

function run(args) {
  return spawnSync(BROWSER, ["--headless=new", "--disable-gpu", "--no-first-run", "--hide-scrollbars", "--virtual-time-budget=10000"].concat(args),
    { encoding: "utf8", timeout: 60000 });
}

/* Draws one text copy and returns the page's own verdict: its state, its list of problems, how many pages it
   drew and the size it gave the cover's name. With { probe: true } it also returns where the cover's name and
   screens are; with { pixels: true }, that and a picture of the page (png). */
function draw(text, { paper = "", shots = false, probe = false, pixels = false } = {}) {
  probe = probe || pixels;
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "introflow-test-"));
  try {
    fs.cpSync(TEMPLATE, path.join(dir, "doc"), { recursive: true });
    if (shots) fs.cpSync(DEMO_SHOTS, path.join(dir, "doc/screenshots"), { recursive: true });
    const page = path.join(dir, "doc/intro.html");
    const html = fs.readFileSync(page, "utf8");
    let filled = html.replace(/(<script type="text\/markdown" id="intro">\n)[\s\S]*?(<\/script>)/, (_, a, b) => a + text + b);
    assert.notEqual(filled, html, "the text copy was not embedded");
    if (probe) filled = filled.replace("</body>", PROBE + "</body>");
    fs.writeFileSync(page, filled);
    const url = "file://" + (page.startsWith("/") ? "" : "/") + page.split(path.sep).join("/") + (paper ? "?paper=" + paper : "");
    const profile = "--user-data-dir=" + path.join(dir, "profile");
    const dom = run([profile, "--window-size=" + WINDOW, "--dump-dom", url]).stdout || "";
    const result = {
      state: (/data-introflow="(\w+)"/.exec(dom) || [])[1] || "none",
      problems: [...dom.matchAll(/<li>([^<]*)<\/li>/g)].map((m) => m[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&")),
      pages: (dom.match(/<section class="page /g) || []).length,
      // the size the page really gave the name, read from the drawn page (it is gone when the page is refused)
      nameSize: Number((/class="name" style="font-size:\s*([\d.]+)px/.exec(dom) || [])[1])
    };
    if (probe && result.state === "ready") {
      const found = /data-probe="([^"]*)"/.exec(dom);
      assert.ok(found, "the page never reported where its name and screens are");
      result.probe = JSON.parse(found[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&"));
    }
    if (pixels) {
      const shot = path.join(dir, "page.png");
      run([profile, "--window-size=" + WINDOW, "--force-device-scale-factor=" + SCALE, "--screenshot=" + shot, url]);
      assert.ok(fs.existsSync(shot), "the browser took no picture of the page");
      result.png = readPng(shot);
    }
    return result;
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

// One line of a text copy swapped for another; the line is found by how it starts.
function line(text, start, replacement) {
  const lines = text.split("\n");
  const at = lines.findIndex((l) => l.startsWith(start));
  assert.ok(at >= 0, `no line starting "${start}"`);
  if (replacement === null) lines.splice(at, 1); else lines[at] = replacement;
  return lines.join("\n");
}

// A PNG's pixels, read with nothing but Node (8-bit RGB or RGBA, not interlaced: what the browser writes).
function readPng(file) {
  const buf = fs.readFileSync(file);
  let at = 8, width = 0, height = 0, type = 0;
  const data = [];
  while (at < buf.length) {
    const length = buf.readUInt32BE(at), kind = buf.toString("latin1", at + 4, at + 8), body = buf.subarray(at + 8, at + 8 + length);
    if (kind === "IHDR") {
      width = body.readUInt32BE(0); height = body.readUInt32BE(4); type = body[9];
      assert.equal(body[8], 8, "PNG bit depth"); assert.equal(body[12], 0, "PNG is interlaced");
    }
    if (kind === "IDAT") data.push(body);
    at += 12 + length;
  }
  assert.ok(type === 6 || type === 2, "PNG colour type " + type);
  const bpp = type === 6 ? 4 : 3, stride = width * bpp;
  const raw = zlib.inflateSync(Buffer.concat(data)), out = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)], row = y * (stride + 1) + 1, o = y * stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? out[o + x - bpp] : 0, b = y ? out[o - stride + x] : 0, c = x >= bpp && y ? out[o - stride + x - bpp] : 0;
      let v = raw[row + x];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      out[o + x] = v & 255;
    }
  }
  return { width, height, at(x, y) { const i = y * stride + x * bpp; return [out[i], out[i + 1], out[i + 2]]; } };
}

module.exports = { BROWSER, skip, SCALE, TRAILHEAD, CLINIC, draw, line, readPng };
