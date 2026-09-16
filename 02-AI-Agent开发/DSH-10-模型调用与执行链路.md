---
tags: [Agent开发, DeepSeekHarness, 源码解剖, 执行链路]
created: 2026-08-22
sources: 抖音@AI架构师Leo 视频主题引出; 掘金/今日头条/CSDN/DeepSeek技术社区多篇DSH架构深度拆解交叉整理
---

# DSH-10：模型调用与执行链路

> [!note] 本篇定位
> [[DSH-01]]～[[DSH-09]] 讲的都是"**怎么组装**"（profile 叠层、Cordis 拼插件、平面分家）。本篇讲"**组装完之后，一次对话怎么跑**"——模型怎么被调用、循环怎么转、工具怎么过审、日志怎么记。这是大楼通电之后的"水电走线图"。

## 一、模型调用层：ctx.llm 与模型适配器

DSH 是**模型中立**的——它不绑自家 DeepSeek，通过"模型适配器插件"对接近 40 家 LLM 提供商（DeepSeek、OpenAI、Anthropic、本地 Ollama…）。

| 概念 | 说明 |
| --- | --- |
| **模型适配器（Model Plugin）** | 把 DSH 内部统一的请求格式翻译成各家 API 的格式。原生 DeepSeek 适配器走 OpenAI 风格的 Chat Completions 接口 + SSE 流式返回 |
| **ctx.llm 服务** | 插件通过 Cordis 的 Context 拿到 `ctx.llm`，发流式请求——**不直接绑定任何具体模型 SDK** |
| **模型路由（model route）** | 决定当前这个 Agent 连的是哪个模型，配置在 HOST 平面（见 [[DSH-03-两个平面Host与Preset]]：公共设施归物业） |
| **接入方式** | Web UI → 设置 → 模型 → 填 API Key 保存即可，换模型不用改代码 |

> [!tip] 和"加模型=写代码"的框架对比
> LangChain 换个向量数据库可能要改一堆链式代码；DSH 换模型 = 注册一个新的 LLM 适配器插件（或直接在配置里指一下），即插即用。

### 全景：DSH 的七层可替换架构

"一切皆插件"落到具体层级，每一层都有默认实现、也都能换：

| 层级 | 作用 | 默认实现 | 能换成什么 |
| --- | --- | --- | --- |
| 模型层 | LLM 推理 | DeepSeek V4 系列 | Claude、GPT、本地 Ollama（内置 20+ 提供方） |
| 工具层 | 执行具体操作 | 文件读写、Shell、搜索等 **133 个工具** | 任何社区插件或自定义工具 |
| 沙箱层 | 安全隔离运行环境 | workspace-write 沙箱 | Docker、Firecracker 微 VM |
| 循环层 | 控制多轮迭代逻辑 | 标准 Agent 循环 | 自定义循环策略 |
| 传输层 | API 通信协议 | OpenAI 兼容协议 | 自定义协议 |
| 会话层 | 记录与回放执行过程 | append-only JSONL 日志 | 自定义存储后端 |
| 路由层 | 插件加载与依赖管理 | Cordis 微内核 | —（唯一不换的底座） |

> [!info] 为什么"模型和框架同天发布"值得注意
> DeepSeek 把 **V4 Pro 模型和 Harness 框架同一天发布**——模型负责想，Harness 负责干，如同 CPU 和操作系统的关系。这标志着行业竞争重心从"谁的模型更强"转向"**谁的 Agent 跑得更稳更便宜**"：Claude 有 Claude Code、OpenAI 有 Codex、Google 有 Jules，头部模型公司都在造自己的 Agent 框架。

## 二、一次执行的全链路：三层走线

以 `dsh web` 为例，一次执行从启动到出结果分三层：

```text
【第 1 层：启动组合层】选套餐、叠胶片
  dsh CLI 选择 web profile
    → 叠 dsh-base（模型适配器/工具/持久化/沙箱/审批——每个 profile 的第一层）
    → 叠 dsh-web-app（浏览器应用）  [headless 则叠一次性运行器]
    → 叠 profile 自己的 patch → home 级 patch → 命令行 --patch
  应用顺序讲究：bundle 列表 → profile patch → home patch → --patch（后写的覆盖先写的）

【第 2 层：Cordis 运行时】让插件活起来
  维护共享 Context，插件从 ctx.llm / ctx.tools / ctx.sessions / ctx.agents 拿服务
  Typed Event（类型化事件）负责把策略插入运行过程

【第 3 层：能力接缝层】干活的接口
  LLM、Shell、文件系统、沙箱、审批、Skill、SubAgent 都不写死在 Loop 里
  通过 Definition → Provider → Consumer 三角色解耦（见本文第六节）
```

> [!tip] 调试神器
> `dsh --profile web --dump-config` 一条命令把当前 profile 实际加载的**整棵插件树**摊开——每一层配置来自哪个 bundle、被哪层 patch 覆盖过，一目了然。

## 三、Turn 与 Step：Agent 循环的两个层级

