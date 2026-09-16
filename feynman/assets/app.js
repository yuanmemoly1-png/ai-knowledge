/* 费曼学检场 · 主逻辑
   数据结构（localStorage key: feynman_save_v1）:
   { xp, streakDays, lastCheckin, history:[{id,title,ts,score,blind,simple,gaps}],
     queue:[{id,title,path,nextTs,score,rounds}], apiKey }            */
"use strict";

const SAVE_KEY = "feynman_save_v1";
const XP_PER_CHECK = 30;              // 完成一次完整检验
const XP_MIN_CHECK = 12;              // 2分钟最小打卡（仅盲讲+出关）
const LEVELS = [0, 100, 250, 500, 900, 1400, 2100, 3000, 4200, 5700];
const BADGES = [
  { id: "first",  name: "🥇 初次出关",   cond: s => s.history.length >= 1 },
  { id: "five",   name: "🎯 五连检验",   cond: s => s.history.length >= 5 },
  { id: "teach",  name: "👨‍🏫 能教人 ×3", cond: s => s.history.filter(h => h.score === 4).length >= 3 },
  { id: "week",   name: "🔥 7 天连击",   cond: s => s.streakDays >= 7 },
  { id: "twenty", name: "📚 20 篇出关", cond: s => s.history.length >= 20 },
  { id: "feyn",   name: "🎓 费曼本人",   cond: s => s.history.length >= 50 },
];

let S = loadState();
let cur = null; // 当前检验会话 {id,title,content,step,blind,gaps,simple,q1,q2,q3,score,minMode}

function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { console.warn("存档读取失败", e); }
  return { xp: 0, streakDays: 0, lastCheckin: "", history: [], queue: [], apiKey: "" };
}
function saveState() { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); renderAll(); }

/* ---------- XP / 等级 / 连击 ---------- */
function levelInfo(xp) {
  let lv = 1;
  for (let i = 0; i < LEVELS.length; i++) if (xp >= LEVELS[i]) lv = i + 1;
  const curBase = LEVELS[lv - 1] || 0;
  const next = LEVELS[lv] || curBase + 1500;
  return { lv, pct: Math.min(100, Math.round((xp - curBase) / (next - curBase) * 100)), next };
}
function todayStr(d) { d = d || new Date(); return d.toISOString().slice(0, 10); }
function addDays(ts, n) { return ts + n * 86400000; }

function checkStreak() {
  const t = todayStr();
  if (S.lastCheckin === t) return;               // 今天已计过连击
  const yest = todayStr(new Date(Date.now() - 86400000));
  S.streakDays = (S.lastCheckin === yest) ? S.streakDays + 1 : 1;
  S.lastCheckin = t;
}
function grantXp(n) {
  checkStreak();
  S.xp += n;
  saveState();
  toast(`+${n} XP！${levelInfo(S.xp).lv > levelInfo(S.xp - n).lv ? "升级了！🎉" : ""}`);
}

/* ---------- 渲染 ---------- */
function renderAll() {
  const info = levelInfo(S.xp);
  document.getElementById("level-badge").textContent = "Lv." + info.lv;
  document.getElementById("xp-fill").style.width = info.pct + "%";
  document.getElementById("xp-text").textContent = S.xp + " XP";
  document.getElementById("streak-badge").textContent = "🔥 " + S.streakDays;

  if (window.NOTES_INDEX && window.NOTES_INDEX.meta) {
    document.getElementById("index-note").textContent =
      `📚 索引：${window.NOTES_INDEX.meta.total} 篇 · 更新于 ${window.NOTES_INDEX.meta.generatedAt}`;
  } else {
    document.getElementById("index-note").textContent = "⚠️ 笔记索引未加载（data/notes.js 缺失）";
  }
  renderToday();
  renderStats();
  renderBadges();
}

