// 列出 app.js 里剩余的 emoji 及其行号
import fs from "node:fs";
const s = fs.readFileSync("interview/assets/app.js", "utf8");
const re = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]/gu;
s.split("\n").forEach((l, i) => {
  const m = l.match(re);
  if (m) console.log(`L${i + 1} [${m.join("")}]  ${l.trim().slice(0, 100)}`);
});
