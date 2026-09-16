#!/usr/bin/env node
// 把 research/*.md 里的媒体面试题解析成站点数据 interview/data/media-bank.js
// 用法: node tools/build-media-bank.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRCDIR = path.join(ROOT, "research");
const OUT = path.join(ROOT, "interview", "data", "media-bank.js");

// 来源文件里的人话标题 -> 站点岗位 id
const ROLE_HINT = [
  [/forward\s*deployed|\bFDE\b/i, "fde"],
  [/product\s*manager|产品经理|\bPM\b/i, "ai-pm"],
  [/llmops|系统|运维|部署工程|infra/i, "llmops"],
  [/算法|transformer|大模型训练|ml\s*engineer|model/i, "llm-algo"],
  [/agent|应用|engineer|应用开发/i, "agent-app"],
];

function roleOf(s) {
  for (const [re, id] of ROLE_HINT) if (re.test(s)) return id;
  return "";
}

// 从来源字符串里抠第一个链接
function urlOf(s) {
  const m = String(s || "").match(/https?:\/\/[^\s)）\]]+/);
  return m ? m[0] : "";
}

const FIELDS = [
  [/^(中文|翻译|translation)/i, "zh"],
  [/^(来源|source|出处)/i, "src"],
  [/^(追问|follow[\s-]?up|probe)/i, "probe"],
  [/^(参考答题框架|答题框架|参考答案|答案|answer|框架|思路)/i, "frame"],
  [/^(频次|频率|frequency)/i, "freq"],
  [/^(岗位|role)/i, "roleText"],
  [/^(模块|module|类别|topic)/i, "modText"],
  [/^(难度|difficulty|level)/i, "lvText"],
];

function parseFile(file) {
  const lines = fs.readFileSync(file, "utf8").replace(/\r\n?/g, "\n").split("\n");
  const items = [];
  let cur = null;
  let role = "";
  let mod = "";

  const flush = () => {
    if (cur && cur.q && cur.q.trim()) {
      cur.q = cur.q.trim();
      items.push(cur);
    }
    cur = null;
  };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, "");
    const h2 = line.match(/^##\s+(.+)$/);
    if (h2) { flush(); role = h2[1].trim(); mod = ""; continue; }
    const h3 = line.match(/^###\s+(.+)$/);
    if (h3) { flush(); mod = h3[1].trim(); continue; }

    const qm = line.match(/^\s*[-*]\s*Q\s*[:：]\s*(.+)$/i);
    if (qm) {
      flush();
      cur = { q: qm[1], role, mod, fields: {} };
      continue;
    }
    if (!cur) continue;

    const fm = line.match(/^\s{2,}[-*]\s*([^:：]+)\s*[:：]\s*(.*)$/);
    if (fm) {
      const key = fm[1].trim();
      const val = fm[2].trim();
      let hit = null;
      for (const [re, name] of FIELDS) if (re.test(key)) { hit = name; break; }
      if (hit) cur.fields[hit] = cur.fields[hit] ? cur.fields[hit] + " " + val : val;
      else cur.fields._other = (cur.fields._other || "") + ` ${key}：${val}`;
      continue;
    }
    // 续行（换行折行）
    const cm = line.match(/^\s{2,}(\S.*)$/);
    if (cm && cur.fields) {
      const last = Object.keys(cur.fields).pop();
      if (last) cur.fields[last] += " " + cm[1].trim();
    }
  }
  flush();
  return items;
}

const files = fs.existsSync(SRCDIR)
  ? fs.readdirSync(SRCDIR).filter((f) => /^面试题-.*\.md$/.test(f))
  : [];

const items = [];
const sources = [];
let n = 0;

for (const f of files) {
  const list = parseFile(path.join(SRCDIR, f));
  const label = f.replace(/^面试题-/, "").replace(/\.md$/, "");
  sources.push({ file: f, label, count: list.length });
  for (const it of list) {
    const key = it.role + " / " + it.mod;
    items.push({
      id: "m" + ++n,
      src: it.fields.src ? it.fields.src.replace(/https?:\/\/[^\s)）\]]+/g, "").replace(/[—\-–]\s*$/, "").trim() : "",
      url: urlOf(it.fields.src),
      role: roleOf(it.role + " " + (it.fields.roleText || "") + " " + (it.fields.modText || "")),
      roleName: it.role,
      mod: it.mod || "未分类",
      q: it.q,
      zh: it.fields.zh || "",
      probe: it.fields.probe || "",
      frame: it.fields.frame || "",
      freq: it.fields.freq || "",
      bank: label,
    });
  }
}

const meta = {
  generated: new Date().toISOString().slice(0, 16).replace("T", " "),
  total: items.length,
  sources,
  byRole: items.reduce((a, b) => { const k = b.roleName; a[k] = (a[k] || 0) + 1; return a; }, {}),
};

fs.writeFileSync(
  OUT,
  "window.MEDIA_BANK=" + JSON.stringify({ meta, items }) + ";\n",
  "utf8"
);

console.log(`[OK] 媒体题库 ${items.length} 题 -> ${path.relative(ROOT, OUT)} (${(fs.statSync(OUT).size / 1024).toFixed(1)} KB)`);
for (const s of sources) console.log(`     ${s.label.padEnd(14)} ${String(s.count).padStart(4)} 题  (${s.file})`);
console.log("     岗位分布: " + Object.entries(meta.byRole).map(([k, v]) => `${k} ${v}`).join(" / "));
const noUrl = items.filter((i) => !i.url).length;
console.log(`     带来源链接: ${items.length - noUrl}/${items.length}`);
