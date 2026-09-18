// 必背代码 · 单元 CODE-A：Python 地基 7 条 + 工程运维 4 条
// 契约见 tools/textbook/SPEC-CODE.md「单元 CODE-A」；id / t / group / level / tb / qs 逐字照抄
window.CODE_ITEMS = window.CODE_ITEMS || {};
Object.assign(window.CODE_ITEMS, {
  "py-list-dict": {
    id: "py-list-dict",
    t: "列表与字典常用操作",
    group: "py",
    level: "must",
    scene: "面试官丢给你一段接口返回的 JSON（本质是嵌套 dict），让你挑出分数最高的两条、再统计标签各出现几次：第一步就是这套增删改查 + get + sorted。",
    code: `from collections import Counter            # Counter 专门用来计数

msgs = ['hi', 'hello']
msgs.append('hey')             # 增：尾部追加
msgs.insert(0, 'first')        # 增：插到 0 号位
msgs.remove('hi')              # 删：按内容删
msgs[0] = 'FIRST'              # 改：按号码改
print(msgs[0], msgs[-1])       # 查：第一个、最后一个

resp = {'model': 'gpt-4o', 'usage': {'tokens': 128}}
print(resp['model'])                 # 查：按名字取，缺键会 KeyError
print(resp.get('stream', False))     # 查：缺键给默认值，不报错
resp['temperature'] = 0.7            # 增/改：字典一体，没有 append
resp.update({'stream': True})        # 合并更新
del resp['temperature']              # 删：删一整格
print(resp['usage']['tokens'])       # 嵌套取值：一层层用 [] 剥

docs = [{'t': 'RAG', 'score': 0.92}, {'t': 'Agent', 'score': 0.97}]
top = sorted(docs, key=lambda d: d['score'], reverse=True)   # 按分数倒序
print(top[0]['t'])                   # 检索结果排序取 Top1 就是这个写法

tags = ['ai', 'llm', 'ai', 'agent', 'llm']
uniq = list(dict.fromkeys(tags))     # 去重且保持原顺序，set 会丢顺序
print(uniq, Counter(tags)['ai'])     # Counter 数每个词出现几次`,
    lang: "python",
    keys: [
      "字典取可能缺失的字段必须先写 resp.get('key', 默认值)，不能用 [] 硬取",
      "排序要写 sorted(列表, key=lambda x: x['字段'], reverse=True)，先给 key 再决定是否倒序",
      "字典加一格和改一格是同一句 d[key] = 值，字典没有 append 方法",
      "去重又要保原顺序必须用 list(dict.fromkeys(...))，直接 set() 顺序不保证",
    ],
    traps: [
      "列表删元素是 remove(值)、字典删一格是 del d[key]，写成 d.remove(...) 会报 AttributeError",
      "sorted() 返回新列表不改原身，lst.sort() 才就地改，两者别混着用",
      "嵌套字典要一层层剥 resp['usage']['tokens']，写成 resp['usage.tokens'] 会 KeyError",
    ],
    rel: ["04-Python/常用数据结构与函数.md"],
    tb: ["1.4"],
    qs: [],
  },

  "py-comprehension": {
    id: "py-comprehension",
    t: "推导式与解包",
    group: "py",
    level: "must",
    scene: "面试官让你把接口返回的一堆记录里 score 大于阈值的挑出来、字段改名后重组成 dict：不会推导式就只能 for 循环堆十行，差距就在这。",
    code: `nums = [1, 2, 3, 4, 5, 6]
squares = [n ** 2 for n in nums]                 # 基本式：每个数平方
evens = [n for n in nums if n % 2 == 0]          # 带 if 过滤：只留偶数
print(squares, evens)

prices = {'apple': 3, 'banana': 2, 'cherry': 8}
expensive = {k: v for k, v in prices.items() if v > 2}   # 字典推导式要写 k: v
print(expensive)

lines = ['第一段', '', '  ', '第二段']
clean = [line.strip() for line in lines if line.strip()]  # 清洗模型输出的空行
print(clean)

def min_max(items):
    return min(items), max(items)        # 返回元组：一次交两个结果
lo, hi = min_max([3, 1, 4])              # 解包：按位置对号入座
first, *rest = [1, 2, 3, 4]              # 星号解包：first=1，rest=[2, 3, 4]
print(lo, hi, first, rest)

def chat(prompt, model='gpt-4o', **options):    # **options 把多余关键字收成 dict
    return f'[{model}] {prompt} {options}'

params = {'temperature': 0}
print(chat('你好', **params))            # ** 在调用处是解包 dict 当关键字参数`,
    lang: "python",
    keys: [
      "列表推导式的顺序永远是 [表达式 for 变量 in 序列 if 条件]，表达式在最前、if 在 for 后面",
      "函数 return a, b 实际返回的是元组，接收时左边变量个数必须和右边对得上",
      "字典推导式必须写成 {k: v for k, v in d.items()}，两个值缺一个就变成 set 推导式",
      "** 出现在函数定义里是收参数（收成 dict），出现在调用里是解包 dict",
    ],
    traps: [
      "推导式里塞复杂逻辑和副作用会让代码没法读，超过一层嵌套就该改回普通 for 循环",
      "可变对象不能做默认参数，def f(items=[]) 会让多次调用共享同一个列表",
      "解包个数不对会直接 ValueError，不确定剩下几个时要用星号 first, *rest 接住",
    ],
    rel: ["04-Python/基础语法速查.md"],
    tb: ["1.9"],
    qs: [],
  },

  "py-string": {
    id: "py-string",
    t: "字符串处理",
    group: "py",
    level: "must",
    scene: "把模型返回的一段带空格带换行的文本拆成字段、再拼回 Prompt，是最日常的活。面试常让你现场把 'role:content' 解析成两段。",
    code: `raw = '  Hello, AI World  '
print(raw.strip())                    # 去首尾空白
print(raw.strip().lower())            # 变小写
print(raw.replace('AI', 'LLM'))       # 换：返回新串，不改原身
print('a,b,c'.split(','))             # 切：字符串 → 列表
print('-'.join(['a', 'b', 'c']))      # 粘：列表 → 字符串，主人是胶水
print('report.pdf'.endswith('.pdf'), 'AI' in raw)   # 判断结尾 / 是否包含

text = 'PromptEngineering'
print(text[0:6], text[-11:], text[::-1])   # 切片：终点不含 / 负数从尾数 / 反转

line = '  user: 什么是 RAG?  '          # 实战：拆开模型返回的一行
role, content = [p.strip() for p in line.split(':', 1)]   # 只切第一个冒号
print(role, content)

model, tokens = 'gpt-4o', 128
print(f'模型 {model} 消耗了 {tokens} 个 token')   # f-string：拼 Prompt 的标准姿势
print(f'准确率 {0.9234:.2f}')         # :.2f 保留两位小数

template = '你是翻译助手，把下面内容翻成{lang}：{content}'   # {} 是占位符
print(template.format(lang='英语', content='你好'))`,
    lang: "python",
    keys: [
      "切片终点不含，text[0:6] 拿到的是下标 0 到 5 这六个字符",
      "join 的主人是分隔符，写法必须是 ','.join(列表)，列表在前会报错",
      "f-string 必须每个字符串各自带 f，格式符要写成 {值:.2f} 这种形式",
      "split 不写参数按空白切，指定分隔符写 s.split(',')，只切第一个要写 s.split(',', 1)",
    ],
    traps: [
      "replace / split / strip 都是返回新字符串、不改原身，必须先接住返回值再往下用",
      "split(':') 会把所有冒号都切开，字段里含冒号时只取两段要写 split(':', 1)",
      "Windows 上读写含中文的文件必须写 encoding='utf-8'，不然必然乱码或报 UnicodeDecodeError",
    ],
    rel: ["04-Python/方法主人对照表.md", "04-Python/基础语法速查.md"],
    tb: ["1.3"],
    qs: [],
  },

  "py-file": {
    id: "py-file",
    t: "文件读写",
    group: "py",
    level: "must",
    scene: "面试让你写「读一份 jsonl 日志统计行数」或者「把结果追加写回文件」，考的就是 with open 四件套，encoding 写错现场就翻车。",
    code: `import json

with open('notes.txt', 'w', encoding='utf-8') as f:   # w 覆盖写，必须指定编码
    print('第一行：记得写 encoding', file=f)      # print 到文件，自带换行
    print('第二行：with 结束自动关文件', file=f)

with open('notes.txt', 'r', encoding='utf-8') as f:
    print(f.read())                              # 一次读全部，小文件可以

with open('notes.txt', 'r', encoding='utf-8') as f:
    for line in f:                               # 按行读，大文件不占内存
        print('读到:', line.strip())

with open('notes.txt', 'a', encoding='utf-8') as f:   # a 追加，不清空原内容
    print('第三行：追加进来的', file=f)

cfg = {'model': 'gpt-4o', 'temperature': 0.7}    # AI 项目的配置基本都是 JSON
with open('config.json', 'w', encoding='utf-8') as f:
    json.dump(cfg, f, ensure_ascii=False)        # 不写 ensure_ascii 中文变乱码
with open('config.json', 'r', encoding='utf-8') as f:
    print(json.load(f)['model'])                 # 读回来是 dict，直接按名字取`,
    lang: "python",
    keys: [
      "open 必须同时给模式和 encoding='utf-8'，模式决定覆盖还是追加",
      "读写一律用 with open(...) as f，块结束自动关文件，不要手动 f.close()",
      "想保留原内容必须用 'a' 追加，'w' 一打开就把原文件清空了",
      "json.dump 要加 ensure_ascii=False，否则中文被转成编码没法看",
    ],
    traps: [
      "f.write 不会自动加换行，要一行一行写就用 print(..., file=f) 或自己补换行符",
      "json.dump 只能序列化 dict / list / str / 数字，塞了自定义对象就会 TypeError",
      "读大文件不要一次 f.read()，要 for line in f 逐行读，否则内存直接爆",
    ],
    rel: ["04-Python/基础语法速查.md"],
    tb: ["1.7"],
    qs: [],
  },

  "py-except": {
    id: "py-except",
    t: "异常处理",
    group: "py",
    level: "must",
    scene: "调模型 API、读用户上传的文件、解析模型吐出的 JSON，任何一处都可能炸；面试官爱问「这段代码为什么不能裸 except」，答案就在这段里。",
    code: `def parse_int(text):
    try:
        return int(text)              # 可能炸的那行才放 try
    except ValueError:                # 只捕预期的异常类型
        return 0                      # 给兜底值，调用方不用再判空
print(parse_int('42'), parse_int('abc'))

def divide(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        return None                   # 只捕这一种，别写裸 except
    finally:
        print('计算结束')              # 出不出异常都执行，收尾用
print(divide(10, 2), divide(10, 0))

def call_api(key):
    if not key:
        raise ValueError('API Key 不能为空')   # 主动抛，交给上层处理

try:
    call_api('')
except ValueError as e:
    print('捕获到:', e)                # as e 拿到异常对象，日志里才有原因`,
    lang: "python",
    keys: [
      "只捕获你能处理的异常类型，绝不能写裸 except:（会把 Ctrl+C 和真 bug 一起吞掉）",
      "try 里只放可能出异常的那几行，范围必须尽量小，否则定位问题会很难",
      "finally 不管有没有异常都会执行，资源释放要放这里；没异常才走的逻辑放 else",
      "参数非法要主动 raise ValueError('原因')，不要返回 None 让上层猜",
    ],
    traps: [
      "except 后面必须写处理逻辑或兜底返回值，否则函数会静默返回 None，bug 更难查",
      "except 分支要具体到宽泛排列，except Exception 写在最前面会让后面的分支永远进不去",
      "raise ValueError 一定要带原因字符串，否则日志里只剩一行报错看不出哪错",
    ],
    rel: ["04-Python/基础语法速查.md"],
    tb: ["1.6"],
    qs: [],
  },

  "py-func-class": {
    id: "py-func-class",
    t: "函数与类",
    group: "py",
    level: "must",
    scene: "面试让你「把一段面向过程的脚本改写成类」，考的就是 __init__ 挂属性 + self 传状态。写不出 self 就说明没真写过类。",
    code: `def chat(prompt, model='gpt-4o', temperature=0.7):   # 默认参数：不传就用默认值
    return f'[{model}|T={temperature}] {prompt}'
print(chat('你好'), chat('你好', temperature=0))   # 默认值 / 关键字传参

def total(*nums):                         # *args：任意多个位置参数收成 tuple
    return sum(nums)
print(total(1, 2, 3, 4))

class ChatSession:
    def __init__(self, model='gpt-4o'):   # 实例化时自动调用
        self.model = model                # self.xxx 是这个实例自己的属性
        self.history = []                 # 每个会话各有各的历史

    def say(self, text):                  # 实例方法第一个参数永远是 self
        self.history.append({'role': 'user', 'content': text})
        return f'{self.model} 收到 {len(self.history)} 条'

    def __str__(self):                    # print 实例时显示什么
        return f'ChatSession({self.model}, {len(self.history)} 条)'

s = ChatSession()
print(s.say('第一句'), s.say('第二句'))
print(s)`,
    lang: "python",
    keys: [
      "实例方法第一个参数必须写 self，调用时不用传，s.say('x') 会自动把 s 传进去",
      "构造函数名固定是 __init__，属性一律挂在 self 上（self.model = model）",
      "默认参数不能用可变对象，要写 None 再在函数体里兜底成空列表",
      "*args 收成 tuple、**kwargs 收成 dict，顺序必须是先位置参数后关键字参数",
    ],
    traps: [
      "方法定义必须带 self，漏写时调用 s.say('x') 会报 takes 1 positional argument but 2 were given",
      "类里方法互相调用必须写 self.other()，直接写 other() 会 NameError",
      "默认参数不能用可变对象，def f(items=[]) 会让所有调用共享同一个列表",
    ],
    rel: ["04-Python/常用数据结构与函数.md", "04-Python/Python必背清单.md"],
    tb: ["1.8"],
    qs: [],
  },

  "py-sql": {
    id: "py-sql",
    t: "SQL 增删改查四句",
    group: "py",
    level: "must",
    scene: "面试让你现场写「一张用户表，查出所有来自某城市的用户」，从建表到增删改查一路写下来。用 sqlite3 是因为 Python 自带、当场就能跑。",
    code: `import sqlite3

conn = sqlite3.connect(':memory:')     # 内存库，跑完即销毁，练习用它
cur = conn.cursor()

cur.execute('''CREATE TABLE notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    content TEXT)''')                  # 建表：id 是自增主键

cur.execute('INSERT INTO notes (title, content) VALUES (?, ?)',
            ('第一条', '学会 SQLite'))   # 增：? 占位符传参，防 SQL 注入
conn.commit()                          # 写操作后必须 commit，否则不生效

cur.execute('SELECT id, title FROM notes WHERE content LIKE ?', ('%SQLite%',))
print('查:', cur.fetchall())            # 查：fetchall 返回元组列表

cur.execute('UPDATE notes SET content = ? WHERE id = ?', ('内容已更新', 1))
conn.commit()                          # 改：UPDATE 之后同样要 commit
cur.execute('DELETE FROM notes WHERE id = ?', (1,))
conn.commit()                          # 删：DELETE 之后同样要 commit
cur.execute('SELECT COUNT(*) FROM notes')
print('删后剩余:', cur.fetchone()[0])    # fetchone 取一行，[0] 取第一列
conn.close()                           # 关连接`,
    lang: "python",
    keys: [
      "写操作 INSERT / UPDATE / DELETE 之后必须 conn.commit()，不提交等于没写",
      "所有外部传进来的值一律用 ? 占位符传参，绝不能 f-string 拼进 SQL 字符串",
      "占位符的值放在 execute 的第二个参数里，单个值也要写成 (1,) 这种元组",
      "建表必须写 CREATE TABLE IF NOT EXISTS，否则脚本第二次跑就会报表已存在",
    ],
    traps: [
      "单个参数的元组必须带逗号 (1,)，写成 (1) 只是数字 1，会报参数数量不匹配",
      "忘 commit 时同一连接内还能查到数据，一关程序就全没了，最容易误判成成功",
      "SELECT 出来的是元组，取值要用 cur.fetchall() / cur.fetchone()，不能直接打印游标",
    ],
    rel: ["01-名词与概念/数据库入门.md"],
    tb: ["2.2"],
    qs: [],
  },

  "ops-git": {
    id: "ops-git",
    t: "Git 协作与冲突解决",
    group: "ops",
    level: "must",
    scene: "面试问「你和同事同时改了同一行怎么办」，答不上来就露怯；这段是必须能一条条念出来的肌肉记忆。",
    code: `# ===== 一、日常协作序列：建分支 → 提交 → 推送 → PR → 合并 =====
git switch main                  # 先回到主线，保证从最新代码开分支
git pull                         # 拉最新，别在过期代码上开工
git switch -c feat/login         # 建并切到功能分支
git add .                        # 改动放进暂存区
git commit -m "feat: 完成登录接口"   # 存一档，写清改了什么
git push -u origin feat/login    # 推分支到远程，-u 记住对应关系
# 到 GitHub 发 PR → 同事 review → 点 Merge 合进 main

# ===== 二、解决冲突：两个人改了同一个文件的同一行 =====
git pull                         # 拉的时候提示冲突，或合并 PR 时报冲突
git status                       # 看哪些文件冲突了（Unmerged paths 一节）
# 打开冲突文件，会看到 <<<<<<< HEAD、=======、>>>>>>> 三段标记
# 手动改成最终想要的样子，再把那三行标记整行删掉
git add 冲突的文件                # 标记已解决，放进暂存区
git commit -m "merge: 解决登录模块冲突"   # 提交，冲突才算真正解除
git push                         # 推上去，PR 上的冲突提示消失`,
    lang: "bash",
    keys: [
      "开分支前必须先 git pull 把主线更新到最新，否则冲突只会更多",
      "解决冲突的顺序是「改文件 → git add → git commit」，缺一步冲突状态就一直在",
      "新分支第一次推送必须写 git push -u origin 分支名，之后直接 git push",
      "提交信息要写清改了什么（feat: / fix: 开头），翻历史全靠这一句",
    ],
    traps: [
      "只删掉冲突标记却忘了 git add，Git 仍认为文件处于冲突中，提交不上去",
      "不要直接在 main 上改代码再 push，多人协作时最容易互相覆盖",
      "冲突标记 <<<<<<< / ======= / >>>>>>> 要整行删干净，留一行就会把标记提交进去",
    ],
    rel: ["00-小白课堂/小白课-Git存档术.md", "01-名词与概念/Git与版本控制.md"],
    tb: ["2.7"],
    qs: ["ops-05"],
  },

  "ops-docker": {
    id: "ops-docker",
    t: "Docker 常用命令",
    group: "ops",
    level: "must",
    scene: "面试问「你的服务怎么部署的」，答得出 docker run -d -p 就够；追问排错时 docker logs / docker exec 是必备动作。",
    code: `docker build -t myapp:1.0 .          # 按当前目录的 Dockerfile 构建镜像
docker images                        # 看本机有哪些镜像
docker run -d --name myapp -p 8000:8000 myapp:1.0   # 后台跑，映射 宿主机:容器
docker ps                            # 看正在跑的容器（加 -a 连退出的也看）
docker logs -f myapp                 # 持续跟日志，排错第一招
docker exec -it myapp bash           # 进容器里看文件和环境，确认代码版本
docker stats myapp                   # 看 CPU / 内存，判断是不是被资源限死
docker stop myapp                    # 优雅停止（先发 SIGTERM 再等）
docker rm myapp                      # 删容器，必须先 stop
docker rmi myapp:1.0                 # 删镜像
docker compose up -d                 # 按 docker-compose.yml 一键起整套服务
docker compose down                  # 停掉并删除整套
docker system prune -a               # 清理没用的镜像/容器/缓存，省磁盘`,
    lang: "bash",
    keys: [
      "docker run 里 -p 的格式是 宿主机端口:容器端口，写反了外面就连不上",
      "看容器日志要用 docker logs，不是去宿主机上翻文件",
      "删容器前必须先 docker stop，正在跑的容器删不掉（强删要加 -f）",
      "容器本身是无状态的，数据要挂卷 -v 或放外部数据库，否则一删全没",
    ],
    traps: [
      "-p 必须先写宿主机端口再写容器端口，写成 容器:宿主机 会端口不通却查不出原因",
      "改了代码不重新 docker build 就 run，跑的还是旧镜像，误以为代码没生效",
      "在 docker exec 里改的文件容器一重建就没了，只有镜像里的代码才算数",
    ],
    rel: ["00-小白课堂/小白课-部署上线.md", "01-名词与概念/部署与上线.md"],
    tb: ["3.9"],
    qs: ["ops-03"],
  },

  "ops-linux": {
    id: "ops-linux",
    t: "Linux 排查命令组合",
    group: "ops",
    level: "must",
    scene: "面试问「线上服务挂了你怎么查」，能按「服务状态 → 日志 → 端口 → 进程 → 磁盘」念出一串命令，比回答「重启试试」高一个档次。",
    code: `systemctl status myapp            # ① 服务起没起：看 active (running) 还是 failed
journalctl -u myapp -n 100 -f     # ② 日志在滚什么：该服务最近 100 行并持续跟
tail -f /var/log/myapp/app.log    # 不是 systemd 管的服务，直接跟日志文件
ss -lntp | grep 8000              # ③ 端口被谁占：l 监听 / n 数字 / t tcp / p 显示进程
lsof -i :8000                     # 没装 ss 的机器用这条，看谁占着 8000
ps aux | grep myapp               # ④ 进程还在不在：查到进程号
kill -9 进程号                     # 确认卡死才强杀（先试 kill 进程号 优雅退出）
top -bn1 | head -20               # 谁在吃 CPU（-bn1 出一屏就退出）
free -h                           # 顺手看内存，OOM 也会让服务莫名挂掉
df -h                             # ⑤ 磁盘满没满：看每个挂载点的使用率
du -sh /var/log/* | sort -h       # 定位是哪个目录把磁盘吃满了`,
    lang: "bash",
    keys: [
      "排查顺序固定是先看服务状态再翻日志，不要一上来就重启",
      "看端口占用用 ss -lntp 或 lsof -i :端口，必须带 p 才能看到进程名",
      "日志要带 -f 持续跟，只看最后一屏会错过正在滚出来的报错",
      "服务莫名挂掉先 df -h 看磁盘、free -h 看内存，多半不是代码的锅",
    ],
    traps: [
      "kill -9 是最后手段，强杀会丢掉进程缓冲里的日志，动手前先把日志存下来",
      "ss 不加 p 只显示端口号，看不出是谁占的，排查会卡住",
      "df -h 看的是整个分区使用率，du -sh 才是具体目录，两个配合才知道是谁占的",
    ],
    rel: ["01-名词与概念/部署与上线.md", "07-工具与资源/常用工具清单.md"],
    tb: ["2.5"],
    qs: ["ops-01"],
  },

  "ops-token-cost": {
    id: "ops-token-cost",
    t: "用 tiktoken 算一次多轮任务的账",
    group: "ops",
    level: "plus",
    scene: "面试官问「你这个 Agent 跑一轮要花多少钱」，能不能当场把账算出来（含系统提示每轮重发）直接决定他觉得你有没有真上线过东西。",
    code: `import tiktoken

enc = tiktoken.get_encoding('o200k_base')      # gpt-4o 系列用的编码
PRICE_IN, PRICE_OUT = 2.0, 8.0                 # 示例单价：每百万 token 多少元
system = '你是一个严谨的技术面试官，只回答技术问题。'   # 系统提示，每轮都要重发

history = [system]                             # 每一轮都把这个列表整份发出去
total_in = total_out = 0
for turn in range(1, 4):                       # 模拟三轮对话
    history.append(f'第 {turn} 轮提问：什么是 RAG？')
    n_in = sum(len(enc.encode(m)) for m in history)   # 输入 = 系统提示 + 全部历史
    answer = 'RAG 是先检索再生成，用外部知识补充上下文。'
    n_out = len(enc.encode(answer))
    history.append(answer)                     # 回答也进历史，下一轮再重发一次
    total_in, total_out = total_in + n_in, total_out + n_out
    print(f'第 {turn} 轮：输入 {n_in} token，输出 {n_out} token')

cost = total_in / 1_000_000 * PRICE_IN + total_out / 1_000_000 * PRICE_OUT
print(f'合计：输入 {total_in}，输出 {total_out}，约 {cost:.6f} 元')`,
    lang: "python",
    keys: [
      "输入 token = 系统提示 + 全部历史 + 本轮提问，每轮都要整份重发一次",
      "算钱要先按 token 分别统计输入和输出，再各自乘单价除以一百万后相加",
      "单价是每百万 token 的价格，不是每个 token 的价格，别漏掉除以一百万",
      "输出单价通常比输入贵好几倍，省钱第一招是让模型简短回答",
    ],
    traps: [
      "算账必须把每一轮的历史都算进输入，只统计最后一轮会把成本严重低估",
      "以为系统提示写在循环外就只算一次，其实它在 messages 里每轮都重发",
      "tiktoken 的 token 数跟具体编码绑定，换模型要换 encoding，别拿一个数套所有模型",
    ],
    rel: ["00-小白课堂/小白课-Token与计费.md", "01-名词与概念/Token与分词.md"],
    tb: ["5.6"],
    qs: ["ops-04"],
  },
});
