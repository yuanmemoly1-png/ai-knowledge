// 量分号前段长度分布，定「只改长句」的阈值
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";

const DATA = "interview/data";
const s = { window: {}, console };
vm.createContext(s);
for (const f of fs.readdirSync(DATA).filter((f) => /^tb-.*\.js$/.test(f) || /^codebank(-code[a-c])?\.js$/.test(f))) {
  vm.runInContext(fs.readFileSync(path.join(DATA, f), "utf8"), s, { filename: f });
}
const parts = [];
const TB = s.window.TB_SECTIONS || {};
for (const x of Object.values(TB)) parts.push(x.body, ...(x.keypoints || []), ...(x.pitfalls || []));
const CI = s.window.CODE_ITEMS || {};
for (const c of Object.values(CI)) parts.push(c.scene, ...(c.keys || []), ...(c.traps || []));
const text = parts.join("\n");

// 每个分号：统计它前面到上一个句末之间的汉字数
const lens = [];
for (const m of text.matchAll(/；/g)) {
  const before = text.slice(0, m.index);
  const cut = Math.max(before.lastIndexOf("。"), before.lastIndexOf("！"), before.lastIndexOf("？"), before.lastIndexOf("\n"));
  const seg = before.slice(cut + 1);
  lens.push((seg.match(/[\u4e00-\u9fa5]/g) || []).length);
}
lens.sort((a, b) => a - b);
const total = lens.length;
console.log("分号总数:", total);
console.log("前段汉字数分布：中位数", lens[Math.floor(total / 2)], "／p75", lens[Math.floor(total * 0.75)], "／p90", lens[Math.floor(total * 0.9)], "／最大", lens[total - 1]);
for (const th of [20, 24, 28, 32, 36, 40]) {
  const hit = lens.filter((n) => n >= th).length;
  console.log(`  阈值 ≥${String(th).padStart(2)} 字 → 命中 ${String(hit).padStart(3)} 处（${((hit / total) * 100).toFixed(0)}%）`);
}
