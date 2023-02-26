---
layout:     post 
title:      "Vue的编译器"
subtitle:   "Vue.js设计与实现读书笔记"
description: "vue编译器原理与实现方案"
date:       2023-02-26
author:     "kcfuler"
URL: "/2023/02/26/vuejs-compiler/"
categories: [ tech ]
tags: 
    - vue

image:      "https://dogefs.s3.ladydaily.com/~/source/unsplash/photo-1676985086410-243e288378a3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80"
---

## 编译器核心技术概览

### 模板DSL的编辑器

编译器其实只是一段程序，它用来将“一种语言 A”翻译成“另外一种语言 B”。其中，语言 A 通常叫作源代码（source code），语言 B 通常叫作目标代码（object code 或 target code）。编译器将源代码翻译为目标代码的过程叫作编译（compile）。完整的编译过程通常包含词法分析、语法分析、语义分析、中间代码生成、优化、目标代码生成等步骤，如图 15-1 所示。

![](https://gb6tpk84yf.feishu.cn/space/api/box/stream/download/asynccode/?code=NWI5NmI3MjIwYjI2ZWNjODQwOGQ0ZTg4MWJjZTk2YWFfYW5rQkZkVXBSc25mZnJrZVhJaEJ1NXB1Qmt0VmxpUHRfVG9rZW46Ym94Y25rSlVSNFZ2bGVxbDFOSExyQU5qdkFiXzE2Nzc0MDAxNjE6MTY3NzQwMzc2MV9WNA)

  

完整的编译过程可以看到，整个编译过程分为编译前端和编译后端。编译前端包含词法分析、语法分析和语义分析，它通常与目标平台无关，仅负责分析源代码。编译后端则通常与目标平台有关，编译后端涉及中间代码生成和优化以及目标代码生成。但是，编译后端并不一定会包含中间代码生成和优化这两个环节，这取决于具体的场景和实现。中间代码生成和优化这两个环节有时也叫“中端”。

对于 Vue.js 模板编译器来说，源代码就是组件的模板，而目标代码是能够在浏览器平台上运行的 JavaScript 代码，或其他拥有 JavaScript 运行时的平台代码，如下图所示

![](https://gb6tpk84yf.feishu.cn/space/api/box/stream/download/asynccode/?code=ODVjY2E5Zjc4ZjUwODljZTcxM2YxMTA3N2NjMmY5NWVfemYxamsxSW1ISDZlYWI1UFAzb01sT2E1QllkalVhd29fVG9rZW46Ym94Y25HMnVxaHIxaEdVQ2tLcUhmU3diVHhlXzE2Nzc0MDAxNjE6MTY3NzQwMzc2MV9WNA)

  

![](https://gb6tpk84yf.feishu.cn/space/api/box/stream/download/asynccode/?code=YmExNWU1N2YzYThmM2IxZmVjNTIyZmVlNDY3Y2NiM2VfOXljWDRsZU5Ockw0RjBxR1ZiMHBaZDNIWERER3R5dGRfVG9rZW46Ym94Y25PcE1MdTVhcGVJaW1sMDVQdlBBRU9nXzE2Nzc0MDAxNjE6MTY3NzQwMzc2MV9WNA)

AST 是 abstract syntax tree 的首字母缩写，即抽象语法树。所谓模板 AST，其实就是用来描述模板的抽象语法树。

举个例子，假设我们有如下模板：

```JavaScript
01 <div>
02   <h1 v-if="ok">Vue Template</h1>
03 </div>
```

这段模板会被编译为如下所示的 AST：

```JavaScript
01 const ast = {
02   // 逻辑根节点
03   type: 'Root',
04   children: [
05     // div 标签节点
06     {
07       type: 'Element',
08       tag: 'div',
09       children: [
10         // h1 标签节点
11         {
12           type: 'Element',
13           tag: 'h1',
14           props: [
15             // v-if 指令节点
16             {
17               type: 'Directive', // 类型为 Directive 代表指令
18               name: 'if'，       // 指令名称为 if，不带有前缀 v-
19               exp: {
20                 // 表达式节点
21                 type: 'Expression',
22                 content: 'ok'
23               }
24             }
25           ]
26         }
27       ]
28     }
29   ]
30 }
```

可以看到，AST 其实就是一个具有层级结构的对象。模板 AST 具有与模板同构的嵌套结构。每一棵 AST 都有一个逻辑上的根节点，其类型为 Root。模板中真正的根节点则作为 Root 节点的 children 存在。观察上面的 AST，我们可以得出如下结论。

-   不同类型的节点是通过节点的 type 属性进行区分的。例如标签节点的 type 值为 'Element'。
    
-   标签节点的子节点存储在其 children 数组中。
    
-   标签节点的属性节点和指令节点会存储在 props 数组中。
    
-   不同类型的节点会使用不同的对象属性进行描述。例如指令节点拥有 name 属性，用来表达指令的名称，而表达式节点拥有 content 属性，用来描述表达式的内容。
    

1.  我们可以通过封装 parse 函数来完成对模板的词法分析和语法分析，得到模板AST，如图 15-4 所示。
    

![](https://gb6tpk84yf.feishu.cn/space/api/box/stream/download/asynccode/?code=OWE3YTZjMjY1OTNjZmU2OWM0ODRlMTU2ZWNjODkyYzlfcFVRaE9xUVAxWU5mb2RhY2ZXYTBMNnk1RElUVzJXSzVfVG9rZW46Ym94Y25DNldxOGRtd0lrQ2M0QjQ4OVQ5dUdoXzE2Nzc0MDAxNjE6MTY3NzQwMzc2MV9WNA)

我们也可以用下面的代码来表达模板解析的过程：

```JavaScript
01 const template = `
02   <div>
03     <h1 v-if="ok">Vue Template</h1>
04   </div>
05 `
06
07 const templateAST = parse(template)
```

可以看到，parse 函数接收字符串模板作为参数，并将解析后得到的 AST 作为返回值返回。有了模板 AST 后，我们就可以对其进行语义分析，并对模板 AST 进行转换了。什么是语义分析呢？举几个例子。

-   检查 v-else 指令是否存在相符的 v-if 指令。
    
-   分析属性值是否是静态的，是否是常量等。
    
-   插槽是否会引用上层作用域的变量。
    
-   ……
    

![](https://gb6tpk84yf.feishu.cn/space/api/box/stream/download/asynccode/?code=MjU4YTU3YzU5MTM3YzA1MDVmNjRkYjgzM2Q0NWJkNGRfQUVaa3d4bUtWWFFzbTQ5QUtIQkdRRzl5bXpNQWhLekdfVG9rZW46Ym94Y244UVlxTWpvYUZ5NHlFODU4a0U3MXJkXzE2Nzc0MDAxNjE6MTY3NzQwMzc2MV9WNA)

将 Vue.js 模板编译为渲染函数的完整流程

-   用来将模板字符串解析为模板 AST 的解析器（parser）
    
-   用来将模板 AST 转换为 JavaScript AST 的转换器（transformer）
    
-   用来根据 JavaScript AST 生成渲染函数代码的生成器（generator）。
    

  

### 解析器

解析器的入参是字符串模板，解析器会逐个读取字符串模板中的字符，并根据一定的规则将整个字符串切割为一个个 Token。这里的 Token 可以视作词法记号。

假设有这样一段模板：

```JavaScript
01 <p>Vue</p>
```

解析器会把这段字符串切割为以下三个部分：

-   开始标签：<p>。
    
-   文本节点：Vue。
    
-   结束标签：</p>。
    

那么，解析器是如何对模板进行切割的呢？依据什么规则？这就不得不提到有限状态自动机。千万不要被这个名词吓到，它理解起来并不难。所谓“有限状态”，就是指有限个状态，而“自动机”意味着随着字符的输入，解析器会自动地在不同状态间迁移。拿上面的模板来说，当我们分析这段模板字符串时，parse 函数会逐个读取字符，状态机会有一个初始状态，我们记为“初始状态 1”。图 15-8 给出了状态迁移的过程。

![](https://gb6tpk84yf.feishu.cn/space/api/box/stream/download/asynccode/?code=N2JlY2Y2NDlkZGMxNDExNDI5YWM5MzU0MjYwNDA1NmVfa3NPVFZzQldoUWdJdTlvQzVIY0k4Rkx1ZkZLOUF2aXZfVG9rZW46Ym94Y25ZZ2ZWSW9qcDY2SEc5NHBvWEtmQklkXzE2Nzc0MDAxNjE6MTY3NzQwMzc2MV9WNA)

经过这样一系列的状态迁移过程之后，我们最终就能够得到相应的 Token 了。有的圆圈是单线的，而有的圆圈是双线的。双线代表此时状态机是一个合法的 Token。

状态机的简易实现

```JavaScript
01 // 定义状态机的状态
02 const State = {
03   initial: 1,    // 初始状态
04   tagOpen: 2,    // 标签开始状态
05   tagName: 3,    // 标签名称状态
06   text: 4,       // 文本状态
07   tagEnd: 5,     // 结束标签状态
08   tagEndName: 6  // 结束标签名称状态
09 }
10 // 一个辅助函数，用于判断是否是字母
11 function isAlpha(char) {
12   return char >= 'a' && char <= 'z' || char >= 'A' && char <= 'Z'
13 }
14
15 // 接收模板字符串作为参数，并将模板切割为 Token 返回
16 function tokenize(str) {
17   // 状态机的当前状态：初始状态
18   let currentState = State.initial
19   // 用于缓存字符
20   const chars = []
21   // 生成的 Token 会存储到 tokens 数组中，并作为函数的返回值返回
22   const tokens = []
23   // 使用 while 循环开启自动机，只要模板字符串没有被消费尽，自动机就会一直运行
24   while(str) {
25     // 查看第一个字符，注意，这里只是查看，没有消费该字符
26     const char = str[0]
27     // switch 语句匹配当前状态
28     switch (currentState) {
29       // 状态机当前处于初始状态
30       case State.initial:
31         // 遇到字符 <
32         if (char === '<') {
33           // 1. 状态机切换到标签开始状态
34           currentState = State.tagOpen
35           // 2. 消费字符 <
36           str = str.slice(1)
37         } else if (isAlpha(char)) {
38           // 1. 遇到字母，切换到文本状态
39           currentState = State.text
40           // 2. 将当前字母缓存到 chars 数组
41           chars.push(char)
42           // 3. 消费当前字符
43           str = str.slice(1)
44         }
45         break
46       // 状态机当前处于标签开始状态
47       case State.tagOpen:
48         if (isAlpha(char)) {
49           // 1. 遇到字母，切换到标签名称状态
50           currentState = State.tagName
51           // 2. 将当前字符缓存到 chars 数组
52           chars.push(char)
53           // 3. 消费当前字符
54           str = str.slice(1)
55         } else if (char === '/') {
56           // 1. 遇到字符 /，切换到结束标签状态
57           currentState = State.tagEnd
58           // 2. 消费字符 /
59           str = str.slice(1)
60         }
61         break
62       // 状态机当前处于标签名称状态
63       case State.tagName:
64         if (isAlpha(char)) {
65           // 1. 遇到字母，由于当前处于标签名称状态，所以不需要切换状态，
66           // 但需要将当前字符缓存到 chars 数组
67           chars.push(char)
68           // 2. 消费当前字符
69           str = str.slice(1)
70         } else if (char === '>') {
71           // 1.遇到字符 >，切换到初始状态
72           currentState = State.initial
73           // 2. 同时创建一个标签 Token，并添加到 tokens 数组中
74           // 注意，此时 chars 数组中缓存的字符就是标签名称
75           tokens.push({
76             type: 'tag',
77             name: chars.join('')
78           })
79           // 3. chars 数组的内容已经被消费，清空它
80           chars.length = 0
81           // 4. 同时消费当前字符 >
82           str = str.slice(1)
83         }
84         break
85       // 状态机当前处于文本状态
86       case State.text:
87         if (isAlpha(char)) {
88           // 1. 遇到字母，保持状态不变，但应该将当前字符缓存到 chars 数组
89           chars.push(char)
90           // 2. 消费当前字符
91           str = str.slice(1)
92         } else if (char === '<') {
93           // 1. 遇到字符 <，切换到标签开始状态
94           currentState = State.tagOpen
95           // 2. 从 文本状态 --> 标签开始状态，此时应该创建文本 Token，并添加到 tokens 数组
96           // 注意，此时 chars 数组中的字符就是文本内容
97           tokens.push({
98             type: 'text',
99             content: chars.join('')
100           })
101           // 3. chars 数组的内容已经被消费，清空它
102           chars.length = 0
103           // 4. 消费当前字符
104           str = str.slice(1)
105         }
106         break
107       // 状态机当前处于标签结束状态
108       case State.tagEnd:
109         if (isAlpha(char)) {
110           // 1. 遇到字母，切换到结束标签名称状态
111           currentState = State.tagEndName
112           // 2. 将当前字符缓存到 chars 数组
113           chars.push(char)
114           // 3. 消费当前字符
115           str = str.slice(1)
116         }
117         break
118       // 状态机当前处于结束标签名称状态
119       case State.tagEndName:
120         if (isAlpha(char)) {
121           // 1. 遇到字母，不需要切换状态，但需要将当前字符缓存到 chars 数组
122           chars.push(char)
123           // 2. 消费当前字符
124           str = str.slice(1)
125         } else if (char === '>') {
126           // 1. 遇到字符 >，切换到初始状态
127           currentState = State.initial
128           // 2. 从 结束标签名称状态 --> 初始状态，应该保存结束标签名称 Token
129           // 注意，此时 chars 数组中缓存的内容就是标签名称
130           tokens.push({
131             type: 'tagEnd',
132             name: chars.join('')
133           })
134           // 3. chars 数组的内容已经被消费，清空它
135           chars.length = 0
136           // 4. 消费当前字符
137           str = str.slice(1)
138         }
139         break
140     }
141   }
142
143   // 最后，返回 tokens
144   return tokens
145 }
```

通过有限自动机，我们能够将模板解析为一个个 Token，进而可以用它们构建一棵 AST 了。但在具体构建 AST 之前，我们需要思考能否简化 tokenize 函数的代码。实际上，我们可以通过正则表达式来精简 tokenize 函数的代码。上文之所以没有从最开始就采用正则表达式来实现，是因为**正则表达式的本质就是有限自动机**。当你编写正则表达式的时候，其实就是在编写有限自动机。

  

## 解析器

文本模式指的是解析器在工作时所进入的一些特殊状态，在不同的特殊状态下，解析器对文本的解析行为会有所不同。具体来说，当解析器遇到一些特殊标签时，会切换模式，从而影响其对文本的解析行为。这些特殊标签是：

-   <title> 标签、<textarea> 标签，当解析器遇到这两个标签时，会切换到RCDATA 模式；
    
-   <style>、<xmp>、<iframe>、<noembed>、<noframes>、<noscript> 等标签，当解析器遇到这些标签时，会切换到 RAWTEXT 模式；
    
-   当解析器遇到 <![CDATA[ 字符串时，会进入 CDATA 模式。
    

![](https://gb6tpk84yf.feishu.cn/space/api/box/stream/download/asynccode/?code=MWM2MWU1NWQ0M2U2OGQwZGZmZjBhYjY0NzViNDAxNGZfaXdRQWx0STh2Z3VIVk1vcU91eXhUMlpnUjlkTnBMNVBfVG9rZW46Ym94Y242QmRva2lnZ3lya2Rud0t2N3puMHBoXzE2Nzc0MDAxNjE6MTY3NzQwMzc2MV9WNA)

将上述状态定义为代码

```JavaScript
01 const TextModes = {
02   DATA: 'DATA',
03   RCDATA: 'RCDATA',
04   RAWTEXT: 'RAWTEXT',
05   CDATA: 'CDATA'
06 }
```

### 状态机的开启与停止

```JavaScript
01 function isEnd(context, ancestors) {
02   // 当模板内容解析完毕后，停止
03   if (!context.source) return true
04   // 获取父级标签节点
05   const parent = ancestors[ancestors.length - 1]
06   // 如果遇到结束标签，并且该标签与父级标签节点同名，则停止
07   if (parent && context.source.startsWith(`</${parent.tag}`)) {
08     return true
09   }
10 }
```

-   第一个停止时机是当模板内容被解析完毕时；
    
-   第二个停止时机则是在遇到结束标签时，这时解析器会取得父级节点栈栈顶的节点作为父节点，检查该结束标签是否与父节点的标签同名，如果相同，则状态机停止运行。
    

```JavaScript
01 function isEnd(context, ancestors) {
02   if (!context.source) return true
03
04   // 与父级节点栈内所有节点做比较
05   for (let i = ancestors.length - 1; i >= 0; --i) {
06     // 只要栈中存在与当前结束标签同名的节点，就停止状态机
07     if (context.source.startsWith(`</${ancestors[i].tag}`)) {
08       return true
09     }
10   }
11 }
```

### 解析标签节点

```JavaScript
01 function parseElement(context, ancestors) {
02   const element = parseTag(context)
03   if (element.isSelfClosing) return element
04
05   // 切换到正确的文本模式
06   if (element.tag === 'textarea' || element.tag === 'title') {
07     // 如果由 parseTag 解析得到的标签是 <textarea> 或 <title>，则切换到 RCDATA 模式
08     context.mode = TextModes.RCDATA
09   } else if (/style|xmp|iframe|noembed|noframes|noscript/.test(element.tag)) {
10     // 如果由 parseTag 解析得到的标签是：
11     // <style>、<xmp>、<iframe>、<noembed>、<noframes>、<noscript>
12     // 则切换到 RAWTEXT 模式
13     context.mode = TextModes.RAWTEXT
14   } else {
15     // 否则切换到 DATA 模式
16     context.mode = TextModes.DATA
17   }
18
19   ancestors.push(element)
20   element.children = parseChildren(context, ancestors)
21   ancestors.pop()
22
23   if (context.source.startsWith(`</${element.tag}`)) {
24     parseTag(context, 'end')
25   } else {
26     console.error(`${element.tag} 标签缺少闭合标签`)
27   }
28
29   return element
30 }
```

在本章中，我们首先讨论了解析器的文本模式及其对解析器的影响。文本模式指的是解析器在工作时所进入的一些特殊状态，如 RCDATA 模式、CDATA 模式、RAWTEXT 模式，以及初始的 DATA 模式等。在不同模式下，解析器对文本的解析行为会有所不同。

接着，我们讨论了如何使用递归下降算法构造模板 AST。在 parseChildren 函数运行的过程中，为了处理标签节点，会调用 parseElement 解析函数，这会间接地调用 parseChildren 函数，并产生一个新的状态机。随着标签嵌套层次的增加，新的状态机也会随着 parseChildren 函数被递归地调用而不断创建，这就是“递归下降”中“递归”二字的含义。而上级 parseChildren 函数的调用用于构造上级模板AST 节点，被递归调用的下级 parseChildren 函数则用于构造下级模板 AST 节点。最终会构造出一棵树型结构的模板 AST，这就是“递归下降”中“下降”二字的含义。

在解析模板构建 AST 的过程中，parseChildren 函数是核心。每次调用parseChildren 函数，就意味着新状态机的开启。状态机的结束时机有两个。

-   第一个停止时机是当模板内容被解析完毕时。
    
-   第二个停止时机则是遇到结束标签时，这时解析器会取得父级节点栈栈顶的节点作为父节点，检查该结束标签是否与父节点的标签同名，如果相同，则状态机停止运行。我们还讨论了文本节点的解析。
    

解析文本节点本身并不复杂，它的复杂点在于，我们需要对解析后的文本内容进行 HTML 实体的解码工作。WHATWG 规范中也定义了解码 HTML 实体过程中的状态迁移流程。HTML 实体类型有两种，分别是命名字符引用和数字字符引用。命名字符引用的解码方案可以总结为两种。

-   当存在分号时：执行完整匹配。
    
-   当省略分号时：执行最短匹配。对于数字字符引用，则需要按照 WHATWG 规范中定义的规则逐步实现。
    

## 编译优化

编译优化指的是编译器将模板编译为渲染函数的过程中，尽可能多地提取关键信息，并以此指导生成最优代码的过程。

本章中，我们主要讨论了 Vue.js 3 在编译优化方面所做的努力。编译优化指的是通过编译的手段提取关键信息，并以此指导生成最优代码的过程。具体来说，Vue.js 3 的编译器会充分分析模板，提取关键信息并将其附着到对应的虚拟节点上。在运行时阶段，渲染器通过这些关键信息执行“快捷路径”，从而提升性能。

编译优化的核心在于，**区分动态节点与静态节点**。Vue.js 3 会为动态节点打上补丁标志，即 patchFlag。同时，Vue.js 3 还提出了 **Block** 的概念，一个 Block 本质上也是一个虚拟节点，但与普通虚拟节点相比，会多出一个 dynamicChildren 数组。该数组用来收集所有动态子代节点，这利用了 createVNode 函数和createBlock 函数的层层嵌套调用的特点，即以“由内向外”的方式执行。再配合一个用来临时存储动态节点的节点栈，即可完成动态子代节点的收集。

由于 Block 会收集所有动态子代节点，所以对动态节点的比对操作是忽略 DOM 层级结构的。这会带来额外的问题，即 v-if、v-for 等结构化指令会影响 DOM 层级结构，使之不稳定。这会间接导致基基于 Block 树的比对算法失效。而解决方式很简单，只需要让带有 v-if、v-for 等指令的节点也作为 Block 角色即可。

除了 Block 树以及补丁标志之外，Vue.js 3 在编译优化方面还做了其他努力，具体如下。

-   静态提升：能够减少更新时创建虚拟 DOM 带来的性能开销和内存占用。
    
-   预字符串化：在静态提升的基础上，对静态节点进行字符串化。这样做能够减少创建虚拟节点产生的性能开销以及内存占用。
    
-   缓存内联事件处理函数：避免造成不必要的组件更新。
    
-   v-once 指令：缓存全部或部分虚拟节点，能够避免组件更新时重新创建虚拟DOM 带来的性能开销，也可以避免无用的 Diff 操作。