DSH 把一次 Agent 循环拆成两级，比"一轮对话"更精细：

| 层级 | 定义 | 白话 |
| --- | --- | --- |
| **Step（步骤）** | 一次模型请求 + 它触发的全部工具调用 | 我"想一次+干一次" |
| **Turn（回合）** | 零到多个 Step，直到"不欠任何东西"为止 | 用户说一句话，我忙到忙完为止 |

一次 Turn 的完整事件流：

```text
turn/start
  → 领取输入（用户消息先进入 Agent 收件箱，
    系统区分"下一轮处理""下一步处理""只注入上下文暂不唤醒"三种语义）
  → 组装 prompt + 工具 schema（见 [[DSH-08-提示词工程拆解]]）
  → agent/pre-step（策略可拒绝执行）
  → step/start
      → llm/stream → assistant/chunk（流式吐字）
      → tool/call（模型要调工具）
      → tools/pre-execute → 审批 → 沙箱 → tools/execute → tools/post-execute
      → tool/result（结果回传）
  → step/end → …（继续下一个 step）… → turn/end
```

这对应 [[Agent核心架构]] 里的 Agent loop，但 DSH 把每一环都做成了**可插拔的事件钩子**——pre-step 可以拒绝、post-execute 可以拦截，全都不用改循环源码。

### 深挖：事件的两类与两种执行模式

**事件按持久性分两类**：

| 类别 | 事件 | 去向 |
| --- | --- | --- |
| 持久会话事件 | `turn/*`、`step/*`、`user/message`、`assistant/*`、`tool/*` | 老老实实写进日志，构成**可回放的历史** |
| 实时扩展点 | `agent/*` | 做队列管理、状态通知、prompt 拦截，**不进日志** |

原则：不是所有事件都值得永久记录，但**所有影响"模型看到什么"的决策，最终都要落到会被记录的那条日志上**。

**事件按执行模式分两种**：

| 模式 | 覆盖事件 | 机制 |
| --- | --- | --- |
| **Waterfall（瀑布式）** | `agent/pre-step`、`agent/request`、`llm/stream`、三个 `tools/*` | 每个监听器必须显式调用 `next()` 才能把处理权传给下游——**和中间件一模一样**。可审查、改写输入、甚至拒绝 |
| **Serial（串行式）** | `agent/turn-stopping` | 没有 `next()`，**任何一个监听者都可以直接一票终止整个回合** |

> [!tip] 一个精妙细节
> 如果首个输入在 `pre-step` 就被拒绝，系统仍会关闭一个"**零步骤的持久轮次**"，把拦截事实忠实记入审计日志——合规透明做到极致。对比：Codex Harness 是线性"输入-提示词-执行-输出"流，外部只能通过有限的 Hook 进程拿通知；DSH 是内存级强类型 Waterfall 拦截器，插件对循环有绝对而安全的控制力。

## 四、工具执行管线：五道关卡

模型说要调工具 ≠ 直接执行。一次工具调用依次经过：

```text
模型输出 tool/call
   ↓ ① 前置策略（pre-policy）——规则校验，比如"禁止 rm -rf"
   ↓ ② 人工审批（approval）——高危操作弹窗问你
   ↓ ③ 沙箱（sandbox）——隔离环境里执行，跑不坏宿主机
   ↓ ④ 实际执行（execute）
   ↓ ⑤ 后置策略（post-policy）——结果校验、脱敏
   → tool/result 记录在案，喂回下一次模型请求
```

> [!warning] 为什么这五道关卡重要
> 这就是"生产级 Agent 运行时"和"玩具 demo"的分水岭：demo 里模型说 `rm` 就 `rm`；生产里每一刀都有前置检查、审批、隔离、审计。面试聊 Agent 安全护栏时（见 [[大厂AI面试题总览与答题方法论]]），这就是现成的高级答案素材。

### 进阶：并行工具调用的调度策略

当 LLM 一次返回**多个工具调用**时，DSH 调度器会分析每个调用的执行模式：

| 模式 | 触发条件 | 行为 |
| --- | --- | --- |
| **独占调用（屏障）** | 如 `write_file` 和 `read_file` 对**同一文件**操作 | 形成屏障，所有其他调用必须串行等待 |
| **并行调用** | 相互无冲突 | 进**有界滚动池**（大小由 `maxParallelToolCalls` 配置控制）同时执行 |

**关键约束**：结果必须**按模型返回的顺序最终化**——不能因为并行执行而打乱顺序，这保证了回放时的一致性。如果因取消而跳过了某个调用，调度器会**记录一个合成的错误结果**，而不是留下空洞（日志不留洞）。

### 进阶：Code Mode——沙箱里跑代码

DSH 支持特殊的"代码模式"：Agent 调用 `run_code` 工具时提交一段代码（TypeScript 或 Python），在沙箱中执行，且**代码内部可以访问所有其他工具**。换句话说：

```text
普通模式：模型逐个调用 read/write/bash…（每步都要过 LLM）
Code 模式：run_code 是唯一暴露给模型的工具，
          文件读写、Shell 等能力通过 ctx.codeRuntime 在程序内部访问
          → 一段代码干完一串活，省掉多轮 LLM 交互
```

