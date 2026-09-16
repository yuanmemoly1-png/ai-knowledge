---
tags: [Agent开发, LangGraph, Python]
created: 2026-08-02
---

# LangGraph 状态图

LangGraph 是 LangChain 团队出品的 Agent 编排库，核心思想：**把 Agent 的执行流程建模为一张有向图**。相比 LCEL 的线性链（见 [[LangChain入门]]），LangGraph 支持循环、分支、状态持久化，是构建可控 Agent 的主流选择。

## 四大核心概念

| 概念 | 说明 | 类比 |
| --- | --- | --- |
| State 状态 | 在节点间流转的共享数据（通常是个 TypedDict） | 流水线上的托盘 |
| Node 节点 | 一个处理函数：读状态、干活、返回状态更新 | 流水线工位 |
| Edge 边 | 节点间的连接；条件边可根据状态决定走向 | 传送带 + 岔路口 |
| Graph 图 | 节点和边的整体，编译后成为可执行的 app | 整条流水线 |

与 LangChain 的关系：LangChain 提供模型/Prompt 等组件，LangGraph 负责「把这些组件按图组织起来」。两者常混用——节点内部用 LCEL 链，节点之间用图编排。

## 最小 Agent 完整示例

实现一个「模型决定是否调工具，调完再回到模型」的经典循环：

```python
from typing import Annotated, TypedDict
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, ToolMessage
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages

# ---------- 1. 定义状态 ----------
# add_messages 告诉 LangGraph：messages 字段按「追加」方式合并
class AgentState(TypedDict):
    messages: Annotated[list, add_messages]

# ---------- 2. 准备工具与模型 ----------
def multiply(a: float, b: float) -> float:
    """计算两个数的乘积。"""
    return a * b

tools = {"multiply": multiply}
model = ChatOpenAI(model="gpt-4o-mini").bind_tools(list(tools.values()))

# ---------- 3. 定义节点 ----------
def call_model(state: AgentState):
    """让模型看当前消息，决定回复或调工具。"""
    response = model.invoke(state["messages"])
    return {"messages": [response]}

def call_tools(state: AgentState):
    """执行模型请求的工具调用。"""
    last = state["messages"][-1]
    results = []
    for tc in last.tool_calls:
        output = tools[tc["name"]](**tc["args"])
        results.append(ToolMessage(content=str(output), tool_call_id=tc["id"]))
    return {"messages": results}

# ---------- 4. 定义条件边 ----------
def should_continue(state: AgentState) -> str:
    last = state["messages"][-1]
    return "tools" if last.tool_calls else END   # 有工具调用就去 tools，否则结束

# ---------- 5. 组装图 ----------
graph = StateGraph(AgentState)
graph.add_node("agent", call_model)
graph.add_node("tools", call_tools)
graph.add_edge(START, "agent")
graph.add_conditional_edges("agent", should_continue)
graph.add_edge("tools", "agent")      # 工具执行完，回到模型节点 —— 形成循环

app = graph.compile()

# ---------- 6. 运行 ----------
result = app.invoke({"messages": [HumanMessage("3.5 乘以 4.2 是多少？")]})
print(result["messages"][-1].content)   # 3.5 × 4.2 = 14.7
```

执行路径：`START → agent → (要调工具) → tools → agent → (得到结果) → END`。

## 什么时候该选 LangGraph

| 场景 | 建议 |
| --- | --- |
| 单次 Prompt → 模型 → 解析 | 不需要图，用 [[LangChain入门]] 的 LCEL 就够 |
| 需要循环（ReAct 式反复调工具） | LangGraph |
| 需要人工审批节点（human-in-the-loop） | LangGraph（支持中断与恢复） |
| 多 Agent 编排、复杂分支 | LangGraph 或 [[CrewAI多智能体]] |
| 需要断点续跑、状态持久化 | LangGraph（checkpointer 机制） |

> [!tip] 学习建议
> 先手写一遍 [[工具调用实战]] 里的 while 循环，再学 LangGraph——你会发现图里的 `call_model`、`call_tools`、`should_continue` 就是 while 循环里那几段代码的「节点化」。框架没有魔法。

## 相关笔记

- [[LangChain入门]]
- [[ReAct与Agent设计模式]]
- [[CrewAI多智能体]]
- [[记忆与上下文工程]]
