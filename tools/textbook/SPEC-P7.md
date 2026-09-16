# 第七篇《智能体设计模式》 —— 写作规范与大纲（契约）

本文件是第七篇写作的**唯一契约**。节 id、标题、原书出处、关联笔记、配套真题一律照抄，不得改动。

---

## 一、通用格式（与全书一致）

每个写作单元输出**一个** JS 文件 `interview/data/tb-<key>.js`：

```js
// 第七篇 · <范围> —— 教材正文
window.TB_SECTIONS = window.TB_SECTIONS || {};
Object.assign(window.TB_SECTIONS, {
  "18.1": {
    id: "18.1",
    t: "提示链",
    from: "《智能体设计模式》第 1 章 · Prompt Chaining",
    why: "...",
    learn: "...",
    body: "...",
    keypoints: ["...", "..."],
    pitfalls: ["...", "..."],
    rel: ["..."],
    qs: ["dp-01"],
    ev: [],
  },
});
```

字段说明（`from` 是第七篇新增字段，必填）：

| 字段 | 说明 |
|---|---|
| `id` / `t` | 照抄大纲 |
| `from` | 原书出处，格式 `《智能体设计模式》第 N 章 · <英文原名>`；附录节写 `《智能体设计模式》附录 C · Quick overview of Agentic Frameworks` |
| `why` | 1-2 句，说清「不学它会卡在哪」 |
| `learn` | 可检验的「学完的标志」（能画出/能说出/能判断），禁用「了解/熟悉」 |
| `body` | 讲义正文，见第三节写法 |
| `keypoints` | 3-6 条必须记住的结论 |
| `pitfalls` | 2-4 条最容易错/最容易被追问的地方 |
| `rel` | 照抄大纲（我们库里的相关笔记路径） |
| `qs` | 照抄大纲（`dp-xx`） |
| `ev` | 一律 `[]` |

**字符串写法红线**：`body` 用模板字符串（反引号）；正文内代码块一律用 `~~~` 围栏（禁止三反引号）；不得出现裸反引号；不得出现 `${`（要写就写 `\${`）。

---

## 二、正文写法（第七篇特有）

**核心要求：这是「设计模式」章，不是「概念」章。** 每节必须让读者读完能回答三个问题：
1. 这个模式解决什么问题（原问题的症状是什么）
2. 什么时候该用、什么时候**不该**用
3. 用它的时候代码骨架长什么样

`body` 固定四个小节：

```
### 一句话说清      这个模式是什么，必须带一个类比
### 展开讲          它解决什么症状、机制是什么、关键设计点在哪
### 动手看          最小可跑代码骨架（Python 为主）
### 什么时候不该用   反模式与边界；并说明更简单的替代方案
```

**另外必须包含一段「与教材其它节的分工」**（放在 `### 展开讲` 末尾，用一句加粗的话）：说明这个模式在我们教材里是否已有对应章节、本节只讲什么。例如：

> **和教材其它节的分工**：工具调用的机制在第 8.4 节已经讲透，本节只讲「模式视角」——怎么在多个工具之间做选择、工具描述怎么写才不被误选。

**必须覆盖「常见误用」**：原书每章都有反模式讨论，正文里要如实写出。

**篇幅**：
- 完整节（18.1-18.4、19.2、19.4、20.1、20.2、21.1-21.7、22.1-22.3）：body **500-800 字**（中文字符）
- 插接节（18.5、18.6、18.7、19.1、19.3、20.3）：body **350-500 字**，重点写「模式视角 + 与已有章节的分工 + 什么时候选它」

**语言**：中文，口语化，短句，比喻优先。禁止「综上所述」「赋能」「闭环」「值得注意的是」。禁止「本节将介绍」「如上文所述」「详见笔记」。

**不要照抄原书译文**：用你自己的话讲，但**事实、术语、模式名、书中案例要忠于原文**。中文模式名照抄大纲，英文原名保留在 `from` 与首次出现处。

---

## 三、素材获取

原书由作者免费公开。**每个模式请先读原书对应章节**（中英对照完整版），再动笔：

基础 URL：`https://raw.githubusercontent.com/xindoo/agentic-design-patterns/main/bilingual/`

用 `web_fetch` 抓取，URL 需把空格转成 `%20`。各章精确文件名与直链如下（**直接用，不要改**）：

