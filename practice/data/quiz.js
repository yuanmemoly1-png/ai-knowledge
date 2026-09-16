// AI 冒险岛 · 练习场 —— 复习中心题库
// 题目内容全部提炼自知识库笔记（01-名词与概念/、08-求职面试/），explain 为思路讲解，note 为关联笔记名
// 结构约定（由 .verify_quiz.py 校验）：
//   QUIZ_TOPICS: {id, title, icon, note, questions: [{q, type, options?, answer, explain, note}]}
//     type: "choice"（answer 必须是 options 之一）| "judge"（answer 为 true/false）| "fill"（answer 为字符串）
//   CAREER_QUESTIONS: {career, icon, items: [{q, guide: {考点, 答题框架, 加分句, 避坑}}]}

const QUIZ_TOPICS = [
  {
    id: "prompt-eng",
    title: "提示词工程",
    icon: "✍️",
    note: "Prompt与提示词工程",
    questions: [
      {
        q: "调用 Chat API 时，三种消息角色中优先级最高、用来设定模型身份和规则的是哪个？",
        type: "choice",
        options: ["system", "user", "assistant", "tool"],
        answer: "system",
        explain: "system 相当于给员工的岗位说明书：身份、语气、格式、禁忌都放这里；user 是客户的具体需求；assistant 是模型之前说过的话。通用要求放 system、具体问题放 user，效果和稳定性远好于全堆在 user 里。",
        note: "Prompt与提示词工程"
      },
      {
        q: "判断：把通用要求（身份、格式、禁忌）放进 system，具体问题放在 user，效果和稳定性比全堆在 user 里更好。",
        type: "judge",
        answer: true,
        explain: "对。system 提示词是杠杆——通用约束放 system 不会被用户输入冲掉，模型遵循得更稳定。",
        note: "Prompt与提示词工程"
      },
      {
        q: "任务对输出格式要求严格（比如特定的情绪分类格式），最可靠的做法是？",
        type: "choice",
        options: [
          "用 few-shot：在 Prompt 里给几个「输入→输出」示例让模型模仿",
          "在 Prompt 里写「请认真一点」",
          "把 temperature 调到 1.0 以上",
          "反复重试直到格式正确"
        ],
        answer: "用 few-shot：在 Prompt 里给几个「输入→输出」示例让模型模仿",
        explain: "few-shot 示例比抽象描述格式更可靠——模型会模仿例子的风格和格式。记忆钩子：「给示例 > 讲道理」。",
        note: "Prompt与提示词工程"
      },
      {
        q: "在 Prompt 末尾加一句「让我们一步一步思考」，属于什么技巧？",
        type: "choice",
        options: ["CoT 思维链", "few-shot 少样本", "RAG 检索增强", "结构化输出"],
        answer: "CoT 思维链",
        explain: "Chain-of-Thought：让模型先写推理过程再给答案，对数学、逻辑、多步推理提升显著。注意 DeepSeek-R1、o 系列等推理模型内置了思维链，不需要手写这句咒语。",
        note: "Prompt与提示词工程"
      },
      {
        q: "填空：控制模型采样随机性的参数叫______（事实类任务建议调低到 0~0.3，创意类可调高）。",
        type: "fill",
        answer: "temperature",
        explain: "temperature 越低越保守（总选最可能的词），越高越有创造性。事实问答、代码、抽取用 0~0.3；写作、头脑风暴用 0.7~1.0。",
        note: "Prompt与提示词工程"
      },
      {
        q: "「零样本」（Zero-shot）提示适合什么样的任务？",
        type: "choice",
        options: [
          "简单、常见的任务：直接下指令，不给例子",
          "格式要求极严格的任务",
          "风格非常特殊的任务",
          "任何任务都必须零样本"
        ],
        answer: "简单、常见的任务：直接下指令，不给例子",
        explain: "零样本 = 直接下指令不给例子，适合简单常见任务；格式严格或风格特殊的任务用少样本（few-shot）更可靠。记忆钩子：「简单零样本，讲究给示例」。",
        note: "Prompt与提示词工程"
      },
      {
        q: "多轮对话中，assistant 角色的消息是从哪来的？",
        type: "choice",
        options: [
          "由你把模型之前的回复原样回传进 messages",
          "模型自动记住并附带的",
          "API 服务端替你存的",
          "assistant 消息不需要出现在多轮对话里"
        ],
        answer: "由你把模型之前的回复原样回传进 messages",
        explain: "模型没有任何记忆——你感觉它记得，是因为客户端每轮都把整段历史（包括它之前的回复）重新发了一遍。这也是「上下文窗口」和「遗忘」问题的根源。",
        note: "Prompt与提示词工程"
      },
      {
        q: "判断：把模型答错的案例收集起来、补充进 Prompt，是提示词迭代优化的常用手段。",
        type: "judge",
        answer: true,
        explain: "对。十条高频技巧之一：迭代优化——badcase 是最好的 Prompt 素材，哪里答错就把纠正示例补进 Prompt，比凭空想象模型会怎么错有效得多。",
        note: "Prompt与提示词工程"
      },
      {
        q: "需要模型输出稳定、可复现（比如信息提取、分类任务），temperature 应该怎么调？",
        type: "choice",
        options: ["调低到 0~0.3", "调高到 0.8~1.0", "调到 1.0 以上", "temperature 不影响稳定性"],
        answer: "调低到 0~0.3",
        explain: "低温让模型几乎总选概率最高的词，输出稳定可复现——信息提取、分类、代码、事实问答都用低温；要创意才调高。记忆钩子：「求稳调低，求活调高」。",
        note: "训练推理与采样参数"
      },
      {
        q: "想让模型输出的 JSON 能被程序稳定解析，除了在 Prompt 里要求之外，还可以怎么做？",
        type: "choice",
        options: [
          "设置 response_format={\"type\": \"json_object\"} 强制 JSON 模式",
          "在 Prompt 里连写三遍「一定要 JSON」",
          "把 temperature 调到 2.0",
          "没有别的办法，只能祈祷"
        ],
        answer: "设置 response_format={\"type\": \"json_object\"} 强制 JSON 模式",
        explain: "结构化输出是 Function Calling 和 Agent 开发的基础：Prompt 里写清「只输出 JSON，不要输出任何其他文字」，再用 response_format 强制 JSON 模式双保险。",
        note: "Prompt与提示词工程"
      },
      {
        q: "把参考资料贴进 Prompt 时，为防止模型把指令和资料混淆，推荐的做法是？",
        type: "choice",
        options: [
          "用 ``` 或 ### 等分隔符把指令和资料隔开",
          "把资料和指令混写在同一段里",
          "全部用大写字母写资料",
          "在资料里插表情符号"
        ],
        answer: "用 ``` 或 ### 等分隔符把指令和资料隔开",
        explain: "分隔符是十条高频技巧之一：用 ``` 或 ### 把指令和资料隔开，模型才不会把资料里的句子当成新指令执行。这也是防御「提示注入」的基本功。",
        note: "Prompt与提示词工程"
      },
      {
        q: "判断：DeepSeek-R1、OpenAI o 系列等推理模型，必须在 Prompt 里手写「让我们一步一步思考」才能拥有思维链能力。",
        type: "judge",
        answer: false,
        explain: "错。推理模型内置了思维链能力，不需要手写 CoT 提示；但普通模型加上 CoT 仍能明显改善复杂任务表现。记忆钩子：「推理模型自带草稿纸，普通模型要提醒它打草稿」。",
        note: "Prompt与提示词工程"
      }
    ]
  },
  {
    id: "token",
    title: "Token与计费",
    icon: "🪙",
    note: "Token与分词",
    questions: [
      {
        q: "大模型处理文本的最小单位是什么？",
        type: "choice",
        options: ["Token（词元）", "汉字", "单词", "字节"],
        answer: "Token（词元）",
        explain: "模型看到的不是「字」或「词」，而是 token 序列。分词器（Tokenizer）把文本切成 token，再映射成数字 ID。",
        note: "Token与分词"
      },
      {
        q: "按经验换算，1000 个 token 大约等于多少英文单词？",
        type: "choice",
        options: ["约 750 词", "约 100 词", "约 2000 词", "约 10000 词"],
        answer: "约 750 词",
        explain: "经验法则：英文 1 token ≈ 0.75 个单词；中文 1 个汉字通常占 1-2 个 token，比英文「贵」。",
        note: "Token与分词"
      },
      {
        q: "判断：同样一段内容，用中文表达通常比英文消耗更多 token。",
        type: "judge",
        answer: true,
        explain: "对。中文语料在训练集中占比远低于英文，分词器对中文的「压缩率」更差——一个汉字常占 1-2 个 token，标点和空格也各占 token。",
        note: "Token与分词"
      },
      {
        q: "关于 LLM API 计费，下面哪个说法正确？",
        type: "choice",
        options: [
          "按 token 计费，输入和输出分别计价，输出通常更贵",
          "按调用次数收固定费用",
          "只按输入 token 计费，输出免费",
          "按汉字字数计费"
        ],
        answer: "按 token 计费，输入和输出分别计价，输出通常更贵",
        explain: "token 有两个直接影响：① 费用——输入输出分别计价且输出更贵，中文内容更烧钱；② 上下文长度——窗口按 token 算，超限会被截断或报错。",
        note: "Token与分词"
      },
      {
        q: "填空：OpenAI 官方的分词库叫______，可以在调用 API 前预估 token 数和费用。",
        type: "fill",
        answer: "tiktoken",
        explain: "pip install tiktoken 后，用 enc.encode(text) 数 token。写 RAG 或长文档程序时先数 token 再决定切分粒度，避免超出上下文窗口。",
        note: "Token与分词"
      },
      {
        q: "BPE（字节对编码）训练分词器时的核心操作是什么？",
        type: "choice",
        options: [
          "统计语料中出现频率最高的相邻 token 对，把它们合并成一个新 token，重复数万次",
          "按字典把所有单词收录进词表",
          "每个汉字固定对应一个 token",
          "随机切分文本"
        ],
        answer: "统计语料中出现频率最高的相邻 token 对，把它们合并成一个新 token，重复数万次",
        explain: "BPE 先把文本拆成最小单位（字节/单字符），再反复合并最高频的相邻对，最终得到固定大小的词表（GPT-4 约 10 万个 token）。好处：常见词是单个 token 处理高效，生僻词能拆成常见片段。",
        note: "Token与分词"
      },
      {
        q: "判断：BPE 分词的好处之一是生僻词也能拆成常见片段（如 unbelievable → un + belie + vable），不会出现「未知词」。",
        type: "judge",
        answer: true,
        explain: "对。这是 BPE 相对「固定词表」方案的关键优势：再生的词也能用已知片段拼出来，词表大小固定、模型词表层参数量可控。",
        note: "Token与分词"
      },
      {
        q: "关于 token 与上下文窗口，哪个说法正确？",
        type: "choice",
        options: [
          "上下文窗口按 token 计算，超过上限的内容会被截断或报错",
          "上下文窗口按字数计算",
          "token 只影响费用，不影响长度限制",
          "超过窗口只会变慢，不会丢内容"
        ],
        answer: "上下文窗口按 token 计算，超过上限的内容会被截断或报错",
        explain: "token 的两个直接影响：① 费用——按 token 计费且输出更贵；② 上下文长度——窗口按 token 算，超限截断或报 context_length_exceeded。",
        note: "Token与分词"
      },
      {
        q: "填空：gpt-4o / gpt-4o-mini 使用的分词编码名称是______（格式：oxxxk_base）。",
        type: "fill",
        answer: "o200k_base",
        explain: "gpt-4o 系列用 o200k_base，更早的模型用 cl100k_base。也可以用 tiktoken.encoding_for_model(\"gpt-4o-mini\") 按模型名自动匹配编码，不用死记。",
        note: "Token与分词"
      },
      {
        q: "写 RAG 或长文档处理程序时，决定切分粒度之前的正确动作是？",
        type: "choice",
        options: [
          "先用 tiktoken 统计每段文本的 token 数",
          "凭感觉按 500 字一刀切",
          "直接全部塞进去再说",
          "先训练一个自己的分词器"
        ],
        answer: "先用 tiktoken 统计每段文本的 token 数",
        explain: "实战建议：先数 token 再定切分粒度，避免超出上下文窗口。块太大浪费窗口，太小丢上下文——数字说了算，不靠感觉。",
        note: "Token与分词"
      },
      {
        q: "判断：在中文文本里，标点和空格不消耗 token，可以忽略不计。",
        type: "judge",
        answer: false,
        explain: "错。标点、空格也各占 token，中英混合、代码、表情符号的切分方式还可能出乎意料。做成本估算时这些都得算进去。",
        note: "Token与分词"
      },
      {
        q: "GPT-4 的分词器词表大约包含多少个 token？",
        type: "choice",
        options: ["约 10 万个", "约 100 个", "约 1000 个", "约 1000 万个"],
        answer: "约 10 万个",
        explain: "BPE 重复合并数万次后得到固定大小的词表，GPT-4 约 10 万个 token。词表固定意味着模型词表层的参数量可控——太大浪费参数，太小切得太碎。",
        note: "Token与分词"
      }
    ]
  },
  {
    id: "llm",
    title: "LLM本质",
    icon: "🧠",
    note: "LLM大语言模型",
    questions: [
      {
        q: "LLM 的核心能力是什么？",
        type: "choice",
        options: [
          "根据上文预测下一个 token",
          "在事实数据库里精确查询",
          "真正理解人类意识",
          "主动执行任务"
        ],
        answer: "根据上文预测下一个 token",
        explain: "LLM 是「超级接龙机」：给它一段文字，它计算接下来最可能出现的词，一个接一个生成就形成了回答。翻译、写作、推理等通用能力是这个简单能力在千亿参数规模下「涌现」出来的。",
        note: "LLM大语言模型"
      },
      {
        q: "判断：LLM 本质上是一个事实数据库，训练过的知识都能准确取出来。",
        type: "judge",
        answer: false,
        explain: "错。模型学的是语言的统计规律，不是事实数据库——训练数据里没有可靠答案时，它不会停下来，而是按「最像正确答案的样子」继续编，这就是幻觉的根源。",
        note: "LLM大语言模型"
      },
      {
        q: "2017 年 Google 论文《Attention Is All You Need》提出了什么架构，成为之后所有主流 LLM 的地基？",
        type: "choice",
        options: ["Transformer", "CNN", "RNN", "MoE"],
        answer: "Transformer",
        explain: "Transformer 用 Self-Attention 让模型处理每个词时都能「看到」整段上下文，并且可以大规模并行训练。GPT、Claude、Qwen、Llama 全部建立在它之上。",
        note: "LLM大语言模型"
      },
      {
        q: "下列哪项属于裸 LLM 的硬限制？",
        type: "choice",
        options: [
          "无法主动行动，只会输出文字",
          "完全不能写代码",
          "完全不能做翻译",
          "不能处理任何中文"
        ],
        answer: "无法主动行动，只会输出文字",
        explain: "裸模型只会输出文字，要「做事」得靠 Agent 和 Function Calling 接工具。它的其他边界：会编造事实（幻觉）、知识有截止日期（需 RAG）、上下文有限。",
        note: "LLM大语言模型"
      },
      {
        q: "ChatGPT 是哪一年发布的，让 LLM 进入大众视野？",
        type: "choice",
        options: ["2022 年", "2017 年", "2020 年", "2025 年"],
        answer: "2022 年",
        explain: "2022 年 11 月 ChatGPT 发布，靠 RLHF 对齐 + 对话形态出圈。时间线记忆：2017 Transformer → 2020 GPT-3（规模即能力）→ 2022 ChatGPT → 2024-2025 推理模型兴起。",
        note: "LLM大语言模型"
      },
      {
        q: "2020 年 GPT-3（1750 亿参数）证明了什么？",
        type: "choice",
        options: [
          "「规模即能力」，少样本（few-shot）学习成为可能",
          "小模型比大模型更好",
          "Transformer 架构被推翻",
          "LLM 不再需要训练数据"
        ],
        answer: "「规模即能力」，少样本（few-shot）学习成为可能",
        explain: "GPT-3 用 1750 亿参数证明：参数规模上去后，模型不做针对性训练也能靠几个示例完成新任务——这就是「涌现」。记忆钩子：量变引起质变。",
        note: "LLM大语言模型"
      },
      {
        q: "2024-2025 年 DeepSeek-R1、OpenAI o 系列推理模型的兴起，代表了什么新范式？",
        type: "choice",
        options: [
          "推理时计算（inference-time compute）：让模型「多想一会儿」再回答",
          "完全放弃预训练",
          "只用小模型",
          "用规则引擎替代神经网络"
        ],
        answer: "推理时计算（inference-time compute）：让模型「多想一会儿」再回答",
        explain: "「思考型」模型内置思维链，在回答前先做长推理——把更多计算花在推理阶段而非只堆训练。这是 2024-2025 的重要转向。",
        note: "LLM大语言模型"
      },
      {
        q: "需要私有化部署或二次训练时，应该选哪类模型？",
        type: "choice",
        options: [
          "Qwen、Llama 这类开源权重模型",
          "GPT 系列闭源模型",
          "Claude 系列闭源模型",
          "闭源模型也能私有化部署"
        ],
        answer: "Qwen、Llama 这类开源权重模型",
        explain: "开源权重模型（DeepSeek、Qwen、Llama）才能下载权重自己部署、自己微调；闭源模型只能调 API。选型建议：入门学习直接用 API 调闭源模型，要私有化/二次训练再考虑开源。",
        note: "LLM大语言模型"
      },
      {
        q: "判断：普通开发者调用 API 时做的是「推理」，Prompt 和参数只作用在推理阶段，不会反过来改变模型本身。",
        type: "judge",
        answer: true,
        explain: "对。训练 = 上学读书（厂商烧天价 GPU 调参数），推理 = 上考场答题（你每次调 API）。模型参数在推理时固定不动——你以为「教会了 AI」，其实它下一条请求就忘了。",
        note: "训练推理与采样参数"
      },
      {
        q: "下列哪项是 LLM 明确擅长的能力？",
        type: "choice",
        options: [
          "从长文中抽取信息、分类、情感分析",
          "保证事实 100% 正确",
          "主动操作你的电脑",
          "知道今天的新闻"
        ],
        answer: "从长文中抽取信息、分类、情感分析",
        explain: "擅长：文本生成改写、代码、结构化理解（抽取/分类/情感分析）、配合 CoT 的推理。不擅长：会编造（幻觉）、知识有截止日期、上下文有限、无法主动行动。",
        note: "LLM大语言模型"
      },
      {
        q: "用户问模型一个训练数据截止日期之后才发生的事情，模型会怎样？",
        type: "choice",
        options: [
          "不知道，可能硬编——需要 RAG 等手段补充新知识",
          "自动联网更新知识",
          "一定会明确说不知道",
          "偷偷微调自己"
        ],
        answer: "不知道，可能硬编——需要 RAG 等手段补充新知识",
        explain: "知识截止是 LLM 三大绕不开的短板之一（另两个：不懂私有知识、容易编造）。模型不知道时也可能硬答——这就是幻觉，解法是给资料（RAG）而不是信它自觉。",
        note: "LLM大语言模型"
      },
      {
        q: "关于主流开源模型 DeepSeek 系列的特点，哪个描述准确？",
        type: "choice",
        options: [
          "中文强、推理模型 R1 性价比高，适合中文应用和低成本部署",
          "闭源且只能调 API",
          "只支持英文",
          "不能私有化部署"
        ],
        answer: "中文强、推理模型 R1 性价比高，适合中文应用和低成本部署",
        explain: "主流模型速查：GPT 综合能力标杆、Claude 长文本代码强、Gemini 原生多模态超长上下文、DeepSeek 中文强性价比高、Qwen 中文生态好尺寸全、Llama 开源社区事实标准。",
        note: "LLM大语言模型"
      }
    ]
  },
  {
    id: "embedding",
    title: "Embedding",
    icon: "🧭",
    note: "Embedding向量嵌入",
    questions: [
      {
        q: "Embedding（向量嵌入）是把文本映射成什么？",
        type: "choice",
        options: [
          "一串固定长度的浮点数向量",
          "一个整数 ID",
          "一段 JSON",
          "一张图片"
        ],
        answer: "一串固定长度的浮点数向量",
        explain: "例如 768 维或 1536 维的向量。关键在于：语义相近的文本，向量在空间中的距离也近——「猫」和「狗」坐标很近，「猫」和「量子力学」很远。相当于给每段文字一个「语义坐标」。",
        note: "Embedding向量嵌入"
      },
      {
        q: "比较两个向量语义远近，最常用的指标是？",
        type: "choice",
        options: ["余弦相似度", "欧氏距离", "编辑距离", "准确率"],
        answer: "余弦相似度",
        explain: "余弦相似度计算两向量夹角的余弦值：接近 1 表示语义高度相似，接近 0 表示无关，接近 -1 表示语义相反。",
        note: "Embedding向量嵌入"
      },
      {
        q: "判断：「我喜欢吃苹果」和「我爱吃苹果」措辞不同，但 Embedding 向量会很接近。",
        type: "judge",
        answer: true,
        explain: "对。Embedding 编码的是语义而非字面——措辞不同但意思相近的句子，向量距离很近。这正是语义搜索比关键词搜索强的地方。",
        note: "Embedding向量嵌入"
      },
      {
        q: "在 RAG 系统里，Embedding 模型和 LLM 的分工是？",
        type: "choice",
        options: [
          "Embedding 负责「找得准」，LLM 负责「答得好」",
          "Embedding 负责生成答案，LLM 负责检索",
          "检索和生成都由 LLM 完成",
          "两者是同一种模型，不能替换"
        ],
        answer: "Embedding 负责「找得准」，LLM 负责「答得好」",
        explain: "建库时 Embedding 把文档块编码成向量入库；检索时把问题编码成向量找最相似的块；生成时 LLM 基于检索结果作答。两者是分工关系，可以独立替换。",
        note: "Embedding向量嵌入"
      },
      {
        q: "填空：智源开源、中文效果优秀、可本地运行的 Embedding 模型系列是______（三个字母缩写）。",
        type: "fill",
        answer: "BGE",
        explain: "BGE 系列（如 bge-large-zh）中文效果优秀且可本地运行。速览：OpenAI text-embedding-3 免部署按 token 计费；BGE/M3E 开源可本地；处理中文知识库别用纯英文模型，相似度会失真。",
        note: "Embedding向量嵌入"
      },
      {
        q: "填空：最流行的开源 Embedding 库是 ______-transformers（一行代码把句子变向量，pip install 即可）。",
        type: "fill",
        answer: "sentence",
        explain: "sentence-transformers：model = SentenceTransformer(\"paraphrase-multilingual-MiniLM-L12-v2\")，encode 一下句子就变向量。入门首选，多语言小模型开箱即用。",
        note: "Embedding向量嵌入"
      },
      {
        q: "余弦相似度接近 -1 表示什么？",
        type: "choice",
        options: [
          "语义相反（实际场景中较少出现）",
          "语义高度相似",
          "完全无关",
          "计算出错"
        ],
        answer: "语义相反（实际场景中较少出现）",
        explain: "记忆三档：接近 1 = 语义高度相似，接近 0 = 无关，接近 -1 = 语义相反。实际检索里最常用的是「越接近 1 越相关」。",
        note: "Embedding向量嵌入"
      },
      {
        q: "动手做一个语义搜索的最小原型，正确步骤是？",
        type: "choice",
        options: [
          "预先把知识库所有文档编码存起来 → 提问时编码问题 → 算相似度 → 取 Top-K 最相似文档",
          "提问时才编码所有文档",
          "用关键词逐字匹配",
          "把所有文档直接发给 LLM"
        ],
        answer: "预先把知识库所有文档编码存起来 → 提问时编码问题 → 算相似度 → 取 Top-K 最相似文档",
        explain: "这就是语义搜索的最小原型；再加一步「把检索结果喂给 LLM 生成答案」，就是完整的 RAG。文档编码是离线预计算好的，不用每次重算。",
        note: "Embedding向量嵌入"
      },
      {
        q: "判断：文本越长，Embedding 出的向量维度就越高。",
        type: "judge",
        answer: false,
        explain: "错。Embedding 把任意长度的文本映射成固定长度的向量（如 768 维、1536 维）——一句话和一篇文章出来的向量维度一样，差别在语义坐标的位置。",
        note: "Embedding向量嵌入"
      },
      {
        q: "给一个中文知识库选 Embedding 模型，下面哪个做法最危险？",
        type: "choice",
        options: [
          "用纯英文训练的 Embedding 模型处理中文，相似度计算会失真",
          "选中文效果优秀的 BGE 系列",
          "选中文轻量的 M3E",
          "选多语言的 paraphrase-multilingual 系列"
        ],
        answer: "用纯英文训练的 Embedding 模型处理中文，相似度计算会失真",
        explain: "「Embedding 模型不匹配语言」是 RAG 新手高频翻车点：英文模型处理中文知识库，相似度失真、检索质量暴跌。中文场景认准 BGE / M3E / 多语言模型。",
        note: "Embedding向量嵌入"
      },
      {
        q: "OpenAI 的 text-embedding-3-small / large 系列的特点是？",
        type: "choice",
        options: [
          "质量好、免部署、按 token 计费",
          "开源可本地运行",
          "只能处理英文",
          "免费无限用"
        ],
        answer: "质量好、免部署、按 token 计费",
        explain: "选型速查：要省心选 OpenAI API（免部署按量计费）；要本地私有化选 BGE/M3E（开源可跑在自己机器上，数据不出内网）。",
        note: "Embedding向量嵌入"
      },
      {
        q: "用「语义坐标」类比理解 Embedding，下面哪组判断是对的？",
        type: "choice",
        options: [
          "「猫」和「狗」坐标很接近，「猫」和「量子力学」坐标很远",
          "「猫」和「量子力学」坐标很接近",
          "所有文本的坐标都一样",
          "坐标远近只取决于文本长度"
        ],
        answer: "「猫」和「狗」坐标很接近，「猫」和「量子力学」坐标很远",
        explain: "Embedding 给每段文字一个「语义坐标」：猫和狗都是宠物所以近，猫和量子力学八竿子打不着所以远。机器不懂文字但懂向量运算——Embedding 就是把语义翻译成数学的桥梁。",
        note: "Embedding向量嵌入"
      }
    ]
  },
  {
    id: "rag",
    title: "RAG",
    icon: "📚",
    note: "RAG检索增强生成",
    questions: [
      {
        q: "RAG（检索增强生成）的核心思路是？",
        type: "choice",
        options: [
          "答题前先从知识库检索相关资料，连同问题一起发给模型，让它基于资料作答",
          "把所有知识通过微调灌进模型参数",
          "调高 temperature 让模型自由发挥",
          "写一个超长的 system prompt"
        ],
        answer: "答题前先从知识库检索相关资料，连同问题一起发给模型，让它基于资料作答",
        explain: "RAG = 不让模型背知识，而是答题前先「查资料」——把闭卷考试变成开卷考试。它解决 LLM 三大短板：知识截止、不懂私有知识、容易编造。",
        note: "RAG检索增强生成"
      },
      {
        q: "RAG 离线建库的正确流程顺序是？",
        type: "choice",
        options: [
          "原始文档 → 切分 chunk → 嵌入向量 → 存入向量库",
          "原始文档 → 嵌入向量 → 切分 chunk → 存入向量库",
          "原始文档 → 存入向量库 → 切分 chunk → 嵌入向量",
          "切分 chunk → 存入向量库 → 嵌入向量"
        ],
        answer: "原始文档 → 切分 chunk → 嵌入向量 → 存入向量库",
        explain: "离线建库只做一次（或增量更新）：切分 → 嵌入 → 入库。在线问答每次执行：问题向量化 → 检索 Top-K → 拼接 Prompt → LLM 生成答案。",
        note: "RAG检索增强生成"
      },
      {
        q: "检索时 Top-K 通常取多少个块比较合适？",
        type: "choice",
        options: ["3-5 个", "50 个以上", "永远只取 1 个", "越多越好"],
        answer: "3-5 个",
        explain: "Top-K 塞太多块，噪音会淹没关键信息，还浪费上下文窗口和费用；通常 3-5 块足够。记忆钩子：「检索到 ≠ 用得好」。",
        note: "RAG检索增强生成"
      },
      {
        q: "判断：RAG 是万能的，表格问答、跨文档推理、精确计算都能靠单纯向量检索搞定。",
        type: "judge",
        answer: false,
        explain: "错。表格、跨文档推理、需要精确计算的问题，单纯向量检索效果差，需要配合关键词检索（混合检索）或 Agent。别以为 RAG 万能。",
        note: "RAG检索增强生成"
      },
      {
        q: "填空：为防止模型在资料没答案时硬编，Prompt 里必须加一句兜底：「资料中没有就说______」。",
        type: "fill",
        answer: "不知道",
        explain: "没有兜底，模型照样编。这是 RAG 最常见的新手翻车点之一——务必在 Prompt 里允许模型说「不知道」。",
        note: "RAG检索增强生成"
      },
      {
        q: "RAG 主要解决 LLM 的哪三个绕不开的短板？",
        type: "choice",
        options: [
          "知识截止、不懂私有知识、容易编造（幻觉）",
          "不会写代码、不会画图、不会唱歌",
          "速度太慢、价格太贵、界面太丑",
          "不会中文、不懂数学、不能联网"
        ],
        answer: "知识截止、不懂私有知识、容易编造（幻觉）",
        explain: "三大短板：训练数据之后的时事它不知道；你公司的内部文档从未出现在训练语料里；不知道答案时也可能硬答。RAG 一招同时缓解三个——答题前先查资料。",
        note: "RAG检索增强生成"
      },
      {
        q: "切分（Chunking）长文档时，推荐的做法是？",
        type: "choice",
        options: [
          "按语义边界（段落、标题）切，并保留少量重叠",
          "按固定字符数硬切",
          "整篇文档不切直接入库",
          "每个字切一块"
        ],
        answer: "按语义边界（段落、标题）切，并保留少量重叠",
        explain: "按固定字符数硬切会把一句话拦腰切断，检索质量暴跌——这是新手高频翻车点。块太大浪费上下文窗口，太小丢上下文，按段落/标题切并保留少量重叠最稳。",
        note: "RAG检索增强生成"
      },
      {
        q: "学习、原型、小项目阶段，最合适的向量数据库是？",
        type: "choice",
        options: ["Chroma", "Milvus", "Oracle", "MySQL"],
        answer: "Chroma",
        explain: "Chroma 是嵌入式轻量库，pip 安装即用、零运维，入门最合适；数据上百万、要多机部署时再迁 Milvus。学习路径：先 Chroma 跑通，不够用再升级。",
        note: "RAG检索增强生成"
      },
      {
        q: "判断：FAISS 是一个完整的向量数据库，自带存储和元数据管理。",
        type: "judge",
        answer: false,
        explain: "错。FAISS 是 Meta 开源的向量检索「库」——极快、纯本地内存计算，但它不管存储和元数据，常作为底层引擎嵌在其他系统里。这是面试常挖坑的点：库 ≠ 数据库。",
        note: "RAG检索增强生成"
      },
      {
        q: "企业级场景：向量数据上百万条、需要多机部署，应该选？",
        type: "choice",
        options: ["Milvus", "Chroma 内存模式", "Excel", "txt 文件"],
        answer: "Milvus",
        explain: "Milvus 是分布式向量数据库，支持海量数据、生产级部署。对比记忆：Chroma 管学习和原型，FAISS 是性能引擎（库），Milvus 管企业级大规模。",
        note: "RAG检索增强生成"
      },
      {
        q: "「RAG 相当于把闭卷考试变成开卷考试」这个类比的意思是？",
        type: "choice",
        options: [
          "模型基于检索到的真实资料作答，而不是全凭记忆硬答",
          "模型可以随便抄袭",
          "考试时可以带手机",
          "模型不用训练了"
        ],
        answer: "模型基于检索到的真实资料作答，而不是全凭记忆硬答",
        explain: "核心思路：不让模型背知识，而是答题前先「查资料」——把检索到的相关内容连同问题一起发给模型，让它基于资料作答。答案有据可依，幻觉大减。",
        note: "RAG检索增强生成"
      },
      {
        q: "RAG 建库时，「入库」环节存进向量数据库的内容包括什么？",
        type: "choice",
        options: [
          "向量 + 原文 + 元数据",
          "只存向量",
          "只存原文",
          "只存问题"
        ],
        answer: "向量 + 原文 + 元数据",
        explain: "三样都要存：向量用于相似度检索，原文用于检索命中后拼进 Prompt 给模型看，元数据（来源、日期等）用于过滤和溯源。只存向量的话，检到了也拿不出原文。",
        note: "RAG检索增强生成"
      }
    ]
  },
  {
    id: "hallucination",
    title: "幻觉",
    icon: "🌀",
    note: "幻觉Hallucination",
    questions: [
      {
        q: "「幻觉」（Hallucination）指的是什么？",
        type: "choice",
        options: [
          "模型生成看起来合理、实际是编造的内容",
          "模型运行速度突然变慢",
          "模型拒绝回答任何问题",
          "模型重复同一句话"
        ],
        answer: "模型生成看起来合理、实际是编造的内容",
        explain: "典型表现：引用真实作者+编造的书名、给出格式完美但不存在的链接、调用库里根本没有的函数、对不确定的问题斩钉截铁地答错。自信和胡说不冲突。",
        note: "幻觉Hallucination"
      },
      {
        q: "判断：幻觉的根本原因是模型本质上是基于概率的下一个 token 预测器，学的是语言统计规律而非事实数据库。",
        type: "judge",
        answer: true,
        explain: "对。训练数据里没有可靠答案时，模型不会停下来，而是按「最像正确答案的样子」继续编——这就是幻觉无法 100% 消除的原因，只能按风险等级配置防御深度。",
        note: "幻觉Hallucination"
      },
      {
        q: "缓解幻觉最有效的工程手段是？",
        type: "choice",
        options: [
          "RAG：让模型基于检索到的真实文档作答",
          "换一个参数量更大的模型",
          "多和模型聊几轮",
          "在 Prompt 里加感叹号"
        ],
        answer: "RAG：让模型基于检索到的真实文档作答",
        explain: "缓解幻觉的军火库：① RAG 给参考资料（最有效）；② 强制要求引用来源；③ 调低 temperature；④ 工具程序化验证（URL 发请求、代码实际运行）；⑤ 自我反思多轮校验。",
        note: "幻觉Hallucination"
      },
      {
        q: "事实型问答任务，temperature 建议设在哪个区间？",
        type: "choice",
        options: ["0 ~ 0.3", "0.7 ~ 1.0", "大于 1.0", "完全无所谓"],
        answer: "0 ~ 0.3",
        explain: "低 temperature 让模型总选最可能的词，事实问答、代码、抽取直接压到 0；0.7~1.0 适合写作和头脑风暴；>1.0 几乎不建议用于生产。",
        note: "幻觉Hallucination"
      },
      {
        q: "判断：只要把 temperature 调到 0，就能根除幻觉。",
        type: "judge",
        answer: false,
        explain: "错。低 temperature 能明显减少编造但不能根除——模型不知道时仍会按「最像答案的样子」输出。核心认知：默认模型可能胡说，让它证明而不是让它保证；高风险场景要 RAG + 引用 + 人工复核分层设防。",
        note: "幻觉Hallucination"
      },
      {
        q: "下列哪个是幻觉的典型表现？",
        type: "choice",
        options: [
          "引用真实作者 + 编造的书名/论文标题",
          "回答前显示加载动画",
          "要求用户登录",
          "回答里出现标点符号"
        ],
        answer: "引用真实作者 + 编造的书名/论文标题",
        explain: "典型表现还有：格式完美但不存在的链接、调用库里根本没有的函数、对不确定的问题斩钉截铁地答错。共性是「看起来合理、实际是编造」——自信与胡说不冲突。",
        note: "幻觉Hallucination"
      },
      {
        q: "法律、医疗、金融这类高风险场景，推荐的防御配置是？",
        type: "choice",
        options: [
          "RAG + 引用来源 + 低 temperature + 人工复核，全部叠加",
          "只用 RAG 就够了",
          "调低 temperature 就行",
          "换个更大的模型"
        ],
        answer: "RAG + 引用来源 + 低 temperature + 人工复核，全部叠加",
        explain: "分层设防：学习笔记/草稿 → 低 temperature 即可；对外客服/知识库 → RAG + 引用来源；法律/医疗/金融 → 前面全部 + 人工复核。幻觉无法 100% 消除，按风险等级配防御深度。",
        note: "幻觉Hallucination"
      },
      {
        q: "判断：在 Prompt 里强制要求每个结论标注来源编号、没有来源就拒绝回答，能缓解幻觉。",
        type: "judge",
        answer: true,
        explain: "对。规则三件套：① 每个结论后标注来源编号如 [1]；② 资料中没有的信息回答「根据现有资料无法回答」；③ 禁止补充资料之外的任何知识。",
        note: "幻觉Hallucination"
      },
      {
        q: "模型在回答里给了一个 URL，最可靠的验证方式是？",
        type: "choice",
        options: [
          "程序实际发请求检查该 URL 是否存在",
          "看 URL 格式像不像真的",
          "再问一遍模型这个链接对不对",
          "格式完美的链接一定存在"
        ],
        answer: "程序实际发请求检查该 URL 是否存在",
        explain: "工具验证原则：对可程序化验证的输出，用工具检查而不是信模型——URL 发请求、代码实际运行、计算交给计算器。模型给出的「格式完美」恰恰是幻觉的伪装。",
        note: "幻觉Hallucination"
      },
      {
        q: "「自我反思 / 多轮校验」这种缓解幻觉的手段，主要代价是什么？",
        type: "choice",
        options: [
          "成本翻倍（要追加校验轮次），适合高价值场景",
          "完全没有代价",
          "会让模型变笨",
          "会把答案改错"
        ],
        answer: "成本翻倍（要追加校验轮次），适合高价值场景",
        explain: "做法：先回答，再追加一轮「请检查上述回答中哪些陈述无法从资料中得到证实」。多一轮调用 = 多一份 token 成本，所以只用在高价值场景。",
        note: "幻觉Hallucination"
      },
      {
        q: "填空：「幻觉」的英文术语是______（H 开头）。",
        type: "fill",
        answer: "Hallucination",
        explain: "Hallucination——模型生成看似合理实为编造的内容。记住这个英文词，读英文技术文档、面外企都用得上。",
        note: "幻觉Hallucination"
      },
      {
        q: "判断：幻觉的一大来源是随机抽样——概率分布里排第二、第三的词有时是事实错误的选项，高 temperature 给了它们「中奖」机会。",
        type: "judge",
        answer: true,
        explain: "对。压低温让模型几乎总选「最有把握」的词，编造余地更小。但注意：temperature=0 只能保证「同样输入给同样输出」，不能保证输出是对的——低温是少添乱，不是变聪明。",
        note: "训练推理与采样参数"
      }
    ]
  },
  {
    id: "context",
    title: "上下文窗口",
    icon: "🪟",
    note: "上下文窗口",
    questions: [
      {
        q: "上下文窗口（Context Window）指的是什么？",
        type: "choice",
        options: [
          "一次请求能处理的 token 总量上限，输入和输出加在一起算",
          "只限制输入的 token 数，输出不限",
          "只限制输出的 token 数",
          "模型的参数总量"
        ],
        answer: "一次请求能处理的 token 总量上限，输入和输出加在一起算",
        explain: "包括 system + 历史对话 + 当前问题 + 模型回复，加在一起不能超窗。可以把模型想象成只有一块白板的工作人员：白板写满了，再写新的就必须擦掉旧的。",
        note: "上下文窗口"
      },
      {
        q: "长对话中模型「遗忘」开头内容的根本原因是？",
        type: "choice",
        options: [
          "历史消息每轮重发，超限后最早的内容被截断丢弃",
          "模型聊累了变笨了",
          "模型故意忽略你",
          "网络延迟导致丢包"
        ],
        answer: "历史消息每轮重发，超限后最早的内容被截断丢弃",
        explain: "模型本身没有任何记忆——你觉得它记得，是因为客户端每次把整段历史重新发了一遍。超限后要么报 context_length_exceeded，要么静默丢弃最早的对话。「遗忘」不是变笨，是旧内容被挤出了白板。",
        note: "上下文窗口"
      },
      {
        q: "判断：很多模型存在「中间遗忘」现象，重要内容应放在上下文的开头或结尾。",
        type: "judge",
        answer: true,
        explain: "对。塞在上下文中部的信息召回率明显下降。另外窗口标称 128K 不代表能白用——超长上下文显著增加费用，「窗口大」不等于「用得好」。",
        note: "上下文窗口"
      },
      {
        q: "处理一本超长的书（远超上下文窗口），最经济的方式是？",
        type: "choice",
        options: [
          "用 RAG 只检索相关片段",
          "把整本书硬塞进上下文",
          "把整本书微调进模型",
          "放弃，等窗口更大的模型"
        ],
        answer: "用 RAG 只检索相关片段",
        explain: "与其塞全文，不如检索相关片段——这是对超长文档最经济的方式。其他上下文管理策略：滑动窗口+摘要、重要信息结构化外置、子任务隔离。",
        note: "上下文窗口"
      },
      {
        q: "填空：长对话管理中，只保留最近 N 轮原文、更早的对话让模型压缩成一段摘要，这个策略叫______窗口。",
        type: "fill",
        answer: "滑动",
        explain: "滑动窗口 + 摘要：recent_turns 只带最近几轮，早期对话压成 summary 放进 system。这是记忆与上下文工程的核心手法。",
        note: "上下文窗口"
      },
      {
        q: "一篇 10 万汉字的中文文档，大约会消耗多少 token？",
        type: "choice",
        options: ["约 15 万，已超出多数模型的窗口", "约 1 万", "约 3 万", "约 100 万"],
        answer: "约 15 万，已超出多数模型的窗口",
        explain: "中文 1 个汉字约 1-2 个 token，10 万字就是 15 万+ token——比很多人直觉多得多。这就是「长文档别硬塞、用 RAG 检索」的量化理由。",
        note: "上下文窗口"
      },
      {
        q: "设计系统选模型档位时，关于上下文的经验法则是？",
        type: "choice",
        options: [
          "先算账：Prompt 模板 + 检索内容 + 历史对话 + 预期输出 ≈ 多少 token，留出 20% 余量再选档位",
          "直接买最大窗口的型号",
          "窗口越小越好",
          "不用算，超了再说"
        ],
        answer: "先算账：Prompt 模板 + 检索内容 + 历史对话 + 预期输出 ≈ 多少 token，留出 20% 余量再选档位",
        explain: "窗口和费用都按 token 算——设计时先把各部分 token 量加起来估总账，留 20% 余量。拍脑袋选大窗口，账单会教你做人。",
        note: "上下文窗口"
      },
      {
        q: "Agent 执行复杂任务时，防止工具输出（网页全文、日志）撑爆窗口的推荐策略是？",
        type: "choice",
        options: [
          "子任务隔离：给每个子任务开独立上下文，只把结论带回主对话",
          "把所有工具输出原样保留",
          "禁用所有工具",
          "每轮清空全部上下文"
        ],
        answer: "子任务隔离：给每个子任务开独立上下文，只把结论带回主对话",
        explain: "子任务在独立上下文里跑（sub-agent），脏活累活的细节不污染主对话，只回传结论。配套手段：每条工具 observation 设最大长度，超限截断。",
        note: "记忆与上下文工程"
      },
      {
        q: "判断：「重要信息结构化外置」是指把用户偏好、任务状态等关键事实抽成结构化数据存到外部，每轮只注入最新状态。",
        type: "judge",
        answer: true,
        explain: "对。与其依赖模型从长对话里「记住」，不如把关键事实固化在 system prompt 或外部存储里，每轮注入最新值——历史消息会被截断，显式注入的事实不会丢。",
        note: "上下文窗口"
      },
      {
        q: "Claude 系列的上下文窗口大约是多少？",
        type: "choice",
        options: ["200K", "4K", "8K", "无限"],
        answer: "200K",
        explain: "现状速查：GPT-4o/4.1 约 128K~1M，Claude 约 200K，Gemini 1M~2M，DeepSeek 64K~128K。窗口竞赛还在继续，但「窗口大」不等于「用得好」。",
        note: "上下文窗口"
      },
      {
        q: "判断：窗口标称 128K，就可以把 128K 塞满且无代价地用。",
        type: "judge",
        answer: false,
        explain: "错。超长上下文会显著增加费用（按 token 计费），且很多模型存在「中间遗忘」——塞在中部的信息召回率明显下降，重要内容要放开头或结尾。",
        note: "上下文窗口"
      },
      {
        q: "填空：测试长上下文模型检索关键信息能力的实验，俗称「大海______」（在大海一样长的文本里找一根针）。",
        type: "fill",
        answer: "捞针",
        explain: "「大海捞针」测试（Needle In A Haystack）：把一条关键信息埋进超长文本的不同位置，看模型能不能找出来——各模型在这项能力上差异很大。",
        note: "上下文窗口"
      }
    ]
  },
  {
    id: "finetune",
    title: "微调",
    icon: "🔧",
    note: "微调Fine-tuning",
    questions: [
      {
        q: "微调与 Prompt 工程、RAG 的本质区别是？",
        type: "choice",
        options: [
          "微调改变的是模型本身的参数",
          "微调成本更低",
          "微调见效更快",
          "微调不需要任何数据"
        ],
        answer: "微调改变的是模型本身的参数",
        explain: "Prompt 和 RAG 只是「给模型更好的输入」，微调是「把模型本身改掉」——用你的数据继续训练，让行为、风格或领域能力向需求靠拢。",
        note: "微调Fine-tuning"
      },
      {
        q: "面对一个新需求，Prompt / RAG / 微调的选择顺序口诀是？",
        type: "choice",
        options: [
          "先 Prompt，再 RAG，最后才微调",
          "先微调，不行再试 Prompt",
          "先 RAG，再微调，最后 Prompt",
          "三个一起上"
        ],
        answer: "先 Prompt，再 RAG，最后才微调",
        explain: "90% 的需求前两步就能解决。微调是重武器：成本 Prompt 几乎为零、RAG 天级、微调周级。用在行为模式和风格上，别用它灌输事实知识。",
        note: "微调Fine-tuning"
      },
      {
        q: "LoRA 为什么能大幅省显存？",
        type: "choice",
        options: [
          "冻结原模型参数，只在每层旁边加一对很小的低秩矩阵，只训练这对小矩阵",
          "把模型删掉一半层",
          "用很小的数据集训练",
          "不做反向传播"
        ],
        answer: "冻结原模型参数，只在每层旁边加一对很小的低秩矩阵，只训练这对小矩阵",
        explain: "LoRA（低秩适配）把可训练参数降到原来的 0.1%-1%，消费级 24GB 显卡可微调 7B 级模型；训练产物是几十 MB 的适配器文件，可为不同任务保存多个随时切换，是当前事实标准。QLoRA 再把权重量化成 4-bit，单卡 24GB 可微调 13B-33B。",
        note: "微调Fine-tuning"
      },
      {
        q: "判断：想让模型「知道」公司最新制度和产品手册，应该用微调把这些知识灌进模型。",
        type: "judge",
        answer: false,
        explain: "错。知识更新是 RAG 的活——更新文档即可；微调灌知识既贵又会随模型更新而失效、还容易遗忘。微调用在固化行为模式、格式、风格上。",
        note: "微调Fine-tuning"
      },
      {
        q: "填空：用「指令 → 理想回答」成对数据训练、教模型按指令干活的方式叫______（三个字母缩写），个人开发者说的「微调」通常指它。",
        type: "fill",
        answer: "SFT",
        explain: "SFT（Supervised Fine-Tuning，监督微调）是 ChatGPT 类模型的第一步训练；之后的 RLHF 用人类偏好让模型「听话、无害」，近年 DPO 等是更简单的替代方案。SFT 数据集格式是 JSONL（每行一条 instruction/output）。",
        note: "微调Fine-tuning"
      },
      {
        q: "一个 7B 模型做全参数微调，大约需要多少显存？",
        type: "choice",
        options: [
          "60GB 以上，普通个人显卡完全跑不动",
          "8GB 就够了",
          "16GB 轻松拿下",
          "和推理一样只占 14GB"
        ],
        answer: "60GB 以上，普通个人显卡完全跑不动",
        explain: "显存大头不是权重（bf16 约 14GB），而是 Adam 优化器状态和梯度——合计 60GB+。这就是为什么单卡玩家都转向 LoRA/QLoRA。记忆钩子：训练显存 ≈ 推理显存的好几倍。",
        note: "AI面试八股文"
      },
      {
        q: "LoRA 能把可训练参数量降到原来的多少？",
        type: "choice",
        options: ["0.1% ~ 1%", "50%", "10% ~ 20%", "100% 都要训练"],
        answer: "0.1% ~ 1%",
        explain: "冻结原模型参数，只训练注入的低秩小矩阵——可训练参数不到 1%，消费级 24GB 显卡就能微调 7B 级模型。print_trainable_parameters() 通常显示不到 1% 的参数可训练。",
        note: "微调Fine-tuning"
      },
      {
        q: "QLoRA 相比 LoRA 多做的一步是？",
        type: "choice",
        options: [
          "把原模型权重量化成 4-bit 加载，再叠加 LoRA 训练",
          "训练两轮 LoRA",
          "用两倍的数据",
          "不冻结原参数"
        ],
        answer: "把原模型权重量化成 4-bit 加载，再叠加 LoRA 训练",
        explain: "QLoRA = 4-bit 量化 + LoRA，显存需求再降一半以上，单张 24GB 显卡可微调 13B-33B 级模型。记忆钩子：Q 就是 Quantization（量化）。",
        note: "微调Fine-tuning"
      },
      {
        q: "填空：LoRA 的全称是 Low-Rank ______（低秩适配）。",
        type: "fill",
        answer: "Adaptation",
        explain: "Low-Rank Adaptation：「低秩」指用两个小矩阵 A×B（秩 r 远小于原维度）近似权重变化；「适配」指不动原模型、只挂适配器。peft 库里常用 r=8~64。",
        note: "微调Fine-tuning"
      },
      {
        q: "RLHF 训练的第一步是先训练什么？",
        type: "choice",
        options: [
          "一个「奖励模型」，学习人类偏好（哪个回答更好）",
          "一个更大的基座模型",
          "一个分词器",
          "一个向量数据库"
        ],
        answer: "一个「奖励模型」，学习人类偏好（哪个回答更好）",
        explain: "RLHF = 先训奖励模型学人类偏好，再用强化学习让模型向高奖励方向优化。ChatGPT 变「听话、无害」主要靠它；DPO 等新方案跳过了奖励模型这一步，更简单。",
        note: "微调Fine-tuning"
      },
      {
        q: "判断：「需要模型稳定输出特定格式（如医疗病历结构化），few-shot 塞示例已撑爆上下文窗口」是值得微调的信号之一。",
        type: "judge",
        answer: true,
        explain: "对。值得微调的信号：稳定格式输出且 few-shot 撑爆窗口、独特语气/人格且服务海量请求、专业术语密集通用模型频繁误解、已有几百条以上高质量成对数据且任务模式固定。",
        note: "微调Fine-tuning"
      },
      {
        q: "客服产品需要统一的「客服腔」且要服务海量请求，为什么这时微调比长 system prompt 划算？",
        type: "choice",
        options: [
          "微调后行为固化在参数里，每次调用不用再带长 system prompt，省 token",
          "微调模型回答更快十倍",
          "system prompt 不能控制语气",
          "微调是免费的"
        ],
        answer: "微调后行为固化在参数里，每次调用不用再带长 system prompt，省 token",
        explain: "场景算账：海量请求 × 每轮重复发送的长 system prompt = 巨额 token 成本；微调一次把语气/人格固化进参数，之后每轮都省。这正是「行为模式用微调」的典型场景。",
        note: "微调Fine-tuning"
      }
    ]
  },
  {
    id: "agent",
    title: "Agent概念",
    icon: "🤖",
    note: "Agent智能体",
    questions: [
      {
        q: "Agent 的经典定义是 LLM 加上哪三个部件？",
        type: "choice",
        options: [
          "规划 + 记忆 + 工具",
          "数据库 + 前端 + 缓存",
          "微调 + 量化 + 蒸馏",
          "只需要更长的 Prompt"
        ],
        answer: "规划 + 记忆 + 工具",
        explain: "Agent = LLM（大脑）+ 规划（拆步骤）+ 记忆（记住中间结果）+ 工具（搜索、计算器、数据库，通过 Function Calling 或 MCP 接入）。",
        note: "Agent智能体"
      },
      {
        q: "Agent 和普通聊天机器人最大的区别是？",
        type: "choice",
        options: [
          "你给目标，它自主跑很多轮、调用工具、交付结果",
          "回答速度更快",
          "语气更礼貌",
          "价格更便宜"
        ],
        answer: "你给目标，它自主跑很多轮、调用工具、交付结果",
        explain: "聊天机器人给建议（「你可以这样查」），Agent 交成果（「查好了，结果如下」）。一句话：聊天机器人给答案，Agent 交结果。",
        note: "Agent智能体"
      },
      {
        q: "ReAct 模式中交替循环的三个环节是？",
        type: "choice",
        options: [
          "Thought（思考）→ Action（行动）→ Observation（观察）",
          "输入 → 输出 → 结束",
          "训练 → 验证 → 测试",
          "计划 → 复盘 → 下班"
        ],
        answer: "Thought（思考）→ Action（行动）→ Observation（观察）",
        explain: "每一轮「行动→观察」的结果追加进上下文，供下一轮规划使用——这就是 Agent 能处理开放式任务的原因：根据现实反馈动态调整计划，而不是一开始写死流程。",
        note: "Agent智能体"
      },
      {
        q: "判断：Agent 会放大模型的错误，一步错可能步步错，所以生产环境必须配步数上限、人工确认、评估监控等手段。",
        type: "judge",
        answer: true,
        explain: "对。工具调用有真实副作用（发邮件、删文件），Agent 的自主性越强越需要护栏。这是从「玩具 demo」到「生产系统」的分水岭。",
        note: "Agent智能体"
      },
      {
        q: "填空：Agent 的核心运行模式是一个______：感知 → 规划 → 行动 → 观察 → 再规划。",
        type: "fill",
        answer: "循环",
        explain: "Agent 不是一次性调用，而是「感知→规划→行动→观察→再规划」的循环，直到任务完成或达到最大步数。ReAct 就是这个循环最著名的实现。",
        note: "Agent智能体"
      },
      {
        q: "最小 Agent 骨架代码里，max_steps=10 这个参数的作用是？",
        type: "choice",
        options: [
          "硬上限：超过最大步数就强制停止，防止死循环",
          "让 Agent 跑得更快",
          "控制回答字数",
          "限制调用费用为 10 元"
        ],
        answer: "硬上限：超过最大步数就强制停止，防止死循环",
        explain: "Agent 可能陷入死循环（反复调同一个工具），模型没有可靠的内生停止机制，必须用程序硬约束。生产环境常见配置：最大迭代数 10-20 + 循环检测 + 超时重试 + 降级兜底。",
        note: "Agent智能体"
      },
      {
        q: "Cursor、Claude Code 这类编程工具属于什么形态？",
        type: "choice",
        options: ["编程 Agent", "普通聊天机器人", "编译器", "向量数据库"],
        answer: "编程 Agent",
        explain: "它们是 Agent 形态的典型代表：你给目标（修这个 Bug），它自己读文件、改代码、跑命令、看报错、再修——感知-规划-行动-观察的完整循环。",
        note: "Agent智能体"
      },
      {
        q: "判断：Agent 能处理开放式任务的关键在于——它根据现实反馈（观察结果）动态调整计划，而不是一开始就把流程写死。",
        type: "judge",
        answer: true,
        explain: "对。每轮「行动→观察」的结果追加进上下文，供下一轮规划使用。这是 Agent 和 Workflow 的本质区别：Workflow 控制流代码写死，Agent 由 LLM 自己决定下一步。",
        note: "Agent智能体"
      },
      {
        q: "关于聊天机器人和 Agent 的产出，哪个说法准确？",
        type: "choice",
        options: [
          "聊天机器人给建议（「你可以这样查」），Agent 交成果（「查好了，结果如下」）",
          "两者产出完全一样",
          "聊天机器人交付成果，Agent 只给建议",
          "Agent 只会聊天不会行动"
        ],
        answer: "聊天机器人给建议（「你可以这样查」），Agent 交成果（「查好了，结果如下」）",
        explain: "一句话记住：聊天机器人给答案，Agent 交结果。交互上：聊天机器人你问一句它答一句；Agent 你给目标它自己跑很多轮。",
        note: "Agent智能体"
      },
      {
        q: "Agent 的「工具」部件（搜索、计算器、数据库）通常通过什么机制接入？",
        type: "choice",
        options: [
          "Function Calling 或 MCP",
          "把工具代码塞进 system prompt",
          "让模型背下所有 API",
          "只能靠模型自己想象"
        ],
        answer: "Function Calling 或 MCP",
        explain: "Function Calling 是底层机制（模型输出结构化 JSON，程序执行）；MCP 是标准化的工具接入协议（写一次 Server 处处可用）。两者不冲突，MCP 可看作 FC 之上的生态层。",
        note: "Agent智能体"
      },
      {
        q: "填空：Agent = LLM（大脑）+ 规划 + 记忆 + ______。",
        type: "fill",
        answer: "工具",
        explain: "四部件经典定义：LLM 负责理解目标和推理决策；规划把大目标拆成步骤；记忆记住中间结果；工具（Tools）让 Agent 能查、能算、能操作真实系统。",
        note: "Agent智能体"
      },
      {
        q: "Anthropic 在《Building effective agents》中强调的复杂度原则是？",
        type: "choice",
        options: [
          "能用一个 LLM 调用解决的就不要上工作流，能用固定工作流解决的就不要上自主 Agent",
          "所有任务都应该上多智能体",
          "Agent 越多越好",
          "复杂度越高越先进"
        ],
        answer: "能用一个 LLM 调用解决的就不要上工作流，能用固定工作流解决的就不要上自主 Agent",
        explain: "先用最简单的方案，复杂度只在必要时引入。每多一个 Agent 就多一份 token 开销和失败点——多 Agent 不是银弹。这是架构面试的高频加分点。",
        note: "ReAct与Agent设计模式"
      }
    ]
  },
  {
    id: "function-calling",
    title: "Function Calling",
    icon: "🔌",
    note: "FunctionCalling函数调用",
    questions: [
      {
        q: "Function Calling 中，模型实际做的是什么？",
        type: "choice",
        options: [
          "决定该调哪个函数、传什么参数（输出结构化 JSON），真正执行的是你的程序",
          "直接在你的电脑上执行代码",
          "直接修改数据库",
          "自己联网查资料"
        ],
        answer: "决定该调哪个函数、传什么参数（输出结构化 JSON），真正执行的是你的程序",
        explain: "关键认知：模型从始至终没有「运行」任何代码——它只是按 schema 约束生成一段格式正确的 JSON。安全性、权限、执行逻辑全部由你的程序控制。",
        note: "FunctionCalling函数调用"
      },
      {
        q: "Function Calling 完整四步的正确顺序是？",
        type: "choice",
        options: [
          "声明工具 schema → 模型输出 JSON → 程序执行函数 → 结果回传模型生成回答",
          "程序执行函数 → 声明 schema → 模型输出 JSON → 结束",
          "模型输出 JSON → 声明 schema → 程序执行 → 丢弃结果",
          "声明 schema → 程序执行 → 模型假装知道结果"
        ],
        answer: "声明工具 schema → 模型输出 JSON → 程序执行函数 → 结果回传模型生成回答",
        explain: "① 你告诉模型有哪些函数可用（JSON Schema）；② 模型输出 {\"name\": \"get_weather\", \"arguments\": {...}}；③ 你的程序解析并真正调用；④ 结果作为新消息回传，模型生成最终自然语言回答。",
        note: "FunctionCalling函数调用"
      },
      {
        q: "判断：函数和参数的 description 要写清楚，因为模型选函数、填参数全靠它。",
        type: "judge",
        answer: true,
        explain: "对。description 就是给模型的 Prompt。配套技巧：参数加 enum 约束取值、必填参数写进 required、函数命名用动词开头（search_docs、send_email）。",
        note: "FunctionCalling函数调用"
      },
      {
        q: "想减少模型乱填参数取值，schema 里最有效的约束是？",
        type: "choice",
        options: [
          "给参数加 enum 枚举约束",
          "不写 description",
          "把所有参数都设为必填",
          "参数名故意写得模糊"
        ],
        answer: "给参数加 enum 枚举约束",
        explain: "enum 把取值限定在候选列表里（如 \"unit\": {\"enum\": [\"celsius\", \"fahrenheit\"]}），模型只能从中选择，大幅减少乱填。",
        note: "FunctionCalling函数调用"
      },
      {
        q: "填空：工具执行结果回传给模型时，这条消息的角色 role 应该填______。",
        type: "fill",
        answer: "tool",
        explain: "回传消息形如 {\"role\": \"tool\", \"tool_call_id\": call.id, \"content\": 结果JSON}。模型拿到 tool 消息后再生成最终的自然语言回答。",
        note: "FunctionCalling函数调用"
      },
      {
        q: "模型返回 tool_calls 后，程序拿到 arguments 的第一步是？",
        type: "choice",
        options: [
          "用 json.loads 把参数字符串解析成字典，再调用本地函数",
          "直接把字符串当代码执行",
          "把参数发给另一个模型",
          "忽略参数直接调函数"
        ],
        answer: "用 json.loads 把参数字符串解析成字典，再调用本地函数",
        explain: "arguments 是 JSON 字符串：args = json.loads(call.function.arguments)，然后 get_weather(**args) 真正执行。解析+执行权永远在你的程序手里。",
        note: "FunctionCalling函数调用"
      },
      {
        q: "给工具函数起名时，推荐的命名风格是？",
        type: "choice",
        options: [
          "动词开头，如 search_docs、send_email，语义更清晰",
          "中文命名，如 查天气",
          "随机字符，如 a1b2c3",
          "都用同一个名字"
        ],
        answer: "动词开头，如 search_docs、send_email，语义更清晰",
        explain: "函数名是模型选函数的重要依据——动词开头语义明确。配套三件套：description 写清楚、参数加 enum 约束、必填进 required。",
        note: "FunctionCalling函数调用"
      },
      {
        q: "判断：Function Calling 过程中，模型实际上「运行」了你提供的函数代码。",
        type: "judge",
        answer: false,
        explain: "错——这是最关键的坑。模型从始至终只是按 schema 约束生成了一段格式正确的 JSON，真正执行的是你的程序。安全性、权限、执行逻辑全部由你控制。",
        note: "FunctionCalling函数调用"
      },
      {
        q: "JSON Schema 里 \"required\": [\"city\"] 这行的作用是？",
        type: "choice",
        options: [
          "声明 city 是必填参数，模型调用时必须提供",
          "给 city 设置默认值",
          "限制 city 只能是北京",
          "声明 city 参数可填可不填"
        ],
        answer: "声明 city 是必填参数，模型调用时必须提供",
        explain: "schema 三要素：properties 里定义参数及描述、enum 约束取值范围、required 列出必填项。可选参数在你的函数里给默认值兜底。",
        note: "FunctionCalling函数调用"
      },
      {
        q: "模型生成的代码可能有幻觉（调用不存在的函数），推荐的验证方式是？",
        type: "choice",
        options: [
          "实际运行代码，把报错回喂给模型让它修正",
          "相信模型不会错",
          "人工逐行检查每次生成",
          "禁止模型写代码"
        ],
        answer: "实际运行代码，把报错回喂给模型让它修正",
        explain: "工具验证思路：可程序化验证的输出就交给程序——代码实际运行，报错回喂模型修正，形成「生成→运行→纠错」循环。这正是编程 Agent 的基本工作方式。",
        note: "幻觉Hallucination"
      },
      {
        q: "填空：Function Calling 中用 ______ Schema（一种 JSON 规范）来描述工具的名称、说明和参数。",
        type: "fill",
        answer: "JSON",
        explain: "工具用 JSON Schema 描述：name、description、parameters（type/properties/required）。模型按 schema 约束生成格式正确的 JSON 调用请求。",
        note: "FunctionCalling函数调用"
      },
      {
        q: "判断：Function Calling 和 MCP 是互相冲突的两种技术，项目里只能二选一。",
        type: "judge",
        answer: false,
        explain: "错。Function Calling 是底层机制（单次 API 调用中声明工具），MCP 是其上的生态层（标准化接入协议）——MCP Server 提供的工具最终仍可通过 Function Calling 机制被模型调用，两者不冲突。",
        note: "FunctionCalling函数调用"
      }
    ]
  },
  {
    id: "mcp",
    title: "MCP",
    icon: "🔗",
    note: "MCP模型上下文协议",
    questions: [
      {
        q: "MCP 的官方类比是？",
        type: "choice",
        options: [
          "MCP 之于 AI 应用，就像 USB-C 之于硬件设备",
          "MCP 之于 AI 应用，就像浏览器之于网页",
          "MCP 之于 AI 应用，就像操作系统之于电脑",
          "MCP 之于 AI 应用，就像蓝牙之于耳机"
        ],
        answer: "MCP 之于 AI 应用，就像 USB-C 之于硬件设备",
        explain: "以前每个设备一种接口，现在统一了，插谁都能用。MCP（Model Context Protocol，模型上下文协议）标准化了 AI 应用与外部数据源、工具的连接方式。",
        note: "MCP模型上下文协议"
      },
      {
        q: "MCP 解决的核心工程问题是？",
        type: "choice",
        options: [
          "把 M 个应用 × N 个工具的 M×N 对接问题变成 M+N",
          "让模型训练更快",
          "让 API 调用免费",
          "彻底消除幻觉"
        ],
        answer: "把 M 个应用 × N 个工具的 M×N 对接问题变成 M+N",
        explain: "MCP 之前，M 个 AI 应用 × N 个工具，每个组合都要单独写对接代码。标准化后：工具方写一个 MCP Server，应用方支持一次 MCP Client，即可互相联通。",
        note: "MCP模型上下文协议"
      },
      {
        q: "MCP 架构中的三个角色是？",
        type: "choice",
        options: [
          "Host / Client / Server",
          "前端 / 后端 / 数据库",
          "训练 / 推理 / 部署",
          "父亲 / 母亲 / 孩子"
        ],
        answer: "Host / Client / Server",
        explain: "Host 是用户直接用的 AI 应用（如 Claude Desktop、Cursor）；Client 是 Host 内部组件，与每个 Server 保持一对一连接；Server 是轻量程序，暴露某类能力（文件系统、数据库、浏览器）。通信基于 JSON-RPC，支持本地 stdio 和远程 HTTP/SSE。",
        note: "MCP模型上下文协议"
      },
      {
        q: "判断：MCP Server 可以暴露三类东西——Tools（工具）、Resources（资源）、Prompts（提示词模板）。",
        type: "judge",
        answer: true,
        explain: "对。Tools 是可被模型调用的函数（如 query_database）；Resources 是可读取的数据（文件内容、日志）；Prompts 是预置任务模板。",
        note: "MCP模型上下文协议"
      },
      {
        q: "填空：MCP 是______（公司名）于 2024 年底提出的开放协议。",
        type: "fill",
        answer: "Anthropic",
        explain: "Anthropic 提出后迅速被 OpenAI、Google 等厂商采纳支持，已成为 Agent 工具生态的事实标准之一。对比记忆：Function Calling 是「怎么让模型调一个函数」，MCP 是「怎么让整个行业的工具即插即用」。",
        note: "MCP模型上下文协议"
      },
      {
        q: "MCP 的通信基于什么协议格式？",
        type: "choice",
        options: ["JSON-RPC", "XML", "纯文本", "二进制私有协议"],
        answer: "JSON-RPC",
        explain: "通信基于 JSON-RPC，传输方式支持两种：本地 stdio（Host 启动 Server 子进程，通过标准输入输出通信）和远程 HTTP/SSE。",
        note: "MCP模型上下文协议"
      },
      {
        q: "在 Claude Desktop 里启用一个 MCP Server（比如 filesystem），需要做什么？",
        type: "choice",
        options: [
          "在配置文件的 mcpServers 里加几行配置（command + args）",
          "重新编译 Claude Desktop",
          "自己写一个 Host 应用",
          "给 Anthropic 发邮件申请"
        ],
        answer: "在配置文件的 mcpServers 里加几行配置（command + args）",
        explain: "配置形如 {\"mcpServers\": {\"filesystem\": {\"command\": \"npx\", \"args\": [...]}}}——声明用哪个命令启动 Server、暴露哪个目录，重启客户端即生效。这就是「即插即用」的体现。",
        note: "MCP模型上下文协议"
      },
      {
        q: "想让 AI 能读写你电脑上指定目录下的文件，应该接哪个现成 MCP Server？",
        type: "choice",
        options: ["filesystem", "postgres", "playwright", "github"],
        answer: "filesystem",
        explain: "常见 Server 速查：filesystem 读写本地文件、postgres/sqlite 查数据库、playwright/puppeteer 控制浏览器、github 查 issue 提 PR、fetch 抓网页、memory 持久记忆。",
        note: "MCP模型上下文协议"
      },
      {
        q: "判断：MCP 推出后迅速被 OpenAI、Google 等厂商采纳支持，已成为 Agent 工具生态的事实标准之一。",
        type: "judge",
        answer: true,
        explain: "对。虽然 MCP 是 Anthropic 提出的，但生态价值（写一次 Server 处处可用）让竞争对手也纷纷采纳——这是「开放协议战胜封闭接口」的典型案例。",
        note: "MCP模型上下文协议"
      },
      {
        q: "填空：想给模型提供跨会话的持久记忆，可以使用现成的 ______ MCP Server。",
        type: "fill",
        answer: "memory",
        explain: "memory server 让模型跨会话记住信息。其他高频 Server：fetch（抓网页转给模型）、github（操作仓库）、playwright（控制浏览器）。",
        note: "MCP模型上下文协议"
      },
      {
        q: "MCP 架构中，与每个 Server 保持一对一连接的组件是？",
        type: "choice",
        options: [
          "Client（Host 内部组件）",
          "LLM 本身",
          "用户的浏览器",
          "另一个 Server"
        ],
        answer: "Client（Host 内部组件）",
        explain: "层级关系：用户用 Host（如 Cursor）→ Host 内部每个 Client 对应一个 Server 保持一对一连接 → Server 再连接真实资源（文件系统、数据库、浏览器）。",
        note: "MCP模型上下文协议"
      },
      {
        q: "「对工具开发者来说 MCP 的价值」最准确的描述是？",
        type: "choice",
        options: [
          "写一次 MCP Server，Claude、Cursor、各种 Agent 框架都能用",
          "可以提高模型智商",
          "可以让 API 免费",
          "可以替代训练模型"
        ],
        answer: "写一次 MCP Server，Claude、Cursor、各种 Agent 框架都能用",
        explain: "生态价值三视角：工具开发者一次开发处处可用；应用开发者不用自己对接每个 SaaS 的 API；用户能让 AI 直接操作本地文件、公司数据库、浏览器。",
        note: "MCP模型上下文协议"
      }
    ]
  },
  {
    id: "multimodal",
    title: "多模态与世界模型",
    icon: "🌐",
    note: "多模态",
    questions: [
      {
        q: "「模态」（Modality）指的是什么？",
        type: "choice",
        options: [
          "信息的载体类型：文本、图像、音频、视频等",
          "模型的参数规模",
          "模型的训练方法",
          "API 的价格档位"
        ],
        answer: "信息的载体类型：文本、图像、音频、视频等",
        explain: "多模态模型能同时处理多种模态的输入/输出：给图配文字提问它看图回答，说一段话它生成一张图。早期 AI 是「专科医生」，多模态模型是「全科医生」。",
        note: "多模态"
      },
      {
        q: "VLM（视觉语言模型）让 LLM「看懂」图片的实现思路是？",
        type: "choice",
        options: [
          "图像编码器把图片编码成视觉向量，投影到与文本相同的空间，与文本 token 拼接后一起送进 LLM",
          "先 OCR 提取文字再问答",
          "为每张图片单独训练一个模型",
          "把图片转成 base64 字符串直接当文本读"
        ],
        answer: "图像编码器把图片编码成视觉向量，投影到与文本相同的空间，与文本 token 拼接后一起送进 LLM",
        explain: "三步：① ViT 等图像编码器把图片切成 patches 编码成视觉向量；② 投影层映射到与文本 Embedding 相同的空间；③ 视觉向量与文本 token 拼接，统一做「下一个 token 预测」。",
        note: "多模态"
      },
      {
        q: "判断：一张图片会被编码成数百到上千 token，会影响费用和上下文窗口，大图建议先压缩。",
        type: "judge",
        answer: true,
        explain: "对。多模态不是免费的——图片 token 成本显著，开发集成时大图先压缩。入门建议从「图像理解」开始（会调 API 发图片就够），是成本最低的多模态体验。",
        note: "多模态"
      },
      {
        q: "世界模型（World Model）与 LLM 的本质区别是？",
        type: "choice",
        options: [
          "世界模型学「下一个状态」（物理/空间/因果规律），LLM 学「下一个词」（语言统计规律）",
          "世界模型只是更大的 LLM",
          "世界模型跑得更快",
          "世界模型更便宜"
        ],
        answer: "世界模型学「下一个状态」（物理/空间/因果规律），LLM 学「下一个词」（语言统计规律）",
        explain: "问 LLM「杯子推下桌会怎样」→ 它背诵「会碎」；世界模型则在内部模拟杯子下落、碰撞、破碎的过程——它「看见」了因果，而不只是复述过因果。代表作：Genie 3、Marble、V-JEPA。",
        note: "世界模型"
      },
      {
        q: "填空：OpenAI 的语音识别（语音转文字）代表模型叫______。",
        type: "fill",
        answer: "Whisper",
        explain: "典型流水线：录音 → Whisper 转文字 → LLM 总结 = 全自动会议纪要。其他速览：图像理解 GPT-4o/Qwen-VL，图像生成 DALL·E/Midjourney/即梦，视频生成 Sora/可灵。",
        note: "多模态"
      },
      {
        q: "下列哪个是图像生成（文生图）的代表模型/产品？",
        type: "choice",
        options: ["Midjourney", "Whisper", "GPT-4o", "BGE"],
        answer: "Midjourney",
        explain: "分模态记：图像生成 = DALL·E、Midjourney、Stable Diffusion、即梦；图像理解 = GPT-4o、Claude、Qwen-VL；语音识别 = Whisper；视频生成 = Sora、可灵、即梦。",
        note: "多模态"
      },
      {
        q: "VLM 处理图片的第一步，图像编码器（如 ViT）做什么？",
        type: "choice",
        options: [
          "把图片切成小 patches，编码成一串视觉向量",
          "把图片转成文字描述",
          "压缩图片体积",
          "给图片加水印"
        ],
        answer: "把图片切成小 patches，编码成一串视觉向量",
        explain: "三步走：① 图像编码器切 patches 编码成视觉向量；② 投影层把视觉向量映射到与文本 Embedding 相同的空间；③ 视觉向量和文本 token 拼接，一起送进 LLM 统一做下一个 token 预测。",
        note: "多模态"
      },
      {
        q: "判断：多模态入门推荐从「图像理解」开始——会调 API 发图片就够了，是成本最低的多模态体验。",
        type: "judge",
        answer: true,
        explain: "对。路径选择：图像/音频理解偏「开发集成」（调 API 即可），图像/视频生成偏「产品使用」。先想清楚自己要哪条路，再从最便宜的图像理解入手。",
        note: "多模态"
      },
      {
        q: "「截图转代码」属于多模态的哪类应用？",
        type: "choice",
        options: [
          "图像理解：把 UI 设计稿截图发给模型，直接生成前端代码",
          "语音识别",
          "视频生成",
          "文本翻译"
        ],
        answer: "图像理解：把 UI 设计稿截图发给模型，直接生成前端代码",
        explain: "已在落地的场景还有：文档理解（扫描件图表直接问答不用先 OCR）、会议纪要、无障碍描述画面、图文内容审核、拍照搜同款。",
        note: "多模态"
      },
      {
        q: "判断：LLM 知道「杯子会碎」这句话，意味着它真正理解了重力等物理规律。",
        type: "judge",
        answer: false,
        explain: "错。LLM 学的是「文字怎么接下去」，不是「世界怎么演化」——它背诵「杯子会碎」，但并不真正理解重力。世界模型则在内部模拟杯子下落、碰撞、破碎的过程，「看见」因果而不只是复述因果。",
        note: "世界模型"
      },
      {
        q: "2026 年，业界把什么方向视为通往 AGI 的下一条主线（声量甚至超过 LLM）？",
        type: "choice",
        options: ["世界模型", "更大的词表", "更长的 Prompt", "更多的聊天机器人"],
        answer: "世界模型",
        explain: "标志性玩家：DeepMind Genie 3（实时生成可交互 3D 世界）、李飞飞 World Labs（单图生成可探索 3D 空间 Marble）、LeCun 的 AMI Labs（JEPA 非生成式路线）、Sora 类视频模型被称为「世界模拟器」。",
        note: "世界模型"
      },
      {
        q: "判断：「世界模型」是 2026 年才提出的全新概念，此前从未出现过。",
        type: "judge",
        answer: false,
        explain: "错。2018 年 David Ha 和 Schmidhuber 的论文《World Models》就让它出圈过一次（AI 在「梦」里学开车）；2024-2026 年随视频生成和具身智能爆发，它成为兵家必争之地。",
        note: "世界模型"
      }
    ]
  }
];

