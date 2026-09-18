// 中文 AI 味规范化 v2 —— 只动标点，不动任何汉字
//
// 空跑（默认）报告命中与抽样；加 --apply 才写盘。
//
// 规则（经空跑验证后保留两条，另两条因会改出病句已删除）：
//   A 破折号引出解释/列举  →  冒号（连同两侧空格一起吃掉）
//   B 长分句前的分号       →  句号（前段 ≥28 汉字；用来降分号密度并打散句长）
//
// 保护：
//   · 跳过 // 开头的注释行
//   · 破折号前 3 字已是冒号则跳过（避免 ：：）
//   · 只动标点，不动汉字 → 篇幅约束（210~800 字）不受影响
import fs from "node:fs";
import path from "node:path";

const APPLY = process.argv.includes("--apply");
const DATA = "interview/data";
const PMD = "pm/data";
const CJK = /[\u4e00-\u9fa5]/g;
const cjkCount = (t) => (t.match(CJK) || []).length;

const files = [
  ...fs.readdirSync(DATA)
    .filter((f) => /^tb-.*\.js$/.test(f) || /^codebank(-code[a-c])?\.js$/.test(f))
    .map((f) => path.join(DATA, f)),
  // PM 站（/pm/data）同样纳入规范化
  ...(fs.existsSync(PMD)
    ? fs.readdirSync(PMD).filter((f) => /^pm-.*\.js$/.test(f)).map((f) => path.join(PMD, f))
    : []),
];

/* ---------- 规则 A：破折号 → 冒号 ---------- */
function ruleDash(line) {
  let out = "";
  let i = 0;
  let hits = 0;
  const samples = [];
  while (i < line.length) {
    const j = line.indexOf("——", i);
    if (j < 0) { out += line.slice(i); break; }
    const prev = out.slice(-3);
    if (prev.includes("：")) { out += line.slice(i, j + 2); i = j + 2; continue; }
    let s = j;
    while (s > 0 && (line[s - 1] === " " || line[s - 1] === "\t")) s--;
    let e = j + 2;
    while (e < line.length && (line[e] === " " || line[e] === "\t")) e++;
    const ctxB = line.slice(Math.max(0, s - 24), s);
    const ctxA = line.slice(e, e + 26);
    out += line.slice(i, s) + "：";
    i = e;
    hits++;
    if (samples.length < 3) samples.push({ before: ctxB + "——" + line.slice(j + 2, j + 2 + 26), after: ctxB + "：" + ctxA });
  }
  return { out, hits, samples };
}

/* ---------- 规则 B：长分句前的分号 → 句号 ----------
   两个坑（都在空跑里踩过）：
   1. 前段长度必须在**原始行**上算。在已改动的文本上算会被腰斩（实测 333 → 91）。
   2. 判断「前面已是句号」只能用原始行，不能用已改动输出（后者会把同一行的
      第二、三个分号全误判成重复标点而删掉）。 */
function ruleSemicolon(line, min = 28) {
  const marks = [];
  let lastEnd = -1;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === "。" || ch === "！" || ch === "？" || ch === "\n") lastEnd = i;
    if (ch === "；") marks.push({ at: i, cjk: cjkCount(line.slice(lastEnd + 1, i)), dup: line[i - 1] === "。" });
  }
  if (!marks.length) return { out: line, hits: 0, samples: [] };

  let out = "", cursor = 0, hits = 0;
  const samples = [];
  for (const m of marks) {
    const head = line.slice(cursor, m.at); // 该分号之前的原文
    const ctx = (out + head).slice(-34);
    if (m.dup) {
      if (samples.length < 3) samples.push({ before: ctx + "；", after: ctx });
      out += head;
      cursor = m.at + 1;
      hits++;
    } else if (m.cjk >= min) {
      if (samples.length < 3) samples.push({ before: ctx + "；", after: ctx + "。" });
      out += head + "。";
      cursor = m.at + 1;
      hits++;
    }
  }
  out += line.slice(cursor);
  return { out, hits, samples };
}

/* ---------- 规则 C：整句加粗 → 去掉加粗标记 ----------
   平均加粗密度其实只有 1.69 处/节（已在「每节 1-2 处」区间内），
   真正的 AI 习惯是「把半句话整个加粗当重点」。只清这种长加粗，
   术语级短加粗（RAG / Agent / 幻觉）保留。 */
function ruleBold(line, minCjk = 10) {
  let hits = 0;
  const samples = [];
  const out = line.replace(/\*\*([^*\n]+?)\*\*/g, (m, inner) => {
    const n = cjkCount(inner);
    if (n < minCjk) return m;
    hits++;
    if (samples.length < 3) samples.push({ before: "**" + inner + "**", after: inner });
    return inner;
  });
  return { out, hits, samples };
}

