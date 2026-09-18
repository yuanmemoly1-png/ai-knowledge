// 缺口增补 GAP2-A · 2.7 Git 协作：分支、PR 与冲突 · 9.3 LoRA 与 PEFT 实操 —— 教材正文
window.TB_SECTIONS = window.TB_SECTIONS || {};
Object.assign(window.TB_SECTIONS, {
  "2.7": {
    id: "2.7",
    t: "Git 协作：分支、PR 与冲突",
    why: "只会一个人 commit，一进团队就翻车：分支、PR、冲突这三件事没人教过，你要么把 main 改乱，要么 force push 把同事的提交抹掉。",
    learn: "能独立走完 clone、建分支、提交、push、发 PR、merge 一整轮；能在本地造出一次真冲突并手动解决。能说出三条最常见的协作翻车以及各自的后果。",
    body: `### 一句话说清
分支就是从主线岔出去的一条平行时间线：在上面随便折腾，成了合回主线，废了直接扔掉。像改文档前另存一份副本做实验，只不过两边的改动由 Git 帮你合。

### 展开讲
2.1 讲的是一个人的存档术：init、add、commit，是本节的前置；这一节讲一群人怎么在同一份代码上不打架。

一个人写代码时存档就够：只有你在改，随手 commit 就是安全网。有了第二个人，两人的提交交错插进同一条历史，谁也说不清哪一版能跑。分支就是给每人发一张独立草稿纸：隔离试验，改崩了不影响别人；并行开发，两条功能同时推进。主线始终是「已知能跑」的那一版。

协作环七步：clone 拷下仓库，switch -c 建分支，改完提交，push 推到远端，发 PR（合并申请），同事评审后 merge 进主线、删掉分支。PR 的灵魂不是技术动作，而是「请人看一眼」的制度：改动摊开、配差异对比，评审点头才允许进主线。

冲突从哪来。合并时 Git 逐行比对：改的是不同文件或不同行，它自己就合好了；**两边改了同一行**，它不知道听谁的，于是停下来问你。解决三步：打开文件，看标记包起来的两块（你的和别人的，中间一排等号分隔），手动取舍只留对的并删干净标记，最后 add 加 commit 收工。冲突不是报错，是 Git 在说这里得你决定。

看分支图用 git log --oneline --graph --all。降冲突频率靠两个习惯：小步提交（一次只改一件事）和常 pull（开工前先拉最新代码）。

**和教材其它节的分工**：2.1 讲的是一个人的存档术，是本节的前置；这一节讲一群人怎么协作：分支、PR、冲突全是为多人共用一份代码才存在的。

### 动手看
在本地造一次真冲突，比读十遍解释管用：
~~~bash
mkdir conflict-demo && cd conflict-demo
git init
echo "价格 38 元" > menu.txt
git add . && git commit -m "初始菜单"

git switch -c feature           # 建分支做实验
echo "价格 42 元" > menu.txt    # 分支改价
git commit -am "分支调价"

git switch main                 # 回主线
echo "价格 40 元" > menu.txt    # 主线改同一行
git commit -am "主线调价"

git merge feature               # 冲突在这爆出来
~~~
Git 提示 CONFLICT，文件里留下这样的标记：
~~~text
<<<<<<< HEAD
价格 40 元
=======
价格 42 元
>>>>>>> feature
~~~
手动取舍，只留你要的那行并删干净标记，然后：
~~~bash
git add menu.txt
git commit -m "解决冲突"
git log --oneline --graph       # 看合并点
~~~
三条翻车要记牢：直接在 main 上改，你会被别人的合并夹在中间，也没有干净的回退点。force push 把别人的提交从远端抹掉，同事的工作直接消失，算事故。忘 pull 就 push 会被拒，硬推就是上一条。

### 什么时候不该用
一个人写的小项目，直接在 main 上 commit 完全可以，别为仪式感套全流程：分支、PR、评审每一步都花时间。等你和别人共用仓库，或自己同时在开两条大改动，分支才真的省钱。没做完的分支也别推上去求合并。`,
    keypoints: [
      "分支是给每个人发的独立草稿纸：隔离试验、并行开发，主线始终保持在已知能跑的状态。",
      "协作环七步是 clone、建分支、提交、push、发 PR、评审、merge；PR 的价值是把改动摊开让人看一眼再进主线。",
      "冲突来自两边改了同一行，解决三步是看标记、手动取舍、add 后再 commit；它不是报错，是要你做决定。",
      "降低冲突频率靠小步提交加常 pull：改动越小重叠越少，开工前先拉最新代码。",
      "force push 会抹掉远端别人的提交，是团队协作里的事故级操作。",
    ],
    pitfalls: [
      "直接在 main 上改：没有干净的回退点，别人的合并还会把你夹在中间。",
      "force push 覆盖远端，把同事已推上去的提交抹掉，而本地完全看不出来。",
      "忘 pull 就 push，远端有别人的新提交时会被拒；此时硬推就是上一条事故。",
      "把冲突当成 Git 坏了，删掉冲突文件或重新 clone，把别人的改动一起丢掉。",
    ],
    rel: ["00-小白课堂/小白课-Git存档术.md", "01-名词与概念/Git与版本控制.md"],
    qs: ["ops-05"],
    ev: [],
  },

  "9.3": {
    id: "9.3",
    t: "LoRA 与 PEFT 实操",
    why: "知道该微调了却不会动手，等于停在门口：全参微调跑不动，LoRA 又不知道该动哪几个参数，最后只能放弃或者花冤枉钱。",
    learn: "能用自己的话讲清 LoRA 为什么省显存（冻结原权重、只训一对低秩矩阵），能解释 r 和 alpha 各管什么，并能用 transformers 加 peft 写出一次 LoRA 训练的最小骨架。",
    body: `### 一句话说清
LoRA 是给现成模型外挂一副可调旋钮：原权重一个都不动，只在旁边新加两个很小的矩阵，训练时只拧这两个。像一本印好的书，正文不改，只在页边贴层透明便签，读时两层叠着看。

### 展开讲
9.1 讲「什么时候值得微调」，这一节讲「该微调的时候怎么做」。

全参微调贵在「全部」：模型是几亿到几千亿个数字（权重）堆出来的，每个都参与更新，显存要同时装权重、梯度、优化器状态，几十亿参数就能撑爆普通显卡。改动面越广，数据量也越大。

LoRA 不动原权重 W，而是冻结它，在旁边注入一对小矩阵 A 和 B，让这层输出变成 W 加上 B 乘 A：训练时只有 A、B 在变。为什么省？因为 A、B 低秩，中间卡着一个很窄的瓶颈维度 r（秩）：W 若有四千乘四千、约一千六百万个数，A、B 合起来只有几十万个，差好几个数量级，梯度和优化器状态同步变小。

为什么管用？从通用模型走到具体任务，要改的往往不是全部能力，而是一个方向很集中的增量：像本来就会做菜，学一家店的招牌菜，改的不是全部厨艺，只是几处火候和调味。产物只有几十 MB，底座不动，可随时切换卸载。

QLoRA 再省一层：底座按 4 位量化存储，再照常挂 LoRA，量化的只是底座，新增的小矩阵仍按正常精度更新。PEFT 就是把这套做成库的那个包。

数据用指令对或对话格式，一行一条存成 JSON；几十到几千条起步都有人用，但质量远比数量重要，写错的答案会被照单全收。

三个超参：r 是改动容量，越大越容易过拟合、越吃显存；alpha 是缩放，常见做法设成 r 的两倍左右。挂载位置决定旋钮装在哪几层，通常挂注意力层的投影矩阵。

**这一节在全书里的位置**：9.1 讲「什么时候值得微调」，这一节讲「该微调的时候怎么做」：机制、超参和最小代码。

### 动手看
装依赖，再写一个最小骨架：
~~~bash
pip install transformers peft datasets
~~~
~~~python
from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments, Trainer
from peft import LoraConfig, get_peft_model, TaskType
from datasets import load_dataset

name = "底座模型路径"
tokenizer = AutoTokenizer.from_pretrained(name)
model = AutoModelForCausalLM.from_pretrained(name)
# 走 QLoRA 就换成 4 位量化加载（需 bitsandbytes）
# model = AutoModelForCausalLM.from_pretrained(name, load_in_4bit=True)

config = LoraConfig(
    r=8,                                   # 秩：改动容量
    lora_alpha=16,                         # 缩放
    target_modules=["q_proj", "v_proj"],   # 挂载位置
    lora_dropout=0.05,
    task_type=TaskType.CAUSAL_LM,
)
model = get_peft_model(model, config)
model.print_trainable_parameters()         # 可训练参数占比

ds = load_dataset("json", data_files="train.jsonl", split="train")

args = TrainingArguments(output_dir="./lora-out", num_train_epochs=1,
                         per_device_train_batch_size=1, learning_rate=1e-4)
trainer = Trainer(model=model, args=args, train_dataset=ds)
trainer.train()

model.save_pretrained("./lora-adapter")    # 只存新增的小矩阵
~~~
train.jsonl 一行一条指令对。真跑时更省事的是用 trl 的 SFTTrainer，它替你处理分词和标签对齐。跑通优先，超参按官方示例：r、alpha、挂载层先照抄推荐值，流程顺了再回头一个个试。

### 什么时候不该用
模型缺知识：公司文档、产品价格这类会变的事实，该上 RAG，微调灌进去既贵又很快过时。缺新行为范式——换角色、加格式约束，先改提示词。目标模型本身很小时 LoRA 收益也有限：底座小，能省的比例没多少，可调空间也窄。`,
    keypoints: [
      "LoRA 冻结原权重，只在旁边注入一对低秩小矩阵，这一层的输出变成原权重加上两者相乘的结果。",
      "省显存的关键是秩 r 把可训练参数量压下来，梯度和优化器状态同步变小，数据需求也一起降。",
      "QLoRA 是把底座按 4 位量化后再挂 LoRA，量化的只是底座，新增的小矩阵仍按正常精度训练。",
      "训练数据用指令对或对话格式，几十到几千条起步，质量远比数量重要。",
      "超参三件事：r 是改动容量，alpha 是缩放，挂载位置决定旋钮装在哪几层，先用官方推荐值跑通。",
      "产物只有几十 MB 的适配器文件，底座不动，不同任务的适配器可以切换和卸载。",
    ],
    pitfalls: [
      "以为参数少就能随便调：r 开太大照样过拟合，显存也照样吃紧。",
      "模型缺知识或缺新行为范式却先上微调，前者该走 RAG，后者先改提示词。",
      "只看训练损失就认为练好了，微调后要在真实用例上比一比，损失下降不等于效果变好。",
      "忘记适配器要跟底座配套：换底座就得重练，拿错配的适配器加载会直接报错或输出乱码。",
    ],
    rel: [
      "01-名词与概念/微调Fine-tuning.md",
      "00-小白课堂/小白课-微调Fine-tuning.md",
      "06-深度学习与名校课程/大模型训练方向.md",
    ],
    qs: ["ft-01"],
    ev: [],
  },
});
