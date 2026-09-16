---
tags: [Agent开发, 源码解剖, Harness]
created: 2026-08-02
---

# Claude Code 源码拆解（2026.3 泄露事件·架构级分析）

> [!note] 这篇是什么
> 对 [[真实Agent源码解剖]] 里"样本二"的展开：基于公开的二手分析文章，对 Claude Code 泄露源码做逐层架构拆解。每个机制按「设计意图 → 实现方式 → 我们能学到什么」三段讲解。读之前建议先过一遍 [[Agent核心架构]] 和 [[Agent-Harness脚手架]]，你会发现所有机制都挂在同一个 Agent Loop 上。

## 事件回顾（3 分钟版）

2026-03-31，Anthropic 发布 Claude Code v2.1.88 npm 包时误打入 57MB 的 `cli.js.map`（source map），`sourcesContent` 字段直接携带完整源码——4756 个源文件、51.2 万行 TypeScript 就此公开，数小时内传遍 GitHub。泄露的真正价值不在代码本身（客户端逻辑本就可反编译），而在于完整暴露了 Anthropic 的 **Harness 工程**：安全控制架构、提示词工程策略、权限边界设计。本文只读公开分析，不碰泄露代码本身。

> [!warning] 法律提示
> 泄露代码有版权，Anthropic 已通过 DMCA 下架了 8000+ 个镜像仓库。本笔记只讲**架构思想**，不引用泄露代码原文。想读正版源码，去读 [[KimiCLI源码拆解]] 对应的开源仓库（MoonshotAI/kimi-cli，MIT 协议主动开源）。

## 整体架构：六层

```
┌────────────────────────────────────────────────────────────┐
│ ① UI 层          React + Ink 终端渲染（游戏引擎级优化）       │
├────────────────────────────────────────────────────────────┤
│ ② 主循环          query.ts：AsyncGenerator ReAct 循环        │
│                   流式输出 / steering 实时干预 / 恢复机制      │
├────────────────────────────────────────────────────────────┤
│ ③ 工具系统        Tool.ts 统一接口 + 40+ 内置工具注册表        │
├────────────────────────────────────────────────────────────┤
│ ④ 权限系统        提示词层 → 权限规则层 → 工具级检查（多层防御）│
├────────────────────────────────────────────────────────────┤
│ ⑤ 上下文管理      compact.ts：微压缩 → 摘要压缩 → 全量压缩     │
├────────────────────────────────────────────────────────────┤
│ ⑥ 提示词工程      prompts.ts：运行时动态拼装系统提示词         │
└────────────────────────────────────────────────────────────┘
        横向贯穿：状态管理(AppState) / API 客户端(重试+降级) / 可观测性
```

核心循环本身极简：`messages[] → LLM → stop_reason=="tool_use"? → 执行工具、追加结果 → 回到循环`。社区教程仓库 shareAI-lab 的总结一针见血：**"循环属于 Agent，机制属于 Harness"**——51 万行代码几乎全部在循环外面。

## ① UI 层：React + Ink 的终端渲染

**设计意图**：终端里也要做富交互（流式打字、工具调用卡片、权限弹窗），且逐 token 流式渲染不能卡。

**实现方式**：用 React + Ink 把终端当画布，组件化渲染；工具的定义里直接带 `renderToolUse` 渲染组件，UI 与逻辑分离。性能上借了游戏引擎的手法（`ink/screen.ts`、`ink/optimizer.ts`）：Int32Array 字符池、位掩码编码样式元数据、合并光标移动的补丁优化器、自驱逐的行宽缓存——泄露代码注释自称流式期间 `stringWidth` 调用减少约 50 倍。底层跑在 Bun 而非 Node 上。

**我们能学到什么**：CLI 工具的交互上限可以很高，渲染性能是真实瓶颈；把「工具逻辑」和「工具在 UI 上的呈现」分开声明，同一套工具就能服务终端、IDE、Web 多种前端。

## ② 主循环（query.ts）：REPL、流式与 steering

**设计意图**：循环要同时满足三件事——流式输出实时可见、用户能中途插手、各种异常（token 超限、上下文过长）能自动恢复。

