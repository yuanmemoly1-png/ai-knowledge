---
tags: [Agent开发, 源码解剖, Harness, DeepSeekHarness, 提示词工程]
created: 2026-08-06
---

# DSH-08 · 提示词工程拆解

> [!note] 一句话结论
> DSH 的系统提示词**不是一段写死的文字，而是一台"装配流水线"**：每个插件把自己负责的那块"事实"（我是谁 / 我能用什么工具 / 现在什么状态）作为一段文字投进流水线，最后按固定顺序拼成完整提示词，**每调一次模型就现拼一次**。

> [!tip] 这篇在讲什么
> 前面的 DSH-01~07 讲的是"插件怎么搭成 Agent"；这篇钻进最核心的地方：**这些插件是怎么"说话"给模型听的**。读完你会发现，DSH 写提示词的思路，就是你在 [[Prompt与提示词工程]] 里学的那套东西的"工程化量产版"。

## 模型到底"看到"了什么

一次请求里，模型看到的不是"一大坨文字"，而是四类东西，各自来源不同：

| 模型看到的东西 | 谁贡献的 | 形态 |
| --- | --- | --- |
| 系统提示词（身份 + 人设 + 指引） | `dsh-system-prompt` 拼装 | system 角色 |
| 运行时上下文快照 | 沙箱策略 / 审批策略 / 时间等插件 | 单独一段文字 |
| 工具说明书（schema） | 每个工具插件 | 单独的 wire 字段 |
| 工作区指令（AGENTS.md） | `dsh-agent-instructions` | user 角色的 `<system-reminder>` 消息 |

先记住这个分法，下面一层层拆。

## 三层结构：身份 → 人设 → 指引

系统提示词本体，是**很多个"片段(section)"按 `order` 数字从小到大拼起来**的。DSH 给不同用途划了"顺序带"：

| 顺序带 | 放什么 | 真实文本（节选） |
| --- | --- | --- |
| `-100` | 身份开场（harness identity） | `You are an AI agent powered by DeepSeek Harness.` |
| `0` | 人设（persona） | `You are a coding agent powered by the {{model}} model. Your working directory is {{cwd}}.` |
| `100–199` | 工具指引（tool guidance） | 各工具插件贡献的"用法说明" |

> [!question] 常见疑问：为什么有两层身份？
> 第一行（`-100`）和"人设"（`0`）都在报身份，但报的是**两个不同的问题**：
> - **第一行 = 平台身份**（"你是谁家的"）：归属系统插件，**永不改变**，所有 preset/会话都一样——像员工胸牌上的公司名。
> - **第二行 = 角色身份**（"你是干什么的"）：归属 preset（`dsh-persona`），**换 preset 就换这行**——像胸牌上的职位。
>
> 拆开的原因：① 平台身份不该被预设改，角色身份必须能换（归属分离）；② 正好对应"两个平面"（HOST 共享 vs PRESET 私有，见 [[DSH-03-两个平面Host与Preset]]）；③ 两行都是固定内容，放最前保持前缀稳定。特殊情况下人设可设 `complete: true` 取代整个系统提示词（含第一行）。

> [!example] 直观例子：宠物医生助手（两层是两个独立旋钮）
> ```text
> 【第 1 层 · 平台身份】→ You are an AI assistant powered by 汪汪科技.
> 【第 2 层 · 角色身份】→ You are a 宠物医生助手. Your working directory is {{cwd}}.
> 【行为准则】→ 回答口语化 / 不确定先建议线下医院 / 只聊宠物健康
> 【输出与边界】→ 先结论后解释 ≤5 行 / 用药必须提示"以兽医当面诊断为准"
> ```
> - 只换第 1 层（汪汪科技 → 咪咪科技）：**还是宠物医生助手**，只是品牌变了。
> - 只换第 2 层（宠物医生 → 数学老师）：**还是汪汪科技出品**，岗位换了。
>
> 两行 = 胸牌上的"公司名"和"职位"，变化来源不同所以拆开：公司名锁死（物业管），职位开放（住户换）。

> [!example] 这三层其实是三句话
> 1. **身份层**（-100）：告诉模型"你是谁家 AI"——固定，几乎不变。
> 2. **人设层**（0）：告诉模型"你是干什么的、在哪个目录干活"——**preset 可以覆盖**（见 [[DSH-04-配置文件与Preset结构]] 里 cordis 和 standard 的不同人设）。
> 3. **指引层**（100+）：告诉模型"你的手（工具）怎么用"——由每个工具插件各贡献一段。

