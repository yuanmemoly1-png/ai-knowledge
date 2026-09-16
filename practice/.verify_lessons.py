# -*- coding: utf-8 -*-
# 校验脚本：读取 .tasks.json，对 lessons.js 做结构体检（不运行答案）：
# 1) 每课 8-9 个任务（普通 5-6 题 + 试炼 3 题），全站 >= 48 题
# 2) 任务 id 全站唯一
# 3) 不含 solution 字段（答案不进网站）
# 4) 普通题 hints 为 1-3 条；试炼题必须有 trial 标记且无 hints
# 5) starterCode 含「# 在这里写代码」引导
import json, sys

with open("practice/.tasks.json", encoding="utf-8") as f:
    data = json.load(f)

lessons, tasks = data["lessons"], data["tasks"]
fails = 0

def fail(msg):
    global fails
    print(f"[FAIL] {msg}")
    fails += 1

# 1) 每课题量、试炼题数与总量
for l in lessons:
    if not 8 <= l["taskCount"] <= 9:
        fail(f"{l['id']}（{l['title']}）任务数为 {l['taskCount']}，要求 8-9")
    elif l["trialCount"] != 3:
        fail(f"{l['id']}（{l['title']}）试炼题数为 {l['trialCount']}，要求 3")
    else:
        print(f"[OK]   {l['id']}（{l['title']}）{l['taskCount']} 题（含试炼 {l['trialCount']}）")
total = sum(l["taskCount"] for l in lessons)
if total < 48:
    fail(f"全站共 {total} 题，要求 >= 48")

# 2) id 唯一
ids = [t["id"] for t in tasks]
if len(ids) != len(set(ids)):
    dupes = {i for i in ids if ids.count(i) > 1}
    fail(f"任务 id 重复: {dupes}")

# 3)-5) 逐题检查
for t in tasks:
    if t["hasSolution"]:
        fail(f"{t['id']} 仍包含 solution 字段")
    if t["trial"]:
        if t["hintsCount"] != 0:
            fail(f"{t['id']} 是试炼题，不应有 hints（现有 {t['hintsCount']} 条）")
    else:
        if not 1 <= t["hintsCount"] <= 3:
            fail(f"{t['id']} 普通题 hints 数量为 {t['hintsCount']}，要求 1-3")
    if not t["starterHasMarker"]:
        fail(f"{t['id']} starterCode 缺少「# 在这里写代码」引导")

print(f"\n共 {len(lessons)} 课 {total} 个任务，结构问题 {fails} 个")
sys.exit(1 if fails else 0)
