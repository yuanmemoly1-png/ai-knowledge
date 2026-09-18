// ============================================================
// PM 站 · 油管频道筛选
// 来源：蒸馏自 yt/01-博主与频道/01-博主总览与学习路线.md（你 2026-09-11 筛的那份）
//       + 2026-09-18 公开渠道核实补充
// 每个频道都标了「取内容难不难」——这决定了你能不能把它加工成笔记
// ============================================================

window.PM_YT = {
  generated: "2026-09-18",
  intro:
    "油管上的 PM 内容分两种：一种是「听观点」，一种是「能拿来做笔记」。区别在于官方给不给文字。下面每个频道都标了这一点。",

  tiers: [
    { id: "t1", name: "第一梯队", desc: "每周固定看，一手信息源" },
    { id: "t2", name: "第二梯队", desc: "按需补充，补基础概念与专项" },
    { id: "t3", name: "第三梯队", desc: "求职冲刺阶段再看" },
  ],

  /* 星级：3 = 必看，2 = 常看，1 = 选看 */
  channels: [
    /* ---------------- 第一梯队 ---------------- */
    {
      id: "lenny",
      tier: "t1",
      stars: 3,
      name: "Lenny's Podcast",
      host: "Lenny Rachitsky（前 Lyft 产品负责人）",
      track: "高级 PM + AI PM",
      scale: "全球第一大 PM 播客，360+ 期",
      why: "AI 时代 PM 转型的一手信息源。嘉宾全是 OpenAI、Anthropic、Netflix 的一线产品负责人，别的地方听不到这种颗粒度。",
      cost: "最好加工的一个。官方页免费给「WE DISCUSS 清单 + 完整时间轴 + referenced 链接」，逐字稿在付费墙后。少数期有免费 takeaways。",
      watch: [
        { t: "How Anthropic's product team moves faster than anyone else | Cat Wu", u: "https://www.youtube.com/watch?v=PplmzlgE0kg", note: "新版 PM 角色定义、PRD 与 Roadmap 的演化、PM 与工程师角色合并" },
        { t: "AI's third era: the rise of persistent AI coworkers | Tara Seshan", u: "https://www.youtube.com/watch?v=zMvBMfj4cSQ", note: "OpenAI 文化、AI 产品策略等于快速实验、agent 成为同事后 PM 怎么变" },
        { t: "Boris Cherny（Claude Code 创造者）", u: "https://www.youtube.com/results?search_query=Boris+Cherny+Lenny", note: "频道史上最火的一期" },
        { t: "Dianne Penn（Anthropic 首位技术 PM）", u: "https://www.youtube.com/results?search_query=Dianne+Penn+Lenny", note: "token maxing、jagged edge、living in the future" },
        { t: "Elizabeth Stone（Netflix CPTO）", u: "https://www.youtube.com/results?search_query=Elizabeth+Stone+Netflix+CPTO+Lenny", note: "为什么 AI 时代 Netflix 要招系统思考者" },
        { t: "Hamel Husain & Shreya Shankar", u: "https://www.youtube.com/results?search_query=Hamel+Husain+Shreya+Shankar+evals+Lenny", note: "AI 评测为什么是产品人最该学的新技能" },
      ],
    },
    {
      id: "aakash",
      tier: "t1",
      stars: 3,
      name: "Aakash Gupta",
      host: "前 Affirm / Epic Games / ThredUp 产品 VP",
      track: "AI PM 实操",
      scale: "Product Growth Newsletter 23.6 万订阅",
      why: "Playbook 型，每期给可照抄的步骤和工具栈，落地性最强。想动手不想听道理，先看这个。",
      cost: "好加工。每期有免费 newsletter 文字版，含 takeaways 与章节时间轴，质量很高。",
      watch: [
        { t: "Complete Course: AI Product Management（与 Pawel Huryn）", u: "https://www.youtube.com/watch?v=IfW1FMDkw4k", note: "零基础先看这期" },
        { t: "How to 10x your productivity as a PM with AI tools", u: "https://www.youtube.com/watch?v=YKYQ-z6A9Fs", note: "Berkeley ProductCon 演讲，20/60/20 用 AI 法则" },
        { t: "The Skill Every Product Manager MUST Learn in 2026", u: "https://www.youtube.com/watch?v=whYs9JpLx8I", note: "Atlassian 演讲，15 分钟 AI 原型工作流" },
      ],
    },
    {
      id: "latentspace",
      tier: "t1",
      stars: 3,
      name: "Latent Space",
      host: "swyx & Alessio Fanelli（AI Engineer 概念提出者）",
      track: "FDE 转型",
      scale: "YouTube 63 万+",
      why: "FDE 一线真实工作模式的一手访谈。部署方式、客户沟通、商业化、和 PM 的分工，都在这。",
      cost: "最好加工的一个。Q&A 全文免费，是 FDE 线的首选底稿。",
      watch: [
        { t: "The Dirty Secret of Forward Deployed Engineering | Natalie Meurer（Sierra）", u: "https://www.youtube.com/watch?v=Byv311hdoHE", note: "FDE 到底是什么、和 PM 怎么分工" },
        { t: "Forward Deployed: Voice AI on what works in 2026 | Jesse Zhang（Decagon）", u: "https://www.youtube.com/results?search_query=Latent+Space+Forward+Deployed+Jesse+Zhang", note: "FDE 视角看 2026 什么真的能落地" },
      ],
    },
    {
      id: "pawel",
      tier: "t1",
      stars: 2,
      name: "Pawel Huryn",
      host: "专职 AI PM 博主",
      track: "AI PM",
      scale: "Substack 头部 AI PM newsletter，LinkedIn 19 万粉",
      why: "每周 AI 产品 demo 加拆解。和 Aakash 那门完整课是最佳入门组合。",
      cost: "好加工。每期有免费 newsletter 文字版。",
      watch: [
        { t: "Complete Course: AI Product Management（与 Aakash Gupta 合讲）", u: "https://www.youtube.com/watch?v=IfW1FMDkw4k", note: "同一期，两边都发过" },
      ],
    },

    /* ---------------- 第二梯队 ---------------- */
    {
      id: "howiai",
      tier: "t2",
      stars: 2,
      name: "How I AI",
      host: "Lenny 出品",
      track: "AI PM 提效",
      scale: "—",
      why: "每期教一个具体 AI 工作流。PM 用 AI 提效的最佳实践，评测与错误分析相关的单集密度高。",
      cost: "中等。同属 Lenny 体系，加工方式一致。",
      watch: [{ t: "站内按主题搜「evals」「error analysis」", u: "https://www.youtube.com/results?search_query=How+I+AI+evals", note: "先挑评测相关的单集" }],
    },
    {
      id: "productexperience",
      tier: "t2",
      stars: 2,
      name: "The Product Experience",
      host: "Mind the Product",
      track: "PM 通识",
      scale: "—",
      why: "PM 的「操作系统」：发现、领导力、组织设计、AI。补基础概念用这个。",
      cost: "中等。官网每期给节目介绍与要点整理，不是逐字稿。",
      watch: [
        { t: "YouTube 频道（按主题搜单集）", u: "https://www.youtube.com/results?search_query=Mind+the+Product+podcast", note: "视频版同内容，但取文字还是用官网" },
        { t: "官网单集页（含要点与章节时间轴）", u: "https://www.mindtheproduct.com/podcast/", note: "取内容用官网页，别去抓 YouTube watch 页" },
      ],
    },
    {
      id: "romanpichler",
      tier: "t2",
      stars: 2,
      name: "Roman Pichler",
      host: "Roman Pichler（《Strategize》作者）",
      track: "高级 PM · 产品战略与领导力",
      scale: "20 年产品领导力顾问，四本著作",
      why: "产品战略这块最系统的讲者。他发明的 Product Vision Board、GO Product Roadmap、Strategy Stack 被很多团队直接用。想补「怎么定战略」而不是「怎么排需求」，看这个。",
      cost: "中等。他自己的博客与播客都有文字，YouTube 上也有大量战略专题视频。",
      added: "2026-09-18 核实补充",
      watch: [
        { t: "Product Strategy with Roman Pichler（深度对谈）", u: "https://www.youtube.com/watch?v=yWMJsagxDgw", note: "他的四段式框架：愿景如何连到路线图与待办" },
        { t: "The Top Reasons Why a Product Strategy Fails", u: "https://www.youtube.com/watch?v=tdJi3BAzeHY", note: "战略为什么失败，反面清单" },
        { t: "他的官网（博客与播客文字版）", u: "https://www.romanpichler.com/about-roman", note: "比视频更好加工" },
      ],
    },
    {
      id: "techwithtim",
      tier: "t2",
      stars: 2,
      name: "Tech With Tim",
      host: "Tech With Tim",
      track: "FDE 认知",
      scale: "206 万订阅技术频道",
      why: "FDE 岗位为什么爆发、技能栈、三步快速路径、面试长什么样。FDE 认知第一课。",
      cost: "低。内容直白，可直接整理成笔记。",
      watch: [{ t: "How to Become a Forward Deployed Engineer in 2026", u: "https://www.youtube.com/watch?v=vLlIBT0HSSc", note: "FDE 认知第一课" }],
    },
    {
      id: "krishnaik",
      tier: "t2",
      stars: 1,
      name: "Krish Naik",
      host: "Krish Naik",
      track: "FDE 技术栈",
      scale: "—",
      why: "偏工程视角的完整技术路线：Python 到 RAG 到 Agentic AI 到部署运维。补技术栈用。",
      cost: "低。技术讲解型，适合跟着做项目。",
      watch: [{ t: "Complete AI Forward Deployed Engineer Roadmap With Usecases", u: "https://www.youtube.com/watch?v=avoCzARQ5oc", note: "跟着做 1 个可部署的小项目" }],
    },
    {
      id: "productschool",
      tier: "t2",
      stars: 1,
      name: "Product School",
      host: "Product School",
      track: "PM 通识",
      scale: "Virtual Product Summit 全程录像",
      why: "大厂 PM 分享、峰会全程录像。入门通识够用。",
      cost: "低。演讲型，结构清楚。",
      watch: [{ t: "Virtual Product Summit 全程", u: "https://www.youtube.com/results?search_query=Product+School+Virtual+Product+Summit", note: "挑标题带 AI 的场次" }],
    },
    {
      id: "danolsen",
      tier: "t2",
      stars: 2,
      name: "Dan Olsen / Lean Product Meetup",
      host: "Dan Olsen（《Lean Product Playbook》作者）",
      track: "高级 PM",
      scale: "长期发布顶级产品人演讲",
      why: "PM 大师的一手演讲库。Gibson Biddle 的产品感觉演讲、Marty Cagan 的多期都在这。",
      cost: "低。演讲视频，结构本身就是提纲。",
      watch: [
        { t: "Gibson Biddle（前 Netflix VP Product）Product Sense 演讲", u: "https://www.youtube.com/watch?v=4OeAP9XUliU", note: "配他的 DHM / GEM / GLEe 框架一起看" },
        { t: "Marty Cagan 相关场次", u: "https://www.youtube.com/results?search_query=Dan+Olsen+Marty+Cagan", note: "产品基本功那条线" },
      ],
    },
    {
      id: "uncapped",
      tier: "t2",
      stars: 2,
      name: "Uncapped with Jack Altman",
      host: "Jack Altman",
      track: "FDE + AI 行业视角",
      scale: "官网有全文",
      why: "AI 创始人高管访谈，节奏快话题前沿。2026 年 5 月那期聊了 OpenAI 历史、Codex 与 FDE 的战略地位。",
      cost: "好加工。官网给全文。",
      watch: [
        { t: "YouTube 频道", u: "https://www.youtube.com/results?search_query=Uncapped+Jack+Altman", note: "视频版，先看 2026-05 那期" },
        { t: "官网全部单集（含全文）", u: "https://uncappedpod.com", note: "官网给全文，比视频好加工" },
      ],
    },

    /* ---------------- 第三梯队 ---------------- */
    {
      id: "aced",
      tier: "t3",
      stars: 3,
      name: "Aced（原 Exponent）",
      host: "Stephen Cognetta（联合创始人，前 Google PM）",
      track: "PM 面试",
      scale: "YouTube 50.9 万订阅，被斯坦福 / 耶鲁等授权使用",
      why: "PM 面试模拟题的头部频道。真实 mock interview 全程录下来，能直接看到「好答案长什么样」和面试官怎么追问。求职冲刺阶段优先看。",
      cost: "低。视频本身就是标准答案示范，可逐条整理成答题框架。",
      added: "2026-09-18 核实补充",
      watch: [
        { t: "How to Answer ANY Product Management Interview Question", u: "https://www.youtube.com/watch?v=dNtks5NfUwc", note: "听题、记笔记、停顿、作答的完整结构" },
        { t: "Prototyping in Interviews | Theory & Practice", u: "https://www.youtube.com/results?search_query=Aced+Exponent+Prototyping+in+Interviews", note: "面试里现场做原型怎么答" },
        { t: "频道主页", u: "https://www.youtube.com/@tryexponent", note: "注意频道已改名 Aced，老链接仍可跳转" },
      ],
    },
    {
      id: "igotanoffer",
      tier: "t3",
      stars: 2,
      name: "IGotAnOffer",
      host: "IGotAnOffer",
      track: "行为面",
      scale: "—",
      why: "FDE 行为面 mock interview。看别人怎么答，比看方法论有用。",
      cost: "低。mock 视频结构固定。",
      watch: [{ t: "FDE 行为面 Mock Interview", u: "https://www.youtube.com/watch?v=-Y6YmuqGLpY", note: "对着练一遍" }],
    },
    {
      id: "mehulmohan",
      tier: "t3",
      stars: 1,
      name: "Mehul Mohan",
      host: "Mehul Mohan",
      track: "FDE 入门",
      scale: "—",
      why: "FDE 是什么、怎么成为 FDE，入门级讲解。",
      cost: "低。",
      watch: [{ t: "What is FDE and how to become one", u: "https://www.youtube.com/results?search_query=Mehul+Mohan+FDE", note: "站内搜索" }],
    },
  ],

  /* FDE 一手从业者资源：不是访谈，是真实工作与面试的原始材料 */
  fde: [
    { t: "Palantir 官方：The Role of a Forward Deployed Software Engineer", u: "https://www.youtube.com/watch?v=5OYy_UtINo4", kind: "官方视频", note: "FDE 概念的源头与官方定义" },
    { t: "a16z：How Palantir Scaled", u: "https://www.youtube.com/watch?v=3c0iaLanhyk", kind: "深度访谈", note: "Palantir 首席架构师讲 FDE 模式怎么成为公司核心方法论" },
    { t: "Palantir Blog：A Day in the Life of a Palantir FDSE", u: "https://blog.palantir.com/a-day-in-the-life-of-a-palantir-forward-deployed-software-engineer-45ef2de257b1", kind: "文字", note: "驻场美军客户的 FDSE 真实一天" },
    { t: "Palantir FDE Guide 2026（DataInterview）", u: "https://www.datainterview.com/blog/palantir-forward-deployed-engineer-interview", kind: "文字", note: "典型工作周加面试全流程与薪资" },
    { t: "OpenAI FDE 面试流程全记录（Gaijineer）", u: "https://gaijineer.co/openai-forward-deployed-engineer-interview-process", kind: "文字", note: "5 小时 take-home 加视频讲解，OpenAI 考什么" },
  ],

  /* 怎么取内容：这是筛选里最实用的一条，决定了加工成本 */
  costNotes: [
    "Lenny's Podcast：官方页免费给「WE DISCUSS 清单 + 完整时间轴 + referenced 链接」，逐字稿在付费墙后。搭配官方推文与公开转述源加工，并标注「部分源」。",
    "Latent Space：Q&A 全文免费，FDE 线的首选底稿。",
    "Aakash / Pawel：每期有免费 newsletter 文字版，含 takeaways 与章节时间轴，质量极高。",
    "The Product Experience / Mind the Product：只给节目介绍与要点整理，不是逐字稿。",
    "YouTube watch 页直接抓取拿不到内容（返回的是 JS 空壳）。改用 web_search 快照加官方描述替代。",
    "所以判断一个频道值不值得加工，先看它有没有官方文字版。没有文字的，听一遍拿观点就好，别硬做笔记。",
  ],

  /* 按周执行的路线 */
  route: [
    {
      stage: "阶段 1 · 认知打底（第 1-2 周）",
      goal: "搞清楚「AI 时代的高级 PM」和「FDE」分别是什么",
      items: [
        "Aakash 与 Pawel《Complete Course: AI Product Management》，建立全景",
        "Tech With Tim《How to Become a Forward Deployed Engineer in 2026》，FDE 认知",
        "Lenny 与 Cat Wu 那期，新版 PM 角色定义",
      ],
      out: "每期产出一篇视频笔记",
    },
    {
      stage: "阶段 2 · 方法论深入（第 3-6 周）",
      goal: "掌握 AI PM 核心方法：快速实验、评测、原型、新版 PRD",
      items: [
        "Lenny 与 Tara Seshan、Boris Cherny、Dianne Penn 三期",
        "评测专题（Hamel Husain 两期）",
        "Pawel Huryn 每周 newsletter 与 demo",
      ],
      out: "沉淀 3 到 5 篇专题笔记",
    },
    {
      stage: "阶段 3 · FDE 专项（第 7 周起，持续）",
      goal: "建立 FDE 技能树与技术栈",
      items: [
        "Latent Space FDE 系列（Natalie Meurer / Decagon）",
        "一手从业者资源：Palantir 官方视频、a16z FDE 模式访谈、FDSE 真实一天",
        "Krish Naik 技术路线，跟着做一个可部署的小项目",
      ],
      out: "更新 FDE 转型路线",
    },
    {
      stage: "阶段 4 · 输出倒逼输入（持续）",
      goal: "别只看，要产出",
      items: [
        "每 5 期视频做一次专题合并，把视频笔记合成专题",
        "每月回看高级 PM 成长路线与 FDE 转型路线，校准方向",
      ],
      out: "专题笔记与路线更新",
    },
  ],
};