**实现方式**：`query()` 是一个 **AsyncGenerator**——不是返回最终结果，而是逐个 yield 事件（文本增量、工具调用、工具结果），REPL 组件订阅事件流实时渲染。循环内维护一个 `State` 对象：消息历史、自动压缩追踪、token 超限恢复计数、轮次计数等。恢复机制是标配：`max_output_tokens` 截断自动重试调整参数（恢复上限 3 次）、`prompt_too_long` 触发响应式压缩后重试。

**Steering（实时干预）机制**：用户/外部消息不会粗暴打断正在跑的 Agent，而是**排队**，在下一个安全的"工具轮次边界"再注入对话。发给运行中子代理的消息同样进 `pendingMessages` 队列，于该子代理的下一个工具轮次送达——避免在工具调用进行到一半时打断，同时保住异步纠偏能力。

**错误重试与降级**（`src/services/api/withRetry.ts`，与主循环配套）：重试按错误类型分类处理，不一刀切——429 限流等 `retry-after` 后重试；529 过载指数退避；401 刷新 token 重建客户端；`prompt_too_long` 触发压缩后重试；`max_output_tokens` 调参重试。默认最多重试 10 次；无人值守的后台任务用"持久重试"（退避上限 5 分钟、6 小时重置、30 秒心跳）。主模型不可用时还能抛 `FallbackTriggeredError` 自动切备用模型。

**我们能学到什么**：AsyncGenerator 是连接流式 API 与 UI 的天然桥梁（自带背压与取消）；"干预排队到轮次边界"比"立即中断"安全得多——中断会打碎 Agent 的规划状态。对应 [[ReAct与Agent设计模式]] 的工程化落地。

## ③ 工具系统（Tool.ts）：统一接口 + 注册表

**设计意图**：工具要能独立开发、测试、替换，Agent 主循环不该知道任何工具的实现细节。

**实现方式**：所有工具实现同一个 `Tool` 类型（`src/Tool.ts`），关键成员：

- `name` + `aliases`（改名后向后兼容）、`searchHint`
- `inputSchema`：Zod schema，类型推断 + 运行时校验一次搞定；MCP 工具可直接给 JSON Schema
- `call(args, context, canUseTool, ...)`：执行函数，**权限检查函数作为参数注入**
- `description(input, options)`：**动态描述**——根据入参和上下文生成给模型看的工具描述
- `renderToolUse`：Ink 渲染组件

`src/tools.ts` 把所有工具组装成注册表，`findToolByName` 按名称/别名查找；部分工具由 feature flag 条件加载（如 `SleepTool` 只在 `PROACTIVE`/`KAIROS` flag 下存在），同一代码库编译出不同版本。执行调度上有一条重要规则：**只读工具（Read/Glob/Grep）可并发，写入工具（Write/Edit/Bash）必须串行**——后者可能依赖前一个调用的副作用。

工具分层的取舍也值得注意：既有低层工具（Bash/Read/Write），也有中层（Edit/Grep/Glob）和高层（Task/WebFetch）。既然能 bash 为什么还要 Grep？因为 grep/glob 调用频率极高，做成专用工具更稳定、更省 token；Bash 留给包安装、跑测试、git 这类真 shell 操作。

**内置工具清单**（据公开分析整理，约 40+；完整精确清单公开分析未覆盖）：

| 分类 | 工具 |
| --- | --- |
| 文件操作 | FileRead / FileEdit / FileWrite / Glob / Grep / NotebookEdit |
| 执行 | Bash / PowerShell / REPL |
| 网络 | WebFetch / WebSearch / WebBrowser🔒 / ToolSearch |
| 智能体与任务 | Agent(Task) / SendMessage / TaskCreate / TaskGet / TaskList / TaskUpdate / TaskStop / TaskOutput / TeamCreate / TeamDelete |
| 规划 | EnterPlanMode / ExitPlanMode / EnterWorktree / ExitWorktree |
| 系统与其他 | AskUserQuestion / TodoWrite / Skill / Config / CronCreate🔒 / CronDelete🔒 / CronList🔒 / MCP 系列（ListMcpResources / ReadMcpResource / McpAuth） |

