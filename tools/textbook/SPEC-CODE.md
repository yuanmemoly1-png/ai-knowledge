# 必背代码库 —— 写作规范与清单（契约）

本文件是「必背代码」34 条的**唯一契约**。id / t / group / level / rel 一律照抄。

## 一、为什么要这个库

面试里唯一能**提前背死、现场必须写对**的东西就是代码。题库考「能不能说清」，这个库考「能不能默出来」——两件事，不能互相替代。

**核心约束：代码必须能背下来**。所以每条 **10-25 行**，超了就是设计失败：要么拆条目，要么删装饰性代码。宁可写短而全，不要写长而全。

## 二、输出格式

每个写作单元输出一个 JS 文件 `interview/data/codebank-<key>.js`：

```js
// 必背代码 · <范围>
window.CODE_ITEMS = window.CODE_ITEMS || {};
Object.assign(window.CODE_ITEMS, {
  "py-list-dict": {
    id: "py-list-dict",
    t: "列表与字典常用操作",
    group: "py",
    level: "must",
    scene: "一句话说清它什么时候用——面试官让你处理数据时的第一步",
    code: "...",
    lang: "python",
    keys: ["必须写对的关键行 1", "关键行 2", "关键行 3"],
    traps: ["最常写错的地方 1", "易错点 2"],
    rel: ["04-Python/常用数据结构与函数.md"],
    tb: ["1.4"],
    qs: [],
  },
});
```

字段说明：

| 字段 | 必填 | 说明 |
|---|---|---|
| `id` / `t` / `group` / `level` | ✅ | 照抄本契约 |
| `scene` | ✅ | **什么时候会写它**，1-2 句。要具体到面试/工程场景，不要「这是一个函数」这类废话 |
| `code` | ✅ | 可运行的代码，10-25 行。**必须真跑过**（能跑的都要跑） |
| `lang` | ✅ | `python` / `bash` / `sql` / `dockerfile` / `text` |
| `keys` | ✅ | 3-5 条**默写要点**：必须写对的关键行或数值，写成判断句（如「点积后必须先除以 √d_k 再 softmax」） |
| `traps` | ✅ | 2-3 条**易错点**：默写时最容易漏、最容易写反的地方 |
| `rel` | ✅ | 关联笔记路径，**照抄契约**（须真实存在） |
| `tb` | ✅ | 关联教材节 id（照抄契约） |
| `qs` | ✅ | 关联真题 id（照抄契约），无则 `[]` |

**字符串红线**：`code` 用模板字符串（反引号）包裹；代码内部不得出现三反引号；不出现裸反引号（Python 里如需字符串引号，用单引号）；不出现 `${`（要写就写 `\${`）。

**代码质量红线**：
- 必须能真跑，变量与函数名用**中文注释**解释每步在干什么
- 不写没意义的样板（不要整页 import、不要 try 包一切）
- 允许用 `...` 占位表示「这里接你已有的实现」，但要注释说明
- 不编造 API：不确定的库函数一律不写；不确定的数字写「约」

## 三、分单元清单

---

### 单元 CODE-A · key = `codea` —— Python 地基 7 条 + 工程运维 4 条 = 11 条

#### group `py`（全部 `level: "must"`）

| id | t | tb | qs |
|---|---|---|---|
| `py-list-dict` | 列表与字典常用操作 | `1.4` | `[]` |
| `py-comprehension` | 推导式与解包 | `1.9` | `[]` |
| `py-string` | 字符串处理 | `1.3` | `[]` |
| `py-file` | 文件读写 | `1.7` | `[]` |
| `py-except` | 异常处理 | `1.6` | `[]` |
| `py-func-class` | 函数与类 | `1.8` | `[]` |
| `py-sql` | SQL 增删改查四句 | `2.2` | `[]` |

`rel` 统一从这几篇里选（按内容对应）：
`04-Python/常用数据结构与函数.md` · `04-Python/基础语法速查.md` · `04-Python/语法格式卡.md` · `04-Python/Python必背清单.md` · `01-名词与概念/数据库入门.md` · `04-Python/方法主人对照表.md`

