#!/usr/bin/env node
// 校验 PM 站数据：目录↔正文、字段、引用、篇幅，以及「中文 AI 味红线」
// 用法: node tools/verify-pm.mjs
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const ROOT = process.cwd();
const PMD = path.join(ROOT, "pm", "data");
const ID = path.join(ROOT, "interview", "data");

let fail = 0;
const ok = (m) => console.log("  ✓ " + m);
const bad = (m) => { fail++; console.log("  ✗ " + m); };
const head = (m) => console.log("\n" + m);
const cjk = (t) => (t.match(/[\u4e00-\u9fa5]/g) || []).length;

/* ---------- 1. 语法 ---------- */
head("1) 语法检查");
for (const f of fs.readdirSync(PMD).filter((f) => f.endsWith(".js"))) {
  try { new vm.Script(fs.readFileSync(path.join(PMD, f), "utf8"), { filename: f }); }
  catch (e) { bad(`${f} — ${e.message}`); }
}
for (const f of ["pm/assets/app.js", "pm/sw.js"]) {
  try { new vm.Script(fs.readFileSync(path.join(ROOT, f), "utf8"), { filename: f }); }
  catch (e) { bad(`${f} — ${e.message}`); }
}
if (!fail) ok("PM 站 JS 全部语法通过");

/* ---------- 2. 加载 ---------- */
head("2) 加载数据");
const sandbox = { window: {}, console };
vm.createContext(sandbox);
for (const f of fs.readdirSync(PMD).filter((f) => f.endsWith(".js"))) {
  try { vm.runInContext(fs.readFileSync(path.join(PMD, f), "utf8"), sandbox, { filename: f }); }
  catch (e) { bad(`执行失败 ${f}: ${e.message}`); }
}
// 主站题库（PM 各节的 qs 会引用它）
vm.runInContext(fs.readFileSync(path.join(ID, "questions.js"), "utf8"), sandbox, { filename: "questions.js" });

const W = sandbox.window;
const OL = W.PM_OUTLINE, SEC = W.PM_SECTIONS, PQ = W.PM_QUESTIONS, EX = W.PM_EXTRA;
if (!OL) bad("PM_OUTLINE 缺失");
if (!SEC) bad("PM_SECTIONS 缺失");
if (fail) { console.log("\n致命错误，终止"); process.exit(1); }

const MAINQ = W.QUESTION_BANK || { questions: [] };
const qIds = new Set(MAINQ.questions.map((q) => q.id).concat(((PQ && PQ.questions) || []).map((q) => q.id)));

/* ---------- 3. 目录 ↔ 正文 ---------- */
head("3) 目录 ↔ 正文");
const outlineIds = [];
const dupIds = new Set();
for (const p of OL.parts || []) {
  if (!p.id || !p.title) bad(`篇缺 id/title`);
  for (const sid of p.sections || []) {
    if (outlineIds.includes(sid)) dupIds.add(sid);
    outlineIds.push(sid);
  }
}
if (dupIds.size) bad(`目录里重复的节 id: ${[...dupIds].join(", ")}`);
ok(`目录：${(OL.parts || []).length} 篇 / ${outlineIds.length} 节`);

const secIds = Object.keys(SEC);
const noBody = outlineIds.filter((id) => !SEC[id]);
if (noBody.length) bad(`目录中 ${noBody.length} 节缺正文: ${noBody.join(", ")}`);
const orphans = secIds.filter((id) => !outlineIds.includes(id));
if (orphans.length) bad(`正文里有目录外孤儿: ${orphans.join(", ")}`);
if (!noBody.length && !orphans.length) ok(`正文 ${secIds.length} 节，与目录一一对应`);

