// AI 冒险岛 · 练习场 —— 全部前端逻辑
// 包含：Pyodide 加载器（多 CDN 顺序重试 + 超时与降级 + 手动重试）、进度管理（localStorage）、两个页面的渲染

/* ================= 进度持久化 ================= */

const STORAGE_KEY = "ai-adventure-progress-v1";

// 读取进度：{ xp: 数字, tasks: { 任务id: true } }
function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      return { xp: data.xp || 0, tasks: data.tasks || {} };
    }
  } catch (e) {
    console.warn("进度读取失败，已重置", e);
  }
  return { xp: 0, tasks: {} };
}

function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.warn("进度保存失败", e);
  }
}

// 某课已完成的任务数
function lessonDoneCount(lesson, progress) {
  return lesson.tasks.filter((t) => progress.tasks[t.id]).length;
}

// 某课是否全部完成（用于徽章）
function isLessonComplete(lesson, progress) {
  return lessonDoneCount(lesson, progress) === lesson.tasks.length;
}

// 解锁规则：第一课直接解锁；其余课要求前一课完成 60% 以上的任务
function isLessonUnlocked(index, progress) {
  if (index === 0) return true;
  const prev = LESSONS[index - 1];
  const ratio = lessonDoneCount(prev, progress) / prev.tasks.length;
  return ratio >= 0.6;
}

// 每个任务值多少 XP：试炼题（trial）固定 40 XP；普通题把课程 XP 平摊（四舍五入）
function taskXp(lesson, task) {
  if (task.trial) return 40;
  const normalCount = lesson.tasks.filter((t) => !t.trial).length;
  return Math.round(lesson.xp / normalCount);
}

// 等级：每 100 XP 升一级
function levelOf(xp) {
  return Math.floor(xp / 100) + 1;
}

/* ================= 顶栏 XP 区 ================= */

function renderXpBar(progress) {
  const xp = progress.xp;
  const level = levelOf(xp);
  const inLevel = xp % 100; // 当前等级内的进度
  const fill = document.getElementById("xp-fill");
  const text = document.getElementById("xp-text");
  const badge = document.getElementById("level-badge");
  if (fill) fill.style.width = inLevel + "%";
  if (text) text.textContent = xp + " XP";
  if (badge) badge.textContent = "Lv." + level;
}

/* ================= Pyodide 引擎 ================= */

// 多 CDN 线路：国内访问 jsdelivr/unpkg 经常超时，按顺序自动切换；
// npmmirror 是淘宝镜像，国内最稳。indexURL 必须指向对应源的 full 目录（wasm 等文件从同一线路取）
const PYODIDE_SOURCES = [
  { name: "jsDelivr", script: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js", indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/" },
  { name: "unpkg", script: "https://unpkg.com/pyodide@0.26.4/full/pyodide.js", indexURL: "https://unpkg.com/pyodide@0.26.4/full/" },
  { name: "npmmirror 镜像", script: "https://registry.npmmirror.com/pyodide/0.26.4/files/full/pyodide.js", indexURL: "https://registry.npmmirror.com/pyodide/0.26.4/files/full/" },
];
const SOURCE_TIMEOUT = 28000; // 每条线路的超时：28 秒，超时自动切下一条
const RUN_TIMEOUT = 15000; // 用户代码运行超时：15 秒

let pyodideInstance = null;
let pyodidePromise = null;

// 动态创建 script 标签加载 JS，用 onload/onerror 判定成败
function loadScript(url) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = url;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("pyodide.js 下载失败"));
    document.head.appendChild(s);
  });
}

// 单条线路：下载 pyodide.js → 用对应源的 indexURL 初始化
async function trySource(src) {
  await loadScript(src.script);
  if (typeof loadPyodide !== "function") {
    throw new Error("pyodide.js 内容不对（可能离线或 CDN 被拦截）");
  }
  const p = await loadPyodide({ indexURL: src.indexURL });
  pyodideInstance = p;
  return p;
}

