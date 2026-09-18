// 必背代码 · 单元 CODE-C —— 算法岗手撕 6 条 + 评测 3 条
// 算法 6 条用 PyTorch（面试手撕默认环境）；评测 3 条用纯 Python
// 每条 10-25 行，白板大小的量；已在本机 torch 2.11.0 / peft 0.20.0 实跑
window.CODE_ITEMS = window.CODE_ITEMS || {};
Object.assign(window.CODE_ITEMS, {
  "algo-attention": {
    id: "algo-attention",
    t: "手写 Self-Attention",
    group: "algo",
    level: "algo",
    scene: "算法岗 / 大模型岗一面手撕环节，最常见的一道：白板写出带因果掩码的 Self-Attention，边写边报形状。",
    code: `import torch
import torch.nn.functional as F

def self_attention(x, Wq, Wk, Wv, causal=True):
    # x: (B, T, d_model)：B 批大小, T 序列长度, d_model 模型维度
    B, T, C = x.shape
    q = x @ Wq                      # (B, T, d_k)
    k = x @ Wk                      # (B, T, d_k)
    v = x @ Wv                      # (B, T, d_k)
    d_k = q.size(-1)                # 缩放用的就是 q 的最后一维
    # (B,T,d_k) @ (B,d_k,T) -> (B,T,T)：每个位置对所有位置的点积
    att = q @ k.transpose(-2, -1) / d_k ** 0.5   # 先除 sqrt(d_k) 再 softmax
    if causal:
        # 上三角（对角线右侧）置 -inf，每个词只能看自己和左边
        mask = torch.triu(torch.ones(T, T, dtype=torch.bool), diagonal=1)
        att = att.masked_fill(mask, float('-inf'))
    att = F.softmax(att, dim=-1)    # (B, T, T) 每行和为 1
    out = att @ v                   # (B,T,T) @ (B,T,d_k) -> (B,T,d_k)
    return out, att

x = torch.randn(2, 4, 8)                            # 2 条样本、4 个 token、8 维
out, att = self_attention(x, torch.randn(8, 4), torch.randn(8, 4), torch.randn(8, 4))
print(out.shape, att.shape)                         # (2,4,4) (2,4,4)`,
    lang: "python",
    keys: [
      "点积后必须先除以 sqrt(d_k) 再 softmax，否则分数随维度变大、分布被推向 one-hot",
      "因果掩码用 torch.triu(ones(T,T), diagonal=1) 生成上三角，masked_fill 成 -inf 后再 softmax",
      "q / k / v 形状都是 (B,T,d_k)，注意力矩阵是 (B,T,T)，输出回到 (B,T,d_k)",
      "softmax 归一化的维度是最后一维，即对每个 query 在所有 key 上归一化",
    ],
    traps: [
      "漏掉 transpose(-2,-1) 直接相乘会报维度错：矩阵乘法要的是 (B,d_k,T)",
      "掩码忘了 diagonal=1 会把对角线也盖住，第 i 个词连自己都看不到",
      "先 softmax 再掩码：被 mask 的位置已经分到概率，等于没掩",
    ],
    rel: [
      "06-深度学习与名校课程/从零实现LLM专题.md",
      "01-名词与概念/LLM大语言模型.md",
    ],
    tb: ["5.1"],
    qs: ["tf-02"],
  },

  "algo-mha": {
    id: "algo-mha",
    t: "多头注意力",
    group: "algo",
    level: "algo",
    scene: "算法岗一面手撕的进阶版：写完单头就让你扩成多头，考的是「拆头 / 并行算 / 拼回」三段形状变换。",
    code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class MHA(nn.Module):
    def __init__(self, d_model=64, n_head=4):
        super().__init__()
        assert d_model % n_head == 0
        self.h, self.dk = n_head, d_model // n_head
        self.qkv = nn.Linear(d_model, 3 * d_model)   # 一次算出 q/k/v
        self.proj = nn.Linear(d_model, d_model)      # 拼回后融合

    def forward(self, x):
        B, T, C = x.shape
        q, k, v = self.qkv(x).chunk(3, dim=-1)       # 各 (B,T,C)
        # 拆头：(B,T,C) -> (B,T,h,dk) -> (B,h,T,dk)，把头挪到 batch 后并行算
        q, k, v = [t.view(B, T, self.h, self.dk).transpose(1, 2) for t in (q, k, v)]
        att = F.softmax(q @ k.transpose(-2, -1) / self.dk ** 0.5, dim=-1)  # (B,h,T,T)
        out = att @ v                                # (B,h,T,dk)
        out = out.transpose(1, 2).reshape(B, T, C)   # 拼回：(B,h,T,dk)->(B,T,C)
        return self.proj(out)

print(MHA(d_model=64, n_head=4)(torch.randn(2, 6, 64)).shape)   # (2,6,64)`,
    lang: "python",
    keys: [
      "拆头用 view(B,T,h,d_k).transpose(1,2)，把头挪到 batch 后一起并行算，形状变 (B,h,T,d_k)",
      "拼回是 transpose(1,2).reshape(B,T,C)，必须先转回来再 reshape，否则元素顺序错乱",
      "d_model 必须能被 n_head 整除，d_k = d_model // n_head",
      "缩放的除数是 sqrt(d_k)（每个头的维度），不是 sqrt(d_model)",
    ],
    traps: [
      "拆完头忘了 transpose 直接 reshape，语义上把序列维和头维混在一起",
      "用 sqrt(d_model) 当缩放因子，头数一多就缩得过头",
      "拼回后漏掉最后那个 proj 线性层，多头等于白拆",
    ],
    rel: ["06-深度学习与名校课程/从零实现LLM专题.md"],
    tb: ["5.1"],
    qs: ["tf-01"],
  },

  "algo-layernorm": {
    id: "algo-layernorm",
    t: "LayerNorm",
    group: "algo",
    level: "algo",
    scene: "大模型岗一面手撕：实现 LayerNorm，面试官重点看你归一化的维度写没写对、有没有 gamma/beta。",
    code: `import torch
import torch.nn as nn

class LayerNorm(nn.Module):
    def __init__(self, d_model, eps=1e-5):
        super().__init__()
        self.g = nn.Parameter(torch.ones(d_model))    # 缩放 gamma
        self.b = nn.Parameter(torch.zeros(d_model))   # 平移 beta
        self.eps = eps

    def forward(self, x):
        # x: (B, T, d_model)：归一化的是最后一维（特征维），不是序列维
        mu = x.mean(dim=-1, keepdim=True)                  # (B,T,1) 每个 token 各自算均值
        var = x.var(dim=-1, keepdim=True, unbiased=False)  # 有偏方差，训练/推理口径一致
        xhat = (x - mu) / torch.sqrt(var + self.eps)       # (B,T,d_model) 标准化
        return self.g * xhat + self.b                      # 可学习仿射，保留表达能力

ln = LayerNorm(8)
y = ln(torch.randn(2, 5, 8))
print(y.shape, y.mean(-1).abs().max().item())   # (2,5,8) 每个 token 均值≈0`,
    lang: "python",
    keys: [
      "归一化维度是最后一维（特征维 d_model），不是序列维：每个 token 各自算自己的均值和方差",
      "只做 (x-mu)/sqrt(var+eps) 会丢掉表达能力，必须再乘 gamma 加 beta 还原",
      "LayerNorm 是逐 token 归一化、BatchNorm 是逐 batch 归一化；序列长度可变时只能用 LayerNorm",
      "方差用有偏估计 unbiased=False，保证训练和推理口径一致",
    ],
    traps: [
      "把归一化维度写成序列维（dim=1 或 dim=-2），形状不报错但数学上全错",
      "sqrt(var) 里忘了加 eps，某一行方差为 0 时直接出 NaN",
      "mean / var 忘了 keepdim=True，广播时维度对不上",
    ],
    rel: [
      "06-深度学习与名校课程/从零实现LLM专题.md",
      "06-深度学习与名校课程/PyTorch与数学基础.md",
    ],
    tb: ["5.1"],
    qs: ["tf-05"],
  },

  "algo-kvcache": {
    id: "algo-kvcache",
    t: "KV Cache",
    group: "algo",
    level: "algo",
    scene: "推理优化岗 / 大模型岗二面：让你写增量解码里 K/V 的缓存逻辑，然后必须能解释它为什么吃显存。",
    code: `import torch

def step(x_new, Wq, Wk, Wv, cache):
    # x_new: (B, 1, C)：自回归生成时一次只来一个新 token
    q = x_new @ Wq                          # (B,1,d_k)
    cache['k'] = torch.cat([cache['k'], x_new @ Wk], dim=1)   # 历史 K 直接追加
    cache['v'] = torch.cat([cache['v'], x_new @ Wv], dim=1)   # 旧 token 不重算
    k, v = cache['k'], cache['v']           # (B,t,d_k)，t 是已生成的总长度
    att = torch.softmax(q @ k.transpose(-2, -1) / q.size(-1) ** 0.5, dim=-1)  # (B,1,t)
    return att @ v                          # (B,1,d_k)

B, C, dk = 1, 8, 4
Wq, Wk, Wv = (torch.randn(C, dk) for _ in range(3))
cache = {'k': torch.zeros(B, 0, dk), 'v': torch.zeros(B, 0, dk)}   # 初始为空
for _ in range(5):                          # 逐 token 生成 5 步
    out = step(torch.randn(B, 1, C), Wq, Wk, Wv, cache)
print(cache['k'].shape, out.shape)          # (1,5,4) (1,1,4)
# 吃显存的原因：K/V 全程常驻，元素数 ≈ 2*B*t*n_layer*C，随序列长度 t 线性增长`,
    lang: "python",
    keys: [
      "只缓存 K 和 V，Q 不缓存：每步只算新 token 自己的 q，历史 token 不再重算",
      "解码每步的注意力计算量从 O(t^2) 降到 O(t)，省的是算力不是显存",
      "缓存的显存占用 ≈ 2*B*t*n_layer*C，随序列长度线性增长，长上下文时可能超过模型权重",
      "追加用 torch.cat 沿序列维 dim=1，位置不能插错",
    ],
    traps: [
      "把 q 也塞进缓存并对全序列重算，等于没用上 Cache",
      "cat 的 dim 写成 0，会拼到 batch 维上，形状悄悄变了但不报错",
      "忘了初始化空缓存 torch.zeros(B,0,d_k)，第一步就崩",
    ],
    rel: [
      "01-名词与概念/训练推理与采样参数.md",
      "06-深度学习与名校课程/从零实现LLM专题.md",
    ],
    tb: ["5.5"],
    qs: ["in-01"],
  },

  "algo-lora": {
    id: "algo-lora",
    t: "LoRA 注入",
    group: "algo",
    level: "algo",
    scene: "微调 / 后训练岗面试：白板写出 LoRA 的注入代码，并说清到底训练了哪些参数、为什么省显存。",
    code: `from peft import LoraConfig, get_peft_model, TaskType

config = LoraConfig(
    task_type=TaskType.CAUSAL_LM,
    r=8,                                    # 低秩矩阵的秩，越大可训参数越多
    lora_alpha=16,                          # 缩放系数，惯例取 2*r
    lora_dropout=0.05,
    target_modules=['q_proj', 'v_proj'],    # 只给注意力的 q/v 挂旁路
)
model = get_peft_model(base_model, config)  # base_model 是已加载好的预训练模型
model.print_trainable_parameters()          # 通常显示不到 1% 可训练

# LoRA 冻结原权重 W，只训一对低秩矩阵 A(r×C)、B(C×r)：
# 前向变成 Wx + (alpha/r)*B(Ax)，反向只更新 A、B：这就是省显存的原因
for name, p in model.named_parameters():
    if 'lora_' not in name:
        assert not p.requires_grad          # 校验：原权重确实一个都没在训`,
    lang: "python",
    keys: [
      "LoRA 冻结原权重 W，只训低秩对 A 和 B，可训练参数通常远小于 1%",
      "前向是 Wx + (alpha/r)*B(Ax)，alpha/r 是缩放系数，惯例 alpha = 2r",
      "注入只需两步：LoraConfig 配好 → get_peft_model 包一层，不写自定义层",
      "必须用 requires_grad 校验：非 lora_ 前缀的参数应全部为 False",
    ],
    traps: [
      "以为 LoRA 会改原权重：它只在旁边加旁路，原权重全程冻死",
      "r 和 alpha 的关系搞反，alpha 相对 r 太小会让 LoRA 学不动",
      "target_modules 名字按别的模型抄（不同模型模块名不同），peft 会报找不到模块",
    ],
    rel: [
      "01-名词与概念/微调Fine-tuning.md",
      "06-深度学习与名校课程/大模型训练方向.md",
    ],
    tb: ["9.3"],
    qs: ["ft-01"],
  },

  "algo-softmax-ce": {
    id: "algo-softmax-ce",
    t: "softmax 与交叉熵",
    group: "algo",
    level: "algo",
    scene: "算法岗一面手撕：手写 softmax + 交叉熵，考的不是公式而是数值稳定性：减最大值那步是必答点。",
    code: `import torch
import torch.nn.functional as F

def softmax_ce(logits, target):
    # logits: (B,V) 每个样本对词表的原始打分; target: (B,) 正确词的下标
    x = logits - logits.max(dim=-1, keepdim=True).values   # 减最大值
    # 为什么：exp 会把大数放大到 inf（float32 超过约 88 就溢出），
    # 减最大值后最大项变成 exp(0)=1，范围锁在 (0,1]，数学上完全等价
    exp = torch.exp(x)                                     # (B,V)
    logsumexp = torch.log(exp.sum(dim=-1, keepdim=True))   # (B,1)
    log_prob = x - logsumexp                               # (B,V) log 概率
    loss = -log_prob.gather(1, target[:, None]).mean()     # 只取正确那一类
    return loss

logits = torch.tensor([[2.0, 1.0, -1.0]])       # 1 条样本、3 个候选词
y = torch.tensor([0])                           # 正确词是第 0 个
print(softmax_ce(logits, y).item())             # 与 F.cross_entropy 完全一致`,
    lang: "python",
    keys: [
      "softmax 前必须先减最大值：exp 会把大数放大到 inf，float32 超过约 88 就溢出",
      "减最大值不改变结果，因为分子分母同乘 exp(-max)，数学上完全等价",
      "交叉熵写成 x - log(sum(exp(x)))（logsumexp），比先 softmax 再取 log 更稳",
      "取正确类用 gather(1, target[:,None])，不要用 one-hot 相乘",
    ],
    traps: [
      "直接 torch.exp(logits)：大 logits 立刻变 inf，loss 变 NaN",
      "为了数值稳定先 softmax 再 log，反而把小数丢成 0 再变 -inf",
      "target 是类别下标不是 one-hot，维度对不上会静默算错",
    ],
    rel: [
      "06-深度学习与名校课程/PyTorch与数学基础.md",
      "06-深度学习与名校课程/从零实现LLM专题.md",
    ],
    tb: ["5.2"],
    qs: ["tf-04"],
  },

  "eval-passrate": {
    id: "eval-passrate",
    t: "评测集与通过率脚本",
    group: "eval",
    level: "must",
    scene: "AI 应用岗 / Agent 岗二面：给你一批测试用例，让你现场写通过率脚本：看你会不会把「感觉还行」变成可复现的数字。",
    code: `CASES = [
    {'q': '退货要几天', 'must': ['7 天', '退款']},
    {'q': '怎么改地址', 'must': ['订单详情']},
    {'q': '发票怎么开', 'must': ['电子发票']},
]

def judge(ans, must):
    # 结构/关键词判定：命中全部必含词才算过，不做模糊匹配
    return all(k in ans for k in must)

def run(ask, cases):
    ok = 0
    for c in cases:
        ans = ask(c['q'])          # ask：接模型或 Agent 的入口，换模型不用改这里
        good = judge(ans, c['must'])
        ok += good
        print('PASS' if good else 'FAIL', c['q'], '->', ans[:24])
    print('通过率 %.0f%% (%d/%d)' % (ok / len(cases) * 100, ok, len(cases)))

run(lambda q: '退款 7 天到账，可在订单详情操作', CASES)   # 先用假模型把流程跑通`,
    lang: "python",
    keys: [
      "每个用例必须写死 expected 关键词或结构，不能只看输出「像不像」",
      "判定函数和跑批函数拆开，换模型只改一个 ask 入口",
      "通过率必须同时打印分子分母（ok/total），只给百分比看不出样本太少",
      "用例规模要够（几十条起），3 条只够验证脚本能跑通",
    ],
    traps: [
      "用例写得太宽松（只查一个字），通过率虚高掩盖真问题",
      "用例和判定逻辑写死在循环里，加一条用例就要动代码",
      "只看总通过率不看失败明细，改完 Prompt 不知道是哪几条坏的",
    ],
    rel: [
      "02-AI-Agent开发/Agent评估与调试.md",
      "yt/03-知识专题/专题-A2-AI评测Evals.md",
    ],
    tb: ["8.12"],
    qs: ["ev-04"],
  },

  "eval-llmjudge": {
    id: "eval-llmjudge",
    t: "LLM-as-judge 打分骨架",
    group: "eval",
    level: "plus",
    scene: "AI 应用岗 / PM 技术面：问你怎么给开放式输出打分。满分答案是给出分维度 rubric 并主动说出裁判的已知偏差。",
    code: `import json

RUBRIC = '''你是评审。按三条打分，每条 0/1/2 分，只输出 JSON：
1. 事实正确：答案与参考资料一致，没有编造
2. 完整：覆盖问题要求的全部要点
3. 有依据：给出了可核对的来源或位置
输出 {"score": 总分, "reasons": [每条一句话]}'''

def llm_judge(question, answer, ref, call_llm):
    prompt = RUBRIC + '\\n问题：' + question + '\\n答案：' + answer + '\\n参考资料：' + ref
    raw = call_llm(prompt)
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {'score': None, 'reasons': ['解析失败，转人工']}   # 兜底，别让脚本崩

# 已知偏差（必须知道）：
# 1) 裁判偏爱更长的答案：把长度写进 rubric 或做长度归一，否则长回答白拿分
# 2) 裁判偏爱自己模型的输出（self-preference），换一个模型复评更稳
# 3) 裁判本身要先用人工标注样本校准，否则你不知道它准不准

ok = lambda p: '{"score": 5, "reasons": ["事实正确", "要点齐全", "给了来源"]}'
print(llm_judge('退货几天', '7 天', '政策文档', ok))   # 换 call_llm 就换成真模型`,
    lang: "python",
    keys: [
      "给的是分维度 rubric（事实 / 完整 / 有依据），不是让裁判凭感觉打一个总分",
      "必须要求裁判输出结构化 JSON，并写解析兜底，解析失败转人工",
      "裁判本身要先用人工标注样本校准过，否则评分不可信",
      "已知偏差要提前声明：裁判偏爱更长的答案，也偏爱自己模型的输出",
    ],
    traps: [
      "只写「给这个答案打个分」：尺度会漂，同一批数据两次跑出两个分",
      "JSON 解析不兜底，模型偶尔加 markdown 围栏，脚本当场崩",
      "用同一个模型既生成又评判（self-preference），分数系统性偏高",
    ],
    rel: [
      "02-AI-Agent开发/Agent评估与调试.md",
      "yt/03-知识专题/专题-A2-AI评测Evals.md",
    ],
    tb: ["8.12"],
    qs: ["ev-04"],
  },

  "eval-error-analysis": {
    id: "eval-error-analysis",
    t: "错误分析归类脚本",
    group: "eval",
    level: "plus",
    scene: "FDE / Agent 岗面试：给你一批失败 trace，让你现场归类并说清下一步改哪儿。考的是「先做错误分析，再写评测」的顺序感。",
    code: `# 输入只放失败案例（跑 eval-passrate 时 FAIL 的那些）
BUCKETS = [
    ('检索没中', lambda c: not c['hit']),                     # 召回里根本没有正确片段
    ('提示词缺约束', lambda c: c['hit'] and c['format_bad']),  # 有资料，但没按格式/口径答
    ('模型能力', lambda c: c['hit'] and not c['format_bad']),  # 资料和格式都对，还是答错
]

def analyze(fails):
    stat = {}
    for c in fails:
        for name, rule in BUCKETS:
            if rule(c):
                stat.setdefault(name, []).append(c['id'])
                break          # 只归第一个命中的桶，避免一条被数两次
    for name, ids in sorted(stat.items(), key=lambda kv: -len(kv[1])):
        print('%-10s %d 例: %s' % (name, len(ids), ','.join(ids)))
    return stat

analyze([
    {'id': 'c1', 'hit': False, 'format_bad': False},
    {'id': 'c2', 'hit': True, 'format_bad': True},
    {'id': 'c3', 'hit': True, 'format_bad': False},
])`,
    lang: "python",
    keys: [
      "先人工翻 trace 记错误，再用规则归类；顺序反了会归出一堆没用的桶",
      "桶按归因顺序排列，一条失败只归第一个命中的桶，避免重复计数",
      "每个桶必须输出具体案例 id，否则归完类还是不知道从哪改",
      "错误不再产生新桶时停止（理论饱和），桶的口径由一个人统一",
    ],
    traps: [
      "把「答错了」当一个桶：那不是归因，桶要落到能改的动作上（改检索 / 改提示词 / 换模型）",
      "一条失败同时计入多个桶，统计出来的总数和失败数对不上",
      "只统计数量不打印案例 id，报告完下一步还是没方向",
    ],
    rel: [
      "yt/03-知识专题/专题-A2-AI评测Evals.md",
      "02-AI-Agent开发/案例-知识库整理助手.md",
    ],
    tb: ["8.12"],
    qs: ["ev-04"],
  },
});
