---
tags: [Agent开发, 源码解剖, Harness, DeepSeekHarness, 框架对比]
created: 2026-08-06
---

# DSH-09 · 与其他框架对比

> [!note] 一句话结论
> 市面上叫"Agent 框架"的东西其实分**三层**：**库（积木）→ 框架（造 Harness 的工具）→ Harness（跑起来的成品）**。DSH 站在最右端——它是个**已经搭好、且用插件拼装出来的成品 Harness**；而 LangChain / LangGraph / CrewAI 是给你积木的"框架"；Claude Code / Kimi Code CLI 是别人家的成品。先分清这三层，一切对比都顺了。

## 一张图看清它们的位置

```text
 你亲手搭（积木越多，越自由，越要自己写）
 ───────────────────────────────────────────►  开箱即用（成品越完整，越省心，越难改）

 LangChain      LangGraph      CrewAI      Kimi Code CLI     Claude Code      DSH
  (积木库)      (状态图框架)   (多智能体)    (开源成品)       (闭源成品)      (插件化成品)
     │             │            │              │                │              │
  提供 chains   用 StateGraph  用 Crew 组     一套终端 Agent   一套终端 Agent   一套完整 Harness
  tools memory  搭有状态工作流  角色团队       Python 源码      TS(泄露)         Cordis 插件拼装
                                                                               可自修改、可配 preset
```

> [!tip] 关键区分（本库 [[Agent-Harness脚手架]] 已经讲过）
> **Framework（框架）是"造 Harness 的工具"，Harness 是"跑起来的产物"。** 你可以在 LangChain 上亲手搭一个 Harness；而 DSH / Claude Code / Kimi Code CLI 是**别人已经替你搭好的 Harness**。

## 横向对比表

| 维度 | **DSH** | LangChain | LangGraph | CrewAI | Claude Code | Kimi Code CLI |
| --- | --- | --- | --- | --- | --- | --- |
| 本质 | 插件化成品 Harness | 积木库（框架） | 状态图框架 | 多智能体框架 | 闭源成品 Harness | 开源成品 Harness |
| 语言 | Node.js | Python / JS | Python / JS | Python | TypeScript | Python |
| 抽象层次 | 成品（开箱即用） | 低（自己拼） | 中（画状态图） | 中（组团队） | 成品 | 成品 |
| 插件化 | **极强**（一切皆插件，Cordis） | 组件化（chain/tool） | 节点化（node/edge） | 角色化（Agent/Task） | 模块化（每工具一模块） | 模块化（每工具一函数） |
| 配置方式 | **配置驱动**（cordis.yml 叠层） | 代码驱动 | 代码驱动 | 代码驱动 | 代码驱动 | 代码驱动 |
| 多智能体 | 子代理 + 工作流 + Ralph | 需自己搭 | 原生（图里多 agent） | 原生（Crew 团队） | 子代理（Task） | 子代理 |
| 自修改能力 | **有**（动态插件 / 复制 preset） | 无 | 无 | 无 | 无 | 无 |
| 提示词工程 | 装配流水线 + 前缀稳定（见 [[DSH-08-提示词工程拆解]]） | 模板拼装 | 节点里写 prompt | prompt 模板 | 极细系统提示词 | 提示词约束 |
| 适合谁 | 想直接用 + 想深度定制的人 | 想理解原理、自己搭的人 | 工作流有明确状态的人 | 想做角色分工团队的人 | 普通开发者日常用 | 想读源码学的人 |

## 逐个说清楚

### DSH（本系列主角）

**成品里的"异类"**：别的成品 Harness（Claude Code、Kimi Code CLI）内部是"写死的代码"，你要改只能改配置或 fork 源码；DSH 因为建在 Cordis 插件框架上，**能力本身就是"配"出来的**——加工具 = 加一行插件，改性格 = 复制 preset 改副本（[[DSH-07-实操复制Preset改出自己的Agent]]）。它甚至能在运行时临时加插件（[[DSH-06-动态插件运行时扩展]]）。

> 一句话：**DSH = Claude Code 的"完整成品体验" + LangChain 的"可组装性"，两头都占。**

### LangChain

**积木库**。给你 chains（链）、tools（工具）、memory（记忆）、agents（智能体）这些零件，你**自己拼**成一个 Harness。优点：零件全、生态大、概念透明；缺点：**拼出来的东西好不好，全看你的工程能力**。详见 [[LangChain入门]]。

### LangGraph

**状态图框架**。把 Agent 的工作流画成一张"状态图"（节点 + 边），适合有明确步骤、要回退、要分支的场景。比 LangChain 更"结构先行"。详见 [[LangGraph状态图]]。

### CrewAI

**多智能体框架**。核心三要素 Agent + Task + Crew：给每个 Agent 定角色（研究员、写手…），组成一个"团队"协作。适合"一个任务拆给多个角色"的场景。详见 [[CrewAI多智能体]]。

### Claude Code

**闭源成品 Harness**。Anthropic 的终端编码 Agent，产品打磨极深：极细的系统提示词、三层权限防御、compact 上下文压缩（见 [[真实Agent源码解剖]]）。它是 DSH 的"同类产品"，但源码闭源（2026 年泄露事件是事故），你只能用它、改不了它。

### Kimi Code CLI

**开源成品 Harness**。月之暗面主动开源，Python 写的，代码干净，适合**读源码学架构**（见 [[KimiCLI源码拆解]]）。和 DSH 同类，但没有 DSH 的"插件化 + 配置驱动 + 自修改"这层。

### MCP（补充：它不是框架）

MCP 是**协议**（插头标准），不是框架——它规定"外部工具/资源怎么接进来"，LangChain、DSH、Claude Code 都能接 MCP。DSH 自带 `dsh-mcp-client`。别把它和上面几个"框架"放一起比，它们是**正交**的：框架决定"怎么组织 Agent"，MCP 决定"怎么接外部工具"。详见 [[MCP协议实战]]。

## 三个关键洞察

1. **框架给你积木，Harness 给你成品。** 学的时候走"框架 → 手写 → 成品"这条路（见 [[Agent开发总览]] 的"五级台阶"）；用的时候直接上成品（DSH / Claude Code）。

2. **DSH 的差异化在"插件化 + 自修改"。** 别的 Harness 是"写死的程序"，DSH 是"可装配、可改自己"的程序。这是 Cordis 底座带来的结构性优势。

3. **提示词、上下文、权限是 Harness 的真正分水岭。** 模型都差不多，差距全在 Harness 层（呼应 [[Agent-Harness脚手架]]）——DSH 在这三块的做法，本系列 DSH-08（提示词）已经拆过，权限见 DSH-03（沙箱/审批）。

## 选型建议

```text
想搞懂原理、自己搭一遍      → LangChain + 手写 Agent loop（学）
工作流有明确状态、要回退      → LangGraph
想组"角色分工团队"          → CrewAI
想读源码学架构              → Kimi Code CLI（开源）+ 本系列 DSH（本机）
日常干活要个趁手的 Agent    → DSH / Claude Code
既要成品体验、又想深度定制    → DSH（复制 preset / 动态插件）
```

## 相关笔记

- [[DeepSeekHarness框架拆解]]
- [[Agent-Harness脚手架]]
- [[真实Agent源码解剖]]
- [[LangChain入门]]
- [[LangGraph状态图]]
- [[CrewAI多智能体]]
- [[MCP协议实战]]
