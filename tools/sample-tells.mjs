// 采样：看破折号 / 分号 / 加粗 / 对仗句的真实上下文，据此定替换规则
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";

const DATA = "interview/data";
const s = { window: {}, console };
vm.createContext(s);
for (const f of fs.readdirSync(DATA).filter((f) => /^tb-.*\.js$/.test(f))) {
  vm.runInContext(fs.readFileSync(path.join(DATA, f), "utf8"), s, { filename: f });
}
const TB = s.window.TB_SECTIONS;
const book = Object.values(TB).map((x) => x.body).join("\n");

function sample(re, n, label) {
  console.log(`\n===== ${label}（共 ${(book.match(re) || []).length} 处，抽 ${n}）=====`);
  let c = 0;
  for (const m of book.matchAll(re)) {
    if (c++ >= n) break;
    const i = m.index;
    console.log("  · " + book.slice(Math.max(0, i - 34), i + 34).replace(/\n/g, " ⏎ "));
  }
}
sample(/[^—]——[^—]/g, 12, "破折号 ——");
sample(/不是[^，。；\n]{2,18}而是/g, 6, "「不是 X 而是 Y」");
