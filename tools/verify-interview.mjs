#!/usr/bin/env node
// 校验「AI 面试深度站」的数据完整性与语法
// 用法: node tools/verify-interview.mjs
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
const head = (m) => console.log("\n" + m);

// ---- 1. 语法检查（所有前端 JS） ----
head("1) 语法检查");
const jsFiles = [
  ...fs.readdirSync(path.join(ROOT, "interview", "assets")).map((f) => path.join(ROOT, "interview", "assets", f)),
  path.join(ROOT, "interview", "sw.js"),
  ...fs.readdirSync(DATA).map((f) => path.join(DATA, f)),
];
for (const f of jsFiles) {
  if (!f.endsWith(".js")) continue;
  try {
    new vm.Script(fs.readFileSync(f, "utf8"), { filename: f });
  } catch (e) {
    bad(`${path.relative(ROOT, f)} — ${e.message}`);
    continue;
  }
}
if (!fail) ok(`${jsFiles.filter((f) => f.endsWith(".js")).length} 个 JS 文件语法通过`);

// ---- 2. 加载数据 ----
head("2) 加载数据（模拟浏览器 window）");
const sandbox = { window: {}, console };
vm.createContext(sandbox);
for (const f of fs.readdirSync(DATA).filter((f) => f.endsWith(".js"))) {
  try {
    vm.runInContext(fs.readFileSync(path.join(DATA, f), "utf8"), sandbox, { filename: f });
  } catch (e) {
    bad(`执行失败 ${f}: ${e.message}`);
  }
}
const W = sandbox.window;
const IDX = W.NOTES_INDEX, TREE = W.KNOWLEDGE_TREE, BANK = W.QUESTION_BANK, QUOTES = W.QUOTE_BANK;
if (!IDX) bad("NOTES_INDEX 缺失");
if (!TREE) bad("KNOWLEDGE_TREE 缺失");
if (!BANK) bad("QUESTION_BANK 缺失");
if (!QUOTES) bad("QUOTE_BANK 缺失");
if (fail) { console.log("\n致命错误，终止"); process.exit(1); }
ok(`笔记索引 ${IDX.notes.length} 篇 / ${IDX.chunks.length} 个模块包`);
ok(`知识树 ${TREE.layers.length} 层 / ${TREE.layers.reduce((s, l) => s + l.nodes.length, 0)} 个节点`);
ok(`题库 ${BANK.questions.length} 题 · 岗位 ${BANK.roles.length} · 模块 ${BANK.modules.length}`);
ok(`金句 ${QUOTES.length} 条`);

const paths = new Set(IDX.notes.map((n) => n.p));
const roles = new Set(BANK.roles.map((r) => r.id));
const mods = new Set(BANK.modules.map((m) => m.id));

// ---- 3. 索引与正文包一致 ----
head("3) 索引 ↔ 正文包一致性");
let missing = 0, checked = 0;
for (const n of IDX.notes) {
  const ch = W.NOTES_CHUNK && W.NOTES_CHUNK[n.k];
  if (!ch) { bad(`模块包缺失: ${n.k} (${n.p})`); missing++; break; }
  if (typeof ch[n.p] !== "string") { bad(`正文缺失: ${n.p}`); missing++; }
  checked++;
}
if (!missing) ok(`${checked} 篇正文全部可在模块包中取到`);

// 双链可解析率
let linkTotal = 0, linkHit = 0;
for (const n of IDX.notes) {
  for (const l of n.l || []) {
    linkTotal++;
    if (IDX.names[l] || IDX.titles[l] || paths.has(l)) linkHit++;
  }
}
ok(`双链解析：${linkHit}/${linkTotal} 可跳转（${Math.round((linkHit / linkTotal) * 100)}%）`);

// ---- 4. 题库交叉引用 ----
head("4) 题库交叉引用");
const ids = new Set();
for (const q of BANK.questions) {
  if (ids.has(q.id)) bad(`题目 id 重复: ${q.id}`);
  ids.add(q.id);
  if (!roles.has(q.role)) bad(`${q.id}: 岗位不存在 ${q.role}`);
  if (!mods.has(q.mod)) bad(`${q.id}: 模块不存在 ${q.mod}`);
  if (!q.q || !q.q.trim()) bad(`${q.id}: 题目为空`);
  if (!q.frame || !q.frame.claim) bad(`${q.id}: 缺 frame.claim`);
  if (!q.probes || !q.probes.length) bad(`${q.id}: 缺追问链`);
  for (const p of q.rel || []) if (!paths.has(p)) bad(`${q.id}: 关联笔记不存在 ${p}`);
}
if (!fail) ok(`${BANK.questions.length} 题字段与引用全部合法`);

