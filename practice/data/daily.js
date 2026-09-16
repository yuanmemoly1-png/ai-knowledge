// AI 冒险岛 · 练习场 —— 今日任务数据（静态轮换，按日期取模，无后端）
// DAILY_DICTATION：默写曲目库，14 个，取自用户学过的知识点（10-20 行，含中文注释）
//   given：题面给定数据/前置代码（卡片直接展示；判卷时拼在用户代码前面，
//          用户自己写了同样的赋值则不再重复拼接，见 app.js buildDictationSource）
//   expected：期望 stdout，已用 python -X utf8 实际运行验证（见 .verify_daily.py）
//   stdin：交互式曲目的喂入输入（字符串数组），运行时由 app.js 注入 input() shim
// DAILY_PROJECTS：值得读的小项目库，14 个（15-40 行，纯标准库，兼容 Pyodide）
//   logic：逻辑分解（3-6 条大白话步骤）
//   skeleton：框架骨架（合法可运行的 Python，TODO + pass 占位），已实际运行验证
//   points：读代码要点；challenge：看懂后自己改的小挑战

const DAILY_DICTATION = [
  {
    id: "dict-wordcount",
    title: "词频统计器",
    goal: "不看答案，默写出完整程序：统计一句话里每个词出现几次，输出 3 行。",
    given: `text = "苹果 香蕉 苹果 橘子 香蕉 苹果"
# 行为说明：统计 text 里每个词出现几次，一个词一行打印`,
    code: `# 词频统计器：统计每个词出现几次
text = "苹果 香蕉 苹果 橘子 香蕉 苹果"
words = text.split()      # 按空格切成单词列表
count = {}                # 空字典当账本：词当键、次数当值
for w in words:
    if w in count:        # 账本里见过 → 次数 +1
        count[w] = count[w] + 1
    else:                 # 没见过 → 记 1
        count[w] = 1
for w in count:           # 一行一条打印结果
    print(w, "出现了", count[w], "次")`,
    expected: `苹果 出现了 3 次
香蕉 出现了 2 次
橘子 出现了 1 次`,
    note: "考：split 切词、空字典当账本、for + if/else 计数套路、print 多值逗号空格"
  },
  {
    id: "dict-count-pass",
    title: "count_pass 及格计数",
    goal: "默写函数 count_pass：统计列表里及格（≥60）的人数，return 结果。",
    given: `# 判卷时会这样调用你的函数：
# count_pass([90, 45, 78, 62, 55]) 应返回 3
# count_pass([10, 20, 30]) 应返回 0`,
    code: `# 统计及格人数：函数 + 计数器
def count_pass(scores):
    n = 0                      # 先准备一个计数器
    for s in scores:
        if s >= 60:            # 及格（60 分及以上）才数
            n = n + 1
    return n                   # 注意：return 在 for 外面，只执行一次

print(count_pass([90, 45, 78, 62, 55]))   # 应该输出 3
print(count_pass([10, 20, 30]))           # 应该输出 0`,
    expected: `3
0`,
    note: "考：def/return、计数器套路、return 的位置（for 外面）"
  },
  {
    id: "dict-is-pass",
    title: "is_pass 及格判断",
    goal: "默写函数 is_pass：60 分及以上 return \"及格\"，否则 return \"不及格\"。",
    given: `# 规则：60 分及以上 → "及格"，否则 → "不及格"
# 判卷用例：is_pass(75)、is_pass(60)、is_pass(59)`,
    code: `# 及格判断器：函数里放 if / else
def is_pass(score):
    if score >= 60:
        return "及格"          # return 的是文字，记得引号
    else:
        return "不及格"

print(is_pass(75))   # 及格
print(is_pass(60))   # 及格（60 分及以上）
print(is_pass(59))   # 不及格`,
    expected: `及格
及格
不及格`,
    note: "考：函数定义、if/else 双 return、边界值 60 归「及格」"
  },
  {
    id: "dict-swap",
    title: "三变量交换",
    goal: "默写交换两个变量内容的程序（借助临时变量），交换前后各打印一次。",
    given: `a = "红"
b = "蓝"
# 行为说明：交换 a 和 b 的内容，交换前后各打印一次（"交换前：" / "交换后："）`,
    code: `# 交换两个盒子的内容（借助临时盒子）
a = "红"
b = "蓝"
print("交换前：", a, b)
temp = a    # 第一步：a 倒进临时盒子
a = b       # 第二步：b 倒进 a（a 原来的东西已在 temp 里）
b = temp    # 第三步：临时盒子倒进 b
print("交换后：", a, b)
# 想一想：不借助 temp 直接 a = b 会怎样？
# 期望输出：交换前： 红 蓝 然后 交换后： 蓝 红`,
    expected: `交换前： 红 蓝
交换后： 蓝 红`,
    note: "考：赋值是「装盒子」不是「连线」、临时变量套路"
  },
  {
    id: "dict-99",
    title: "九九乘法表一角",
    goal: "默写嵌套循环打印九九乘法表前 3 行（左下三角，共 6 行输出）。",
    given: `# 行为说明：外层 i、内层 j 都走 [1, 2, 3]
# 只打印 j <= i 的格子（左下三角），用 f-string 印出 jxi=积`,
    code: `# 九九乘法表一角（前 3 行，共 6 行输出）
# 两层 for：外层每走 1 步，内层完整走一遍
for i in [1, 2, 3]:           # 外层：第几行
    for j in [1, 2, 3]:       # 内层：第几列
        if j <= i:            # 只保留左下三角（j 不超过 i）
            print(f"{j}x{i}={j*i}")

# 期望输出：
# 1x1=1 / 1x2=2 / 2x2=4 / 1x3=3 / 2x3=6 / 3x3=9
# 拓展：把 [1, 2, 3] 改成 [1, 2, 3, 4, 5] 就是更大的一角`,
    expected: `1x1=1
1x2=2
2x2=4
1x3=3
2x3=6
3x3=9`,
    note: "考：嵌套 for、if 过滤（j <= i）、f-string 填多个洞"
  },
  {
    id: "dict-fizzbuzz",
    title: "FizzBuzz 迷你版",
    goal: "默写 FizzBuzz（1 到 10）：3 的倍数 Fizz、5 的倍数 Buzz、同时是 FizzBuzz。",
    given: `# 行为说明：挨个检查 1 到 10
# 3 的倍数印 Fizz、5 的倍数印 Buzz、同时是印 FizzBuzz，其余印数字本身`,
    code: `# FizzBuzz 迷你版：挨个看 1 到 10
for n in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]:
    if n % 3 == 0 and n % 5 == 0:
        print("FizzBuzz")    # 注意：「同时是」要最先判断
    elif n % 3 == 0:
        print("Fizz")
    elif n % 5 == 0:
        print("Buzz")
    else:
        print(n)`,
    expected: `1
2
Fizz
4
Buzz
Fizz
7
8
Fizz
Buzz`,
    note: "考：% 取余、if/elif/else 多分支、判断顺序（最严格的条件放最前）"
  },
  {
    id: "dict-students",
    title: "花名册双层取值",
    goal: "默写：列表套字典的花名册，挨个打印名字和分数。",
    given: `students = [
    {"name": "小明", "score": 90},
    {"name": "小红", "score": 85},
    {"name": "小刚", "score": 78},
]
# 行为说明：挨个打印名字和分数；最后打印 students[1] 的名字 + "坐在第二排"`,
    code: `# 花名册：装着字典的列表
students = [
    {"name": "小明", "score": 90},
    {"name": "小红", "score": 85},
    {"name": "小刚", "score": 78},
]
# 取法：先 students[i] 取出字典，再 ["name"] 按键取值
for s in students:
    print(s["name"], s["score"])
print(students[1]["name"], "坐在第二排")`,
    expected: `小明 90
小红 85
小刚 78
小红 坐在第二排`,
    note: "考：列表套字典的结构、双层取值 students[1][\"name\"]"
  },
  {
    id: "dict-merge-dict",
    title: "两列表合成字典",
    goal: "默写：用索引同步遍历两个列表，合成一个字典再按键查询。",
    given: `names = ["语文", "数学", "英语"]
points = [90, 85, 92]
# 行为说明：用索引把两个列表合成字典 scores，打印整个字典，再按 "数学" 查询打印`,
    code: `# 两个列表合成一个字典
names = ["语文", "数学", "英语"]
points = [90, 85, 92]
scores = {}
for i in [0, 1, 2]:            # 用索引 i 同步取两个列表的第 i 格
    scores[names[i]] = points[i]
print(scores)
print(scores["数学"])          # 按名字查询
# 索引是连接两个列表的「隐形拉链」
# 期望输出：{'语文': 90, '数学': 85, '英语': 92} 和 85`,
    expected: `{'语文': 90, '数学': 85, '英语': 92}
85`,
    note: "考：for 索引遍历、字典动态增格 scores[k] = v"
  },
  {
    id: "dict-max",
    title: "打擂台找最大值",
    goal: "默写：遍历字典找出最高分，打印科目和分数。",
    given: `scores = {"语文": 90, "数学": 85, "英语": 92}
# 行为说明：打擂台找出最高分，打印 "最高分：" + 科目 + 分数`,
    code: `# 打擂台找最高分
scores = {"语文": 90, "数学": 85, "英语": 92}
best_name = ""
best_score = 0
for name in scores:
    if scores[name] > best_score:   # 新来的更强 → 换擂主
        best_score = scores[name]
        best_name = name
print("最高分：", best_name, best_score)
# 擂主要有两个：最强的名字 + 最强的分数`,
    expected: `最高分： 英语 92`,
    note: "考：for 遍历字典、双变量打擂台套路"
  },
  {
    id: "dict-average",
    title: "平均分计算器",
    goal: "默写函数 average：累加器求总和，return 总和 ÷ 个数。",
    given: `# 判卷时会这样调用你的函数：
# average([80, 90, 100]) 应返回 90.0
# average([60, 70]) 应返回 65.0`,
    code: `# 平均分计算器
def average(nums):
    total = 0                    # 累加器
    for n in nums:
        total = total + n
    return total / len(nums)     # / 除出来是小数

print(average([80, 90, 100]))    # 90.0
print(average([60, 70]))         # 65.0
# 想要整数结果就用 // 整除（丢掉小数部分）`,
    expected: `90.0
65.0`,
    note: "考：函数 + 累加器、len() 数个数、/ 与 // 的区别"
  },
  {
    id: "dict-lettercount",
    title: "字母计数器",
    goal: "默写：统计 \"banana\" 里每个字母出现几次（字符串直接 for）。",
    given: `text = "banana"
# 行为说明：字符串直接 for 逐字符统计，一个字母一行打印次数`,
    code: `# 字母计数器：字符串可以直接 for，不用 split
text = "banana"
count = {}
for ch in text:
    if ch in count:
        count[ch] = count[ch] + 1
    else:
        count[ch] = 1
for ch in count:
    print(ch, "出现了", count[ch], "次")`,
    expected: `b 出现了 1 次
a 出现了 3 次
n 出现了 2 次`,
    note: "考：字符串可直接遍历、字典计数套路迁移"
  },
  {
    id: "dict-while-guess",
    title: "猜数字（while + break）",
    goal: "默写：while 循环用 input() 读猜测，猜中 break，偏大偏小都给提示（判卷时会自动喂入猜测 3、9、5、7）。",
    given: `target = 7
# 行为说明：while True 反复读猜测，猜中 target 印 "猜对了！" 并 break
# 判卷器会依次喂入猜测：3、9、5、7`,
    code: `# 猜数字：while + input + break（输入由判卷器自动喂入）
target = 7
while True:               # 一直猜，直到猜中
    guess = int(input())  # input 拿到的是字符串，先 int 转成数字
    if guess == target:
        print(guess, "猜对了！")
        break             # break：立刻结束整个循环
    elif guess < target:
        print(guess, "小了")
    else:
        print(guess, "大了")
# 判卷器会依次喂入猜测：3、9、5、7`,
    expected: `3 小了
9 大了
5 小了
7 猜对了！`,
    stdin: ["3", "9", "5", "7"],
    note: "考：while True + break、input() 转 int、三分支比较"
  },
  {
    id: "dict-csv-total",
    title: "购物清单总价",
    goal: "默写：for + split 解析 CSV 记录，单价 × 数量累加出总价。",
    given: `lines = ["苹果,3,2", "香蕉,2,5", "牛奶,6,1"]
# 每行格式：名字,单价,数量 —— 单价 × 数量累加出总价`,
    code: `# 购物清单总价：split + 累加器
lines = ["苹果,3,2", "香蕉,2,5", "牛奶,6,1"]
total = 0
for line in lines:
    parts = line.split(",")                   # [名字, 单价, 数量]
    price = int(parts[1])                     # 文字数字要转整数
    total = total + price * int(parts[2])
print("总价：", total)
# 期望输出：总价： 22
# 拓展：想打印每行明细，就把一行 print 放进 for 里`,
    expected: `总价： 22`,
    note: "考：split 解析 CSV、int() 类型转换、累加器"
  },
  {
    id: "dict-stock",
    title: "库存警报",
    goal: "默写：解析库存字符串 raw（名字:库存，逗号隔开），库存为 0 报缺货，否则报库存数量。",
    given: `raw = "可乐:5,雪碧:0,果汁:12"
# 格式：名字:库存，多种商品用逗号隔开；库存为 0 要报缺货`,
    code: `# 库存警报：CSV + if/else 双格式
raw = "可乐:5,雪碧:0,果汁:12"
items = raw.split(",")          # 先按逗号切成 ["可乐:5", "雪碧:0", "果汁:12"]
for item in items:
    parts = item.split(":")     # 再按冒号切成 [名字, 库存]
    if int(parts[1]) == 0:
        print(parts[0], "缺货")
    else:
        print(parts[0], "库存", parts[1])
# 期望输出：可乐 库存 5 / 雪碧 缺货 / 果汁 库存 12
# 想一想：为什么要 split 两次？`,
    expected: `可乐 库存 5
雪碧 缺货
果汁 库存 12`,
    note: "考：split 两次（先逗号后冒号）、int 转换、if/else 两种输出格式"
  }
];

