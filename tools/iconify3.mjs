// 最后一轮：把点阵/三角等文字符号换成 SVG 或 CSS 圆点
import fs from "node:fs";

const P = "interview/assets/app.js";
let s = fs.readFileSync(P, "utf8");

const MAP = [
  ["<i>▶</i>", "<i>${ICON(\"mic\", 20)}</i>"],
  ['{ high: "高频", mid: "◻ 常规", low: "· 长尾" }', '{ high: "高频", mid: "常规", low: "长尾" }'],
  [
    '深度 ${"●".repeat(q.lv)}${"○".repeat(3 - q.lv)}',
    '深度 <span class="dots">${"<i></i>".repeat(q.lv)}${"<i class=\\"off\\"></i>".repeat(3 - q.lv)}</span>',
  ],
  ["▶ 去 YouTube / 原页看", '${ICON("link", 15)} 去原页看'],
  ['${n.v === "B" ? "▶ 访谈库" : "▤ 知识库"}', '${n.v === "B" ? "访谈库" : "知识库"}'],
];

let hit = 0, miss = [];
for (const [from, to] of MAP) {
  if (s.includes(from)) { s = s.split(from).join(to); hit++; } else miss.push(from.slice(0, 46));
}
fs.writeFileSync(P, s);
console.log(`命中 ${hit}/${MAP.length}`);
if (miss.length) console.log("未命中:", miss.join("  ||  "));

const rest = [...new Set(s.match(/[\u{25A0}-\u{25FF}\u{2600}-\u{27BF}\u{1F300}-\u{1FAFF}\u{2B00}-\u{2BFF}]/gu) || [])];
console.log("剩余图形符号:", rest.length ? rest.join(" ") : "（无）");