/* ---------- 规则 D：结构性重复标签轮换 ----------
   「和教材其它节的分工」在 34 个插接节里一字不差地出现 34 次，
   是全文最明显的机器痕迹。轮换 5 种同义说法（语义与位置不变）。 */
const LABEL_VARIANTS = [
  "和教材其它节的分工",
  "这一节在全书里的位置",
  "不重复讲的部分",
  "和相邻章节的分界",
  "别处已经讲过的",
];
let labelSeq = 0;
function ruleLabel(line) {
  if (!line.includes("和教材其它节的分工")) return { out: line, hits: 0 };
  const v = LABEL_VARIANTS[labelSeq++ % LABEL_VARIANTS.length];
  // 同时覆盖加粗与非加粗两种写法
  const out = line.split("**和教材其它节的分工**").join("**" + v + "**").split("和教材其它节的分工").join(v);
  return { out, hits: 1 };
}

/* ---------- 规则 E：PM 站的结构标签轮换 ----------
   PM 站 27 节都带 `**这一节在全书里的位置**`（10 汉字，恰好触发规则 C 的
   「整句加粗」红线，且 27 次一字不差）。换成 5 种 ≤9 汉字的说法轮换，
   一次解决「重复」与「触发加粗红线」两个问题。 */
const PM_LABEL_VARIANTS = [
  "这一节的位置",
  "在全书里的位置",
  "和相邻章节的分界",
  "不重复讲的部分",
  "别处已经讲过的",
];
let pmLabelSeq = 0;
function rulePMLabel(line) {
  const SRC = "这一节在全书里的位置";
  if (!line.includes(SRC)) return { out: line, hits: 0 };
  const v = PM_LABEL_VARIANTS[pmLabelSeq++ % PM_LABEL_VARIANTS.length];
  const out = line.split("**" + SRC + "**").join("**" + v + "**").split(SRC).join(v);
  return { out, hits: 1 };
}

const tally = { dash: 0, semi: 0, bold: 0, label: 0, pmlabel: 0 };
const samplesAll = { dash: [], semi: [], bold: [] };

for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  const lines = src.split("\n");
  let changed = false;

  for (let n = 0; n < lines.length; n++) {
    const raw = lines[n];
    if (/^\s*\/\//.test(raw)) continue;        // 跳过注释行
    if (!/[——；]|\*\*|和教材其它节的分工|这一节在全书里的位置/.test(raw)) continue;

    // 顺序有讲究：E 必须在 C 之前，先把 PM 的 10 字标签缩成 ≤9 字，
    // 否则 C 会先把它的加粗标记剥掉（标签需要保留加粗）。
    const A = ruleDash(raw);
    const B = ruleSemicolon(A.out);
    const E = rulePMLabel(B.out);
    const C = ruleBold(E.out);
    const D = ruleLabel(C.out);
    if (A.hits || B.hits || C.hits || D.hits || E.hits) {
      lines[n] = D.out;
      changed = true;
      tally.dash += A.hits;
      tally.semi += B.hits;
      tally.bold += C.hits;
      tally.label += D.hits;
      tally.pmlabel += E.hits;
      for (const s of A.samples) if (samplesAll.dash.length < 6) samplesAll.dash.push(s);
      for (const s of B.samples) if (samplesAll.semi.length < 6) samplesAll.semi.push(s);
      for (const s of C.samples) if (samplesAll.bold.length < 6) samplesAll.bold.push(s);
    }
  }

  if (APPLY && changed) fs.writeFileSync(f, lines.join("\n"));
}

console.log(APPLY ? "【已写入】" : "【空跑，未写入】");
console.log(`\n规则 A 破折号 → 冒号：处理 ${tally.dash} 处`);
console.log(`规则 B 长分句分号 → 句号：处理 ${tally.semi} 处`);
console.log(`规则 C 整句加粗 → 去标记：处理 ${tally.bold} 处`);
console.log(`规则 D 重复标签轮换：处理 ${tally.label} 处`);
console.log(`规则 E PM 标签轮换：处理 ${tally.pmlabel} 处`);
console.log("\n抽样：");
for (const s of samplesAll.dash) { console.log(`  A 前：…${s.before}`); console.log(`    后：…${s.after}`); }
for (const s of samplesAll.semi) { console.log(`  B 前：…${s.before}`); console.log(`    后：…${s.after}`); }
for (const s of samplesAll.bold) { console.log(`  C 前：${s.before}`); console.log(`    后：${s.after}`); }
