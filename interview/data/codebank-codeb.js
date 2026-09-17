// 必背代码 · 单元 CODE-B —— AI 应用骨架 14 条
window.CODE_ITEMS = window.CODE_ITEMS || {};
Object.assign(window.CODE_ITEMS, {
  "ai-llm-min": {
    id: "ai-llm-min",
    t: "最小 LLM 调用",
    group: "ai",
    level: "must",
    scene: "面试官说「先把大模型调通，写个最小 demo」时的第一段代码；工程里任何 AI 功能的起点，也是你排查 401 / 超时的最小复现脚本",
    code: `import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()                                    # 钥匙放 .env，绝不写进代码
client = OpenAI(
    api_key=os.getenv('LLM_API_KEY'),            # 换厂商只改环境变量
    base_url=os.getenv('LLM_BASE_URL'),
)

def ask(question, temperature=0):
    resp = client.chat.completions.create(
        model=os.getenv('LLM_MODEL', 'your-model'),   # 通用写法，不锁版本号
        messages=[{'role': 'user', 'content': question}],
        temperature=temperature,                      # 0 附近最稳，写作才调高
    )
    return resp.choices[0].message.content            # 回答文字的固定路径

if __name__ == '__main__':
    print(ask('用一句话介绍你自己'))`,
    lang: "python",
    keys: [
      "api_key 从 os.getenv 读，不硬编码；base_url 决定换哪家厂商，代码几乎不用改",
      "回答文字的唯一路径是 resp.choices[0].message.content，中间的 choices[0] 不能省",
      "model 用环境变量或占位名，不写死具体版本号，换模型只改配置",
      "temperature 给 0～0.3 才是可复现的工程默认值",
      "client 只建一次，别在函数里反复 new"
    ],
    traps: [
      "把 API Key 直接写在代码里提交到 Git —— 等于公开银行卡密码",
      "base_url 忘写或写错域名，会出现连不上或 404，而不是 401",
      "写成 response.choices.message.content（漏了 [0]）会报 AttributeError"
    ],
    rel: ["00-小白课堂/小白课-实战API第一课.md"],
    tb: ["6.5"],
    qs: ["pt-01"],
  },

  "ai-messages": {
    id: "ai-messages",
    t: "messages 三角色与多轮",
    group: "ai",
    level: "must",
    scene: "面试官问「大模型没有记忆，多轮对话怎么实现」；工程里写任何聊天接口、把用户偏好或任务目标固定住，都从这三行 role 开始",
    code: `# client 沿用 ai-llm-min 里建好的那个，全局只建一次
messages = [
    {'role': 'system', 'content': '你是耐心的老师，回答不超过两句话。'},  # 定人设，必须排第一
    {'role': 'user', 'content': '猫是什么？'},                          # 你的提问
]

def chat_once(messages):
    resp = client.chat.completions.create(
        model=os.getenv('LLM_MODEL', 'your-model'), messages=messages)
    return resp.choices[0].message.content

answer = chat_once(messages)
messages.append({'role': 'assistant', 'content': answer})   # AI 说过的话，你替它记
messages.append({'role': 'user', 'content': '它吃什么？'})   # 带着历史再问，“它”才指得清
print('AI：', chat_once(messages))
print('messages 现在有', len(messages), '条')                # 3 → 5 → 7，雪球越滚越大`,
    lang: "python",
    keys: [
      "每格是字典，只有两把钥匙：role 和 content",
      "system 定人设和规矩，永远排第一条，不参与滚动",
      "AI 没有记忆：多轮 = 每轮把 user 和 assistant 都 append 回列表，整本重发",
      "历史越长 token 越贵，聊长了必须裁剪（见 ai-context）"
    ],
    traps: [
      "只 append user 不 append assistant —— 模型看不到自己说过的话，指代立刻断掉",
      "把 assistant 的内容写成自己编的，或用 role='ai' 这类不存在的角色名",
      "以为改了 system 就等于改了历史，实际上旧消息还在列表里，指令会被历史稀释"
    ],
    rel: ["00-小白课堂/小白课-实战messages三角色.md"],
    tb: ["6.5"],
    qs: ["pt-01"],
  },

  "ai-stream": {
    id: "ai-stream",
    t: "流式输出",
    group: "ai",
    level: "must",
    scene: "面试官说「聊天界面要打字机效果，怎么写」；工程里做 CLI 助手、网页对话、任何要压首字延迟的接口都靠它",
    code: `def stream_answer(question):
    stream = client.chat.completions.create(      # client 沿用 ai-llm-min
        model=os.getenv('LLM_MODEL', 'your-model'),
        messages=[{'role': 'user', 'content': question}],
        stream=True,                              # 多这一个参数就够了
    )
    for chunk in stream:
        piece = chunk.choices[0].delta.content     # 流式取 delta，不是 message
        if piece:                                  # 首块/尾块常是 None，必须判空
            print(piece, end='', flush=True)       # 不换行 + 立刻刷出 = 打字机
    print()                                        # 收尾换行

stream_answer('用三句话夸一夸 Python')`,
    lang: "python",
    keys: [
      "开流只加一个 stream=True，其余调用方式不变",
      "每块的文字在 chunk.choices[0].delta.content，普通调用才是 message.content",
      "必须 if piece 判空，首尾块内容可能是 None",
      "print 要 end='' 加 flush=True，否则不换行也没实时效果",
      "流式拿不到完整的 usage，要算账得自己累加或另外调一次"
    ],
    traps: [
      "把 delta 写成 message —— 会拿到 None 或 AttributeError",
      "漏了 flush=True，看起来像一次性输出，白开流式",
      "在循环里做阻塞的重活（写库、调接口），把流式体验又卡回去"
    ],
    rel: ["00-小白课堂/小白课-实战流式与结构化.md"],
    tb: ["6.5"],
    qs: ["in-04"],
  },

  "ai-json": {
    id: "ai-json",
    t: "结构化输出与解析兜底",
    group: "ai",
    level: "must",
    scene: "面试官让你把模型输出喂给下游程序（存库、填表、调接口）；工程里凡是「模型返回的字段要能被代码读」的地方，都要这一层解析兜底",
    code: `import json

FENCE = chr(96) * 3          # 三个反引号：模型偶尔会给 JSON 套 markdown 围栏

def parse_json_reply(raw):
    text = raw.strip()
    if text.startswith(FENCE):                  # 先剥掉开头那行围栏
        text = text.split('\\n', 1)[-1]
        text = text.rsplit(FENCE, 1)[0]         # 再剥掉结尾的围栏
    try:
        return json.loads(text.strip())
    except json.JSONDecodeError:
        return None                             # 兜底：返回 None，交给调用方重问一次

resp = client.chat.completions.create(
    model=os.getenv('LLM_MODEL', 'your-model'),
    messages=[{'role': 'user',
               'content': '把 小明，20岁 整理成 JSON，只输出 JSON，不要其他文字。'}],
    response_format={'type': 'json_object'},     # 提示词约束 + API 锁格式，双保险
)
data = parse_json_reply(resp.choices[0].message.content)
print(data['name'] if data else '解析失败，让模型重答一次')`,
    lang: "python",
    keys: [
      "预防靠两层：提示词写明「只输出 JSON」+ response_format={'type': 'json_object'}",
      "兜底靠 try/except json.JSONDecodeError，解析失败返回 None 而不是崩掉",
      "模型偶尔会在 JSON 外面加 markdown 围栏，解析前先剥掉首尾围栏再 json.loads",
      "解析失败的下一步是重问一次或降级，不是把异常抛给用户"
    ],
    traps: [
      "只靠提示词不给 response_format，模型加了「好的，结果是：」前缀就解析失败",
      "用裸 json.loads 不接异常，线上一条脏输出就打挂整个请求",
      "剥围栏时把 JSON 内容一起剥掉（rsplit 的切法写反）"
    ],
    rel: ["00-小白课堂/小白课-实战流式与结构化.md"],
    tb: ["6.5"],
    qs: ["ev-03"],
  },

  "ai-tools-schema": {
    id: "ai-tools-schema",
    t: "工具的 JSON Schema 怎么写",
    group: "ai",
    level: "must",
    scene: "面试官问「模型老是选错工具 / 参数填错，你怎么改」；工程里每加一个工具都要写这份说明书，它决定了模型调不调、怎么填",
    code: `tools = [
    {
        'type': 'function',
        'function': {
            'name': 'search_docs',                   # 动词开头，语义一眼可辨
            'description': '按关键词检索公司内部文档。用户问公司制度、'
                           '流程、产品资料时用它；要算数、查天气时不要用。',  # 何时用 + 何时不用
            'parameters': {
                'type': 'object',
                'properties': {
                    'query': {'type': 'string',
                              'description': '检索关键词，如“年假 天数”'},
                    'top_k': {'type': 'integer',
                              'description': '返回条数，1-10，默认 3'},   # 给范围，别给自由
                    'scope': {'type': 'string',
                              'enum': ['hr', 'product', 'finance'],       # enum 收紧取值
                              'description': '文档范围，默认 hr'},
                },
                'required': ['query'],                                    # 只列真正必填的
            },
        },
    },
]`,
    lang: "python",
    keys: [
      "description 是给模型看的 Prompt，必须写清「什么时候用」和「什么时候不要用」",
      "参数能枚举就用 enum 收紧取值，比事后校验便宜得多",
      "required 只列真正必填的参数，可选参数在 description 里写默认值",
      "schema 里的参数名必须和本地函数签名逐字一致，否则 **kwargs 直接报错",
      "工具数量控制在 10 个以内，重叠功能要合并，否则模型一定选错"
    ],
    traps: [
      "description 写成「查询文档」四个字 —— 模型不知道边界，该调时不调、不该调时乱调",
      "参数全塞进 required，模型被迫瞎填可选参数",
      "schema 里写 city，函数里写 city_name，调用时才炸"
    ],
    rel: ["02-AI-Agent开发/工具调用实战.md", "01-名词与概念/FunctionCalling函数调用.md"],
    tb: ["8.4"],
    qs: ["ag-03"],
  },

  "ai-fc": {
    id: "ai-fc",
    t: "Function Calling 完整循环",
    group: "ai",
    level: "must",
    scene: "面试官让你「手写一遍工具调用的完整流程」；工程里所有 Agent 框架的最内层都是这 20 行——请求、拿 tool_calls、执行、结果塞回、再请求",
    code: `import json

def run_with_tools(question, tools, funcs, max_steps=5):
    messages = [{'role': 'user', 'content': question}]
    for _ in range(max_steps):
        msg = client.chat.completions.create(        # client 沿用 ai-llm-min
            model=os.getenv('LLM_MODEL', 'your-model'),
            messages=messages, tools=tools,
        ).choices[0].message
        messages.append(msg)                         # 原样存回，否则 tool_calls 断链
        if not msg.tool_calls:                       # 不再要工具 = 拿到最终答案
            return msg.content
        for call in msg.tool_calls:                  # 一次可能并行返回多个调用
            args = json.loads(call.function.arguments)    # 参数字符串 → 字典
            result = funcs[call.function.name](**args)    # 你的程序真的执行
            messages.append({'role': 'tool',          # 结果以 tool 角色回传
                             'tool_call_id': call.id,  # 必须对上号
                             'content': str(result)})
    return '超过最大步数，强制停止'                   # 护栏：防死循环烧 token`,
    lang: "python",
    keys: [
      "五步顺序：请求带 tools → 拿到 msg.tool_calls → 本地执行 → 以 role='tool' 回传 → 再请求一次",
      "messages.append(msg) 必须原样存回，tool_calls 字段丢了上下文就断",
      "回传结果的 tool_call_id 必须等于 call.id，这是对号入座的唯一凭据",
      "call.function.arguments 是 JSON 字符串，要先 json.loads 再解包成参数",
      "循环终止条件是 msg.tool_calls 为空，不是你自己猜的步数"
    ],
    traps: [
      "只 append tool 结果不 append msg —— 报错说 tool_call_id 找不到对应请求",
      "用 for call in msg.tool_calls 时只处理第 0 个，模型并行要 3 个工具就丢 2 个",
      "忘了 max_steps 兜底，模型反复要同一个工具，一路烧钱"
    ],
    rel: ["00-小白课堂/小白课-实战工具调用.md", "02-AI-Agent开发/工具调用实战.md"],
    tb: ["8.4"],
    qs: ["ag-03"],
  },

  "ai-react": {
    id: "ai-react",
    t: "ReAct Agent 循环（含 max_steps）",
    group: "ai",
    level: "must",
    scene: "面试官说「写一个 Agent，要能看到它每步在想什么」；工程里做多步任务（先查再算再总结）时，靠 Thought 留在 trace 里定位是哪一步想歪了",
    code: `import json

MAX_STEPS = 5                                     # 保险丝：绝不用 while True
def react_agent(question, tools, funcs):
    messages = [
        {'role': 'system', 'content': '每步先输出 Thought 说明理由，再决定是否调工具。'},
        {'role': 'user', 'content': question},
    ]
    for step in range(1, MAX_STEPS + 1):
        msg = client.chat.completions.create(
            model=os.getenv('LLM_MODEL', 'your-model'),
            messages=messages, tools=tools,
        ).choices[0].message
        messages.append(msg)
        if msg.content: print(f'第{step}步 Thought: {msg.content}')
        if not msg.tool_calls:                    # 不再要工具 = 它想好了
            return msg.content
        for call in msg.tool_calls:
            args = json.loads(call.function.arguments)
            observation = funcs[call.function.name](**args)      # Action 真执行
            print(f'第{step}步 Action: {call.function.name}({args})')
            print(f'第{step}步 Observation: {observation}')
            messages.append({'role': 'tool', 'tool_call_id': call.id,
                             'content': str(observation)})
    return f'超过 {MAX_STEPS} 步仍未收敛：停手，把已知信息交给人工'   # 超步数怎么办`,
    lang: "python",
    keys: [
      "ReAct 三段：Thought（模型写理由）→ Action（调哪个工具）→ Observation（程序填结果）",
      "Observation 必须 append 回 messages，否则模型下一轮以为没查过，重复调同一个工具",
      "必须用 for step in range(MAX_STEPS) 而不是 while True",
      "超步数的处理是明确收口：返回已知信息 + 提示人工介入，不能静默返回空",
      "system 里要明确要求先写 Thought 再决定动作，否则模型直接跳到 Action"
    ],
    traps: [
      "用 while True 等到模型自己收敛 —— 模型不收敛时就是无限烧 token",
      "只打印 Observation 不回填 messages，trace 好看但循环原地转圈",
      "把 Thought 当成最终答案返回（它有 tool_calls 时 content 不是答案）"
    ],
    rel: ["00-小白课堂/小白课-实战最小Agent.md", "02-AI-Agent开发/Agent核心架构.md"],
    tb: ["8.7"],
    qs: ["ag-01"],
  },

  "ai-rag": {
    id: "ai-rag",
    t: "RAG 四段式",
    group: "ai",
    level: "must",
    scene: "面试官说「写个最小 RAG，不用向量库」；工程里给私有知识库接大模型，离线建库和在线问答这两段是固定骨架",
    code: `import math

def embed(text):    # 向量化：真实项目换成 embedding 模型，这里用字频向量当可跑替身
    return [float(text.count(ch)) for ch in '年假请假报销考勤流程制度提交审批']

def cosine(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    na, nb = math.sqrt(sum(x * x for x in a)), math.sqrt(sum(y * y for y in b))
    return dot / (na * nb) if na and nb else 0.0

doc = '考勤制度：9 点上班。\\n\\n请假流程：提前一天在 OA 提交，主管审批。\\n\\n年假规则：满一年 5 天。'
chunks = [c for c in doc.split('\\n\\n') if c.strip()]     # ① 切分
store = [(c, embed(c)) for c in chunks]                  # ② 向量化 + ③ 入库
def retrieve(question, top_k=2):                         # ④ 检索
    qv = embed(question)
    scored = [(cosine(qv, vec), text) for text, vec in store]
    scored.sort(reverse=True)                            # 分数高的排前面
    return [text for score, text in scored[:top_k] if score > 0]

def answer(question, model='your-model'):                # ⑤ 在线：拼上下文生成
    context = '\\n'.join(retrieve(question))
    prompt = f'只根据资料回答，资料里没有就说不知道。\\n资料：\\n{context}\\n问题：{question}'
    return client.chat.completions.create(
        model=model, messages=[{'role': 'user', 'content': prompt}]
    ).choices[0].message.content`,
    lang: "python",
    keys: [
      "离线四步：切分 chunk → 向量化 → 入库（向量+原文+元数据）→ 检索",
      "在线一步：问题向量化 → 取 Top-K（常用 3-5）→ 拼进 prompt 再生成",
      "prompt 里必须写「资料里没有就说不知道」，否则模型照样编",
      "切分按语义边界（段落/标题）切，块太大浪费上下文、太小丢语义",
      "问题要用和建库同一个 embedding 模型编码，否则相似度毫无意义"
    ],
    traps: [
      "按固定字符数硬切，把一句话拦腰砍断，检索质量暴跌",
      "Top-K 塞太多块，噪音淹没关键信息，反而答不准",
      "只在建库时向量化、检索时忘了编码问题，或反过来拿原文去算相似度"
    ],
    rel: ["00-小白课堂/小白课-实战RAG迷你版.md", "01-名词与概念/RAG检索增强生成.md"],
    tb: ["7.2"],
    qs: ["rg-02"],
  },

  "ai-embed": {
    id: "ai-embed",
    t: "Embedding 与余弦相似度",
    group: "ai",
    level: "must",
    scene: "面试官说「手写余弦相似度」或问「为什么用余弦不用欧氏距离」；工程里语义搜索、去重、按记忆召回都靠这个函数",
    code: `import numpy as np

def cosine_similarity(a, b):
    """余弦相似度：只看向量方向，不看长度。"""
    a, b = np.asarray(a, dtype=float), np.asarray(b, dtype=float)
    na, nb = np.linalg.norm(a), np.linalg.norm(b)
    if na == 0 or nb == 0:                  # 零向量没有方向，直接判 0
        return 0.0
    return float(np.dot(a, b) / (na * nb))

emb = {                                     # 真实项目里这些向量来自 embedding 模型
    '如何申请退款？':   [0.9, 0.1, 0.2],
    '退款流程是什么？': [0.8, 0.2, 0.1],
    '今天天气怎么样？': [0.1, 0.9, 0.3],
}
q = emb['如何申请退款？']
for text, vec in emb.items():
    print(f'{text} -> {cosine_similarity(q, vec):.3f}')
# 实测输出：1.000 / 0.987 / 0.271 —— 语义近，分数高`,
    lang: "python",
    keys: [
      "余弦相似度 = 点积 / 两个模长之积，先归一化再比较方向",
      "接近 1 高度相似，接近 0 无关，接近 -1 语义相反",
      "必须判零向量，否则除以 0 直接崩",
      "建库和检索必须用同一个 embedding 模型，换了模型整套向量要重建",
      "Embedding 负责找得准，LLM 负责答得好，两者可独立替换"
    ],
    traps: [
      "直接用点积当相似度 —— 未归一化时长度大的向量占便宜，长文档永远排第一",
      "忘了开方或把分母写成 na + nb，数值看起来「也像」，但排序会错",
      "中文知识库用英文 embedding 模型，相似度整体失真"
    ],
    rel: ["01-名词与概念/Embedding向量嵌入.md"],
    tb: ["7.1"],
    qs: ["rg-01"],
  },

  "ai-context": {
    id: "ai-context",
    t: "上下文裁剪与摘要压缩",
    group: "ai",
    level: "plus",
    scene: "面试官问「对话聊到几十轮，上下文窗口爆了怎么办」；工程里长会话、长任务的 Agent 必须靠这两个函数控制 token 和注意力",
    code: `def trim_history(messages, max_turns=10):
    """滑动窗口：只留最近 N 轮，system 永远钉在最前面。"""
    head = messages[:1] if messages[0]['role'] == 'system' else []
    body = messages[len(head):]
    return head + body[-max_turns * 2:]          # 每轮 = user + assistant 两条

def compress_history(old_messages, model='your-model'):
    """摘要压缩：把旧对话压成前情提要，替代原始消息。"""
    text = '\\n'.join(m['role'] + ': ' + m['content'] for m in old_messages)
    summary = client.chat.completions.create(
        model=model,
        messages=[{'role': 'user', 'content':
                   '把以下对话压成 200 字摘要，保留用户目标、已确认事实、待办。\\n' + text}],
    ).choices[0].message.content
    return [{'role': 'system', 'content': '前情摘要：' + summary}]

def build_context(messages, max_turns=10):
    """实用策略：远期摘要 + 近期原文，两头都要。"""
    if len(messages) <= max_turns * 2 + 1:
        return messages
    old, recent = messages[1:-max_turns * 2], messages[-max_turns * 2:]
    return [messages[0]] + compress_history(old) + recent`,
    lang: "python",
    keys: [
      "滑动窗口按「轮」算，每轮是 user + assistant 两条，所以切片是 max_turns * 2",
      "system 必须单独拎出来保留，不能被窗口裁掉",
      "摘要要指定保留项：用户目标、已确认事实、待办事项，不指定就会丢关键信息",
      "生产用混合策略：远期摘要 + 最近几轮原文，纯摘要会丢近期细节",
      "工具 observation 要单独设最大长度（如 2000 字符）截断，它才是最肥的污染源"
    ],
    traps: [
      "裁剪时把 system 一起切掉，人设和规矩当场失效",
      "只做摘要不给原文，模型答不出「刚才那句话」的细节",
      "按条数而不是按轮数切，切出半个对话（只有 user 没有 assistant）"
    ],
    rel: ["02-AI-Agent开发/记忆与上下文工程.md"],
    tb: ["8.6"],
    qs: ["mm-01"],
  },

  "ai-retry": {
    id: "ai-retry",
    t: "重试与指数退避",
    group: "ai",
    level: "must",
    scene: "面试官问「调模型偶发超时/429，你怎么重试」；工程里所有外部调用（LLM、向量库、第三方 API）外面都该包这一层",
    code: `import random
import time

def call_with_retry(fn, max_retries=4, base=1.0):
    """指数退避 + 抖动 + 上限，只用来兜“暂时性”失败。"""
    for attempt in range(max_retries + 1):
        try:
            return fn()
        except (TimeoutError, ConnectionError) as e:     # 超时/断连：值得重试
            if attempt == max_retries:
                raise                                    # 到上限就抛，绝不无限重试
            delay = base * (2 ** attempt)                # 1s → 2s → 4s → 8s
            delay += random.uniform(0, delay * 0.5)      # 抖动：错开重试，防同时打爆
            print(f'第 {attempt + 1} 次失败（{e}），{delay:.1f}s 后重试')
            time.sleep(delay)
        except ValueError:                               # 参数错/鉴权失败：重试也白搭
            raise                                        # 直接抛给上层去修，别浪费额度`,
    lang: "python",
    keys: [
      "等待时间 = base * 2 ** attempt，指数增长，上限是 max_retries 次后抛出",
      "必须加抖动 random.uniform(0, delay * 0.5)，否则所有客户端同一刻一起重试，把服务再打挂",
      "只重试暂时性错误：超时、断连、429/5xx；参数错、鉴权失败一律不重试",
      "重试次数要有上限，且每次重试都要计入 token/费用预算",
      "重试的函数要幂等，写库、发消息这类有副作用的操作不能盲重试"
    ],
    traps: [
      "对 400/401 这类错误也重试，只是把同一个错误重放 4 遍",
      "退避写成固定 1 秒，等于自己制造请求风暴",
      "忘了抖动，几百个实例同时重试形成尖峰"
    ],
    rel: ["02-AI-Agent开发/Agent评估与调试.md", "01-名词与概念/部署与上线.md"],
    tb: ["20.1"],
    qs: ["dp-12"],
  },

  "ai-fastapi": {
    id: "ai-fastapi",
    t: "FastAPI + pydantic 最小服务",
    group: "ai",
    level: "must",
    scene: "面试官说「把你的模型调用包成一个接口」；工程里前端、小程序、其他服务要调你的 AI 能力，都从这 20 行开始",
    code: `from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title='AI Chat API')   # 启动：uvicorn main:app --reload，文档在 /docs

class ChatIn(BaseModel):             # 请求体：类型不对 FastAPI 直接返回 422
    question: str
    temperature: float = 0.0         # 可选参数给默认值

class ChatOut(BaseModel):
    answer: str

@app.post('/chat', response_model=ChatOut)
def chat(item: ChatIn):
    if not item.question.strip():
        raise HTTPException(status_code=400, detail='question 不能为空')
    answer = ask(item.question, item.temperature)   # 接 ai-llm-min 里的 ask()
    return ChatOut(answer=answer)`,
    lang: "python",
    keys: [
      "请求体用 pydantic 模型声明，类型错 FastAPI 自动返回 422，不用手写校验",
      "response_model 声明返回结构，/docs 里会自动生成字段文档",
      "业务错误用 raise HTTPException(status_code=..., detail=...)",
      "uvicorn main:app 里 main 是文件名（不带 .py），app 是变量名",
      "上线时 API Key 从环境变量读，且必须关掉 --reload"
    ],
    traps: [
      "把 API Key 写进代码或返回给前端 —— 前端拿到 key 等于公开",
      "路径参数 /todos/{id} 和固定路径 /todos/me 同时存在时固定路径没写在前面，me 被当 id",
      "忘了配 CORS，浏览器里前端调不通却看不到有用的报错"
    ],
    rel: ["09-全栈开发/FastAPI后端实战.md", "01-名词与概念/部署与上线.md"],
    tb: ["3.5"],
    qs: ["ds-02"],
  },

  "ai-pytest": {
    id: "ai-pytest",
    t: "pytest 测试（含 LLM 结构断言）",
    group: "ai",
    level: "plus",
    scene: "面试官问「AI 输出不稳定，你怎么写测试」；工程里改提示词、换模型后要能一键回归，靠的是断言结构而不是断言全文",
    code: `import json
import pytest

def fake_llm(prompt):                          # 测试替身：不烧真模型，输出固定住
    return '{"name": "小明", "age": 20, "hobbies": ["打球"]}'

def test_llm_json_shape():
    """LLM 输出不能断言全文，只能断言结构与类型。"""
    data = json.loads(fake_llm('整理小明'))
    assert {'name', 'age', 'hobbies'} <= set(data)
    assert isinstance(data['age'], int)
    assert isinstance(data['hobbies'], list) and data['hobbies']

def test_fenced_json_still_parses():
    raw = FENCE + 'json\\n{"name": "小明"}\\n' + FENCE   # FENCE 来自 ai-json
    assert parse_json_reply(raw)['name'] == '小明'

@pytest.mark.parametrize('bad', ['', '   '])
def test_empty_input_rejected(bad):
    with pytest.raises(ValueError):
        ask(bad)                                  # ask 来自 ai-llm-min：空输入必须拒`,
    lang: "python",
    keys: [
      "LLM 输出不稳定，所以断言结构、类型、关键字段，不断言完整文本",
      "单元测试用假模型替身（固定返回），真实调用只放在少量集成测试里",
      "参数化用例用 @pytest.mark.parametrize，边界输入一次列全",
      "异常路径用 pytest.raises 断言，空输入、超长输入都要有用例",
      "每条断言对应一个真实踩过的坑，别写只为凑覆盖率的测试"
    ],
    traps: [
      "断言 assert '北京25度' in answer —— 模型换个说法测试就红，最后没人敢跑测试",
      "测试里直接调真模型，跑一次几毛钱、还偶发失败",
      "只测正常路径，空输入和解析失败这两条最常见的线上故障反而没覆盖"
    ],
    rel: ["02-AI-Agent开发/Agent评估与调试.md"],
    tb: ["2.6"],
    qs: ["ops-02"],
  },

  "ai-dockerfile": {
    id: "ai-dockerfile",
    t: "Dockerfile",
    group: "ai",
    level: "must",
    scene: "面试官问「你这个服务怎么部署」；工程里把 FastAPI 后端打包成镜像，托管平台或云服务器上都靠它一键起服务",
    code: `FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PYTHONUNBUFFERED=1
EXPOSE 8000

# 必须绑 0.0.0.0，绑 127.0.0.1 容器外访问不到
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]`,
    lang: "dockerfile",
    keys: [
      "先 COPY requirements.txt 再 RUN pip install，最后才 COPY . .，改代码不会重装依赖",
      "uvicorn 必须绑 --host 0.0.0.0，否则容器外访问不到",
      "ENV PYTHONUNBUFFERED=1 让日志实时刷出，不然容器日志是哑的",
      "EXPOSE 只是声明端口，真正映射靠 docker run -p 8000:8000",
      "密钥用运行时环境变量注入，绝不写进 ENV 提交到镜像"
    ],
    traps: [
      "先 COPY . . 再装依赖 —— 每次改一行代码都要重装全部依赖",
      "绑 127.0.0.1，本机 curl 通、容器外全超时，最难查的一类 bug",
      "把 .env 或 API Key 打进镜像层，镜像一推出去密钥就泄露了"
    ],
    rel: ["01-名词与概念/部署与上线.md"],
    tb: ["3.9"],
    qs: ["ops-03"],
  },
});