// 加载 Pyodide（只加载一次）：按顺序尝试各 CDN 线路，每条 28 秒超时；
// onStatus(当前线路号, 总线路数, 线路名) 用于页面显示加载进度；全部失败才 reject 进降级模式
function loadEngine(onStatus) {
  if (pyodidePromise) return pyodidePromise;
  pyodidePromise = (async () => {
    let lastErr = null;
    for (let i = 0; i < PYODIDE_SOURCES.length; i++) {
      const src = PYODIDE_SOURCES[i];
      if (onStatus) onStatus(i + 1, PYODIDE_SOURCES.length, src.name);
      try {
        return await Promise.race([
          trySource(src),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("超过 " + SOURCE_TIMEOUT / 1000 + " 秒无响应")), SOURCE_TIMEOUT)
          ),
        ]);
      } catch (err) {
        lastErr = err;
        console.warn("Pyodide 线路 " + (i + 1) + "（" + src.name + "）失败：", err);
      }
    }
    // 全部失败：清空缓存的 Promise，让「重试加载引擎」能重新走一遍流程
    pyodidePromise = null;
    throw new Error("3 条线路都连不上（最后：" + (lastErr ? lastErr.message : "未知错误") + "）");
  })();
  return pyodidePromise;
}

// 在 Pyodide 里运行用户代码，返回 { output, error }
// stdinLines：可选，交互式代码的喂入输入（字符串数组），通过 input() shim 注入
async function runUserCode(code, stdinLines) {
  const pyodide = pyodideInstance;
  let output = "";
  // 捕获 print 的 stdout 和报错信息
  pyodide.setStdout({ batched: (s) => { output += s + "\n"; } });
  pyodide.setStderr({ batched: (s) => { output += s + "\n"; } });
  // 有喂入输入时，把 input() 换成从数组依次取值（Pyodide 里没有真终端）
  let finalCode = code;
  if (stdinLines && stdinLines.length > 0) {
    finalCode =
      "import builtins\n" +
      "_inputs = iter(" + JSON.stringify(stdinLines) + ")\n" +
      "builtins.input = lambda *a: next(_inputs)\n" +
      code;
  }
  try {
    // 加超时，防止 while True 之类的死循环把页面卡死
    await Promise.race([
      pyodide.runPythonAsync(finalCode),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("运行超时（超过 15 秒），检查是不是有死循环？")), RUN_TIMEOUT)
      ),
    ]);
    return { output: output, error: null };
  } catch (err) {
    return { output: output, error: String(err && err.message ? err.message : err) };
  }
}

/* ================= 判题 ================= */

// 统一收尾：统一换行符、行尾空白，并把全角标点映射为半角
// （新手常因输入法打出全角 ，！；等，肉眼无法区分，判题对两边统一后再比）
const FULLWIDTH_MAP = {
  "，": ",", "。": ".", "！": "!", "？": "?", "；": ";", "：": ":",
  "（": "(", "）": ")", "“": "\"", "”": "\"", "‘": "'", "’": "'"
};
function normalize(s) {
  return String(s)
    .replace(/\r\n/g, "\n")
    .replace(/[，。！？；：（）“”‘’]/g, (c) => FULLWIDTH_MAP[c])
    .split("\n")
    .map((line) => line.replace(/\s+$/, ""))
    .join("\n")
    .replace(/\s+$/, "");
}

// 三种判法：exact 精确匹配 / contains 包含某文本 / regex 正则
function judge(check, output) {
  const out = normalize(output);
  if (check.type === "exact") {
    return out === normalize(check.expected);
  }
  if (check.type === "contains") {
    return out.includes(check.expected);
  }
  if (check.type === "regex") {
    try {
      return new RegExp(check.expected).test(out);
    } catch (e) {
      console.error("判题正则写错了：", check.expected, e);
      return false;
    }
  }
  return false;
}

/* ================= 首页（冒险地图） ================= */

function renderHome() {
  const progress = loadProgress();
  renderXpBar(progress);

  // 课程卡片
  const grid = document.getElementById("lesson-grid");
  grid.innerHTML = "";
  LESSONS.forEach((lesson, i) => {
    const unlocked = isLessonUnlocked(i, progress);
    const done = lessonDoneCount(lesson, progress);
    const total = lesson.tasks.length;
    const complete = done === total;

    const card = document.createElement("a");
    card.className = "lesson-card" + (unlocked ? "" : " locked");
    card.href = unlocked ? "lesson.html?id=" + lesson.id : "#";

    let statusHtml;
    if (complete) {
      statusHtml = '<span class="card-status done">✅ 已完成</span>';
    } else if (done > 0) {
      statusHtml = '<span class="card-status doing">⚔️ ' + done + "/" + total + "</span>";
    } else {
      statusHtml = '<span class="card-status" style="color:var(--text-dim)">🗺️ 未开始</span>';
    }

    card.innerHTML =
      '<div class="icon">' + lesson.icon + "</div>" +
      "<h3>" + lesson.title + "</h3>" +
      "<p>" + lesson.intro + "</p>" +
      '<div class="card-foot"><span class="card-xp">⭐ ' + lesson.xp + " XP</span>" + statusHtml + "</div>";
    grid.appendChild(card);
  });

  // 徽章墙：完成整课点亮对应徽章
  const wall = document.getElementById("badge-wall");
  wall.innerHTML = "";
  LESSONS.forEach((lesson) => {
    const badge = document.createElement("div");
    const earned = isLessonComplete(lesson, progress);
    badge.className = "badge" + (earned ? " earned" : "");
    badge.title = lesson.title + (earned ? "（已获得）" : "（未获得）");
    badge.innerHTML = lesson.icon + "<small>" + lesson.title + "</small>";
    wall.appendChild(badge);
  });
}

