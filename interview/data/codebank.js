// ============================================================
// 必背代码库 —— 分组的骨架
// 条目正文在 codebank-codea / codeb / codec.js 里，按 id 合并进 window.CODE_ITEMS
// 设计原则：代码必须能背下来（每条 10-25 行），所以这里只放「顺序 + 分组 + 等级」
// ============================================================

window.CODE_BANK = {
  generated: "2026-09-17",
  title: "必背代码",
  subtitle: "面试里唯一能提前背死、现场必须写对的东西",

  groups: [
    { id: "py", name: "Python 地基", desc: "不会写这些，后面全是空中楼阁" },
    { id: "ai", name: "AI 应用骨架", desc: "面试官让你「手写一个」，考的就是这些" },
    { id: "algo", name: "算法岗手撕", desc: "只手撕岗需要，白板上写得出才算数" },
    { id: "ops", name: "工程与运维", desc: "部署、排障、算账：让别人敢把线上交给你" },
    { id: "eval", name: "评测", desc: "证明你的东西真的行，而不是感觉良好" },
  ],

  levels: [
    { id: "must", name: "必背", desc: "写不出来就掉档" },
    { id: "plus", name: "加分", desc: "能默出来是亮点" },
    { id: "algo", name: "算法岗", desc: "只手撕岗要求" },
  ],

  /* 目录顺序（条目正文由 codebank-code*.js 提供） */
  order: [
    /* A. Python 地基 */
    "py-list-dict", "py-comprehension", "py-string", "py-file",
    "py-except", "py-func-class", "py-sql",
    /* B. AI 应用骨架 */
    "ai-llm-min", "ai-messages", "ai-stream", "ai-json",
    "ai-tools-schema", "ai-fc", "ai-react", "ai-rag", "ai-embed",
    "ai-context", "ai-retry", "ai-fastapi", "ai-pytest", "ai-dockerfile",
    /* C. 算法岗手撕 */
    "algo-attention", "algo-mha", "algo-layernorm",
    "algo-kvcache", "algo-lora", "algo-softmax-ce",
    /* D. 工程与运维 */
    "ops-git", "ops-docker", "ops-linux", "ops-token-cost",
    /* E. 评测 */
    "eval-passrate", "eval-llmjudge", "eval-error-analysis",
  ],
};
