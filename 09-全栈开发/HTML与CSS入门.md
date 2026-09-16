---
tags: [全栈开发, HTML, CSS]
created: 2026-08-02
---

# HTML 与 CSS 入门

## 网页的两层：结构与样式

一个网页可以拆成两部分：

- **HTML（HyperText Markup Language）**：负责**结构**——页面上有什么内容（标题、段落、按钮、表单）。
- **CSS（Cascading Style Sheets）**：负责**样式**——内容长什么样（颜色、大小、间距、布局）。

> [!note] 一个类比
> HTML 是房子的毛坯（墙、门、窗的位置），CSS 是装修（刷漆、地板、灯光）。第三部分「行为」（点按钮会发生什么）由 JavaScript 负责，见 [[JavaScript入门]]。

## HTML 常用标签

HTML 由一对对**标签（Tag）**组成，格式是 `<标签名>内容</标签名>`：

```html
<h1>这是一级标题</h1>
<p>这是一个段落。</p>
<a href="https://example.com">这是一个链接</a>
<img src="cat.jpg" alt="一只猫">
```

| 标签 | 作用 | 备注 |
| --- | --- | --- |
| `<h1>` ~ `<h6>` | 标题，从大到小 | 一个页面建议只有一个 `<h1>` |
| `<p>` | 段落 | 自动带上下间距 |
| `<a>` | 链接 | `href` 是跳转地址 |
| `<img>` | 图片 | `src` 是图片地址，`alt` 是加载失败时的说明文字 |
| `<ul>` / `<li>` | 无序列表 | `<ol>` 是有序列表 |
| `<form>` / `<input>` / `<button>` | 表单 | 收集用户输入 |
| `<div>` | 无语义的容器 | 用来分组和布局，配合 CSS 使用（行内小范围用 `<span>`） |

## CSS 三种引入方式

```html
<!-- 方式一：行内样式（只作用于这一个标签，不推荐大量使用） -->
<p style="color: red;">红色文字</p>

<!-- 方式二：内部样式表（写在 <head> 的 <style> 里，学习阶段最常用） -->
<head>
  <style>
    p { color: blue; }
  </style>
</head>

<!-- 方式三：外部样式表（单独的 .css 文件，正式项目用） -->
<head>
  <link rel="stylesheet" href="style.css">
</head>
```

三种方式同时存在时优先级：行内样式 > 内部样式表 > 外部样式表。

## 选择器：告诉 CSS 给谁加样式

```css
/* 标签选择器：所有 p */
p { color: blue; }

/* 类选择器：class="title" 的元素（最常用，可复用） */
.title { font-size: 24px; }

/* id 选择器：id="header" 的元素（一个页面只能有一个同名 id） */
#header { background: gray; }
```

HTML 里这样对应：

```html
<p class="title">类选择器生效</p>
<p id="header">id 选择器生效</p>
```

## 盒模型：每个元素都是一个盒子

CSS 把每个元素看成一个盒子，从里到外四层：

```text
┌──────────── margin（外边距，盒子之间的距离）
│  ┌───────── border（边框）
│  │  ┌────── padding（内边距，内容与边框的距离）
│  │  │ 内容（content，文字/图片本身）
│  │  └──────
│  └─────────
└────────────
```

```css
.card {
  padding: 16px;        /* 内容离边框 16px */
  border: 1px solid #ccc;
  margin-bottom: 12px;  /* 与下一个盒子隔 12px */
}
```

> [!tip] 新手最容易踩的坑
> 觉得元素之间「对不齐、间距怪」，90% 是 margin/padding 没搞清。记住：**padding 是盒子内部的留白，margin 是盒子外部的间隔**。

## Flex 布局：一行代码搞定排列

给父容器加 `display: flex`，子元素就会排成一行，再配合几个属性控制对齐：

```css
.container {
  display: flex;
  justify-content: space-between; /* 水平方向：两端对齐 */
  align-items: center;            /* 垂直方向：居中对齐 */
  gap: 8px;                       /* 子元素之间的间距 */
}
```

`justify-content` 常用值：`flex-start`（靠左）、`center`（居中）、`space-between`（两端对齐）。

## 完整示例：一个待办清单页面

保存为 `todo.html`，双击用浏览器打开即可看到效果：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>我的待办清单</title>
  <style>
    body { font-family: sans-serif; max-width: 480px; margin: 40px auto; padding: 0 16px; }
    h1 { color: #333; }
    .todo-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border: 1px solid #ddd;
      border-radius: 8px;
      margin-bottom: 8px;
    }
    .done { color: #999; text-decoration: line-through; }
    button { padding: 6px 12px; border: none; border-radius: 4px; background: #4f7cff; color: white; cursor: pointer; }
    form { display: flex; gap: 8px; margin-bottom: 16px; }
  </style>
</head>
<body>
  <h1>我的待办清单</h1>

  <form>
    <input type="text" placeholder="今天要做什么？">
    <button type="submit">添加</button>
  </form>

  <div class="todo-item">
    <span>学完 HTML 常用标签</span>
    <button>完成</button>
  </div>
  <div class="todo-item">
    <span class="done">搭建 Python 环境</span>
    <button>删除</button>
  </div>
</body>
</html>
```

> [!example] 动手练习
> 1. 把 `h1` 的颜色改成你喜欢的颜色，加一个 `text-align: center;` 看看效果。
> 2. 给 `.todo-item` 的 `border-radius` 改成 `0`，体会圆角的变化。
> 3. 在 MDN 上查 `<ol>` 标签，把待办列表改成有序列表。

## 相关笔记

- [[JavaScript入门]]
- [[前端框架入门]]
- [[全栈学习路线]]
- [[前端与后端]]