function renderToday() {
  const box = document.getElementById("today-box");
  const now = Date.now();
  const due = (S.queue || []).filter(q => q.nextTs <= now).sort((a, b) => a.nextTs - b.nextTs);
  if (!due.length) {
    box.innerHTML = `<div class="today-empty">今天没有到期的复习。<br>新的学习做完后，来一次「发起检验」把知识钉进脑子里。最小剂量：2 分钟也算打卡 ✅</div>`;
    return;
  }
  box.innerHTML = due.slice(0, 8).map(q => {
    const overdue = Math.floor((now - q.nextTs) / 86400000);
    const when = overdue >= 1 ? `<span class="n-due">已超期 ${overdue} 天</span>` : "今天到期";
    return `<div class="today-card due" data-pick="${escAttr(q.path)}">
      <div class="t-main"><div class="t-title">${escHtml(q.title)}</div>
      <div class="t-sub">第 ${q.rounds} 轮复习 · 上次自评 ${q.score} 分 · ${when}</div></div>
      <button class="run-btn review-btn" data-pick="${escAttr(q.path)}">开检 →</button>
    </div>`;
  }).join("") + (due.length > 8 ? `<div class="t-sub" style="padding:6px 4px">还有 ${due.length - 8} 篇排队中……</div>` : "");
  box.querySelectorAll(".review-btn").forEach(b => b.addEventListener("click", () => startFromQueue(b.dataset.pick)));
}

function renderStats() {
  const h = S.history;
  const avg = h.length ? (h.reduce((a, b) => a + b.score, 0) / h.length).toFixed(1) : "—";
  const uniq = new Set(h.map(x => x.id)).size;
  const grid = document.getElementById("stats-grid");
  grid.innerHTML = [
    [h.length, "累计检验"], [uniq, "攻克知识点"], [avg, "平均自评"],
    [S.streakDays, "连续天数"], [(S.queue || []).length, "复习队列"]
  ].map(p => `<div class="stat-card"><div class="stat-num">${p[0]}</div><div class="stat-label">${p[1]}</div></div>`).join("");
}

function renderBadges() {
  const wall = document.getElementById("badge-wall");
  wall.innerHTML = BADGES.map(b => `<span class="badge ${b.cond(S) ? "got" : ""}">${b.name}</span>`).join("");
}

