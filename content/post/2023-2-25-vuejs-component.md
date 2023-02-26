---
layout:     post 
title:      "Vue的组件化"
subtitle:   "Vue.js设计与实现读书笔记"
description: "vue组件化实现方案"
date:       2023-02-25
author:     "kcfuler"
URL: "/2023/02/25/vuejs-component/"
categories: [ tech ]
tags: 
    - vue

image:      "https://dogefs.s3.ladydaily.com/~/source/unsplash/photo-1677247191292-4e1791c4ebef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1331&q=80"
---

## 组件的实现原理

### 组件渲染

-   定义组件
    

```JavaScript
01 // MyComponent 是一个组件，它的值是一个选项对象
02 const MyComponent = {
03   name: 'MyComponent',
04   data() {
05     return { foo: 1 }
06   }
07 }
```

-   渲染组件
    

```JavaScript
01 function patch(n1, n2, container, anchor) {
02   if (n1 && n1.type !== n2.type) {
03     unmount(n1)
04     n1 = null
05   }
06
07   const { type } = n2
08
09   if (typeof type === 'string') {
10     // 作为普通元素处理
11   } else if (type === Text) {
12     // 作为文本节点处理
13   } else if (type === Fragment) {
14     // 作为片段处理
15   } else if (typeof type === 'object') {
16     // vnode.type 的值是选项对象，作为组件来处理
17     if (!n1) {
18       // 挂载组件
19       mountComponent(n2, container, anchor)
20     } else {
21       // 更新组件
22       patchComponent(n1, n2, anchor)
23     }
24   }
25 }
```

### 组件状态与自我更新

-   状态
    

```JavaScript
01 function mountComponent(vnode, container, anchor) {
02   const componentOptions = vnode.type
03   const { render, data } = componentOptions
04
05   // 调用 data 函数得到原始数据，并调用 reactive 函数将其包装为响应式数据
06   const state = reactive(data())
07   // 调用 render 函数时，将其 this 设置为 state，
08   // 从而 render 函数内部可以通过 this 访问组件自身状态数据
09   const subTree = render.call(state, state)
10   patch(null, subTree, container, anchor)
11 }
```

-   绑定副作用函数
    

```JavaScript
01 function mountComponent(vnode, container, anchor) {
02   const componentOptions = vnode.type
03   const { render, data } = componentOptions
04
05   const state = reactive(data())
06
07   // 将组件的 render 函数调用包装到 effect 内
08   effect(() => {
09     const subTree = render.call(state, state)
10     patch(null, subTree, container, anchor)
11   })
12 }
```

-   给副作用函数添加缓存，让多次修改响应式数据带来的副作用只执行一次，性能更优。
    

```JavaScript
01 // 任务缓存队列，用一个 Set 数据结构来表示，这样就可以自动对任务进行去重
02 const queue = new Set()
03 // 一个标志，代表是否正在刷新任务队列
04 let isFlushing = false
05 // 创建一个立即 resolve 的 Promise 实例
06 const p = Promise.resolve()
07
08 // 调度器的主要函数，用来将一个任务添加到缓冲队列中，并开始刷新队列
09 function queueJob(job) {
10   // 将 job 添加到任务队列 queue 中
11   queue.add(job)
12   // 如果还没有开始刷新队列，则刷新之
13   if (!isFlushing) {
14     // 将该标志设置为 true 以避免重复刷新
15     isFlushing = true
16     // 在微任务中刷新缓冲队列
17     p.then(() => {
18       try {
19         // 执行任务队列中的任务
20         queue.forEach(job => job())
21       } finally {
22         // 重置状态
23         isFlushing = false
24         queue.clear = 0
25       }
26     })
27   }
28 }
```

-   组件实例的实现与生命周期钩子的封装
    

