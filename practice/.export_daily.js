// 校验脚本：从 daily.js 提取全部条目，导出为 JSON 供 Python 核对
const fs = require("fs");
const src = fs.readFileSync("practice/data/daily.js", "utf-8")
  .replace("const DAILY_DICTATION", "globalThis.DAILY_DICTATION")
  .replace("const DAILY_PROJECTS", "globalThis.DAILY_PROJECTS");
eval(src);

const data = {
  dictation: DAILY_DICTATION.map((d) => ({
    id: d.id,
    title: d.title,
    code: d.code,
    codeLines: d.code.split("\n").length,
    hasGoal: !!d.goal,
    hasNote: !!d.note,
    expected: d.expected || null,            // 期望 stdout（判卷用）
    given: d.given || null,                  // 题面给定数据/前置代码（判卷时拼在用户代码前面）
    stdin: Array.isArray(d.stdin) ? d.stdin : null, // 交互式曲目的喂入输入
  })),
  projects: DAILY_PROJECTS.map((p) => ({
    id: p.id,
    title: p.title,
    code: p.code,
    codeLines: p.code.split("\n").length,
    hasDesc: !!p.desc,
    logicCount: Array.isArray(p.logic) ? p.logic.length : 0,
    skeleton: p.skeleton || null,
    pointsCount: Array.isArray(p.points) ? p.points.length : 0,
    hasChallenge: !!p.challenge,
  })),
};
fs.writeFileSync("practice/.daily.json", JSON.stringify(data, null, 2));
console.log("导出默写曲目:", data.dictation.length, "小项目:", data.projects.length);