/* ---------- 工具 ---------- */
function escHtml(s) { return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
function escAttr(s) { return escHtml(s); }
function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg; t.classList.add("show");
  clearTimeout(t._tm); t._tm = setTimeout(() => t.classList.remove("show"), 2600);
}
function uid() { return "n" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

/* ---------- 发起检验：从库选 ---------- */
let pickDir = "";
function openPick() {
  document.getElementById("pick-modal").style.display = "flex";
  document.getElementById("pick-search").value = "";
  renderDirFilter(); renderNoteList("");
}
function renderDirFilter() {
  const dirs = window.NOTES_INDEX ? Object.keys(window.NOTES_INDEX.meta.byDir || {}) : [];
  const f = document.getElementById("dir-filter");
  f.innerHTML = `<span class="dir-chip ${pickDir === "" ? "sel" : ""}" data-d="">全部</span>` +
    dirs.map(d => `<span class="dir-chip ${pickDir === d ? "sel" : ""}" data-d="${escAttr(d)}">${escHtml(d)} (${window.NOTES_INDEX.meta.byDir[d]})</span>`).join("");
  f.querySelectorAll(".dir-chip").forEach(c => c.addEventListener("click", () => { pickDir = c.dataset.d; renderDirFilter(); renderNoteList(document.getElementById("pick-search").value); }));
}
function renderNoteList(kw) {
  const list = document.getElementById("note-list");
  const notes = (window.NOTES_INDEX && window.NOTES_INDEX.notes) || [];
  kw = (kw || "").trim().toLowerCase();
  const dueMap = {}; (S.queue || []).forEach(q => { if (q.nextTs <= Date.now()) dueMap[q.path] = true; });
  const hits = notes.filter(n =>
    (!pickDir || n.dir === pickDir) &&
    (!kw || n.title.toLowerCase().includes(kw) || n.path.toLowerCase().includes(kw))
  ).slice(0, 120);
  list.innerHTML = hits.length ? hits.map(n => `
    <div class="note-item" data-path="${escAttr(n.path)}">
      <div class="n-title">${dueMap[n.path] ? "⏰ " : ""}${escHtml(n.title)} ${n.dir ? `<span class="n-due" style="color:#a08a6e;font-weight:400">· 复检</span>` : ""}</div>
      <div class="n-sub">${escHtml(n.path)} · ${n.mtime}</div>
    </div>`).join("") : `<div class="t-sub" style="padding:10px">没搜到，换个关键词～</div>`;
  list.querySelectorAll(".note-item").forEach(it => it.addEventListener("click", () => {
    const n = notes.find(x => x.path === it.dataset.path);
    closeModal("pick-modal");
    beginSession({ id: n.path, title: n.title, content: n.content });
  }));
}

/* ---------- 发起检验：粘贴/拖入 ---------- */
function openPaste() { document.getElementById("paste-modal").style.display = "flex"; }
function closeModal(id) { document.getElementById(id).style.display = "none"; }

/* ---------- 会话与对话式流水线 ---------- */
function beginSession(meta) {
  cur = { id: meta.id, title: meta.title, content: meta.content, step: 1,
          chat: [],            // 对话历史 {role, content}
          blind: "", simple: "", gaps: "", score: 0, minMode: false };
  document.getElementById("home-view").style.display = "none";
  document.getElementById("flow-view").style.display = "block";
  document.getElementById("current-note-tag").textContent = meta.title;
  const sp = document.getElementById("source-pre"); if (sp) sp.textContent = meta.content;
  EXAM = null;
  document.getElementById("chat-box").innerHTML = "";
  document.getElementById("chat-input").value = "";
  gotoStep(1);
  window.scrollTo(0, 0);
  startChat();
}
function startFromQueue(path) {
  const n = (window.NOTES_INDEX && window.NOTES_INDEX.notes || []).find(x => x.path === path);
  if (n) beginSession({ id: n.path, title: n.title, content: n.content });
  else { const q = (S.queue || []).find(x => x.path === path); if (q) { toast("索引里没这篇了，直接粘贴原文再检～"); openPaste(); } }
}
function gotoStep(n) {
  cur.step = n;
  const show = id => { const el = document.getElementById(id); if (el) el.style.display = "none"; };
  ["step1", "step2", "step3"].forEach(show);
  document.getElementById("step" + n).style.display = "block";
  document.querySelectorAll(".fstep").forEach(el => {
    const s = +el.dataset.step;
    el.classList.toggle("active", s === n);
    el.classList.toggle("done", s < n);
  });
  if (n === 4) doQuiz();
  window.scrollTo(0, 0);
}

/* ========== 苏格拉底对话引擎 ========== */
const TUTOR_SYS = `你是一位亲切又严格的苏格拉底式家教，正在陪学生用费曼学习法巩固一篇笔记。规则：
1. 一次只问一个问题，问题简短（1-2句），像日常聊天，不要长篇大论
2. 教学路线：先问"这是什么/解决什么问题"→再追问机制细节→中途要学生"打个生活比喻"→最后问"什么场景用得上"
3. 学生答对：简短肯定（"对""没错"）+ 追深一层或换下一个点；答错或含糊：不直接说答案，先给提示（类比、举例、拆成两半问）；提示两次还不会才讲答案
4. 学生说"不会/教我"：用最白话讲一遍（带比喻），然后换个角度再问他确认听懂
5. 学生跑偏：温和拉回"先回到XX这个点"
6. 每 3-4 轮用一个 emoji 或鼓励一句，气氛轻松
7. 觉得学生已把核心点讲清（约6-10轮后）：总结他讲对的三点，然后说"你去考试吧"引导结束
回复永远只有你的下一条消息，不要输出多个问题，中文口语化。`;

function chatBubble(role, text, typing) {
  const box = document.getElementById("chat-box");
  const div = document.createElement("div");
  div.className = "cb " + (role === "user" ? "cb-user" : "cb-ai");
  div.innerHTML = (typing ? `<span class="ai-loading">💭 家教思考中…</span>` : escHtml(text).replace(/\n/g, "<br>"));
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
  return div;
}
function setBubble(div, text) {
  div.innerHTML = escHtml(text).replace(/\n/g, "<br>");
  const box = document.getElementById("chat-box");
  box.scrollTop = box.scrollHeight;
}

async function startChat() {
  if (!S.apiKey) {
    chatBubble("ai", `没配 AI Key，对话模式开不了。两个选择：\n① 点右上角 ⚙️ 填 DeepSeek API Key（推荐，家教超好用）\n② 直接点下方"去考试"做题（不需要 Key）`);
    return;
  }
  const holder = chatBubble("ai", "", true);
  // 开场：让家教先抛第一个问题
  cur.chat.push({ role: "system", content: `本篇笔记：\n${cut(cur.content, 3500)}\n\n开始教学：先简短打招呼（一句话，提笔记主题），然后抛出第一个开放问题。` });
  const r = await aiChatRaw(cur.chat);
  if (r) { cur.chat.push({ role: "assistant", content: r }); setBubble(holder, r); }
  else { setBubble(holder, "AI 连不上了……检查一下网络或 Key，或者直接去考试 📝"); }
}
async function aiChatRaw(messages) {
  try {
    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + S.apiKey },
      body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "system", content: TUTOR_SYS }, ...messages], temperature: 0.6, max_tokens: 500 })
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    return data.choices[0].message.content;
  } catch (e) { console.warn(e); return null; }
}
async function sendChat(text) {
  if (!text.trim()) return;
  chatBubble("user", text);
  cur.chat.push({ role: "user", content: text });
  // 攒料：对话中的用户发言可作盲讲素材
  cur.blind = cur.chat.filter(m => m.role === "user").map(m => m.content).join("\n");
  const inp = document.getElementById("chat-input");
  inp.value = ""; inp.disabled = true;
  const holder = chatBubble("ai", "", true);
  const r = await aiChatRaw(cur.chat);
  inp.disabled = false; inp.focus();
  if (r) { cur.chat.push({ role: "assistant", content: r }); setBubble(holder, r); }
  else setBubble(holder, "（网络开小差了，再发一次试试）");
}
function step1Next() {
  const turns = cur.chat.filter(m => m.role === "user").length;
  if (turns < 2) { toast("再多聊两轮——至少回答家教 2 个问题再走"); return; }
  cur.simple = cur.blind; // 对话即讲述
  gotoStep(4);
}