```JavaScript
01 function mountComponent(vnode, container, anchor) {
02   const componentOptions = vnode.type
03   // 从组件选项对象中取得组件的生命周期函数
04   const { render, data, beforeCreate, created, beforeMount, mounted, beforeUpdate, updated } = componentOptions
05
06   // 在这里调用 beforeCreate 钩子
07   beforeCreate && beforeCreate()
08
09   const state = reactive(data())
10
11   const instance = {
12     state,
13     isMounted: false,
14     subTree: null
15   }
16   vnode.component = instance
17
18   // 在这里调用 created 钩子
19   created && created.call(state)
20
21   effect(() => {
22     const subTree = render.call(state, state)
23     if (!instance.isMounted) {
24       // 在这里调用 beforeMount 钩子
25       beforeMount && beforeMount.call(state)
26       patch(null, subTree, container, anchor)
27       instance.isMounted = true
28       // 在这里调用 mounted 钩子
29       mounted && mounted.call(state)
30     } else {
31       // 在这里调用 beforeUpdate 钩子
32       beforeUpdate && beforeUpdate.call(state)
33       patch(instance.subTree, subTree, container, anchor)
34       // 在这里调用 updated 钩子
35       updated && updated.call(state)
36     }
37     instance.subTree = subTree
38   }, { scheduler: queueJob })
39 }
```

-   父组件引起的子组件的更新
    

```JavaScript
01 function patchComponent(n1, n2, anchor) {
02   // 获取组件实例，即 n1.component，同时让新的组件虚拟节点 n2.component 也指向组件实例
03   const instance = (n2.component = n1.component)
04   // 获取当前的 props 数据
05   const { props } = instance
06   // 调用 hasPropsChanged 检测为子组件传递的 props 是否发生变化，如果没有变化，则不需要更新
07   if (hasPropsChanged(n1.props, n2.props)) {
08     // 调用 resolveProps 函数重新获取 props 数据
09     const [ nextProps ] = resolveProps(n2.type.props, n2.props)
10     // 更新 props
11     for (const k in nextProps) {
12       props[k] = nextProps[k]
13     }
14     // 删除不存在的 props
15     for (const k in props) {
16       if (!(k in nextProps)) delete props[k]
17     }
18   }
19 }
20
21 function hasPropsChanged(
22   prevProps,
23   nextProps
24 ) {
25   const nextKeys = Object.keys(nextProps)
26   // 如果新旧 props 的数量变了，则说明有变化
27   if (nextKeys.length !== Object.keys(prevProps).length) {
28     return true
29   }
30     // 只有
31   for (let i = 0; i < nextKeys.length; i++) {
32     const key = nextKeys[i]
33     // 有不相等的 props，则说明有变化
34     if (nextProps[key] !== prevProps[key]) return true
35   }
36   return false
37 }
```

注意：

-   需要将组件实例添加到新的组件 vnode 对象上，即 n2.component =n1.component，否则下次更新时将无法取得组件实例；
    
-   instance.props 对象本身是浅响应的（即 shallowReactive）。因此，在更新组件的 props 时，只需要设置 instance.props 对象下的属性值即可触发组件重新渲染。
    
-   绑定上下文对象，组件渲染所需的数据优先从组件状态中获取，然后才从props中获取
    

```JavaScript
01 function mountComponent(vnode, container, anchor) {
02   // 省略部分代码
03
04   const instance = {
05     state,
06     props: shallowReactive(props),
07     isMounted: false,
08     subTree: null
09   }
10
11   vnode.component = instance
12
13   // 创建渲染上下文对象，本质上是组件实例的代理
14   const renderContext = new Proxy(instance, {
15     get(t, k, r) {
16       // 取得组件自身状态与 props 数据
17       const { state, props } = t
18       // 先尝试读取自身状态数据
19       if (state && k in state) {
20         return state[k]
21       } else if (k in props) { // 如果组件自身没有该数据，则尝试从 props 中读取
22         return props[k]
23       } else {
24         console.error('不存在')
25       }
26     },
27     set (t, k, v, r) {
28       const { state, props } = t
29       if (state && k in state) {
30         state[k] = v
31       } else if (k in props) {
32         console.warn(`Attempting to mutate prop "${k}". Props are readonly.`)
33       } else {
34         console.error('不存在')
35       }
36     }
37   })
38
39   // 生命周期函数调用时要绑定渲染上下文对象
40   created && created.call(renderContext)
41
42   // 省略部分代码
43 }
```

-   setup函数的最小实现
    

