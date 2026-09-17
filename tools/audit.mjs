// 设计审计：量化对比度 / 字号 / 触控目标 / 用色，输出可核对的数据
import { chromium } from "playwright";

const BASE = process.env.SHOT_BASE || "http://localhost:8788/interview/index.html";

function parseColor(str) {
  // "rgb(r, g, b)" 或 "rgba(r, g, b, a)" 或 "transparent"
  const m = str.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const [r, g, b, a = "1"] = m[1].split(",").map((x) => parseFloat(x));
  return [r, g, b, a];
}
function composite(fg, bg) {
  if (!fg) return bg;
  const [r1, g1, b1, a1] = fg, [r2, g2, b2] = bg;
  return [r1 * a1 + r2 * (1 - a1), g1 * a1 + g2 * (1 - a1), b1 * a1 + b2 * (1 - a1)];
}
function lum([r, g, b]) {
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function contrast(fg, bg) {
  const L1 = lum(fg), L2 = lum(bg);
  const [hi, lo] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (hi + 0.05) / (lo + 0.05);
}

// 抽样目标：选择器 → 说明
const TARGETS = [
  ["p", "正文段落"],
  ["h1", "页面主标题"],
  ["h3", "节内小标题"],
  [".muted", "辅助说明(muted)"],
  [".tb-why", "教材节副标题"],
  [".tb-t", "教材节标题"],
  [".sec", "分组标题"],
  [".tag", "标签胶囊"],
  [".qitem .qt", "题干文字"],
  [".iv-role", "访谈嘉宾头衔"],
  [".row-m", "列表副行"],
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 2, isMobile: true });
const page = await ctx.newPage();
await page.addInitScript(() => {
  localStorage.setItem("ai-interview-deep-v1", JSON.stringify({ v: 1, q: {}, nodes: {}, tb: {}, seen: {}, text: {}, streak: { last: "", days: 3 }, theme: "dark" }));
});

const report = {};

for (const hash of ["#/book", "#/bank", "#/ivd/kevin-weil"]) {
  await page.goto(BASE + hash, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  const data = await page.evaluate(() => {
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
    const out = { samples: [], accents: [], emojiHeads: 0, touch: [] };

    function opaque(el) {
      let bg = [7, 8, 12];
      const chain = [];
      let cur = el;
      while (cur && cur !== document.documentElement) { chain.unshift(cur); cur = cur.parentElement; }
      for (const node of chain) {
        const c = parseColorSafe(getComputedStyle(node).backgroundColor);
        if (c && c[3] > 0.5) bg = composite(c, bg);
      }
      return bg;
    }

    const sels = ["p", "h1", "h3", ".muted", ".tb-why", ".tb-t", ".sec", ".tag", ".qitem .qt", ".iv-role", ".row-m"];
    for (const sel of sels) {
      const el = document.querySelector(sel);
      if (!el) continue;
      const cs = getComputedStyle(el);
      const fg = parseColorSafe(cs.color);
      const bg = opaque(el);
      const rect = el.getBoundingClientRect();
      out.samples.push({
        sel, fs: parseFloat(cs.fontSize), fw: cs.fontWeight, lh: cs.lineHeight,
        color: cs.color, ratio: +contrastOf(fg, bg).toFixed(2), w: Math.round(rect.width),
      });
    }

    document.querySelectorAll("*").forEach((el) => {
      const cs = getComputedStyle(el);
      for (const c of [cs.color, cs.backgroundColor, cs.borderTopColor]) {
        const p = parseColorSafe(c);
        if (!p || p[3] < 0.3) continue;
        const mx = Math.max(p[0], p[1], p[2]), mn = Math.min(p[0], p[1], p[2]);
        if (mx - mn > 40) { const k = String(c).replace(/\s/g, ""); if (!out.accents.includes(k)) out.accents.push(k); }
      }
    });

    document.querySelectorAll(".sec, h1, h3, .btn").forEach((el) => {
      const m = (el.textContent || "").match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu);
      if (m) out.emojiHeads += m.length;
    });

    document.querySelectorAll(".tabbar button, .btn, .icon-btn, .chip").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width > 0) out.touch.push({ cls: String(el.className).split(" ")[0], w: Math.round(r.width), h: Math.round(r.height) });
    });
    return out;
  });

  // 把页面内的辅助函数结果补齐对比度（页面内已算好）
  report[hash] = data;
  console.log(`\n===== ${hash} =====`);
  console.log("文本层级（字号 / 字重 / 对比度）");
  for (const s of data.samples) {
    const flag = s.ratio < 4.5 ? "  ← 不达标" : "";
    console.log(`  ${s.sel.padEnd(12)} ${String(s.fs).padStart(5)}px w${String(s.fw).padEnd(3)} 比对度 ${String(s.ratio).padStart(5)}${flag}`);
  }
  const acc = [...data.accents];
  console.log(`强调色数量: ${acc.length}`);
  acc.slice(0, 14).forEach((c) => console.log("   " + c));
  console.log(`标题/按钮里的 emoji 字符数: ${data.emojiHeads}`);
  const small = data.touch.filter((t) => t.h < 44);
  console.log(`触控目标 < 44px: ${small.length} / ${data.touch.length}`);
  small.slice(0, 8).forEach((t) => console.log(`   ${t.cls} ${t.w}x${t.h}`));
}

await browser.close();
