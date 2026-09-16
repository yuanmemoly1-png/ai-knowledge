// AI 冒险岛 · 练习场 —— 动画课堂引擎
// 数据驱动：引擎只认「元素状态表」，加新场景只改 data/scenes.js，不动本文件。
// 原理：每个元素有固定 key；切步骤时对比新旧状态——
//   新 key → 创建并播放飞入（born）动画；老 key 位置/样式变化 → CSS transition 自动补间；消失的 key → 缩小淡出（gone）。

let scene = null;      // 当前场景
let stepIndex = 0;     // 当前步骤
let autoTimer = null;  // 自动播放定时器

const stage = document.getElementById("stage");

// 把一条元素状态应用到 DOM 元素上
function applySpec(el, spec) {
  el.querySelector(".el-text").textContent = spec.text || "";
  const label = el.querySelector(".el-label");
  label.textContent = spec.label || "";
  label.style.display = spec.label ? "block" : "none";
  el.className = "anim-el " + (spec.cls || "");
  el.style.left = (spec.x === undefined ? 50 : spec.x) + "%";
  el.style.top = (spec.y === undefined ? 50 : spec.y) + "%";
}

// 渲染当前步骤：对齐 DOM 与步骤状态表
function renderStep() {
  const step = scene.steps[stepIndex];
  const seen = new Set();

  for (const key of Object.keys(step.els)) {
    seen.add(key);
    const spec = step.els[key];
    let el = stage.querySelector('[data-key="' + key + '"]');
    if (!el) {
      // 新元素：先以 born（透明+缩小）状态插入，下一帧摘掉 born，触发飞入过渡
      el = document.createElement("div");
      el.dataset.key = key;
      el.innerHTML = '<div class="el-text"></div><div class="el-label"></div>';
      applySpec(el, spec);
      el.classList.add("born");
      stage.appendChild(el);
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.remove("born")));
    } else {
      applySpec(el, spec);
    }
  }

  // 本步骤没有的元素：缩小淡出后移除
  stage.querySelectorAll(".anim-el").forEach((el) => {
    if (!seen.has(el.dataset.key)) {
      el.classList.add("gone");
      setTimeout(() => el.remove(), 450);
    }
  });

  // 字幕 + 步骤指示器 + 按钮状态
  document.getElementById("caption").textContent = (stepIndex + 1) + ". " + step.caption;
  document.getElementById("step-indicator").textContent = (stepIndex + 1) + " / " + scene.steps.length;
  document.getElementById("btn-prev").disabled = stepIndex === 0;
  document.getElementById("btn-next").disabled = stepIndex === scene.steps.length - 1;
}

function nextStep() {
  if (stepIndex < scene.steps.length - 1) {
    stepIndex++;
    renderStep();
  } else {
    stopAuto(); // 播到最后一步自动停下
  }
}

function prevStep() {
  if (stepIndex > 0) {
    stepIndex--;
    renderStep();
  }
}

function stopAuto() {
  if (autoTimer) {
    clearInterval(autoTimer);
    autoTimer = null;
    document.getElementById("btn-auto").textContent = "▶ 自动播放";
  }
}

function toggleAuto() {
  if (autoTimer) {
    stopAuto();
    return;
  }
  if (stepIndex >= scene.steps.length - 1) {
    stepIndex = 0; // 在结尾点自动播放：从头开始
    renderStep();
  }
  document.getElementById("btn-auto").textContent = "⏸ 暂停";
  autoTimer = setInterval(nextStep, 2000); // 每步 2 秒
}

function resetScene() {
  stopAuto();
  stepIndex = 0;
  stage.innerHTML = ""; // 清空舞台，全部元素重新飞入
  renderStep();
}

// 加载场景：清空舞台、更新标题与列表高亮
function loadScene(id) {
  stopAuto();
  scene = null;
  stepIndex = 0;
  stage.innerHTML = "";
  scene = SCENES.find((s) => s.id === id) || SCENES[0];
  document.getElementById("scene-title").textContent = scene.icon + " " + scene.title;
  document.querySelectorAll(".scene-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.id === scene.id);
  });
  renderStep();
}

// 左侧概念列表
function buildSceneList() {
  const list = document.getElementById("scene-list");
  SCENES.forEach((s) => {
    const btn = document.createElement("button");
    btn.className = "scene-item";
    btn.dataset.id = s.id;
    btn.innerHTML = s.icon + " " + s.title;
    btn.addEventListener("click", () => loadScene(s.id));
    list.appendChild(btn);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  buildSceneList();
  loadScene(SCENES[0].id);

  document.getElementById("btn-next").addEventListener("click", nextStep);
  document.getElementById("btn-prev").addEventListener("click", prevStep);
  document.getElementById("btn-auto").addEventListener("click", toggleAuto);
  document.getElementById("btn-reset").addEventListener("click", resetScene);

  // 键盘左右键切换步骤
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") nextStep();
    if (e.key === "ArrowLeft") prevStep();
  });
});
