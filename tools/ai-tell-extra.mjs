// 补充体检：测学术扫描器不覆盖、但中文 AI 味典型的结构特征
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";

const DATA = "interview/data";
const s = { window: {}, console };
vm.createContext(s);
for (const f of fs.readdirSync(DATA).filter((f) => /^tb-.*\.js$/.test(f))) {
  vm.runInContext(fs.readFileSync(path.join(DATA, f), "utf8"), s, { filename: f });
}
for (const f of fs.readdirSync(DATA).filter((f) => /^codebank(-code[a-c])?\.js$/.test(f))) {
  vm.runInContext(fs.readFileSync(path.join(DATA, f), "utf8"), s, { filename: f });
}
const TB = s.window.TB_SECTIONS || {};
const CI = s.window.CODE_ITEMS || {};

const book = Object.values(TB).map((x) => x.body).join("\n");
const code = Object.values(CI).map((c) => [c.scene, ...(c.keys || []), ...(c.traps || [])].join("\n")).join("\n");

const TESTS = [
  ["破折号 ——（最典型的中文 AI 味）", /——/g],
  ["「不是 X，而是 Y」句式", /不是[^，。；]{2,18}[，,]?\s*而是/g],
  ["「本质上 / 归根结底 / 说白了」", /本质上|归根结底|说白了|一言以蔽之/g],
  ["「换句话说 / 也就是说」", /换句话说|也就是说|换言之/g],
  ["「更重要的是 / 关键在于 / 值得一提的是」", /更重要的是|关键在于|值得一提的是|值得注意的是/g],
  ["「首先 / 其次 / 最后」", /首先[，,]|其次[，,]|最后[，,]/g],
  ["加粗 **…**", /\*\*[^*]+\*\*/g],
  ["「X 是 Y 的地基/桥梁/杠杆」抽象比喻模板", /是[^，。；]{0,10}的(地基|桥梁|杠杆|钥匙|底座|入口|出口|分水岭)/g],
  ["「让你 / 帮你 / 给你 / 教你」直呼", /让你|帮你|给你|教你|逼你/g],
  ["分号；", /；/g],
  ["「一句话说清」类固定小标题", /###\s|### /g],
];

function cjk(t) { return (t.match(/[\u4e00-\u9fa5]/g) || []).length; }

for (const [name, src, text] of TESTS.map(([n, r]) => [n, r, null])) {}

console.log("指标".padEnd(36) + "教材(133节)".padStart(14) + "必背代码(34条)".padStart(16));
const cb = cjk(book), cc = cjk(code);
for (const [name, re] of TESTS) {
  const hb = (book.match(re) || []).length;
  const hc = (code.match(re) || []).length;
  const pb = ((hb / cb) * 1000).toFixed(1);
  const pc = ((hc / cc) * 1000).toFixed(1);
  console.log(name.padEnd(34) + `${hb} 次/${pb}‰`.padStart(16) + `${hc} 次/${pc}‰`.padStart(18));
}

/* 结构整齐度：每节是否都是同样的小标题序列 */
const seqs = {};
for (const x of Object.values(TB)) {
  const heads = [...String(x.body).matchAll(/^###\s*(.+)$/gm)].map((m) => m[1].trim());
  const key = heads.join("|");
  seqs[key] = (seqs[key] || 0) + 1;
}
const top = Object.entries(seqs).sort((a, b) => b[1] - a[1]);
console.log("\n教材小标题骨架重复度（前 5 种）:");
for (const [k, n] of top.slice(0, 5)) console.log(`  ${String(n).padStart(3)} 节  ${k.slice(0, 90)}`);
console.log(`  共 ${top.length} 种骨架 / ${Object.keys(TB).length} 节`);
