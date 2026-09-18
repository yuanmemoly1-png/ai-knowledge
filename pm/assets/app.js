// ============================================================
// 《AI 时代的产品经理》· 应用逻辑
// 五个标签：今日 / 课程 / 访谈 / 教学 / 我的
// 复用 AI 面试站的设计系统（../interview/assets/style.css）与 Markdown 渲染器
// ============================================================
(function () {
  "use strict";

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const DAY = 864e5;
  const APP_VERSION = "v1 · 2026-09-18";
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  /* ---------------- 图标（与主站同一套几何规则） ---------------- */
  const ICONS = {
    today: '<rect x="3.25" y="5" width="17.5" height="15.6" rx="2.6"/><path d="M8 2.8v4.2M16 2.8v4.2M3.25 10.6h17.5"/><circle cx="12" cy="15.6" r="1.35" fill="currentColor" stroke="none"/>',
    book: '<path d="M12 6.7C10.1 5.05 7.7 4.25 5 4.25H3.4v13.5H5c2.7 0 5.1.8 7 2.45 1.9-1.65 4.3-2.45 7-2.45h1.6V4.25H19c-2.7 0-5.1.8-7 2.45Z"/><path d="M12 6.7v13.5"/>',
    mic: '<rect x="9.25" y="2.9" width="5.5" height="10.4" rx="2.75"/><path d="M5.4 11.2a6.6 6.6 0 0 0 13.2 0"/><path d="M12 17.8v3.3"/>',
    teach: '<path d="M12 3.4 2.9 8l9.1 4.6L21.1 8 12 3.4Z"/><path d="M6.2 10.4v4.8c0 1.4 2.6 2.6 5.8 2.6s5.8-1.2 5.8-2.6v-4.8"/>',
    me: '<circle cx="12" cy="8.2" r="3.6"/><path d="M4.9 20.4a7.1 7.1 0 0 1 14.2 0"/>',
    sun: '<circle cx="12" cy="12" r="4.1"/><path d="M12 2.6v2.3M12 19.1v2.3M4.35 4.35 5.9 5.9M18.1 18.1l1.55 1.55M2.6 12h2.3M19.1 12h2.3M4.35 19.65 5.9 18.1M18.1 5.9l1.55-1.55"/>',
    moon: '<path d="M20.2 14.6A8.6 8.6 0 0 1 9.4 3.8a8.6 8.6 0 1 0 10.8 10.8Z"/>',
    check: '<path d="M4.6 12.7 9.4 17.5 19.4 7.3"/>',
    search: '<circle cx="10.8" cy="10.8" r="6.4"/><path d="M15.5 15.5 20.6 20.6"/>',
    link: '<path d="M9.6 14.4a3.6 3.6 0 0 1 0-5.1l2.6-2.6a3.6 3.6 0 0 1 5.1 5.1l-1 1"/><path d="M14.4 9.6a3.6 3.6 0 0 1 0 5.1l-2.6 2.6a3.6 3.6 0 0 1-5.1-5.1l1-1"/>',
    pen: '<path d="M4 20h4.2L19 9.2a2.6 2.6 0 0 0 0-3.7l-.5-.5a2.6 2.6 0 0 0-3.7 0L4 15.8V20Z"/><path d="M13.9 6.1 17.9 10.1"/>',
    chart: '<path d="M4 20h16"/><path d="M7.3 20V12M12 20V5.6M16.7 20v-5.6"/>',
    yt: '<rect x="2.6" y="5.4" width="18.8" height="13.2" rx="3.4"/><path d="M10.4 9.4 15.6 12l-5.2 2.6V9.4Z"/>',
  };
  function ICON(name, size) {
    const d = ICONS[name] || ICONS.book;
    const s = size || 22;
    return `<svg class="ico" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  }

  /* ---------------- 状态 ---------------- */
  const KEY = "ai-pm-study-v1";
  const BLANK = () => ({ v: 1, sec: {}, seen: {}, text: {}, streak: { last: "", days: 0 }, theme: "dark" });
  let S = BLANK();
  function load() {
    try { const raw = localStorage.getItem(KEY); if (raw) S = Object.assign(BLANK(), JSON.parse(raw)); } catch (e) { /* ignore */ }
  }
  let saveTimer = null;
  function save(now) {
    const doIt = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast("存档失败：浏览器存储已满"); } };
    if (now) return doIt();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(doIt, 350);
  }
  const todayStr = () => new Date().toLocaleDateString("sv");
  function applyTheme() {
    document.documentElement.dataset.theme = S.theme === "light" ? "light" : "dark";
    const b = $("#btn-theme");
    if (b) b.innerHTML = ICON(S.theme === "light" ? "moon" : "sun", 19);
  }
  function toggleTheme() { S.theme = S.theme === "light" ? "dark" : "light"; applyTheme(); save(true); }
  function touchStreak() {
    const t = todayStr();
    if (S.streak.last === t) return;
    const y = new Date(Date.now() - DAY).toLocaleDateString("sv");
    S.streak.days = S.streak.last === y ? (S.streak.days || 0) + 1 : 1;
    S.streak.last = t;
  }
  let toastTimer = null;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("on"), 1900);
  }

  /* ---------------- 数据 ---------------- */
  const OL = window.PM_OUTLINE || { parts: [] };
  const SEC = window.PM_SECTIONS || {};
  const EXTRA = (window.PM_EXTRA && window.PM_EXTRA.items) || [];
  const PMQ = window.PM_QUESTIONS || { modules: [], questions: [] };
  const MAINQ = window.QUESTION_BANK || { roles: [], modules: [], questions: [] };
  const IVLIB = window.INTERVIEW_LIB || { tiers: [], items: [] };
  const IV_DEEP = window.IV_DEEP || {};

  /* PM 相关访谈：从主站访谈库里筛出产品岗 */
  const PM_ROLE_RE = /PM|产品|CPO|CPTO|Product|product/i;
  const PM_IVS = (IVLIB.items || []).filter((i) => PM_ROLE_RE.test([i.role, i.title, (i.topics || []).join(" ")].join(" ")));

  const SEC_POS = {};
  const ALL_SECS = [];
  (OL.parts || []).forEach((p) => (p.sections || []).forEach((sid) => {
    SEC_POS[sid] = { part: p };
    ALL_SECS.push({ id: sid, part: p });
  }));
  const secTitle = (id) => (SEC[id] && SEC[id].t) || id;
  const SEC_READY = () => ALL_SECS.filter((x) => SEC[x.id]).length;
  const QBYID = {};
  // 主站题库 + PM 专属题库合并：PM 各节的 qs 里既有主站的 pd-01 等，也有本站的 pm-01
  (MAINQ.questions || []).forEach((q) => (QBYID[q.id] = q));
  (PMQ.questions || []).forEach((q) => (QBYID[q.id] = q));

  function courseProgress() {
    const total = ALL_SECS.length;
    const read = ALL_SECS.filter((x) => S.sec[x.id] && S.sec[x.id].read).length;
    return { total, read, pct: total ? Math.round((read / total) * 100) : 0 };
  }
  function partProgress(p) {
    const ids = p.sections || [];
    const read = ids.filter((x) => S.sec[x] && S.sec[x].read).length;
    return { total: ids.length, read, pct: ids.length ? Math.round((read / ids.length) * 100) : 0 };
  }
  function nextSections(n) {
    const out = [];
    for (const x of ALL_SECS) { if (out.length >= n) return out; if (!(S.sec[x.id] && S.sec[x.id].read)) out.push(x); }
    return out;
  }
  /* 间隔重复：与主站同一套节奏，但这里只用来排「哪节该重读」 */
  const INTERVALS = [0.25, 1, 3, 7, 15, 30];
  function sState(id) {
    if (!S.sec[id]) S.sec[id] = { box: 0, last: 0, next: 0, n: 0 };
    return S.sec[id];
  }
  function sRate(id, kind) {
    const st = sState(id);
    st.n++; st.last = Date.now();
    if (kind === "no") st.box = 0;
    else if (kind === "half") st.box = Math.max(1, st.box);
    else st.box = Math.min(5, st.box + 1);
    st.next = Date.now() + INTERVALS[st.box] * DAY;
    touchStreak(); save();
  }
  const dueSections = () => ALL_SECS.filter((x) => { const st = S.sec[x.id]; return st && st.next && st.next <= Date.now(); });

  /* ---------------- 共用片段 ---------------- */
  const RING = (pct, label) => {
    const C = 2 * Math.PI * 32;
    const off = C * (1 - clamp(pct, 0, 100) / 100);
    return `<div class="ring"><svg width="72" height="72" viewBox="0 0 76 76">
      <circle class="ring-bg" cx="38" cy="38" r="32" fill="none" stroke-width="7"/>
      <circle class="ring-fg" cx="38" cy="38" r="32" fill="none" stroke-width="7" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}"/>
      </svg><div class="ring-txt">${pct}%<small>${label}</small></div></div>`;
  };
  const evHTML = (e) => `<div class="ev"><div class="zh">「${esc(e.zh)}」</div>${e.en ? `<div class="en">“${esc(e.en)}”</div>` : ""}<div class="by">— ${esc(e.src)}${e.url ? ` · <a href="${esc(e.url)}" target="_blank" rel="noopener">原始来源</a>` : ""}</div></div>`;

  /* ---------------- 路由 ---------------- */
  const TABS = [
    { id: "today", icon: "today", label: "今日" },
    { id: "course", icon: "book", label: "课程" },
    { id: "yt", icon: "yt", label: "油管" },
    { id: "iv", icon: "mic", label: "访谈" },
    { id: "teach", icon: "teach", label: "教学" },
    { id: "me", icon: "me", label: "我的" },
  ];
  const MAP = { today: "today", course: "course", yt: "yt", iv: "iv", teach: "teach", me: "me", sec: "course", ivd: "iv" };
  const go = (h) => (location.hash = h);
  function parse() {
    const raw = (location.hash || "#/today").replace(/^#\/?/, "").split("?")[0];
    const [seg, ...rest] = raw.split("/");
    return { seg: seg || "today", rest };
  }
  function route() {
    const { seg, rest } = parse();
    const tab = MAP[seg] || "today";
    $$("#tabbar button").forEach((b) => b.classList.toggle("on", b.dataset.tab === tab));
    $$(".view").forEach((v) => v.classList.remove("on"));
    $("#view-" + tab).classList.add("on");
    window.scrollTo(0, 0);

    if (seg === "sec") renderSection(rest[0]);
    else if (seg === "ivd") renderInterview(rest[0]);
    else if (tab === "today") renderToday();
    else if (tab === "course") renderCourse(rest[0]);
    else if (tab === "yt") renderYt();
    else if (tab === "iv") renderInterviews();
    else if (tab === "teach") renderTeach();
    else if (tab === "me") renderMe();
    paintTop();
  }
  function paintTop() {
    const st = $("#top-streak");
    if (st) st.innerHTML = `${ICON("today", 13)} <b>${S.streak.days || 0}</b> 天`;
  }

  /* ================= 今日 ================= */
  function renderToday() {
    const cp = courseProgress();
    const due = dueSections();
    const todo = nextSections(3);
    const d = new Date();
    const week = "日一二三四五六"[d.getDay()];

    $("#view-today").innerHTML = `
      <div class="hero">
        <div class="hero-top">
          <div style="flex:1;min-width:0">
            <div class="kicker">${d.getMonth() + 1} 月 ${d.getDate()} 日 · 周${week}</div>
            <h1>今天只做三件事</h1>
            <p>读一节 · 听一场访谈 · 重读该重读的。<br>不求多，求讲得出来。</p>
          </div>
          ${RING(cp.pct, "已读")}
        </div>
        <div class="hero-stats">
          <div class="hstat"><b>${cp.read}<span style="font-size:13px;color:var(--tx3)">/${cp.total}</span></b><span>节已读</span></div>
          <div class="hstat"><b>${PM_IVS.length}</b><span>场 PM 访谈</span></div>
          <div class="hstat"><b>${EXTRA.length}</b><span>份外部资源</span></div>
        </div>
      </div>

      <div class="card" style="border-left:2px solid var(--brand)">
        <div class="sec" style="margin:0 0 8px">这个站怎么用</div>
        <div class="muted" style="line-height:1.8">
          前三篇是主干（认知 → 能力 → 方法），顺着读。<br>
          第四篇是访谈导读，每节围绕一个难题把几场访谈串起来，读完再点进原访谈。<br>
          第五篇教你跟谁学、按什么顺序学。第六篇是求职。
        </div>
      </div>

      <div class="tiles">
        <button class="tile hot" data-go="${todo.length ? `#/sec/${todo[0].id}` : "#/course"}"><i>${ICON("book", 20)}</i><b>${todo.length ? "继续读" : "课程目录"}</b><span>${esc(todo.length ? secTitle(todo[0].id) : OL.title)}</span></button>
        <button class="tile" data-go="#/iv"><i>${ICON("mic", 20)}</i><b>PM 访谈</b><span>${PM_IVS.length} 场一手访谈</span></button>
        <button class="tile" data-go="#/teach"><i>${ICON("teach", 20)}</i><b>跟谁学</b><span>${EXTRA.length} 份课程与资源</span></button>
      </div>

      <div class="sec">${due.length ? `该重读 <span class="n">${due.length}</span>` : "该重读"}</div>
      ${due.length ? `<div class="rows">${due.slice(0, 3).map((x) => `
        <button class="row" data-go="#/sec/${x.id}">
          <span class="row-i">${esc(x.id)}</span>
          <span class="row-b"><span class="row-t">${esc(secTitle(x.id))}</span>
          <span class="row-m"><span class="tag due">该复习了</span><span class="tag">${esc(x.part.title)}</span></span></span>
          <span class="row-x">›</span>
        </button>`).join("")}</div>`
      : `<div class="card"><div class="empty" style="padding:16px 4px"><i>${ICON("check", 26)}</i>今天没有该重读的。<br>读过的节会按 6 小时 / 1 / 3 / 7 / 15 / 30 天回来找你。</div></div>`}

      <div class="sec">继续往下读</div>
      <div class="rows">
        ${todo.map((x) => `
          <button class="row" data-go="#/sec/${x.id}">
            <span class="row-i">${esc(x.id)}</span>
            <span class="row-b"><span class="row-t">${esc(secTitle(x.id))}</span>
            <span class="row-m">${esc(x.part.no)} · ${esc(x.part.title)}</span></span>
            <span class="row-x">›</span>
          </button>`).join("") || '<div class="card muted">课程已经读过一遍了。回第四篇挑一场访谈重听，或者去第六篇准备求职。</div>'}
      </div>

      ${(PMQ.questions || []).length ? `<div class="sec">练一道 PM 题</div>
      <div class="card">
        <div class="muted" style="margin-bottom:10px">面试考的是判断，不是知识。抽一道看看你会怎么答。</div>
        <button class="btn primary block" id="rand-q">随机抽一道 PM 题</button>
      </div>` : ""}
    `;
    const rq = $("#rand-q");
    if (rq) rq.onclick = () => {
      const q = PMQ.questions[Math.floor(Math.random() * PMQ.questions.length)];
      go("#/sec/" + (q.rel && q.rel.length ? "" : "")); // 占位，避免误跳
      toast(q.q);
    };
  }

  /* ================= 课程 ================= */
  function renderCourse(arg) {
    // arg 可能是节 id（1.1）或篇 id（P1）
    if (arg && /^P\d+$/.test(arg)) return renderPart(arg);
    if (arg) return renderSection(arg);
    const cp = courseProgress();
    const ready = SEC_READY();
    $("#view-course").innerHTML = `
      <div class="hero">
        <div class="hero-top">
          <div style="flex:1;min-width:0">
            <div class="kicker">六篇 · ${ALL_SECS.length} 节</div>
            <h1>${esc(OL.title)}</h1>
            <p>${esc(OL.subtitle)}</p>
          </div>
          ${RING(cp.pct, "已读")}
        </div>
        <div class="hero-stats">
          <div class="hstat"><b>${cp.read}<span style="font-size:13px;color:var(--tx3)">/${cp.total}</span></b><span>节已读</span></div>
          <div class="hstat"><b>${(OL.parts || []).length}</b><span>篇</span></div>
          <div class="hstat"><b>${ready}</b><span>节有正文</span></div>
        </div>
      </div>

      <div class="card">
        <div class="sec" style="margin:0 0 8px">为什么是这个顺序</div>
        <div class="muted" style="line-height:1.8">${esc(OL.intro)}</div>
      </div>

      ${(OL.parts || []).map((p) => {
        const pr = partProgress(p);
        return `<button class="tb-part" data-go="#/course/${p.id}">
          <div class="tb-part-top">
            <span class="tb-part-no">${esc(p.no)}</span>
            <span class="tb-part-t">${esc(p.title)}</span>
            <span class="tb-pct">${pr.read}/${pr.total}</span>
          </div>
          ${p.goal ? `<div class="tb-goal">${esc(p.goal)}</div>` : ""}
          <div class="meter" style="margin-top:11px"><i class="${pr.pct < 34 ? "bad" : pr.pct < 67 ? "warn" : "ok"}" style="width:${pr.pct}%"></i></div>
          <div class="tb-part-m">${pr.total} 节</div>
        </button>`;
      }).join("")}
    `;
  }

  function renderPart(partId) {
    const p = (OL.parts || []).find((x) => x.id === partId);
    if (!p) { go("#/course"); return; }
    const pr = partProgress(p);
    $("#view-course").innerHTML = `
      <div class="crumb" data-go="#/course">‹ 课程目录</div>
      <div class="hero" style="padding-top:0">
        <div class="hero-top">
          <div style="flex:1;min-width:0">
            <div class="kicker">${esc(p.no)}</div>
            <h1>${esc(p.title)}</h1>
            ${p.goal ? `<p>${esc(p.goal)}</p>` : ""}
          </div>
          ${RING(pr.pct, "已读")}
        </div>
      </div>
      <div class="rows">
        ${(p.sections || []).map((sid) => {
          const s = SEC[sid];
          const st = S.sec[sid] || {};
          return `<button class="row" data-go="#/sec/${sid}">
            <span class="row-i">${esc(sid)}</span>
            <span class="row-b">
              <span class="row-t">${esc(s ? s.t : sid)}</span>
              <span class="row-m">${s && s.why ? esc(s.why) : "正文待补"}</span>
            </span>
            <span class="row-x">${st.read ? "✓" : "›"}</span>
          </button>`;
        }).join("")}
      </div>
    `;
  }

  function renderSection(sid) {
    const s = SEC[sid];
    const pos = SEC_POS[sid];
    if (!s || !pos) { toast("这一节还没有正文"); go("#/course"); return; }
    const st = S.sec[sid] || {};
    const idx = ALL_SECS.findIndex((x) => x.id === sid);
    const prev = idx > 0 ? ALL_SECS[idx - 1] : null;
    const next = idx >= 0 && idx < ALL_SECS.length - 1 ? ALL_SECS[idx + 1] : null;
    const qs = (s.qs || []).map((q) => QBYID[q]).filter(Boolean);

    $("#view-course").innerHTML = `
      <div class="crumb" data-go="#/course/${pos.part.id}">‹ ${esc(pos.part.no)} · ${esc(pos.part.title)}</div>
      <div class="hero" style="padding-top:0">
        <div class="kicker">${esc(pos.part.no)} · 第 ${pos.part.sections.indexOf(sid) + 1} 节</div>
        <h1 style="font-size:21px">${esc(sid)}　${esc(s.t)}</h1>
      </div>

      ${s.why ? `<div class="tb-panel why"><b>为什么读这节</b><span>${esc(s.why)}</span></div>` : ""}
      ${s.learn ? `<div class="tb-panel learn"><b>读完的标志</b><span>${esc(s.learn)}</span></div>` : ""}

      <div class="card tb-body">${MD.render(s.body || "")}</div>

      ${(s.keypoints || []).length ? `<div class="sec">必须记住的结论</div>
      <div class="card"><ul class="iv-take" style="margin:0">${s.keypoints.map((k) => `<li>${MD.inline(k)}</li>`).join("")}</ul></div>` : ""}

      ${(s.pitfalls || []).length ? `<div class="sec">最容易错的地方</div>
      <div class="card"><ul class="iv-take" style="margin:0">${s.pitfalls.map((k) => `<li>${MD.inline(k)}</li>`).join("")}</ul></div>` : ""}

      ${(s.ev || []).length ? `<div class="sec">一手证据</div><div class="card">${s.ev.map(evHTML).join("")}</div>` : ""}

      ${qs.length ? `<div class="sec">配套 PM 真题</div>
      <ul class="qlist">${qs.map((q) => `<li><button class="qitem" data-q="${esc(q.id)}">
        <div class="qt">${esc(q.q)}</div>
        <div class="qm"><span class="tag ${q.freq === "high" ? "hot" : ""}">${q.freq === "high" ? "高频" : "题目"}</span><span class="tag">Lv${q.lv}</span></div>
      </button></li>`).join("")}</ul>` : ""}

      <div class="sec">读完了吗</div>
      <div class="card">
        ${st.note ? `<div class="practice" style="margin-bottom:12px">我的一句话：${esc(st.note)}</div>` : ""}
        <div class="btn-row">
          <button class="btn ${st.read ? "ghost" : "ok"}" data-sread="${esc(sid)}">${st.read ? "取消已读" : "标记已读"}</button>
          <button class="btn ghost" data-snote="${esc(sid)}">写一句我自己的话</button>
        </div>
        <div class="muted" style="margin-top:11px">
          ${st.n ? `已读 ${st.n} 次 · Lv${st.box || 0}${st.next ? " · 下次 " + new Date(st.next).toLocaleDateString("sv") : ""}` : "标记后会按 6 小时 / 1 / 3 / 7 / 15 / 30 天提醒重读。"}
        </div>
      </div>

      <div class="btn-row" style="margin:14px 0 30px">
        ${prev ? `<button class="btn sm" data-go="#/sec/${prev.id}">‹ ${esc(secTitle(prev.id))}</button>` : ""}
        ${next ? `<button class="btn sm" data-go="#/sec/${next.id}">${esc(secTitle(next.id))} ›</button>` : ""}
      </div>
    `;
  }

  /* ================= 油管 ================= */
  const YT = window.PM_YT || { tiers: [], channels: [], fde: [], costNotes: [], route: [] };
  const star = (n) => "★".repeat(n) + "☆".repeat(Math.max(0, 3 - n));

  function renderYt() {
    const chs = YT.channels || [];
    const vids = chs.reduce((a, c) => a + (c.watch || []).length, 0);
    const added = chs.filter((c) => c.added).length;

    $("#view-yt").innerHTML = `
      <div class="hero">
        <div class="hero-top">
          <div style="flex:1;min-width:0">
            <div class="kicker">筛过的频道 · 不是搜出来的</div>
            <h1>油管上看什么</h1>
            <p>${esc(YT.intro || "")}</p>
          </div>
        </div>
        <div class="hero-stats">
          <div class="hstat"><b>${chs.length}</b><span>个频道</span></div>
          <div class="hstat"><b>${vids}</b><span>个代表视频</span></div>
          <div class="hstat"><b>${added}</b><span>本轮新核实</span></div>
        </div>
      </div>

      <div class="card">
        <div class="sec" style="margin:0 0 8px">先看这条：怎么判断一个频道值不值得做笔记</div>
        <ul class="iv-take" style="margin:0">
          ${(YT.costNotes || []).map((t) => `<li>${esc(t)}</li>`).join("")}
        </ul>
      </div>

      ${(YT.tiers || []).map((t) => {
        const sub = chs.filter((c) => c.tier === t.id);
        if (!sub.length) return "";
        return `<div class="sec">${esc(t.name)} <span class="n">${sub.length}</span></div>
        <div class="muted" style="margin:-4px 0 10px">${esc(t.desc)}</div>
        ${sub.map(ytCard).join("")}`;
      }).join("")}

      <div class="sec">FDE 一手从业者资源 <span class="n">${(YT.fde || []).length}</span></div>
      <div class="muted" style="margin:-4px 0 10px">不是访谈，是真实工作与面试的原始材料。</div>
      ${(YT.fde || []).map((x) => `<a class="row" href="${esc(x.u)}" target="_blank" rel="noopener">
        <span class="row-i">${ICON("link", 17)}</span>
        <span class="row-b"><span class="row-t">${esc(x.t)}</span>
        <span class="row-m"><span class="tag">${esc(x.kind)}</span>${esc(x.note)}</span></span>
        <span class="row-x">›</span></a>`).join("")}

      <div class="sec">按周执行的路线</div>
      ${(YT.route || []).map((r) => `<div class="card">
        <div style="font-size:15.4px;font-weight:650;margin-bottom:6px">${esc(r.stage)}</div>
        <div class="muted" style="margin-bottom:10px">目标：${esc(r.goal)}</div>
        <ul class="iv-take" style="margin:0">${(r.items || []).map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
        <div class="muted" style="margin-top:10px">产出：${esc(r.out)}</div>
      </div>`).join("")}
    `;
  }

  function ytCard(c) {
    return `<div class="card">
      <div class="tag-row" style="margin-bottom:9px">
        <span class="tag hot">${star(c.stars)}</span>
        <span class="tag">${esc(c.track || "")}</span>
        ${c.added ? '<span class="tag mid">本轮新核实</span>' : ""}
      </div>
      <div style="font-size:16px;font-weight:680;letter-spacing:-.015em">${esc(c.name)}</div>
      <div class="iv-role" style="margin:6px 0 10px">${esc(c.host || "")}${c.scale && c.scale !== "—" ? " · " + esc(c.scale) : ""}</div>
      <div style="font-size:14.4px;line-height:1.78;color:var(--tx2)">${esc(c.why || "")}</div>
      <div class="muted" style="margin-top:10px">取内容：${esc(c.cost || "")}</div>
      ${(c.watch || []).length ? `<div class="sec" style="margin:16px 0 8px">先看这几期</div>
      ${c.watch.map((w) => `<a class="row" href="${esc(w.u)}" target="_blank" rel="noopener" style="margin-bottom:8px">
        <span class="row-i">${ICON("yt", 17)}</span>
        <span class="row-b"><span class="row-t">${esc(w.t)}</span><span class="row-m">${esc(w.note || "")}</span></span>
        <span class="row-x">›</span></a>`).join("")}` : ""}
    </div>`;
  }

  /* ================= 访谈 ================= */
  let ivFilter = { tier: "", kw: "" };
  const initial = (s) => (s || "?").trim()[0];

  function renderInterviews() {
    let list = PM_IVS.slice();
    if (ivFilter.tier) list = list.filter((i) => i.tier === ivFilter.tier);
    if (ivFilter.kw) {
      const kw = ivFilter.kw.toLowerCase();
      list = list.filter((i) => [i.guest, i.role, i.title, (i.topics || []).join(" "), (i.takeaways || []).join(" ")].join(" ").toLowerCase().includes(kw));
    }
    const withDeep = PM_IVS.filter((i) => IV_DEEP[i.id]).length;

    $("#view-iv").innerHTML = `
      <div class="hero">
        <div class="hero-top">
          <div style="flex:1;min-width:0">
            <div class="kicker">来自一线 PM 与 CPO</div>
            <h1>PM 访谈</h1>
            <p>${PM_IVS.length} 场与产品岗直接相关的一手访谈，其中 ${withDeep} 场带 AI 深度思考（核心论断 / 边界 / 反方 / 对你的含义）。</p>
          </div>
        </div>
        <div class="hero-stats">
          ${(IVLIB.tiers || []).map((t) => `<div class="hstat"><b>${PM_IVS.filter((i) => i.tier === t.id).length}</b><span>${esc(t.name.split(" · ")[0])}</span></div>`).join("")}
        </div>
      </div>

      <div class="card">
        <div class="sec" style="margin:0 0 8px">先读导读，再听原访谈</div>
        <div class="muted" style="line-height:1.8">第四篇把访谈按「你遇到的难题」重新聚过类。想按嘉宾找，就在下面直接翻。</div>
        <div class="btn-row" style="margin-top:11px">
          <button class="btn sm" data-go="#/sec/4.1">AI 时代 PM 的一天</button>
          <button class="btn sm" data-go="#/sec/4.2">PM 与工程如何合流</button>
          <button class="btn sm" data-go="#/sec/4.3">评测与质量谁负责</button>
          <button class="btn sm" data-go="#/sec/4.4">定价与商业化</button>
          <button class="btn sm" data-go="#/sec/4.5">招人与带团队</button>
        </div>
      </div>

      <input class="search" id="iv-search" placeholder="搜嘉宾 / 主题（如 Evals、定价、团队）" value="${esc(ivFilter.kw)}">
      <div class="chips" style="margin-top:12px">
        <button class="chip ${!ivFilter.tier ? "on" : ""}" data-t="">全部 ${PM_IVS.length}</button>
        ${(IVLIB.tiers || []).map((t) => `<button class="chip ${ivFilter.tier === t.id ? "on" : ""}" data-t="${t.id}">${esc(t.name.split(" · ")[0])} ${PM_IVS.filter((i) => i.tier === t.id).length}</button>`).join("")}
      </div>

      ${(IVLIB.tiers || []).filter((t) => !ivFilter.tier || t.id === ivFilter.tier).map((t) => {
        const sub = list.filter((i) => i.tier === t.id);
        if (!sub.length) return "";
        return `<div class="sec">${esc(t.name)}</div><div class="muted" style="margin:-4px 0 10px">${esc(t.desc)}</div>${sub.map(ivCard).join("")}`;
      }).join("")}
      ${!list.length ? `<div class="card empty"><i>${ICON("search", 26)}</i>没有匹配的访谈</div>` : ""}
    `;
    const si = $("#iv-search");
    if (si) si.addEventListener("input", () => {
      ivFilter.kw = si.value;
      clearTimeout(si._t);
      si._t = setTimeout(() => { renderInterviews(); const el = $("#iv-search"); el.focus(); el.setSelectionRange(el.value.length, el.value.length); }, 240);
    });
    $$("#view-iv .chip").forEach((c) => (c.onclick = () => { ivFilter.tier = c.dataset.t; renderInterviews(); }));
  }

  function ivCard(i) {
    return `<div class="iv-card ${String(i.tier).toLowerCase()}" data-go="#/ivd/${esc(i.id)}">
      <div class="iv-top">
        <div class="iv-face">${esc(initial(i.guest))}</div>
        <div class="iv-b">
          <div class="iv-name">${esc(i.guest)}</div>
          <div class="iv-role">${esc(i.channel)}${i.date && i.date !== "—" ? " · " + esc(i.date) : ""}</div>
        </div>
        <span class="tag ${String(i.tier).toLowerCase()}" style="flex:none">${esc(i.tier)} 级</span>
      </div>
      <div class="iv-title">${esc(i.title)}</div>
      ${(i.takeaways || []).length ? `<ul class="iv-take">${i.takeaways.slice(0, 3).map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
      <div class="tag-row" style="margin-top:11px">
        ${IV_DEEP[i.id] ? '<span class="tag hot">有深度思考</span>' : ""}
        ${i.note ? '<span class="tag done">有完整笔记</span>' : ""}
        ${(i.topics || []).slice(0, 3).map((t) => `<span class="tag">${esc(t)}</span>`).join("")}
      </div>
    </div>`;
  }

  function renderInterview(id) {
    const i = PM_IVS.find((x) => x.id === id);
    if (!i) { go("#/iv"); return; }
    const d = IV_DEEP[id];
    const row = (label, text) => (text ? `<div class="dp-row"><div class="dp-k">${label}</div><div class="dp-v">${MD.inline(text)}</div></div>` : "");
    $("#view-iv").innerHTML = `
      <div class="crumb" data-go="#/iv">‹ PM 访谈</div>
      <div class="hero" style="padding-top:0">
        <div class="hero-top">
          <div class="iv-face" style="width:52px;height:52px;border-radius:14px;font-size:20px">${esc(initial(i.guest))}</div>
          <div style="flex:1;min-width:0">
            <div class="kicker">${esc(i.tier)} 级访谈</div>
            <h1 style="font-size:19px">${esc(i.guest)}</h1>
            <p>${esc(i.role)}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="sec" style="margin:0 0 10px">这期讲什么</div>
        <div style="font-size:15.4px;font-weight:650;line-height:1.66">${esc(i.title)}</div>
        ${(i.takeaways || []).length ? `<ul class="iv-take" style="margin-top:12px">${i.takeaways.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
        ${i.url ? `<div class="btn-row" style="margin-top:14px"><a class="btn primary" href="${esc(i.url)}" target="_blank" rel="noopener">去看原访谈</a></div>` : ""}
      </div>

      ${(i.keyPoints || []).length ? `<div class="sec">核心要点</div>
      <div class="card"><ul class="iv-take" style="margin:0">${i.keyPoints.map((k) => `<li>${esc(k)}</li>`).join("")}</ul></div>` : ""}

      ${d ? `<div class="sec">AI 深度思考</div>
      <div class="card dp">
        <div class="muted" style="margin-bottom:12px;line-height:1.7">这一层不复述嘉宾说了什么，而是追问：它为什么成立、边界在哪、谁不同意、对你意味着什么。</div>
        ${d.verdict ? `<div class="dp-verdict">${MD.inline(d.verdict)}</div>` : ""}
        ${row("核心论断", d.thesis)}${row("为什么成立", d.reasoning)}${row("边界在哪", d.boundary)}
        ${row("反方观点", d.counter)}${row("对你的含义", d.meaning)}${row("可检验的动作", d.action)}
      </div>
      ${(d.claims || []).length ? `<div class="sec">论断级拆解</div>
      ${d.claims.map((c, n) => `<div class="card dp-claim">
        <div class="dp-claim-top"><span class="dp-no">${n + 1}</span>${c.tag ? `<span class="tag">${esc(c.tag)}</span>` : ""}</div>
        <div class="dp-c">${esc(c.c)}</div><div class="dp-a">${MD.inline(c.a)}</div>
      </div>`).join("")}` : ""}` : ""}

      ${(i.quotes || []).length ? `<div class="sec">可直接引用的金句</div>
      <div class="card">${i.quotes.map((q) => `<div class="iv-quote" style="margin-top:10px"><div class="q-zh">「${esc(q.zh)}」</div>${q.en ? `<div class="q-en">“${esc(q.en)}”</div>` : ""}</div>`).join("")}</div>` : ""}

      ${i.note ? `<div class="sec">深读</div>
      <div class="card"><div class="muted" style="margin-bottom:11px">这期的完整结构化笔记在主站的笔记库里。</div>
      <a class="btn block" href="../interview/index.html#/note/${encodeURIComponent(i.note)}">打开完整笔记</a></div>` : ""}
    `;
  }

  /* ================= 教学 ================= */
  function renderTeach() {
    const byKind = { interview: [], course: [], article: [] };
    EXTRA.forEach((x) => (byKind[x.kind] || byKind.article).push(x));
    const KIND = { interview: "访谈", course: "课程", article: "文章与方法论" };

    $("#view-teach").innerHTML = `
      <div class="hero">
        <div class="hero-top">
          <div style="flex:1;min-width:0">
            <div class="kicker">跟谁学 · 按什么顺序学</div>
            <h1>教学与资源</h1>
            <p>${EXTRA.length} 份公开资源，每条都写了「怎么用」和「什么时候别看」。<br>先读第五篇的导读，再按需取用。</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="sec" style="margin:0 0 8px">第五篇导读</div>
        <div class="btn-row">
          <button class="btn sm" data-go="#/sec/5.1">AI PM 完整课程怎么学</button>
          <button class="btn sm" data-go="#/sec/5.2">Lenny's Podcast 的用法</button>
          <button class="btn sm" data-go="#/sec/5.3">Cagan 与 Biddle 两条线</button>
          <button class="btn sm" data-go="#/sec/5.4">中文资源怎么选</button>
          <button class="btn sm" data-go="#/sec/5.5">四阶段学习路线</button>
        </div>
      </div>

      ${EXTRA.length ? Object.keys(byKind).filter((k) => byKind[k].length).map((k) => `
        <div class="sec">${KIND[k]} <span class="n">${byKind[k].length}</span></div>
        ${byKind[k].map(extraCard).join("")}
      `).join("") : `<div class="card empty"><i>${ICON("teach", 26)}</i>外部资源还在收集。<br>先去第五篇读「跟谁学」，那里已经列好了该看谁。</div>`}
    `;
  }

  function extraCard(x) {
    return `<div class="card">
      <div class="tag-row" style="margin-bottom:9px">
        ${(x.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join("")}
        ${x.lang ? `<span class="tag">${esc(x.lang)}</span>` : ""}
        ${x.date ? `<span class="tag">${esc(x.date)}</span>` : ""}
      </div>
      <div style="font-size:15.4px;font-weight:650;line-height:1.6">${esc(x.title)}</div>
      <div class="iv-role" style="margin:6px 0 10px">${esc(x.guest)}${x.role ? " · " + esc(x.role) : ""}${x.channel ? " · " + esc(x.channel) : ""}</div>
      ${x.why ? `<div class="muted" style="margin-bottom:10px">${esc(x.why)}</div>` : ""}
      ${x.distilled ? `<div style="font-size:14.4px;line-height:1.78;color:var(--tx2)">${MD.render(x.distilled)}</div>` : ""}
      ${(x.takeaways || []).length ? `<ul class="iv-take">${x.takeaways.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
      ${(x.quotes || []).length ? x.quotes.map((q) => `<div class="iv-quote" style="margin-top:10px"><div class="q-zh">「${esc(q.zh)}」</div>${q.en ? `<div class="q-en">“${esc(q.en)}”</div>` : ""}</div>`).join("") : ""}
      ${x.url ? `<div class="btn-row" style="margin-top:12px"><a class="btn sm" href="${esc(x.url)}" target="_blank" rel="noopener">${ICON("link", 14)} 打开原页</a></div>` : ""}
    </div>`;
  }

  /* ================= 我的 ================= */
  function renderMe() {
    const cp = courseProgress();
    const read = Object.keys(S.seen).length;
    const notes = Object.keys(S.text).filter((k) => S.text[k] && k.startsWith("s_"));
    $("#view-me").innerHTML = `
      <div class="hero">
        <div class="hero-top">
          <div style="flex:1;min-width:0">
            <div class="kicker">学习档案</div>
            <h1>我的进度</h1>
            <p>数据只存在这台设备。换设备前先导出存档。</p>
          </div>
          ${RING(clamp((S.streak.days || 0) * 5, 0, 100), "连击")}
        </div>
        <div class="hero-stats">
          <div class="hstat"><b>${S.streak.days || 0}</b><span>连续天数</span></div>
          <div class="hstat"><b>${cp.read}</b><span>节已读</span></div>
          <div class="hstat"><b>${dueSections().length}</b><span>今日该重读</span></div>
        </div>
      </div>

      <div class="sec">各篇进度</div>
      <div class="card">
        ${(OL.parts || []).map((p) => {
          const pr = partProgress(p);
          return `<div class="radar-row">
            <span class="rn">${esc(p.no)} ${esc(p.title)}</span>
            <div class="meter"><i class="${pr.pct < 34 ? "bad" : pr.pct < 67 ? "warn" : "ok"}" style="width:${pr.pct}%"></i></div>
            <span class="rv">${pr.pct}%</span></div>`;
        }).join("")}
      </div>

      <div class="sec">我写的理解 ${notes.length}</div>
      <div class="card">
        ${notes.length ? notes.map((k) => `<div class="kv" style="display:block"><div style="color:var(--tx3);font-size:12.4px">${esc(secTitle(k.slice(2)))}</div><div style="margin-top:4px">${esc(S.text[k])}</div></div>`).join("")
        : '<div class="empty" style="padding:14px 4px"><i>' + ICON("pen", 26) + "</i>还没有。读每节时点「写一句我自己的话」，用自己的话复述一遍。</div>"}
      </div>

      <div class="sec">设置与存档</div>
      <div class="card">
        <div class="btn-row">
          <button class="btn" id="theme-btn">${S.theme === "light" ? "切到深色" : "切到浅色"}</button>
          <button class="btn" id="exp">导出存档</button>
          <button class="btn" id="imp">导入存档</button>
        </div>
        <button class="btn ghost block" id="reset" style="margin-top:9px">清空进度</button>
        <div class="muted" style="margin-top:11px">共 ${ALL_SECS.length} 节课程 / ${PM_IVS.length} 场 PM 访谈 / ${EXTRA.length} 份外部资源 / ${(PMQ.questions || []).length} 道 PM 题。</div>
      </div>

      <div class="sec">其它学习站</div>
      <div class="rows">
        <a class="row" href="../interview/index.html"><span class="row-i">${ICON("chart", 17)}</span><span class="row-b"><span class="row-t">AI 面试深度站</span><span class="row-m">教材 133 节 + 必背代码 + 题库 + 访谈</span></span><span class="row-x">›</span></a>
        <a class="row" href="../study/index.html"><span class="row-i">${ICON("book", 17)}</span><span class="row-b"><span class="row-t">学习站</span><span class="row-m">全库笔记网页阅读</span></span><span class="row-x">›</span></a>
      </div>

      <div class="sec">数据说明</div>
      <div class="card muted">
        内容来自你库里的 PM 素材蒸馏（14 场一手访谈、2 个专题、1 门完整课程）加上公开渠道新收集的资源。新收集的每条都标了来源链接与内容类型；取不到逐字稿的会注明「公开摘要」。
        <div style="margin-top:10px">版本 <b style="color:var(--teal)">${esc(APP_VERSION)}</b></div>
      </div>
    `;
    $("#theme-btn").onclick = () => { toggleTheme(); renderMe(); };
    $("#exp").onclick = () => {
      const txt = JSON.stringify(S);
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(txt).then(() => toast("已复制到剪贴板"), () => prompt("复制下面内容：", txt));
      else prompt("复制下面内容：", txt);
    };
    $("#imp").onclick = () => {
      const v = prompt("粘贴之前导出的存档：", "");
      if (!v) return;
      try { const o = JSON.parse(v.trim()); if (!o.v) throw new Error("bad"); S = Object.assign(BLANK(), o); applyTheme(); save(true); toast("导入成功"); route(); }
      catch (e) { toast("导入失败：不是合法的存档"); }
    };
    $("#reset").onclick = () => { if (confirm("确定清空全部进度？")) { const th = S.theme; S = BLANK(); S.theme = th; save(true); toast("已清空"); route(); } };
  }

  /* ================= 全局事件 ================= */
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-go],[data-sread],[data-snote]");
    if (!t) return;
    if (t.dataset.go) {
      go(t.dataset.go);
      return;
    }
    if (t.dataset.sread) {
      const id = t.dataset.sread;
      const st = sState(id);
      st.read = !st.read;
      if (st.read) { st.n = (st.n || 0) + 1; st.box = Math.min(5, (st.box || 0) + 1); st.next = Date.now() + INTERVALS[st.box] * DAY; touchStreak(); }
      save();
      renderSection(id);
      toast(st.read ? "已标记已读" : "已取消");
      return;
    }
    if (t.dataset.snote) {
      const id = t.dataset.snote;
      const key = "s_" + id;
      const v = prompt("用你自己的话讲一遍这一节（只存在这台设备）", S.text[key] || "");
      if (v === null) return;
      S.text[key] = v;
      if (!S.text[key]) delete S.text[key];
      touchStreak(); save(true); toast("已保存"); renderSection(id);
    }
  });

  /* ================= 启动 ================= */
  function boot() {
    if (!OL || !OL.parts || !OL.parts.length) {
      document.body.innerHTML = '<div style="padding:40px;font-family:sans-serif;color:#eee">数据未加载：缺少 pm/data/pm-outline.js。</div>';
      return;
    }
    $("#tabbar").innerHTML = TABS.map((t) => `<button data-tab="${t.id}" data-go="#/${t.id}"><i>${ICON(t.icon, 23)}</i><span>${t.label}</span></button>`).join("");
    const tb = $("#btn-theme");
    if (tb) tb.onclick = toggleTheme;
    window.addEventListener("hashchange", route);
    load();
    applyTheme();
    route();

    if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
      const had = !!navigator.serviceWorker.controller;
      navigator.serviceWorker.register("sw.js", { scope: "./" }).catch(() => {});
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!had || window.__swRefreshed) return;
        window.__swRefreshed = true;
        toast("已更新到最新版，正在刷新…");
        setTimeout(() => location.reload(), 800);
      });
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
