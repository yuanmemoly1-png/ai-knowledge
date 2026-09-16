---
tags: [小白课堂, Python进阶]
created: 2026-08-07
---

# 小白课：进阶参数与 lambda（慢速版）

上一课：[[小白课-进阶解包与遍历]]

> [!note] 这节课学什么
> 读 AI 写的代码，函数那一行经常长这样：`def run(*args, **kwargs):` 或者 `sorted(data, key=lambda x: x["score"])`。这节课就拆解这两类"怪写法"：
> - `*args` / `**kwargs`：函数说"给多少参数我都接"
> - `lambda`：一句话写完的迷你函数
>
> 达标线：**见到认识、知道它在干嘛**。不要求你会设计这种函数。

---

## 第一部分：`*args` 和 `**kwargs`（见到认识即可）

### 第 1 步：`*args`——"位置参数，来多少接多少"

普通函数的参数个数是定死的。加了 `*args`，调用时传几个都行：

```python
def add_all(*args):
    print(args)        # 看看 args 到底长什么样
    return sum(args)

print(add_all(1, 2, 3))
```

输出：

```text
(1, 2, 3)
6
```

`args` 把所有传进来的数**收成一个"一排东西"**（元组，可以理解成不能改的列表）。读法：**"这个函数把收到的所有位置参数装进 args"**。

### 第 2 步：`**kwargs`——"带名字的参数，来多少接多少"

两颗星收的是 `名字=值` 这种写法，收成一个**字典**：

```python
def show_info(**kwargs):
    print(kwargs)

show_info(name="小明", age=18)
```

输出：

```text
{'name': '小明', 'age': 18}
```

看，收进来的东西变成了字典：`name` 是键、`"小明"` 是值。

> [!important] 一句话记住
> **`*args` 收"一堆没名字的"（成列表样），`**kwargs` 收"一堆带名字的"（成字典）**。名字 args / kwargs 只是惯例，星号才是关键。看到函数定义里带星号，读成"这函数参数数量不固定"就够了。

---

## 第二部分：lambda——一句话函数

### 第 1 步：对比着看

普通函数，两行起步：

```python
def double(x):
    return x * 2
```

lambda 一句话写完，效果一样：

```python
double = lambda x: x * 2
print(double(5))
```

输出：

```text
10
```

拆开读：`lambda x: x * 2` = "**收一个 x，还给你 x * 2**"。冒号前是参数，冒号后是返回什么。它没有名字、没有 `return`，就一行——所以叫"一句话函数"。

### 第 2 步：什么时候会见到它？

当一个函数**只用一次、又短得可怜**，专门写 `def` 太隆重，就随手用 lambda。最典型的场景就是下面的排序。

## 第三部分：实战——按分数排序

假设 AI 给你一份学生数据（列表里装字典，AI 代码里最最常见的结构）：

```python
data = [
    {"name": "小明", "score": 72},
    {"name": "小红", "score": 95},
    {"name": "小刚", "score": 60},
]
```

想按分数从低到高排：

```python
result = sorted(data, key=lambda x: x["score"])

for row in result:
    print(row["name"], row["score"])
```

输出：

```text
小刚 60
小明 72
小红 95
```

逐词拆 `sorted(data, key=lambda x: x["score"])`：

- `sorted(data, ...)`：把 data 排个序，返回新列表
- `key=...`：按什么排？这里要给它一个"规则函数"
- `lambda x: x["score"]`：规则是——"拿到每一行 x，就取它的 `score` 来比"

合起来：**"给 data 排序，排序时按每行的 score 比大小"**。想从高到低，加一个 `reverse=True`：

```python
result2 = sorted(data, key=lambda x: x["score"], reverse=True)

for row in result2:
    print(row["name"], row["score"])
```

输出：

```text
小红 95
小明 72
小刚 60
```

这个 `sorted(..., key=lambda ...)` 组合在 AI 写的代码里出现率极高，值得记熟它的长相。

## 最关键的一句

> [!important]
> **`*args` 收一堆无名参数、`**kwargs` 收一堆带名参数；`lambda x: 表达式` 是一句话函数，`sorted(data, key=lambda x: x["score"])` 读作"按 score 排序"。**

## 大白话翻译表

| 术语 | 大白话 |
| --- | --- |
| `*args` | 没名字的参数来多少接多少，收成一排 |
| `**kwargs` | 带名字的参数来多少接多少，收成字典 |
| `lambda x: ...` | 一句话迷你函数：收 x，还你冒号后的东西 |
| `sorted(列表, key=规则)` | 排序，`key` 告诉它"按什么比" |
| `reverse=True` | 反过来排（从大到小） |

## 检查一下

1. `def f(*args):` 里调用 `f(1, 2, 3)`，`args` 是什么？
2. `show(name="小明")` 传参进了 `def show(**kwargs):`，`kwargs` 长什么样？
3. `lambda x: x + 1` 用大白话怎么说？
4. `sorted(data, key=lambda x: x["age"])` 这行在干嘛？

<details>
<summary>点我看答案</summary>

1. `(1, 2, 3)`——所有位置参数收成的一排东西（元组）。
2. `{'name': '小明'}`，一个字典。
3. "收一个 x，还给你 x 加 1"。
4. 给 data 排序，比较时按每一行的 `age` 来比。
</details>

下一课：[[小白课-进阶类入门]]

## 相关笔记

- [[常用数据结构与函数]]
- [[基础语法速查]]
- [[语法格式卡]]
