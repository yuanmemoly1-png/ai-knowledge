// ============================================================
// AI 面试深度站 · 应用逻辑 v2
// 六个标签：今日 / 知识树 / 题库 / 访谈 / 笔记 / 我的
// ============================================================
(function () {
  "use strict";

  /* ---------------- 工具 ---------------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const DAY = 864e5;
  const APP_VERSION = "v4 · 2026-09-16";
  const todayStr = () => new Date().toLocaleDateString("sv");
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  let toastTimer = null;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("on"), 1900);
  }

  /* ---------------- 状态 ---------------- */
  const KEY = "ai-interview-deep-v1";
  const BLANK = () => ({ v: 1, q: {}, nodes: {}, seen: {}, text: {}, streak: { last: "", days: 0 }, theme: "dark" });
  let S = BLANK();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) S = Object.assign(BLANK(), JSON.parse(raw));
    } catch (e) { console.warn("存档读取失败", e); }
  }
  let saveTimer = null;
  function save(now) {
    const doIt = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast("存档失败：浏览器存储已满"); } };
    if (now) return doIt();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(doIt, 350);
  }
  function applyTheme() {
    document.documentElement.dataset.theme = S.theme === "light" ? "light" : "dark";
    const btn = $("#btn-theme");
    if (btn) btn.textContent = S.theme === "light" ? "🌙" : "☀️";
  }
  function toggleTheme() {
    S.theme = S.theme === "light" ? "dark" : "light";
    applyTheme(); save(true);
  }
  function touchStreak() {
    const t = todayStr();
    if (S.streak.last === t) return;
    const y = new Date(Date.now() - DAY).toLocaleDateString("sv");
    S.streak.days = S.streak.last === y ? (S.streak.days || 0) + 1 : 1;
    S.streak.last = t;
  }

  /* ---------------- 数据 ---------------- */
  const IDX = window.NOTES_INDEX;
  const TREE = window.KNOWLEDGE_TREE;
  const BANK = window.QUESTION_BANK;
  const MEDIA = window.MEDIA_BANK || { meta: { total: 0, sources: [] }, items: [] };
  const IVLIB = window.INTERVIEW_LIB || { tiers: [], items: [] };
  const QUOTES = window.QUOTE_BANK || [];

  const NOTES = IDX ? IDX.notes : [];
  const NOTE_BY_PATH = {};
  NOTES.forEach((n) => (NOTE_BY_PATH[n.p] = n));

  const QBYID = {};
  BANK.questions.forEach((q) => (QBYID[q.id] = q));
  const ROLE = {}; BANK.roles.forEach((r) => (ROLE[r.id] = r));
  const MOD = {}; BANK.modules.forEach((m) => (MOD[m.id] = m));

  const DIR_LABEL = (() => {
    const m = {};
    for (const n of NOTES) {
      if (m[n.d]) continue;
      const ch = IDX.chunks.find((c) => c.id === n.k);
      m[n.d] = ch ? ch.name : (n.d || "总入口");
    }
    return m;
  })();
  const dirLabel = (d) => DIR_LABEL[d] || d;

  const chunksLoading = {};
  function loadChunk(id) {
    if (window.NOTES_CHUNK && window.NOTES_CHUNK[id]) return Promise.resolve();
    if (chunksLoading[id]) return chunksLoading[id];
    chunksLoading[id] = new Promise((res) => {
      const s = document.createElement("script");
      s.src = "data/notes-" + id + ".js";
      s.onload = res;
      s.onerror = () => { toast("模块加载失败：" + id); res(); };
      document.head.appendChild(s);
    });
    return chunksLoading[id];
  }
  async function getBody(path) {
    const n = NOTE_BY_PATH[path];
    if (!n) return null;
    await loadChunk(n.k);
    return (window.NOTES_CHUNK && window.NOTES_CHUNK[n.k] && window.NOTES_CHUNK[n.k][path]) || "";
  }
  function resolveNote(name) {
    if (NOTE_BY_PATH[name]) return name;
    if (IDX.names && IDX.names[name]) return IDX.names[name];
    if (IDX.titles && IDX.titles[name]) return IDX.titles[name];
    return null;
  }
  function shortName(p) {
    const n = NOTE_BY_PATH[p];
    return n ? n.t.replace(/^[^\p{L}\p{N}]*/u, "").slice(0, 20) : p;
  }

  /* ---------------- 间隔重复 ---------------- */
  const INTERVALS = [0.25, 1, 3, 7, 15, 30];
  function qState(id) {
    if (!S.q[id]) S.q[id] = { box: 0, last: 0, next: 0, n: 0, hist: [], unlocked: 0 };
    if (S.q[id].unlocked == null) S.q[id].unlocked = 0;
    return S.q[id];
  }
  function rate(id, kind) {
    const st = qState(id);
    st.n++; st.last = Date.now();
    if (kind === "no") st.box = 0;
    else if (kind === "half") st.box = Math.max(1, st.box);
    else st.box = Math.min(5, st.box + 1);
    st.next = Date.now() + INTERVALS[st.box] * DAY;
    touchStreak(); save();
  }
  const dueList = () => BANK.questions.filter((q) => { const st = S.q[q.id]; return st && st.next && st.next <= Date.now(); });
  function masteryOf(modId) {
    const qs = BANK.questions.filter((q) => q.mod === modId);
    if (!qs.length) return { pct: 0, done: 0, total: 0 };
    let sum = 0, done = 0;
    qs.forEach((q) => { const st = S.q[q.id]; if (st) { sum += (st.box || 0) / 5; if (st.n > 0) done++; } });
    return { pct: Math.round((sum / qs.length) * 100), done, total: qs.length };
  }
  function treeProgress() {
    let total = 0, read = 0;
    TREE.layers.forEach((L) => L.nodes.forEach((nd) => { total++; if (S.nodes[nd.id] && S.nodes[nd.id].read) read++; }));
    return { total, read, pct: total ? Math.round((read / total) * 100) : 0 };
  }
  function bankProgress() {
    let done = 0;
    BANK.questions.forEach((q) => { if (S.q[q.id] && S.q[q.id].n > 0) done++; });
    return { done, total: BANK.questions.length };
  }
  function nextTreeNodes(n) {
    const out = [];
    for (const L of TREE.layers) for (const nd of L.nodes) {
      if (out.length >= n) return out;
      if (!(S.nodes[nd.id] && S.nodes[nd.id].read)) out.push({ layer: L, node: nd });
    }
    return out;
  }

  /* ---------------- 访谈 ↔ 题目 关联 ---------------- */
  const TOPIC_MOD = [
    [/eval|评测/i, "evals"], [/fde|问责|交付/i, "fde"], [/mcp|endpoint|协议/i, "protocol"],
    [/编排|orchestr/i, "protocol"], [/rag|检索/i, "rag"], [/agent/i, "agent"],
    [/prompt|提示/i, "product"], [/pm|产品/i, "product"], [/商业|定价|成交/i, "product"],
    [/系统思考|组织/i, "behavior"], [/记忆/i, "memory"], [/推理|部署|量化/i, "infer"],
    [/scaling|训练|微调/i, "train"], [/模型|能力边界|jagged|锯齿/i, "transformer"],
  ];
  function relatedQuestions(iv) {
    const txt = [iv.title, iv.role, (iv.topics || []).join(" "), (iv.takeaways || []).join(" ")].join(" ");
    const mods = new Set();
    for (const [re, m] of TOPIC_MOD) if (re.test(txt)) mods.add(m);
    if (!mods.size) return [];
    return BANK.questions.filter((q) => mods.has(q.mod)).slice(0, 6);
  }

  /* ---------------- 路由 ---------------- */
  const TABS = [
    { id: "today", icon: "◎", label: "今日" },
    { id: "tree", icon: "❖", label: "知识" },
    { id: "bank", icon: "✦", label: "题库" },
    { id: "iv", icon: "▶", label: "访谈" },
    { id: "notes", icon: "▤", label: "笔记" },
    { id: "me", icon: "◇", label: "我的" },
  ];
  const MAP = { today: "today", tree: "tree", bank: "bank", iv: "iv", notes: "notes", me: "me", q: "bank", mq: "bank", note: "notes", ivd: "iv" };

  const go = (h) => (location.hash = h);
  function parse() {
    const raw = (location.hash || "#/today").replace(/^#\/?/, "").split("?")[0];
    const [seg, ...rest] = raw.split("/");
    return { seg: seg || "today", rest };
  }
  async function route() {
    const { seg, rest } = parse();
    const tab = MAP[seg] || "today";
    $$("#tabbar button").forEach((b) => b.classList.toggle("on", b.dataset.tab === tab));
    $$(".view").forEach((v) => v.classList.remove("on"));
    $("#view-" + tab).classList.add("on");
    window.scrollTo(0, 0);

    if (seg === "q") renderQuestion(rest[0]);
    else if (seg === "mq") renderMediaQuestion(rest[0]);
    else if (seg === "note") renderNotes(rest.join("/"));
    else if (seg === "ivd") renderInterviewDetail(rest[0]);
    else if (tab === "today") renderToday();
    else if (tab === "tree") renderTree(rest[0]);
    else if (tab === "bank") renderBank(rest[0], rest[1]);
    else if (tab === "iv") renderInterviews();
    else if (tab === "notes") renderNotes();
    else if (tab === "me") renderMe();
    paintTop();
  }
  function paintTop() {
    const due = dueList().length;
    const st = $("#top-streak");
    if (st) st.innerHTML = `🔥 <b>${S.streak.days || 0}</b> 天`;
    const b = $("#tab-bank-badge");
    if (b) { if (due > 0) { b.textContent = due > 99 ? "99+" : due; b.style.display = ""; } else b.style.display = "none"; }
  }

  /* ---------------- 共用片段 ---------------- */
  const RING = (pct, label) => {
    const C = 2 * Math.PI * 32;
    const off = C * (1 - clamp(pct, 0, 100) / 100);
    return `<div class="ring">
      <svg width="76" height="76" viewBox="0 0 76 76">
        <defs><linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#6d8bff"/><stop offset="100%" stop-color="#4fd1c5"/>
        </linearGradient></defs>
        <circle class="ring-bg" cx="38" cy="38" r="32" fill="none" stroke-width="7"/>
        <circle class="ring-fg" cx="38" cy="38" r="32" fill="none" stroke-width="7"
          stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}"/>
      </svg>
      <div class="ring-txt">${pct}%<small>${label}</small></div>
    </div>`;
  };
  const evHTML = (e) => `<div class="ev">
      <div class="zh">「${esc(e.zh)}」</div>
      ${e.en ? `<div class="en">“${esc(e.en)}”</div>` : ""}
      <div class="by">— ${esc(e.src)}${e.url ? ` · <a href="${esc(e.url)}" target="_blank" rel="noopener">原始来源</a>` : ""}</div>
    </div>`;
  const quoteHTML = (q) => q ? `<div class="iv-quote">
      <div class="q-zh">「${esc(q.zh)}」</div>
      ${q.en ? `<div class="q-en">“${esc(q.en)}”</div>` : ""}
      <div class="by" style="margin-top:8px">— ${esc(q.by)}${q.exact ? "" : "（转述）"}${q.url ? ` · <a href="${esc(q.url)}" target="_blank" rel="noopener">来源</a>` : ""}</div>
    </div>` : "";
  const NOTE_BTN = (p) => `<button class="btn sm" data-note="${esc(p)}">📖 深读：${esc(shortName(p))}</button>`;

  /* ================= 今日 ================= */
  function renderToday() {
    const tp = treeProgress(), bp = bankProgress();
    const due = dueList();
    const todo = nextTreeNodes(3);
    const d = new Date();
    const week = "日一二三四五六"[d.getDay()];
    const mods = BANK.modules.map((m) => ({ m, s: masteryOf(m.id) })).filter((x) => x.s.total).sort((a, b) => a.s.pct - b.s.pct).slice(0, 3);

    $("#view-today").innerHTML = `
      <div class="hero">
        <div class="hero-top">
          <div style="flex:1;min-width:0">
            <div class="kicker">${d.getMonth() + 1} 月 ${d.getDate()} 日 · 周${week}</div>
            <h1>今天只做三件事</h1>
            <p>深读一个节点 · 钻一道题 · 复习到期的。<br>不求多，求讲得出来。</p>
          </div>
          ${RING(tp.pct, "知识树")}
        </div>
        <div class="hero-stats">
          <div class="hstat"><b>${tp.read}<span style="font-size:13px;color:var(--tx3)">/${tp.total}</span></b><span>节点已深读</span></div>
          <div class="hstat"><b>${bp.done}<span style="font-size:13px;color:var(--tx3)">/${bp.total}</span></b><span>精讲题已练</span></div>
          <div class="hstat"><b>${due.length}</b><span>今日到期复习</span></div>
        </div>
      </div>

      <div class="tiles">
        <button class="tile hot" data-random="1"><i>✦</i><b>随机抽题</b><span>从 869 题里掷一次</span></button>
        <button class="tile" data-go="#/bank?mock=1"><i>⏱</i><b>模拟面试</b><span>5 题连考</span></button>
        <button class="tile" data-go="#/iv"><i>▶</i><b>访谈精选</b><span>${IVLIB.items.length} 场一线访谈</span></button>
      </div>

      <div class="sec">${due.length ? `⏰ 到期复习 <span class="n">${due.length}</span>` : "⏰ 到期复习"}</div>
      ${due.length ? `<div class="rows">${due.slice(0, 3).map((q) => `
        <button class="row" data-go="#/q/${q.id}">
          <span class="row-i grad">🔁</span>
          <span class="row-b">
            <span class="row-t">${esc(q.q)}</span>
            <span class="row-m"><span class="tag due">该复习了</span><span class="tag">${esc(MOD[q.mod].name)}</span></span>
          </span><span class="row-x">›</span>
        </button>`).join("")}
        ${due.length > 3 ? `<button class="btn ghost block sm" data-go="#/bank">查看全部 ${due.length} 道到期 →</button>` : ""}</div>`
      : `<div class="card"><div class="empty" style="padding:16px 4px"><i>🫧</i>今天没有到期题目。<br>做过的题会按 6 小时 / 1 / 3 / 7 / 15 / 30 天回来找你。</div></div>`}

      <div class="sec">📚 继续深读</div>
      <div class="rows">
        ${todo.map((x) => `
          <button class="row" data-go="#/tree/${x.layer.id}">
            <span class="row-i">${esc(x.layer.no.replace("第 ", "").replace(" 层", ""))}</span>
            <span class="row-b">
              <span class="row-t">${esc(x.node.t)}</span>
              <span class="row-m">${esc(x.layer.title)} · ${esc(x.node.id)}</span>
            </span><span class="row-x">›</span>
          </button>`).join("") || `<div class="card muted">知识树已全部读过 🎉 回到题库巩固，或去访谈里找新东西。</div>`}
      </div>

      ${mods.length ? `<div class="sec">📉 最该补的模块</div>
      <div class="card">
        ${mods.map((x) => `<div class="radar-row">
          <span class="rn">${x.m.icon} ${esc(x.m.name)}</span>
          <div class="meter"><i class="${x.s.pct < 34 ? "bad" : x.s.pct < 67 ? "warn" : "ok"}" style="width:${x.s.pct}%"></i></div>
          <span class="rv">${x.s.pct}%</span></div>`).join("")}
        <button class="btn block sm" style="margin-top:12px" data-go="#/bank/${""}/${mods[0].m.id}">去练 ${esc(mods[0].m.name)} →</button>
      </div>` : ""}

      <div class="sec">💬 今日金句</div>
      <div class="card" style="padding:16px">${quoteHTML(QUOTES[Math.floor(Math.random() * QUOTES.length)])}</div>
    `;
    const r = $("#view-today [data-random]");
    if (r) r.onclick = () => { const q = BANK.questions[Math.floor(Math.random() * BANK.questions.length)]; go("#/q/" + q.id); };
  }

  /* ================= 知识树 ================= */
  function renderTree(openLayer) {
    $("#view-tree").innerHTML = `
      <div class="hero">
        <div class="hero-top">
          <div style="flex:1;min-width:0">
            <div class="kicker">深度学习主干</div>
            <h1>${esc(TREE.title)}</h1>
            <p>${esc(TREE.subtitle)}</p>
          </div>
          ${RING(treeProgress().pct, "已深读")}
        </div>
      </div>
      ${TREE.layers.map((L, i) => `
        <details class="layer" ${openLayer === L.id || (!openLayer && i === 0) ? "open" : ""}>
          <summary>
            <span class="no">${esc(L.no)}</span>
            <span class="lt">${esc(L.title)}<div class="q">${esc(L.question)} → <b style="color:var(--teal)">${esc(L.answer)}</b></div></span>
            <span class="arrow">›</span>
          </summary>
          <div class="layer-body">
            <p class="muted" style="margin:12px 0 4px">${esc(L.intro)}</p>
            ${L.nodes.map((nd) => nodeHTML(nd)).join("")}
          </div>
        </details>`).join("")}
    `;
  }
  function nodeHTML(nd) {
    const st = S.nodes[nd.id] || {};
    return `<div class="node" id="node-${esc(nd.id)}">
      <div class="tag-row">
        <span class="tag">${esc(nd.id)}</span>
        ${st.read ? '<span class="tag done">✓ 已深读</span>' : ""}
      </div>
      <h4 style="margin-top:9px">${esc(nd.t)}</h4>
      <div class="claim">${MD.inline(nd.claim)}</div>
      <ul>${nd.points.map((p) => `<li>${MD.inline(p)}</li>`).join("")}</ul>
      ${(nd.ev || []).map((e) => evHTML(e)).join("")}
      ${(nd.notes || []).filter((p) => NOTE_BY_PATH[p]).length ? `<div class="note-links">${nd.notes.filter((p) => NOTE_BY_PATH[p]).map(NOTE_BTN).join("")}</div>` : ""}
      ${st.note ? `<div class="practice" style="margin-top:11px">我的理解：${esc(st.note)}</div>` : ""}
      <div class="btn-row" style="margin-top:12px">
        <button class="btn sm ${st.read ? "ghost" : "ok"}" data-read="${esc(nd.id)}">${st.read ? "取消已读" : "✓ 标记已深读"}</button>
        <button class="btn sm ghost" data-mynote="${esc(nd.id)}">✍️ 写一句自己的话</button>
      </div>
    </div>`;
  }

  /* ================= 题库 ================= */
  let bankFilter = { role: "", mod: "" };
  let bankMediaFilter = { role: "", kw: "" };
  const MEDIA_ROLE_SHORT = { "llm-algo": "🔬 算法", "agent-app": "🤖 应用/Agent", "llmops": "⚙️ LLMOps", "ai-pm": "📋 AI PM", "fde": "🛰️ FDE", "": "📎 其他" };

  function renderBank(roleArg, modArg) {
    const params = new URLSearchParams(location.hash.split("?")[1] || "");
    if (params.get("mock") === "1") { startMock(bankFilter.role); return; }
    if (params.get("src") === "media") { if (params.get("r")) bankMediaFilter.role = params.get("r"); renderMediaBank(); return; }
    if (roleArg) bankFilter.role = roleArg;
    if (modArg) bankFilter.mod = modArg;

    let list = BANK.questions.slice();
    if (bankFilter.role) list = list.filter((q) => q.role === bankFilter.role);
    if (bankFilter.mod) list = list.filter((q) => q.mod === bankFilter.mod);
    const F = { high: "🔥 高频", mid: "◻ 常规", low: "· 长尾" };

    $("#view-bank").innerHTML = `
      <div class="seg">
        <button class="on">📕 深度精讲 ${BANK.questions.length}</button>
        <button data-go="#/bank?src=media">📰 媒体题库 ${MEDIA.meta.total}</button>
      </div>
      <div class="hero">
        <div class="kicker">逐题深钻</div>
        <h1>深度精讲题库</h1>
        <p>每题都配「追问链 + 答题框架 + 访谈证据 + 关联笔记」，按面试官追问的节奏一层层解锁。</p>
      </div>
      <div class="chips">
        <button class="chip ${!bankFilter.role ? "on" : ""}" data-fr="">全部岗位</button>
        ${BANK.roles.map((r) => `<button class="chip ${bankFilter.role === r.id ? "on" : ""}" data-fr="${r.id}">${r.icon} ${esc(r.name)}</button>`).join("")}
      </div>
      <div class="chips">
        <button class="chip ${!bankFilter.mod ? "on" : ""}" data-fm="">全部模块</button>
        ${BANK.modules.filter((m) => !bankFilter.role || m.roles.includes(bankFilter.role)).map((m) => `<button class="chip ${bankFilter.mod === m.id ? "on" : ""}" data-fm="${m.id}">${m.icon} ${esc(m.name)}</button>`).join("")}
      </div>
      <div class="btn-row" style="margin-bottom:14px">
        <button class="btn primary" data-go="#/bank?mock=1">⏱ 模拟面试（5 题）</button>
        <button class="btn" id="rand2">🎲 随机一题</button>
      </div>
      <div class="muted" style="margin-bottom:10px">当前 ${list.length} 题</div>
      <ul class="qlist">${list.map((q) => {
        const st = S.q[q.id], done = st && st.n > 0;
        return `<li><button class="qitem" data-go="#/q/${q.id}">
          <div class="qt">${esc(q.q)}</div>
          <div class="qm">
            <span class="tag ${q.freq === "high" ? "hot" : q.freq === "mid" ? "mid" : ""}">${F[q.freq]}</span>
            <span class="tag">${esc(MOD[q.mod].name)}</span>
            ${done ? `<span class="tag done">Lv${st.box} 已练</span>` : '<span class="tag">未练</span>'}
          </div></button></li>`;
      }).join("")}</ul>
      ${!list.length ? '<div class="card empty"><i>🗂</i>这个筛选下还没有题目</div>' : ""}
    `;
    $$("#view-bank .chip").forEach((c) => (c.onclick = () => {
      if (c.dataset.fr !== undefined) { bankFilter = { role: c.dataset.fr, mod: "" }; go("#/bank"); }
      else { bankFilter.mod = c.dataset.fm; go("#/bank"); }
    }));
    const r2 = $("#rand2");
    if (r2) r2.onclick = () => { const l = list.length ? list : BANK.questions; go("#/q/" + l[Math.floor(Math.random() * l.length)].id); };
  }

  function renderMediaBank() {
    const all = MEDIA.items;
    let list = all.slice();
    if (bankMediaFilter.role !== "") list = list.filter((i) => (i.role || "") === bankMediaFilter.role);
    if (bankMediaFilter.kw) {
      const kw = bankMediaFilter.kw.toLowerCase();
      list = list.filter((i) => (i.q || "").toLowerCase().includes(kw) || (i.zh || "").toLowerCase().includes(kw) || (i.mod || "").toLowerCase().includes(kw) || (i.frame || "").toLowerCase().includes(kw));
    }
    const counts = {}; all.forEach((i) => { const k = i.role || ""; counts[k] = (counts[k] || 0) + 1; });
    const shown = list.slice(0, 200);

    $("#view-bank").innerHTML = `
      <div class="seg">
        <button data-go="#/bank">📕 深度精讲 ${BANK.questions.length}</button>
        <button class="on">📰 媒体题库 ${MEDIA.meta.total}</button>
      </div>
      <div class="hero">
        <div class="kicker">广度覆盖</div>
        <h1>媒体题库</h1>
        <p>收集自 ${MEDIA.meta.sources.map((s) => s.label + " " + s.count).join(" · ")}。每题带来源链接、追问与参考答题框架。</p>
      </div>
      <input class="search" id="mq-search" placeholder="🔍 搜题目 / 中文 / 模块（如 RAG、evals、decomposition）" value="${esc(bankMediaFilter.kw)}">
      <div class="chips" style="margin-top:12px">
        <button class="chip ${bankMediaFilter.role === "" ? "on" : ""}" data-mr="">全部 ${all.length}</button>
        ${["llm-algo", "agent-app", "llmops", "ai-pm", "fde", ""].filter((r) => counts[r]).map((r) => `<button class="chip ${bankMediaFilter.role === r ? "on" : ""}" data-mr="${r}">${MEDIA_ROLE_SHORT[r] || r} ${counts[r]}</button>`).join("")}
      </div>
      <div class="muted" style="margin-bottom:10px">匹配 ${list.length} 题${list.length > 200 ? "（显示前 200，用搜索缩小）" : ""}</div>
      <ul class="qlist">${shown.map((i) => {
        const st = S.q[i.id];
        return `<li><button class="qitem" data-go="#/mq/${i.id}">
          <div class="qt">${esc(i.q)}</div>
          <div class="qm">
            ${i.role ? `<span class="tag mid">${MEDIA_ROLE_SHORT[i.role]}</span>` : ""}
            <span class="tag">${esc(String(i.mod).slice(0, 16))}</span>
            ${i.freq ? `<span class="tag">${esc(i.freq)}</span>` : ""}
            ${st && st.n ? `<span class="tag done">已练 Lv${st.box}</span>` : ""}
          </div></button></li>`;
      }).join("")}</ul>
      ${!list.length ? '<div class="card empty"><i>🫙</i>没有匹配的题目</div>' : ""}
    `;
    const si = $("#mq-search");
    si.addEventListener("input", () => {
      bankMediaFilter.kw = si.value;
      clearTimeout(si._t);
      si._t = setTimeout(() => { renderMediaBank(); const el = $("#mq-search"); el.focus(); el.setSelectionRange(el.value.length, el.value.length); }, 240);
    });
    $$("#view-bank .chip").forEach((c) => (c.onclick = () => { bankMediaFilter.role = c.dataset.mr; go("#/bank?src=media"); }));
  }

  /* ================= 模拟面试 ================= */
  let mock = null;
  function startMock(role) {
    let pool = BANK.questions.slice();
    if (role) pool = pool.filter((q) => q.role === role);
    if (pool.length < 5) pool = BANK.questions.slice();
    const picked = [], used = {};
    while (picked.length < 5 && picked.length < pool.length) {
      const i = Math.floor(Math.random() * pool.length);
      if (!used[pool[i].id]) { used[pool[i].id] = 1; picked.push(pool[i].id); }
    }
    mock = { ids: picked, i: 0, t0: Date.now() };
    go("#/q/" + picked[0]);
  }
  function nextMock() {
    if (!mock) { go("#/bank"); return; }
    if (mock.i + 1 >= mock.ids.length) {
      toast(`模拟面试结束，用时约 ${Math.round((Date.now() - mock.t0) / 60000)} 分钟`);
      mock = null; go("#/me"); return;
    }
    mock.i++; go("#/q/" + mock.ids[mock.i]);
  }

  /* ================= 题目深钻 ================= */
  function renderQuestion(id) {
    const q = QBYID[id];
    if (!q) { go("#/bank"); return; }
    const st = qState(id);
    const inMock = mock && mock.ids.includes(id);
    const step = inMock ? mock.ids.indexOf(id) + 1 : 0;
    const unlocked = st.unlocked || 0;
    const probes = q.probes || [];

    $("#view-bank").innerHTML = `
      <div class="crumb" data-go="#/bank">‹ 题库${inMock ? ` · 模拟面试 ${step}/${mock.ids.length}` : ""}</div>
      <div class="q-head">
        <div class="tag-row">
          <span class="tag ${q.freq === "high" ? "hot" : q.freq === "mid" ? "mid" : ""}">${q.freq === "high" ? "🔥 高频" : q.freq === "mid" ? "◻ 常规" : "长尾"}</span>
          <span class="tag ${q.lv >= 3 ? "lv3" : ""}">深度 ${"●".repeat(q.lv)}${"○".repeat(3 - q.lv)}</span>
          <span class="tag">${ROLE[q.role].icon} ${esc(ROLE[q.role].name)}</span>
          <span class="tag">${esc(MOD[q.mod].name)}</span>
          ${st.n ? `<span class="tag done">已练 ${st.n} 次 · Lv${st.box}</span>` : ""}
        </div>
        <div class="qtext">${esc(q.q)}</div>
      </div>

      <div class="steps">
        <div class="step">
          <div class="sh"><span class="idx">1</span>先别翻答案：用关键词答一遍</div>
          <div class="sd">
            <div class="muted" style="margin-bottom:10px">合上一切资料，把你能想到的写下来。<b style="color:var(--teal)">主动回忆本身就在强化记忆</b>——这一步不是形式。</div>
            <textarea class="ans" id="ans-box" placeholder="我的答案 / 关键词…">${esc(S.text["q_" + id] || "")}</textarea>
            <div class="btn-row" style="margin-top:10px">
              <button class="btn sm" id="timer-btn">⏱ 开始计时</button>
              <button class="btn sm ghost" id="clear-ans">清空</button>
            </div>
          </div>
        </div>

        <div class="step">
          <div class="sh"><span class="idx">2</span>对照参考框架</div>
          <div class="sd">
            <button class="btn primary block" id="reveal">👀 展开参考框架</button>
            <div id="frame-box" style="display:none;margin-top:14px">
              <div class="frameblk"><b>一句话结论（面试先说这句）</b><div class="claim-big">${MD.inline(q.frame.claim)}</div></div>
              <div class="frameblk"><b>为什么 · 分层展开</b><ol>${q.frame.why.map((w) => `<li>${MD.inline(w)}</li>`).join("")}</ol></div>
              <div class="frameblk"><b>取舍 / Trade-off</b><div style="font-size:14.4px;color:var(--tx2);line-height:1.72">${MD.inline(q.frame.tradeoff)}</div></div>
              ${q.frame.practice ? `<div class="practice" style="margin-top:12px">💡 项目落点：${MD.inline(q.frame.practice)}</div>` : ""}
              ${(q.frame.pitfalls || []).length ? `<div class="frameblk" style="margin-top:14px"><b>雷区 · 被点名会扣分</b><ul class="pitfall">${q.frame.pitfalls.map((p) => `<li>${MD.inline(p)}</li>`).join("")}</ul></div>` : ""}
            </div>
          </div>
        </div>

        ${probes.length ? `<div class="step">
          <div class="sh"><span class="idx">3</span>追问链 · 面试官会这样往下问</div>
          <div class="sd">
            <div class="muted" style="margin-bottom:8px">共 ${probes.length} 层。每层先自己答，再点开下一层——模拟字节/小米那种打断式追问。</div>
            <div id="probes">${probes.map((p, i) => `<div class="probe" data-probe="${i}" style="${i < unlocked ? "" : "display:none"}"><div class="pq">第 ${i + 1} 层：${MD.inline(p)}</div></div>`).join("")}</div>
            <button class="btn block" id="next-probe" style="margin-top:12px">
              ${unlocked === 0 ? `开始追问（1/${probes.length}）` : unlocked >= probes.length ? "追问已全部解锁 ✓" : `下一层追问（${unlocked + 1}/${probes.length}）`}
            </button>
          </div>
        </div>` : ""}

        ${(q.ev || []).length ? `<div class="step">
          <div class="sh"><span class="idx">4</span>访谈证据 · 引原话即加分</div>
          <div class="sd">${q.ev.map(evHTML).join("")}</div>
        </div>` : ""}

        ${(q.rel || []).filter((p) => NOTE_BY_PATH[p]).length ? `<div class="step">
          <div class="sh"><span class="idx">5</span>深读原文 · 答不出来的地方回去补</div>
          <div class="sd">
            <div class="note-links">${q.rel.filter((p) => NOTE_BY_PATH[p]).map(NOTE_BTN).join("")}</div>
            ${(q.src || []).length ? `<div class="muted" style="margin-top:12px">题目出处：${q.src.map(esc).join(" · ")}</div>` : ""}
          </div>
        </div>` : ""}

        <div class="step">
          <div class="sh"><span class="idx">6</span>自评 → 自动排复习</div>
          <div class="sd">
            <div class="muted" style="margin-bottom:11px">诚实打分。不会的会很快回来找你，会的会被拉长间隔。</div>
            <div class="btn-row">
              <button class="btn bad" data-rate="no">😵 不会</button>
              <button class="btn half" data-rate="half">😐 半会</button>
              <button class="btn ok" data-rate="yes">😎 会了</button>
            </div>
            <div class="muted" style="margin-top:10px">下次复习：不会 → 6 小时后 · 半会 → ${INTERVALS[Math.max(1, st.box)]} 天后 · 会了 → ${INTERVALS[Math.min(5, st.box + 1)]} 天后</div>
            <button class="btn block ghost" id="my-free-note" style="margin-top:11px">✍️ 写下我自己的理解（费曼）</button>
          </div>
        </div>
      </div>

      ${inMock ? `<div class="btn-row" style="margin-top:16px"><button class="btn primary block" id="mock-next">${mock.i + 1 >= mock.ids.length ? "结束模拟面试" : `下一题（${mock.i + 2}/${mock.ids.length}）`}</button></div>` : ""}
    `;

    const ta = $("#ans-box");
    ta.addEventListener("input", () => { S.text["q_" + id] = ta.value; save(); });

    let timerId = null, tLeft = 0;
    $("#timer-btn").onclick = (ev) => {
      if (timerId) { clearInterval(timerId); timerId = null; ev.target.textContent = `⏱ 继续计时（${tLeft}s）`; return; }
      if (!tLeft) tLeft = 120;
      ev.target.textContent = `⏱ ${tLeft}s · 点一下暂停`;
      timerId = setInterval(() => {
        tLeft--; ev.target.textContent = `⏱ ${tLeft}s · 点一下暂停`;
        if (tLeft <= 0) { clearInterval(timerId); timerId = null; ev.target.textContent = "⏱ 时间到，看答案"; toast("时间到——面试里这题该收尾了"); }
      }, 1000);
    };
    $("#clear-ans").onclick = () => { ta.value = ""; S.text["q_" + id] = ""; save(); };

    $("#reveal").onclick = () => {
      const fb = $("#frame-box"), show = fb.style.display === "none";
      fb.style.display = show ? "block" : "none";
      $("#reveal").textContent = show ? "🙈 收起参考框架" : "👀 展开参考框架";
      if (show) { touchStreak(); save(); }
    };

    const np = $("#next-probe");
    if (np) np.onclick = () => {
      const cur = S.q[id].unlocked || 0;
      if (cur >= probes.length) { toast("追问已全部展开"); return; }
      const nxt = cur + 1;
      S.q[id].unlocked = nxt;
      const pe = $(`#probes [data-probe="${nxt - 1}"]`);
      if (pe) pe.style.display = "";
      np.textContent = nxt >= probes.length ? "追问已全部解锁 ✓" : `下一层追问（${nxt + 1}/${probes.length}）`;
      touchStreak(); save();
    };

    $$("#view-bank [data-rate]").forEach((b) => (b.onclick = () => {
      rate(id, b.dataset.rate);
      toast("已记录：" + ({ no: "不会", half: "半会", yes: "会了" }[b.dataset.rate]));
      paintTop();
      if (inMock) setTimeout(nextMock, 420);
    }));

    const nf = $("#my-free-note");
    if (nf) nf.onclick = () => askMyNote("q_" + id, "我的理解（费曼）");
    const mn = $("#mock-next");
    if (mn) mn.onclick = nextMock;
  }

  function renderMediaQuestion(id) {
    const it = MEDIA.items.find((x) => x.id === id);
    if (!it) { go("#/bank?src=media"); return; }
    const st = qState(id);
    $("#view-bank").innerHTML = `
      <div class="crumb" data-go="#/bank?src=media">‹ 媒体题库</div>
      <div class="q-head">
        <div class="tag-row">
          ${it.role ? `<span class="tag mid">${MEDIA_ROLE_SHORT[it.role]}</span>` : ""}
          <span class="tag">${esc(it.mod)}</span>
          <span class="tag">${esc(it.bank)}</span>
          ${st.n ? `<span class="tag done">已练 ${st.n} 次 · Lv${st.box}</span>` : ""}
        </div>
        <div class="qtext">${esc(it.q)}</div>
        ${it.zh ? `<div class="muted" style="margin-top:10px">${esc(it.zh)}</div>` : ""}
      </div>
      <div class="steps">
        <div class="step"><div class="sh"><span class="idx">1</span>先自己答一遍</div>
          <div class="sd"><textarea class="ans" id="ans-box" placeholder="关键词即可…">${esc(S.text["q_" + id] || "")}</textarea></div></div>
        ${it.probe ? `<div class="step"><div class="sh"><span class="idx">2</span>面试官的追问</div><div class="sd"><div class="probe" style="margin:0"><div class="pq">${MD.inline(it.probe)}</div></div></div></div>` : ""}
        ${it.frame ? `<div class="step"><div class="sh"><span class="idx">3</span>参考答题框架</div><div class="sd"><div class="claim-big">${MD.inline(it.frame)}</div></div></div>` : ""}
        <div class="step"><div class="sh"><span class="idx">4</span>自评 → 排进复习</div>
          <div class="sd">
            <div class="btn-row">
              <button class="btn bad" data-rate="no">😵 不会</button>
              <button class="btn half" data-rate="half">😐 半会</button>
              <button class="btn ok" data-rate="yes">😎 会了</button>
            </div>
            <button class="btn block ghost" id="my-free-note" style="margin-top:11px">✍️ 写下我自己的理解</button>
          </div></div>
      </div>
      <div class="card" style="margin-top:14px">
        <div class="muted">来源：${esc(it.src || "（未标注）")}${it.url ? `<br><a href="${esc(it.url)}" target="_blank" rel="noopener">打开原始链接 ↗</a>` : ""}</div>
        <div class="muted" style="margin-top:9px">媒体题库为公开面经聚合，答案框架由来源方整理，请回原文核对后使用。</div>
      </div>
    `;
    const ta = $("#ans-box");
    ta.addEventListener("input", () => { S.text["q_" + id] = ta.value; save(); });
    $$("#view-bank [data-rate]").forEach((b) => (b.onclick = () => {
      rate(id, b.dataset.rate); toast("已记录：" + ({ no: "不会", half: "半会", yes: "会了" }[b.dataset.rate])); paintTop();
    }));
    const nf = $("#my-free-note");
    if (nf) nf.onclick = () => askMyNote("q_" + id, "我的理解（费曼）");
  }

  function askMyNote(key, title) {
    const v = prompt(title + "（只存在你这台设备上）", S.text[key] || "");
    if (v === null) return;
    S.text[key] = v;
    if (!S.text[key]) delete S.text[key];
    touchStreak(); save(true); toast("已保存"); route();
  }

  /* ================= 访谈 ================= */
  let ivFilter = { tier: "", kw: "" };
  const STATUS = { full: { t: "已加工 · 可读全笔记", c: "done" }, part: { t: "部分源 · 要点齐全", c: "mid" }, raw: { t: "仅要点 · 待补逐字稿", c: "" }, todo: { t: "待加工", c: "" } };
  const initial = (s) => (s || "?").trim()[0];

  function renderInterviews() {
    const all = IVLIB.items;
    let list = all.slice();
    if (ivFilter.tier) list = list.filter((i) => i.tier === ivFilter.tier);
    if (ivFilter.kw) {
      const kw = ivFilter.kw.toLowerCase();
      list = list.filter((i) => [i.guest, i.role, i.title, i.channel, (i.topics || []).join(" "), (i.takeaways || []).join(" ")].join(" ").toLowerCase().includes(kw));
    }
    const withNote = all.filter((i) => i.note).length;

    $("#view-iv").innerHTML = `
      <div class="hero">
        <div class="hero-top">
          <div style="flex:1;min-width:0">
            <div class="kicker">来自 YouTube 的一线访谈</div>
            <h1>访谈精选</h1>
            <p>${all.length} 场优质访谈，按权威性 × 影响力 × 时效筛出。${withNote} 场已加工成可深读的笔记。</p>
          </div>
          ${RING(Math.round((withNote / Math.max(1, all.length)) * 100), "已加工")}
        </div>
        <div class="hero-stats">
          ${IVLIB.tiers.map((t) => `<div class="hstat"><b>${all.filter((i) => i.tier === t.id).length}</b><span>${t.icon} ${t.name.split(" · ")[0]}</span></div>`).join("")}
        </div>
      </div>

      <input class="search" id="iv-search" placeholder="🔍 搜嘉宾 / 主题（如 Evals、FDE、MCP、Boris）" value="${esc(ivFilter.kw)}">
      <div class="chips" style="margin-top:12px">
        <button class="chip ${!ivFilter.tier ? "on" : ""}" data-t="">全部 ${all.length}</button>
        ${IVLIB.tiers.map((t) => `<button class="chip ${ivFilter.tier === t.id ? "on" : ""}" data-t="${t.id}">${t.icon} ${t.name.split(" · ")[0]} ${all.filter((i) => i.tier === t.id).length}</button>`).join("")}
      </div>

      ${IVLIB.tiers.filter((t) => !ivFilter.tier || t.id === ivFilter.tier).map((t) => {
        const sub = list.filter((i) => i.tier === t.id);
        if (!sub.length) return "";
        return `<div class="sec">${t.icon} ${esc(t.name)}</div>
        <div class="muted" style="margin:-4px 4px 12px">${esc(t.desc)}</div>
        ${sub.map(ivCard).join("")}`;
      }).join("")}
      ${!list.length ? '<div class="card empty"><i>🔍</i>没有匹配的访谈</div>' : ""}
    `;
    const si = $("#iv-search");
    si.addEventListener("input", () => {
      ivFilter.kw = si.value;
      clearTimeout(si._t);
      si._t = setTimeout(() => { renderInterviews(); const el = $("#iv-search"); el.focus(); el.setSelectionRange(el.value.length, el.value.length); }, 240);
    });
    $$("#view-iv .chip").forEach((c) => (c.onclick = () => { ivFilter.tier = c.dataset.t; go("#/iv"); }));
  }

  function ivCard(i) {
    const st = STATUS[i.status] || STATUS.todo;
    return `<div class="iv-card ${i.tier.toLowerCase()}" data-go="#/ivd/${i.id}">
      <div class="iv-top">
        <div class="iv-face">${esc(initial(i.guest))}</div>
        <div class="iv-b">
          <div class="iv-name">${esc(i.guest)}</div>
          <div class="iv-role">${esc(i.channel)}${i.date && i.date !== "—" ? " · " + esc(i.date) : ""}${i.duration && i.duration !== "—" ? " · " + esc(i.duration) : ""}</div>
        </div>
        <span class="tag ${i.tier.toLowerCase()}" style="flex:none">${i.tier} 级</span>
      </div>
      <div class="iv-title">${esc(i.title)}</div>
      ${(i.takeaways || []).length ? `<ul class="iv-take">${i.takeaways.slice(0, 3).map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
      ${(i.quotes || []).length ? `<div class="iv-quote"><div class="q-zh">「${esc(i.quotes[0].zh)}」</div>${i.quotes[0].en ? `<div class="q-en">“${esc(i.quotes[0].en)}”</div>` : ""}</div>` : ""}
      <div class="tag-row" style="margin-top:11px">
        <span class="tag ${st.c}">${esc(st.t)}</span>
        ${i.note ? '<span class="tag done">📖 有完整笔记</span>' : ""}
        ${(i.topics || []).slice(0, 3).map((t) => `<span class="tag">${esc(t)}</span>`).join("")}
      </div>
    </div>`;
  }

  function renderInterviewDetail(id) {
    const i = IVLIB.items.find((x) => x.id === id);
    if (!i) { go("#/iv"); return; }
    const st = STATUS[i.status] || STATUS.todo;
    const rq = relatedQuestions(i);
    $("#view-iv").innerHTML = `
      <div class="crumb" data-go="#/iv">‹ 访谈精选</div>
      <div class="hero">
        <div class="hero-top">
          <div class="iv-face" style="width:52px;height:52px;border-radius:16px;font-size:20px">${esc(initial(i.guest))}</div>
          <div style="flex:1;min-width:0">
            <div class="kicker">${i.tier} 级访谈</div>
            <h1 style="font-size:19px">${esc(i.guest)}</h1>
            <p>${esc(i.role)}</p>
          </div>
        </div>
        <div class="tag-row" style="margin-top:14px">
          <span class="tag ${i.tier.toLowerCase()}">${i.tier} 级</span>
          <span class="tag ${st.c}">${esc(st.t)}</span>
          <span class="tag">${esc(i.channel)}</span>
          ${i.date && i.date !== "—" ? `<span class="tag">${esc(i.date)}</span>` : ""}
          ${i.duration && i.duration !== "—" ? `<span class="tag">${esc(i.duration)}</span>` : ""}
        </div>
      </div>

      <div class="card">
        <div class="sec" style="margin:0 0 10px">📺 这期讲什么</div>
        <div style="font-size:15.4px;font-weight:650;line-height:1.66">${esc(i.title)}</div>
        ${(i.takeaways || []).length ? `<ul class="iv-take" style="margin-top:12px">${i.takeaways.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
        <div class="btn-row" style="margin-top:14px">
          ${i.url ? `<a class="btn primary" href="${esc(i.url)}" target="_blank" rel="noopener">▶ 去 YouTube / 原页看</a>` : '<span class="btn ghost" style="pointer-events:none;opacity:.55">链接待补</span>'}
          ${i.extra && i.extra.url ? `<a class="btn" href="${esc(i.extra.url)}" target="_blank" rel="noopener">📄 ${esc(i.extra.title)}</a>` : ""}
          ${i.sister && i.sister.url ? `<a class="btn ghost" href="${esc(i.sister.url)}" target="_blank" rel="noopener">🎬 姊妹期</a>` : ""}
        </div>
      </div>

      ${(i.keyPoints || []).length ? `<div class="sec">🔑 核心要点</div>
      <div class="card"><ul class="iv-take" style="margin:0">${i.keyPoints.map((k) => `<li>${esc(k)}</li>`).join("")}</ul></div>` : ""}

      ${(i.quotes || []).length ? `<div class="sec">💬 可直接引用的金句</div>
      <div class="card">${i.quotes.map((q) => `<div class="iv-quote" style="margin-top:10px"><div class="q-zh">「${esc(q.zh)}」</div>${q.en ? `<div class="q-en">“${esc(q.en)}”</div>` : ""}</div>`).join("")}</div>` : ""}

      ${i.note && NOTE_BY_PATH[i.note] ? `<div class="sec">📖 深读</div>
      <div class="card">
        <div class="muted" style="margin-bottom:11px">这期已经加工成结构化笔记（含要点表、框架、行动项）：</div>
        <button class="btn primary block" data-note="${esc(i.note)}">打开完整笔记 →</button>
      </div>` : `<div class="card"><div class="empty" style="padding:14px 4px"><i>📝</i>这期还没加工成笔记。<br>先去原页看，回来可以让我补。</div></div>`}

      ${rq.length ? `<div class="sec">🎤 相关的面试题</div>
      <ul class="qlist">${rq.map((q) => `<li><button class="qitem" data-go="#/q/${q.id}">
        <div class="qt">${esc(q.q)}</div>
        <div class="qm"><span class="tag ${q.freq === "high" ? "hot" : ""}">${q.freq === "high" ? "🔥 高频" : "题目"}</span><span class="tag">${esc(MOD[q.mod].name)}</span></div>
      </button></li>`).join("")}</ul>` : ""}
    `;
  }

  /* ================= 笔记 ================= */
  let noteSearch = "";
  function renderNotes(path) {
    if (path) return renderNoteDetail(decodeURIComponent(path));
    const dirs = [...new Set(NOTES.map((n) => n.d))];
    const list = NOTES.filter((n) => !noteSearch || n.t.toLowerCase().includes(noteSearch.toLowerCase()) || n.p.toLowerCase().includes(noteSearch.toLowerCase()));
    $("#view-notes").innerHTML = `
      <div class="hero">
        <div class="kicker">两个知识库合一</div>
        <h1>笔记库</h1>
        <p>技术线 ${IDX.meta.byVault.A} 篇 + 访谈线 ${IDX.meta.byVault.B} 篇，共 <b>${NOTES.length}</b> 篇。双链可点，读完随手标记。</p>
      </div>
      <input class="search" id="note-search" placeholder="🔍 搜标题 / 路径（如 RAG、MCP、Dario）" value="${esc(noteSearch)}">
      <div class="chips" style="margin-top:12px">
        <button class="chip ${!noteSearch ? "on" : ""}" data-q="">全部 ${NOTES.length}</button>
        ${dirs.map((d) => `<button class="chip" data-q="${esc(d)}">${esc(dirLabel(d))} ${NOTES.filter((n) => n.d === d).length}</button>`).join("")}
      </div>
      <ul class="note-list">${list.slice(0, 300).map((n) => `<li><button data-note="${esc(n.p)}">
        ${S.seen[n.p] ? '<span class="seen">✓ </span>' : ""}${esc(n.t)}
        <span class="np">${esc(n.p)} · ${n.m} 分钟</span>
      </button></li>`).join("")}</ul>
      ${list.length > 300 ? '<div class="muted center" style="margin-top:12px">只显示前 300 条，用搜索缩小范围</div>' : ""}
      ${!list.length ? '<div class="card empty"><i>🗂</i>没有匹配的笔记</div>' : ""}
    `;
    const si = $("#note-search");
    si.addEventListener("input", () => {
      noteSearch = si.value;
      clearTimeout(si._t);
      si._t = setTimeout(() => { renderNotes(); const el = $("#note-search"); el.focus(); el.setSelectionRange(el.value.length, el.value.length); }, 220);
    });
    $$("#view-notes .chip").forEach((c) => (c.onclick = () => { noteSearch = c.dataset.q || ""; renderNotes(); }));
  }

  async function renderNoteDetail(path) {
    const n = NOTE_BY_PATH[path];
    const host = $("#view-notes");
    if (!n) { host.innerHTML = `<div class="crumb" data-go="#/notes">‹ 笔记库</div><div class="card">找不到这篇：${esc(path)}</div>`; return; }
    host.innerHTML = `<div class="crumb" data-go="#/notes">‹ 笔记库</div><div class="loading">正在加载…</div>`;
    const body = await getBody(path);
    S.seen[path] = Date.now(); touchStreak(); save();

    const relatedQ = BANK.questions.filter((q) => (q.rel || []).includes(path));
    const back = NOTES.filter((x) => (x.l || []).some((l) => resolveNote(l) === path)).slice(0, 12);
    const iv = IVLIB.items.find((i) => i.note === path);

    host.innerHTML = `
      <div class="crumb" data-go="#/notes">‹ 笔记库</div>
      <div class="tag-row" style="margin-bottom:12px">
        <span class="tag">${n.v === "B" ? "▶ 访谈库" : "▤ 知识库"}</span>
        <span class="tag">${n.m} 分钟</span>
        ${(n.g || []).slice(0, 4).map((t) => `<span class="tag">#${esc(t)}</span>`).join("")}
      </div>
      <div class="article">${MD.render(body)}</div>
      ${iv ? `<div class="sec">▶ 这场访谈</div><div class="card"><button class="btn primary block" data-go="#/ivd/${iv.id}">查看访谈卡片 · ${esc(iv.guest)} →</button></div>` : ""}
      ${relatedQ.length ? `<div class="sec">🎤 相关面试题 ${relatedQ.length}</div>
      <ul class="qlist">${relatedQ.map((q) => `<li><button class="qitem" data-go="#/q/${q.id}"><div class="qt">${esc(q.q)}</div><div class="qm"><span class="tag ${q.freq === "high" ? "hot" : ""}">${q.freq === "high" ? "🔥 高频" : "题目"}</span><span class="tag">${esc(MOD[q.mod].name)}</span></div></button></li>`).join("")}</ul>` : ""}
      ${back.length ? `<div class="sec">🔗 反向链接 ${back.length}</div><div class="note-links">${back.map((b) => `<button class="btn sm" data-note="${esc(b.p)}">${esc(shortName(b.p))}</button>`).join("")}</div>` : ""}
      <div class="btn-row" style="margin-top:16px">
        <button class="btn" id="jump-top">↑ 回到顶部</button>
        <button class="btn ghost" data-go="#/notes">返回列表</button>
      </div>
    `;
    const jt = $("#jump-top");
    if (jt) jt.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ================= 我的 ================= */
  function renderMe() {
    const tp = treeProgress(), bp = bankProgress(), due = dueList().length;
    let answers = 0;
    BANK.questions.forEach((q) => { if (S.q[q.id]) answers += S.q[q.id].n || 0; });
    const mods = BANK.modules.map((m) => ({ m, s: masteryOf(m.id) })).filter((x) => x.s.total);
    const notesList = Object.keys(S.text).filter((k) => S.text[k]);
    const readNotes = Object.keys(S.seen).length;
    const ivDone = IVLIB.items.filter((i) => i.note).length;

    $("#view-me").innerHTML = `
      <div class="hero">
        <div class="hero-top">
          <div style="flex:1;min-width:0">
            <div class="kicker">学习档案</div>
            <h1>我的进度</h1>
            <p>数据只存在这台设备。换设备/换浏览器前先导出存档。</p>
          </div>
          ${RING(clamp((S.streak.days || 0) * 5, 0, 100), "连击")}
        </div>
        <div class="hero-stats">
          <div class="hstat"><b>${S.streak.days || 0}</b><span>🔥 连续天数</span></div>
          <div class="hstat"><b>${answers}</b><span>累计自评次数</span></div>
          <div class="hstat"><b>${due}</b><span>今日到期</span></div>
        </div>
      </div>

      <div class="grid2">
        <div class="kpi"><b>${tp.read}/${tp.total}</b><span>知识树节点已深读</span></div>
        <div class="kpi"><b>${bp.done}/${bp.total}</b><span>精讲题已练过</span></div>
        <div class="kpi"><b>${readNotes}</b><span>读过的笔记</span></div>
        <div class="kpi"><b>${ivDone}</b><span>可读的访谈笔记</span></div>
      </div>

      <div class="sec">⏰ 复习队列</div>
      <div class="card">
        <div class="kv"><span>今天到期</span><b>${due} 题</b></div>
        <div class="kv"><span>已进入排期</span><b>${Object.keys(S.q).length} 题</b></div>
        ${due ? `<button class="btn primary block" style="margin-top:12px" data-go="#/q/${dueList()[0].id}">开始复习 →</button>` : '<div class="muted" style="margin-top:10px">暂无到期。做过的题会按 6 小时 / 1 / 3 / 7 / 15 / 30 天自动回来。</div>'}
      </div>

      <div class="sec">📉 模块掌握度</div>
      <div class="card">
        ${mods.length ? mods.sort((a, b) => a.s.pct - b.s.pct).map((x) => `<div class="radar-row">
          <span class="rn">${x.m.icon} ${esc(x.m.name)}</span>
          <div class="meter"><i class="${x.s.pct < 34 ? "bad" : x.s.pct < 67 ? "warn" : "ok"}" style="width:${x.s.pct}%"></i></div>
          <span class="rv">${x.s.pct}%</span></div>`).join("")
        : '<div class="empty" style="padding:14px 4px"><i>📡</i>还没有数据。去题库练几道，这里会长出你的弱项雷达。</div>'}
      </div>

      <div class="sec">✍️ 我写的理解 ${notesList.length}</div>
      <div class="card">
        ${notesList.length ? notesList.map((k) => {
          const label = k.startsWith("q_") ? (QBYID[k.slice(2)] ? QBYID[k.slice(2)].q : k) : k;
          return `<div class="kv" style="display:block"><div style="color:var(--tx3);font-size:12.4px">${esc(String(label).slice(0, 70))}</div><div style="margin-top:4px">${esc(S.text[k])}</div></div>`;
        }).join("") : '<div class="empty" style="padding:14px 4px"><i>✍️</i>还没有。做题时点「写下我自己的理解」，用自己的话讲一遍——这就是费曼检验。</div>'}
      </div>

      <div class="sec">⚙️ 设置与存档</div>
      <div class="card">
        <div class="btn-row">
          <button class="btn" id="theme-btn">${S.theme === "light" ? "🌙 切到深色" : "☀️ 切到浅色"}</button>
          <button class="btn" id="exp">📤 导出存档</button>
          <button class="btn" id="imp">📥 导入存档</button>
        </div>
        <button class="btn ghost block" id="reset" style="margin-top:9px">🧹 清空进度</button>
        <div class="muted" style="margin-top:11px">共 ${BANK.questions.length} 精讲题 + ${MEDIA.meta.total} 媒体题 / ${tp.total} 个知识树节点 / ${IVLIB.items.length} 场访谈。存档为 JSON，可复制到手机浏览器粘贴导入。</div>
      </div>

      <div class="sec">🔗 其它学习站</div>
      <div class="rows">
        <a class="row" href="../study/index.html"><span class="row-i">📖</span><span class="row-b"><span class="row-t">学习站</span><span class="row-m">全库笔记网页阅读，双链可点、可搜索</span></span><span class="row-x">›</span></a>
        <a class="row" href="../practice/index.html"><span class="row-i">🏝️</span><span class="row-b"><span class="row-t">AI 冒险岛</span><span class="row-m">Python 练习场：浏览器里跑真实 Python</span></span><span class="row-x">›</span></a>
        <a class="row" href="../feynman/index.html"><span class="row-i">🎓</span><span class="row-b"><span class="row-t">费曼学检场</span><span class="row-m">盲讲 → 找差 → 简讲 → 出关，自动排复习</span></span><span class="row-x">›</span></a>
      </div>

      <div class="sec">ℹ️ 数据说明</div>
      <div class="card muted">
        内容来自两个知识库：<b style="color:var(--tx)">技术线</b>（Python / RAG / Agent / 全栈）+ <b style="color:var(--tx)">访谈线</b>（Dario Amodei、Kevin Weil、Mike Krieger、Boris Cherny、Cat Wu、Natalie Meurer、Dianne Penn、Tara Seshan…）。
        精讲题库的「访谈证据」中，标<b style="color:var(--amber)">原话</b>的可回原文核对，标<b style="color:var(--tx2)">转述</b>的是二手表述；媒体题库来自公开面经聚合，答案框架多为来源方整理，<b style="color:var(--tx)">不是官方标准答案</b>，每条都附原始链接。
        <div style="margin-top:10px">版本 <b style="color:var(--teal)">${esc(APP_VERSION)}</b> · 题库生成：${esc(BANK.generated)} · 笔记快照：${esc(IDX.meta.generatedAt)} · 访谈库：${esc(IVLIB.generated)}</div>
      </div>
    `;
    $("#theme-btn").onclick = () => { toggleTheme(); renderMe(); };
    $("#exp").onclick = exportSave;
    $("#imp").onclick = importSave;
    $("#reset").onclick = () => { if (confirm("确定清空全部进度？（知识树已读、题目排期、我写的理解都会删除）")) { const th = S.theme; S = BLANK(); S.theme = th; save(true); toast("已清空"); route(); } };
  }

  function exportSave() {
    const txt = JSON.stringify(S);
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(txt).then(() => toast("已复制到剪贴板，粘贴到手机即可导入"), () => { prompt("复制下面全部内容保存：", txt); });
    } else prompt("复制下面全部内容保存：", txt);
  }
  function importSave() {
    const v = prompt("粘贴之前导出的存档内容：", "");
    if (!v) return;
    try {
      const obj = JSON.parse(v.trim());
      if (typeof obj !== "object" || !obj.v) throw new Error("bad");
      S = Object.assign(BLANK(), obj);
      applyTheme(); save(true); toast("导入成功"); route();
    } catch (e) { toast("导入失败：不是合法的存档"); }
  }

  /* ================= 全局事件 ================= */
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-go],[data-note],[data-read],[data-mynote]");
    if (!t) return;
    if (t.dataset.go) { go(t.dataset.go); return; }
    if (t.dataset.note) { go("#/note/" + encodeURIComponent(t.dataset.note)); return; }
    if (t.dataset.read) {
      const id = t.dataset.read;
      if (!S.nodes[id]) S.nodes[id] = {};
      S.nodes[id].read = !S.nodes[id].read;
      if (S.nodes[id].read) touchStreak();
      save(); renderTree(); paintTop();
      toast(S.nodes[id].read ? "已标记深读 ✓" : "已取消");
      return;
    }
    if (t.dataset.mynote) askMyNote("n_" + t.dataset.mynote, "我对这个节点的理解");
  });
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a.wl");
    if (!a) return;
    e.preventDefault();
    const p = resolveNote(a.dataset.note);
    if (p) go("#/note/" + encodeURIComponent(p));
    else toast("本地没有这篇笔记：「" + a.dataset.note + "」");
  });

  /* ================= 启动 ================= */
  function boot() {
    if (!IDX || !BANK || !TREE) {
      document.body.innerHTML = '<div style="padding:40px;font-family:sans-serif;color:#eee">数据未加载：请先运行 <code>node tools/build-interview.mjs</code> 生成 interview/data/。</div>';
      return;
    }
    $("#tabbar").innerHTML = TABS.map((t) => `<button data-tab="${t.id}" data-go="#/${t.id}">
      <i>${t.icon}</i><span>${t.label}</span>
      ${t.id === "bank" ? '<span class="badge" id="tab-bank-badge" style="display:none"></span>' : ""}
    </button>`).join("");
    const tb = $("#btn-theme");
    if (tb) tb.onclick = toggleTheme;

    window.addEventListener("hashchange", route);
    load();
    applyTheme();
    route();

    // Service Worker：网络优先策略；新版本接管后自动刷新一次
    if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
      const hadController = !!navigator.serviceWorker.controller;
      navigator.serviceWorker.register("sw.js").catch(() => {});
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!hadController || window.__swRefreshed) return;
        window.__swRefreshed = true;
        toast("已更新到最新版，正在刷新…");
        setTimeout(() => location.reload(), 800);
      });
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