/* ---------- AI（DeepSeek，可选；失败自动降级自检） ---------- */
async function aiChat(system, user, onFail) {
  if (!S.apiKey) { onFail && onFail(); return null; }
  try {
    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + S.apiKey },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "system", content: system }, { role: "user", content: user }],
        temperature: 0.5, max_tokens: 1200
      })
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    return data.choices[0].message.content;
  } catch (e) {
    console.warn("AI 调用失败，降级自检", e);
    toast("AI 连不上，已切换成自检模式（不影响打卡）");
    onFail && onFail();
    return null;
  }
}
const cut = (s, n) => (s && s.length > n ? s.slice(0, n) + "……（截断）" : s || "");

// doGaps 已随表单式流程移除：找差环节由苏格拉底对话中的家教追问完成

/* ========== Step4 出关考试系统：选择题 + 判断题 + 简答题 ========== */
let EXAM = null;   // {mc:[], tf:[], essay:[], mode:"ai"|"self"}

function doQuiz() {
  const area = document.getElementById("exam-area");
  const resBox = document.getElementById("exam-result");
  const submitBtn = document.getElementById("submit-exam");
  const regenBtn = document.getElementById("regen-exam");
  resBox.style.display = "none"; resBox.innerHTML = "";
  submitBtn.disabled = true; submitBtn.style.display = ""; regenBtn.style.display = "none";
  if (S.apiKey) { area.innerHTML = `<div class="ai-loading">🤖 AI 正在基于笔记出卷……</div>`; makeAiExam(area, submitBtn, regenBtn); }
  else { area.innerHTML = ""; makeSelfExam(area, submitBtn, regenBtn); }
}

