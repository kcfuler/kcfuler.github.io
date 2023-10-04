> [掘金小册](https://juejin.cn/book/7086408430491172901/section)

# 基础部分
### Function & Class
#### SOLID原则
> 面向对象设计的基本原则

- **S，单一功能原则， 一个类应该只有一种职责**。这也意味着只存在一种原因使得需要修改类的代码。如对于一个数据实体的操作，其读操作和写操作也应当被视为两种不同的职责，并被分配到两个类中。更进一步，对实体的业务逻辑和对实体的入库逻辑也都应该被拆分开来。
- **O，开放封闭原则，一个类应该是可拓展但不可修改的**。即假设我们的业务中支持通过微信、支付宝登录，原本在一个 login 方法中进行 if else 判断，假设后面又新增了抖音登录、美团登录，难道要再加 else if 分支（或 switch case）吗？当然不，基于开放封闭原则，我们应当将登录的**基础逻辑抽离**出来，不同的登录方式通过扩展这个基础类来实现自己的特殊逻辑。
- **L，里氏替换原则，一个派生类可以在程序的任何一个地方对基类进行替换**。这也就意味着，子类完全继承了父类的一切，对父类的功能进行扩充（而非收窄）
- **I，接口分离原则，类的实现方应当只实现自己需要的那部分接口**。比如微信登录支持指纹识别，支付宝支持指纹识别和人脸识别，这个时候微信登录的实现类应该不需要实现人脸识别方法才对。这也就意味着我们提供的抽象类应当按照功能维度拆分成粒度更小的组成才对。
- D，**依赖倒置原则**，这是实现开闭原则的基础，它的核心思想即是**对功能的实现应该依赖于抽象层**，即不同的逻辑通过实现不同的抽象类。还是登录的例子，我们的登录提供方法应该基于共同的登录抽象类实现（LoginHandler），最终调用方法也基于这个抽象类，而不是在一个高阶登录方法中去依赖多个低阶登录提供方。
### TS内置类型(any never unknow 类型断言)

- any包含所有类型，可以给赋值为任何类型，也可以给任何类型赋值，**双向**都成立
- unknow同样包含所有类型，但它只能被赋值，而不能赋值给其它类型，只是**单向**成立
- never代表永远不会出现的情况，表示为逻辑上的“不可能”，一般用在一些逻辑兜底、检查的代码中
- 类型断言，as | ！| ？，用在一些类型推导效果不理想的代码中。
### TS类型工具

1. type（类型别名）
2. 联合类型 | 交叉类型
3. 索引类型
- 索引签名类型，`[key: string]`
- 索引类型查询，`keyof`
- 索引类型访问，`type[key]`
4. 映射类型，基于键名映射到**每一个**键值类型
5. 泛型（类型编程的基础）
6. 类型守卫( `is` `instanceof` )
```typescript
export type Falsy = false | "" | 0 | null | undefined;

// 通过类型守卫来告知TS编译器，传入的值是哪一个类型
export const isFalsy = (val: unknown): val is Falsy => !val;

// 不包括不常用的 symbol 和 bigint
export type Primitive = string | number | boolean | undefined;

export const isPrimitive = (val: unknown): val is Primitive => ['string', 'number', 'boolean' , 'undefined'].includes(typeof val);

```

- 可辨识联合类型
```typescript
interface Foo {
  foo: string;
  fooOnly: boolean;
  shared: number;
}

interface Bar {
  bar: string;
  barOnly: boolean;
  shared: number;
}

function handle(input: Foo | Bar) {
  // 通过不同类型中独有的类型来推导对应的类型
  if ('foo' in input) {
    input.fooOnly;
  } else {
    input.barOnly;
  }
}

```
```typescript
class FooBase {}

class BarBase {}

class Foo extends FooBase {
  fooOnly() {}
}
class Bar extends BarBase {
  barOnly() {}
}

function handle(input: Foo | Bar) {
  if (input instanceof FooBase) {
    input.fooOnly();
  } else {
    input.barOnly();
  }
}
```

7. 类型断言 （`assert`）

在node和一些测试模块中也有类似的概念，node模块中的assert表示的是执行一个判断语句：

- 如果条件成立，那么就继续执行后面的代码
- 如果条件不成立，就不执行后面的代码，后面的代码就是`dead code`
```typescript
import assert from 'assert';

let name: any = 'linbudu';

assert(typeof name === 'number');

// number 类型
name.toFixed();
```
类型守卫和类型断言最大的不同点在于，类型断言在判断不通过的时候会抛出一个**错误**，而类型守卫只会**剔除**对应的不符合条件的类型
TS中的assert关键字
```typescript
/*
	当condition成立时，返回值，也就是condition对应的类型也是成立的
  这样，在后面类型推导过程中需要到condition这个条件时，就会以condition成立为前提来进行推导了
*/
function assert(condition: any, msg?: string): asserts condition {
  if (!condition) {
    throw new Error(msg);
  }
}
```
### 泛型
如果把类型编程比作函数，那么泛型就是传入的参数，我们可以根据传入的参数来进行编程
需要用到的一些类型工具：

- 条件类型
- 映射类型
- 索引类型
#### 泛型约束与默认值
```typescript
type Factory<T = boolean> = T | number | string;
```
```typescript
type ResStatus<ResCode extends number> = ResCode extends 10000 | 10001 | 10002
  ? 'success'
  : 'failure';


type Res1 = ResStatus<10000>; // "success"
type Res2 = ResStatus<20000>; // "failure"

type Res3 = ResStatus<'10000'>; // 类型“string”不满足约束“number”。
```
### 结构化类型系统

- 鸭子类型，检测类型的值相等
- 标称类型，检测类型的键值都要相等
```typescript
export declare class TagProtector<T extends string> {
  protected __tag__: T;
}
// 通过提供额外信息的方式来实现标称类型
export type Nominal<T, U extends string> = T & TagProtector<U>;
```
### 类型系统层级
#### 字面量类型的比较关系
`字面量类型 < 包含字面量的联合类型（都是同一类型）< 字面量类型对应的类型`
如`'hello' extends 'hello' | 'hi' extends string`
#### 类型信息层面
`原始类型 < 原始类型对应的装箱类型 < Object类型`
其中有一个比较特殊的存在，也就是`{}`
#### 顶级类型：any unknow
any代表任何类型，既代表成立的一部分，也代表不成立的一部分，所以使用`any extends`判断任何类型时，都会返回两个分支的联合类型
```typescript
type Result24 = any extends Object ? 1 : 2; // 1 | 2
type Result25 = unknown extends Object ? 1 : 2; // 2
```
any和unknow的互比较也是成立的
```typescript
type Result31 = any extends unknown ? 1 : 2;  // 1
type Result32 = unknown extends any ? 1 : 2;  // 1
```
#### 底层类型
never代表永远不存在的类型，对于这样一个类型，它会是所有类型的子类型，也包括字面量类型
```typescript
type Result33 = never extends 'linbudu' ? 1 : 2; // 1
```

但null、undefined、void这三个类型并没有never的特性，它们都是切实有值的类型
```typescript
type Result34 = undefined extends 'linbudu' ? 1 : 2; // 2
type Result35 = null extends 'linbudu' ? 1 : 2; // 2
type Result36 = void extends 'linbudu' ? 1 : 2; // 2
```

一条类型层级链
```typescript
type TypeChain = never extends 'linbudu'
  ? 'linbudu' extends 'linbudu' | '599'
  ? 'linbudu' | '599' extends string
  ? string extends String
  ? String extends Object
  ? Object extends any
  ? any extends unknown
  ? unknown extends any
  ? 8
  : 7
  : 6
  : 5
  : 4
  : 3
  : 2
  : 1
  : 0

```

结合了结构化类型的层级链
```typescript
type VerboseTypeChain = never extends 'linbudu'
  ? 'linbudu' extends 'linbudu' | 'budulin'
  ? 'linbudu' | 'budulin' extends string
  ? string extends {}
  ? string extends String
  ? String extends {}
  ? {} extends object
  ? object extends {}
  ? {} extends Object
  ? Object extends {}
  ? object extends Object
  ? Object extends object
  ? Object extends any
  ? Object extends unknown
  ? any extends unknown
  ? unknown extends any
  ? 8
  : 7
  : 6
  : 5
  : 4
  : 3
  : 2
  : 1
  : 0
  : -1
  : -2
  : -3
  : -4
  : -5
  : -6
  : -7
  : -8
```
#### 其它比较

1. 基类和派生类

派生类一般都是在基类的基础上派生，所以派生类肯定是基类的子类型

2. 联合类型的判断

会逐个检查联合类型中的类型是否在另一个联合类型中

3. 元组和数组

需要同时考虑类型和长度
![](https://cdn.nlark.com/yuque/0/2023/webp/22577092/1686144196807-9308c739-25b0-4bdd-a3e2-7c4e4e336643.webp#averageHue=%231e384a&clientId=u18c78a98-e0c7-4&from=paste&id=u4c36fe26&originHeight=774&originWidth=1270&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u68f03ff4-deba-45dd-819e-391e34cabb4&title=)

### 条件类型与infer

```typescript
type FunctionReturnType<T extends Func> = T extends (
  ...args: any[]
) => infer R
  ? R
  : never;
```
infer是 inference 的缩写，意为推断，如 infer R 中 R 就表示 **待推断的类型**。 infer 只能在条件类型中使用，因为我们实际上仍然需要**类型结构是一致的**，比如上例中类型信息需要是一个函数类型结构，我们才能提取出它的返回值类型。如果连函数类型都不是，那我只会给你一个 never 。

这里的类型并不局限于函数类型结构，也可以是其它类型，比如数组
```typescript
type Swap<T extends any[]> = T extends [infer A, infer B] ? [B, A] : T;

type SwapResult1 = Swap<[1, 2]>; // 符合元组结构，首尾元素替换[2, 1]
type SwapResult2 = Swap<[1, 2, 3]>; // 不符合结构，没有发生替换，仍是 [1, 2, 3]
```

可以使用`...rest`rest操作符来处理更复杂的数组情况
```typescript
// 提取首尾两个
type ExtractStartAndEnd<T extends any[]> = T extends [
  infer Start,
  ...any[],
  infer End
]
  ? [Start, End]
  : T;

// 调换首尾两个
type SwapStartAndEnd<T extends any[]> = T extends [
  infer Start,
  ...infer Left,
  infer End
]
  ? [End, ...Left, Start]
  : T;

// 调换开头两个
type SwapFirstTwo<T extends any[]> = T extends [
  infer Start1,
  infer Start2,
  ...infer Left
]
  ? [Start2, Start1, ...Left]
  : T;
```

也可以通过推导进行类型的转换
```typescript
type ArrayItemType<T> = T extends Array<infer ElementType> ? ElementType : never;

type ArrayItemTypeResult1 = ArrayItemType<[]>; // never
type ArrayItemTypeResult2 = ArrayItemType<string[]>; // string
type ArrayItemTypeResult3 = ArrayItemType<[string, number]>; // string | number
```

infer也可以是接口
```typescript
// 提取对象的属性类型
type PropType<T, K extends keyof T> = T extends { [Key in K]: infer R }
  ? R
  : never;

type PropTypeResult1 = PropType<{ name: string }, 'name'>; // string
type PropTypeResult2 = PropType<{ name: string; age: number }, 'name' | 'age'>; // string | number

// 反转键名与键值，这里
type ReverseKeyValue<T extends Record<string, unknown>> = T extends Record<infer K, infer V> ? Record<V & string, K> : never

type ReverseKeyValueResult1 = ReverseKeyValue<{ "key": "value" }>; // { "value": "key" }
```
在这里，为了体现 infer 作为类型工具的属性，我们结合了索引类型与映射类型，以及使用 & string 来确保属性名为 string 类型的小技巧。
如果不使用的话会有一些小问题
```typescript
// 类型“V”不满足约束“string | number | symbol”。
type ReverseKeyValue<T extends Record<string, string>> = T extends Record<
  infer K,
  infer V
>
  ? Record<V, K>
  : never;
```
这是因为，泛型参数 V 的来源是从键值类型推导出来的，TypeScript 中这样对键值类型进行 infer 推导，将导致类型信息丢失，而不满足索引签名类型只允许 string | number | symbol 的要求。
还记得映射类型的判断条件吗？需要同时满足其**两端的类型**，我们使用 V & string 这一形式，就确保了最终符合条件的类型参数 V 一定会满足 string | never 这个类型，因此可以被视为合法的索引签名类型。

infer也可以是promise结构
```typescript
type PromiseValue<T> = T extends Promise<infer V> ? V : T;

type PromiseValueResult1 = PromiseValue<Promise<number>>; // number
type PromiseValueResult2 = PromiseValue<number>; // number，但并没有发生提取
```
就像条件类型可以嵌套一样，infer 关键字也经常被使用在嵌套的场景中，包括对类型结构深层信息地提取，以及对提取到类型信息的筛选等。比如上面的 PromiseValue，如果传入了一个嵌套的 Promise 类型就失效了：
```typescript
type PromiseValueResult3 = PromiseValue<Promise<Promise<boolean>>>; // Promise<boolean>，只提取了一层
```
这种时候我们就需要进行嵌套地提取了：
```typescript
type PromiseValue<T> = T extends Promise<infer V> ? PromiseValue<V> : T;
```
这样就可以通过递归的方式来提取深层嵌套的类型

条件类型在泛型的基础上支持了基于类型信息的动态条件判断，但无法直接**消费**填充类型信息，而 infer 关键字则为它补上了这一部分的能力，让我们可以进行更多奇妙的类型操作。
#### 分布式条件类型
也称条件类型的分布式特性，是条件类型在满足一定条件之后会执行的逻辑。
```typescript
type Condition<T> = T extends 1 | 2 | 3 ? T : never;

// 1 | 2 | 3
type Res1 = Condition<1 | 2 | 3 | 4 | 5>;

// never
type Res2 = 1 | 2 | 3 | 4 | 5 extends 1 | 2 | 3 ? 1 | 2 | 3 | 4 | 5 : never;
```
第一个差异：**是否通过泛型参数传入**

```typescript
type Naked<T> = T extends boolean ? "Y" : "N";
type Wrapped<T> = [T] extends [boolean] ? "Y" : "N";

// "N" | "Y"
type Res3 = Naked<number | boolean>;

// "N"
type Res4 = Wrapped<number | boolean>;
```
第二个差异：**是否被数组包裹**

官方的解释：**对于属于裸类型参数的检查类型，条件类型会在实例化时期自动分发到联合类型上。**（_**Conditional types in which the checked type is a naked type parameter are called distributive conditional types. Distributive conditional types are automatically distributed over union types during instantiation.**_）

```typescript
export type NoDistribute<T> = T & {};

type Wrapped<T> = NoDistribute<T> extends boolean ? "Y" : "N";

type Res1 = Wrapped<number | boolean>; // "N"
type Res2 = Wrapped<true | false>; // "Y"
type Res3 = Wrapped<true | false | 599>; // "N"
```
我们可以通过 `&{}`来对类型进行包裹，这样可以避免联合类型的自动分发。

需要注意的是，我们并不是只会通过裸露泛型参数，来确保分布式特性能够发生。在某些情况下，我们也会需要包裹泛型参数来禁用掉分布式特性。最常见的场景也许还是联合类型的判断，即我们不希望进行联合类型成员的分布判断，而是希望直接判断这两个联合类型的兼容性判断，就像在最初的 Res2 中那样：
```typescript
type CompareUnion<T, U> = [T] extends [U] ? true : false;

type CompareRes1 = CompareUnion<1 | 2, 1 | 2 | 3>; // true
type CompareRes2 = CompareUnion<1 | 2, 1>; // false
```

当我们想要判断一个类型是否是never时，也可以进行类似的处理
```typescript
type IsNever<T> = [T] extends [never] ? true : false;

type IsNeverRes1 = IsNever<never>; // true
type IsNeverRes2 = IsNever<"linbudu">; // false
```
这里的原因其实并不是因为分布式条件类型。我们此前在类型层级中了解过，当条件类型的判断参数为 any，会直接返回条件类型两个结果的联合类型。而在这里其实类似，当通过泛型传入的参数为 never，则会直接返回 never。
而never和any的执行情况是有所不同的，any在作为泛型参数**和**判断条件是都会生效，而never只会在泛型参数时生效
由于它们都不会正常的执行条件类型，所以我们可以给它们包上一层数组来确保比较的正常进行

#### isAny & isUnknow
```typescript
type IsAny<T> = 0 extends 1 & T ? true : false;
```
交叉类型取**短板**，而在上述类型中 1 就是类型中的短板，只有**any类型能够让上述交叉类型的短板失效**，所以能够判断出来它是any类型

```typescript
type IsUnknown<T> = unknown extends T
  ? IsAny<T> extends true
    ? false
    : true
  : false;
```
### 工具类型基础
#### 工具类型的分类

- 修饰
- 结构
- 集合
- 模式匹配
- 字符模板
#### 修饰工具类型
在ts中工具类型主要有 Partial Required Readonly
```typescript
type Partial<T> = {
    [P in keyof T]?: T[P];
};

// Partial 也可以写作下面的形式
type Partial<T> = {
  	[P in keyof T] + ? : T[P];
}

type Required<T> = {
    [P in keyof T]-?: T[P];
};

type Readonly<T> = {
    readonly [P in keyof T]: T[P];
};
```

#### 结构工具类型
这部分的工具类型主要使用**条件类型、映射类型以及索引类型**
按照作用来说又分为两类：结构声明、结构处理

- 结构声明

比如`Record<K,T>`就可以帮助我们快速声明一个类型
```typescript
type Record<K extends keyof any, T> = {
    [P in K]: T;
};
// 字典类型
type Dictionary<T> = {
  [index: string]: T;
};
// 数字索引的字典
type NumericDictionary<T> = {
  [index: number]: T;
};

```

- 结构处理

Pick和Omit是常用的用于结构处理的类型
```typescript
type Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};

type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
```
关于Pick需要做限制，而Omit不需要的考量
```typescript
type Omit1<T, K> = Pick<T, Exclude<keyof T, K>>;
type Omit2<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// 这里就不能用严格 Omit 了
declare function combineSpread<T1, T2>(obj: T1, otherObj: T2, rest: Omit1<T1, keyof T2>): void;

type Point3d = { x: number, y: number, z: number };

declare const p1: Point3d;

// 能够检测出错误，rest 中缺少了 y
combineSpread(p1, { x: 10 }, { z: 2 });
```
#### 集合工具类型
集合工具类型中主要用到的就是类型运算的**分布式运算**
```typescript
// 交集
type Extract<T, U> = T extends U ? T : never;
// 差集
type Exclude<T, U> = T extends U ? never : T;
```

#### 模式匹配工具类型
这部分的工具类型主要使用到的就是 `**条件类型**` 和 `infer` 关键字
`infer`代表的是**模式匹配**的思想，类似的还有`正则匹配`和`Blob`等。

函数签名的匹配，根据`infer`的位置不同，我们能获取到的参数也不同
```typescript
type FunctionType = (...args: any) => any;

type Parameters<T extends FunctionType> = T extends (...args: infer P) => any ? P : never;

type ReturnType<T extends FunctionType> = T extends (...args: any) => infer R ? R : any;
```
我们也可以单独获取第一个参数的类型
```typescript
type FirstParameter<T extends FunctionType> = T extends (
  arg: infer P,
  ...args: any
) => any
  ? P
  : never;

type FuncFoo = (arg: number) => void;
type FuncBar = (...args: string[]) => void;

type FooFirstParameter = FirstParameter<FuncFoo>; // number

type BarFirstParameter = FirstParameter<FuncBar>; // string
```
也有一些`class`对应的工具类型
```typescript
type ClassType = abstract new (...args: any) => any;

type ConstructorParameters<T extends ClassType> = T extends abstract new (
  ...args: infer P
) => any
  ? P
  : never;

type InstanceType<T extends ClassType> = T extends abstract new (
  ...args: any
) => infer R
  ? R
  : any;
```
### 上下文推导类型

- 上下文推导类型根据位置决定返回值
- 类型返回值定义为 `void`时，并不会真正强制返回 `void`，返回其它的类型也是可以的，这一点可以体现在下面的一个例子中
```typescript
const arr: number[] = [];
const list: number[] = [1, 2, 3];

list.forEach((item) => arr.push(item));
```
`forEach`的返回值是`void`，而`arr.push()`的返回值则是`number`类型的

也就是说，我们可以将任何一个返回值不为`void`的函数赋给一个返回值为`void`的类型

### 协变 | 逆变
> 函数的类型层级，取自几何学中的概念：如果一个量随着另外一个量变化一致，就称为协变，而反之则为逆变


总的来说就是函数参数定义类型之后，函数能够接受定义类型的**子类型**的参数。
因为根据**里氏替换原则**，所有子类型都应该包含父类型，或者能够覆盖、实现父类型对应的方法

一些替换原则：

- 函数参数类型使用子类型逆变的原则来判断
- 函数返回值的类型使用子类型的协变判断
#### TS中的严格模式
> _When enabled, this flag causes functions parameters to be checked more correctly_



如果开启了严格模式，那么TS在检查的过程中就是**双变**的，也就是说，协变和逆变都是成立的。

# 类型编程与类型体操的意义
> **一门技术，要么应当能够在当下或者可预见的未来给予你帮助，要么能够扩宽你的技术视野和知识边界（类型体操并不完全算）**

# 进阶
### 内置工具类型进阶
#### 修饰类型
对修饰工具类型进阶部分主要是以下两个方面：

1. 操作深层嵌套的类型
2. 对特定的属性进行修饰
##### 深层嵌套的类型
处理深层嵌套的类型主要是通过**递归**来实现
```typescript
export type DeepPartial<T extends object> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export type DeepRequired<T extends object> = {
  [K in keyof T]-?: T[K] extends object ? DeepRequired<T[K]> : T[K];
};

// 也可以记作 DeepImmutable
export type DeepReadonly<T extends object> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

export type DeepMutable<T extends object> = {
  -readonly [K in keyof T]: T[K] extends object ? DeepMutable<T[K]> : T[K];
};
```
##### 基于已知属性进行部分修饰
主体思想：将复杂的工具类型，拆解成基础工具类型、类型工具的组合

- 基于已知类型的修饰
```typescript
export type MarkPropsAsOptional<
  T extends object,
  K extends keyof T = keyof T
> = Partial<Pick<T, K>> & Omit<T, K>;
```
```typescript
export type MarkPropsAsRequired<
  T extends object,
  K extends keyof T = keyof T
> = Flatten<Omit<T, K> & Required<Pick<T, K>>>;

export type MarkPropsAsReadonly<
  T extends object,
  K extends keyof T = keyof T
> = Flatten<Omit<T, K> & Readonly<Pick<T, K>>>;

export type MarkPropsAsMutable<
  T extends object,
  K extends keyof T = keyof T
> = Flatten<Omit<T, K> & Mutable<Pick<T, K>>>;

export type MarkPropsAsNullable<
  T extends object,
  K extends keyof T = keyof T
> = Flatten<Omit<T, K> & Nullable<Pick<T, K>>>;

export type MarkPropsAsNonNullable<
  T extends object,
  K extends keyof T = keyof T
> = Flatten<Omit<T, K> & NonNullable<Pick<T, K>>>;
```
#### 结构工具类型进阶
进阶方向：

- 基于键值类型的Pick、Omit
- 子结构的互斥处理
```typescript
// 拿到符合条件的键值对的键
type ExpectedPropKeys<T extends object, ValueType> = {
  [Key in keyof T]-?: T[Key] extends ValueType ? Key : never;
}[keyof T];// 这里通过索引将键从筛选过的类型中取出

type FunctionKeys<T extends object> = ExpectedPropKeys<T, FuncStruct>;

expectType<
  FunctionKeys<{
    foo: () => void;
    bar: () => number;
    baz: number;
  }>
>('foo');

expectType<
  FunctionKeys<{
    foo: () => void;
    bar: () => number;
    baz: number;
  }>
  // 报错，因为 baz 不是函数类型属性
>('baz');
```

##### 互斥结构类型
```typescript
export type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

export type XOR<T, U> = (Without<T, U> & U) | (Without<U, T> & T);

type XORUser = XOR<VIP, CommonUser>;


expectType<XORUser>({
  vipExpires: 0,
});

expectType<XORUser>({
  promotionUsed: false,
});

// 报错，至少需要一个
// @ts-expect-error
expectType<XORUser>({
});

// 报错，不允许同时拥有
// @ts-expect-error
expectType<XORUser>({
  promotionUsed: false,
  vipExpires: 0,
});

```
#### 集合工具类型
> 主要是用于实现二维或者多为维的复杂情况

```typescript
// 使用更精确的对象类型描述结构
export type PlainObjectType = Record<string, any>;

// 属性名并集
export type ObjectKeysConcurrence<
  T extends PlainObjectType,
  U extends PlainObjectType
> = keyof T | keyof U;

// 属性名交集
export type ObjectKeysIntersection<
  T extends PlainObjectType,
  U extends PlainObjectType
> = Intersection<keyof T, keyof U>;

// 属性名差集
export type ObjectKeysDifference<
  T extends PlainObjectType,
  U extends PlainObjectType
> = Difference<keyof T, keyof U>;

// 属性名补集
export type ObjectKeysComplement<
  T extends U,
  U extends PlainObjectType
> = Complement<keyof T, keyof U>;
```
### 模板字符串类型
> ts的新特性，带来了更高的灵活性

比如这段代码，就可以利用其**自动分发**的特性，帮助我们减少样板代码。
```typescript
type Brand = 'iphone' | 'xiaomi' | 'honor';
type Memory = '16G' | '64G';
type ItemType = 'official' | 'second-hand';

type SKU = `${Brand}-${Memory}-${ItemType}`;
```
> 后面的各种操作太抽象了，等遇到实际使用的时候再记下来

# 实战
## 工程层面的类型能力
### 类型指令

- 在ts文件中常用的类型指令
- 在js文件中也可以生效的类型指令
### 类型声明
类型声明主要通过`declare`来实现
在编译后，一个ts文件会编译成`.js`和`.d.ts`结尾的两个文件。这样，在有ts环境支持时，`.d.ts`文件就可以发挥类型检查的作用；在没有ts环境支持时，`.js`文件也能够正常的执行

### 让类型全面覆盖项目
这里主要是解决一些外部代码带来的**类型缺失**问题
可以使用`declare module`来为一些缺失类型的库补上类型声明，声明的类型会**自动合并**到全局的类型推导的信息中。
```typescript
// index.ts
import raw from './note.md';

const content = raw.replace('NOTE', `NOTE${new Date().getDay()}`);

// declare.d.ts
declare module '*.md' {
  const raw: string;
  export default raw;
}
```
### Definited Type
`@types/`目录下的类型文件，如`@types/react``@types/lodash`等，是Typescript官方为社区中没有使用Typescript或者类型不完备的包提供的**类型补充文件**
### 三斜线指令
作用是复用类型定义文件

- 在文件顶部时才生效
```typescript
/// <reference path="./other.d.ts" /> 相对路径
/// <reference types="node" /> @types/中的一个包名
/// <reference lib="dom" />    导入内部的一个具体类型
```
### 命名空间

- 更好区分类型
- 更方便的批量导出类型
### 导入、导出类型
```typescript
import type from ''
export type xxx
```
## React + TS
常规
## Lint
常规，主要内容：

- eslint
- prettier
- husky
- ts-eslint，以及一些常用的lint规则
## Typescript工具库
...

## TS与ECMAScript
TS引入了很多还在提案中的语法，可以帮助我们提高我们的代码质量，编码更舒心~

- 可选链`?`
- 空值合并`??`
- 逻辑赋值`??= , ||=`，使用的方式和`+=, -=`这些操作符是一样的。
## 装饰器
主要有五种装饰器：**类装饰器**、**方法装饰器**、**参数装饰器**、**访问符装饰器**、**属性装饰器**。
### 类装饰器
```typescript
@AddProperty('linbudu')
@AddMethod()
class Foo {
  a = 1;
}

function AddMethod(): ClassDecorator {
  // 拿到类的实例
  return (target: any) => {
    target.prototype.newInstanceMethod = () => {
      console.log("Let's add a new instance method!");
    };
    target.newStaticMethod = () => {
      console.log("Let's add a new static method!");
    };
  };
}

function AddProperty(value: string): ClassDecorator {
  return (target: any) => {
    target.prototype.newInstanceProperty = value;
    target.newStaticProperty = `static ${value}`;
  };
}
```
### 方法装饰器
```typescript
class Foo {
  @ComputeProfiler()
  async fetch() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve('RES');
      }, 3000);
    });
  }
}

function ComputeProfiler(): MethodDecorator {
  // 可以拿到实例、原型、属性描述符等
  return (
    _target,
    methodIdentifier,
    descriptor: TypedPropertyDescriptor<any>
  ) => {
    const originalMethodImpl = descriptor.value!;
    descriptor.value = async function (...args: unknown[]) {
      const start = new Date();
      const res = await originalMethodImpl.apply(this, args); // 执行原本的逻辑
      const end = new Date();
      console.log(
        `${String(methodIdentifier)} Time: `,
        end.getTime() - start.getTime()
      );
      return res;
    };
  };
}

(async () => {
  console.log(await new Foo().fetch());
})();

```

- 方法装饰器返回的是**类的原型**，而不是**类本身**
### 访问器装饰器
```typescript
class Foo {
  _value!: string;

  get value() {
    return this._value;
  }

  @HijackSetter('LIN_BU_DU')
  set value(input: string) {
    this._value = input;
  }
}

function HijackSetter(val: string): MethodDecorator {
  return (target, methodIdentifier, descriptor: any) => {
    const originalSetter = descriptor.set;
    descriptor.set = function (newValue: string) {
      const composed = `Raw: ${newValue}, Actual: ${val}-${newValue}`
      originalSetter.call(this, composed);
      console.log(`HijackSetter: ${composed}`);
    };
    // 篡改 getter，使得这个值无视 setter 的更新，返回一个固定的值
    // descriptor.get = function () {
    //   return val;
    // };
  };
}

const foo = new Foo();
foo.value = 'LINBUDU'; // HijackSetter: Raw: LINBUDU, Actual: LIN_BU_DU-LINBUDU

```
### 装饰器的执行机制

- 执行时机
- 执行原理
- 执行顺序

官方解释：

1. _参数装饰器_，然后依次是_方法装饰器_，_访问符装饰器_，或_属性装饰器_应用到每个实例成员。
2. _参数装饰器_，然后依次是_方法装饰器_，_访问符装饰器_，或_属性装饰器_应用到每个静态成员。
3. _参数装饰器_应用到构造函数。
4. _类装饰器_应用到类。

一个例子，不同装饰器的执行顺序
```typescript
function Deco(identifier: string): any {
  console.log(`${identifier} 执行`);
  return function () {
    console.log(`${identifier} 应用`);
  };
}

@Deco('类装饰器')
class Foo {
  constructor(@Deco('构造函数参数装饰器') name: string) {}

  @Deco('实例属性装饰器')
  prop?: number;

  @Deco('实例方法装饰器')
  handler(@Deco('实例方法参数装饰器') args: any) {}
}
```
```typescript
实例属性装饰器 执行
实例属性装饰器 应用
实例方法装饰器 执行
实例方法参数装饰器 执行
实例方法参数装饰器 应用
实例方法装饰器 应用
类装饰器 执行
构造函数参数装饰器 执行
构造函数参数装饰器 应用
类装饰器 应用
```
同类装饰器的执行顺序
下面这样的装饰器是从**下往上依次执行**，依次返回执行之后的结果
```typescript
@Deprecated()
@User()
@Internal
@Provide()
class Foo {}
```
### 反射 Reflect
> 在**运行时**去检查及修改程序的行为

> JavaScript之前的反射API散落在各个顶级对象的命名空间下，因此我们需要Reflect来进行一次统一

#### 反射元数据(Reflect Metadata)
> 用于描述数据的数据

元数据的存储：静态成员的元数据存储在构造函数中，而实例的元数据存储在构造函数的原型上
#### 控制反转
也就是将**依赖关系**的控制移交给一个**中心进行管理**。而自己手动进行控制就称为依赖正转。
控制反转主要通过**依赖查询**和**依赖注入**这两种方式来实现
```typescript
class Factory {
  static produce(key: string) {
    // ...
  }
}

class F {
  constructor() {
    this.d = Factory.produce("D");
  }
}
```
```typescript
@Provide()
class F {
  @Inject()
  d: D;
}
```
这里的 Provide 即标明这个**类需要被注册到容器中**，如果别的地方需要这个类 F 时，其内部的 d 属性需要被注入一个 D 的实例，而 D 的实例又需要 A、C 的实例等等。这一系列的过程是完全交给容器的，我们需要做的就只是用装饰器简单标明下依赖关系即可。
而装饰器如何实现依赖注入，我想其实你也能 get 到，不就是我们上面所说的元数据吗？比如在属性中通过 Inject 装饰器注册一份**元数据**，告诉容器这个类的哪些属性需要被注入，然后容器会在内部存储的类里面对应地进行查找。
```typescript
@Controller('/user')
class UserController {
  @Get('/list')
  async userList() {}

  @Post('/add')
  async addUser() {}
}
```
#### 基于依赖注入的路由实现
实现的核心就是将路径和对应的函数绑定起来
```typescript
export enum METADATA_KEY {
  METHOD = 'ioc:method',
  PATH = 'ioc:path',
  MIDDLEWARE = 'ioc:middleware',
}

export enum REQUEST_METHOD {
  GET = 'ioc:get',
  POST = 'ioc:post',
}

export const methodDecoratorFactory = (method: string) => {
  return (path: string): MethodDecorator => {
    return (_target, _key, descriptor) => {
      // 在方法实现上注册 ioc:method - 请求方法 的元数据
      Reflect.defineMetadata(METADATA_KEY.METHOD, method, descriptor.value!);
      // 在方法实现上注册 ioc:path - 请求路径 的元数据
      Reflect.defineMetadata(METADATA_KEY.PATH, path, descriptor.value!);
    };
  };
};

export const Get = methodDecoratorFactory(REQUEST_METHOD.GET);
export const Post = methodDecoratorFactory(REQUEST_METHOD.POST);
```
这样一来，@Get("/list") 其实就是注册了 ioc:method - ioc:get，ioc:path - "list" 这样的两对元数据，分别标识了请求方法与请求路径。需要注意的是，我们是在方法体上去注册的，这样在最终处理时，可以**通过这个类的原型拿到方法体**，继而获得注册的元数据。
Controller 中就简单一些了，我们只需要拿到它的请求路径信息，然后拼接在这个类中所有请求方法的请求路径前即可：
```typescript
export const Controller = (path?: string): ClassDecorator => {
  return (target) => {
    Reflect.defineMetadata(METADATA_KEY.PATH, path ?? '', target);
  };
};

```
最后组装信息
```typescript
type AsyncFunc = (...args: any[]) => Promise<any>;

interface ICollected {
  path: string;
  requestMethod: string;
  requestHandler: AsyncFunc;
}

export const routerFactory = <T extends object>(ins: T): ICollected[] => {
  const prototype = Reflect.getPrototypeOf(ins) as any;

  const rootPath = <string>(
    Reflect.getMetadata(METADATA_KEY.PATH, prototype.constructor)
  );

  const methods = <string[]>(
    Reflect.ownKeys(prototype).filter((item) => item !== 'constructor')
  );

  const collected = methods.map((m) => {
    const requestHandler = prototype[m];
    const path = <string>Reflect.getMetadata(METADATA_KEY.PATH, requestHandler);

    const requestMethod = <string>(
      Reflect.getMetadata(METADATA_KEY.METHOD, requestHandler).replace(
        'ioc:',
        ''
      )
    );

    return {
      path: `${rootPath}${path}`,
      requestMethod,
      requestHandler,
    };
  });
  return collected;
};
```
#### 实现一个简易的IOC控制容器
```typescript
@Provide()
class Driver {
  adapt(consumer: string) {
    console.log(`\n === 驱动已生效于 ${consumer}！===\n`);
  }
}

@Provide()
class Car {
  @Inject()
  driver!: Driver;

  run() {
    this.driver.adapt('Car');
  }
}

const car = Container.get(Car);

car.run(); // 驱动已生效于 Car ！
```
先来梳理一下思路，要实现这么个效果，首先我们需要一个容器，即控制反转中提到的**独立的控制方**，我们的 Car 依赖于驱动 Driver，这个容器会帮我们完成 Driver 注入到 Car 内的操作。那这个容器如何知道有哪些类需要被提前实例化呢？我们使用一个 Provide 装饰器，被其标记的 Class 会自动被容器收集。然后在需要使用这些类实例的地方，使用 Inject 装饰器声明这里需要哪个实例，容器就会自动地将这个属性注入进来。
这里有一个比较复杂的地方，在存储一个类和注入一个类时，我们需要有一个标识符，才能实现一一对应的注入方式。在上面的例子里我们的 Provide 和 Inject 装饰器都是使用无参数调用的，这样的话标识符从何而来？你可能会想到使用内置的元数据信息！的确是这样，但是为了降低学习成本，我们先来了解如何不使用元数据来实现这个 IoC 容器，也就是我们能够这么使用：
```typescript
@Provide('DriverService')
  class Driver {
    adapt(consumer: string) {
      console.log(`\n === 驱动已生效于 ${consumer}！===\n`);
    }
  }

@Provide('Car')
  class Car {
    @Inject('DriverService')
    driver!: Driver;

    run() {
      this.driver.adapt('Car');
    }
  }

const car = Container.get<Car>('Car')!;

car.run();
```
这样的话就就简单多了，我们只需要基于字符串来存储、查找、注入一个类就好了。
首先我们创建一个容器，很明显，它需要一个 Map 来以字符串-类的方式存储这些信息，以及 get 与 set 方法：
```typescript
type ClassStruct<T = any> = new (...args: any[]) => T;

class Container {
  private static services: Map<string, ClassStruct> = new Map();

  public static set(key: string, value: ClassStruct): void {}

  public static get<T = any>(key: string): T | undefined {}

  private constructor() {}
}
```
我们使用私有构造函数来避免这个类被错误地实例化，毕竟它其实只是用来将这些逻辑收拢到一起。
然后就像我们前面说的，Provide 和 Inject 装饰器需要进行存储与注入工作：
```typescript
function Provide(key: string): ClassDecorator {
  return (Target) => {
    Container.set(key, Target as unknown as ClassStruct);
  };
}

function Inject(key: string): PropertyDecorator {
  return (target, propertyKey) => {

  };
}
```
Provide 倒简单，但 Inject 就有些麻烦了，我们在前面提到属性装饰器是无法对类的属性进行操作的，因此我们这里只能使用委托的方式。也就是说，我们先告诉容器有哪些属性需要进行注入，以及需要注入的类的标识符，等我们从容器中去取这个类的时候，容器会帮我们处理这些。
因此容器中需要再增加一个 Map，它的键与键值均为字符串类型：
```typescript
class Container {
  public static propertyRegistry: Map<string, string> = new Map();

}
```
这样在 Inject 中，我们需要做的就是注册信息：
```typescript
function Inject(key: string): PropertyDecorator {
  return (target, propertyKey) => {
    Container.propertyRegistry.set(
      `${target.constructor.name}:${String(propertyKey)}`,
      key
    );
  };
}
```
需要注意的是，这里我们注册的是 Car:driver - DriverService 的形式，以此来同时保存这个属性所在的类名称。
接下来，我们需要做的就是 get 与 set 方法了。set 方法简单，直接注册 services 就好：
```typescript
class Container {
  public static set(key: string, value: ClassStruct): void {
    Container.services.set(key, value);
  }
}
```
get 方法就要复杂一些了，它需要在我们取出一个类（Container.get('Car')）时，帮我们实例化这个类以及注入这个类内部声明的依赖（DriverService）。整理一下具体步骤：

- 使用传入的标识符在容器内查找这个类是否已经注册，如果有则进行下一步，没有就返回 undefined。
- 对于已注册的类，首先将其实例化，然后检查 propertyRegistry ，查看这个类内部是否声明了对外部的依赖？
- 将这些外部依赖的类从容器中取出（同样通过 get 方法），然后实例化。
- 将这些实例传递给对应的属性。

我们的大致实现如下：
```typescript
class Container {
  public static get<T = any>(key: ServiceKey): T | undefined {
    // 检查是否注册
    const Cons = Container.services.get(key);

    if (!Cons) {
      return undefined;
    }

    // 实例化这个类
    const ins = new Cons();

    // 遍历注册信息
    for (const info of Container.propertyRegistry) {
      // 注入标识符与要注入类的标识符
      const [injectKey, serviceKey] = info;
      // 拆分为 Class 名与属性名
      const [classKey, propKey] = injectKey.split(':');

      // 如果不是这个类，就跳过
      if (classKey !== Cons.name) continue;

      // 取出需要注入的类，这里拿到的是已经实例化的
      const target = Container.get(serviceKey);

      if (target) {
        // 赋值给对应的属性
        ins[propKey] = target;
      }
    }

    return ins;
  }
}
```
来试着调用，会发现已经成功了：
![](https://cdn.nlark.com/yuque/0/2023/webp/22577092/1686403329976-d57be59b-8908-458c-b91b-2e59de34b3ca.webp#averageHue=%23292f37&clientId=uc75d5a33-c265-4&from=paste&id=u250004f2&originHeight=278&originWidth=958&originalType=url&ratio=2&rotation=0&showTitle=false&status=done&style=none&taskId=u23f00e3a-7805-4512-9622-f9fb87f711f&title=)
每次传入字符串的实现肯定不够优雅，我们在使用 Nest、Angular 等框架时，也并不会经常使用字符串作为标识符来实现依赖注入。
可是，如果不使用字符串，我们要用什么来作为标识符呢？聪明的你肯定想到了，可以使用内置的元数据来作为标识符，比如在这种情况下：
```typescript
@Provide()
  class Car {
    @Inject()
    driver!: Driver;

    run() {
      this.driver.adapt('Car');
    }
  }
```
对于 driver 属性，我们就可以使用它的类型标注 Driver 来作为标识符。那接下来我们来改写上面的容器实现。
### 基于内置元数据实现
其实最难的一部分我们已经解决了，即如何存储并对应地进行注入，现在要做的不过是升级优化一下，支持在不传入标识符时使用内置元数据作为标识符。首先对 Provide 和 Inject 做改造：
```typescript
function Provide(key?: string): ClassDecorator {
  return (Target) => {
    Container.set(key ?? Target.name, Target as unknown as ClassStruct);
    Container.set(Target, Target as unknown as ClassStruct);
  };
}

function Inject(key?: string): PropertyDecorator {
  return (target, propertyKey) => {
    Container.propertyRegistry.set(
      `${target.constructor.name}:${String(propertyKey)}`,
      key ?? Reflect.getMetadata('design:type', target, propertyKey)
    );
  };
}
```
本节的代码并没有在类型上进行十分精确的处理，这主要是为了避免增加额外的代码复杂度，毕竟我们的主要目的是**理解依赖注入**而不是类型。
在 Inject 中，我们支持了在不传入标识符时，使用 Reflect.getMetadata('design:type', target, propertyKey) 作为默认的标识符，这里的元数据是一个完整的类，即 Class Driver 。
对应的，为了支持使用 Class 作为标识符进行查找，在 Provide 装饰器中我们需要确保也使用 Class 作为标识符来存储一份：
```typescript
function Provide(key?: string): ClassDecorator {
  return (Target) => {
    Container.set(key ?? Target.name, Target as unknown as ClassStruct);
    // 不论是否传入 key，都使用 Class 作为 key 注册一份
    Container.set(Target, Target as unknown as ClassStruct);
  };
}
```
然后就没了！我们并不需要修改 Container 的逻辑，只需要调整类型即可：
```typescript
type ServiceKey<T = any> = string | ClassStruct<T> | Function;

class Container {
  private static services: Map<ServiceKey, ClassStruct> = new Map();

  public static propertyRegistry: Map<string, string> = new Map();

  public static set(key: ServiceKey, value: ClassStruct): void {}

  public static get<T = any>(key: ServiceKey): T | undefined {}
  private constructor() {}
}
```
现在我们可以同时使用 @Inject() 与 @Inject('DriverService') 这两种方式来实现注入了，来最后测试一下：
```typescript
@Provide('DriverService')
  class Driver {
    adapt(consumer: string) {
      console.log(`\n === 驱动已生效于 ${consumer}！===\n`);
    }
  }

@Provide()
  class Fuel {
    fill(consumer: string) {
      console.log(`\n === 燃料已填充完毕 ${consumer}！===`);
    }
  }

@Provide()
  class Car {
    @Inject()
    driver!: Driver;

    @Inject()
    fule!: Fuel;

    run() {
      this.fule.fill('Car');
      this.driver.adapt('Car');
    }
  }

@Provide()
  class Bus {
    @Inject('DriverService')
    driver!: Driver;

    @Inject('Fuel')
    fule!: Fuel;

    run() {
      this.fule.fill('Bus');
      this.driver.adapt('Bus');
    }
  }

const car = Container.get(Car)!;
const bus = Container.get(Bus)!;

car.run();
bus.run();
```
![](https://cdn.nlark.com/yuque/0/2023/webp/22577092/1686403329936-dc2c1998-1649-4d1c-bc6f-b0efd3e5bec6.webp#averageHue=%232f323a&clientId=uc75d5a33-c265-4&from=paste&id=u646d44b7&originHeight=370&originWidth=592&originalType=url&ratio=2&rotation=0&showTitle=false&status=done&style=none&taskId=ub18eff2c-2ea2-465a-a35e-ae532472686&title=)
学习完这一节后，请你试着把上一部分的装饰器路由体系也基于这个简单的容器重新实现与改善，如新增对 Service 层与中间件层的注入：
```typescript
// 如何设计入参？
function logMiddleware() {
  // 中间件逻辑在何时执行？
}

@Controller('/user')
  class UserController {
    constructor(@Inject() private userService: UserService) {}

    @Middleware(logMiddleware)
    @Get('/list')
    async userList() {
      return await this.userService.all();
    }

    @Post('/add')
    async addUser(user: User) {
      return await this.userService.create(user);
    }
  }
```
## TSConfig全解
### 构建相关

- rootDir
- rootDirs
- outDir
### 类型检查相关
这一部分是比较重要，因为类型检查全开和全关的TypeScript区别很大
### 工程相关
。。。

