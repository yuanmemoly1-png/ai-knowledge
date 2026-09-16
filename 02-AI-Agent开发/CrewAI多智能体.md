---
tags: [Agent开发, CrewAI, 多智能体]
created: 2026-08-02
---

# CrewAI 多智能体

CrewAI 是一个以「角色扮演」为核心理念的多智能体框架：你像组建团队一样，定义几个各有专长的 Agent，分配 Task，组成 Crew 跑起来。API 简洁，是多 Agent 入门的好选择。

## 三要素

| 要素 | 说明 | 关键参数 |
| --- | --- | --- |
| Agent | 一个「员工」，有角色设定 | `role`（角色）、`goal`（目标）、`backstory`（背景）、`tools`、`llm` |
| Task | 一项任务，指派给某个 Agent | `description`（做什么）、`expected_output`（期望产出格式）、`agent` |
| Crew | 团队 + 执行流程 | `agents`、`tasks`、`process`（sequential / hierarchical） |

> [!note] 为什么 backstory 有用
> 角色和背景会被拼进系统 Prompt，影响模型的措辞和行为倾向。「资深调查记者」和「实习生」写出的东西确实不一样——这本质上是 [[Prompt与提示词工程]] 在框架层面的封装。

## 完整示例：研究员 + 写手协作写报告

```python
# pip install crewai crewai-tools
from crewai import Agent, Task, Crew, Process

# ---------- 定义 Agent ----------
researcher = Agent(
    role="AI 行业研究员",
    goal="搜集并核实关于 {topic} 的最新事实和数据",
    backstory="你在科技媒体做了十年调研，擅长从海量信息中提炼关键事实，绝不信口开河。",
    verbose=True,
)

writer = Agent(
    role="科技专栏写手",
    goal="把研究素材写成通俗易懂的短文",
    backstory="你长期为大众读者写科普，风格简洁生动，拒绝堆砌术语。",
    verbose=True,
)

# ---------- 定义 Task ----------
research_task = Task(
    description="调研 {topic} 的发展现状，整理出 3-5 个关键事实，每条附一句解释。",
    expected_output="一份要点清单，每条包含：事实 + 一句话解释",
    agent=researcher,
)

write_task = Task(
    description="基于研究员提供的要点，写一篇 300 字左右的科普短文，面向零基础读者。",
    expected_output="一篇带标题的 Markdown 短文",
    agent=writer,
    context=[research_task],   # 声明依赖：写手拿得到研究员的输出
)

# ---------- 组建 Crew 并执行 ----------
crew = Crew(
    agents=[researcher, writer],
    tasks=[research_task, write_task],
    process=Process.sequential,   # 顺序执行：先研究，后写作
)

result = crew.kickoff(inputs={"topic": "AI Agent"})
print(result)
```

## 两种执行流程

- **sequential**：任务按列表顺序执行，上一个任务的输出传给下一个。简单可控，适合流水线。
- **hierarchical**：自动生成一个「经理 Agent」，由它分派任务、审核结果。更灵活但 Token 开销大、行为更难预测。

## 与 LangGraph 的取舍

| 对比维度 | CrewAI | LangGraph |
| --- | --- | --- |
| 抽象层级 | 高：角色/任务声明式定义 | 低：自己定义节点、边、状态 |
| 上手速度 | 快，几十行跑通多 Agent | 慢一些，概念多 |
| 可控性 | 弱，内部循环黑盒 | 强，每个节点可见可改 |
| 循环/分支 | 有限支持 | 任意图结构 |
| 人工介入 | 支持较弱 | 原生支持中断恢复 |
| 适合场景 | 内容生产、调研报告等流水线协作 | 复杂决策、生产级 Agent |

> [!tip] 选择建议
> 想法验证、内部工具用 CrewAI 快速跑通；要精细控制每一步、需要观测和回滚的生产系统用 [[LangGraph状态图]]。两者不互斥——也有人用 LangGraph 编排 CrewAI crew。

## 常见坑

- **Agent 互相吹捧不干活**：task 的 `expected_output` 写得太虚。写清楚格式和验收标准。
- **成本失控**：多 Agent 每轮都消耗 Token，先小规模试跑估算成本。
- **结果不稳定**：多 Agent 系统方差大，需要评估体系兜底，见 [[Agent评估与调试]]。

## 相关笔记

- [[ReAct与Agent设计模式]]
- [[LangGraph状态图]]
- [[Agent核心架构]]
- [[Agent评估与调试]]
