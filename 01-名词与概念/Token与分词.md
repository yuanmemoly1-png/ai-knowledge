---
tags: [名词解释, LLM, Python]
created: 2026-08-02
---

# Token 与分词

## 什么是 Token

Token（词元）是 [[LLM大语言模型]] 处理文本的**最小单位**。模型看到的不是"字"或"词"，而是 token 序列。分词器（Tokenizer）负责把原始文本切成 token，再把每个 token 映射成一个数字 ID。

几个直观例子（以 OpenAI 的 cl100k_base 分词器为例）：

| 文本 | 切分结果 | token 数 |
| --- | --- | --- |
| `hello world` | `hello` + ` world` | 2 |
| `unbelievable` | `un` + `belie` + `vable` | 3 |
| `你好` | 2 个 token | 2 |
| `人工智能` | 通常 3-4 个 token | 3-4 |

> [!note] 经验换算
> 英文：1 个 token ≈ 0.75 个单词（1000 token ≈ 750 词）。中文：1 个汉字通常占 1-2 个 token，比英文"贵"。

## BPE 分词原理简述

主流模型普遍使用 **BPE（Byte Pair Encoding，字节对编码）** 或其变体。训练分词器的过程：

1. 把所有文本拆成最小单位（字节或单字符）。
2. 统计语料中**出现频率最高的相邻 token 对**，把它们合并成一个新 token。
3. 重复第 2 步数万次，得到一个固定大小的词表（如 GPT-4 约 10 万个 token）。

这样做的好处：

- 常见词（如 `the`、`学习`）是单个 token，处理高效。
- 生僻词能拆成常见片段（`unbelievable → un + belie + vable`），不会出现"未知词"。
- 词表大小固定，模型词表层的参数量可控。

## 中英文 Token 差异

中文语料在训练集中的占比远低于英文，所以分词器对中文的"压缩率"更差：

- 同样一段话，中文往往比英文消耗更多 token。
- 一个汉字常占 1-2 个 token，标点、空格也各占 token。
- 部分中英混合、代码、表情符号的切分方式可能出乎意料。

## 为什么 Token 很重要

> [!warning] 两个直接影响
> 1. **费用**：API 按 token 计费，输入和输出分别计价（输出通常更贵）。中文内容 token 多，费用也高。
> 2. **上下文长度**：模型的[[上下文窗口]]按 token 计算，超过上限的内容会被截断或报错。

## 用 tiktoken 数 Token

`tiktoken` 是 OpenAI 官方的分词库，可以在调用 API 前预估 token 数和费用。

```bash
pip install tiktoken
```

```python
import tiktoken

# 指定编码（gpt-4o / gpt-4o-mini 使用 o200k_base）
enc = tiktoken.get_encoding("o200k_base")

text = "人工智能正在改变世界。AI is changing the world."
tokens = enc.encode(text)

print(f"token 数: {len(tokens)}")
print(f"token IDs: {tokens[:10]}...")
print(f"逐个还原: {[enc.decode([t]) for t in tokens[:10]]}")
```

也可以按模型名自动匹配编码：

```python
enc = tiktoken.encoding_for_model("gpt-4o-mini")
n = len(enc.encode("你好，世界！"))
print(n)  # 观察中文消耗的 token 数
```

> [!tip] 实战建议
> 写 RAG 或长文档处理程序时，先用 tiktoken 统计每段文本的 token 数，再决定切分粒度，避免超出[[上下文窗口]]。相关实践见 [[RAG检索增强生成]]。

## 相关笔记

- [[LLM大语言模型]]
- [[上下文窗口]]
- [[Prompt与提示词工程]]
- [[基础语法速查]]
