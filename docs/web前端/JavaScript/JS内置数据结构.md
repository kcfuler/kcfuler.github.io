---
sidebar_position: 1
---

​	总结JS中内置的数据结构，作为阶段性复习吧

# 原始类型的方法

​	JavaScript允许我们像使用对象一样使用原始类型，这里需要明确原始类型和对象之间的区别。

1. 原始类型

   - 原始值：一种原始类型的值

   - 原始类型：在JS中主要是`number | string | boolean | bigint | undefined | null | symbol ` 这几种

2. 对象
   - 能够存储多个值
   - 能够使用`{}`的方式创建，除`null | undefined`外的原始类型都有对应的包装类型

## 设计上的取舍

​	语言的设计者在设计原始类型时往往会遇到下面的悖论：

- 人们想对原始类型执行很多操作，而这些操作最好使用方法
- 原始类型需要尽量保持简洁

​	JavaScript最终给出的解决方案是这样的：

- 原始类型依然是原始的，与预期相同，提供单个值
- JS允许访问字符串、数字、symbol等类型的方法和属性
- 实现上创建了提供特殊功能的“**对象包装器**”，使用后就被销毁

> 像rust是通过特征的方式来为数据类型实现对应的方法，相对于JS的实现来说，更像**组合**的方式来解决问题。go的实现也是类似的

**构造器`String/Number/Boolean`仅限内部使用**

​	由于历史原因，虽然我们可以使用`new String()`这样的方式来创建一个包装对象，但实际上很不推荐这样做。因为这种方式创建的包装对象不会自动销毁，如果把它们当做原始类型使用，会出现很多预期外的问题
```typescript
let a = new Boolean(false);
typeof a // "object"
// 判断结果为true，因为 a 是一个对象
if (a) {
    
}
```

# 常用数据结构

## array

### 声明 & 使用

```typescript
// 两种创建方法
let a = new Array()
let b = []

// 基础方法
a.push()
a.pop()
a.shift()
a.unshift()
a.at(index)

// 进阶方法
let deletedItem = a.splice(startIndex, deleteCount, ...replaceItem);
// 可以通过 deleteCount = 0来实现元素的插入
slice()
concat()

// 遍历
forEach

// 搜索
indexOf(item, from) // return index/-1    | 不能正确处理NaN
lastIndexOf()
includes(item, from) // return true/false | 它可以正确的处理 NaN

// 支持通过传入 fn 自定义寻找逻辑 
find(fn) // fn = (item, index, array) => {} 
findIndex() 
findLastIndex()

// 转换数组
map(fn) // fn = (item, index, array) => {}
filter(fn)
reduce(fn1) // fn1 = (accmulator, item, index, array) => {}

sort(fn) // (a, b) => a > b ? 1 : -1, 根据比较结果返回一个正数或者负数即可
reverse()
split() 
join()

// 判断方法
isArray()
```

### 性能

![image-20231004154737257](https://s2.loli.net/2023/10/04/MwhRDIQUB6ZgcOP.png)

​	因为`shift/unshift`方法需要在移除元素后调整数组中的元素的索引

### 循环

```typescript
// 最古老的方法
for (let ...)

// 常用方法
for (const val of arr) {
    
}
// 因为 in 会遍历对象的所有属性，类数组也能参与遍历，所以一般不推荐使用
for (const key in arr) {
    
}
```

## Iterable object（可迭代对象）

​	在JS中，可以使用`for...of` 遍历的对象都是可迭代对象。在实现上来说，可迭代对象也就是实现了迭代器方法的对象，`for...of`就是通过调用它来实现遍历

``` typescript
let range = {
    from: 1,
    to: 2
}
// 定义迭代器方法，返回迭代器对象
obj[Symbol.iterator] = function() {
	return {
        current: this.from,
        last: this.to
        
        next() {
            if (this.current <= this.last) {
                // 迭代器的返回值
                return {done: false, value: this.current++};
            } else {
                // 结束时，done = true
                return {done: true};
            }
        }
    }
}	
```

## map & set

```typescript
// map，与对象的区别在于可以使用对象作为键
// map 使用 SameValueZero 算法来比较键是否相等，与 === 的区别是 NaN === NaN。所以NaN也可以用作键 
let m = new Map();
m.set(key, value)
m.get(key)
m.has(key)
m.delete(key)
m.clear()
m.size
m.set().set().set() // map每一次调用都会返回自身，支持链式调用

// map 迭代
m.keys()
m.values()
m.entries() // 返回所有实体[key, value]的可迭代对象，for...of 在默认情况下使用的就是这个

// map 和 object 的相互转换
let m1 = new Map(Object.entries(obj)) // obj => map
let m2 = Object.fromEntries(map.entries())


// set
let s = new Set(iterable)
set.add()
set.delete()
set.has()
set.clear()
set.size
```

## WeakMap & WeakSet

​	WeakMap和WeakSet与普通的map和set最大的区别：不会阻碍垃圾回收。它们持有的键会被GC忽略，只要作为键的对象没有除它们外的引用，就会被直接清除

### WeakMap

```typescript
// WeakMap只能使用对象作为键
// WeakMap没有size方法，这个和JS引擎的实现有关
let wm = new WeakMap()
wm.set('111', '222') // Error，因为"test"不是一个对象
wm.get()
wm.has()
wm.delete()
```

#### 使用场景

主要的作用就是避免了手动维护清理的操作

1. 额外数据的存储
2. 缓存

### WeakSet

​	和WeakMap表现类似：

- `WeakSet`中只能存储对象
- 对象只有在某个（些）地方能被访问的时候，才能留在`WeakSet`中
- 不支持`size` 和`keys()`，且不能被迭代

```typescript
let visitedSet = new WeakSet();

let john = { name: "John" };
let pete = { name: "Pete" };
let mary = { name: "Mary" };

visitedSet.add(john); // John 访问了我们
visitedSet.add(pete); // 然后是 Pete
visitedSet.add(john); // John 再次访问

// visitedSet 现在有两个用户了

// 检查 John 是否来访过？
alert(visitedSet.has(john)); // true

// 检查 Mary 是否来访过？
alert(visitedSet.has(mary)); // false

john = null;

// visitedSet 将被自动清理(即自动清除其中已失效的值 john)
```

