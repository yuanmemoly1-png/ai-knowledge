// 确认图标是渲染出来的 <svg>，且不再是文字字形
import { chromium } from "playwright";

const BASE = process.env.SHOT_BASE || "http://localhost:8788/interview/index.html";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 430, height: 932 }, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
await page.addInitScript(() => {
  localStorage.setItem("ai-interview-deep-v1", JSON.stringify({ v: 1, q: {}, nodes: {}, tb: {}, seen: {}, text: {}, streak: { last: "", days: 3 }, theme: "dark" }));
});

let fail = 0;
const bad = (m) => { fail++; console.log("  ✗ " + m); };
const ok = (m) => console.log("  ✓ " + m);

for (const hash of ["#/today", "#/book", "#/bank", "#/iv", "#/me"]) {
  await page.goto(BASE + hash, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  const info = await page.evaluate(() => {
    const svgs = document.querySelectorAll("svg.ico, .mark svg, .icon-btn svg, .pill svg");
    const tabs = [...document.querySelectorAll("#tabbar button")].map((b) => ({
      label: b.querySelector("span")?.textContent || "",
      hasSvg: !!b.querySelector("svg"),
      text: (b.querySelector("i")?.textContent || "").trim(),
    }));
    // 页面文本里是否还残留图形符号
    const glyphs = (document.body.innerText.match(/[◎❖✦▶▤◇◻●○◆ℹ⏰🔥📖🎯✍☰✎]/gu) || []);
    return { svgCount: svgs.length, tabs, glyphs: [...new Set(glyphs)] };
  });
  console.log(`\n${hash}`);
  console.log(`  svg 图标数: ${info.svgCount}`);
  const tabsBad = info.tabs.filter((t) => !t.hasSvg || t.text);
  if (tabsBad.length) bad(`底部导航有按钮不是 SVG：${tabsBad.map((t) => t.label + "(" + t.text + ")").join(", ")}`);
  else ok(`底部导航 6 个按钮全是 SVG（${info.tabs.map((t) => t.label).join("/")}）`);
  if (info.glyphs.length) bad(`页面仍残留图形符号：${info.glyphs.join(" ")}`);
}
await browser.close();
console.log(fail ? `\n!! ${fail} 项问题` : "\n图标系统检查通过");
