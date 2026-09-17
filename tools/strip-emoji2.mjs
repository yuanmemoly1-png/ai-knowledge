// 二次清理：剩余的行内装饰 emoji（sec 前缀、🎯/📖/📐 前缀、🫧/🎉/🔁 等）
// 保留：主题按钮 ☀️🌙（功能性）、tabbar 几何符号、✓/› 状态符
import fs from "node:fs";

const P = "interview/assets/app.js";
let s = fs.readFileSync(P, "utf8");
const before = (s.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]/gu) || []).length;

// sec 内文字前缀（含 style 变体）
s = s.replace(/(<div class="sec"[^>]*>)[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]+\uFE0F?\s*/gu, "$1");

// 具体前缀符号
s = s.replace(/🎯\s*/gu, "");
s = s.replace(/📖\s*/gu, "");
s = s.replace(/📐\s*/gu, "");
s = s.replace(/🫧\s*<\//gu, "</");
s = s.replace(/\s*🎉/gu, "");
s = s.replace(/🔁\s*/gu, "");
s = s.replace(/🛰️\s*/gu, "");
s = s.replace(/🔬\s*/gu, "");
s = s.replace(/🤖\s*/gu, "");
s = s.replace(/⚙️\s*/gu, "");
s = s.replace(/📋\s*/gu, "");
s = s.replace(/🧠\s*/gu, "");
s = s.replace(/🔍\s*/gu, "");
s = s.replace(/✍️\s*/gu, "");
s = s.replace(/💡\s*/gu, "");
s = s.replace(/❗\uFE0F?\s*/gu, "");
s = s.replace(/⚠️\s*/gu, "");
s = s.replace(/🔥\s*/gu, "");
s = s.replace(/<i>✍️<\/i>/gu, "<i>✎</i>");
s = s.replace(/<i>🫧<\/i>/gu, "<i>◌</i>");

// 空状态里的图标位改为更克制的符号
s = s.replace(/<i>📡<\/i>/gu, "<i>◌</i>");
s = s.replace(/<i>📝<\/i>/gu, "<i>✎</i>");

const after = (s.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]/gu) || []).length;
fs.writeFileSync(P, s);
console.log(`emoji: ${before} → ${after}`);