（🔒 = 内部门控或实验性；名称在不同版本分析中略有出入，如 AgentTool 即用户可见的 Task 工具）

**我们能学到什么**：三条直接可抄——Zod 做 schema 一劳永逸；`description()` 动态生成让工具描述随上下文收紧；权限函数注入而非全局判断，工具自己无需关心权限体系。对应 [[工具调用实战]] 与 [[FunctionCalling函数调用]]。

## ④ 权限系统：多层防御怎么分工

**设计意图**：AI 的自主权是**赚出来的，不是默认给的**。单层防御（比如只靠提示词）一定会被绕过，所以要层层独立。

**实现方式**（四层，每层失效都有下一层兜底）：

1. **提示词层**：`cyberRiskInstruction.ts` 定义安全指令注入所有模式的系统提示词（授权安全测试可做，破坏性技术/DoS/恶意规避拒绝）。安全研究员验证过：把这段指令清空，其余各层仍然生效——提示词只是最外层。
2. **权限规则层**（`src/utils/permissions/`）：规则按来源分级（用户/项目/企业策略），匹配 `alwaysAllow / alwaysDeny / alwaysAsk`；权限级别枚举为 `always_allow / allow_once / deny / ask`（ask 是默认）。
3. **自动分类器**（`yoloClassifier.ts`，约 1500 行）：每次工具调用前两阶段判断——阶段 1 用 max_tokens=64 快速问"放行/拦截"；仅在要拦截时进入阶段 2 的思维链推理减少误判。**关键细节：分类器看不到助手的文本**——否则 AI 可以给自己的行为写"无罪证明"影响裁判。另有拒绝熔断：连续 3 次或累计 20 次拒绝，自动回退人工审批。
4. **工具级检查**：`bashSecurity.ts` 对每条 bash 命令跑 23 项编号检查（18 个被禁的 Zsh 内置、`=curl` 等号扩展绕过、Unicode 零宽字符注入、IFS null 字节注入等）；PowerShell 走 AST 安全分析；文件操作有路径沙箱。

权限模式上，后台 Agent 无法弹窗，用 `shouldAvoidPermissionPrompts` 标记改为更保守策略。

**我们能学到什么**：分类器输入必须排除被监管者自己的输出，这是"裁判独立性"的工程表达；两阶段分类把贵计算后置（99% 调用 64 token 放行），安全与成本可兼得；约束要写进代码计数器（3 次/20 次熔断），不要写成对模型的期望。这正是 [[ClaudeCode与终端Agent]] 里权限弹窗背后的实现。

## ⑤ 上下文管理（compact.ts）：压缩的艺术

**设计意图**：上下文必然耗尽，且 Anthropic 发现模型有 "context anxiety"——接近上限时行为退化（走捷径、提前收尾、糊弄用户）。要在耗尽前主动腾空间。

**实现方式**：多层递进，从便宜到贵——

> [!info] 2026-08 补充：更完整的五层流水线视图
> 后续社区分析（结合官方上下文工程文档）把压缩策略细化为**五层渐进式流水线**——优先低成本、无损、可恢复的清理，LLM 有损摘要只作最后兜底；另有**输出预留空间**机制（默认预留 32K、最高 64K token 给输出），这就是为什么上下文从不用到 100% 才触发压缩。Anthropic 官方还给了现象一个正式名字：**Context Rot（上下文衰减）**——"不是装不下，而是装太多后模型会忽略远端细节"（上文 context anxiety 的官方对应术语）。

0. **SnipCompact（即时轻量裁剪）**：每轮请求前的纯文本预处理，零 API 调用——删空消息/重复片段、截断超长日志、合并连续相近的助手消息
1. **微压缩（Microcompact）**：本地删除已被引用的旧工具输出（更细的行为：旧工具结果**写入本地磁盘缓存**，上下文只留占位标记，需要时可重新读取——无损而非删除），零 API 调用；闲置超 60 分钟也会触发
2. **自动摘要压缩（Autocompact）**：接近上限时调 LLM 生成摘要替换历史。图片/文档先剥离为 `[image]`/`[document]` 标记（`stripImagesFromMessages`）。**断路器**：连续失败 3 次本会话停用——源码注释记录过没断路器时全局每天浪费约 25 万次 API 调用
3. **全量压缩（/compact）**：手动触发，整段对话压成摘要重新注入

