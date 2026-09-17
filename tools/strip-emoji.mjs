// 一次性脚本：清理 app.js 模板字符串里"标题/分组/按钮"层的装饰性 emoji。
// 保留：行内功能性图标（列表行 row-i、tabbar 图标、题库/访谈卡片状态）。
// 原则：标题文字不加图形，靠字重与留白分层。
import fs from "node:fs";

const P = "interview/assets/app.js";
let s = fs.readFileSync(P, "utf8");
const before = (s.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]/gu) || []).length;

// 1) .sec 标题前缀：`<div class="sec">💡 xxx</div>` → `xxx`
s = s.replace(/(<div class="sec">)\s*[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]+\uFE0F?\s*/gu, "$1");

// 2) 按钮文字前缀：`>✅ 标记已学<` → `>标记已学<`（作用于 .btn 的 > 开头文本）
s = s.replace(/(btn[^>]*>)[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]+\uFE0F?\s*/gu, "$1");

// 3) kicker / hero 内的装饰 emoji
s = s.replace(/(<div class="kicker">)\s*[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]+\uFE0F?\s*/gu, "$1");

const after = (s.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]/gu) || []).length;
fs.writeFileSync(P, s);
console.log(`emoji: ${before} → ${after}（移除 ${before - after} 个装饰性 emoji）`);
