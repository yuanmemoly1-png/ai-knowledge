// 校验 tools/textbook/SPEC*.md 中所有 rel 路径是否真实存在
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const vaultA = root;
const vaultB = path.resolve(root, "..", "youtube", "AI-PM-FDE知识库");

const specs = [
  "tools/textbook/SPEC.md",
  "tools/textbook/SPEC-P7.md",
  "tools/textbook/SPEC-GAP.md",
  "tools/textbook/SPEC-GAP2.md",
  "tools/textbook/SPEC-CODE.md",
  "tools/textbook/SPEC-PM.md",
];
const paths = new Set();
for (const rel of specs) {
  const spec = fs.readFileSync(path.join(root, rel), "utf8");
  for (const m of spec.matchAll(/`([^`]+\.md)`/g)) paths.add(m[1]);
}

const bad = [];
for (const p of paths) {
  // 跳过远程地址（原书章节直链，不是本地笔记）
  if (p.startsWith("...") || /^https?:/.test(p)) continue;
  const abs = p.startsWith("yt/")
    ? path.join(vaultB, p.slice(3))
    : path.join(vaultA, p);
  if (!fs.existsSync(abs)) bad.push(p + "   (解析为 " + abs + ")");
}

console.log("SPEC 引用路径总数:", paths.size);
console.log("存在:", paths.size - bad.length);
if (bad.length) {
  console.log("\n=== 找不到的路径 ===");
  bad.forEach((p) => console.log("  x", p));
  process.exit(1);
}
console.log("OK 全部路径校验通过");