// 职业面试题：内容基于《AI面试八股文》《AI职业全景》《大厂AI面试题总览与答题方法论》展开
const CAREER_QUESTIONS = [
  {
    career: "AI 产品经理",
    icon: "📋",
    items: [
      {
        q: "用户抱怨 AI 客服老是瞎编不存在的售后政策，引发投诉。作为产品经理，你怎么处理？",
        guide: {
          考点: "对幻觉的认知深度 + 分层防御思维。幻觉无法 100% 消除，只能按风险等级配置防御深度。",
          答题框架: "先定性：幻觉的根源是模型按概率预测下一个 token，不是事实数据库，无法根除。再给方案：① RAG 让模型基于真实政策文档作答；② Prompt 强制引用来源、资料没有就说不知道；③ 调低 temperature；④ 高风险场景加人工复核。最后讲评估：先定义「编政策」的badcase集，上线前后对比幻觉率。",
          加分句: "默认模型可能胡说，让它证明而不是让它保证。",
          避坑: "别说「换个更大的模型就好了」——幻觉是概率生成的本质问题，换模型只能缓解不能解决；也别承诺「消灭幻觉」。"
        }
      },
      {
        q: "用一句话说清 RAG 和 Agent 的区别，什么场景用哪个？",
        guide: {
          考点: "概念边界是否清晰——PM 不写代码但必须懂技术语言。",
          答题框架: "一句话版：RAG 让 AI 记得更准，Agent 让 AI 干活更稳。展开：RAG 解决「知识从哪来」（检索资料喂给模型），Agent 解决「事情怎么做完」（LLM+规划+记忆+工具，自主多步执行）。场景判断：问答、知识库客服 → RAG 就够；需要操作多个系统、多步骤的任务（自动做调研、订机票）→ 需要 Agent。",
          加分句: "RAG 是开卷考试，Agent 是带工具箱的员工。",
          避坑: "别把两者对立——生产系统里 Agent 经常把 RAG 当作自己的一个工具来调用。"
        }
      },
      {
        q: "老板想给产品加 AI 能力，需求是「回答要专业、格式固定、还要知道我们最新的产品手册」。你怎么选技术路线？",
        guide: {
          考点: "Prompt / RAG / 微调的场景判断与成本意识。",
          答题框架: "先拆需求：「知道最新手册」是知识问题 → RAG（更新文档即可）；「格式固定、专业口吻」先用 Prompt 工程（定格式、给示例、放 system）；如果 few-shot 示例撑爆上下文、或要服务海量请求想省 token，再考虑微调固化行为。给出决策口诀和成本量级：Prompt 分钟级几乎零成本，RAG 天级中等成本，微调周级高成本。",
          加分句: "先 Prompt，再 RAG，最后才微调——90% 的需求前两步就能解决。",
          避坑: "别一上来就说「微调一个我们自己的模型」——微调灌事实知识既贵又会随模型更新失效，知识交给 RAG。"
        }
      },
      {
        q: "设计一个智能客服产品，你认为核心难点在哪里？",
        guide: {
          考点: "场景设计题——各厂都考，拉开档位的关键。考察能否主动讲难点而不是只画饼。",
          答题框架: "先反问需求边界（用户是谁、解决什么问题、资源多少），再给分层架构：路由层（意图分类，FAQ→RAG→Agent→人工）→ 规划层 → 执行层。然后主动讲难点：① 多轮失忆 → 显式抽取关键实体；② 指代消解（「这个条款」）→ query 改写；③ 幻觉/承诺风险 → RAG+引用+拒答策略；④ 情绪与高风险问题 → 转人工兜底。",
          加分句: "客服产品的护城河不在模型多强，而在badcase收集和兜底层设计。",
          避坑: "别只讲「接个大模型 API 就行」——面试官想听的是你知道哪里会翻车、怎么兜底。"
        }
      },
      {
        q: "怎么估算一个 AI 问答功能的调用成本？",
        guide: {
          考点: "成本意识——token 计费模型是 AI PM 的基本功。",
          答题框架: "先算账：API 按 token 计费，输入和输出分别计价且输出通常更贵；中文 1 个汉字约 1-2 token，比英文贵。公式：单次成本 ≈（system prompt + 历史对话 + 检索资料 + 用户问题 + 输出）的 token 数 × 单价。再讲优化：RAG 只检索 3-5 块而不是塞全文、控制历史轮数、简单问题路由到小模型、多模态图片先压缩（一张图数百到上千 token）。",
          加分句: "设计系统时先算账：Prompt 模板 + 检索内容 + 历史 + 预期输出 ≈ 多少 token，留 20% 余量再选模型档位。",
          避坑: "别忽略隐性成本：长对话每轮都把历史重发一遍，轮数越多输入 token 越滚越大。"
        }
      },
      {
        q: "AI 功能上线后，你怎么评估它的效果？",
        guide: {
          考点: "评估体系思维——分阶段看指标，而不是上线即结束。",
          答题框架: "分三个阶段：验证期看准确率/任务完成率（先建评测集和badcase库）；成长期看 DAU、留存、NPS 等产品指标；成熟期看 ROI 和降本额（省了多少人工客服工时）。强调上线前必须有 baseline 和评测集，否则「效果好不好」全靠感觉。",
          加分句: "没有评测集的 AI 功能上线，等于闭眼开车。",
          避坑: "别只说「看用户反馈」——主观反馈滞后且有偏，要先用程序化评测守住质量底线。"
        }
      },
      {
        q: "不懂技术的老板问你：「能不能保证我们的 AI 100% 不犯错？」你怎么回答？",
        guide: {
          考点: "预期管理——PM 的核心软技能，考察你能否用业务语言讲清技术边界。",
          答题框架: "不打包票，讲清三层：① 为什么做不到——模型是按概率预测下一个 token 的，自信和胡说不冲突，幻觉无法 100% 消除；② 我们怎么控——按风险分层设防：低风险场景低 temperature，对外场景 RAG+引用，高风险场景加人工复核；③ 承诺什么——承诺可量化的质量指标（评测集准确率）和兜底机制，而不是「永不犯错」。",
          加分句: "我们不承诺 AI 永不出错，我们承诺每一类错误都有对应的防线和责任人。",
          避坑: "别为了拿项目拍胸脯说「能保证」——幻觉是概率生成的本质问题，过度承诺上线后必爆雷。"
        }
      },
      {
        q: "用户要求「AI 一键总结我上传的 100 页 PDF」，但上下文窗口装不下全文，产品方案怎么设计？",
        guide: {
          考点: "上下文窗口约束下的产品设计——把技术限制翻译成用户无感的方案。",
          答题框架: "先讲限制：10 万汉字约 15 万+ token，可能超窗且费用高、还有「中间遗忘」。再给方案三选一或组合：① RAG 式——切块入库，按用户问题检索相关章节回答；② 分段摘要——逐段总结再汇总（map-reduce 思路）；③ 滑动窗口+摘要——长文档流式处理。最后谈产品体验：进度条、分章节目录、允许追问时定向检索。",
          加分句: "窗口限制不是产品的借口，是产品设计的输入——用户只关心「总结得准不准」，不关心你内部切了几块。",
          避坑: "别直接把全文硬塞进最大窗口的模型——成本高、速度慢、中间内容还可能被遗忘，三个坑一次踩全。"
        }
      },
      {
        q: "temperature、top_p、max_tokens 分别控制什么？产品侧什么时候需要关心它们？",
        guide: {
          考点: "采样参数理解——PM 不写代码但必须懂技术语言，这是和技术团队对话的基础词汇。",
          答题框架: "temperature 控随机性（0~0.3 稳定可复现，适合事实问答/抽取；0.7~1.0 有创意，适合文案）；top_p 控候选词范围（和 temperature 效果重叠，官方建议只调一个，新手只动 temperature）；max_tokens 是输出长度上限（只限输出，设小了会被截断，设大了不省钱——按实际生成量计费）。产品侧关心的时机：客服问答要稳 → 低温；起名/文案要活 → 高温；输出被截断 → 检查 max_tokens。",
          加分句: "求稳调低，求活调高；temperature 和 top_p 别同时调，动一个就够了。",
          避坑: "别以为 max_tokens 调大就更「划算」——它只是天花板不是包月，模型按实际生成量计费。"
        }
      },
      {
        q: "估算题：AI 客服日活 1 万用户，人均 5 轮对话，每轮平均输入 800 token、输出 200 token，怎么估月成本？",
        guide: {
          考点: "成本估算——AI PM 的基本功，考察 token 计费模型能否落地成数字。",
          答题框架: "列公式：日 token 量 = 1 万用户 × 5 轮 ×（800 输入 + 200 输出）= 5000 万输入 token + 1000 万输出 token；月乘 30。再乘单价：输入输出分别计价且输出通常更贵，查所选用模型的刊例价代入。最后讲优化空间：历史轮数裁剪（注意长对话每轮都把历史重发，实际输入会滚雪球大于 800）、简单问题路由小模型、检索块控制在 3-5 个。",
          加分句: "成本公式永远是「轮数 × 每轮 token × 单价」，三个因子各对应一个优化杠杆。",
          避坑: "别忘输入随轮数滚雪球——第 5 轮的输入包含前 4 轮历史，按恒定 800 token 估算会严重低估。"
        }
      },
      {
        q: "竞品上线了「拍照问答」的多模态功能，老板问我们跟不跟，你怎么分析？",
        guide: {
          考点: "场景判断 + 成本意识——多模态不是免费的，要算清价值账。",
          答题框架: "先判断场景价值：我们的用户有没有「看图」的真实需求（电商拍图搜款、文档理解是强需求；纯文字客服则未必）。再讲技术可行性：图像理解调 API 发图片即可，是成本最低的多模态体验，不用自研。最后算成本：一张图片会被编码成数百到上千 token，影响费用和上下文窗口，大图建议先压缩——用量大了成本可观。结论模板：值得做就做 MVP 小步验证，不值得就讲清为什么不跟。",
          加分句: "多模态选型先分路：图像/音频理解偏开发集成，图像/视频生成偏产品使用——别用生成的成本做理解的事。",
          避坑: "别说「竞品有我们就得有」——不看自己用户场景的功能跟进，做出来也是没人用的摆设。"
        }
      },
      {
        q: "AI 客服产品的「转人工」策略应该怎么设计？",
        guide: {
          考点: "兜底机制的产品化——幻觉分层防御在产品侧的落地形态。",
          答题框架: "触发条件分层：① 模型主动拒答（资料中没有就说不知道）→ 转人工；② 高风险意图（退款、投诉、法律、涉及钱）→ 直接转人工；③ 连续多轮未解决/用户情绪升级 → 转人工；④ 用户明确要求 → 立即转。配套设计：转人工时把对话历史和已抽取的关键信息一并带给人工坐席，别让用户重述；人工处理结果回流成 badcase 和知识库补充。",
          加分句: "好的 AI 客服不是「永不转人工」，而是「转得及时、转得带上下文」。",
          避坑: "别让 AI 硬扛高风险问题——向客户承诺不存在的政策会引发纠纷，幻觉在客服场景是钱的问题。"
        }
      }
    ]
  },
  {
    career: "Agent 开发工程师",
    icon: "🛠️",
    items: [
      {
        q: "画一下你做过的 Agent 系统架构，讲讲各层职责。",
        guide: {
          考点: "Agent 架构能力——阿里要求现场画三层架构，腾讯必问 Workflow 与 Agent 的区别。",
          答题框架: "套三层架构模板：路由层（Router：意图分类，简单问题走 FAQ/小模型，复杂问题升级）→ 管理/规划层（Supervisor：任务拆解、分派、汇总、异常兜底）→ 执行层（Worker：RAG 检索、工具调用、代码执行，各 Agent 单一职责）。再补一句 Workflow vs Agent：控制流代码写死的是 Workflow（步骤固定的业务），LLM 自己决定下一步的才是 Agent（开放性任务）。",
          加分句: "回答顺序：先反问需求边界 → 给分层架构 → 主动讲难点 → 生产护栏。",
          避坑: "别把「调了一次 Function Calling」说成 Agent——没有规划-行动-观察循环的只是工具增强的聊天。"
        }
      },
      {
        q: "Agent 调用工具陷入死循环（反复调同一个工具停不下来）怎么办？",
        guide: {
          考点: "生产环境的 Agent 护栏设计——字节高频题。",
          答题框架: "四道防线：① 最大迭代数（10-20 步硬上限）；② 循环检测（相同工具+相同参数重复出现即中断）；③ 超时重试与指数退避；④ 降级兜底（转人工或返回「任务未完成+已完成的中间结果」）。补充：工具调用有真实副作用，高危操作要 human-in-the-loop 人工确认。",
          加分句: "Agent 会放大模型的错误，一步错步步错——护栏不是可选项，是上线的前提。",
          避坑: "别只说「让模型自己判断停下来」——模型没有可靠的内生停止机制，必须用程序硬约束。"
        }
      },
      {
        q: "你们 RAG 系统准确率只有 60%，领导要求提到 85%，你怎么做？",
        guide: {
          考点: "RAG 排查方法论——区分度最高的题，考察能否分环节拆解而不是瞎调。",
          答题框架: "分段排查三个环节：① 检索不到 → 查切分粒度（按语义边界切、保留标题层级、10-20% overlap、父子文档切片）、查 embedding 模型是否匹配语言、加 BM25 混合检索（BM25 抓专有名词精确匹配，向量抓语义口语化）；② 检索到但没用上 → 上下文太长被淹没，控制 Top-K 3-5 块、重排（rerank）、优化 prompt 组织；③ 生成出错 → 换更强模型、要求引用来源、加拒答策略。",
          加分句: "面经真实数据：父子文档切片（子片段检索、父片段注入）把某系统准确率从 53% 拉到 93%。",
          避坑: "别上来就「换更好的 embedding 模型」——不先定位是哪个环节的问题，换什么都靠蒙。"
        }
      },
      {
        q: "Agent 的记忆系统怎么设计？长对话「遗忘」怎么解决？",
        guide: {
          考点: "记忆与上下文工程——短期/长期记忆的分层设计。",
          答题框架: "先讲原理：模型本身没有记忆，历史消息每轮重发，超窗就被截断。再分层：短期记忆 → 对话历史 + 滑动窗口（只保留最近 N 轮）+ 摘要压缩（早期对话压成 summary 放 system）；长期记忆 → 重要事实结构化外置（用户偏好、任务状态存外部，每轮注入最新状态）或向量库检索。Agent 多轮执行时给子任务开独立上下文，只把结论带回主对话，避免工具输出撑爆窗口。",
          加分句: "重要内容放上下文的开头或结尾——很多模型存在「中间遗忘」现象。",
          避坑: "别说「选个 1M 窗口的模型就解决了」——窗口大≠用得好，超长上下文费用高且召回率下降。"
        }
      },
      {
        q: "Function Calling 和 MCP 的区别是什么？项目里怎么选？",
        guide: {
          考点: "对工具调用底层机制和生态协议的理解。",
          答题框架: "Function Calling 是底层机制：schema 描述工具 → 模型输出结构化 JSON → 程序执行 → 结果回传，每个应用自己在代码里写 schema。MCP 是标准化接入协议：Host/Client/Server 架构，工具方写一次 MCP Server，所有支持 MCP 的客户端通用，把 M×N 对接问题变成 M+N。选型：自己项目内几个工具 → Function Calling 直接写；需要接第三方工具生态或给多个客户端复用 → 上 MCP。",
          加分句: "Function Calling 是「怎么让模型调一个函数」，MCP 是「怎么让整个行业的工具即插即用」。",
          避坑: "别把两者说成竞争关系——MCP 是Function Calling 之上的生态层，两者不冲突。"
        }
      },
      {
        q: "面试官追问：「这些技术点你项目里真的用过吗？举个例子。」",
        guide: {
          考点: "项目深挖——应用开发岗项目经验权重远高于八股，这是最常见的追问。",
          答题框架: "每个八股知识点都要提前准备一个亲手做过的例子，用 STAR 讲：情境（做什么产品）→ 任务（遇到什么问题）→ 行动（技术选型和实现细节，比如为什么用 Chroma 起步、Top-K 怎么调的）→ 结果（量化数据）。没有项目就先做出 1-2 个能演示的作品（RAG 知识库、Agent 工作流），再来补八股。",
          加分句: "每个八股知识点，最好都能对应一个你亲手做过的例子。",
          避坑: "别只背不做——面试官一追问「你项目里怎么用的」，纯背八股立刻露馅。"
        }
      },
      {
        q: "ReAct 和 Plan-and-Execute 两种模式有什么区别？各自适合什么任务？",
        guide: {
          考点: "Agent 设计模式对比——考察你能否按任务特征选模式，而不是只会一种。",
          答题框架: "ReAct：每步即兴规划（Thought→Action→Observation 交替），走一步看一步，token 消耗高（每步带全历史），适合路径不确定的探索型任务，弱点是容易走偏、陷入循环。Plan-and-Execute：Planner 先把目标拆成有序步骤列表，Executor 逐步执行（步骤间可只传结果，省 token），适合步骤明确的流程型任务，弱点是计划错了会一路错到底——所以要带 Replan 重规划机制。",
          加分句: "探索型用 ReAct，流程型用 Plan-and-Execute；对输出质量要求高就叠加 Reflection 自我反思。",
          避坑: "别把 Plan-and-Execute 说成「更先进」——它只是规划时机不同（事前全局 vs 每步即兴），选错场景两种都会翻车。"
        }
      },
      {
        q: "Agent 调用搜索工具，一次返回了 5000 字网页全文塞进上下文，会有什么后果？怎么处理？",
        guide: {
          考点: "上下文污染——Agent 工程里最容易被忽视、面试官又最爱追问的细节。",
          答题框架: "后果：工具结果过长会撑爆窗口、淹没关键信息、token 成本暴涨，模型「注意力涣散」。对策（按成本从低到高）：① 每条 observation 设最大长度（如 2000 字符）超限截断；② 先让小模型提炼再回传；③ 检索类工具本身只返回 top-k 摘要而非全文；④ 相关但非当前的细节放子任务独立上下文，只回传结论。原则：上下文里的每一个 token 都应该为「下一步决策」服务。",
          加分句: "定期问：这条信息删了会影响后续决策吗？不会就删掉或压缩。",
          避坑: "别把工具原始输出无脑回传——搜索 API 返回什么就塞什么，是 demo 和产品的分水岭。"
        }
      },
      {
        q: "什么时候该上多智能体（Multi-Agent）系统？有什么坑？",
        guide: {
          考点: "对 Multi-Agent 的清醒认知——2026 年面试的区分度题目，考察你是否盲目追热点。",
          答题框架: "适用信号：单个 Agent 上下文装不下、职责混杂到 prompt 没法写清。常见形态：主管-员工（Supervisor 分派+汇总）、流水线（研究员→写手→审校）、辩论/评审（互相挑错提质量）。坑：每多一个 Agent 就多一份 token 开销和失败点；2026 年研究还指出多智能体团队存在「专业知识稀释效应」，规模越大性能可能越差。Anthropic 的原则：能一个 LLM 调用解决就不上工作流，能固定工作流解决就不上自主 Agent。",
          加分句: "复杂度只在必要时引入——Multi-Agent 是组织架构，不是银弹。",
          避坑: "别为炫技堆 Agent 数量——面试官会追问「每个 Agent 的失败率怎么叠加」，答不上来就是减分项。"
        }
      },
      {
        q: "模型调用工具时经常选错函数、填错参数，你怎么从工程上降低出错率？",
        guide: {
          考点: "工具 schema 设计——Function Calling 落地的核心手艺。",
          答题框架: "五板斧：① description 写清楚——函数和参数的说明就是给模型的 prompt，选函数填参数全靠它；② 参数加 enum 枚举约束取值范围；③ 必填参数写进 required，可选参数在函数里给默认值；④ 函数名动词开头（search_docs、send_email）语义清晰；⑤ 工具数量别贪多，功能相近的合并，减少模型选择困难。兜底：解析 arguments 后做参数校验，不合法就回喂错误让模型重试。",
          加分句: "schema 不是配置文件，是写给模型的 prompt——它看不懂的不是 JSON，是你没说清楚。",
          避坑: "别一次挂几十个工具——工具越多选择空间越大，出错率越高；按需挂载、按场景分组。"
        }
      },
      {
        q: "Agent 系统上线前，你怎么做评估和调试？",
        guide: {
          考点: "评估体系——demo 到生产的分水岭，考察你有没有真实上线意识。",
          答题框架: "四层：① 任务级指标——完成率、平均步数、工具调用成功率；② 轨迹审查——保存每轮 Thought/Action/Observation 的 trace，失败 case 定位到哪一步出错（规划错？工具错？观察误读？）；③ 程序化验证——能跑测试的跑测试（代码 Agent 跑测试→读报错→修复循环），能查接口的查接口，不信模型自报；④ 持续监控——badcase 回流成回归测试集。护栏同步上线：步数上限、高危操作人工确认。",
          加分句: "调试 Agent 的核心是「可观测」：没有 trace 的 Agent 失败，你只能猜。",
          避坑: "别只看最终答案对不对——Agent 一步错步步错，不看中间轨迹就找不到病根。"
        }
      },
      {
        q: "Agent 执行长任务到一半，用户突然改了需求，系统应该怎么应对？",
        guide: {
          考点: "上下文工程里的「过期目标」问题——真实产品必遇的场景题。",
          答题框架: "问题本质：旧目标还留在上下文里，模型可能继续执行过期目标（上下文污染的一种）。对策：① 显式维护「当前目标」字段，每次规划前重申，需求变更时更新它而不是依赖模型从对话历史里「领会」；② 变更时评估已有中间结果哪些可复用、哪些作废；③ 重要状态结构化外置，不依赖长对话记忆；④ 高危不可逆操作前暂停，拿新目标跟用户确认。",
          加分句: "重要事实固化在 system prompt，不依赖历史消息——历史会被截断，显式状态不会丢。",
          避坑: "别把新需求往对话尾巴一追就完事——长上下文里新旧目标并存，模型很可能按旧的继续跑。"
        }
      }
    ]
  },
  {
    career: "数据标注与评测",
    icon: "📊",
    items: [
      {
        q: "SFT 训练数据长什么样？质量上有什么要求？",
        guide: {
          考点: "对 SFT 数据格式和质量标准的理解——数据岗的基本功。",
          答题框架: "格式：JSONL，每行一条「指令 → 理想回答」成对数据（instruction/output），教模型怎么按指令干活。质量要求：数百到数万条高质量样本，宁缺毋滥——答案要准确、格式一致、覆盖任务的各种变体；标注前先有明确的标注规范（什么算好答案、边界情况怎么处理），标注后有清洗和质检流水线。",
          加分句: "标过数据的人学 SFT/RLHF 是有体感的——你知道模型是被什么「喂」出来的。",
          避坑: "别以为数据越多越好——低质量、互相矛盾的样本会直接教坏模型，质量 > 数量。"
        }
      },
      {
        q: "RLHF 的偏好数据和 SFT 数据有什么不同？标注时标的是什么？",
        guide: {
          考点: "对 RLHF 数据本质的理解——标的是「偏好」而不是「答案」。",
          答题框架: "SFT 标的是「标准答案」：给定指令写出理想回答。RLHF 标的是「相对偏好」：同一个 prompt 的多个回答，标注员排序或选出哪个更好（更有帮助、更真实、更无害），用来训练奖励模型学习人类偏好，再用强化学习让模型向高奖励方向优化。近年 DPO 等方案直接用偏好对训练，不需要单独训练奖励模型，更简单更稳。",
          加分句: "SFT 教模型「听懂话」，RLHF/DPO 教模型「说好话」。",
          避坑: "别把偏好标注做成「挑错别字」——它标的是帮助性、真实性、无害性这类主观维度，规范里必须写清排序标准，否则不同标注员各凭感觉。"
        }
      },
      {
        q: "让你给一个 AI 问答系统设计评测维度，你会从哪些方面打分？",
        guide: {
          考点: "评估维度设计能力——评测岗的核心产出。",
          答题框架: "至少四个维度：① 事实准确性——答案与资料是否一致，有无幻觉（可要求标注来源编号便于核对）；② 指令遵循——是否按要求格式输出、有没有答非所问；③ 完整性——要点有没有遗漏；④ 安全与边界——资料没有的是否说了「不知道」，有无违规承诺。落地时先建评测集（典型问题+参考答案+badcase），用程序化校验能自动跑的维度，人工抽检其余。",
          加分句: "对可程序化验证的输出，用工具检查而不是信模型——模型给的 URL 就发请求验证，给的代码就实际运行。",
          避坑: "别只用「感觉不错」当评测——没有固定评测集和打分规范，两次评测结果无法对比，优化就无从谈起。"
        }
      },
      {
        q: "多人协作标注时，怎么保证标注结果的一致性？",
        guide: {
          考点: "标注规范与质检流程——从标注员到数据工程的分水岭。",
          答题框架: "四步走：① 写清标注规范——每条标准配正例和反例，尤其覆盖边界情况；② 小规模试标——几个人标同一批，对齐分歧、回写规范；③ 正式标注 + 抽检质检——按比例复检，错误率高的标注员回炉培训；④ 定期校准——规范是活文档，遇到新边界情况就补充。数据流水线里清洗和质检是独立环节，不是标完就入库。",
          加分句: "标注规范的价值不在写了什么，在于「同一批数据不同人标出同样结果」。",
          避坑: "别跳过试标直接铺开——规范里没写清的歧义，会在几千条数据里被放大成系统性偏差。"
        }
      },
      {
        q: "怎么评测一个 RAG 知识库系统的效果？",
        guide: {
          考点: "把「检索」和「生成」拆开评——RAG 评测不能直接只看最终答案。",
          答题框架: "分两段评测：① 检索质量——建问题集，标注每个问题对应的知识块，看 Top-K 命中率（检索不到 → 查切分和 embedding）；② 生成质量——检索对了的前提下，答案是否忠于资料、有无编造、是否该拒答时拒答。整体指标：准确率/完成率。进阶：模拟真实用户的多轮指代问题（「这个条款」）测 query 改写能力。",
          加分句: "RAG 效果差要分段看：检索不到、检索到但没用上、生成出错，三个环节的修法完全不同。",
          避坑: "别把检索失败的锅算到生成头上——不拆开评，优化方向全是错的。"
        }
      },
      {
        q: "数据标注/评测方向的职业上升路径是什么？你自己怎么规划？",
        guide: {
          考点: "对行业生态的认知——知道自己站在哪、能往哪走。",
          答题框架: "路径：标注员 → 数据工程/评测工程（设计评测集、搭质检流水线、写脚本处理数据）→ 补代码能力后两条出口：应用开发（RAG/Agent）或训练数据策略（数据配比、合成、质量评估，对接后训练岗位）。核心论点：数据方向是被低估的入口——门槛最低、直接站在行业内部，能近距离看到模型怎么被「喂」出来。",
          加分句: "先入场，再选座——行业内的信息密度和行业外是两个世界，进去之后转岗比想象中容易。",
          避坑: "别把标注当终点——纯标注可替代性强，要主动往「会写脚本、懂训练数据怎么影响模型」的方向长。"
        }
      },
      {
        q: "DPO 训练用的数据和传统 RLHF 的数据有什么差别？",
        guide: {
          考点: "对偏好优化两代方案的数据理解——数据岗要懂数据喂给了什么算法。",
          答题框架: "传统 RLHF（PPO 路线）：偏好数据先用来训练一个独立的奖励模型，再用强化学习在线采样优化——数据服务于奖励模型。DPO：直接用「偏好对」（同一个 prompt 下一个好回答、一个差回答）做对比学习，不需要训练奖励模型、不需要在线采样，流程更简单更稳。对数据侧的含义：DPO 偏好对的质量直接进训练，标注规范里「好/差的判定标准」必须写得比 RLHF 更细。",
          加分句: "DPO 把「训奖励模型 + 强化学习」两步并成一步对比学习——数据从「间接燃料」变成了「直接教材」。",
          避坑: "别以为 DPO 对数据要求更低——跳过了奖励模型这个缓冲层，偏好对的噪声会直接传导到模型行为上。"
        }
      },
      {
        q: "检查训练数据时发现混入了大量重复样本和互相矛盾的标注，会有什么后果？怎么处理？",
        guide: {
          考点: "数据清洗与质检——数据工程的核心日常。",
          答题框架: "后果：重复样本让模型对某些模式过拟合、变相改变数据配比；矛盾标注（同输入不同「正确答案」）让模型学到互相冲突的行为，输出不稳定。处理：① 去重——完全重复和近重复（相似度阈值）都要清；② 矛盾样本回溯标注规范，判定哪个对、修正或删除；③ 写入前做去重和时效检查，避免库里堆满矛盾信息；④ 清洗规则文档化，下次增量数据直接复用流水线。",
          加分句: "数据配比、清洗、去重、合成是训练数据工程的四大件——清洗不干净，后面训什么都白搭。",
          避坑: "别只做「完全重复」去重——改几个字的近重复样本危害一样大，要用相似度方法查。"
        }
      },
      {
        q: "怎么评测一个 Agent 系统（不只是单轮问答）？",
        guide: {
          考点: "评测对象从「答案」升级到「过程」——Agent 评测是评测岗的高阶能力。",
          答题框架: "三层指标：① 结果层——任务完成率（最终交付对不对）；② 过程层——平均步数、工具调用成功率、是否陷入死循环、无效调用占比；③ 安全层——高危操作有没有越权执行、副作用是否可控。方法：建任务集（含正常/边界/对抗 case），保存完整执行 trace 便于归因；能程序化验证的结果（代码跑测试、URL 发请求）不要人工目测。",
          加分句: "评测 Agent 不能只看「最后答对没有」——一步错步步错，过程指标才是优化的抓手。",
          避坑: "别拿单轮 QA 的评测集直接测 Agent——多步任务的失败模式（循环、走偏、工具误用）在单轮评测里根本暴露不出来。"
        }
      },
      {
        q: "用模型生成「合成数据」来扩充训练集，靠谱吗？要注意什么？",
        guide: {
          考点: "数据合成——训练数据工程的热门手段，考察你知其然也知其风险。",
          答题框架: "靠谱但有前提。适合：覆盖稀缺场景、扩大数据规模、生成工具调用/轨迹数据。风险与对策：① 合成数据带模型的系统性偏差和幻觉——要抽检+规则过滤；② 分布单一——prompt 里多变体（换场景、换语气、换难度）防千篇一律；③ 与真实数据配比失衡——合成数据当补充不当主力；④ 质量底线——合成后照样走清洗和质检流水线，不是生成就入库。",
          加分句: "合成数据解决「有没有」，质检流程解决「能不能用」——两步缺一不可。",
          避坑: "别用模型生成 → 直接训练的裸奔 pipeline——模型的幻觉会原样变成训练标签，等于给模型喂自己的错误。"
        }
      },
      {
        q: "让你设计一套「幻觉检测」评测流程，专门抓 AI 问答系统编内容的问题，怎么做？",
        guide: {
          考点: "专项评测设计——幻觉是 RAG 系统头号质量杀手，这题考落地。",
          答题框架: "① 建集：收集带标准答案和出处文档的问题集，混入「资料里没答案」的陷阱题；② 评答案：结论是否能在来源文档中找到依据（要求系统输出引用编号，逐条核对）；③ 评拒答：陷阱题上系统是否老实回答「根据现有资料无法回答」——该拒答时硬答是最危险的失败；④ 程序化辅助：答案中的 URL 发请求验证、数字与资料比对、代码实际运行；⑤ 输出幻觉率报告，badcase 回流到 Prompt/RAG 优化。",
          加分句: "评测幻觉的核心不是「答对了多少」，而是「编了多少 + 该拒答时拒答了没有」。",
          避坑: "别只测「资料里有答案」的题——幻觉最常在「模型不知道」时发作，陷阱题才是幻觉评测的灵魂。"
        }
      },
      {
        q: "标注任务量大人手紧，效率和质量的矛盾怎么平衡？",
        guide: {
          考点: "标注项目管理——从「会标」到「会带标注」的分水岭。",
          答题框架: "抓三个杠杆：① 规范前置——标注规范写细（正例+反例+边界情况），规范越清楚返工越少，慢就是快；② 试标对齐——正式铺开前小规模试标，对齐分歧再放量，避免大规模返工；③ 抽检兜底——按比例抽检代替全检，错误率高的标注员定向回炉，好的减少抽查频率。进阶：用模型预标注+人工校正提效，人只做「判断对错」不做「从零写」。",
          加分句: "标注项目的效率不是标得快，是返工少——规范上多花一天，质检上少花一周。",
          避坑: "别用「加人加钱」硬扛——规范不清时人越多错得越花样百出，先修规范再放人力。"
        }
      }
    ]
  },
  {
    career: "FDE 前置部署",
    icon: "🛰️",
    items: [
      {
        q: "FDE 是什么岗位？和解决方案工程师有什么区别？",
        guide: {
          考点: "对岗位本身的理解——F 是 Forward（前线）不是 Front-End（前端）。",
          答题框架: "FDE（Forward Deployed Engineer，前置部署工程师）：源自 Palantir 的岗位模式，驻进客户业务现场，从「识别 AI 能解决什么问题」开始，一路负责到系统在生产环境跑起来，按业务结果结算而不是按工时。和解决方案岗的区别：解决方案偏售前（写方案+做演示），FDE 偏交付（真写代码、真上线），工程师含量更高。交付物典型是 RAG/Agent 系统、MCP 服务、子智能体。",
          加分句: "解决方案岗把产品「卖出去」，FDE 把价值「跑起来」——按业务结果结算。",
          避坑: "别把 FDE 说成「驻场外包」——它要的是从需求识别到生产上线的全链路能力，不是人力派遣。"
        }
      },
      {
        q: "客户（完全不懂技术）说：「我想要个智能客服，像 ChatGPT 那样什么都能答。」你怎么把这个口语需求翻译成技术方案？",
        guide: {
          考点: "需求翻译能力——FDE 的核心软技能，把客户口语翻译成技术方案。",
          答题框架: "先纠偏预期：「什么都能答」= 幻觉重灾区，要收敛到「基于你们企业资料准确作答」。再翻译：客户资料问答 → RAG 知识库（切分→嵌入→入库→检索→生成），加引用来源和拒答兜底。需求结构化：用 AI 辅助——把客户的语音/聊天记录丢给 AI，输出需求清单、功能拆分和报价结构。最后对齐验收标准：准确率多少算达标、哪些问题转人工。",
          加分句: "技术支持的沟通不是「侃」，是把客户的口语需求翻译成技术方案——这件事 AI 能帮大忙。",
          避坑: "别直接答应「什么都能答」——不管理预期的需求翻译，交付时必翻车。"
        }
      },
      {
        q: "驻场交付一个 RAG 知识库系统，完整流程是什么？",
        guide: {
          考点: "交付全流程——从 PoC 到生产，考察是否真做过而不是只看过。",
          答题框架: "① 资料盘点与清洗：客户的文档什么格式、质量如何；② 建库：按语义边界切分（保留标题层级、留重叠）→ 选匹配中文的 embedding → 入向量库（原型 Chroma 够用）；③ 联调：检索 Top-K 3-5、Prompt 加引用和拒答；④ 评测：和客户一起定评测集，达标再上线；⑤ 生产化：权限、日志、badcase 回流机制；⑥ 验收：按事先约定的业务指标结算。",
          加分句: "接单拼的是复用：同一套 RAG 骨架，换客户的数据就是新单。",
          避坑: "别跳过「和客户共建评测集」这一步——没有双方认可的达标标准，「按业务结果结算」就是无底洞。"
        }
      },
      {
        q: "客户已有 OA、数据库等存量系统，想让 AI 能查这些系统里的数据，你怎么设计接入？",
        guide: {
          考点: "MCP 实战能力——FDE JD 点名技能（MCP、sub-agents、agent skills）。",
          答题框架: "给客户每类存量系统封装 MCP Server：数据库包一层查询 server（模型可看表结构、跑受控 SQL），文件资料挂 filesystem/检索 server，浏览器操作用 playwright server。Host（自研 Agent 或 Claude 类客户端）通过 MCP Client 统一接入。好处：一次开发、后续接新客户端不用重写；权限和 SQL 白名单在 server 侧控制，安全可控。",
          加分句: "MCP 把 M×N 的对接问题变成 M+N——客户以后再上新的 AI 应用，这些 Server 直接复用。",
          避坑: "别让模型直连生产库裸奔 SQL——查询权限、只读账号、危险操作拦截必须在 server 层做掉。"
        }
      },
      {
        q: "FDE「按业务结果结算」意味着什么风险？你怎么管理？",
        guide: {
          考点: "交付风险意识——结果导向合同里工程师怎么保护自己。",
          答题框架: "风险：需求模糊、验收标准漂移、客户数据质量差，都可能让「业务结果」永远达不成。管理手段：① 验收标准前置——开工前就把评测集和达标线写进合同附件；② 分阶段交付——PoC 验证可行性 → 小范围试点 → 全量上线，每阶段有确认节点；③ 范围管理——新需求走变更而不是默默加活；④ 留痕——会议纪要、确认邮件，用 AI 辅助整理。",
          加分句: "按结果结算不是赌运气，是把「结果」定义权的一半握在自己手里。",
          避坑: "别口头承诺效果指标——模型能力有边界（幻觉无法根除），写进合同的数字必须是自己评测集上实测过的。"
        }
      },
      {
        q: "FDE 需要哪些硬技能？你怎么针对性准备？",
        guide: {
          考点: "岗位技能地图与自我定位——考察准备是否系统。",
          答题框架: "三层技能：① 工程硬功——Python、API、数据库、部署上线、全栈基础；② AI 交付核心——RAG、Agent 开发、MCP 实战、评估与调试（生产化）；③ 交付方法——vibe coding 快速出原型、走完「需求→报价→交付→验收」全流程。软能力：读懂陌生行业的业务流程、驻场沟通（约 25% 时间出差）。准备路径：先做 2 个可复用交付模板（RAG 知识库模板 + Agent 工作流模板），再跑通一单全流程。",
          加分句: "字节、蚂蚁数科、智谱都在招 FDE，岗位发布量一年涨了 7 倍以上——这是「队友接单、我做技术支持」模式的正规军出口。",
          避坑: "别只堆技术——FDE 面试一定会考沟通场景题（需求翻译、预期管理），纯技术思维过不了。"
        }
      },
      {
        q: "客户是国企，数据绝不能出内网、现场还物理隔离，AI 系统怎么交付？",
        guide: {
          考点: "私有化部署能力——to B 交付的硬约束场景，考察技术选型的边界感。",
          答题框架: "全链路内网化选型：① 模型——闭源 API 出局，选开源权重模型（Qwen、DeepSeek 系）私有化部署；② Embedding——选可本地运行的开源模型（BGE 中文效果优秀），不能用在线 API；③ 向量库——Chroma/Milvus 都可以内网部署；④ 算力——评估客户 GPU 资源，小模型 + QLoRA 微调私有化是常见组合（也是溢价最高的单子）。交付前先在仿真环境搭一套离线 pipeline 验证。",
          加分句: "数据不出内网不是障碍是选型题——开源模型 + 本地 Embedding + 内网向量库，整条链路都有成熟答案。",
          避坑: "别默认走闭源 API 方案再去「说服客户开放网络」——合规红线碰不得，先按物理隔离设计。"
        }
      },
      {
        q: "PoC 演示效果很好，一上生产环境效果就拉胯，可能是什么原因？",
        guide: {
          考点: "PoC 到生产的鸿沟——交付岗最痛的坑，考察你有没有真趟过。",
          答题框架: "分四类排查：① 数据差异——PoC 用的是清洗过的精选文档，生产资料格式乱、质量参差（扫描件、表格、过期版本混在一起）；② 评测集失真——PoC 问题是「出题人友好」的，真实用户提问口语化、多轮指代、还带错别字；③ 边界情况爆发——PoC 没覆盖的 badcase 在真实流量下批量出现；④ 护栏缺失——demo 没有拒答策略、没有超时降级。预防：PoC 阶段就用真实数据的真实问题测，评测集和客户共建。",
          加分句: "PoC 证明「可行」，生产考验「鲁棒」——两者的距离就是数据质量和边界 case 的距离。",
          避坑: "别拿 demo 数据的成绩单去签生产验收标准——演示效果 ≠ 生产效果，中间隔着一整套工程化。"
        }
      },
      {
        q: "客户直接问：「这套系统准确率能到多少？」你怎么回答？",
        guide: {
          考点: "预期管理 + 专业表达——随口报数字是交付大忌。",
          答题框架: "不拍脑袋，给方法论：① 准确率依赖客户的数据质量和问题分布，空口数字没有意义；② 提议共建评测集——从客户真实业务里抽 100-200 个典型问题（含边界 case），系统跑一遍出实测数字；③ 分层报数——事实问答类、流程办理类、开放闲聊类分开报，别用一个数概括；④ 把实测数字写进验收标准，同时写清「资料外问题拒答」不算错误。",
          加分句: "我不给您一个猜的数字，我给您一套测出数字的方法——评测集跑出来是多少就是多少。",
          避坑: "别随口承诺「95% 以上」——模型能力有边界（幻觉无法根除），写进合同的数字必须是评测集上实测过的。"
        }
      },
      {
        q: "估算题：给一个中型企业报 RAG 知识库项目的价格，你怎么拆解成本？",
        guide: {
          考点: "报价能力——接单/交付的商业基本功，考察成本结构意识。",
          答题框架: "拆四块：① 人天成本——需求调研、数据清洗建库、联调、评测、部署、文档培训，按阶段估人天；② 资源成本——API token 费用（按客户量级估：日轮数 × 每轮 token × 单价，中文 1 字 1-2 token）或私有化 GPU 成本；③ 风险溢价——数据质量差、需求可能变更的部分加 buffer；④ 复用抵扣——已有 RAG 模板的项目，骨架成本砍掉大半，这正是报价竞争力来源。呈现：需求清单 + 功能拆分 + 报价结构，可用 AI 辅助从客户沟通记录生成初稿。",
          加分句: "接单拼的是复用：同一套 RAG 骨架换客户的数据就是新单——模板越成熟，报价越有底气。",
          避坑: "别只报人天不算运营成本——token 费用是持续的，上线后谁付、怎么估，合同里必须写清。"
        }
      },
      {
        q: "项目交付完成后，客户又不断提新需求（「顺便再加个功能」），怎么处理？",
        guide: {
          考点: "范围管理——「按结果结算」模式下，需求蔓延是利润杀手。",
          答题框架: "四步：① 定性——判断是缺陷修复（原验收标准内该修的）还是新需求（标准外的）；② 新需求走变更流程——评估工作量、单独报价、排期，不默默加活；③ 留好依据——验收标准、会议纪要、确认邮件都是边界凭证；④ 经营关系——把新需求包装成「二期项目」的商机，而不是得罪人的拒绝。",
          加分句: "「顺便加个功能」不是麻烦是商机——但它走二期的合同，不走一期的尾款。",
          避坑: "别不好意思谈钱——免费加的需求没有尽头，范围蔓延一次不拦，项目利润就被吃光。"
        }
      },
      {
        q: "驻场时要快速读懂一个完全陌生行业（比如物流、律所）的业务流程，你的方法是什么？",
        guide: {
          考点: "FDE 核心软能力——技术可以补，行业理解速度决定交付速度。",
          答题框架: "三板斧：① 跟一线——找实际操作的人看他们怎么干活（而不是只听管理层讲），记录真实流程和痛点词；② AI 辅助消化——把访谈记录、行业资料丢给 AI，输出业务流程图、术语表、痛点清单，带着假设去第二轮访谈验证；③ 找 AI 切入点——优先找「重复、规则明确、资料可查」的环节（客服问答、单据抽取、报表生成），这是 RAG/Agent 最吃得开的地方。",
          加分句: "读懂行业的目标不是成为行业专家，是找到「AI 能解决什么问题」——这是 FDE 职责链条的第一环。",
          避坑: "别上来就谈技术方案——没搞懂业务流程之前推技术，等于没诊断就开药。"
        }
      }
    ]
  },
  {
    career: "大模型训练",
    icon: "🔬",
    items: [
      {
        q: "讲一下「预训练 → SFT → RLHF/DPO」的完整训练流程，每一步在解决什么问题？",
        guide: {
          考点: "训练全景图——训练岗开场必考，考察能否讲清每一步的目的而不是背名词。",
          答题框架: "① 预训练：next token prediction，在海量文本上学语言规律和世界知识，产出基座模型；② SFT：用「指令→理想回答」成对数据教模型听懂指令、按格式回答，产出「能对话」的模型；③ RLHF/DPO：用人类偏好数据对齐，让模型「说好话」——更有帮助、更真实、更无害。补一句趋势：DPO 无需训练奖励模型、更稳不易训飞，近年比 PPO 更流行。",
          加分句: "预训练学语言规律，SFT 教听懂话，RLHF/DPO 对齐说好话。",
          避坑: "别把 RLHF 说成「教知识」——知识主要在预训练和 SFT 注入，RLHF 调的是行为偏好。"
        }
      },
      {
        q: "LoRA 为什么有效又省显存？rank 怎么选？",
        guide: {
          考点: "LoRA 原理细节——训练/微调岗高频，考察是否理解低秩假设而不只是会调包。",
          答题框架: "原理：冻结原权重，在注意力层注入低秩矩阵 A×B（r 远小于原维度），基于「微调时的权重变化是低秩的」这一假设；可训练参数降到 1% 以下，消费级 24GB 显卡可微调 7B 模型。rank 选择：常用 8-64，任务越复杂 rank 越大，但过大会过拟合且失去省显存意义。进阶加分：LoRA 学习率通常比全参微调大 1-2 个数量级（冻结主干、小参数量需要更快收敛）；训练产物是几十 MB 适配器，可选择 merge 回主模型或运行时挂载切换。",
          加分句: "QLoRA 再把原权重量化成 4-bit 加载，显存再降一半以上，单卡 24GB 可微调 13B-33B 级模型。",
          避坑: "别说「rank 越大越好」——r 过大违背低秩初衷，数据量少时还会过拟合。"
        }
      },
      {
        q: "手算一下：7B 模型全参数微调大概需要多少显存？",
        guide: {
          考点: "显存估算——训练岗硬功夫，要报得出数字和构成。",
          答题框架: "经验公式：参数×2（bf16 权重）+ 参数×8（Adam 优化器状态 fp32 + 梯度）+ 激活值。7B 算下来：权重 bf16 ≈ 14GB，Adam 优化器状态（fp32 的动量+方差，即参数×8）≈ 56GB，再加梯度和激活，合计 60GB+。结论：单卡消费级显卡玩不动全参微调，所以实际都用 LoRA/QLoRA 或分布式（DeepSpeed ZeRO 切分优化器状态）。",
          加分句: "全参微调 7B 要 60GB 起步，这就是为什么 LoRA 成了事实标准。",
          避坑: "别只报「权重 14GB」——训练显存大头是优化器状态和梯度，不是权重本身；推理和训练的显存账是两本账。"
        }
      },
      {
        q: "SFT 和 RLHF/DPO 的区别是什么？PPO 和 DPO 怎么选？",
        guide: {
          考点: "后训练方法对比——考察对偏好优化路线的理解深度。",
          答题框架: "SFT 用「标准答案」监督学习，教模型按指令干活；RLHF/DPO 用「偏好对」（哪个回答更好）做对齐。PPO 路线：先训奖励模型学人类偏好，再用强化学习在线优化，效果好但流程复杂、容易训飞。DPO：直接用偏好对做对比学习，无需奖励模型、无需在线采样，更稳定、工程成本低，是当前主流选择之一。选型：资源充足追求上限、有 RL 积累 → PPO/GRPO；快速迭代、数据规模有限 → DPO。",
          加分句: "DPO 把「训奖励模型 + 强化学习」两步并成一步对比学习，稳定性是最大卖点。",
          避坑: "别把 DPO 说成全面替代 RL——对需要在线探索的任务（如推理模型的 RL 训练），PPO/GRPO 类方法仍是主力。"
        }
      },
      {
        q: "什么时候该微调，什么时候用 RAG？",
        guide: {
          考点: "微调 vs RAG 的边界——几乎每场面试的开场白，训练岗答不好这题直接出局。",
          答题框架: "本质区别：RAG 是开卷考试（知识在资料里，答题时查），微调是把知识背进脑子（改模型参数）。判据：知识更新类需求（公司制度、产品手册、最新资讯）→ RAG，更新文档即可；行为/格式/风格类需求（稳定输出特定格式、独特语气、领域术语理解）→ 微调。工程顺序：先 Prompt → 再 RAG → 最后才微调。信号：few-shot 示例撑爆上下文、已有数百条以上高质量成对数据、任务模式固定 → 值得微调。",
          加分句: "生产惯例是 RAG-First：微调灌知识既贵又会随模型更新失效，知识交给 RAG，微调留给行为。",
          避坑: "别答「微调上限更高所以优先微调」——成本（数据+算力+周级周期）和知识时效性让它不适合做知识载体。"
        }
      },
      {
        q: "想入行大模型训练方向，现实的切入点是什么？（考察你对岗位生态的认知）",
        guide: {
          考点: "对训练方向内部分层的清醒认知——预训练研究岗对多数人基本关闭。",
          答题框架: "训练方向分层：预训练（门槛极高，顶会论文+博士常态，岗位极少）；后训练 SFT/RLHF（高，但硕士/优秀本科有机会）；训练 Infra（系统+GPU 功底）；训练数据工程（门槛中低，最现实的入口——数据配比、清洗、合成、质量评估）。现实路径：数据工程 → 后训练的斜线切入；学习上手写一遍 GPT（从零实现 LLM）是「识字关」，再用 LLaMA-Factory 跑通一次完整的 LoRA + DPO。",
          加分句: "先懂数据怎么造，再懂模型怎么练——「数据工程 → 后训练」是最现实的上坡路。",
          避坑: "别一上来就说「我要做预训练」——不了解岗位分层会显得对行业没有基本认知；也别以为会调 LoRA 就等于会训练。"
        }
      },
      {
        q: "LoRA 的 target_modules 一般选哪些层？学习率为什么比全参微调大 1-2 个数量级？",
        guide: {
          考点: "LoRA 超参细节——从「会跑」到「懂调」的区分题，面经高频。",
          答题框架: "target_modules：经典做法是打在注意力层的 q_proj、v_proj 上（peft 示例配置就是如此），追求更强效果可扩展到 k_proj、o_proj 甚至前馈层，代价是参数量和显存上升。学习率：全参微调常用 1e-5~2e-5 量级，LoRA 常用 1e-4 量级——因为主干冻结、可训练参数只有不到 1%，小参数量需要更大的步子才能有效收敛。",
          加分句: "LoRA 学习率比全参大 1-2 个数量级不是调出来的玄学，是「冻结主干 + 极小参数量」的必然结果。",
          避坑: "别拿全参微调的学习率直接训 LoRA——步子太小，低秩矩阵还没学会就早停了，效果差还找不到原因。"
        }
      },
      {
        q: "SFT 大概需要多少条数据？数据质量上有什么讲究？",
        guide: {
          考点: "SFT 数据观——数量级概念 + 质量红线，数据出身面试者的主场题。",
          答题框架: "数量级：数百到数万条高质量训练样本（任务越专越少也能见效，通用指令遵循需要更大规模）。质量红线：① 答案准确——错答案直接教坏模型；② 格式一致——输入输出结构统一；③ 覆盖任务变体——别让模型只会一种问法；④ 去重去矛盾——重复样本改变配比，矛盾标注让输出不稳定；⑤ JSONL 格式，每行一条 instruction/output。",
          加分句: "SFT 数据的口头禅是「宁缺毋滥」——几百条精标数据，胜过几万条脏数据。",
          避坑: "别堆数量冲规模——低质量、互相矛盾的样本直接教坏模型，质量永远大于数量。"
        }
      },
      {
        q: "KV Cache 是什么？为什么说它既是推理加速的核心又是显存大头？",
        guide: {
          考点: "推理优化基础——训练岗也要懂推理，KV Cache 是必考概念。",
          答题框架: "原理：生成每个新 token 时，注意力需要所有历史 token 的 K/V 矩阵；KV Cache 把这些缓存起来，避免每生成一个 token 就重算全部注意力——计算量从平方级降到线性，是推理加速的核心。代价：缓存随序列长度线性增长，长上下文 + 高并发时占的显存甚至超过模型权重本身，所以说它是显存大头。进阶：vLLM 的 PagedAttention 用操作系统的分页思想管理 KV Cache，吞吐提升 3-5 倍。",
          加分句: "KV Cache 是用显存换计算——省下了重算，背上了缓存，长上下文时代它是推理成本的主角。",
          避坑: "别把 KV Cache 说成「训练时的技术」——它是纯推理期的优化，和训练无关。"
        }
      },
      {
        q: "INT8/INT4 量化为什么能跑？精度损失各是多少？",
        guide: {
          考点: "量化数字——面试官要求「报得出数字」的硬核题。",
          答题框架: "原理：把权重从高精度浮点（fp16/bf16）压缩成 8/4 bit 整数存储和计算，显存占用成比例下降，配合量化感知的计算内核，精度损失可控。报数字：INT8 显存省 75%（相对 fp32）、精度损失约 1-2%，生产可用；INT4 显存省 87.5%、损失 10-15%，适合个人本地跑大模型（QLoRA 就是 4-bit 量化权重 + LoRA）；FP8 是浮点格式（E4M3/E5M2），损失比 INT8 还低，新卡支持好。",
          加分句: "INT8 显存 -75% 损失 1-2%，INT4 -87.5% 损失 10-15%——数字报得出来，这题就赢了。",
          避坑: "别只说「量化会损失精度」不给量级——INT8 和 INT4 的损失差着一个数量级，选型结论完全不同。"
        }
      },
      {
        q: "用户在 ChatGPT 里「教」了模型一个规则，下一条对话它又忘了——用训练和推理的关系解释这个现象。",
        guide: {
          考点: "训练 vs 推理的本质区分——看似简单的概念，是无数误解的根源。",
          答题框架: "解释：调 API 是推理——模型参数固定不动，用户的「教」只是进了当前对话的上下文（Prompt 层面），不会反向修改模型参数；新对话上下文清空，规则自然「忘了」。类比：训练是上学读书（厂商烧成千上万张 GPU 跑几个月，产出模型文件），推理是上考场答题（一次请求几厘到几分钱）。想真正「教会」模型行为，得走 SFT 微调改参数，或者把规则固化在 system prompt / 外部记忆里每轮注入。",
          加分句: "你的 Prompt 作用在推理阶段，不会反过来改变模型本身——「教模型」和「微调模型」是两回事。",
          避坑: "别说「模型会学习用户输入」——推理期参数不动，这是安全合规讨论里的基本前提。"
        }
      },
      {
        q: "为什么主流 LLM 都选 Decoder-only 架构？位置编码了解哪几种？",
        guide: {
          考点: "模型原理——算法/训练岗地基题，考察是否真懂架构演进而不只是背名字。",
          答题框架: "Decoder-only 胜出原因：① 训练效率高——next token prediction 目标简单统一，scaling 友好；② 生成能力强——自回归天然适合开放式生成；③ 工程生态成熟。Decoder-only 用因果掩码防止「偷看未来」。位置编码演进：正弦绝对位置编码（原始 Transformer）→ 可学习位置 embedding（GPT-2）→ RoPE 旋转位置编码（Llama/Qwen 主流，把相对位置信息编码进 Q/K 的旋转，利于长文本外推）→ ALiBi。",
          加分句: "BERT 时代 Encoder 唱主角，GPT 用 Decoder-only 赢下生成时代——RoPE 是现在 Llama/Qwen 的标配。",
          避坑: "别把位置编码说成「可有可无」——没有位置信息，自注意力就是「词袋」，语序完全丢失。"
        }
      }
    ]
  }
];

// Node 环境导出（供 .verify_quiz.py 校验用），浏览器中无 module 对象，不影响页面
if (typeof module !== "undefined" && module.exports) {
  module.exports = { QUIZ_TOPICS, CAREER_QUESTIONS };
}
