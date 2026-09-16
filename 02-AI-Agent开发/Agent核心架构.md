---
tags: [Agent开发, 架构, 名词解释]
created: 2026-08-02
---

# Agent 核心架构

一个 Agent 系统无论用什么框架实现，都可以拆成四个要素：**规划（Planning）、记忆（Memory）、工具（Tools）、行动（Action）**。理解这四个要素，就看懂了所有 Agent 框架的骨架。

## 四要素详解

### 1. 规划 Planning

规划是 Agent 的「思考」部分，回答「下一步该做什么」。常见方式：

- **任务分解**：把大目标拆成子任务。例如「帮我调研竞品」拆成「搜索竞品 → 逐个访问官网 → 提取价格信息 → 汇总表格」。
- **逐步推理**：让模型在每一步先输出思考（Thought）再决定动作，典型做法是 [[ReAct与Agent设计模式]] 中的 ReAct 模式。
- **自我反思**：执行后回顾结果，发现错误就修正计划（Reflection 模式）。

> [!tip] 实践要点
> 规划能力 = Prompt 设计 + 模型能力。弱模型往往规划不可靠，可以在 Prompt 里直接给少量步骤示例（few-shot）显著提升规划质量。

### 2. 记忆 Memory

记忆让 Agent 跨步骤、跨会话保留信息，分两类：

| 类型 | 内容 | 典型实现 | 生命周期 |
| --- | --- | --- | --- |
| 短期记忆 | 当前对话历史、中间步骤结果 | 消息列表、滑动窗口、摘要压缩 | 单次任务内 |
| 长期记忆 | 用户偏好、历史经验、领域知识 | 向量数据库（见 [[RAG检索增强生成]]）、文件、KV 存储 | 跨会话持久 |

详见 [[记忆与上下文工程]]。

### 3. 工具 Tools

工具是 Agent 的「手脚」，把模型的文本决策变成真实世界的操作。常见工具：

- **信息获取**：搜索引擎、网页抓取、数据库查询、调用 API
- **计算与执行**：代码解释器、计算器、Python REPL
- **写入操作**：发邮件、写文件、创建日历事件（需要格外小心，见 [[Agent评估与调试]] 的护栏部分）

每个工具需要向模型描述三件事：**名称、功能描述、参数 schema**。模型根据描述决定何时调用、传什么参数，详见 [[FunctionCalling函数调用]] 和 [[工具调用实战]]。

### 4. 行动 Action

行动是规划与工具之间的桥梁：模型输出「调用某工具、参数是什么」，框架解析后真正执行，再把结果（Observation）喂回模型。一个动作通常包含：

```json
{
  "tool": "search",
  "tool_input": {"query": "2026 年 AI Agent 趋势"},
  "thought": "我需要先搜索最新信息"
}
```

## Agent loop 伪代码

四要素串起来就是经典的 Agent loop——这是所有 Agent 框架内部都在做的事：

```python
def agent_loop(goal, tools, llm, max_steps=10):
    memory = [system_prompt(goal, tools)]   # 记忆初始化：目标 + 工具说明
    for step in range(max_steps):
        # 1. 规划：LLM 根据记忆决定下一步
        response = llm.generate(memory)
        # 2. 判断：模型认为任务完成了吗？
        if response.is_final_answer:
            return response.text
        # 3. 行动：解析并执行工具调用
        action = parse_action(response)      # 工具名 + 参数
        observation = tools[action.name].run(action.input)
        # 4. 记忆：把行动和结果写回上下文
        memory.append({"action": action, "observation": observation})
    return "超过最大步数，任务终止"          # 必须有兜底，防止死循环
```

> [!warning] 三个容易踩的坑
> - **没有 max_steps 兜底**：模型可能反复调用同一个工具陷入死循环，烧光 Token 预算。
> - **observation 不做截断**：网页、日志动辄上万 Token，直接塞进记忆会撑爆 [[上下文窗口]]。
> - **工具描述含糊**：模型选错工具 90% 是因为工具描述写得差，而不是模型笨。

## 一张图总结

```
        ┌─────────────────────────────────────┐
        │              Agent loop              │
        │                                      │
 目标 → │  Planning(想) → Action(做) → 观察结果 │
        │      ↑                       │       │
        │      └───── Memory(记) ←─────┘       │
        │                                      │
        │   Tools：搜索 / 代码 / API / 文件     │
        └─────────────────────────────────────┘
              循环直到给出最终答案或达到步数上限
```

## 相关笔记

- [[Agent智能体]]
- [[ReAct与Agent设计模式]]
- [[工具调用实战]]
- [[记忆与上下文工程]]