要点：
- `py-list-dict` 覆盖：增删改查、`get` 安全取值、排序（`sorted(key=)`）、计数分组（`Counter` 或 `setdefault`）、去重保序
- `py-sql` 用 `sqlite3` 写成可跑的：建表 + 增 + 查 + 改 + 删，五条语句齐全

#### group `ops`

| id | t | level | tb | qs |
|---|---|---|---|---|
| `ops-git` | Git 协作与冲突解决 | must | `2.7` | `ops-05` |
| `ops-docker` | Docker 常用命令 | must | `3.9` | `ops-03` |
| `ops-linux` | Linux 排查命令组合 | must | `2.5` | `ops-01` |
| `ops-token-cost` | 用 tiktoken 算一次多轮任务的账 | plus | `5.6` | `ops-04` |

`rel`：`00-小白课堂/小白课-Git存档术.md` · `01-名词与概念/Git与版本控制.md` · `00-小白课堂/小白课-部署上线.md` · `01-名词与概念/部署与上线.md` · `07-工具与资源/常用工具清单.md` · `00-小白课堂/小白课-Token与计费.md` · `01-名词与概念/Token与分词.md`

要点：
- `ops-git` 给**命令序列**：建分支 → 改 → 提交 → 推送 → 发 PR → 合并；再给一段**解决冲突**的完整序列（含 `git status` 看冲突、改文件、`git add`、`git commit`）
- `ops-linux` 给**排查组合**：看服务起没起 / 看日志还在滚什么 / 看端口被谁占 / 看进程还在不在 / 看磁盘满没满
- `ops-token-cost` 是那 10 行左右的算账脚本（含系统提示每轮重发这个要点）

---

### 单元 CODE-B · key = `codeb` —— AI 应用骨架 14 条

| id | t | level | tb | qs |
|---|---|---|---|---|
| `ai-llm-min` | 最小 LLM 调用 | must | `6.5` | `pt-01` |
| `ai-messages` | messages 三角色与多轮 | must | `6.5` | `pt-01` |
| `ai-stream` | 流式输出 | must | `6.5` | `in-04` |
| `ai-json` | 结构化输出与解析兜底 | must | `6.5` | `ev-03` |
| `ai-tools-schema` | 工具的 JSON Schema 怎么写 | must | `8.4` | `ag-03` |
| `ai-fc` | Function Calling 完整循环 | must | `8.4` | `ag-03` |
| `ai-react` | ReAct Agent 循环（含 max_steps） | must | `8.7` | `ag-01` |
| `ai-rag` | RAG 四段式 | must | `7.2` | `rg-02` |
| `ai-embed` | Embedding 与余弦相似度 | must | `7.1` | `rg-01` |
| `ai-context` | 上下文裁剪与摘要压缩 | plus | `8.6` | `mm-01` |
| `ai-retry` | 重试与指数退避 | must | `20.1` | `dp-12` |
| `ai-fastapi` | FastAPI + pydantic 最小服务 | must | `3.5` | `ds-02` |
| `ai-pytest` | pytest 测试（含 LLM 结构断言） | plus | `2.6` | `ops-02` |
| `ai-dockerfile` | Dockerfile | must | `3.9` | `ops-03` |

`rel` 从这些里按内容对应选（须真实存在）：
`00-小白课堂/小白课-实战API第一课.md` · `00-小白课堂/小白课-实战messages三角色.md` · `00-小白课堂/小白课-实战流式与结构化.md` · `00-小白课堂/小白课-实战工具调用.md` · `00-小白课堂/小白课-实战最小Agent.md` · `00-小白课堂/小白课-实战RAG迷你版.md` · `02-AI-Agent开发/工具调用实战.md` · `01-名词与概念/FunctionCalling函数调用.md` · `02-AI-Agent开发/Agent核心架构.md` · `01-名词与概念/RAG检索增强生成.md` · `01-名词与概念/Embedding向量嵌入.md` · `02-AI-Agent开发/记忆与上下文工程.md` · `09-全栈开发/FastAPI后端实战.md` · `02-AI-Agent开发/Agent评估与调试.md` · `01-名词与概念/部署与上线.md` · `02-AI-Agent开发/MCP协议实战.md`