/* ---------- 4. 节字段与引用 ---------- */
head("4) 节字段与引用");
const paths = new Set();
{
  // 可用的笔记 key：直接用主站索引（最权威）
  const idx = { window: {}, console };
  vm.createContext(idx);
  vm.runInContext(fs.readFileSync(path.join(ID, "index.js"), "utf8"), idx, { filename: "index.js" });
  (idx.window.NOTES_INDEX.notes || []).forEach((n) => paths.add(n.p));
}
let badRel = 0, badQs = 0, shortB = 0, longB = 0;
let minC = 1e9, maxC = 0;
for (const id of secIds) {
  const s = SEC[id];
  for (const k of ["id", "t", "why", "learn", "body", "keypoints", "pitfalls", "rel", "qs"]) {
    if (s[k] == null || (Array.isArray(s[k]) && !s[k].length && k !== "qs" && k !== "rel")) bad(`${id}: 字段 ${k} 为空`);
  }
  if (s.id !== id) bad(`${id}: id 与键不一致`);
  // 注意：数据在 vm 沙箱里创建，数组属于另一个 realm，
  // 用 instanceof Array 会全部误判为 false，必须用 Array.isArray
  if (!Array.isArray(s.ev)) bad(`${id}: ev 必须是数组`);
  if (s.from) bad(`${id}: PM 站不应有 from 字段`);
  for (const p of s.rel || []) if (!paths.has(p)) { bad(`${id}: 关联笔记不存在 ${p}`); badRel++; }
  for (const q of s.qs || []) if (!qIds.has(q)) { bad(`${id}: 关联真题不存在 ${q}`); badQs++; }
  const n = cjk(String(s.body));
  if (n < minC) minC = n;
  if (n > maxC) maxC = n;
  if (n < 300) shortB++;
  if (n > 820) longB++;
}
if (!badRel) ok("关联笔记引用全部有效");
if (!badQs) ok("关联真题引用全部有效");
if (shortB) bad(`${shortB} 节正文过短（< 300 汉字）`);
if (longB) bad(`${longB} 节正文过长（> 820 汉字）`);
ok(`正文字数区间：${minC} ~ ${maxC} 汉字`);

/* ---------- 5. 中文 AI 味红线 ---------- */
head("5) 中文 AI 味红线");
const allBody = secIds.map((id) => SEC[id].body).join("\n");
const total = cjk(allBody);
const RULES = [
  ["破折号 ——", /——/g, 0.8, "每千字不超过 0.8 处"],
  ["分号 ；", /；/g, 4.0, "每千字不超过 4 处"],
  ["禁用套语", /值得注意的是|综上所述|总而言之|换言之|由此可见|具有重要意义|彰显|体现了|不可或缺|不言而喻/g, 0.1, "基本应为 0"],
];
for (const [name, re, limit, hint] of RULES) {
  const hits = (allBody.match(re) || []).length;
  const per = (hits / total) * 1000;
  if (per > limit) bad(`${name}：${hits} 处（${per.toFixed(1)}‰）超出红线 ${limit}‰ — ${hint}`);
  else ok(`${name}：${hits} 处（${per.toFixed(1)}‰）在红线内`);
}
// 整句加粗要按「汉字数」算，不能按字符数：否则 **95% automation isn't an automation**
// 这类英文术语会被误判成「整句加粗」（踩过这个坑）
{
  let longBold = 0;
  const samples = [];
  for (const id of secIds) {
    for (const m of String(SEC[id].body).matchAll(/\*\*([^*]+?)\*\*/g)) {
      if (cjk(m[1]) >= 10) { longBold++; if (samples.length < 3) samples.push(`[${id}] ${m[1]}`); }
    }
  }
  const per = (longBold / total) * 1000;
  if (per > 0.2) {
    bad(`整句加粗（≥10 汉字）：${longBold} 处（${per.toFixed(1)}‰）超出红线 0.2‰`);
    samples.forEach((s) => console.log("      " + s));
  } else ok(`整句加粗（≥10 汉字）：${longBold} 处（${per.toFixed(1)}‰）在红线内`);
}

/* ---------- 6. PM 题库 ---------- */
head("6) PM 题库");
if (!PQ) bad("PM_QUESTIONS 缺失");
else {
  const qs = PQ.questions || [];
  ok(`${qs.length} 题 / ${(PQ.modules || []).length} 个模块`);
  const mods = new Set((PQ.modules || []).map((m) => m.id));
  const seen = new Set();
  for (const q of qs) {
    if (seen.has(q.id)) bad(`题 id 重复: ${q.id}`);
    seen.add(q.id);
    if (q.role !== "ai-pm") bad(`${q.id}: role 应为 ai-pm（实际 ${q.role}）`);
    if (!mods.has(q.mod)) bad(`${q.id}: 模块不存在 ${q.mod}`);
    if (!q.q || !q.q.trim()) bad(`${q.id}: 题干为空`);
    if (!q.frame || !q.frame.claim) bad(`${q.id}: 缺 frame.claim`);
    if (!q.frame.why || q.frame.why.length < 3) bad(`${q.id}: frame.why 少于 3 条`);
    if (!q.probes || q.probes.length < 3) bad(`${q.id}: 追问链少于 3 条`);
    if (!Array.isArray(q.ev)) bad(`${q.id}: ev 必须是数组`);
    for (const p of q.rel || []) if (!paths.has(p)) bad(`${q.id}: 关联笔记不存在 ${p}`);
  }
  if (qs.length !== 8) bad(`PM 题应为 8 道（实际 ${qs.length}）`);
}

