// 设计核对：截取关键页面（深色 / 浅色），用于视觉评审
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.SHOT_BASE || "http://localhost:4173/interview/index.html";
const OUT = process.env.SHOT_OUT || "shots";
const THEME = process.argv[2] === "light" ? "light" : "dark";
const TAG = process.argv[3] || "before";

fs.mkdirSync(OUT, { recursive: true });

const ROUTES = [
  ["today", "#/today"],
  ["book", "#/book"],
  ["part", "#/book/P7"],
  ["section", "#/book/C21/21.1"],
  ["bank", "#/bank"],
  ["iv", "#/iv"],
  ["ivdetail", "#/ivd/kevin-weil"],
  ["me", "#/me"],
];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 430, height: 932 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
const page = await ctx.newPage();

// 先注入主题，避免闪烁
await page.addInitScript((t) => {
  localStorage.setItem("ai-interview-deep-v1", JSON.stringify({ v: 1, q: {}, nodes: {}, tb: {}, seen: {}, text: {}, streak: { last: "", days: 3 }, theme: t }));
}, THEME);

const errs = [];
page.on("pageerror", (e) => errs.push("pageerror: " + e.message));
page.on("console", (m) => { if (m.type() === "error") errs.push("console: " + m.text()); });

for (const [name, hash] of ROUTES) {
  await page.goto(BASE + hash, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  const f = path.join(OUT, `${TAG}-${THEME}-${name}.png`);
  await page.screenshot({ path: f, fullPage: false });
  // 顺便记录页面实际用的关键色值，便于诊断
  const info = await page.evaluate(() => {
    const cs = getComputedStyle(document.body);
    const card = document.querySelector(".card");
    return {
      bg: cs.backgroundColor,
      color: cs.color,
      theme: document.documentElement.dataset.theme,
      cardBg: card ? getComputedStyle(card).backgroundColor : null,
    };
  });
  console.log(`${name.padEnd(10)} ${f}  theme=${info.theme} bg=${info.bg} card=${info.cardBg}`);
}

// 长图：教材首页整页，方便看整体节奏
await page.goto(BASE + "#/book", { waitUntil: "networkidle" });
await page.waitForTimeout(700);
await page.screenshot({ path: path.join(OUT, `${TAG}-${THEME}-book-full.png`), fullPage: true });

await browser.close();
if (errs.length) { console.log("\n!! 页面报错:"); errs.slice(0, 10).forEach((e) => console.log("  " + e)); }
else console.log("\n无页面报错");