| 原书章节 | 直链 |
|---|---|
| Ch1 Prompt Chaining | `.../bilingual/Chapter%201_%20Prompt%20Chaining.md` |
| Ch2 Routing | `.../bilingual/Chapter%202_%20Routing.md` |
| Ch3 Parallelization | `.../bilingual/Chapter%203_%20Parallelization.md` |
| Ch4 Reflection | `.../bilingual/Chapter%204_%20Reflection.md` |
| Ch5 Tool Use | `.../bilingual/Chapter%205_%20Tool%20Use.md` |
| Ch6 Planning | `.../bilingual/Chapter%206_%20Planning.md` |
| Ch7 Multi-Agent Collaboration | `.../bilingual/Chapter%207_%20Multi-Agent%20Collaboration.md` |
| Ch8 Memory Management | `.../bilingual/Chapter%208_%20Memory%20Management.md` |
| Ch9 Learning and Adaptation | `.../bilingual/Chapter%209_%20Learning%20and%20Adaptation.md` |
| Ch10 MCP | `.../bilingual/Chapter%2010_%20Model%20Context%20Protocol%20%28MCP%29.md` |
| Ch11 Goal Setting and Monitoring | `.../bilingual/Chapter%2011_%20Goal%20Setting%20and%20Monitoring.md` |
| Ch12 Exception Handling and Recovery | `.../bilingual/Chapter%2012_%20Exception%20Handling%20and%20Recovery.md` |
| Ch13 Human-in-the-Loop | `.../bilingual/Chapter%2013_%20Human-in-the-Loop.md` |
| Ch14 Knowledge Retrieval (RAG) | `.../bilingual/Chapter%2014_%20Knowledge%20Retrieval%20%28RAG%29.md` |
| Ch15 Inter-Agent Communication (A2A) | `.../bilingual/Chapter%2015_%20Inter-Agent%20Communication%20%28A2A%29.md` |
| Ch16 Resource-Aware Optimization | `.../bilingual/Chapter%2016_%20Resource-Aware%20Optimization.md` |
| Ch17 Reasoning Techniques | `.../bilingual/Chapter%2017_%20Reasoning%20Techniques.md` |
| Ch18 Guardrails & Safety | `.../bilingual/Chapter%2018_%20Guardrails_Safety%20Patterns.md` |
| Ch19 Evaluation and Monitoring | `.../bilingual/Chapter%2019_%20Evaluation%20and%20Monitoring.md` |
| Ch20 Prioritization | `.../bilingual/Chapter%2020_%20Prioritization.md` |
| Ch21 Exploration and Discovery | `.../bilingual/Chapter%2021_%20Exploration%20and%20Discovery.md` |
| 附录 C 框架速览 | `.../bilingual/Appendix%20C%20-%20Quick%20overview%20of%20Agentic%20Frameworks.md` |
| 附录 E 命令行智能体 | `.../bilingual/Appendix%20E%20-%20AI%20Agents%20on%20the%20CLI.md` |
| 附录 G 编程智能体 | `.../bilingual/Appendix%20G%20-%20%20Coding%20agents.md` |

**抓取提示词建议**（保留细节，不要泛泛概括）：
> 提取本章：1) 模式的准确定义；2) 症状与适用场景；3) 核心机制与关键设计点；4) 书中给出的具体案例/场景；5) 反模式与常见误用；6) 关键要点（Key Takeaways）；7) 代码示例中的关键 API 与结构。保留书中的具体术语、数字与例子。

**不要编造**：书里没写的数字、框架版本、案例不要补。若某节原书内容单薄，就写短一点，不要灌水。

---

## 四、分单元大纲

---

### 单元 P7-A · key = `p7a` —— 第 18 章 基础模式（7 节）

