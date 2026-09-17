// 清点 app.js + index.html 用到的全部 class 名，供 CSS 重构时确保不漏组件
import fs from "node:fs";

const files = ["interview/assets/app.js", "interview/index.html"];
const set = new Set();

for (const f of files) {
  const s = fs.readFileSync(f, "utf8");
  // 静态 class="a b c"
  for (const m of s.matchAll(/class="([^"$]*?)"/g)) {
    for (const c of m[1].split(/\s+/)) if (c && !c.includes("{")) set.add(c);
  }
  // 模板字符串里的 class="a ${...} b" —— 取静态部分
  for (const m of s.matchAll(/class="([^"]*)"/g)) {
    const parts = m[1].split(/\s+/).map((x) => x.trim()).filter((x) => x && !x.includes("$") && !x.includes("{") && !x.includes("}") && !x.includes("`") && !x.includes("?") && !x.includes(":"));
    for (const c of parts) if (/^[a-z][a-z0-9-]*$/i.test(c)) set.add(c);
  }
  // querySelector 里用到的选择器类
  for (const m of s.matchAll(/(?:querySelector|closest)\(\s*"([^"]+)"/g)) {
    for (const c of m[1].matchAll(/\.([a-z][a-z0-9-]*)/gi)) set.add(c[1]);
  }
}

const arr = [...set].sort();
console.log("类名总数:", arr.length);
console.log(arr.join(" "));
