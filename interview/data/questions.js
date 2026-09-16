// ============================================================
// AI 面试题库 —— 深度学习版
// 每题结构：
//   q        题目（面试官原话风格）
//   probes   追问链（逐层解锁，模拟打断式追问）
//   frame    答题框架 {claim 一句话结论, why 分层理由, practice 项目落点, tradeoff 取舍, pitfalls 雷区}
//   ev       证据锚定（访谈原话/一手数据）
//   rel      关联笔记（path key，可点进深读）
//   src      题目来源
// 来源：牛客/掘金/CSDN/腾讯云社区面经 + 代码随想录 + 各厂真实面经 + 访谈库
// ============================================================

window.QUESTION_BANK = {
  generated: "2026-09-16",

  roles: [
    { id: "llm-algo", name: "大模型算法工程师", icon: "🔬", desc: "八股密度最高，追问到数学本质，可能手撕 Attention" },
    { id: "agent-app", name: "AI 应用 / Agent 开发", icon: "🤖", desc: "需求量最大；项目深挖 > 八股，场景题为主" },
    { id: "llmops", name: "大模型系统 / LLMOps", icon: "⚙️", desc: "架构 + 成本，vLLM / 量化 / 分布式 / 高并发" },
    { id: "ai-pm", name: "AI 产品经理", icon: "📋", desc: "用产品语言讲清技术取舍，评估体系是分水岭" },
    { id: "fde", name: "FDE 前置部署工程师", icon: "🛰️", desc: "面试即工作：先澄清再解决、出声拆解、商业语言" },
  ],

  modules: [
    { id: "transformer", name: "Transformer 原理", icon: "🧠", roles: ["llm-algo"] },
    { id: "train", name: "训练与微调", icon: "🎛️", roles: ["llm-algo"] },
    { id: "rag", name: "RAG 检索增强", icon: "📚", roles: ["agent-app", "llm-algo"] },
    { id: "agent", name: "Agent 与工具调用", icon: "🤖", roles: ["agent-app"] },
    { id: "protocol", name: "协议生态 FC/MCP/A2A", icon: "🔌", roles: ["agent-app"] },
    { id: "memory", name: "记忆与上下文", icon: "🗂️", roles: ["agent-app"] },
    { id: "infer", name: "推理与部署", icon: "⚡", roles: ["llmops", "llm-algo"] },
    { id: "design", name: "系统设计 / 场景题", icon: "🏗️", roles: ["agent-app", "fde", "ai-pm"] },
    { id: "evals", name: "评估与调试", icon: "📏", roles: ["ai-pm", "fde", "agent-app"] },
    { id: "product", name: "产品与商业判断", icon: "📈", roles: ["ai-pm"] },
    { id: "fde", name: "FDE 交付与面试", icon: "🛰️", roles: ["fde"] },
    { id: "behavior", name: "行为面与项目深挖", icon: "🎤", roles: ["llm-algo", "agent-app", "llmops", "ai-pm", "fde"] },
  ],

  questions: [
    /* ===================== Transformer 原理 ===================== */
    {
      id: "tf-01", role: "llm-algo", mod: "transformer", freq: "high", lv: 2,
      q: "Transformer 的核心结构是什么？每一块解决什么问题？",
      probes: [
        "残差连接解决什么问题？去掉会怎样？",
        "LayerNorm 是对哪个维度做归一化？pre-norm 和 post-norm 有什么差别？",
        "多头注意力的「多头」到底带来了什么？单头行不行？",
        "前馈网络（FFN）在整体参数里占多大比例？",
      ],
      frame: {
        claim: "Embedding + 位置编码 → N ×（多头自注意力 + 前馈网络，各配残差连接与 LayerNorm）→ 输出头；Decoder-only 用因果掩码防止偷看未来。",
        why: [
          "自注意力：每个 token 对全序列加权聚合，一次性并行，解决 RNN 的长程依赖与串行瓶颈",
          "多头：在不同子空间学不同关系（语法、指代、位置），等价于多组独立视角",
          "位置编码：自注意力本身是置换不变的，位置必须显式注入",
          "残差 + LayerNorm：残差给梯度一条直通路，LayerNorm 稳定每层分布，两者合起来才让几十层可训练",
          "FFN：逐位置非线性变换，是参数大头（通常占 2/3）",
        ],
        practice: "手写过 GPT 的人可以补一句：我实现时因果掩码写成上三角 -inf，pre-norm 结构比 post-norm 更容易训深。",
        tradeoff: "pre-norm 训练更稳、是当下主流（Llama/Qwen），但同等深度下表达略弱；post-norm 表达更强，但需要 warmup 才不会训崩。",
        pitfalls: ["只背「多头自注意力 + FFN」说不出每块解决什么问题", "答不出 LayerNorm 归一化的维度（是特征维，不是序列维）"],
      },
      ev: [],
      rel: ["06-深度学习与名校课程/从零实现LLM专题.md", "01-名词与概念/LLM大语言模型.md"],
      src: ["牛客 / 掘金面经（大模型算法岗）"],
    },
    {
      id: "tf-02", role: "llm-algo", mod: "transformer", freq: "high", lv: 3,
      q: "Self-Attention 为什么要除以 √d_k？",
      probes: [
        "不除会发生什么？为什么是 softmax 饱和而不是别的？",
        "为什么是 √d 而不是 d？请从方差推导讲。",
        "你手写 attention 时观察过这个现象吗？",
      ],
      frame: {
        claim: "Q·K 的点积方差随维度 d 线性增长，数值过大会把 softmax 推入梯度极小的饱和区；除以 √d 把方差拉回 1 附近，保证梯度不消失。",
        why: [
          "设 q、k 各维独立、均值 0、方差 1，则点积 q·k 的方差 = d",
          "维度越大，点积绝对值越大；softmax 输入过大 → 输出接近 one-hot → 梯度趋近 0",
          "除以 √d 后方差归一为 1，softmax 工作在梯度友好区间",
          "这是「缩放点积注意力」中 scaled 的来源",
        ],
        practice: "好答案会补一句体感：我手写 attention 时不除它，长序列上 loss 会抖、收敛变慢——同一句话证明你真写过。",
        tradeoff: "没有替代方案的必要；但要注意 RoPE 等位置编码会改变 Q/K 的数值分布，实践中仍需保持缩放。",
        pitfalls: ["只答「防止 softmax 饱和」，说不出方差随维度线性增长这一步", "把 √d 说成经验值，给不出推导"],
      },
      ev: [],
      rel: ["06-深度学习与名校课程/从零实现LLM专题.md"],
      src: ["牛客 / 代码随想录面试题精讲"],
    },
    {
      id: "tf-03", role: "llm-algo", mod: "transformer", freq: "high", lv: 2,
      q: "位置编码是怎么演进的？RoPE 为什么成了主流？",
      probes: [
        "正弦绝对位置编码的缺点是什么？",
        "RoPE 是加在 embedding 上还是别的地方？",
        "为什么 RoPE 有利于长文本外推？",
        "ALiBi 和 RoPE 的思路差别？",
      ],
      frame: {
        claim: "正弦绝对编码（原始 Transformer）→ 可学习位置 embedding（GPT-2）→ 旋转位置编码 RoPE（Llama/Qwen 主流）/ ALiBi。",
        why: [
          "正弦绝对编码：无参数、可外推一点，但表达力弱、与内容耦合差",
          "可学习 embedding：表达强，但长度被训练长度锁死，无法外推",
          "RoPE：把相对位置信息编码成对 Q/K 的旋转，使注意力分数天然只依赖相对距离",
          "相对位置天然具备更好的长度外推性，配合 NTK/位置插值可进一步扩上下文",
          "ALiBi：不加位置编码，直接在注意力分数上按距离加线性衰减偏置，外推简单粗暴",
        ],
        practice: "能说出「RoPE 作用在 Q/K 上而不是 embedding 上」就说明你没死记。",
        tradeoff: "RoPE 外推好但需要调 base/插值；ALiBi 外推更省事但对长程建模表达略弱。",
        pitfalls: ["把 RoPE 说成加在 embedding 上", "说不出「相对 vs 绝对」这个分水岭"],
      },
      ev: [],
      rel: ["06-深度学习与名校课程/从零实现LLM专题.md"],
      src: ["2026 大厂面经汇总（算法岗）"],
    },
    {
      id: "tf-04", role: "llm-algo", mod: "transformer", freq: "high", lv: 2,
      q: "BERT、GPT、T5 的区别？为什么现在的 LLM 几乎都是 Decoder-only？",
      probes: [
        "BERT 的 MLM 和 GPT 的 AR 在训练目标上本质差别是什么？",
        "Encoder-Decoder 在什么任务上仍有优势？",
      ],
      frame: {
        claim: "BERT 是 Encoder + 双向 MLM（理解），GPT 是 Decoder + 自回归（生成），T5 是 Encoder-Decoder 统一成 text-to-text；主流 LLM 选 Decoder-only 是因为训练效率、生成能力与 scaling 友好度三者兼得。",
        why: [
          "训练效率：每个 token 都能提供监督信号（AR 全序列预测），MLM 只有 15% 掩码位有效",
          "生成天然：AR 建模的就是 P(next|history)，直接可对话、可推理、可 in-context learning",
          "架构统一：一套 decoder 堆叠即可 scale，无需设计 encoder-decoder 之间的交叉注意力",
          "工程简单：KV Cache、量化、并行策略都更容易做",
        ],
        practice: "能提到「in-context learning 是 AR 的副产品，MLM 给不了」是加分点。",
        tradeoff: "Encoder-Decoder 在翻译、摘要等明确的 seq2seq 任务上参数效率仍可能更高，但已被通用大模型的通用性碾压。",
        pitfalls: ["只答「BERT 做理解、GPT 做生成」", "说不出 MLM 只有部分 token 有监督"],
      },
      ev: [],
      rel: ["06-深度学习与名校课程/从零实现LLM专题.md"],
      src: ["牛客算法岗面经"],
    },
    {
      id: "tf-05", role: "llm-algo", mod: "transformer", freq: "mid", lv: 3,
      q: "MoE（混合专家）的原理与代价？",
      probes: [
        "稀疏激活省的是什么？",
        "路由不稳定会带来什么问题？",
        "为什么 MoE 的通信开销大？",
      ],
      frame: {
        claim: "MoE 把 FFN 拆成多个专家，每 token 只激活 top-k 个，用稀疏激活换取「参数量大但计算量小」；代价是路由不稳定、负载不均与通信开销。",
        why: [
          "总参数量可以很大（知识容量大），但每 token 只走少数专家，FLOPs 与 dense 小模型相当",
          "需要负载均衡损失（aux loss）防止专家塌缩到少数几个",
          "专家分布在不同设备上 → all-to-all 通信成为瓶颈",
          "路由是离散决策，训练不稳定，容易出现 token 被丢弃",
        ],
        practice: "能说出「MoE 涨的是参数量不是计算量」就抓住了本质。",
        tradeoff: "同计算预算下 MoE 通常优于 dense；但推理显存占用高、部署复杂，对小规模场景不划算。",
        pitfalls: ["把 MoE 说成「多个模型投票」", "不提负载均衡损失"],
      },
      ev: [],
      rel: ["06-深度学习与名校课程/大模型训练方向.md", "06-深度学习与名校课程/从零实现LLM专题.md"],
      src: ["算法岗进阶面经"],
    },

    /* ===================== 训练与微调 ===================== */
    {
      id: "tr-01", role: "llm-algo", mod: "train", freq: "high", lv: 2,
      q: "讲一下预训练 → SFT → RLHF/DPO 的完整流程，每一步解决什么？",
      probes: [
        "SFT 的数据量为什么远小于预训练？",
        "RLHF 里奖励模型（RM）是怎么训的？",
        "PPO 和 DPO 的差别？为什么 DPO 更常用？",
      ],
      frame: {
        claim: "预训练学语言规律与知识（next token prediction）→ SFT 用指令数据教「听懂并follow」→ RLHF/DPO 用人类偏好对齐「说好人话」。",
        why: [
          "预训练：海量无标注文本，获得世界知识与语言能力，但不听指令",
          "SFT：几万到几十万条「指令→理想回答」，把模型从续写器变成助手；数据量小但质量决定上限",
          "RLHF：先训奖励模型拟合人类偏好排序，再用 PPO 优化策略；对齐有用性/无害性",
          "DPO：直接用偏好对做对比损失，跳过奖励模型与在线采样，更稳、更省、不易训飞",
        ],
        practice: "能说清「SFT 学格式与行为，RLHF/DPO 学偏好与尺度」就到位了。",
        tradeoff: "PPO 上限可能更高但工程复杂、易崩；DPO 简单稳定但可能过拟合偏好对、多样性下降。",
        pitfalls: ["把 RLHF 说成一个模型", "说不出奖励模型是从人类排序学的"],
      },
      ev: [],
      rel: ["01-名词与概念/微调Fine-tuning.md", "06-深度学习与名校课程/大模型训练方向.md"],
      src: ["牛客 / 掘金（算法岗必问）"],
    },
    {
      id: "tr-02", role: "llm-algo", mod: "train", freq: "high", lv: 3,
      q: "LoRA 为什么有效？rank 怎么选？为什么它的学习率要比全参微调大 1-2 个数量级？",
      probes: [
        "低秩假设的依据是什么？",
        "LoRA 一般加在哪些层？",
        "merge 与不 merge 各有什么取舍？",
        "QLoRA 又做了什么？",
      ],
      frame: {
        claim: "冻结原权重，在注意力层注入低秩矩阵 ΔW = B·A（r ≪ d），把可训练参数降到 1% 以下——依据是微调带来的权重更新本身具有低内在维度（Intrinsic Dimensionality）。",
        why: [
          "低秩假设：任务适配所需的更新量集中在一个低维子空间，不需要全秩",
          "可训练参数从 d² 降到 d·r·2，显存与优化器状态大幅下降",
          "学习率更大：可训练参数极少且从零初始化，需要更大的步长才能在同预算内收敛",
          "rank 越大容量越高但越易过拟合；常规 8-64，任务复杂或数据多时可上调",
          "QLoRA：基座量化到 4bit，再叠 LoRA，单卡就能微调 7B/13B",
        ],
        practice: "被问「你调过吗」时答：r=16、alpha=32、目标层 q_proj/v_proj 是我项目的常用配置。",
        tradeoff: "merge 进基座推理无额外开销，但无法再切换适配器；不 merge 可多适配器热插拔，但推理有一点延迟。",
        pitfalls: ["说 LoRA「减少了计算量」——主要省的是显存与优化器状态", "解释学习率时只会说「经验值」"],
      },
      ev: [],
      rel: ["01-名词与概念/微调Fine-tuning.md"],
      src: ["2026 大厂面经（LoRA 高频）"],
    },
    {
      id: "tr-03", role: "llm-algo", mod: "train", freq: "high", lv: 3,
      q: "7B 模型全参微调大概需要多少显存？请手算。",
      probes: [
        "优化器状态为什么是 8 倍参数？",
        "激活值显存和什么有关？",
        "所以为什么大家都用 LoRA？",
      ],
      frame: {
        claim: "约 60GB+，所以单卡玩不动——这就是 LoRA 存在的直接理由。",
        why: [
          "权重（bf16）：7B × 2 bytes ≈ 14GB",
          "梯度（bf16）：≈ 14GB（若 fp32 则 28GB）",
          "Adam 优化器状态（fp32 一阶+二阶+主权重）：7B × 8 bytes ≈ 56GB",
          "合计已 > 80GB，再加激活值显存，单张 80G 卡都很紧张",
          "LoRA 只训 1% 参数 → 优化器状态几乎归零，显存降到可单卡",
        ],
        practice: "面试时把「14/28/56」三个数字报出来，比说「大概几十 G」可信度完全不同。",
        tradeoff: "全参微调效果上限更高、适合改行为与知识；LoRA 省资源、易切换，但容量受限。",
        pitfalls: ["只说「显存不够」报不出数", "把优化器状态说成 2 倍参数"],
      },
      ev: [],
      rel: ["01-名词与概念/微调Fine-tuning.md", "06-深度学习与名校课程/大模型训练方向.md"],
      src: ["naginoa/LLMs_interview_notes（显存计算硬核题）"],
    },
    {
      id: "tr-04", role: "llm-algo", mod: "train", freq: "high", lv: 2,
      q: "微调、RAG、Prompt 三者怎么选？（几乎每场面试的开场白）",
      probes: [
        "知识更新该用哪个？",
        "行为/风格/格式约束该用哪个？",
        "为什么生产惯例是 RAG-First？",
        "两者能结合吗？怎么结合？",
      ],
      frame: {
        claim: "知识更新 → RAG；行为、风格、格式 → 微调；轻量约束 → Prompt/few-shot。生产惯例 RAG-First，因为知识是活的而权重是死的。",
        why: [
          "RAG 把知识放在外部可实时更新的库里，改数据不用重训，还能引用溯源",
          "微调改的是「怎么说」，适合风格、语气、输出结构、领域术语习惯",
          "Prompt 成本最低、迭代最快，能用提示词解决就不要上更重的方案",
          "升级链纪律：zero-shot → few-shot → RAG → fine-tuning，每级升级前先评测",
        ],
        practice: "进阶答法：两者互补——微调教模型「如何利用检索结果」，RAG 提供事实。",
        tradeoff: "RAG 增加延迟与检索工程复杂度；微调有训练成本且知识会过期；Prompt 受上下文长度限制。",
        pitfalls: ["把两者对立起来，答成「二选一」", "说不出「知识 vs 行为」这条分界线"],
      },
      ev: [
        {
          zh: "优化顺序：zero-shot → few-shot → RAG → fine-tuning，每一级升级前先评测",
          en: "Don't over-engineer early — evaluate before each upgrade",
          src: "Pawel Huryn · AI PM Complete Course",
          url: "https://www.youtube.com/watch?v=IfW1FMDkw4k",
        },
      ],
      rel: ["01-名词与概念/RAG检索增强生成.md", "01-名词与概念/微调Fine-tuning.md", "yt/02-视频笔记/2025-04-22_PawelHuryn_AI-PM-Complete-Course.md"],
      src: ["各厂通用开场题"],
    },

    /* ===================== RAG ===================== */
    {
      id: "rg-01", role: "agent-app", mod: "rag", freq: "high", lv: 2,
      q: "RAG 和微调的本质区别是什么？",
      probes: [
        "一句话比喻怎么说？",
        "RAG 的最大风险是什么？",
      ],
      frame: {
        claim: "RAG 是开卷考试（把资料带进考场），微调是把知识背进脑子。",
        why: [
          "RAG 外挂知识库，检索→拼上下文→生成，知识可实时更新、可溯源",
          "微调改变模型权重，知识被固化，更新需要重训",
          "RAG 的风险是「检索不到 / 检索歪了」，微调的风险是「训过头、灾难性遗忘」",
        ],
        practice: "答完补一句：我们生产上 RAG-First，只有当模型「不会按我们的格式说」时才会考虑微调。",
        tradeoff: "见 tr-04。",
        pitfalls: ["答成「RAG 更便宜所以都用 RAG」——没抓住知识 vs 行为"],
      },
      ev: [],
      rel: ["01-名词与概念/RAG检索增强生成.md", "00-小白课堂/小白课-RAG开卷考试.md"],
      src: ["2026 每场面试标配题"],
    },
    {
      id: "rg-02", role: "agent-app", mod: "rag", freq: "high", lv: 2,
      q: "讲一下 RAG 的完整流水线。",
      probes: [
        "离线链路和在线链路分别有哪些步骤？",
        "query 改写解决什么问题？",
        "重排（Rerank）为什么必要？",
      ],
      frame: {
        claim: "离线：解析 → 切分 → Embedding → 入库；在线：query 改写 → 混合检索 → 重排 → 生成 → 引用溯源。",
        why: [
          "离线决定「能不能被检索到」：解析质量（表格/PDF 版式）、切分粒度、embedding 模型选型",
          "在线决定「能不能用好」：多轮指代需要 query 改写；单路召回不够要混合检索；粗排 top-k 噪声大要 Cross-Encoder 精排",
          "引用溯源是让答案可审计、可纠错的最后一环",
        ],
        practice: "把这条链路当骨架，任何 RAG 追问都能挂上去回答。",
        tradeoff: "环节越多延迟越高；小规模场景可以先简化为「切分 + 向量检索 + 生成」。",
        pitfalls: ["只说「切分、向量化、检索、生成」四步，漏掉在线侧的改写与重排"],
      },
      ev: [],
      rel: ["01-名词与概念/RAG检索增强生成.md", "00-小白课堂/小白课-实战RAG迷你版.md"],
      src: ["掘金 / 腾讯云社区"],
    },
    {
      id: "rg-03", role: "agent-app", mod: "rag", freq: "high", lv: 3,
      q: "chunk 怎么切？父子文档切片是什么，效果能提升多少？",
      probes: [
        "固定长度切片的问题是什么？",
        "overlap 一般留多少？为什么？",
        "父子文档为什么有效？",
      ],
      frame: {
        claim: "语义边界切分 + 保留标题层级 + 10-20% overlap；进阶用父子文档——子片段用于检索（精准），父片段用于注入（完整上下文）。",
        why: [
          "固定长度会切断语义，导致检索到的片段读不懂",
          "保留标题层级等于给片段带上「它在说什么」的元信息",
          "overlap 防止答案正好落在切口上",
          "父子文档分离了「检索粒度」与「生成粒度」这对矛盾：小块检索准，大块上下文全",
        ],
        practice: "面经里有真实数据：父子文档把准确率从 53% 提到 93%。报数字比讲道理有力。",
        tradeoff: "overlap 越大冗余越多、成本越高；父子文档需要额外的存储与映射结构。",
        pitfalls: ["答「按 512 token 固定切」", "说不出「检索粒度 ≠ 生成粒度」这个洞察"],
      },
      ev: [],
      rel: ["01-名词与概念/RAG检索增强生成.md"],
      src: ["面经真实数据（53%→93%）"],
    },
    {
      id: "rg-04", role: "agent-app", mod: "rag", freq: "high", lv: 3,
      q: "BM25 和向量检索各自的优劣？为什么用混合检索？",
      probes: [
        "BM25 擅长什么、向量擅长什么？",
        "RRF 是怎么融合的？",
        "什么时候向量反而更差？",
      ],
      frame: {
        claim: "BM25 抓专有名词与精确匹配，向量抓语义与口语化表达；两者互补，用 RRF 融合后召回显著提升。",
        why: [
          "BM25 基于词频与逆文档频率，对型号、编号、人名、代码符号极其精准",
          "向量基于语义相似，对同义改写、口语提问友好",
          "单一召回必然有盲区：用户问「X100 的续航」时向量可能召回一堆讲续航但不含型号的文本",
          "RRF 用排名倒数融合，不需要归一化不同量纲的分数，工程上最稳",
        ],
        practice: "能说出「我的知识库里全是产品型号，所以 BM25 那一路贡献了主要命中」就很扎实。",
        tradeoff: "混合检索要走两套索引、延迟增加；小语料可能纯向量就够了。",
        pitfalls: ["把 RRF 说成「加权求和」——RRF 用的是排名倒数", "说不出 BM25 的专有名词优势"],
      },
      ev: [],
      rel: ["01-名词与概念/RAG检索增强生成.md", "01-名词与概念/Embedding向量嵌入.md"],
      src: ["字节/阿里面经"],
    },
    {
      id: "rg-05", role: "agent-app", mod: "rag", freq: "high", lv: 3,
      q: "RAG 的准确率从 60% 提到 85%，你会怎么做？",
      probes: [
        "你怎么知道现在是 60%？",
        "先动离线还是先动在线？",
        "改完之后怎么证明真的提升了？",
      ],
      frame: {
        claim: "按四个环节拆：离线数据 → 在线查询 → 检索生成 → 评估闭环；每个环节带自己项目的数字，而不是说「换个 embedding 模型、调大 top-k」。",
        why: [
          "离线：语义边界切分 + 保留标题层级 + 10-20% overlap + 父子文档",
          "在线查询：query 改写 + 语义校验（相似度 < 0.8 回退原 query，防止改歪）",
          "检索生成：BM25 + 向量双路 → RRF 融合 → Cross-Encoder 重排 → 动态 TopK",
          "评估闭环：建 golden set，每次改动跑回归，不靠感觉；先做 error analysis 找出主要失败模式，再针对性优化",
        ],
        practice: "这题是区分度最高的题；没有评估闭环的答案一律降档——因为无法证明 85% 是真的。",
        tradeoff: "每一环都加复杂度与延迟；应该先定位最大失败模式，只优化那一环。",
        pitfalls: ["只列优化手段，不提评估闭环", "不给数字，全是「更好」「更强」"],
      },
      ev: [
        {
          zh: "永远从错误分析开始——不要一头扎进去写评测",
          en: "Always start with error analysis — don't jump into writing evals",
          src: "Hamel Husain",
          url: "https://www.youtube.com/watch?v=0s1fT3XeGBU",
        },
      ],
      rel: ["yt/03-知识专题/专题-A2-AI评测Evals.md", "01-名词与概念/RAG检索增强生成.md"],
      src: ["各厂高频（区分度最高）"],
    },
    {
      id: "rg-06", role: "agent-app", mod: "rag", freq: "mid", lv: 2,
      q: "多轮对话里的指代消解怎么做？风险是什么？",
      probes: [
        "「这个条款」这种指代怎么补全？",
        "改写会不会把问题改歪？怎么防？",
      ],
      frame: {
        claim: "用 query 改写把指代替换成独立问题，但要加语义校验防止改写引入偏差。",
        why: [
          "RAG 检索需要自包含的 query，否则「这个条款」检索不到任何东西",
          "改写依赖对话历史，模型可能过度脑补",
          "防跑偏：改写后与原 query/历史做相似度校验，低于阈值（如 0.8）就回退原 query",
        ],
        practice: "能主动提「改写是有副作用的」是加分点。",
        tradeoff: "改写提升召回但增加一次模型调用延迟；简单场景可不做。",
        pitfalls: ["只说「用大模型改写」，不提校验与回退"],
      },
      ev: [],
      rel: ["01-名词与概念/RAG检索增强生成.md", "02-AI-Agent开发/记忆与上下文工程.md"],
      src: ["腾讯/阿里面经"],
    },

    /* ===================== Agent ===================== */
    {
      id: "ag-01", role: "agent-app", mod: "agent", freq: "high", lv: 2,
      q: "Agent、Workflow、Chatbot 三者的区别是什么？",
      probes: [
        "控制流由谁决定？",
        "什么时候必须用 Workflow 而不是 Agent？",
        "混合架构怎么设计？",
      ],
      frame: {
        claim: "Workflow 是代码写死的图（LLM 只在节点里干活），Agent 是 LLM 自己决定下一步做什么，Chatbot 只是一问一答没有工具与规划。",
        why: [
          "可预测性：Workflow 路径确定、可测；Agent 路径开放、能应对未知",
          "适用场景：步骤固定的业务（审批、客服流程）用 Workflow；开放任务（调研、写代码）用 Agent",
          "复杂度递进原则：能用单次 LLM 调用就别上 Workflow，能用 Workflow 就别上自主 Agent——每加一层自主性就多一份 token 开销和失败点",
        ],
        practice: "这题腾讯必问；答完务必主动说出「复杂度递进原则」，直接把追问堵住。",
        tradeoff: "Agent 灵活但不可控、成本高；Workflow 可控但僵化，遇到没预料的情况就卡住。",
        pitfalls: ["把 Workflow 说成「简单的 Agent」", "不提成本和失败点"],
      },
      ev: [
        {
          zh: "最简 harness：能给模型最简单的脚手架，就不要加复杂编排",
          en: "Give the model the simplest possible harness",
          src: "Boris Cherny · Claude Code",
          url: "https://www.youtube.com/watch?v=qyPCVqFUyDo",
        },
      ],
      rel: ["02-AI-Agent开发/Agent核心架构.md", "02-AI-Agent开发/ReAct与Agent设计模式.md", "yt/02-视频笔记/2026-07-27_BorisCherny_YC-StartupSchool.md"],
      src: ["腾讯必问"],
    },
    {
      id: "ag-02", role: "agent-app", mod: "agent", freq: "high", lv: 3,
      q: "ReAct 循环的细节是什么？",
      probes: [
        "Thought / Action / Observation 是怎么交替的？",
        "跟 Function Calling 的关系？",
        "ReWOO 和 ReAct 的差别？什么时候用哪个？",
      ],
      frame: {
        claim: "Thought（推理）→ Action（调用工具）→ Observation（工具返回）交替循环，直到模型给出最终答案。",
        why: [
          "关键是把「推理」和「行动」交织：每步观察都进入下一轮思考，形成闭环纠错",
          "工程实现上通常靠 Function Calling 或结构化输出解析出 Action",
          "需要设置最大迭代数（10-20）与循环检测，否则单步失败会无限重试",
          "ReWOO：先一次性规划完整个步骤再执行，不在每一步携带全部观察，省 token、减少干扰",
        ],
        practice: "字节问 ReAct 细节时，主动提 ReWOO 很加分。",
        tradeoff: "ReAct 适应性强但 token 消耗大、易陷入循环；ReWOO 省 token 但不适应中途变化。",
        pitfalls: ["只会说「思考行动观察循环」说不出工程约束", "不知道 ReWOO"],
      },
      ev: [],
      rel: ["02-AI-Agent开发/ReAct与Agent设计模式.md", "00-小白课堂/小白课-ReAct思考行动循环.md"],
      src: ["字节深挖 ReAct 细节"],
    },
    {
      id: "ag-03", role: "agent-app", mod: "agent", freq: "high", lv: 2,
      q: "工具调用陷入死循环怎么办？",
      probes: [
        "最大迭代数设多少合适？",
        "怎么检测循环？",
        "超时和重试怎么配合？",
        "降级兜底怎么做？",
      ],
      frame: {
        claim: "四层防线：最大迭代数（10-20）+ 循环检测 + 超时重试 + 降级兜底。",
        why: [
          "迭代上限是硬保险丝，防止无限消耗 token",
          "循环检测：比对相邻轮次的 action 参数是否高度相似（完全相同的工具+参数重复出现即打断）",
          "超时与重试：单次工具调用超时后有限重试，重试仍失败则告知模型换策略",
          "降级兜底：工具不可用时切换到更弱但可用的路径，或转人工、明确拒答",
        ],
        practice: "这题是字节高频，答案必须体现「生产化视角」——初级讲怎么实现，高级讲怎么不出事。",
        tradeoff: "迭代上限设太小会误杀正常多步任务；设太大则单次请求成本不可控。",
        pitfalls: ["只说「设置最大轮数」", "没有兜底方案（拒答/转人工/降级）"],
      },
      ev: [],
      rel: ["02-AI-Agent开发/工具调用实战.md", "02-AI-Agent开发/Agent评估与调试.md"],
      src: ["字节高频（工具调用死循环）"],
    },
    {
      id: "ag-04", role: "agent-app", mod: "agent", freq: "high", lv: 3,
      q: "Agent 架构有哪几种格式？分别举例子。",
      probes: [
        "Router、ReAct、Plan-and-Execute 的差别？",
        "层级式 Multi-Agent 和协作式 Multi-Agent 怎么选？",
        "什么时候**不该**用 Multi-Agent？",
      ],
      frame: {
        claim: "七种：确定性 Workflow / Router 路由 / ReAct 单 Agent / Plan-and-Execute / Reflection 反思 / 层级式 Multi-Agent（Supervisor-Worker）/ 协作式 Multi-Agent（群聊、流水线、辩论）。",
        why: [
          "Workflow：LangGraph 状态图、Dify/扣子工作流、n8n",
          "Router：智能客服意图分流；简单 query 走小模型、复杂走大模型",
          "ReAct：Claude Code、Cursor Agent 模式、LangChain ReAct Agent",
          "Plan-and-Execute：BabyAGI、HuggingGPT、Manus",
          "Reflection：Reflexion、Self-Refine；代码 Agent「跑测试→读报错→修复」",
          "层级式：LangGraph Supervisor、CrewAI Hierarchical、MetaGPT",
          "协作式：AutoGen GroupChat、ChatDev、CrewAI Crew",
        ],
        practice: "被要求「画一个 Agent 系统」时用三层架构：路由层 → 管理/规划层 → 执行层，再主动讲难点与护栏。",
        tradeoff: "Multi-Agent 不是银弹：有研究指出多智能体存在「稀释效应」，协调成本与失败点随 agent 数上升；先跑通单 Agent 再考虑。",
        pitfalls: ["把 Multi-Agent 当银弹，不提成本与失败点", "说不出「先反问需求边界」"],
      },
      ev: [
        {
          zh: "多智能体并非总是更好——存在信息稀释与协调损耗",
          en: "Multi-agent dilution effect",
          src: "2026-08-22 多智能体神话破灭（前沿进化）",
          url: "",
        },
      ],
      rel: ["02-AI-Agent开发/ReAct与Agent设计模式.md", "02-AI-Agent开发/CrewAI多智能体.md", "02-AI-Agent开发/LangGraph状态图.md", "11-前沿进化/2026-08-22-多智能体神话破灭.md"],
      src: ["阿里/腾讯必问"],
    },

    /* ===================== 协议生态 ===================== */
    {
      id: "pt-01", role: "agent-app", mod: "protocol", freq: "high", lv: 2,
      q: "Function Calling 的原理是什么？它和 MCP 的区别？",
      probes: [
        "schema 是怎么描述工具的？",
        "模型真的执行了函数吗？",
        "MCP 解决了 FC 的什么痛点？",
        "MCP 的 Host / Client / Server 分别是什么？",
        "A2A 又是解决什么的？",
      ],
      frame: {
        claim: "FC 是「模型输出结构化 JSON → 程序执行 → 结果回传」的机制；MCP 是把这套能力标准化的开放协议，解决 N 个模型 × M 个工具的点对点对接爆炸问题。",
        why: [
          "FC：程序把工具 schema 一起传给模型，模型返回 {name, arguments}，由程序真正执行",
          "模型本身不执行任何代码，它只做「填参数」这件事",
          "MCP 定义 Host（承载 LLM 的应用）/ Client（连接器）/ Server（能力提供方）三层，工具、资源、提示词都可暴露",
          "MCP 的价值：一次实现，所有支持 MCP 的客户端都能接——从「API 对接」升级为「endpoint 暴露」",
          "A2A：解决 Agent 与 Agent 之间如何协作（跨厂商 agent 通信）",
        ],
        practice: "能说清「万物皆 MCP endpoint」的愿景，并联系到企业集成主战场在编排层，格局就打开了。",
        tradeoff: "MCP 增加一层抽象与进程开销；工具数量极大时上下文里塞满 schema 也会挤爆窗口（需要工具检索/分组）。",
        pitfalls: ["以为模型真的执行了函数", "把 MCP 说成「一个工具库」"],
      },
      ev: [
        {
          zh: "MCP 可能是 Anthropic 迄今最重要的发布：万物皆 endpoint，数字世界可被 AI 编排",
          en: "MCP is potentially the most important thing Anthropic has released — everything becomes an endpoint",
          src: "Mike Krieger · Anthropic CPO",
          url: "https://www.lennysnewsletter.com/p/anthropics-cpo-heres-what-comes-next",
        },
      ],
      rel: ["01-名词与概念/FunctionCalling函数调用.md", "01-名词与概念/MCP模型上下文协议.md", "02-AI-Agent开发/MCP协议实战.md", "yt/03-知识专题/专题-D3-MCP与Agent编排.md"],
      src: ["腾讯偏协议，必问 MCP/A2A"],
    },

    /* ===================== 记忆与上下文 ===================== */
    {
      id: "mm-01", role: "agent-app", mod: "memory", freq: "high", lv: 2,
      q: "Agent 的记忆系统怎么设计？",
      probes: [
        "短期记忆和长期记忆分别存哪？",
        "上下文超了怎么办？",
        "为什么不能什么都往向量库里塞？",
      ],
      frame: {
        claim: "短期：对话历史 + 滑动窗口/摘要压缩；长期：向量库或文件，按需检索注入。",
        why: [
          "滑动窗口：保留最近 N 轮，简单但会丢早期关键信息",
          "摘要压缩：把早期对话摘要成一段，保留语义、压缩 token",
          "长期记忆：事实/偏好写入向量库或结构化存储，靠检索按需注入，而不是全量塞进上下文",
          "关键实体显式抽取：多轮对话里把关键实体（订单号、时间、条款）抽成结构化状态，避免失忆",
        ],
        practice: "主动提「多轮失忆」和「关键实体显式抽取」是牛客高赞答案里的加分点。",
        tradeoff: "长记忆提升连续性但增加检索噪声与延迟；摘要会丢细节。",
        pitfalls: ["只说「用向量数据库存历史」", "不考虑上下文预算"],
      },
      ev: [],
      rel: ["02-AI-Agent开发/记忆与上下文工程.md", "00-小白课堂/小白课-Agent记忆.md", "01-名词与概念/上下文窗口.md"],
      src: ["腾讯/字节"],
    },
    {
      id: "mm-02", role: "llm-algo", mod: "memory", freq: "mid", lv: 3,
      q: "为什么标称上下文很长，用到 60-70% 就开始变笨？",
      probes: [
        "lost-in-the-middle 是什么现象？",
        "位置外推不稳指什么？",
        "工程上怎么缓解？",
      ],
      frame: {
        claim: "两个原因：注意力在长上下文中间段衰减（lost-in-the-middle），以及超出训练长度的位置外推不稳。",
        why: [
          "lost-in-the-middle：模型对开头和结尾的信息利用最好，中间段recall显著下降",
          "外推：训练长度之外的位置编码分布没见过，RoPE 需要配合插值/NTK 才稳",
          "缓解：把关键信息放首尾（重排）、分级检索而不是全量灌入、必要时拆成多轮检索",
        ],
        practice: "能说出「所以我把最相关的片段放最前面」这种工程细节，说明你真调过。",
        tradeoff: "长上下文方便但贵且不准；分块检索便宜但需要更多工程。",
        pitfalls: ["以为「模型说支持 128k 就真的能用满」"],
      },
      ev: [],
      rel: ["01-名词与概念/上下文窗口.md", "02-AI-Agent开发/记忆与上下文工程.md"],
      src: ["算法岗 / 应用岗交叉题"],
    },

    /* ===================== 推理与部署 ===================== */
    {
      id: "in-01", role: "llmops", mod: "infer", freq: "high", lv: 2,
      q: "KV Cache 是什么？为什么它是推理的关键？",
      probes: [
        "没有 KV Cache 会怎样？",
        "KV Cache 为什么是显存大头？",
        "PagedAttention 解决了什么？",
      ],
      frame: {
        claim: "缓存历史 token 的 K/V 矩阵，避免每生成一个 token 都重算整个序列的注意力——这是推理加速的核心，也是显存的大头。",
        why: [
          "自回归生成是逐 token 的，没有缓存则第 t 步要重算前 t 个 token 的 K/V，复杂度爆炸",
          "有缓存后每步只算新 token，生成速度提升数量级",
          "显存占用随「序列长度 × 层数 × 头数」线性增长，长上下文时超过权重本身",
          "PagedAttention（vLLM）用分页管理 KV 显存，消除碎片、支持共享前缀，吞吐提升 3-5 倍",
        ],
        practice: "补一句「我们当时用 PagedAttention 解决显存碎片」，把追问引到自己主场。",
        tradeoff: "缓存换速度但吃显存；可用量化 KV、GQA/MQA 压缩。",
        pitfalls: ["把 KV Cache 说成「缓存模型权重」", "不知道 MQA/GQA 是为此服务的"],
      },
      ev: [],
      rel: ["01-名词与概念/训练推理与采样参数.md"],
      src: ["LLMOps 高频"],
    },
    {
      id: "in-02", role: "llmops", mod: "infer", freq: "high", lv: 3,
      q: "INT8 / INT4 / FP8 量化的差别？请报出数字。",
      probes: [
        "显存分别降多少？",
        "精度损失大概多少？",
        "FP8 的 E4M3 和 E5M2 分别用在哪？",
      ],
      frame: {
        claim: "INT8 显存约 -75%、精度损失 1-2%；INT4 约 -87.5%、损失 10-15%；FP8 是浮点格式（E4M3/E5M2），精度损失比 INT8 更低。",
        why: [
          "从 16bit 到 8bit 是减半，但工程上叠加 KV/激活的收益常表述为约 -75% 总占用",
          "INT4 压缩更狠但动态范围小，需要分组量化与缩放因子补偿",
          "FP8 保留指数位，动态范围远大于 INT，训练与推理都更友好",
          "E4M3：精度优先，适合前向权重/激活；E5M2：范围优先，适合梯度",
        ],
        practice: "面经点名：只说「位数少省显存」是雷区，必须报得出数字与格式差异。",
        tradeoff: "量化越狠越省显存、越省带宽，但精度与稳定性越差；通常 4bit 是当前实用下限。",
        pitfalls: ["说不出精度损失范围", "不知道 FP8 的两个格式名"],
      },
      ev: [],
      rel: ["01-名词与概念/训练推理与采样参数.md", "06-深度学习与名校课程/大模型训练方向.md"],
      src: ["面经点名的雷区题"],
    },
    {
      id: "in-03", role: "llmops", mod: "infer", freq: "mid", lv: 2,
      q: "推理时延优化的手段有哪些？",
      probes: [
        "continuous batching 相比静态 batching 强在哪？",
        "投机解码是什么原理？",
        "蒸馏在这里的角色？",
      ],
      frame: {
        claim: "全家桶：continuous batching + 量化 + 投机解码 + 蒸馏（+ KV Cache 优化、前缀缓存）。",
        why: [
          "continuous batching：请求级动态进出批次，不等整批完成，GPU 利用率大幅提升",
          "量化：降低显存带宽压力，decode 阶段常是带宽瓶颈",
          "投机解码：小模型草拟多个 token，大模型一次并行验证，接受则一次产出多个 token",
          "蒸馏：把大模型能力转移到小模型，从根上换更快的模型",
        ],
        practice: "能分层说「从模型侧/调度侧/内存侧分别优化」显得有条理。",
        tradeoff: "投机解码在草稿模型与大模型分布差异大时收益低甚至变慢；量化可能影响质量。",
        pitfalls: ["只答「用更快的显卡」"],
      },
      ev: [],
      rel: ["01-名词与概念/训练推理与采样参数.md"],
      src: ["LLMOps 面经"],
    },
    {
      id: "in-04", role: "agent-app", mod: "infer", freq: "mid", lv: 2,
      q: "流式输出怎么实现？断线之后怎么恢复上下文？",
      probes: [
        "SSE 和 WebSocket 怎么选？",
        "断点续传怎么做？",
      ],
      frame: {
        claim: "流式用 SSE（单向、简单、自带重连）或 WebSocket（双向）；断线恢复靠 stream_id 持久化 + 增量缓存 + 断点续传。",
        why: [
          "SSE 基于 HTTP，适合「服务器持续推文本」这种单向场景，工程成本最低",
          "WebSocket 适合需要双向交互（如语音、实时打断）",
          "恢复：服务端保留已生成的增量内容并绑定 stream_id，客户端重连后带上 stream_id 拉取缺失片段",
        ],
        practice: "能提「前端要先渲染已收到的部分，再补差量」体现完整链路思考。",
        tradeoff: "SSE 受浏览器连接数限制；WebSocket 需要额外的心跳与鉴权设计。",
        pitfalls: ["只说「用 SSE」不说重连与续传"],
      },
      ev: [],
      rel: ["00-小白课堂/小白课-实战流式与结构化.md", "01-名词与概念/API接口.md"],
      src: ["应用岗工程题"],
    },

    /* ===================== 系统设计 / 场景题 ===================== */
    {
      id: "ds-01", role: "fde", mod: "design", freq: "high", lv: 3,
      q: "设计一个智能客服系统，核心难点在哪？",
      probes: [
        "你会怎么分层？",
        "多轮失忆怎么解决？",
        "知识库检索不到怎么办？",
        "什么时候转人工？",
        "怎么衡量它「真的在工作」？",
      ],
      frame: {
        claim: "先反问需求边界（用户是谁/解决什么/资源多少）→ 给分层架构 → 主动讲难点 → 给生产护栏。",
        why: [
          "分层：路由层（意图分类拦异常）→ FAQ 直答 → RAG 知识库（温度调低）→ 多轮任务走 Agent 状态机 + 每步确认 → 转人工兜底",
          "三大难点（主动说出来，档位立分）：多轮失忆（关键实体显式抽取）、指代消解（query 改写 + 语义校验）、情绪/风险检测",
          "转人工要带对话摘要过去，人工不用重复问——这是产品细节，最能体现产品感",
          "护栏：迭代上限、结构化输出、高风险操作 human-in-the-loop、监控告警与降级",
        ],
        practice: "牛客高赞的解法就是这条链路；一定要走到「转人工兜底 + 摘要交接」这一步。",
        tradeoff: "RAG 温度低更稳但更死板；全自动省人力但风险高，高风险场景必须留人工。",
        pitfalls: ["只画架构图不讲难点", "没有兜底方案（面经点名的硬伤）", "评估只报单一指标"],
      },
      ev: [
        {
          zh: "你怎么知道你的 AI 系统是真的在工作？",
          en: "How do you know your AI system is actually working?",
          src: "Exponent · FDE 面试指南",
          url: "https://www.tryexponent.com/",
        },
      ],
      rel: ["yt/03-知识专题/专题-A2-AI评测Evals.md", "02-AI-Agent开发/Agent核心架构.md", "08-求职面试/大厂AI面试题总览与答题方法论.md"],
      src: ["各厂都考（拉开档位的关键）"],
    },
    {
      id: "ds-02", role: "agent-app", mod: "design", freq: "high", lv: 2,
      q: "模型输出不稳定、老是幻觉，怎么治理？",
      probes: [
        "幻觉的根因是什么？",
        "为什么调低 temperature 只是缓解不是解决？",
        "引用校验怎么做？",
      ],
      frame: {
        claim: "幻觉无法根除，只能分层治理：RAG 供事实 + 引用校验 + 结构化验证 + 拒答策略。",
        why: [
          "根因：模型是概率生成器，没有「我不知道」的内在机制，且训练目标是流畅而非真实",
          "RAG 把事实从权重里挪到可验证的上下文，配合引用溯源让答案可审计",
          "结构化验证：强制 JSON schema，字段缺失/越界直接判失败重试",
          "拒答策略：检索置信度低时不答，明确说「资料中没有」——比编一个答案安全得多",
        ],
        practice: "能区分「知识型幻觉」和「推理型幻觉」给不同方案，说明你想过。",
        tradeoff: "加校验层增加延迟与失败率（保守拒答影响体验），需要按场景调阈值。",
        pitfalls: ["只答「调低 temperature」", "没有拒答与人工兜底"],
      },
      ev: [],
      rel: ["01-名词与概念/幻觉Hallucination.md", "02-AI-Agent开发/Agent评估与调试.md"],
      src: ["各厂高频"],
    },
    {
      id: "ds-03", role: "agent-app", mod: "design", freq: "mid", lv: 2,
      q: "设计一个企业文档问答系统（内部知识库 + RAG）。",
      probes: [
        "权限怎么控制？",
        "文档更新怎么同步索引？",
        "表格和扫描件怎么处理？",
      ],
      frame: {
        claim: "在标准 RAG 流水线之外，企业场景的差异全在「权限、更新、异构文档」这三件事上。",
        why: [
          "权限：检索阶段就要按用户身份过滤（元数据过滤/多租户隔离），不能检索后再靠提示词约束",
          "更新：增量索引 + 文档版本号，删除文档要同步删向量，否则会答出已废弃内容",
          "异构：表格需结构化解析成 markdown/CSV 片段，扫描件先 OCR，版式复杂时用视觉模型",
        ],
        practice: "主动提「权限必须在检索层做」，面试官会立刻知道你想过生产。",
        tradeoff: "细粒度权限增加索引复杂度；OCR/表格解析提升成本但决定上限。",
        pitfalls: ["不提权限过滤发生在哪一层"],
      },
      ev: [],
      rel: ["01-名词与概念/RAG检索增强生成.md", "01-名词与概念/数据库入门.md"],
      src: ["阿里/字节"],
    },

    /* ===================== 评估与调试 ===================== */
    {
      id: "ev-01", role: "ai-pm", mod: "evals", freq: "high", lv: 3,
      q: "你怎么知道你的 AI 系统是真的在工作？",
      probes: [
        "你会先做什么？",
        "评测集怎么建？",
        "LLM-as-judge 可信吗？",
        "每周要花多少时间？",
      ],
      frame: {
        claim: "先做人工 error analysis，再从失败模式出发建评测——评测是活的 PRD，不是一次性验收。",
        why: [
          "五步：翻真实 traces 写 open codes → 人先分类 → 理论饱和即停 → axial coding 归类失败模式 → 为每个失败模式建 code-based eval 或 LLM-as-judge",
          "LLM-as-judge 必须先用人类标注校准，不能直接信",
          "初始搭建后每周约 30 分钟——是纪律，不是重工程",
          "「95% 自动化不算自动化」：剩下 5% 的人工恰恰要靠评测找出来",
        ],
        practice: "这题答不上来（只会说「我看着还行」）在 FDE / AI PM 面试里直接挂。",
        tradeoff: "全人工标注最准但不可持续；全自动便宜但会漂移，应混合。",
        pitfalls: ["直接说「我写了个测试集」而没有 error analysis 这一步", "拿不出失败模式的具体例子"],
      },
      ev: [
        {
          zh: "评测的质量，实际上决定了 AI 产品潜力的上限",
          en: "The quality of evals effectively caps the potential of AI products",
          src: "Kevin Weil · OpenAI CPO（转述）",
          url: "https://www.lennysnewsletter.com/p/kevin-weil-open-ai",
        },
        {
          zh: "评测就是新的 PRD",
          en: "Evals are the new PRDs",
          src: "Hamel Husain / Brendan Foody",
          url: "https://www.youtube.com/watch?v=0s1fT3XeGBU",
        },
      ],
      rel: ["yt/03-知识专题/专题-A2-AI评测Evals.md", "yt/02-视频笔记/2025-09-25_HamelShreya_AI-Evals.md", "02-AI-Agent开发/Agent评估与调试.md"],
      src: ["FDE / AI PM 差异化必问"],
    },
    {
      id: "ev-02", role: "ai-pm", mod: "evals", freq: "high", lv: 2,
      q: "AI 产品的 PRD 和传统 PRD 有什么不同？",
      probes: [
        "「可接受方差」是什么意思？",
        "降级路径怎么写在需求里？",
      ],
      frame: {
        claim: "AI PRD 不写「需求」，写「意图、行为、预期失败模式」——四件套：结构化 prompt / 真实 I/O 示例 / 可接受方差 / 降级路径。",
        why: [
          "传统 PRD 假设确定性：输入 A 必得 B。AI 产品是概率系统，必须声明「多少准确率算达标」",
          "真实 I/O 示例取代抽象的「应支持…」，让工程与研究对齐",
          "可接受方差 = 评测思维的落地：定义什么算 pass",
          "降级路径：模型不确定时走哪条路（重试/兜底/转人工），必须写进需求",
        ],
        practice: "能手写一页 AI PRD 是 30 天闭环里 W2 的交付物，面试时直接拿出来。",
        tradeoff: "方差定太严产品上不了线，太松等于没标准。",
        pitfalls: ["把 AI PRD 当成传统 PRD 加一句「用大模型实现」"],
      },
      ev: [
        {
          zh: "定义「可接受方差」本身就是评测思维",
          en: "acceptable variance",
          src: "Pawel Huryn · AI PM Complete Course",
          url: "https://www.youtube.com/watch?v=IfW1FMDkw4k",
        },
      ],
      rel: ["yt/03-知识专题/专题-A2-AI评测Evals.md", "yt/02-视频笔记/2025-04-22_PawelHuryn_AI-PM-Complete-Course.md"],
      src: ["AI PM 面经"],
    },
    {
      id: "ev-03", role: "agent-app", mod: "evals", freq: "mid", lv: 2,
      q: "Agent 评估和普通 LLM 评估有什么不一样？",
      probes: [
        "多步任务怎么打分？",
        "过程对但结果错，算不算通过？",
      ],
      frame: {
        claim: "Agent 评估要评「轨迹」而不只是「最终答案」：步骤正确性、工具选择合理性、终止条件。",
        why: [
          "多步任务的最终答案可能是蒙对的；评轨迹才能定位失败模式（选错工具/参数错/循环）",
          "需要可复现的环境（工具 mock 或沙箱），否则评估不可重复",
          "指标分三层：任务成功率、平均步数/成本、单步错误率",
        ],
        practice: "能说「我们给每条轨迹打分而不是只看结果」就显得做过真 Agent。",
        tradeoff: "轨迹评估成本高（要么人工要么强模型当裁判），需要抽样。",
        pitfalls: ["套用「准确率」一个指标"],
      },
      ev: [],
      rel: ["02-AI-Agent开发/Agent评估与调试.md"],
      src: ["应用岗进阶题"],
    },

    /* ===================== 产品与商业判断 ===================== */
    {
      id: "pd-01", role: "ai-pm", mod: "product", freq: "high", lv: 2,
      q: "大模型的能力边界在哪？产品侧怎么补？",
      probes: [
        "强项和弱项分别是什么？",
        "数学和实时信息怎么补？",
        "多模态的边界在哪？",
      ],
      frame: {
        claim: "强项：生成、改写、代码、推理链条梳理；弱项：精确计算、实时事实、长程一致性。产品侧用 RAG / Agent / 微调 / 工具调用分别补。",
        why: [
          "数学与精确计算 → 调工具（计算器/代码解释器），不要让模型心算",
          "实时信息 → RAG / 搜索工具",
          "固定格式与风格 → few-shot 或微调",
          "长程任务 → Agent 拆解 + 每步确认 + 持久化状态",
        ],
        practice: "引用「锯齿状智能」这个概念，比笼统说「模型不完美」高一个档。",
        tradeoff: "每次补能力都增加复杂度与延迟，优先用最便宜的方案（提示词 > 工具 > RAG > 微调）。",
        pitfalls: ["笼统回答「模型有时会错」"],
      },
      ev: [
        {
          zh: "锯齿状智能：某些方面是超人类天才，另一些方面是笨拙的幼儿",
          en: "superhuman genius in some ways, dumb toddler in others",
          src: "Sam Altman",
          url: "https://www.youtube.com/watch?v=XDB5beon4DY",
        },
      ],
      rel: ["01-名词与概念/名词速查表.md", "yt/03-知识专题/00-知识总纲.md"],
      src: ["AI PM 面经"],
    },
    {
      id: "pd-02", role: "ai-pm", mod: "product", freq: "high", lv: 2,
      q: "RAG 和 Agent 的区别，用一句话说清楚。",
      probes: [
        "举例说明什么时候用哪个。",
      ],
      frame: {
        claim: "RAG 让 AI 记得更准，Agent 让 AI 干活更稳。",
        why: [
          "RAG 解决「知道」的问题：把外部事实送进上下文",
          "Agent 解决「做到」的问题：规划、调工具、多步执行",
          "两者常组合：Agent 在需要时调用 RAG 作为其中一个工具",
        ],
        practice: "这句话就是面试金句，答完立刻能感觉面试官满意。",
        tradeoff: "无。",
        pitfalls: ["长篇大论讲两者定义，最后没有区分句"],
      },
      ev: [],
      rel: ["01-名词与概念/RAG检索增强生成.md", "01-名词与概念/Agent智能体.md"],
      src: ["AI PM 面经高频"],
    },
    {
      id: "pd-03", role: "ai-pm", mod: "product", freq: "mid", lv: 2,
      q: "讲一个你做的 AI 落地案例，怎么衡量成功？",
      probes: [
        "分阶段指标怎么定？",
        "怎么算 ROI？",
      ],
      frame: {
        claim: "STAR 结构 + 量化数据；评估分阶段：验证期（准确率/完成率）→ 成长期（DAU/NPS）→ 成熟期（ROI/降本额）。",
        why: [
          "验证期看技术是否达标：任务成功率、人工接管率",
          "成长期看用户是否买账：DAU、留存、NPS",
          "成熟期看商业价值：ROI、节省的人力成本、转化提升",
          "没有量化数据的案例，面试官会默认是包装出来的",
        ],
        practice: "把「我们省了 3 个人力/月」这种数字准备好。",
        tradeoff: "早期指标选太商业会掩盖技术问题；选太技术则推不动资源。",
        pitfalls: ["只讲做了什么，不讲结果数字", "所有阶段用同一个指标"],
      },
      ev: [],
      rel: ["yt/03-知识专题/专题-A2-AI评测Evals.md", "08-求职面试/AI职业全景.md"],
      src: ["AI PM 面经"],
    },
    {
      id: "pd-04", role: "ai-pm", mod: "product", freq: "mid", lv: 3,
      q: "你怎么判断一个 AI 功能该不该做？",
      probes: [
        "「什么不做」你怎么决定？",
        "如果模型能力三个月后会变强，这个功能还要做吗？",
      ],
      frame: {
        claim: "用「能力边界 × 商业影响」的交集判断；同时问一句「若模型能力 +30%，这个方案要不要重做」。",
        why: [
          "能力边界：这件事在模型的锯齿分布上处于哪个位置？精度够不够支撑自动化？",
          "商业影响：解决了是不是真的有人付钱或省成本？",
          "为未来构建：如果三个月后模型原生就能做，今天的脚手架就是负债（拐杖清单）",
          "速度前提：「Is this maximally accelerated?」——还有没有更快的路径",
        ],
        practice: "这题来自 Natalie Meurer 的 discovery 交集法与 Tara 的「为未来构建」，能引原话很加分。",
        tradeoff: "做太早被模型吃掉，做太晚错过窗口；判断依据是「模型能力 +30% 是否还成立」。",
        pitfalls: ["只谈技术可行性不谈商业价值", "不考虑模型演进"],
      },
      ev: [
        {
          zh: "找「真正难的问题」和「有商业影响的问题」的交集",
          en: "the intersection between problems that are genuinely difficult and problems that will have a meaningful business impact",
          src: "Natalie Meurer · Sierra",
          url: "https://www.latent.space/p/forward-deployed-engineers-aiewf",
        },
      ],
      rel: ["yt/02-视频笔记/2026-08-30_TaraSeshan_Persistent-AI-Coworkers.md", "yt/04-职业路径/01-高级PM成长路线.md"],
      src: ["AI PM / FDE 交叉题"],
    },

    /* ===================== FDE ===================== */
    {
      id: "fd-01", role: "fde", mod: "fde", freq: "high", lv: 2,
      q: "FDE 是什么？它和解决方案工程师、售前有什么区别？",
      probes: [
        "为什么要驻场？",
        "你们按什么计费？",
        "和 PM 的关系？",
      ],
      frame: {
        claim: "FDE（Forward Deployed Engineer）是为客户结果端到端负责的工程师：发现需求 → 界定范围 → 设计系统 → 亲手交付上线；解决方案岗偏售前（写方案 + 演示），FDE 偏交付（真写代码、真上线）。",
        why: [
          "起源 Palantir：工程师被物理部署到客户现场，最早的活是「别让平台倒下」",
          "OpenAI 口径：discovery / scoping / system design / build / production rollout，用 eval-driven feedback 衡量",
          "Sierra 叫 Agent Engineer = 系统集成 + Agent 开发 + 客户运营与产品理解",
          "代码变便宜后，剩下的价值是翻译模糊问题 + 可靠部署 + 对结果负责",
          "定价即信号：按席位=卖工具，按用量=卖运行，按结果=卖 outcome——越靠右角色越真",
        ],
        practice: "反问你面试官「你们团队对什么指标负责」，是 FDE 面试最漂亮的一手。",
        tradeoff: "驻场带来理解深度但牺牲产品专注与生活质量（约 25% 出差）。",
        pitfalls: ["把 F 说成 Front-End", "把 FDE 说成「客服 + 写点代码」"],
      },
      ev: [
        {
          zh: "这个角色的定义，更多来自对客户的问责，而不是工作的形状",
          en: "more clearly defined by accountability to customers than by the shape of the role",
          src: "Natalie Meurer · Sierra",
          url: "https://www.latent.space/p/forward-deployed-engineers-aiewf",
        },
        {
          zh: "Agent engineering 是 FDE 的重生",
          en: "Agent engineering is FDE reborn",
          src: "Natalie Meurer · Sierra",
          url: "https://www.youtube.com/watch?v=Byv311hdoHE",
        },
      ],
      rel: ["yt/03-知识专题/专题-C1-FDE角色认知.md", "yt/04-职业路径/02-FDE转型路线.md", "08-求职面试/AI职业全景.md"],
      src: ["FDE 面试开场题"],
    },
    {
      id: "fd-02", role: "fde", mod: "fde", freq: "high", lv: 3,
      q: "客户有 5PB 数据，要求 48 小时内上云，你怎么做？",
      probes: [
        "瓶颈在哪？",
        "先传数据还是先建 schema？",
        "48 小时不现实怎么办？",
      ],
      frame: {
        claim: "先识别瓶颈是带宽而不是算力，再用物理搬运（appliance）+ 传输途中建 schema 的方案；同时要敢于把「48 小时不现实」讲清楚并给替代交付。",
        why: [
          "5PB 走公网：按 1Gbps 带宽算需要数年——所以结论必然是物理搬运，不是「开更大的带宽」",
          "物理 appliance：把数据拷贝到设备上，卡车运到云厂商，再由云厂商导入",
          "传输途中并行建 schema：不能等数据到齐才开工",
          "FDE 的核心动作是 clarify before solving：先问清楚 48 小时的来源、能不能分批、最关键的 5% 数据是哪部分",
        ],
        practice: "这题考的不是技术答案是「先澄清再解决」的习惯——上来就给方案的人已经输了。",
        tradeoff: "物理搬运快但合规/安全审批复杂；分批上云慢但可控。",
        pitfalls: ["直接答「买更大的带宽」", "不质疑需求合理性的前提下硬承诺"],
      },
      ev: [
        {
          zh: "每一轮面试都在模拟日常：先澄清再解决、出声拆解、用商业语言解释",
          en: "clarify before solving → decompose out loud → business language",
          src: "FDE 面试共识（Tech With Tim / 面经）",
          url: "https://www.youtube.com/watch?v=vLlIBT0HSSc",
        },
      ],
      rel: ["yt/04-职业路径/02-FDE转型路线.md", "08-求职面试/大厂AI面试题总览与答题方法论.md"],
      src: ["Exponent / IGotAnOffer FDE 常见 curveball"],
    },
    {
      id: "fd-03", role: "fde", mod: "fde", freq: "high", lv: 3,
      q: "三桶技能栈是什么？你现在最弱的是哪一桶？",
      probes: [
        "为什么软件工程那一桶不可协商？",
        "客户/软技能为什么能算技能？",
      ],
      frame: {
        claim: "① 真软件工程（Python/API/SQL/测试/系统设计，不可跳）② AI 工程（LLM/RAG/Agent/Evals）③ 客户与软技能（澄清、出声拆解、商业语言）。",
        why: [
          "第一桶决定你能不能独立交付生产级代码——没有它，第二桶的框架知识只是玩具",
          "第二桶是差异化：会 RAG 的人多，会用 evals 证明系统在工作的人少",
          "第三桶是 PM 的迁移资产：把客户口语需求翻译成技术方案",
          "最弱的一桶决定你的天花板——诚实承认并给出补强计划，比假装全会加分",
        ],
        practice: "被问最弱桶时，别说「都还行」；给一个具体短板 + 两周补强计划。",
        tradeoff: "三桶并行成长慢但抗风险；专精一桶快但容易被替代。",
        pitfalls: ["只谈技术桶，忽略客户桶", "说不出自己最弱在哪"],
      },
      ev: [
        {
          zh: "当写代码变便宜，通才会变得更有价值",
          en: "generalists will become more valuable",
          src: "Natalie Meurer · Sierra",
          url: "https://www.latent.space/p/forward-deployed-engineers-aiewf",
        },
      ],
      rel: ["yt/02-视频笔记/2026-08-14_TechWithTim_FDE-2026.md", "yt/03-知识专题/专题-C1-FDE角色认知.md"],
      src: ["Tech With Tim FDE 2026"],
    },
    {
      id: "fd-04", role: "fde", mod: "fde", freq: "mid", lv: 3,
      q: "为企业客户设计一套 Agent 交付方案，你怎么做 scoping 和验收？",
      probes: [
        "范围怎么界定？",
        "交付周期大概多久？",
        "验收标准谁定？",
        "定制发生在哪一层？",
      ],
      frame: {
        claim: "用「难 × 有商业影响」的交集选题；用 journeys 拆分子任务；用 eval-driven feedback 定义验收；定制主要发生在编排层而非模型层。",
        why: [
          "Scoping：找「真正难」且「有商业影响」的交集，情感强度高的流程优先",
          "架构：agent = 编排的模型星座；单一 agent 管全程交互，子任务叫 journeys",
          "交付节奏：大企业最快 40-60 天上生产；围绕客户 API、SOP、品牌语调定制",
          "验收：与客户「共同定义成功」——把 eval 指标写进合同，而不是承诺功能清单",
        ],
        practice: "引用「orchestrated constellation of models」和「journeys」这两个术语，立刻显示你读过一手材料。",
        tradeoff: "定制越深越贴合但越难产品化；journeys 拆分粒度影响复用性。",
        pitfalls: ["一上来就讲模型选型", "验收标准由乙方单方面定"],
      },
      ev: [
        {
          zh: "一个被编排的模型星座；子任务叫 journeys；大组织最快 40-60 天上生产",
          en: "an orchestrated constellation of models / We call those subtasks journeys / reach production in as little as 40 to 60 days",
          src: "Natalie Meurer · Sierra",
          url: "https://www.latent.space/p/forward-deployed-engineers-aiewf",
        },
      ],
      rel: ["yt/03-知识专题/专题-D3-MCP与Agent编排.md", "yt/02-视频笔记/2026-08-23_JenAbel_企业级成交.md", "yt/04-职业路径/02-FDE转型路线.md"],
      src: ["Palantir 模拟客户互动轮 / OpenAI take-home"],
    },

    /* ===================== 行为面 ===================== */
    {
      id: "bh-01", role: "agent-app", mod: "behavior", freq: "high", lv: 2,
      q: "说说你项目里最难的一个技术问题，你怎么解决的？",
      probes: [
        "为什么这个问题难？",
        "你还试过什么方案？为什么不行？",
        "如果重做你会怎么做？",
        "这个过程你怎么验证有效？",
      ],
      frame: {
        claim: "好答案的结构固定：原理一句话 → 我项目里遇到过 → 我怎么解决的 → 数据变化多少。",
        why: [
          "考察逻辑已经从「知道」变成「做过」——面试官一追问细节就露馅",
          "「还试过什么方案」考的是判断力与技术广度",
          "「怎么验证」考的是有没有评测意识（这是最容易被忽略、也最容易加分的一环）",
          "「重做会怎么做」考反思能力",
        ],
        practice: "每层回答留一个你熟的延伸钩子，把追问引向你的主场。",
        tradeoff: "无。",
        pitfalls: ["讲成了技术科普，没有「我」的角色", "说不出量化结果与验证方式"],
      },
      ev: [],
      rel: ["08-求职面试/大厂AI面试题总览与答题方法论.md"],
      src: ["各厂通用"],
    },
    {
      id: "bh-02", role: "fde", mod: "behavior", freq: "mid", lv: 2,
      q: "讲一次你和跨职能团队（或客户）产生技术分歧的经历，你怎么推动的？",
      probes: [
        "你最后是说服了对方还是妥协了？",
        "如果对方是客户方的技术负责人呢？",
      ],
      frame: {
        claim: "用商业语言而非工程术语解释取舍，把分歧转化为「对同一个目标的两种路径」，并用数据/原型把讨论从立场拉回事实。",
        why: [
          "FDE 的日常就是跨职能推动，这题在测你像不像一个 FDE",
          "用原型说话比用 PPT 说话有效——「我先做了个 15 分钟的 demo 给对方看」是高赞答案",
          "必要时接受妥协，但要留下可回滚的设计",
        ],
        practice: "能说出「我把技术方案翻译成了他们的 KPI」就很到位。",
        tradeoff: "硬推伤关系，全妥协失去价值；折中是给出可验证的小范围试验。",
        pitfalls: ["讲成「我说服了他们」的单方面叙事", "全是工程术语，没有商业语言"],
      },
      ev: [],
      rel: ["yt/02-视频笔记/2026-08-23_JenAbel_企业级成交.md", "yt/04-职业路径/02-FDE转型路线.md"],
      src: ["FDE 行为面常问"],
    },
  ],
};
