---
layout:     post 
title:      "Vue的渲染器"
subtitle:   "Vue.js设计与实现读书笔记"
description: "vue渲染器实现方案"
date:       2023-02-24
author:     "kcfuler"
URL: "/2023/02/23/vuejs-renderer/"
categories: [ tech ]
tags: 
    - vue

image:      "https://dogefs.s3.ladydaily.com/~/source/unsplash/photo-1676840642714-2ebccd286ca2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
---



## 渲染器设计

### 渲染器与响应式系统

-   响应式系统为渲染器提供数据， 也就是当数据发生变化时，为渲染器提供新的数据供其渲染。
    
-   渲染器将响应式系统的数据渲染到页面上。
    

### 相关名词

1.  renderer
    

渲染器，这里的渲染器概念是比较大的，不仅包含渲染的内容，在SSR的场景中可能还包含着水合等功能

2.  render
    

渲染函数，将数据渲染为特定平台的页面内容。

3.  Virtual DOM || vdom
    

也就是虚拟DOM，在vue中用于处理节点的更新

4.  patch
    

页面更新操作，对比新旧DOM，只更新需要更新的内容

### 自定义渲染器的实现

实现重点：平台无关

通过传入配置项的方式来传入和平台相关的配置项内容，实现平台相关的渲染api和渲染器解耦，也就实现了平台无关的渲染能力。

## 挂载与更新

### HTML Attributes 和 DOM Properties

Html Attributes 就是指直接挂载在HTML标签上的内容

```HTML
<a attributes='something'> this is content</a>
```

DOM Properties则是指挂载到dom上之后，元素上拥有的各种属性。

