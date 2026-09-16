---
tags: [小白课堂, 全栈]
created: 2026-08-10
---

# 小白课：全栈 FastAPI 后端（在你电脑上开家小店）

上一课：[[小白课-全栈JavaScript动起来]]

> [!note] 这节课学什么
> 前三节课做的网页都靠**双击打开**，是"本地文件"。这节课用你会的 Python，在电脑上开一个**真正的后端服务**：浏览器输入 `localhost:8000` 就能访问。
> 按 5 步走：装 FastAPI → 20 行写出返回 JSON 的 API → `uvicorn` 点火开店 → 浏览器看自动文档 `/docs` → 报错救援。
> 这节课回到你熟悉的 Python 主场（代码已用 `fastapi.testclient` 真实运行验证，放心照抄）。

---

## 第 0 步：后端是个啥

大白话：**后端就是你电脑上开的一家小店**。

- 浏览器是**顾客**，通过网址上门（这叫"发请求"）
- 你的 Python 程序是**店员**，照单做菜（处理逻辑）
- 端出去的菜是 **JSON**（一种"键: 值"的数据格式，长得像 Python 字典）

`localhost:8000` 就是小店的**门牌号**：`localhost` = 我这台电脑，`8000` = 几号窗口（端口）。详见 [[小白课-前端与后端]] 和 [[API接口]]。

## 第 1 步：安装 FastAPI 和 uvicorn

打开终端（`Win + R` → 输入 `cmd` → 回车），整段复制这行命令，回车：

```bash
pip install fastapi uvicorn
```

✅ 看到这个就对了：一堆下载进度条，最后一行是 `Successfully installed ...`。

- `fastapi`：开店框架，几行代码就能写出一个 API
- `uvicorn`：店门口的"发动机"，负责接待顾客（监听端口、收发请求）

> [!warning] 报错：'pip' 不是内部或外部命令
> 换这条命令试试：
> ```bash
> py -m pip install fastapi uvicorn
> ```

## 第 2 步：20 行写出你的 API

新建 `main.py`，整段复制（**已验证**：下面三个路由都用 `fastapi.testclient` 实际请求过，全部返回 200 和正确 JSON）：

```python
from fastapi import FastAPI

app = FastAPI()

# 小店的第一道菜：访问 / 就返回一句话
@app.get("/")
def home():
    return {"message": "你好，这是我的第一个 API！"}

# 第二道菜：访问 /hello/你的名字，它会叫出你的名字
@app.get("/hello/{name}")
def hello(name: str):
    return {"message": f"你好，{name}！欢迎来到我的小店"}

# 第三道菜：访问 /add?a=1&b=2，帮你做加法
@app.get("/add")
def add(a: int, b: int):
    return {"a": a, "b": b, "result": a + b}
```

拆开看（都是你认识的 Python）：

- `app = FastAPI()` —— 把店盘下来
- `@app.get("/")` —— **装饰器**，意思是"顾客访问 `/` 这个地址时，就喊下面这个函数干活"
- `return {"message": ...}` —— 返回一个字典，FastAPI **自动把它变成 JSON** 端出去
- `{name}` —— 网址里的占位符，顾客访问 `/hello/小明`，`name` 就是 `"小明"`
- `a: int, b: int` —— 访问 `/add?a=1&b=2` 时自动接住的参数，还会帮你转成整数

## 第 3 步：点火开店

终端里、`main.py` 所在的文件夹下，运行：

```bash
uvicorn main:app --reload
```

✅ 看到这个就对了：终端里出现 `Uvicorn running on http://127.0.0.1:8000`，并且**光标停住不动了**——这是对的！店开着呢，别关这个窗口。

- `main:app` —— "用 `main.py` 里那个叫 `app` 的店"
- `--reload` —— 你改代码保存后**自动重启**，不用手动关火再点火

## 第 4 步：浏览器上门 + 自动文档 /docs

店开着，浏览器就是顾客。逐个访问试试：

1. 浏览器打开 `http://localhost:8000`
   ✅ 看到 `{"message":"你好，这是我的第一个 API！"}` 就对了
2. 打开 `http://localhost:8000/hello/小明`
   ✅ 看到它叫出"小明"就对了（换成你的名字试试）
3. 打开 `http://localhost:8000/add?a=1&b=2`
   ✅ 看到 `"result":3` 就对了
4. **重点**：打开 `http://localhost:8000/docs`
   ✅ 看到一整页漂亮的**自动文档**就对了——三道菜全列在上面，能点开、能直接在页面试着调用

`/docs` 是 FastAPI 白送的：你写代码，它自动生成交互式文档。这就是后端程序员平时调试 API 的地方。

想关店：回终端按 `Ctrl + C`。

## 第 5 步：报错救援表

| 报错 | 意思 | 解法 |
| --- | --- | --- |
| `ModuleNotFoundError: No module named 'fastapi'` | 库没装上 | 回第 1 步重装；不行就 `py -m pip install fastapi uvicorn` |
| `'uvicorn' 不是内部或外部命令` | 没装上或没进 PATH | `py -m uvicorn main:app --reload` |
| `Error: [WinError 10048]` / address already in use | 8000 窗口被占了 | 之前开的店没关（找到那个终端 `Ctrl + C`），或换窗口 `uvicorn main:app --reload --port 8001` |
| 浏览器打不开 localhost:8000 | 店没开起来 | 看终端是不是卡在某行红字报错；确认终端窗口还开着 |
| 改了代码没变化 | 没加 `--reload` 或没保存 | 命令里带 `--reload`；`Ctrl + S` 保存 |

更多排查套路见 [[新手报错速查]]。

## 最关键的一句

> [!important]
> **后端 = 你电脑上开的小店：`@app.get("/地址")` 是菜单，函数返回的字典自动变 JSON，`uvicorn main:app --reload` 点火，`localhost:8000` 是门牌号，`/docs` 白送自动文档。**

## 大白话翻译表

| 术语 | 大白话 |
| --- | --- |
| 后端 | 电脑上开的小店，详见 [[小白课-前端与后端]] |
| API | 小店的菜单，详见 [[API接口]] |
| FastAPI | 开店框架，详见 [[FastAPI后端实战]] |
| uvicorn | 店门口的发动机（服务器） |
| `localhost:8000` | 门牌号：我这台电脑的 8000 号窗口 |
| JSON | 端出去的菜，长得像 Python 字典 |
| `/docs` | 白送的自动菜单 + 试吃窗口 |
| `--reload` | 改菜保存后自动重启 |

## 检查一下

1. `@app.get("/hello/{name}")` 这行装饰器是什么意思？
2. 函数 `return` 一个 Python 字典，浏览器收到的是什么？
3. 终端运行 `uvicorn main:app --reload` 后光标停住不动，是卡死了吗？
4. 想看看自己的 API 长什么样、顺手试一下，访问哪个地址？

<details>
<summary>点我看答案</summary>

1. "顾客用 GET 方式访问 `/hello/xxx` 时，喊下面的函数干活，`xxx` 会装进 `name` 参数"。
2. JSON——FastAPI 自动把字典转成 JSON 返回。
3. 不是，这是正常的——店开着等待顾客呢，别关窗口；想关店按 `Ctrl + C`。
4. `http://localhost:8000/docs`，FastAPI 自动生成的交互式文档。
</details>

下一课：[[小白课-全栈前后端合体]]

## 相关笔记

- [[小白课-前端与后端]]
- [[API接口]]
- [[FastAPI后端实战]]
- [[全栈开发]]
- [[新手报错速查]]
- [[全栈学习路线]]
