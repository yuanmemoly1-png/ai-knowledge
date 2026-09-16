---
tags: [深度学习, 课程资源, 工具资源]
created: 2026-08-02
---

# Raschka 教授资源全集

Sebastian Raschka 是前威斯康星大学麦迪逊分校统计学教授、现 Lightning AI 研究工程师，可能是当前「LLM 教学界」最有影响力的人：他写的《Python 机器学习》是 ML 入门畅销书，《Build a Large Language Model (From Scratch)》则是「手写大模型」领域的标杆教材。他的所有课程和书籍几乎都配有完全开源的代码仓库，质量极高，非常适合自学。

- GitHub 主页：[rasbt](https://github.com/rasbt)
- 免费课程汇总页：[sebastianraschka.com/teaching](https://sebastianraschka.com/teaching)
- 博客：[Ahead of AI](https://magazine.sebastianraschka.com)

## 核心资源逐个介绍

### 1. LLMs-from-scratch —— 王牌资源

- 仓库：[rasbt/LLMs-from-scratch](https://github.com/rasbt/LLMs-from-scratch)
- 定位：《Build a Large Language Model (From Scratch)》一书的官方代码库，「从零手写 GPT」的最佳材料。
- 内容：用 PyTorch 从零实现一个 GPT 风格模型，逐步覆盖：
  - 文本数据处理与 Tokenizer
  - 注意力机制（自注意力 → 因果注意力 → 多头注意力）
  - GPT 架构完整搭建
  - 预训练（含训练循环、采样解码）
  - 分类微调（如垃圾邮件分类）
  - 指令微调（Instruction Fine-tuning）
- bonus 材料：含 Qwen3 从零复现、RoPE、KV Cache 等进阶专题。
- 怎么用：按章节顺序读代码 + 跑 notebook，每章代码量不大但环环相扣。详细路线见 [[从零实现LLM专题]]。

> [!tip] 硬件要求
> 全书代码设计为可在普通笔记本 CPU 上运行（用小模型、小数据），有 GPU 体验更好但非必需。这是它相比其他「手写 LLM」资源最大的优势。

### 2. reasoning-from-scratch —— 推理模型进阶

- 仓库：[rasbt/reasoning-from-scratch](https://github.com/rasbt/reasoning-from-scratch)
- 书页：[Build a Reasoning Model (From Scratch)](https://www.manning.com/books/build-a-reasoning-model-from-scratch)（Manning，2026）
- 定位：《Build a Reasoning Model (From Scratch)》配套代码，是 LLMs-from-scratch 的续作。
- 内容：基于预训练的 Qwen3 模型，从零实现推理（Reasoning）能力的三条技术路线：
  - 推理时扩展（Inference-time Scaling，如思维链采样与验证）
  - 强化学习（RL，如 GRPO 类方法）
  - 蒸馏（Distillation）
- 结构：8 章 + 附录。
- 怎么用：先完成 LLMs-from-scratch 再来读这本，它假设你已经理解 GPT 架构与预训练。

### 3. LLM-workshop-2024 —— 快速上手工作坊

- 仓库：[rasbt/LLM-workshop-2024](https://github.com/rasbt/LLM-workshop-2024)
- 定位：约 4 小时的编程工作坊，浓缩版 LLMs-from-scratch。
- 内容：数据处理 → 注意力机制 → 预训练 → 微调，一条龙走完。
- 怎么用：适合想用一个周末快速体验「手写 LLM 全流程」的人；觉得好再深入啃完整本书。

### 4. stat453-deep-learning-ss21 —— 大学正式课程

- 仓库：[rasbt/stat453-deep-learning-ss21](https://github.com/rasbt/stat453-deep-learning-ss21)
- 定位：威斯康星大学 STAT 453《深度学习与生成模型导论》2021 春季学期完整讲义，体系最规整。
- 内容：从 MLP、反向传播讲到 CNN、RNN、自编码器、GAN、Transformer，含 slides 与代码。
- 怎么用：当作「深度学习主课」使用，配合 deeplearning-models 仓库里的实现代码。

### 5. deeplearning-models —— 架构实现合集

- 仓库：[rasbt/deeplearning-models](https://github.com/rasbt/deeplearning-models)
- 定位：各类深度学习架构的 PyTorch / TensorFlow 实现合集，一本「活教材」。
- 内容：CNN（LeNet、ResNet 等）、RNN/LSTM、自编码器、GAN、VAE、Transformer 等，每个架构一个独立 notebook。
- 怎么用：学某个架构时直接查对应实现，代码干净、注释清楚，适合当参考手册。

### 6. machine-learning-book —— 机器学习入门书配套代码

- 仓库：[rasbt/machine-learning-book](https://github.com/rasbt/machine-learning-book)
- 定位：畅销书《Python 机器学习》（Python Machine Learning）配套代码，进入深度学习之前的最佳铺垫。
- 内容：scikit-learn 实践（分类、回归、聚类、降维、模型评估）+ 用 PyTorch 实现神经网络入门章节。
- 怎么用：零基础先学这本，掌握 ML 基本概念（过拟合、交叉验证、正则化），再进入深度学习。

### 7. mlxtend —— 机器学习工具库

- 仓库：[rasbt/mlxtend](https://github.com/rasbt/mlxtend)
- 定位：机器学习常用工具的扩展库（machine learning extensions），是 sklearn 的补充。
- 内容： stacking 集成、特征选择、绘图工具（决策边界可视化）、数据预处理等实用函数。

```python
# 示例：用 mlxtend 绘制分类器的决策边界
from mlxtend.plotting import plot_decision_regions
from sklearn.linear_model import LogisticRegression

clf = LogisticRegression().fit(X_train, y_train)
plot_decision_regions(X_train, y_train, clf=clf)
```

- 怎么用：不当作课程，写 ML 项目时按需 `pip install mlxtend` 查阅文档使用。

## 博客：Ahead of AI

- 地址：[Ahead of AI](https://magazine.sebastianraschka.com)
- 内容：LLM 前沿论文解读、训练技巧、行业分析，更新频率高、文字清晰。
- 适合：作为主课之外的每周阅读，跟踪 LLM 领域动态。

## 建议学习顺序

```text
machine-learning-book（ML 基础）
        ↓
stat453-deep-learning-ss21 + deeplearning-models（深度学习体系）
        ↓
LLMs-from-scratch（手写 GPT）
        ↓
reasoning-from-scratch（推理模型进阶）
```

- 时间紧张可跳过 stat453，用 [[PyTorch与数学基础]] 中的李沐 d2l 替代深度学习主课。
- LLM-workshop-2024 可作为进入 LLMs-from-scratch 前的热身。

## 相关笔记

- [[从零实现LLM专题]]
- [[深度学习课程总览]]
- [[PyTorch与数学基础]]
- [[LLM大语言模型]]
