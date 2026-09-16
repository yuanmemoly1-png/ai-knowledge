// 第七篇 · 第 21 章 多智能体架构 —— 教材正文
window.TB_SECTIONS = window.TB_SECTIONS || {};
Object.assign(window.TB_SECTIONS, {
  "21.1": {
    id: "21.1",
    t: "智能体间通信（A2A）",
    from: "《智能体设计模式》第 15 章 · Inter-Agent Communication (A2A)",
    why: "不学这节，你会把 A2A 和 MCP 当成同一件事，面试里一句话就被问穿；更实际的后果是，在不需要跨系统的场景里凭空搭出一层网络协议。",
    learn: "能画出 A2A 的三个角色与任务状态流转，说出 A2A 与 MCP 的分工边界；给定一个多智能体场景，能判断该用 A2A 还是框架内的 handoff。",
    body: `### 一句话说清
A2A 是一套让不同框架造出来的智能体互相派活的通信标准。类比：MCP 是给工人配齐工具箱，A2A 是让三家不同公司派来的工人能对上工、说清谁负责哪一段。

### 展开讲
症状：单个智能体再强也只覆盖问题的一面，而 LangGraph、CrewAI、ADK 造出来的智能体各说各话，想让它们协作就得为每种组合写一次胶水代码，集成成本随数量平方地涨。

A2A 先定下三件事。角色只有三个：用户、代表用户发起请求的客户端、提供 HTTP 端点的远程智能体；远程智能体对客户端是不透明的，客户端不必知道它内部怎么实现。能力写在 Agent Card（一个 JSON）里——身份、能力开关（能否 streaming、能否推送通知）、认证方案、默认输入输出模态，以及最关键的 skills 列表。发现卡片有三条路：约定路径（如 /.well-known/agent.json）、企业精选注册表、私下直接配置。

干活的单位是异步任务：任务有唯一 id，经过 submitted、working、completed、failed、input-required 等状态；消息分元数据和内容部分；产出叫 artifact，可以流式吐出。协议走 HTTP(S)，载荷用 JSON-RPC 2.0，contextId 把多次交互归进同一个上下文。

交互方式按任务时长挑：快问快答用同步请求响应，长任务用异步轮询，要实时增量结果用 SSE 流式，特别长的注册 webhook。选哪种不是风格偏好，由 Agent Card 的 capabilities 决定。

A2A 和 MCP 最常被问混。MCP 管智能体怎么规范地够到外部数据和工具，A2A 管智能体怎么把活派给另一个智能体：前者在智能体与工具之间，后者在智能体与智能体之间。

**和教材其它节的分工**：MCP 的机制在第 19.3 节已经讲透，多智能体怎么组织在第 18.7 节讲过，本节只讲跨系统通信这一层——能力怎么被发现、消息长什么样、失败怎么表达。

### 动手看
~~~python
import time, requests

TOKEN, BASE = "...", "http://weather-service.example.com"

# 1) 能力发现：先读 Agent Card，再决定派什么活
card = requests.get(BASE + "/.well-known/agent.json", timeout=10).json()
if "get_forecast" not in {s["id"] for s in card["skills"]}:
    raise RuntimeError("对方没有这个能力，不要派活")

# 2) 派任务：JSON-RPC 2.0 over HTTP，凭据放 header
payload = {
    "jsonrpc": "2.0", "id": "1",
    "method": "sendTask",              # 需要流式就换成 sendTaskSubscribe
    "params": {
        "id": "task-001", "sessionId": "session-001",
        "message": {"role": "user",
                    "parts": [{"type": "text", "text": "5-day forecast for Tokyo"}]},
        "acceptedOutputModes": ["text/plain"], "historyLength": 5,
    },
}
r = requests.post(card["url"], json=payload,
                  headers={"Authorization": "Bearer " + TOKEN}, timeout=30).json()
task_id, state = r["result"]["id"], r["result"]["status"]["state"]

# 3) 失败语义：状态机就是契约，超时要自己判
deadline = time.time() + 120
while state in ("submitted", "working"):
    if time.time() > deadline:
        raise TimeoutError("任务超时：" + task_id)
    time.sleep(2)
    r = requests.post(card["url"], json={
        "jsonrpc": "2.0", "id": "2", "method": "getTask",
        "params": {"id": task_id}},
        headers={"Authorization": "Bearer " + TOKEN}, timeout=30).json()
    state = r["result"]["status"]["state"]

if state == "input-required":
    raise RuntimeError("对方要补充信息，转人工澄清")
if state == "failed":
    raise RuntimeError("远端失败，按幂等键决定是否重试")
~~~

### 什么时候不该用
两个反模式：把同进程里的内部智能体拆成微服务再用 A2A 串起来，凭空引入网络失败、序列化和超时；以及把 Agent Card 当能力清单随手公开，泄露内部技能与端点。

更简单的替代：所有智能体都在你的代码库里、你控制全部实现时，直接函数调用，或者用框架内的 handoff（ADK 的 agent_tool、CrewAI 的 delegation）就够了。A2A 的价值只在边界上——跨团队、跨公司、跨框架。没有边界，就没有它要解决的问题。`,
    keypoints: [
      "A2A 是开放、基于 HTTP 的标准，让不同框架（ADK、LangGraph、CrewAI）造出来的智能体可以协作。",
      "Agent Card 是智能体的数字身份，承载能力、技能、端点与认证要求；发现方式有约定 URI、精选注册表、直接配置三种。",
      "通信以异步任务为组织单位，任务有唯一 id 与 submitted / working / completed / failed / input-required 等状态，载荷走 JSON-RPC 2.0，contextId 串联多次交互。",
      "交互方式按任务时长选：同步请求响应、异步轮询、SSE 流式、Webhook 推送；支持哪几种由 Agent Card 的 capabilities 声明。",
      "A2A 与 MCP 互补而非替代：MCP 管智能体与外部工具、数据的接口，A2A 管智能体与智能体之间的任务委派与协调。",
      "凭据走 HTTP 头而不是 URL 或消息体，连接可上 mTLS，通信全程留审计日志。",
    ],
    pitfalls: [
      "把 A2A 当成 MCP 的升级版——两者解决的是不同边界上的问题，连工具用 MCP，派活用 A2A。",
      "把同进程内部的智能体拆成微服务再用 A2A 串起来，凭空引入网络失败与序列化成本。",
      "把「没有返回」当成功，不读任务状态机，也不设超时与幂等重试。",
      "Agent Card 端点不加保护，把内部技能和端点清单暴露出去。",
    ],
    rel: ["12-智能体设计模式/00-模式总览·21个模式速查.md", "01-名词与概念/MCP模型上下文协议.md", "02-AI-Agent开发/CrewAI多智能体.md"],
    qs: ["dp-15"],
    ev: [],
  },

  "21.2": {
    id: "21.2",
    t: "资源感知优化",
    from: "《智能体设计模式》第 16 章 · Resource-Aware Optimization",
    why: "不学这节，你会在成本失控时条件反射地换便宜模型，而账单的大头往往是每次请求都塞满的历史上下文。",
    learn: "能说出资源感知与规划的分工，为一个智能体画出分类—路由—回退的链路，并指出自己系统里成本最大的那一项以及一项具体削减动作。",
    body: `### 一句话说清
资源感知优化是让智能体运行中盯着预算做决策：钱够就用贵模型慢慢想，赶时间就用快的，预算紧就压上下文。类比：打车、地铁、走路目的地一样，选哪种看你手头的时间和钱。

### 展开讲
症状：LLM 应用又贵又慢，而「每个任务都用最强模型」是最省事也最贵的做法。没有动态管理策略，系统就不能随任务难度伸缩。

标准做法是路由器先给请求分档。书里分三类：simple（直接答）、reasoning（多步推理走更强模型）、internet_search（需要实时信息，先搜索再答）。分档后交给对应模型，再加一个批评智能体回看质量，用它指出次优路由。

书里的场景是旅行规划器：高层规划交给 Gemini Pro；计划定了之后，查航班价格、查酒店房态、找餐厅评价这些本质是重复的网络查询，交给 Gemini Flash。

另一条必配机制是回退。首选模型过载或限流时自动切到更便宜的模型，做优雅降级而不是整体失败。OpenRouter 的做法是给一个模型列表，第一个失败就顺次找下一个，最终成本对应真正完成计算的那个模型。

最常见的误判是只优化单价、不优化 token 用量。很多团队忙着把贵模型换成便宜模型，却从没看过每次请求往上下文里塞了多少历史。书里把上下文修剪与摘要单列成一项讲的正是这件事——压掉 prompt 里的历史，往往比换模型省得多。

**和教材其它节的分工**：Token 与计费口径在《Token与分词》和小白课计费那节讲过，路由这个模式在第 18.2 节讲过；本节只讲把资源当硬约束来决策这一层——预算怎么定、超标时砍什么。

### 动手看
~~~python
from dataclasses import dataclass

@dataclass
class Budget:
    max_input_tokens: int = 8000
    max_seconds: float = 20.0
    max_cost: float = 0.05

ROUTES = {   # 每档一条回退链
    "simple":          ["flash", "mid"],
    "reasoning":       ["pro", "mid"],
    "internet_search": ["mid", "flash"],
}

def classify(prompt: str) -> str:
    p = prompt.lower()
    if any(k in p for k in ("今天", "最新", "股价", "汇率")):
        return "internet_search"
    if any(k in p for k in ("证明", "推导", "为什么", "比较")):
        return "reasoning"
    return "simple"

def trim_history(history, budget: Budget):
    # 成本大头通常在这里，不在模型单价上
    kept, used = [], 0
    for turn in reversed(history):
        if used + turn.tokens > budget.max_input_tokens * 0.6:
            break
        kept.append(turn)
        used += turn.tokens
    return list(reversed(kept)), used

def run(prompt, history, budget: Budget):
    route = classify(prompt)
    hist, kept = trim_history(history, budget)
    last_err = None
    for model in ROUTES[route]:              # 顺序回退：过载就换下一个
        try:
            resp = call_model(model, prompt, hist, timeout=budget.max_seconds)
            cost = (resp.prompt_tokens * PRICE_IN[model]
                    + resp.output_tokens * PRICE_OUT[model])
            if cost > budget.max_cost:
                raise BudgetExceeded(cost)
            return resp.text, {"route": route, "model": model,
                               "input_tokens": resp.prompt_tokens, "cost": cost}
        except (RateLimited, Unavailable) as e:   # 只有可重试的错才回退
            last_err = e
    raise RuntimeError("回退链耗尽，转人工或降级回答") from last_err
~~~

### 什么时候不该用
三个反模式：为了省钱把关键任务路由到弱模型，省下的钱远小于答错的代价；忘了批评智能体自己也在烧 token，收益覆盖不了自身成本时它就不该存在；路由分类器成了新的单点故障，分类错了整条链路都错，比模型答得差更难发现。

更简单的替代：预算宽松、请求同质时不要加路由器，固定用一个中等模型加一套上下文裁剪规则，通常比分类、路由、批评、回退四层更划算。`,
    keypoints: [
      "资源感知优化管的是在预算内达成目标或优化效率，和只管动作顺序的规划不是一回事。",
      "标准做法是路由器先给请求分档（简单 / 推理 / 需要联网），再交给对应模型；批评智能体用质量反馈修路由逻辑。",
      "回退机制是必配项：首选模型过载或限流时切到默认或更便宜的模型，做优雅降级而不是整体失败。",
      "只优化模型单价、不优化 token 用量是最常见的误判；上下文修剪与摘要往往才是省钱的大头。",
      "同族手段包括动态模型切换、自适应工具选择、主动资源预测、成本敏感探索、节能部署、学习型资源分配策略。",
    ],
    pitfalls: [
      "为了省钱把关键任务路由到弱模型，省下的钱远小于答错的代价。",
      "忽略批评智能体自身也在消耗 token，收益覆盖不了成本时它就不该存在。",
      "路由分类器成了新的单点故障，分类错了整条链路都错，且比模型答得差更难发现。",
      "预算宽松、请求同质时硬加路由器与回退链，制造复杂度却拿不到收益。",
    ],
    rel: ["12-智能体设计模式/00-模式总览·21个模式速查.md", "01-名词与概念/Token与分词.md", "00-小白课堂/小白课-Token与计费.md"],
    qs: ["dp-16"],
    ev: [],
  },

  "21.3": {
    id: "21.3",
    t: "推理技术",
    from: "《智能体设计模式》第 17 章 · Reasoning Techniques",
    why: "不学这节，你要么对所有问题都套上最重的推理链、把简单流量做成最贵的流量，要么被追问「什么情况该用思维链」时只能背名词。",
    learn: "能说出思维链、思维树、自我纠正、程序辅助、ReAct、RLVR 各自解决的问题，并针对一道具体的事实题说明为什么不该套思维链。",
    body: `### 一句话说清
推理技术是让模型把「想」这一步也写出来，用更多推理时间换更准的答案。类比：难题不打草稿必错，填空题打草稿则纯属浪费时间。

### 展开讲
这一族的共同原则是在推理阶段分配更多计算：不是换更大的卡，而是给模型更多处理步骤。

思维链（CoT）最基本：不让模型直接给答案，先生成一串中间步骤，把难题拆成几个简单步骤。实现方式有少样本示例和直接指示「逐步思考」两种，它同时买到更高的准确率和一条可调试的推理轨迹。

思维树（ToT）在思维链上加了分叉，能从中间步骤岔出多条路径形成树，于是可以回溯、自我纠正。自我纠正把质量检查嵌进生成过程。程序辅助模型（PALMs）把计算卸载出去，让模型生成代码并真的执行。

ReAct 把推理和行动缝在一起，循环是「思考 → 行动 → 观察 → 思考」，工具结果回灌进下一轮推理。

还有一条线是训练出来的。可验证奖励强化学习（RLVR）在数学、代码这类有已知答案的问题上试错训练，让模型学会先生成很长的、可自我纠正和回溯的思维链。这对应推理扩展定律：给足推理期计算，更小的模型有时能超过更大但只做单次生成的模型。

再往上是多模型协作：辩论链（CoD）让多个模型互相批评，辩论图（GoD）把辩论变成支持与反驳构成的网络。

最后要划一条边界。书里给的适用条件是问题复杂到单次通过答不好、需要分解或多步逻辑。反过来，简单事实题硬套思维链，付出的是成倍 token 和延迟，还多出中间步骤走偏的机会——一步能答对的题拆成五步，每一步都多一个出错点。

**和教材其它节的分工**：ReAct 循环在第 18.2 节讲过，反思作为独立模式在第 18.4 节讲过；本节只讲用多少推理时间换多少准确率这个权衡。

### 动手看
~~~python
import collections

def cot(question, model, k=1, temperature=0.0):
    # k>1 即自洽性投票
    answers = []
    for _ in range(k):
        out = model.complete(
            prompt=f"""逐步推理。最后单独一行写 FINAL: <答案>。
问题：{question}""",
            temperature=temperature)
        answers.append(extract_final(out))
    winner, votes = collections.Counter(answers).most_common(1)[0]
    if votes / k < 0.6:            # 票数分散 = 没把握
        raise LowConfidence(winner, votes / k)
    return winner

def verify(question, answer, model):
    # 链式验证：拆断言逐条核对
    raw = model.complete(prompt=f"""把下面的结论拆成可独立核对的断言，每行一条。
{answer}""")
    for c in [line for line in raw.splitlines() if line.strip()]:
        verdict = model.complete(
            prompt="只依据事实判断这条断言，回答 SUPPORTED 或 REFUTED：" + c,
            temperature=0.0)
        if "REFUTED" in verdict:
            return False
    return True
~~~

### 什么时候不该用
三个反模式：把「多步」当「更好」，所有请求都塞进最长的推理链，简单流量付了复杂流量的钱；用自洽性投票只看多数票不看票数占比，票数接近时该转人工；辩论类方法的调用量是单模型的数倍。

更简单的替代：能一次答对的就一次答；能用规则或代码算出来的就别让模型推理；只有「答错了后果严重、又没法事后检查」的问题，才值得上验证和多路投票。`,
    keypoints: [
      "这一族技术的共同原则是在推理期分配更多计算——迭代改进、探索多条路径、调用外部工具。",
      "思维链把难题拆成一串简单步骤，同时买到更高的准确率和可审计的推理轨迹。",
      "思维树增加分叉与回溯；自我纠正把质量检查嵌进生成过程；程序辅助模型把计算卸载到确定性代码环境。",
      "ReAct 的循环是思考—行动—观察，观察回灌下一轮；思考频率要按任务调，知识密集型每步都思考，动作密集型要省着用。",
      "RLVR 训练出的推理模型会生成很长的、可自我纠正与回溯的推理轨迹，对应推理扩展定律：性能随推理期计算可预测提升。",
      "书里给的适用条件是问题复杂到单次通过答不好；简单事实题硬套思维链会付出成倍 token 和延迟，还多出中间步骤走偏的机会。",
    ],
    pitfalls: [
      "把多步当成更好，所有流量都塞进最长推理链。",
      "用自洽性投票只看多数票不看票数占比，票数分散时其实该转人工。",
      "忽略辩论类方法的调用量是单模型的数倍，只在错误代价极高的场景才值。",
      "以为把思考过程显式写出来就一定提升准确率——简单题上它只是更贵的同一条路。",
    ],
    rel: ["12-智能体设计模式/00-模式总览·21个模式速查.md", "01-名词与概念/训练推理与采样参数.md", "00-小白课堂/小白课-Prompt提示词.md"],
    qs: ["dp-17"],
    ev: [],
  },

  "21.4": {
    id: "21.4",
    t: "护栏与安全模式",
    from: "《智能体设计模式》第 18 章 · Guardrails/Safety Patterns",
    why: "不学这节，你会把安全当成提示词里加一句「不要做坏事」，然后在第一次提示词注入面前失去所有防线。",
    learn: "能说出输入、输出、工具调用三处检查各自拦什么，解释为什么提示词注入不能只靠提示词防，并为系统里的一个高风险工具写出参数级校验。",
    body: `### 一句话说清
护栏是给自主智能体装的刹车、限速和围栏，目的不是让它少干活，是让它出错时伤不到人和系统。类比：阳台的栏杆不限制你住高层，只保证你不会掉下去。

### 展开讲
症状：越自主越不可预测。智能体可能生成有害、有偏见或事实错误的内容，也可能被越狱——用专门构造的输入绕过安全限制。书里说这类攻击的本质是「利用 AI 编程中的漏洞」。

书里列了六个位置，工程上最要紧的是三处。

输入。在智能体处理之前筛和洗：用内容审核 API 拦不当提示，用 Pydantic 这类 schema 工具保证结构化输入符合规则。越狱的典型特征在这一层拦下来。

工具调用。做法是工具执行前先跑一个回调，拿参数里的 user_id 和会话状态里的 session_user_id 比对，不一致就返回错误字典，阻止这次调用。

输出。生成之后再过滤一遍：分析毒性、偏见、露骨内容，标记或删除有问题的短语。模型生成的内容进浏览器之前还必须清洗，否则它自己就是一个注入点。

为什么提示词注入不能只靠提示词防？因为在提示词这一层，「防住」意味着模型自己判断该不该听，而攻击者要做的正是让模型判断错误。书里给了另一半答案：最小权限原则——智能体只拿完成任务所需的绝对最小权限集。提示词护栏是说服，权限与隔离环境是物理边界；说服可以被绕过，物理边界不能。

配套动作还有三个：检查点与回滚、结构化日志记录整个思维链、模块化拆分以便隔离故障。

**和教材其它节的分工**：幻觉的成因与识别在《幻觉Hallucination》里讲，调试与可观测性的工具在第 20.1 节讲；本节只讲在哪些位置设卡、卡住之后怎么处理、以及为什么单靠提示词不行。

### 动手看
~~~python
import re
from pydantic import BaseModel, ValidationError

PII_PATTERN = re.compile("[0-9]{11}")   # 规则拦确定性模式

class Verdict(BaseModel):
    status: str        # "safe" | "unsafe"
    reason: str

def check_input(text, guard_model) -> Verdict:
    # 第一层：输入预筛
    raw = guard_model.complete(GUARD_PROMPT + "待审输入：" + text, temperature=0.0)
    try:
        return Verdict.model_validate_json(raw)
    except (ValidationError, ValueError):
        return Verdict(status="unsafe", reason="护栏输出无法解析，按拒绝处理")

def before_tool(tool, args, ctx):
    # 第二层：工具调用参数校验
    if args.get("user_id") != ctx.state.get("session_user_id"):
        return {"status": "error",
                "error_message": "参数越权，已阻止 " + tool.name + " 调用"}
    return None            # 返回 None 才放行

def after_output(text: str) -> str:
    # 第三层：输出过滤与脱敏
    text = PII_PATTERN.sub("[已脱敏]", text)
    if DENY_WORDS.search(text):
        raise BlockedOutput("输出命中禁用词，转人工复核")
    return text
~~~

### 什么时候不该用
两个反模式：护栏只加不减，规则越堆越多、没人清理过期的，维护成本最终超过收益；把默认值放反——书里的策略提示词写的是「仅在未发现明显违规时才默认为合规」，反过来写成「拿不准算违规」就是误杀正常流量。

护栏不是免费的：每次预筛都是一次额外调用，直接换成延迟和成本。更简单的替代是先用确定性手段吃掉大部分问题——正则、允许列表、schema 校验、权限范围——只在规则表达不了的地方才补模型判断。`,
    keypoints: [
      "护栏的目标不是限制能力，是让智能体出错时伤不到人；它是分层防御，不是单一方案。",
      "三处关键位置是输入验证（拦越狱与不当内容）、工具调用校验（参数级比对，阻止越权调用）、输出过滤（毒性、偏见，以及展示前的清洗）。",
      "越狱是利用 AI 编程漏洞的对抗性攻击，提示词层的防线会被绕过；最小权限原则才是把爆炸半径压小的那一层。",
      "用计算密集度低的模型做预筛和复核，并用低温度保证判定的确定性。",
      "配套工程动作是检查点与回滚、结构化日志记录完整思维链、模块化拆分以隔离故障。",
    ],
    pitfalls: [
      "只写提示词护栏，不给工具设权限边界——被绕过时没有任何第二道防线。",
      "护栏只加不减，过期规则没人清理，维护成本最终超过收益。",
      "把默认值放反，用「拿不准算违规」当保守选择，实际是误杀正常流量且无人担责。",
      "确定性规则能解决的问题也交给模型判断，多付一次调用还多引入一个不确定性。",
    ],
    rel: ["12-智能体设计模式/00-模式总览·21个模式速查.md", "02-AI-Agent开发/Agent评估与调试.md", "01-名词与概念/幻觉Hallucination.md"],
    qs: ["dp-18"],
    ev: [],
  },

  "21.5": {
    id: "21.5",
    t: "评估与监控",
    from: "《智能体设计模式》第 19 章 · Evaluation and Monitoring",
    why: "不学这节，你会用「感觉变好了」验收每一次改动，等线上出事时才发现没有任何历史数据可以对照。",
    learn: "能搭出一套最小可用的测量体系——覆盖已知失败模式的离线评测集加一层线上指标，并说出轨迹评估几种匹配方式各适合什么场景。",
    body: `### 一句话说清
评估与监控是给概率系统配两套测量：离线评测集是体检，线上指标是心电图。类比：药品既要做上市前临床试验，也要做上市后的不良反应监测。

### 展开讲
为什么传统测试不够：代码是确定性的通过或失败，智能体以概率方式运行。所以要同时看最终输出和轨迹——走到答案的那串步骤。

离线一层，书里给了两种载体。测试文件是 JSON，表示单个简单的会话，适合开发期的单元测试，每轮记下用户 query、期望的工具调用轨迹和最终响应。评估集文件用于集成测试，包含多个可能很长的会话。

轨迹怎么比？书里列了几种匹配方式：精确匹配（必须与理想序列完全一致）、按序匹配（按序出现，允许额外步骤）、任意顺序匹配、精确度、召回、单工具使用。高风险场景要精确匹配。

线上盯四件事：延迟、token 用量、漂移（输入分布或环境变化导致性能退化）、行为异常。延迟和成本要落进持久存储，只打印控制台不够。

书里还对比了三种评估方法：人工准但慢，模型当裁判可扩展但会漏中间步骤，自动化指标客观但覆盖不全。

为什么不能只用精确匹配？书里的例子：智能体答「The capital of France is Paris.」，参考答案是「Paris is the capital of France.」，字符串不相等，函数返回 0 分——语义一样却判错。所以要补上相似度、embedding 和裁判模型这类指标。

评测集为什么会失效？书里明说环境不是静态的。评测集一旦冻结在发布那天，它就只测量那天的世界：流量分布变了、工具 API 改了、模型换了版本，它还在给满分。所以要靠线上抓到的真实失败案例定期回填。

**和教材其它节的分工**：目标设定与进展监控在第 19.4 节讲过，异常处理与恢复在第 20.1 节讲过；本节只讲测量本身——定义哪些指标、两层各测什么、评测集怎么不失效。

### 动手看
~~~python
def eval_trajectory(actual, expected, mode="in_order"):
    # 比步骤序列，允许额外步骤
    if mode == "exact":
        return 1.0 if actual == expected else 0.0
    if mode == "in_order":
        it = iter(actual)
        return 1.0 if all(step in it for step in expected) else 0.0
    return len(set(actual) & set(expected)) / len(expected)   # 覆盖率

def llm_judge(case, answer, judge_model, rubric):
    prompt = f"""{rubric}
问题：{case['q']}
待评答案：{answer}"""
    verdict = parse_json(judge_model.complete(prompt, temperature=0.0))
    verdict["case_id"] = case["id"]     # 结果落库
    return verdict

def regression(cases, agent, judge_model, rubric, threshold=0.8):
    # 每次改动跑一遍，不过阈值不上线
    scores = [llm_judge(c, agent.run(c["q"]), judge_model, rubric)["overall_score"]
              for c in cases]
    avg = sum(scores) / len(scores)
    return {"pass": avg >= threshold, "avg": avg, "n": len(cases)}
~~~

### 什么时候不该用
三个反模式：只用精确匹配，语义等价的正确答案被判错，你还以为自己退步了；只用模型当裁判，它会漏掉中间步骤，而且裁判模型的能力上限就是这套评估的上限；把评测通过当成上线许可，忘了评测集覆盖不到的长尾才是事故真正来的地方。

书里自己也提醒，完整的评估框架复杂度堪比一门学科，落地要收窄到关键用例。更简单的替代：先建一个二三十条的小评测集，覆盖已知的失败模式，跑进每次改动的流程里，比建一个上千条但没人跑的大集有用得多。`,
    keypoints: [
      "智能体以概率方式运行，评估必须同时看最终输出和轨迹，两者都合格才算通过。",
      "离线一层用测试文件（单会话、单元测试）与评估集文件（多会话、集成测试），轨迹匹配有精确、按序、任意顺序、精确度、召回、单工具几种方式。",
      "线上盯延迟、token 用量、漂移与行为异常；延迟和成本数据要落进持久存储，只打印到控制台没有意义。",
      "三种评估方法各有边界：人工能捕捉细微行为但贵且慢，模型当裁判可扩展但会漏中间步骤，自动化指标客观但可能覆盖不全。",
      "精确匹配会误判语义等价的答案，所以需要相似度、embedding、裁判模型与 RAG 专用指标。",
      "评测集冻结在发布那天就只测那天的世界，必须用线上真实失败案例回填。",
    ],
    pitfalls: [
      "只用精确匹配，语义正确的答案被判 0 分，把系统表现误判为退步。",
      "只用模型当裁判，既漏中间步骤，又把评估能力上限锁在裁判模型身上。",
      "把评测通过当成上线许可，忽略评测集覆盖不到的长尾。",
      "一上来就建重型评估体系，结果没人跑，不如二三十条覆盖已知失败模式的小集跑进每次改动。",
    ],
    rel: ["12-智能体设计模式/00-模式总览·21个模式速查.md", "02-AI-Agent开发/Agent评估与调试.md", "08-求职面试/大厂AI面试题总览与答题方法论.md"],
    qs: ["dp-19"],
    ev: [],
  },

  "21.6": {
    id: "21.6",
    t: "优先级排序",
    from: "《智能体设计模式》第 20 章 · Prioritization",
    why: "不学这节，你的智能体会在预算耗尽时随机地只做完前几件事，而你事后说不出为什么是这几件。",
    learn: "能写出四个排序要素，为一个任务列表排出执行顺序并显式给出放弃清单与理由，并说出什么时候加排序系统反而更糟。",
    body: `### 一句话说清
优先级排序是当任务比产能多的时候，用一套明确的标准决定先做哪个、哪个这轮不做。类比：急诊分诊——不是谁先来谁先看，是按严重程度排，轻症等着。

### 展开讲
症状很具体：智能体同时面对大量潜在动作、冲突目标和有限资源（时间、算力、预算）。没有决定下一步的流程，结果就是效率下降、操作延误，或者干脆没完成主要目标。

书里把它拆成四个要素。标准定义：评估任务的规则或指标，包括紧急性、重要性、依赖关系、资源可用性、成本收益。任务评估：拿这些标准去量每个候选任务。调度逻辑：根据评估挑出下一步或排出执行序列。动态重排：情况变了就改优先级。

书里的案例是同一件事的不同外衣：客服把宕机报告排在密码重置之前；云计算在高峰期把资源给关键应用；自动驾驶里刹车避撞优先于车道保持。

书中代码是一个用 LangChain 搭的项目管理智能体：任务存在内存字典里，优先级只有 P0、P1、P2 三档；身上挂了四个工具——创建任务、设优先级、派给成员、列出全部任务。提示词把流程写死：先创建任务拿到 task_id，再看用户话里有没有优先级或人的线索。

这里要补一条书里没明说、但工程上必须有的东西：排序的另一半是放弃。预算有限时排在尾部的一定做不完，所以放弃规则要显式写进标准——按预算截断、按依赖门挡下、还是把低影响项标成不做——而不是等超时那一刻随机地只做完前几件。

**和教材其它节的分工**：怎么把目标拆成有依赖关系的步骤在第 18.6 节规划里讲过，怎么定义和跟踪目标在第 19.4 节讲过；本节只讲步骤数超过预算时，用什么标准排执行顺序、以及放弃什么。

### 动手看
~~~python
from dataclasses import dataclass, field

@dataclass
class Task:
    tid: str
    desc: str
    urgency: float = 0.0
    impact: float = 0.0
    cost: float = 1.0
    needs: list = field(default_factory=list)   # 前置任务 id

W = {"urgency": 0.6, "impact": 0.4}   # 权重写进配置

def score(t: Task) -> float:
    return (W["urgency"] * t.urgency + W["impact"] * t.impact) / max(t.cost, 1e-6)

def schedule(tasks, budget, done=None):
    # 返回 (顺序, 放弃清单)
    done = set(done or ())
    order, used, dropped = [], 0.0, []
    for t in sorted(tasks, key=score, reverse=True):
        if not set(t.needs) <= done:       # 依赖未满足
            dropped.append((t.tid, "依赖未满足"))
            continue
        if used + t.cost > budget:
            dropped.append((t.tid, "预算不足"))
            continue
        order.append(t.tid)
        used += t.cost
    return order, dropped
~~~

### 什么时候不该用
三个反模式：让模型每次现编一套优先级尺度，同一天两次相同输入给出不可比的分数，无法审计；只排序不记录理由，出问题时无法复盘某个任务为什么被推到了后面；有依赖关系却按优先级乱序执行——前置没满足的任务先跑，必然失败还浪费一次重试。

只有一个任务，或者任务之间没有资源冲突时，加一套优先级系统就是自找复杂度。更简单的替代优先考虑静态方案——固定顺序的队列、写死的优先级字段、人维护的规则表——都优于让模型现算。`,
    keypoints: [
      "四个要素是标准定义、任务评估、调度或选择逻辑、动态重排。",
      "排序标准包括紧急性、重要性、依赖关系、资源可用性、成本收益，以及个性化场景下的用户偏好。",
      "排序发生在三个层面：选总目标、在计划内排步骤、挑下一个动作。",
      "预算有限时排在尾部的一定做不完，所以放弃规则要显式写进标准，不能靠超时随机截断。",
      "依赖关系是硬约束，优先级高但前置未满足的任务不能跑；动态重排是让智能体适应环境变化的关键。",
    ],
    pitfalls: [
      "让模型每次现编一套优先级尺度，两次结果不可比，也无法审计。",
      "只排序不记录理由，事后无法复盘某个任务为什么被推后。",
      "按优先级乱序执行有依赖的任务，必然失败还浪费重试。",
      "只有一个任务或没有资源冲突时也上优先级系统，纯属自找复杂度。",
    ],
    rel: ["12-智能体设计模式/00-模式总览·21个模式速查.md", "02-AI-Agent开发/Agent核心架构.md"],
    qs: ["dp-20"],
    ev: [],
  },

  "21.7": {
    id: "21.7",
    t: "探索与发现",
    from: "《智能体设计模式》第 21 章 · Exploration and Discovery",
    why: "不学这节，你会把「让智能体自己探索」当成万能解法，然后在预算烧完之后拿到一堆互不可比的想法。",
    learn: "能说出探索与优化的区别，列出 Google 协同科学家的六个角色分工，并为一次探索设定预算上限、收敛条件和无改进时的停止规则。",
    body: `### 一句话说清
探索与发现是让智能体主动去找「你还不知道自己不知道的东西」，而不是在已知解法空间里做优化。类比：在已探明矿脉里挖更深是优化，去没探过的区域打钻取样是探索——后者可能白干，但只有它能找到新矿。

### 展开讲
它不同于被动响应，也不同于在预定义解空间里做优化。它主动进入陌生领域、试没试过的方法、生成新知识。书里说目标是发现「未知的未知」。

典型场景包括科学研究自动化、游戏策略生成、市场趋势发现和安全漏洞发现。

书里最完整的案例是 Google 的 AI 协同科学家（Co-Scientist），基于 Gemini 的多智能体系统：生成智能体产出初始假设；反思智能体当同行评审；排名智能体用基于 Elo 的锦标赛排序；进化智能体把头部假设继续简化、综合；邻近度智能体聚类相似想法；元审查智能体综合所有评审和辩论的洞见再反馈；一个主管智能体在异步框架里协调它们。

书里给的结果：GPQA 困难基准的钻石集上 top-1 准确率 78.4%；跨两百多个研究目标显示加大测试时计算能提升假设质量。

局限书里也列了：知识受限于开放获取文献；拿不到负面实验结果；还继承底层模型的幻觉风险。

另一个案例是 MIT 许可的 Agent Laboratory，把研究流程拆成文献综述、实验、报告撰写、知识共享四阶段，角色按教授、博士后、审稿人分层。

最该记住的一条：探索必须有预算上限和收敛条件。协同科学家靠「测试时计算扩展」控制算力投入，说明这是有方向的投入；Agent Laboratory 的研究角色带 max_steps 上限。工程上的写法是：给时间、token 或实验次数的硬上限；给一个「什么算找到了」的判定标准；再给一条无改进就提前停的规则。

**和教材其它节的分工**：智能体自我改进的机制在第 19.2 节讲过，多智能体怎么组织在第 18.7 节讲过；本节只讲目标不明确、解法空间没边界时，怎么让系统去搜、并且知道什么时候停。

### 动手看
~~~python
def explore(seed_problem, generate, critique, rank, budget=None):
    # 预算、评分尺度、收敛条件缺一不可
    budget = budget or {"rounds": 5, "per_round": 4, "max_calls": 300}
    frontier, archive, calls = [seed_problem], [], 0
    last_best = float("-inf")
    for r in range(budget["rounds"]):
        cands = []
        for _ in range(budget["per_round"]):      # 候选数有上限
            if calls >= budget["max_calls"]:
                break
            cands.append(generate(frontier))
            calls += 1
        scored = []
        for c in cands:
            reviews = [critique(c) for _ in range(3)]   # 三方独立评审
            calls += 3
            scored.append((rank(c, reviews), c))
        scored.sort(key=lambda x: x[0], reverse=True)
        archive.extend(scored)
        frontier = [c for _, c in scored[:3]]      # 只留头部
        best = scored[0][0] if scored else last_best
        if best >= CONVERGENCE_SCORE:              # 达到阈值
            return scored[0][1], {"stop": "达到阈值", "rounds": r + 1,
                                  "calls": calls}
        if best <= last_best - PLATEAU_EPS:        # 无改进提前停
            return scored[0][1], {"stop": "连续无改进", "rounds": r + 1,
                                  "calls": calls}
        last_best = best
    best = max(archive, key=lambda x: x[0])[0]     # 预算耗尽
    return best, {"stop": "预算耗尽", "rounds": budget["rounds"], "calls": calls}
~~~

### 什么时候不该用
三个反模式：把探索当免费午餐，不设预算上限就开跑，烧完预算拿回一堆没法比较的候选；用探索掩盖没想清的目标；交给系统搜索却不给判定标准，没有判定就没有收敛。

解空间已经明确、目标可以量化的时候，探索不如直接优化——更快也更省。更简单的替代：人先圈定三到五个候选方向，让智能体只负责评估和排序。`,
    keypoints: [
      "探索与发现区别于被动响应和已知解空间内的优化，目标是发现「未知的未知」。",
      "Google 的 AI 协同科学家用六个角色实现「生成、辩论、进化」：生成、反思、排名（Elo 锦标赛）、进化、邻近度、元审查，由主管智能体协调。",
      "Agent Laboratory 把研究拆成文献综述、实验、报告撰写、知识共享四阶段，角色按教授、博士后、审稿人、机器学习工程、软件工程分层。",
      "书中验证数据：GPQA 钻石集 top-1 准确率 78.4%，内部 Elo 与准确率一致；跨两百多个研究目标显示加大测试时计算能持续提升假设质量。",
      "局限是知识依赖开放获取文献、拿不到负面实验结果、继承底层模型的幻觉风险。",
      "探索必须有预算上限和收敛条件（达到阈值、连续无改进、预算耗尽三种停止），否则退化成无边界循环。",
    ],
    pitfalls: [
      "把探索当免费午餐，不设预算上限就开跑。",
      "用探索掩盖没想清的目标，让系统去找方向等于需求没定义。",
      "给了搜索能力却不给判定标准，没有判定就没有收敛。",
      "在解空间明确、目标可量化的场景上开整套探索流程，比直接优化更慢更贵。",
    ],
    rel: ["12-智能体设计模式/00-模式总览·21个模式速查.md", "02-AI-Agent开发/Agent自进化.md"],
    qs: ["dp-21"],
    ev: [],
  },
});
