# -*- coding: utf-8 -*-
# 校验脚本：验证 daily.js 今日任务数据
# 默写曲目：结构体检 + 实跑核对 expected，覆盖 app.js 的两条判题路径：
#           路径一（拼接）：given + 标准答案（用户只默写逻辑时，判卷源码就是这样拼出来的）
#           路径二（去重）：标准答案独立运行（用户连给定数据一起默写时，app.js 不再重复拼接）
#           交互式曲目另加路径三（shim）：input() shim + given + 标准答案，与 app.js 注入方式一致
# 小项目：结构体检 + 实际运行 code（交互的喂输入），exit code 必须为 0
# 运行统一用 python -X utf8 并强制 UTF-8 环境，避免 Windows 控制台编码问题
import json, os, subprocess, sys, tempfile

with open("practice/.daily.json", encoding="utf-8") as f:
    data = json.load(f)

# 交互式小项目的喂食输入（按 id 登记）
PROJECT_INPUTS = {
    "proj-rollcall": "\n\nq\n",
    "proj-rps": "石头\n布\n剪刀\nq\n",
    "proj-ledger": "1\n奶茶\n15\n2\n3\nq\n",
    "proj-rps3": "石头\n剪刀\n布\n石头\n剪刀\n布\n石头\n剪刀\n布\n石头\n",
    "proj-guess100": "50\n75\n88\n95\n99\n92\n91\n93\n94\n96\n97\n98\n",
    "proj-contacts": "1\n小明\n123456\n2\n小明\n3\n小明\n4\nq\n",
}

ENV = {**os.environ, "PYTHONIOENCODING": "utf-8", "PYTHONUTF8": "1"}
fails = 0

def fail(msg):
    global fails
    print(f"[FAIL] {msg}")
    fails += 1

def norm(s):
    return s.replace("\r\n", "\n").rstrip()

def run_python(code, stdin_text=""):
    """实际运行一段代码，返回 (exit_code, stdout, stderr)"""
    with tempfile.NamedTemporaryFile("w", suffix=".py", encoding="utf-8", delete=False) as f:
        f.write(code)
        path = f.name
    try:
        r = subprocess.run(
            [sys.executable, "-X", "utf8", path],
            input=stdin_text, capture_output=True, text=True,
            encoding="utf-8", timeout=60, env=ENV,
        )
        return r.returncode, r.stdout, r.stderr
    except subprocess.TimeoutExpired:
        return -1, "", "运行超时（可能死循环或输入不够）"
    finally:
        os.unlink(path)

def input_shim(stdin_lines):
    """与 app.js 同款的 input() shim：把 input() 换成从数组依次取值"""
    return (
        "import builtins\n"
        f"_inputs = iter({stdin_lines!r})\n"
        "builtins.input = lambda *a: next(_inputs)\n"
    )

# ---- 默写曲目：结构 + given 拼接/去重双路径实跑核对 expected ----
if len(data["dictation"]) != 14:
    fail(f"默写曲目共 {len(data['dictation'])} 条，要求 14")
for d in data["dictation"]:
    if not 10 <= d["codeLines"] <= 20:
        fail(f"{d['id']} code 为 {d['codeLines']} 行，要求 10-20")
    if not d["hasGoal"] or not d["hasNote"]:
        fail(f"{d['id']} 缺少 goal 或 note")
    if not d["given"]:
        fail(f"{d['id']} 缺少 given 字段（题面给定数据）")
    if not d["expected"]:
        fail(f"{d['id']} 缺少 expected 字段")
        continue
    given = d["given"] + "\n"
    stdin_text = "\n".join(d["stdin"]) + "\n" if d["stdin"] else ""
    # 路径一（拼接路径）：判卷源码 = given + 用户代码（用户只默写逻辑时）
    code, out, err = run_python(given + d["code"], stdin_text)
    if code != 0:
        fail(f"{d['id']} given+code 运行失败\n  stderr: {err.strip()[:300]}")
        continue
    if norm(out) != norm(d["expected"]):
        fail(f"{d['id']} given+code 输出与 expected 不一致\n  期望: {norm(d['expected'])!r}\n  实际: {norm(out)!r}")
        continue
    # 路径二（去重路径）：用户连给定数据一起默写，app.js 只跑用户代码本身
    code1, out1, err1 = run_python(d["code"], stdin_text)
    if code1 != 0 or norm(out1) != norm(d["expected"]):
        fail(f"{d['id']} 标准答案独立运行不一致\n  stderr: {err1.strip()[:200]}\n  实际: {norm(out1)!r}")
        continue
    # 路径三（仅交互式）：用 shim 前置注入再跑一遍，与 app.js 注入方式一致（shim + given + code）
    if d["stdin"]:
        code2, out2, err2 = run_python(input_shim(d["stdin"]) + given + d["code"])
        if code2 != 0 or norm(out2) != norm(d["expected"]):
            fail(f"{d['id']} shim 方式运行不一致\n  stderr: {err2.strip()[:200]}\n  实际: {norm(out2)!r}")
            continue
        print(f"[OK]   {d['id']}（默写，given 拼接/去重 + stdin shim 三验）")
    else:
        print(f"[OK]   {d['id']}（默写，given 拼接/去重双验）")

# ---- 小项目：结构 + 完整代码实跑 + skeleton 骨架实跑 ----
if len(data["projects"]) != 14:
    fail(f"小项目共 {len(data['projects'])} 条，要求 14")
for p in data["projects"]:
    if not 15 <= p["codeLines"] <= 40:
        fail(f"{p['id']} code 为 {p['codeLines']} 行，要求 15-40")
    if not 3 <= p["logicCount"] <= 6:
        fail(f"{p['id']} logic 为 {p['logicCount']} 条，要求 3-6")
    if not 2 <= p["pointsCount"] <= 3:
        fail(f"{p['id']} points 为 {p['pointsCount']} 条，要求 2-3")
    if not p["hasDesc"] or not p["hasChallenge"]:
        fail(f"{p['id']} 缺少 desc 或 challenge")
    # 完整代码实跑
    code, out, err = run_python(p["code"], PROJECT_INPUTS.get(p["id"], ""))
    if code != 0:
        fail(f"{p['id']} 完整代码运行失败\n  stderr: {err.strip()[:300]}")
        continue
    # skeleton 骨架必须也能跑通（不报错即可）
    if not p["skeleton"]:
        fail(f"{p['id']} 缺少 skeleton 字段")
        continue
    code2, out2, err2 = run_python(p["skeleton"], PROJECT_INPUTS.get(p["id"], ""))
    if code2 != 0:
        fail(f"{p['id']} skeleton 运行失败\n  stderr: {err2.strip()[:300]}")
        continue
    print(f"[OK]   {p['id']}（项目 + 骨架，logic {p['logicCount']} 条）")

total = len(data["dictation"]) + len(data["projects"])
print(f"\n共 {total} 个条目，失败 {fails} 个")
sys.exit(1 if fails else 0)
