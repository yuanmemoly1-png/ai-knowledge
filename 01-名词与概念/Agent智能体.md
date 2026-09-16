---
tags: [名词解释, Agent开发, LLM]
created: 2026-08-02
---

# Agent 智能体

## 定义

Agent（智能体）是一种让 [[LLM大语言模型]] **自主完成多步任务**的应用形态。经典定义由四个部件组成：

```
Agent = LLM（大脑）+ 规划（Planning）+ 记忆（Memory）+ 工具（Tools）
```

- **LLM**：负责理解目标、推理决策。
- **规划**：把大目标拆成步骤，决定先做什么后做什么（见 [[ReAct与Agent设计模式]]）。
- **记忆**：记住中间结果和过往交互（见 [[记忆与上下文工程]]）。
- **工具**：搜索、计算器、数据库、代码执行器……通过 [[FunctionCalling函数调用]] 或 [[MCP模型上下文协议]] 接入。

## 与聊天机器人的区别

| 维度 | 聊天机器人 | Agent |
| --- | --- | --- |
| 交互模式 | 你问一句，它答一句 | 你给目标，它自己跑很多轮 |
| 行为 | 只输出文字 | 输出文字 + 调用工具 + 执行动作 |
| 结果 | 建议（"你可以这样查"） | 成果（"查好了，结果如下"） |
| 循环 | 无 | 感知 → 规划 → 行动 → 观察 → 再规划 |
| 典型例子 | ChatGPT 网页对话 | 自动订机票、自动修 Bug、自动做调研报告 |

一句话：**聊天机器人给答案，Agent 交结果。**

## 感知-规划-行动循环

Agent 的核心运行模式是一个循环（ReAct 是最著名的实现）：

```
┌─────────────────────────────────────────────┐
│  目标: "帮我查明天北京天气并决定是否带伞"        │
│                                              │
│  ① 思考(Thought): 我需要先查天气              │
│  ② 行动(Action): 调用 weather_api("北京")     │
│  ③ 观察(Observation): 明天雷阵雨，降水概率80%  │
│  ① 思考: 降水概率高，应建议带伞               │
│  ② 行动: 无需再调工具，生成最终回答            │
│  ③ 输出: "明天北京有雷阵雨，记得带伞 ☔"       │
└─────────────────────────────────────────────┘
```

每一轮"行动→观察"的结果会追加进上下文，供下一轮规划使用——这就是 Agent 能处理开放式任务的原因：它根据现实反馈动态调整计划，而不是一开始就写死流程。

## 一个最小 Agent 骨架

```python
# 伪代码：感受 Agent 循环的结构（真实实现见 LangChain/LangGraph 笔记）
tools = {"search": search_web, "calculator": run_calc}

def agent_loop(goal, max_steps=10):
    context = f"目标：{goal}"
    for step in range(max_steps):
        # LLM 决定下一步：调用工具 or 给出最终答案
        decision = llm(context + "\n请输出下一步：tool=xxx 或 final=答案")
        if decision.startswith("final="):
            return decision[6:]
        tool_name, tool_args = parse(decision)
        observation = tools[tool_name](**tool_args)   # 执行工具
        context += f"\n行动：{tool_name}({tool_args})\n观察：{observation}"
    return "超过最大步数，任务未完成"
```

## 为什么 Agent 是趋势

> [!note] 从"会说"到"会做"
> 裸 LLM 的价值受限于"只能输出文字"。接上工具后，同一套语言能力立刻变成执行力：读文件、查数据库、发请求、写代码并运行。业界普遍认为 Agent 是 LLM 应用的主战场，衍生了 LangGraph、CrewAI 等框架（见 [[LangGraph状态图]]、[[CrewAI多智能体]]）和 Cursor、Claude Code 这类编程 Agent（见 [[ClaudeCode与终端Agent]]）。

> [!warning] 也要有清醒认识
> Agent 会放大模型的错误：一步错可能步步错，且工具调用有真实副作用（发邮件、删文件）。生产环境必须配合步数上限、人工确认、评估监控等手段，见 [[Agent评估与调试]]。

## 下一步

想动手开发 Agent，直接进入 02 模块：[[Agent开发总览]] 会带你走完框架选型和第一个完整项目。

## 相关笔记

- [[Agent开发总览]]
- [[ReAct与Agent设计模式]]
- [[FunctionCalling函数调用]]
- [[记忆与上下文工程]]
