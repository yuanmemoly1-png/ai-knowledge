// 把候选文本抽出来，交给 ai_tell_scan.py 体检
import fs from "node:fs";
import vm from "node:vm";
import os from "node:os";
import path from "node:path";

const TMP = os.tmpdir();
const DATA = "interview/data";

/* ---------- 1. 必背代码：scene + keys + traps ---------- */
const s1 = { window: {}, console };
vm.createContext(s1);
for (const f of fs.readdirSync(DATA).filter((f) => /^codebank(-code[a-c])?\.js$/.test(f))) {
  vm.runInContext(fs.readFileSync(path.join(DATA, f), "utf8"), s1, { filename: f });
}
const CI = s1.window.CODE_ITEMS || {};
const codeTxt = Object.values(CI)
  .map((c) => [`## ${c.t}`, `场景：${c.scene}`, ...(c.keys || []).map((k) => "要点：" + k), ...(c.traps || []).map((k) => "易错：" + k)].join("\n"))
  .join("\n\n");
fs.writeFileSync(path.join(TMP, "scan-code.txt"), codeTxt, "utf8");

/* ---------- 2. 教材正文：全部节的 body ---------- */
const s2 = { window: {}, console };
vm.createContext(s2);
for (const f of fs.readdirSync(DATA).filter((f) => /^tb-.*\.js$/.test(f))) {
  vm.runInContext(fs.readFileSync(path.join(DATA, f), "utf8"), s2, { filename: f });
}
const TB = s2.window.TB_SECTIONS || {};
const bookTxt = Object.values(TB).map((x) => `## ${x.id} ${x.t}\n${x.body}`).join("\n\n");
fs.writeFileSync(path.join(TMP, "scan-book.txt"), bookTxt, "utf8");

/* ---------- 3. 界面文案：hero / kicker / 引导语 / 空状态 ---------- */
const app = fs.readFileSync("interview/assets/app.js", "utf8");
const uiBits = [];
for (const m of app.matchAll(/<div class="kicker">([^<${]+)<\/div>/g)) uiBits.push(m[1].trim());
for (const m of app.matchAll(/<p>([^<${]{6,})<\/p>/g)) uiBits.push(m[1].trim());
for (const m of app.matchAll(/class="muted"[^>]*>\s*([^<${]{8,})/g)) uiBits.push(m[1].trim());
for (const m of app.matchAll(/<b style="color:var\(--tx\)">([^<${]+)<\/b>/g)) uiBits.push(m[1].trim());
fs.writeFileSync(path.join(TMP, "scan-ui.txt"), [...new Set(uiBits)].join("\n"), "utf8");

/* ---------- 4. 记忆文件 ---------- */
if (fs.existsSync("CODELY.md")) {
  fs.writeFileSync(path.join(TMP, "scan-memory.txt"), fs.readFileSync("CODELY.md", "utf8"), "utf8");
}

for (const f of ["scan-code.txt", "scan-book.txt", "scan-ui.txt", "scan-memory.txt"]) {
  const p = path.join(TMP, f);
  if (fs.existsSync(p)) {
    const t = fs.readFileSync(p, "utf8");
    console.log(`${f.padEnd(18)} ${t.length} 字符  →  ${p}`);
  }
}
