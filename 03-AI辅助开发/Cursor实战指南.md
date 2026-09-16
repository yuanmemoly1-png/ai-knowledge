---
tags: [AI辅助开发, Cursor, 编程工具]
created: 2026-08-02
---

# Cursor实战指南

Cursor 是当前最流行的 AI IDE，基于 VS Code 内核改造——你的 VS Code 插件、快捷键、设置几乎可以无缝迁移。本笔记带你从安装走到一个完整实战工作流。

## 安装与界面

1. 到 Cursor 官网下载对应系统（Windows/macOS/Linux）的安装包，正常安装。
2. 首次启动时选择「从 VS Code 导入」，一键迁移插件和配置。
3. 登录账号（免费额度，超出后需订阅 Pro）。

界面与 VS Code 几乎一致，多出的核心区域是：

- **右侧 AI 面板**：Chat 和 Agent 模式都在这里对话。
- **Tab 补全**：写代码时灰色的预测文字，按 `Tab` 采纳。

> [!tip] 必会的三个快捷键
> - `Ctrl + K`：选中代码后行内编辑（「把这段改成 async 写法」）
> - `Ctrl + L`：打开 Chat 对话
> - `Tab`：采纳补全建议

## 三大核心功能

### 1. Tab 补全（自动预测）

Cursor 会预测你下一步要写什么——不只是当前行，还能跨行、跨位置预测编辑。你敲几个字符，它把整段灰色显示出来，`Tab` 采纳，`Esc` 拒绝。

```python
def calc_total(items: list[dict]) -> float:
    # 敲到这里，Cursor 通常会直接补出整个函数体：
    return sum(item["price"] * item["count"] for item in items)
```

> [!note] 为什么 Tab 补全这么准？
> 背后是 [[LLM大语言模型]] 结合了你当前文件、打开的标签页、最近的编辑历史做预测。你打开的相关文件越多、命名越规范，补全越准。

### 2. Chat（对话式问答）

选中代码 → `Ctrl + L` → 提问。适合「解释这段代码」「为什么报这个错」「这个库怎么用」这类不动代码的问题。Chat 只给建议，改动需要你确认后才落盘。

### 3. Agent（自主改码）

在 AI 面板切换到 Agent 模式，给一个目标，它会自主规划：读相关文件 → 修改多个文件 → 运行终端命令 → 根据报错继续修。每一步改动都会列出 diff，你可以逐个接受或拒绝。

> [!warning] Agent 模式使用守则
> - 任务要小而明确：「给 users 模块加邮箱格式校验」✅，「帮我重构成微服务」❌
> - 每个 diff 都要扫一眼再接受，别无脑全选
> - 动手前先 `git commit`，出问题随时回滚（详见 [[VibeCoding方法论]]）

## rules 规则文件

rules 是写给 AI 看的「项目说明书」，放在 `.cursor/rules/` 目录下（旧版本用项目根目录的 `.cursorrules` 文件）。AI 每次对话都会参考它，能让输出稳定贴合你的项目规范。

示例 `.cursor/rules/python-style.md`：

```markdown
---
description: Python 代码规范
globs: *.py
alwaysApply: false
---

- 使用 Python 3.11+ 语法，类型标注必须写全
- 函数用 snake_case，类用 PascalCase
- 每个公共函数写中文 docstring，说明参数和返回值
- 不要引入 requirements.txt 里没有的第三方库
- 数据库操作必须用 SQLAlchemy，禁止手写 SQL 字符串
```

要点：

- `description`：一句话说明规则用途，Agent 据此决定何时引用。
- `globs`：限定规则只对匹配文件生效（如只对 `*.py`）。
- `alwaysApply: true`：每次对话都强制带上，只给最重要的全局规则用。
- 规则写具体、可执行（「用 snake_case」），别写空话（「代码要优雅」）。

## @ 符号引用上下文

在 Chat/Agent 输入框里敲 `@` 可以精确塞入上下文，这是用好 Cursor 的关键技巧：

- `@文件名`：引用整个文件
- `@文件夹`：引用目录结构
- `@Code`：引用选中的代码块
- `@Docs`：引用官方文档（可添加自定义文档链接）
- `@Web`：联网搜索最新资料

> [!example] 一个好的提问方式
> 「@models.py @api/user.py 我在 models 里给 User 加了 nickname 字段，帮我把 api/user.py 里的注册接口和响应同步更新，并补一个校验：nickname 最长 20 字符。」
>
> 显式给出相关文件，比让 AI 自己满库乱找又快又准。

## 一个完整实战工作流

以「给 Flask 项目加一个用户注册接口」为例：

1. **提交基线**：`git commit -am "before: add register api"`，确保随时可回滚。
2. **写清楚任务**：Agent 模式输入——「参考 @api/login.py 的写法，新增 POST /api/register：参数 username/password/nickname，密码用 bcrypt 哈希，username 重复返回 409，写对应的 pytest 测试。」
3. **审查 diff**：逐个文件看改动，重点看密码处理和异常分支，接受合理的、打回不合理的。
4. **跑测试验证**：让 Agent 执行 `pytest tests/test_register.py`，红了就让它看报错继续修。
5. **人工补验**：自己手动 curl 一遍接口，测重复注册、超长输入等边界。
6. **提交成果**：`git commit -am "feat: user register api"`。

> [!tip] 让 AI 顺手写测试
> 每次让 Agent 改代码都附带一句「并写对应测试」，成本几乎为零，却能在后续迭代中帮你兜住大量回归问题。

## 相关笔记

- [[AI编程工具对比]]
- [[ClaudeCode与终端Agent]]
- [[VibeCoding方法论]]
- [[AI编程工具课程]]
- [[Prompt与提示词工程]]
