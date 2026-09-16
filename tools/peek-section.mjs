// 抽查：打印指定节的完整内容，用于人工质量复核
import fs from "node:fs";
import vm from "node:vm";

const want = process.argv.slice(2);
const s = { window: {}, console };
vm.createContext(s);
for (const f of fs.readdirSync("interview/data").filter((f) => /^tb-.*\.js$/.test(f))) {
  vm.runInContext(fs.readFileSync("interview/data/" + f, "utf8"), s, { filename: f });
}
const TB = s.window.TB_SECTIONS;
for (const id of want) {
  const x = TB[id];
  if (!x) { console.log(`[${id}] 不存在`); continue; }
  console.log("=".repeat(70));
  console.log(`【${id}】${x.t}`);
  console.log(`from: ${x.from || "(无)"}`);
  console.log(`why : ${x.why}`);
  console.log(`learn: ${x.learn}`);
  console.log("-".repeat(70));
  console.log(x.body);
  console.log("-".repeat(70));
  console.log("关键结论:");
  (x.keypoints || []).forEach((k) => console.log("  · " + k));
  console.log("常见误用:");
  (x.pitfalls || []).forEach((k) => console.log("  ! " + k));
  console.log("关联笔记:", (x.rel || []).join(" | "));
  console.log("配套真题:", (x.qs || []).join(", ") || "(无)");
}