/* ================= 学习页 ================= */

// 转义 HTML，防止代码块里的 < > 被当成标签
function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function getLessonById(id) {
  return LESSONS.find((l) => l.id === id) || null;
}

function renderLesson() {
  const params = new URLSearchParams(location.search);
  const lesson = getLessonById(params.get("id"));

  if (!lesson) {
    document.getElementById("lesson-title").textContent = "找不到这节课";
    return;
  }

  // 未解锁直接踢回首页
  const index = LESSONS.indexOf(lesson);
  const progress = loadProgress();
  if (!isLessonUnlocked(index, progress)) {
    location.href = "index.html";
    return;
  }

  document.getElementById("lesson-title").textContent = lesson.icon + " " + lesson.title;
  renderXpBar(progress);

  // 左侧：知识卡片
  const contentCol = document.getElementById("content-col");
  contentCol.innerHTML = "";
  lesson.sections.forEach((sec) => {
    const card = document.createElement("div");
    card.className = "section-card";
    let html = "<h3>" + sec.title + "</h3><p>" + sec.body + "</p>";
    if (sec.code) html += "<pre><code>" + esc(sec.code) + "</code></pre>";
    if (sec.output) html += '<pre class="output-block">' + esc(sec.output) + "</pre>";
    card.innerHTML = html;
    contentCol.appendChild(card);
  });

  // 右侧：任务卡
  const practiceCol = document.getElementById("practice-col");
  practiceCol.innerHTML = "";
  lesson.tasks.forEach((task) => {
    practiceCol.appendChild(buildTaskCard(lesson, task));
  });

  // 后台加载 Python 引擎，并更新状态条
  initEngineStatus();
}

function buildTaskCard(lesson, task) {
  const progress = loadProgress();
  const done = !!progress.tasks[task.id];

  const card = document.createElement("div");
  card.className = "task-card" + (task.trial ? " trial" : "") + (done ? " done" : "");
  card.id = "card-" + task.id;
  card.style.position = "relative";

  // 试炼题：🔥 标记 + 考场说明，不渲染提示按钮
  const trialTag = task.trial ? ' <span class="trial-tag">🔥 试炼 · 无提示</span>' : "";
  const trialNote = task.trial ? '<p class="trial-note">真实考场：没有提示，运行后才知道对错</p>' : "";
  const hintBtnHtml = task.trial ? "" : '<button class="hint-btn">💡 提示</button>';

  card.innerHTML =
    '<div class="task-title-row"><span class="task-check">✅</span><h3>' + task.title + trialTag +
    ' <span style="color:var(--gold);font-size:13px">+' + taskXp(lesson, task) + " XP</span></h3></div>" +
    '<p class="task-prompt">' + task.prompt + "</p>" +
    trialNote +
    '<textarea class="editor" spellcheck="false"></textarea>' +
    '<div class="btn-row"><button class="run-btn">▶ 运行</button>' + hintBtnHtml + "</div>" +
    '<div class="hint-list"></div>' +
    '<div class="output-box"></div>' +
    '<div class="judge"></div>';

  const editor = card.querySelector(".editor");
  editor.value = task.starterCode;

  // Tab 键插入 4 个空格（而不是跳出输入框）
  editor.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      editor.value = editor.value.slice(0, start) + "    " + editor.value.slice(end);
      editor.selectionStart = editor.selectionEnd = start + 4;
    }
  });

  const runBtn = card.querySelector(".run-btn");
  runBtn.addEventListener("click", () => handleRun(lesson, task, card));

  // 「💡 提示」按钮：每点一次展开一条提示（hints 逐步逼近，不给完整答案）
  // 试炼题没有提示按钮，hintBtn 为 null，直接跳过
  const hintBtn = card.querySelector(".hint-btn");
  if (hintBtn) {
    const hintList = card.querySelector(".hint-list");
    let shownHints = 0;
    hintBtn.addEventListener("click", () => {
      if (shownHints >= task.hints.length) return;
      const item = document.createElement("div");
      item.className = "hint-item";
      item.innerHTML = "💡 提示 " + (shownHints + 1) + "/" + task.hints.length + "：" + task.hints[shownHints];
      hintList.appendChild(item);
      shownHints++;
      if (shownHints >= task.hints.length) {
        hintBtn.disabled = true;
        hintBtn.textContent = "💡 提示已用完";
      } else {
        hintBtn.textContent = "💡 提示（还有 " + (task.hints.length - shownHints) + " 条）";
      }
    });
  }

  return card;
}

