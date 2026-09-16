#!/usr/bin/env node
// ============================================================
// 「AI 面试深度站」内容构建脚本（零依赖）
// 扫描两个知识库 → 生成轻量索引 + 按模块拆分的正文包
//
//   知识库 A: <vault>/            （336 篇，Obsidian 库）
//   知识库 B: ~/Desktop/youtube/AI-PM-FDE知识库 （访谈沉淀）
//
// 产出：
//   interview/data/index.js        轻量目录（标题/目录/标签/章节/双链/阅读时长）
//   interview/data/notes-<id>.js   正文分模块包（按需加载）
//
// 用法： node tools/build-interview.mjs
// ============================================================

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import os from "node:os";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT = path.resolve(__dirname, "..");
const YT = path.join(os.homedir(), "Desktop", "youtube", "AI-PM-FDE知识库");
const OUT = path.join(VAULT, "interview", "data");

// 不进入学习站的目录（站点自身 / 第三方源码 / 构建产物 / 原始研究素材）
const SKIP_A = new Set([
  ".obsidian", ".codely", ".codely-cli", ".refsrc", ".git", ".trash",
  "feynman", "practice", "study", "interview", "tools", "research", "node_modules",
]);
const SKIP_B = new Set([".obsidian", ".codely", ".codely-cli", ".git", ".trash"]);

// 绝不进入学习站的文件：
//   CODELY.md 是 Agent 工作记忆（含个人画像），发布出去等于泄露隐私
//   README / CLAUDE / AGENTS 是仓库说明，不是学习笔记
const SKIP_FILES = new Set(["CODELY.md", "README.md", "CLAUDE.md", "AGENTS.md"]);

// ---------- 工具 ----------

function walk(dir, skip) {
  const out = [];
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const ent of entries) {
    if (skip.has(ent.name)) continue;
    if (ent.isFile() && SKIP_FILES.has(ent.name)) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p, skip));
    else if (ent.isFile() && ent.name.toLowerCase().endsWith(".md")) out.push(p);
  }
  return out;
}

const stripBom = (s) => (s.charCodeAt(0) === 0xfeff ? s.slice(1) : s);

