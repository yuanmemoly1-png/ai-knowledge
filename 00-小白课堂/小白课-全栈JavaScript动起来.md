---
tags: [小白课堂, 全栈]
created: 2026-08-10
---

# 小白课：全栈 JavaScript 动起来（让按钮会还手）

上一课：[[小白课-全栈CSS装修]]

> [!note] 这节课学什么
> 现在你的网页好看但**是死的**：按钮点了没反应。这节课用 **JavaScript 让它活过来**。
> 按 5 步走：搞懂 `<script>` 放哪 → `getElementById` 抓到零件 → `onclick` 响应点击 → 做出点击计数器 → 学会按 `F12` 看报错。
> 还是不用装任何东西，接着用 `hello.html`（代码均已验证，放心照抄）。

---

## 第 0 步：三件套的分工

到这儿，前端三件套齐了：

- **HTML**：骨架（有什么）
- **CSS**：装修（长什么样）
- **JavaScript（JS）**：肌肉（会动）——点了有反应、数字会变、内容会换

JS 是**唯一能在浏览器里直接跑的编程语言**，你学过的 Python 在浏览器里跑不了。详见 [[JavaScript入门]]。

## 第 1 步：`<script>` 放哪里

JS 代码写在 `<script>` 标签里。**规矩：放在 `</body>` 的前面**（页面最后）。

为什么？浏览器从上往下读页面。JS 要操作按钮，就得**等按钮先画出来**。放最后面，保证零件都齐了 JS 才开工。

在 `</body>` 前加上：

```html
    <script>
        alert("网页活啦！");
    </script>
```

保存，刷新。

✅ 看到这个就对了：浏览器弹出一个提示框，写着"网页活啦！"，点确定才能继续。

`alert` 是 JS 的"弹窗喊话"，以后调试常用来确认代码跑到了没有。看完效果把这行删掉，咱们玩真的。

## 第 2 步：getElementById——伸手抓到零件

JS 想操作某个零件，得先**抓到它**。方法是给零件发个身份证号（`id`），再用 `document.getElementById` 按号抓人。

改按钮那行，发个身份证号：

```html
<button id="btn">点我</button>
```

`<script>` 里写：

```html
    <script>
        const btn = document.getElementById("btn");
        btn.textContent = "我被抓到了";
    </script>
```

保存，刷新。

✅ 看到这个就对了：按钮上的字从"点我"变成了"我被抓到了"——你没改 HTML，是 JS 改的。

拆开看：

- `document` —— 整个网页这份文档
- `getElementById("btn")` —— 按身份证号抓零件，装进变量 `btn`
- `btn.textContent = "..."` —— 改掉零件上的文字

## 第 3 步：onclick——点击时干什么

现在让按钮**被点的时候**干活，而不是页面一打开就干活：

```html
    <script>
        const btn = document.getElementById("btn");
        btn.onclick = function () {
            btn.textContent = "哎呀，被点了！";
            btn.style.color = "red";
        };
    </script>
```

保存，刷新，**点一下按钮**。

✅ 看到这个就对了：点下去的瞬间，按钮文字变成"哎呀，被点了！"，字还变红了。

拆开看：

- `btn.onclick = function () { ... }` —— "被点的时候就执行大括号里的事"，这叫**事件**
- `btn.style.color = "red"` —— JS 也能改装修！`style.` 后面接上节课学的 CSS 属性

## 第 4 步：完整例子——点击计数器

把零散招式合成一个真东西。在 `</body>` 前换掉原来的 `<script>`，整段复制（**已验证**：JS 语法通过 `node --check` 校验）：

```html
    <p>你已经点了 <span id="count">0</span> 次</p>

    <script>
        let count = 0;
        const btn = document.getElementById("btn");
        btn.onclick = function () {
            count = count + 1;
            document.getElementById("count").textContent = count;
        };
    </script>
```

保存，刷新，狂点按钮。

✅ 看到这个就对了：每点一下，"你已经点了 **X** 次"里的数字就涨 1。

逐行拆解：

1. `<span id="count">0</span>` —— 给数字单独发个身份证号，方便只改它（`span` 是"行内小盒子"）
2. `let count = 0;` —— 准备一个记性，从 0 开始记（`let` ≈ Python 的变量赋值）
3. `count = count + 1;` —— 每点一次，记性 +1
4. `document.getElementById("count").textContent = count;` —— 把新记性写到页面上

**实验指令**：把 `count + 1` 改成 `count + 2`，刷新再点，数字是不是两两涨了？

## 第 5 步：F12——程序员的听诊器

以后 JS 出毛病，**第一反应是按 `F12`** 打开开发者工具，点 **Console（控制台）** 标签——JS 的报错全写在这。

故意制造一个错误体会下：把 `getElementById("btn")` 改成 `getElementById("不存在")`，保存刷新，按 `F12`。

✅ 看到这个就对了：Console 里一行红字 `Cannot set properties of null ...`——意思是"抓了个空气，空气没法改字"。改回去就好了。

## 报错救援表

| 报错 / 现象 | 意思 | 解法 |
| --- | --- | --- |
| `Cannot set properties of null` | id 没抓到，抓到空气 | 检查 HTML 的 `id="btn"` 和 JS 的 `"btn"` 一字不差 |
| 页面打开就执行，点击没反应 | 代码没包进 `onclick` | 包进 `btn.onclick = function () { ... }` |
| JS 完全没跑 | `<script>` 位置或拼写错 | 放 `</body>` 前；检查 `<script>` 没写成 `<scirpt>` |
| `Uncaught SyntaxError` | 少括号少分号写劈了 | 看 Console 红字标的行号，对照原文改 |

更多排查套路见 [[新手报错速查]]。

## 最关键的一句

> [!important]
> **JS 三板斧：`id` 发身份证 → `getElementById` 抓零件 → `onclick` 里写"被点时干什么"；出事先按 `F12` 看 Console。**

## 大白话翻译表

| 术语 | 大白话 |
| --- | --- |
| JavaScript（JS） | 网页的肌肉，让它会动，详见 [[JavaScript入门]] |
| `<script>` | 装 JS 代码的袋子，放页面最后 |
| `document` | 整个网页这份文档 |
| `getElementById` | 按身份证号抓零件的手 |
| `onclick` | "被点的时候"这个事件 |
| `textContent` | 零件身上的文字 |
| `F12` / Console | 开发者工具 / JS 的报错黑板 |

## 检查一下

1. 为什么 `<script>` 建议放在 `</body>` 前面而不是 `head` 里？
2. JS 想改一个零件上的文字，要哪两步？
3. `btn.onclick = function () { ... }` 大括号里的代码什么时候执行？
4. JS 报错在哪里看？

<details>
<summary>点我看答案</summary>

1. 浏览器从上往下读，放最后能保证 JS 开工前按钮等零件已经画出来了。
2. 先用 `getElementById` 抓到它，再改它的 `textContent`。
3. 按钮被点击的时候才执行（页面打开时不执行）。
4. 按 `F12` 打开开发者工具，看 Console（控制台）里的红字。
</details>

下一课：[[小白课-全栈FastAPI后端]]

## 相关笔记

- [[小白课-全栈HTML第一页]]
- [[小白课-全栈CSS装修]]
- [[JavaScript入门]]
- [[小白课-前端与后端]]
- [[新手报错速查]]