// 点「运行」：引擎可用就真跑，降级模式就走对照
async function handleRun(lesson, task, card) {
  const runBtn = card.querySelector(".run-btn");
  const outputBox = card.querySelector(".output-box");
  const judgeBox = card.querySelector(".judge");
  const code = card.querySelector(".editor").value;

  judgeBox.textContent = "";
  judgeBox.className = "judge";

  if (!pyodideInstance) {
    // 降级模式：不能真跑，只显示期望输出供自查（不给答案代码）
    const expected = task.check.type === "exact" ? task.check.expected : "（见题目描述中的期望输出）";
    outputBox.textContent = "（对照模式）Python 引擎未加载，无法真实运行。\n期望输出：\n" + expected +
      "\n\n请对照期望输出检查你的代码；卡住了可以点「💡 提示」逐级获取思路。确认无误后点「标记完成」。";
    showFallbackMarkButton(lesson, task, card);
    showFallbackRetryButton(card);
    return;
  }

  runBtn.disabled = true;
  runBtn.textContent = "⏳ 运行中…";
  outputBox.textContent = "";

  const { output, error } = await runUserCode(code);

  runBtn.disabled = false;
  runBtn.textContent = "▶ 运行";

  if (error) {
    // 代码报错了：把错误信息显示出来，帮助学生改
    outputBox.textContent = (output ? output + "\n" : "") + "❌ 报错：\n" + error;
    judgeBox.textContent = "❌ 代码报错了，对照报错信息改一改再试";
    judgeBox.classList.add("fail");
    return;
  }

  outputBox.textContent = output || "（没有输出——是不是忘了 print？）";

  if (judge(task.check, output)) {
    markTaskPassed(lesson, task, card, judgeBox);
  } else {
    judgeBox.textContent = "❌ 输出和期望不一致，再检查一下（注意空格和标点）";
    judgeBox.classList.add("fail");
  }
}

// 判题通过：打勾 + 加 XP + 存 localStorage + 动效
function markTaskPassed(lesson, task, card, judgeBox) {
  const progress = loadProgress();
  const firstTime = !progress.tasks[task.id];

  progress.tasks[task.id] = true;
  if (firstTime) {
    progress.xp += taskXp(lesson, task);
  }
  saveProgress(progress);
  renderXpBar(progress);

  card.classList.add("done", "just-passed");
  judgeBox.textContent = firstTime
    ? "🎉 通过！+" + taskXp(lesson, task) + " XP"
    : "✅ 通过！（之前已拿过 XP）";
  judgeBox.classList.add("pass");

  // XP 飘字动效
  if (firstTime) {
    const float = document.createElement("div");
    float.className = "xp-float";
    float.textContent = "+" + taskXp(lesson, task) + " XP";
    card.appendChild(float);
    setTimeout(() => float.remove(), 1300);
  }
  setTimeout(() => card.classList.remove("just-passed"), 700);
}

// 降级模式：在按钮区加一个「标记完成」按钮（不展示任何答案代码）
function showFallbackMarkButton(lesson, task, card) {
  const btnRow = card.querySelector(".btn-row");
  if (!btnRow.querySelector(".mark-btn")) {
    const markBtn = document.createElement("button");
    markBtn.className = "run-btn mark-btn";
    markBtn.textContent = "✅ 我已对照期望输出，标记完成";
    markBtn.addEventListener("click", () => {
      const judgeBox = card.querySelector(".judge");
      markTaskPassed(lesson, task, card, judgeBox);
    });
    btnRow.appendChild(markBtn);
  }
}

