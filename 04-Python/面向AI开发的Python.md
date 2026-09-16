---
tags: [Python, AI开发, 实战]
created: 2026-08-02
---

# 面向 AI 开发的 Python

> [!note] 本笔记的定位
> 这是 Python 模块与 Agent 模块的衔接点：[[Agent开发总览]]、[[工具调用实战]]、[[MCP协议实战]] 里的每一段代码，基本功都来自本笔记。所有示例都是 AI 开发中「第二天就会用到」的写法。

## 1. requests / httpx 调 API

```python
# pip install requests
import requests

# GET 请求：获取数据
resp = requests.get("https://api.github.com/repos/langchain-ai/langchain")
data = resp.json()                    # 响应 JSON → dict
print(data["stargazers_count"])       # star 数

# POST 请求：提交数据（调 LLM API 的本质就是 POST）
resp = requests.post(
    "https://api.example.com/v1/chat",
    headers={"Authorization": "Bearer sk-xxx"},
    json={"model": "gpt-4o", "messages": [{"role": "user", "content": "hi"}]},
    timeout=30,                        # 永远设超时，防止程序卡死
)
resp.raise_for_status()                # 非 2xx 状态码直接抛异常
print(resp.json())
```

`httpx` 是更现代的选择：API 与 requests 几乎相同，但原生支持 async（第 5 节用）和 HTTP/2。新项目建议直接用 httpx。

## 2. openai SDK 完整调用示例

openai SDK 已成为事实标准——DeepSeek、Kimi、通义等国产模型大多提供 OpenAI 兼容接口，换个 `base_url` 就能用。

```python
# pip install openai
from openai import OpenAI

client = OpenAI(
    api_key="sk-xxx",                              # 实际从 .env 读，见第 3 节
    base_url="https://api.deepseek.com",           # 换厂商只改这里
)

resp = client.chat.completions.create(
    model="deepseek-chat",
    messages=[
        {"role": "system", "content": "你是一个简洁的助手"},
        {"role": "user", "content": "用一句话解释什么是 RAG"},
    ],
    temperature=0.7,
)

print(resp.choices[0].message.content)     # 模型回复文本
print(resp.usage.total_tokens)             # 消耗的 token 数
```

> [!tip] 流式输出（打字机效果）
> 加 `stream=True` 后逐块读取：
> ```python
> stream = client.chat.completions.create(
>     model="deepseek-chat",
>     messages=[{"role": "user", "content": "讲个故事"}],
>     stream=True,
> )
> for chunk in stream:
>     if chunk.choices[0].delta.content:
>         print(chunk.choices[0].delta.content, end="", flush=True)
> ```

## 3. python-dotenv 管理 API Key

> [!warning] 红线：API Key 永远不要写死在代码里
> 硬编码的 Key 一旦提交到 GitHub，几分钟内就会被扫描盗用，产生天价账单。正确做法：放 `.env` 文件，并把 `.env` 加进 `.gitignore`。

```bash
pip install python-dotenv
```

```text
# .env 文件内容（与代码同目录）
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxx
OPENAI_API_KEY=sk-yyyyyyyyyyyy
```

```python
import os
from dotenv import load_dotenv

load_dotenv()                          # 读取 .env 到环境变量
api_key = os.getenv("DEEPSEEK_API_KEY")

if not api_key:
    raise ValueError("未找到 DEEPSEEK_API_KEY，请检查 .env 文件")

client = OpenAI(api_key=api_key, base_url="https://api.deepseek.com")
```

```gitignore
# .gitignore 必须有这一行
.env
```

## 4. pydantic 做结构化输出

让模型返回严格符合格式的 JSON，是 [[FunctionCalling函数调用]] 和 Agent 开发的基础。`pydantic` 负责定义结构并校验。

```python
# pip install pydantic
from pydantic import BaseModel, Field

class BookReview(BaseModel):
    title: str = Field(description="书名")
    rating: int = Field(ge=1, le=5, description="评分 1-5")
    tags: list[str] = Field(description="关键词标签")
    summary: str = Field(description="50字内简评")

# 方式一：用 SDK 的结构化输出能力（推荐，模型保证返回合法 JSON）
completion = client.beta.chat.completions.parse(
    model="gpt-4o",
    messages=[{"role": "user", "content": "点评一下《三体》"}],
    response_format=BookReview,
)
review = completion.choices[0].message.parsed
print(review.rating, review.tags)      # 直接当对象用，有类型提示

# 方式二：手动校验任意 JSON 字符串（处理不规范输出时用）
raw = '{"title": "三体", "rating": 5, "tags": ["科幻"], "summary": "震撼"}'
review2 = BookReview.model_validate_json(raw)   # 不合格会抛 ValidationError
```

> [!example] 为什么这很重要
> Agent 拿到 `BookReview` 对象后可以安全地写进数据库、做分支判断（如 `if review.rating >= 4`），而不是用脆弱的字符串匹配去解析模型输出。

## 5. asyncio 并发请求

批量处理 100 条数据时，串行要 100 × 2秒，并发只要几秒。

```python
# pip install httpx
import asyncio
import time

import httpx

async def ask(client, question, sem):
    async with sem:                            # 信号量限流，最多同时 5 个
        resp = await client.post(
            "https://api.deepseek.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}"},
            json={
                "model": "deepseek-chat",
                "messages": [{"role": "user", "content": question}],
            },
            timeout=60,
        )
        return resp.json()["choices"][0]["message"]["content"]

async def main():
    questions = [f"用一句话解释概念{i}" for i in range(10)]
    sem = asyncio.Semaphore(5)
    async with httpx.AsyncClient() as client:
        tasks = [ask(client, q, sem) for q in questions]
        answers = await asyncio.gather(*tasks)   # 并发执行，结果按顺序返回
    return answers

start = time.time()
results = asyncio.run(main())
print(f"10 个请求耗时 {time.time() - start:.1f} 秒")
```

> [!tip] 关键概念一句话
> `async def` 定义协程，`await` 让出等待（此时别人可以跑），`asyncio.gather` 并发调度，`Semaphore` 防止并发过高被 API 限流。

## 6. FastAPI 起服务最小示例

把模型能力包装成 HTTP 接口，前端/小程序/其他 Agent 就能调用（对接 [[用AI开发App全流程]]）。

```python
# pip install fastapi uvicorn
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class ChatRequest(BaseModel):
    question: str

class ChatResponse(BaseModel):
    answer: str

@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    resp = client.chat.completions.create(
        model="deepseek-chat",
        messages=[{"role": "user", "content": req.question}],
    )
    return ChatResponse(answer=resp.choices[0].message.content)

# 启动命令：uvicorn main:app --reload
# 浏览器打开 http://127.0.0.1:8000/docs 有自动生成的调试页面
```

用 curl 或其他脚本调用：

```bash
curl -X POST http://127.0.0.1:8000/chat \
  -H "Content-Type: application/json" \
  -d "{\"question\": \"什么是 Agent?\"}"
```

## 学习检验清单

- [ ] 能用 dotenv 读取 Key 并完成一次 openai SDK 调用
- [ ] 能定义一个 pydantic 模型并让模型按它输出
- [ ] 能用 asyncio + Semaphore 并发跑 10 个请求
- [ ] 能用 FastAPI 暴露一个 `/chat` 接口

全部打勾后，直接开始 [[Agent开发总览]]。

## 相关笔记

- [[Agent开发总览]]
- [[工具调用实战]]
- [[FunctionCalling函数调用]]
- [[用AI开发App全流程]]
