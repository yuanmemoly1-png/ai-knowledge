// 浅色主题审计（复用 audit.mjs 的核心逻辑，走 light 存档）
import { chromium } from "playwright";

const BASE = process.env.SHOT_BASE || "http://localhost:8788/interview/index.html";

function parseColorSafe(s) {
  const m = String(s).match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const [r, g, b, a = "1"] = m[1].split(",").map((x) => parseFloat(x));
  return [r, g, b, a];
}
function composite(fg, bg) {
  const [r1, g1, b1, a1] = fg, [r2, g2, b2] = bg;
  return [r1 * a1 + r2 * (1 - a1), g1 * a1 + g2 * (1 - a1), b1 * a1 + b2 * (1 - a1)];
}
function lum([r, g, b]) {
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function contrastOf(fg, bg) {
  const L1 = lum(fg), L2 = lum(bg);
  const [hi, lo] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (hi + 0.05) / (lo + 0.05);
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 2, isMobile: true });
const page = await ctx.newPage();
await page.addInitScript(() => {
  localStorage.setItem("ai-interview-deep-v1", JSON.stringify({ v: 1, q: {}, nodes: {}, tb: {}, seen: {}, text: {}, streak: { last: "", days: 3 }, theme: "light" }));
});

let fail = 0;
for (const hash of ["#/book", "#/bank", "#/ivd/kevin-weil"]) {
  await page.goto(BASE + hash, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  const data = await page.evaluate(() => {
    function pc(s) { const m = String(s).match(/rgba?\(([^)]+)\)/); if (!m) return null; const [r, g, b, a = "1"] = m[1].split(",").map((x) => parseFloat(x)); return [r, g, b, a]; }
    function comp(f, b) { const [r1, g1, b1, a1] = f, [r2, g2, b2] = b; return [r1 * a1 + r2 * (1 - a1), g1 * a1 + g2 * (1 - a1), b1 * a1 + b2 * (1 - a1)]; }
    function L([r, g, b]) { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); }
    function CR(fg, bg) { const a = L(fg), b = L(bg); const [hi, lo] = a > b ? [a, b] : [b, a]; return (hi + 0.05) / (lo + 0.05); }
    function op(el) { let bg = [244, 245, 249]; const chain = []; let c = el; while (c && c !== document.documentElement) { chain.unshift(c); c = c.parentElement; } for (const n of chain) { const x = pc(getComputedStyle(n).backgroundColor); if (x && x[3] > 0.5) bg = comp(x, bg); } return bg; }
    const out = [];
    for (const sel of ["p", "h1", ".muted", ".sec", ".tag", ".qitem .qt"]) {
      const el = document.querySelector(sel);
      if (!el) continue;
      const cs = getComputedStyle(el);
      const ratio = CR(pc(cs.color), op(el));
      out.push({ sel, fs: parseFloat(cs.fontSize), ratio: +ratio.toFixed(2) });
    }
    return out;
  });
  console.log(`\n${hash}（浅色）`);
  for (const d of data) {
    const bad = d.ratio < 4.5;
    if (bad) fail++;
    console.log(`  ${d.sel.padEnd(12)} ${d.fs}px  ${d.ratio}${bad ? "  ← 不达标" : ""}`);
  }
}
await browser.close();
console.log(fail ? `\n!! ${fail} 项不达标` : "\n浅色主题全部达标");
