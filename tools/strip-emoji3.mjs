// 三次清理：剩余散点装饰 emoji 换成几何符号或移除
import fs from "node:fs";

const P = "interview/assets/app.js";
let s = fs.readFileSync(P, "utf8");
const before = (s.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]/gu) || []).length;

const MAP = [
  [/📕\s*/gu, ""],
  [/📰\s*/gu, ""],
  [/<i>🗂<\/i>/gu, "<i>☰</i>"],
  [/<i>🫙<\/i>/gu, "<i>◌</i>"],
  [/🙈\s*/gu, ""],
  [/👀\s*/gu, ""],
  [/🔗/gu, "→"],
  [/🧭/gu, "→"],
  [/✅\s*/gu, ""],
  [/🏝️/gu, "◇"],
  [/🎓/gu, "◆"],
  [/🌙\s切到深色/gu, "切到深色"],
  [/☀️\s切到浅色/gu, "切到浅色"],
];
for (const [re, to] of MAP) s = s.replace(re, to);

const after = (s.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]/gu) || []).length;
fs.writeFileSync(P, s);
console.log(`emoji: ${before} → ${after}`);