// 降级模式：除了「标记完成」，再加一个「重试加载引擎」按钮；
// 引擎真加载成功后，把降级用的「标记完成」按钮也撤掉，恢复正常运行判题
function showFallbackRetryButton(card) {
  const btnRow = card.querySelector(".btn-row");
  if (btnRow.querySelector(".retry-engine-btn")) return;
  const retryBtn = makeRetryButton(() => {
    const markBtn = btnRow.querySelector(".mark-btn");
    if (markBtn) markBtn.remove();
  });
  btnRow.appendChild(retryBtn);
}

// 引擎就绪后的统一提示（lesson 页状态条存在时才更新）
function setEngineReady() {
  const status = document.getElementById("engine-status");
  if (!status) return;
  status.className = "engine-status ready";
  status.textContent = "🐍 Python 引擎已就绪，写代码点「运行」即可真跑！";
}

// 「🔄 重试加载引擎」按钮：重新走一遍多 CDN 流程，成功后自删并回调 onReady
function makeRetryButton(onReady) {
  const btn = document.createElement("button");
  btn.className = "run-btn retry-engine-btn";
  btn.textContent = "🔄 重试加载引擎";
  btn.addEventListener("click", async () => {
    btn.disabled = true;
    try {
      await loadEngine((line, total, name) => {
        btn.textContent = "⏳ 加载中（线路 " + line + "/" + total + "：" + name + "）…";
      });
      btn.remove();
      setEngineReady();
      if (onReady) onReady();
    } catch (err) {
      btn.disabled = false;
      btn.textContent = "🔄 重试加载引擎";
      console.warn("重试加载 Pyodide 仍失败：", err);
    }
  });
  return btn;
}

// 引擎状态条：加载中（显示当前线路）→ 就绪 / 降级（附重试按钮）
function initEngineStatus() {
  const status = document.getElementById("engine-status");
  status.className = "engine-status loading";

  loadEngine((line, total, name) => {
    status.textContent = "⏳ 正在加载 Python 引擎（线路 " + line + "/" + total + "：" + name + "）…";
  })
    .then(() => {
      setEngineReady();
    })
    .catch((err) => {
      console.warn("Pyodide 加载失败，进入对照模式：", err);
      status.className = "engine-status fallback";
      status.textContent = "⚠️ Python 引擎加载失败（" + err.message + "）。已进入「对照模式」：点「运行」会显示期望输出供自查，确认无误后可手动标记完成；卡住了可以点「💡 提示」逐级获取思路。";
      status.appendChild(makeRetryButton());
    });
}

/* ================= 今日任务（按日期静态轮换，无需后端） ================= */

const CHECKIN_KEY = "daily-checkins-v1";

function dateStamp(d) {
  return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
}

function loadCheckins() {
  try {
    return JSON.parse(localStorage.getItem(CHECKIN_KEY)) || {};
  } catch (e) {
    return {};
  }
}

// 连续打卡天数：从今天往前数，连续有打卡记录的天数
function streakOf(checkins) {
  let n = 0;
  const d = new Date();
  while (checkins[dateStamp(d)]) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

// 找出默写输出和期望的第一处差异，给提示但不泄露完整答案
function diffHint(expected, actual) {
  const e = String(expected).split("\n");
  const a = String(actual).replace(/\s+$/, "").split("\n");
  for (let i = 0; i < Math.max(e.length, a.length); i++) {
    if (e[i] !== a[i]) {
      return "第 " + (i + 1) + " 行不一致——期望「" + (e[i] === undefined ? "（没有这一行）" : e[i]) +
        "」，你的输出是「" + (a[i] === undefined ? "（没有这一行）" : a[i]) + "」";
    }
  }
  return "输出看起来一致但没判过，检查是不是多了行尾空格或空行";
}

// 拼接默写判题源码：given（题面给定数据）在前、用户默写代码在后。
// 若用户代码里已经自己写了 given 中全部赋值（如 raw = "..."），说明他连数据一起默了，
// 就不再重复拼接，直接运行用户代码（否则重复赋值虽无害，但以用户写的数据为准更贴合默写本意）
function buildDictationSource(dictation, userCode) {
  const given = (dictation.given || "").trim();
  if (!given) return userCode;
  // 从 given 里挑出赋值行的变量名（注释行不算）
  const idents = given.split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const m = l.match(/^([A-Za-z_]\w*)\s*=/);
      return m ? m[1] : null;
    })
    .filter(Boolean);
  // given 只有注释（无赋值）时 idents 为空，直接拼接（注释拼进去无害）
  const allWritten = idents.length > 0 && idents.every((name) =>
    new RegExp("(^|\\n)\\s*" + name + "\\s*=").test(userCode));
  return allWritten ? userCode : given + "\n" + userCode;
}

