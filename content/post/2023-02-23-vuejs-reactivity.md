---
layout:     post 
title:      "Vue中的响应式系统"
subtitle:   "Vue.js设计与实现读书笔记"
description: "vue响应式系统中的实现和一些方案的总结"
date:       2023-02-23
author:     "kcfuler"
URL: "/2023/02/23/vuejs-reactivity/"
categories: [ tech ]
tags: 
    - vue

image:      "https://dogefs.s3.ladydaily.com/~/source/unsplash/photo-1675407743943-ec967a92558f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHx0b3BpYy1mZWVkfDEyfDZzTVZqVExTa2VRfHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
---

# 响应式系统

## 分支切换

问题： 在副作用函数中执行三元表达式时，会访问到表达式中的两个数据，但是最后访问到的数据只是表达式的结果， 这样就造成了不必要的副作用绑定。

解决方法：在每一个响应式数据进行副作用绑定之前，清空当前存在的副作用，这样就可以避免数据绑定到不必要的副作用函数了

## effect嵌套

问题： 我们用全局变量 activeEffect 来存储通过 effect 函数注册的副作用函数，这意味着同一时刻 activeEffect 所存储的副作用函数只能有一个。当副作用函数发生嵌套时，内层副作用函数的执行会覆盖 activeEffect 的值，并永远不会恢复到原来的值。这时如果再有响应式数据进行依赖收集，即使这个响应式数据是在外层副作用函数中读取的，它们收集到的副作用函数也都会是内层副作用函数，这就是问题所在。

解决：我们需要一个副作用函数栈 effectStack，在副作用函数执行时，将当前副作用函数压入栈中，待副作用函数执行完毕后将其从栈中弹出，并始终让 activeEffect 指向栈顶的副作用函数。这样就能做到一个响应式数据只会收集直接读取其值的副作用函数，而不会出现互相影响的情况

