---
tags: [名词解释, Prompt, Agent开发]
created: 2026-08-02
---

# Prompt 与提示词工程

## 什么是 Prompt

Prompt（提示词）是你发给 [[LLM大语言模型]] 的输入文本。模型没有任何记忆和意图，它的一切行为都由 Prompt 驱动。**提示词工程（Prompt Engineering）** 就是研究"怎么写输入才能得到想要输出"的方法论——这是使用 AI 成本最低、见效最快的技能。

## 三种消息角色

调用 Chat API 时，对话由一组带角色的消息组成：

| 角色 | 作用 | 类比 |
| --- | --- | --- |
| `system` | 设定模型的身份、规则、输出格式，优先级最高 | 给员工的岗位说明书 |
| `user` | 用户的实际输入 | 客户的需求 |
| `assistant` | 模型之前的回复（多轮对话时由你回传） | 员工之前说过的话 |

```python
from openai import OpenAI

client = OpenAI()

resp = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": "你是一名严谨的 Python 讲师，回答必须附带可运行代码。"},
        {"role": "user", "content": "怎么读取 CSV 文件？"},
    ],
)
print(resp.choices[0].message.content)
```

> [!tip] system 提示词是杠杆
> 把通用要求（身份、语气、格式、禁忌）放进 system，把具体问题放在 user，效果和稳定性远好于全堆在 user 里。

## 零样本与少样本

- **零样本（Zero-shot）**：直接下指令，不给例子。适合简单、常见的任务。
- **少样本（Few-shot）**：在 Prompt 里给几个"输入→输出"示例，模型会模仿例子的风格和格式。适合格式要求严格或风格特殊的任务。

```python
few_shot = """
把情绪分类为：正面 / 负面 / 中性

输入：这家店的服务太差了
输出：负面

输入：今天天气还不错
输出：正面

输入：会议改到下午三点
输出：中性

输入：这个方案比我预期的好很多
输出：
"""
# 模型大概率输出：正面
```

## CoT 思维链

**Chain-of-Thought（思维链）**：让模型先写出推理过程，再给最终答案。对数学、逻辑、多步推理任务提升显著。

最简单的一句咒语：**"让我们一步一步思考（Let's think step by step）"**。

```python
prompt = """
小明有 3 箱苹果，每箱 24 个，他吃了 5 个，又送给朋友 12 个。
请问还剩多少个？让我们一步一步思考。
"""
# 模型会先算 3×24=72，再 72-5-12=55，而不是直接猜一个数
```

> [!note] 推理模型
> DeepSeek-R1、OpenAI o 系列等"推理模型"内置了思维链能力，不需要手写 CoT 提示，但普通模型加上 CoT 仍能明显改善复杂任务表现。

## 结构化输出

让模型输出 JSON 等机器可解析的格式，是 [[FunctionCalling函数调用]] 和 Agent 开发的基础：

```python
resp = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": "从用户文本中抽取信息，只输出 JSON，不要输出任何其他文字。"},
        {"role": "user", "content": '张三，28岁，住在北京。输出格式：{"name": str, "age": int, "city": str}'},
    ],
    response_format={"type": "json_object"},  # 强制 JSON 模式
)
```

## 实用技巧清单

> [!example] 十条高频技巧
> 1. **给角色**："你是一名资深后端工程师"。
> 2. **给背景**：说明任务上下文和你的目的。
> 3. **给示例**：few-shot 比抽象描述格式更可靠。
> 4. **分步骤**：复杂任务拆成编号步骤让模型依次执行。
> 5. **定格式**：明确"用表格输出""只输出代码""不超过 200 字"。
> 6. **给资料**：把参考文本贴进 Prompt，减少[[幻觉Hallucination]]（这就是 [[RAG检索增强生成]] 的思想）。
> 7. **用分隔符**：用 ``` 或 `###` 把指令和资料隔开，防止模型混淆。
> 8. **允许说不知道**：加上"如果资料中没有答案，就说不知道"。
> 9. **迭代优化**：把模型答错的案例收集起来，补充进 Prompt。
> 10. **调 temperature**：需要稳定输出时调低（0~0.3），需要创意时调高。

## 相关笔记

- [[LLM大语言模型]]
- [[幻觉Hallucination]]
- [[FunctionCalling函数调用]]
- [[ReAct与Agent设计模式]]
- [[提示词工程-真实案例拆解]]（进阶实战：读 DSH / Claude Code 的真实提示词，归纳十个套路）
- [[DSH-08-提示词工程拆解]]（DSH 是怎么"拼装"提示词的）
