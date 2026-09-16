---
tags: [Agent开发, 源码解剖, Harness, 极简主义]
created: 2026-08-22
sources: 抖音@费曼学徒冬瓜 视频主题引出; CSDN/掘金/人人都是产品经理/SegmentFault 多篇 Pi Agent 深度解析交叉整理
---

# Pi Agent：极简主义拆解

> [!note] 一句话定位
> **"An autonomous agent is just an LLM + tools + a loop."（一个自主智能体就是：模型 + 工具 + 循环）**——Pi 把这句话做到了极致：核心运行时约 1500 行 TypeScript，系统提示词不到 1000 token，内置工具只有 **4 个**，却在 Databricks 内部基准测试中跑赢了 Claude Code 和 Codex。

> [!info] 它是谁
> Pi（命令 `pi`）由 Mario Zechner（知名游戏框架 libGDX 作者，GitHub @badlogic）创建，现由 Earendil Works（Flask 作者 Armin Ronacher 所在组织）维护。它同时是 **OpenClaw 智能体平台的嵌入式引擎**。定位：minimal terminal coding harness（极简终端编码脚手架）。

## 一、为什么值得拆它：三种真实架构的"第三极"

你库里已经拆了三个真实样本，Pi 正好补上光谱的另一端：

| 样本 | 哲学 | 核心循环 | 扩展方式 | 笔记 |
| --- | --- | --- | --- | --- |
| Claude Code | 稳健成品：固定内核 | 固定 Agent Loop | 只能从边上插（Hook/MCP） | [[ClaudeCode源码拆解]] |
| DeepSeek Harness | 激进插件化：no privileged core | **主循环本身是插件** | 换配置即换内核 | [[DeepSeekHarness框架拆解]] |
| **Pi Agent** | **极简主义：Opinionated and Minimal** | 418 行核心循环 | TypeScript 扩展按需加载 | 本篇 |

一句话对比：**DSH 是"万物皆插件"，Pi 是"核心小到能装进脑子"**。两者殊途同归——都反对"框架替用户做太多不可修改的决定"。

## 二、核心数据：克制到什么程度

| 维度 | Claude Code 等主流工具 | Pi |
| --- | --- | --- |
| 核心 agent 循环代码量 | 数千行 TypeScript | **约 418 行**（整个核心 ~1500 行 / 5 个文件） |
| 系统提示词 | 上万 token | **< 1000 token**（约 150-200 词） |
| 默认工具 | 10-20 个 | **4 个**：read / write / edit / bash |
| 模型支持 | 绑定自家模型 | **15+ 提供商、300+ 模型**（含 Ollama/vLLM 本地部署） |
| MCP / 子代理 / 权限弹窗 / 计划模式 | 内置 | **全部没有**——刻意不做，交给扩展 |
| 每轮发送的上下文 | — | 约为其他工具的 **1/3** |
| 基准成绩 | 参照系 | Databricks 内部测试：Claude Opus 4.8 下**通过率最高、成本显著更低** |

> [!tip] 为什么"少"反而赢了
> 上下文小 → 模型注意力不被淹没 → 每轮成本降为 1/3 → 同预算跑更多轮 → 通过率反超。这是 [[记忆与上下文工程]] 里"上下文是稀缺资源"的最有力实证：**塞给模型的越多，不等于模型表现越好**。面试聊"为什么 Claude Code 提示词那么长却未必好"时，Pi 就是现成论据。

### Mario Zechner 的核心论断（为什么敢这么删）

> **前沿 LLM 经过 RL 训练后，已经具备足够的理解和执行能力，能清晰认知"编码 Agent"的核心职责——根本不需要冗长的系统提示词和复杂辅助模块来"教"它怎么工作。**

主流框架的误区是"加法思维"：能力不够？加工具、加提示词、加规划链路、加子 Agent。Pi 反其道而行：模型已经会了，框架的职责只是**别挡路**（组织上下文、提供工具、执行操作、返回结果）。这就是"模型是发动机，Harness 是底盘"——底盘越轻，发动机性能发挥越充分。

### 第三方实测佐证