> [!note] 内容是谁写的：谁拥有这个事实，谁写这段
> DSH 里没有"系统提示词作者"这个角色——内容按"事实归属"分配，每块交给最懂它的人写，系统只负责拼：
>
> | 内容块 | 谁写的 | 写在哪 |
> | --- | --- | --- |
> | 平台身份 | 系统插件 | 代码里写死 |
> | 人设 / plan mode 段 | preset 作者（你） | `agent.cordis.yml` 配置 |
> | 工具指引 | 每个工具插件自己 | 工具 description |
> | 环境 / 时间 | 时间、环境插件 | 运行时动态生成 |
> | 项目规则 | 用户 | 磁盘上的 `AGENTS.md` |
>
> 所以你在 DSH 里**找不到"一份完整的系统提示词文件"**——它是拼出来的，能找到的是一堆"片段来源"。plan mode 段就是典型：每句 = preset 作者的一个担心（怕它偷跑 → `Do not edit/write/commit`；怕口头同意算数 → `approves nothing`），和 [[提示词工程-写作方法论]] 的"跑起来补条款"是同一个动作，只是提前列完了。

## 拼装的四条铁律（工程精髓）

`dsh-system-prompt` 的代码里，写死了四条规矩：

1. **按 order 升序拼接**：谁先谁后，由数字决定，不是注册顺序（注册顺序只是插件加载的偶然产物）。
2. **变量严格插值**：文本里的 `{{model}}`、`{{cwd}}` 在渲染时替换成真实值。
3. **Fail loud（宁报错，不塞坏提示词）**：未知变量、写错的 `{{}}`、重名片段、toolOrder 配错——**全部直接抛错**，而不是悄悄塞一段坏提示词给模型。
4. **complete 片段可"夺权"**：某个片段标记 `complete: true`，它就取代整个系统提示词，别的片段全部让路。

> [!important] 为什么 fail loud 这么重要
> 提示词是你跟模型之间唯一的"合同"。塞一段格式坏的提示词，模型可能悄悄理解错、还不好排查。DSH 的选择是：**发现拼装结果有问题，宁可这一轮直接失败，也不把病句喂给模型**。这对写提示词的你是个好启发：变量、格式要"校验先行"。

## 动态上下文：一段"活"的快照

系统提示词里有一部分不是写死的，而是**每次拼装时现场计算**。你如果看过我的系统提示词，一定见过这句：

```text
Current runtime context. This snapshot supersedes earlier runtime-context snapshots.

Current DSH file policy: workspace-write
Approval policy: ask
...
```

这句开场白是源码里**写死的**（函数 `joinContextSections`），后面的内容才是各插件现场填的：

- **沙箱策略**：我这轮能碰哪些文件（`Current DSH file policy: workspace-write`）。
- **审批策略**：危险操作要不要你点头（`Approval policy: ask`）。
- **时间**：现在几点、你浏览器在哪个时区。

> [!tip] 为什么叫"快照(snapshot)"
> 因为它随状态变：你这轮把文件策略从只读改成可写，下一轮的这段文字就会跟着变。它是"当前这一刻的事实"，不是固定台词。

## AGENTS.md：把"项目规矩"夹进对话

DSH 还支持一套**项目级规则注入**机制（`dsh-agent-instructions`），读的是 `AGENTS.md` / `CLAUDE.md`：

- **从哪读**：`$DSH_HOME/AGENTS.md`（全局）+ 从项目根到当前目录每一层里的 `AGENTS.md`（+ `.local` 覆盖版）。
- **怎么注入**：包成 user 角色的 `<system-reminder>` 消息，插进对话历史。

```markdown
<system-reminder>
The following workspace instructions may be relevant to your work. Use them as guidance when applicable. More specific instructions take precedence over broader ones. They do not override system, developer, or direct user instructions.

Instructions from: AGENTS.md

<项目规则内容>
</system-reminder>
```

这套机制有几个**很讲究的细节**：

| 细节 | 做法 | 为什么 |
| --- | --- | --- |
| 优先级 | 更具体的目录 > 更宽泛的 | 子目录规则覆盖父目录规则 |
| 字节预算 | `maxBytes` 封顶，超了先丢宽泛文件、再截最具体文件 | 防止规则撑爆 [[上下文窗口]] |
| 内容去重 | SHA-1 比对，`AGENTS.md` 和 `CLAUDE.md` 内容相同只渲染一次 | 省 token |
| 防注入 | 转义内容里的 `</system-reminder>` | 防止项目文件"提前关闭"框架，篡改提示词 |

