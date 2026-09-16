# -*- coding: utf-8 -*-
# 校验脚本：所有任务的标准答案（仅供验证，不进网站）。
# 读取 .tasks.json（由 .export_tasks.js 从 lessons.js 导出），
# 运行每个任务的标准答案，按 exact / contains / regex 三种判法核对 lessons.js 里的 check.expected，
# 同时双向核对任务 id 是否一致。
import io, json, re, contextlib, sys

# (任务id, 标准答案, 期望的check) —— check 需与 lessons.js 中完全一致
CASES = [
    # ---- py-1 变量与 print ----
    ("py-1-t1", 'name = "小明"\nprint(name)',
     {"type": "exact", "expected": "小明"}),
    ("py-1-t2", 'name = "小明"\nage = 18\nprint("我叫", name, "，今年", age, "岁")',
     {"type": "exact", "expected": "我叫 小明 ，今年 18 岁"}),
    ("py-1-t3", 'print(type(18))\nprint(type("小明"))\nprint(type(3.14))',
     {"type": "exact", "expected": "<class 'int'>\n<class 'str'>\n<class 'float'>"}),
    ("py-1-t4", 'city = "杭州"\nhobby = "画画"\nprint("我住在", city, "，喜欢", hobby)',
     {"type": "exact", "expected": "我住在 杭州 ，喜欢 画画"}),
    ("py-1-t5", 'price = 6\ncount = 3\nprint("总价：", price * count)',
     {"type": "exact", "expected": "总价： 18"}),
    # ---- py-2 字符串 ----
    ("py-2-t1", 'name = "小明"\nage = 18\nprint(f"亲爱的{name}，祝你{age}岁生日快乐！")',
     {"type": "exact", "expected": "亲爱的小明，祝你18岁生日快乐！"}),
    ("py-2-t2", 'date = "2026-08-07"\nprint(date.split("-"))',
     {"type": "exact", "expected": "['2026', '08', '07']"}),
    ("py-2-t3", 's = "学习好难"\nprint(s.replace("难", "简单"))',
     {"type": "exact", "expected": "学习好简单"}),
    ("py-2-t4", 'line = "苹果,3.5,2"\nparts = line.split(",")\ntotal = float(parts[1]) * int(parts[2])\nprint(f"总价：{total}")',
     {"type": "exact", "expected": "总价：7.0"}),
    ("py-2-t5", 'email = "xiaoming@qq.com"\nuser = email.split("@")[0]\nprint(f"你好，{user}")',
     {"type": "exact", "expected": "你好，xiaoming"}),
    # ---- py-3 列表与字典 ----
    ("py-3-t1", 'fruits = ["苹果", "香蕉", "橘子"]\nprint(fruits[0])',
     {"type": "exact", "expected": "苹果"}),
    ("py-3-t2", 'fruits = ["苹果", "香蕉", "橘子"]\nfruits.append("葡萄")\nprint(len(fruits))',
     {"type": "exact", "expected": "4"}),
    ("py-3-t3", 'scores = {"语文": 90, "数学": 85}\nprint(scores["语文"])',
     {"type": "exact", "expected": "90"}),
    ("py-3-t4", 'fruits = ["苹果", "香蕉", "橘子"]\nprint(fruits[-1])',
     {"type": "exact", "expected": "橘子"}),
    ("py-3-t5", 'scores = {"语文": 90, "数学": 85}\nscores["数学"] = scores["数学"] + 5\nprint(scores)',
     {"type": "exact", "expected": "{'语文': 90, '数学': 90}"}),
    # ---- py-4 条件与循环 ----
    ("py-4-t1", 'score = 75\nif score >= 90:\n    print("优秀")\nelif score >= 60:\n    print("及格")\nelse:\n    print("不及格")',
     {"type": "exact", "expected": "及格"}),
    ("py-4-t2", 'fruits = ["苹果", "香蕉", "橘子"]\nfor f in fruits:\n    print(f)',
     {"type": "exact", "expected": "苹果\n香蕉\n橘子"}),
    ("py-4-t3", 'scores = [90, 45, 78, 55]\nfor s in scores:\n    if s >= 60:\n        print(s)',
     {"type": "exact", "expected": "90\n78"}),
    ("py-4-t4", 'nums = [10, 20, 30]\ntotal = 0\nfor n in nums:\n    total = total + n\nprint(total)',
     {"type": "exact", "expected": "60"}),
    ("py-4-t5", 'nums = [3, 8, 5, 10, 7, 6]\ncount = 0\nfor n in nums:\n    if n % 2 == 0:\n        count = count + 1\nprint(count)',
     {"type": "exact", "expected": "3"}),
    ("py-4-t6", 'for n in [1, 2, 3, 4, 5]:\n    if n % 2 == 0:\n        print(n, "偶数")\n    else:\n        print(n, "奇数")',
     {"type": "exact", "expected": "1 奇数\n2 偶数\n3 奇数\n4 偶数\n5 奇数"}),
    # ---- py-5 函数 ----
    ("py-5-t1", 'def add(a, b):\n    return a + b\n\nprint(add(3, 5))',
     {"type": "exact", "expected": "8"}),
    ("py-5-t2", 'def is_pass(score):\n    if score >= 60:\n        return "及格"\n    else:\n        return "不及格"\n\nprint(is_pass(75))',
     {"type": "exact", "expected": "及格"}),
    ("py-5-t3", 'def count_pass(scores):\n    n = 0\n    for s in scores:\n        if s >= 60:\n            n = n + 1\n    return n\n\nprint(count_pass([90, 45, 78, 62, 55]))',
     {"type": "exact", "expected": "3"}),
    ("py-5-t4", 'def greet(name):\n    return "你好，" + name + "！"\n\nprint(greet("小明"))',
     {"type": "exact", "expected": "你好，小明！"}),
    ("py-5-t5", 'def sum_pass(scores):\n    total = 0\n    for s in scores:\n        if s >= 60:\n            total = total + s\n    return total\n\nprint(sum_pass([90, 45, 78, 62, 55]))',
     {"type": "exact", "expected": "230"}),
    # ---- py-6 综合实战 ----
    ("py-6-t1", 'text = "苹果 香蕉 苹果 橘子 香蕉 苹果"\nwords = text.split()\ncount = {}\nfor w in words:\n    if w in count:\n        count[w] = count[w] + 1\n    else:\n        count[w] = 1\nfor w in count:\n    print(w, "出现了", count[w], "次")',
     {"type": "exact", "expected": "苹果 出现了 3 次\n香蕉 出现了 2 次\n橘子 出现了 1 次"}),
    ("py-6-t2", 'ledger = {"奶茶": 15, "午餐": 30}\nledger["奶茶"] = ledger["奶茶"] + 15\nledger["电影票"] = 40\ntotal = 0\nfor k in ledger:\n    total = total + ledger[k]\nprint(ledger)\nprint("总花费：", total)',
     {"type": "exact", "expected": "{'奶茶': 30, '午餐': 30, '电影票': 40}\n总花费： 100"}),
    ("py-6-t3", 'text = "banana"\ncount = {}\nfor ch in text:\n    if ch in count:\n        count[ch] = count[ch] + 1\n    else:\n        count[ch] = 1\nfor ch in count:\n    print(ch, "出现了", count[ch], "次")',
     {"type": "exact", "expected": "b 出现了 1 次\na 出现了 3 次\nn 出现了 2 次"}),
    ("py-6-t4", 'lines = ["苹果,3,2", "香蕉,2,5"]\ntotal = 0\nfor line in lines:\n    parts = line.split(",")\n    total = total + int(parts[1]) * int(parts[2])\nprint("总价：", total)',
     {"type": "exact", "expected": "总价： 16"}),
    ("py-6-t5", 'scores = {"语文": 90, "数学": 85, "英语": 92}\nbest_name = ""\nbest_score = 0\nfor name in scores:\n    if scores[name] > best_score:\n        best_score = scores[name]\n        best_name = name\nprint("最高分：", best_name, best_score)',
     {"type": "exact", "expected": "最高分： 英语 92"}),
    ("py-6-t6", 'def word_count(text):\n    count = {}\n    for w in text.split():\n        if w in count:\n            count[w] = count[w] + 1\n        else:\n            count[w] = 1\n    return count\n\nprint(word_count("猫 狗 猫"))',
     {"type": "exact", "expected": "{'猫': 2, '狗': 1}"}),
    # ---- 试炼题（无 hints，双倍 XP）----
    # py-1 试炼
    ("py-1-tr1", 'celsius = 25\nfahrenheit = celsius * 9 / 5 + 32\nprint("华氏度：", fahrenheit)',
     {"type": "exact", "expected": "华氏度： 77.0"}),
    ("py-1-tr2", 'a = "红"\nb = "蓝"\ntemp = a\na = b\nb = temp\nprint(a, b)',
     {"type": "exact", "expected": "蓝 红"}),
    ("py-1-tr3", 'length = 8\nwidth = 5\nprint("面积：", length * width)\nprint("周长：", (length + width) * 2)',
     {"type": "exact", "expected": "面积： 40\n周长： 26"}),
    # py-2 试炼
    ("py-2-tr1", 'phrase = "Artificial Intelligence"\nwords = phrase.split()\nprint(words[0][0] + words[1][0])',
     {"type": "exact", "expected": "AI"}),
    ("py-2-tr2", 's = "good good study"\nwords = s.split()\nprint(words[2], words[1], words[0])',
     {"type": "exact", "expected": "study good good"}),
    ("py-2-tr3", 'raw = "价格：99.5元"\nnum = raw.replace("价格：", "").replace("元", "")\nprint(f"翻倍后：{float(num) * 2}")',
     {"type": "exact", "expected": "翻倍后：199.0"}),
    # py-3 试炼
    ("py-3-tr1", 'names = ["语文", "数学"]\npoints = [90, 85]\nscores = {}\nfor i in [0, 1]:\n    scores[names[i]] = points[i]\nprint(scores)\nprint(scores["数学"])',
     {"type": "exact", "expected": "{'语文': 90, '数学': 85}\n85"}),
    ("py-3-tr2", 'students = [{"name": "小明", "score": 90}, {"name": "小红", "score": 85}]\nprint(students[1]["name"], students[1]["score"])',
     {"type": "exact", "expected": "小红 85"}),
    ("py-3-tr3", 'nums = [3, 9, 1, 7]\nprint(max(nums), min(nums), len(nums))',
     {"type": "exact", "expected": "9 1 4"}),
    # py-4 试炼
    ("py-4-tr1", 'for i in [1, 2, 3]:\n    for j in [1, 2, 3]:\n        if j <= i:\n            print(f"{j}x{i}={j*i}")',
     {"type": "exact", "expected": "1x1=1\n1x2=2\n2x2=4\n1x3=3\n2x3=6\n3x3=9"}),
    ("py-4-tr2", 'for n in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]:\n    if n % 3 == 0 and n % 5 == 0:\n        print("FizzBuzz")\n    elif n % 3 == 0:\n        print("Fizz")\n    elif n % 5 == 0:\n        print("Buzz")\n    else:\n        print(n)',
     {"type": "exact", "expected": "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz"}),
    ("py-4-tr3", 'target = 7\nguesses = [3, 9, 7]\nfor g in guesses:\n    if g < target:\n        print(g, "小了")\n    elif g > target:\n        print(g, "大了")\n    else:\n        print(g, "猜对了")',
     {"type": "exact", "expected": "3 小了\n9 大了\n7 猜对了"}),
    # py-5 试炼
    ("py-5-tr1", 'def password_strength(pwd):\n    has_digit = False\n    for ch in pwd:\n        if ch in "0123456789":\n            has_digit = True\n    if len(pwd) >= 8 and has_digit:\n        return "强"\n    elif len(pwd) >= 6:\n        return "中"\n    else:\n        return "弱"\n\nprint(password_strength("abc12345"))\nprint(password_strength("abcdef"))\nprint(password_strength("ab12"))',
     {"type": "exact", "expected": "强\n中\n弱"}),
    ("py-5-tr2", 'def average(nums):\n    total = 0\n    for n in nums:\n        total = total + n\n    return total / len(nums)\n\nprint(average([80, 90, 100]))',
     {"type": "exact", "expected": "90.0"}),
    ("py-5-tr3", 'def pay(amount):\n    if amount >= 100:\n        return amount - 20\n    else:\n        return amount\n\nprint(pay(150))\nprint(pay(80))',
     {"type": "exact", "expected": "130\n80"}),
    # py-6 试炼
    ("py-6-tr1", 'scores = {"小明": 92, "小红": 58, "小刚": 76}\n\ndef grade(s):\n    if s >= 90:\n        return "优秀"\n    elif s >= 60:\n        return "及格"\n    else:\n        return "不及格"\n\nfor name in scores:\n    print(name, scores[name], grade(scores[name]))\ntotal = 0\nfor name in scores:\n    total = total + scores[name]\nprint("平均分：", total // len(scores))',
     {"type": "exact", "expected": "小明 92 优秀\n小红 58 不及格\n小刚 76 及格\n平均分： 75"}),
    ("py-6-tr2", 'messages = ["我喜欢苹果", "苹果真好吃", "香蕉也不错"]\nkeyword = "苹果"\nn = 0\nfor msg in messages:\n    if keyword in msg:\n        n = n + 1\nprint(f"「{keyword}」出现了 {n} 条消息")',
     {"type": "exact", "expected": "「苹果」出现了 2 条消息"}),
    ("py-6-tr3", 'data = ["苹果,10,3", "香蕉,0,2", "橘子,5,4"]\nfor line in data:\n    parts = line.split(",")\n    if int(parts[1]) == 0:\n        print(parts[0], "缺货")\n    else:\n        print(parts[0], "库存", parts[1])',
     {"type": "exact", "expected": "苹果 库存 10\n香蕉 缺货\n橘子 库存 5"}),
]

