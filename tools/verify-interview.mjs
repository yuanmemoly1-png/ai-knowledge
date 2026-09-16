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

// ---- 9. 教材 ----
head("9) 教材");
const BOOK = W.TEXTBOOK;
const TB = W.TB_SECTIONS;
if (!BOOK) bad("TEXTBOOK 缺失");
if (!TB) bad("TB_SECTIONS 缺失");
if (BOOK && TB) {
  const bookSecs = [];
  const bookIds = new Set();
  for (const p of BOOK.parts || []) {
    if (!p.id || !p.title) bad(`篇缺 id 或 title: ${JSON.stringify(p.id)}`);
    for (const c of p.chapters || []) {
      if (!c.id || !c.title) bad(`章缺 id 或 title: ${p.id}/${c.id}`);
      for (const sid of c.sections || []) {
        if (bookIds.has(sid)) bad(`节 id 在目录中重复: ${sid}`);
        bookIds.add(sid);
        bookSecs.push({ sid, part: p, chapter: c });
      }
    }
  }
  const tbIds = Object.keys(TB);
  ok(`目录：${(BOOK.parts || []).length} 篇 / ${(BOOK.parts || []).reduce((s, p) => s + (p.chapters || []).length, 0)} 章 / ${bookSecs.length} 节`);
  ok(`正文：${tbIds.length} 节有讲义`);

  // 目录里的每一节都要有正文
  const noBody = bookSecs.filter((x) => !TB[x.sid]);
  if (noBody.length) bad(`目录中 ${noBody.length} 节缺正文: ${noBody.map((x) => x.sid).join(", ")}`);

  // 正文里不能有目录外孤儿
  const orphans = tbIds.filter((id) => !bookIds.has(id));
  if (orphans.length) bad(`正文中有目录外孤儿节: ${orphans.join(", ")}`);

  // 字段完整性与篇幅
  let thin = 0, noEv = 0, badRel = 0, badQs = 0, shortBody = 0, longBody = 0, cjkMin = 1e9, cjkMax = 0;
  const REQ = ["id", "t", "why", "learn", "body", "keypoints", "pitfalls", "rel", "qs"];
  for (const id of tbIds) {
    const s = TB[id];
    for (const k of REQ) if (s[k] == null || (Array.isArray(s[k]) && !s[k].length && k !== "qs" && k !== "rel")) bad(`${id}: 字段 ${k} 为空`);
    if (s.id !== id) bad(`${id}: id 字段与键不一致 (${s.id})`);
    if (!s.learn || s.learn.length < 4) thin++;
    if (!(s.ev instanceof Array)) noEv++;
    for (const p of s.rel || []) if (!paths.has(p)) { bad(`${id}: 关联笔记不存在 ${p}`); badRel++; }
    for (const q of s.qs || []) if (!ids.has(q)) { bad(`${id}: 关联真题不存在 ${q}`); badQs++; }
    const cjk = (String(s.body).match(/[\u4e00-\u9fa5]/g) || []).length;
    if (cjk < cjkMin) cjkMin = cjk;
    if (cjk > cjkMax) cjkMax = cjk;
    if (cjk < 180) shortBody++;
    if (cjk > 900) longBody++;
  }
  if (!badRel) ok(`关联笔记引用全部有效`);
  if (!badQs) ok(`关联真题引用全部有效`);
  if (shortBody) bad(`${shortBody} 节正文过短（< 180 汉字）`);
  if (longBody) bad(`${longBody} 节正文过长（> 900 汉字）`);
  ok(`正文字数（汉字）区间：${cjkMin} ~ ${cjkMax}`);

  // 关联覆盖率
  const linked = new Set();
  for (const id of tbIds) for (const p of TB[id].rel || []) linked.add(p);
  ok(`教材覆盖笔记：${linked.size}/${paths.size} 篇（${Math.round((linked.size / paths.size) * 100)}%）`);
  const uncovered = [...paths].filter((p) => !linked.has(p) && !p.startsWith("yt/"));
  if (uncovered.length) console.log("     未挂进教材的笔记: " + uncovered.slice(0, 12).join(", ") + (uncovered.length > 12 ? ` …共 ${uncovered.length} 篇` : ""));
}

// ---- 10. 访谈 AI 深度思考 ----
head("10) 访谈 AI 深度思考");
const DEEP = W.IV_DEEP;
if (!DEEP) bad("IV_DEEP 缺失");
else {
  const ivIds = new Set(IV.items.map((i) => i.id));
  const deepIds = Object.keys(DEEP);
  ok(`覆盖 ${deepIds.length}/${IV.items.length} 场访谈`);
  const ALLOW_TAG = new Set(["证据扎实", "经验之谈", "有争议", "需要条件"]);
  const REQ2 = ["verdict", "thesis", "reasoning", "boundary", "counter", "meaning", "action"];
  let badKey = 0, noClaim = 0, badTag = 0, missField = 0;
  for (const id of deepIds) {
    if (!ivIds.has(id)) { bad(`深度思考 id 不在访谈库中: ${id}`); badKey++; }
    const d = DEEP[id];
    for (const k of REQ2) if (!d[k] || String(d[k]).trim().length < 4) { bad(`${id}: 缺字段 ${k}`); missField++; }
    if (!(d.claims || []).length) { bad(`${id}: 无论断级拆解`); noClaim++; }
    for (const c of d.claims || []) {
      if (!c.c || !c.a) bad(`${id}: claim 缺 c 或 a`);
      if (c.tag && !ALLOW_TAG.has(c.tag)) { bad(`${id}: 非法 tag「${c.tag}」`); badTag++; }
    }
  }
  const noDeep = IV.items.filter((i) => !DEEP[i.id]).map((i) => i.id);
  if (noDeep.length) bad(`未覆盖: ${noDeep.join(", ")}`);
  const claims = deepIds.reduce((s, id) => s + (DEEP[id].claims || []).length, 0);
  if (!badKey && !noClaim && !badTag && !missField) ok(`${deepIds.length} 场字段完整，共 ${claims} 条论断级拆解，tag 全部合法`);
  const tierOf = {};
  IV.items.forEach((i) => { tierOf[i.id] = i.tier; });
  const byTierDeep = { S: 0, A: 0, B: 0 };
  deepIds.forEach((id) => { if (tierOf[id]) byTierDeep[tierOf[id]]++; });
  console.log(`     分级覆盖: S ${byTierDeep.S}/9 · A+B ${byTierDeep.A + byTierDeep.B}/17`);
}

console.log("\n" + (fail ? `❌ 校验失败：${fail} 项问题` : "✅ 全部校验通过"));
process.exit(fail ? 1 : 0);
