/* 学习站 · 主逻辑：导航 + 搜索 + 最近在读 + 双链解析 + 反链 + 渲染 */
"use strict";

const RECENT_KEY = "study_recent_v1";
const NOTES = (window.NOTES_INDEX && window.NOTES_INDEX.notes) || [];
const META = (window.NOTES_INDEX && window.NOTES_INDEX.meta) || { total: 0 };

/* 双链解析表：title / 文件名 / 完整路径 → note */
const LINK_MAP = new Map();
NOTES.forEach(n => {
  const fname = n.path.split("/").pop().replace(/\.md$/i, "");
  if (!LINK_MAP.has(n.title)) LINK_MAP.set(n.title, n);
  if (!LINK_MAP.has(fname)) LINK_MAP.set(fname, n);
});
function resolveWiki(name) {
  if (LINK_MAP.has(name)) return LINK_MAP.get(name);
  const hit = NOTES.find(n => n.title.includes(name) || name.includes(n.title));
  return hit || null;
}

let curNote = null;
let curDir = "";
let recent = loadRecent();

function loadRecent() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY)) || []; } catch (e) { return []; }
}
function pushRecent(path) {
  recent = [path, ...recent.filter(p => p !== path)].slice(0, 8);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
  renderRecent();
}
function escHtml(s) { return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg; t.classList.add("show");
  clearTimeout(t._tm); t._tm = setTimeout(() => t.classList.remove("show"), 2200);
}

/* ---------- 侧栏 ---------- */
function renderDirChips() {
  const box = document.getElementById("dir-chips");
  const dirs = Object.keys(META.byDir || {});
  box.innerHTML = `<span class="chip ${curDir === "" ? "sel" : ""}" data-d="">全部 ${META.total}</span>` +
    dirs.map(d => `<span class="chip ${curDir === d ? "sel" : ""}" data-d="${escHtml(d)}">${escHtml(d)} ${META.byDir[d]}</span>`).join("");
  box.querySelectorAll(".chip").forEach(c => c.addEventListener("click", () => {
    curDir = c.dataset.d; renderDirChips(); renderList(document.getElementById("search").value);
  }));
}
function renderList(kw) {
  kw = (kw || "").trim().toLowerCase();
  const hits = NOTES.filter(n =>
    (!curDir || n.dir === curDir) &&
    (!kw || n.title.toLowerCase().includes(kw) || n.path.toLowerCase().includes(kw) || n.content.toLowerCase().includes(kw))
  ).sort((a, b) => b.mtime < a.mtime ? -1 : 1);
  document.getElementById("list-count").textContent = `(${hits.length})`;
  document.getElementById("note-list").innerHTML = hits.slice(0, 200).map(n => {
    let t = escHtml(n.title);
    if (kw && !n.title.toLowerCase().includes(kw)) {
      const i = n.content.toLowerCase().indexOf(kw);
      if (i >= 0) {
        const frag = n.content.slice(Math.max(0, i - 12), i + kw.length + 18).replace(/\n/g, " ");
        t += ` <span class="hit">·…${escHtml(frag)}…</span>`;
      }
    }
    return `<div class="n-item ${curNote && curNote.path === n.path ? "sel" : ""}" data-path="${escHtml(n.path)}">
      <div class="nt">${t}</div><div class="np">${escHtml(n.path)} · ${n.mtime}</div></div>`;
  }).join("") || `<div class="np" style="padding:10px">没找到，换个词～</div>`;
  document.querySelectorAll(".n-item").forEach(el => el.addEventListener("click", () => openNote(el.dataset.path)));
}
function renderRecent() {
  const box = document.getElementById("recent-box");
  const items = recent.map(p => NOTES.find(n => n.path === p)).filter(Boolean);
  if (!items.length) { box.style.display = "none"; return; }
  box.style.display = "block";
  document.getElementById("recent-list").innerHTML = items.map(n =>
    `<div class="r-item" data-path="${escHtml(n.path)}">· ${escHtml(n.title)}</div>`).join("");
  document.querySelectorAll(".r-item").forEach(el => el.addEventListener("click", () => openNote(el.dataset.path)));
}

