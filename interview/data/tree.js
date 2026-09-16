// ============================================================
// AI 求职知识树 —— 深度学习主干
// 来源：访谈库《00-知识总纲》(五层) + 职业路径 + ai知识库技术线
// 结构：layer -> node -> { claim, points[], ev[](双语证据), notes[](深读笔记 key) }
// ============================================================

window.KNOWLEDGE_TREE = {
  title: "AI 求职知识树",
  subtitle: "一条主干，两个赛道：技术线（做出来） × 产品交付线（卖出去）",
  layers: [
    /* ---------------- 第 0 层 ---------------- */
    {
      id: "L0",
      no: "第 0 层",
      title: "技术地基",
      question: "你得先能做出来",
      answer: "没有地基，判断和交付都是空谈",
      intro:
        "面试官的第一刀永远砍在基础上。这一层是「能跑起来」的最小集合：语言 → 名词 → 应用 → 交付。技术线岗位（应用开发 / Agent / FDE）的简历里必须有这一层的产物。",
      nodes: [
        {
          id: "0.1",
          t: "语言与工程地基",
          claim: "Python 是 AI 时代的通用语，但要能写出「像样的程序」，不是会 print",
          points: [
            "顺序：变量/类型 → 条件循环 → 函数 → 列表字典 → 文件读写 → 异常 → 虚拟环境与包管理",
            "判定标准不是「看懂」，是隔天盖住原码能默写出来",
            "再往上：Git 存档、API 调用、SQL、测试、系统设计——这四样是 FDE 三桶技能里「不可协商」的第一桶",
          ],
          ev: [],
          notes: ["04-Python/Python学习路线.md", "00-小白课堂/小白课-Git存档术.md", "09-全栈开发/全栈学习路线.md"],
        },
        {
          id: "0.2",
          t: "AI 核心名词（能一句话讲清）",
          claim: "27 个高频名词，每个都必须能用一句白话 + 一个比喻讲给小白听",
          points: [
            "模型侧：LLM、Token、上下文窗口、温度、幻觉、多模态、世界模型",
            "增强侧：Embedding、RAG、微调、向量数据库",
            "Agent 侧：Agent、Function Calling、MCP、记忆",
            "工程侧：API、SDK/框架/库、数据库、部署、训练与推理、低代码 Workflow",
            "讲不清「Token 和上下文窗口的关系」= 第一轮就掉档",
          ],
          ev: [],
          notes: ["01-名词与概念/名词速查表.md", "01-名词与概念/LLM大语言模型.md"],
        },
        {
          id: "0.3",
          t: "AI 应用开发（RAG → Agent）",
          claim: "RAG 让 AI 记得更准，Agent 让 AI 干活更稳——这两个是应用岗的全部战场",
          points: [
            "RAG：离线（解析→切分→Embedding→入库）+ 在线（改写→混合检索→重排→生成→引用）",
            "Agent：四要素（规划 / 记忆 / 工具 / 行动）+ ReAct 循环 + 七种架构格式",
            "MCP：把「模型连工具」标准化；企业定制的主战场在编排层，不在模型层",
            "评估：Evals 是新 PRD——测不出来就等于没做出来",
          ],
          ev: [
            {
              zh: "当代码变便宜后，值钱的是：翻译模糊问题、可靠部署、对结果负责",
              en: "When code gets cheap, outcomes matter",
              src: "Natalie Meurer · Sierra",
              url: "https://www.youtube.com/watch?v=Byv311hdoHE",
            },
          ],
          notes: ["02-AI-Agent开发/Agent开发总览.md", "01-名词与概念/RAG检索增强生成.md", "02-AI-Agent开发/MCP协议实战.md"],
        },
        {
          id: "0.4",
          t: "从作品到交付",
          claim: "简历不如 Demo：一个能演示、能部署的作品，胜过一整页技能清单",
          points: [
            "作品三段论：客户问题 → 我的方案 → 交付的结果（量化数据）",
            "部署不是加分项，是及格线：Docker + 云 + 可观测性",
            "评审自问：如果模型能力 +30%，这个方案要不要重做？（为未来模型构建）",
          ],
          ev: [],
          notes: ["03-AI辅助开发/AI辅助开发总览.md", "09-全栈开发/全栈学习路线.md", "07-工具与资源/资源总览.md"],
        },
      ],
    },

    /* ---------------- 第 1 层 ---------------- */
    {
      id: "L1",
      no: "第 1 层",
      title: "变革判断",
      question: "世界怎么了",
      answer: "世界换了地基",
      intro:
        "这一层回答「为什么你要改变学习方向」。四个论断环环相扣，构成后面所有方法论的前提。面试里谈行业判断时，说的就是这一层。",
      nodes: [
        {
          id: "1.1",
          t: "代码正在被 AI 写掉，决策成为新瓶颈",
          claim: "瓶颈从「写出来」转移到「决定建什么」和「让代码进生产」",
          points: [
            "Anthropic 内部一手数据：90% 代码由 AI 编写；多数公司一年内到达同一点",
            "含义：花十年练「写」，不如从今天练「判断」",
            "对求职的含义：岗位不要的是「只会翻译需求为代码」的人，要的是「能定义问题、能验收结果」的人",
          ],
          ev: [
            {
              zh: "90% 的代码已经是 AI 写的，瓶颈转移了",
              en: "90% of the code is written by AI… the bottleneck has shifted",
              src: "Mike Krieger · Anthropic CPO",
              url: "https://www.lennysnewsletter.com/p/anthropics-cpo-heres-what-comes-next",
            },
          ],
          notes: ["yt/02-视频笔记/2025-06-05_MikeKrieger_Anthropic-CPO.md", "yt/03-知识专题/00-知识总纲.md"],
        },
        {
          id: "1.2",
          t: "模型能力是移动的地基：为未来构建",
          claim: "今天的 AI 是你余生用过的最差 AI——别围绕当前局限搭脚手架",
          points: [
            "Model Maximalism（Kevin Weil）：模型能力持续上涨，基于当下短板做的工程会变成负债",
            "操作版（Tara Seshan）：为 2-3 个月后的模型做产品；评审加一问「若能力 +30% 要不要重做」",
            "实践法（Dianne Penn）：模型发布周做 token maxing——3 小时高密度亲手使用，能力边界笔记从实验里长出来",
            "认知底座（Dario）：宏观曲线可预测，具体能力何时涌现像天气一样不可测",
            "反面动作：维护一份「拐杖清单」——为模型短板造的功能，模型追上就删",
          ],
          ev: [
            {
              zh: "今天的 AI 是你余生用过的最差的 AI",
              en: "The AI you use today is the worst AI you'll ever use",
              src: "Kevin Weil · OpenAI CPO",
              url: "https://www.lennysnewsletter.com/p/kevin-weil-open-ai",
            },
            {
              zh: "为模型两三个月后所处的位置构建",
              en: "Build for where the models will be in two or three months",
              src: "Tara Seshan · OpenAI",
              url: "https://www.youtube.com/watch?v=zMvBMfj4cSQ",
            },
          ],
          notes: [
            "yt/02-视频笔记/2025-04-10_KevinWeil_OpenAI-CPO.md",
            "yt/02-视频笔记/2026-08-30_TaraSeshan_Persistent-AI-Coworkers.md",
            "yt/02-视频笔记/2023-08-08_DarioAmodei_Dwarkesh-Scaling.md",
          ],
        },
        {
          id: "1.3",
          t: "智能是锯齿状的，不是一条谱",
          claim: "同一个模型，有的任务 99.95% 精度、相邻任务只有 60%——这是产品设计的第一约束",
          points: [
            "Dario：同一个模型，「像实习生」的领域和「超人 savant」的领域并存",
            "Sam Altman：某些方面是超人类天才，另一些方面是笨拙的幼儿",
            "工程含义：交互必须按精度分布设计，不能一刀切「全自动」",
            "测出这条锯齿线，正是 Evals 存在的理由",
          ],
          ev: [
            {
              zh: "锯齿状智能：同一模型在不同任务上落差巨大",
              en: "jagged intelligence — superhuman genius in some ways, dumb toddler in others",
              src: "Sam Altman",
              url: "https://www.youtube.com/watch?v=XDB5beon4DY",
            },
          ],
          notes: ["yt/02-视频笔记/2026_SamAltman_AGI-Compute-Human-Agency.md", "yt/03-知识专题/专题-A2-AI评测Evals.md"],
        },
        {
          id: "1.4",
          t: "速度成为新护城河，但快而不假",
          claim: "发布节奏 months → weeks → days；当下速度比战略更重要",
          points: [
            "Cat Wu：PM 的本职是把发布摩擦降到最低",
            "快与严谨不冲突——评测指标化（Evals）让「每周发布」可信",
            "「快」的组织前提：使命对齐替代流程对齐；事故文化是「流程失败，不是人的失败」",
            "明码标价的代价：牺牲产品一致性——故意让功能重叠上线，用市场反馈替代内部评审",
          ],
          ev: [
            {
              zh: "速度比战略更重要（当下）；PM 的职责是消除发布摩擦",
              en: "Speed is more important than strategy right now",
              src: "Cat Wu · Anthropic",
              url: "https://www.youtube.com/watch?v=PplmzlgE0kg",
            },
          ],
          notes: ["yt/02-视频笔记/2026-04-23_CatWu_Anthropic-Shipping.md", "yt/03-知识专题/专题-A1-快速实验与PM角色重构.md"],
        },
      ],
    },

    /* ---------------- 第 2 层 ---------------- */
    {
      id: "L2",
      no: "第 2 层",
      title: "能力模型",
      question: "你要变成什么样",
      answer: "掌舵者，不是划桨人",
      intro:
        "第 1 层的四个论断指向同一结论：执行（划桨）交给 AI，人的价值上移到判断与方向（掌舵）。这一层定义你要练的能力。",
      nodes: [
        {
          id: "2.1",
          t: "从 Rowing 到 Steering：判断力 + 雄心",
          claim: "写文档、盯执行这类「划桨」交给 AI；人留下判断力（judgment）与雄心（ambition）",
          points: [
            "两样不可外包：判断力 + 雄心；而且「抬升他人的雄心」本身就是关键产出",
            "练判断力的日常动作：写作即思考——为判断写 500 字推理，而不是汇报结论",
            "面试含义：面试官问「你怎么选」时，考的是你有没有「什么不做」的清单",
          ],
          ev: [
            {
              zh: "把划桨交给 AI，人负责掌舵：判断力与雄心",
              en: "rowing → steering: judgment and ambition",
              src: "Tara Seshan · OpenAI",
              url: "https://www.youtube.com/watch?v=zMvBMfj4cSQ",
            },
          ],
          notes: ["yt/02-视频笔记/2026-08-30_TaraSeshan_Persistent-AI-Coworkers.md", "yt/04-职业路径/01-高级PM成长路线.md"],
        },
        {
          id: "2.2",
          t: "PM 角色光谱：深嵌派 vs 专科派",
          claim: "两派针锋相对，但共识只有一条：PM（如果有）必须离用户更近、离动手更近",
          points: [
            "深嵌派（Krieger）：PM 深嵌研究团队参与 post-training，产出是「在模型上套 UX」的 10 倍",
            "专科派（Tom Verrilli）：「我们后悔产品管理存在」——PM 作为按需启用的专科，工程师直接贴近用户",
            "判断依据：如果做的东西任何人对着公开 API 都能做，就错过了机会",
            "你不需要站队，但面试时要知道光谱两端长什么样",
          ],
          ev: [
            {
              zh: "如果你做的东西，任何人对着公开 API 都能做出来，你就错过了机会",
              en: "If you build something that anyone can build on top of a public API, you're missing the opportunity",
              src: "Mike Krieger · Anthropic CPO",
              url: "https://www.lennysnewsletter.com/p/anthropics-cpo-heres-what-comes-next",
            },
          ],
          notes: ["yt/02-视频笔记/2026-08-02_TomVerrilli_Whatnot-PM之辩.md", "yt/03-知识专题/00-知识总纲.md"],
        },
        {
          id: "2.3",
          t: "四层通用力：判断 → 发现 → 交付 → 影响力",
          claim: "高级与普通的分野在 L1（决定什么不做）和 L4（让组织动起来）",
          points: [
            "L1 判断力：问题选择、优先级、品味——最难、最值钱",
            "L2 发现：用户研究、数据、机会识别",
            "L3 交付：快速实验、Evals、原型",
            "L4 影响力：叙事、跨职能、领导力",
            "练法：每周 1 个「不做清单」；每月 1 次公开输出",
          ],
          ev: [],
          notes: ["yt/04-职业路径/01-高级PM成长路线.md"],
        },
        {
          id: "2.4",
          t: "代码越便宜，通才越值钱",
          claim: "单纯专才贬值，跨「工程 × 客户 × 产品」的通才升值",
          points: [
            "Dario 与 Natalie Meurer 独立给出同一判断",
            "FDE 历来就是经典通才岗——这就是「双线并进」的底层依据",
            "对求职的含义：不要把自己锁死在单一技能栈；三桶技能里最弱的那桶就是你的天花板",
          ],
          ev: [
            {
              zh: "当写代码变便宜，通才会变得更有价值",
              en: "generalists will become more valuable",
              src: "Natalie Meurer · Sierra",
              url: "https://www.latent.space/p/forward-deployed-engineers-aiewf",
            },
          ],
          notes: ["yt/02-视频笔记/2026-07_NatalieMeurer_Dirty-Secret-FDE.md", "yt/03-知识专题/专题-C1-FDE角色认知.md"],
        },
      ],
    },

    /* ---------------- 第 3 层 ---------------- */
    {
      id: "L3",
      no: "第 3 层",
      title: "方法论",
      question: "具体怎么干",
      answer: "四件套 + 一条决策链",
      intro:
        "这一层是面试的主战场：Evals、快速实验、原型、编排。每一条都要能配一个「我项目里怎么做的」例子。",
      nodes: [
        {
          id: "3.1",
          t: "Evals = 新 PRD（最硬的新技能）",
          claim: "「能不能测」决定「能不能做好」——精度分布就是需求本身",
          points: [
            "Hamel & Shreya 五步：① 先人工做 error analysis（翻真实 traces 写 open codes）② 人先分类，LLM 后辅助 ③ 理论饱和即停 ④ axial coding 归类失败模式 ⑤ 为每个失败模式建评测，LLM-as-judge 要先用人类标注校准",
            "时间成本：初始搭建后每周约 30 分钟——评测不是重工程，是纪律",
            "AI PRD 四件套：结构化 prompt / 真实 I/O 示例 / 可接受方差 / 降级路径",
            "面试差异题：「你怎么知道你的 AI 系统真的在工作？」——手挥两下直接挂",
            "优化顺序纪律：zero-shot → few-shot → RAG → fine-tuning，每级升级前先评测",
          ],
          ev: [
            {
              zh: "评测的质量，实际上决定了 AI 产品潜力的上限",
              en: "The quality of evals effectively caps the potential of AI products",
              src: "Kevin Weil · OpenAI CPO（转述）",
              url: "https://www.lennysnewsletter.com/p/kevin-weil-open-ai",
            },
            {
              zh: "永远从错误分析开始（不要一头扎进写评测）",
              en: "Always start with error analysis — don't jump into writing evals",
              src: "Hamel Husain",
              url: "https://www.youtube.com/watch?v=0s1fT3XeGBU",
            },
            {
              zh: "95% 的自动化，其实不算自动化",
              en: "95% automation isn't really an automation",
              src: "Cat Wu · Anthropic",
              url: "https://www.youtube.com/watch?v=PplmzlgE0kg",
            },
          ],
          notes: ["yt/03-知识专题/专题-A2-AI评测Evals.md", "yt/02-视频笔记/2025-09-25_HamelShreya_AI-Evals.md", "02-AI-Agent开发/Agent评估与调试.md"],
        },
        {
          id: "3.2",
          t: "快速实验与发布纪律",
          claim: "AI 产品策略的本质 = 快速实验 + 为 2-3 个月后的模型构建",
          points: [
            "每次发布当作「验证一个 thesis 的实验」，而不是交付承诺",
            "对齐不靠流程文档：靠每周指标 readout + 团队原则文档",
            "Iterative Deployment：早发布、公开打磨；planning process > plans",
            "内部口头禅：「Is this maximally accelerated?」",
            "Launch Room 流水线：功能 ready 即进常驻发布室，统一打 research preview 标签降承诺",
          ],
          ev: [
            {
              zh: "就这么干（使命对齐替代流程对齐）",
              en: "Just do things.",
              src: "Cat Wu · Anthropic",
              url: "https://www.youtube.com/watch?v=PplmzlgE0kg",
            },
          ],
          notes: ["yt/03-知识专题/专题-A1-快速实验与PM角色重构.md", "yt/02-视频笔记/2026-04-23_CatWu_Anthropic-Shipping.md"],
        },
        {
          id: "3.3",
          t: "原型即 PRD / 最简 harness",
          claim: "最好的 AI 需求往往是「删什么」，不是「加什么」",
          points: [
            "Boris Cherny：他们砍掉了 80% 的 prompt——模型本来就能做到，是脚手架在挡路",
            "「give the model the simplest possible harness」——最简 harness 胜过复杂脚手架",
            "Pawel：Prompt 是 LLM 的 UX 层，不是小花招",
            "Weil：与其给静态设计稿，不如 vibe 一个可交互原型",
            "面试含义：讲方案时先说「能砍掉什么」，比堆功能加分得多",
          ],
          ev: [
            {
              zh: "给模型尽可能最简单的 harness",
              en: "Give the model the simplest possible harness",
              src: "Boris Cherny · Claude Code 创造者",
              url: "https://www.youtube.com/watch?v=qyPCVqFUyDo",
            },
          ],
          notes: ["yt/02-视频笔记/2026-07-27_BorisCherny_YC-StartupSchool.md"],
        },
        {
          id: "3.4",
          t: "MCP 与 Agent 编排：万物皆 endpoint",
          claim: "产品差异化的主战场在编排层，不在模型层",
          points: [
            "Krieger：MCP 可能是 Anthropic 最重要的发布——万物皆 MCP endpoint，数字世界可被 AI 编排",
            "Natalie：客户 agent = 「编排的模型星座」，定制大多发生在 orchestration 层",
            "Pawel：Agent = 会思考的 pipeline（意图分类 → 工具选择 → 执行逻辑 → 错误处理）",
            "journeys 模型：单一 agent 管全程交互，子任务叫 journeys",
            "FDE 视角：集成的单位从「API 对接」升级为「endpoint 暴露 + journeys 定义」",
          ],
          ev: [
            {
              zh: "一个被编排的模型星座",
              en: "an orchestrated constellation of models",
              src: "Natalie Meurer · Sierra",
              url: "https://www.latent.space/p/forward-deployed-engineers-aiewf",
            },
          ],
          notes: ["yt/03-知识专题/专题-D3-MCP与Agent编排.md", "02-AI-Agent开发/MCP协议实战.md", "02-AI-Agent开发/ReAct与Agent设计模式.md"],
        },
        {
          id: "3.5",
          t: "技术底座最小集：一条升级链",
          claim: "Prompting → AI PRD → Fine-tuning → RAG → MCP → Agents，别过早上工程",
          points: [
            "核心纪律：few-shot 提示常胜过 fine-tune；升级每一级前先评测",
            "选型三问：知识更新 → RAG；行为/风格 → 微调；格式约束 → Prompt/few-shot",
            "生产惯例 RAG-First",
            "这是 AI PM / FDE 的最小技术栈地图，也是面试「微调 vs RAG vs Prompt」题的标准骨架",
          ],
          ev: [],
          notes: ["yt/02-视频笔记/2025-04-22_PawelHuryn_AI-PM-Complete-Course.md", "01-名词与概念/微调Fine-tuning.md", "01-名词与概念/RAG检索增强生成.md"],
        },
      ],
    },

    /* ---------------- 第 4 层 ---------------- */
    {
      id: "L4",
      no: "第 4 层",
      title: "FDE 转型",
      question: "另一条腿怎么走",
      answer: "对结果问责的通才",
      intro:
        "FDE（Forward Deployed Engineer，注意 F 是 Forward 不是 Front-End）是国内 2026 年增长最快的 AI 岗位之一。这一层是它的全部考点。",
      nodes: [
        {
          id: "4.1",
          t: "角色本质：问责定义角色，不是技能清单",
          claim: "由「对客户结果的端到端问责」定义，不由技能清单定义",
          points: [
            "Palantir 起源：工程师被物理部署到客户现场，最早的活是「别让平台倒下」",
            "Natalie 判词：the role lacks a consistent definition——每家公司招的是不同的 vintage",
            "OpenAI JD 口径：discovery → scoping → system design → build → production rollout，用 eval-driven feedback 衡量成功",
            "Sierra 改名叫 Agent Engineer：名字要体现技术工作的形状",
            "交付实证：大企业最快 40-60 天上生产",
          ],
          ev: [
            {
              zh: "这个角色的定义，更多来自对客户的问责，而不是工作的形状",
              en: "more clearly defined by accountability to customers than by the shape of the role",
              src: "Natalie Meurer · Sierra",
              url: "https://www.latent.space/p/forward-deployed-engineers-aiewf",
            },
          ],
          notes: ["yt/03-知识专题/专题-C1-FDE角色认知.md", "yt/02-视频笔记/2026-07_NatalieMeurer_Dirty-Secret-FDE.md"],
        },
        {
          id: "4.2",
          t: "与 PM 合流：两条职业线正在靠拢",
          claim: "产品工程师该去见客户，FDE 该去建产品",
          points: [
            "PM 练的判断力、用户洞察、商业语言，正是 FDE 三桶里的第三桶——是迁移资产，不是从零开始",
            "所以「PM × FDE 双线并进」不是贪多，而是押注同一个能力内核",
          ],
          ev: [
            {
              zh: "如果你是产品工程师，你应该去和客户聊聊；如果你是前置部署工程师，你应该去建产品",
              en: "If you are a product engineer, you should be talking to customers. If you are a forward deployed engineer, you should be building the product.",
              src: "Natalie Meurer · Sierra",
              url: "https://www.latent.space/p/forward-deployed-engineers-aiewf",
            },
          ],
          notes: ["yt/04-职业路径/02-FDE转型路线.md"],
        },
        {
          id: "4.3",
          t: "入行：三桶技能栈 + 面试即工作",
          claim: "面试考的就是工作本身：先澄清再解决 → 出声拆解 → 用商业语言解释",
          points: [
            "① 真软件工程（Python/API/SQL/测试/系统设计）——不可协商的地基",
            "② AI 工程（LLM/RAG/Agent/Evals）——差异化",
            "③ 客户/软技能（澄清、出声拆解、商业语言）——PM 的迁移资产",
            "OpenAI 特色：约 5 小时 take-home + 录视频讲解 solution",
            "Palantir 特色：onsite 3-5 轮，含一轮「模拟客户互动」+ decomposition/estimation 题",
            "简历不如 Demo：给目标公司 FDE 发 2 分钟 Loom 演示你部署的项目",
          ],
          ev: [],
          notes: ["yt/02-视频笔记/2026-08-14_TechWithTim_FDE-2026.md", "yt/04-职业路径/02-FDE转型路线.md"],
        },
        {
          id: "4.4",
          t: "两个判断器：定价即信号 / 目标公司清单",
          claim: "按席位=卖工具，按用量=卖运行，按结果=卖 outcome——越靠右，这个 FDE 岗位越真",
          points: [
            "面 FDE 时反问：你们按什么计费？团队对什么指标负责？",
            "目标公司：OpenAI / Anthropic / Palantir / Databricks / Sierra / Decagon / Glean / Ramp",
            "策略：早期 AI 创业公司更容易进（可直接联系创始人）；锁定 20-30 个岗位",
          ],
          ev: [
            {
              zh: "定价即信号：席位 / 用量 / 结果",
              en: "Pricing: seats vs usage vs outcome",
              src: "Natalie Meurer · Sierra",
              url: "https://www.youtube.com/watch?v=Byv311hdoHE",
            },
          ],
          notes: ["yt/02-视频笔记/2026-07_NatalieMeurer_Dirty-Secret-FDE.md", "08-求职面试/AI职业全景.md"],
        },
      ],
    },

    /* ---------------- 第 5 层 ---------------- */
    {
      id: "L5",
      no: "第 5 层",
      title: "行动",
      question: "现在做什么",
      answer: "按周排出可交付的产出",
      intro:
        "知识到此闭环。这一层不是读的，是做的：每周一个交付物，做完回来勾掉。",
      nodes: [
        {
          id: "5.1",
          t: "第一周（Day 1-7）：每天一个输入 + 一个输出",
          claim: "7 天后你会有：一张认知地图 + 第一份错误分析报告",
          points: [
            "Day 1 定方向：写 3 行字——为什么学？30 天后想拿出什么？每周投入几小时？",
            "Day 2 AI PM 全景：Pawel 六模块（Prompting → AI PRD → Fine-tuning → RAG → MCP → Agents）",
            "Day 3 OpenAI 方法论：Model Maximalism / Evals 文化 / Bottom-up Velocity",
            "Day 4 Anthropic 节奏 + 开始攒 traces（连续存到 Day 6）",
            "Day 5 FDE 线开工：三桶自查打分，标出最弱桶",
            "Day 6 错误分析（本周最重要）：traces 逐条标注 open codes",
            "Day 7 合并复盘：选出 3 个失败模式",
          ],
          ev: [],
          notes: ["yt/04-职业路径/04-第一周启动指南.md"],
        },
        {
          id: "5.2",
          t: "30 天闭环：每周一个小交付",
          claim: "产出 1 套 evals 流程 + 1 个原型 + 1 份原则文档 + 1 个 Loom demo",
          points: [
            "W1 Evals 实操周 → 交付《我的 AI 工作流评测报告》（失败模式 × 精度分布 × 修复建议）",
            "W2 原型周 → 交付 原型链接 + 一页 AI PRD（四件套）",
            "W3 判断力周 → 交付 原则文档 + 一篇 500 字判断推理",
            "W4 Demo 周 → 交付 可发送的 demo 包 + 2 分钟 Loom",
            "30 天后自检：能讲清「Evals 为什么是新 PRD」并举自己的例子？有带 evals 数据的原型？Loom 自己愿意回看？三桶各涨一格？",
          ],
          ev: [],
          notes: ["yt/04-职业路径/03-实践闭环30天.md"],
        },
      ],
    },
  ],
};