要点：
- `ai-fc` 与 `ai-tools-schema` 分工明确：前者是**主循环**（请求 → 拿到 tool_calls → 执行 → 把结果塞回 messages → 再请求），后者只讲 **schema 怎么写才不让模型选错**（描述怎么填、参数类型、必填项）
- `ai-react` 必须是「Thought → Action → Observation」的真实循环，含 `MAX_STEPS` 保险丝与「超步数怎么办」
- `ai-rag` 给**离线四步**（切分→向量化→入库→检索）与**在线一步**（拼上下文生成）的完整最小实现
- `ai-retry` 强调指数退避 + 抖动 + 上限，并点明「不是所有错误都该重试」
- `ai-json` 必须含解析失败兜底，且注释说明「模型偶尔会加 markdown 围栏」
- 模型名/SDK 调用用**通用写法**（`client.chat.completions.create`），不锁定具体版本号

---

### 单元 CODE-C · key = `codec` —— 算法岗手撕 6 条 + 评测 3 条 = 9 条

#### group `algo`（全部 `level: "algo"`）

| id | t | tb | qs |
|---|---|---|---|
| `algo-attention` | 手写 Self-Attention | `5.1` | `tf-02` |
| `algo-mha` | 多头注意力 | `5.1` | `tf-01` |
| `algo-layernorm` | LayerNorm | `5.1` | `tf-05` |
| `algo-kvcache` | KV Cache | `5.5` | `in-01` |
| `algo-lora` | LoRA 注入 | `9.3` | `ft-01` |
| `algo-softmax-ce` | softmax 与交叉熵 | `5.2` | `tf-04` |

`rel`：`06-深度学习与名校课程/从零实现LLM专题.md` · `06-深度学习与名校课程/PyTorch与数学基础.md` · `01-名词与概念/LLM大语言模型.md` · `01-名词与概念/训练推理与采样参数.md` · `01-名词与概念/微调Fine-tuning.md` · `06-深度学习与名校课程/大模型训练方向.md`

要点：
- 用 **PyTorch** 写（面试手撕的默认环境）；`algo-attention` 必须是可跑的完整函数，含形状注释
- `algo-attention` 的 `keys` 必须包含**「点积后除以 √d_k 再 softmax」**和**因果掩码用上三角 -inf**
- `algo-softmax-ce` 要含**数值稳定技巧**（减最大值，说清为什么）
- `algo-kvcache` 写「缓存 K/V 而不重算」的最小演示 + 为什么吃显存
- 不锁定模型规模数字；不写具体跑分

#### group `eval`

| id | t | level | tb | qs |
|---|---|---|---|---|
| `eval-passrate` | 评测集与通过率脚本 | must | `8.12` | `ev-04` |
| `eval-llmjudge` | LLM-as-judge 打分骨架 | plus | `8.12` | `ev-04` |
| `eval-error-analysis` | 错误分析归类脚本 | plus | `8.12` | `ev-04` |

`rel`：`02-AI-Agent开发/Agent评估与调试.md` · `yt/03-知识专题/专题-A2-AI评测Evals.md` · `02-AI-Agent开发/案例-知识库整理助手.md`

要点：
- `eval-passrate`：用例列表 + 逐条跑 + 结构/关键词判定 + 通过率输出，**20 行以内**
- `eval-llmjudge`：给**评分标准（rubric）**而不是「打个分」；含一条已知偏差的注释（如偏长答案）
- `eval-error-analysis`：把失败案例**归类输出**（检索没中 / 提示词缺约束 / 模型能力），能直接跑

---

## 四、自检清单

- [ ] 文件路径与 key 一致（CODE-A → `codebank-codea.js`）
- [ ] 每条 `code` **10-25 行**；能跑的**真跑过**（报告里附证据）
- [ ] `keys` 3-5 条、`traps` 2-3 条，且都是判断句不是名词堆
- [ ] `id / t / group / level / rel / tb / qs` 与契约逐字一致
- [ ] 无三反引号、无裸反引号、无未转义 `${`
- [ ] `node --check` 通过（报告粘贴真实输出）
- [ ] 不编造 API 与数字
