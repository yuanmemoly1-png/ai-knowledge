---
tags: [名词解释, SDK, 框架, 库]
created: 2026-08-02
---

# SDK、框架与库

## 三个容易混淆的概念

学编程最先听到的三个词：**库（Library）、框架（Framework）、SDK（Software Development Kit，软件开发工具包）**。它们都是"别人写好、你拿来用的代码"，区别在于**谁调用谁、打包了多少东西**。

## 三者区别对比表

| 概念 | 比喻 | 谁控制流程 | 包含什么 | 典型例子 |
| --- | --- | --- | --- | --- |
| 库 Library | **工具箱** | 你调用它，随时拿起放下 | 一组功能函数/类 | requests、NumPy |
| 框架 Framework | **流水线** | 它调用你，你按它的规矩填空 | 一整套开发骨架和约定 | FastAPI、React |
| SDK | **全家桶** | 你用它接入某家服务 | 库 + 文档 + 示例 + 调试工具 | openai、boto3（AWS） |

一句话总结：

- **库**：你的程序是主角，缺什么功能就"从工具箱里拿一件"——`requests.get(url)` 就是拿起了发 HTTP 请求这把锤子。
- **框架**：框架是主角，它定好流程（比如"请求进来 → 路由 → 你写的函数 → 返回"），你只负责**在规定位置填自己的代码**。
- **SDK**：某公司为了让你方便用它的服务，把"调用库 + 认证 + 文档 + 示例"打包好给你。`openai` 库就是 OpenAI 公司的 Python SDK。

> [!note] 控制反转（IoC）
> 库和框架最本质的区别叫**控制反转**：用库时**你调用它**；用框架时**它调用你**（回调你写的函数）。所以框架学习曲线更陡——你得先学它的"规矩"。

## 举例对照（Python 世界）

```python
# ① 库：requests —— 你主动调用它
import requests
resp = requests.get("https://api.example.com/data")   # 想用就用，不用就放着

# ② 框架：FastAPI —— 你把函数注册给它，它来决定何时调用
from fastapi import FastAPI
app = FastAPI()

@app.get("/hello")        # 你只管写函数，请求什么时候来、怎么解析，框架全包了
def hello():
    return {"msg": "hi"}

# ③ SDK：openai —— 官方打包好的"接入 OpenAI 全家桶"
from openai import OpenAI
client = OpenAI()          # 自动处理认证、请求格式、错误重试
resp = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "你好"}],
)
print(resp.choices[0].message.content)
```

> [!tip] 关系并不互斥
> - SDK 在技术上**就是一个（或一组）库**，只是多带了文档和官方支持。
> - 框架内部也大量**使用库**（FastAPI 底层用了 Starlette 和 Pydantic）。
> - 所以别人说"openai 库""openai SDK"指的都是同一个东西，不必纠结。

## 为什么这对 AI 开发很重要

1. **看懂教程在说什么**：教程说"装一下 openai SDK""用 LangChain 框架"，你现在知道前者是全家桶、后者是给你定好 Agent 流程的骨架。
2. **做出正确选型**：只想发个请求？装个库就够了，别上框架。要搭完整 Web 服务？直接上框架，别从零拼库。
3. **理解依赖关系**：`pip install` 装的就是库和框架；版本冲突、依赖地狱都发生在这层，见 [[面向AI开发的Python]] 的包管理部分。

> [!warning] 常见误区
> - **框架越大越好**：个人项目用 FastAPI 就够了，不必上 Django 这种"航母级"框架。
> - **重复造轮子**：发 HTTP 请求自己拼 socket、调 LLM 自己拼请求体——有现成库和 SDK 就用，把时间花在业务逻辑上。
> - **混淆框架和语言**："我会 FastAPI"不等于"我会 Python"，框架只是语言之上的工具。

> [!tip] 怎么判断一个库/框架靠不靠谱
> - **看更新频率**：GitHub 上最近还有 commit 和 release，说明有人维护。
> - **看使用量**：star 数、下载量高的项目，踩坑时更容易搜到答案。
> - **看文档**：有完整文档和示例的项目，学习成本天差地别。
> - AI 编程工具（见 [[AI编程工具对比]]）对小众冷门库经常"一本正经地编 API"，用主流库生成的代码质量明显更高。

## 相关笔记

- [[API接口]]
- [[前端与后端]]
- [[面向AI开发的Python]]
- [[Agent开发总览]]