function renderDaily() {
  const box = document.getElementById("daily-section");
  if (!box || typeof DAILY_DICTATION === "undefined") return;

  // 静态轮换：天数对数组长度取模，默写和项目每天各自动换一条
  const dayIndex = Math.floor(Date.now() / 86400000);
  const dictation = DAILY_DICTATION[dayIndex % DAILY_DICTATION.length];
  const project = DAILY_PROJECTS[dayIndex % DAILY_PROJECTS.length];

  const checkins = loadCheckins();
  const checkedToday = !!checkins[dateStamp(new Date())];
  const streak = streakOf(checkins);

  box.innerHTML =
    '<h2 class="section-title">📅 今日任务' +
    ' <span class="streak-badge" id="streak-badge">🔥 已连续打卡 ' + streak + " 天</span></h2>" +
    '<div class="daily-grid">' +
    // 左卡：今日默写（空白编辑器 + 运行判卷，判对自动打卡）
    '<div class="daily-card">' +
    "<h3>✍️ 今日默写：" + dictation.title + "</h3>" +
    '<p class="daily-goal">' + dictation.goal + "</p>" +
    '<p class="daily-note">📌 默写要点：' + dictation.note + "</p>" +
    '<p class="daily-sub">📦 给定数据（题面已提供，判卷时会自动拼在你的代码前面，自己照抄一遍也行）：</p>' +
    '<pre class="daily-code"><code>' + esc(dictation.given) + "</code></pre>" +
    '<p class="daily-sub">🎯 期望输出（你的程序跑完要印出这个）：</p>' +
    '<pre class="daily-code"><code>' + esc(dictation.expected) + "</code></pre>" +
    '<p class="daily-warn">默写的意义是空手写——编辑器不预填任何代码；写完点「运行判卷」，默完再点开对答案</p>' +
    '<textarea class="editor daily-editor" id="daily-editor" spellcheck="false" placeholder="在这里默写完整程序，一行都不少，然后点「运行判卷」"></textarea>' +
    '<div class="btn-row">' +
    '<button class="run-btn" id="daily-run-btn">▶ 运行判卷</button>' +
    '<button class="hint-btn daily-toggle" data-open="👀 对答案" data-target="dict-answer">👀 对答案</button>' +
    '<button class="run-btn" id="daily-check-btn"' + (checkedToday ? " disabled" : "") + ">" +
    (checkedToday ? "✅ 今日已打卡" : "✅ 我默写完了") + "</button></div>" +
    '<div class="output-box" id="daily-output"></div>' +
    '<div class="judge" id="daily-judge"></div>' +
    '<pre class="daily-code" id="dict-answer" style="display:none"><code>' + esc(dictation.code) + "</code></pre>" +
    "</div>" +
    // 右卡：今日小项目（四段渐进：要干嘛 → 逻辑步骤 → 代码框架 → 完整代码）
    '<div class="daily-card">' +
    "<h3>🔍 今日小项目：" + project.title + "</h3>" +
    '<p class="daily-goal">① 这程序要干嘛：' + project.desc + "</p>" +
    '<p class="daily-note">② 逻辑步骤：</p>' +
    '<ol class="daily-points">' +
    project.logic.map((s) => "<li>" + s + "</li>").join("") +
    "</ol>" +
    '<p class="daily-warn">读法：先读逻辑 → 对着框架自己脑补实现 → 最后才对完整代码</p>' +
    '<div class="btn-row">' +
    '<button class="hint-btn daily-toggle" data-open="🦴 看框架" data-target="proj-skel">🦴 看框架</button>' +
    '<button class="hint-btn daily-toggle" data-open="📜 看完整代码" data-target="proj-full">📜 看完整代码</button></div>' +
    '<p class="daily-sub">③ 代码框架（删掉实现，只剩骨架）：</p>' +
    '<pre class="daily-code" id="proj-skel" style="display:none"><code>' + esc(project.skeleton) + "</code></pre>" +
    '<p class="daily-sub">④ 完整代码：</p>' +
    '<pre class="daily-code" id="proj-full" style="display:none"><code>' + esc(project.code) + "</code></pre>" +
    '<p class="daily-note">📌 读代码要点：</p>' +
    '<ul class="daily-points">' +
    project.points.map((p) => "<li>" + p + "</li>").join("") +
    "</ul>" +
    '<p class="daily-challenge">🎯 看懂后自己改：' + project.challenge + "</p>" +
    "</div>" +
    "</div>";

  // 折叠代码区：按钮通过 data-target 指向要开合的 pre（一卡可有多个折叠区）
  box.querySelectorAll(".daily-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const pre = document.getElementById(btn.dataset.target);
      if (!pre) return;
      const hidden = pre.style.display === "none";
      pre.style.display = hidden ? "block" : "none";
      btn.textContent = hidden ? "🙈 收起" : btn.dataset.open;
    });
  });

  // 打卡（手动按钮与判卷通过共用）：原地更新按钮和连续天数，不重渲染（保住编辑器内容）
  const markDailyChecked = () => {
    const ci = loadCheckins();
    ci[dateStamp(new Date())] = dictation.id;
    try {
      localStorage.setItem(CHECKIN_KEY, JSON.stringify(ci));
    } catch (e) {
      console.warn("打卡保存失败", e);
    }
    const btn = document.getElementById("daily-check-btn");
    if (btn) { btn.disabled = true; btn.textContent = "✅ 今日已打卡"; }
    const badge = document.getElementById("streak-badge");
    if (badge) badge.textContent = "🔥 已连续打卡 " + streakOf(ci) + " 天";
  };

  const checkBtn = document.getElementById("daily-check-btn");
  if (checkBtn && !checkedToday) {
    checkBtn.addEventListener("click", markDailyChecked);
  }

  // 默写编辑器：Tab 键插入 4 个空格
  const dailyEditor = document.getElementById("daily-editor");
  dailyEditor.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = dailyEditor.selectionStart;
      const end = dailyEditor.selectionEnd;
      dailyEditor.value = dailyEditor.value.slice(0, start) + "    " + dailyEditor.value.slice(end);
      dailyEditor.selectionStart = dailyEditor.selectionEnd = start + 4;
    }
  });

  // 「运行判卷」：懒加载引擎 → 跑默写代码（交互式曲目注入 input shim）→ 对比期望输出
  document.getElementById("daily-run-btn").addEventListener("click", async () => {
    const runBtn = document.getElementById("daily-run-btn");
    const out = document.getElementById("daily-output");
    const jg = document.getElementById("daily-judge");
    jg.textContent = "";
    jg.className = "judge";

    // 引擎未加载则现场加载（显示当前线路进度）；失败降级为手动对照：显示期望输出 + 重试按钮
    if (!pyodideInstance) {
      runBtn.disabled = true;
      runBtn.textContent = "⏳ 正在加载 Python 引擎…";
      try {
        await loadEngine((line, total, name) => {
          runBtn.textContent = "⏳ 正在加载 Python 引擎（线路 " + line + "/" + total + "：" + name + "）…";
        });
      } catch (e) {
        runBtn.disabled = false;
        runBtn.textContent = "▶ 运行判卷";
        out.textContent = "（Python 引擎加载失败，无法在线判卷）\n请在本地运行你的默写，对照期望输出：\n" +
          dictation.expected + "\n\n确认一致后点「我默写完了」手动打卡；也可以点「🔄 重试加载引擎」再试一次在线判卷。";
        // 重试按钮：重新走一遍多 CDN 加载，成功后即可正常在线判卷
        if (!document.getElementById("daily-retry-btn")) {
          const retryBtn = makeRetryButton(() => {
            out.textContent = "🐍 Python 引擎已就绪，再点「▶ 运行判卷」即可在线判卷！";
          });
          retryBtn.id = "daily-retry-btn";
          runBtn.parentNode.appendChild(retryBtn);
        }
        return;
      }
    }

    runBtn.disabled = true;
    runBtn.textContent = "⏳ 判卷中…";
    const { output, error } = await runUserCode(buildDictationSource(dictation, dailyEditor.value), dictation.stdin || null);
    runBtn.disabled = false;
    runBtn.textContent = "▶ 运行判卷";

    if (error) {
      out.textContent = (output ? output + "\n" : "") + "❌ 报错：\n" + error;
      jg.textContent = "❌ 默写代码报错了，对照报错信息改一改再判";
      jg.classList.add("fail");
      return;
    }
    out.textContent = output || "（没有输出——是不是忘了 print？）";

    if (judge({ type: "exact", expected: dictation.expected }, output)) {
      jg.textContent = "🎉 默写全对！已自动完成今日打卡";
      jg.classList.add("pass");
      markDailyChecked();
    } else {
      jg.textContent = "❌ 还差一点：" + diffHint(dictation.expected, output);
      jg.classList.add("fail");
    }
  });
}

