---
tags: [名词解释, Agent开发, Python]
created: 2026-08-02
---

# Function Calling 函数调用

## 原理

[[LLM大语言模型]] 只会输出文本，没法真的"查天气"或"查数据库"。Function Calling（函数调用）解决这个问题的思路非常朴素：**模型不执行函数，它只负责"决定该调哪个函数、传什么参数"，真正执行的是你的程序**。

完整四步：

```
① 你告诉模型有哪些函数可用（JSON Schema 描述：名称、说明、参数）
② 模型输出结构化 JSON：{"name": "get_weather", "arguments": {"city": "北京"}}
③ 你的程序解析 JSON，真正调用本地函数，拿到结果
④ 把结果作为新消息回传给模型，模型生成最终的自然语言回答
```

> [!note] 关键认知
> 模型从始至终没有"运行"任何代码——它只是按 schema 的约束生成了一段格式正确的 JSON。安全性、权限、执行逻辑全部由你的程序控制。这也是 [[Agent智能体]] 能"动手做事"的底层机制。

## OpenAI SDK 实战示例

```python
import json
from openai import OpenAI

client = OpenAI()

# ① 用 JSON Schema 描述可用工具
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "查询指定城市的实时天气",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {"type": "string", "description": "城市名，如：北京"},
                    "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]},
                },
                "required": ["city"],
            },
        },
    }
]

# 本地真实函数（演示用假数据，实际可接天气 API）
def get_weather(city: str, unit: str = "celsius") -> dict:
    return {"city": city, "temperature": 26, "condition": "晴", "unit": unit}

messages = [{"role": "user", "content": "北京现在天气怎么样？适合出门吗？"}]

# ② 第一次调用：模型决定是否调工具
resp = client.chat.completions.create(
    model="gpt-4o-mini", messages=messages, tools=tools
)
msg = resp.choices[0].message

# ③ 解析并执行
if msg.tool_calls:
    messages.append(msg)
    for call in msg.tool_calls:
        args = json.loads(call.function.arguments)
        result = get_weather(**args)
        # ④ 结果回传
        messages.append({
            "role": "tool",
            "tool_call_id": call.id,
            "content": json.dumps(result, ensure_ascii=False),
        })

    final = client.chat.completions.create(model="gpt-4o-mini", messages=messages)
    print(final.choices[0].message.content)
    # 输出示例：北京现在晴，26°C，天气不错，适合出门。
```

## 写好 Schema 的技巧

> [!tip] description 就是给模型的 Prompt
> - 函数和参数的 `description` 写清楚，模型选函数、填参数全靠它。
> - 参数加 `enum` 约束取值，减少乱填。
> - 必填参数写进 `required`，可选参数给默认值。
> - 函数命名用动词开头（`search_docs`、`send_email`），语义更清晰。

## 与 MCP 的区别

| 维度 | Function Calling | [[MCP模型上下文协议]] |
| --- | --- | --- |
| 本质 | 单次 API 调用中声明工具的能力 | 一套标准化的工具**接入协议** |
| 工具定义位置 | 每个应用自己在代码里写 schema | 由独立的 MCP Server 统一提供 |
| 复用性 | 各应用重复造轮子 | 一次开发，所有支持 MCP 的客户端通用 |
| 关系 | 底层机制 | 可基于 Function Calling 之上的生态层 |

简单说：Function Calling 是"怎么让模型调一个函数"，MCP 是"怎么让整个行业的工具即插即用"。两者不冲突，实战见 [[MCP协议实战]] 和 [[工具调用实战]]。

## 相关笔记

- [[Agent智能体]]
- [[MCP模型上下文协议]]
- [[工具调用实战]]
- [[Prompt与提示词工程]]
