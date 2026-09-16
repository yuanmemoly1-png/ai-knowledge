---
tags: [小白课堂, AI实战]
created: 2026-08-10
---

# 小白课：实战 API 第一课（从零调通大模型）

上一课：[[小白课-进阶读代码实战]]

> [!note] 这节课学什么
> 以前你都是在网页里跟 AI 聊天。这节课让你的 **Python 代码直接跟 AI 说话**——这就是"调 API"。
> 按 5 步走：注册拿钥匙 → 装库 → 钥匙存进 `.env` → 10 行代码问出第一句"你好" → 报错救援。
> 这节课需要联网，跟着做完你会亲手调出第一个 AI 回答。

---

## 第 1 步：注册，拿到你的钥匙（API Key）

以 DeepSeek 为例（便宜、好用、兼容 openai 库）：

1. 浏览器打开 `platform.deepseek.com`
2. 用手机号注册并登录
3. 点左侧菜单的 **API Keys**
4. 点 **创建 API key**，随便起个名字（比如 `my-first-key`）
5. 屏幕上弹出一串 `sk-xxxxxxxx...`，**马上复制下来**——它只显示这一次！

✅ 看到这个就对了：API Keys 列表里多了一行你刚创建的 key。

几个常识先知道：

- DeepSeek **兼容 openai 库**，所以装 `openai` 就能用它
- 它**按 token 计费**（token 是什么见 [[小白课-Token与计费]]），新用户有赠送额度，够你学很久
- 备选：智谱 `bigmodel.cn` 有**免费模型**（glm-4-flash），不想充钱可以用它，代码几乎一样

> [!warning] Key = 密码！
> 别把 key 发群里、截图发圈、提交到 Git。谁拿到谁就能花你的钱。万一泄露：回 API Keys 页面**删掉重建**一个就行。

## 第 2 步：安装两个库

打开终端（`Win + R` → 输入 `cmd` → 回车），整段复制这行命令，回车：

```bash
pip install openai python-dotenv
```

✅ 看到这个就对了：一堆下载进度条，最后一行是 `Successfully installed ...`。

- `openai`：跟 AI 说话的工具包
- `python-dotenv`：帮程序读 `.env` 文件里的钥匙

> [!warning] 报错：'pip' 不是内部或外部命令
> 说明 Python 没加进 PATH。换这条命令试试：
> ```bash
> py -m pip install openai python-dotenv
> ```
> 还不行就去翻 [[环境搭建与包管理]] 和 [[零基础防卡指南]]。

## 第 3 步：把钥匙存进 .env 文件

在你的代码文件夹里，新建一个文件，**文件名就叫 `.env`**（对，没有名字没有后缀，就一个点加 env）。里面写一行：

```text
DEEPSEEK_API_KEY=sk-这里粘贴你刚才复制的key
```

用记事本保存时注意：**保存类型选"所有文件"**，文件名输入 `.env`，不然会偷偷变成 `.env.txt`。

> [!warning] 为什么 key 不写进代码里？
> 代码以后会发给别人、传到 Git。key 写在代码里 = 把银行卡密码贴在朋友圈。`.env` 是锁在抽屉里的纸条，程序自己打开读，别人看不到。

## 第 4 步：最小调用——10 行代码

新建 `hello_ai.py`，整段复制（**需替换你的 Key 到 .env 后运行**）：

```python
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()  # 打开 .env，读出钥匙
client = OpenAI(
    api_key=os.getenv("DEEPSEEK_API_KEY"),
    base_url="https://api.deepseek.com",
)

response = client.chat.completions.create(
    model="deepseek-chat",
    messages=[{"role": "user", "content": "你好！用一句话介绍你自己"}],
)
print(response.choices[0].message.content)
```

终端里运行 `python hello_ai.py`。

✅ 看到这个就对了：一句 AI 的自我介绍，比如"你好！我是 DeepSeek，你的 AI 助手。"（每次回答可能不一样）。

拆开看：

1. `load_dotenv()` —— 把 `.env` 里的钥匙读进程序
2. `OpenAI(...)` —— 拿着钥匙和地址（`base_url`），造一个"通讯员" `client`
3. `client.chat.completions.create(...)` —— 把问题发出去；`messages` 装着你说的话（下节课细讲）
4. `response.choices[0].message.content` —— 这一长串是固定路径，意思是"回答里的文字"，**照抄就行**

## 第 5 步：报错救援表

| 报错                                              | 意思          | 解法                                                        |
| ----------------------------------------------- | ----------- | --------------------------------------------------------- |
| `ModuleNotFoundError: No module named 'openai'` | 库没装上        | 回第 2 步重装；装了还不行就换 `py -m pip install openai python-dotenv` |
| `401 AuthenticationError`                       | 钥匙错了        | 检查 `.env` 里 key 有没有多空格、多引号；回平台重新复制                        |
| `402 Insufficient Balance`                      | 余额不足        | 去平台充值几块钱，或换智谱免费模型                                         |
| 超时 / `APIConnectionError`                       | 网络问题        | 检查能不能打开 platform.deepseek.com，稍等重试                        |
| key 读出来是 `None`                                 | `.env` 没被读到 | 检查文件名是不是变成了 `.env.txt`（在文件夹"查看"里勾选"文件扩展名"再看）              |

更多报错套路见 [[新手报错速查]]。

## 最关键的一句

> [!important]
> **API 就是"代码打电话叫 AI 干活"：钥匙存 `.env`，`client` 拿钥匙，`messages` 装问题，回答在 `response.choices[0].message.content` 里。**

## 大白话翻译表

| 术语 | 大白话 |
| --- | --- |
| API | 代码跟 AI 说话的窗口，详见 [[小白课-API服务员]] |
| API Key | 钥匙 / 密码，证明"是你"在调用 |
| `base_url` | AI 公司的门牌地址 |
| token 计费 | 按字数收费，说得越多花得越多 |
| `.env` | 锁钥匙的抽屉，程序自己读 |
| `client` | 通讯员，帮你收发消息 |
| `model` | 点哪个模型干活，如 `deepseek-chat` |

## 检查一下

1. API Key 应该写在哪里？为什么不能直接写在代码里？
2. 运行时报 `ModuleNotFoundError: No module named 'openai'`，怎么办？
3. `response.choices[0].message.content` 这一长串取到的是什么？
4. 报 `401` 错误，最可能是什么原因？

<details>
<summary>点我看答案</summary>

1. 写在 `.env` 文件里，用 `load_dotenv()` 读。代码会外传、会传 Git，key 写进去等于公开密码。
2. 库没装好，重新运行 `pip install openai python-dotenv`（不行就换 `py -m pip install ...`）。
3. AI 回答的**文字内容**。
4. Key 错了——复制时多了空格、少了字符，或 `.env` 没保存成功。
</details>

下一课：[[小白课-实战messages三角色]]

## 相关笔记

- [[小白课-API服务员]]
- [[小白课-Token与计费]]
- [[名词速查表]]
- [[环境搭建与包管理]]
- [[新手报错速查]]
- [[面向AI开发的Python]]
