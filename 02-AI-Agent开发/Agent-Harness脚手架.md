---
tags: [Agent开发, 概念解析, Harness]
created: 2026-08-02
---

# Agent Harness（脚手架）

> [!note] 一句话定义
> **Harness（原意"马具/挽具"）是套在大模型外面的那层工程脚手架**：模型是有蛮力但没有方向的"马"，Harness 是驾驭它的"马具"——负责循环调度、喂工具、管上下文、设护栏，让模型变成能干活的 Agent。

## 为什么这个概念火了

2025 年以来各家模型能力越来越接近，**模型本身拉不开差距，竞争点下移到了 Harness 层**：

- 同一个 Claude / GPT，套进 Claude Code 就是编程神器，裸调 API 只是个聊天框
- 产品体验的差异 ≈ Harness 工程的差异
- 于是大厂开始抢"Harness Engineering"方向的人——会做模型的人很多，会把模型**驾驭**好的人很少

> [!example] 你天天在用的 Harness
> Claude Code、Cursor 的 Agent 模式、各类 CLI Agent——它们的模型可能就是同一个，但用起来天差地别，差别全在 Harness：怎么组织上下文、怎么设计工具、什么时候让你人工确认。

## Harness 的四大组成

| 组成 | 职责 | 深入阅读 |
| --- | --- | --- |
| Agent Loop | 思考 → 调工具 → 看结果 → 再思考的主循环 | [[Agent核心架构]] |
| 工具系统 | 文件读写、执行命令、联网搜索、MCP 工具 | [[工具调用实战]]、[[MCP协议实战]] |
| 上下文工程 | 每轮往 prompt 里放什么、压缩什么、隔离什么 | [[记忆与上下文工程]] |
| 权限与护栏 | 危险操作人工确认、防 Prompt 注入、预算限制 | [[Agent评估与调试]] |

## Harness vs Framework：别搞混

> [!warning] 常见混淆
> **Framework（框架）是"造 Harness 的工具"，Harness 是"跑起来的产物"。**
> - LangChain / LangGraph / CrewAI 是框架——提供积木
> - 你用积木搭出来的那个能跑任务的系统，才是 Harness
>
> 面试时被问"怎么理解 Harness"，答出这句就赢了一半：**模型提供智能，Harness 决定智能被怎么用。**

## 一个最小的 Harness 长什么样

剥掉所有框架，Harness 的核心不过几十行代码——一个带着工具的循环：

```python
def harness(user_goal: str) -> str:
    messages = [build_system_prompt(TOOLS), {"role": "user", "content": user_goal}]

    for step in range(MAX_STEPS):                       # 护栏 1：步数上限
        response = llm.chat(messages, tools=TOOL_SCHEMAS)

        if not response.tool_calls:                     # 模型说"干完了"→ 退出循环
            return response.content

        for call in response.tool_calls:
            if is_dangerous(call) and not ask_human(call):  # 护栏 2：危险操作人工确认
                result = "用户拒绝了该操作"
            else:
                result = execute(call)                  # 工具系统：真正干活的地方
            messages.append(tool_result_msg(call.id, result))

        messages = compress_if_too_long(messages)       # 上下文工程：防爆炸

    return "达到步数上限，任务未完成"
```

对照着看：这就是 [[工具调用实战]] 里那个 demo 的"产品化骨架"——加上护栏和上下文管理，它就从一个 demo 变成了一个（迷你）Harness。

## 进阶方向

- **子 Agent 调度**：主 Harness 派生子 Agent 处理子任务、隔离上下文（Deep Agents 的核心思想）
- **虚拟文件系统**：用文件当"外置记忆"，缓解 [[上下文窗口]] 压力
- **系统化学习**：Datawhale《deepagents-in-action》课程有"Agent Framework、Agent Harness 与 Context Engineering"专章（见 [[中文免费资源]]）；鱼皮 ai-guide 也有 Harness Engineering 章节（见 [[AI编程工具课程]]）

> [!tip] 面试加分句
> "Claude Code 和裸调 Claude API 用的是同一个模型，差距全在 Harness——我做的这个项目，核心工作就是设计它的 Harness：工具 schema、上下文压缩策略和人工确认节点。"

## 相关笔记

- [[Agent核心架构]]
- [[记忆与上下文工程]]
- [[Agent评估与调试]]
- [[AI面试八股文]]