```JavaScript
01 function mountComponent(vnode, container, anchor) {
02   const componentOptions = vnode.type
03   // 从组件选项中取出 setup 函数
04   let { render, data, setup, /* 省略其他选项 */ } = componentOptions
05
06   beforeCreate && beforeCreate()
07
08   const state = data ? reactive(data()) : null
09   const [props, attrs] = resolveProps(propsOption, vnode.props)
10
11   const instance = {
12     state,
13     props: shallowReactive(props),
14     isMounted: false,
15     subTree: null
16   }
17
18   // setupContext，由于我们还没有讲解 emit 和 slots，所以暂时只需要 attrs
19   const setupContext = { attrs }
20   // 调用 setup 函数，将只读版本的 props 作为第一个参数传递，避免用户意外地修改 props 的值，
21   // 将 setupContext 作为第二个参数传递
22   const setupResult = setup(shallowReadonly(instance.props), setupContext)
23   // setupState 用来存储由 setup 返回的数据
24   let setupState = null
25   // 如果 setup 函数的返回值是函数，则将其作为渲染函数
26   if (typeof setupResult === 'function') {
27     // 报告冲突
28     if (render) console.error('setup 函数返回渲染函数，render 选项将被忽略')
29     // 将 setupResult 作为渲染函数
30     render = setupResult
31   } else {
32     // 如果 setup 的返回值不是函数，则作为数据状态赋值给 setupState
33     setupState = setupResult
34   }
35
36   vnode.component = instance
37
38   const renderContext = new Proxy(instance, {
39     get(t, k, r) {
40       const { state, props } = t
41       if (state && k in state) {
42         return state[k]
43       } else if (k in props) {
44         return props[k]
45       } else if (setupState && k in setupState) {
46         // 渲染上下文需要增加对 setupState 的支持
47         return setupState[k]
48       } else {
49         console.error('不存在')
50       }
51     },
52     set (t, k, v, r) {
53       const { state, props } = t
54       if (state && k in state) {
55         state[k] = v
56       } else if (k in props) {
57         console.warn(`Attempting to mutate prop "${k}". Props are readonly.`)
58       } else if (setupState && k in setupState) {
59         // 渲染上下文需要增加对 setupState 的支持
60         setupState[k] = v
61       } else {
62         console.error('不存在')
63       }
64     }
65   })
66
67   // 省略部分代码
68 }
```

  

-   emit实现
    

```JavaScript
01 function mountComponent(vnode, container, anchor) {
02   // 省略部分代码
03
04   const instance = {
05     state,
06     props: shallowReactive(props),
07     isMounted: false,
08     subTree: null
09   }
10
11   // 定义 emit 函数，它接收两个参数
12   // event: 事件名称
13   // payload: 传递给事件处理函数的参数
14   function emit(event, ...payload) {
15     // 根据约定对事件名称进行处理，例如 change --> onChange
16     const eventName = `on${event[0].toUpperCase() + event.slice(1)}`
17     // 根据处理后的事件名称去 props 中寻找对应的事件处理函数
18     const handler = instance.props[eventName]
19     if (handler) {
20       // 调用事件处理函数并传递参数
21       handler(...payload)
22     } else {
23       console.error('事件不存在')
24     }
25   }
26
27   // 将 emit 函数添加到 setupContext 中，用户可以通过 setupContext 取得 emit 函数
28   const setupContext = { attrs, emit }
29
30   // 省略部分代码
31 }
```

-   Slot
    

```JavaScript
01 // 父组件的渲染函数
02 function render() {
03   return {
04     type: MyComponent,
05     // 组件的 children 会被编译成一个对象
06     children: {
07       header() {
08         return { type: 'h1', children: '我是标题' }
09       },
10       body() {
11         return { type: 'section', children: '我是内容' }
12       },
13       footer() {
14         return { type: 'p', children: '我是注脚' }
15       }
16     }
17   }
18 }
```

  

### 小总结

-   如何使用虚拟节点来描述组件。使用虚拟节点的vnode.type 属性来存储组件对象，渲染器根据虚拟节点的该属性的类型来判断它是否是组件。如果是组件，则渲染器会使用 mountComponent 和patchComponent 来完成组件的挂载和更新。
    
-   组件的自更新。在组件挂载阶段，会为组件创建一个用于渲染其内容的副作用函数。该副作用函数会与组件自身的响应式数据建立响应联系。当组件自身的响应式数据发生变化时，会触发渲染副作用函数重新执行，即重新渲染。但由于默认情况下重新渲染是**同步执行**的，这导致无法对任务去重，因此我们在创建渲染副作用函数时，指定了自定义的调用器。该调度器的作用是，当组件自身的响应式数据发生变化时，将渲染副作用函数缓冲到微任务队列中。有了缓冲队列，我们即可实现对渲染任务的去重，从而避免无用的重新渲染所导致的额外性能开销。
    