- **Terminal-Bench 2.0** 排行榜：极简架构跻身前列，与众多复杂架构 Agent 同台竞技
- **OpenRouter 公开 Agent 榜单**：曾排名第六（截至 2026-07）
- **GitHub 70,000+ Star**、同模型同任务实测 Token 消耗明显低于 Claude Code / Codex
- **Databricks 内部基准**：Claude Opus 4.8 下通过率最高、成本显著更低（上下文仅约 1/3）

## 三、四层架构：每层都能单独用

TypeScript monorepo，四个独立包，可以只用底层不装 CLI：

```text
┌─────────────────────────────────────┐
│ pi-coding-agent                     │ ← 产品层：CLI/TUI 交互、会话管理、扩展系统
├─────────────────────────────────────┤
│ pi-agent-core                       │ ← 运行时核心：Agent Loop、工具调用、状态管理
├─────────────────────────────────────┤
│ pi-ai                               │ ← 统一 LLM API：屏蔽 OpenAI/Anthropic/Google 差异
├─────────────────────────────────────┤
│ pi-tui                              │ ← 终端 UI 库：差量渲染
└─────────────────────────────────────┘
```

| 包 | 干什么 | 亮点 |
| --- | --- | --- |
| **pi-ai** | 把 4 种协议（OpenAI Completions/Responses、Anthropic Messages、Google GenAI）归一为统一事件流 | **杀手级功能：跨提供商上下文迁移**——同一会话先用 Claude 思考、再切 GPT-4o 验证，上下文无缝携带（Claude 的 thinking 自动转成 `<thinking>` 标签给别家读） |
| **pi-agent-core** | 有状态 Agent 运行时：循环、工具、事件流 | **双嵌套循环**：外循环处理用户 follow-up，内循环处理工具调用；支持中途打断（steering）和消息排队 |
| **pi-tui** | 终端界面 | 差量（增量）渲染，只重画变化的部分 |
| **pi-coding-agent** | 拼装成编程 Agent CLI | 会话持久化（树形 JSONL，支持分叉 Fork）、扩展系统、上下文压缩 |

> [!tip] 和 DSH 对照着看
> pi-ai ≈ DSH 的模型适配器层（[[DSH-10-模型调用与执行链路]] 第一节）；pi-agent-core ≈ DSH 的 agent-loop 插件；区别是 Pi 把它定死为核心（简单），DSH 把它做成可替换插件（灵活）。**没有银弹，只有取舍**。

## 四、扩展系统：核心之外的一切

Pi 刻意不内置的东西，全靠 **TypeScript 扩展**（in-process，进程内加载）补：

- **25+ 事件钩子**：扩展可订阅 agent 生命周期事件、拦截工具调用（`tool_call` 钩子可阻断 = 人机审批）
- **写法极简**：写一个 TypeScript 文件丢进 `~/.pi/agent/extensions/` 即可；官方 packages 市场已有 3300+ 个包
- **官方生态**：pi-chat（Slack/聊天场景）、parallel-agent（子代理并行）、pi-loop（循环任务）等
- **刻意不做的例子**：权限弹窗默认 YOLO 模式、无 MCP（用 CLI 工具替代）、无内置子代理（spawn pi 递归实现）

### 双重扩展：Skill 与 Extension 的分工

| 扩展类型 | 改什么 | 类比 |
| --- | --- | --- |
| **Skill**（技能） | 为 Agent 提供完成专业任务的**方法、模板和规范**（教"怎么做某类事"） | 给新员工的 SOP 手册 |
| **Extension**（扩展） | 直接改变 Agent 的**工具、界面、权限与运行方式**（改"能做什么"） | 给机器人装新手臂 |

> [!tip] 最反直觉的能力：元编程（自文档化）
> **Pi 可以阅读自己的扩展文档和代码库，根据自然语言要求为自己编写和修改扩展**。你可以说"给我加一个语音交互"，它会自己读文档、写代码、装上。这正是 [[Agent自进化]] 里"技能进化"层（把经验外化成 SKILL.md/技能包）的活例子——"软件不再是静态制品，而是**可被 AI 动态改造的生命体**"。

