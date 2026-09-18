// 中文 AI 味全面体检 —— 覆盖行业公认的检测指标
// 分两族：
//   统计族（GPTZero / 知网 AIGC / 朱雀 等检测器真正在算的）：困惑度近似、突发性、句长分布、词汇重复
//   规则族（中文特有的 AI 指纹）：套语、连接词、拔高、对仗、三点式、标点习惯
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

// 只取「散文」：剥掉代码块、表格、markdown 标记
function prose(t) {
  return String(t)
    .replace(/~~~[\s\S]*?~~~/g, "")        // 代码块
    .replace(/^\s*\|.*$/gm, "")            // 表格
    .replace(/^#{1,6}\s.*$/gm, "")         // 小标题
    .replace(/\*\*/g, "")
    .replace(/\[\[([^\]|]+)(\|[^\]]+)?\]\]/g, "$1")
    .replace(/`[^`]*`/g, "")
    .trim();
}
const bookProse = Object.values(TB).map((x) => prose(x.body)).join("\n");
const codeProse = Object.values(CI).map((c) => [c.scene, ...(c.keys || []), ...(c.traps || [])].join("\n")).join("\n");

const cjk = (t) => (t.match(/[\u4e00-\u9fa5]/g) || []).length;

/* ---------------- 统计族 ---------------- */
function sentences(t) {
  return t.split(/[。！？；\n]+/).map((x) => x.trim()).filter((x) => cjk(x) >= 2);
}
function stats(t, label) {
  const ss = sentences(t);
  const lens = ss.map(cjk);
  const mean = lens.reduce((a, b) => a + b, 0) / lens.length;
  const sd = Math.sqrt(lens.reduce((a, b) => a + (b - mean) ** 2, 0) / lens.length);
  const short = lens.filter((n) => n <= 8).length;
  const long = lens.filter((n) => n >= 45).length;
  return {
    label, total: cjk(t), sents: ss.length,
    mean: +mean.toFixed(1), sd: +sd.toFixed(1), cv: +(sd / mean).toFixed(3),
    shortPct: +((short / lens.length) * 100).toFixed(1),
    longPct: +((long / lens.length) * 100).toFixed(1),
  };
}

/* ---------------- 规则族 ---------------- */
const RULES = [
  ["套语·空转", /值得注意的是|综上所述|总而言之|总的来说|换言之|换句话说|由此可见|不言而喻|众所周知|需要指出的是/g],
  ["套语·机械连接", /首先[，,]|其次[，,]|最后[，,]|然而[，,]|此外[，,]|因此[，,]|与此同时|另一方面/g],
  ["拔高·尾巴", /具有重要意义|至关重要|不可或缺|举足轻重|彰显|体现了|发挥了(重要)?作用|产生了(深远)?影响|大有可为|未来可期|深远的影响/g],
  ["程度副词堆叠", /非常|极为|极其|十分|相当地|格外|尤为|格外地/g],
  ["对仗·不是X而是Y", /不是[^，。；\n]{2,20}(，|,)?\s*(而是|是)[^，。；\n]{2,24}/g],
  ["第二人称直呼", /让你|帮你|教你|给你|逼你|带你/g],
  ["抽象名词模板", /的(提升|变化|重构|转变|应用|能力|价值|意义|逻辑|本质|核心|关键)/g],
  ["三点式顿号列举", /[^、。；\n]{2,10}、[^、。；\n]{2,10}、[^、。；\n]{2,10}/g],
  ["术语后括号英文", /[\u4e00-\u9fa5]{2,8}（[A-Za-z][A-Za-z0-9 ._-]{1,20}）/g],
  ["中文引号「」", /「[^」]{1,20}」/g],
  ["破折号", /——/g],
  ["分号", /；/g],
  ["段首总述词", /^(但|而|所以|因此|这里|这|那|其中|另外|同时|不过)/gm],
];

console.log("════════ 统计族（检测器真正在算的） ════════");
for (const [t, label] of [[bookProse, "教材散文"], [codeProse, "必背代码说明"]]) {
  const r = stats(t, label);
  console.log(`\n${label}：${r.total} 汉字 / ${r.sents} 句`);
  console.log(`  平均句长 ${r.mean} 字 · 标准差 ${r.sd} · 突发性 CV ${r.cv}   ${r.cv < 0.4 ? "← 偏机械（人写通常 0.5+）" : "✓"}`);
  console.log(`  短句(≤8字) 占比 ${r.shortPct}% ${r.shortPct < 12 ? "← 偏少，节奏单调" : "✓"} · 长句(≥45字) 占比 ${r.longPct}%`);
}

console.log("\n════════ 规则族（中文特有指纹） ════════");
console.log("指标".padEnd(20) + "教材(次数/千字)".padStart(18) + "必背代码".padStart(16));
const bc = cjk(bookProse), cc = cjk(codeProse);
for (const [name, re] of RULES) {
  const hb = (bookProse.match(re) || []).length;
  const hc = (codeProse.match(re) || []).length;
  console.log(name.padEnd(18) + `${hb}  /  ${((hb / bc) * 1000).toFixed(1)}`.padStart(20) + `${hc}  /  ${((hc / cc) * 1000).toFixed(1)}`.padStart(16));
}

/* 词汇重复：最高频实词（排除虚词） */
const STOP = new Set("的 了 是 在 和 也 就 都 而 与 这 那 你 我 它 他 一 个 上 下 有 没 不 会 要 能 把 被 让 从 到 对 为 以 及 或 但 如果 所以 因为 然后 一个 一种 这个 那个 可以 需要 我们 他们 什么 怎么 时候 已经 还是 就是 不是 这样 那样 里 中 后 前 时 会 说 做 用 看 想 出来 过来".split(" "));
const freq = {};
for (const m of bookProse.matchAll(/[\u4e00-\u9fa5]{2,4}/g)) {
  const w = m[0];
  if (STOP.has(w)) continue;
  freq[w] = (freq[w] || 0) + 1;
}
const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 14);
console.log(`\n高频实词（教材 ${bc} 字）：` + top.map(([w, n]) => `${w}×${n}`).join(" "));