-   组件实例。它本质上是一个对象，包含了组件运行过程中的状态，例如组件是否挂载、组件自身的响应式数据，以及组件所渲染的内容（即subtree）等。有了组件实例后，在渲染副作用函数内，我们就可以根据组件实例上的状态标识，来决定应该进行全新的挂载，还是应该打补丁。
    
-   组件的 props 与组件的被动更新。副作用自更新所引起的子组件更新叫作子组件的被动更新。我们还介绍了**渲染上下文（renderContext），它实际上是组件实例的代理对象。在渲染函数内访问组件实例所暴露的数据都是通过该代理对象实现的。**
    
-   setup 函数。该函数是为了组合式 API 而生的，所以我们要避免将其与 Vue.js 2 中的“传统”组件选项混合使用。setup 函数的返回值可以是两种类型，如果返回函数，则将该函数作为组件的渲染函数；如果返回数据对象，则将该对象暴露到渲染上下文中。emit 函数包含在 setupContext 对象中，可以通过 emit 函数发射组件的自定义事件。通过 v-on 指令为组件绑定的事件在经过编译后，会以 onXxx 的形式存储到props 对象中。当 emit 函数执行时，会在 props 对象中寻找对应的事件处理函数并执行它。
    
-   组件的插槽。它借鉴了 Web Component 中 <slot> 标签的概念。插槽内容的返回值就是向槽位填充的内容。<slot> 标签则会被编译为插槽函数的调用，通过执行对应的插槽函数，得到外部向槽位填充的内容（即虚拟 DOM），最后将该内容渲染到槽位中。
    
-   onMounted 等用于注册生命周期钩子函数的方法的实现。通过onMounted 注册的生命周期函数会被注册到当前组件实例的 instance.mounted 数组中。为了维护当前正在初始化的组件实例，我们定义了全局变量**currentInstance**，以及用来设置该变量的 setCurrentInstance 函数。
    

## 异步组件与函数式组件

  

## 异步组件

异步组件的原理比较简单，框架层面的处理主要是为用户提供更简单易用的api

```JavaScript
01 // defineAsyncComponent 函数用于定义一个异步组件，接收一个异步组件加载器作为参数
02 function defineAsyncComponent(loader) {
03   // 一个变量，用来存储异步加载的组件
04   let InnerComp = null
05   // 返回一个包装组件
06   return {
07     name: 'AsyncComponentWrapper',
08     setup() {
09       // 异步组件是否加载成功
10       const loaded = ref(false)
11       // 执行加载器函数，返回一个 Promise 实例
12       // 加载成功后，将加载成功的组件赋值给 InnerComp，并将 loaded 标记为 true，代表加载成功
13       loader().then(c => {
14         InnerComp = c
15         loaded.value = true
16       })
17
18       return () => {
19         // 如果异步组件加载成功，则渲染该组件，否则渲染一个占位内容
20         return loaded.value ? { type: InnerComp } : { type: Text, children: '' }
21       }
22     }
23   }
24 }
```

-   defineAsyncComponent 函数本质上是一个高阶组件，它的返回值是一个包装组件。
    
-   包装组件会根据加载器的状态来决定渲染什么内容。如果加载器成功地加载了组件，则渲染被加载的组件，否则会渲染一个占位内容。
    
-   通常占位内容是一个注释节点。组件没有被加载成功时，页面中会渲染一个注释节点来占位。但这里我们使用了一个空文本节点来占位。
    

#### 增加超时和错误处理接口

```JavaScript
01 function defineAsyncComponent(options) {
02   // options 可以是配置项，也可以是加载器
03   if (typeof options === 'function') {
04     // 如果 options 是加载器，则将其格式化为配置项形式
05     options = {
06       loader: options
07     }
08   }
09
10   const { loader } = options
11
12   let InnerComp = null
13
14   return {
15     name: 'AsyncComponentWrapper',
16     setup() {
17       const loaded = ref(false)
18       // 代表是否超时，默认为 false，即没有超时
19       const timeout = ref(false)
20
21       loader().then(c => {
22         InnerComp = c
23         loaded.value = true
24       })
25
26       let timer = null
27       if (options.timeout) {
28         // 如果指定了超时时长，则开启一个定时器计时
29         timer = setTimeout(() => {
30           // 超时后将 timeout 设置为 true
31           timeout.value = true
32         }, options.timeout)
33       }
34       // 包装组件被卸载时清除定时器
35       onUmounted(() => clearTimeout(timer))
36
37       // 占位内容
38       const placeholder = { type: Text, children: '' }
39
40       return () => {
41         if (loaded.value) {
42           // 如果组件异步加载成功，则渲染被加载的组件
43           return { type: InnerComp }
44         } else if (timeout.value) {
45           // 如果加载超时，并且用户指定了 Error 组件，则渲染该组件
46           return options.errorComponent ? { type: options.errorComponent } : placeholder
47         }
48         return placeholder
49       }
50     }
51   }
52 }
```