压缩后的上下文结构，用一句话讲透："**模型每轮读的是'整个上下文'，但'整个上下文' ≠ '全部历史'——它是『MEMORY.md/CLAUDE.md + 环境状态 + 旧对话摘要 + 最近几轮全文』的组合**"。旧的压成摘要，新的原样保留。

恢复预算也精细：总预算 50K token、单文件/单技能各 5K、技能总预算 25K——防止某一维度挤占空间。另有 `HISTORY_SNIP`、`CONTEXT_COLLAPSE` 等更激进的层级（公开分析仅提及名称，细节未覆盖）。压缩是有损的；Context Rot 严重时压缩也不够，需要完全重置上下文。

**缓存经济学是隐藏的架构驱动力**：prompt 缓存命中与否直接是钱的问题。源码里有专门的 `promptCacheBreakDetection.ts` 跟踪 14 个缓存破坏向量，还有"粘性闩锁"防止模式切换破坏缓存前缀；一个函数被直接标注为 `DANGEROUS_uncachedSystemPromptSection()`。设计系统提示词拼装顺序时，稳定不变的内容必须放前面——这是上下文管理和提示词工程共同的约束。

**我们能学到什么**：压缩要分层（先剥离大对象→裁剪旧输出→LLM 摘要），别一步到位；任何自动调 LLM 的维护机制都要装断路器；压缩后按维度配额重新注入关键文件，防止"压完就失忆"。对应 [[记忆与上下文工程]] 与 [[上下文窗口]]。

## ⑥ 系统提示词工程（prompts.ts）

**设计意图**：结构约束管不住的，是模型自身的行为偏差——提示词是 Anthropic 踩坑史的工程编码。

**实现方式**：提示词**不是静态字符串，是运行时动态拼装**：身份定义 → 环境信息（工作目录/平台/git 状态，用 `<env>` XML 标签包裹）→ 模型信息（名称、知识截止）→ 工具使用规则 → 代码风格 → MCP 指令 → CLAUDE.md 用户自定义。还有模型感知（按当前模型调整措辞）和 Undercover 模式（外部仓库中隐藏内部代号，只能强制开、不能强制关）。

具体行为约束条款（措辞是"不要"，不是"请尽量"）：

- **不做过多的*：不添加功能、不重构、不做超出要求范围的"改进"；三行相似的代码也好过过早的抽象
- **默认不写注释**：只在"为什么这么做"不明显时才加；注释里不提当前任务——代码演进后注释会腐烂
- **如实汇报**：测试失败就说失败，绝不在有失败时声称"全部通过"；也不要把完成的工作谦虚降级为"部分完成"——目标是准确，不是防御
- 工具偏好：优先专用工具而非 Bash 等价物（Read 优于 cat、Edit 优于 sed、Glob 优于 find）；说"不知道"之前先用 Grep/Glob 搜
- 协调者规则（多 Agent 模式）："不要给敷衍的工作盖章放行""必须亲自理解 findings 再指派后续，永远不要把'理解'外包给另一个 worker"

**我们能学到什么**：每条规则都对应一个高频真实失败模式，且双向约束（谎报和过度谦虚都禁）；有效的提示词条款 = 具体失败模式 + 硬性措辞，不是抽象原则。对应 [[Prompt与提示词工程]]。

## ⑦ 反蒸馏机制

**设计意图**：竞争对手可以录制 Claude Code 的 API 流量（输入输出轨迹）去蒸馏训练自己的模型——行为轨迹是核心资产，要投毒保护。

**实现方式**（两道机关，均在服务端生效、客户端只发开关）：

