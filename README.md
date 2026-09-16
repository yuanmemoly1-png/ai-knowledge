# 🎤 AI 面试深度站

一个**手机优先、可离线**的 AI 求职深度学习站，直接部署在 GitHub Pages 上，手机加书签/添加到主屏幕即可随时学习。

> 网址：`https://huyuchen092-stack.github.io/ai-knowledge/`
> 主站：`.../interview/`（根路径会自动跳转）

---

## 这不是刷分小游戏

原话需求：「不是很简单的像之前做的那种，我需要能够深度学习的。」

所以这个站的核心不是 XP 和徽章，而是**逼你把话讲清楚**的四件事：

| 机制 | 怎么逼 |
|---|---|
| **盲答先行** | 打开题目先只给你题目和计时器，合上资料写关键词——主动回忆本身就在强化记忆 |
| **追问链** | 每道精讲题 3-4 层追问，一层层解锁，模拟字节/小米那种打断式连环追问 |
| **证据锚定** | 结论必须能回溯到访谈原话（英文原文 + 中文 + 来源链接），引用原话是加分项 |
| **间隔重复** | 自评「不会/半会/会了」→ 自动按 6小时 / 1 / 3 / 7 / 15 / 30 天排期回来找你 |

另外还有：**五层知识树深读**（标记已深读 + 写一句自己的话）、**模块弱项雷达**、**模拟面试组卷**、**费曼式自由笔记**、存档导出导入。

---

## 内容规模

| 内容 | 数量 | 来源 |
|---|---|---|
| 深度精讲题库 | **42 题** | 手写：每题含追问链 + 分层答题框架 + 取舍 + 雷区 + 访谈证据 |
| 媒体题库 | **827 题** | 从牛客 / 掘金 / CSDN / 腾讯云社区 / Exponent / iGotAnOffer / GitHub 公开面经收集，全部带来源链接 |
| 知识树 | **6 层 23 节点** | 技术地基 → 变革判断 → 能力模型 → 方法论 → FDE 转型 → 行动 |
| 笔记库 | **199 篇** | 技术线 167 篇 + 访谈线 32 篇（Dario Amodei / Kevin Weil / Mike Krieger / Boris Cherny / Cat Wu / Natalie Meurer / Dianne Penn / Tara Seshan…） |
| 金句库 | **23 条** | 中英对照，标注「原话 / 转述」 |

**两个知识库合并**：
- `ai知识库/`（技术线：Python、RAG、Agent、全栈、求职面试）
- `~/Desktop/youtube/AI-PM-FDE知识库/`（访谈线：AI PM × FDE）

---

## 目录结构

```
interview/                  # 站点本体（部署入口）
├── index.html
├── assets/{style.css,app.js,md.js}
├── data/
│   ├── index.js            # 生成：笔记轻量索引（标题/目录/标签/章节/双链）
│   ├── notes-c0..c17.js    # 生成：正文分模块包（按需加载）
│   ├── media-bank.js       # 生成：827 题媒体题库
│   ├── tree.js             # 手写：五层知识树
│   ├── quotes.js           # 手写：金句库
│   └── questions.js        # 手写：42 题深度精讲
├── sw.js                   # Service Worker（离线）
└── manifest.webmanifest    # PWA（添加到主屏幕）

index.html                  # 根路径：跳转主站 + 其它学习站入口
tools/
├── build-interview.mjs     # 扫描两个知识库 → 索引 + 正文包
├── build-media-bank.mjs    # 解析 research/*.md → media-bank.js
├── verify-interview.mjs    # 全链路校验（语法 + 交叉引用 + 覆盖度）
└── serve.mjs               # 本地预览（手机同局域网可访问）
research/                   # 媒体题库原始采集稿（保留可追溯）
```

---

## 重新构建

```bash
# 1) 扫描知识库（笔记有增删后运行）
node tools/build-interview.mjs

# 2) 解析媒体题库（research/*.md 有更新后运行）
node tools/build-media-bank.mjs

# 3) 校验（必须全绿）
node tools/verify-interview.mjs

# 4) 本地预览（手机连同一 WiFi 可打开提示的局域网地址）
node tools/serve.mjs
```

零依赖，只需要 Node。修改 `tree.js` / `questions.js` / `quotes.js` 是手写内容，不会被构建脚本覆盖。

---

## 数据可靠性说明

- 精讲题库的「访谈证据」中，标注**原话**的来自访谈 Q&A 或官方时间轴章节名；标注**转述**的是二手表述，引用前请回原文核对。
- 媒体题库来自公开面经聚合，答案框架多为来源方整理，**不是官方标准答案**；每条都附原始链接，请自行核对。
- 已规避以下来源：`jackaduma/LLMs_interview_notes`（因侵权投诉下架）、`naginoa/LLMs_interview_notes`（为其 fork）、`km1994/LLMs_interview_notes`（已停更且答案指向付费星球）。

---

## 部署

GitHub Pages，从 `main` 分支根目录发布。`.nojekyll` 已就位（避免 Jekyll 跳过 `_` 前缀文件并加快构建）。

更新流程：改完内容 → 跑上面 1-3 步 → `git add -A && git commit -m "..." && git push`。
