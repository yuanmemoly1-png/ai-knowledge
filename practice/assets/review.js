// AI 冒险岛 · 复习中心 —— 渲染、判题、错题管理、正确率统计
// 进度存 localStorage 键 review-progress-v1：
//   { stats: { uid: {seen, right, last} }, wrong: { uid: streak } }
//   uid = "主题id#题号"；wrong 里 streak 为连续答对次数，到 2 自动移出错题本
(function () {
  "use strict";

  var LS_KEY = "review-progress-v1";

  function loadProgress() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (raw) {
        var p = JSON.parse(raw);
        if (p && typeof p === "object") {
          return { stats: p.stats || {}, wrong: p.wrong || {} };
        }
      }
    } catch (e) { /* 损坏的存档直接重置 */ }
    return { stats: {}, wrong: {} };
  }

  function saveProgress() {
    localStorage.setItem(LS_KEY, JSON.stringify(progress));
  }

  var progress = loadProgress();

  // ---------- 工具 ----------
  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function uid(topicId, idx) { return topicId + "#" + idx; }

  function fmtTime(ts) {
    if (!ts) return "从未练习";
    var d = new Date(ts);
    var today = new Date();
    var sameDay = d.toDateString() === today.toDateString();
    if (sameDay) return "今天 " + d.getHours() + ":" + String(d.getMinutes()).padStart(2, "0");
    return (d.getMonth() + 1) + "月" + d.getDate() + "日";
  }

  // 填空判定：去空白、忽略大小写
  function normFill(s) {
    return String(s).replace(/\s+/g, "").toLowerCase();
  }

  // 记录一次作答，返回是否正确
  function record(topicId, idx, correct) {
    var id = uid(topicId, idx);
    var st = progress.stats[id] || { seen: 0, right: 0, last: 0 };
    st.seen += 1;
    if (correct) st.right += 1;
    st.last = Date.now();
    progress.stats[id] = st;

    if (correct) {
      if (id in progress.wrong) {
        progress.wrong[id] += 1;
        if (progress.wrong[id] >= 2) delete progress.wrong[id]; // 连续答对 2 次移出
      }
    } else {
      progress.wrong[id] = 0; // 答错收进错题本（重置连对计数）
    }
    saveProgress();
    updateWrongBadge();
    return correct;
  }

  function findQuestion(id) {
    var parts = id.split("#");
    var topic = null;
    for (var i = 0; i < QUIZ_TOPICS.length; i++) {
      if (QUIZ_TOPICS[i].id === parts[0]) { topic = QUIZ_TOPICS[i]; break; }
    }
    if (!topic) return null;
    var q = topic.questions[Number(parts[1])];
    return q ? { topic: topic, idx: Number(parts[1]), q: q } : null;
  }

  // ---------- 模式切换 ----------
  var tabs = document.querySelectorAll(".mode-tab");
  var panels = {
    topics: document.getElementById("panel-topics"),
    career: document.getElementById("panel-career"),
    wrong: document.getElementById("panel-wrong")
  };

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) { t.classList.remove("active"); });
      tab.classList.add("active");
      var mode = tab.dataset.mode;
      Object.keys(panels).forEach(function (k) {
        panels[k].style.display = k === mode ? "" : "none";
      });
      if (mode === "topics") renderTopicGrid();
      if (mode === "career") renderCareerBar();
      if (mode === "wrong") renderWrongList();
    });
  });

  function updateWrongBadge() {
    var n = Object.keys(progress.wrong).length;
    document.getElementById("wrong-count").textContent = n > 0 ? n : "";
  }

  // ---------- 📚 知识点练习 ----------
  var topicGrid = document.getElementById("topic-grid");
  var runner = document.getElementById("quiz-runner");

  function topicStats(topic) {
    var seen = 0, right = 0, last = 0;
    topic.questions.forEach(function (_, idx) {
      var st = progress.stats[uid(topic.id, idx)];
      if (st) {
        seen += st.seen;
        right += st.right;
        if (st.last > last) last = st.last;
      }
    });
    return { seen: seen, right: right, last: last };
  }

  function renderTopicGrid() {
    runner.style.display = "none";
    topicGrid.style.display = "";
    var html = "";
    QUIZ_TOPICS.forEach(function (topic) {
      var s = topicStats(topic);
      var acc = s.seen > 0 ? Math.round((s.right / s.seen) * 100) + "%" : "--";
      html += '<div class="lesson-card topic-card" data-topic="' + esc(topic.id) + '">'
        + '<div class="icon">' + topic.icon + "</div>"
        + "<h3>" + esc(topic.title) + "</h3>"
        + "<p>" + topic.questions.length + " 题 · 关联笔记《" + esc(topic.note) + "》</p>"
        + '<div class="card-foot">'
        + '<span class="card-xp">正确率 ' + acc + "</span>"
        + '<span class="card-status doing">' + fmtTime(s.last) + "</span>"
        + "</div></div>";
    });
    topicGrid.innerHTML = html;
    topicGrid.querySelectorAll(".topic-card").forEach(function (card) {
      card.addEventListener("click", function () {
        startQuiz(card.dataset.topic);
      });
    });
  }

  // 逐题作答状态
  var quiz = null; // {topic, idx, score}

  function startQuiz(topicId) {
    var topic = null;
    for (var i = 0; i < QUIZ_TOPICS.length; i++) {
      if (QUIZ_TOPICS[i].id === topicId) { topic = QUIZ_TOPICS[i]; break; }
    }
    if (!topic) return;
    quiz = { topic: topic, idx: 0, score: 0 };
    topicGrid.style.display = "none";
    runner.style.display = "";
    renderQuestion();
  }

  function typeTag(type) {
    if (type === "choice") return "选择题";
    if (type === "judge") return "判断题";
    return "填空题";
  }

  function renderQuestion() {
    var t = quiz.topic, q = t.questions[quiz.idx];
    var html = '<div class="quiz-head">'
      + '<button class="save-btn" id="quiz-back">← 返回主题列表</button>'
      + "<span>" + t.icon + " " + esc(t.title) + " · 第 " + (quiz.idx + 1) + "/" + t.questions.length + " 题</span>"
      + '<span class="quiz-score">已答对 ' + quiz.score + " 题</span>"
      + "</div>"
      + '<div class="task-card">'
      + '<h3><span class="quiz-type-tag">' + typeTag(q.type) + "</span>" + esc(q.q) + "</h3>"
      + '<div id="answer-area">';

    if (q.type === "choice") {
      q.options.forEach(function (opt, i) {
        html += '<button class="opt-btn" data-opt="' + i + '">' + esc(opt) + "</button>";
      });
    } else if (q.type === "judge") {
      html += '<div class="btn-row">'
        + '<button class="opt-btn judge-btn" data-val="true">✅ 对</button>'
        + '<button class="opt-btn judge-btn" data-val="false">❌ 错</button>'
        + "</div>";
    } else {
      html += '<div class="btn-row">'
        + '<input class="fill-input" id="fill-input" placeholder="输入答案，回车提交" autocomplete="off">'
        + '<button class="run-btn" id="fill-submit">提交</button>'
        + "</div>";
    }

    html += '</div><div class="judge" id="quiz-judge"></div><div id="explain-area"></div></div>';
    runner.innerHTML = html;

    document.getElementById("quiz-back").addEventListener("click", renderTopicGrid);

    if (q.type === "choice") {
      runner.querySelectorAll(".opt-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
          answer(q.options[Number(btn.dataset.opt)] === q.answer, "正确答案是：" + q.answer);
        });
      });
    } else if (q.type === "judge") {
      runner.querySelectorAll(".judge-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var val = btn.dataset.val === "true";
          answer(val === q.answer, "正确答案：" + (q.answer ? "对 ✅" : "错 ❌"));
        });
      });
    } else {
      var input = document.getElementById("fill-input");
      function submit() {
        var v = input.value.trim();
        if (!v) { input.focus(); return; }
        answer(normFill(v) === normFill(q.answer), "参考答案：" + q.answer);
      }
      document.getElementById("fill-submit").addEventListener("click", submit);
      input.addEventListener("keydown", function (e) { if (e.key === "Enter") submit(); });
      input.focus();
    }
  }

  // 判题并展示思路讲解
  function answer(correct, answerLine) {
    var t = quiz.topic, q = t.questions[quiz.idx];
    record(t.id, quiz.idx, correct);
    if (correct) quiz.score += 1;

    // 锁定作答区，标出对错
    runner.querySelectorAll("#answer-area button").forEach(function (b) { b.disabled = true; });
    var fillInput = document.getElementById("fill-input");
    if (fillInput) fillInput.disabled = true;
    var submitBtn = document.getElementById("fill-submit");
    if (submitBtn) submitBtn.disabled = true;

    var judge = document.getElementById("quiz-judge");
    judge.className = "judge " + (correct ? "pass" : "fail");
    judge.textContent = correct ? "✅ 答对了！" : "❌ 答错了，已收入错题本";

    var last = quiz.idx === t.questions.length - 1;
    document.getElementById("explain-area").innerHTML =
      '<div class="explain-box">'
      + "<div><b>" + esc(answerLine) + "</b></div>"
      + "<div><b>💡 思路讲解：</b>" + esc(q.explain) + "</div>"
      + '<div class="note-link">📖 去复习《' + esc(q.note) + "》（知识库 01-名词与概念 / 02-AI-Agent开发）</div>"
      + "</div>"
      + '<div class="btn-row"><button class="run-btn" id="quiz-next">'
      + (last ? "查看本组结果 →" : "下一题 →")
      + "</button></div>";

    document.getElementById("quiz-next").addEventListener("click", function () {
      if (last) { renderQuizResult(); } else { quiz.idx += 1; renderQuestion(); }
    });
  }

  function renderQuizResult() {
    var t = quiz.topic, total = t.questions.length;
    var pct = Math.round((quiz.score / total) * 100);
    var msg = pct === 100 ? "满分！这个主题拿捏了 🎉"
      : pct >= 60 ? "不错，错题已收进错题本，记得回头重练"
      : "先去复习笔记《" + t.note + "》，再来挑战";
    runner.innerHTML = '<div class="task-card quiz-result">'
      + "<h3>" + t.icon + " " + esc(t.title) + " · 本组成绩</h3>"
      + '<div class="result-score">' + quiz.score + " / " + total + "</div>"
      + "<p>" + msg + "</p>"
      + '<div class="btn-row">'
      + '<button class="run-btn" id="quiz-retry">🔄 再练一次</button>'
      + '<button class="hint-btn" id="quiz-home">返回主题列表</button>'
      + "</div></div>";
    document.getElementById("quiz-retry").addEventListener("click", function () { startQuiz(t.id); });
    document.getElementById("quiz-home").addEventListener("click", renderTopicGrid);
  }

  // ---------- 💼 职业面试题 ----------
  var careerBar = document.getElementById("career-bar");
  var careerList = document.getElementById("career-list");
  var activeCareer = 0;

  function renderCareerBar() {
    var html = "";
    CAREER_QUESTIONS.forEach(function (c, i) {
      html += '<button class="career-btn' + (i === activeCareer ? " active" : "") + '" data-i="' + i + '">'
        + c.icon + " " + esc(c.career) + "</button>";
    });
    careerBar.innerHTML = html;
    careerBar.querySelectorAll(".career-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        activeCareer = Number(btn.dataset.i);
        renderCareerBar();
      });
    });
    renderCareerList();
  }

  function renderCareerList() {
    var c = CAREER_QUESTIONS[activeCareer];
    var html = '<p class="panel-note">每道题先自己想 30 秒怎么答，再展开「思路讲解」对照差距。内容基于知识库《AI面试八股文》《AI职业全景》《大厂AI面试题总览与答题方法论》。</p>';
    c.items.forEach(function (item, i) {
      html += '<div class="task-card career-card">'
        + "<h3>Q" + (i + 1) + " · " + esc(item.q) + "</h3>"
        + '<button class="hint-btn guide-toggle">💡 想好了？展开思路讲解</button>'
        + '<div class="guide-box" style="display:none">'
        + '<div class="guide-item"><b>🎯 考点</b>' + esc(item.guide.考点) + "</div>"
        + '<div class="guide-item"><b>🧱 答题框架</b>' + esc(item.guide.答题框架) + "</div>"
        + '<div class="guide-item gold"><b>✨ 加分句</b>' + esc(item.guide.加分句) + "</div>"
        + '<div class="guide-item red"><b>⚠️ 避坑</b>' + esc(item.guide.避坑) + "</div>"
        + "</div></div>";
    });
    careerList.innerHTML = html;
    careerList.querySelectorAll(".guide-toggle").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var box = btn.nextElementSibling;
        var show = box.style.display === "none";
        box.style.display = show ? "" : "none";
        btn.textContent = show ? "🙈 收起思路讲解" : "💡 想好了？展开思路讲解";
      });
    });
  }

  // ---------- 📝 错题本 ----------
  var wrongList = document.getElementById("wrong-list");

  function renderWrongList() {
    var ids = Object.keys(progress.wrong);
    if (ids.length === 0) {
      wrongList.innerHTML = '<div class="task-card"><h3>🎉 错题本是空的</h3>'
        + "<p>去「知识点练习」做题，答错的题会自动出现在这里。</p></div>";
      return;
    }
    var html = "";
    ids.forEach(function (id) {
      var found = findQuestion(id);
      if (!found) return;
      var streak = progress.wrong[id];
      html += '<div class="task-card wrong-card" data-uid="' + esc(id) + '">'
        + '<div class="wrong-meta">' + found.topic.icon + " " + esc(found.topic.title)
        + ' · 连对 ' + streak + "/2" + (streak > 0 ? "（再对 " + (2 - streak) + " 次移出）" : "") + "</div>"
        + "<h3>" + esc(found.q.q) + "</h3>"
        + '<div class="btn-row"><button class="run-btn wrong-retry">🔄 重练这题</button></div>'
        + '<div class="wrong-quiz-area"></div>'
        + "</div>";
    });
    wrongList.innerHTML = html;
    wrongList.querySelectorAll(".wrong-retry").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var card = btn.closest(".wrong-card");
        var found = findQuestion(card.dataset.uid);
        if (found) renderWrongQuiz(card, found);
      });
    });
  }

  // 错题本内嵌重练
  function renderWrongQuiz(card, found) {
    var area = card.querySelector(".wrong-quiz-area");
    var q = found.q;
    var html = '<div class="wrong-quiz">';

    if (q.type === "choice") {
      q.options.forEach(function (opt, i) {
        html += '<button class="opt-btn" data-opt="' + i + '">' + esc(opt) + "</button>";
      });
    } else if (q.type === "judge") {
      html += '<div class="btn-row">'
        + '<button class="opt-btn judge-btn" data-val="true">✅ 对</button>'
        + '<button class="opt-btn judge-btn" data-val="false">❌ 错</button>'
        + "</div>";
    } else {
      html += '<div class="btn-row">'
        + '<input class="fill-input" placeholder="输入答案，回车提交" autocomplete="off">'
        + '<button class="run-btn fill-go">提交</button>'
        + "</div>";
    }
    html += '<div class="judge"></div><div class="wrong-explain"></div></div>';
    area.innerHTML = html;

    function done(correct, answerLine) {
      record(found.topic.id, found.idx, correct);
      area.querySelectorAll("button, input").forEach(function (el) { el.disabled = true; });
      var judge = area.querySelector(".judge");
      judge.className = "judge " + (correct ? "pass" : "fail");
      var id = uid(found.topic.id, found.idx);
      var removed = correct && !(id in progress.wrong);
      judge.textContent = removed
        ? "✅ 连续答对 2 次，本题已移出错题本！"
        : correct ? "✅ 答对了（再连续对 1 次移出）" : "❌ 还是错了，看看讲解";
      area.querySelector(".wrong-explain").innerHTML =
        '<div class="explain-box">'
        + "<div><b>" + esc(answerLine) + "</b></div>"
        + "<div><b>💡 思路讲解：</b>" + esc(q.explain) + "</div>"
        + '<div class="note-link">📖 去复习《' + esc(q.note) + "》</div>"
        + "</div>"
        + '<div class="btn-row"><button class="hint-btn wrong-back">返回错题列表</button></div>';
      area.querySelector(".wrong-back").addEventListener("click", renderWrongList);
    }

    if (q.type === "choice") {
      area.querySelectorAll(".opt-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
          done(q.options[Number(btn.dataset.opt)] === q.answer, "正确答案是：" + q.answer);
        });
      });
    } else if (q.type === "judge") {
      area.querySelectorAll(".judge-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var val = btn.dataset.val === "true";
          done(val === q.answer, "正确答案：" + (q.answer ? "对 ✅" : "错 ❌"));
        });
      });
    } else {
      var input = area.querySelector(".fill-input");
      function submit() {
        var v = input.value.trim();
        if (!v) { input.focus(); return; }
        done(normFill(v) === normFill(q.answer), "参考答案：" + q.answer);
      }
      area.querySelector(".fill-go").addEventListener("click", submit);
      input.addEventListener("keydown", function (e) { if (e.key === "Enter") submit(); });
      input.focus();
    }
  }

  // ---------- 初始化 ----------
  renderTopicGrid();
  updateWrongBadge();
})();
