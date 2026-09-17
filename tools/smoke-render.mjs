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
  ["教材首页", "#/book", "view-book"],
  ["教材·第一篇", "#/book/P1", "view-book"],
  ["教材·附录篇", "#/book/PX", "view-book"],
  ["教材·首节", "#/book/C0/0.1", "view-book"],
  ["教材·代码节", "#/book/C3/3.5", "view-book"],
  ["教材·Agent节", "#/book/C8/8.7", "view-book"],
  ["教材·附录短节", "#/book/PX/A", "view-book"],
  ["教材·末节", "#/book/P6/D", "view-book"],
  ["教材·第七篇", "#/book/P7", "view-book"],
  ["教材·提示链节", "#/book/C18/18.1", "view-book"],
  ["教材·A2A节", "#/book/C21/21.1", "view-book"],
  ["教材·附录C节", "#/book/C22/22.1", "view-book"],
  ["教材·缺口Linux", "#/book/C2/2.5", "view-book"],
  ["教材·缺口测试", "#/book/C2/2.6", "view-book"],
  ["教材·缺口Docker", "#/book/C3/3.9", "view-book"],
  ["教材·缺口LLMOps", "#/book/C5/5.5", "view-book"],
  ["教材·缺口成本", "#/book/C5/5.6", "view-book"],
  ["教材·ComputerUse", "#/book/C22/22.4", "view-book"],
  ["教材·Git协作", "#/book/C2/2.7", "view-book"],
  ["教材·Evals实操", "#/book/C8/8.12", "view-book"],
  ["教材·LoRA实操", "#/book/C9/9.3", "view-book"],
  ["教材·简历包装", "#/book/C17/17.6", "view-book"],
  ["必背代码", "#/code", "view-code"],
  ["必背代码·AI循环", "#/code/ai-react", "view-code"],
  ["必背代码·Python", "#/code/py-sql", "view-code"],
  ["必背代码·算法条", "#/code/algo-attention", "view-code"],
  ["教材·旧链接兼容", "#/tree", "view-book"],
  ["题库·精讲", "#/bank", "view-bank"],
  ["题库·媒体", "#/bank?src=media", "view-bank"],
  ["题目深钻", "#/q/tf-02", "view-bank"],
  ["题目深钻(无追问)", "#/q/pt-01", "view-bank"],
  ["题目深钻(模式题)", "#/q/dp-12", "view-bank"],
  ["题目深钻(缺口题)", "#/q/ops-04", "view-bank"],
  ["媒体题目", "#/mq/m1", "view-bank"],
  ["访谈列表", "#/iv", "view-iv"],
  ["访谈详情(S级·有深度思考)", "#/ivd/kevin-weil", "view-iv"],
  ["访谈详情(A级·有深度思考)", "#/ivd/natalie-fde", "view-iv"],
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

  /* ---------- 内容断言（教材 / 深度思考） ---------- */
  console.log("\n内容断言：");
  const MD = sandbox.MD, TB = sandbox.TB_SECTIONS, BOOK = sandbox.TEXTBOOK, DEEP = sandbox.IV_DEEP;
  if (!MD || !TB || !BOOK) bad("MD / TB_SECTIONS / TEXTBOOK 未挂载");
  else {
    const ids = Object.keys(TB);
    let thrown = 0, empty = 0, codeSec = 0, tableSec = 0, cjkTotal = 0;
    for (const id of ids) {
      let html = "";
      try { html = MD.render(TB[id].body || ""); } catch (e) { bad(`${id}: MD.render 抛异常 ${e.message}`); thrown++; continue; }
      if (html.replace(/<[^>]+>/g, "").trim().length < 80) { bad(`${id}: 渲染后正文过短`); empty++; }
      if (html.includes('<pre class="code"')) codeSec++;
      if (html.includes("<table>")) tableSec++;
      cjkTotal += (String(TB[id].body).match(/[\u4e00-\u9fa5]/g) || []).length;
    }
    if (!thrown && !empty) ok(`${ids.length} 节讲义全部渲染成功，合计 ${(cjkTotal / 1000).toFixed(1)}k 汉字`);
    ok(`含代码块的节 ${codeSec} 个 / 含表格的节 ${tableSec} 个`);
    if (codeSec < 20) bad(`代码块覆盖过少（${codeSec} 节），疑似 ~~~ 围栏未被 md.js 识别`);

    // 教材首页
    sandbox.location.hash = "#/book";
    for (const fn of hashFns) await fn();
    const home = elCache["#view-book"]._html || "";
    const missPart = (BOOK.parts || []).filter((p) => !home.includes(p.title));
    if (missPart.length) bad(`教材首页缺篇: ${missPart.map((p) => p.id).join(", ")}`);
    else ok(`教材首页列出全部 ${(BOOK.parts || []).length} 篇`);

    // 每一篇页面
    let pBad = 0;
    for (const p of BOOK.parts || []) {
      sandbox.location.hash = "#/book/" + p.id;
      for (const fn of hashFns) await fn();
      if (!((elCache["#view-book"]._html || "").length > 150)) { bad(`篇页渲染失败: ${p.id}`); pBad++; }
    }
    if (!pBad) ok(`全部 ${(BOOK.parts || []).length} 个篇页渲染正常`);

    // 每一节详情页
    const secPos = {};
    (BOOK.parts || []).forEach((p) => (p.chapters || []).forEach((c) => (c.sections || []).forEach((s) => (secPos[s] = p.id))));
    let secBad = 0;
    for (const id of ids) {
      sandbox.location.hash = "#/book/" + (secPos[id] || "P1") + "/" + id;
      for (const fn of hashFns) await fn();
      if (!((elCache["#view-book"]._html || "").length > 300)) { bad(`节页渲染失败: ${id}`); secBad++; }
    }
    if (!secBad) ok(`全部 ${ids.length} 节详情页渲染正常`);

    // 访谈 AI 深度思考
    if (!DEEP) bad("IV_DEEP 未挂载");
    else {
      const deepIds = Object.keys(DEEP);
      let dbad = 0;
      for (const id of deepIds) {
        sandbox.location.hash = "#/ivd/" + id;
        for (const fn of hashFns) await fn();
        const h = elCache["#view-iv"]._html || "";
        if (!h.includes("AI 深度思考")) { bad(`访谈详情未渲染深度思考: ${id}`); dbad++; }
      }
      if (!dbad) ok(`${deepIds.length} 场访谈详情页均渲染出「AI 深度思考」区块`);
    }

    // 必背代码：每条详情页都能渲染出代码块
    const CBANK = sandbox.CODE_BANK, CITEMS = sandbox.CODE_ITEMS;
    if (!CBANK || !CITEMS) bad("CODE_BANK / CODE_ITEMS 未挂载");
    else {
      const cIds = Object.keys(CITEMS);
      let cbad = 0, withCode = 0;
      for (const id of cIds) {
        sandbox.location.hash = "#/code/" + id;
        for (const fn of hashFns) await fn();
        const h = elCache["#view-code"]._html || "";
        if (h.length < 300) { bad(`代码详情渲染失败: ${id}`); cbad++; }
        if (h.indexOf('<pre class="code"') >= 0) withCode++;
      }
      if (!cbad) ok(`${cIds.length} 条必背代码详情页渲染正常（${withCode} 条渲染出代码块）`);
      sandbox.location.hash = "#/code";
      for (const fn of hashFns) await fn();
      const listHtml = elCache["#view-code"]._html || "";
      const missG = (CBANK.groups || []).filter((g) => listHtml.indexOf(g.name) < 0);
      if (missG.length) bad(`代码列表缺分组: ${missG.map((g) => g.id).join(", ")}`);
      else ok(`代码列表列出全部 ${(CBANK.groups || []).length} 组`);
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
