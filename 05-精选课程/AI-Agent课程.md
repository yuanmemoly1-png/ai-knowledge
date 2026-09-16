---
tags: [课程资源, Agent开发, 免费课程]
created: 2026-08-02
---

# AI Agent 开发课程精选

> [!note] 说明
> 本文收录的均为**免费**课程（部分平台提供付费证书选项，学习本身免费），按「上手友好度 → 工程深度」排序。中文学习者建议先看 [[中文免费资源]] 里的 Datawhale 系列打底。

## 一、综合系统课（强烈推荐作为主线）

### 1. Hugging Face AI Agents Course ⭐
- **定位**：目前最系统的免费 Agent 课程，从理论到实战，完成可拿官方证书。
- **适合谁**：有 Python 基础、想系统学 Agent 的人。
- **内容大纲**：Agent 基础概念 → 三大框架实战（smolagents、LlamaIndex、LangGraph）→ 终局项目（构建并评测自己的 Agent）。
- **链接**：[Hugging Face Agents Course](https://huggingface.co/learn/agents-course)

### 2. Microsoft ai-agents-for-beginners ⭐
- **定位**：微软官方出品的 18 课 Agent 入门课，**含中文翻译**。
- **适合谁**：有一定代码经验的初学者；用 GitHub Models 免费额度即可跑通所有示例。
- **内容大纲**：Agent 简介与场景 → Agentic 框架 → 设计模式（工具使用 / 规划 / 多智能体 / 元认知）→ Agentic RAG → 可信 Agent → 生产环境部署。
- **链接**：[microsoft/ai-agents-for-beginners](https://github.com/microsoft/ai-agents-for-beginners)

### 3. Microsoft generative-ai-for-beginners
- **定位**：上面那门课的「前置课」，21 课讲透生成式 AI 应用开发基础，多语言（含中文）。
- **适合谁**：还没接触过 LLM 应用开发、想先理解提示词、RAG、微调再学 Agent 的人。
- **链接**：[microsoft/generative-ai-for-beginners](https://github.com/microsoft/generative-ai-for-beginners)

## 二、框架专项短课（DeepLearning.AI）

平台入口：[DeepLearning.AI Short Courses](https://www.deeplearning.ai/short-courses/)（注册即可免费学习，每门 1-2 小时，吴恩达团队与合作方联合出品）。

| 课程 | 一句话定位 | 建议学习时机 |
|---|---|---|
| Functions, Tools and Agents with LangChain | 工具调用与 LangChain Agent 入门 | 看完 [[FunctionCalling函数调用]] 后 |
| AI Agents in LangGraph | LangChain 官方亲授 LangGraph 状态图 | 配合 [[LangGraph状态图]] |
| Multi AI Agent Systems with crewAI | 多智能体角色协作实战 | 配合 [[CrewAI多智能体]] |
| Building Agentic RAG with LlamaIndex | 让 RAG 具备规划与路由能力 | 看完 [[RAG检索增强生成]] 后 |
| MCP: Build Rich-Context AI Apps with Anthropic | Anthropic 官方讲 MCP 协议 | 配合 [[MCP协议实战]] |

> [!tip] 短课的正确用法
> 短课信息量密度高但时长很短，建议「看一课 → 立刻用本地代码复现一遍 → 在本库记一篇笔记」。

## 三、官方与社区教程

### 4. LangChain Academy — Introduction to LangGraph
- **定位**：LangChain 公司官方免费课程，比短课更细致地讲 LangGraph。
- **内容**：图与状态、记忆与人机协作、多智能体架构、长期记忆。
- **链接**：[LangChain Academy](https://academy.langchain.com)

### 5. Anthropic 官方教程仓库
- **定位**：Claude 官方 notebook 教程，代码即文档。
- **内容**：提示词工程（从入门到进阶）、Tool Use、RAG 实战。
- **链接**：[anthropics/courses](https://github.com/anthropics/courses)

### 6. Hugging Face LLM Course
- **定位**：想往下钻一层、理解模型本身（微调、对齐、推理）时的进阶课。
- **链接**：[Hugging Face LLM Course](https://huggingface.co/learn/llm-course)

## 四、零代码通识

### 7. Generative AI for Everyone（吴恩达）
- **定位**：不写代码也能听懂的生成式 AI 通识课，适合建立全局认知或推荐给非技术朋友。
- **链接**：[Generative AI for Everyone](https://www.deeplearning.ai/courses/generative-ai-for-everyone/)

## 五、YouTube 视频课专区（打破信息差）

> [!tip] 为什么要上油管
> Agent 领域迭代极快，油管上有大量**第一手**内容：作者亲自讲自己的框架、实验室讲自己的论文、顶级工程师直播写代码。以下按"中文区 → 英文区 → 必看单集"整理（2026-08 核实）。**必看单集的逐个精读见 [[油管必看AI视频详解]]**。

### 中文区频道

| 频道 | 身份 | 特色 | 适合 |
| --- | --- | --- | --- |
| **李宏毅** | 台大教授 | 《AI Agent 系统设计》：用"复仇者联盟"比喻多 Agent 协作、"守护神咒"比喻工具调用；含 Colab 实战 | 零基础建立直觉（B站有搬运） |
| **李沐** | 亚马逊首席科学家 | 《动手学 AI Agent》：PyTorch 搭多 Agent 框架，逐句精读 AutoGPT/ReAct 论文，开源 Jupyter 代码 | 想动手 + 啃论文 |
| **吴恩达 / DeepLearning.AI** | 斯坦福 | 用 Excel 演算 Agent 决策树；Multi-Agent 博弈系统课 | 逻辑型学习者 |
| **韩松** | MIT 教授 | Efficient ML：Llama3 Agent 部署到树莓派（量化后仅 2GB 内存） | 边缘/端侧方向 |

> 李宏毅的原理课详见 [[中文免费资源]]，此处补充的是他的 Agent 专题课。

### 英文区频道

| 频道 | 订阅 | 特色 | 适合 |
| --- | --- | --- | --- |
| **Andrej Karpathy** | ~160万 | 前特斯拉 AI 总监；从零手搓 LLM/Agent，直播调试死循环 | 想理解模型内部（配合 [[从零实现LLM专题]]） |
| **3Blue1Brown** | ~850万 | Transformer/Attention 可视化动画，数学直觉无敌 | 补底层原理 |
| **freeCodeCamp** | — | 《AI Agents for Beginners》完整长课：从 LLM 概念到多 Agent 系统，四个实战 Agent | 免费完整入门 |
| **Cole Medin** | ~22万 | 讲"能在真实负载下活下来"的 Agent，工程落地向 | 应用开发岗 |
| **AI Jason** | ~23万 | 上下文工程、多 Agent 架构深度内容 | 进阶 |
| **LangChain 官方** | ~20万 | LangGraph 原厂教程 | 配合 [[LangGraph状态图]] |
| **IBM Technology** | ~170万 | AI 概念短讲解，准确不啰嗦 | 快速科普 |

### 必看单集（Tier 1）

| 视频 | 频道 | 时长 | 为什么值得 |
| --- | --- | --- | --- |
| From Vibe Coding to Agentic Engineering | Karpathy × Sequoia | ~30min | 定义"Agentic Engineering"时代：Software 3.0、"LLM 是幽灵而非动物"心智模型 |
| Building Effective Agents | Anthropic 官方 | — | Workflow vs Agent 分类的原产地（[[ReAct与Agent设计模式]] 引用的就是它） |
| Building Agents with MCP | OpenAI 官方 | — | MCP 协议官方讲解（配合 [[MCP协议实战]]） |
| Workflow for AI Coding | Matt Pocock × AI Engineer | 1h34m | 年度级工作坊：模糊需求→PRD→TDD→无人值守运行，113 万播放 |
| AI Agents for Beginners | freeCodeCamp | 长课 | 见上表，完整免费 |

## 选课速查

> [!example] 按目标选
> - 只想快速做出一个 Agent 作品 → HF Agents Course + Datawhale hello-agents
> - 想系统建立知识体系 → 微软两门 → DeepLearning.AI 短课按需补
> - 想深入某个框架 → LangChain Academy / Anthropic courses
> - 想理解模型底层 → 转 [[深度学习课程总览]] 和 [[从零实现LLM专题]]

## 相关笔记

- [[课程总览]]
- [[Python课程]]
- [[中文免费资源]]
- [[Agent开发总览]]
