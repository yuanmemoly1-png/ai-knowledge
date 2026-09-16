# AI 冒险岛 · 复习中心题库结构校验
# 通过 node 加载 data/quiz.js 导出 JSON，再用 python 校验：
#   - QUIZ_TOPICS：12 个主题 × 12 题（共 144 题），id 唯一，题目文本不重复
#   - choice：answer 必须在 options 内且只出现一次；judge：answer 为布尔；fill：answer 为非空字符串
#   - 每题 explain / note 非空
#   - CAREER_QUESTIONS：5 个职业 × 12 题（共 60 题），guide 四要素（考点/答题框架/加分句/避坑）齐全非空
#   - 全库总题数 144 + 60 = 204
import json
import subprocess
import sys
import os

# Windows 控制台默认 GBK，打印 emoji 会报错，强制 UTF-8 输出
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

HERE = os.path.dirname(os.path.abspath(__file__))

DUMP_JS = (
    "const m = require('./data/quiz.js');"
    "console.log(JSON.stringify(m));"
)

raw = subprocess.run(
    ["node", "-e", DUMP_JS],
    cwd=HERE, capture_output=True, text=True, encoding="utf-8",
)
if raw.returncode != 0:
    print("node 加载 quiz.js 失败：")
    print(raw.stderr)
    sys.exit(1)

data = json.loads(raw.stdout)
topics = data["QUIZ_TOPICS"]
careers = data["CAREER_QUESTIONS"]

errors = []
warnings = []

# ---------- QUIZ_TOPICS ----------
if len(topics) != 12:
    errors.append(f"主题数应为 12，实际 {len(topics)}")

seen_topic_ids = set()
seen_q_texts = set()
total_q = 0
fill_count = 0

for t in topics:
    tid = t.get("id")
    if not tid:
        errors.append("存在缺 id 的主题")
    elif tid in seen_topic_ids:
        errors.append(f"主题 id 重复：{tid}")
    seen_topic_ids.add(tid)

    for field in ("title", "note"):
        if not t.get(field):
            errors.append(f"主题 {tid} 缺字段 {field}")

    qs = t.get("questions", [])
    if len(qs) != 12:
        errors.append(f"主题 {tid} 应为 12 题，实际 {len(qs)}")

    for i, q in enumerate(qs):
        loc = f"{tid} 第{i + 1}题"
        total_q += 1
        qtype = q.get("type")
        text = (q.get("q") or "").strip()
        if not text:
            errors.append(f"{loc} 题干为空")
        elif text in seen_q_texts:
            errors.append(f"{loc} 题干与其他题重复：{text[:20]}…")
        seen_q_texts.add(text)

        if qtype == "choice":
            opts = q.get("options") or []
            if len(opts) < 2:
                errors.append(f"{loc} 选择题选项少于 2 个")
            if q.get("answer") not in opts:
                errors.append(f"{loc} 选择题 answer 不在 options 内：{q.get('answer')!r}")
            elif opts.count(q["answer"]) != 1:
                errors.append(f"{loc} 选择题 answer 在 options 中出现多次")
        elif qtype == "judge":
            if not isinstance(q.get("answer"), bool):
                errors.append(f"{loc} 判断题 answer 必须是布尔值，实际 {q.get('answer')!r}")
        elif qtype == "fill":
            fill_count += 1
            if not isinstance(q.get("answer"), str) or not q["answer"].strip():
                errors.append(f"{loc} 填空题 answer 必须是非空字符串")
        else:
            errors.append(f"{loc} 未知题型：{qtype!r}")

        for field in ("explain", "note"):
            if not (q.get(field) or "").strip():
                errors.append(f"{loc} 缺 {field}（思路讲解/关联笔记）")

# ---------- CAREER_QUESTIONS ----------
EXPECTED_CAREERS = ["AI 产品经理", "Agent 开发工程师", "数据标注与评测", "FDE 前置部署", "大模型训练"]
GUIDE_KEYS = ["考点", "答题框架", "加分句", "避坑"]

if len(careers) != 5:
    errors.append(f"职业数应为 5，实际 {len(careers)}")

names = [c.get("career") for c in careers]
for name in EXPECTED_CAREERS:
    if name not in names:
        errors.append(f"缺少职业：{name}")

for c in careers:
    cname = c.get("career", "?")
    items = c.get("items", [])
    if len(items) != 12:
        errors.append(f"职业 {cname} 应为 12 题，实际 {len(items)}")
    for i, item in enumerate(items):
        loc = f"{cname} 第{i + 1}题"
        if not (item.get("q") or "").strip():
            errors.append(f"{loc} 题干为空")
        guide = item.get("guide") or {}
        for k in GUIDE_KEYS:
            if not str(guide.get(k) or "").strip():
                errors.append(f"{loc} guide 缺「{k}」")

# ---------- 汇总 ----------
total_career_q = sum(len(c["items"]) for c in careers)
if total_q != 144:
    errors.append(f"知识点题总数应为 144，实际 {total_q}")
if total_career_q != 60:
    errors.append(f"职业题总数应为 60，实际 {total_career_q}")
if total_q + total_career_q != 204:
    errors.append(f"全库总题数应为 204，实际 {total_q + total_career_q}")

print(f"知识点主题：{len(topics)} 个，共 {total_q} 题（其中填空 {fill_count} 题）")
for t in topics:
    types = [q["type"] for q in t["questions"]]
    print(f"  {t['icon']} {t['title']}: {len(t['questions'])} 题 [{', '.join(types)}]")
print(f"职业面试题：{len(careers)} 个职业，共 {sum(len(c['items']) for c in careers)} 题")
for c in careers:
    print(f"  {c['icon']} {c['career']}: {len(c['items'])} 题")

if warnings:
    print("\n警告：")
    for w in warnings:
        print("  ⚠ " + w)

if errors:
    print(f"\n❌ 校验失败，共 {len(errors)} 个问题：")
    for e in errors:
        print("  ✗ " + e)
    sys.exit(1)

print("\n✅ 题库结构校验全部通过")
