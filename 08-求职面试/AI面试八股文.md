---
tags: [求职面试, 八股文, MOC]
created: 2026-08-02
---

# AI 面试八股文

> [!note] 什么是"八股文"
> 程序员圈把面试中**范围固定、可以死记硬背的标准化问答**叫"八股文"。AI 八股文 = LLM / 深度学习岗的高频考题集。本笔记把高频考题和本库已有概念笔记**双链打通**：题目链到概念，概念链回题目，复习时互相跳转。

## 先搞清楚：你面的是哪类岗位

| 岗位 | 考察重点 | 八股占比 |
| --- | --- | --- |
| 大模型算法工程师 | 模型原理、训练、推导（可能手撕 attention） | 高，且问得深 |
| AI 应用 / Agent 开发工程师 | RAG、Agent、工程落地、项目经验 | 中，项目 > 八股 |
| AI 产品经理 | 概念理解、场景判断、成本与边界 | 低，概念能讲清即可 |

> [!tip] 策略
> 应用开发岗：**项目经验权重远高于八股**。先靠 [[用AI开发App全流程]] 和 [[Agent开发总览]] 做出 1-2 个能演示的作品，再用本笔记查漏补缺。算法岗则需要配合 [[深度学习课程总览]] 系统补底层。

> [!info] 延伸
> 本笔记回答"考什么"；"**怎么答最好**"（各厂风格 + 答题方法论 + Agent 架构答题模板）见 [[大厂AI面试题总览与答题方法论]]。

## 一、基础概念类

**Q：Token 是什么？为什么按 token 计费？**
模型处理文本的最小单位，英文约 0.75 词/token，中文约 1-2 字/token；计费与上下文长度都按 token 算。→ [[Token与分词]]

**Q：什么是上下文窗口？长对话为什么会"遗忘"？**
模型一次能看到的 token 上限；历史消息每轮重发，超限后被截断。→ [[上下文窗口]]

**Q：什么是幻觉？怎么缓解？**
模型生成看似合理但错误的内容；缓解：RAG、要求引用来源、调低 temperature、工具验证。→ [[幻觉Hallucination]]

**Q：temperature / top_p / max_tokens 分别控制什么？** → [[训练推理与采样参数]]

## 二、模型原理类（算法岗重点）

**Q：Transformer 的核心结构？**
Embedding + 位置编码 → N 层（多头自注意力 + 前馈网络，各配残差连接与 LayerNorm）→ 输出头。Decoder-only 架构（GPT 系）用因果掩码防止"偷看未来"。

**Q：Self-Attention 为什么要除以 √d？**
Q·K 点积的方差随维度 d 增大，数值过大会把 softmax 压进梯度极小的饱和区；除以 √d 把方差拉回 1 附近，保证梯度稳定。

**Q：位置编码有哪几种？**
绝对位置编码（正弦，原始 Transformer）、可学习位置 embedding（GPT-2）、旋转位置编码 **RoPE**（Llama/Qwen 主流，把相对位置信息编码进 Q/K 的旋转）、ALiBi。

**Q：预训练 → SFT → RLHF/DPO 的流程？**
预训练学语言规律（next token prediction）→ SFT 用指令数据教模型"听懂话" → RLHF/DPO 用人类偏好对齐"说好话"。→ [[微调Fine-tuning]]

> [!tip] 想真正吃透而不是背答案
> 跟着 [[从零实现LLM专题]] 手写一遍 GPT 和注意力机制，这些问题就都变成了"你亲手写过的东西"。

## 三、微调与训练类

**Q：LoRA 为什么省显存？**
冻结原权重，只在注意力层注入低秩矩阵 A×B（r 远小于原维度），可训练参数量降到 1% 以下；QLoRA 再加 4bit 量化。→ [[微调Fine-tuning]]

**Q：全参数微调需要多少显存？**
经验公式：参数×2（权重 bf16）+ 参数×8（Adam 优化器状态 fp32 + 梯度）+ 激活值。7B 模型全参微调约需 60GB+，所以单卡玩不动才用 LoRA。

**Q：微调 vs RAG 怎么选？**
知识更新用 RAG，行为/格式/风格用微调；先 Prompt → 再 RAG → 最后才微调。→ [[微调Fine-tuning]]、[[RAG检索增强生成]]

## 四、RAG 类（应用岗必考）

