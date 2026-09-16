---
tags: [小白课堂, Agent]
created: 2026-08-02
---

# 小白课：ReAct 思考行动循环（慢速版）

上一课：[[小白课-工具调用]]

> [!note] 这节课学什么
> 前两课的 Agent 会干活了，但有个毛病：**想到就干，不解释为什么**。步骤一多就乱来，错了你也不知道它哪步想歪的。
> 这节课学一个给它立的规矩——**ReAct**：每转一圈，纸条上必须先写"我想"，再写"我做"，最后记下"我看到"。全程慢放一轮完整的 trace（执行轨迹）。

---

## 第 1 步：名字先拆开

ReAct = **Re**ason（推理/想）+ **Act**（行动/做）。大白话：**先想后做，边做边想**。

规矩很简单：模型每圈的纸条必须分三段写：

1. **Thought（我想……）**：我现在知道什么？下一步该干嘛？为什么？
2. **Action（我做……）**：调哪个工具、带什么参数（就是上两课的暗号）。
3. **Observation（我看到……）**：工具干完活塞回来的结果。

前两段是模型写的，第三段是你的程序填的。

## 第 2 步：一步一图解——一圈纸条的三段

```text
第 1 圈的纸条
┌────────────────────────────────────────┐
│ Thought: 用户问北京天气，我自己不知道，  │ ← 模型先逼自己说清楚计划
│          得先查一下                     │
│ Action:  get_weather {"city": "北京"}    │ ← 然后才是暗号（上一课学的）
├────────────────────────────────────────┤
│ Observation: 北京：小雨，26度            │ ← 程序执行完，把结果填进来
└────────────────────────────────────────┘
第 2 圈的纸条
┌────────────────────────────────────────┐
│ Thought: 天气已经拿到了，信息够了，      │
│          可以回答了                     │
│ Action:  reply "北京今天小雨，26度，     │
│          记得带伞"                      │ ← reply = 不调工具，直接答
└────────────────────────────────────────┘
```

和第 1 课的传纸条时序一模一样，只是纸条从"只有暗号"升级成"先写想法再写暗号"。

## 第 3 步：真跑一遍完整 trace

用字典模拟一个"会写 Thought 的模型"，跑两轮：

```python
def fake_llm_think(context):
    """假LLM：先想（Thought），再决定做什么（Action）"""
    if not any("Observation" in m for m in context):
        return {"thought": "用户问北京天气，我自己不知道，得先查一下",
                "action": ("get_weather", {"city": "北京"})}
    return {"thought": "天气已经拿到了，信息够了，可以回答了",
            "action": ("reply", "北京今天小雨，26度，记得带伞")}

def get_weather(city):
    return f"{city}：小雨，26度"

context = ["User: 北京今天天气怎么样？"]

for i in range(3):
    step = fake_llm_think(context)
    print(f"Thought: {step['thought']}")
    name, payload = step["action"]
    print(f"Action: {name} {payload}")
    if name == "reply":
        print("最终回复:", payload)
        break
    obs = get_weather(**payload)
    print(f"Observation: {obs}")
    context.append(f"Observation: {obs}")
    print("---")
```

真实输出：

```text
Thought: 用户问北京天气，我自己不知道，得先查一下
Action: get_weather {'city': '北京'}
Observation: 北京：小雨，26度
---
Thought: 天气已经拿到了，信息够了，可以回答了
Action: reply 北京今天小雨，26度，记得带伞
最终回复: 北京今天小雨，26度，记得带伞
```

代码逐块看：

- `step = fake_llm_think(context)`：模型看全部旧纸条，吐出 `{"thought": ..., "action": ...}` 一个字典。
- `name, payload = step["action"]`：action 是个二元组（动作名， 参数），一行拆开。
- `context.append(...)`：Observation 被**追加进旧纸条**，下一轮模型能看到它——所以它第二轮才知道"天气已经拿到了"。

## 第 4 步：为什么非要"先想"，不能直接干？

你可能会问：去掉 Thought，直接输出 Action 不行吗？行，但会亏两样东西：

- **不乱跑**：写下"我想"那句话，等于逼模型把计划说出口。计划一出口，胡来的动作就少了——研究发现（ReAct 论文，2022）这样确实更准。就像让急性子跑腿先说"我要去干嘛"，他自己就会发现"等等，我还没查天气"。
- **看得见（可调试）**：Thought 留在 trace 里，你能看到 AI 每步为什么这么做。它答错时，你能定位是"哪一步想歪了"，而不是对着错误结果干瞪眼。你在用 Claude Code、Kimi CLI 时看到的一行行"思考过程"，就是这一段。

> [!warning] Thought 也是钱
> 每圈的 Thought 都会塞进下一轮的纸条里（见代码里的 `context.append`），圈数越多、纸条越长，Token 烧得越快。复杂任务跑十几圈，费用可能是单轮问答的几十倍。怎么控制，见 [[小白课-Token与计费]] 和下一课 [[小白课-Agent记忆]]。

## 第 5 步：和前面几课的关系

```text
第1课 传纸条循环  = 骨架：塞纸条 → 看回条 → 干工具 → 再塞
第2课 工具调用    = 暗号升级：JSON 格式 + 工具说明书
第3课 ReAct(本课) = 纸条升级：先写 Thought 再写 Action
```

三个东西是**叠加**关系，不是三个不同的 Agent。真实的 Agent 框架就是把这三层全叠上，再加记忆（下一课）。

## 最关键的一句

> [!important]
> **ReAct 就是给 Agent 循环立规矩：每圈纸条必须先写 Thought（我想）再写 Action（我做），程序填上 Observation（我看到）再塞回去——先想后做，痕迹留档。**

## 大白话翻译表

| 术语 | 大白话 |
| --- | --- |
| ReAct | Reason + Act，先想后做 |
| Thought | 纸条上的"我想……"，计划说出口 |
| Action | 纸条上的"我做……"，调工具或直接答 |
| Observation | 纸条上的"我看到……"，工具结果 |
| trace 执行轨迹 | 一圈圈 Thought/Action/Observation 的完整记录 |

## 检查一下

1. ReAct 的三段里，哪两段是模型写的，哪一段是程序填的？
2. 代码里 `context.append(...)` 这一行删掉会发生什么？
3. 让模型先写 Thought 再写 Action，有哪两个好处？
4. Action 为 `reply` 时，循环为什么结束？

<details>
<summary>点我看答案</summary>

1. Thought 和 Action 是模型写的；Observation 是程序执行工具后填的。
2. 模型下一轮看不到工具结果，会以为"还没查天气"，可能重复调同一个工具，转圈出不来。
3. 一是不乱跑（计划说出口，动作更靠谱）；二是看得见（trace 里留有思考痕迹，错了能定位）。
4. `reply` 表示模型判断信息够了、直接给最终答案，不需要再调工具，所以 `break`。
</details>

下一课：[[小白课-Agent记忆]]

## 相关笔记

- [[ReAct与Agent设计模式]]
- [[Agent核心架构]]
- [[工具调用实战]]
- [[新手报错速查]]
