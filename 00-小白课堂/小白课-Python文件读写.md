---
tags: [小白课堂, Python]
created: 2026-08-02
---

# 小白课：Python 文件读写（慢速版）

上一课：[[小白课-Python函数]]

> [!note] 这节课学什么
> 变量有个致命缺点：**程序一关，全没了**。想让数据"活下来"，就得存进文件。这节课学：
> - 三行固定模式：`with open(...)` 打开、干活、自动关
> - 三种模式：读 `r`、写 `w`、追加 `a`
> - 实战：读一个文件，统计有多少个单词
>
> 这节课的代码都真实跑过，你也可以在电脑里建个文本文件跟着试。

---

## 第 1 步：三行固定模式（先背下来）

往文件里写东西，就这三行：

```python
with open("日记.txt", "w", encoding="utf-8") as f:
    f.write("今天学了 Python。")
```

跑完没任何输出——去文件夹里看，多了一个 `日记.txt`，里面写着"今天学了 Python。"

逐行拆解：

1. `with open(...)` —— 打开文件，给它起个小名 `f`
2. `"w"` —— **w**rite，写模式（下面细讲）
3. `encoding="utf-8"` —— **固定搭配，照抄就行**，不写它中文会变乱码
4. `f.write(...)` —— 往文件里写内容

`with` 的好处：缩进块一结束，文件**自动关好**，不会忘。

## 第 2 步：读模式 r —— 把文件内容读进变量

```python
with open("日记.txt", "r", encoding="utf-8") as f:
    content = f.read()
print(content)
```

输出：

```text
今天学了 Python。
```

`f.read()` 把文件**整个读成一个大字符串**，装进 `content`。注意缩进块结束后再 `print(content)` 没问题——读出来的东西已经装进变量了。

## 第 3 步：写模式 w —— 小心，它会清空旧内容！

`w` 模式有个脾气：**打开的瞬间就把旧内容全删掉**。刚才文件里已经有"今天学了 Python。"，再用 `w` 写一句新的：

```python
with open("日记.txt", "w", encoding="utf-8") as f:
    f.write("第一行\n第二行\n第三行")
```

旧内容"今天学了 Python。"**没了**，被新内容整个替换。

> [!warning] w 模式会覆盖！
> 想"在旧的后面接着写"，千万别用 `w`——那是下一步 `a` 的活。用错模式把重要文件清空了，神仙也找不回来。

代码里的 `\n` 是**换行符**：写到文件里就变成真的换行，所以文件里是三行。

## 第 4 步：追加模式 a —— 接在旧内容后面

```python
with open("日记.txt", "a", encoding="utf-8") as f:
    f.write("\n第四行是追加的")
```

现在文件变成：

```text
第一行
第二行
第三行
第四行是追加的
```

三种模式一句话总结：

| 模式 | 干什么 | 旧内容 |
| --- | --- | --- |
| `r` | 读 | 不动 |
| `w` | 写 | **清空重写** |
| `a` | 追加 | 保留，接在后面 |

## 第 5 步：read 和 readlines 的区别

`f.read()` 读成**一整段文字**；`f.readlines()` 读成**一个列表，一行一格**：

```python
with open("日记.txt", "r", encoding="utf-8") as f:
    lines = f.readlines()
print(lines)
```

输出：

```text
['第一行\n', '第二行\n', '第三行\n', '第四行是追加的']
```

想"逐行处理"（比如数行数、找某一行）就用 `readlines()`；想"整段处理"就用 `read()`。

## 实战：读文件，统计单词数

把前面几课的积木全用上。先造一个英文文件，再统计里面有几个单词：

```python
# 先造一个文件
with open("文章.txt", "w", encoding="utf-8") as f:
    f.write("Python is easy and Python is fun")

# 读出来 → 切开 → 数个数
with open("文章.txt", "r", encoding="utf-8") as f:
    text = f.read()

words = text.split()
print("全文：", text)
print("单词数：", len(words))
```

输出：

```text
全文： Python is easy and Python is fun
单词数： 7
```

注意 `text.split()` **括号里什么都没写**——这是特例：不写"刀"就默认按空格切，正好切出单词。

这就是 [[Python学习路线]] 里自测题的原型：读文件 + split + len，你已经会了。想更进一步（统计**每个**单词出现几次），下节课就拆它。

## 最关键的一句

> [!important]
> **`with open("文件名", "模式", encoding="utf-8") as f:` 三行走天下——`r` 读、`w` 清空重写、`a` 追加；`read()` 整段读，`readlines()` 按行读成列表。**

## 大白话翻译表

| 术语 | 大白话 |
| --- | --- |
| `open()` | 打开文件 |
| `with ... as f:` | 用完自动关文件，f 是文件小名 |
| `r` / `w` / `a` | 读 / 清空重写 / 追加 |
| `encoding="utf-8"` | 中文不乱码的固定搭配，照抄 |
| `f.read()` | 整个文件读成一段文字 |
| `f.readlines()` | 整个文件读成列表，一行一格 |
| `f.write()` | 往文件里写 |
| `\n` | 换行符 |

## 检查一下

1. 往文件里写内容，三行固定模式怎么写？（默写）
2. 文件里已有"旧内容"，用 `w` 模式写入"新内容"后，文件里是什么？
3. 想在日记文件末尾接着写，用哪个模式？
4. `f.readlines()` 和 `f.read()` 的结果有什么区别？

<details>
<summary>点我看答案</summary>

1. `with open("文件名", "w", encoding="utf-8") as f:` + 缩进一行 `f.write("内容")`。
2. 只有"新内容"——`w` 打开时会清空旧内容。
3. `a`（append，追加）。
4. `read()` 得到一整段文字（字符串）；`readlines()` 得到一个列表，一行占一格，而且每格末尾带着 `\n`。
</details>

下一课：[[小白课-程序拆解实战]]

## 相关笔记

- [[基础语法速查]]
- [[常用数据结构与函数]]
- [[Python学习路线]]
- [[新手报错速查]]
