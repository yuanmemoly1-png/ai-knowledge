// ============================================================
// AI 面试深度站 —— 应用逻辑
// 十个模块：状态 / 路由 / 今日 / 知识树 / 题库 / 题目深钻 / 笔记 / 我的 / 间隔重复 / 存档
// ============================================================
(function () {
  "use strict";

  /* ---------------- 基础工具 ---------------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"]/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])
    );
  const DAY = 864e5;
  const todayStr = () => new Date().toLocaleDateString("sv");

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
  const BLANK = () => ({
    v: 1,
    q: {},        // 题目进度
    nodes: {},    // 知识树节点：{read:bool, note:string}
    seen: {},     // 读过的笔记
    text: {},     // 自由笔记（题目/节点）
    streak: { last: "", days: 0 },
    bank: {},     // 快速自测统计
  });
  let S = BLANK();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) S = Object.assign(BLANK(), JSON.parse(raw));
    } catch (e) {
      console.warn("存档读取失败", e);
    }
  }
  let saveTimer = null;
  function save(now) {
    const doIt = () => {
      try {
        localStorage.setItem(KEY, JSON.stringify(S));
      } catch (e) {
        toast("存档失败：浏览器存储已满");
      }
    };
    if (now) return doIt();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(doIt, 350);
  }

  // 学习连击
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
  const MEDIA = window.MEDIA_BANK || { meta: { total: 0 }, items: [] };
  const QUOTES = window.QUOTE_BANK || [];

  const NOTES = IDX ? IDX.notes : [];
  const NOTE_BY_PATH = {};
  NOTES.forEach((n) => (NOTE_BY_PATH[n.p] = n));

  const QBYID = {};
  BANK.questions.forEach((q) => (QBYID[q.id] = q));
  const ROLE = {};
  BANK.roles.forEach((r) => (ROLE[r.id] = r));
  const MOD = {};
  BANK.modules.forEach((m) => (MOD[m.id] = m));

  const chunksLoaded = {};
  const chunksLoading = {};
  function loadChunk(id) {
    if (window.NOTES_CHUNK && window.NOTES_CHUNK[id]) {
      chunksLoaded[id] = true;
      return Promise.resolve();
    }
    if (chunksLoading[id]) return chunksLoading[id];
    chunksLoading[id] = new Promise((res) => {
      const s = document.createElement("script");
      s.src = "data/notes-" + id + ".js";
      s.onload = () => {
        chunksLoaded[id] = true;
        res();
      };
      s.onerror = () => {
        toast("模块加载失败：" + id);
        res();
      };
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

  /* ---------------- 间隔重复 ---------------- */
  const INTERVALS = [0.25, 1, 3, 7, 15, 30]; // 天；索引 = box
  function qState(id) {
    if (!S.q[id]) S.q[id] = { box: 0, last: 0, next: 0, n: 0, hist: [] };
    return S.q[id];
  }
  function rate(id, kind) {
    const st = qState(id);
    st.n++;
    st.last = Date.now();
    if (kind === "no") st.box = 0;
    else if (kind === "half") st.box = Math.max(1, st.box);
    else st.box = Math.min(5, st.box + 1);
    st.next = Date.now() + INTERVALS[st.box] * DAY;
    st.hist.push({ t: Date.now(), k: kind });
    if (st.hist.length > 40) st.hist.shift();
    touchStreak();
    save();
  }
  function dueList() {
    const now = Date.now();
    return BANK.questions.filter((q) => {
      const st = S.q[q.id];
      return st && st.next && st.next <= now;
    });
  }
  function masteryOf(modId) {
    const qs = BANK.questions.filter((q) => q.mod === modId);
    if (!qs.length) return { pct: 0, done: 0, total: 0 };
    let sum = 0, done = 0;
    qs.forEach((q) => {
      const st = S.q[q.id];
      if (st) {
        sum += (st.box || 0) / 5;
        if (st.n > 0) done++;
      }
    });
    return { pct: Math.round((sum / qs.length) * 100), done, total: qs.length };
  }

  /* ---------------- 路由 ---------------- */
  const TABS = [
    { id: "today", icon: "🎯", label: "今日" },
    { id: "tree", icon: "🗺️", label: "知识树" },
    { id: "bank", icon: "🎤", label: "题库" },
    { id: "notes", icon: "📖", label: "笔记" },
    { id: "me", icon: "📊", label: "我的" },
  ];

  let curTab = "today";
  function go(hash) {
    location.hash = hash;
  }
  function parse() {
    const raw = (location.hash || "#/today").replace(/^#\/?/, "").split("?")[0];
    const [seg, ...rest] = raw.split("/");
    return { seg: seg || "today", rest };
  }
  async function route() {
    const { seg, rest } = parse();
    // 片段 -> 底部标签 的映射（详情页归属于某个 tab）
    const MAP = { today: "today", tree: "tree", bank: "bank", notes: "notes", me: "me",
                  q: "bank", mq: "bank", note: "notes" };
    const tab = MAP[seg] || "today";
    curTab = tab;
    $$("#tabbar button").forEach((b) => b.classList.toggle("on", b.dataset.tab === tab));
    $$(".view").forEach((v) => v.classList.remove("on"));
    $("#view-" + tab).classList.add("on");
    window.scrollTo(0, 0);

    if (seg === "q") renderQuestion(rest[0]);
    else if (seg === "mq") renderMediaQuestion(rest[0]);
    else if (seg === "note") renderNotes(rest.join("/"));
    else if (tab === "today") renderToday();
    else if (tab === "tree") renderTree(rest[0]);
    else if (tab === "bank") renderBank(rest[0], rest[1]);
    else if (tab === "notes") renderNotes();
    else if (tab === "me") renderMe();

    paintTop();
  }

  function paintTop() {
    const due = dueList().length;
    const b = $("#top-streak");
    if (b) b.innerHTML = `🔥 <b>${S.streak.days || 0}</b> 天`;
    const badge = $("#tab-bank-badge");
    if (badge) {
      if (due > 0) { badge.textContent = due > 99 ? "99+" : due; badge.style.display = ""; }
      else badge.style.display = "none";
    }
  }

  /* ---------------- 视图：今日 ---------------- */
  function nextTreeNodes(n) {
    const out = [];
    for (const L of TREE.layers) {
      for (const nd of L.nodes) {
        if (out.length >= n) return out;
        if (!(S.nodes[nd.id] && S.nodes[nd.id].read)) out.push({ layer: L, node: nd });
      }
    }
    return out;
  }
  function treeProgress() {
    let total = 0, read = 0;
    TREE.layers.forEach((L) =>
      L.nodes.forEach((nd) => {
        total++;
        if (S.nodes[nd.id] && S.nodes[nd.id].read) read++;
      })
    );
    return { total, read, pct: total ? Math.round((read / total) * 100) : 0 };
  }
  function bankProgress() {
    let done = 0;
    BANK.questions.forEach((q) => {
      if (S.q[q.id] && S.q[q.id].n > 0) done++;
    });
    return { done, total: BANK.questions.length };
  }

  function renderToday() {
    const tp = treeProgress();
    const bp = bankProgress();
    const due = dueList();
    const todo = nextTreeNodes(3);

    // 弱项
    const mods = BANK.modules
      .map((m) => ({ m, s: masteryOf(m.id) }))
      .filter((x) => x.s.total > 0)
      .sort((a, b) => a.s.pct - b.s.pct)
      .slice(0, 3);

    const html = `
      <div class="hero">
        <h1>🎯 今日深读</h1>
        <p>先深读一个节点，再用「盲答 → 追问 → 证据」的形式钻一道题。不求多，求真的会。</p>
        <div class="meter-row" style="margin-top:12px">
          <span style="min-width:74px;text-align:left">知识树 ${tp.read}/${tp.total}</span>
          <div class="meter"><i style="width:${tp.pct}%"></i></div>
          <span>${tp.pct}%</span>
        </div>
      </div>

      ${
        due.length
          ? `<div class="sec-title">⏰ 到期复习（${due.length}）</div>
             <button class="card tap" data-go="#/q/${due[0].id}">
               <div class="tag-row"><span class="tag due">今天该复习</span><span class="tag">${esc(MOD[due[0].mod].name)}</span></div>
               <div style="font-size:15.5px;line-height:1.6">${esc(due[0].q)}</div>
               <div class="muted" style="margin-top:8px">还有 ${due.length - 1} 道到期 → 点开开始</div>
             </button>`
          : `<div class="sec-title">⏰ 到期复习</div>
             <div class="card muted">今天没有到期题目。到期队列按 6小时 / 1 / 3 / 7 / 15 / 30 天自动排期。</div>`
      }

      <div class="sec-title">📚 往前推进一步</div>
      ${todo
        .map(
          (x) => `
        <button class="card tap" data-go="#/tree/${x.layer.id}">
          <div class="tag-row">
            <span class="tag mid">${esc(x.layer.no)} · ${esc(x.layer.title)}</span>
            <span class="tag">${esc(x.node.id)}</span>
          </div>
          <div style="font-size:15.5px;font-weight:650;line-height:1.55">${esc(x.node.t)}</div>
          <div class="muted" style="margin-top:6px">${esc(x.node.claim)}</div>
        </button>`
        )
        .join("")}

      <div class="sec-title">🎤 练一道题</div>
      <div class="btn-row">
        <button class="btn primary" id="btn-random-q">🎲 随机抽一题</button>
        <button class="btn" id="btn-mock">⏱️ 模拟面试（5 题）</button>
      </div>

      <div class="sec-title">📉 最需要补的模块</div>
      ${
        mods.length
          ? mods
              .map(
                (x) => `
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
            <b>${esc(x.m.icon)} ${esc(x.m.name)}</b>
            <span class="muted">${x.s.done}/${x.s.total}</span>
          </div>
          <div class="meter-row"><div class="meter"><i class="bar-fill-${
            x.s.pct < 34 ? "bad" : x.s.pct < 67 ? "warn" : "ok"
          }" style="width:${x.s.pct}%"></i></div><span>掌握 ${x.s.pct}%</span></div>
          <button class="btn sm block" data-go="#/bank/${""}/${x.m.id}">去练这个模块</button>
        </div>`
              )
              .join("")
          : `<div class="card muted">还没有练习记录。先随机抽一题，自评之后这里会出现你的弱项雷达。</div>`
      }

      <div class="sec-title">💬 今日金句</div>
      <div class="card">${quoteHTML(QUOTES[Math.floor(Math.random() * QUOTES.length)])}</div>
    `;
    $("#view-today").innerHTML = html;

    const rq = $("#btn-random-q");
    if (rq)
      rq.onclick = () => {
        const q = BANK.questions[Math.floor(Math.random() * BANK.questions.length)];
        go("#/q/" + q.id);
      };
    const mk = $("#btn-mock");
    if (mk) mk.onclick = () => go("#/bank?mock=1");
  }

  function quoteHTML(q) {
    if (!q) return "";
    return `<div class="ev" style="margin:0;border-left-color:var(--purple);background:#1a1726">
      <div class="zh">「${esc(q.zh)}」</div>
      ${q.en ? `<div class="en">“${esc(q.en)}”</div>` : ""}
      <div class="by">— ${esc(q.by)}${q.exact ? "" : "（转述）"}${
      q.url ? ` · <a href="${esc(q.url)}" target="_blank" rel="noopener">来源</a>` : ""
    }</div></div>`;
  }

  /* ---------------- 视图：知识树 ---------------- */
  function renderTree(openLayer) {
    const html = `
      <div class="hero">
        <h1>🗺️ ${esc(TREE.title)}</h1>
        <p>${esc(TREE.subtitle)}</p>
      </div>
      ${TREE.layers
        .map(
          (L) => `
        <details class="layer" ${openLayer === L.id || (!openLayer && L.id === "L0") ? "open" : ""}>
          <summary>
            <span class="no">${esc(L.no)}</span>
            <span class="lt">${esc(L.title)}<div class="q">${esc(L.question)} → ${esc(L.answer)}</div></span>
            <span class="arrow">›</span>
          </summary>
          <div class="layer-body">
            <p class="muted" style="margin:10px 0 2px">${esc(L.intro)}</p>
            ${L.nodes.map((nd) => nodeHTML(nd)).join("")}
          </div>
        </details>`
        )
        .join("")}
    `;
    $("#view-tree").innerHTML = html;
  }

  function nodeHTML(nd) {
    const st = S.nodes[nd.id] || {};
    return `
    <div class="node" id="node-${esc(nd.id)}">
      <div class="tag-row">
        <span class="tag">${esc(nd.id)}</span>
        ${st.read ? '<span class="tag done">✓ 已深读</span>' : ""}
      </div>
      <h4>${esc(nd.t)}</h4>
      <div class="claim">${esc(nd.claim)}</div>
      <ul>${nd.points.map((p) => `<li>${MD.inline(p)}</li>`).join("")}</ul>
      ${nd.ev && nd.ev.length ? nd.ev.map((e) => evHTML(e)).join("") : ""}
      ${
        nd.notes && nd.notes.length
          ? `<div class="note-links">${nd.notes
              .filter((p) => NOTE_BY_PATH[p])
              .map((p) => `<button class="btn sm" data-note="${esc(p)}">📖 深读：${esc(shortName(p))}</button>`)
              .join("")}</div>`
          : ""
      }
      ${
        st.note
          ? `<div class="practice" style="margin-top:10px">我的笔记：${esc(st.note)}</div>`
          : ""
      }
      <div class="btn-row" style="margin-top:10px">
        <button class="btn sm ${st.read ? "ghost" : "ok"}" data-read="${esc(nd.id)}">${
      st.read ? "取消已读" : "✓ 标记已深读"
    }</button>
        <button class="btn sm" data-mynote="${esc(nd.id)}">✍️ 写一句自己的话</button>
      </div>
    </div>`;
  }

  function shortName(p) {
    const n = NOTE_BY_PATH[p];
    return n ? n.t.replace(/^[^\p{L}\p{N}]*/u, "").slice(0, 18) : p;
  }
  function evHTML(e) {
    return `<div class="ev">
      <div class="zh">「${esc(e.zh)}」</div>
      ${e.en ? `<div class="en">“${esc(e.en)}”</div>` : ""}
      <div class="by">— ${esc(e.src)}${e.url ? ` · <a href="${esc(e.url)}" target="_blank" rel="noopener">原始来源</a>` : ""}</div>
    </div>`;
  }

  /* ---------------- 视图：题库 ---------------- */
  let bankFilter = { role: "", mod: "" };
  function renderBank(roleArg, modArg) {
    const params = new URLSearchParams((location.hash.split("?")[1] || ""));
    // 模拟面试入口
    if (params.get("mock") === "1") {
      startMock(bankFilter.role);
      return;
    }
    // 媒体题库
    if (params.get("src") === "media") {
      if (params.get("r")) bankMediaFilter.role = params.get("r");
      renderMediaBank();
      return;
    }

    if (roleArg !== undefined && roleArg !== "") bankFilter.role = roleArg;
    if (modArg !== undefined && modArg !== "") bankFilter.mod = modArg;

    let list = BANK.questions.slice();
    if (bankFilter.role) list = list.filter((q) => q.role === bankFilter.role);
    if (bankFilter.mod) list = list.filter((q) => q.mod === bankFilter.mod);

    const F = { high: "🔥 高频", mid: "◻️ 常规", low: "· 长尾" };
    const html = `
      <div class="hero">
        <h1>🎤 面试题库</h1>
        <p>共 <b>${BANK.questions.length + MEDIA.meta.total}</b> 题，分两层：<b>深度精讲</b>（逐题配追问链 + 答题框架 + 访谈证据）与 <b>媒体题库</b>（从牛客/掘金/Exponent/iGotAnOffer 等公开面经收集）。</p>
      </div>

      <div class="btn-row" style="margin-bottom:12px">
        <button class="btn primary" id="seg-deep">📕 深度精讲 ${BANK.questions.length}</button>
        <button class="btn ghost" id="seg-media">📰 媒体题库 ${MEDIA.meta.total}</button>
      </div>

      <div class="filters">
        <button class="chip ${!bankFilter.role ? "on" : ""}" data-fr="">全部岗位</button>
        ${BANK.roles.map((r) => `<button class="chip ${bankFilter.role === r.id ? "on" : ""}" data-fr="${r.id}">${r.icon} ${esc(r.name)}</button>`).join("")}
      </div>
      <div class="filters">
        <button class="chip ${!bankFilter.mod ? "on" : ""}" data-fm="">全部模块</button>
        ${BANK.modules
          .filter((m) => !bankFilter.role || m.roles.includes(bankFilter.role))
          .map((m) => `<button class="chip ${bankFilter.mod === m.id ? "on" : ""}" data-fm="${m.id}">${m.icon} ${esc(m.name)}</button>`)
          .join("")}
      </div>

      <div class="btn-row" style="margin-bottom:10px">
        <button class="btn primary" id="mock2">⏱️ 模拟面试（5 题）</button>
        <button class="btn" id="rand2">🎲 随机一题</button>
      </div>

      <div class="muted" style="margin-bottom:8px">当前 ${list.length} 题</div>
      <ul class="qlist">
        ${list
          .map((q) => {
            const st = S.q[q.id];
            const done = st && st.n > 0;
            const box = st ? st.box : 0;
            return `<li>
              <button class="qitem" data-go="#/q/${q.id}">
                <div class="qt">${esc(q.q)}</div>
                <div class="qm">
                  <span class="tag ${q.freq === "high" ? "hot" : q.freq === "mid" ? "mid" : ""}">${F[q.freq] || ""}</span>
                  <span class="tag">${esc(MOD[q.mod].name)}</span>
                  ${done ? `<span class="tag done">Lv${box} 已练</span>` : '<span class="tag">未练</span>'}
                </div>
              </button></li>`;
          })
          .join("")}
      </ul>
      ${!list.length ? '<div class="card muted center">这个筛选下还没有题目。</div>' : ""}
    `;
    $("#view-bank").innerHTML = html;

    $$("#view-bank .chip").forEach((c) =>
      (c.onclick = () => {
        if (c.dataset.fr !== undefined) {
          bankFilter = { role: c.dataset.fr, mod: "" };
          go("#/bank");
        } else {
          bankFilter.mod = c.dataset.fm;
          go("#/bank");
        }
      })
    );
    const m2 = $("#mock2"); if (m2) m2.onclick = () => startMock(bankFilter.role);
    const r2 = $("#rand2");
    if (r2)
      r2.onclick = () => {
        const l = list.length ? list : BANK.questions;
        go("#/q/" + l[Math.floor(Math.random() * l.length)].id);
      };
    const sd = $("#seg-deep"); if (sd) sd.onclick = () => renderBank();
    const sm = $("#seg-media"); if (sm) sm.onclick = () => go("#/bank?src=media");
  }

  /* ---------------- 视图：媒体题库（广收集那 800+ 题） ---------------- */
  let bankMediaFilter = { role: "", kw: "" };
  const MEDIA_ROLE_SHORT = {
    "llm-algo": "🔬 算法",
    "agent-app": "🤖 应用/Agent",
    "llmops": "⚙️ LLMOps",
    "ai-pm": "📋 AI PM",
    "fde": "🛰️ FDE",
    "": "📎 其他",
  };
  function renderMediaBank() {
    const all = MEDIA.items;
    let list = all.slice();
    if (bankMediaFilter.role !== "") list = list.filter((i) => (i.role || "") === bankMediaFilter.role);
    if (bankMediaFilter.kw) {
      const kw = bankMediaFilter.kw.toLowerCase();
      list = list.filter(
        (i) =>
          (i.q || "").toLowerCase().includes(kw) ||
          (i.zh || "").toLowerCase().includes(kw) ||
          (i.mod || "").toLowerCase().includes(kw) ||
          (i.frame || "").toLowerCase().includes(kw)
      );
    }
    const counts = {};
    all.forEach((i) => { const k = i.role || ""; counts[k] = (counts[k] || 0) + 1; });
    const shown = list.slice(0, 200);

    $("#view-bank").innerHTML = `
      <div class="hero">
        <h1>📰 媒体题库</h1>
        <p>共 <b>${MEDIA.meta.total}</b> 题，收集自 ${MEDIA.meta.sources.map((s) => s.label + " " + s.count).join(" · ")}。每题都带来源链接，点开可看追问与参考答题框架。</p>
      </div>

      <div class="btn-row" style="margin-bottom:12px">
        <button class="btn ghost" id="seg-deep2">📕 深度精讲 ${BANK.questions.length}</button>
        <button class="btn primary" id="seg-media2">📰 媒体题库 ${MEDIA.meta.total}</button>
      </div>

      <input class="search" id="mq-search" placeholder="🔍 搜题目 / 中文 / 模块（如 RAG、evals、decomposition）" value="${esc(bankMediaFilter.kw)}">

      <div class="filters" style="margin-top:10px">
        <button class="chip ${bankMediaFilter.role === "" ? "on" : ""}" data-mr="">全部 ${all.length}</button>
        ${["llm-algo", "agent-app", "llmops", "ai-pm", "fde", ""]
          .filter((r) => counts[r])
          .map((r) => `<button class="chip ${bankMediaFilter.role === r ? "on" : ""}" data-mr="${r}">${MEDIA_ROLE_SHORT[r] || r} ${counts[r]}</button>`)
          .join("")}
      </div>

      <div class="muted" style="margin-bottom:8px">匹配 ${list.length} 题${list.length > 200 ? "（显示前 200，用搜索或筛选缩小）" : ""}</div>
      <ul class="qlist">
        ${shown
          .map((i) => {
            const st = S.q[i.id];
            return `<li><button class="qitem" data-go="#/mq/${i.id}">
              <div class="qt">${esc(i.q)}</div>
              <div class="qm">
                ${i.role ? `<span class="tag mid">${MEDIA_ROLE_SHORT[i.role]}</span>` : ""}
                <span class="tag">${esc(String(i.mod).slice(0, 18))}</span>
                ${i.freq ? `<span class="tag">${esc(i.freq)}</span>` : ""}
                ${st && st.n ? `<span class="tag done">已练 Lv${st.box}</span>` : ""}
              </div>
            </button></li>`;
          })
          .join("")}
      </ul>
      ${!list.length ? '<div class="card muted center">没有匹配的题目</div>' : ""}
    `;

    const sd = $("#seg-deep2"); if (sd) sd.onclick = () => go("#/bank");
    const sm = $("#seg-media2"); if (sm) sm.onclick = () => { bankMediaFilter = { role: "", kw: "" }; go("#/bank?src=media"); };
    const si = $("#mq-search");
    si.addEventListener("input", () => {
      bankMediaFilter.kw = si.value;
      clearTimeout(si._t);
      si._t = setTimeout(() => {
        renderMediaBank();
        const el = $("#mq-search");
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }, 240);
    });
    $$("#view-bank .chip").forEach((c) =>
      (c.onclick = () => { bankMediaFilter.role = c.dataset.mr; go("#/bank?src=media"); })
    );
  }

  function renderMediaQuestion(id) {
    const it = MEDIA.items.find((x) => x.id === id);
    if (!it) { go("#/bank?src=media"); return; }
    const st = qState(id);
    $("#view-bank").innerHTML = `
      <div class="crumb" data-go="#/bank?src=media">‹ 返回媒体题库</div>
      <div class="q-head">
        <div class="tag-row" style="margin:0">
          ${it.role ? `<span class="tag mid">${MEDIA_ROLE_SHORT[it.role]}</span>` : ""}
          <span class="tag">${esc(it.mod)}</span>
          <span class="tag">${esc(it.bank)}</span>
          ${st.n ? `<span class="tag done">已练 ${st.n} 次 · Lv${st.box}</span>` : ""}
        </div>
        <div class="qtext">${esc(it.q)}</div>
        ${it.zh ? `<div class="muted" style="margin-top:8px">${esc(it.zh)}</div>` : ""}
      </div>

      <div class="step">
        <div class="sh"><span class="idx">1</span> 先自己答一遍</div>
        <div class="sd">
          <textarea class="ans" id="ans-box" placeholder="关键词即可…">${esc(S.text["q_" + id] || "")}</textarea>
        </div>
      </div>

      ${
        it.probe
          ? `<div class="step"><div class="sh"><span class="idx">2</span> 面试官的追问</div>
             <div class="sd"><div class="probe"><div class="pq">${MD.inline(it.probe)}</div></div></div></div>`
          : ""
      }

      ${
        it.frame
          ? `<div class="step"><div class="sh"><span class="idx">3</span> 参考答题框架</div>
             <div class="sd"><div class="claim-big">${MD.inline(it.frame)}</div></div></div>`
          : ""
      }

      <div class="step selfrate">
        <div class="sh"><span class="idx">4</span> 自评 → 排进复习</div>
        <div class="sd">
          <div class="btn-row">
            <button class="btn bad" data-rate="no">😵 不会</button>
            <button class="btn half" data-rate="half">😐 半会</button>
            <button class="btn ok" data-rate="yes">😎 会了</button>
          </div>
          <button class="btn block ghost" id="my-free-note" style="margin-top:10px">✍️ 写下我自己的理解</button>
        </div>
      </div>

      <div class="card muted" style="margin-top:12px">
        来源：${esc(it.src || "（未标注）")}
        ${it.url ? `<br><a href="${esc(it.url)}" target="_blank" rel="noopener">打开原始链接 ↗</a>` : ""}
        <div style="margin-top:8px">媒体题库为公开面经收集，答案框架为来源方整理，请回原文核对后使用。</div>
      </div>
    `;

    const ta = $("#ans-box");
    ta.addEventListener("input", () => { S.text["q_" + id] = ta.value; save(); });
    $$("#view-bank [data-rate]").forEach((b) =>
      (b.onclick = () => {
        rate(id, b.dataset.rate);
        toast("已记录：" + ({ no: "不会", half: "半会", yes: "会了" }[b.dataset.rate]));
        paintTop();
        renderMe();
      })
    );
    const nf = $("#my-free-note");
    if (nf) nf.onclick = () => askMyNote("q_" + id, "我的理解（费曼）");
  }

  /* ---------------- 模拟面试 ---------------- */
  let mock = null;
  function startMock(role) {
    let pool = BANK.questions.slice();
    if (role) pool = pool.filter((q) => q.role === role);
    if (pool.length < 5) pool = BANK.questions.slice();
    const picked = [];
    const used = {};
    while (picked.length < 5 && picked.length < pool.length) {
      const i = Math.floor(Math.random() * pool.length);
      if (!used[pool[i].id]) { used[pool[i].id] = 1; picked.push(pool[i].id); }
    }
    mock = { ids: picked, i: 0, t0: Date.now() };
    go("#/q/" + picked[0]);
  }

  /* ---------------- 视图：题目深钻 ---------------- */
  function renderQuestion(id) {
    const q = QBYID[id];
    if (!q) { go("#/bank"); return; }
    const st = qState(id);
    const inMock = mock && mock.ids.includes(id);
    const step = inMock ? mock.ids.indexOf(id) + 1 : 0;

    // 已解锁的追问层数（用存档记录）
    const unlocked = (S.q[id].unlocked || 0);

    const html = `
      <div class="crumb" data-go="#/bank">‹ 返回题库${inMock ? ` · 模拟面试 ${step}/${mock.ids.length}` : ""}</div>

      <div class="q-head">
        <div class="tag-row" style="margin:0">
          <span class="tag ${q.freq === "high" ? "hot" : q.freq === "mid" ? "mid" : ""}">${
      q.freq === "high" ? "🔥 高频" : q.freq === "mid" ? "◻️ 常规" : "长尾"
    }</span>
          <span class="tag ${q.lv >= 3 ? "lv3" : ""}">深度 ${"●".repeat(q.lv)}${"○".repeat(3 - q.lv)}</span>
          <span class="tag">${esc(ROLE[q.role].icon)} ${esc(ROLE[q.role].name)}</span>
          <span class="tag">${esc(MOD[q.mod].name)}</span>
          ${st.n ? `<span class="tag done">已练 ${st.n} 次 · Lv${st.box}</span>` : ""}
        </div>
        <div class="qtext">${esc(q.q)}</div>
      </div>

      <!-- 第一步：盲答 -->
      <div class="step">
        <div class="sh"><span class="idx">1</span> 先别翻答案：用关键词答一遍</div>
        <div class="sd">
          <div class="muted" style="margin-bottom:8px">合上一切资料，先把你能想到的写下来（关键词即可）。这一步本身就是强化记忆的关键——主动回忆。</div>
          <textarea class="ans" id="ans-box" placeholder="我的答案 / 关键词…">${esc((S.text["q_" + id] || ""))}</textarea>
          <div class="btn-row" style="margin-top:9px">
            <button class="btn sm" id="timer-btn">⏱️ 开始计时</button>
            <button class="btn sm ghost" id="clear-ans">清空</button>
          </div>
        </div>
      </div>

      <!-- 第二步：参考框架 -->
      <div class="step">
        <div class="sh"><span class="idx">2</span> 对照参考框架</div>
        <div class="sd">
          <button class="btn primary block" id="reveal">👀 展开参考框架</button>
          <div id="frame-box" style="display:none">
            <div class="frameblk"><b>一句话结论（面试先说这句）</b><div class="claim-big">${MD.inline(q.frame.claim)}</div></div>
            <div class="frameblk"><b>为什么（分层展开）</b><ol>${q.frame.why.map((w) => `<li>${MD.inline(w)}</li>`).join("")}</ol></div>
            <div class="frameblk"><b>取舍 / Trade-off</b><div>${MD.inline(q.frame.tradeoff)}</div></div>
            ${q.frame.practice ? `<div class="practice">💡 项目落点：${MD.inline(q.frame.practice)}</div>` : ""}
            ${q.frame.pitfalls && q.frame.pitfalls.length ? `<div class="frameblk"><b>雷区（被点名会扣分）</b><ul class="pitfall">${q.frame.pitfalls.map((p) => `<li>${MD.inline(p)}</li>`).join("")}</ul></div>` : ""}
          </div>
        </div>
      </div>

      <!-- 第三步：追问链 -->
      ${
        q.probes && q.probes.length
          ? `<div class="step">
        <div class="sh"><span class="idx">3</span> 追问链（面试官会这样往下问）</div>
        <div class="sd">
          <div class="muted" style="margin-bottom:6px">共 ${q.probes.length} 层。每层先自己答，再点开下一层——模拟字节/小米那种打断式追问。</div>
          <div id="probes">${q.probes
            .map((p, i) => {
              const on = i < unlocked;
              return `<div class="probe" data-probe="${i}" style="${on ? "" : "display:none"}">
                <div class="pq">第 ${i + 1} 层：${MD.inline(p)}</div>
              </div>`;
            })
            .join("")}</div>
          <button class="btn block" id="next-probe" style="margin-top:10px">
            ${unlocked === 0 ? "开始追问（1/" + q.probes.length + "）" : unlocked >= q.probes.length ? "追问已全部解锁 ✓" : "下一层追问（" + (unlocked + 1) + "/" + q.probes.length + "）"}
          </button>
        </div>
      </div>`
          : ""
      }

      <!-- 第四步：证据 -->
      ${
        q.ev && q.ev.length
          ? `<div class="step">
        <div class="sh"><span class="idx">4</span> 访谈证据（引原话即加分）</div>
        <div class="sd">${q.ev.map((e) => evHTML(e)).join("")}</div>
      </div>`
          : ""
      }

      <!-- 第五步：深读 -->
      ${
        q.rel && q.rel.filter((p) => NOTE_BY_PATH[p]).length
          ? `<div class="step">
        <div class="sh"><span class="idx">5</span> 深读原文（答不出来的地方回去补）</div>
        <div class="sd"><div class="note-links">${q.rel
            .filter((p) => NOTE_BY_PATH[p])
            .map((p) => `<button class="btn sm" data-note="${esc(p)}">📖 ${esc(shortName(p))}</button>`)
            .join("")}</div>
          ${
            q.src && q.src.length
              ? `<div class="muted" style="margin-top:12px">题目出处：${q.src.map(esc).join(" · ")}</div>`
              : ""
          }
        </div>
      </div>`
          : ""
      }

      <!-- 第六步：自评 -->
      <div class="step selfrate">
        <div class="sh"><span class="idx">6</span> 自评 → 自动排复习</div>
        <div class="sd">
          <div class="muted">诚实打分。不会的会很快再来找你，会的会被拉长间隔。</div>
          <div class="btn-row">
            <button class="btn bad" data-rate="no">😵 不会（6 小时后）</button>
            <button class="btn half" data-rate="half">😐 半会（${INTERVALS[Math.max(1, st.box)]} 天后）</button>
            <button class="btn ok" data-rate="yes">😎 会了（${INTERVALS[Math.min(5, st.box + 1)]} 天后）</button>
          </div>
          <button class="btn block ghost" id="my-free-note" style="margin-top:10px">✍️ 写下我自己的理解（费曼）</button>
        </div>
      </div>

      ${inMock ? `<div class="btn-row" style="margin-top:14px"><button class="btn primary block" id="mock-next">${
        mock.i + 1 >= mock.ids.length ? "结束模拟面试" : "下一题（" + (mock.i + 2) + "/" + mock.ids.length + "）"
      }</button></div>` : ""}
    `;

    $("#view-bank").innerHTML = html;

    // ---- 交互 ----
    const ta = $("#ans-box");
    ta.addEventListener("input", () => {
      S.text["q_" + id] = ta.value;
      save();
    });

    let timerId = null, tLeft = 0;
    $("#timer-btn").onclick = (ev) => {
      if (timerId) {
        clearInterval(timerId); timerId = null;
        ev.target.textContent = "⏱️ 继续计时（" + tLeft + "s）";
        return;
      }
      if (!tLeft) tLeft = 120;
      ev.target.textContent = "⏱️ " + tLeft + "s（点一下暂停）";
      timerId = setInterval(() => {
        tLeft--;
        ev.target.textContent = "⏱️ " + tLeft + "s（点一下暂停）";
        if (tLeft <= 0) {
          clearInterval(timerId); timerId = null;
          ev.target.textContent = "⏱️ 时间到，看答案";
          toast("时间到——面试里这题该收尾了");
        }
      }, 1000);
    };
    $("#clear-ans").onclick = () => {
      ta.value = "";
      S.text["q_" + id] = "";
      save();
    };

    $("#reveal").onclick = () => {
      const fb = $("#frame-box");
      const show = fb.style.display === "none";
      fb.style.display = show ? "block" : "none";
      $("#reveal").textContent = show ? "🙈 收起参考框架" : "👀 展开参考框架";
      if (show) touchStreak(), save();
    };

    const np = $("#next-probe");
    if (np)
      np.onclick = () => {
        const cur = S.q[id].unlocked || 0;
        if (cur >= q.probes.length) { toast("追问已全部展开"); return; }
        const nxt = cur + 1;
        S.q[id].unlocked = nxt;
        const pe = $(`#probes [data-probe="${nxt - 1}"]`);
        if (pe) pe.style.display = "";
        np.textContent =
          nxt >= q.probes.length
            ? "追问已全部解锁 ✓"
            : `下一层追问（${nxt + 1}/${q.probes.length}）`;
        touchStreak();
        save();
      };

    $$("#view-bank [data-rate]").forEach((b) =>
      (b.onclick = () => {
        rate(id, b.dataset.rate);
        const label = { no: "不会", half: "半会", yes: "会了" }[b.dataset.rate];
        toast("已记录：" + label);
        paintTop();
        if (inMock) {
          setTimeout(() => nextMock(), 400);
        } else {
          const st2 = qState(id);
          const d = INTERVALS[st2.box];
          toast(`已记录 · 下次复习：${d < 1 ? "6 小时后" : d + " 天后"}`);
        }
      })
    );

    const nf = $("#my-free-note");
    if (nf) nf.onclick = () => askMyNote("q_" + id, "我的理解（费曼）");

    const mn = $("#mock-next");
    if (mn) mn.onclick = () => nextMock();
  }

  function nextMock() {
    if (!mock) { go("#/bank"); return; }
    if (mock.i + 1 >= mock.ids.length) {
      const mins = Math.round((Date.now() - mock.t0) / 60000);
      toast(`模拟面试结束，用时约 ${mins} 分钟`);
      mock = null;
      go("#/me");
      return;
    }
    mock.i++;
    go("#/q/" + mock.ids[mock.i]);
  }

  function askMyNote(key, title) {
    const cur = S.text[key] || "";
    const v = prompt(title + "（只存在你这台设备上）", cur);
    if (v === null) return;
    S.text[key] = v;
    if (!S.text[key]) delete S.text[key];
    touchStreak();
    save(true);
    toast("已保存");
    route();
  }

  /* ---------------- 视图：笔记 ---------------- */
  let noteSearch = "";
  function renderNotes(path) {
    if (path) return renderNoteDetail(decodeURIComponent(path));

    const dirs = [...new Set(NOTES.map((n) => n.d))];
    const list = NOTES.filter((n) => !noteSearch || n.t.toLowerCase().includes(noteSearch.toLowerCase()) || n.p.toLowerCase().includes(noteSearch.toLowerCase()));
    const html = `
      <div class="hero">
        <h1>📖 笔记库</h1>
        <p>两个知识库共 <b>${NOTES.length}</b> 篇：技术线 ${IDX.meta.byVault.A} 篇 + 访谈线 ${IDX.meta.byVault.B} 篇。双链可点，读完随手标记。</p>
      </div>
      <input class="search" id="note-search" placeholder="🔍 搜标题 / 路径（如 RAG、MCP、Dario）" value="${esc(noteSearch)}">
      <div class="filters" style="margin-top:10px">
        <button class="chip ${!noteSearch ? "on" : ""}" data-dir="">全部（${NOTES.length}）</button>
        ${dirs
          .map((d) => {
            const c = NOTES.filter((n) => n.d === d).length;
            return `<button class="chip" data-q="${esc(d)}">${esc(dirLabel(d))} ${c}</button>`;
          })
          .join("")}
      </div>
      <ul class="note-list">
        ${list
          .slice(0, 300)
          .map(
            (n) => `<li><button data-note="${esc(n.p)}">
              ${S.seen[n.p] ? '<span class="seen">✓</span> ' : ""}${esc(n.t)}
              <span class="np">${esc(n.p)} · ${n.m} 分钟</span>
            </button></li>`
          )
          .join("")}
      </ul>
      ${list.length > 300 ? '<div class="muted center">只显示前 300 条，用搜索缩小范围</div>' : ""}
      ${!list.length ? '<div class="card muted center">没有匹配的笔记</div>' : ""}
    `;
    $("#view-notes").innerHTML = html;

    const si = $("#note-search");
    si.addEventListener("input", () => {
      noteSearch = si.value;
      clearTimeout(si._t);
      si._t = setTimeout(() => {
        renderNotes();
        const el = $("#note-search");
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }, 220);
    });
    $$("#view-notes .chip").forEach((c) => (c.onclick = () => { noteSearch = c.dataset.q || ""; renderNotes(); }));
  }

  const DIR_LABEL = (() => {
    const m = {};
    for (const n of NOTES) {
      if (m[n.d]) continue;
      const ch = IDX.chunks.find((c) => c.id === n.k);
      m[n.d] = ch ? ch.name : (n.d || "总入口");
    }
    return m;
  })();
  function dirLabel(d) {
    return DIR_LABEL[d] || d;
  }

  async function renderNoteDetail(path) {
    const n = NOTE_BY_PATH[path];
    const host = $("#view-notes");
    if (!n) {
      host.innerHTML = `<div class="crumb" data-go="#/notes">‹ 返回笔记库</div><div class="card">找不到这篇笔记：${esc(path)}</div>`;
      return;
    }
    host.innerHTML = `<div class="crumb" data-go="#/notes">‹ 返回笔记库</div><div class="loading">正在加载…</div>`;
    const body = await getBody(path);
    S.seen[path] = Date.now();
    touchStreak();
    save();

    // 关联题目
    const relatedQ = BANK.questions.filter((q) => (q.rel || []).includes(path));
    // 反链
    const back = NOTES.filter((x) => (x.l || []).some((l) => resolveNote(l) === path)).slice(0, 12);

    host.innerHTML = `
      <div class="crumb" data-go="#/notes">‹ 返回笔记库</div>
      <div class="tag-row">
        <span class="tag">${esc(n.v === "B" ? "🎬 访谈库" : "📚 知识库")}</span>
        <span class="tag">${n.m} 分钟</span>
        ${(n.g || []).slice(0, 4).map((t) => `<span class="tag">#${esc(t)}</span>`).join("")}
      </div>
      <div class="article">${MD.render(body)}</div>
      ${
        back.length
          ? `<div class="sec-title">🔗 反向链接（${back.length}）</div><div class="note-links">${back
              .map((b) => `<button class="btn sm" data-note="${esc(b.p)}">${esc(shortName(b.p))}</button>`)
              .join("")}</div>`
          : ""
      }
      ${
        relatedQ.length
          ? `<div class="sec-title">🎤 相关面试题（${relatedQ.length}）</div><ul class="qlist">${relatedQ
              .map((q) => `<li><button class="qitem" data-go="#/q/${q.id}"><div class="qt">${esc(q.q)}</div><div class="qm"><span class="tag ${q.freq === "high" ? "hot" : ""}">${q.freq === "high" ? "🔥 高频" : "题目"}</span><span class="tag">${esc(MOD[q.mod].name)}</span></div></button></li>`)
              .join("")}</ul>`
          : ""
      }
      <div class="btn-row" style="margin-top:14px">
        <button class="btn" id="jump-top">↑ 回到顶部</button>
        <button class="btn ghost" data-go="#/notes">返回列表</button>
      </div>
    `;
    const jt = $("#jump-top");
    if (jt) jt.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---------------- 视图：我的 ---------------- */
  function renderMe() {
    const tp = treeProgress();
    const bp = bankProgress();
    const due = dueList().length;

    let answers = 0;
    BANK.questions.forEach((q) => { if (S.q[q.id]) answers += S.q[q.id].n || 0; });

    const mods = BANK.modules
      .map((m) => ({ m, s: masteryOf(m.id) }))
      .filter((x) => x.s.total > 0);

    const notesList = Object.keys(S.text).filter((k) => S.text[k]);
    const readNotes = Object.keys(S.seen).length;

    $("#view-me").innerHTML = `
      <div class="hero">
        <h1>📊 我的进度</h1>
        <p>数据只存在这台设备的浏览器里。换设备/换浏览器前请先导出存档。</p>
        <div class="meter-row" style="margin-top:12px">
          <span style="min-width:70px;text-align:left">🔥 连击</span>
          <div class="meter"><i class="bar-fill-warn" style="width:${Math.min(100, (S.streak.days || 0) * 5)}%"></i></div>
          <span>${S.streak.days || 0} 天</span>
        </div>
      </div>

      <div class="grid2">
        <div class="kpi"><b>${tp.read}/${tp.total}</b><span>知识树节点已深读</span></div>
        <div class="kpi"><b>${bp.done}/${bp.total}</b><span>题目已练过</span></div>
        <div class="kpi"><b>${answers}</b><span>累计自评次数</span></div>
        <div class="kpi"><b>${readNotes}</b><span>读过的笔记</span></div>
      </div>

      <div class="sec-title">⏰ 复习队列</div>
      <div class="card">
        <div class="bankrow"><span>今天到期</span><b>${due} 题</b></div>
        <div class="bankrow"><span>已进入排期</span><b>${Object.keys(S.q).length} 题</b></div>
        ${
          due
            ? `<button class="btn primary block" style="margin-top:10px" data-go="#/q/${dueList()[0].id}">开始复习</button>`
            : '<div class="muted" style="margin-top:8px">暂无到期。做过的题会按 6小时/1/3/7/15/30 天自动回来。</div>'
        }
      </div>

      <div class="sec-title">📉 模块掌握度</div>
      <div class="card">
        ${
          mods.length
            ? mods
                .sort((a, b) => a.s.pct - b.s.pct)
                .map(
                  (x) => `<div class="radar-row">
            <span class="rn">${x.m.icon} ${esc(x.m.name)}</span>
            <div class="meter"><i class="bar-fill-${
              x.s.pct < 34 ? "bad" : x.s.pct < 67 ? "warn" : "ok"
            }" style="width:${x.s.pct}%"></i></div>
            <span class="rv">${x.s.pct}%</span>
          </div>`
                )
                .join("")
            : '<div class="muted">还没有数据。去题库练几道题，这里会长出你的弱项雷达。</div>'
        }
      </div>

      <div class="sec-title">✍️ 我写的理解（${notesList.length}）</div>
      <div class="card">
        ${
          notesList.length
            ? notesList
                .map((k) => {
                  const label = k.startsWith("q_")
                    ? (QBYID[k.slice(2)] ? QBYID[k.slice(2)].q : k)
                    : k;
                  return `<div class="bankrow" style="display:block">
                <div style="color:var(--tx3);font-size:12.5px">${esc(String(label).slice(0, 70))}</div>
                <div style="margin-top:3px">${esc(S.text[k])}</div>
              </div>`;
                })
                .join("")
            : '<div class="muted">还没有。做题时点「写下我自己的理解」，用自己的话讲一遍——这就是费曼检验。</div>'
        }
      </div>

      <div class="sec-title">💾 存档</div>
      <div class="card">
        <div class="btn-row">
          <button class="btn" id="exp">📤 导出存档</button>
          <button class="btn" id="imp">📥 导入存档</button>
        </div>
        <div class="btn-row" style="margin-top:8px">
          <button class="btn ghost" id="reset">🧹 清空进度</button>
        </div>
        <div class="muted" style="margin-top:9px">题库与知识树共 ${BANK.questions.length} 题 / ${tp.total} 个节点。存档格式为 JSON，可复制到手机浏览器粘贴导入。</div>
      </div>

      <div class="sec-title">ℹ️ 关于</div>
      <div class="card muted">
        内容来自两个知识库：技术线（Python / RAG / Agent / 全栈）+ 访谈线（Dario、Kevin Weil、Krieger、Boris Cherny、Cat Wu、Natalie Meurer 等一线访谈）。
        题库题目汇总自牛客 / 掘金 / CSDN / 腾讯云社区等渠道的公开面经，答案框架与「访谈证据」引用的原话已尽量标注来源；标「转述」的为二手表述，引用前请回原文核对。
        <div style="margin-top:8px">生成时间：${esc(BANK.generated)} · 笔记快照：${esc(IDX.meta.generatedAt)}</div>
      </div>
    `;

    $("#exp").onclick = exportSave;
    $("#imp").onclick = importSave;
    $("#reset").onclick = () => {
      if (confirm("确定清空全部进度？（知识树已读、题目排期、我写的理解都会删除）")) {
        S = BLANK();
        save(true);
        toast("已清空");
        route();
      }
    };
  }

  function exportSave() {
    const txt = JSON.stringify(S);
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(txt).then(
        () => toast("已复制到剪贴板，粘贴到手机即可导入"),
        () => fallbackExport(txt)
      );
    } else fallbackExport(txt);
  }
  function fallbackExport(txt) {
    const v = prompt("复制下面全部内容保存：", txt);
    if (v !== null) toast("已生成存档文本");
  }
  function importSave() {
    const v = prompt("粘贴之前导出的存档内容：", "");
    if (!v) return;
    try {
      const obj = JSON.parse(v.trim());
      if (typeof obj !== "object" || !obj.v) throw new Error("格式不对");
      S = Object.assign(BLANK(), obj);
      save(true);
      toast("导入成功");
      route();
    } catch (e) {
      toast("导入失败：不是合法的存档");
    }
  }

  /* ---------------- 全局事件 ---------------- */
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
      save();
      renderTree();
      paintTop();
      toast(S.nodes[id].read ? "已标记深读 ✓" : "已取消");
      return;
    }
    if (t.dataset.mynote) { askMyNote("n_" + t.dataset.mynote, "我对这个节点的理解"); return; }
  });

  // 笔记正文里的 [[双链]]
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a.wl");
    if (!a) return;
    e.preventDefault();
    const target = a.dataset.note;
    const p = resolveNote(target);
    if (p) go("#/note/" + encodeURIComponent(p));
    else toast("本地没有这篇笔记：「" + target + "」");
  });

  /* ---------------- 启动 ---------------- */
  function boot() {
    if (!IDX || !BANK || !TREE) {
      document.body.innerHTML =
        '<div style="padding:40px;font-family:sans-serif">数据未加载：请确认 interview/data/ 下的文件已生成（运行 <code>node tools/build-interview.mjs</code>）。</div>';
      return;
    }
    // 底栏
    $("#tabbar").innerHTML = TABS.map(
      (t) => `<button data-tab="${t.id}" data-go="#/${t.id}">
        <i>${t.icon}</i><span>${t.label}</span>
        ${t.id === "bank" ? '<span class="badge" id="tab-bank-badge" style="display:none"></span>' : ""}
      </button>`
    ).join("");

    window.addEventListener("hashchange", route);
    load();
    route();

    // 离线缓存
    if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
