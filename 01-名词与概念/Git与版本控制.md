---
tags: [名词解释, Git, 工具]
created: 2026-08-02
---

# Git 与版本控制

## 为什么用 Git

**Git** 是目前事实标准的**版本控制（Version Control）**工具：它给你的代码持续"存档"，每一次存档叫一个版本，你可以随时对比、回退、并行尝试不同改法。

没有 Git 的惨状：改代码改崩了回不去、文件夹里全是 `项目_最终版_v2_真的最终.zip`、多人协作互相覆盖。

> [!warning] Vibe Coding 时 Git 是救命绳
> 用 AI 写代码（见 [[VibeCoding方法论]]）时，AI 可能一次改动十几个文件、顺手把能跑的功能改坏。**养成"能跑就 commit"的习惯**，AI 改崩了一条命令回到上一个好版本，这是 vibe coding 最重要的防翻车手段，没有之一。

## 三个核心概念

```
工作区 ──git add──▶ 暂存区 ──git commit──▶ 本地仓库 ──git push──▶ 远程仓库
(你在改的文件)      (打包待提交)          (本机的历史存档)        (GitHub 上)
```

1. **Commit（提交）**：一次存档，附一句话说明改了什么。每个 commit 都有唯一编号，可以随时跳回去。
2. **Branch（分支）**：从主线岔出一条平行线做实验，成了再合并（merge）回来，废了就删掉，主线始终干净。
3. **远程仓库（Remote）**：把本地仓库同步到云端（如 GitHub），既是备份，也是协作和展示的窗口。

## 新手 8 条命令速查表

| 命令 | 作用 |
| --- | --- |
| `git init` | 在当前文件夹初始化 Git 仓库 |
| `git status` | 查看哪些文件改了、哪些待提交（最常用，随时敲） |
| `git add .` | 把所有改动放入暂存区 |
| `git commit -m "说明"` | 提交存档，引号里写这次改了什么 |
| `git log --oneline` | 查看历史提交列表 |
| `git checkout 编号` | 查看某个历史版本（后悔药） |
| `git branch 名字` / `git switch 名字` | 新建分支 / 切换分支 |
| `git push` / `git pull` | 推送到远程 / 拉取远程最新代码 |

最小工作流：

```bash
git init                      # 项目开始时装一次
# ... 写代码 / 让 AI 改代码 ...
git add .
git commit -m "完成登录功能"   # 能跑了，立刻存档
# ... AI 把代码改崩了 ...
git checkout .                # 一键回到上次 commit 的状态
```

## GitHub 是什么

**GitHub** 是最大的 Git 远程仓库托管平台：

- **备份**：代码推到 GitHub，电脑坏了也不丢。
- **协作**：多人通过分支 + Pull Request（合并申请）协同开发。
- **简历**：你的 GitHub 主页就是程序员的作品集。
- **白嫖学习**：几乎所有开源项目（FastAPI、LangChain）的源码和文档都在上面。

## .gitignore：保护你的 API Key

项目根目录放一个 `.gitignore` 文件，里面列出的文件/文件夹 Git 会**自动忽略、绝不提交**。Python + AI 项目的标配：

```gitignore
# 密钥和配置 —— 最重要的一行！
.env

# Python 缓存与虚拟环境
__pycache__/
.venv/

# 系统垃圾文件
.DS_Store
Thumbs.db
```

> [!warning] API Key 千万别提交
> API Key（见 [[API接口]]）写进代码再 push 到 GitHub，几分钟内就会被爬虫扫到并盗刷。正确做法：Key 放在 `.env` 文件里、`.env` 加进 `.gitignore`、代码里用环境变量读取。具体写法见 [[面向AI开发的Python]]。

> [!tip] 好消息
> 主流 AI 编程工具（见 [[AI编程工具对比]]）大多内置了 Git 集成：每次让 AI 改代码前自动存档、改完一键对比差异。但底层就是 Git，学会上面 8 条命令你才知道工具在替你做什么。

## 相关笔记

- [[面向AI开发的Python]]
- [[VibeCoding方法论]]
- [[AI编程工具对比]]
- [[部署与上线]]