function parseNote(abs, root, vault) {
  let raw = stripBom(fs.readFileSync(abs, "utf8")).replace(/\r\n?/g, "\n");
  const rel = path.relative(root, abs).split(path.sep).join("/");
  const dirRaw = path.dirname(rel);
  const dir = dirRaw === "." ? "" : dirRaw.split(path.sep).join("/");

  // frontmatter
  let fm = "";
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
  if (fmMatch) fm = fmMatch[1];

  const tags = [];
  const tagLine = fm.match(/tags:\s*\[([^\]]*)\]/);
  if (tagLine) {
    for (const t of tagLine[1].split(",")) {
      const v = t.trim().replace(/^["']|["']$/g, "");
      if (v) tags.push(v);
    }
  }
  const createdM = fm.match(/created:\s*(.+)/);

  // 标题：首个 H1
  let title = "";
  for (const line of raw.split("\n").slice(0, 80)) {
    const h = line.match(/^#\s+(.+?)\s*$/);
    if (h) { title = h[1].trim(); break; }
  }
  if (!title) title = path.basename(abs, ".md");

  // 二级标题（章节导航）
  const h2 = [];
  for (const line of raw.split("\n")) {
    const h = line.match(/^##\s+(?!\#)(.+?)\s*$/);
    if (h) h2.push(h[1].trim());
  }

  // 双链
  const links = [
    ...new Set(
      [...raw.matchAll(/\[\[([^\]|#]+)(?:[|#][^\]]*)?\]\]/g)].map((x) => x[1].trim())
    ),
  ];

  // 正文（去掉 frontmatter，便于渲染）
  const body = fmMatch ? raw.slice(fmMatch[0].length).replace(/^\n+/, "") : raw;

  const chars = body.length;
  const minutes = Math.max(1, Math.round(chars / 350));

  return {
    rel, dir, vault, title, tags,
    created: createdM ? createdM[1].trim() : "",
    h2, links, minutes, size: chars, body,
  };
}

// ---------- 采集 ----------

const notes = [];

for (const abs of walk(VAULT, SKIP_A)) {
  notes.push(parseNote(abs, VAULT, "A"));
}
if (fs.existsSync(YT)) {
  for (const abs of walk(YT, SKIP_B)) {
    notes.push(parseNote(abs, YT, "B"));
  }
} else {
  console.warn(`[warn] 访谈知识库不存在，已跳过：${YT}`);
}

// ---------- 分模块打包 ----------

const MODULE_LABEL = {
  A: {
    "(root)": "🏠 总入口",
    "00-小白课堂": "🎒 小白课堂",
    "01-名词与概念": "📖 名词与概念",
    "02-AI-Agent开发": "🤖 AI Agent 开发",
    "03-AI辅助开发": "🛠️ AI 辅助开发",
    "04-Python": "🐍 Python",
    "05-精选课程": "🎓 精选课程",
    "06-深度学习与名校课程": "🏛️ 深度学习与名校课",
    "07-工具与资源": "🧰 工具与资源",
    "08-求职面试": "💼 求职面试",
    "09-全栈开发": "🌐 全栈开发",
    "10-方向路线": "🧭 方向路线",
    "11-前沿进化": "🔄 前沿进化",
  },
  B: {
    "(root)": "🏠 访谈库首页",
    "01-博主与频道": "📺 博主与频道",
    "02-视频笔记": "🎬 视频笔记",
    "03-知识专题": "🧩 知识专题",
    "04-职业路径": "🧭 职业路径",
  },
};

const groups = new Map(); // key -> {vault, dir, notes: []}
for (const n of notes) {
  const top = n.dir ? n.dir.split("/")[0] : "(root)";
  const key = `${n.vault}::${top}`;
  if (!groups.has(key)) groups.set(key, { vault: n.vault, dir: top, notes: [] });
  groups.get(key).notes.push(n);
}

const chunkList = [];
const indexNotes = [];
const names = {};       // 笔记名（去 .md）-> rel
const titles = {};      // H1 标题 -> rel

let ci = 0;
for (const [key, g] of [...groups.entries()].sort((a, b) =>
  a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0
)) {
  const chunkId = `c${ci++}`;
  const prefix = g.vault === "B" ? "yt/" : "";
  const label =
    (MODULE_LABEL[g.vault] && MODULE_LABEL[g.vault][g.dir]) ||
    (g.vault === "B" ? `🎬 ${g.dir}` : g.dir);

  const payload = {};
  for (const n of g.notes) {
    const key2 = prefix + n.rel;
    payload[key2] = n.body;
    indexNotes.push({
      id: `${chunkId}#${Object.keys(payload).length - 1}`,
      p: key2,
      t: n.title,
      d: prefix + (n.dir || ""),
      v: g.vault,
      g: n.tags,
      m: n.minutes,
      s: n.size,
      h: n.h2,
      l: n.links,
      c: n.created,
      k: chunkId,
    });
    const base = path.basename(n.rel, ".md");
    if (!(base in names)) names[base] = key2;
    if (!(n.title in titles)) titles[n.title] = key2;
  }

  const file = `notes-${chunkId}.js`;
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(
    path.join(OUT, file),
    `window.NOTES_CHUNK=window.NOTES_CHUNK||{};window.NOTES_CHUNK[${JSON.stringify(
      chunkId
    )}]=${JSON.stringify(payload)};\n`,
    "utf8"
  );

  chunkList.push({
    id: chunkId,
    name: label,
    vault: g.vault,
    file,
    count: g.notes.length,
  });
}

// ---------- 索引 ----------

const meta = {
  generatedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
  total: indexNotes.length,
  byVault: { A: indexNotes.filter((n) => n.v === "A").length, B: indexNotes.filter((n) => n.v === "B").length },
  chunks: chunkList.length,
};

const wordCount = indexNotes.reduce((s, n) => s + n.s, 0);

fs.writeFileSync(
  path.join(OUT, "index.js"),
  `window.NOTES_INDEX=${JSON.stringify({ meta, chunks: chunkList, notes: indexNotes, names, titles })};\n`,
  "utf8"
);

// ---------- 报告 ----------

const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
console.log(`[OK] 笔记 ${meta.total} 篇（知识库 A ${meta.byVault.A} / 访谈库 B ${meta.byVault.B}）`);
console.log(`[OK] 正文约 ${(wordCount / 10000).toFixed(1)} 万字，分 ${chunkList.length} 个模块包`);
for (const c of chunkList) {
  const f = path.join(OUT, c.file);
  console.log(`     ${c.id.padEnd(5)} ${String(c.count).padStart(3)} 篇  ${kb(fs.statSync(f).size).padStart(9)}  ${c.name}`);
}
console.log(`[OK] 索引 ${path.join(OUT, "index.js")} (${kb(fs.statSync(path.join(OUT, "index.js")).size)})`);