### 小总结

在本章中，我们首先讨论了异步组件要解决的问题。异步组件在页面性能、拆包以及服务端下发组件等场景中尤为重要。从根本上来说，异步组件的实现可以完全在用户层面实现，而无须框架支持。但一个完善的异步组件仍需要考虑诸多问题，例如：

-   允许用户指定加载出错时要渲染的组件
    
-   允许用户指定 Loading 组件，以及展示该组件的延迟时间
    
-   允许用户设置加载组件的超时时长
    
-   组件加载失败时，为用户提供重试的能力。因此，框架有必要内建异步组件的实现。
    

Vue.js 3 提供了 defineAsyncComponent 函数，用来定义异步组件。接着，我们讲解了异步组件的加载超时问题，以及当加载错误发生时，如何指定Error 组件。通过为 defineAsyncComponent 函数指定选项参数，允许用户通过timeout 选项设置超时时长。当加载超时后，会触发加载错误，这时会渲染用户通过 errorComponent 选项指定的 Error 组件。

在加载异步组件的过程中，受网络状况的影响较大。当网络状况较差时，加载过程可能很漫长。为了提供更好的用户体验，我们需要在加载时展示 Loading 组件。所以，我们设计了 loadingComponent 选项，以允许用户配置自定义的 Loading 组件。但展示 Loading 组件的时机是一个需要仔细考虑的问题。为了避免Loading 组件导致的闪烁问题，我们还需要设计一个接口，让用户能指定延迟展示Loading 组件的时间，即 delay 选项。

在加载组件的过程中，发生错误的情况非常常见。所以，我们设计了组件加载发生错误后的重试机制。在讲解异步组件的重试加载机制时，我们类比了接口请求发生错误时的重试机制，两者的思路类似。

最后，我们讨论了函数式组件。它本质上是一个函数，其内部实现逻辑可以复用有状态组件的实现逻辑。为了给函数式组件定义 props，我们允许开发者在函数式组件的主函数上添加静态的 props 属性。出于更加严谨的考虑，函数式组件没有自身状态，也没有生命周期的概念。所以，**在初始化函数式组件时，需要选择性地复用有状态组件的初始化逻辑。**

  

## 内建组件和模块

  

### KeepAlive

KeepAlive 组件的作用类似于 HTTP 中的持久链接。它可以避免组件实例不断地被销毁和重建。KeepAlive 的基本实现并不复杂。当被 KeepAlive 的组件“卸载”时，渲染器并不会真的将其卸载掉，而是会将该组件搬运到一个隐藏容器中，从而使得组件可以维持当前状态。当被 KeepAlive 的组件“挂载”时，渲染器也不会真的挂载它，而是将它从隐藏容器搬运到原容器。

### Teleport

Teleport 组件可以跨越 DOM 层级完成渲染，这在很多场景下非常有用。

在实现 Teleport 时，我们将 Teleport 组件的渲染逻辑从渲染器中分离出来，这么做有两点好处：

-   可以避免渲染器逻辑代码“膨胀”
    
-   可以利用 Tree-Shaking 机制在最终的 bundle 中删除 Teleport 相关的代码，使得最终构建包的体积变小。
    

Teleport 组件是一个特殊的组件。与普通组件相比，它的组件选项非常特殊，例如__isTeleport 选型和 process 选项等。这是因为 Teleport 本质上是渲染器逻辑的合理抽象，它完全可以作为渲染器的一部分而存在。

### Transition

核心原理

-   当 DOM 元素被挂载时，将动效附加到该 DOM 元素上
    
-   当 DOM 元素被卸载时，不要立即卸载 DOM 元素，而是等到附加到该 DOM 元素上的动效执行完成后再卸载它。