// 覆盖度
const byRole = {};
const byMod = {};
for (const q of BANK.questions) {
  byRole[q.role] = (byRole[q.role] || 0) + 1;
  byMod[q.mod] = (byMod[q.mod] || 0) + 1;
}
console.log("     岗位分布: " + BANK.roles.map((r) => `${r.name} ${byRole[r.id] || 0}`).join(" / "));
const zeroMods = BANK.modules.filter((m) => !byMod[m.id]).map((m) => m.name);
if (zeroMods.length) bad(`以下模块暂无题目: ${zeroMods.join(", ")}`);

// 深度分布
const deep = BANK.questions.filter((q) => q.frame && q.frame.why && q.frame.why.length >= 3).length;
ok(`含完整分层论证（why ≥ 3 条）的题：${deep}/${BANK.questions.length}`);
const withEv = BANK.questions.filter((q) => q.ev && q.ev.length).length;
ok(`带访谈证据锚定的题：${withEv}/${BANK.questions.length}`);

// ---- 5. 知识树引用 ----
head("5) 知识树引用");
let treeNotes = 0, treeBad = 0;
for (const L of TREE.layers)
  for (const nd of L.nodes) {
    for (const p of nd.notes || []) { treeNotes++; if (!paths.has(p)) { bad(`节点 ${nd.id}: 笔记不存在 ${p}`); treeBad++; } }
    if (!nd.claim) bad(`节点 ${nd.id}: 缺 claim`);
  }
if (!treeBad) ok(`${treeNotes} 个节点笔记引用全部有效`);

// ---- 6. 金句 ----
head("6) 金句");
const noUrl = QUOTES.filter((q) => !q.url).length;
ok(`${QUOTES.length} 条金句，${QUOTES.length - noUrl} 条带来源链接`);

// ---- 7. 媒体题库 ----
head("7) 媒体题库");
const MB = W.MEDIA_BANK;
if (!MB) bad("MEDIA_BANK 缺失");
else {
  ok(`${MB.meta.total} 题，来自 ${MB.meta.sources.length} 个采集文件`);
  const mIds = new Set();
  let dup = 0, noSrc = 0, noQ = 0;
  for (const it of MB.items) {
    if (!it.q || !it.q.trim()) noQ++;
    if (!it.url) noSrc++;
    if (mIds.has(it.id)) dup++;
    mIds.add(it.id);
  }
  if (noQ) bad(`${noQ} 题缺题干`);
  if (dup) bad(`${dup} 个 id 重复`);
  ok(`带来源链接 ${MB.items.length - noSrc}/${MB.items.length}；无重复 id`);
  const byRole = {};
  for (const it of MB.items) { const k = it.role || "(未归类)"; byRole[k] = (byRole[k] || 0) + 1; }
  console.log("     岗位分布: " + Object.entries(byRole).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(" / "));
  // 与精讲题库 id 冲突检查
  const clash = MB.items.filter((it) => BANK.questions.some((q) => q.id === it.id)).length;
  if (clash) bad(`与精讲题库 id 冲突 ${clash} 个`);
}

// ---- 8. 访谈库 ----
head("8) 访谈库");
const IV = W.INTERVIEW_LIB;
if (!IV) bad("INTERVIEW_LIB 缺失");
else {
  ok(`${IV.items.length} 场访谈，分 ${IV.tiers.length} 档`);
  const tiers = new Set(IV.tiers.map((t) => t.id));
  const ids = new Set();
  let noNote = 0, badNote = 0, noUrl = 0;
  for (const i of IV.items) {
    if (ids.has(i.id)) bad(`访谈 id 重复: ${i.id}`);
    ids.add(i.id);
    if (!tiers.has(i.tier)) bad(`${i.id}: 分级不存在 ${i.tier}`);
    if (!i.guest || !i.title) bad(`${i.id}: 缺嘉宾或标题`);
    if (i.note) { if (!paths.has(i.note)) { bad(`${i.id}: 关联笔记不存在 ${i.note}`); badNote++; } }
    else noNote++;
    if (!i.url) noUrl++;
  }
  if (!badNote) ok(`${IV.items.length - noNote} 场已关联可深读笔记，引用全部有效`);
  ok(`带观看链接 ${IV.items.length - noUrl}/${IV.items.length}（未加工期暂无链接属正常）`);
  const byTier = {};
  for (const i of IV.items) byTier[i.tier] = (byTier[i.tier] || 0) + 1;
  console.log("     分级分布: " + IV.tiers.map((t) => `${t.id} 级 ${byTier[t.id] || 0}`).join(" / "));
  const withQuote = IV.items.filter((i) => (i.quotes || []).length).length;
  ok(`带金句的访谈：${withQuote}/${IV.items.length}`);
}

const totalQ = BANK.questions.length + (MB ? MB.meta.total : 0);
ok(`题库合计：${totalQ} 题（精讲 ${BANK.questions.length} + 媒体 ${MB ? MB.meta.total : 0}）`);

console.log("\n" + (fail ? `❌ 校验失败：${fail} 项问题` : "✅ 全部校验通过"));
process.exit(fail ? 1 : 0);