/* ---------- 打开笔记 ---------- */
function openNote(path, pushHash) {
  const n = NOTES.find(x => x.path === path);
  if (!n) { toast("这篇笔记不在索引里（可能刚建，等晚间索引刷新）"); return; }
  curNote = n;
  document.getElementById("welcome").style.display = "none";
  const reader = document.getElementById("reader");
  reader.innerHTML = `<div class="article" id="article"></div><div class="backlinks" id="backlinks"></div>`;
  const art = document.getElementById("article");
  art.innerHTML = `
    <div class="art-actions">
      <span class="art-meta">${escHtml(n.dir || "库根")} · 更新 ${n.mtime} · ${(n.size / 1000).toFixed(0)}K 字</span>
      <a class="check-btn" href="../feynman/index.html?check=${encodeURIComponent(n.path)}" target="_blank">🎓 去检验这篇</a>
    </div>
    <div class="md">${renderMarkdown(stripFrontmatter(n.content))}</div>`;
  renderBacklinks(n);
  bindWikiLinks(art);
  document.getElementById("reader").scrollTop = 0;
  pushRecent(n.path);
  renderList(document.getElementById("search").value);
  if (pushHash !== false) location.hash = "#" + encodeURIComponent(n.path);
}

function stripFrontmatter(md) {
  return md.replace(/^\uFEFF?---\n[\s\S]*?\n---\n?/, "");
}

/* ---------- 反链 ---------- */
function renderBacklinks(n) {
  const fname = n.path.split("/").pop().replace(/\.md$/i, "");
  const targets = [n.title, fname].filter(t => t && t.length > 1);
  const links = NOTES.filter(x => x.path !== n.path && targets.some(t =>
    x.content.includes("[[" + t) || x.content.includes("[[" + fname)
  )).slice(0, 20);
  const box = document.getElementById("backlinks");
  box.innerHTML = `<div class="side-title">🔗 ${links.length ? "谁链接到这里（反链）" : "暂无反链——读完可以想想该连到哪篇"}</div>` +
    (links.length ? `<div class="bl-list">` + links.map(x =>
      `<span class="bl-chip" data-path="${escHtml(x.path)}">${escHtml(x.title)}</span>`).join("") + `</div>` : "");
  box.querySelectorAll(".bl-chip").forEach(el => el.addEventListener("click", () => openNote(el.dataset.path)));
}
function bindWikiLinks(root) {
  root.querySelectorAll(".wikilink[data-path]").forEach(el => {
    el.addEventListener("click", () => openNote(el.dataset.path));
  });
}

/* ---------- 轻量 Markdown 渲染器 ---------- */
const CALLOUT_ICON = { note: "📝", tip: "💡", info: "ℹ️", warning: "⚠️", important: "❗", example: "📌", quote: "❝", success: "✅", error: "⛔" };

