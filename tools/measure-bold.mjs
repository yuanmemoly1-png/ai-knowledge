// 加粗密度分布：看有多少节真的超了「每节 1-2 处」
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
const rows = Object.values(TB).map((x) => ({
  id: x.id,
  t: x.t,
  n: (String(x.body).match(/\*\*[^*]+\*\*/g) || []).length,
}));
rows.sort((a, b) => b.n - a.n);
const total = rows.reduce((a, b) => a + b.n, 0);
const over = rows.filter((r) => r.n > 3);
console.log(`教材加粗总数 ${total} / ${rows.length} 节，平均 ${(total / rows.length).toFixed(2)} 处`);
console.log(`超过 3 处的有 ${over.length} 节，超过 5 处的有 ${rows.filter((r) => r.n > 5).length} 节`);
console.log("\n最密的 12 节：");
rows.slice(0, 12).forEach((r) => console.log(`  ${String(r.n).padStart(2)} 处  ${r.id.padEnd(6)} ${r.t}`));

/* 列出被加粗的具体词，看是不是「整句加粗」那种 AI 习惯 */
const bold = {};
for (const x of Object.values(TB)) {
  for (const m of String(x.body).matchAll(/\*\*([^*]+)\*\*/g)) {
    const k = m[1].slice(0, 30);
    bold[k] = (bold[k] || 0) + 1;
  }
}
const longBold = Object.entries(bold).filter(([k]) => (k.match(/[\u4e00-\u9fa5]/g) || []).length >= 12);
console.log(`\n加粗内容 ≥12 个汉字（像整句加粗）的：${longBold.length} 种 / 共 ${longBold.reduce((a, b) => a + b[1], 0)} 处`);
longBold.slice(0, 8).forEach(([k, n]) => console.log(`  x${n}  ${k}`));