/* ================= 存档导出 / 导入 =================
   localStorage 按 origin 隔离：双击 file:// 和 http://localhost 是两套进度。
   导出把进度包成一段 JSON 文本复制到剪贴板（失败则弹窗手动复制），
   导入粘贴回来、校验格式后写回 localStorage。 */

const SAVE_MARK = "ai-adventure-save";

// 底部飘出的提示条
function showSaveToast(msg) {
  const toast = document.createElement("div");
  toast.className = "save-toast";
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

// 校验并解析存档文本，合法返回 { xp, tasks }，否则返回 null
function parseSave(text) {
  let obj;
  try {
    obj = JSON.parse(text);
  } catch (e) {
    return null;
  }
  if (!obj || obj.app !== SAVE_MARK || !obj.data) return null;
  const d = obj.data;
  if (typeof d.xp !== "number" || !isFinite(d.xp) || d.xp < 0) return null;
  if (!d.tasks || typeof d.tasks !== "object" || Array.isArray(d.tasks)) return null;
  for (const k in d.tasks) {
    if (typeof d.tasks[k] !== "boolean") return null;
  }
  return { xp: Math.floor(d.xp), tasks: d.tasks };
}

// 打开弹窗：mode 为 "export"（降级手动复制）或 "import"（粘贴导入）
function openSaveModal(mode, preset) {
  const modal = document.getElementById("save-modal");
  const title = document.getElementById("save-modal-title");
  const desc = document.getElementById("save-modal-desc");
  const text = document.getElementById("save-modal-text");
  const msg = document.getElementById("save-modal-msg");
  const okBtn = document.getElementById("save-modal-ok");

  msg.textContent = "";
  msg.className = "judge";

  if (mode === "export") {
    title.textContent = "📤 导出存档";
    desc.textContent = "自动复制失败了，请手动全选复制下面这段文本，粘贴保存到笔记里即可：";
    text.value = preset;
    text.readOnly = true;
    okBtn.style.display = "none";
    modal.style.display = "flex";
    text.focus();
    text.select();
  } else {
    title.textContent = "📥 导入存档";
    desc.textContent = "把之前导出的存档文本粘贴到下面，点「确认导入」：";
    text.value = "";
    text.readOnly = false;
    okBtn.style.display = "";
    modal.style.display = "flex";
    text.focus();
  }
}

function exportSave() {
  const payload = JSON.stringify({ app: SAVE_MARK, version: 1, data: loadProgress() });
  // 剪贴板 API 在 file:// 或非安全上下文可能不可用，失败降级为弹窗手动复制
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(payload)
      .then(() => showSaveToast("✅ 已复制，粘贴保存到笔记里即可"))
      .catch(() => openSaveModal("export", payload));
  } else {
    openSaveModal("export", payload);
  }
}

