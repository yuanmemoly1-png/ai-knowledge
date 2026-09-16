// AI 冒险岛 · 练习场 —— 课程数据
// 内容提炼自知识库 00-小白课堂/ 的 Python 基础篇（慢速版风格：一步一个台阶、代码+输出、大白话）
// 每课难度梯度：例题复现 → 换数据变式 → 小综合
// 注意：本文件不存放参考答案（solution），每题只配 hints 逐级提示（最多 3 条，逐步逼近）
// 所有任务的期望输出均已用真实 Python 3.13 运行标准答案验证通过（标准答案见 .verify_answers.py，不进网站）

const LESSONS = [
  {
    id: "py-1",
    title: "变量与 print",
    icon: "📦",
    xp: 60,
    unlockAfter: null, // 第一课，默认解锁
    intro: "变量是贴了名字的盒子，print 让程序把东西说出来。",
    sections: [
      {
        title: "第 1 步：造一个变量",
        body: "变量就是一个<b>贴了名字的盒子</b>：<code>=</code> 把东西装进去（这个动作叫<b>赋值</b>），<code>print()</code> 把盒子里的东西拿出来看。注意：文字<b>必须加引号</b>。",
        code: 'name = "小明"\nprint(name)',
        output: "小明"
      },
      {
        title: "第 2 步：一次打印好几样东西",
        body: "<code>print</code> 里可以放好几样东西，用<b>英文逗号</b>隔开。它会自动在每项之间加一个空格——所以下面输出里「小明」两边各有空格。",
        code: 'name = "小明"\nage = 18\nprint("我叫", name, "，今年", age, "岁")',
        output: "我叫 小明 ，今年 18 岁"
      },
      {
        title: "第 3 步：问一句「你是什么类型」",
        body: "盒子里可以装不同种类的东西，用 <code>type()</code> 问一问。最常见的三种：<code>int</code> 整数、<code>str</code> 字符串（加引号的文字）、<code>float</code> 小数。",
        code: 'print(type(18))\nprint(type("小明"))\nprint(type(3.14))',
        output: "<class 'int'>\n<class 'str'>\n<class 'float'>"
      }
    ],
    tasks: [
      {
        id: "py-1-t1",
        title: "第一个盒子",
        prompt: "造一个叫 <code>name</code> 的变量，装进文字 <code>\"小明\"</code>（记得加引号），然后用 <code>print</code> 把它打印出来。",
        starterCode: "# 任务：造变量 name 装进 \"小明\"，再打印出来\n# 在这里写代码\n",
        check: { type: "exact", expected: "小明" },
        hints: [
          "先用 <code>=</code> 把文字装进变量，文字要加英文引号；再用 print 把它拿出来看。",
          "骨架是两行：<code>name = \"……\"</code>，然后 <code>print(name)</code>。",
          "引号里装的是 小明；print 括号里写的是变量名 name——变量名<b>不加</b>引号。"
        ]
      },
      {
        id: "py-1-t2",
        title: "一次说好几样",
        prompt: "变量已备好。用 <b>一个</b> <code>print</code> 把这几样东西打印成一行：<code>我叫 小明 ，今年 18 岁</code>（逗号隔开，print 会自动加空格）。",
        starterCode: 'name = "小明"\nage = 18\n# 用一个 print 打印：我叫 小明 ，今年 18 岁\n# 在这里写代码\n',
        check: { type: "exact", expected: "我叫 小明 ，今年 18 岁" },
        hints: [
          "一个 print 里可以放好几样东西，用英文逗号隔开。",
          "骨架：<code>print(\"我叫\", name, \"，今年\", age, \"岁\")</code>——文字加引号、变量名不加。",
          "一共五个部分依次排：文字\"我叫\"、变量 name、文字\"，今年\"、变量 age、文字\"岁\"。"
        ]
      },
      {
        id: "py-1-t3",
        title: "类型三连问",
        prompt: "用 <code>type()</code> 分别查看 <code>18</code>、<code>\"小明\"</code>、<code>3.14</code> 的类型，各打印一行（共 3 行输出）。",
        starterCode: "# 用 type() 查看 18、\"小明\"、3.14 的类型，各打印一行\n# 在这里写代码\n",
        check: { type: "exact", expected: "<class 'int'>\n<class 'str'>\n<class 'float'>" },
        hints: [
          "type() 负责问类型，print 负责把结果显示出来——两个要<b>套着用</b>。",
          "骨架：写三行 <code>print(type(……))</code>，括号里依次填 18、\"小明\"、3.14。",
          "文字 小明 记得加引号；数字 18 和 3.14 不加引号。"
        ]
      },
      {
        id: "py-1-t4",
        title: "自我介绍（变式）",
        prompt: "变量 <code>city</code> 和 <code>hobby</code> 已备好。用 <b>一个</b> <code>print</code> 打印成一行：<code>我住在 杭州 ，喜欢 画画</code>。",
        starterCode: 'city = "杭州"\nhobby = "画画"\n# 用一个 print 打印：我住在 杭州 ，喜欢 画画\n# 在这里写代码\n',
        check: { type: "exact", expected: "我住在 杭州 ，喜欢 画画" },
        hints: [
          "和「一次说好几样」同一个套路：一个 print、逗号隔开，只是换了数据。",
          "骨架：<code>print(\"我住在\", city, \"，喜欢\", hobby)</code>。",
          "city 和 hobby 是变量名不加引号；\"我住在\"、\"，喜欢\" 是文字要加引号。"
        ]
      },
      {
        id: "py-1-t5",
        title: "算总价（小综合）",
        prompt: "<code>price = 6</code>（单价）、<code>count = 3</code>（数量）已备好。用乘法 <code>*</code> 算出总价并打印：<code>总价： 18</code>（冒号是中文冒号，print 会自动补一个空格）。",
        starterCode: "price = 6\ncount = 3\n# 用 price * count 算总价并打印：总价： 18\n# 在这里写代码\n",
        check: { type: "exact", expected: "总价： 18" },
        hints: [
          "乘法用星号 <code>*</code>，可以先算好存进变量，也可以直接在 print 里算。",
          "骨架：<code>print(\"总价：\", price * count)</code>——文字加引号，算式不加引号。",
          "price * count 会算出 18，逗号让 print 自动在冒号后面加一个空格。"
        ]
      },
      {
        id: "py-1-tr1",
        title: "试炼：温度转换器",
        trial: true,
        xp: 40,
        prompt: "<code>celsius = 25</code>（摄氏度）已备好。用公式 <code>华氏度 = 摄氏度 * 9 / 5 + 32</code> 换算并打印：<code>华氏度： 77.0</code>。",
        starterCode: "celsius = 25\n# 用公式 celsius * 9 / 5 + 32 算出华氏度并打印：华氏度： 77.0\n# 在这里写代码\n",
        check: { type: "exact", expected: "华氏度： 77.0" }
      },
      {
        id: "py-1-tr2",
        title: "试炼：交换两个盒子",
        trial: true,
        xp: 40,
        prompt: "<code>a = \"红\"</code>、<code>b = \"蓝\"</code>。想办法交换两个变量的内容（需要借助第三个临时盒子），然后 <code>print(a, b)</code>。期望输出：<code>蓝 红</code>。",
        starterCode: "a = \"红\"\nb = \"蓝\"\n# 交换 a 和 b 的内容（借助一个临时变量）\n# 最后 print(a, b)\n# 在这里写代码\n",
        check: { type: "exact", expected: "蓝 红" }
      },
      {
        id: "py-1-tr3",
        title: "试炼：长方形报告",
        trial: true,
        xp: 40,
        prompt: "<code>length = 8</code>、<code>width = 5</code>。打印两行：第一行面积（长 × 宽），第二行周长（(长 + 宽) × 2）。期望输出：<code>面积： 40</code> 和 <code>周长： 26</code>。",
        starterCode: "length = 8\nwidth = 5\n# 第 1 行打印面积：面积： 40\n# 第 2 行打印周长：周长： 26\n# 在这里写代码\n",
        check: { type: "exact", expected: "面积： 40\n周长： 26" }
      }
    ]
  },

  {
    id: "py-2",
    title: "字符串",
    icon: "🧵",
    xp: 60,
    unlockAfter: "py-1",
    intro: "f-string 挖洞填变量，split 切开、replace 换词——和 AI 打交道天天用。",
    sections: [
      {
        title: "第 1 步：f-string —— 往文字里挖洞（重点）",
        body: "引号前加一个字母 <code>f</code>，就能在文字里用 <code>{}</code> <b>挖洞填变量</b>，Python 会先算好洞里的东西再填进去。<b>最容易犯的错</b>：忘了写 <code>f</code>，大括号会被原样打印出来。",
        code: 'name = "小明"\nage = 18\nprint(f"我叫{name}，今年{age}岁")',
        output: "我叫小明，今年18岁"
      },
      {
        title: "第 2 步：切开（split）",
        body: "<code>split(\"切刀\")</code> 按指定的符号把文字切成一个<b>列表</b>（方括号的样子）。读法：「用逗号当刀，把 s 切开」。",
        code: 's = "苹果,香蕉,橘子"\nprint(s.split(","))',
        output: "['苹果', '香蕉', '橘子']"
      },
      {
        title: "第 3 步：替换（replace）",
        body: "<code>文字.replace(\"旧的\", \"新的\")</code>：把所有「旧的」换成「新的」。",
        code: 'print("我有 1 个苹果".replace("1", "2"))',
        output: "我有 2 个苹果"
      }
    ],
    tasks: [
      {
        id: "py-2-t1",
        title: "生日贺卡（f-string）",
        prompt: "用 f-string 打印一句生日祝福，把 <code>name</code> 和 <code>age</code> 填进洞里。要求<b>精确</b>输出：<code>亲爱的小明，祝你18岁生日快乐！</code>",
        starterCode: 'name = "小明"\nage = 18\n# 用 f-string 打印：亲爱的小明，祝你18岁生日快乐！\n# 记得引号前加 f，用 {name} 和 {age} 填洞\n# 在这里写代码\n',
        check: { type: "exact", expected: "亲爱的小明，祝你18岁生日快乐！" },
        hints: [
          "引号前加字母 f，就能在文字里用 {} 挖洞填变量。",
          "骨架：<code>print(f\"亲爱的{……}，祝你{……}岁生日快乐！\")</code>。",
          "两个洞分别填 name 和 age；最容易漏的是开头的字母 f。"
        ]
      },
      {
        id: "py-2-t2",
        title: "切日期（split）",
        prompt: "用 <code>split(\"-\")</code> 把日期 <code>\"2026-08-07\"</code> 切成三块，直接 <code>print</code> 切出来的列表。",
        starterCode: 'date = "2026-08-07"\n# 用 split("-") 切开日期，打印结果\n# 在这里写代码\n',
        check: { type: "exact", expected: "['2026', '08', '07']" },
        hints: [
          "split(\"-\") 用横线当刀切，切出来的结果直接 print。",
          "骨架：<code>print(date.split(\"-\"))</code>。",
          "切出来是一个列表，直接 print 就能看到方括号的样子。"
        ]
      },
      {
        id: "py-2-t3",
        title: "换个说法（replace）",
        prompt: "用 <code>replace</code> 把 <code>\"学习好难\"</code> 里的「难」换成「简单」，打印结果：<code>学习好简单</code>。",
        starterCode: 's = "学习好难"\n# 用 replace 把 "难" 换成 "简单"，打印结果\n# 在这里写代码\n',
        check: { type: "exact", expected: "学习好简单" },
        hints: [
          "replace 吃两个参数：先旧的、后新的，两个都是文字要加引号。",
          "骨架：<code>print(s.replace(\"旧字\", \"新词\"))</code>。",
          "旧的是 \"难\"，新的是 \"简单\"。"
        ]
      },
      {
        id: "py-2-t4",
        title: "小票算账（变式）",
        prompt: "一行 CSV 小票 <code>line = \"苹果,3.5,2\"</code>（名字,单价,数量）。用 <code>split(\",\")</code> 切开，<code>float()</code> 把单价转成小数、<code>int()</code> 把数量转成整数，算出总价并用 f-string 打印：<code>总价：7.0</code>。",
        starterCode: 'line = "苹果,3.5,2"\n# 1. split(",") 切开，得到三块\n# 2. float(单价) * int(数量) 算出总价\n# 3. 用 f-string 打印：总价：7.0\n# 在这里写代码\n',
        check: { type: "exact", expected: "总价：7.0" },
        hints: [
          "先 split(\",\") 切成三块：名字、单价、数量；切出来都是文字，要转换才能算数。",
          "骨架：<code>parts = line.split(\",\")</code>，然后 <code>total = float(parts[1]) * int(parts[2])</code>。",
          "最后用 f-string 打印：<code>print(f\"总价：{total}\")</code>。"
        ]
      },
      {
        id: "py-2-t5",
        title: "提取用户名（小综合）",
        prompt: "邮箱 <code>email = \"xiaoming@qq.com\"</code>。用 <code>split(\"@\")</code> 取出 @ 前面的用户名，再用 f-string 打印一句问候：<code>你好，xiaoming</code>。",
        starterCode: 'email = "xiaoming@qq.com"\n# 1. split("@") 切开，取第 0 块当用户名\n# 2. 用 f-string 打印：你好，xiaoming\n# 在这里写代码\n',
        check: { type: "exact", expected: "你好，xiaoming" },
        hints: [
          "split(\"@\") 切成两块，@ 前面的用户名是第 0 块。",
          "骨架：<code>user = email.split(\"@\")[0]</code>，再用 f-string 打印。",
          "打印格式：<code>print(f\"你好，{user}\")</code>。"
        ]
      },
      {
        id: "py-2-tr1",
        title: "试炼：缩写生成器",
        trial: true,
        xp: 40,
        prompt: "<code>phrase = \"Artificial Intelligence\"</code>。用 <code>split()</code> 切成单词，取出每个单词的首字母拼成缩写并打印：<code>AI</code>。（单词取首字母用 <code>单词[0]</code>，拼接用 <code>+</code>）",
        starterCode: "phrase = \"Artificial Intelligence\"\n# 1. split() 切成单词列表\n# 2. 取每个单词的 [0] 首字母，用 + 拼起来\n# 3. 打印缩写：AI\n# 在这里写代码\n",
        check: { type: "exact", expected: "AI" }
      },
      {
        id: "py-2-tr2",
        title: "试炼：倒着说",
        trial: true,
        xp: 40,
        prompt: "<code>s = \"good good study\"</code>。用 <code>split()</code> 切开后<b>倒序</b>打印三个单词（一个 print，空格分隔）。期望输出：<code>study good good</code>。",
        starterCode: "s = \"good good study\"\n# 1. split() 切成三个单词\n# 2. 用索引倒着取，一个 print 打印\n# 在这里写代码\n",
        check: { type: "exact", expected: "study good good" }
      },
      {
        id: "py-2-tr3",
        title: "试炼：清洗价格数据",
        trial: true,
        xp: 40,
        prompt: "脏数据 <code>raw = \"价格：99.5元\"</code>。用 <code>replace</code> 把「价格：」和「元」都去掉，转成小数后翻倍，用 f-string 打印：<code>翻倍后：199.0</code>。",
        starterCode: "raw = \"价格：99.5元\"\n# 1. replace 去掉 \"价格：\" 和 \"元\"\n# 2. float() 转小数，乘以 2\n# 3. f-string 打印：翻倍后：199.0\n# 在这里写代码\n",
        check: { type: "exact", expected: "翻倍后：199.0" }
      }
    ]
  },

  {
    id: "py-3",
    title: "列表与字典",
    icon: "🗃️",
    xp: 60,
    unlockAfter: "py-2",
    intro: "列表按号码取东西（从 0 数起），字典按名字取东西。装「一堆数据」的两个容器。",
    sections: [
      {
        title: "第 1 步：列表 —— 一排编号的格子",
        body: "方括号 <code>[ ]</code> 造列表，用 <code>列表名[号码]</code> 取东西。<b>全世界新手都会绊一下</b>：第一个格子的号码是 <b>0</b>，不是 1！号码写 <code>-1</code> 表示最后一个。",
        code: 'fruits = ["苹果", "香蕉", "橘子"]\n#          0号      1号      2号\nprint(fruits[0])\nprint(fruits[2])',
        output: "苹果\n橘子"
      },
      {
        title: "第 2 步：加一个格子（append）",
        body: "<code>append</code> 在列表<b>末尾</b>加一格，是列表最常用的方法。配合 <code>len()</code> 能数出有几个格子。",
        code: 'fruits = ["苹果", "香蕉", "橘子"]\nfruits.append("葡萄")\nprint(fruits)\nprint(len(fruits))',
        output: "['苹果', '香蕉', '橘子', '葡萄']\n4"
      },
      {
        title: "第 3 步：字典 —— 一排贴名字的格子",
        body: "花括号 <code>{ }</code> 造字典，每格是 <code>名字: 内容</code>。取东西按<b>名字</b>取：<code>scores[\"语文\"]</code>（名字是文字，记得加引号）。",
        code: 'scores = {"语文": 90, "数学": 85}\nprint(scores["语文"])',
        output: "90"
      }
    ],
    tasks: [
      {
        id: "py-3-t1",
        title: "取第一个水果",
        prompt: "列表 <code>fruits</code> 已备好，打印<b>第一个</b>水果（提示：号码从 0 开始）。",
        starterCode: 'fruits = ["苹果", "香蕉", "橘子"]\n# 打印第一个水果（号码从 0 开始）\n# 在这里写代码\n',
        check: { type: "exact", expected: "苹果" },
        hints: [
          "第一个格子的号码是 0，不是 1。",
          "骨架：<code>print(fruits[0])</code>。",
          "取东西用方括号，号码写在方括号里面。"
        ]
      },
      {
        id: "py-3-t2",
        title: "末尾加一格",
        prompt: "用 <code>append</code> 往 <code>fruits</code> 末尾加一个 <code>\"葡萄\"</code>，然后打印 <code>len(fruits)</code> 看看现在有几格。",
        starterCode: 'fruits = ["苹果", "香蕉", "橘子"]\n# 1. append 一个 "葡萄"\n# 2. 打印 len(fruits)\n# 在这里写代码\n',
        check: { type: "exact", expected: "4" },
        hints: [
          "append 负责加格子，len() 负责数格子。",
          "骨架：<code>fruits.append(\"葡萄\")</code>，然后 <code>print(len(fruits))</code>。",
          "\"葡萄\" 是文字，记得加引号。"
        ]
      },
      {
        id: "py-3-t3",
        title: "查成绩单",
        prompt: "字典 <code>scores</code> 已备好，按名字取出「语文」成绩并打印（名字是文字，<b>记得加引号</b>）。",
        starterCode: 'scores = {"语文": 90, "数学": 85}\n# 按名字取出语文成绩并打印\n# 在这里写代码\n',
        check: { type: "exact", expected: "90" },
        hints: [
          "字典按名字取东西：<code>scores[\"名字\"]</code>。",
          "骨架：<code>print(scores[\"语文\"])</code>。",
          "\"语文\" 是文字，必须加引号；不加引号 Python 会以为它是变量。"
        ]
      },
      {
        id: "py-3-t4",
        title: "取最后一个（变式）",
        prompt: "打印 <code>fruits</code> 里<b>最后一个</b>水果（提示：号码 <code>-1</code> 表示倒数第一格）。",
        starterCode: 'fruits = ["苹果", "香蕉", "橘子"]\n# 打印最后一个水果（提示：号码 -1）\n# 在这里写代码\n',
        check: { type: "exact", expected: "橘子" },
        hints: [
          "倒数第一格的号码是 -1。",
          "骨架：<code>print(fruits[-1])</code>。",
          "写法和取第一格一模一样，只是把号码换成 -1。"
        ]
      },
      {
        id: "py-3-t5",
        title: "改成绩（小综合）",
        prompt: "字典 <code>scores</code> 已备好。数学进步了 5 分：把 <code>\"数学\"</code> 的成绩加 5（取出来加 5 再放回去），然后打印整个字典。期望输出：<code>{'语文': 90, '数学': 90}</code>。",
        starterCode: 'scores = {"语文": 90, "数学": 85}\n# 1. 把 "数学" 成绩加 5（取出来 + 5 再放回去）\n# 2. 打印整个字典\n# 在这里写代码\n',
        check: { type: "exact", expected: "{'语文': 90, '数学': 90}" },
        hints: [
          "改字典和查字典用同一种写法：<code>scores[\"数学\"]</code>——写在等号<b>左边</b>就是改。",
          "骨架：<code>scores[\"数学\"] = scores[\"数学\"] + 5</code>，然后打印整个字典。",
          "打印整个字典直接写 <code>print(scores)</code>。"
        ]
      },
      {
        id: "py-3-tr1",
        title: "试炼：两列表合成字典",
        trial: true,
        xp: 40,
        prompt: "<code>names = [\"语文\", \"数学\"]</code> 和 <code>points = [90, 85]</code>。用 <code>for</code> 把两个列表合成一个字典 <code>scores</code>，先打印整个字典，再打印 <code>scores[\"数学\"]</code>。期望输出两行：<code>{'语文': 90, '数学': 85}</code> 和 <code>85</code>。（用索引 i 同时取两个列表的第 i 格）",
        starterCode: "names = [\"语文\", \"数学\"]\npoints = [90, 85]\n# 1. 空字典 scores\n# 2. for i in [0, 1]：scores[names[i]] = points[i]\n# 3. 打印字典，再打印 scores[\"数学\"]\n# 在这里写代码\n",
        check: { type: "exact", expected: "{'语文': 90, '数学': 85}\n85" }
      },
      {
        id: "py-3-tr2",
        title: "试炼：花名册查询",
        trial: true,
        xp: 40,
        prompt: "<code>students</code> 是一个<b>装着字典的列表</b>。取出第 2 个学生的名字和分数，一个 print 打印：<code>小红 85</code>。（先 <code>students[1]</code> 取出字典，再用 <code>[\"name\"]</code> 按键取值）",
        starterCode: "students = [{\"name\": \"小明\", \"score\": 90}, {\"name\": \"小红\", \"score\": 85}]\n# 取出第 2 个学生的 name 和 score，打印：小红 85\n# 在这里写代码\n",
        check: { type: "exact", expected: "小红 85" }
      },
      {
        id: "py-3-tr3",
        title: "试炼：数据三问",
        trial: true,
        xp: 40,
        prompt: "<code>nums = [3, 9, 1, 7]</code>。认识三个新朋友：<code>max()</code> 最大、<code>min()</code> 最小、<code>len()</code> 有几个。用一个 print 打印：<code>9 1 4</code>。",
        starterCode: "nums = [3, 9, 1, 7]\n# 用一个 print 打印：max 最大、min 最小、len 个数\n# 期望：9 1 4\n# 在这里写代码\n",
        check: { type: "exact", expected: "9 1 4" }
      }
    ]
  },

  {
    id: "py-4",
    title: "条件与循环",
    icon: "🔀",
    xp: 60,
    unlockAfter: "py-3",
    intro: "if 看情况、for 挨个来。集齐这两块积木，程序就长脑子了。",
    sections: [
      {
        title: "第 1 步：if / elif / else —— 岔路口",
        body: "<code>if</code> 后面是条件（一个是/否问题），结尾有<b>冒号</b>，归它管的代码<b>缩进 4 格</b>。<code>elif</code> 是「否则如果」，可以接好几个，Python 从上往下<b>走第一个成立的</b>。注意：比较用<b>两个等号</b> <code>==</code>！",
        code: 'score = 75\n\nif score >= 90:\n    print("优秀")\nelif score >= 60:\n    print("及格")\nelse:\n    print("不及格")',
        output: "及格"
      },
      {
        title: "第 2 步：for —— 把一排格子挨个看一遍",
        body: "<code>for f in fruits:</code> 读作「对 fruits 里的每一个（叫它 f），都执行一遍缩进的代码」。列表有几格，缩进那行就跑几次。",
        code: 'fruits = ["苹果", "香蕉", "橘子"]\n\nfor f in fruits:\n    print(f)',
        output: "苹果\n香蕉\n橘子"
      },
      {
        title: "第 3 步：for + if 合体（真正的程序感）",
        body: "<b>循环负责「挨个来」，if 负责「看情况」</b>——90% 的程序都是这个组合。",
        code: 'scores = [90, 45, 78, 55]\n\nfor s in scores:\n    if s >= 60:\n        print(f"{s} 及格")\n    else:\n        print(f"{s} 不及格")',
        output: "90 及格\n45 不及格\n78 及格\n55 不及格"
      }
    ],
    tasks: [
      {
        id: "py-4-t1",
        title: "成绩分档",
        prompt: "<code>score = 75</code>。用 <code>if / elif / else</code> 分档：90 分及以上打印「优秀」，60 分及以上打印「及格」，否则打印「不及格」。",
        starterCode: 'score = 75\n# if：>= 90 打印 "优秀"\n# elif：>= 60 打印 "及格"\n# else：打印 "不及格"\n# 在这里写代码\n',
        check: { type: "exact", expected: "及格" },
        hints: [
          "if / elif / else 三条岔路，每条结尾有冒号，归它管的代码缩进 4 格。",
          "骨架：<code>if score >= 90:</code> 打印优秀；<code>elif score >= 60:</code> 打印及格；<code>else:</code> 打印不及格。",
          "比较用 >=；print 写在缩进的那一行。"
        ]
      },
      {
        id: "py-4-t2",
        title: "挨个报到",
        prompt: "用 <code>for</code> 循环把 <code>fruits</code> 里的水果挨个打印出来，每个一行（共 3 行输出）。",
        starterCode: 'fruits = ["苹果", "香蕉", "橘子"]\n# 用 for 循环挨个打印，每个一行\n# 在这里写代码\n',
        check: { type: "exact", expected: "苹果\n香蕉\n橘子" },
        hints: [
          "<code>for f in fruits:</code> 挨个来，缩进里 print(f)。",
          "骨架就两行：for 那行不缩进，print 那行缩进 4 格。",
          "f 是变量名，不加引号。"
        ]
      },
      {
        id: "py-4-t3",
        title: "及格过滤器",
        prompt: "用 <code>for + if</code>：只打印及格（60 分及以上）的分数，每个一行。期望输出两行：<code>90</code> 和 <code>78</code>。",
        starterCode: 'scores = [90, 45, 78, 55]\n# for 挨个看 + if 判断 >= 60 才打印\n# 在这里写代码\n',
        check: { type: "exact", expected: "90\n78" },
        hints: [
          "for 里面套 if：if 那行缩进 4 格，print 那行缩进 8 格。",
          "骨架：<code>for s in scores:</code> → <code>if s >= 60:</code> → <code>print(s)</code>。",
          "只打印 s 本身，不用加别的文字。"
        ]
      },
      {
        id: "py-4-t4",
        title: "求和大作战（变式）",
        prompt: "用 <code>for</code> + <b>累加器</b>算出 <code>nums</code> 的总和并打印。期望输出：<code>60</code>。",
        starterCode: "nums = [10, 20, 30]\n# 1. 准备一个累加器 total = 0\n# 2. for 挨个把 n 加到 total 上\n# 3. 循环结束后打印 total\n# 在这里写代码\n",
        check: { type: "exact", expected: "60" },
        hints: [
          "累加器套路：先准备一个 <code>total = 0</code>，for 里逐个往上加。",
          "骨架：<code>for n in nums:</code> → 缩进里 <code>total = total + n</code>。",
          "print(total) 在 for <b>外面</b>（不缩进），只打印一次。"
        ]
      },
      {
        id: "py-4-t5",
        title: "偶数计数器（变式）",
        prompt: "统计 <code>nums</code> 里有几个<b>偶数</b>并打印（提示：<code>n % 2 == 0</code> 表示 n 能被 2 整除，就是偶数）。期望输出：<code>3</code>。",
        starterCode: "nums = [3, 8, 5, 10, 7, 6]\n# 1. 准备一个计数器 count = 0\n# 2. for + if：n % 2 == 0 就 count 加 1\n# 3. 循环结束后打印 count\n# 在这里写代码\n",
        check: { type: "exact", expected: "3" },
        hints: [
          "和「求和」同套路，只是累加器变成了计数器：成立就 +1。",
          "判断偶数用 <code>n % 2 == 0</code>（% 是取余数）。",
          "骨架：<code>for n in nums:</code> → <code>if n % 2 == 0:</code> → <code>count = count + 1</code>，最后 print(count)。"
        ]
      },
      {
        id: "py-4-t6",
        title: "奇偶点名（小综合）",
        prompt: "用 <code>for</code> 挨个看 1 到 5：每个数打印一行「数字 + 奇偶」。期望输出 5 行：<code>1 奇数</code>、<code>2 偶数</code>、<code>3 奇数</code>、<code>4 偶数</code>、<code>5 奇数</code>。",
        starterCode: "# for n in [1, 2, 3, 4, 5]：\n#   if n % 2 == 0 打印偶数，否则打印奇数\n# 打印格式：print(n, \"奇数\")\n# 在这里写代码\n",
        check: { type: "exact", expected: "1 奇数\n2 偶数\n3 奇数\n4 偶数\n5 奇数" },
        hints: [
          "for 挨个看，if / else 分两路：偶数一路、奇数一路。",
          "骨架：<code>if n % 2 == 0:</code> 打印偶数，<code>else:</code> 打印奇数。",
          "打印用 <code>print(n, \"偶数\")</code> 这种逗号隔开的形式，print 会自动加空格。"
        ]
      },
      {
        id: "py-4-tr1",
        title: "试炼：九九乘法表一角",
        trial: true,
        xp: 40,
        prompt: "用<b>两层 for</b>（嵌套循环）打印九九乘法表的前 3 行一角，共 6 行：<code>1x1=1</code> / <code>1x2=2</code> / <code>2x2=4</code> / <code>1x3=3</code> / <code>2x3=6</code> / <code>3x3=9</code>。（外层 i 从 1 到 3，内层 j 也从 1 到 3，只有 <code>j &lt;= i</code> 才打印，用 f-string 拼 <code>{j}x{i}={j*i}</code>）",
        starterCode: "# 外层 for i in [1, 2, 3]\n#   内层 for j in [1, 2, 3]\n#     if j <= i 才打印 f\"{j}x{i}={j*i}\"\n# 在这里写代码\n",
        check: { type: "exact", expected: "1x1=1\n1x2=2\n2x2=4\n1x3=3\n2x3=6\n3x3=9" }
      },
      {
        id: "py-4-tr2",
        title: "试炼：FizzBuzz 小游戏",
        trial: true,
        xp: 40,
        prompt: "经典面试题迷你版：挨个看 1 到 10——3 的倍数打印 <code>Fizz</code>，5 的倍数打印 <code>Buzz</code>，同时是 3 和 5 的倍数打印 <code>FizzBuzz</code>，否则打印数字本身。期望输出 10 行：<code>1</code>、<code>2</code>、<code>Fizz</code>、<code>4</code>、<code>Buzz</code>、<code>Fizz</code>、<code>7</code>、<code>8</code>、<code>Fizz</code>、<code>Buzz</code>。（判断顺序很重要：先判断「同时是」）",
        starterCode: "# for n in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]：\n#   if 同时是 3 和 5 的倍数 → FizzBuzz\n#   elif 3 的倍数 → Fizz\n#   elif 5 的倍数 → Buzz\n#   else → 打印 n\n# 在这里写代码\n",
        check: { type: "exact", expected: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz" }
      },
      {
        id: "py-4-tr3",
        title: "试炼：猜数字裁判",
        trial: true,
        xp: 40,
        prompt: "目标数字 <code>target = 7</code>，猜测记录 <code>guesses = [3, 9, 7]</code>。用 for + if/elif/else 当裁判：猜小了打印 <code>3 小了</code>，猜大了打印 <code>9 大了</code>，猜中打印 <code>7 猜对了</code>。",
        starterCode: "target = 7\nguesses = [3, 9, 7]\n# for 挨个看猜测：\n#   g < target → 打印 \"小了\"\n#   g > target → 打印 \"大了\"\n#   否则 → 打印 \"猜对了\"\n# 打印格式：print(g, \"小了\")\n# 在这里写代码\n",
        check: { type: "exact", expected: "3 小了\n9 大了\n7 猜对了" }
      }
    ]
  },

  {
    id: "py-5",
    title: "函数",
    icon: "🧩",
    xp: 60,
    unlockAfter: "py-4",
    intro: "把一段代码打包起个名字，想用就喊名字。return 把结果交出来。",
    sections: [
      {
        title: "第 1 步：最小的函数（def）",
        body: "<code>def 名字():</code> <b>定义</b>（存好）一个函数，下面缩进 4 格是打包的内容；写一行 <code>名字()</code> 才是<b>调用</b>。只定义不调用，程序什么都不输出。",
        code: 'def say_hi():\n    print("你好呀")\n\nsay_hi()\nsay_hi()',
        output: "你好呀\n你好呀"
      },
      {
        title: "第 2 步：参数 —— 让函数能接活儿",
        body: "定义时括号里的 <code>thing</code> 叫<b>参数</b>：一个待填的空位。调用时递什么进去，函数里所有 <code>thing</code> 就变成什么。",
        code: 'def buy(thing):\n    print("去买", thing)\n\nbuy("土豆")\nbuy("西红柿")',
        output: "去买 土豆\n去买 西红柿"
      },
      {
        title: "第 3 步：return —— 把结果交出来（重点）",
        body: "<code>print</code> 只是喊一嗓子；想让函数<b>算出结果交给你</b>，用 <code>return</code>。<code>add(3, 5)</code> 这整个式子会被替换成 return 交出来的 <code>8</code>。<b>新手第一大坑</b>：忘了 return，调用结果就是 <code>None</code>。",
        code: 'def add(a, b):\n    return a + b\n\nresult = add(3, 5)\nprint(result)\nprint(add(10, 20))',
        output: "8\n30"
      }
    ],
    tasks: [
      {
        id: "py-5-t1",
        title: "写一个加法函数",
        prompt: "定义函数 <code>add(a, b)</code>，<code>return</code> 两数之和；然后 <code>print(add(3, 5))</code>。",
        starterCode: '# 1. 定义函数 add(a, b)，return 两数之和\n# 2. 打印 add(3, 5)\n# 在这里写代码\n',
        check: { type: "exact", expected: "8" },
        hints: [
          "def 负责定义，return 负责把结果交出来。",
          "骨架：<code>def add(a, b):</code> 缩进里 <code>return a + b</code>；函数外 print(add(3, 5))。",
          "别在函数里 print——要 return，不然外面拿到的是 None。"
        ]
      },
      {
        id: "py-5-t2",
        title: "及格判断器",
        prompt: "定义函数 <code>is_pass(score)</code>：60 分及以上 <code>return \"及格\"</code>，否则 <code>return \"不及格\"</code>；然后 <code>print(is_pass(75))</code>。",
        starterCode: '# 1. 定义 is_pass(score)，>= 60 return "及格"，否则 return "不及格"\n# 2. 打印 is_pass(75)\n# 在这里写代码\n',
        check: { type: "exact", expected: "及格" },
        hints: [
          "函数里放 if / else，两条路各 return 一个结果。",
          "骨架：<code>def is_pass(score):</code> → <code>if score >= 60:</code> return 及格 → <code>else:</code> return 不及格。",
          "return 的是文字，记得加引号。"
        ]
      },
      {
        id: "py-5-t3",
        title: "统计及格人数",
        prompt: "定义函数 <code>count_pass(scores)</code>：统计列表中及格（60 分及以上）的人数并 <code>return</code>；然后 <code>print(count_pass([90, 45, 78, 62, 55]))</code>，应该输出 <code>3</code>。",
        starterCode: '# 1. 定义 count_pass(scores)：用 for + if 数及格人数，return 结果\n# 2. 打印 count_pass([90, 45, 78, 62, 55])\n# 在这里写代码\n',
        check: { type: "exact", expected: "3" },
        hints: [
          "函数里放「计数器 + for + if」三件套，最后 return 计数器。",
          "骨架：n = 0 → <code>for s in scores:</code> → <code>if s >= 60:</code> n = n + 1 → return n。",
          "return 在 for <b>外面</b>，整个循环跑完才 return 一次。"
        ]
      },
      {
        id: "py-5-t4",
        title: "打招呼函数（变式）",
        prompt: "定义函数 <code>greet(name)</code>，<code>return</code> 一句拼接好的问候；然后 <code>print(greet(\"小明\"))</code>。期望输出：<code>你好，小明！</code>（提示：字符串拼接用 <code>+</code>）",
        starterCode: '# 1. 定义 greet(name)，return 拼接好的问候语\n# 2. 打印 greet("小明")\n# 在这里写代码\n',
        check: { type: "exact", expected: "你好，小明！" },
        hints: [
          "和 add 一模一样的结构，只是 return 的东西从加法变成了字符串拼接。",
          "字符串拼接用 <code>+</code>：<code>\"你好，\" + name + \"！\"</code>。",
          "骨架：<code>def greet(name):</code> 缩进里 return 拼接结果；函数外 print(greet(\"小明\"))。"
        ]
      },
      {
        id: "py-5-t5",
        title: "及格总分（小综合）",
        prompt: "定义函数 <code>sum_pass(scores)</code>：把及格（60 分及以上）的分数<b>加起来</b>并 <code>return</code>；然后 <code>print(sum_pass([90, 45, 78, 62, 55]))</code>，期望输出 <code>230</code>。",
        starterCode: '# 1. 定义 sum_pass(scores)：累加器 + for + if，return 总分\n# 2. 打印 sum_pass([90, 45, 78, 62, 55])\n# 在这里写代码\n',
        check: { type: "exact", expected: "230" },
        hints: [
          "就是 count_pass 的孪生兄弟：把「数个数 +1」换成「把分数加起来」。",
          "骨架：total = 0 → <code>for s in scores:</code> → <code>if s >= 60:</code> total = total + s → return total。",
          "只有及格的才加，不及格的跳过——if 别漏。"
        ]
      },
      {
        id: "py-5-tr1",
        title: "试炼：密码强度检测",
        trial: true,
        xp: 40,
        prompt: "定义函数 <code>password_strength(pwd)</code>：长度 ≥ 8 <b>且</b>含有数字 return <code>\"强\"</code>；长度 ≥ 6 return <code>\"中\"</code>；否则 return <code>\"弱\"</code>。然后依次打印三次调用：<code>password_strength(\"abc12345\")</code>、<code>password_strength(\"abcdef\")</code>、<code>password_strength(\"ab12\")</code>。期望输出 3 行：<code>强</code> / <code>中</code> / <code>弱</code>。（检查含数字：for 每个字符判断 <code>ch in \"0123456789\"</code>）",
        starterCode: "# 1. 定义 password_strength(pwd)：\n#    先用 for 检查有没有数字（has_digit）\n#    len(pwd) >= 8 且 has_digit → return \"强\"\n#    len(pwd) >= 6 → return \"中\"\n#    否则 → return \"弱\"\n# 2. 打印三次调用：\"abc12345\" / \"abcdef\" / \"ab12\"\n# 在这里写代码\n",
        check: { type: "exact", expected: "强\n中\n弱" }
      },
      {
        id: "py-5-tr2",
        title: "试炼：平均分计算器",
        trial: true,
        xp: 40,
        prompt: "定义函数 <code>average(nums)</code>：用 for + 累加器求总和，return 总和除以个数（除法用 <code>/</code>）；然后 <code>print(average([80, 90, 100]))</code>。期望输出：<code>90.0</code>。",
        starterCode: "# 1. 定义 average(nums)：累加器求和，return 总和 / len(nums)\n# 2. 打印 average([80, 90, 100])\n# 在这里写代码\n",
        check: { type: "exact", expected: "90.0" }
      },
      {
        id: "py-5-tr3",
        title: "试炼：满减计算器",
        trial: true,
        xp: 40,
        prompt: "商店满 100 减 20。定义函数 <code>pay(amount)</code>：金额 ≥ 100 return 减 20 后的钱，否则 return 原金额；然后打印 <code>pay(150)</code> 和 <code>pay(80)</code> 两行。期望输出：<code>130</code> 和 <code>80</code>。",
        starterCode: "# 1. 定义 pay(amount)：>= 100 return amount - 20，否则 return amount\n# 2. 打印 pay(150) 和 pay(80)\n# 在这里写代码\n",
        check: { type: "exact", expected: "130\n80" }
      }
    ]
  },

  {
    id: "py-6",
    title: "综合实战",
    icon: "🏆",
    xp: 100,
    unlockAfter: "py-5",
    intro: "收官课：用「输入 → 处理 → 输出」骨架，把学过的积木搭成完整程序。",
    sections: [
      {
        title: "第 1 步：所有程序都是同一个骨架",
        body: "不管多复杂的程序，剥到骨头都长这样：<b>输入 → 处理 → 输出</b>。你学过的积木各自归位：输入是变量和文件，处理是 split / for / if / 函数，输出是 print。拿到任何需求，先塞进这个骨架想一遍。",
        code: 'text = "苹果 香蕉 苹果"   # 输入\nwords = text.split()      # 处理：切成单词\nprint(words)              # 输出',
        output: "['苹果', '香蕉', '苹果']"
      },
      {
        title: "第 2 步：for + if 往字典里计数（天天用的套路）",
        body: "字典是<b>记账的最佳容器</b>：词当键、次数当值。<code>if w in count</code> 读作「w 在 count 的键里面吗」——见过就 +1，没见过记 1。这个套路以后统计聊天记录、处理 AI 返回的数据天天用。",
        code: 'words = ["苹果", "香蕉", "苹果"]\ncount = {}\nfor w in words:\n    if w in count:\n        count[w] = count[w] + 1\n    else:\n        count[w] = 1\nprint(count)',
        output: "{'苹果': 2, '香蕉': 1}"
      },
      {
        title: "第 3 步：搭程序五步法",
        body: "① 想清楚要什么 → ② 用中文拆步骤 → ③ 每步翻成代码 → ④ 跑 + 修 → ⑤ 加功能。<b>每一步中文流程，刚好对应一两行代码</b>。下面几个任务，就按这个路子来。",
        code: '# 中文步骤：切成单词 → 挨个看 → 见过的加 1 → 打印\n# 翻成代码：\ntext = "猫 狗 猫"\nfor w in text.split():\n    print(w)',
        output: "猫\n狗\n猫"
      }
    ],
    tasks: [
      {
        id: "py-6-t1",
        title: "词频统计器",
        prompt: "输入一句 <code>\"苹果 香蕉 苹果 橘子 香蕉 苹果\"</code>，统计每个词出现几次，一行一条打印。期望输出 3 行：<code>苹果 出现了 3 次</code> / <code>香蕉 出现了 2 次</code> / <code>橘子 出现了 1 次</code>。",
        starterCode: 'text = "苹果 香蕉 苹果 橘子 香蕉 苹果"\n# 1. 用 split() 按空格切成单词列表\n# 2. 造空字典 count 当账本\n# 3. for 挨个看：在账本里就 +1，不在就记 1\n# 4. for 一行一条打印：词 出现了 次数 次\n# 在这里写代码\n',
        check: { type: "exact", expected: "苹果 出现了 3 次\n香蕉 出现了 2 次\n橘子 出现了 1 次" },
        hints: [
          "四步走：split 切词 → 空字典当账本 → for + if 计数 → for 打印。",
          "计数骨架：<code>if w in count: count[w] = count[w] + 1</code>，<code>else: count[w] = 1</code>。",
          "打印骨架：<code>for w in count:</code> → <code>print(w, \"出现了\", count[w], \"次\")</code>。"
        ]
      },
      {
        id: "py-6-t2",
        title: "记账小本本",
        prompt: "账本 <code>ledger</code> 已记了两笔。① 又喝了一杯奶茶 15 元（给 <code>\"奶茶\"</code> 加 15）；② 新记一笔 <code>\"电影票\"</code> 40 元；③ 用 <code>for</code> + 累加器算出总花费。先打印整个账本，再打印 <code>总花费： 100</code>。",
        starterCode: 'ledger = {"奶茶": 15, "午餐": 30}\n# 1. 又给 "奶茶" 花了 15（取出来加 15 再放回去）\n# 2. 新记一笔 "电影票" 40\n# 3. 用 for + 累加器 total 算总花费\n# 4. 打印账本，再打印：总花费： 100\n# 在这里写代码\n',
        check: { type: "exact", expected: "{'奶茶': 30, '午餐': 30, '电影票': 40}\n总花费： 100" },
        hints: [
          "改已有的一笔：<code>ledger[\"奶茶\"] = ledger[\"奶茶\"] + 15</code>；新的一笔直接赋值。",
          "累加器 total = 0，<code>for k in ledger:</code> 把 ledger[k] 逐个加上去。",
          "先 print(ledger)，再 <code>print(\"总花费：\", total)</code>。"
        ]
      },
      {
        id: "py-6-t3",
        title: "字母计数器（变式）",
        prompt: "和「词频统计器」同一个套路，但这回数的是<b>字符</b>。统计 <code>\"banana\"</code> 里每个字母出现几次，一行一条打印。期望输出 3 行：<code>b 出现了 1 次</code> / <code>a 出现了 3 次</code> / <code>n 出现了 2 次</code>。（提示：字符串可以直接 for，不用 split）",
        starterCode: 'text = "banana"\n# 1. 空字典 count 当账本\n# 2. for ch in text：在账本里 +1，不在记 1\n# 3. for 一行一条打印：字母 出现了 次数 次\n# 在这里写代码\n',
        check: { type: "exact", expected: "b 出现了 1 次\na 出现了 3 次\nn 出现了 2 次" },
        hints: [
          "和任务 1 一模一样的计数套路，只是字符串可以直接 for，省掉 split 那步。",
          "骨架：<code>for ch in text:</code> + <code>if ch in count:</code> +1 / <code>else:</code> 记 1。",
          "打印同样是 <code>for ch in count:</code> → <code>print(ch, \"出现了\", count[ch], \"次\")</code>。"
        ]
      },
      {
        id: "py-6-t4",
        title: "购物清单总价（变式）",
        prompt: "<code>lines</code> 里是两条 CSV 记录（名字,单价,数量）。用 <code>for + split</code> 算出所有商品加起来的总价，打印：<code>总价： 16</code>。",
        starterCode: 'lines = ["苹果,3,2", "香蕉,2,5"]\n# 1. 准备累加器 total = 0\n# 2. for 每一行：split(",") 切开，int(单价) * int(数量) 加到 total\n# 3. 打印：总价： 16\n# 在这里写代码\n',
        check: { type: "exact", expected: "总价： 16" },
        hints: [
          "每一行 split(\",\") 得到 [名字, 单价, 数量]，单价 × 数量累加进 total。",
          "骨架：<code>parts = line.split(\",\")</code> → <code>total = total + int(parts[1]) * int(parts[2])</code>。",
          "split 切出来的是文字，用 int() 转成整数再算；最后 <code>print(\"总价：\", total)</code>。"
        ]
      },
      {
        id: "py-6-t5",
        title: "寻找最高分（小综合）",
        prompt: "字典 <code>scores</code> 已备好。用 <code>for</code> 挨个比较，找出分数最高的科目，打印：<code>最高分： 英语 92</code>。",
        starterCode: 'scores = {"语文": 90, "数学": 85, "英语": 92}\n# 1. 准备 best_name = "" 和 best_score = 0\n# 2. for 挨个看：如果 scores[name] > best_score，就更新两个 best\n# 3. 打印：最高分： 英语 92\n# 在这里写代码\n',
        check: { type: "exact", expected: "最高分： 英语 92" },
        hints: [
          "打擂台套路：准备 best_name 和 best_score 两个变量，for 挨个比，更大的就替换。",
          "骨架：<code>for name in scores:</code> → <code>if scores[name] > best_score:</code> → 更新 best_score 和 best_name。",
          "最后 <code>print(\"最高分：\", best_name, best_score)</code>。"
        ]
      },
      {
        id: "py-6-t6",
        title: "词频函数（小综合）",
        prompt: "把「词频统计器」的计数逻辑打包成函数 <code>word_count(text)</code>，<code>return</code> 词频字典；然后 <code>print(word_count(\"猫 狗 猫\"))</code>，期望输出：<code>{'猫': 2, '狗': 1}</code>。",
        starterCode: '# 1. 定义 word_count(text)：空字典 + for + if/else，return 字典\n# 2. 打印 word_count("猫 狗 猫")\n# 在这里写代码\n',
        check: { type: "exact", expected: "{'猫': 2, '狗': 1}" },
        hints: [
          "把任务 1 的计数代码原样搬进函数，最后把账本 return 出来。",
          "骨架：<code>def word_count(text):</code> → count = {} → for + if/else 记账 → return count。",
          "函数外写 <code>print(word_count(\"猫 狗 猫\"))</code>，print 会把字典直接显示出来。"
        ]
      },
      {
        id: "py-6-tr1",
        title: "试炼：成绩单系统",
        trial: true,
        xp: 40,
        prompt: "字典 <code>scores</code> 存着三位同学的成绩。① 定义函数 <code>grade(s)</code>：≥ 90 return \"优秀\"，≥ 60 return \"及格\"，否则 \"不及格\"；② for 挨个打印一行成绩单：<code>名字 分数 等级</code>；③ 用累加器算总分，整除（<code>//</code>）人数得到平均分，打印 <code>平均分： 75</code>。期望输出 4 行：<code>小明 92 优秀</code> / <code>小红 58 不及格</code> / <code>小刚 76 及格</code> / <code>平均分： 75</code>。",
        starterCode: "scores = {\"小明\": 92, \"小红\": 58, \"小刚\": 76}\n# 1. 定义 grade(s)：>= 90 \"优秀\"，>= 60 \"及格\"，否则 \"不及格\"\n# 2. for 挨个打印：名字 分数 等级\n# 3. 累加器求总分，// 整除人数，打印：平均分： 75\n# 在这里写代码\n",
        check: { type: "exact", expected: "小明 92 优秀\n小红 58 不及格\n小刚 76 及格\n平均分： 75" }
      },
      {
        id: "py-6-tr2",
        title: "试炼：关键词探测器",
        trial: true,
        xp: 40,
        prompt: "聊天记录 <code>messages</code> 已备好。统计有几条消息提到了关键词 <code>\"苹果\"</code>（判断用 <code>if keyword in msg</code>），用 f-string 打印：<code>「苹果」出现了 2 条消息</code>。",
        starterCode: "messages = [\"我喜欢苹果\", \"苹果真好吃\", \"香蕉也不错\"]\nkeyword = \"苹果\"\n# 1. 计数器 n = 0\n# 2. for 每条消息：if keyword in msg 就 n + 1\n# 3. f-string 打印：「苹果」出现了 2 条消息\n# 在这里写代码\n",
        check: { type: "exact", expected: "「苹果」出现了 2 条消息" }
      },
      {
        id: "py-6-tr3",
        title: "试炼：库存警报",
        trial: true,
        xp: 40,
        prompt: "<code>data</code> 里是三条 CSV 记录（名字,库存,单价）。for 每行 split 切开：库存为 0 打印 <code>香蕉 缺货</code>，否则打印 <code>苹果 库存 10</code> 这种格式。期望输出 3 行：<code>苹果 库存 10</code> / <code>香蕉 缺货</code> / <code>橘子 库存 5</code>。",
        starterCode: "data = [\"苹果,10,3\", \"香蕉,0,2\", \"橘子,5,4\"]\n# for 每行：split(\",\") 切开\n#   int(库存) == 0 → 打印 \"缺货\"\n#   否则 → 打印 名字 库存 数量\n# 在这里写代码\n",
        check: { type: "exact", expected: "苹果 库存 10\n香蕉 缺货\n橘子 库存 5" }
      }
    ]
  }
];
