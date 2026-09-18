#!/usr/bin/env node
// PM 站渲染冒烟：最小 DOM 垫片真跑一遍 app.js 的所有页面
// 目的：抓运行时 TypeError、模板漏字段导致的 undefined 泄漏
// 用法: node tools/smoke-pm.mjs
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const ROOT = process.cwd();
const PMD = path.join(ROOT, "pm", "data");
const ID = path.join(ROOT, "interview", "data");

let fail = 0;
const ok = (m) => console.log("  ✓ " + m);
const bad = (m) => { fail++; console.log("  ✗ " + m); };

/* ---------- 最小 DOM 垫片 ---------- */
function mkEl(tag = "div") {
  const el = {
    tagName: tag, _html: "", textContent: "", value: "", style: {}, dataset: {}, src: "",
    classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
    addEventListener() {}, removeEventListener() {}, setAttribute() {}, getAttribute: () => null,
    appendChild() {}, focus() {}, setSelectionRange() {}, closest: () => null,
    set innerHTML(v) { this._html = String(v); if (String(v).includes("[object")) bad("模板里出现 [object]：" + String(v).slice(0, 120)); },
    get innerHTML() { return this._html; },
    querySelector: () => mkEl(),
    querySelectorAll: () => [],
  };
  return el;
}
const elCache = {};
const listeners = {};
const storage = {};
const documentStub = {
  readyState: "complete",
  documentElement: { dataset: {} },
  head: { appendChild() {} },
  body: mkEl(),
  querySelector(sel) { if (!elCache[sel]) elCache[sel] = mkEl(); return elCache[sel]; },
  querySelectorAll: () => [],
  createElement: (t) => { const e = mkEl(t); setTimeout(() => e.onload && e.onload(), 0); return e; },
  addEventListener(ev, fn) { (listeners[ev] = listeners[ev] || []).push(fn); },
};
const sandbox = {
  console, Math, Date, JSON, Object, Array, String, Number, Boolean, RegExp, Error, Promise, Set, Map,
  URLSearchParams, encodeURIComponent, decodeURIComponent, isNaN, parseInt, parseFloat,
  setTimeout, clearTimeout, setInterval: () => 0, clearInterval() {},
  document: documentStub,
  localStorage: {
    getItem: (k) => (k in storage ? storage[k] : null),
    setItem: (k, v) => { storage[k] = String(v); },
    removeItem: (k) => { delete storage[k]; },
  },
  navigator: {}, location: { hash: "#/today", protocol: "http:", origin: "http://localhost" },
  prompt: () => null, confirm: () => false, alert: () => {},
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
sandbox.addEventListener = (ev, fn) => { (listeners[ev] = listeners[ev] || []).push(fn); };
sandbox.removeEventListener = () => {};
sandbox.scrollTo = () => {};
sandbox.isSecureContext = false;
vm.createContext(sandbox);

/* ---------- 加载数据 + 应用 ---------- */
const load = (p) => vm.runInContext(fs.readFileSync(p, "utf8"), sandbox, { filename: path.basename(p) });
for (const f of ["interviews.js", "questions.js", "iv-deep-s.js", "iv-deep-ab.js"]) {
  const p = path.join(ID, f);
  if (fs.existsSync(p)) load(p);
}
for (const f of fs.readdirSync(PMD).filter((f) => f.endsWith(".js"))) load(path.join(PMD, f));
load(path.join(ROOT, "interview", "assets", "md.js"));
load(path.join(ROOT, "pm", "assets", "app.js"));

const hashFns = listeners["hashchange"] || [];
if (!hashFns.length) bad("app.js 没有注册 hashchange 路由");
console.log(`已加载 PM 数据 + md.js + app.js`);

/* ---------- 遍历页面 ---------- */
const OL = sandbox.PM_OUTLINE, SEC = sandbox.PM_SECTIONS, EX = sandbox.PM_EXTRA;
const ROUTES = [
  ["今日", "#/today", "view-today"],
  ["课程目录", "#/course", "view-course"],
  ["篇页 P1", "#/course/P1", "view-course"],
  ["访谈列表", "#/iv", "view-iv"],
  ["教学资源", "#/teach", "view-teach"],
  ["我的", "#/me", "view-me"],
];
for (const s of ["1.1", "2.2", "3.1", "4.1", "5.5", "6.1"]) ROUTES.push([`节 ${s}`, `#/sec/${s}`, "view-course"]);

console.log("\n路由渲染：");
(async () => {
  for (const [name, hash, viewId] of ROUTES) {
    sandbox.location.hash = hash;
    for (const k of Object.keys(elCache)) elCache[k]._html = "";
    try {
      for (const fn of hashFns) fn();
      await new Promise((r) => setTimeout(r, 20));
      const html = (elCache["#" + viewId] || {})._html || "";
      if (html.length < 150) bad(`${name}（${hash}）渲染过短：${html.length} 字符`);
      if (/\bundefined\b/.test(html)) bad(`${name}（${hash}）模板里有 undefined`);
      if (/\bNaN\b/.test(html)) bad(`${name}（${hash}）模板里有 NaN`);
      console.log(`  ${name.padEnd(12)} ${String(html.length).padStart(6)} 字符`);
    } catch (e) {
      bad(`${name}（${hash}）抛异常：${e && e.message}`);
    }
  }

  /* ---------- 内容断言 ---------- */
  console.log("\n内容断言：");
  if (OL && SEC) {
    const ids = Object.keys(SEC);
    let cbad = 0, withBody = 0;
    for (const id of ids) {
      const pos = (OL.parts || []).find((p) => (p.sections || []).includes(id));
      sandbox.location.hash = "#/sec/" + id;
      for (const fn of hashFns) fn();
      const h = elCache["#view-course"]._html || "";
      if (h.length < 300) { bad(`节页渲染失败: ${id}`); cbad++; }
      if (h.indexOf('class="card tb-body"') >= 0) withBody++;
    }
    if (!cbad) ok(`${ids.length} 节详情页渲染正常（${withBody} 节渲染出正文）`);
    // 目录里的节都要有正文
    const outlineIds = (OL.parts || []).flatMap((p) => p.sections || []);
    const noBody = outlineIds.filter((id) => !SEC[id]);
    if (noBody.length) bad(`目录中 ${noBody.length} 节缺正文: ${noBody.join(", ")}`);
    else ok(`目录 ${outlineIds.length} 节全部有正文`);
  } else bad("PM_OUTLINE / PM_SECTIONS 未挂载");

  if (EX && EX.items) {
    sandbox.location.hash = "#/teach";
    for (const fn of hashFns) fn();
    const h = elCache["#view-teach"]._html || "";
    const miss = EX.items.filter((x) => h.indexOf(x.title.slice(0, 12)) < 0);
    if (miss.length) bad(`教学页缺 ${miss.length} 条资源`);
    else ok(`教学页列出全部 ${EX.items.length} 条资源`);
  }

  console.log("\n" + (fail ? `❌ PM 站冒烟失败：${fail} 项` : "✅ PM 站全部页面渲染通过"));
  process.exit(fail ? 1 : 0);
})();
