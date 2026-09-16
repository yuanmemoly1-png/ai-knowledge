---
tags: [Agent开发, MCP, Python]
created: 2026-08-02
---

# MCP 协议实战

MCP（Model Context Protocol，模型上下文协议）是 Anthropic 提出的开放协议，目标是**标准化「LLM 应用连接外部工具与数据」的方式**：工具提供方写一个 MCP server，任何支持 MCP 的客户端（Claude Desktop、Cursor 等）都能即插即用。概念详解见 [[MCP模型上下文协议]]，本文聚焦动手实战。

> [!note] 为什么需要 MCP
> 没有 MCP 时，每个 AI 应用都要单独对接你的数据源：Cursor 接一遍、Claude 接一遍、自研 Agent 再接一遍。MCP 把这事变成「写一次 server，到处可用」，类似 AI 时代的 USB 接口。

## 用 FastMCP 写最小 MCP server

官方 Python SDK 提供了 FastMCP，用装饰器声明工具，几行代码即可：

```python
# pip install "mcp[cli]"
from mcp.server.fastmcp import FastMCP

# 1. 创建 server，名字会显示给客户端
mcp = FastMCP("my-tools")

# 2. 用装饰器注册一个工具：docstring 是给模型看的描述
@mcp.tool()
def add(a: float, b: float) -> float:
    """计算两个数的和。"""
    return a + b

@mcp.tool()
def get_word_length(word: str) -> int:
    """统计一个英文单词的字母数。"""
    return len(word)

# 3. 还可以注册「资源」（只读数据）和「提示词模板」
@mcp.resource("config://version")
def get_version() -> str:
    """返回当前 server 版本。"""
    return "0.1.0"

if __name__ == "__main__":
    mcp.run()   # 默认使用 stdio 传输：客户端以子进程方式启动并通信
```

保存为 `server.py`。本地调试可以用官方检查器：

```bash
mcp dev server.py
```

> [!tip] 理解 stdio 传输
> MCP server 通常是**由客户端启动的子进程**，双方通过标准输入输出（stdio）交换 JSON-RPC 消息。所以你不需要自己起端口、写 HTTP 服务——配置好命令，客户端会替你拉起它。也支持 HTTP/SSE 传输用于远程部署。

## 在 Claude Desktop 中配置

编辑配置文件（Windows：`%APPDATA%\Claude\claude_desktop_config.json`）：

```json
{
  "mcpServers": {
    "my-tools": {
      "command": "python",
      "args": ["C:/Users/你的用户名/projects/my-mcp/server.py"]
    }
  }
}
```

保存后**完全重启** Claude Desktop，对话框里就能看到 🔨 工具图标，Claude 可以主动调用 `add` 等工具。

## 在 Cursor 中配置

Cursor 的 MCP 配置在 `~/.cursor/mcp.json`（或在设置 → MCP 中添加）：

```json
{
  "mcpServers": {
    "my-tools": {
      "command": "python",
      "args": ["C:/Users/你的用户名/projects/my-mcp/server.py"],
      "env": {
        "MY_API_KEY": "your-key-here"
      }
    }
  }
}
```

配置要点：

- **`command` 写绝对路径更稳**：虚拟环境里的 python 就写全路径，如 `C:/.../.venv/Scripts/python.exe`
- **`args` 里的路径用正斜杠**或双反斜杠转义，避免 JSON 解析错误
- **`env` 可注入环境变量**：API key 不要硬编码在代码里
- 配置后不生效：先看客户端的 MCP 日志面板，多半是路径或依赖问题

## MCP 与 Function Calling 的关系

| | Function Calling | MCP |
| --- | --- | --- |
| 层级 | 模型 API 的原生能力 | 建立在之上的开放协议 |
| 谁定义工具 | 你的应用代码 | 独立的 MCP server 进程 |
| 复用性 | 只服务当前应用 | 任何 MCP 客户端都能用 |
| 类比 | 函数的调用约定 | 跨应用的插件标准 |

二者不矛盾：MCP 客户端拿到 server 的工具列表后，最终仍通过类似 Function Calling 的机制让模型决定调用。实战角度，把 [[工具调用实战]] 学透再上手 MCP 会非常顺。

## 相关笔记

- [[MCP模型上下文协议]]
- [[FunctionCalling函数调用]]
- [[工具调用实战]]
- [[ClaudeCode与终端Agent]]
