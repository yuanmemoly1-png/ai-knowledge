---
tags: [深度学习, LLM, 课程资源]
created: 2026-08-02
---

# 从零实现 LLM 专题

「从零手写大模型」是理解 LLM 最有效的方式：当你亲手写出注意力机制、搭好训练循环、看着模型从随机噪声逐渐学会说话，Token、Embedding、预训练这些概念就不再是黑话。本笔记汇总该主题下的四大主流资源，并给出选型建议。

> [!note] 先修要求
> 开始本专题前，请确认：会用 PyTorch 写基本张量运算与训练循环（见 [[PyTorch与数学基础]]），理解反向传播的概念，了解什么是 [[Token与分词]] 和 [[Embedding向量嵌入]]。

## 资源一：rasbt/LLMs-from-scratch（主线推荐）

仓库：[rasbt/LLMs-from-scratch](https://github.com/rasbt/LLMs-from-scratch)，详见 [[Raschka教授资源全集]]。

### 章节学习路线

| 章节 | 主题 | 你会学到 |
| --- | --- | --- |
| ch02 | 文本数据处理 | 分词、BPE Tokenizer、滑动窗口构造训练样本、DataLoader |
| ch03 | 注意力机制 | 自注意力 → 因果（Causal）注意力 → 多头注意力，逐行实现 |
| ch04 | GPT 架构 | LayerNorm、GELU、残差连接、Transformer Block、完整 GPTModel |
| ch05 | 预训练 | 交叉熵损失、训练循环、温度采样与 Top-k 解码、加载 OpenAI GPT-2 权重 |
| ch06 | 分类微调 | 把 GPT 改造成文本分类器（垃圾邮件分类实战） |
| ch07 | 指令微调 | 构造指令数据集、Instruction Fine-tuning、用 [[LLM大语言模型]] 评判输出质量 |

> [!example] ch04 的 GPT 模型长什么样
> ```python
> import torch
> import torch.nn as nn
>
> class GPTModel(nn.Module):
>     def __init__(self, cfg):
>         super().__init__()
>         self.tok_emb = nn.Embedding(cfg["vocab_size"], cfg["emb_dim"])
>         self.pos_emb = nn.Embedding(cfg["context_length"], cfg["emb_dim"])
>         self.drop_emb = nn.Dropout(cfg["drop_rate"])
>         self.trf_blocks = nn.Sequential(
>             *[TransformerBlock(cfg) for _ in range(cfg["n_layers"])]
>         )
>         self.final_norm = LayerNorm(cfg["emb_dim"])
>         self.out_head = nn.Linear(cfg["emb_dim"], cfg["vocab_size"], bias=False)
>
>     def forward(self, in_idx):
>         batch_size, seq_len = in_idx.shape
>         tok_embeds = self.tok_emb(in_idx)
>         pos_embeds = self.pos_emb(torch.arange(seq_len, device=in_idx.device))
>         x = self.drop_emb(tok_embeds + pos_embeds)
>         x = self.trf_blocks(x)
>         x = self.final_norm(x)
>         return self.out_head(x)   # logits
> ```
> 约 124M 参数的 GPT-2 small 用上面的结构即可完整复现。

- bonus 材料：Qwen3 从零复现、RoPE、KV Cache、MoE 等进阶专题，读完正文后可按需选学。
- 硬件：CPU 可跑（小配置），有 GPU 更快。

## 资源二：rasbt/reasoning-from-scratch（进阶）

- 仓库：[rasbt/reasoning-from-scratch](https://github.com/rasbt/reasoning-from-scratch)
- 书页：[Build a Reasoning Model (From Scratch)](https://www.manning.com/books/build-a-reasoning-model-from-scratch)（Manning 2026）
- 定位：不再是「让模型会说话」，而是「让模型会推理」——基于预训练 Qwen3，从零实现推理时扩展、强化学习、蒸馏三条路线，共 8 章 + 附录。
- 适合：完成 LLMs-from-scratch 之后想追推理模型（o1/R1 类）原理的学习者。

## 资源三：Karpathy nanoGPT + Zero to Hero

- 仓库：[karpathy/nanoGPT](https://github.com/karpathy/nanoGPT)
- 视频系列：YouTube『Neural Networks: Zero to Hero』（其中 Let's build GPT 一讲是手写 GPT 的经典视频，写出名称即可自行搜索）
- 个人主页：[karpathy.ai](https://karpathy.ai)
- 定位：Andrej Karpathy（前 OpenAI 联合创始人、特斯拉 AI 总监）的个人教学项目。nanoGPT 用约 300 行核心代码实现 GPT-2 训练，追求极简与高效。
- 特点：代码极简但省略了教学性注释，配合 Let's build GPT 视频（边讲边写，2 小时）食用最佳。
- 适合：想快速看一遍 GPT 全貌、或想直接拿 nanoGPT 当训练骨架魔改的人。

## 资源四：Stanford CS336 Language Modeling from Scratch

- 主页：[stanford-cs336.github.io/spring2025](https://stanford-cs336.github.io/spring2025/)
- 定位：斯坦福研究生级课程，作业就是从零实现 LLM 的全部组件——BPE Tokenizer、Transformer、训练循环、甚至分布式训练都要求自己写。
- 特点：最硬核、最系统，讲义和作业全部公开；没有官方标准答案，需要较强的自学与调试能力。
- 适合：已掌握 PyTorch、想达到「工业级 LLM 训练工程师」水平的进阶者。

## 四大资源对比

| 维度 | LLMs-from-scratch | nanoGPT | CS336 | reasoning-from-scratch |
| --- | --- | --- | --- | --- |
| 教学友好度 | ★★★★★（书+代码逐行讲解） | ★★★★（视频驱动，代码极简） | ★★★（讲义好但无答案） | ★★★★（需前置基础） |
| 核心代码量 | 每章几十~百余行 | 约 300 行 | 作业累计上千行 | 每章几十~百余行 |
| 硬件要求 | CPU 可跑 | 建议 GPU（可 CPU 演示） | 建议 GPU | 需能加载 Qwen3（建议 GPU） |
| 覆盖范围 | Tokenizer→预训练→微调 | 预训练为主 | Tokenizer→分布式训练全覆盖 | 推理方法（RL/蒸馏/推理时扩展） |
| 适合人群 | 入门首选 | 快速过全貌/魔改骨架 | 硬核进阶 | LLM 进阶 |

> [!tip] 怎么选
> - 零基础起步：LLMs-from-scratch，按部就班。
> - 已经懂原理、想要可魔改的训练骨架：nanoGPT。
> - 目标是 LLM Infra / 训练工程师：CS336。
> - 想搞懂 o1/R1 类推理模型：reasoning-from-scratch。
> - 时间充裕：LLMs-from-scratch → nanoGPT → CS336 → reasoning-from-scratch。

## 相关笔记

- [[Raschka教授资源全集]]
- [[斯坦福公开课]]
- [[LLM大语言模型]]
- [[Token与分词]]
