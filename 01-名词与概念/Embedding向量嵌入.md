---
tags: [名词解释, Embedding, RAG]
created: 2026-08-02
---

# Embedding 向量嵌入

## 什么是 Embedding

Embedding（向量嵌入）是把一段文本（词、句子、文档）映射成**一串固定长度的浮点数向量**的技术，例如 768 维或 1536 维。关键在于：**语义相近的文本，向量在空间中的距离也近**。

可以把它理解为给每段文字一个"语义坐标"：

- "猫"和"狗"的坐标很接近（都是宠物）
- "猫"和"量子力学"的坐标很远
- "我喜欢吃苹果"和"我爱吃苹果"措辞不同但坐标接近

机器不懂文字，但懂向量运算——Embedding 就是把语义翻译成数学的桥梁，也是 [[RAG检索增强生成]] 的核心部件。

## 余弦相似度

比较两个向量语义远近最常用的指标是**余弦相似度（Cosine Similarity）**：计算两向量夹角的余弦值。

$$\text{similarity} = \frac{A \cdot B}{\|A\| \times \|B\|}$$

| 取值 | 含义 |
| --- | --- |
| 接近 1 | 方向几乎相同，语义高度相似 |
| 接近 0 | 无关 |
| 接近 -1 | 语义相反（实际场景中较少出现） |

用 NumPy 手写一遍：

```python
import numpy as np

def cosine_similarity(a, b):
    a, b = np.array(a), np.array(b)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

print(cosine_similarity([1, 2, 3], [1, 2, 3]))   # 1.0
print(cosine_similarity([1, 0], [0, 1]))          # 0.0
```

## 用 sentence-transformers 算相似度

`sentence-transformers` 是最流行的开源 Embedding 库，一行代码就能把句子变向量：

```bash
pip install sentence-transformers
```

```python
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# 多语言小模型，首次运行会自动下载
model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")

sentences = [
    "如何申请退款？",
    "退款流程是什么？",
    "今天天气怎么样？",
]
embeddings = model.encode(sentences)  # shape: (3, 384)

sim_01 = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
sim_02 = cosine_similarity([embeddings[0]], [embeddings[2]])[0][0]

print(f"'如何申请退款' vs '退款流程是什么': {sim_01:.3f}")  # 较高，约 0.7+
print(f"'如何申请退款' vs '今天天气怎么样': {sim_02:.3f}")  # 很低，接近 0
```

> [!tip] 这就是语义搜索的最小原型
> 把知识库所有文档预先编码存起来，用户提问时编码问题、算相似度、取 Top-K 最相似的文档——语义搜索就完成了。加上"把检索结果喂给 LLM 生成答案"一步，就是完整的 [[RAG检索增强生成]]。

## Embedding 与 RAG 的关系

| 环节 | Embedding 的角色 |
| --- | --- |
| 建库 | 把每个文档块编码成向量，存入向量数据库（见 [[RAG检索增强生成]] 中的对比表） |
| 检索 | 把用户问题编码成向量，在库中找余弦相似度最高的文档块 |
| 生成 | 检索到的原文 + 问题一起进 Prompt，由 LLM 生成答案 |

**注意**：Embedding 模型负责"找得准"，LLM 负责"答得好"，两者是分工关系，可以独立替换。

## 常用 Embedding 模型速览

| 模型 | 来源 | 特点 |
| --- | --- | --- |
| text-embedding-3-small / large | OpenAI API | 质量好、免部署、按 token 计费 |
| BGE 系列（bge-large-zh 等） | 智源（开源） | 中文效果优秀，可本地运行 |
| M3E | 开源社区 | 中文轻量，入门友好 |
| paraphrase-multilingual-* | sentence-transformers | 多语言，开箱即用 |

## 相关笔记

- [[RAG检索增强生成]]
- [[Token与分词]]
- [[工具调用实战]]
- [[面向AI开发的Python]]
