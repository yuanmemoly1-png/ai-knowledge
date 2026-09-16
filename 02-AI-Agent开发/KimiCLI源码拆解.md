---
tags: [Agent开发, 源码解剖, Harness]
created: 2026-08-02
---

# Kimi CLI 源码拆解（代码级）

> [!note] 本篇是什么
> 对 [MoonshotAI/kimi-cli](https://github.com/MoonshotAI/kimi-cli) 的**真实代码级**拆解。所有文件路径、行号、代码片段均来自实际克隆的源码（commit `cbc15c0`，2026-08-03，版本 1.49.0），本地副本在 vault 的 `.refsrc/kimi-cli/`（点开头目录，Obsidian 不显示）。
> 概念铺垫见 [[真实Agent源码解剖]]，本篇是它的"打开引擎盖"版本。

## 仓库概况

- **语言**：Python（>=3.12），Apache-2.0，约 11.1k stars（2026-08 抓取）
- **安装**：`uv tool install --python 3.13 kimi-cli`（见 `docs/en/guides/getting-started.md:56`）
- **现状**：官方 README 声明项目正演进为 Kimi Code CLI（kimi-code 仓库），kimi-cli 进入维护期，但代码完整可读
- **关键依赖**（`pyproject.toml`）：`typer`（CLI 框架）、`prompt-toolkit`（交互输入）、`rich`（渲染）、`pydantic`（参数 schema）、`tenacity`（重试）、`fastmcp`（MCP 客户端）、`jinja2`（提示词模板）、`aiofiles`、`loguru`
- **Monorepo 结构**：主程序在 `src/kimi_cli/`，另有两个内生子包——`packages/kosong`（LLM 调用与 toolset 抽象层，被 pip 包 `kosong` 引用）和 `packages/kaos`（异步文件/进程抽象）

## 目录结构（src/kimi_cli/）

```
src/kimi_cli/
├── __main__.py        # 进程入口：装崩溃钩子、解析 --version、转交 typer
├── cli/__init__.py    # typer 命令组，解析参数后调 KimiCLI.create()
├── app.py             # KimiCLI 类：装配 config→LLM→Runtime→Agent→Soul 的总装车间
├── config.py          # TOML 配置（~/.kimi/config.toml），pydantic 模型
├── session.py         # 会话：~/.kimi/sessions/<md5(工作目录)>/<uuid>/ 下的 context.jsonl
├── llm.py             # 创建 LLM/ChatProvider、token 估算、max_completion_tokens 计算
├── agentspec.py       # agent.yaml 的加载与 extend 继承解析
├── agents/default/    # 内置 Agent 定义：agent.yaml + system.md + 3 个子 Agent yaml
├── prompts/           # compact.md（压缩提示词）、init.md
├── soul/              # ★ 核心：Agent 的"灵魂"
│   ├── kimisoul.py    #   主循环 KimiSoul（1963 行，全仓库最值得读的文件）
│   ├── agent.py       #   Runtime 装配、load_agent()、AGENTS.md 发现与合并
│   ├── context.py     #   上下文：JSONL 文件后端 + checkpoint/revert
│   ├── compaction.py  #   上下文压缩（SimpleCompaction）
│   ├── toolset.py     #   工具执行器：去重、重复检测、hook、并发执行
│   └── approval.py    #   审批状态机（yolo/afk/auto_approve_actions）
├── approval_runtime/  # 审批请求的运行时路由（前台/子 Agent 统一走 root UI）
├── tools/             # 内置工具实现（shell/file/web/plan/todo/agent/...）
├── hooks/             # 用户自定义 hook 引擎（PreToolUse、Stop、PreCompact...）
├── wire/              # Soul↔UI 的消息总线（WireMessage 队列 + wire.jsonl 落盘）
├── ui/shell/          # 交互式 TUI（prompt_toolkit 输入 + rich 输出）
├── ui/print/          # 非交互 --print 模式
├── ui/acp/            # ACP 协议服务器（给 Zed 等编辑器用）
├── background/        # 后台任务管理（Bash 后台任务 + 心跳 + 通知）
├── subagents/         # 子 Agent 注册表（LaborMarket）与持久化
└── skill/             # Skill（SKILL.md）发现与加载
```

## 启动到主循环：完整调用链

```
python -m kimi_cli
  └─ __main__.py:12 main()                     # 装 excepthook，归一化代理环境变量
      └─ cli/__init__.py:40  typer.Typer()     # 解析 --model/--yolo/--print/--continue 等
          └─ app.py:122  KimiCLI.create()      # 异步总装：
              ├─ config.py:291  load_config()          # 读 ~/.kimi/config.toml
              ├─ llm.py         create_llm()           # 按 provider 建 ChatProvider
              ├─ soul/agent.py:211  Runtime.create()   # 列目录/读 AGENTS.md/发现 skills
              ├─ soul/agent.py:383  load_agent()       # 解析 agent.yaml→渲染 system.md→装工具
              ├─ soul/context.py:30 Context.restore()  # 从 context.jsonl 回放历史
              └─ soul/kimisoul.py:228 KimiSoul(agent, context)
          └─ app.py:697  run_shell()           # 进入 TUI
              └─ ui/shell/__init__.py:382 Shell.run()  # prompt_toolkit 输入循环
                  └─ soul/__init__.py:179 run_soul()   # 建 Wire，并发跑 soul.run + ui_loop
                      └─ soul/kimisoul.py:659 KimiSoul.run()   # 一次"轮"(turn)
                          └─ kimisoul.py:841  _turn()          # 追加 user 消息
                              └─ kimisoul.py:937  _agent_loop()  # ★ step 循环
                                  └─ kimisoul.py:1111 _step()    # ★ 一次 LLM 调用+工具执行
```

关键设计：**Soul（决策）与 UI（渲染）通过 `Wire` 消息总线解耦**。`run_soul()` 把 `soul.run()` 和 `ui_loop_fn(wire)` 放进两个 asyncio task，soul 侧用 `wire_send()` 发 `StepBegin`/`TextPart`/`ToolResult`/`ApprovalRequest` 等事件，UI 侧订阅消费。所以同一颗灵魂可以套 shell TUI、`--print`、ACP 三种皮。

## 子系统一：Agent 主循环（soul/kimisoul.py）

`_agent_loop()` 就是教科书上 ReAct 循环的工业级实现，源码里甚至直接画了生命周期注释（`kimisoul.py:937-951`）：Step Guard → Step Begin → Context Compaction → Checkpoint → Step Execution → Error Handling → Outcome Resolution。

```python
# kimisoul.py:1000-1010 —— step 循环的骨架
while True:
    step_no += 1
    # ── 2a. Step Guard ──
    if step_no > self._loop_control.max_steps_per_turn:
        raise MaxStepsReached(self._loop_control.max_steps_per_turn)
    self._current_step_no = step_no
    # ── 2b. Step Begin ──
    wire_send(StepBegin(n=step_no))
```

`_step()` 里真正的"调模型"只有一件事——委托给 kosong 库（`kimisoul.py:1209-1216`）：

```python
return await kosong.step(
    request_chat_provider,          # ChatProvider（带重试/追踪包装）
    self._agent.system_prompt,      # system prompt 单独传，不进 history
    self._agent.toolset,            # KimiToolset
    effective_history,              # 归一化后的消息历史
    on_message_part=wire_send,      # 流式分片直接推到 UI
    on_tool_result=wire_send,
)
```

kosong（`packages/kosong/src/kosong/__init__.py:104`）内部做三件事：流式调 LLM → 每解析出一个 tool_call 立刻 `toolset.handle(tool_call)` 起 asyncio task **并发执行** → 返回 `StepResult`，调用方用 `await result.tool_results()` 收齐。

每一步结束后的去向判断（`kimisoul.py:1344-1346`）极其朴素，就是 ReAct 的终止条件：

```python
if result.tool_calls:
    return None                    # 有工具调用 → 继续 while 循环
return StepOutcome(stop_reason="no_tool_calls", ...)  # 没有 → 本轮结束
```

工程化细节都在骨架之外：

- **重试**：`tenacity` 装饰器包着 `kosong.step`，指数退避 + jitter，只对 429/5xx/超时/空响应重试（`kimisoul.py:1224-1230, 1647-1658`）；401 会触发 OAuth 刷新后重进一次（`_run_with_connection_recovery`，1660 行起）
- **steer（插话）**：用户在 Agent 干活时输入的话进 `_steer_queue`，step 之间被 `_consume_pending_steers()` 注入为新 user 消息并强制再来一步（`kimisoul.py:1081-1083`）
- **D-Mail 回到未来**：工具可以让 Agent 回滚到某个 checkpoint 重来（`BackToTheFuture` 异常 + `context.revert_to()`，1099-1106 行）——这是给"未来的自己给过去留言"这种自校正机制留的口子

## 子系统二：工具系统

**工具定义 = pydantic Params + CallableTool2**。以 Shell 为例（`tools/shell/__init__.py`）：

```python
# tools/shell/__init__.py:26-46（节选）
class Params(BaseModel):
    command: str = Field(description="The command to execute.")
    timeout: int = Field(default=60, ge=1, le=MAX_BACKGROUND_TIMEOUT)
    run_in_background: bool = Field(default=False, ...)

class Shell(CallableTool2[Params]):
    name: str = "Shell"
    params: type[Params] = Params
```

JSON schema 由 pydantic 模型自动生成，工具描述（给模型看的 prompt）不在代码里，而是同目录的 `bash.md` 用 `load_desc()` 读入（`__init__.py:65-70`）——**提示词和实现分离**，改描述不用动代码。

**注册方式是声明式的**：`agents/default/agent.yaml` 里用 `"模块:类名"` 字符串列出工具，`load_agent()` 里 `toolset.load_tools(tools, tool_deps)` 反射加载，构造函数需要的依赖（Approval、Runtime、Environment）按类型注解自动注入（`soul/agent.py:434-451`）。

默认 Agent 的完整工具清单（`agents/default/agent.yaml:7-26`）：

| 工具 | 一句话功能 |
|---|---|
| `Agent` | 派生/恢复子 Agent（subagent） |
| `AskUserQuestion` | 主动向用户提问（结构化选项） |
| `SetTodoList` | 维护 TODO 清单 |
| `Shell` | 执行 bash 命令（前台/后台） |
| `TaskList` / `TaskOutput` / `TaskStop` | 后台任务的枚举/快照/停止 |
| `ReadFile` / `ReadMediaFile` | 读文本文件 / 读图片视频 |
| `Glob` / `Grep` | 按模式找文件 / 搜文件内容（ripgrep） |
| `WriteFile` / `StrReplaceFile` | 写文件 / 精确替换编辑 |
| `SearchWeb` / `FetchURL` | 联网搜索 / 抓网页 |
| `ExitPlanMode` / `EnterPlanMode` | 计划模式开关 |

yaml 里还有两个被注释掉的工具：`SendDMail`（上文 D-Mail）、`Think`（思考工具）——说明功能可以靠注释一行来裁剪。

**执行器在 `soul/toolset.py` 的 `KimiToolset.handle()`（343 行起）**，亮点是反"模型犯傻"机制：对 `(工具名, 规范化参数)` 做跨 step 去重跟踪，同一调用连续重复 3 次在结果里追加提醒、5 次升级措辞、8 次勒令"停止一切工具调用"、12 次直接 `force_stop_turn` 终止本轮（`toolset.py:153-172`）。这是在 Harness 层给模型套的行为护栏，防止死循环烧钱。

## 子系统三：系统提示词与上下文组装

**提示词模板**：`agents/default/system.md`（160 行），Jinja2 渲染，变量分隔符自定义为 `${...}`（避免和 markdown 冲突），见 `soul/agent.py:494-519`。注入的内置变量定义在 `BuiltinSystemPromptArgs`（`agent.py:46-65`）：`KIMI_NOW`（当前时间）、`KIMI_WORK_DIR_LS`（工作目录列表）、`KIMI_AGENTS_MD`、`KIMI_SKILLS`、`KIMI_OS`、`KIMI_SHELL` 等。

**AGENTS.md 的发现逻辑**（`agent.py:87-168`）很值得学：从项目根到工作目录逐级找 `.kimi/AGENTS.md` 和 `AGENTS.md`，总量上限 32 KiB，**预算从叶子目录往根分配**——更深的（更具体的）规则永不被截断，截断的是笼统的根级文件。

**messages 怎么拼**：system prompt 不进 history，每次调用单独传给 `kosong.step`；history 就是 `Context` 里追加的 user/assistant/tool 消息。每轮还有两类"动态注入"（`kimisoul.py:1166-1177`）：plan 模式提醒、afk 提醒等由 `DynamicInjectionProvider` 产出，以 `<system-reminder>` 包裹的 user 消息插入。

**上下文持久化**：`Context`（`soul/context.py`）是一个 JSONL 文件，每行一条记录，三种元记录用 `_` 开头的 role：`_system_prompt`、`_usage`（真实 token 数）、`_checkpoint`。每次 append 同步落盘，崩溃不丢。`checkpoint()` 写标记行，`revert_to()` 把文件轮转备份后重放到指定 checkpoint——配合 D-Mail 实现"时光倒流"。

**压缩（compaction）**：触发条件在 `soul/compaction.py:60-76`——`token >= 85% × max_context_size` **或** `token + 50000(预留) >= max_context_size`，两个阈值都在 `config.py` 的 `LoopControl` 里可配。每个 step 开始前检查（`kimisoul.py:1016-1024`）。压缩本身（`SimpleCompaction`，`compaction.py:110-148`）是用同一个 LLM 做一次无工具的总结调用：保留最近 2 条 user/assistant 消息，其余历史拼成一条消息交给 `prompts/compact.md` 提示词压缩，压缩后**清空 context 文件、重写 system prompt、再写入摘要**（`kimisoul.py:1575-1578`）。token 计数平时用"字符数÷4"的启发式估算，下次 LLM 调用返回真实 usage 后校正（`compaction.py:48-57`）。

## 子系统四：权限与安全

**Kimi CLI 没有"危险命令黑名单"**——判断粒度不是命令内容，而是"这个动作要不要问人"。所有敏感操作由工具自己调 `Approval.request()`（`soul/approval.py:200`），比如 Shell 执行前（`tools/shell/__init__.py:92-104`）：

```python
result = await self._approval.request(
    self.name, "run command", f"Run command `{command}`",
    display=[ShellDisplayBlock(language="bash", command=command)],
)
if not result:
    return result.rejection_error()   # 拒绝结果作为 tool 消息回传给模型
```

`Approval.request()` 的三级短路（`approval.py:242-280`）：

1. `is_auto_approve()`：yolo 模式或 afk 模式 → 直接放行
2. `action in auto_approve_actions`：用户之前选过"本次会话都允许" → 放行
3. 否则创建 `ApprovalRequest` 经 `ApprovalRuntime` 路由到 root UI，**异步挂起等用户回答**

用户的三种回答（`approval.py:19`）：`approve`（这次）、`approve_for_session`（这类 action 以后都放行，并顺手把挂起的同类请求全部 resolve，370-378 行）、`reject`（可附带文字反馈，反馈会写进 `ToolRejectedError` 让模型看到并换方案）。

设计要点：**审批是工具的职责，不是框架的**。框架只提供 `request()` 和路由；哪个工具要审批、action 起什么名，工具自己定。子 Agent 的审批也通过 `ApprovalRuntime` 冒泡到 root UI 统一弹出（`app.py:573-581` 的 `_forward_approval_request`）。另外主 Agent 遇到"纯拒绝无反馈"会直接结束本轮，而子 Agent 会收到拒绝信息继续尝试替代方案（`kimisoul.py:1305-1310`）。

## 界面层（TUI）

- **输入**：`prompt_toolkit` 的 `PromptSession`（`ui/shell/prompt.py:21-37`），负责多行输入、补全、历史、快捷键
- **输出**：`rich` 的 `Console`（`ui/shell/console.py:7`），markdown/代码高亮/diff 块渲染
- **架构**：UI 不直接调 LLM，只消费 Wire 消息。`ui/print/` 是非交互模式（`--print`，输出 json/stream-json），`ui/acp/` 是 ACP 协议服务器——三种 UI 复用同一颗 `KimiSoul`，Wire 总线是换皮的关键

## 配置与数据持久化

- **配置文件**：`~/.kimi/config.toml`（TOML，tomlkit 解析，`config.py:278,291`），定义 providers（type/base_url/api_key）、models（max_context_size、capabilities）、loop_control、hooks 等；api_key 用 pydantic `SecretStr` 包裹，OAuth token 不放配置文件（`OAuthRef` 指向 keyring 或独立文件）
- **会话存储**：`~/.kimi/sessions/<md5(工作目录路径)>/<session-uuid>/`（`metadata.py:34-39` 的 `sessions_dir`），目录下：
  - `context.jsonl` — 消息历史 + checkpoint + usage 记录（`session.py:150`）
  - `wire.jsonl` — UI 事件流日志，用于会话回放
  - `state.json` — yolo/afk/plan 模式等持久状态（`SessionState`）
- **全局元数据**：`~/.kimi/kimi.json` 记录所有工作目录及各自 last_session_id，支撑 `kimi --continue`
- **日志**：`~/.kimi/logs/kimi.log`，loguru，按天轮转保留 10 天（`app.py:61-71`）

## 和 Claude Code 的异同

两者骨架几乎一致（对照 [[ClaudeCode源码拆解]] 与 [[真实Agent源码解剖]]）：都是"单循环 ReAct + 工具集 + 审批门 + 上下文压缩"。差异在工程选择：

- **语言与分发**：Kimi 是 Python + uv 安装，源码全开放可直接改；Claude Code 是 TypeScript + npm，闭源（泄露版不算）
- **模型抽象**：Kimi 把 LLM 调用抽成独立库 kosong，provider 可换（kimi/anthropic/openai 兼容协议）；Claude Code 绑死 Anthropic
- **Agent 定义外置**：Kimi 的 `agent.yaml + system.md` 是数据文件，用户可 `extend: default` 继承派生自己的 Agent（`agentspec.py:134-159`），子 Agent 类型也在 yaml 里注册；Claude Code 的 subagent 用 markdown 前置元数据
- **独特机制**：D-Mail/checkpoint 时光回溯、工具调用去重强制停轮（12 次硬顶）、afk 模式（无人值守自动放行）是 Kimi 的特色；Claude Code 的权限规则（allow/deny 列表匹配命令模式）比 Kimi 的"按 action 会话级放行"更细
- **Hook 系统**：两者都有（Kimi 的 PreToolUse/Stop/PreCompact 等在 `hooks/`），明显是互相借鉴的产物

## 新手跟读指南

按这个顺序读，每一步对应一个概念（行号基于 commit `cbc15c0`）：

1. **`src/kimi_cli/__main__.py` → `app.py:122`**（半小时）— 看懂"启动一个 Agent 需要装配哪些零件"：配置、LLM、Runtime、Agent、Context、Soul。对应 [[Agent-Harness脚手架]]
2. **`agents/default/agent.yaml` + `system.md`**（20 分钟）— 原来"一个 Agent"就是一份 yaml + 一份 markdown。对应 [[Prompt与提示词工程]]
3. **`soul/kimisoul.py` 的 `run()`(659) → `_turn()`(841) → `_agent_loop()`(937) → `_step()`(1111)**（1-2 小时，重点）— 这就是 [[ReAct与Agent设计模式]] 的真实形态：while 循环里调模型、执行工具、没有 tool_call 就停
4. **`packages/kosong/src/kosong/__init__.py:104` 的 `step()`**（半小时）— 看 tool_call 如何从流式响应里解析出来、如何并发执行。对应 [[FunctionCalling函数调用]]
5. **`tools/shell/__init__.py` + `soul/toolset.py:343`**（1 小时）— 挑一个工具从头看到尾：schema 定义 → 审批 → 执行 → 结果回传。对应 [[工具调用实战]]
6. **`soul/context.py` + `soul/compaction.py`**（40 分钟）— JSONL 持久化、checkpoint、85% 阈值压缩。对应 [[记忆与上下文工程]] 和 [[上下文窗口]]
7. **`soul/approval.py:200`**（20 分钟）— 三级放行逻辑，理解"权限门"为什么放在工具内部

全程建议配合 `.refsrc/kimi-cli/` 本地副本用编辑器跳转，读不懂的类名直接全局搜。

## 相关笔记

- [[真实Agent源码解剖]] — 双样本对照的概念版，本篇的姊妹篇
- [[Agent核心架构]] — 主循环、工具、记忆的概念框架
- [[工具调用实战]] — Function Calling 的动手版
- [[Agent-Harness脚手架]] — 自己写一个最小 Harness 时对照本篇抄结构
