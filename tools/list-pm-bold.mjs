// 列出 PM 站里 ≥10 汉字的加粗片段，看是什么
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";

const s = { window: {}, console };
vm.createContext(s);
for (const f of fs.readdirSync("pm/data").filter((f) => f.endsWith(".js"))) {
  vm.runInContext(fs.readFileSync(path.join("pm/data", f), "utf8"), s, { filename: f });
}
const SEC = s.window.PM_SECTIONS;
const cjk = (t) => (t.match(/[\u4e00-\u9fa5]/g) || []).length;
const out = [];
for (const [id, sec] of Object.entries(SEC)) {
  for (const m of String(sec.body).matchAll(/\*\*([^*]+?)\*\*/g)) {
    if (cjk(m[1]) >= 10) out.push({ id, text: m[1] });
  }
}
console.log(`≥10 汉字的加粗共 ${out.length} 处：`);
out.forEach((x) => console.log(`  [${x.id}] ${x.text}`));
const freq = {};
out.forEach((x) => (freq[x.text] = (freq[x.text] || 0) + 1));
console.log("\n按内容去重后：");
Object.entries(freq).sort((a, b) => b[1] - a[1]).forEach(([t, n]) => console.log(`  x${n}  ${t}`));
