---
tags: [Python, 必背清单, 速查]
created: 2026-08-10
---

# Python 必背清单（分层版：背什么、认什么）

> [!note] 背诵策略
> Python 不需要全背。按三层来：**第一层必须肌肉记忆**（默写零提示），**第二层会用会查**，**第三层见到认识就行**。配合 [[语法格式卡]]（查格式）和练习场默写（练手感）使用。
> 自测方法：盖住右栏，看左栏能说出作用和写法就打勾 ✅

## 第一层：必须肌肉记忆 ⭐

### 关键字（18 个，就是语法的骨架）

| 关键字 | 一句话 | 例子 |
| --- | --- | --- |
| `if / elif / else` | 选路 | `if age >= 18:` |
| `for / in` | 挨个来 | `for x in nums:` |
| `while` | 转到条件不成立 | `while n < 5:` |
| `def / return` | 打包口令 / 交出结果 | `def add(a, b): return a+b` |
| `import` | 导入工具包 | `import random` |
| `True / False / None` | 是 / 否 / 空 | `has_digit = False` |
| `and / or / not` | 并且 / 或者 / 取反 | `len(pwd)>=8 and has_digit` |
| `break / continue` | 跳出循环 / 跳过本圈 | `if cmd == "q": break` |
| `pass` | 占位（还没写） | `if x: pass` |

### 内置函数（12 个，天天用）

| 函数 | 干什么 | 例子 |
| --- | --- | --- |
| `print()` | 打印 | `print(f"{x} 个")` |
| `len()` | 数长度 | `len(nums)` |
| `type()` | 看类型 | `type(x)` |
| `int() / float() / str()` | 类型转换 | `int("42")` |
| `input()` | 收用户输入 | `name = input()` |
| `range()` | 造号码 | `range(5)` → 0~4 |
| `max() / min() / sum()` | 最大 / 最小 / 求和 | `max(nums)` |
| `sorted()` | 排序（返回新列表） | `sorted(nums, reverse=True)` |

### 字符串方法（6 个）

| 方法 | 干什么 | 例子 |
| --- | --- | --- |
| `split()` | 切 → 列表 | `"a,b".split(",")` |
| `join()` | 粘 → 字符串 | `",".join(parts)` |
| `replace()` | 换 | `s.replace("旧","新")` |
| `strip()` | 去首尾空白 | `"  hi ".strip()` |
| `lower() / upper()` | 变小写 / 大写 | `s.lower()` |
| `startswith() / endswith()` | 判断开头/结尾 | `s.startswith("http")` |

### 列表操作（6 个）

| 操作 | 干什么 | 例子 |
| --- | --- | --- |
| `lst[i]` | 按号码取（0 起，-1 最后） | `fruits[0]` |
| `append()` | 末尾加 | `fruits.append("桃")` |
| `remove()` | 按内容删 | `fruits.remove("桃")` |
| `in` | 在不在 | `"桃" in fruits` |
| `len(lst)` | 有几格 | `len(fruits)` |
| `lst[a:b]` | 切片 | `nums[1:3]` |

### 字典操作（6 个）

| 操作 | 干什么 | 例子 |
| --- | --- | --- |
| `d[key]` | 按名字取 | `scores["语文"]` |
| `d[key] = v` | 加或改（一体） | `scores["英语"] = 88` |
| `del d[key]` | 删一格 | `del scores["语文"]` |
| `key in d` | 有没有这格 | `"语文" in scores` |
| `d.items()` | 名字内容同时遍历 | `for k, v in d.items():` |
| `d.get(key, 默认)` | 安全取（没有给默认） | `d.get("物理", 0)` |

## 第二层：会用会查（抄格式卡即可）

- `enumerate(lst)` — 遍历时同时拿号码和内容
- `zip(a, b)` — 两个列表配对
- `try / except` — 容错：`try: 危险操作 except: 兜底`
- `with open(...) as f:` — 文件读写三件套（r/w/a）
- `f-string` 格式符 — `{x:.2f}` 保留两位小数
- 列表推导式 — `[x*2 for x in nums if x > 0]`
- `set()` — 去重

## 第三层：见到认识即可（不用会写）

- `*args / **kwargs` — 函数收任意参数
- `lambda` — 一句话小函数（常见于 `sorted(key=lambda ...)`）
- `@装饰器` — 给函数套壳
- `yield` — 生成器
- `class` 全家 — `__init__`、`self`

## 背诵节奏（2 周计划）

- [ ] 第 1-3 天：第一层关键字 18 个（每天 6 个，默写各写 1 个例子）
- [ ] 第 4-6 天：内置函数 12 个
- [ ] 第 7-8 天：字符串方法 6 个
- [ ] 第 9-10 天：列表操作 6 个
- [ ] 第 11-12 天：字典操作 6 个
- [ ] 第 13-14 天：混合自测——让 AI 随机抽 10 个考你
- [ ] 第二层：用到再查，不专门背

> [!tip] 考自己用这句咒语
> 「用费曼学习法考我 Python 必背清单的第一层：随机抽 10 个关键字/函数，我说作用和写法，你批改。」

## 相关笔记

- [[语法格式卡]]
- [[基础语法速查]]
- [[常用数据结构与函数]]
- [[新手报错速查]]
