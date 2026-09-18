// 验证假设：必背代码的「句长均匀」是写作问题，还是列表型结构造成的假阳性？
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";

const DATA = "interview/data";
const s = { window: {}, console };
vm.createContext(s);
for (const f of fs.readdirSync(DATA).filter((f) => /^codebank(-code[a-c])?\.js$/.test(f))) {
  vm.runInContext(fs.readFileSync(path.join(DATA, f), "utf8"), s, { filename: f });
}
const CI = s.window.CODE_ITEMS;
const cjk = (t) => (t.match(/[\u4e00-\u9fa5]/g) || []).length;

function cvOf(texts) {
  const lens = texts.map(cjk).filter((n) => n >= 2);
  if (lens.length < 3) return { n: lens.length, mean: 0, cv: 0 };
  const mean = lens.reduce((a, b) => a + b, 0) / lens.length;
  const sd = Math.sqrt(lens.reduce((a, b) => a + (b - mean) ** 2, 0) / lens.length);
  return { n: lens.length, mean: +mean.toFixed(1), cv: +(sd / mean).toFixed(3) };
}

// 按字段分开算：scene 是散文段落，keys/traps 是并列列表项
const sceneSents = [];
const listItems = [];
for (const c of Object.values(CI)) {
  for (const x of String(c.scene).split(/[。！？；\n]+/)) if (cjk(x) >= 2) sceneSents.push(x);
  for (const k of c.keys || []) listItems.push(k);
  for (const k of c.traps || []) listItems.push(k);
}
const sc = cvOf(sceneSents);
const li = cvOf(listItems);
console.log(`scene 散文句：${sc.n} 句，平均 ${sc.mean} 字，CV ${sc.cv}  ${sc.cv >= 0.4 ? "✓ 正常" : "← 偏平"}`);
console.log(`keys/traps 列表项：${li.n} 条，平均 ${li.mean} 字，CV ${li.cv}  ${li.cv >= 0.4 ? "✓ 正常" : "← 均匀"}`);

// 对照：教材的 keypoints/pitfalls 也是列表，CV 该是多少？
const s2 = { window: {}, console };
vm.createContext(s2);
for (const f of fs.readdirSync(DATA).filter((f) => /^tb-.*\.js$/.test(f))) {
  vm.runInContext(fs.readFileSync(path.join(DATA, f), "utf8"), s2, { filename: f });
}
const TB = s2.window.TB_SECTIONS;
const bookList = [];
const bookProse = [];
for (const x of Object.values(TB)) {
  for (const k of x.keypoints || []) bookList.push(k);
  for (const k of x.pitfalls || []) bookList.push(k);
  for (const seg of String(x.body).split(/[。！？\n]+/)) if (cjk(seg) >= 2) bookProse.push(seg);
}
const bl = cvOf(bookList), bpr = cvOf(bookProse);
console.log(`\n对照 · 教材 keypoints/pitfalls 列表项：${bl.n} 条，CV ${bl.cv}`);
console.log(`对照 · 教材正文散文句：${bpr.n} 句，CV ${bpr.cv}`);
