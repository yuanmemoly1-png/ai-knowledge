#!/usr/bin/env node
// 渲染冒烟测试：用最小 DOM 垫片真跑一遍 app.js 的所有页面
// 目的：抓运行时 TypeError、以及模板里漏字段导致的 "undefined" 泄漏
// 用法: node tools/smoke-render.mjs
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DATA = path.join(ROOT, "interview", "data");

let fail = 0;
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
  querySelector(sel) {
    if (!elCache[sel]) elCache[sel] = mkEl();
    return elCache[sel];
  },
  querySelectorAll: () => [],
  createElement: (t) => {
    const e = mkEl(t);
    // 让按需加载的 script 立刻"加载完成"
    setTimeout(() => e.onload && e.onload(), 0);
    return e;
  },
  addEventListener(ev, fn) { (listeners[ev] = listeners[ev] || []).push(fn); },
};

const sandbox = {
  console,
  Math, Date, JSON, Object, Array, String, Number, Boolean, RegExp, Error, Promise, Set, Map,
  URLSearchParams, encodeURIComponent, decodeURIComponent, isNaN, parseInt, parseFloat,
  setTimeout, clearTimeout, setInterval: () => 0, clearInterval() {},
  document: documentStub,
  localStorage: {
    getItem: (k) => (k in storage ? storage[k] : null),
    setItem: (k, v) => { storage[k] = String(v); },
    removeItem: (k) => { delete storage[k]; },
  },
  navigator: {},
  location: { hash: "#/today", protocol: "http:", origin: "http://localhost" },
  prompt: () => null,
  confirm: () => false,
  alert: () => {},
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
sandbox.addEventListener = (ev, fn) => { (listeners[ev] = listeners[ev] || []).push(fn); };
sandbox.removeEventListener = () => {};
sandbox.scrollTo = () => {};
sandbox.getSelection = () => null;
sandbox.isSecureContext = false;
vm.createContext(sandbox);

/* ---------- 加载数据 + 应用 ---------- */
const dataFiles = fs.readdirSync(DATA).filter((f) => f.endsWith(".js"));
for (const f of dataFiles) {
  vm.runInContext(fs.readFileSync(path.join(DATA, f), "utf8"), sandbox, { filename: f });
}
for (const f of ["md.js", "app.js"]) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, "interview", "assets", f), "utf8"), sandbox, { filename: f });
}

const hashFns = listeners["hashchange"] || [];
if (!hashFns.length) bad("app.js 没有注册 hashchange 路由");
console.log(`\n已加载：${dataFiles.length} 个数据文件 + md.js + app.js`);

/* ---------- 遍历所有页面 ---------- */
const enc = (p) => encodeURIComponent(p);
const ROUTES = [
  ["今日", "#/today", "view-today"],
  ["知识树", "#/tree", "view-tree"],
  ["知识树(指定层)", "#/tree/L1", "view-tree"],
  ["题库·精讲", "#/bank", "view-bank"],
  ["题库·媒体", "#/bank?src=media", "view-bank"],
  ["题目深钻", "#/q/tf-02", "view-bank"],
  ["题目深钻(无追问)", "#/q/pt-01", "view-bank"],
  ["媒体题目", "#/mq/m1", "view-bank"],
  ["访谈列表", "#/iv", "view-iv"],
  ["访谈详情", "#/ivd/natalie-fde", "view-iv"],
  ["访谈详情(无笔记)", "#/ivd/marty-cagan", "view-iv"],
  ["笔记列表", "#/notes", "view-notes"],
  ["笔记(知识库)", "#/note/" + enc("01-名词与概念/RAG检索增强生成.md"), "view-notes"],
  ["笔记(访谈库)", "#/note/" + enc("yt/02-视频笔记/2026-07_NatalieMeurer_Dirty-Secret-FDE.md"), "view-notes"],
  ["我的", "#/me", "view-me"],
];

console.log("\n路由渲染结果：");
const results = [];
(async () => {
  for (const [name, hash, viewId] of ROUTES) {
    sandbox.location.hash = hash;
    // 清掉上一次的 HTML，便于判定本次是否真的渲染了
    for (const k of Object.keys(elCache)) elCache[k]._html = "";
    try {
      for (const fn of hashFns) await fn();
      await new Promise((r) => setTimeout(r, 30)); // 等异步（笔记正文）
      const html = (elCache["#" + viewId] || {})._html || "";
      const okLen = html.length > 150;
      const noUndef = !/\bundefined\b/.test(html);
      const noNaN = !/\bNaN\b/.test(html);
      results.push({ name, hash, len: html.length, okLen, noUndef, noNaN });
      if (!okLen) bad(`${name}（${hash}）渲染内容过短：${html.length} 字符`);
      if (!noUndef) {
        bad(`${name}（${hash}）模板里有 undefined`);
        const m = html.match(/.{0,90}undefined.{0,60}/);
        if (m) console.log("      …" + m[0].replace(/\s+/g, " "));
      }
      if (!noNaN) bad(`${name}（${hash}）模板里有 NaN`);
    } catch (e) {
      bad(`${name}（${hash}）抛出异常：${e && e.message}`);
      results.push({ name, hash, len: 0, err: true });
    }
  }

  console.log("\n" + "页面".padEnd(20) + "字符数".padStart(8) + "  状态");
  for (const r of results) {
    const st = r.err ? "✗ 异常" : r.okLen && r.noUndef && r.noNaN ? "✓" : "✗";
    console.log("  " + r.name.padEnd(18) + String(r.len).padStart(8) + "  " + st);
  }
  console.log("\n" + (fail ? `❌ 渲染冒烟失败：${fail} 项` : "✅ 全部页面渲染通过（无异常 / 无 undefined / 无 NaN）"));
  process.exit(fail ? 1 : 0);
})();
