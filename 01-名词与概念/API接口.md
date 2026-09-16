---
tags: [名词解释, API, 后端]
created: 2026-08-02
---

# API 接口

## API 是什么

**API（Application Programming Interface，应用程序编程接口）** 是程序与程序之间约定好的"对讲窗口"：一方按固定格式发请求，另一方按固定格式返回结果。

经典比喻：**餐厅服务员**。你（客户端）不需要进厨房，只要按菜单点菜（发请求），服务员（API）把需求传给厨房（服务器/服务方），再把菜端给你（返回响应）。你全程不用关心菜怎么做的。

## REST 风格

互联网服务最主流的 API 设计风格是 **REST（RESTful API）**，核心思想很简单：

- 每种资源对应一个**网址（Endpoint）**，如 `https://api.example.com/users/42`。
- 用 HTTP **请求方法**表达"你想对这个资源做什么"。

## 常用请求方法

| 方法 | 含义 | 生活类比 |
| --- | --- | --- |
| GET | 读取数据 | 问服务员"今天的菜单是什么" |
| POST | 新建/提交数据 | 点菜下单 |
| PUT/PATCH | 修改数据 | 跟服务员说"那道菜少放辣" |
| DELETE | 删除数据 | 退掉一道菜 |

## 状态码速查

服务器每次响应都会带一个三位数**状态码（Status Code）**，告诉你这次请求的结果：

| 状态码 | 含义 | 什么时候会遇到 |
| --- | --- | --- |
| 200 | 成功 | 一切正常 |
| 201 | 创建成功 | POST 新建资源成功 |
| 400 | 请求格式错误 | 参数缺了或格式不对 |
| 401 | 未认证 | API Key 没填或填错 |
| 403 | 无权限 | 认证了但没权限访问 |
| 404 | 资源不存在 | 网址打错了 |
| 429 | 请求太频繁 | 触发限流，调 LLM API 时常见 |
| 500 | 服务器内部错误 | 对方服务挂了，不是你的锅 |

> [!tip] 排查口诀
> 4xx 基本是**你的请求有问题**（检查参数和 Key），5xx 是**对方服务器有问题**（等等重试）。调 LLM API 遇到 429，说明请求太密，放慢节奏或升级套餐。

## 动手：用 Python requests 调用公开 API

```bash
pip install requests
```

```python
import requests

# 调用一个公开的天气 API（Open-Meteo，免费无需 Key）
url = "https://api.open-meteo.com/v1/forecast"
params = {
    "latitude": 39.9,      # 北京纬度
    "longitude": 116.4,    # 北京经度
    "current_weather": True,
}

response = requests.get(url, params=params)   # 发 GET 请求
print("状态码：", response.status_code)        # 200 表示成功

data = response.json()                        # 把响应解析成 Python 字典
weather = data["current_weather"]
print(f"北京当前温度：{weather['temperature']}°C，风速：{weather['windspeed']} km/h")
```

POST 请求（提交数据）长这样：

```python
response = requests.post(
    "https://api.example.com/notes",
    json={"title": "第一条笔记", "content": "Hello API"},
    headers={"Authorization": "Bearer 你的API_Key"},  # 认证信息放请求头
)
```

## OpenAI API 也是 API

你调 GPT 用的 `openai` 库，本质就是对 **OpenAI 的 REST API** 的封装（见 [[SDK框架与库]]）。理解这一点，就能看懂它的文档在说什么：

```
POST https://api.openai.com/v1/chat/completions
请求头：Authorization: Bearer sk-xxxx
请求体：{"model": "gpt-4o-mini", "messages": [{"role": "user", "content": "你好"}]}
响应：  {"choices": [{"message": {"content": "你好！..."}}], ...}
```

> [!note] 为什么这对 AI 开发很重要
> - 你的应用和 [[LLM大语言模型]] 之间靠 API 通信；[[FunctionCalling函数调用]] 本质是让模型帮你生成"调用哪个 API、传什么参数"的结构化指令。
> - 你会**调用别人的 API**（天气、地图、支付），也会**用 FastAPI 给别人提供 API**（见 [[前端与后端]]）。
> - 模型能调用的 API 越来越多，[[MCP模型上下文协议]] 正在统一这层连接方式。

> [!warning] 常见坑
> - **API Key 泄露**：Key 等于账号密码，写死在代码里传到 GitHub 会被盗刷，务必用环境变量 + .gitignore，见 [[Git与版本控制]]。
> - **不看状态码就解析数据**：先判断 `response.status_code == 200` 再取数据，否则报错信息看不懂。
> - **忽略速率限制**：循环里疯狂调 API 会触发 429，加 `time.sleep()` 或做指数退避重试。

## 相关笔记

- [[前端与后端]]
- [[SDK框架与库]]
- [[FunctionCalling函数调用]]
- [[面向AI开发的Python]]
