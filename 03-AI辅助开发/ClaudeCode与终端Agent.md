---
tags: [AI辅助开发, ClaudeCode, Agent开发]
created: 2026-08-02
---

# ClaudeCode与终端Agent

Claude Code 是 Anthropic 官方的命令行 AI Agent：没有图形界面，你在终端里用自然语言下指令，它自主读文件、改代码、跑命令、看结果、继续迭代。它代表了 AI 辅助开发的「自主层」形态。

## CLI 类 Agent 的特点

与 IDE 类工具（如 Cursor）相比，CLI Agent 有鲜明的性格：

| 维度 | CLI Agent（Claude Code 等） | IDE 工具（Cursor 等） |
| --- | --- | --- |
| 交互方式 | 终端对话，以「任务」为单位 | 图形界面，以「编辑」为单位 |
| 上下文获取 | 自主遍历整个代码库 | 主要看你打开/引用的文件 |
| 自主性 | 强：读库→改码→跑测试全自动闭环 | 中：每步改动等你确认 |
| 上手门槛 | 需要会用命令行 | 接近普通编辑器 |
| 适合场景 | 大型仓库、跨文件重构、批量任务 | 日常写码、局部修改、补全提效 |

> [!note] 本质区别
> CLI Agent 更像一个坐在你终端里的「初级工程师」，IDE 工具更像一个「超级自动补全 + 结对编程伙伴」。前者你交代任务，后者你带着它干活。

## 安装方式

需要 Node.js 环境（18+），然后一行命令：

```bash
npm install -g @anthropic-ai/claude-code
```

装完在任意项目目录下启动：

```bash
cd your-project
claude
```

首次启动会引导登录（Anthropic 账号或 API Key），之后输入自然语言即可开始工作。

> [!tip] Node.js 还没装？
> 先去 Node.js 官网下载 LTS 版本安装，装完 `node -v` 能输出版本号即可。包管理相关的通用知识见 [[环境搭建与包管理]]。

## 常用工作流

### 1. 读懂陌生代码库

接手一个老项目，先让它画地图：

```text
> 通读这个仓库，告诉我：整体架构是什么？入口文件在哪？
  核心的数据流从哪到哪？哪些文件最关键？
```

它会自主翻目录、读关键文件，给你一份「导读报告」。之后可以追问：「`utils/parser.py` 里的 `parse_config` 是干嘛的？谁调用了它？」

### 2. 改 bug

把报错日志直接粘进去：

```text
> 跑 npm test 报这个错：[粘贴报错]。定位原因并修复，修完重新跑测试确认。
```

典型闭环：定位文件 → 给出修复 diff → 你确认 → 跑测试 → 如果还红，看新报错继续修，直到全绿。

### 3. 跑测试与批量任务

```text
> 给 src/services/ 下所有没有测试的模块补上 pytest 单元测试，
  每个模块至少覆盖正常路径和一个异常分支，跑通为止。
```

这类「规则明确、重复量大」的任务是 CLI Agent 的强项。

> [!warning] 给它划好边界
> Agent 能执行任意终端命令，删文件、改配置都做得出来。重要操作前确保有 git 提交兜底；对 `rm -rf`、数据库操作类指令，它默认会请求确认，不要图省事全部无脑放行。

## CLAUDE.md 项目记忆文件

`CLAUDE.md` 是放在项目根目录的「长期记忆」文件，Claude Code 每次启动都会自动读取，相当于 Cursor 的 rules（见 [[Cursor实战指南]]）。它本质上是 [[记忆与上下文工程]] 在编程工具中的落地。

示例 `CLAUDE.md`：

```markdown
# 项目说明
Flask + SQLite 的待办清单 API 服务，Python 3.11。

# 常用命令
- 启动开发服务：flask --app app run --debug
- 跑测试：pytest -x
- 格式化：ruff format .

# 代码约定
- 所有接口返回统一格式：{"code": 0, "data": ..., "msg": ""}
- 数据库访问必须走 models/ 层，视图函数里禁止直接写 SQL
- 新功能必须配 pytest 测试，放在 tests/ 对应模块下

# 注意事项
- SECRET_KEY 从环境变量读，严禁硬编码
- migrations/ 目录由 Alembic 生成，不要手动改
```

写法要点：

- **写「每次都要记住的事」**：命令、规范、禁区。临时需求写进对话里，别污染 CLAUDE.md。
- **给命令不给描述**：「跑测试：pytest -x」比「请保持测试通过」有用得多。
- **定期更新**：项目结构变了、加了新约定，同步更新 CLAUDE.md，否则 AI 会按过期记忆干活。

## 与 IDE 类工具如何互补

两者不互斥，常见搭配是：

- **IDE 工具管「写」**：日常在 Cursor 里写新功能，享受 Tab 补全和即时光标级编辑。
- **CLI Agent 管「改」**：遇到「全仓库把旧接口 `getUserInfo` 换成 `fetchProfile`」这类跨几十个文件的重构，交给 Claude Code 一次性跑完并自测。
- **CLI Agent 管「查」**：接手陌生仓库，先让 Claude Code 出导读报告，再回 IDE 精读。

> [!tip] 共享一份项目说明
> 可以让 `CLAUDE.md` 与 `.cursor/rules/` 内容互相引用同一个规范文件，避免两边规则漂移。比如 Cursor rules 里写一句「规范详见根目录 CLAUDE.md」。

## 相关笔记

- [[Cursor实战指南]]
- [[AI编程工具对比]]
- [[VibeCoding方法论]]
- [[Agent开发总览]]
