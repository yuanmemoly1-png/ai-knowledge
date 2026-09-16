---
tags: [Agent开发, 源码解剖, Harness, DeepSeekHarness]
created: 2026-08-06
---

# DSH-04 · 配置文件与 Preset 结构

> [!note] 一句话定义
> DSH 的"最终效果"不是写死在代码里的，而是**一堆 `cordis.yml` 配置文件像透明胶片一样一层层叠出来的**。这一篇讲：胶片有哪几层、怎么叠、以及"一个 preset（预设）"这个核心概念到底长什么样。

## 叠层模型：五张透明胶片

DSH 启动时，从"一张白纸"（空配置）开始，依次往上叠：

```
 ┌─────────────────────────────┐
 │ 5. --patch 命令行覆盖层        │ ← 临时改一下，最高优先级
 ├─────────────────────────────┤
 │ 4. 用户 home 级 cordis.patch.yml │ ← 全局的"我的偏好"
 ├─────────────────────────────┤
 │ 3. profile 自己的 cordis.patch.yml│ ← 这个 profile 的"我的偏好"
 ├─────────────────────────────┤
 │ 2. dsh.profile 里列出的各 bundle  │ ← 套餐自带的插件包（可能多个）
 ├─────────────────────────────┤
 │ 1. 空根（什么都没有）            │
 └─────────────────────────────┘
```

**规律：越靠上，优先级越高。** 上面的层能"盖住"下面层的同名配置。这就是"组合(composition)"——最终配置 = 这些层叠加的结果。

> [!tip] 关键：改哪一层？
> 你几乎永远**不直接改 bundle 层**（那是套餐自带的），而是改你自己的 `cordis.patch.yml`。官方在 home 目录的 `cordis.yml` 里甚至明说：*"This file is empty on purpose. Edit cordis.patch.yml, not this file."*（这个文件故意是空的，要改就改 patch 文件）。

## profile 目录长什么样

一个 profile 就是一个目录，里面的东西（在 [[DSH-01-Harness定位与入口]] 提过，这里展开）：

| 文件 | 作用 | 类比 |
| --- | --- | --- |
| `package.json` | 记录额外装进来的插件依赖 | 购物清单 |
| `dsh.profile` | 清单：按顺序列 bundle（插件组合包） | 套餐菜单 |
| `cordis.patch.yml` | 你自己的补丁层 | 你的备注批改 |
| `cordis.yml` | （可能只有空列表 `[]`）根入口 | 白纸一张 |

bundle 从哪解析？先找 DSH 安装目录里自带的（如 `@deepseek-ai/dsh-base`、`@deepseek-ai/dsh-web-app`、`@deepseek-ai/dsh-headless`），再找 profile 自己的 `node_modules`（你额外装的插件就在这）。

## preset 是什么（核心概念）

**preset（预设）是"一份 Agent 配方"**：它规定了这一个 Agent 拥有哪些工具、技能、人设。不同的 preset = 不同的 Agent 性格与能力。

DSH 自带几个 preset：

| preset | 中文名 | 特点 |
| --- | --- | --- |
| `minimal` | 极简 | 能力最少，只保底 |
| `standard` | 标准模式 | 功能完整的编码 Agent：文件、命令、搜索、技能、计划、目标、子代理、工作流 |
| `code` | （代码） | 面向写代码场景 |
| `cordis` | 创造模式 | **= standard 全部能力 + 能读写它自己运行时**（自修改工具集 + 组合编写技能） |

> [!note] 你现在用的是 `cordis` 预设
> 我（这个会话）跑在 **cordis（创造模式）** 上——这就是为什么我能"拆解自己"：这个预设比 standard 多了一套"读写运行时"的工具，以及教你怎么写组合的技能。它是用来"让 AI 造 AI"的。

### 一个 preset 目录的结构

```
config/agent-presets/
  └── standard/
        ├── preset.yml          ← 元信息：名字、描述、排序
        └── agent.cordis.yml    ← 真正的配方：一行行插件（工具/技能/人设）
```

- `preset.yml` 只是"名片"：`name`、`description`、`order`。
- `agent.cordis.yml` 才是"配方"：一行一个插件，[[DSH-02-Cordis插件化思想]] 里见过的 `- id / name / config` 那种。

### 真实配方片段（看懂它）

这是 `standard` 预设 `agent.cordis.yml` 里的几行，我逐行翻译：

```yaml
- id: tool-fs                          # 行名：文件工具
  name: '@deepseek-ai/dsh-tool-fs'     # 用的是这个 npm 包

- id: tool-pwsh                        # 行名：PowerShell 工具
  name: '@deepseek-ai/dsh-tool-pwsh'
  disabled: !!js process.platform !== 'win32'   # 表达式：非 Windows 就禁用
```

- `!!js ...` 是"内嵌 JavaScript 表达式"，让配置能根据环境动态开关（比如 Windows 才开 PowerShell 工具）。
- 所以"我"在你这台 Windows 机器上能跑 PowerShell 命令，就是这一行配出来的。

## 你该怎么改（以及绝不该碰的）

> [!warning] 铁律：别改"出厂预设"
> 出厂的那批 preset（部署目录里的 `agent-presets/`）属于部署方，**升级会覆盖**，改坏了 `cordis` 预设还会把"创造模式"本身搞坏。想改，就**把它的组合复制成一个新 preset 目录，改那份副本**。

你自己写的 preset 放这里：

```
${DSH_HOME:-$HOME/.dsh}/.agent-presets/<id>/
```

（`${DSH_HOME:-$HOME/.dsh}` 读作：用 `DSH_HOME` 环境变量，没设就用 `~/.dsh`。）想动组合之前，官方还要求先加载一个技能：`editing-cordis-compositions`（教你哪里能改、怎么判断归属）。

> [!tip] 一眼记住
> **最终配置 = 五张胶片叠出来；preset = 一份 Agent 配方；要改就复制出厂 preset 再改副本，永远别动原厂。**

## 相关笔记

- [[DSH-03-两个平面Host与Preset]]
- [[DSH-02-Cordis插件化思想]]
- [[DSH-01-Harness定位与入口]]
- [[DeepSeekHarness框架拆解]]
