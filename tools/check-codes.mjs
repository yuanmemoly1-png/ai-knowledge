// 必背代码：浏览器端功能测试（遮罩默写 / 自评排期 / 复制 / 底部导航）
import { chromium } from "playwright";

const BASE = process.env.SHOT_BASE || "http://localhost:8788/interview/index.html";
let fail = 0;
const ok = (m) => console.log("  ✓ " + m);
const bad = (m) => { fail++; console.log("  ✗ " + m); };

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 430, height: 932 }, isMobile: true, hasTouch: true,
  permissions: ["clipboard-read", "clipboard-write"],
});
const page = await ctx.newPage();
await page.addInitScript(() => {
  localStorage.setItem("ai-interview-deep-v1", JSON.stringify({ v: 1, q: {}, nodes: {}, tb: {}, code: {}, seen: {}, text: {}, streak: { last: "", days: 1 }, theme: "dark" }));
});
const errs = [];
page.on("pageerror", (e) => errs.push(e.message));

/* 1. 底部导航 7 个标签，含「背码」 */
await page.goto(BASE + "#/code", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
const tabs = await page.$$eval("#tabbar button", (bs) => bs.map((b) => b.querySelector("span")?.textContent));
if (tabs.length === 7 && tabs.includes("背码")) ok(`底部导航 7 个标签：${tabs.join("/")}`);
else bad(`底部导航异常：${tabs.join("/")}`);

/* 2. 列表页渲染出条目 */
const rows = await page.$$("#view-code .row");
if (rows.length >= 34) ok(`列表页渲染 ${rows.length} 条`);
else bad(`列表页只渲染 ${rows.length} 条（应为 34）`);

/* 3. 打开一条，代码可见 */
await page.goto(BASE + "#/code/ai-react", { waitUntil: "networkidle" });
await page.waitForTimeout(400);
const title = await page.textContent("#view-code h1");
if (title && title.includes("ReAct")) ok(`详情页标题：${title.trim()}`);
else bad(`详情页标题异常：${title}`);
const hasCode = await page.$$eval("#view-code pre.code code", (n) => n.length && n[0].textContent.includes("MAX_STEPS"));
if (hasCode) ok("代码块渲染，且含 MAX_STEPS");
else bad("代码块未渲染或内容异常");

/* 4. 点「遮住默写」→ 代码消失、出现默写框 */
await page.click('#view-code button:has-text("遮住默写")');
await page.waitForTimeout(300);
const masked = await page.evaluate(() => ({
  hasMask: !!document.querySelector("#view-code .code-mask"),
  hasPre: !!document.querySelector("#view-code pre.code"),
  hasArea: !!document.querySelector("#code-ans"),
  hasKeys: document.querySelector("#view-code")?.innerText.includes("默写要点"),
}));
if (masked.hasMask && !masked.hasPre && masked.hasArea) ok("遮住后：代码隐藏、遮罩与默写框出现");
else bad(`遮住后状态异常 ${JSON.stringify(masked)}`);
if (!masked.hasKeys) ok("遮住后：默写要点已隐藏（不泄题）");
else bad("遮住后仍显示默写要点");

/* 5. 在默写框写东西 → 写进存档 */
await page.fill("#code-ans", "thought -> action -> observation");
await page.waitForTimeout(500);
const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("ai-interview-deep-v1")).text["code_ai-react"]);
if (saved === "thought -> action -> observation") ok("默写内容已存进本地存档");
else bad(`默写内容未存：${saved}`);

/* 6. 点「对照答案」→ 代码回来、要点出现 */
await page.click('#view-code button:has-text("对照答案")');
await page.waitForTimeout(300);
const back = await page.evaluate(() => ({
  hasPre: !!document.querySelector("#view-code pre.code"),
  hasMask: !!document.querySelector("#view-code .code-mask"),
  hasKeys: document.querySelector("#view-code")?.innerText.includes("默写要点"),
}));
if (back.hasPre && !back.hasMask && back.hasKeys) ok("对照后：代码与要点恢复");
else bad(`对照后状态异常 ${JSON.stringify(back)}`);

/* 7. 自评「能默出来」→ 写入排期 */
await page.click('#view-code button:has-text("能默出来")');
await page.waitForTimeout(400);
const st = await page.evaluate(() => JSON.parse(localStorage.getItem("ai-interview-deep-v1")).code["ai-react"]);
if (st && st.box === 1 && st.n === 1 && st.next > Date.now()) ok(`自评写入排期：Lv${st.box}，下次 ${new Date(st.next).toISOString().slice(0, 10)}`);
else bad(`排期未写入：${JSON.stringify(st)}`);

/* 8. 连点两次「能默出来」→ Lv2（判定「背下来」的门槛） */
await page.click('#view-code button:has-text("能默出来")');
await page.waitForTimeout(400);
const st2 = await page.evaluate(() => JSON.parse(localStorage.getItem("ai-interview-deep-v1")).code["ai-react"]);
if (st2.box === 2) ok("连续两次「能默出来」→ Lv2（达到「已背」判定）");
else bad(`Lv 递进异常：${JSON.stringify(st2)}`);

/* 9. 进度回填到列表与「我的」 */
await page.goto(BASE + "#/code", { waitUntil: "networkidle" });
await page.waitForTimeout(400);
const heroTxt = await page.textContent("#view-code .hero-stats");
if (heroTxt && /已练过/.test(heroTxt)) ok(`进度已回填：${heroTxt.replace(/\s+/g, " ").trim()}`);
else bad("进度未回填");
await page.goto(BASE + "#/me", { waitUntil: "networkidle" });
await page.waitForTimeout(400);
const meTxt = await page.textContent("#view-me");
if (meTxt && meTxt.includes("必背代码已默出")) ok("「我的」页出现必背代码 KPI");
else bad("「我的」页缺必背代码 KPI");

/* 10. 分组与等级筛选可用 */
await page.goto(BASE + "#/code", { waitUntil: "networkidle" });
await page.waitForTimeout(400);
const before = (await page.$$("#view-code .row")).length;
await page.click('#view-code .chip:has-text("算法岗手撕")');
await page.waitForTimeout(400);
const after = (await page.$$("#view-code .row")).length;
if (after > 0 && after < before) ok(`分组筛选生效：${before} → ${after} 条`);
else bad(`分组筛选异常：${before} → ${after}`);

await browser.close();
if (errs.length) { bad(`页面报错 ${errs.length} 条：${errs[0]}`); }
console.log(fail ? `\n!! ${fail} 项失败` : "\n必背代码功能测试全部通过");
process.exit(fail ? 1 : 0);
