// 清掉 app.js 里残留的 emoji / 文字字形图标，换成内联 SVG
import fs from "node:fs";

const P = "interview/assets/app.js";
let s = fs.readFileSync(P, "utf8");
const before = (s.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]/gu) || []).length;

const MAP = [
  // 分组标题：去掉符号前缀，改成纯排版标签
  ["⏰ 到期复习", "到期复习"],
  ["⏰ 复习队列", "复习队列"],
  ["ℹ️ 数据说明", "数据说明"],
  ["▶ 这场访谈", "这场访谈"],
  // 访谈分级：数据里带 emoji，渲染时剥掉
  ["${t.icon} ${esc(t.name)}", "${esc(t.name)}"],
  // 空状态 / 列表图标 → SVG
  ["<i>✦</i>", "<i>${ICON(\"spark\", 20)}</i>"],
  ["<i>☰</i>这个筛选下还没有题目", "<i>${ICON(\"grid\", 26)}</i>这个筛选下还没有题目"],
  ["<i>☰</i>没有匹配的题目", "<i>${ICON(\"search\", 26)}</i>没有匹配的题目"],
  ["<i>☰</i>没有匹配的笔记", "<i>${ICON(\"search\", 26)}</i>没有匹配的笔记"],
  ["<i>✎</i>这期还没加工成笔记", "<i>${ICON(\"pen\", 26)}</i>这期还没加工成笔记"],
  ["\"\": \"📎 其他\"", "\"\": \"其他\""],
  // 其它学习站
  ["<span class=\"row-i\"></span>", "<span class=\"row-i\">${ICON(\"book\", 19)}</span>"],
  ["<span class=\"row-i\">◇</span>", "<span class=\"row-i\">${ICON(\"spark\", 19)}</span>"],
  ["<span class=\"row-i\">◆</span>", "<span class=\"row-i\">${ICON(\"bulb\", 19)}</span>"],
  // 按钮里的对勾
  ["${st.read ? \"取消已学\" : \"✓ 标记已学\"}", "${st.read ? \"取消已学\" : ICON(\"check\", 15) + \" 标记已学\"}"],
];

let hit = 0, miss = [];
for (const [from, to] of MAP) {
  if (s.includes(from)) { s = s.split(from).join(to); hit++; }
  else miss.push(from.slice(0, 40));
}

fs.writeFileSync(P, s);
const after = (s.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]/gu) || []).length;
console.log(`替换命中 ${hit}/${MAP.length}`);
if (miss.length) console.log("未命中:", miss.join(" | "));
console.log(`emoji: ${before} → ${after}`);
const rest = [...new Set(s.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]/gu) || [])];
if (rest.length) console.log("剩余符号:", rest.join(" "));
