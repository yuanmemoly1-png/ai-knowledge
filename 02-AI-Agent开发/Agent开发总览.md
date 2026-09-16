---
tags: [Agent开发, 学习路线, MOC]
created: 2026-08-02
---

# Agent 开发总览

本模块讲解如何从零开始构建 AI Agent（智能体）：从理解核心概念，到使用 LangChain、LangGraph、CrewAI 等框架，再到接入 MCP 协议、评估与调试上线。如果你还不清楚「什么是 Agent」，建议先读 [[Agent智能体]] 再回来。

> [!note] 什么是 Agent
> Agent 是一个由 LLM 驱动的系统：模型不再只是「一问一答」，而是能自己**规划步骤、调用工具、观察结果、继续行动**，直到完成目标。简单说：LLM 是大脑，Agent = 大脑 + 手脚（工具）+ 记忆 + 循环。

## 本模块笔记清单

1. [[Agent核心架构]] — 规划、记忆、工具、行动四要素 + Agent loop 伪代码
2. [[ReAct与Agent设计模式]] — ReAct、Plan-and-Execute、Reflection、Multi-Agent 四大设计模式
3. [[工具调用实战]] — Function Calling 完整 Python 示例（计算器 + 查天气）
4. [[记忆与上下文工程]] — 短期/长期记忆、Context Engineering、上下文污染与对策
5. [[LangChain入门]] — LangChain 生态与 LCEL 链式调用入门
6. [[LangGraph状态图]] — 用 StateGraph 构建有状态的 Agent 工作流
7. [[CrewAI多智能体]] — Agent + Task + Crew 三要素与多智能体协作
8. [[MCP协议实战]] — 用 FastMCP 编写 MCP server 并接入客户端
9. [[Agent评估与调试]] — 常见问题、trace 观测、评估维度与护栏
10. [[Agent自进化]] — 从"会做事"到"会成长"：四层进化路径 + What/When/How/Where 学术框架 + 清华AIR三层进化理论
11. [[一人公司与AI专家团队]] — 应用篇：你当导演 + Agent 当员工；两层架构（编排层/执行层）与上下文零和博弈
12. [[Agent-Harness脚手架]] — Harness 概念解析：模型是马，Harness 是马具
13. [[真实Agent源码解剖]] — Kimi Code CLI（开源）× Claude Code（泄露）六层架构对照
14. [[KimiCLI源码拆解]] — 逐文件代码级拆解（clone 真源码精读，藏在 `.refsrc/`）
15. [[ClaudeCode源码拆解]] — 泄露源码八机制深挖（基于公开逆向分析）
16. [[PiAgent极简主义拆解]] — 第四样本：418 行循环 + 4 工具 + <1000 token 提示词，Databricks 基准跑赢 Claude Code 的极简哲学（"Agent 本质 = 模型+工具+循环"的实证）
17. [[DeepSeekHarness框架拆解]] — **本机正在跑的 Harness（DSH）逐层拆解**：10 篇，从 `dsh` 入口 → profile 叠层 → Cordis 插件化 → 两个平面 → 配置文件 → 动态插件 → 动手复制 preset → 提示词工程 → 框架对比 → 模型调用与执行链路
18. [[DSH-07-实操复制Preset改出自己的Agent]] — 动手篇：复制 standard preset，改成自己专属的 Agent（附 [[小白课-DeepSeekHarness一栋大楼]] 白话版）
19. [[DSH-08-提示词工程拆解]] — 深入核心：DSH 怎么"拼装"系统提示词（身份/人设/指引三层 + 变量 + 动态上下文 + AGENTS.md 注入）
20. [[DSH-09-与其他框架对比]] — 全景定位：库→框架→成品三段，DSH vs LangChain / LangGraph / CrewAI / Claude Code / Kimi Code CLI / MCP
21. [[DSH-10-模型调用与执行链路]] — 通电篇：一次对话从模型调用（ctx.llm/适配器）到 Turn/Step 事件流、工具五道关卡、会话日志第一性的全链路
22. [[提示词工程-真实案例拆解]] — 提示词工程实战：读 DSH / Claude Code 真实提示词，归纳十个套路（身份/变量/模式约束/优先级/防注入…）
23. [[提示词工程-MOC]] — 提示词工程学习路径总图：小白课 ×2 → 理论 → 真实案例 → 方法论 → 实战案例

## 推荐学习顺序

Agent 开发最忌讳一上来就手写复杂框架代码。推荐按「五级台阶」循序渐进：

| 阶段 | 目标 | 对应笔记 | 产出 |
| --- | --- | --- | --- |
| 1. 用现成工具 | 体验 Agent 能做什么 | 先用 ChatGPT、Cursor 等内置 Agent 功能 | 建立直觉 |
| 2. 学会 Function Calling | 理解 Agent 的最小闭环 | [[工具调用实战]] | 一个能调工具的 demo |
| 3. 用框架搭建 | 快速构建可用的 Agent | [[LangChain入门]] → [[LangGraph状态图]] | 一个带工具的 Agent |
| 4. 手写 Agent loop | 真正理解 ReAct 循环 | [[Agent核心架构]]、[[ReAct与Agent设计模式]] | 不依赖框架的 Agent |
| 5. 多智能体与生产化 | 复杂协作 + 上线运维 | [[CrewAI多智能体]]、[[MCP协议实战]]、[[Agent评估与调试]] | 可观测、可评估的系统 |

> [!tip] 给零基础的建议
> - Python 不熟先看 [[Python学习路线]] 和 [[面向AI开发的Python]]。
> - 框架只是一个「胶水层」，真正的核心是理解 Agent loop。建议完成阶段 4（手写 loop）后再回头看框架，会有「原来框架只是帮我写了这些」的通透感。
> - 每学一个概念，立刻写代码验证，不要只读文档。

## 前置知识

- 名词概念：[[Prompt与提示词工程]]、[[FunctionCalling函数调用]]、[[上下文窗口]]、[[RAG检索增强生成]]
- Python 基础：[[基础语法速查]]、[[环境搭建与包管理]]

## 相关笔记

- [[Agent智能体]]
- [[Agent核心架构]]
- [[FunctionCalling函数调用]]
- [[主页]]