const DAILY_PROJECTS = [
  {
    id: "proj-rollcall",
    title: "随机点名器",
    desc: "课堂上用的点名工具：回车抽一个同学，输入 q 下课。",
    code: `# 随机点名器：random.choice 从列表里随机抽一个
import random

names = ["小明", "小红", "小刚", "小丽", "小华"]

print("=== 随机点名器 ===")
print("今日名单：", names)

while True:
    cmd = input("回车点名，输入 q 退出：")
    if cmd == "q":
        print("下课！")
        break
    lucky = random.choice(names)      # 从名单随机抽一个
    print("→ 请", lucky, "回答问题！")`,
    logic: [
      "准备一个名单列表，import random 请出随机工具",
      "while True 一直循环：每圈等用户敲一下键",
      "输入 q 就 break 下课",
      "否则 random.choice 从名单抽一个人，打印出来"
    ],
    skeleton: `# 随机点名器 · 框架
import random

names = ["小明", "小红", "小刚", "小丽", "小华"]

while True:
    cmd = input("回车点名，输入 q 退出：")
    if cmd == "q":
        break
    # TODO: 用 random.choice(names) 随机抽一个，存进 lucky
    # TODO: 打印 "→ 请 lucky 回答问题！"
    pass`,
    points: [
      "random.choice(列表) 是随机抽一个的标准写法",
      "while True + break 是「一直玩直到退出」的招牌结构",
      "input() 的返回值就是用户敲的那行字（字符串）"
    ],
    challenge: "改成「不重复点名」：抽过的人从名单里删掉（提示：names.remove(lucky)），名单空了自动下课。"
  },
  {
    id: "proj-rps",
    title: "石头剪刀布",
    desc: "和电脑猜拳，记录战绩，输得起才玩得久。",
    code: `# 石头剪刀布：和电脑对战
import random

choices = ["石头", "剪刀", "布"]
win = 0
lose = 0

print("=== 石头剪刀布 ===")
while True:
    me = input("出拳（石头/剪刀/布，q 退出）：")
    if me == "q":
        break
    if me not in choices:             # 输入校验：不在列表里就重来
        print("看不懂这一拳，重来")
        continue                      # continue：跳过本轮，直接下一轮
    pc = random.choice(choices)
    print("电脑出：", pc)
    if me == pc:
        print("平局")
    elif (me == "石头" and pc == "剪刀") or (me == "剪刀" and pc == "布") or (me == "布" and pc == "石头"):
        print("你赢了！")
        win = win + 1
    else:
        print("你输了")
        lose = lose + 1

print("战绩：赢", win, "场，输", lose, "场")`,
    logic: [
      "准备出拳列表和两个战绩计数器",
      "while 循环每局：读用户出拳，q 退出",
      "出拳不在列表里就 continue 重来（输入校验）",
      "电脑 random.choice 出拳",
      "平局 / 三种赢法（or 连起来）/ 否则算输，更新战绩",
      "退出循环后打印总战绩"
    ],
    skeleton: `# 石头剪刀布 · 框架
import random

choices = ["石头", "剪刀", "布"]
win = 0
lose = 0

while True:
    me = input("出拳（石头/剪刀/布，q 退出）：")
    if me == "q":
        break
    if me not in choices:
        continue                      # TODO: 提示「看不懂这一拳，重来」
    pc = random.choice(choices)
    # TODO: 打印电脑出的拳
    if me == pc:
        pass                          # TODO: 平局
    elif False:                       # TODO: 三种赢法用 or 连起来
        win = win + 1
    else:
        lose = lose + 1

# TODO: 打印战绩（赢几场、输几场）
print("游戏结束")`,
    points: [
      "continue 和 break 的区别：跳过本轮 vs 结束整个循环",
      "赢的三种情况用一个长条件 or 连起来，其余的统统算输",
      "in 可以判断「元素在不在列表里」"
    ],
    challenge: "改成三局两胜制：谁先赢 2 局比赛就结束（可以参考「猜拳三局两胜」项目）。"
  },
  {
    id: "proj-caesar",
    title: "凯撒加密",
    desc: "古罗马的加密术：每个字母往后挪 3 位，hello 变成 khoor。",
    code: `# 凯撒加密：字母表上往后挪几位
def caesar(text, shift):
    result = ""
    for ch in text:
        if "a" <= ch <= "z":              # 只处理小写字母
            pos = ord(ch) - ord("a")      # ord：字母 → 数字（a 是 0）
            pos = (pos + shift) % 26      # 挪动并绕圈（z 后面回到 a）
            result = result + chr(ord("a") + pos)  # chr：数字 → 字母
        else:
            result = result + ch          # 空格等原样保留
    return result

secret = caesar("hello python", 3)
print("加密后：", secret)
print("解密后：", caesar(secret, -3))     # 挪回去就是解密`,
    logic: [
      "定义函数 caesar(text, shift)，准备空结果串",
      "for 每个字符：是小写字母才处理，不是就原样保留",
      "ord 把字母变成 0~25 的数字",
      "挪 shift 位再 % 26 绕圈，chr 变回字母拼进结果",
      "return 结果；解密就是 shift 取负数"
    ],
    skeleton: `# 凯撒加密 · 框架
def caesar(text, shift):
    result = ""
    for ch in text:
        if "a" <= ch <= "z":
            # TODO: ord 变 0~25 → 挪 shift 位 → % 26 绕圈 → chr 变回字母
            result = result + ch      # TODO: 换成加密后的字母
        else:
            result = result + ch      # 非字母原样保留
    return result

# TODO: 用 shift=3 加密 "hello python"，再用 -3 解密打印
print(caesar("abc", 0))`,
    points: [
      "ord() 和 chr() 是字母和数字之间的翻译官",
      "% 26 让字母表「绕圈」：z 挪一位回到 a",
      "解密就是 shift 取负数，加解密共用同一个函数"
    ],
    challenge: "改成支持大写字母（提示：再写一个 'A' <= ch <= 'Z' 的分支）。"
  },
  {
    id: "proj-ledger",
    title: "简易记账本 CLI",
    desc: "命令行记账本：记一笔、看账本、算总账，菜单循环。",
    code: `# 简易记账本：字典 + while 菜单
ledger = {}

while True:
    print("\\n=== 记账本 ===")
    print("1 记一笔  2 看账本  3 算总账  q 退出")
    cmd = input("请选择：")
    if cmd == "q":
        break
    elif cmd == "1":
        item = input("买了什么：")
        money = int(input("花了多少钱："))
        if item in ledger:                # 同一样东西累加
            ledger[item] = ledger[item] + money
        else:
            ledger[item] = money
        print("记好了！")
    elif cmd == "2":
        for item in ledger:
            print(item, ledger[item], "元")
    elif cmd == "3":
        total = 0
        for item in ledger:
            total = total + ledger[item]
        print("总花费：", total, "元")

print("拜拜，记得省钱！")`,
    logic: [
      "空字典当账本",
      "while True 循环：显示菜单，等用户选指令",
      "选 1 记一笔：读名字和金额，in 判断——记过就累加，没记过就新记",
      "选 2 看账本：for 逐行打印；选 3 算总账：累加器求和",
      "选 q 才 break 退出"
    ],
    skeleton: `# 简易记账本 · 框架
ledger = {}

while True:
    print("1 记一笔  2 看账本  3 算总账  q 退出")
    cmd = input("请选择：")
    if cmd == "q":
        break
    elif cmd == "1":
        item = input("买了什么：")
        money = int(input("花了多少钱："))
        # TODO: item 在账本里就累加，不在就新记一笔
        pass
    elif cmd == "2":
        # TODO: for 逐行打印账本的每一格
        pass
    elif cmd == "3":
        # TODO: 累加器算总花费并打印
        pass

print("拜拜！")`,
    points: [
      "菜单程序 = while True + if/elif 分支处理每个选项",
      "input() 拿到的是字符串，算钱前必须 int() 转换",
      "同一品类累加：就是字典计数的 if in / else 套路"
    ],
    challenge: "加一个「4 删除一笔」功能（提示：del ledger[item]，记得先判断在不在）。"
  },
  {
    id: "proj-countdown",
    title: "倒计时器",
    desc: "5、4、3、2、1——时间到！感受 time.sleep 的魔力。",
    code: `# 倒计时器：while 倒数 + time.sleep 停 1 秒
import time                        # time 是自带标准库，import 就能用

seconds = 5
print("倒计时开始！")
while seconds > 0:
    print(seconds)
    time.sleep(1)          # 程序原地停 1 秒
    seconds = seconds - 1  # 往下数
print("时间到！！")

# 升级思路：把 5 改成 input 让用户自己定秒数
# 注意 input 拿到的是字符串，要 int() 转换
# 拓展：数到 0 之前加一行 "点火！"，改成火箭发射倒计时
# while 倒计时结束的条件是 seconds > 0 不成立，也就是 seconds 数到 0`,
    logic: [
      "import time 请出时间工具",
      "准备秒数变量 seconds",
      "while 秒数 > 0：打印当前秒数",
      "time.sleep(1) 停一秒，然后秒数减 1（不动就死循环）",
      "循环结束打印「时间到」"
    ],
    skeleton: `# 倒计时器 · 框架
import time

seconds = 5
while seconds > 0:
    # TODO: 打印当前秒数
    time.sleep(1)              # 停 1 秒
    # TODO: 秒数减 1（少了这行会死循环）
    seconds = seconds - 1

# TODO: 打印 "时间到！！"
print("（框架跑完了）")`,
    points: [
      "time.sleep(秒) 让程序「睡一会」",
      "while 条件 seconds > 0 保证了数到 0 就停，不会死循环",
      "循环里一定要改动条件相关的变量"
    ],
    challenge: "改成用户输入秒数开始倒计时，并在最后打印一句随机祝福语（结合 random.choice）。"
  },
  {
    id: "proj-password",
    title: "密码生成器",
    desc: "随机字符串生成安全密码，支持指定长度。",
    code: `# 密码生成器：随机字符拼接
import random

# 去掉了容易看混的字符：0 和 O、1 和 l
chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789"

def make_password(length):
    pwd = ""
    for i in range(length):       # range(n) 就是循环 n 次
        pwd = pwd + random.choice(chars)
    return pwd

print("你的新密码：", make_password(8))
print("来个长的：", make_password(12))
print("连生成 3 个备选：")
for i in range(3):
    print("  ", make_password(10))`,
    logic: [
      "准备字符池字符串（去掉 0/O、1/l 这些易混字符）",
      "定义函数 make_password(length)：从空串起步",
      "for 循环 length 次：每次 random.choice 抽一个字符拼上去",
      "return 拼好的密码，调用几次打印看看"
    ],
    skeleton: `# 密码生成器 · 框架
import random

chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789"

def make_password(length):
    pwd = ""
    for i in range(length):
        # TODO: random.choice(chars) 抽一个字符，拼到 pwd 上
        pass
    return pwd

# TODO: 打印几个不同长度的密码
print(make_password(8))`,
    points: [
      "range(n) 生成 0 到 n-1，常用来「循环固定次数」",
      "字符串拼接放循环里，一次加一个字符",
      "去掉易混字符是真实产品里的细节考量"
    ],
    challenge: "改成必须包含至少一个数字：生成后检查，不含数字就重新生成（提示：while 循环）。"
  },
  {
    id: "proj-cart",
    title: "购物车结算",
    desc: "列表套字典的购物车，自动算小票，满 30 打 9 折。",
    code: `# 购物车结算：列表套字典 + 折扣判断
cart = [
    {"name": "苹果", "price": 3, "count": 2},
    {"name": "牛奶", "price": 6, "count": 1},
    {"name": "面包", "price": 8, "count": 3},
]

total = 0
print("=== 购物小票 ===")
for item in cart:
    money = item["price"] * item["count"]   # 单价 × 数量
    total = total + money
    print(item["name"], "x", item["count"], "=", money, "元")

if total >= 30:               # 满 30 打 9 折
    total = total * 0.9
    print("满 30 打 9 折！")

print("应付：", total, "元")`,
    logic: [
      "购物车是列表套字典：每样商品有名字、单价、数量",
      "累加器 total 归零",
      "for 每样商品：单价 × 数量算小计，加进 total，打印一行明细",
      "满 30 打 9 折（total = total * 0.9）",
      "打印应付金额"
    ],
    skeleton: `# 购物车结算 · 框架
cart = [
    {"name": "苹果", "price": 3, "count": 2},
    {"name": "牛奶", "price": 6, "count": 1},
]

total = 0
for item in cart:
    # TODO: 单价 × 数量算小计，加进 total
    # TODO: 打印这行明细（名字 x 数量 = 小计 元）
    pass

# TODO: 满 30 打 9 折（total = total * 0.9）
# TODO: 打印应付金额
print("合计：", total)`,
    points: [
      "列表套字典是真实数据最常见的形状（每个元素是一条记录）",
      "先算明细再算合计，打印顺序就是思考顺序",
      "小数乘法会有浮点尾巴，真实项目要用 round()"
    ],
    challenge: "改成满 50 减 10、满 100 减 30 的阶梯优惠（if/elif 注意从大到小判断）。"
  },
  {
    id: "proj-vote",
    title: "投票统计器",
    desc: "统计选票并用星星画出条形图，一眼看出谁赢了。",
    code: `# 投票统计器：字典计数 + 字符串乘法画图
votes = ["猫", "狗", "猫", "兔", "狗", "猫", "狗"]

count = {}
for v in votes:
    if v in count:
        count[v] = count[v] + 1
    else:
        count[v] = 1

print("=== 投票结果 ===")
for animal in count:
    bar = "★" * count[animal]      # 字符串 × 数字 = 重复几遍
    print(animal, bar, count[animal], "票")
# 跑一遍看看：狗和猫谁的星星更长？`,
    logic: [
      "选票是一个列表，空字典当计票本",
      "for 每张票：见过 +1，没见过记 1（老套路）",
      "再 for 一遍计票本，逐行打印结果",
      "字符串 × 数字画出星星条形图"
    ],
    skeleton: `# 投票统计器 · 框架
votes = ["猫", "狗", "猫", "兔", "狗", "猫", "狗"]

count = {}
for v in votes:
    # TODO: v 在计票本里就 +1，不在就记 1
    pass

for animal in count:
    # TODO: "★" * count[animal] 画条形，一行一条打印
    pass`,
    points: [
      "计数套路出现第 N 次：if in / else，必须形成肌肉记忆",
      "\"★\" * 3 得到 \"★★★\"——字符串也能做乘法",
      "字典遍历顺序就是插入顺序（Python 3.7+）"
    ],
    challenge: "改成按票数从高到低排序展示（提示：sorted(count, key=lambda k: -count[k])，或先找出最高票）。"
  },
  {
    id: "proj-textstat",
    title: "文本统计报告",
    desc: "给一段英文做体检：几句、几词、几个字母。",
    code: `# 文本统计报告：字符串方法大练兵
text = "Python is fun. I love Python. Python is powerful."

sentences = text.count(".")          # count：数子串出现几次
words = text.split()                 # split：按空格切单词
letters = 0
for ch in text:
    if ch != " " and ch != ".":      # 不算空格和句号
        letters = letters + 1

print("=== 文本报告 ===")
print("句子数：", sentences)
print("单词数：", len(words))
print("字母数：", letters)
print("出现最多的词是 Python 吗：", text.count("Python"), "次")`,
    logic: [
      "count(\".\") 数出句子数",
      "split() 切单词，len() 数单词数",
      "for 逐字符：跳过空格和句号，数出字母数",
      "逐行打印统计报告"
    ],
    skeleton: `# 文本统计报告 · 框架
text = "Python is fun. I love Python. Python is powerful."

# TODO: count(".") 数句子数
sentences = 0
# TODO: split() 切单词，存进 words
words = []
letters = 0
for ch in text:
    # TODO: 不是空格也不是句号，就 letters + 1
    pass

# TODO: 逐行打印：句子数 / 单词数 / 字母数
print("（统计结果打印在这里）", sentences, len(words), letters)`,
    points: [
      "count() 是字符串的方法：数子串出现次数",
      "len(words) 数列表有几格，别和 letters 搞混",
      "逐字符 for 可以做任意自定义统计"
    ],
    challenge: "改成统计每个单词出现几次并找出真正的「最高频词」（词频统计套路）。"
  },
  {
    id: "proj-rps3",
    title: "猜拳三局两胜",
    desc: "升级版猜拳：平局重来，谁先赢 2 局谁是冠军。",
    code: `# 猜拳三局两胜：while 双条件 + continue
import random

choices = ["石头", "剪刀", "布"]
my_score = 0
pc_score = 0
round_no = 1

while my_score < 2 and pc_score < 2:   # 谁先赢 2 局
    print("--- 第", round_no, "局 ---")
    me = input("出拳（石头/剪刀/布）：")
    pc = random.choice(choices)
    print("电脑出：", pc)
    if me == pc:
        print("平局，这局不算")
        continue                       # 平局重来，局数不涨
    elif (me == "石头" and pc == "剪刀") or (me == "剪刀" and pc == "布") or (me == "布" and pc == "石头"):
        my_score = my_score + 1
        print("这局你赢！")
    else:
        pc_score = pc_score + 1
        print("这局电脑赢")
    round_no = round_no + 1

if my_score == 2:
    print("三局两胜，冠军是你！")
else:
    print("惜败，下次加油！")`,
    logic: [
      "双方比分归零，局号从 1 开始",
      "while 双方都不到 2 分就一直打",
      "每局读用户出拳，电脑随机出",
      "平局 continue：比分和局号都不动",
      "分出胜负：赢方 +1，局号 +1；打完宣布冠军"
    ],
    skeleton: `# 猜拳三局两胜 · 框架
import random

choices = ["石头", "剪刀", "布"]
my_score = 0
pc_score = 0
round_no = 1

while my_score < 2 and pc_score < 2:
    me = input("出拳（石头/剪刀/布）：")
    pc = random.choice(choices)
    if me == pc:
        continue                  # TODO: 打印「平局，这局不算」
    elif False:                   # TODO: 三种赢法用 or 连起来
        my_score = my_score + 1
    else:
        pc_score = pc_score + 1
    round_no = round_no + 1

# TODO: 宣布冠军（谁先到 2）
print("比赛结束")`,
    points: [
      "while 后面可以 and 连两个条件：任一满足就继续",
      "continue 让平局「不算数」，比分和局数都不动",
      "比分、局号都是累加器变量的变体"
    ],
    challenge: "改成五局三胜，并加上比分播报（每局结束打印当前 x:y）。"
  },
  {
    id: "proj-guess100",
    title: "数字猜谜加强版",
    desc: "1~100 随机数，只有 7 次机会，还带 for-else 黑科技。",
    code: `# 数字猜谜加强版：随机数 + 次数限制 + for-else
import random

target = random.randint(1, 100)    # 随机整数，含 1 和 100
max_try = 7
print("我想了一个 1~100 的数字，你有", max_try, "次机会")

for i in range(1, max_try + 1):
    guess = int(input("第 " + str(i) + " 次猜："))
    if guess == target:
        print("猜对了！就是", target)
        break
    elif guess < target:
        print("小了")
    else:
        print("大了")
else:
    # for 的 else：循环没被 break 打断才执行
    print("机会用完，答案是", target)`,
    logic: [
      "random.randint(1, 100) 想一个数",
      "for 循环给 7 次机会（range(1, 8)）",
      "每次读猜测转 int：中了 break 庆祝",
      "没中提示小了还是大了",
      "for 的 else：7 次没中才公布答案"
    ],
    skeleton: `# 数字猜谜加强版 · 框架
import random

target = random.randint(1, 100)
max_try = 7

for i in range(1, max_try + 1):
    guess = int(input("猜一个数："))
    if guess == target:
        # TODO: 打印「猜对了」
        break
    elif guess < target:
        pass                      # TODO: 打印「小了」
    else:
        pass                      # TODO: 打印「大了」
else:
    # TODO: 公布答案（没被 break 才走到这里）
    pass`,
    points: [
      "random.randint(a, b) 含两头，和切片的「不含尾」不一样",
      "for...else 很少见但很好用：没 break 才走 else",
      "7 次猜 100 个数一定够——二分法每次砍一半（想想为什么）"
    ],
    challenge: "改成每次提示「差太远了」（差 > 20）或「很接近」（差 ≤ 5）。"
  },
  {
    id: "proj-contacts",
    title: "简易通讯录",
    desc: "字典的增删查全家桶：添加、查找、删除、列出全部。",
    code: `# 简易通讯录：字典的增删查
contacts = {}

while True:
    print("\\n=== 通讯录 ===")
    print("1 添加  2 查找  3 删除  4 全部  q 退出")
    cmd = input("请选择：")
    if cmd == "q":
        break
    elif cmd == "1":
        name = input("名字：")
        phone = input("电话：")
        contacts[name] = phone           # 增：直接赋值
        print("已保存")
    elif cmd == "2":
        name = input("找谁：")
        if name in contacts:             # 查：先判断在不在
            print(name, "的电话是", contacts[name])
        else:
            print("没找到这个人")
    elif cmd == "3":
        name = input("删谁：")
        if name in contacts:
            del contacts[name]           # 删：del 关键字
            print("已删除")
    elif cmd == "4":
        for name in contacts:
            print(name, contacts[name])

print("再见！")`,
    logic: [
      "空字典当通讯录",
      "while 循环显示菜单，按输入分流：增 / 查 / 删 / 列",
      "增：直接赋值；列：for 打印全部",
      "查和删先做 in 判断，防 KeyError 崩溃",
      "选 q 才 break 退出"
    ],
    skeleton: `# 简易通讯录 · 框架
contacts = {}

while True:
    print("1 添加  2 查找  3 删除  4 全部  q 退出")
    cmd = input("请选择：")
    if cmd == "q":
        break
    elif cmd == "1":
        name = input("名字：")
        phone = input("电话：")
        # TODO: 存进字典（直接赋值）
        pass
    elif cmd == "2":
        name = input("找谁：")
        # TODO: 先 in 判断在不在，再打印或提示没找到
        pass
    elif cmd == "3":
        name = input("删谁：")
        # TODO: 先 in 判断，再 del 删除
        pass
    elif cmd == "4":
        # TODO: for 打印全部联系人
        pass

print("再见！")`,
    points: [
      "字典增删查三件套：赋值增、in 查、del 删",
      "查和删之前都先 if in 判断，防止 KeyError 崩溃",
      "每个分支结构几乎一样——这就是「菜单程序模板」"
    ],
    challenge: "改成每个人存电话和生日两项（提示：contacts[name] = {\"phone\": phone, \"birthday\": birthday}）。"
  },
  {
    id: "proj-report",
    title: "成绩分析报表",
    desc: "一张报表看全班：等级、平均分、最高分、及格人数。",
    code: `# 成绩分析报表：函数 + 字典 + 多个统计器
scores = {"小明": 92, "小红": 58, "小刚": 76, "小丽": 85}

def grade(s):
    if s >= 90:
        return "优秀"
    elif s >= 60:
        return "及格"
    else:
        return "不及格"

total = 0
passed = 0
best_name = ""
best_score = 0
print("=== 成绩报表 ===")
for name in scores:
    s = scores[name]
    total = total + s                # 累加器：算总分
    if s >= 60:
        passed = passed + 1          # 计数器：算及格人数
    if s > best_score:               # 打擂台：找最高分
        best_score = s
        best_name = name
    print(name, s, grade(s))

print("---")
print("平均分：", total / len(scores))
print("最高分：", best_name, best_score)
print("及格人数：", passed, "/", len(scores))`,
    logic: [
      "成绩字典 + grade 函数负责分档",
      "准备三个统计器：总分、及格人数、最高分（打擂台）",
      "一个 for 同时喂饱三个统计器",
      "循环里逐行打印：名字 分数 等级",
      "循环后打印平均分、最高分、及格人数"
    ],
    skeleton: `# 成绩分析报表 · 框架
scores = {"小明": 92, "小红": 58, "小刚": 76, "小丽": 85}

def grade(s):
    # TODO: >= 90 return "优秀"，>= 60 return "及格"，否则 return "不及格"
    return "？"

total = 0
passed = 0
best_name = ""
best_score = 0
for name in scores:
    s = scores[name]
    # TODO: 累加总分 / 及格 +1 / 打擂台更新最高分
    # TODO: 打印一行：名字 分数 等级
    pass

# TODO: 打印平均分、最高分、及格人数
print("（报表尾行）", total, passed, best_name, best_score)`,
    points: [
      "一个 for 循环里可以同时维护好几个统计器",
      "把等级判断抽成函数，主循环就清爽了",
      "平均分用 /（小数），个数用 len()"
    ],
    challenge: "加一行「不及格名单」：把不及格的名字先收进一个列表，最后一行打印。"
  },
  {
    id: "proj-daily-quote",
    title: "每日一句生成器",
    desc: "三段随机拼接，每天都能生成不重样的打气话。",
    code: `# 每日一句生成器：随机组合三段话
import random

openers = ["今天也要", "记得", "不妨", "试着"]
actions = ["多喝一杯水", "夸自己一次", "背三个单词", "早睡十分钟"]
endings = ["，元气满满！", "，未来可期。", "，稳步前进。", "，就是胜利。"]

def daily_sentence():
    return random.choice(openers) + random.choice(actions) + random.choice(endings)

print("=== 今日一句 ===")
print(daily_sentence())
print("--- 再来三条 ---")
for i in range(3):
    print(daily_sentence())

# 4 x 4 x 4 = 64 种组合，加词条组合数爆炸增长`,
    logic: [
      "准备三个列表：开头、动作、结尾",
      "定义 daily_sentence：三个列表各 random.choice 一次",
      "用 + 把三段拼成一句话 return",
      "打印一条今日一句，再 for 循环多来几条"
    ],
    skeleton: `# 每日一句生成器 · 框架
import random

openers = ["今天也要", "记得", "不妨", "试着"]
actions = ["多喝一杯水", "夸自己一次", "背三个单词", "早睡十分钟"]
endings = ["，元气满满！", "，未来可期。", "，稳步前进。", "，就是胜利。"]

def daily_sentence():
    # TODO: 三个列表各 random.choice 一次，用 + 拼起来 return
    return ""

print(daily_sentence())
# TODO: for 循环再多打印几条`,
    points: [
      "随机拼接 = 准备几个列表 + 各 random.choice 一次",
      "组合爆炸：4×4×4 就有 64 种句子",
      "很多「AI 味文案机」本质就是这个套路"
    ],
    challenge: "加一个「天气段落」列表，并让用户输入今天天气，晴天和雨天用不同的结尾列表。"
  }
];