> [!warning] 这招你在真实项目里见过
> 就是 Claude Code 那套 `CLAUDE.md`、以及各种编码 Agent 的 `AGENTS.md`——**把项目规则当作"低优先级、可覆盖"的上下文注入**，而不是塞进系统提示词硬编码。对应 [[真实Agent源码解剖]] 里 Claude Code 的系统提示词策略。

> [!question] 常见疑问：什么放人设，什么放 AGENTS.md？
> 判断标准**不是"是不是限制"**（人设段里也全是限制，如 plan mode 的 `Do not...`），而是**"谁的规则 + 多硬"**：
>
> | | 人设段（persona） | AGENTS.md |
> | --- | --- | --- |
> | 谁的规则 | 预设作者定的（Agent 的本质） | 用户/项目定的偏好 |
> | 优先级 | 高（属于系统提示词） | 低（明确不覆盖 system/developer/用户直接指令） |
> | 适合放什么 | **铁律、角色定义、核心行为** | 项目偏好、工作流习惯、目录专属规矩 |
>
> 例："只回答宠物健康问题"是**角色定义本身**（宠物医生助手=只干宠物健康）→ 放人设；"本项目笔记文件名用中文+短横线"是**项目偏好** → 放 AGENTS.md。
>
> 记住：**铁律不能放在"可被覆盖"的地方。** 问一句："这是'这个助手是什么'（→人设），还是'这个项目怎么干活'（→AGENTS.md）？"

## 三个反复出现的词：Token / KV Cache / 前缀

读 DSH 每个提示词相关包的 README，几乎都有一个固定小节结构：**"Token effect" 和 "KV Cache effect"**。这是 DSH 写提示词时**时刻在算的两笔账**：

| 考量 | 含义 | DSH 的做法 |
| --- | --- | --- |
| **Token 成本** | 每段提示词每请求重复一次，是要花钱/占预算的 | 身份是"固定成本"；工具 schema 每次重复，所以"少挂一个工具 = 省一大段" |
| **KV Cache 复用** | 大模型能缓存"前缀"，前缀不变就不用重算 | 把提示词设计成**前缀稳定**：身份、人设、变量解析结果不变 → 缓存命中；新增内容"只往后追加"，不破坏已有前缀 |

> [!tip] 一句话抓住精髓
> **"前缀稳定"是 DSH 写提示词的第一设计原则。** 固定不变的部分放最前面（身份→人设），会变的部分（运行时上下文、AGENTS.md）往后追加——这样每次请求开头那段一模一样，KV cache 能复用，省时省钱。

## 一张图总结整条流水线

```text
                    ┌───────────── 每个插件贡献一段文字 ─────────────┐
                    │  identity(-100)  persona(0)  tool引导(100+)  │
                    │        │            │            │           │
                    ▼        ▼            ▼            ▼           ▼
  每次调模型 ──►  装配流水线（dsh-system-prompt）
                    │  ① 按 order 排序拼接
                    │  ② 严格插值 {{model}} {{cwd}}（出错就抛）
                    │  ③ 拼上"运行时上下文快照"
                    │  ④ 附上工具 schema
                    ▼
              完整提示词 → 发给模型
```

## 对照你学过的提示词工程

把 DSH 的做法翻译回 [[Prompt与提示词工程]] 里的概念：

| 你学过的概念 | DSH 里的对应 |
| --- | --- |
| 系统提示词 | identity + persona + guidance 三层拼出来的那段 |
| few-shot / 示例 | 工具 schema 里的 `description`（教模型何时用工具） |
| 变量/模板 | `{{model}}`、`{{cwd}}` 严格插值 |
| 分层/优先级 | AGENTS.md 的"更具体 > 更宽泛" |
| 上下文窗口管理 | `maxBytes` 预算 + compaction 压缩 |
| 防注入 | 转义 `</system-reminder>` |

> [!important] 记住这句
> **DSH 的提示词 = 插件各供一段 + 按顺序拼装 + 严格校验 + 前缀稳定。** 它把"写提示词"变成了一门"工程"：谁提供哪段事实、怎么排序、怎么省 token、怎么防错、怎么利用缓存，全部有章法。

## 相关笔记

- [[DeepSeekHarness框架拆解]]
- [[Prompt与提示词工程]]
- [[DSH-04-配置文件与Preset结构]]
- [[记忆与上下文工程]]