1. **假工具注入**：满足四个条件（编译时 flag `ANTI_DISTILLATION_CC` + CLI 入口 + 第一方 API provider + GrowthBook 开关 `tengu_anti_distill_fake_tool_injection`）时，请求携带 `anti_distillation: ['fake_tools']`，服务端在系统提示中静默注入**虚假工具定义**——录流量训练的人会把假工具学进去
2. **连接符文本摘要**：工具调用之间的助手推理文本在服务端被摘要化并带密码学签名返回，后续轮次可从签名恢复原文；录流量者只能拿到摘要，拿不到完整推理链（仅限 Anthropic 内部用户）

**我们能学到什么**：诚实地说，公开分析普遍评价这些机制"防君子不防小人"（绕过办法在阅读源码一小时内可找到，真正的威慑是法律）。对我们做 Agent 的启示是反向的：认识到**轨迹数据是训练资产**，同时别把客户端可见的机制当安全边界。

## ⑧ 子代理（Task 工具）：派生与上下文隔离

**设计意图**：把调研类脏活累活甩出主上下文，主代理保持干净；并行只读工作降墙钟时间。

**实现方式**：`AgentTool` 是启动器——组装子代理的独立工具池、决定是否后台运行、可选 worktree 目录隔离；`runAgent()` 是运行时——子代理跑**同一个 query() 循环**，但有自己的 prompt、工具、abort controller 和 **sidechain transcript**（独立对话轨迹，通过 UUID 链保持与父级的关联可查）。完成后由 `LocalAgentTask` 把结果封装成结构化 `<task-notification>` XML（任务 ID、状态、摘要、结果、用量、worktree 信息）投递回主会话——这是 fan-in 的关键。子代理停了还能**从 transcript 恢复**续跑。更上层还有实验性的 swarm 层（TeamCreate/SendMessage/命名 teammate + 邮箱通信）。

成本杠杆：派生子代理时父级上下文被 prompt 缓存复用，cache read 约为 cache write 价格的 1/10——5 个并行子代理的总成本约是顺序执行的 1.4 倍而非 5 倍（理论估算）。

> [!info] 2026-08 补充：内置 Subagent 生态与三层并行架构
> **三种内置子代理**（各有分工与权衡）：
>
> | 类型 | 模型 | 工具权限 | 用途 |
> | --- | --- | --- | --- |
> | **Explore** | Haiku（快/便宜） | 只读 | 文件发现、代码搜索、库探索 |
> | **Plan** | 继承主模型 | 只读 | 方案调研、架构规划（提示词引导"做设计"而非"做搜索"，要求输出含关键文件清单的结构化计划） |
> | **General-purpose** | 继承主模型 | 全部工具 | 复杂研究、多步操作、改代码 |
>
> **精妙的权衡**：Explore 和 Plan 启动时**跳过 CLAUDE.md 和 Git 状态加载**——它们只做信息收集不需要项目规范，干净的上下文更快更省；只有 General-purpose 加载完整规范（要改代码必须懂规矩）。
>
> **对抗性 Verification Agent**（最有意思的内置）：系统提示词直接列出模型的两种偷懒模式（"验证回避"：读代码、口述会测什么、写个 PASS 就跳过）并要求**"你的工作不是确认实现能跑，而是尝试搞坏它"**——不许改项目文件，但允许在 /tmp 写临时测试脚本（竞态测试、Playwright），用完自清理。
>
> **三层并行架构**：主对话 → Sub-agents（单向分发：主派活/子回报，子间不能直接通信）→ Agent Teams（实验性：双向通信+共享任务列表）。**安全约束：子代理不能再生子代理**（Anthropic 刻意设计，防失控）。一句话选型：任务独立可并行→Sub-agents；需要协作推理→Teams；强依赖任务堆 agent 数量只会更慢（加速来自任务图的并行分支，不是 agent 数量）。