## 五、会话日志第一性：Model-visible means logged

DSH 最硬核的设计原则，值得单独加粗：**凡是进入模型请求的内容，必须能从会话日志（session log）中重建出来**——而且有运行时不变量断言强制保证。

| 特性 | 说明 |
| --- | --- |
| **Append-only 事件流** | 会话日志是只追加的事件流（12 种事件变体：turn/start、tool/call、assistant/chunk…），不允许改历史 |
| **deriveMessages 投影** | 模型看到的对话历史，不是直接存的，而是**从事件日志实时投影**出来的。日志是第一性的，上下文是派生的 |
| **会话分叉** | 支持从任意历史时间点拆出新会话分支——多版本推理策略对比、方案迭代、ablation 实验随便做 |
| **百分百保真回放** | 连流式输出的碎片事件都留着，重放能完全还原当时的 UI 交互和模型输出 |
| **全流程可审计** | 无隐性上下文、无黑盒状态，所有输入输出、决策依据、执行行为可追溯 |

**和传统框架的本质差异**：传统框架把会话日志当"上下文缓存工具"（丢了也能凑合跑）；DSH 把它定义为**系统运行底层不变式**——"无日志即无模型输入"，从架构根源杜绝状态混乱。

> [!tip] 记忆钩子
> 大楼比喻续篇：前 9 篇讲的是"怎么盖楼、怎么装修"，这一节讲的是**物业的监控室**——楼里发生过的每一件事都有台账，台账不可篡改，且"我"能看到的一切都必须在台账里有出处。

## 六、Capability Seam：能力接缝三角色

DSH-05 词汇表里的 Slot（插槽）是 **UI 挂钩**；Capability Seam（能力接缝）是另一回事——**可替换能力单元的标准分解**，一个能力拆成三个完全解耦的角色：

| 角色 | 职责 | 白话 | 特点 |
| --- | --- | --- | --- |
| **Service Definition** | 定义标准化接口、入参出参、能力边界 | 只定规矩，不干活 | 全局唯一、稳定不变 |
| **Service Provider** | 按接口落地具体能力 | 真正干活的 | 多版本并存（本地/云端/沙箱实现），可替换可新增 |
| **Consumer** | 只依赖标准接口调用能力 | 用的人 | 完全不感知底层实现切换 |

**工程实例——文件读写能力**：

```text
Definition：全局统一的 read/write 文件接口规范
Provider ①：本地磁盘实现（日常开发用）
Provider ②：云端沙箱实现（生产安全隔离用）   ← 按需切换，互不干扰
Consumer ：文件操作工具、代码编辑能力直接调标准接口
           底层从本地切到云端，消费端零改造
```

这就是"本地执行换远程沙箱只改配置不改代码"的原理，也是 [[DSH-06-动态插件运行时扩展]] 能"边跑边换零件"的架构基础。

## 七、核心脊柱：七模块怎么串起来

从 Agent 出生到模型调用，核心脊柱的协作链路（源码级视角）：

```text
① AgentLoop（agent-loop 包）作为 AgentFactory
    通过 ctx.agents.create() 创建 Agent
② SessionStore（session 包）
    prepare → enter → announce 三步把会话插入存储
③ createScope 铸造 Agent 作用域上下文
④ setup 回调：注册工具、提示词段落、变量
⑤ 公告事件：session/created → agent/created → agent/session-start
⑥ ReactLoopAgent.kick() 驱动循环，开始第三节的 Turn/Step 流程
```

注意 ①：**连 Agent 循环本身都是插件**（no privileged core，没有特权内核）。在 Claude Code 里改主循环要 fork 整个项目；在 DSH 里只是换一个 agent-loop 插件。

## 八、一图总结

```text
你说话 → 收件箱（三种消息语义）
      → Turn 开启：组装 prompt（[[DSH-08]]）+ 工具 schema
      → Step：ctx.llm 流式请求（模型适配器 → 40家任选）
      → 要调工具？→ 五道关卡（策略→审批→沙箱→执行→后置）
      → 结果回传 → 下一个 Step……直到不欠任何东西 → Turn 结束
      全程：每个事件追加进 session log（不可篡改）
            模型历史 = deriveMessages 从日志投影（可分叉/回放/审计）
```

## 相关笔记

- [[DeepSeekHarness框架拆解]] —— 系列总览（本篇为第 10 块积木）
- [[DSH-03-两个平面Host与Preset]] —— 模型路由放 HOST 平面的原因
- [[DSH-06-动态插件运行时扩展]] —— Capability Seam 是动态扩展的架构基础
- [[DSH-08-提示词工程拆解]] —— 事件流中"组装 prompt"一环的展开
- [[DSH-09-与其他框架对比]] —— 固定内核（Claude Code）vs 无特权内核（DSH）
- [[Agent核心架构]] —— Agent loop 通用原理
- [[Agent评估与调试]] —— 日志可回放 = 可评估的根基