/* ---- AI 出卷：要求严格 JSON ---- */
function extractJson(txt) {
  const m = txt.match(/\{[\s\S]*\}/);
  if (!m) throw new Error("no json");
  return JSON.parse(m[0]);
}
async function makeAiExam(area, submitBtn, regenBtn) {
  try {
    const txt = await aiChat(
      "你是出题考官。基于用户给的笔记内容出一套检验卷，只输出 JSON（不要任何多余文字），格式：{\"mc\":[{\"q\":\"题干\",\"opts\":[\"A选项\",\"B选项\",\"C选项\",\"D选项\"],\"ans\":0}],\"tf\":[{\"q\":\"陈述\",\"ans\":true}],\"essay\":[{\"q\":\"简答题\",\"ref\":\"参考要点，2-3句\"}]}。要求：mc 出 3 道单选题（ans 是正确选项下标 0-3，干扰项要有迷惑性但明确可判）；tf 出 2 道判断题（ans true/false，考查易错点）；essay 出 1 道（考本质理解或应用场景）。题目必须能从笔记内容中找到依据，中文。",
      `【笔记全文】\n${cut(cur.content, 4000)}`
    );
    if (!txt) throw new Error("no ai");
    const data = extractJson(txt);
    if (!Array.isArray(data.mc) || !data.mc.length) throw new Error("bad quiz");
    EXAM = { mc: data.mc.slice(0, 3), tf: (data.tf || []).slice(0, 2), essay: (data.essay || []).slice(0, 1), mode: "ai" };
    renderExam(area);
    submitBtn.disabled = false; regenBtn.style.display = "";
  } catch (e) {
    console.warn("AI 出卷失败，转自检卷", e);
    makeSelfExam(area, submitBtn, regenBtn);
  }
}