with open("practice/.tasks.json", encoding="utf-8") as f:
    exported = {t["id"]: t for t in json.load(f)["tasks"]}

def normalize(s):
    return s.replace("\r\n", "\n").rstrip()

def judge(check, output):
    out = normalize(output)
    if check["type"] == "exact":
        return out == normalize(check["expected"])
    if check["type"] == "contains":
        return check["expected"] in out
    if check["type"] == "regex":
        return re.search(check["expected"], out) is not None
    return False

fails = 0
seen = set()
for tid, code, check in CASES:
    seen.add(tid)
    # 1) lessons.js 里必须存在该任务，且 check 与本脚本登记的一致
    if tid not in exported:
        print(f"[FAIL] {tid} lessons.js 中不存在该任务")
        fails += 1
        continue
    if exported[tid]["check"] != check:
        print(f"[FAIL] {tid} check 不一致\n  lessons.js: {exported[tid]['check']!r}\n  本脚本登记: {check!r}")
        fails += 1
        continue
    # 2) 实际运行标准答案，核对输出能通过判题
    buf = io.StringIO()
    try:
        with contextlib.redirect_stdout(buf):
            exec(code, {})
    except Exception as e:
        print(f"[FAIL] {tid} 标准答案运行报错: {e}")
        fails += 1
        continue
    if judge(check, buf.getvalue()):
        print(f"[OK]   {tid} ({check['type']})")
    else:
        print(f"[FAIL] {tid} 判题不通过\n  期望({check['type']}): {check['expected']!r}\n  实际: {buf.getvalue()!r}")
        fails += 1

# 3) 反向核对：lessons.js 里不能有本脚本没登记答案的任务
for tid in exported:
    if tid not in seen:
        print(f"[FAIL] {tid} 在 lessons.js 中但缺少标准答案登记")
        fails += 1

print(f"\n共 {len(CASES)} 个任务，失败 {fails} 个")
sys.exit(1 if fails else 0)