/* ---------- 7. 外部资源 ---------- */
head("7) 外部资源（新收集）");
if (!EX) bad("PM_EXTRA 缺失");
else {
  const items = EX.items || [];
  ok(`${items.length} 条`);
  const seen = new Set();
  let noUrl = 0, noDist = 0;
  for (const x of items) {
    if (seen.has(x.id)) bad(`资源 id 重复: ${x.id}`);
    seen.add(x.id);
    for (const k of ["id", "kind", "guest", "title", "url"]) if (!x[k]) bad(`${x.id}: 缺字段 ${k}`);
    if (!/^https?:/.test(x.url || "")) { bad(`${x.id}: url 不是 http(s) 链接`); noUrl++; }
    if (!x.distilled || cjk(x.distilled) < 120) { bad(`${x.id}: distilled 过短（< 120 汉字）`); noDist++; }
    for (const q of x.quotes || []) if (!q.en) bad(`${x.id}: 金句缺英文原文`);
  }
  if (items.length < 6) bad(`新收集资源少于 6 条（实际 ${items.length}）`);
}

/* ---------- 8. 油管频道筛选 ---------- */
head("8) 油管频道筛选");
const YT = W.PM_YT;
if (!YT) bad("PM_YT 缺失");
else {
  const chs = YT.channels || [];
  const tierIds = new Set((YT.tiers || []).map((t) => t.id));
  ok(`${chs.length} 个频道 / ${(YT.tiers || []).length} 个梯队 / ${(YT.fde || []).length} 条 FDE 资源 / ${(YT.route || []).length} 个阶段`);
  const seen = new Set();
  let badUrl = 0, badTier = 0, badStars = 0, noWatch = 0;
  for (const c of chs) {
    if (seen.has(c.id)) bad(`频道 id 重复: ${c.id}`);
    seen.add(c.id);
    for (const k of ["id", "tier", "name", "why", "cost"]) if (!c[k]) bad(`${c.id}: 缺字段 ${k}`);
    if (!tierIds.has(c.tier)) { bad(`${c.id}: 梯队不存在 ${c.tier}`); badTier++; }
    if (!(c.stars >= 1 && c.stars <= 3)) { bad(`${c.id}: stars 应为 1-3（实际 ${c.stars}）`); badStars++; }
    if (!(c.watch || []).length) { bad(`${c.id}: 没有代表视频`); noWatch++; }
    for (const w of c.watch || []) {
      if (!w.t || !w.u) bad(`${c.id}: 视频缺标题或链接`);
      if (!/^https?:\/\//.test(w.u || "")) { bad(`${c.id}: 视频链接不是 http(s)`); badUrl++; }
    }
  }
  if (!badUrl) ok("代表视频链接全部是 http(s) 直链");
  if (!badTier && !badStars) ok("梯队与星级取值全部合法");
  for (const x of YT.fde || []) {
    if (!x.t || !x.u || !/^https?:\/\//.test(x.u)) bad(`FDE 资源链接有问题: ${x.t || JSON.stringify(x).slice(0, 30)}`);
  }
  for (const r of YT.route || []) if (!r.stage || !(r.items || []).length) bad(`路线阶段缺标题或条目`);
  ok("FDE 资源与路线字段完整");
  const added = chs.filter((c) => c.added);
  if (added.length) ok(`${added.length} 个新增频道都标了核实来源`);
  // 死链兜底：每个频道至少有一条 youtube.com 链接可点
  const noEntry = chs.filter((c) => !(c.watch || []).some((w) => /youtube\.com/.test(w.u)));
  if (noEntry.length) bad(`${noEntry.length} 个频道没有 youtube.com 链接兜底: ${noEntry.map((c) => c.name).join(", ")}`);
  else ok("每个频道至少有一条 youtube.com 链接可点");
}

console.log("\n" + (fail ? `❌ PM 站校验失败：${fail} 项问题` : "✅ PM 站全部校验通过"));
process.exit(fail ? 1 : 0);
