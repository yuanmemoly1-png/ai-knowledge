// 数据文件里的角色/模块/分级图标是 emoji，在渲染层统一剥掉（改数据会牵连多处）
import fs from "node:fs";

const P = "interview/assets/app.js";
let s = fs.readFileSync(P, "utf8");

const MAP = [
  ["${x.m.icon} ${esc(x.m.name)}", "${esc(x.m.name)}"],
  ['${r.icon} ${esc(r.name)}', "${esc(r.name)}"],
  ['${m.icon} ${esc(m.name)}', "${esc(m.name)}"],
  ["${ROLE[q.role].icon} ${esc(ROLE[q.role].name)}", "${esc(ROLE[q.role].name)}"],
  ['${t.icon} ${t.name.split(" · ")[0]}', '${t.name.split(" · ")[0]}'],
  ['${t.icon} ${esc(t.name)}', "${esc(t.name)}"],
  ['"◻ 常规"', '"常规"'],
];

let hit = 0, miss = [];
for (const [from, to] of MAP) {
  if (s.includes(from)) {
    const n = s.split(from).length - 1;
    s = s.split(from).join(to);
    hit += n;
  } else miss.push(from.slice(0, 46));
}
fs.writeFileSync(P, s);
console.log(`替换处数: ${hit}`);
if (miss.length) console.log("未命中:", miss.join("  ||  "));

const rest = [...new Set(s.match(/[\u{25A0}-\u{25FF}\u{2600}-\u{27BF}\u{1F300}-\u{1FAFF}\u{2B00}-\u{2BFF}]/gu) || [])];
console.log("剩余图形符号:", rest.length ? rest.join(" ") : "（无）");
console.log("emoji 总数:", (s.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]/gu) || []).length);