| id | t | from | rel | qs | 篇幅 |
|---|---|---|---|---|---|
| `18.1` | 提示链 | 第 1 章 · Prompt Chaining | `12-智能体设计模式/00-模式总览·21个模式速查.md` ; `02-AI-Agent开发/提示词工程-写作方法论.md` ; `00-小白课堂/小白课-提示词工程进阶.md` | `dp-01` | 全 |
| `18.2` | 路由 | 第 2 章 · Routing | `12-智能体设计模式/00-模式总览·21个模式速查.md` ; `01-名词与概念/Prompt与提示词工程.md` ; `02-AI-Agent开发/ReAct与Agent设计模式.md` | `dp-02` | 全 |
| `18.3` | 并行化 | 第 3 章 · Parallelization | `12-智能体设计模式/00-模式总览·21个模式速查.md` ; `04-Python/面向AI开发的Python.md` ; `01-名词与概念/SDK框架与库.md` | `dp-03` | 全 |
| `18.4` | 反思 | 第 4 章 · Reflection | `12-智能体设计模式/00-模式总览·21个模式速查.md` ; `02-AI-Agent开发/ReAct与Agent设计模式.md` ; `02-AI-Agent开发/Agent自进化.md` | `dp-04` | 全 |
| `18.5` | 工具使用 | 第 5 章 · Tool Use (Function Calling) | `12-智能体设计模式/00-模式总览·21个模式速查.md` ; `02-AI-Agent开发/工具调用实战.md` ; `01-名词与概念/FunctionCalling函数调用.md` | `dp-05` | 插接 |
| `18.6` | 规划 | 第 6 章 · Planning | `12-智能体设计模式/00-模式总览·21个模式速查.md` ; `02-AI-Agent开发/ReAct与Agent设计模式.md` ; `02-AI-Agent开发/Agent核心架构.md` | `dp-06` | 插接 |
| `18.7` | 多智能体协作 | 第 7 章 · Multi-Agent Collaboration | `12-智能体设计模式/00-模式总览·21个模式速查.md` ; `02-AI-Agent开发/CrewAI多智能体.md` ; `11-前沿进化/2026-08-22-多智能体神话破灭.md` | `dp-07` | 插接 |

> 插接节的写作重点：**模式视角 + 与第 8 章的分工 + 什么时候该选这个模式**。机制细节不要重复第 8 章，直接让读者去第 8.4 / 8.3 / 8.8 节。

---

### 单元 P7-B · key = `p7b` —— 第 19 章 高级系统（4 节）+ 第 20 章 生产关注（3 节）

| id | t | from | rel | qs | 篇幅 |
|---|---|---|---|---|---|
| `19.1` | 记忆管理 | 第 8 章 · Memory Management | `12-智能体设计模式/00-模式总览·21个模式速查.md` ; `02-AI-Agent开发/记忆与上下文工程.md` ; `01-名词与概念/上下文窗口.md` | `dp-08` | 插接 |
| `19.2` | 学习与适应 | 第 9 章 · Learning and Adaptation | `12-智能体设计模式/00-模式总览·21个模式速查.md` ; `02-AI-Agent开发/Agent自进化.md` | `dp-09` | 全 |
| `19.3` | 模型上下文协议（MCP） | 第 10 章 · Model Context Protocol (MCP) | `12-智能体设计模式/00-模式总览·21个模式速查.md` ; `01-名词与概念/MCP模型上下文协议.md` ; `02-AI-Agent开发/MCP协议实战.md` | `dp-10` | 插接 |
| `19.4` | 目标设定与监控 | 第 11 章 · Goal Setting and Monitoring | `12-智能体设计模式/00-模式总览·21个模式速查.md` ; `02-AI-Agent开发/Agent核心架构.md` ; `02-AI-Agent开发/Agent评估与调试.md` | `dp-11` | 全 |
| `20.1` | 异常处理与恢复 | 第 12 章 · Exception Handling and Recovery | `12-智能体设计模式/00-模式总览·21个模式速查.md` ; `02-AI-Agent开发/Agent评估与调试.md` ; `04-Python/新手报错速查.md` | `dp-12` | 全 |
| `20.2` | 人在回路 | 第 13 章 · Human-in-the-Loop | `12-智能体设计模式/00-模式总览·21个模式速查.md` ; `02-AI-Agent开发/Agent评估与调试.md` ; `03-AI辅助开发/VibeCoding方法论.md` | `dp-13` | 全 |
| `20.3` | 知识检索（RAG） | 第 14 章 · Knowledge Retrieval (RAG) | `12-智能体设计模式/00-模式总览·21个模式速查.md` ; `01-名词与概念/RAG检索增强生成.md` ; `00-小白课堂/小白课-RAG开卷考试.md` | `dp-14` | 插接 |

---

### 单元 P7-C · key = `p7c` —— 第 21 章 多智能体架构（7 节）

