// ============================================================
// 《AI 时代的产品经理》· 单元 PM-E：新收集的 PM 访谈与教学
// 来源：全部为公开渠道，逐条在 distilled 末尾标注了取到的内容类型
// 采集日期：2026-09-18
// 说明：不重复收录 interview/data/interviews.js 里已有的场次
// ============================================================

window.PM_EXTRA = {
  generated: "2026-09-18",
  items: [
    {
      id: "teresa-torres-ai-evals",
      kind: "article",
      guest: "Teresa Torres",
      role: "Product Talk 创始人 ·《Continuous Discovery Habits》作者",
      channel: "Product Talk",
      title: "AI Evals: A Hands-On Guide for Product Teams",
      url: "https://www.producttalk.org/ai-evals",
      date: "—",
      lang: "en",
      distilled: "Teresa Torres 把评测直接接进她写了多年的持续发现体系。她给的定义很朴素，评测就是测量一个 AI 产品或者 AI 工作流有没有把活干好的那些方法。产品团队需要它，是因为今天几乎每个 PM 都在用 AI 写 PRD、整理访谈、读行为数据、总结会议记录，这些活干得好不好，过去只能靠感觉。\n\n她把常见评测拆成四类。金标准数据集、代码断言、LLM 当裁判、用户反馈。新手团队通常从金标准数据集起步，逻辑最直观，挑一批有代表性的输入，写上你认定的理想输出，再拿模型去对。她说 PM 嘴里讲的用表格做评测，多半指的就是这一类。\n\n她也直接点出这一类的问题。只有当任务存在唯一正确答案时才成立。答案本来就有很多种写法，你就没法把正确穷举干净。输入输出特别长的时候，比如一整份访谈记录，或者一棵机会解决方案树，金标准数据集根本铺不开。\n\n于是错误分析成了入口。先看坏长什么样，把错误归好类，修掉之后再补进数据集，久而久之，好的标准是被这样一点点攒出来的。她把评测和访谈、假设验证并列，因为它们都是让团队知道自己还在路上的反馈回路。\n\n来源说明：内容取自 Product Talk 官网公开文章正文，属于作者原文，非播客逐字稿。",
      takeaways: [
        "评测的定义很朴素：测量 AI 产品或者工作流有没有把活干好",
        "四类评测：金标准数据集、代码断言、LLM 当裁判、用户反馈",
        "金标准数据集只适合有唯一正确答案的任务，长输入长输出铺不开",
        "错误分析是入口，先看清坏，再慢慢攒出好的标准",
        "评测和访谈、假设验证同属发现习惯，都是反馈回路"
      ],
      quotes: [
        { zh: "AI 评测（evaluations 的简称）是测量一个 AI 产品或工作流表现好坏的方法。", en: "AI evals (short for evaluations) are methods for measuring whether an AI product or workflow is performing well." },
        { zh: "当你听到产品经理说评测是在表格里做的，他们通常指的是金标准数据集评测。", en: "When you hear product managers talking about evals as working in spreadsheets, they are typically referring to golden dataset evals." },
        { zh: "但它们只在你能定义一个正确输出的任务上有效。", en: "But they only work well for tasks where you can define one correct output." },
        { zh: "和其他发现习惯一样，评测可以充当反馈回路，确保我们还在正轨上。", en: "Similar to other discovery habits like interviewing and assumption testing, evals can act as a feedback loop to ensure we are on the right track." }
      ],
      why: "把评测从工程话题拉回产品话题的第一篇入门文，适合当 AI PM 的评测第一课。",
      tags: ["Evals", "PM 方法论", "产品发现"]
    },
    {
      id: "aman-khan-evals-guide",
      kind: "article",
      guest: "Aman Khan",
      role: "Arize AI 产品负责人（Director of Product）· 与 Andrew Ng 合作开发评测课程",
      channel: "Lenny's Newsletter",
      title: "Beyond vibe checks: A PM's complete guide to evals",
      url: "https://www.lennysnewsletter.com/p/beyond-vibe-checks-a-pms-complete",
      date: "2025-04",
      lang: "en",
      distilled: "这是 Lenny 通讯里的一篇客座长文，作者 Aman Khan 在 Arize AI 带产品，也和 Andrew Ng 一起做过评测课程。他开篇给了一个反差，几乎每个做生成式 AI 的 PM 都在琢磨提示词和换新模型，却极少有人去啃真正决定产品成败的那根杠杆，也就是评测。\n\n他用一个订票 agent 的例子把问题讲透。用户说想去旧金山附近过个放松的周末，预算一千美元以内。上线之后客服被投诉淹没，因为 agent 把机票订到了圣地亚哥。这类错误靠手点几个常见场景是测不出来的。\n\n他把评测分三层。人工评测贴近真实用户，但信号稀疏又贵。代码评测便宜快，适合能写成规则的检查，对开放式任务没用。LLM 当裁判可以规模化，还能让裁判给出理由，方便排查。前提是先拿一批标注样本把裁判校准好。\n\n文章还给了评测公式四件套，给裁判设定角色，喂进去要打分的上下文，写清楚要衡量什么，最后把术语和标签定义死。他说不同公司眼里的好本来就不一样，所以标签这件事必须由 PM 来定。评测 prompt 本身也是自然语言，PM 可以直接写。\n\n来源说明：内容取自 Lenny's Newsletter 公开可见的客座文章正文，属于作者原文，非播客逐字稿。",
      takeaways: [
        "评测是 AI 产品里被忽略的那根杠杆，提示词和模型选择反而被过度关注",
        "三层评测各有取舍：人工、代码、LLM 当裁判",
        "LLM 当裁判的前提是先用标注样本校准，否则读数不可信",
        "评测公式四件套：角色、上下文、目标、术语与标签",
        "什么算好，因公司而异，标签定义是 PM 的职责"
      ],
      quotes: [
        { zh: "提示词也许能上头条，但评测在安静地决定你的产品是活下来还是死掉。", en: "Prompts may make headlines, but evals quietly decide whether your product thrives or dies." },
        { zh: "评测是你衡量 AI 系统质量与有效性的方式。", en: "Evals are how you measure the quality and effectiveness of your AI system." },
        { zh: "评估 AI 系统不太像传统软件测试，更像给一个人做驾驶考试。", en: "Evaluating AI systems is less like traditional software testing and more like giving someone a driving test" },
        { zh: "评测是唯一能把系统里每一步拆开、具体测量某个改动带来什么影响的办法，它给你数据和信心去走对下一步。", en: "Evals are the only way you can break down each step in the system and measure specifically what impact an individual change might have on a product, giving you the data and confidence to take the right next step." }
      ],
      why: "PM 视角写评测的最完整一篇，公式和分层都能直接拿去用。",
      tags: ["Evals", "PM 方法论", "LLM 当裁判"]
    },
    {
      id: "julie-zhuo-what-ai-wont-change",
      kind: "article",
      guest: "Julie Zhuo",
      role: "Sundial 联合创始人 · 前 Facebook 产品设计 VP ·《The Making of a Manager》作者",
      channel: "The Looking Glass（Substack）",
      title: "What AI Won't Change",
      url: "https://lg.substack.com/p/the-looking-glass-what-ai-wont-change",
      date: "—",
      lang: "en",
      distilled: "Julie Zhuo 是 Facebook 前产品设计 VP，现在在做分析工具 Sundial。这篇短文的写法很克制，她先列了 AI 不会改变的四件事。稀缺的东西依然更有地位，难的东西依然更让人自豪，什么目标重要、在什么时间尺度上重要，只能由人心来回答，最后毁掉我们的仍然是日常的傲慢与恐惧。\n\n文章后半段回到她多年坚持的两条老经验。一条来自她的联合创始人 Chandra Narayanan，用数据诊断，用设计治疗。数据的职责是让你看清真实发生了什么，它不负责替你决定做成什么样。\n\n另一条是跑实验。她承认自己一开始很怀疑，觉得少而精总比大量乱试强，后来发现自己错了，实验数量和增长确实相关。\n\n但她给直觉划了边界。你越不像你的目标用户，就越该怀疑自己的设计直觉。她举例说自己偏爱干净的界面和留白，这套偏好在服务几亿用户的产品上就是错的，而且她看过上千个 A/B 结果之后，仍然经常被自己的直觉打脸。她的建议很干脆，做增长和优化的时候用定量行为数据，做零到一的时候回到用户研究。\n\n来源说明：内容取自 The Looking Glass 公开可见的正文段落，属于作者原文。",
      takeaways: [
        "AI 改变的是工具，不改变稀缺、难度和目标的相对价值",
        "用数据诊断，用设计治疗，数据不负责替你决定做成什么样",
        "实验数量和增长相关，少而精的直觉未必成立",
        "你越不像目标用户，就越该怀疑自己的设计直觉",
        "增长优化阶段用定量数据，零到一阶段回到用户研究"
      ],
      quotes: [
        { zh: "稀缺的东西承载更多地位。", en: "What is scarce carries more status." },
        { zh: "难的东西带来更多自豪。", en: "What is hard delivers more pride." },
        { zh: "用数据诊断，用设计治疗。", en: "Diagnose with data and treat with design." },
        { zh: "你的目标受众越不像你，你就越该怀疑自己的设计直觉。", en: "The more your target audience does not look like you, the more you should be skeptical of your design intuition." }
      ],
      why: "给 AI 时代的 PM 一条稳的地基线，哪些东西值得继续练，哪些直觉该收起来。",
      tags: ["PM 方法论", "产品直觉", "实验"]
    },
    {
      id: "julie-zhuo-higher-level-design",
      kind: "article",
      guest: "Julie Zhuo",
      role: "Sundial 联合创始人 · 前 Facebook 产品设计 VP ·《The Making of a Manager》作者",
      channel: "The Looking Glass（Substack）",
      title: "Higher Level Design",
      url: "https://lg.substack.com/p/the-looking-glass-higher-level-design",
      date: "—",
      lang: "en",
      distilled: "这篇是 Julie Zhuo 关于更高层次设计的论述。她的出发点是一个抱怨，很多人被岗位名称困住，设计师只管像素，PM 只管排期。她给的解法是换一个尺度看自己，别用你做的活动定义自己，用你想影响的结果定义自己。\n\n她把设计的层次画成一棵树，越靠近树根，层次越高。她列了一串问题当标尺，从人们有什么大问题，一直排到我们怎么赚钱、谁来做这件事、产品最终长什么样。她提醒读者，这一串问题里任何一个问坏，都可能毁掉结果。而判断哪一个问题在这个阶段最要紧，本身就是一道设计题。\n\n她给的成长路径也很具体。一开始你设计一个能转化的页面，慢慢往上走到能留住人的应用、能让人愉悦的体验、能持续运转的生意。她说设计更高层次的东西，就像给棋局多加一个维度。\n\n她对读者提的要求是变得谦逊，主动去问别人，你觉得自己哪里比想象中强，哪里比想象中弱。\n\n来源说明：内容取自 The Looking Glass 公开可见的正文段落，属于作者原文。",
      takeaways: [
        "用想影响的结果定义自己，别用岗位名称和日常活动定义自己",
        "设计层次是一棵树，越靠近树根越高",
        "一串基础问题构成标尺，判断哪个问题此刻最要紧本身就是设计",
        "成长路径从能转化的页面一路走到能持续运转的生意",
        "想往上走，先变谦逊，主动收集关于自己的反馈"
      ],
      quotes: [
        { zh: "它设计的是解决方案而不是功能，是结果而不是产品。", en: "It is designing solutions instead of features, outcomes instead of products." },
        { zh: "高层次的设计意味着不被你做的活动限制，而是去看你想影响的结果。", en: "High-level design means not limiting yourself to activities you do but rather outcomes you'd like to influence." },
        { zh: "你越靠近这棵树的根部，你的设计层次就越高。", en: "The closer you get to the base of the tree, the higher your level of design." }
      ],
      why: "把 PM 从功能清单里拔出来的心智模型，配合 2.1 的能力栈一起读。",
      tags: ["PM 方法论", "设计", "职业成长"]
    },
    {
      id: "mohit-bansal-agent-security",
      kind: "article",
      guest: "Mohit Bansal",
      role: "《Mind the Product》撰稿人",
      channel: "Mind the Product",
      title: "AI agents are your newest product feature. Is your security thinking keeping up?",
      url: "https://www.mindtheproduct.com/ai-agents-are-your-newest-product-feature-is-your-security-thinking-keeping-up",
      date: "2026-08",
      lang: "en",
      distilled: "这篇是 Mind the Product 上的实操文，作者从产品发现会的现场切入。他见过很多次这样的场面，PM 在白板上勾画一个 agent 该能做什么，房间里没人意识到自己正在做安全决策。不是威胁建模，不是风险评估，就是几个朴素的问题，这个 agent 能访问什么，被允许做什么，可以自作主张到什么程度。\n\n文章引了 Gartner 2025 年的预测，到 2028 年超过三成的企业软件会包含 agentic AI，2024 年这个比例还不到百分之一。作者说，PM 现在就在做这类范围决策，手里却缺少评估风险的安全词汇。\n\n他点出 PM 心里的威胁模型通常只有三个位置，API 端点、认证层、第三方集成。agent 从三个方向把它打破。因为 agent 会自己做决定，权限、记忆、集成三处都会长成新的攻击面。\n\n他给的行动项很轻。PM 不需要变成安全工程师，只需要在发现、迭代规划、上线评审里各加一条追问。定权限时问谁从滥用中获益，定记忆时问谁能往里面写，审集成时问一段精心构造的文字能不能把 agent 引到你没设计过的结果上。\n\n来源说明：内容取自 Mind the Product 官网公开文章正文，属于作者原文。",
      takeaways: [
        "PM 在发现阶段定义 agent 权限时，其实已经做了安全决策，只是没被命名",
        "Gartner 预测到 2028 年超三成企业软件会包含 agentic AI",
        "传统威胁模型只看 API、认证、第三方集成，agent 会打破它",
        "权限、记忆、集成是 agent 的三个新攻击面",
        "PM 不必变安全工程师，只需在三个环节各加一条追问"
      ],
      quotes: [
        { zh: "传统软件执行指令，AI agent 做决定。", en: "Traditional software executes instructions. An AI agent makes decisions." },
        { zh: "它们几乎从不被当作安全决策来命名。", en: "They almost never get named as security decisions." },
        { zh: "这一切都不要求 PM 变成安全工程师。", en: "None of this requires a PM to become a security engineer." }
      ],
      why: "AI 功能范围评审时最容易漏掉的一环，给 PM 一份能直接抄进清单的追问。",
      tags: ["AI Agent", "安全", "PM 方法论"]
    },
    {
      id: "kirsten-mann-distribution",
      kind: "interview",
      guest: "Kirsten Mann",
      role: "董事会董事 · 产品负责人 · Vizory 创始人（已退出）",
      channel: "The Product Experience（Mind the Product）",
      title: "What I learned from building, and exiting a startup",
      url: "https://www.mindtheproduct.com/what-i-learned-from-building-and-shutting-down-a-startup-kirsten-mann-strategic-advisor",
      date: "2026-09",
      lang: "en",
      distilled: "Kirsten Mann 第三次上这档播客。前两次她在讲自己用 AI 做的董事会工具 Vizory，这一次她来讲为什么不做下去了。\n\n她复盘的结论是，Vizory 停掉不是因为产品做坏了，而是因为它没能握住自己的渠道。起初它面向董事个人直接卖，后来其他董事也想用，采购就变成了企业级，把董事长、公司秘书、IT 团队全拉了进来，一笔原本简单的生意变成了她不愿意花几年去铺渠道的事。\n\n她因此把分发、采用、付费意愿补进了自己的 Makers' Manifesto，和做对的东西、把东西做对并列成第三条纪律。她的判断是，AI 把写软件的成本压下去了，却没有让触达信任你的人这件事变便宜。\n\n她还讲了一个反直觉的做法。早期她故意加摩擦，索要敏感文件，尽早收费，用来把真实需求和客气话分开。她说大多数创始人设计的测试是在确认自己对，而不是在找一个停下来的理由。\n\n节目里还有一条给 AI 产品的提醒。多模型产品会带来新的运营风险，Vizory 有一个 AI 裁判因为底层模型被静默下线而悄悄失效，说明模型漂移意味着评测和质量工作永远不会真正结束。\n\n来源说明：内容取自 Mind the Product 官网公开的节目介绍与要点整理，属于节目方文字，不是逐字稿。",
      takeaways: [
        "Vizory 停掉的根因是没能拥有自己的分发渠道",
        "分发、采用、付费意愿应作为第三条产品纪律，和做对的东西并列",
        "AI 压低了写软件的成本，没有压低触达信任的成本",
        "早期故意加摩擦、尽早收费，用来区分真实需求与客气话",
        "模型漂移让评测与质量工作永不结束，多模型产品尤其如此"
      ],
      quotes: [
        { zh: "分发才是大多数 AI 产品真正死掉的地方。", en: "distribution is where most AI products actually die" },
        { zh: "AI 压低了写软件的成本，却对触达那些信任你的人的成本毫无影响。", en: "AI has collapsed the cost of building software but done nothing to the cost of reaching people who trust you" },
        { zh: "大多数创始人设计的测试，是为了确认自己对，而不是为了找到一个停下来的理由。", en: "most founders run tests designed to confirm they're right rather than to find a reason to stop" }
      ],
      why: "AI 时代最贵的一课，做得出不等于卖得动，适合和 4.4 商业化一节对照看。",
      tags: ["分发", "商业化", "定价", "创业复盘"]
    },
    {
      id: "blaine-billingsley-openai",
      kind: "interview",
      guest: "Blaine Billingsley",
      role: "OpenAI 技术设计团队成员（Member of Technical Design Staff）",
      channel: "The Product Experience（Mind the Product）",
      title: "What OpenAI taught me to unlearn",
      url: "https://www.mindtheproduct.com/how-open-ai-makes-product-decisions-and-builds-at-speed-blaine-billingsley-open-ai",
      date: "2026-08",
      lang: "en",
      distilled: "Blaine Billingsley 在 OpenAI 做技术设计，之前待过 Gmail、Airbnb、YouTube、Slack。这期节目讲他在 OpenAI 学到要放下什么。\n\n第一个要放下的是对设计工作的旧定义。他说在 AI 公司，设计师的活已经从画像素转到管产出。判断什么是好，把评判标准建起来，粗粒度地评估结果，这些成了岗位的核心部分，而他在 Gmail 或 Slack 时没有以这种形式做过。\n\n第二个要放下的是对产出的吝惜。他把做一千个罐子的逻辑搬到了原型上。与其一次做出最好的那个，不如大量生成，保持不执着，再从噪音里挑出有用的那块。大语言模型并不替代结构化的创意方法，它把这些方法放大了。疯狂八分钟能在会议室里挤出八个点子，一次调教好的对话可以在同一段时间里独自返回八十个。\n\n节目里还有一段值得 AI PM 记下来。他把评测称作合成的用户研究。当一个产品的用户群大到无法逐个认识时，评测就是团队认识用户的方式。时间轴里还留了从原型到生产的那第二个八成，以及没有路线图怎么保持对齐。\n\n来源说明：内容取自 Mind the Product 官网公开的节目介绍与要点整理，属于节目方文字，不是逐字稿。",
      takeaways: [
        "AI 公司里设计师的活从画像素转向管产出，核心是定义什么算好",
        "用一千个罐子的逻辑做原型，大量生成、不执着、从噪音里挑",
        "大语言模型不替代结构化创意方法，它把方法放大",
        "评测是合成的用户研究，用户群大到无法逐个认识时的替代方案",
        "从原型到生产还有第二个八成，没有路线图也要保持对齐"
      ],
      quotes: [
        { zh: "在 AI 公司，设计师的工作已经从像素转向产出。", en: "The designer's job at an AI company has shifted from pixels to outputs." },
        { zh: "数量胜过完美。", en: "Volume beats perfection." },
        { zh: "做罐子最好的方式，不是努力做出最好的罐子，而是做一千个罐子。", en: "The best way to make a pot isn't to try to make the best pot — it's to make a thousand pots." }
      ],
      why: "OpenAI 内部一手视角，把评测、原型、对齐三件事串成一套日常做法。",
      tags: ["Evals", "原型", "PM 方法论", "OpenAI"]
    },
    {
      id: "aakash-gupta-vibe-coding",
      kind: "article",
      guest: "Aakash Gupta",
      role: "Product Growth 作者 · 前 Affirm / Epic Games / ThredUp 产品 VP",
      channel: "Product Growth（Substack）",
      title: "How to Ace the Vibe Coding Interview",
      url: "https://www.news.aakashg.com/p/vibe-coding-interview",
      date: "—",
      lang: "en",
      distilled: "Aakash Gupta 长期写 AI PM 求职，这篇讲一种新的面试轮次。他在开头引用了一位 PM 发来的求助，说自己在 Google 面试里被要求用 AI 工具做原型，之前根本没听过 vibe coding。\n\n他先给定义。vibe coding 在这类面试里指使用 AI 编码工具，比如 Cursor、Windsurf、Replit，或者 AI 原型工具，比如 Lovable、Bolt、Base44、v0。他把题型分成三类，设计某个功能、在知名产品上设计某个功能、从零做一个新产品原型。\n\n他把这类轮次放进 Google 的 PM 流程里看，说明它并没有取代产品感面试，而是接在后面。候选人仍然要把用户问题、目标、优先级、非目标讲清楚，最后往往还要交一页纸加一个原型链接。\n\n他给出的判断是，PM 这个岗位正在经历自输入指标转向输出指标以来最大的一次变化。新一代 AI PM 要会建带评测的 AI 功能，会用 AI 把精力放到高杠杆的事上，还要会用 AI 做原型。这三件事正好对应面试现在在考的东西。\n\n来源说明：内容取自 Product Growth 公开可见的正文与免费预览段落，付费部分未获取。",
      takeaways: [
        "vibe coding 面试已成为增长最快的 AI PM 面试轮次之一",
        "工具分两类：AI 编码工具与 AI 原型工具",
        "题型三类：设计某功能、在知名产品上设计、从零做新产品",
        "原型轮不取代产品感轮，产品问题与目标仍要讲清楚",
        "新一代 AI PM 三项能力：带评测的 AI 功能、用 AI 做高杠杆的事、用 AI 做原型"
      ],
      quotes: [
        { zh: "PM 这个角色的本质，正在经历自五年前从输入指标转向输出指标以来最大的一次变化。", en: "The nature of the PM role is undergoing its biggest shift since the shift from input to output metrics ~5 years ago." },
        { zh: "在这里的语境下，vibe coding 指的是使用 AI 编码工具（例如 Cursor、Windsurf 或 Replit）或 AI 原型工具（例如 Lovable、Bolt、Base44 或 v0）。", en: "Vibe coding, in this context, is the use of an AI coding (eg, Cursor, Windsurf, or Replit) or AI prototyping tool (eg, Lovable, Bolt, Base44, or v0)." },
        { zh: "我辅导过的多位候选人，都被要求提交一页纸加上原型链接作为最终产出。", en: "Multiple candidates I've coached had to submit a final 1 pager with a link to the prototype." }
      ],
      why: "把 AI PM 面试的新题型讲清楚，适合和 6.1 面试一节配合准备。",
      tags: ["求职面试", "原型", "AI PM"]
    },
    {
      id: "carlos-product-school-experimentation",
      kind: "article",
      guest: "Carlos Gonzalez de Villaumbrosia",
      role: "Product School 创始人兼 CEO",
      channel: "Product School",
      title: "AI Experimentation: How AI PMs Test and Learn Faster",
      url: "https://productschool.com/blog/artificial-intelligence/ai-experimentation-how-ai-pms-test-and-learn-faster",
      date: "2026-03",
      lang: "en",
      distilled: "Product School 这篇指南把 AI 实验写成一套系统，而不是一堆技巧。作者给的定义是，AI 实验是把不确定性变成团队能站得住的决策的那套流程。他强调真正拿到价值的团队，实验数量未必最多，赢在顺序对，并且真的照着学到的东西去行动。\n\n在方法上，他建议每个 AI 实验都从一个清晰假设开始，用我们相信做 X 会影响 Y 因为 Z 这个句式，把改动、预期结果和理由写死。成功指标要提前定，而且指标要能把模型质量和用户结果、业务结果连起来。\n\n他也讲了实验类型的选择。变化因素复杂起来之后，可以考虑多变量测试，把语气、长度、格式等组合一次性铺开，适合已经过了这东西能不能用阶段的调优场景。代价是搭建和分析更麻烦，需要的用户量也更大。\n\n文章最后给了 AI Builder 这个角色画像，指用 AI 去做原型、分析、评测和交付的产品人。他们把产品思维更快地变成可交付的东西，而 AI 工具在这里主要缩短的是等待设计资源和工程资源的排队时间。\n\n来源说明：内容取自 Product School 官网公开文章正文，属于网站原创内容。",
      takeaways: [
        "AI 实验是一套把不确定性转成可辩护决策的流程",
        "价值来自实验顺序和执行力，不来自实验数量",
        "用我们相信做 X 会影响 Y 因为 Z 的句式把假设写死",
        "指标要提前定，并且能把模型质量与用户、业务结果连起来",
        "多变量测试适合调优阶段，代价是复杂度与用户量要求更高"
      ],
      quotes: [
        { zh: "AI 实验是一套把不确定性转化为团队可以站得住的决策的系统。", en: "AI experimentation is a system for turning uncertainty into decisions your team can stand behind." },
        { zh: "从 AI 中获得价值的团队并不是实验做得最多的团队，而是按正确顺序做对了实验、并且真的照着学到的东西去行动的团队。", en: "The teams that get value from AI aren't the ones with the most experiments. They're the ones that run the right experiments in the right order, and actually act on what they learn." },
        { zh: "多变量测试是指通过在不同用户之间混合组合，一次测试多个改动。", en: "A multivariate test is when you test multiple changes at once by mixing combinations across users." }
      ],
      why: "把 AI 实验从口号落到假设句式和指标设计，能直接接进 3.3 的四个实验机制。",
      tags: ["实验", "PM 方法论", "指标"]
    },
    {
      id: "shreyas-doshi-knowledge-project",
      kind: "interview",
      guest: "Shreyas Doshi",
      role: "前 Stripe / Twitter / Google / Yahoo 产品负责人",
      channel: "The Knowledge Project（Farnam Street）第 175 期",
      title: "Shreyas Doshi: Better Teams, Better Products",
      url: "https://fs.blog/knowledge-project-podcast/shreyas-doshi/",
      date: "—",
      lang: "en",
      distilled: "这是 Shreyas Doshi 在 Farnam Street 的 The Knowledge Project 第 175 期里的对谈，官网公开了逐字稿节选。\n\n他先讲产品工作的三个层次，执行层、影响层、观感层。他说自己花了将近二十年才看明白，人和团队之间的冲突，很多来自大家不在同一个层次上说话。使命可能一样，目标和 OKR 可能也一样，但没对齐在谈哪一层，就会带来大量困惑，也让个人和团队都很痛苦。\n\n这一期的章节表还覆盖了他常讲的几个心智模型，代理感与才能矩阵、机会成本思维、对立命题原则，另外还有测量与评估的区别、写作文化的利弊、怎么在团队里打破僵局。这些主题在站内其他笔记里也有呼应，可以交叉参考。\n\n对 AI 时代的 PM 来说，三个层次仍然好用。当团队为一个 AI 功能争得停不下来，先问一句大家此刻在谈执行、谈影响，还是谈观感，往往比继续争方案更快把讨论拉回来。\n\n来源说明：内容取自 Farnam Street 官网公开的播客逐字稿节选，属于逐字稿原文。",
      takeaways: [
        "产品工作分三层：执行层、影响层、观感层",
        "大量团队冲突来自双方没对齐在谈哪一层，而不是目标不一致",
        "同期章节覆盖代理感与才能矩阵、机会成本思维、对立命题原则",
        "区分测量与评估，警惕写作文化的副作用",
        "AI 功能争论卡住时，先确认大家在谈哪一层"
      ],
      quotes: [
        { zh: "人和团队之间的冲突，往往主要因为我们没有在同一个层次上说话。", en: "oftentimes conflict between people and teams arises mainly because we're not talking at the same level" },
        { zh: "我们可能有相似的使命、相似的目标和 OKR，但如果没对齐在谈哪一层，就会带来大量困惑。", en: "And we might have similar missions, and similar goals and OKRs, but if we are not aligned on the level at which we're talking, that can lead to a lot of confusion" }
      ],
      why: "通用 PM 基本功里最耐用的一套语言，讨论僵住时能立刻用上。",
      tags: ["PM 方法论", "带团队", "决策"]
    }
  ]
};
