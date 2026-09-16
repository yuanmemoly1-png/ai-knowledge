---
tags: [小白课堂, AI实战]
created: 2026-08-10
---

# 小白课：实战最小 Agent（50 行以内）

上一课：[[小白课-实战工具调用]]

> [!note] 这节课学什么
> 上节课的"调一次工具"已经是半个 Agent 了。这节课只差一步：**把工具调用包进循环**，让 AI 自己决定"要不要再调一次"，直到任务完成。
> 你会亲眼看到 Agent 的思考循环：**思考 → 动作 → 观察 → 再思考**，这正是 [[小白课-Agent传纸条循环]] 的代码版。
> 全流程已用假模型真实运行验证；换真 Key 跑真的（**需替换你的 Key 后运行**）。

---

## 第 1 步：从"调一次工具"到 Agent，只差一个循环

上节课的流程是直线：问一次 → 调一次 → 答。但如果问题是"**北京和上海哪个更热？**"呢？AI 要查**两次**天气再比较。

人写死"调两次"就太笨了。真正的做法：**循环**——每轮问 AI"你想好了吗？"，它要工具就执行了再问，它说不要了就是答案：

```text
循环开始
  ├─ AI 要工具？→ 程序执行 → 结果回传 → 再问
  └─ AI 不要工具了 → 它的 content 就是最终回答 → 循环结束
```

## 第 2 步：完整代码（50 行以内）

函数和 tools 说明书沿用上节课的，核心是 `run_agent`（已用假模型真实运行验证）：

```python
import json

def get_weather(city):
    data = {"北京": "晴，25°C", "上海": "小雨，20°C", "广州": "多云，30°C"}
    return data.get(city, f"没有{city}的数据")

tools = [{"type": "function", "function": {
    "name": "get_weather",
    "description": "查询指定城市的天气",
    "parameters": {"type": "object",
                   "properties": {"city": {"type": "string", "description": "城市名"}},
                   "required": ["city"]}}}]

def run_agent(client, question, max_steps=5):
    messages = [{"role": "system", "content": "你可以调用工具查天气，最后给出结论。"},
                {"role": "user", "content": question}]
    for step in range(1, max_steps + 1):
        msg = client.chat.completions.create(
            model="deepseek-chat", messages=messages, tools=tools).choices[0].message
        if not msg.tool_calls:                      # AI 不要工具了 = 想好了
            print(f"第{step}步【最终回答】{msg.content}")
            return
        call = msg.tool_calls[0]
        args = json.loads(call.function.arguments)
        print(f"第{step}步【思考】要先查{args['city']}的天气")
        print(f"第{step}步【动作】调用 get_weather(\"{args['city']}\")")
        result = get_weather(args["city"])
        print(f"第{step}步【观察】{result}")
        messages.append(msg)
        messages.append({"role": "tool", "tool_call_id": call.id, "content": result})
    print(f"超过{max_steps}步还没完成，强制停止！")

run_agent(client, "北京和上海哪个城市更热？")
```

> [!warning] 别忘了
> 运行前要有上节课的 `client`（`load_dotenv()` + `OpenAI(...)`）。文件顶部 `import os`、`from dotenv import load_dotenv`、`from openai import OpenAI` 老三样照抄。

## 第 3 步：跑起来，亲眼看 Agent loop

✅ 看到这个就对了（假模型真实运行的输出，真模型步数可能不同）：

```text
第1步【思考】要先查北京的天气
第1步【动作】调用 get_weather("北京")
第1步【观察】晴，25°C
第2步【思考】要先查上海的天气
第2步【动作】调用 get_weather("上海")
第2步【观察】小雨，20°C
第3步【最终回答】北京25°C，上海20°C，北京更热。
```

瞪大眼睛看这个过程：

- **思考**：AI 决定下一步干嘛（要哪个工具、填什么参数）
- **动作**：你的程序真的执行函数
- **观察**：结果塞回 messages，AI"看到"了

这就是 [[小白课-ReAct思考行动循环]] 说的 ReAct 模式——没有任何黑魔法，就是一个 for 循环加一堆 print。

## 第 4 步：max_steps——必须有的保险丝

注意 `for step in range(1, max_steps + 1)`，不是 `while True`。

> [!warning] 为什么不能用 while True
> AI 可能犯傻：一直要工具、永远不满足，每转一圈都在**烧你的 token 钱**。`max_steps=5` 就是保险丝——转 5 圈还没完，强制拉闸。这是所有真实 Agent 框架的标配，详见 [[Agent核心架构]]。

想验证保险丝？把 `max_steps=5` 改成 `max_steps=1` 再跑，你会看到"超过1步还没完成，强制停止！"。

## 最关键的一句

> [!important]
> **Agent = 工具调用 + 循环 + 护栏：每轮问 AI"想好了吗"，要工具就执行回传再问，不要了就收答案，超过 max_steps 强制拉闸。**

## 大白话翻译表

| 术语 | 大白话 |
| --- | --- |
| Agent | 会自己连续干活的 AI 程序 |
| Agent loop | 思考 → 动作 → 观察 的循环 |
| 思考 | AI 决定下一步（要不要工具） |
| 动作 | 程序执行函数 |
| 观察 | 结果塞回 messages 给 AI 看 |
| `max_steps` | 保险丝，防 AI 死循环烧钱 |

## 检查一下

1. 循环里怎么判断"AI 想好了，可以收工了"？
2. "北京和上海哪个更热"为什么要循环，一次调用搞不定吗？
3. 为什么不建议用 `while True`？
4. 每轮循环里 messages 增加了哪两条？

<details>
<summary>点我看答案</summary>

1. `msg.tool_calls` 是空的——AI 不要工具了，`msg.content` 里就是最终回答。
2. 因为要查两个城市：第一次调用只知道"要查北京"，结果回来后 AI 才知道还要查上海。调几次是 AI 边看边决定的，人写不死。
3. AI 可能一直要工具，死循环烧 token；必须加 `max_steps` 护栏。
4. AI 的调用单（`msg`）和工具结果（`{"role": "tool", ...}`）。
</details>

下一课：[[小白课-实战RAG迷你版]]

## 相关笔记

- [[小白课-Agent传纸条循环]]
- [[小白课-ReAct思考行动循环]]
- [[Agent核心架构]]
- [[Agent智能体]]