function importSave() {
  const text = document.getElementById("save-modal-text");
  const msg = document.getElementById("save-modal-msg");
  const progress = parseSave(text.value.trim());
  if (!progress) {
    msg.textContent = "❌ 存档格式不对：请确认完整复制了导出的那段文本（以 { 开头、以 } 结尾）";
    msg.classList.add("fail");
    return;
  }
  saveProgress(progress);
  showSaveToast("✅ 存档导入成功");
  location.reload();
}

// 绑定首页的存档按钮与弹窗事件（学习页没有这些元素，直接跳过）
function initSaveUI() {
  const exportBtn = document.getElementById("export-save-btn");
  if (!exportBtn) return;
  exportBtn.addEventListener("click", exportSave);
  document.getElementById("import-save-btn").addEventListener("click", () => openSaveModal("import"));
  document.getElementById("save-modal-ok").addEventListener("click", importSave);
  document.getElementById("save-modal-cancel").addEventListener("click", () => {
    document.getElementById("save-modal").style.display = "none";
  });
  // 点遮罩空白处关闭弹窗
  document.getElementById("save-modal").addEventListener("click", (e) => {
    if (e.target.id === "save-modal") e.target.style.display = "none";
  });
}

/* ================= 入口 ================= */

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("lesson-grid")) {
    renderHome();
    renderDaily();
    initSaveUI();
  } else if (document.getElementById("lesson-title")) {
    renderLesson();
  }
});