**协调策略写在提示词里，不是调度器里**：多 Agent 协调模式（`coordinatorMode.ts`）没有拍卖、投票、DAG 执行器之类的"算法"，就是一个中心化协调者提示词——明确定义 调研 → 综合 → 实现 → 验证 四个阶段，规定"只读工作大胆并行、冲突的写操作必须串行"。其中最有价值的一条启发式是**继续 vs 新开**的仲裁：既有上下文有帮助就继续派给同一个 worker；广泛调研的上下文会污染聚焦的实现任务、或验证需要独立性时，就开全新 worker。运行时只负责派发、排队、持久化、恢复，决策全部交给模型。

**我们能学到什么**：子代理 = 全新 messages[] + 同一循环 + 结果以结构化消息回注，没有魔法；"继续用旧 worker 还是开新 worker"是值得写进协调规则的决策（需要既有上下文就继续，需要独立验证就开新的）；协调逻辑大量写在提示词里，运行时只负责派发、排队、持久化。

## 横向机制：状态、Provider 抽象与可观测性

六层之外还有三根贯穿全局的"承重柱"（公开分析中有明确记载，但非本文重点，简述）：

- **状态管理**（`src/state/AppState.tsx`）：Zustand 风格 store + React Context 双层——store 管状态逻辑，Context 管组件分发；`setAppState` 函数式不可变更新。消息历史、工具列表、权限上下文、MCP 连接、文件历史（用于 undo）都在里面
- **多 Provider 抽象**（`src/utils/model/providers.ts`）：通过环境变量在 Anthropic 直连 / Bedrock / Vertex / Foundry 间零代码切换；模型选择有优先级链（`/model` 命令 > `--model` 参数 > 环境变量 > settings.json > 默认）
- **可观测性**：token 计数有精确值（API 响应）和估算值（本地算）两套；每个模型内置定价表实时算成本；分级调试日志写入 `~/.claude/debug/`；`dumpPrompts` 可把完整 API 请求落盘调试

另有一个彩蛋级发现供谈资：原生客户端证明机制——API 请求里埋 `cch=00000` 占位符，由 Bun 原生 HTTP 栈（Zig 层）在请求发出前替换为哈希，服务端据此验证请求来自真正的官方二进制。等长占位符避免改变 Content-Length。这本质是 HTTP 传输层的 DRM，也是 Anthropic 与第三方客户端法律纠纷的技术底牌。

## 附：泄露暴露的未发布功能与彩蛋

架构主线之外，公开分析还扒出几条产品路线图级别的信息，列此备查（细节多为只言片语，公开分析覆盖有限）：

- **KAIROS**：feature-flag 门控的未发布自主 Agent 模式，疑似包含 `/dream` 技能（"夜间记忆蒸馏"）、每日追加日志、GitHub webhook 订阅、后台守护进程、每 5 分钟 cron 刷新——一个常驻运行的 Agent 雏形
- **AutoDream / DreamTask**：长期记忆修剪后台任务，距上次整理超 24 小时且有 ≥5 个新会话时触发，走 Orient → Gather → Consolidate → Prune 四阶段，记忆文件硬性截断在 200 行 / 25KB 以内——不让 AI 自己决定保留什么，因为"全留"正是膨胀的根源（有真实 p97 数据：无修剪时记忆文件从 200 行膨胀到 197KB）
- **挫折感检测**：`userPromptKeywords.ts` 用一个正则匹配用户的爆粗/抱怨——用正则做情感分析，比调一次模型便宜几个数量级
- **愚人节彩蛋**：`buddy/companion.ts` 实现了一个拓麻歌子式电子宠物（18 个物种、稀有度、1% 闪光大机率），物种名用 `String.fromCharCode()` 编码以躲避构建系统的 grep 检查

## 我们能抄的设计（7 条）

