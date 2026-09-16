---
tags: [Agent开发, 源码解剖, Harness]
created: 2026-08-02
---

# 真实 Agent 源码解剖（Kimi Code CLI × Claude Code）

> [!note] 为什么读这篇
> 学 Agent 最快的方式不是再刷一篇概念文，而是**看一个真实产品级 Agent 是怎么搭的**。我们手上有两个难得的样本：
> - **Kimi Code CLI** — 月之暗面 2025 年程序员节**主动开源**，Python 写的，代码干净，适合新手读
> - **Claude Code** — 2026 年 3 月因打包事故**意外泄露** 51 万行 TypeScript 源码，让全世界看到了顶级 Agent 的内部设计
>
> 本篇把两者拆开对照，你会发现：它们和你库里学的 [[Agent核心架构]]、[[Agent-Harness脚手架]] 是同一套骨架。

> [!tip] 想钻得更深？
> 这篇是"导游图"。逐文件代码级拆解在：[[KimiCLI源码拆解]]（真源码精读）、[[ClaudeCode源码拆解]]（八机制深挖）。

## 样本一：Kimi Code CLI（主动开源）

- **仓库**：[MoonshotAI/kimi-cli](https://github.com/MoonshotAI/kimi-cli)（Python）；演进版 [MoonshotAI/kimi-code](https://github.com/MoonshotAI/kimi-code)；官方还在用 Rust 重写运行时 [kimi-agent-rs](https://github.com/MoonshotAI/kimi-agent-rs)
- **能力**：读写代码、执行 shell 命令、搜索文件、抓取网页——就是一个跑在终端里的 [[Agent智能体]]
- **适合你的原因**：你正在学 Python，这套源码**直接读得懂**，没有语言障碍

> [!tip] 推荐阅读顺序（给 0 基础进阶者）
> 1. 先 clone 下来，找到主入口，看「用户输入 → 调模型 → 执行工具 → 回传结果」的主循环怎么写
> 2. 再看一个具体工具（比如读文件工具）的完整定义：schema 怎么声明、权限怎么检查、结果怎么包装
> 3. 最后看上下文管理：历史消息是怎么被压缩和截断的
>
> 每一层都对应 [[工具调用实战]] 里你写过的 demo，只是更工程化。

## 样本二：Claude Code 泄露事件（事故开源）

### 事件复盘

2026 年 3 月 31 日，Anthropic 发布 Claude Code v2.1.88 的 npm 包时，**误把一个 57MB 的 `cli.js.map`（source map）文件打了进去**。source map 里有两个数组：`sources`（文件路径）和 `sourcesContent`（完整源码），一一对应——等于把 **4756 个源文件、51.2 万行未经混淆的 TypeScript 源码**直接公开了，其中 1906 个是 Claude Code 自身源码。数小时内代码传遍 GitHub（[事件报道](https://juejin.cn/post/7623261494689021952)）。

> [!warning] 什么是 source map？（前端知识点）
> 生产环境的 JS 会被压缩混淆成不可读的一团，source map（`.map` 文件）是"翻译对照表"，能把混淆代码映射回原始源码，**只该存在于开发环境，绝不能进生产包**——这是前端构建的基本常识。Anthropic 这种顶级团队也栽在 `.npmignore` 配置疏漏上。
>
> 教训对所有开发者通用：**发布前检查包里到底有什么**（`npm pack --dry-run`）。你以后学完 [[前端框架入门]] 做构建时会深有体会。

### 泄露源码揭示的内部架构

从还原的代码看，Claude Code 的设计可以拆成六层（[架构分析参考](https://yinlei.org/x-plane10/claude-code10ai-agent.html)）：

| 层 | 干什么 | 关键实现 |
| --- | --- | --- |
| UI 层 | 终端界面 | 用 **React + Ink** 在终端里画界面（CLI 也能用 React 渲染，很反直觉） |
| 主循环 | Agent Loop | REPL 循环：用户输入 → 调模型 → 流式输出 → 执行工具 → 结果回传（`src/query.ts`） |
| 工具系统 | 每个工具一个模块 | 统一接口：名称 + schema + 权限检查 + 执行函数（`src/Tool.ts`） |
| 权限安全 | 多层防御 | 系统提示词约束 + 独立权限系统 + 工具级安全检查（`src/utils/permissions/`）——**安全不是一句提示词，是三层机制** |
| 上下文管理 | 防爆炸 | 对话过长时自动 compact 压缩（`src/services/compact/`），对应 [[记忆与上下文工程]] |
| 系统提示词 | 行为塑造 | 约束极细：少抽象、少写注释、如实报告结果、不做用户没要的事（`src/constants/prompts.ts`） |

### 一个有意思的发现：反蒸馏机制

源码里还内置了"防抄作业"设计——**注入假工具调用、模糊化工具执行细节**，让竞争对手难以用 Claude Code 的输出轨迹去训练自己的模型（即"反蒸馏"）。这说明顶级公司把 Agent 的**行为轨迹**也视为核心资产。

> [!example] 提示词风格值得抄
> 泄露的系统提示词里反复强调：最小改动、不过度设计、如实汇报、不做没要求的事——这恰好和 [[VibeCoding方法论]] 里的最佳实践一致。**好的 Agent 行为，一半靠代码，一半靠提示词约束。**

## 两套实现 × 你库里的概念对照

| 架构概念 | Kimi Code CLI | Claude Code | 你的笔记 |
| --- | --- | --- | --- |
| 主循环 | Python agent loop | TS REPL（query.ts） | [[Agent核心架构]] |
| 工具调用 | 读文件/shell/搜索/抓网页 | 每工具一模块，带权限钩子 | [[工具调用实战]] |
| 权限护栏 | 危险操作需确认 | 三层防御体系 | [[Agent评估与调试]] |
| 上下文压缩 | 历史消息管理 | compact 服务 | [[记忆与上下文工程]]、[[上下文窗口]] |
| 系统提示词 | 角色+规则注入 | 极细的行为约束清单 | [[Prompt与提示词工程]] |
| 子代理 | 子 Agent 并行 | Task 子代理机制 | [[CrewAI多智能体]]、[[Agent-Harness脚手架]] |

**结论：天下 Agent 一个骨架。** 区别只在工程深度：权限做几层、上下文压缩多聪明、提示词磨多细。

## 给你的动手建议

```text
第 1 步：跟着 [[工具调用实战]] 写出带工具调用的 demo（你已经能做）
第 2 步：clone MoonshotAI/kimi-cli，对照本笔记的"六层"找对应代码
第 3 步：给你的 demo 加一层权限确认（危险操作先问人）→ 你就在做 Harness 了
第 4 步：加上下文压缩（历史超 N 条就摘要）→ 对标 compact.ts
第 5 步：看完 [[从零实现LLM专题]] 后，回头理解"模型侧"发生了什么
```

> [!warning] 法律与伦理提醒
> Claude Code 泄露代码仍受版权保护（[律师观点](https://m.sohu.com/a/1004085193_115362)）：**学习架构思想可以，复制代码或商用复刻有法律风险**。想正经读源码，优先读主动开源的 Kimi Code CLI；想看 Claude Code 的分析，读社区二手解读文章（如上文链接）即可。

## 相关笔记

- [[Agent-Harness脚手架]]
- [[Agent核心架构]]
- [[工具调用实战]]
- [[ClaudeCode与终端Agent]]
- [[记忆与上下文工程]]
- [[DeepSeekHarness框架拆解]]（第三个样本：本机正在跑的 Harness）
- [[PiAgent极简主义拆解]]（第四个样本：418 行核心循环的极简主义反例）
- [[2026-08-22-OpenAI开源CodexHarness]]（第五个样本：OpenAI 生产级底座开源——ARC-AGI-3 仅靠 Harness 优化从 13.3%→38.3%。至此 Claude Code / Codex / DSH / Pi 四大 Harness 全部可对照学习）
