// AI 冒险岛 · 练习场 —— 动画课堂场景数据（数据驱动：加新场景只改本文件）
// 场景结构：{ id, title, icon, steps: [{ caption, els }] }
//   caption：当前步骤的大白话讲解（字幕）
//   els：本步骤舞台上各元素的状态表，key 是元素身份证（跨步骤复用，引擎负责过渡动画）
//     text：主内容（emoji / 文字 / 代码）   label：下方小标签
//     x, y：舞台位置（百分比，元素中心点）  cls：样式类（box/drawer/val/code/out/paper/path/machine/hl/dim/big…见 anim.css）
//   某一步不包含某个 key → 该元素缩小淡出；新出现的 key → 飞入；位置变化 → 平滑移动

const SCENES = [
  {
    id: "var-assign",
    title: "变量与赋值",
    icon: "📦",
    steps: [
      {
        caption: "变量就是一个贴了名字的盒子。先造一个盒子，贴上标签「name」。",
        els: {
          box: { text: "📦", label: "name", x: 50, y: 50, cls: "box" }
        }
      },
      {
        caption: 'name = "小明"：读作「把小明装进 name 盒子」，这个动作叫赋值。',
        els: {
          code: { text: 'name = "小明"', x: 50, y: 12, cls: "code" },
          box: { text: "📦", label: "name", x: 50, y: 50, cls: "box" },
          val: { text: "小明", x: 18, y: 82, cls: "val" }
        }
      },
      {
        caption: "看——「小明」已经在盒子里了。print(name) 就是打开盒子看里面。",
        els: {
          code: { text: 'name = "小明"', x: 50, y: 12, cls: "code" },
          box: { text: "📦", label: "name", x: 50, y: 50, cls: "box hl" },
          val: { text: "小明", x: 50, y: 44, cls: "val" }
        }
      },
      {
        caption: '重新赋值 name = "小红"：旧的「小明」被请出盒子。',
        els: {
          code: { text: 'name = "小红"', x: 50, y: 12, cls: "code" },
          box: { text: "📦", label: "name", x: 50, y: 50, cls: "box" },
          val: { text: "小明", x: 82, y: 82, cls: "val dim" },
          val2: { text: "小红", x: 18, y: 82, cls: "val" }
        }
      },
      {
        caption: "标签没变，里面换成了「小红」。变量——可以变的量。",
        els: {
          code: { text: 'name = "小红"', x: 50, y: 12, cls: "code" },
          box: { text: "📦", label: "name", x: 50, y: 50, cls: "box hl" },
          val2: { text: "小红", x: 50, y: 44, cls: "val" }
        }
      }
    ]
  },

  {
    id: "f-string",
    title: "f-string 填空",
    icon: "🕳️",
    steps: [
      {
        caption: "准备两个盒子：name 装着「小明」，age 装着 18。",
        els: {
          bname: { text: "📦", label: 'name = "小明"', x: 20, y: 78, cls: "box" },
          bage: { text: "📦", label: "age = 18", x: 80, y: 78, cls: "box" }
        }
      },
      {
        caption: "再写一句话模板，里面留了两个洞：{name} 和 {age}。",
        els: {
          tpl: { text: '"我叫{ name }，今年{ age }岁"', x: 50, y: 28, cls: "code" },
          bname: { text: "📦", label: 'name = "小明"', x: 20, y: 78, cls: "box" },
          bage: { text: "📦", label: "age = 18", x: 80, y: 78, cls: "box" }
        }
      },
      {
        caption: "引号前的 f 是开关：有它，Python 才会往洞里填东西。按下去——",
        els: {
          fsw: { text: "f", x: 24, y: 28, cls: "val hl big" },
          tpl: { text: '"我叫{ name }，今年{ age }岁"', x: 52, y: 28, cls: "code" },
          bname: { text: "📦", label: 'name = "小明"', x: 20, y: 78, cls: "box" },
          bage: { text: "📦", label: "age = 18", x: 80, y: 78, cls: "box" },
          v1: { text: "小明", x: 20, y: 66, cls: "val" },
          v2: { text: "18", x: 80, y: 66, cls: "val" }
        }
      },
      {
        caption: "开关按下：洞里的变量名被替换成盒子里的东西。",
        els: {
          fsw: { text: "f", x: 24, y: 28, cls: "val big" },
          tpl: { text: '"我叫{ name }，今年{ age }岁"', x: 52, y: 28, cls: "code hl" },
          bname: { text: "📦", label: 'name = "小明"', x: 20, y: 78, cls: "box" },
          bage: { text: "📦", label: "age = 18", x: 80, y: 78, cls: "box" },
          v1: { text: "小明", x: 40, y: 28, cls: "val" },
          v2: { text: "18", x: 62, y: 28, cls: "val" }
        }
      },
      {
        caption: "最终结果：我叫小明，今年18岁。忘了写 f 的话，大括号会被原样打印！",
        els: {
          out: { text: "输出：我叫小明，今年18岁", x: 50, y: 46, cls: "out" },
          bname: { text: "📦", label: 'name = "小明"', x: 20, y: 78, cls: "box dim" },
          bage: { text: "📦", label: "age = 18", x: 80, y: 78, cls: "box dim" }
        }
      }
    ]
  },

  {
    id: "list-index",
    title: "列表与索引",
    icon: "🗄️",
    steps: [
      {
        caption: '列表 = 一排编号的抽屉：fruits = ["苹果", "香蕉", "橘子"]。',
        els: {
          d0: { text: "🍎", label: "0 号", x: 25, y: 52, cls: "drawer" },
          d1: { text: "🍌", label: "1 号", x: 50, y: 52, cls: "drawer" },
          d2: { text: "🍊", label: "2 号", x: 75, y: 52, cls: "drawer" }
        }
      },
      {
        caption: "全世界新手都会绊一下：编号从 0 开始，第一个抽屉是 0 号，不是 1 号！",
        els: {
          d0: { text: "🍎", label: "0 号", x: 25, y: 52, cls: "drawer hl" },
          d1: { text: "🍌", label: "1 号", x: 50, y: 52, cls: "drawer hl" },
          d2: { text: "🍊", label: "2 号", x: 75, y: 52, cls: "drawer hl" }
        }
      },
      {
        caption: "fruits[0]：拉开 0 号抽屉，拿到苹果。",
        els: {
          code: { text: "print(fruits[0])", x: 50, y: 14, cls: "code" },
          d0: { text: "🍎", label: "0 号", x: 25, y: 52, cls: "drawer hl" },
          d1: { text: "🍌", label: "1 号", x: 50, y: 52, cls: "drawer dim" },
          d2: { text: "🍊", label: "2 号", x: 75, y: 52, cls: "drawer dim" },
          out: { text: "苹果", x: 50, y: 86, cls: "out" }
        }
      },
      {
        caption: "号码 -1 表示倒数第一格——也就是 2 号抽屉。",
        els: {
          code: { text: "print(fruits[-1])", x: 50, y: 14, cls: "code" },
          d0: { text: "🍎", label: "0 号", x: 25, y: 52, cls: "drawer dim" },
          d1: { text: "🍌", label: "1 号", x: 50, y: 52, cls: "drawer dim" },
          d2: { text: "🍊", label: "-1 号", x: 75, y: 52, cls: "drawer hl" }
        }
      },
      {
        caption: "fruits[-1]：拿到最后一个——橘子。",
        els: {
          code: { text: "print(fruits[-1])", x: 50, y: 14, cls: "code" },
          d0: { text: "🍎", label: "0 号", x: 25, y: 52, cls: "drawer dim" },
          d1: { text: "🍌", label: "1 号", x: 50, y: 52, cls: "drawer dim" },
          d2: { text: "🍊", label: "-1 号", x: 75, y: 52, cls: "drawer hl" },
          out: { text: "橘子", x: 50, y: 86, cls: "out" }
        }
      }
    ]
  },

  {
    id: "dict-get",
    title: "字典取值",
    icon: "🗃️",
    steps: [
      {
        caption: '字典是一排贴名字的柜子：scores = {"语文": 90, "数学": 85}。',
        els: {
          c1: { text: "🗄️", label: "语文：90", x: 35, y: 52, cls: "drawer" },
          c2: { text: "🗄️", label: "数学：85", x: 65, y: 52, cls: "drawer" }
        }
      },
      {
        caption: 'scores["语文"]：不看号码，看名字——找贴「语文」的那个柜子。',
        els: {
          code: { text: 'print(scores["语文"])', x: 50, y: 14, cls: "code" },
          c1: { text: "🗄️", label: "语文：90", x: 35, y: 52, cls: "drawer hl" },
          c2: { text: "🗄️", label: "数学：85", x: 65, y: 52, cls: "drawer dim" }
        }
      },
      {
        caption: "打开柜子，里面就是 90。",
        els: {
          code: { text: 'print(scores["语文"])', x: 50, y: 14, cls: "code" },
          c1: { text: "🗄️", label: "语文：90", x: 35, y: 52, cls: "drawer hl" },
          c2: { text: "🗄️", label: "数学：85", x: 65, y: 52, cls: "drawer dim" },
          out: { text: "90", x: 50, y: 86, cls: "out" }
        }
      },
      {
        caption: "升级一下：变量 name 里装着「语文」（注意 name 不加引号）。",
        els: {
          code: { text: "print(scores[name])", x: 50, y: 14, cls: "code" },
          c1: { text: "🗄️", label: "语文：90", x: 35, y: 52, cls: "drawer" },
          c2: { text: "🗄️", label: "数学：85", x: 65, y: 52, cls: "drawer" },
          bname: { text: "📦", label: 'name = "语文"', x: 14, y: 86, cls: "box" }
        }
      },
      {
        caption: "scores[name] 取的还是同一个柜子：盒子里写着什么名字，就找什么名字。",
        els: {
          code: { text: "print(scores[name])", x: 50, y: 14, cls: "code" },
          c1: { text: "🗄️", label: "语文：90", x: 35, y: 52, cls: "drawer hl" },
          c2: { text: "🗄️", label: "数学：85", x: 65, y: 52, cls: "drawer dim" },
          bname: { text: "📦", label: 'name = "语文"', x: 14, y: 86, cls: "box hl" },
          out: { text: "90", x: 50, y: 86, cls: "out" }
        }
      }
    ]
  },

  {
    id: "for-loop",
    title: "for 循环慢放",
    icon: "🔁",
    steps: [
      {
        caption: "for 循环：把一排抽屉挨个看一遍。盯住箭头和 f 徽章。",
        els: {
          code: { text: "for f in fruits:", x: 50, y: 10, cls: "code" },
          d0: { text: "🍎", label: "0 号", x: 25, y: 50, cls: "drawer" },
          d1: { text: "🍌", label: "1 号", x: 50, y: 50, cls: "drawer" },
          d2: { text: "🍊", label: "2 号", x: 75, y: 50, cls: "drawer" }
        }
      },
      {
        caption: "第 1 圈：f 自动变成「苹果」，print(f) 打印苹果。",
        els: {
          code: { text: "for f in fruits:", x: 50, y: 10, cls: "code hl" },
          arrow: { text: "⬇️", x: 25, y: 30, cls: "big" },
          d0: { text: "🍎", label: "0 号", x: 25, y: 50, cls: "drawer hl" },
          d1: { text: "🍌", label: "1 号", x: 50, y: 50, cls: "drawer dim" },
          d2: { text: "🍊", label: "2 号", x: 75, y: 50, cls: "drawer dim" },
          badge: { text: "f = 苹果", x: 50, y: 72, cls: "val" },
          out: { text: "苹果", x: 50, y: 90, cls: "out" }
        }
      },
      {
        caption: "第 2 圈：不用你管，f 自己换成「香蕉」。",
        els: {
          code: { text: "for f in fruits:", x: 50, y: 10, cls: "code hl" },
          arrow: { text: "⬇️", x: 50, y: 30, cls: "big" },
          d0: { text: "🍎", label: "0 号", x: 25, y: 50, cls: "drawer dim" },
          d1: { text: "🍌", label: "1 号", x: 50, y: 50, cls: "drawer hl" },
          d2: { text: "🍊", label: "2 号", x: 75, y: 50, cls: "drawer dim" },
          badge: { text: "f = 香蕉", x: 50, y: 72, cls: "val" },
          out: { text: "苹果\n香蕉", x: 50, y: 90, cls: "out" }
        }
      },
      {
        caption: "第 3 圈：f 换成「橘子」。",
        els: {
          code: { text: "for f in fruits:", x: 50, y: 10, cls: "code hl" },
          arrow: { text: "⬇️", x: 75, y: 30, cls: "big" },
          d0: { text: "🍎", label: "0 号", x: 25, y: 50, cls: "drawer dim" },
          d1: { text: "🍌", label: "1 号", x: 50, y: 50, cls: "drawer dim" },
          d2: { text: "🍊", label: "2 号", x: 75, y: 50, cls: "drawer hl" },
          badge: { text: "f = 橘子", x: 50, y: 72, cls: "val" },
          out: { text: "苹果\n香蕉\n橘子", x: 50, y: 90, cls: "out" }
        }
      },
      {
        caption: "抽屉看完了，循环自动结束。每圈 f 自动换人——这就是 for 的全部。",
        els: {
          code: { text: "for f in fruits:", x: 50, y: 10, cls: "code" },
          d0: { text: "🍎", label: "0 号", x: 25, y: 50, cls: "drawer" },
          d1: { text: "🍌", label: "1 号", x: 50, y: 50, cls: "drawer" },
          d2: { text: "🍊", label: "2 号", x: 75, y: 50, cls: "drawer" },
          out: { text: "苹果\n香蕉\n橘子", x: 50, y: 88, cls: "out" }
        }
      }
    ]
  },

  {
    id: "if-branch",
    title: "if 分支",
    icon: "🔀",
    steps: [
      {
        caption: "if 是一个岔路口：条件成立走左路，不成立走右路。",
        els: {
          cond: { text: "score >= 60 ？", x: 50, y: 30, cls: "code" },
          left: { text: "✅ 成立 → 打印「及格」", x: 24, y: 66, cls: "path" },
          right: { text: "❌ 不成立 → 打印「不及格」", x: 76, y: 66, cls: "path" }
        }
      },
      {
        caption: "现在 score 是 75，站到路口看一看。",
        els: {
          sbox: { text: "📦", label: "score = 75", x: 14, y: 14, cls: "box" },
          cond: { text: "score >= 60 ？", x: 50, y: 30, cls: "code" },
          left: { text: "✅ 成立 → 打印「及格」", x: 24, y: 66, cls: "path" },
          right: { text: "❌ 不成立 → 打印「不及格」", x: 76, y: 66, cls: "path" }
        }
      },
      {
        caption: "算一算条件：75 >= 60，成立！",
        els: {
          sbox: { text: "📦", label: "score = 75", x: 14, y: 14, cls: "box" },
          cond: { text: "score >= 60 ？", x: 50, y: 30, cls: "code hl" },
          res: { text: "75 >= 60 → 成立！", x: 50, y: 48, cls: "val" },
          left: { text: "✅ 成立 → 打印「及格」", x: 24, y: 66, cls: "path" },
          right: { text: "❌ 不成立 → 打印「不及格」", x: 76, y: 66, cls: "path" }
        }
      },
      {
        caption: "左路亮起，走左路：打印「及格」。右路根本没被执行。",
        els: {
          sbox: { text: "📦", label: "score = 75", x: 14, y: 14, cls: "box" },
          cond: { text: "score >= 60 ？", x: 50, y: 30, cls: "code" },
          left: { text: "✅ 成立 → 打印「及格」", x: 24, y: 66, cls: "path on" },
          right: { text: "❌ 不成立 → 打印「不及格」", x: 76, y: 66, cls: "path dim" },
          out: { text: "及格", x: 24, y: 90, cls: "out" }
        }
      },
      {
        caption: "如果 score 是 45：条件不成立，这次走右路，打印「不及格」。",
        els: {
          sbox: { text: "📦", label: "score = 45", x: 14, y: 14, cls: "box" },
          cond: { text: "score >= 60 ？", x: 50, y: 30, cls: "code hl" },
          res: { text: "45 >= 60 → 不成立", x: 50, y: 48, cls: "val" },
          left: { text: "✅ 成立 → 打印「及格」", x: 24, y: 66, cls: "path dim" },
          right: { text: "❌ 不成立 → 打印「不及格」", x: 76, y: 66, cls: "path on" },
          out: { text: "不及格", x: 76, y: 90, cls: "out" }
        }
      }
    ]
  },

  {
    id: "function-call",
    title: "函数调用",
    icon: "🧩",
    steps: [
      {
        caption: "def 定义一台小机器 add：吃两个数，吐出它们的和。",
        els: {
          code: { text: "def add(a, b):\n    return a + b", x: 50, y: 14, cls: "code" }
        }
      },
      {
        caption: "定义只是把机器造好存起来——它还闲着，什么都没输出。",
        els: {
          code: { text: "def add(a, b):\n    return a + b", x: 50, y: 14, cls: "code" },
          machine: { text: "⚙️", label: "add 机器", x: 50, y: 55, cls: "machine" }
        }
      },
      {
        caption: "调用 add(3, 5)：原料 3 和 5 准备送进机器。",
        els: {
          code: { text: "result = add(3, 5)", x: 50, y: 14, cls: "code hl" },
          machine: { text: "⚙️", label: "add 机器", x: 50, y: 55, cls: "machine" },
          in1: { text: "3", x: 24, y: 84, cls: "val" },
          in2: { text: "5", x: 36, y: 84, cls: "val" }
        }
      },
      {
        caption: "机器内部：a 变成 3，b 变成 5，算出 a + b。",
        els: {
          code: { text: "result = add(3, 5)", x: 50, y: 14, cls: "code hl" },
          machine: { text: "⚙️", label: "add 机器", x: 50, y: 55, cls: "machine work" },
          in1: { text: "3", x: 43, y: 55, cls: "val" },
          in2: { text: "5", x: 57, y: 55, cls: "val" }
        }
      },
      {
        caption: "return：把成品 8 从窗口递出来。",
        els: {
          code: { text: "result = add(3, 5)", x: 50, y: 14, cls: "code hl" },
          machine: { text: "⚙️", label: "add 机器", x: 50, y: 55, cls: "machine" },
          prod: { text: "8", x: 50, y: 32, cls: "val hl" }
        }
      },
      {
        caption: "result = add(3, 5)：成品 8 落进 result 盒子。忘了 return，接到的是 None！",
        els: {
          code: { text: "result = add(3, 5)", x: 50, y: 14, cls: "code" },
          machine: { text: "⚙️", label: "add 机器", x: 50, y: 55, cls: "machine dim" },
          prod: { text: "8", x: 82, y: 80, cls: "val" },
          rbox: { text: "📦", label: "result", x: 82, y: 86, cls: "box hl" }
        }
      }
    ]
  },

  {
    id: "agent-loop",
    title: "Agent 传纸条循环",
    icon: "📝",
    steps: [
      {
        caption: "Agent 的秘密就是「传纸条」：三位演员——你、LLM 的房间、门外的跑腿。",
        els: {
          user: { text: "🧑", label: "你", x: 12, y: 55, cls: "person" },
          room: { text: "🏠", label: "LLM 的房间", x: 55, y: 45, cls: "person" },
          runner: { text: "🏃", label: "跑腿（工具）", x: 88, y: 80, cls: "person" }
        }
      },
      {
        caption: "你把问题写在纸条上：「北京天气怎么样？」",
        els: {
          user: { text: "🧑", label: "你", x: 12, y: 55, cls: "person hl" },
          room: { text: "🏠", label: "LLM 的房间", x: 55, y: 45, cls: "person" },
          runner: { text: "🏃", label: "跑腿（工具）", x: 88, y: 80, cls: "person" },
          p1: { text: "📝 北京天气怎么样？", x: 14, y: 38, cls: "paper" }
        }
      },
      {
        caption: "纸条飞进 LLM 的房间。",
        els: {
          user: { text: "🧑", label: "你", x: 12, y: 55, cls: "person" },
          room: { text: "🏠", label: "LLM 的房间", x: 55, y: 45, cls: "person hl" },
          runner: { text: "🏃", label: "跑腿（工具）", x: 88, y: 80, cls: "person" },
          p1: { text: "📝 北京天气怎么样？", x: 50, y: 30, cls: "paper" }
        }
      },
      {
        caption: "LLM 不直接回答——它递出一张暗号纸条：「调用工具：查天气」。",
        els: {
          user: { text: "🧑", label: "你", x: 12, y: 55, cls: "person" },
          room: { text: "🏠", label: "LLM 的房间", x: 55, y: 45, cls: "person hl" },
          runner: { text: "🏃", label: "跑腿（工具）", x: 88, y: 80, cls: "person" },
          p2: { text: "🔑 暗号：查天气(北京)", x: 55, y: 62, cls: "paper" }
        }
      },
      {
        caption: "跑腿拿到暗号，出门执行工具（比如调天气 API）。",
        els: {
          user: { text: "🧑", label: "你", x: 12, y: 55, cls: "person" },
          room: { text: "🏠", label: "LLM 的房间", x: 55, y: 45, cls: "person" },
          runner: { text: "🏃", label: "跑腿（工具）", x: 88, y: 80, cls: "person hl" },
          p2: { text: "🔑 暗号：查天气(北京)", x: 82, y: 66, cls: "paper" }
        }
      },
      {
        caption: "执行完毕，结果纸条到手：「晴，28℃」。",
        els: {
          user: { text: "🧑", label: "你", x: 12, y: 55, cls: "person" },
          room: { text: "🏠", label: "LLM 的房间", x: 55, y: 45, cls: "person" },
          runner: { text: "🏃", label: "跑腿（工具）", x: 88, y: 80, cls: "person hl" },
          p3: { text: "📄 结果：晴，28℃", x: 82, y: 66, cls: "paper" }
        }
      },
      {
        caption: "结果飞回房间，LLM 看着它写出最终答案。",
        els: {
          user: { text: "🧑", label: "你", x: 12, y: 55, cls: "person" },
          room: { text: "🏠", label: "LLM 的房间", x: 55, y: 45, cls: "person hl" },
          runner: { text: "🏃", label: "跑腿（工具）", x: 88, y: 80, cls: "person" },
          p3: { text: "📄 结果：晴，28℃", x: 55, y: 62, cls: "paper" },
          p4: { text: "💬 北京今天晴，28℃", x: 50, y: 30, cls: "paper" }
        }
      },
      {
        caption: "答案飞回你手里。还要查别的就再传一轮——这就是 Agent 传纸条循环（对应小白课《Agent 传纸条循环》）。",
        els: {
          user: { text: "🧑", label: "你", x: 12, y: 55, cls: "person hl" },
          room: { text: "🏠", label: "LLM 的房间", x: 55, y: 45, cls: "person" },
          runner: { text: "🏃", label: "跑腿（工具）", x: 88, y: 80, cls: "person" },
          p4: { text: "💬 北京今天晴，28℃", x: 14, y: 38, cls: "paper" }
        }
      }
    ]
  }
];