### 四种运行模式

| 模式 | 用途 |
| --- | --- |
| 交互式（TUI） | 日常开发 |
| 打印 / JSON 输出（`pi --print`） | 单次执行，接入管道/脚本 |
| RPC 远程调用 | 被其他程序驱动 |
| SDK 集成 | 嵌入自己的应用当引擎（OpenClaw 就是这么用的） |

> [!warning] YOLO 默认值的争议
> Pi 默认不弹权限确认（信任用户环境），这与 Claude Code 的 deny-first 沙箱哲学相反。**自己玩可以，生产环境必须自己用钩子加护栏**——对照 [[Agent评估与调试]] 的护栏清单。

## 五、三种用法（对应你的三条路线）

| 用法 | 说明 | 对应你的需求 |
| --- | --- | --- |
| 1. 当 Coding Agent 用 | `npm install -g @earendil-works/pi-coding-agent`，替代 Claude Code / Codex | [[AI编程工具对比]] 里的又一个免费开源选项 |
| 2. 学 Agent 架构 | 核心只有 4 工具 + <1000 token 提示词，**一眼看到头**，是学架构的最佳教材 | 配合 [[Agent核心架构]] 读完就能看懂全部源码 |
| 3. 当底座自建 Agent | pi-agent-core 不限编程场景，可承载任意类型 Agent | [[DSH-07-实操复制Preset改出自己的Agent]] 的极简版路线 |

安装与启动：

```bash
npm install -g @earendil-works/pi-coding-agent
# 或 curl -fsSL https://pi.dev/install.sh | sh
cd your-project && pi                    # 交互模式
pi --print "解释这段代码"                  # 单次执行
# 模型配置写在 ~/.pi/agent/models.json，支持 OpenAI/Anthropic/Google/Ollama 等
```

## 六、面试价值：一句话答"Agent 的本质"

被问"Agent 和 Chatbot 的本质区别是什么 / Agent 的本质是什么"时：

> "Agent 的本质就是一个循环：**模型 + 工具 + 循环**。Pi Agent 用 418 行核心代码证明了这一点——没有 MCP、没有子代理、没有复杂编排，照样在 Databricks 基准里跑赢 Claude Code，因为它的上下文只有别人的 1/3。**复杂度是成本，不是能力**。复杂的功能（多智能体、审批、计划模式）都是在'模型-工具-循环'这个骨架上加的肉。"

这个回答同时展示了：概念本质（[[Agent核心架构]] 四要素的极简版）→ 真实证据（Pi 的基准数据）→ 工程判断（上下文经济学），正是 [[大厂AI面试题总览与答题方法论]] 里"原理一句话 + 具体数字 + trade-off"的高分模板。

### 用 15 行伪代码写完整个循环（Pi 的骨架）

```python
def pi_loop(user_prompt, tools, max_iterations=10):
    messages = [system_prompt(), {"role": "user", "content": user_prompt}]
    for _ in range(max_iterations):              # ← 循环
        message = llm_call(messages, tools)      # ← 模型
        messages.append(message)
        if not message.tool_calls:               # 模型不再要工具 = 任务完成
            return message.content
        for call in message.tool_calls:          # ← 工具
            result = execute(call)               # （Pi 这里只可能触发 4 个工具之一）
            messages.append(tool_result(call, result))
```

对照你在 [[工具调用实战]] 写过的 demo：**一模一样的骨架**。Pi 证明的正是：把这段循环打磨到极致（提示词克制、上下文精简、工具原子化），就足以跻身最强 Agent 行列。

## 相关笔记

- [[真实Agent源码解剖]] —— Kimi CLI × Claude Code 双样本（本篇是第三个样本）
- [[Agent核心架构]] —— 四要素理论（Pi 是其极简实证）
- [[DeepSeekHarness框架拆解]] —— 相反哲学的对照（万物皆插件）
- [[Agent-Harness脚手架]] —— Harness 概念
- [[记忆与上下文工程]] —— "上下文越小越好"的实证来源
- [[Agent评估与调试]] —— YOLO 模式的护栏补法
