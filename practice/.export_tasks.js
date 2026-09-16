// 校验脚本：从 lessons.js 提取全部任务，导出为 JSON 供 Python 核对（不导出答案，lessons.js 已不含 solution）
const fs = require("fs");
const src = fs.readFileSync("practice/data/lessons.js", "utf-8")
  .replace("const LESSONS", "globalThis.LESSONS"); // const 在 eval 里不外泄，挂到全局
eval(src);

const lessons = [];
const tasks = [];
for (const lesson of LESSONS) {
  lessons.push({
    id: lesson.id,
    title: lesson.title,
    taskCount: lesson.tasks.length,
    trialCount: lesson.tasks.filter((t) => t.trial).length,
  });
  for (const t of lesson.tasks) {
    tasks.push({
      id: t.id,
      lesson: lesson.id,
      trial: !!t.trial,                       // 试炼题标记
      check: t.check,
      hintsCount: Array.isArray(t.hints) ? t.hints.length : 0,
      hasSolution: "solution" in t,          // 应为 false：答案不进网站
      starterHasMarker: t.starterCode.includes("# 在这里写代码"),
    });
  }
}
fs.writeFileSync("practice/.tasks.json", JSON.stringify({ lessons, tasks }, null, 2));
console.log("导出课程数:", lessons.length, "任务数:", tasks.length);
