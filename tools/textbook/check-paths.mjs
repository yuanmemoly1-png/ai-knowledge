// 校验 tools/textbook/SPEC.md 中所有 rel 路径是否真实存在
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const vaultA = root;
const vaultB = path.resolve(root, "..", "youtube", "AI-PM-FDE知识库");

const spec = fs.readFileSync(path.join(root, "tools/textbook/SPEC.md"), "utf8");
const paths = [...new Set([...spec.matchAll(/`([^`]+\.md)`/g)].map((x) => x[1]))];

const bad = [];
for (const p of paths) {
  const abs = p.startsWith("yt/")
    ? path.join(vaultB, p.slice(3))
    : path.join(vaultA, p);
  if (!fs.existsSync(abs)) bad.push(p + "   (解析为 " + abs + ")");
}

console.log("SPEC 引用路径总数:", paths.length);
console.log("存在:", paths.length - bad.length);
if (bad.length) {
  console.log("\n=== 找不到的路径 ===");
  bad.forEach((p) => console.log("  x", p));
  process.exit(1);
}
console.log("OK 全部路径校验通过");