**Q：RAG 完整流程？**
文档切分 → Embedding 向量化 → 存入向量库 →  query 检索 top-k → 拼进 prompt → 生成。→ [[RAG检索增强生成]]

**Q：Embedding 是什么？相似度怎么算？**
把文本映射为语义向量；余弦相似度。→ [[Embedding向量嵌入]]

**Q：RAG 效果不好怎么排查？**
分段看：检索不到（切分粒度/embedding 模型/混合检索）→ 检索到但没用上（上下文太长被淹没、prompt 组织）→ 生成出错（换更强模型、要求引用）。→ [[RAG检索增强生成]] 的常见坑一节

## 五、Agent 类（Agent 岗必考）

**Q：Agent 和普通聊天机器人的区别？**
Agent = LLM + 规划 + 记忆 + 工具，能自主多步完成任务。→ [[Agent智能体]]

**Q：ReAct 模式是什么？**
Thought → Action → Observation 交替循环，把推理和工具调用交织起来。→ [[ReAct与Agent设计模式]]

**Q：Function Calling 原理？和 MCP 的区别？**
schema 描述工具 → 模型输出结构化 JSON → 程序执行 → 结果回传。MCP 是把这套能力标准化的开放协议（Host/Client/Server）。→ [[FunctionCalling函数调用]]、[[MCP模型上下文协议]]

**Q：Agent 的记忆怎么设计？**
短期：对话历史、滑动窗口、摘要压缩；长期：向量库 / 文件。→ [[记忆与上下文工程]]

## 六、推理与部署类

**Q：KV Cache 是什么？**
缓存历史 token 的 K/V 矩阵，避免每生成一个 token 重算全部注意力——推理加速的核心，也是显存大头。

**Q：量化是什么？INT8/INT4 为什么能跑？**
把权重从 fp16 压缩到 8/4 bit 整数，显存减半甚至更少，精度损失可控。→ [[训练推理与采样参数]]

## 七、开源题集仓库（已核实）

| 仓库 | 特点 | 链接 |
| --- | --- | --- |
| adongwanai/AgentGuide | 学习路线+简历项目+1500 题库一站式，求职导向最强（详见 [[AgentGuide项目拆解]]） | [GitHub](https://github.com/adongwanai/AgentGuide) |
| km1994/LLMs_interview_notes | 大模型算法岗题集，题量大、分类全 | [GitHub](https://github.com/km1994/LLMs_interview_notes) |
| naginoa/LLMs_interview_notes | 带参考答案，显存计算、SFT 数据构建等硬核题 | [GitHub](https://github.com/naginoa/LLMs_interview_notes) |
| wdndev/llm_interview_note | 算法+应用双修，配套 tiny-llm 动手仓库 | [GitHub](https://github.com/wdndev/llm_interview_note) |
| DolbyUUU/Awesome-LLM-Interview-Questions-and-Answers | 2025 国内大厂算法岗/Agent 岗真实面试考点 | [GitHub](https://github.com/DolbyUUU/Awesome-LLM-Interview-Questions-and-Answers) |
| Meko1/llm-interview-guide | 体系化问答式知识库，适合查漏补缺 | [GitHub](https://github.com/Meko1/llm-interview-guide) |
| ChanChiChoi/llm-from-zero-to-interview | 从 ML 基础到面试的完整开源书系 | [GitHub](https://github.com/ChanChiChoi/llm-from-zero-to-interview) |

## 备考路线建议

```text
概念打底（01-名词与概念）
      │
      ▼
项目攒经验（02-Agent开发 / 03-AI辅助开发，做 1-2 个可演示作品）
      │
      ▼
本笔记过高频题 → 发现薄弱点 → 顺双链回概念笔记补
      │
      ▼
算法岗加练：手撕 attention（[[从零实现LLM专题]]）+ 上方题集仓库深挖
```

> [!warning] 别只背不做
> 面试官最常见的追问是"你项目里怎么用的"。每个八股知识点，最好都能对应一个你亲手做过的例子——这正是本库双链设计的用意。

## 相关笔记

- [[大厂AI面试题总览与答题方法论]]
- [[AI职业全景]]
- [[大模型训练方向]]
- [[AgentGuide项目拆解]]
- [[双非出路与防坑指南]]
- [[名词速查表]]
- [[Agent开发总览]]
- [[从零实现LLM专题]]
- [[课程总览]]
- [[主页]]
