---
tags: [Agent开发, LangChain, Python]
created: 2026-08-02
---

# LangChain 入门

LangChain 是最流行的 LLM 应用开发框架之一，定位是「LLM 应用的胶水层」：把 Prompt 模板、模型调用、输出解析、工具、检索等组件统一成可组合的接口。需要 Python 环境，见 [[环境搭建与包管理]]。

## 生态与包结构

LangChain 早已拆成多个包，按需安装：

| 包 | 内容 |
| --- | --- |
| `langchain-core` | 核心抽象：Runnable、Prompt、消息类型、LCEL |
| `langchain` | 链、Agent 等高层封装 |
| `langchain-community` | 社区贡献的第三方集成（各种数据库、API） |
| `langchain-openai` | OpenAI 模型接入（Anthropic、通义等各有独立包） |
| `langgraph` | 图结构 Agent 编排（见 [[LangGraph状态图]]） |

安装命令：

```bash
pip install langchain langchain-openai
```

并设置环境变量 `OPENAI_API_KEY`。

## 核心概念：LCEL 链式调用

LCEL（LangChain Expression Language）用管道符 `|` 把组件串成链：

```python
prompt | model | output_parser
```

每个组件都是 `Runnable`，前一个的输出自动作为后一个的输入。这是 LangChain 最值得学的部分——学会它，80% 的日常需求都能解决。

## 完整示例：翻译 + 润色链

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# 1. Prompt 模板：{text} 是占位符
prompt = ChatPromptTemplate.from_messages([
    ("system", "你是翻译专家。把用户输入翻译成{lang}，只输出译文。"),
    ("user", "{text}"),
])

# 2. 模型
model = ChatOpenAI(model="gpt-4o-mini", temperature=0)

# 3. 输出解析：把 AIMessage 对象转成纯字符串
output_parser = StrOutputParser()

# 4. 用 | 串成链
chain = prompt | model | output_parser

# 5. 调用
result = chain.invoke({"text": "人工智能正在改变世界", "lang": "英语"})
print(result)   # Artificial intelligence is changing the world
```

## 常用调用方式

```python
chain.invoke({"text": "你好", "lang": "英语"})      # 同步单条
chain.batch([{"text": "你好", "lang": "英语"},
             {"text": "谢谢", "lang": "日语"}])     # 批量并行
for chunk in chain.stream({"text": "你好", "lang": "英语"}):  # 流式输出
    print(chunk, end="")
```

## 进阶：带工具的 Agent

LangChain 也能快速搭建带工具的 Agent（内部仍是 [[工具调用实战]] 里那个循环）：

```python
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool

@tool
def multiply(a: float, b: float) -> float:
    """计算两个数的乘积。"""          # docstring 就是给模型看的工具描述
    return a * b

model = ChatOpenAI(model="gpt-4o-mini")
model_with_tools = model.bind_tools([multiply])

resp = model_with_tools.invoke("3.5 乘以 4.2 等于多少？")
print(resp.tool_calls)
# [{'name': 'multiply', 'args': {'a': 3.5, 'b': 4.2}, 'id': 'call_xxx', ...}]
```

> [!warning] 版本坑提醒
> LangChain API 变动频繁，网上大量 2023 年教程（`LLMChain`、`AgentExecutor` 老写法）已过时。学习时认准官方文档当前版本，优先用 LCEL 写法。

## 什么时候用 LangChain

- 适合：快速原型、需要对接多种模型/数据库、团队已有 LangChain 代码
- 不适合：想要极简依赖（几十行原生 SDK 代码就能搞定时）、需要复杂状态控制（改用 [[LangGraph状态图]]）

## 相关笔记

- [[LangGraph状态图]]
- [[工具调用实战]]
- [[Prompt与提示词工程]]
- [[面向AI开发的Python]]
