---
tags: [小白课堂, AI实战]
created: 2026-08-10
---

# 小白课：实战 messages 三角色

上一课：[[小白课-实战API第一课]]

> [!note] 这节课学什么
> 上节课你发出了第一句 `messages=[{"role": "user", "content": "你好"}]`。这个列表到底装了什么？
> 这节课拆开讲：**system / user / assistant 三个角色各管什么**、**多轮对话就是滚雪球**、**temperature 控制 AI 多疯**。
> 代码都接着上节课的 `client` 用（**需替换你的 Key 后运行**，输出是示意，真实回答每次略有不同）。

---

## 第 1 步：messages 就是一个"聊天记录列表"

`messages` 是你学过的**列表**，里面每一格是一个**字典**，每个字典两把钥匙：`role`（谁说的）和 `content`（说了啥）。

```python
messages = [
    {"role": "system", "content": "你是一个耐心的幼儿园老师，回答不超过两句话。"},
    {"role": "user", "content": "猫是什么？"},
]
```

三个角色一句话分工：

| role | 谁 | 管什么 |
| --- | --- | --- |
| `system` | 幕后导演 | 定人设、定规矩，排第一 |
| `user` | 你 | 提问题 |
| `assistant` | AI | 它说过的话 |

## 第 2 步：system —— 幕后导演，一句话换个人格

同一个问题，换一句 system，AI 像换了个人：

```python
messages = [
    {"role": "system", "content": "你是一个耐心的幼儿园老师，回答不超过两句话。"},
    {"role": "user", "content": "猫是什么？"},
]
response = client.chat.completions.create(model="deepseek-chat", messages=messages)
print(response.choices[0].message.content)
```

✅ 看到这个就对了（示意）：

```text
猫是一种可爱的家养小动物，软软的，会喵喵叫哦。
```

再把 system 改成 `"你是一个毒舌吐槽役"` 重跑，语气立刻变冲。**system 不改问题，改的是 AI 的"人格和规矩"**——这就是 [[小白课-Prompt提示词]] 里最常用的一招。

## 第 3 步：assistant —— 把 AI 上次的话也放进列表

`assistant` 这一格不是 AI 自己写的，是**你替它记下的**。看这段：

```python
messages = [
    {"role": "system", "content": "你是一个耐心的幼儿园老师。"},
    {"role": "user", "content": "猫是什么？"},
    {"role": "assistant", "content": "猫是一种可爱的家养小动物。"},
    {"role": "user", "content": "它吃什么？"},
]
```

注意第二句问的是"**它**吃什么"——只凭这四个字，AI 根本不知道"它"是谁。但因为前面带着一整段聊天记录，它就读懂了："它"= 猫。

> [!warning] AI 没有记忆！
> 每次调用 API，AI 都是"全新的一天"。它之所以记得你叫啥，是因为你**每次都把整本聊天记录重新发给它**。assistant 那几格，就是你替它补的记忆。

## 第 4 步：滚雪球——多轮对话完整代码

既然记忆=带上全部历史，多轮对话就一个套路：**每轮把你说的话和 AI 说的话都 append 进 messages**。

```python
messages = [{"role": "system", "content": "你是我的好朋友，说话简短。"}]
while True:
    question = input("你：")
    if question == "退出":
        break
    messages.append({"role": "user", "content": question})
    response = client.chat.completions.create(model="deepseek-chat", messages=messages)
    answer = response.choices[0].message.content
    messages.append({"role": "assistant", "content": answer})
    print("AI：", answer)
    print(f"（messages 里现在有 {len(messages)} 条）")
```

跑起来像这样（本逻辑已用假模型真实运行验证过）：

```text
你：我叫小明
AI：好的，记住啦！
（messages 里现在有 3 条）
你：我喜欢吃西瓜
AI：西瓜又甜又解渴！
（messages 里现在有 5 条）
你：我叫什么名字？
AI：你叫小明呀！
（messages 里现在有 7 条）
```

✅ 看到这个就对了：列表 3 → 5 → 7 越滚越大，最后 AI 答出"小明"。雪球越滚越大，花的 token 也越来越多——聊太长会撞上 [[小白课-幻觉与上下文窗口]] 里说的上下文上限。

## 第 5 步：temperature —— 控制 AI 有多"疯"

`temperature` 是 create 的一个参数：**越低越老实，越高越放飞**。同一个问题跑两遍对比：

```python
for t in [0, 1.8]:
    messages = [{"role": "user", "content": "给我推荐一个周末活动"}]
    response = client.chat.completions.create(
        model="deepseek-chat", messages=messages, temperature=t)
    print(f"temperature={t}：{response.choices[0].message.content}")
```

你会看到类似（本逻辑已真实运行验证）：

```text
temperature=0：可以去公园散步。
temperature=1.8：去天台种辣椒！然后给楼下的猫办一场演唱会！
```

✅ 看到这个就对了：`0` 给的是"标准答案"，`1.8` 开始胡言乱语。写程序要稳定结果就调低（0～0.3），搞创意写作才调高。

## 最关键的一句

> [!important]
> **AI 没有记忆——messages 就是全部记忆：system 定人设，user 提问，assistant 是 AI 说过的话；多轮对话 = 每轮把新对话 append 进列表，整本重新发给它。**

## 大白话翻译表

| 术语 | 大白话 |
| --- | --- |
| `messages` | 聊天记录列表，每格一个字典 |
| `role` | 这句话是谁说的 |
| `system` | 幕后导演，定人设定规矩 |
| `user` | 你说的话 |
| `assistant` | AI 说过的话（你替它记） |
| `temperature` | 疯狂程度旋钮，低老实高放飞 |
| 滚雪球 | 每轮把新对话追加进 messages |

## 检查一下

1. `messages` 列表里每一格是什么数据类型？里面有哪两把钥匙？
2. 想让 AI 用"山东大汉"的语气回答，该改哪个 role 的内容？
3. 为什么问 AI"它吃什么"，它能知道"它"指谁？
4. 想让 AI 的回答稳定、每次差不多，temperature 该调高还是调低？

<details>
<summary>点我看答案</summary>

1. 字典；`role` 和 `content`。
2. `system`——它是定人设的幕后导演。
3. 因为 messages 里带着前面的完整聊天记录（包括 assistant 说过的"猫是……"），AI 是看着整本记录回答的。
4. 调低（比如 0～0.3）。
</details>

下一课：[[小白课-实战流式与结构化]]

## 相关笔记

- [[小白课-Prompt提示词]]
- [[Prompt与提示词工程]]
- [[小白课-幻觉与上下文窗口]]
- [[小白课-Token与计费]]
- [[语法格式卡]]