![](https://gb6tpk84yf.feishu.cn/space/api/box/stream/download/asynccode/?code=YTQ0NTJmMzVlNGNkOTg3ZmM1MTY1ZTY5MzgwMjI3OGZfbXRwRjREaWRTR05IbG1jYmRud2hwU09IckExNWVscEVfVG9rZW46Ym94Y25zZnRKU1ROMGtlb0hjNlBMdDRYaE5jXzE2NzcxNDM2Nzc6MTY3NzE0NzI3N19WNA)

  

## 避免无限循环

```JavaScript
const data ={ foo: 1 }
const obj = new Proxy(data, ...)
effect(() => data.foo++)
```

上面展示的这个操作会导致堆栈溢出，原因是我们在这个副作用语句既会访问 obj 的值，又会修改 obj 的值，所以就会导致无限的递归。

解决方案：

-   添加一个守卫条件：如果 trigger 触发执行的副作用函数与当前正在执行的副作用函数相同，则不触发执行
    

![](https://gb6tpk84yf.feishu.cn/space/api/box/stream/download/asynccode/?code=ZDkxNDgxZDFjMjU2MTgyMzlmMzVkYjk3MjFmMzRjNWJfMWI0WWNwQ3hQNWxvN3NRU1p2ZFM5Y0U3QndWakZRYXlfVG9rZW46Ym94Y25vODVuYmRCTlExbWI3N2pGZEZYNnloXzE2NzcxNDM2Nzc6MTY3NzE0NzI3N19WNA)

## 调度系统

> 所谓可调度，指的是当 trigger 动作触发副作用函数重新执行时，有能力决定副作用函数执行的时机、次数以及方式

我们的调度系统要实现的就是： 在不改变代码位置的前提下，调整代码的执行顺序

实现方式：

-   在添加副作用函数的时候，传入 `option`配置对象，option中存在一个调度器属性， 用户根据这个调度器属性来调度副作用函数
    
-   在trigger执行时，如果有 `scheduler` 属性， 就先执行
    

```JavaScript
if( effectFn.option.scheduler ){
}
else{
    effectFn();
} 
```

-   一个执行周期里面， 响应式变量的多次更新只会触发一次副作用函数，提高性能表现。
    

## 计算属性 computed 和 lazy

### lazy

问题： 不希望副作用函数在定义的时候就执行

实现：

-   通过 options 的 scheduler 来指定
    
-   让 effect 不直接执行， 而是返回一个函数
    
-   通过schedule 获取函数，进行执行
    

### computed

实现：

-   通过一个 dirty 变量，标志在一个周期内， 只会触发一次副作用函数
    
-   在读取计算属性的时候，手动调用 track 函数进行追踪； 当计算属性发生变化的时候，手动调用 trigger 函数触发响应
    

![](https://gb6tpk84yf.feishu.cn/space/api/box/stream/download/asynccode/?code=NzM5OTMzZjhmYTA2MmQxNjJhZWYzMTY5ZDRmMTQxNmJfRTVSS2RtWWRlWlJzRHg1clN4YUd3ektqZm1jM3puenNfVG9rZW46Ym94Y24yWG5tdkNRQ0VJdHhpbWtQWUxzcXVoXzE2NzcxNDM2Nzc6MTY3NzE0NzI3N19WNA)

## Watch

假设 obj 是一个响应数据，使用 watch 函数观测它，并传递一个回调函数，当修改响应式数据的值时，会触发该回调函数执行

watch的本质是使用了 effect 中的 scheduler

![](https://gb6tpk84yf.feishu.cn/space/api/box/stream/download/asynccode/?code=ODU4NTM0MTcxZmFmODkxOGVlNmQzM2U4OThjMDgyMGJfbE9xcktqTGhQRWhWckVWbGxWdGozQ2d6UW8zWjdsVFZfVG9rZW46Ym94Y25ZeTVYUTRtbWRBOGY5bkp6NXdwbldkXzE2NzcxNDM2Nzc6MTY3NzE0NzI3N19WNA)

一个最简单的 watch 实现

```JavaScript
function watch(source, cb){
  effect(
    () => source.foo,
    {
      schedule(){
        cb()
      }
    }
  )
}
```

核心功能的实现:

-   对数据的监听： 做判断， 如果是getter函数， 就通过getter函数访问响应式数据， 如果不是，就通过一个travse函数对响应式数据的所有属性进行监听
    
-   (newValue, oldValue), 通过 lazy 来控制执行流程， 获取到 oldValue 和 newValue
    

![](https://gb6tpk84yf.feishu.cn/space/api/box/stream/download/asynccode/?code=MjM2MTgxOTAyNDRhYjUzYWNiNDk3YTdiNzkwYWJjZTNfaU5SUnZUaGc5R3A5UE9uUng3RVQ2OGdFeFVvMXU4ZlJfVG9rZW46Ym94Y24wQjlydGg3YmFoY2NlRzhPdGxlM1B1XzE2NzcxNDM2Nzc6MTY3NzE0NzI3N19WNA)

## 副作用过期

目的： 避免竞态问题

![](https://gb6tpk84yf.feishu.cn/space/api/box/stream/download/asynccode/?code=YzY4MjQyYzZlNDQ0MGY5MTQwYTAxZGU0MTU1M2VjZDlfZnpOdGRtZThTSkZiY2VzdzFxVjVZMG9PZ3J1QWFGYlZfVG9rZW46Ym94Y245c1gzWXB5OFpITlJzeUEzSWhMbDZlXzE2NzcxNDM2Nzc6MTY3NzE0NzI3N19WNA)

实现：

-   在watch执行回调之前先执行用户传入的回调函数， 从而让用户有机会在过期回调中将上一次的副作用标记为过期。
    

# 非原始值的响应式方案

> 如何实现更复杂的数据的响应性，如 Map , Set ， for...in , for...of 循环等等。
> 
> 实现这些功能需要深入理解语言规范，这本书使用的规范是， ECMA-262规范

## 5.1 理解Proxy 和 Reflect

> 使用Proxy不能解决响应式数据代理的所有问题，所以需要Reflect

### 使用Reflect的原因

使用Proxy只能代理对象和对象的基本操作。而不属于对象的基本属性、一些更复杂的操作，如`for...in`这一类的操作就代理不到了。

这里代理不到的原因主要有几点：

1.  Proxy代理对象中， 涉及访问器函数的 this 的指向问题
    
2.  对 for...in 等操作没有可以直接拦截的api
    

### 对象和Proxy的工作原理

在JS中， 有两种对象：

-   常规对象
    
-   异质对象
    

它们之间通过对象的内部方法来区分，其中，常规对象的定义为

-   对于表 5-1 列出的内部方法，必须使用 ECMA 规范 10.1.x 节给出的定义实现；
    
-   对于内部方法 [[Call]]，必须使用 ECMA 规范 10.2.1 节给出的定义实现；
    
-   对于内部方法 [[Construct]]，必须使用 ECMA 规范 10.2.2 节给出的定义实现。
    

  

5.1

![](https://gb6tpk84yf.feishu.cn/space/api/box/stream/download/asynccode/?code=YTU2NmZkNmU1MmNhNWZmN2U2NTAyODI2NjM5ZWEyYjRfcG1obVp5NGNJQWdkRlZnUzNIN0JsdTVhTUV1STZXbEhfVG9rZW46Ym94Y25DVDVMSEFFeTNFYXhpNkZjVG1OM1VmXzE2NzcxNDM2Nzc6MTY3NzE0NzI3N19WNA)

5.2

![](https://gb6tpk84yf.feishu.cn/space/api/box/stream/download/asynccode/?code=ZjVlZDA3OWVhN2Q4YTFjMWY0MGZmYjE1NzIyNmMxZTdfbHB1MWQ1RG9ES015SVZvVFFJVERYS1ViajBIMlczOVBfVG9rZW46Ym94Y25HMjl0TEtDSENFdUxpSk5jaEF6NzNjXzE2NzcxNDM2Nzc6MTY3NzE0NzI3N19WNA)

### 对for...in的代理

关键点：

-   In 操作符的运算结果是通过`hasProperty`方法得到的
    
-   使用 Reflect.ownKeys(obj) 来获取只属于对象自身拥有的键
    

```JavaScript
01 const obj = { foo: 1 }
02 const ITERATE_KEY = Symbol()
03
04 const p = new Proxy(obj, {
05   ownKeys(target) {
06     // 将副作用函数与 ITERATE_KEY 关联
07     track(target, ITERATE_KEY)
08     return Reflect.ownKeys(target)
09   }
10 })
```

-   在响应数据变化时，`ITERATE_KEY`相关的副作用函数与其它副作用函数分开，单独触发。
    
-   通过定义一个 `TriggerType`来实现修改、删除数据时， `for...in`相关逻辑的响应
    

## 5.4 合理的触发响应

### 需要解决的问题

1.  重设的值相等时不执行副作用函数 --- 对NaN的处理
    
2.  继承原型的对象的响应
    
3.  深浅响应 -- 添加标志符
    
4.  只读响应 -- 添加标志符
    

### 解决方案

#### 对重设的值

-   在set函数内， 对新值和旧值进行对比，如果相同，就不触发响应
    
-   在比较的时候，需要对NaN进行特判， 因为 `NaN === NaN`得到`false` ， 而 `NaN == NaN`得到 `true`
    

#### 对继承原型时对象的响应

```JavaScript
01 const obj = {}
02 const proto = { bar: 1 }
03 const child = reactive(obj)
04 const parent = reactive(proto)
05 // 使用 parent 作为 child 的原型
06 Object.setPrototypeOf(child, parent)
07
08 effect(() => {
09   console.log(child.bar) // 1
10 })
11 // 修改 child.bar 的值
12 child.bar = 2 // 会导致副作用函数重新执行两次
```

由于响应式对象访问原型（原型是响应式数据）上的属性时， 会让原型也与副作用函数建立联系，而我们想要的只是对响应式对象的响应，而不是它的原型的响应，这样会带来不必要的性能开销。

解决：

1.  给响应式数据设置一个 `raw`属性，也就是可以通过这个属性得到响应式数据对应的原始值
    
2.  如果原始值和 `reveiver`相同，则说明访问到的是需要响应的数据，反之则不响应，这样就可以区分是否是原型上的数据了。
    

```JavaScript
01 function reactive(obj) {
02   return new Proxy(obj {
03     set(target, key, newVal, receiver) {
04       const oldVal = target[key]
05       const type = Object.prototype.hasOwnProperty.call(target, key) ? 'SET' : 'ADD'
06       const res = Reflect.set(target, key, newVal, receiver)
07
08       // target === receiver.raw 说明 receiver 就是 target 的代理对象
09       if (target === receiver.raw) {
10         if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal)) {
11           trigger(target, key, type)
12         }
13       }
14
15       return res
16     }
17     // 省略其他拦截函数
18   })
19 }
```

  

## 代理数组

数组相对于普通对象来说有很多不相同的方法，但这并不意味着代理数组的难度就很大。这是因为数组本身也是对象，只不过它是异质对象罢了，它与常规对象的差异并不大。因此，大部分用来代理常规对象的代码对于数组也是生效的。

  

需要解决的问题：

1.  对修改的响应
    
2.  对内部方法的处理
    

如 `includes | find` 等数组方法。通过代理对象来访问元素属性值时，如果元素仍然是可代理的，那么得到的值就是新的代理对象，而不是原来的代理对象。

```JavaScript
obj = {foo: 1};
arr = [obj];
arr.includes(arr[0]);
// arr[0] 得到的是一个响应对象， 而 includes 也会通过 arr 去访问数组元素， 从而也得到了一个代理对象
// 问题在于这两个代理对象是不同的   
```

3.  不同副作用函数之间的影响
    

当两个副作用函数都调用了 `push`方法时，由于它们都会修改代理对象，且不能并行执行，在第二个还没执行完的时候就会触发第一个函数，第一个函数又触发第二个函数，循环往复，就会造成栈溢出。

  

### 解决方案

1.  对修改的响应
    
    1.  对 length 响应
        
    2.  只需要在副作用函数与数组的长度和索引之间建立响应联系
        
    3.  不在副作用函数和 `Symbol` 类数据之间建立联系
        
2.  对内部方法的处理
    
    1.  存储原始数据到代理对象之间的映射，如果存在了，就不需要再创建
        
3.  不同副作用函数之间的影响
    
    1.  定义一个 shouldTrack 方法， 在上一个方法执行完毕之前，不对数据进行追踪
        

  

## 对Set | Map的代理

> Set 和 Map 的处理和对数组的处理类似，但有一些需要特别考虑的地方

总结的点：

1.  Set的 size 属性和内部方法的区别， 集合类型的 size 属性是一个访问器属性，当通过代理对象访问 size 属性时，由于代理对象本身并没有部署 `[[SetData]]`这样的内部槽，所以会发生错误。通过代理对象执行集合类型的操作方法时，要注意这些方法执行时的 this 指向，我们需要在 get 拦截函数内通过 `.bind` 函数为这些方法绑定正确的 this 值
2.  Map所代理的数据的 for...of 循环和前面实现的区别，集合的 forEach 方法与对象的 for...in 遍历类似，最大的不同体现在，当使用 for...in 遍历对象时，我们只关心对象的键是否变化，而不关心值；但使用 forEach 遍历集合时，我们既关心键的变化，也关心值的变化。
3.  数据污染问题：在原数据中添加了响应式数据，我们通过响应式数据对象的 raw 属性来访问对应的原始数据对象，后续操作使用原始数据对象

  

# 原始值的响应式方案

## 小总结

1.  解决对原始值的代理

通过引入ref， 一个“包裹对象”， 来对原始值进行代理，间接实现原始值的响应式 ， 为了区分 ref 和普通响应式对象，给包裹对象定义了一个值为 true 的属性，也就是 `_v_isRef`，用它作为ref的标识。

2.  解决响应对象解构等操作时，响应式丢失的问题

通过实现 toRef 和 toRefs 两个函数，对响应式数据添加一层包装，也就保证了在解构等场景中维持响应式

3.  自动脱ref

自动对暴露到模板中的响应式数据进行脱 ref 处理，使用的时候不用加上 `.value`