/* ---- 自检出卷：从笔记挖空生成填空/回忆题 ---- */
function makeSelfExam(area, submitBtn, regenBtn) {
  // 收集含加粗词的句子作为考点
  const lines = cur.content.split("\n");
  const pool = [];
  lines.forEach(l => {
    const m = l.match(/^[#>\s*-]*([^#>*`|]{6,60})\*\*([^*]{2,18})\*\*([^#\n]{0,40})/);
    if (m) pool.push({ q: (m[1].trim() + " ____ " + m[3].trim()).replace(/\s+/g, " "), a: m[2].trim() });
  });
  // 备用：双链词挖空
  if (pool.length < 3) {
    const seen = new Set();
    lines.forEach(l => {
      const m = l.match(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/);
      if (m && m[1].length > 2 && !seen.has(m[1]) && l.length < 90) {
        seen.add(m[1]);
        pool.push({ q: l.replace(/\[\[[^\]]+\]\]/, "____").replace(/[#>*`]/g, "").trim().slice(0, 80), a: m[1] });
      }
    });
  }
  // 洗牌取 5
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  const picked = pool.slice(0, 5);
  if (!picked.length) {
    EXAM = { mc: [], tf: [], essay: [{ q: "用自己的话说：这篇笔记最重要的一个知识点是什么？为什么它重要？", ref: "对照原文要点自判" }], mode: "self" };
  } else {
    EXAM = { mc: [], tf: [], essay: [], blank: picked, mode: "self" };
  }
  renderExam(area);
  submitBtn.disabled = false; regenBtn.style.display = "";
}

/* ---- 渲染考卷 ---- */
function renderExam(area) {
  let html = "";
  let no = 1;
  (EXAM.mc || []).forEach((m, i) => {
    html += `<div class="exam-q"><div class="eq-title">${no++}. [单选] ${escHtml(m.q)}</div>` +
      m.opts.map((o, oi) => `<label class="opt"><input type="radio" name="mc${i}" value="${oi}"> ${String.fromCharCode(65 + oi)}. ${escHtml(o)}</label>`).join("") + `</div>`;
  });
  (EXAM.tf || []).forEach((t, i) => {
    html += `<div class="exam-q"><div class="eq-title">${no++}. [判断] ${escHtml(t.q)}</div>
      <label class="opt"><input type="radio" name="tf${i}" value="true"> ✔ 正确</label>
      <label class="opt"><input type="radio" name="tf${i}" value="false"> ✘ 错误</label></div>`;
  });
  ((EXAM.blank || []) || []).forEach((b, i) => {
    html += `<div class="exam-q"><div class="eq-title">${no++}. [填空] ${escHtml(b.q)}</div>
      <input type="text" class="blank-input" id="blank${i}" placeholder="填入被挖掉的关键词"></div>`;
  });
  (EXAM.essay || []).forEach((e, i) => {
    html += `<div class="exam-q"><div class="eq-title">${no++}. [简答] ${escHtml(e.q)}</div>
      <textarea class="q-input" id="essay${i}" rows="3" placeholder="写下你的答案"></textarea></div>`;
  });
  area.innerHTML = html + (EXAM.mode === "self" && !EXAM.blank ? "" : "");
}

/* ---- 交卷判分 ---- */
async function submitExam() {
  const btn = document.getElementById("submit-exam");
  btn.disabled = true;
  let got = 0, total = 0, detail = [];
  // 单选
  (EXAM.mc || []).forEach((m, i) => {
    total++;
    const sel = document.querySelector(`input[name="mc${i}"]:checked`);
    const ok = sel && +sel.value === m.ans;
    if (ok) got++;
    detail.push({ t: "单选", q: m.q, ok, ref: "正确答案：" + String.fromCharCode(65 + m.ans) + ". " + m.opts[m.ans] });
  });
  // 判断
  (EXAM.tf || []).forEach((t, i) => {
    total++;
    const sel = document.querySelector(`input[name="tf${i}"]:checked`);
    const ok = sel && (sel.value === String(t.ans));
    if (ok) got++;
    detail.push({ t: "判断", q: t.q, ok, ref: "正确答案：" + (t.ans ? "正确" : "错误") });
  });
  // 填空（自检）：宽松匹配
  let blankPending = [];
  (EXAM.blank || []).forEach((b, i) => {
    total++;
    const v = (document.getElementById("blank" + i) || {}).value || "";
    const ok = v.trim() && (v.trim() === b.a || b.a.includes(v.trim()) || v.trim().includes(b.a));
    if (ok) got++;
    detail.push({ t: "填空", q: b.q, ok: !!ok, ref: "参考答案：" + b.a + (ok ? "" : "（你填的：" + (v.trim() || "空") + "）") });
  });
  // 简答
  let essayAnswers = [];
  (EXAM.essay || []).forEach((e, i) => {
    total++;
    essayAnswers.push({ idx: i, q: e.q, ref: e.ref, ans: (document.getElementById("essay" + i) || {}).value || "" });
  });

  btn.textContent = "判分中……";
  // AI 判简答
  for (const ea of essayAnswers) {
    let ok = false, comment = "";
    if (!ea.ans.trim()) { comment = "未作答"; }
    else if (S.apiKey && EXAM.mode === "ai") {
      const r = await aiChat(
        "你是阅卷老师。根据参考要点给简答题判分。只输出 JSON：{\"score\":0到2的整数,\"comment\":\"一句话点评\"}。2=答到要点，1=部分沾边，0=没答到。",
        `【题目】${ea.q}\n【参考要点】${ea.ref}\n【学生答案】${ea.ans}`
      );
      try { const j = extractJson(r || ""); const sc = Math.min(2, Math.max(0, +j.score)); ok = sc >= 1.5; got += sc / 2; comment = j.comment || ""; }
      catch (e) { ok = null; comment = "AI 判分失败，请对照参考要点自判"; }
    } else { ok = null; comment = "对照参考要点自判："; }
    detail.push({ t: "简答", q: ea.q, ok, ref: ea.ref + (comment ? "｜" + comment : ""), essay: ea.ans });
  }

  const pct = total ? got / total : 0;
  const score = pct >= 0.9 ? 4 : pct >= 0.7 ? 3 : pct >= 0.45 ? 2 : 1;
  showExamResult(got, total, score, detail);
  cur.score = score;
  // 排期 + 记史 + XP
  finishWithScore(score, `${Math.round(pct * 100)}%`);
  btn.textContent = "已交卷 ✓"; btn.disabled = true;
}

function showExamResult(got, total, score, detail) {
  const box = document.getElementById("exam-result");
  const pct = Math.round((total ? got / total : 0) * 100);
  const emoji = score >= 4 ? "🏆" : score === 3 ? "👍" : score === 2 ? "🤔" : "💪";
  box.style.display = "block";
  box.innerHTML = `<div class="score-banner ${"s" + score}">
      <span class="sb-big">${emoji} ${pct}%</span>
      <span class="sb-sub">掌握度 ${score}/4 · ${score >= 4 ? "能教人了！" : score === 3 ? "基本讲清" : score === 2 ? "有漏洞，近期重检" : "概念还糊，1 天后重来"}</span>
    </div>` +
    detail.map(d => `<div class="d-item ${d.ok === true ? "ok" : d.ok === false ? "bad" : "self"}">
      <b>${d.ok === true ? "✔" : d.ok === false ? "✘" : "🔍"} [${d.t}]</b> ${escHtml(d.q.slice(0, 60))}
      <div class="d-ref">${escHtml(d.ref)}</div>
      ${d.essay ? `<div class="d-essay">你的答案：${escHtml(d.essay.slice(0, 150))}</div>` : ""}
    </div>`).join("");
  box.scrollIntoView({ behavior: "smooth", block: "start" });
}

function finishWithScore(score, pctText) {
  S.history.push({
    id: cur.id, title: cur.title, ts: Date.now(), score,
    blind: cut(cur.blind, 500), simple: cut(cur.simple, 500), gaps: cut(cur.gaps, 300), exam: pctText
  });
  const gaps = [0, 1, 2, 4, 8, 15, 30];
  const q = (S.queue || []).find(x => x.path === cur.id);
  if (q) {
    q.rounds += 1; q.score = score;
    const gi = Math.min(gaps.length - 1, Math.max(1, score));
    q.nextTs = addDays(Date.now(), score >= 4 ? 15 : gaps[gi]);
  } else {
    S.queue.push({
      id: uid(), path: cur.id, title: cur.title,
      nextTs: addDays(Date.now(), score >= 4 ? 15 : gaps[score] || 2),
      score, rounds: 1
    });
  }
  const xp = cur.minMode ? XP_MIN_CHECK : XP_PER_CHECK + (score === 4 ? 20 : 0);
  grantXp(xp);
  saveState();
}
function exitFlow() {
  cur = null;
  document.getElementById("flow-view").style.display = "none";
  document.getElementById("home-view").style.display = "block";
  renderAll();
}

/* ---------- 设置 / 存档 ---------- */
function openSettings() {
  document.getElementById("api-key").value = S.apiKey || "";
  document.getElementById("settings-msg").textContent = "";
  document.getElementById("settings-modal").style.display = "flex";
}
async function testApi() {
  const key = document.getElementById("api-key").value.trim();
  const msg = document.getElementById("settings-msg");
  if (!key) { msg.className = "judge err"; msg.textContent = "先填 Key 再测"; return; }
  msg.className = "judge"; msg.textContent = "测试中……";
  try {
    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + key },
      body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "user", content: "回复：OK" }], max_tokens: 5 })
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    msg.className = "judge ok"; msg.textContent = "✅ 连接成功，AI 小白已就位";
  } catch (e) {
    msg.className = "judge err";
    msg.textContent = "❌ 连不上（Key 错误/网络/CORS）。别慌，自检模式照常可用。";
  }
}
function openSave(exporting) {
  const m = document.getElementById("save-modal");
  const title = document.getElementById("save-modal-title");
  const desc = document.getElementById("save-modal-desc");
  const txt = document.getElementById("save-modal-text");
  const msg = document.getElementById("save-modal-msg");
  msg.textContent = "";
  if (exporting) {
    m.dataset.mode = "export"; title.textContent = "📤 导出存档";
    desc.textContent = "复制下面整段文本存好（换电脑/换浏览器时导入即可恢复）。";
    txt.value = JSON.stringify(S);
  } else {
    m.dataset.mode = "import"; title.textContent = "📥 导入存档";
    desc.textContent = "把之前导出的整段 JSON 粘进来，覆盖当前进度。";
    txt.value = "";
  }
  m.style.display = "flex";
}
function confirmSave() {
  const m = document.getElementById("save-modal");
  const txt = document.getElementById("save-modal-text").value.trim();
  const msg = document.getElementById("save-modal-msg");
  if (m.dataset.mode === "export") { navigator.clipboard && navigator.clipboard.writeText(txt); m.style.display = "none"; toast("已复制到剪贴板"); return; }
  try {
    const obj = JSON.parse(txt);
    if (typeof obj.xp !== "number" || !Array.isArray(obj.history)) throw new Error("格式不对");
    S = Object.assign(loadState(), obj);
    saveState(); m.style.display = "none"; toast("存档已恢复 ✅");
  } catch (e) { msg.className = "judge err"; msg.textContent = "导入失败：" + e.message; }
}

