// 发布前检查：index.html 引用的本地资源是否齐全
import fs from "node:fs";
import path from "node:path";

const html = fs.readFileSync("interview/index.html", "utf8");
const refs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
  .map((m) => m[1])
  .filter((u) => !/^(https?:|data:|#)/.test(u));

let miss = 0;
for (const r of refs) {
  const p = path.join("interview", r);
  const ok = fs.existsSync(p);
  if (!ok) miss++;
  console.log((ok ? "OK   " : "MISS ") + r);
}
console.log(miss ? `!! 缺失 ${miss} 个引用` : "全部引用存在");
process.exit(miss ? 1 : 0);
