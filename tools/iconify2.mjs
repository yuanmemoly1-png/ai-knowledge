// 补齐：tile 里的 ❖、空状态的 ◌
import fs from "node:fs";

const P = "interview/assets/app.js";
let s = fs.readFileSync(P, "utf8");

const MAP = [
  ["<i>❖</i>", "<i>${ICON(\"book\", 20)}</i>"],
  ["<div class=\"card empty\"><i>◌</i>没有匹配的题目", "<div class=\"card empty\"><i>${ICON(\"search\", 26)}</i>没有匹配的题目"],
  ["<div class=\"card empty\"><i>◌</i>没有匹配的笔记", "<div class=\"card empty\"><i>${ICON(\"search\", 26)}</i>没有匹配的笔记"],
  ["<i>◌</i>今天没有到期题目", "<i>${ICON(\"check\", 26)}</i>今天没有到期题目"],
  ["<i>◌</i>还没有数据", "<i>${ICON(\"chart\", 26)}</i>还没有数据"],
];

let hit = 0, miss = [];
for (const [from, to] of MAP) {
  if (s.includes(from)) { s = s.split(from).join(to); hit++; } else miss.push(from.slice(0, 44));
}
fs.writeFileSync(P, s);
console.log(`命中 ${hit}/${MAP.length}`);
if (miss.length) console.log("未命中:", miss.join(" | "));

const rest = [...new Set(s.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{25A0}-\u{25FF}\u{2700}-\u{27BF}]/gu) || [])];
console.log("剩余非 ASCII 图形符号:", rest.length ? rest.join(" ") : "（无）");