| id | t | from | rel | qs |
|---|---|---|---|---|
| `21.1` | 智能体间通信（A2A） | 第 15 章 · Inter-Agent Communication (A2A) | `12-智能体设计模式/00-模式总览·21个模式速查.md` ; `01-名词与概念/MCP模型上下文协议.md` ; `02-AI-Agent开发/CrewAI多智能体.md` | `dp-15` |
| `21.2` | 资源感知优化 | 第 16 章 · Resource-Aware Optimization | `12-智能体设计模式/00-模式总览·21个模式速查.md` ; `01-名词与概念/Token与分词.md` ; `00-小白课堂/小白课-Token与计费.md` | `dp-16` |
| `21.3` | 推理技术 | 第 17 章 · Reasoning Techniques | `12-智能体设计模式/00-模式总览·21个模式速查.md` ; `01-名词与概念/训练推理与采样参数.md` ; `00-小白课堂/小白课-Prompt提示词.md` | `dp-17` |
| `21.4` | 护栏与安全模式 | 第 18 章 · Guardrails/Safety Patterns | `12-智能体设计模式/00-模式总览·21个模式速查.md` ; `02-AI-Agent开发/Agent评估与调试.md` ; `01-名词与概念/幻觉Hallucination.md` | `dp-18` |
| `21.5` | 评估与监控 | 第 19 章 · Evaluation and Monitoring | `12-智能体设计模式/00-模式总览·21个模式速查.md` ; `02-AI-Agent开发/Agent评估与调试.md` ; `08-求职面试/大厂AI面试题总览与答题方法论.md` | `dp-19` |
| `21.6` | 优先级排序 | 第 20 章 · Prioritization | `12-智能体设计模式/00-模式总览·21个模式速查.md` ; `02-AI-Agent开发/Agent核心架构.md` | `dp-20` |
| `21.7` | 探索与发现 | 第 21 章 · Exploration and Discovery | `12-智能体设计模式/00-模式总览·21个模式速查.md` ; `02-AI-Agent开发/Agent自进化.md` | `dp-21` |

> 全部为完整节（500-800 字）。第 21 章是全书最能拉开差距的一章，写足。

---

### 单元 P7-D · key = `p7d` —— 第 22 章 原书附录精要（3 节）

| id | t | from | rel | qs | 篇幅 |
|---|---|---|---|---|---|
| `22.1` | 智能体框架速览 | 附录 C · Quick overview of Agentic Frameworks | `02-AI-Agent开发/LangChain入门.md` ; `02-AI-Agent开发/LangGraph状态图.md` ; `02-AI-Agent开发/CrewAI多智能体.md` ; `02-AI-Agent开发/Agent-Harness脚手架.md` | `ds-02` | 全 |
| `22.2` | 命令行上的智能体 | 附录 E · AI Agents on the CLI | `03-AI辅助开发/ClaudeCode与终端Agent.md` ; `02-AI-Agent开发/KimiCLI源码拆解.md` | `bh-01` | 全 |
| `22.3` | 编程智能体 | 附录 G · Coding Agents | `02-AI-Agent开发/ClaudeCode源码拆解.md` ; `03-AI辅助开发/AI编程工具对比.md` ; `02-AI-Agent开发/PiAgent极简主义拆解.md` | `bh-01` | 全 |

> `22.1` 要给出**框架选型判断**（什么时候 LangChain、什么时候 LangGraph、什么时候干脆不用框架），不要写成框架列表。
> `22.2` / `22.3` 要写清「命令行/编程智能体为什么是当下最有价值的形态」，并与教材第 11 章（源码解剖）、12.3 节的分工说明白。

---

## 五、自检清单

- [ ] 文件路径与 key 一致（P7-A → `tb-p7a.js`）
- [ ] 每个 section 的 `id` / `t` / `from` / `rel` / `qs` 与大纲逐字一致
- [ ] 每节含 `一句话说清 / 展开讲 / 动手看 / 什么时候不该用` 四个小节
- [ ] 每节含「和教材其它节的分工」那句加粗说明
- [ ] 篇幅达标（插接节 350-500 字，完整节 500-800 字，中文字符计）
- [ ] 代码块全部 `~~~` 围栏；无裸反引号；无 `${`
- [ ] `from` 字段格式正确且与原书章节对应
- [ ] 无「本节将介绍 / 如上文所述 / 详见笔记 / 综上所述 / 赋能 / 闭环」
- [ ] `learn` 全部可检验
- [ ] `node --check` 通过（报告里粘贴真实输出）
