---
tags: [Agent开发, 设计模式, ReAct]
created: 2026-08-02
---

# ReAct 与 Agent 设计模式

Agent 的行为不是随意产生的，而是遵循几种被验证有效的设计模式。本文讲四个最核心的：**ReAct、Plan-and-Execute、Reflection、Multi-Agent**。

## 1. ReAct：推理 + 行动交替

ReAct（Reasoning + Acting）是最经典的 Agent 模式：模型每一步先输出**思考（Thought）**，再决定**动作（Action）**，拿到**观察（Observation）**后继续下一轮，直到给出最终答案。

### 伪代码

```python
def react_loop(question, tools, llm, max_steps=8):
    history = f"问题: {question}\n"
    for _ in range(max_steps):
        output = llm.generate(REACT_PROMPT + history)   # 要求模型按固定格式输出
        if "Final Answer:" in output:
            return output.split("Final Answer:")[1].strip()
        thought, action, action_input = parse(output)   # 解析 Thought / Action / Action Input
        observation = tools[action].run(action_input)
        history += f"Thought: {thought}\nAction: {action}\nAction Input: {action_input}\nObservation: {observation}\n"
    return "未能完成任务"
```

### 一轮完整 trace 示例

```
问题: 长江的长度大约是黄河的多少倍？

Thought: 我需要先查长江的长度。
Action: search
Action Input: 长江长度
Observation: 长江全长约 6300 公里。

Thought: 接下来查黄河的长度。
Action: search
Action Input: 黄河长度
Observation: 黄河全长约 5464 公里。

Thought: 两者都已知，6300 / 5464 ≈ 1.15，可以回答了。
Action: calculator
Action Input: 6300 / 5464
Observation: 1.1530

Thought: 计算完成，给出最终答案。
Final Answer: 长江长度约是黄河的 1.15 倍。
```

> [!tip] 为什么 Thought 很重要
> 强制模型「先想再做」相当于给它打草稿，能显著减少选错工具、传错参数的情况。这也是很多框架（LangChain 的 ReAct agent、OpenAI 的 reasoning 模型）的共同思想。

## 2. Plan-and-Execute：先规划后执行

ReAct 是「走一步看一步」，Plan-and-Execute 是「先把计划列全，再逐步执行」：

1. **Planner**：用 LLM 把目标拆成有序步骤列表
2. **Executor**：逐个执行步骤（每步可以是 ReAct 小循环或一次工具调用）
3. **Replan（可选）**：执行中发现计划过时，重新规划

| 对比 | ReAct | Plan-and-Execute |
| --- | --- | --- |
| 规划时机 | 每步即兴 | 事前全局 |
| Token 消耗 | 高（每步带全历史） | 较低（步骤间可只传结果） |
| 适合任务 | 路径不确定的探索型 | 步骤明确的流程型 |
| 弱点 | 容易走偏、陷入循环 | 计划错了会一路错到底 |

## 3. Reflection：自我反思

让模型在执行后**批判自己的输出**，发现错误后重试：

```python
draft = llm.generate(f"回答问题: {question}")
critique = llm.generate(f"检查这个回答有没有错误或不完整:\n{draft}")
if "有问题" in critique:
    draft = llm.generate(f"根据以下批评改进回答:\n批评: {critique}\n原稿: {draft}")
```

典型应用：写代码 Agent 运行测试失败后，把报错喂回模型让它反思并修复，如此迭代直到测试通过。

## 4. Multi-Agent：多智能体协作

单个 Agent 上下文有限、职责混杂，可以把系统拆成多个专职 Agent：

- **主管-员工（Supervisor-Worker）**：一个主管 Agent 分派任务、汇总结果，多个员工 Agent 各管一摊
- **流水线（Pipeline）**：研究员 → 写手 → 审校，依次传递
- **辩论/评审**：两个 Agent 互相挑错，提升输出质量

框架实现见 [[CrewAI多智能体]] 和 [[LangGraph状态图]]。

> [!warning] 多 Agent 不是银弹
> 每多一个 Agent 就多一份 Token 开销和失败点。Anthropic 在《Building effective agents》一文中强调：**能用一个 LLM 调用解决的就不要上工作流，能用固定工作流解决的就不要上自主 Agent**。先用最简单的方案，复杂度只在必要时引入。
>
> 📄 2026 年论文级证据：[[2026-08-22-多智能体神话破灭]]——多智能体团队存在"专业知识稀释效应"（规模越大性能越差），瓶颈在专家知识利用而非专家识别；AgentArk 的蒸馏路线（把多智能体能力压进单模型）是对它的工程回应。

## 模式选择速查

| 你的场景 | 推荐模式 |
| --- | --- |
| 任务路径不确定、需要边做边查 | ReAct |
| 任务步骤清晰、可提前列出 | Plan-and-Execute |
| 对输出质量要求高（代码、报告） | 任一模式 + Reflection |
| 职责多、上下文装不下 | Multi-Agent |

## 相关笔记

- [[Agent核心架构]]
- [[工具调用实战]]
- [[CrewAI多智能体]]
- [[Agent评估与调试]]