![](https://gb6tpk84yf.feishu.cn/space/api/box/stream/download/asynccode/?code=NTc0M2NmNTRiNmQ1YWEwODhmOTFlYTQ0MTA5Zjk2NGFfYXZOTDR0TWZEdXBocHZQZlFsdTdOZTZVQno4alR0NE1fVG9rZW46Ym94Y252VUVKWTNWVlpaeDRtU3RzcXJJMkloXzE2NzcyNDU0MDA6MTY3NzI0OTAwMF9WNA)

**HTML Attributes 的作用是设置与之对应的 DOM Properties 的初始值。**一旦值改变，那么 DOM Properties 始终存储着当前值，而通过 getAttribute 函数得到的仍然是初始值。

一个 HTML Attributes 可能对应着多个 DOM Property。`value="foo" 与 el.value 和 el.defaultValue` 都有关联

  

### 组件的卸载

不能直接使用 `innerHTML = ""` 的方式来卸载组件

-   容器的内容可能是由某个或多个组件渲染的，当卸载操作发生时，应该正确地调用这些组件的 beforeUnmount、unmounted 等生命周期函数。
    
-   即使内容不是由组件渲染的，有的元素存在自定义指令，我们应该在卸载操作发生时正确执行对应的指令钩子函数。
    
-   使用 innerHTML 清空容器元素内容的另一个缺陷是，它不会移除绑定在 DOM 元素上的事件处理函数。
    

正确的处理方法是使用原生的DOM方法来执行卸载操作

```JavaScript
01 function mountElement(vnode, container) {
02   // 让 vnode.el 引用真实 DOM 元素
03   const el = vnode.el = createElement(vnode.type)
04   if (typeof vnode.children === 'string') {
05     setElementText(el, vnode.children)
06   } else if (Array.isArray(vnode.children)) {
07     vnode.children.forEach(child => {
08       patch(null, child, el)
09     })
10   }
11
12   if (vnode.props) {
13     for (const key in vnode.props) {
14       patchProps(el, key, null, vnode.props[key])
15     }
16   }
17
18   insert(el, container)
19 }
```

当我们调用 createElement 函数创建真实 DOM 元素时，会把真实DOM 元素赋值给 vnode.el 属性。这样，在vnode 与真实 DOM 元素之间就建立了联系，我们可以通过 vnode.el 来获取该虚拟节点对应的真实 DOM 元素。有了这些，当卸载操作发生的时候，只需要根据虚拟节点对象 vnode.el 取得真实DOM 元素，再将其从父元素中移除即可

```JavaScript
// 封装 unmounted函数，可以在这里面调用 onUnmounted 钩子对应的逻辑
01 function unmount(vnode) {
02   const parent = vnode.el.parentNode
03   if (parent) {
04     parent.removeChild(vnode.el)
05   }
06 }
```

  

当 unmount 函数执行时，我们有机会检测虚拟节点 vnode 的类型。如果该虚拟节点描述的是组件，则我们有机会调用组件相关的生命周期函数。

  

### 区分vnode的类型

```JavaScript
01 function patch(n1, n2, container) {
02   if (n1 && n1.type !== n2.type) {
03     unmount(n1)
04     n1 = null
05   }
06   // 代码运行到这里，证明 n1 和 n2 所描述的内容相同
07   const { type } = n2
08   // 如果 n2.type 的值是字符串类型，则它描述的是普通标签元素
09   if (typeof type === 'string') {
10     if (!n1) {
11       mountElement(n2, container)
12     } else {
13       patchElement(n1, n2)
14     }
15   } else if (typeof type === 'object') {
16     // 如果 n2.type 的值的类型是对象，则它描述的是组件
17   } else if (type === 'xxx') {
18     // 处理其他类型的 vnode
19   }
20 }
```

### 事件的处理

我们可以绑定一个伪造的事件处理函数 invoker，然后把真正的事件处理函数设置为 invoker.value 属性的值。这样当更新事件的时候，我们将不再需要调用 removeEventListener 函数来移除上一次绑定的事件，只需要更新invoker.value 的值即可

```JavaScript
01 patchProps(el, key, prevValue, nextValue) {
02   if (/^on/.test(key)) {
03     // 获取为该元素伪造的事件处理函数 invoker
04     let invoker = el._vei
05     const name = key.slice(2).toLowerCase()
06     if (nextValue) {
07       if (!invoker) {
08         // 如果没有 invoker，则将一个伪造的 invoker 缓存到 el._vei 中
09         // vei 是 vue event invoker 的首字母缩写
10         invoker = el._vei = (e) => {
11           // 当伪造的事件处理函数执行时，会执行真正的事件处理函数
12           invoker.value(e)
13         }
14         // 将真正的事件处理函数赋值给 invoker.value
15         invoker.value = nextValue
16         // 绑定 invoker 作为事件处理函数
17         el.addEventListener(name, invoker)
18       } else {
19         // 如果 invoker 存在，意味着更新，并且只需要更新 invoker.value 的值即可
20         invoker.value = nextValue
21       }
22     } else if (invoker) {
23       // 新的事件绑定函数不存在，且之前绑定的 invoker 存在，则移除绑定
24       el.removeEventListener(name, invoker)
25     }
26   } else if (key === 'class') {
27     // 省略部分代码
28   } else if (shouldSetAsProps(el, key, nextValue)) {
29     // 省略部分代码
30   } else {
31     // 省略部分代码
32   }
33 }
```

-   先从 el._vei 中读取对应的 invoker，如果 invoker 不存在，则将伪造的 invoker 作为事件处理函数，并将它缓存到 el._vei 属性中。
    
-   把真正的事件处理函数赋值给 invoker.value 属性，然后把伪造的 invoker 函数作为事件处理函数绑定到元素上。可以看到，当事件触发时，实际上执行的是伪造的事件处理函数，在其内部间接执行了真正的事件处理函数 invoker.value(e)。
    

  

#### 处理多个事件、同一事件对应多个响应

vnode.props

```JavaScript
01 const vnode = {
02   type: 'p',
03   props: {
04     onClick: [
05       // 第一个事件处理函数
06       () => {
07         alert('clicked 1')
08       },
09       // 第二个事件处理函数
10       () => {
11         alert('clicked 2')
12       }
13     ]
14   },
15   children: 'text'
16 }
17 renderer.render(vnode, document.querySelector('#app'))
```

patchProps

```JavaScript
01 patchProps(el, key, prevValue, nextValue) {
02   if (/^on/.test(key)) {
03     const invokers = el._vei || (el._vei = {})
04     let invoker = invokers[key]
05     const name = key.slice(2).toLowerCase()
06     if (nextValue) {
07       if (!invoker) {
08         invoker = el._vei[key] = (e) => {
09           // 如果 invoker.value 是数组，则遍历它并逐个调用事件处理函数
10           if (Array.isArray(invoker.value)) {
11             invoker.value.forEach(fn => fn(e))
12           } else {
13             // 否则直接作为函数调用
14             invoker.value(e)
15           }
16         }
17         invoker.value = nextValue
18         el.addEventListener(name, invoker)
19       } else {
20         invoker.value = nextValue
21       }
22     } else if (invoker) {
23       el.removeEventListener(name, invoker)
24     }
25   } else if (key === 'class') {
26     // 省略部分代码
27   } else if (shouldSetAsProps(el, key, nextValue)) {
28     // 省略部分代码
29   } else {
30     // 省略部分代码
31   }
32 }
```

### 处理冒泡

一个例子

```JavaScript
01 const { effect, ref } = VueReactivity
02
03 const bol = ref(false)
04
05 effect(() => {
06   // 创建 vnode
07   const vnode = {
08     type: 'div',
09     props: bol.value ? {
10       onClick: () => {
11         alert('父元素 clicked')
12       }
13     } : {},
14     children: [
15       {
16         type: 'p',
17         props: {
18           onClick: () => {
19             bol.value = true
20           }
21         },
22         children: 'text'
23       }
24     ]
25   }
26   // 渲染 vnode
27   renderer.render(vnode, document.querySelector('#app'))
28 })
```

![](https://gb6tpk84yf.feishu.cn/space/api/box/stream/download/asynccode/?code=MzM3OTNhMjliNzU5MDgzMWYxOWY2NTIxMGYyYzdlNTlfWnFRalZPazFNeWNFa0FlMnJDRzczdnJ1MVdjY1lEQkJfVG9rZW46Ym94Y25tdnNGTzBTdXlSY0VheTRHYnMyV1ljXzE2NzcyNDU0MDA6MTY3NzI0OTAwMF9WNA)

当点击 p 元素时，绑定到它身上的 click 事件处理函数会执行，于是 bol.value 的值被改为 true。接下来的一步非常关键，由于 bol 是一个响应式数据，所以当它的值发生变化时，会触发副作用函数重新执行。由于此时的 bol.value 已经变成了true，所以在更新阶段，渲染器会为父级 div 元素绑定 click 事件处理函数。当更新完成之后，点击事件才从 p 元素冒泡到父级 div 元素。

解决方法：屏蔽所有绑定时间晚于事件触发时间的事件处理函数的执行

```JavaScript
01 patchProps(el, key, prevValue, nextValue) {
02   if (/^on/.test(key)) {
03     const invokers = el._vei || (el._vei = {})
04     let invoker = invokers[key]
05     const name = key.slice(2).toLowerCase()
06     if (nextValue) {
07       if (!invoker) {
08         invoker = el._vei[key] = (e) => {
09           // e.timeStamp 是事件发生的时间
10           // 如果事件发生的时间早于事件处理函数绑定的时间，则不执行事件处理函数
11           if (e.timeStamp < invoker.attached) return
12           if (Array.isArray(invoker.value)) {
13             invoker.value.forEach(fn => fn(e))
14           } else {
15             invoker.value(e)
16           }
17         }
18         invoker.value = nextValue
19         // 添加 invoker.attached 属性，存储事件处理函数被绑定的时间
20         invoker.attached = performance.now()
21         el.addEventListener(name, invoker)
22       } else {
23         invoker.value = nextValue
24       }
25     } else if (invoker) {
26       el.removeEventListener(name, invoker)
27     }
28   } else if (key === 'class') {
29     // 省略部分代码
30   } else if (shouldSetAsProps(el, key, nextValue)) {
31     // 省略部分代码
32   } else {
33     // 省略部分代码
34   }
35 }
```

新旧节点的更新

```JavaScript
01 function patchChildren(n1, n2, container) {
02   if (typeof n2.children === 'string') {
03     if (Array.isArray(n1.children)) {
04       n1.children.forEach((c) => unmount(c))
05     }
06     setElementText(container, n2.children)
07   } else if (Array.isArray(n2.children)) {
08     if (Array.isArray(n1.children)) {
09       //
10     } else {
11       setElementText(container, '')
12       n2.children.forEach(c => patch(null, c, container))
13     }
14   } else {
15     // 代码运行到这里，说明新子节点不存在
16     // 旧子节点是一组子节点，只需逐个卸载即可
17     if (Array.isArray(n1.children)) {
18       n1.children.forEach(c => unmount(c))
19     } else if (typeof n1.children === 'string') {
20       // 旧子节点是文本子节点，清空内容即可
21       setElementText(container, '')
22     }
23     // 如果也没有旧子节点，那么什么都不需要做
24   }
25 }
```

### vnode.children属性的三种类型

-   字符串类型：代表元素具有文本子节点。
    
-   数组类型：代表元素具有一组子节点。
    
-   null：代表元素没有子节点。
    

### Fragment 及其用途

渲染器渲染 Fragment 的方式类似于渲染普通标签，不同的是，Fragment 本身并不会渲染任何 DOM 元素。所以，只需要渲染一个 Fragment 的所有子节点即可

## 简单diff算法

### 节点复用

#### 更新

-   通过key 来确定是否是同一个节点，才能在`vnode.type`相同时实现节点的排序 -- **减少DOM的挂载和卸载操作**
    
-   即使节点的key相同，我们也需要对同一个节点的内容进行patch操作
    

```JavaScript
01 function patchChildren(n1, n2, container) {
02   if (typeof n2.children === 'string') {
03     // 省略部分代码
04   } else if (Array.isArray(n2.children)) {
05     const oldChildren = n1.children
06     const newChildren = n2.children
07
08     // 遍历新的 children
09     for (let i = 0; i < newChildren.length; i++) {
10       const newVNode = newChildren[i]
11       // 遍历旧的 children
12       for (let j = 0; j < oldChildren.length; j++) {
13         const oldVNode = oldChildren[j]
14         // 如果找到了具有相同 key 值的两个节点，说明可以复用，但仍然需要调用 patch 函数更新
15         if (newVNode.key === oldVNode.key) {
16           patch(oldVNode, newVNode, container)
17           break // 这里需要 break
18         }
19       }
20     }
21
22   } else {
23     // 省略部分代码
24   }
25 }
```

#### 排序

我们将新旧节点中的可以复用的节点内容都更新了， 但是现在还是保持着原来旧节点的顺序，接下来就需要让旧节点的顺序和新节点一致。

前置条件：

-   新旧节点都存在对真实DOM节点的引用
    

```JavaScript
01 function patchChildren(n1, n2, container) {
02   if (typeof n2.children === 'string') {
03     // 省略部分代码
04   } else if (Array.isArray(n2.children)) {
05     const oldChildren = n1.children
06     const newChildren = n2.children
07
08     let lastIndex = 0
09     for (let i = 0; i < newChildren.length; i++) {
10       const newVNode = newChildren[i]
11       let j = 0
12       for (j; j < oldChildren.length; j++) {
13         const oldVNode = oldChildren[j]
14         if (newVNode.key === oldVNode.key) {
15           patch(oldVNode, newVNode, container)
16           if (j < lastIndex) {
17             // 代码运行到这里，说明 newVNode 对应的真实 DOM 需要移动
18             // 先获取 newVNode 的前一个 vnode，即 prevVNode
19             const prevVNode = newChildren[i - 1]
20             // 如果 prevVNode 不存在，则说明当前 newVNode 是第一个节点，它不需要移动
21             if (prevVNode) {
22               // 由于我们要将 newVNode 对应的真实 DOM 移动到 prevVNode 所对应真实 DOM 后面，
23               // 所以我们需要获取 prevVNode 所对应真实 DOM 的下一个兄弟节点，并将其作为锚点
24               const anchor = prevVNode.el.nextSibling
25               // 调用 insert 方法将 newVNode 对应的真实 DOM 插入到锚点元素前面，
26               // 也就是 prevVNode 对应真实 DOM 的后面
27               insert(newVNode.el, container, anchor)
28             }
29           } else {
30             lastIndex = j
31           }
32           break
33         }
34       }
35     }
36
37   } else {
38     // 省略部分代码
39   }
40 }
```

##### 处理新节点

循环的时候可以通过循环的下标得到**新的一组节点的位置信息**，可以通过它来确定**新增节点**的插入位置。

```JavaScript
01 function patchChildren(n1, n2, container) {
02   if (typeof n2.children === 'string') {
03     // 省略部分代码
04   } else if (Array.isArray(n2.children)) {
05     const oldChildren = n1.children
06     const newChildren = n2.children
07
08     let lastIndex = 0
09     for (let i = 0; i < newChildren.length; i++) {
10       const newVNode = newChildren[i]
11       let j = 0
12       // 在第一层循环中定义变量 find，代表是否在旧的一组子节点中找到可复用的节点，
13       // 初始值为 false，代表没找到
14       let find = false
15       for (j; j < oldChildren.length; j++) {
16         const oldVNode = oldChildren[j]
17         if (newVNode.key === oldVNode.key) {
18           // 一旦找到可复用的节点，则将变量 find 的值设为 true
19           find = true
20           patch(oldVNode, newVNode, container)
21           if (j < lastIndex) {
22             const prevVNode = newChildren[i - 1]
23             if (prevVNode) {
24               const anchor = prevVNode.el.nextSibling
25               insert(newVNode.el, container, anchor)
26             }
27           } else {
28             lastIndex = j
29           }
30           break
31         }
32       }
33       // 如果代码运行到这里，find 仍然为 false，
34       // 说明当前 newVNode 没有在旧的一组子节点中找到可复用的节点
35       // 也就是说，当前 newVNode 是新增节点，需要挂载
36       if (!find) {
37         // 为了将节点挂载到正确位置，我们需要先获取锚点元素
38         // 首先获取当前 newVNode 的前一个 vnode 节点
39         const prevVNode = newChildren[i - 1]
40         let anchor = null
41         if (prevVNode) {
42           // 如果有前一个 vnode 节点，则使用它的下一个兄弟节点作为锚点元素
43           anchor = prevVNode.el.nextSibling
44         } else {
45           // 如果没有前一个 vnode 节点，说明即将挂载的新节点是第一个子节点
46           // 这时我们使用容器元素的 firstChild 作为锚点
47           anchor = container.firstChild
48         }
49         // 挂载 newVNode
50         patch(null, newVNode, container, anchor)
51       }
52     }
53
54   } else {
55     // 省略部分代码
56   }
57 }
```

简单 Diff 算法的核心逻辑是，拿新的一组子节点中的节点去旧的一组子节点中寻找可复用的节点。如果找到了，则记录该节点的位置索引。我们把这个位置索引称为**最大索引**。在整个更新过程中，如果一个节点的索引值小于最大索引，则说明该节点对应的真实DOM 元素需要移动。

## 双端diff算法

出现的原因：简单diff算法的结果并不是最优的。

### 所需信息

```JavaScript
01 function patchKeyedChildren(n1, n2, container) {
02   const oldChildren = n1.children
03   const newChildren = n2.children
04   // 四个索引值
05   let oldStartIdx = 0
06   let oldEndIdx = oldChildren.length - 1
07   let newStartIdx = 0
08   let newEndIdx = newChildren.length - 1
09   // 四个索引指向的 vnode 节点
10   let oldStartVNode = oldChildren[oldStartIdx]
11   let oldEndVNode = oldChildren[oldEndIdx]
12   let newStartVNode = newChildren[newStartIdx]
13   let newEndVNode = newChildren[newEndIdx]
14 }
```

处理遗漏和删除的情况

```JavaScript
01 while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
02   // 省略部分代码
03 }
04
05 if (oldEndIdx < oldStartIdx && newStartIdx <= newEndIdx) {
06   // 添加新节点
07   // 省略部分代码
08 } else if (newEndIdx < newStartIdx && oldStartIdx <= oldEndIdx) {
09   // 移除操作
10   for (let i = oldStartIdx; i <= oldEndIdx; i++) {
11     unmount(oldChildren[i])
12   }
13 } 
```

双端 Diff 算法指的是，在新旧两组子节点的四个端点之间分别进行比较，并试图找到可复用的节点。相比简单 Diff 算法，双端 Diff 算法的优势在于，对于同样的更新场景，执行的DOM 移动操作次数更少。

## 快速diff算法

> 具体的讲解见书第11章，有大量例子辅助说明

快速 Diff 算法在实测中性能最优。它借鉴了文本 Diff 中的预处理思路，先处理新旧两组子节点中相同的前置节点和相同的后置节点。当前置节点和后置节点全部处理完毕后，如果无法简单地通过挂载新节点或者卸载已经不存在的节点来完成更新，**则需要根据节点的索引关系，构造出一个最长递增子序列。最长递增子序列所指向的节点即为不需要移动的节点。**