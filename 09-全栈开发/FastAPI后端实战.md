---
tags: [全栈开发, FastAPI, 后端]
created: 2026-08-02
---

# FastAPI 后端实战

## FastAPI 是什么

**FastAPI** 是一个用 Python 写 Web 后端的**框架（Framework）**——按 [[SDK框架与库]] 里的分类，它帮你处理好了「接收 HTTP 请求 → 解析参数 → 调用你的函数 → 返回 JSON」这一整套流程，你只需要写业务函数。[[面向AI开发的Python]] 里已经见过它的基础用法，本篇把它深入到一个完整可运行的增删改查（CRUD）项目。

选它的理由：

- 语法就是普通 Python 函数 + 类型标注，0 基础友好
- 自带交互式 API 文档（`/docs`），不用装任何工具就能测接口
- 是 AI 应用后端的主流选择（LangChain 生态、各类大模型服务常用它）

## 安装与启动

```bash
# 先在虚拟环境里安装（环境配置见 [[环境搭建与包管理]]）
pip install fastapi uvicorn

# 启动服务（main.py 里的 app 对象，--reload 表示改代码自动重启）
uvicorn main:app --reload
```

启动后访问：

- `http://127.0.0.1:8000/docs` — 交互式文档，可以直接在网页上点按钮测试每个接口
- `http://127.0.0.1:8000/` — 你自己写的接口

## 路由与参数

```python
from fastapi import FastAPI

app = FastAPI()

# GET 请求，路径参数：/todos/3 里的 3 会被解析成 int
@app.get("/todos/{todo_id}")
def read_todo(todo_id: int):
    return {"todo_id": todo_id}

# 查询参数：/search?keyword=学习
@app.get("/search")
def search(keyword: str):
    return {"keyword": keyword, "results": []}
```

对照 [[API接口]] 里的概念：`@app.get` 声明的就是一个 HTTP 方法 + 路径，函数返回值会自动序列化成 JSON。

## 请求体：用 pydantic 模型校验数据

POST/PUT 请求的数据放在**请求体（Body）**里，用 pydantic 模型声明结构，FastAPI 会自动校验并转换类型——类型不对直接返回 422 错误，不用自己写校验逻辑：

```python
from pydantic import BaseModel

class TodoCreate(BaseModel):
    title: str                    # 必填
    done: bool = False            # 可选，默认 False

@app.post("/todos")
def create_todo(todo: TodoCreate):
    return {"收到": todo.title}
```

> [!tip] 类型标注是 FastAPI 的灵魂
> `todo_id: int`、`title: str` 这些标注不是装饰——FastAPI 靠它们做参数解析、校验和文档生成。写错类型（比如把字符串传给 `int`）会收到清晰的错误提示，这正是它比老框架省心的地方。

## 完整示例：内存版 Todo CRUD

保存为 `main.py`，运行 `uvicorn main:app --reload` 后打开 `http://127.0.0.1:8000/docs` 测试：

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Todo API")

# ---- 数据模型 ----
class TodoCreate(BaseModel):
    title: str
    done: bool = False

class Todo(TodoCreate):
    id: int

# ---- 内存数据库（重启即丢失，下一篇换 SQLite） ----
todos: list[Todo] = []
next_id = 1

# ---- 查询全部 ----
@app.get("/todos", response_model=list[Todo])
def list_todos():
    return todos

# ---- 新建 ----
@app.post("/todos", response_model=Todo, status_code=201)
def create_todo(item: TodoCreate):
    global next_id
    todo = Todo(id=next_id, **item.model_dump())
    next_id += 1
    todos.append(todo)
    return todo

# ---- 删除 ----
@app.delete("/todos/{todo_id}", status_code=204)
def delete_todo(todo_id: int):
    for i, todo in enumerate(todos):
        if todo.id == todo_id:
            todos.pop(i)
            return
    raise HTTPException(status_code=404, detail="待办不存在")
```

三个要点：

- `response_model=Todo` 告诉 FastAPI 返回值的结构，文档里会显示字段说明
- `status_code=201` 表示「创建成功」，`204` 表示「删除成功、无返回内容」，这些是 [[API接口]] 里的 HTTP 状态码约定
- `HTTPException` 是 FastAPI 抛业务错误的标准方式

## 让前端能调通：CORS 配置

浏览器默认禁止网页跨域调 API。你自己的前端（哪怕是本地 html 文件）调这个后端，需要加一段放行配置：

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # 学习阶段放行全部；上线时改成具体域名
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 下一步

这个例子数据存在内存里，重启就丢。[[全栈项目实战]] 会把它改成存 SQLite（见 [[数据库入门]]），并配上一个真正的前端页面。

> [!warning] 常见坑
> - `uvicorn main:app` 里的 `main` 是**文件名**（不带 .py），`app` 是**变量名**，改名要同步改命令。
> - 端口被占用时加 `--port 8001` 换一个。
> - 路径参数 `/todos/{todo_id}` 和固定路径 `/todos/me` 同时存在时，固定路径要写在前面，否则 `me` 会被当成 id 解析。

## 相关笔记

- [[面向AI开发的Python]]
- [[API接口]]
- [[全栈项目实战]]
- [[全栈学习路线]]