function renderMarkdown(md) {
  // 1. 代码块先抽出来占位
  const codeStore = [];
  md = md.replace(/```([\w-]*)\n([\s\S]*?)```/g, (m, lang, code) => {
    codeStore.push(`<pre><code>${escHtml(code.replace(/\n$/, ""))}</code></pre>`);
    return `\n@@CODE${codeStore.length - 1}@@\n`;
  });

  // 2. 表格占位（| a | b |\n| --- |...\n行们）
  const tableStore = [];
  md = md.replace(/(^|\n)((?:\|.*\|(?:\n|$))+)/g, (m, lead, block) => {
    const rows = block.trim().split("\n").map(r => r.trim());
    if (rows.length < 2 || !/^\|[\s:|-]+\|$/.test(rows[1])) return m;
    const cells = r => r.slice(1, -1).split("|").map(c => c.trim());
    const head = cells(rows[0]);
    const body = rows.slice(2).map(cells);
    const html = `<table><thead><tr>${head.map(c => `<th>${inline(c)}</th>`).join("")}</tr></thead><tbody>` +
      body.map(r => `<tr>${r.map(c => `<td>${inline(c)}</td>`).join("")}</tr>`).join("") + `</tbody></table>`;
    tableStore.push(html);
    return lead + `\n@@TABLE${tableStore.length - 1}@@\n`;
  });

  // 3. 按行处理
  const out = [];
  const lines = md.split("\n");
  let listStack = [], quoteBuf = [];
  const flushList = () => { while (listStack.length) out.push(`</${listStack.pop()}>`); };
  const flushQuote = () => {
    if (!quoteBuf.length) return;
    const first = quoteBuf[0];
    let cm = first.match(/^>\s*\[!(\w+)\]\s*(.*)/);
    const body = quoteBuf.map(l => l.replace(/^>\s?/, "")).join("\n");
    if (cm) {
      const icon = CALLOUT_ICON[cm[1].toLowerCase()] || "📝";
      const title = cm[2] ? escHtml(cm[2]) : cm[1][0].toUpperCase() + cm[1].slice(1);
      out.push(`<blockquote><span class="callout-title">${icon} ${title}</span>${renderInlineBlock(body.replace(/^>\s*\[!\w+\][^\n]*\n?/, "").trim())}</blockquote>`);
    } else {
      out.push(`<blockquote>${renderInlineBlock(body)}</blockquote>`);
    }
    quoteBuf = [];
  };

  for (const raw of lines) {
    const line = raw;
    if (/^@@CODE\d+@@$/.test(line.trim())) { flushList(); flushQuote(); out.push(codeStore[+line.match(/\d+/)[0]]); continue; }
    if (/^@@TABLE\d+@@$/.test(line.trim())) { flushList(); flushQuote(); out.push(tableStore[+line.match(/\d+/)[0]]); continue; }
    if (/^\s*$/.test(line)) { flushList(); flushQuote(); continue; }
    if (/^>/.test(line)) { flushList(); quoteBuf.push(line); continue; }
    flushQuote();

    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) { flushList(); out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`); continue; }
    if (/^(-{3,}|\*{3,})$/.test(line.trim())) { flushList(); out.push("<hr>"); continue; }

    const ul = line.match(/^\s*[-*]\s+(.*)$/);
    const ol = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (ul || ol) {
      const tag = ul ? "ul" : "ol";
      if (listStack[listStack.length - 1] !== tag) { flushList(); out.push(`<${tag}>`); listStack.push(tag); }
      out.push(`<li>${inline((ul || ol)[1])}</li>`);
      continue;
    }
    flushList();
    out.push(`<p>${inline(line)}</p>`);
  }
  flushList(); flushQuote();
  return out.join("\n");

  function inline(s) {
    s = escHtml(s);
    s = s.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, wikiTag)   // [[path|alias]]
         .replace(/\[\[([^\]]+)\]\]/g, wikiTag)               // [[name]]
         .replace(/`([^`]+)`/g, "<code>$1</code>")
         .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2">')
         .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
         .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
         .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<i>$2</i>")
         .replace(/~~([^~]+)~~/g, "<del>$1</del>");
    return s;
  }
  function renderInlineBlock(body) { return body.split(/\n{2,}/).map(p => `<p>${inline(p).replace(/\n/g, "<br>")}</p>`).join(""); }
  function wikiTag(m, name, alias) {
    const target = resolveWiki(name.trim());
    if (target) return `<span class="wikilink" data-path="${escHtml(target.path)}" title="${escHtml(target.path)}">${escHtml(alias || name)}</span>`;
    return `<span class="wikilink missing" title="未建/不在索引">${escHtml(alias || name)}</span>`;
  }
}

/* ---------- 初始化 ---------- */
document.getElementById("search").addEventListener("input", e => renderList(e.target.value));
document.getElementById("rand-btn").addEventListener("click", () => {
  if (!NOTES.length) return;
  openNote(NOTES[Math.floor(Math.random() * NOTES.length)].path);
});
window.addEventListener("hashchange", () => {
  const p = decodeURIComponent(location.hash.slice(1));
  if (p && (!curNote || curNote.path !== p)) openNote(p, false);
});

if (!NOTES.length) {
  document.getElementById("note-list").innerHTML =
    `<div class="np" style="padding:10px">⚠️ 索引未加载。先运行 feynman/build-notes-index.ps1 生成 data/notes.js</div>`;
} else {
  renderDirChips(); renderList(""); renderRecent();
  const h = decodeURIComponent(location.hash.slice(1));
  if (h && NOTES.some(n => n.path === h)) openNote(h, false);
  else if (recent.length) { /* 欢迎页即可，最近在读已显示 */ }
}