1. **循环极简，机制外置**：一个 `while` 循环 + `stop_reason` 判断就是 Agent；工具、权限、压缩全部做成循环外面的可插拔机制。先写 50 行的 loop，再逐个挂机制
2. **统一工具接口**：name + Zod schema + call + 动态 description + 渲染分离；权限检查函数注入进去。新工具 = 新模块，主循环零改动
3. **权限多层防御**：提示词约束 → 规则表（allow/deny/ask）→ 工具级命令检查；把关者的输入里剔除 Agent 自己的输出；连续拒绝 N 次熔断回人工
4. **上下文分层压缩**：先本地删旧工具输出（免费），再 LLM 摘要（付费），手动兜底；所有自动维护循环装失败断路器
5. **提示词写失败模式不写原则**：每条"不要 X"背后对应一个真实事故；双向约束（谎报↔过度谦虚）；环境信息用 XML 标签包裹注入
6. **子代理隔离上下文**：调研/搜索类工作派生子代理，只把结论带回主对话；利用 prompt 缓存让并行子代理分摊父级上下文成本
7. **先列失控点再造机制**：Anthropic 的顺序是"AI 会在哪里失控（自主权越界/上下文焦虑/记忆膨胀/行为偏差）→ 每个点配一个针对性机制"，每个机制都对应真实失控点，没有冗余防御——这才是"薄"的含义

## 资料来源

> [!info] 2026-08-22 增补来源（抖音@懂王ai 视频主题引出）
> - [Claude Code LLM Context Management（GitHub gaoyu666）](https://github.com/gaoyu666/claude-code/blob/master/ContextManagement.md) — 输入四分层、渐进压缩流水线、缓存优化、compact 后恢复
> - [Agent 架构与五层上下文管理机制（CSDN）](https://blog.csdn.net/su2231595742/article/details/162908841) — SnipCompact、输出预留空间、Context Rot
> - [Subagent：上下文隔离的极简子代理框架（CSDN）](https://blog.csdn.net/2401_87662859/article/details/161256712) — 三种内置类型、全新上下文三大硬约束
> - [Claude Code 多 Agent 系统实现原理（GitHub HFurther）](https://github.com/HFurther/claude-code-stable/blob/main/docs/agent/02-implementation.md) — 5 类 Agent、Verification Agent 对抗性提示词
> - [深入理解 Claude Code: CLAUDE.md/Hooks/Skills/Subagents（掘金）](https://juejin.cn/post/7655263874610429993) — 跳过 CLAUDE.md 的加载权衡
> - [万字 Claude Code 深度实践（博客园）](https://www.cnblogs.com/youring2/p/20065433) — Agentic Loop 三步（收集→执行→验证）
> - [Claude 对话机制深度解析（InfoQ）](https://xie.infoq.cn/article/0a06e4efbfa1e15f56c8392a0) — "摘要+近期全文"的通俗模型

- [从泄露源码总结的 10 个 AI Agent 设计模式（yinlei.org）](https://yinlei.org/x-plane10/claude-code10ai-agent.html) — Tool.ts 接口、query.ts 循环、compact、重试、状态管理
- [shareAI-lab 社区逆向分析/教程仓库](https://github.com/shareAI-lab/analysis_claude_code) — "循环属于 Agent，机制属于 Harness"；20 课 harness 工程教程
- [安全视角分析：多层防御与提示词层安全边界（Ms08067）](https://www.gm7.org/archives/65296) — 四层安全模型、cyberRiskInstruction、权限枚举
- [Agent 编排系统拆解（heunify.com）](https://heunify.com/content/system/agent-orchestration-system-design-claude-code-breakdown) — steering 队列、task-notification、sidechain transcript、swarm 层
- [泄露源码隐藏细节（feinterview.poetries.top）](https://feinterview.poetries.top/ai-monitor/news/the-claude-code-source-leak-fake-tools-frustration-regexes-undercover-mode) — 反蒸馏四条件、Ink 渲染优化、bash 23 项检查、autoCompact 断路器
- [从源码看 Harness 理念如何落地（掘金）](https://juejin.cn/post/7623616071808008238) — 分类器两阶段、拒绝熔断、压缩三层、提示词三条款、"先列失控点"
- [Claude Code 全面解析（openclaudecode.site）](https://openclaudecode.site/) — 内置工具清单分类

> [!tip] 延伸
> 想动手复刻这些机制，从 [[Agent-Harness脚手架]] 开始；想评估自己做的 Agent，看 [[Agent评估与调试]]；面试被问"Claude Code 架构"，[[AI面试八股文]] 有对应条目。返回 [[Agent开发总览]] 或 [[主页]]。
