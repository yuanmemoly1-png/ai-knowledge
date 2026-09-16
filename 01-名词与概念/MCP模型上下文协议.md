---
tags: [名词解释, MCP, Agent开发]
created: 2026-08-02
---

# MCP 模型上下文协议

## 是什么

MCP（Model Context Protocol，模型上下文协议）是 **Anthropic 于 2024 年底提出的开放协议**，目标是标准化 [[LLM大语言模型]] 应用与外部数据源、工具之间的连接方式。

官方类比：**MCP 之于 AI 应用，就像 USB-C 之于硬件设备**——以前每个设备一种接口，现在统一了，插谁都能用。

在 MCP 之前，让模型接工具（[[FunctionCalling函数调用]]）的痛点是 **M×N 问题**：M 个 AI 应用 × N 个工具/数据源，每个组合都要单独写对接代码。MCP 把接口标准化后，变成 M+N：工具方写一个 MCP Server，应用方支持一次 MCP Client，即可互相联通。

## 架构：Host / Client / Server

```
┌──────────────────────────────────────────┐
│  Host（宿主应用，如 Claude Desktop、Cursor）│
│  ┌─────────┐         ┌─────────┐         │
│  │ Client 1│ ←MCP→   │ Server A│ → 文件系统│
│  ├─────────┤         ├─────────┤         │
│  │ Client 2│ ←MCP→   │ Server B│ → 数据库 │
│  ├─────────┤         ├─────────┤         │
│  │ Client 3│ ←MCP→   │ Server C│ → 浏览器 │
│  └─────────┘         └─────────┘         │
└──────────────────────────────────────────┘
```

| 角色 | 职责 | 例子 |
| --- | --- | --- |
| Host | 用户直接使用的 AI 应用，承载 LLM | Claude Desktop、Cursor、自研 Agent |
| Client | Host 内部组件，与每个 Server 保持一对一连接 | Host 内置 |
| Server | 轻量程序，通过 MCP 暴露某类能力 | 文件系统 server、数据库 server |

Server 可以暴露三类东西：

- **Tools（工具）**：可被模型调用的函数（如 `query_database`）。
- **Resources（资源）**：可读取的数据（如文件内容、日志）。
- **Prompts（提示词模板）**：预置的任务模板。

通信基于 JSON-RPC，传输方式支持本地 stdio（启动子进程）和远程 HTTP/SSE。

## 为什么重要

> [!note] 生态价值
> - **工具开发者**：写一次 MCP Server，Claude、Cursor、各种 Agent 框架都能用。
> - **应用开发者**：不用自己对接每个 SaaS 的 API，装上现成 Server 即可。
> - **用户**：在 Claude Desktop 里直接让 AI 操作本地文件、查公司数据库、控制浏览器。
> MCP 推出后迅速被 OpenAI、Google 等厂商采纳支持，已成为 Agent 工具生态的事实标准之一。

## 常见 MCP Server 举例

| Server | 提供的能力 |
| --- | --- |
| filesystem | 读写指定目录下的本地文件 |
| postgres / sqlite | 查询数据库，模型可看表结构、跑 SQL |
| playwright / puppeteer | 控制浏览器：打开网页、点击、截图 |
| github | 查 issue、提 PR、读仓库代码 |
| fetch | 抓取网页内容转给模型 |
| memory | 给模型提供跨会话的持久记忆 |

在 Claude Desktop 中启用一个 Server 只需在配置文件里加几行：

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "C:/Users/me/docs"]
    }
  }
}
```

## 动手实践

想自己写一个 MCP Server（Python 官方 SDK `mcp`，用 `@mcp.tool()` 装饰器几行代码即可暴露一个函数），或在代码里调用 MCP 工具，详见 [[MCP协议实战]]。结合 [[工具调用实战]] 可以理解它与裸 Function Calling 的分工。

## 相关笔记

- [[MCP协议实战]]
- [[FunctionCalling函数调用]]
- [[Agent智能体]]
- [[Agent核心架构]]