/* ---------- 事件绑定 ---------- */
function bind() {
  document.getElementById("settings-btn").addEventListener("click", openSettings);
  document.getElementById("export-save-btn").addEventListener("click", () => openSave(true));
  document.getElementById("import-save-btn").addEventListener("click", () => openSave(false));
  document.getElementById("save-modal-ok").addEventListener("click", confirmSave);
  document.getElementById("save-modal-cancel").addEventListener("click", () => closeModal("save-modal"));
  document.getElementById("settings-ok").addEventListener("click", () => {
    S.apiKey = document.getElementById("api-key").value.trim(); saveState();
    closeModal("settings-modal"); toast(S.apiKey ? "已保存，AI 小白已就位 🤖" : "已清除 Key，自检模式");
  });
  document.getElementById("settings-clear").addEventListener("click", () => { document.getElementById("api-key").value = ""; });
  document.getElementById("settings-test").addEventListener("click", testApi);

  document.getElementById("launch-pick").addEventListener("click", openPick);
  document.getElementById("launch-paste").addEventListener("click", openPaste);
  document.getElementById("pick-cancel").addEventListener("click", () => closeModal("pick-modal"));
  document.getElementById("pick-search").addEventListener("input", e => renderNoteList(e.target.value));

  document.getElementById("paste-ok").addEventListener("click", () => {
    const title = document.getElementById("paste-title").value.trim() || "临时检验 " + todayStr();
    const content = document.getElementById("paste-content").value.trim();
    if (content.length < 50) { toast("内容太少（≥50字），粘点干的"); return; }
    closeModal("paste-modal");
    document.getElementById("paste-title").value = ""; document.getElementById("paste-content").value = "";
    beginSession({ id: "paste:" + title, title, content });
  });
  document.getElementById("paste-cancel").addEventListener("click", () => closeModal("paste-modal"));
  // 拖拽文件进粘贴框
  const pc = document.getElementById("paste-content");
  pc.addEventListener("dragover", e => { e.preventDefault(); });
  pc.addEventListener("drop", e => {
    e.preventDefault();
    const f = e.dataTransfer.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      pc.value = r.result;
      if (!document.getElementById("paste-title").value) document.getElementById("paste-title").value = f.name.replace(/\.(md|txt)$/i, "");
      toast("文件已读入 ✅");
    };
    r.readAsText(f, "utf-8");
  });

  document.getElementById("back-btn").addEventListener("click", exitFlow);
  document.getElementById("step1-next").addEventListener("click", step1Next);
  const s2 = document.getElementById("step2-next"); if (s2) s2.remove();
  const s3 = document.getElementById("step3-next"); if (s3) s3.remove();
  document.querySelectorAll(".score-btn").forEach(b => b.remove());
  document.getElementById("submit-exam").addEventListener("click", submitExam);
  document.getElementById("regen-exam").addEventListener("click", doQuiz);

  // 聊天：发送 / Enter / 快捷按钮
  document.getElementById("chat-send").addEventListener("click", () => sendChat(document.getElementById("chat-input").value));
  document.getElementById("chat-input").addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(e.target.value); }
  });
  document.querySelectorAll(".qk-btn").forEach(b => b.addEventListener("click", () => sendChat(b.dataset.q)));

  // 点弹窗遮罩关闭
  document.querySelectorAll(".modal-overlay").forEach(m => m.addEventListener("click", e => { if (e.target === m) m.style.display = "none"; }));
}

bind();
renderAll();

/* ---------- 深链：来自学习站的 ?check=路径 自动开检 ---------- */
(function deepLink() {
  try {
    const p = new URLSearchParams(location.search).get("check");
    if (!p || !window.NOTES_INDEX) return;
    const target = decodeURIComponent(p);
    const n = (window.NOTES_INDEX.notes || []).find(x => x.path === target || x.path === p);
    if (n) beginSession({ id: n.path, title: n.title, content: n.content });
    else toast("学习站传来的笔记不在索引里，手动选一下～");
  } catch (e) { console.warn(e); }
})();
