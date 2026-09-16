---
tags: [Agent开发, 源码解剖, Harness, DeepSeekHarness, 实操]
created: 2026-08-06
---

# DSH-07 · 实操：复制 Preset 改出自己的 Agent

> [!note] 这一篇干什么
> 前面都在"读"，这篇**动手**：把出厂的标准 Agent 复制一份，改成你自己专属的版本（换人设、加/删工具），然后验证它能正常启动。全程不碰出厂文件，只改你的副本。

> [!warning] 先记住三条铁律
> 1. **永远不改出厂 preset**（`standard` / `code` / `minimal` / `cordis`）——升级会覆盖，改坏 `cordis` 连"自修改"能力都没了。
> 2. 改 preset 前，先加载技能 `editing-cordis-compositions`——它就是官方操作手册。
> 3. 动手前先想清"这个能力属于哪一层"（[[DSH-03-两个平面Host与Preset]]）。

## 一个 preset = 一个目录

回顾 [[DSH-04-配置文件与Preset结构]]：一个 preset 就是一个目录，里面装着"配方"：

```
my-agent/
  ├── preset.yml           ← 元数据：名字、描述（给选择器看的"名片"）
  └── agent.cordis.yml     ← 真配方：一行行插件（工具/技能/人设）
```

你自己的 preset 放在：`${DSH_HOME:-$HOME/.dsh}/.agent-presets/<id>/`（读作：用 `DSH_HOME` 环境变量，没设就用 `~/.dsh`）。出厂那批在部署目录里，**只能读、不能写**。

## 找到你的"户型图"：roster 服务

DSH 里有个服务叫 `agentPresets`（"预设花名册"），它是发现、复制、校验 preset 的唯一入口：

| 方法 | 干什么 |
| --- | --- |
| `list()` | 列出所有 preset：id、trust（`system` 出厂 / `user` 你自己）、绝对路径 |
| `read(id)` | 直接读某个 preset 的配置内容 |
| `copy(from, id, name?)` | **唯一的写操作**：把某个 preset 整个复制成你的新 preset |
| `standingKeyFor(id)` | 校验某个 preset 能不能正常挂载（"开机演练"） |

> [!tip] 路径别靠猜
> 每个 preset 的真实路径从 `list()` 拿，别猜安装目录结构（不同部署可能换地方）。`copy()` 也会告诉你它建在了哪。

## 第 1 步：从副本开始（用 copy，别用 shell 复制）

推荐用 `copy()` 而不是手动 `cp`：

- 它**整体复制**：配置、元数据、技能目录、资源全带上。
- 它**校验 id**：只允许 `[a-z0-9][a-z0-9-]*`（会变成目录名，所以不能以 `-` 开头），重复 id 会拒绝。
- 复制失败会**回滚**，不留半成品。
- 它自动重写副本的 `preset.yml`：**保留描述、去掉名字和出厂排序**（免得你的副本和出厂撞名、抢排序）。

通常从 `standard`（功能最全的编码 Agent）复制。例：`copy('standard', 'my-agent', '我的专属助手')`。

## 第 2 步：补上元数据

复制后，副本里的 `preset.yml` 只剩 `description`。你要补上名字：

```yaml
name: 我的专属助手
description: 在标准模式基础上，只保留我需要的工具。
```

> [!warning] 不写元数据的后果
> 没有 `name` / `description` 的 preset，在每个选择器里只会显示成一串光秃秃的目录名。

## 第 3 步：改 agent.cordis.yml（一行一个能力）

副本里的 `agent.cordis.yml` 就是配方。常用三种改法：

| 想干什么 | 怎么改 |
| --- | --- |
| 换个性格 | 改 `persona` 那行的 `text`（人设文本） |
| 关掉某个工具 | 给那行加 `disabled: true` |
| 加回某个工具 | 把出厂模板里 `disabled: true` 删掉 |

例：关掉"待办清单"工具：

```yaml
- id: tool-todo
  name: '@deepseek-ai/dsh-tool-todo'
  disabled: true          # ← 加这一行 = 拔掉这个工具
```

## 第 4 步：守住 realm 规则（最容易翻车的一步）

**"会发布服务的插件行，不能光溜溜地放在 preset 里。"**

- 不隔离 → 它进全局域 → 第二个会话挂载同一个 preset 就**撞车报错**。
- 正确做法：把"提供服务的那行 + 所有用到它的行"圈进一个带 `isolate` 的组里。

```yaml
- id: my-group
  name: cordis:group
  group: true
  isolate:
    myService: true        # 这个服务是本会话私有实例
  config:
    - id: my-provider      # 提供服务的行
      name: '@deepseek-ai/some-provider'
    - id: my-consumer      # 用到它的行
      name: '@deepseek-ai/some-consumer'
```

> [!tip] 怎么知道一行是不是"提供服务"？
> 看名字看不出来。读运行时：`cordis_inspect what:"services"` 会列出每个服务 + 它的"归属"。**归属不是你这行的服务 = 你只是消费它，不用隔离；归属是你的 = 必须隔离。**

## 第 5 步：用 standingKeyFor 校验（开机演练）

改完别直接开真会话，先"演练开机"：`standingKeyFor('my-agent')`。

它把 preset 的插件子树**真实地拼一遍**（和真开机一样，只是不启动 Agent），四种坏法都能抓出来：

| 报错 | 意思 |
| --- | --- |
| `Cannot find package …` | 有插件包不存在（拼错名字） |
| `invalid config: …` | 配置字段不合法 |
| `N row(s) did not activate: … waiting for <service>` | 有行一直在等一个没人提供的服务 |
| `published process-global service(s) [<name>]` | 服务漏了 isolate（第 4 步的坑） |

返回正常 = 能挂载；失败 = 它把子树拆干净，不残留。

> [!warning] 别拿 `list()` 的 `broken` 字段当校验
> `broken` 只做"形状检查"（文件能不能解析、有没有行），上面四种坏法它全抓不到。**真正的验收是 `standingKeyFor`。**

## 第 6 步：开真实会话确认

校验通过后，让用户开一个新会话、选你的 preset，确认**工具列表**符合预期——因为 preset 决定工具的 schema 和提示词片段，只有真会话能看到最终效果。

## 一个完整心法

```text
copy(复制副本) → 补元数据 → 改配方(一行一个能力) → 守 realm 规则
      → standingKeyFor 校验 → 开真会话确认
```

> [!important] 记住这句
> **副本是你的，出厂的不是。** 改 preset 的全部秘密：复制 → 一行行改 → 用 `standingKeyFor` 验收。

## 相关笔记

- [[DSH-03-两个平面Host与Preset]]
- [[DSH-04-配置文件与Preset结构]]
- [[DeepSeekHarness框架拆解]]
- [[Agent开发总览]]
