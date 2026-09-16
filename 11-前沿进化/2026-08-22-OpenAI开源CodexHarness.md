---
tags: [前沿进化, Harness, OpenAI, Codex]
created: 2026-08-22
sources: GitHub openai/codex（Apache-2.0）; 今日头条/凤凰网报道交叉; OpenAI 官方博客（转述）
---

# OpenAI 开源 Codex Harness：Harness 时代正式全面到来

> [!note] 一句话本质
> OpenAI 把 Codex 的**底层运行时**开源了（Apache-2.0，免费商用）。最震撼的数据：**没换模型，只优化 Harness（保留推理+上下文压缩），ARC-AGI-3 得分从 13.3% 飙到 38.3%，输出 Token 省 6 倍**——"模型外面的工程"值多少钱，这下有官方标价了。

## 发生了什么

| 事件 | 要点 |
| --- | --- |
| **开源 Codex Harness** | GitHub `openai/codex` 完整开放。不是模型权重，是支撑 Codex 全系列的**智能体运行时**（Runtime） |
| OpenAI 总裁定调 | Greg Brockman：要把 Agent **嵌入大家正在用的业务系统**，而不是让所有人迁移到聊天框——"反套壳"宣言 |
| 战场背景 | Codex 周活破 **2000 万**（一个月前 1000 万）；Claude Code 四周增速降至 5.2%，Codex 同期 20.8%（TickerTrends 数据） |

## 六大核心能力（生产级 Agent 的标配清单）

对话状态管理 / 多轮任务续跑 / 工具调用路由 / 执行流调度 / 权限审批策略 / 沙箱安全隔离。

亮点细节：单任务可**连续自主运行 6 小时以上**，崩溃中断后支持**续跑**不重来；用 **AGENTS.md 结构化知识库**替代无节制拼接长上下文。

> [!tip] 对照你在学的东西
> 这份清单和 [[DeepSeekHarness框架拆解]]（DSH）的七层架构几乎一一对应——状态管理=会话层、续跑=日志回放、工具路由=工具层、审批+沙箱=安全层。**两大巨头殊途同归**：Agent 的竞争力在 Harness，不在模型。

## 为什么这是"Harness 时代全面到来"的三连证据

1. **8月13日** DeepSeek 开源 DSH（万物皆插件，首日 3万 Star）→ [[DeepSeekHarness框架拆解]]
2. **本周** OpenAI 开源 Codex Harness（反套壳，生产级底座）→ 本篇
3. 期间 Anthropic 持续迭代 Claude Code（Design skill 等）→ [[ClaudeCode源码拆解]]

**行业共识已形成：Agent = Model + Harness，而 Harness 工程正在开源化、标准化。** 这正是 [[Agent-Harness脚手架]] 说的"模型是马，Harness 是马具"——马具厂现在公开图纸了。

## 和你知识库的连接

- [[DeepSeekHarness框架拆解]] / [[DSH-10-模型调用与执行链路]] —— DSH 的直接竞品，架构理念对照
- [[ClaudeCode与终端Agent]] —— 三国杀格局：Claude Code / Codex / DSH
- [[PiAgent极简主义拆解]] —— Pi 哲学的反面参照：巨头走的是"全功能生产级"路线
- [[AI编程工具对比]] —— Codex 2000万周活 vs Claude Code 放缓，工具格局正在洗牌

## 面试价值

被问"**Agent 的性能瓶颈在模型还是工程？**"：

> "OpenAI 开源 Codex Harness 时给过一个数字：仅优化 Harness 的推理保留和上下文压缩，GPT-5.6 Sol 在 ARC-AGI-3 从 13.3% 提到 38.3%，Token 少用 6 倍——**模型不变，Harness 优化带来 3 倍能力跃升**。所以我的答案是：模型决定上限，Harness 决定你能摸到几成上限。这也是为什么 2026 年三大厂商同时开源 Harness。"

## 来源与诚实声明

- GitHub：openai/codex（Apache-2.0，可直接查证）
- ARC-AGI-3 数据来自 OpenAI 官方博客（经今日头条等多方转述，数字一致）
- 用户增速数据来自 TickerTrends / CNBC 报道——第三方估算，非官方审计数字
