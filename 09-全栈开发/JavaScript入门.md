---
tags: [全栈开发, JavaScript, 前端]
created: 2026-08-02
---

# JavaScript 入门

## JS 是干什么的

HTML 负责结构、CSS 负责样式，**JavaScript（JS）负责行为**：点击按钮发生什么、数据怎么变化、什么时候去服务器取数据。它是浏览器里唯一原生的编程语言，也是全栈路上绕不开的一关。

好消息：你已经会 Python 了。JS 的核心概念（变量、函数、列表、字典、循环）和 Python 几乎一一对应，只是写法不同。

## 与 Python 的语法对照

| 概念 | Python | JavaScript |
| --- | --- | --- |
| 变量 | `name = "小明"` | `let name = "小明";` |
| 常量 | （约定大写） | `const AGE = 18;` |
| 函数 | `def add(a, b): return a + b` | `const add = (a, b) => a + b;` |
| 列表 | `items = [1, 2, 3]` | `const items = [1, 2, 3];` |
| 字典 | `user = {"name": "小明"}` | `const user = { name: "小明" };` |
| 条件 | `if x > 0:` | `if (x > 0) { }` |
| 循环 | `for item in items:` | `for (const item of items) { }` |
| 打印 | `print(x)` | `console.log(x);` |
| 异步 | `async def` / `await` | `async function` / `await` |

> [!tip] 心态建议
> 不要把 JS 当成一门全新的语言来学，当成「Python 的另一种写法」来过渡，重点只学三件事：**DOM 操作、事件监听、fetch 调 API**——这就是网页交互的全部核心。

## 变量与函数

```javascript
// let：可以重新赋值；const：不能重新赋值（默认用 const）
let count = 0;
count = count + 1;

const name = "小明";

// 箭头函数，相当于 Python 的 lambda 的完整版
const greet = (name) => {
  return `你好，${name}`;  // 反引号模板字符串，相当于 f-string
};
console.log(greet(name));
```

## 数组与对象

```javascript
const todos = ["学 HTML", "学 CSS"];

// 数组操作对照：append → push，遍历 → for...of
todos.push("学 JS");
for (const todo of todos) {
  console.log(todo);
}

// 对象 ≈ Python 的字典，但 key 不用加引号
const user = { name: "小明", age: 18 };
console.log(user.name);      // 点号取值
console.log(user["age"]);    // 也可以像字典一样取
```

## DOM 操作：用 JS 控制页面内容

**DOM（Document Object Model）** 是浏览器把 HTML 解析成的一棵节点树，JS 通过它读写页面：

```javascript
// 找到页面上的元素（选择器写法和 CSS 一样）
const title = document.querySelector("h1");
const list = document.querySelector("#todo-list");

// 改内容
title.textContent = "新标题";

// 创建新元素并添加到页面
const li = document.createElement("li");
li.textContent = "新待办";
list.appendChild(li);
```

## 事件监听：响应用户操作

```javascript
const btn = document.querySelector("#add-btn");

// 点击按钮时执行函数（相当于注册一个回调）
btn.addEventListener("click", () => {
  console.log("按钮被点了");
});
```

## fetch 调 API：前后端之间的桥

网页通过 `fetch` 向服务器发请求、拿数据——这就是 [[API接口]] 在浏览器里的用法：

```javascript
// async/await 和 Python 的写法几乎一样
const loadData = async () => {
  const response = await fetch("https://api.example.com/todos");
  const data = await response.json();  // 把响应体解析成 JS 对象
  console.log(data);
};
```

> [!warning] 常见坑
> - `fetch` 是异步的，不加 `await` 拿到的是一个 Promise 而不是数据。
> - 请求别人网站的 API 可能被 **CORS（跨域限制）** 拦截，调自己写的 FastAPI 后端时需要在后端放行，见 [[FastAPI后端实战]]。

## 完整示例：点击按钮调 API 显示结果

保存为 `index.html` 用浏览器打开，点击按钮会获取一条随机笑话（JSONPlaceholder 的公开测试接口）：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>fetch 示例</title>
</head>
<body>
  <h1>点击获取一条数据</h1>
  <button id="load-btn">获取</button>
  <p id="result">结果会显示在这里</p>

  <script>
    const btn = document.querySelector("#load-btn");
    const result = document.querySelector("#result");

    btn.addEventListener("click", async () => {
      result.textContent = "加载中...";
      try {
        // JSONPlaceholder：免费的公开测试 API
        const response = await fetch(
          "https://jsonplaceholder.typicode.com/todos/1"
        );
        const data = await response.json();
        result.textContent = `拿到了：${data.title}`;
      } catch (error) {
        result.textContent = "请求失败，请检查网络";
      }
    });
  </script>
</body>
</html>
```

> [!example] 动手练习
> 1. 把 URL 里的 `1` 改成 `2`、`3`，观察返回内容变化。
> 2. 改成请求 `https://jsonplaceholder.typicode.com/todos`（复数），用 `for...of` 把前 5 条渲染成 `<li>` 列表。
> 3. 打开浏览器开发者工具（F12）的 Console 面板，观察 `console.log` 的输出——这是 JS 调试的主战场。

## 相关笔记

- [[HTML与CSS入门]]
- [[前端框架入门]]
- [[API接口]]
- [[全栈学习路线]]
