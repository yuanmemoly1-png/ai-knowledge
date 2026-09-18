// 采样：中文引号「」与三点式顿号列举的实际用法，判断能否自动改
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
  console.log(`\n===== ${label} =====`);
  let c = 0;
  for (const m of book.matchAll(re)) {
    if (c++ >= n) break;
    console.log("  · " + m[0].replace(/\n/g, " ⏎ "));
  }
}
// 引号里包的是什么：统计长度分布
const quoted = [...book.matchAll(/「([^」]{1,24})」/g)].map((m) => m[1]);
const byLen = {};
quoted.forEach((q) => { const k = q.length <= 4 ? "≤4字" : q.length <= 8 ? "5-8字" : "9字+"; byLen[k] = (byLen[k] || 0) + 1; });
console.log("引号内容长度分布：", JSON.stringify(byLen), "共", quoted.length);
const dup = {};
quoted.forEach((q) => (dup[q] = (dup[q] || 0) + 1));
console.log("被引号包过 ≥4 次的词：", Object.entries(dup).filter(([, n]) => n >= 4).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([w, n]) => `${w}×${n}`).join("  "));

sample(/「[^」]{1,14}」/g, 14, "引号抽样（短）");
sample(/[^、。；\n]{2,10}、[^、。；\n]{2,10}、[^、。；\n]{2,10}/g, 10, "三点式列举抽样");

// 「和教材其它节的分工」这类结构性重复句
const dupSentence = {};
for (const m of book.matchAll(/\*\*([^*]{4,20})\*\*[:：]/g)) dupSentence[m[1]] = (dupSentence[m[1]] || 0) + 1;
console.log("\n结构性重复的加粗小标签：", Object.entries(dupSentence).filter(([, n]) => n >= 3).sort((a, b) => b[1] - a[1]).map(([w, n]) => `${w}×${n}`).join("  "));
