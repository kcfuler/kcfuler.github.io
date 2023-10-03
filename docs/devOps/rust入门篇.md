## 安装
> 我自己的电脑是windows，下面的内容主要是针对windows展开，mac的内容在教程中有

1. 语言安装

rust官网直接下载安装程序，下载安装程序安装就可以。

2. 代理设置

这里的代理类似npm设置源，这里可以使用教程中提到的中科大、字节的源都可以
这里在window下的一个问题就是打开`.cargo`文件夹下会发现没有教程中提到的`config`文件，解决方法：自己创建一个！

## 类型
> 只记一些觉得比较有趣的部分

## 所有权和借用
### 所有权

- 栈类型和堆类型
- 所有权概念：变量和值一一对应，过期回收
- 浅拷贝和深拷贝
- Clone & Copy，对应的类型
- 函数调用和声明都会触发所有权的移交
### 借用
> 用于解决所有权带来的编程繁琐的问题

- `&`引用，可以通过引用访问对应的值，不会导致所有权的变更，而引用的值是默认不可变的
- `mut &`可变引用，可以修改引用对应的值。同一作用域下，特定数据只能有一个可变引用
- 可变引用和不可变引用不能同时存在
- 引用的作用域从s创建开始，一直持续到最后一次使用它的位置，这一点和变量的块作用域不同
- Non-Lexical Lifetimes(NLL)
- 借用必须总是有效的
## 复合类型
### 字符串与切片

- 切片就是对连续集合某一部分的引用
- 字面量声明字符串是 &str ， 也就是切片类型，而切片类型默认是不可变的。可以通过`String`中的`from`函数创建一个可变的字符串
- 字符是`Unicode`编码，而字符串是`UTF-8`编码，切片截取时需要注意截取到字符边界，比如中文在`UTF-8`中是三个字节存储，这时候如果创建一个`[..2]`的切片就会导致程序崩溃，因为切片并不完整
- `String` 和 `&str`可以通过 `to_string()`方法和`&`来相互转换
- Rust中不能直接通过索引来对字符串取字符，因为不同类型的字符在底层的存储形式是不一样的，但是可以使用切片的方式，`start & end`都必须准确落在字符的边界处
#### 字符串操作

1. 追加
- `push & push_str`，在原字符串的基础上追加`char & str`
2. 插入
- `insert(index, char) & insert_str(index, str)`，在`index`后插入字符或者字符串
3. 替换
- `replace(origin_str, new_str)`，这个方法会替换匹配到的所有字符串，会**返回新的字符串**
- `replacen(orgin_str, new_str, n)`，作用和`replace`相同，但是会通过`n`限定替换的次数
- `replace_range(range, new_str)`，使用`new_str`替换`range`范围内的字符串
4. 删除（适用于 `String`类型）
- `pop()`，删除最后一个字符
- `remove(index)`，删除并返回指定位置的字符，这个方法是按照字节来处理字符串的，如果参数给的位置不是合法的字符边界，会出现错误
- `truncate(index)`，删除字符串从指定位置开始到结尾的全部字符，**直接操作原来的字符串，同样，参数位置不是合法的字符边界，会报错-**
- `clear()`，直接清空原来的字符串，和`truncate(0)`的效果类似
5. 连接
- `+ || +=`，要求右边的参数必须为字符串的切片引用( Slice )类型。内部实现是调用了 `std::string`标准库中的`add()`，方法的第二个参数时一个引用的类型。因此我们在使用`+`，必须传递引用类型。`**+**`**是返回一个新的字符串，所以变量声明可以不需要**`**mut**`**关键字修饰**.
- `format!()`，这个方法可以通过传入模板的方式来拼接字符串
#### 字符串转义

- 可以通过`\`转义的方式输出 `ASCII` 和 `Unicode`字符
- `\u`输出`unicode`字符
- `\\`两个斜杠之间的内容会忽略换行符
- 可以使用两个`\`来表示对斜杠进行转义
#### 操作 `UTF-8` 字符串

1. 遍历
- `"".chars()`，使用`Unicode`的方式遍历字符串
- `"".bytes()`，这种方式返回字符串的底层字节数组表现形式
2. 获取子串

这个操作是比较难的，从一个变长的字符串中取出一个子串，使用标准库是做不到的。可以在`crates.io`上通过已有的库来实现
#### 字符串深度解析
这里的核心在于内存管理。字符串字面量得益于不可变性，可以直接硬编码进可执行文件中。而对于`String`来说，为了支持一个可变的文本片段，需要在堆上分配一块在编译时未知大小的内存来存放内容，这些都是在程序运行时完成的：

- 首先向操作系统请求内存来存放`String`对象
- 使用完成之后，将内存释放，归还给操作系统

其中第一部分由`String::from`完成，它创建一个全新的`String`

在第二部分就涉及到语言对内存的管理了。在有**垃圾回收GC**的语言中，GC来负责标记并清除这些不再使用的内存对象，这个过程都是自动完成，无需开发者关心，简单好用；但是在无GC的语言中，需要开发者去手动释放这些内存对象，就像创建对象需要通过编写代码来完成一样，未能正确释放对象造成的后果简直不可估量。
对于Rust而言，安全和性能是写到骨子里的核心特性，如果使用GC，那么会损失性能；如果使用手动管理内存你，那么会牺牲安全。Rust给出的方法是：变量在离开作用域后，就自动释放内存

### 元组
> 和ts中的enum类似

- `(x, y, z)`创建，类型和创建时的值一一对应
- `() = () `可以通过模式匹配解构赋值
- `().value`，通过`.`访问值
- 一般在函数返回值场景很常用

### 结构体

1. 声明结构体
```rust
struct User {
	active: bool,
    username: String,
    email: String,
    sign_in_count: u64,
}
```

2. 创建结构体实例
```rust
    let user1 = User {
        email: String::from("someone@example.com"),
        username: String::from("someusername123"),
        active: true,
        sign_in_count: 1,
    };
// 也有简写的特性
fn build_user(email: String, username: String) -> User {
    User {
        email,
        username,
        active: true,
        sign_in_count: 1,
    }
}

```

3. 结构体更新
```rust
let user1 = User {
    email: String::from("someone@example.com"),
    username: String::from("someusername123"),
    active: true,
    sign_in_count: 1,
};
let user2 = User {
    active: user1.active,
    username: user1.username,
    email: String::from("another@example.com"),
    sign_in_count: user1.sign_in_count,
};
println!("{}", user1.active);
// 下面这行会报错
println!("{:?}", user1);

```
结构体的赋值也会导致所有权的转移，但只会转移非`Copy`类型的值
#### 结构体的内存排列
![image.png](https://cdn.nlark.com/yuque/0/2023/png/22577092/1690024122007-8386f8cc-86af-4b6a-ad36-4ef5231e5880.png#averageHue=%23f9f9f9&clientId=ub2e8906b-7102-4&from=paste&id=u9481b6ae&originHeight=242&originWidth=731&originalType=url&ratio=1.5&rotation=0&showTitle=false&size=28120&status=done&style=none&taskId=uda54c4d0-902e-4242-8245-617972086b0&title=)
把结构体中具有所有权的字段转移出去后，将无法再访问该字段，但是可以正常访问其它的字段
#### 元组结构体
`Name(value, value, value...)`结构体必须要有名称，但是结构体的字段可以没有名称
#### 单元结构体
```rust
struct AlwaysEqual;

let subject = AlwaysEqual;

// 我们不关心 AlwaysEqual 的字段数据，只关心它的行为，因此将它声明为单元结构体，然后再为它实现某个特征
impl SomeTrait for AlwaysEqual {

}
```
#### 结构体数据的所有权
如果你想在结构体中使用一个引用，就必须加上生命周期
```rust
struct User {
    username: &str,
    email: &str,
    sign_in_count: u64,
    active: bool,
}

fn main() {
    let user1 = User {
        email: "someone@example.com",
        username: "someusername123",
        active: true,
        sign_in_count: 1,
    };
}

// 编译器会报错
error[E0106]: missing lifetime specifier
 --> src/main.rs:2:15
  |
2 |     username: &str,
  |               ^ expected named lifetime parameter // 需要一个生命周期
  |
help: consider introducing a named lifetime parameter // 考虑像下面的代码这样引入一个生命周期
  |
1 ~ struct User<'a> {
2 ~     username: &'a str,
  |

error[E0106]: missing lifetime specifier
 --> src/main.rs:3:12
  |
3 |     email: &str,
  |            ^ expected named lifetime parameter
  |
help: consider introducing a named lifetime parameter
  |
1 ~ struct User<'a> {
2 |     username: &str,
3 ~     email: &'a str,
  |

```
#### 打印结构体信息
```rust
#[derive(Debug)] // 声明派生类
struct Rectangle {
    width: u32,
    height: u32,
}

fn main() {
    let rect1 = Rectangle {
        width: 30,
        height: 50,
    };

    println!("rect1 is {:?}", rect1); // 注意 ? 
}
```
```rust
#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

fn main() {
    let scale = 2;
    let rect1 = Rectangle {
        width: dbg!(30 * scale),
        height: 50,
    };

    dbg!(&rect1);
}
```
`dbg! `输出到标准错误输出 `stderr`，而 `println!` 输出到标准输出 `stdout`。
### 枚举类型
`enum`，通过这个关键字声明

- 任何类型的数据都可以放入枚举中，例如字符串、数值、结构体甚至另一个枚举

一份样例代码
```rust
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(i32, i32, i32),
}

fn main() {
    let m1 = Message::Quit;
    let m2 = Message::Move{x:1,y:1};
    let m3 = Message::ChangeColor(255,255,0);
}
```
使用枚举可以让实现更简洁，代码内聚性更强。
#### 同一化类型
通过一个枚举来让一个函数接受两种类型，统一处理
#### Option 枚举用于处理空值
```rust
// rust中用于代表空值
enum Option<T> {
    Some(T),
    None,
}
```

- 使用`None`时需要指明类型，因为编译器只通过`None`值无法推断出`Some`成员保存的值类型
- `Option<T>`和 `T`是不同的类型。可以帮助我们解决空值问题之一：期望某值不为空但实际为空的情况
### 数组
Rust中常用的数组有两种：

- `Array`，定长数组
- `Vector`，动态数组
#### 创建数组

- `let name:[type;length] = [...values];`声明一个数组，包括它的类型和长度
- `let name = [value; count]`可以通过这样的方式来声明**某个值重复出现N次**的数组
- `let array: [String; 8] = std::array::from_fn(|i| String::from("rust is best !"));`，通过`from_fn`的方式在数组中装下复杂类型
#### 访问元素

- `array[index]`通过下标访问
- 越界时会报错，而不是访问到一块未知的内存
#### 切片
```rust
let a: [i32; 5] = [1, 2, 3, 4, 5];

let slice: &[i32] = &a[1..3];

assert_eq!(slice, &[2, 3]);
```

- 切片长度是补丁的
- 创建切片的代价是很小的，切片只是对底层数组的一个引用
- 切片类型`[T]`拥有不固定的大小，而切片引用类型`&[T]`则具有固定的大小，因为`Rust`很多时候都需要固定大小数据类型，因此`&[T]`更有用，`&str`字符串切片也同理
#### 总结
```rust
fn main() {
  // 编译器自动推导出one的类型
  let one             = [1, 2, 3];
  // 显式类型标注
  let two: [u8; 3]    = [1, 2, 3];
  let blank1          = [0; 3];
  let blank2: [u8; 3] = [0; 3];

  // arrays是一个二维数组，其中每一个元素都是一个数组，元素类型是[u8; 3]
  let arrays: [[u8; 3]; 4]  = [one, two, blank1, blank2];

  // 借用arrays的元素用作循环中
  for a in &arrays {
    print!("{:?}: ", a);
    // 将a变成一个迭代器，用于循环
    // 你也可以直接用for n in a {}来进行循环
    for n in a.iter() {
      print!("\t{} + 10 = {}", n, n+10);
    }

    let mut sum = 0;
    // 0..a.len,是一个 Rust 的语法糖，其实就等于一个数组，元素是从0,1,2一直增加到到a.len-1
    for i in 0..a.len() {
      sum += a[i];
    }
    println!("\t({:?} = {})", a, sum);
  }
}
```

- 数组类型容易跟数组切片混淆， `[T;n]`描述了一个数组的类型，而`[T]`描述了切片的类型，因为切片是运行时的数据结构，它的长度无法在编译期得知，因此不能用`[T;n]`的形式去描述
- `[T;3]`和`[T;4]`是不同的类型，数组的长度也是类型的一部分
- 实际开发中，使用最多的是数组切片，我们往往通过引用的方式去使用`&[T]`，因为后者有固定的类型大小
## 流程控制
> 常规

- `if else`，语法和`go`基本相同
#### for
```rust
for item in &container {
  // ...
}

// 如果想在循环中，修改该元素，可以使用 mut 关键字
for item in &mut collection {
	
}
```
| 使用方法 | 等价使用方式 | 所有权 |
| --- | --- | --- |
| `for item in collection` | for item in IntoIterator::into_iter(collection) | 转移所有权 |
| for item in &collection | for item in collection.iter() | 不可变借用 |
| for item in &mut collection | for item in collection.iter_mut() | 可变借用 |

- 直接循环集合中的元素在性能和安全两方面都有更优的表现

#### continue && break
> 常规

#### while
> 常规

#### loop循环
`loop {}`，通过`loop`关键字声明一个无限循环
```rust
fn main() {
    let mut counter = 0;

    let result = loop {
        counter += 1;

        if counter == 10 {
            break counter * 2;
        }
    };

    println!("The result is {}", result);
}
```

- `break`可以单独使用，也可以带一个返回值，作用类似`return`
- `loop`是一个表达式，因此可以返回一个值
## 模式匹配
在`Rust`中，模式匹配最常用的是`match`和`if let`
```rust
enum Direction {
    East,
    West,
    North,
    South,
}

fn main() {
    let dire = Direction::South;
    match dire {
        Direction::East => println!("East"),
        Direction::North | Direction::South => {
            println!("South or North");
        },
        _ => println!("West"),
    };
}
```

- `match`的匹配必须要穷举出所有可能，这里使用`_`来代表未列出的所有可能性
- `match`的每一个分支都必须是一个表达式，且所有分支的表达式最终返回值的类型必须相同
```rust
match target {
    模式1 => 表达式1,
    模式2 => {
        语句1;
        语句2;
        表达式2
    },
    _ => 表达式3
}
```

- `match`本身也是一个表达式，可以用它来赋值
```rust
enum IpAddr {
   Ipv4,
   Ipv6
}

fn main() {
    let ip1 = IpAddr::Ipv6;
    let ip_str = match ip1 {
        IpAddr::Ipv4 => "127.0.0.1",
        _ => "::1",
    };

    println!("{}", ip_str);
}
```
#### 模式匹配

1. 模式绑定，也就是从模式中取出绑定的值
```rust
#[derive(Debug)]
enum UsState {
    Alabama,
    Alaska,
    // --snip--
}

enum Coin {
    Penny,
    Nickel,
    Dime,
    Quarter(UsState), // 25美分硬币
}

fn value_in_cents(coin: Coin) -> u8 {
    match coin {
        Coin::Penny => 1,
        Coin::Nickel => 5,
        Coin::Dime => 10,
        // 这里就通过 state 匹配上了 Quarter 中的 usState的值
        Coin::Quarter(state) => {
            println!("State quarter from {:?}!", state);
            25
        },
    }
}

```
##### if let 匹配
```rust
if let Some(3) = v {
	println!("three");
}
```
当只需要匹配一个条件，且忽略其它条件时就使用`if let`，否则都用`match`
#### matches!宏
可以将一个表达式跟模式进行匹配，然后返回匹配的结果`true`or `false`
```rust
// 筛选某个枚举中的值，但是会报错，因为无法直接将一个值和枚举成员进行比较
v.iter().filter(|x| x == MyEnum::Foo);

// 使用matches!进行匹配
v.iter().filter(|x| matches!(x, MyEnum::Foo));
```
## 方法 Method
### 定义方法
```rust
struct Circle {
    x: f64,
    y: f64,
    radius: f64,
}

impl Circle {
    // new是Circle的关联函数，因为它的第一个参数不是self，且new并不是关键字
    // 这种方法往往用于初始化当前结构体的实例
    fn new(x: f64, y: f64, radius: f64) -> Circle {
        Circle {
            x: x,
            y: y,
            radius: radius,
        }
    }

    // Circle的方法，&self表示借用当前的Circle结构体
    fn area(&self) -> f64 {
        std::f64::consts::PI * (self.radius * self.radius)
    }
}
```
### self &self 和 &mut self

- `&self` 是 `self: &Self`的简写，在`impl`块内代指解构体的实例
- `self`表示将所有权转移到该方法中，这种形式用的较少
- `&self`表示该方法对`Rectangle`的不可变借用
- `&mut self`表示可变借用
- `self`的使用就跟函数参数一样，要严格遵守`Rust`的所有权规则

使用方法替代函数有以下好处：

- 不用在函数签名中重复书写`self`对应的类型
- 代码的组织性和内聚性更强，对代码维护和阅读来说，好处巨大

在Rust中，允许方法名跟结构体的字段名相同：
```rust
impl Rectangle {
    fn width(&self) -> bool {
        self.width > 0
    }
}

fn main() {
    let rect1 = Rectangle {
        width: 30,
        height: 50,
    };

    if rect1.width() {
        println!("The rectangle has a nonzero width; it is {}", rect1.width);
    }
}

// 使用getter访问器
// pub表示都可以访问
pub struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    pub fn new(width: u32, height: u32) -> Self {
        Rectangle { width, height }
    }
    pub fn width(&self) -> u32 {
        return self.width;
    }
}

fn main() {
    let rect1 = Rectangle::new(30, 50);

    println!("{}", rect1.width());
}
```

- Rust有一个叫自动引用和解引用的功能。方法调用是Rust中少数几个拥有这种行为的地方。

它的工作方式是这样的：当使用`object.something()`调用方法时，Rust会自动为`object`添加`&`、`&mut`或`*`以便使`object`与方法签名匹配。也就是说，这些代码是等价的：
```rust
p1.distance(&p2);
(&p1).distance(&p2);
```
### 关联函数
定义在`impl`中且没有`self`的函数被称为**关联函数**：因为它没有`self`，不能用`f.read()`的形式调用，因此它是一个函数而不是方法，它又在`impl`中，与结构体紧密关联，因此称为关联函数。
```rust
impl Rectangle {
    fn new(w: u32, h: u32) -> Rectangle {
        Rectangle { width: w, height: h }
    }
}
```
### 多个impl
rust允许我们为一个结构体定义多个`impl`块，目的是提供更多的灵活性和代码组织性，例如当方法多了后，可以把相关的方法组织在同一个`impl`中，那么就可以形成多个`impl`块，各自完成一块儿目标
```rust
impl Rectangle {
    fn area(&self) -> u32 {
        self.width * self.height
    }
}

impl Rectangle {
    fn can_hold(&self, other: &Rectangle) -> bool {
        self.width > other.width && self.height > other.height
    }
}
```
### 为枚举实现方法
枚举类型之所以强大，不仅仅在于它好用、可以同一化类型，还在于，我们可以像结构体一样，为枚举实现方法：
```rust
#![allow(unused)]
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(i32, i32, i32),
}

impl Message {
    fn call(&self) {
        // 在这里定义方法体
    }
}

fn main() {
    let m = Message::Write(String::from("hello"));
    m.call();
}
```
## 泛型和特征
rust中的泛型定义和其它语言中的泛型基本一致，相对于ts来说要多一些静态的限制

1. 在实现泛型操作时，需要注意操作本身支持的类型。

比如`+`，也就是`add`方法并不支持所有的类型，这时候直接使用不加限制的泛型就会报错，需要对它加以限制
```rust
fn add<T: std::ops::Add<Output = T>>(a:T, b:T) -> T {
    a + b
}
```
### 结构体中使用泛型
```rust
struct Point<T> {
    x: T,
    y: T,
}

fn main() {
    let integer = Point { x: 5, y: 10 };
    let float = Point { x: 1.0, y: 4.0 };
}
```
这里有两点需要注意：

- **提前声明**，在使用泛型参数之前必须要先声明`Point<T>`，接着就可以在结构体的字段类型中使用`T`来替代具体的类型
- X和Y是相同的相同的类型，这一点很重要，如果使用不同的类型，那么它会报错
### 枚举中使用泛型
```rust
enum Option<T> {
	Some(T),
    None,
}	

// 这个枚举和Option一样，主要用于函数返回值，与Option用于值的存在与否不同，Result关注的主要
// 是值的正确性
enum Result<T, E> {
    Ok(T),
    Err(E),
}
```
### 在方法中使用泛型
```rust
struct Point<T> {
    x: T,
    y: T,
}

impl<T> Point<T> {
    fn x(&self) -> &T {
        &self.x
    }
}

fn main() {
    let p = Point { x: 5, y: 10 };

    println!("p.x = {}", p.x());
}
```
```rust
struct Point<T, U> {
    x: T,
    y: U,
}

// 方法和结构体的泛型不必相同
impl<T, U> Point<T, U> {
    fn mixup<V, W>(self, other: Point<V, W>) -> Point<T, W> {
        Point {
            x: self.x,
            y: other.y,
        }
    }
}

fn main() {
    let p1 = Point { x: 5, y: 10.4 };
    let p2 = Point { x: "Hello", y: 'c'};

    let p3 = p1.mixup(p2);

    println!("p3.x = {}, p3.y = {}", p3.x, p3.y);
}
```
#### 为具体的泛型类型实现方法
对于`Point<T>`类型，不仅能定义基于`T`的方法，还能针对特定的具体类型，进行方法定义：
```rust
impl Point<f32> {
    fn distance_from_origin(&self) -> f32 {
        (self.x.powi(2) + self.y.powi(2)).sqrt()
    }
}
```
这段代码以为着`Point<f32>`类型会有一个方法`distance_from_origin`，而其他`T`不是`f32`类型的`Point<T>`实例则没有定义此方法。这个方法计算点实例与坐标`(0.0, 0.0)`之间的距离，并使用了只能用于浮点型的数学运算符。
这样我们就能针对特定的泛型类型实现某个特定的方法，对于其它泛型则没有定义该方法。
### const泛型（Rust 1.51版本引入的重要特性）
之前的写法
```rust
// 要注意泛型需要符合 println!函数的要求
fn display_array<T: std::fmt::Debug>(arr: &[T]) {
    println!("{:?}", arr);
}
fn main() {
    let arr: [i32; 3] = [1, 2, 3];
    display_array(&arr);

    let arr: [i32;2] = [1,2];
    display_array(&arr);
}
```
使用const泛型可以用于针对值做泛型处理
```rust
fn display_array<T: std::fmt::Debug, const N: usize>(arr: [T; N]) {
    println!("{:?}", arr);
}
fn main() {
    let arr: [i32; 3] = [1, 2, 3];
    display_array(arr);

    let arr: [i32; 2] = [1, 2];
    display_array(arr);
}
```
### 泛型的性能
在Rust中泛型是零成本的抽象，意味着你在使用泛型的时候，完全不用担心性能上的问题。它会在编译时把所有泛型展开（也称为泛型的单态化 monomorphization）为对应类型的实现，没有运行时的开销。

1. 优点：
- 高性能
2. 缺点：
- 编译速度慢
- 最终生成文件更大
### 特征 Trait
> 和其它语言的接口概念类似

**特征定义了一组可以被共享的行为，只要实现了特征，你就能使用这组行为**
#### 定义特征
如果不同的类型具有相同的行为，那么我们就可以定义一个特征，然后为这些类型实现该特征。**定义特征是把一些方法组合在一起，目的是定义一个实现某些目标所必需的行为的集合**。
```rust
pub trait Summary {
    fn summarize(&self) -> String;
}
```

- 这里的特征只定义行为看起来是什么样的，而不定义行为具体是什么样的。因此，我们只定义特征方法的签名，而不进行实现，此时方法的签名结尾是`;`,而不是一个`{}`
- 每一个实现这个特征的类型都需要实现该特征的相应方法，编译器也会确保任何实现`Summary`特征的类型都拥有与这个签名的定义完全一致的`summarize`方法
#### 为类型实现特征
因为特征只定义行为看起来是什么样的，因此我们需要为类型实现具体的特征，定义行为具体是什么样的
```rust
pub trait Summary {
    fn summarize(&self) -> String;
}
pub struct Post {
    pub title: String, // 标题
    pub author: String, // 作者
    pub content: String, // 内容
}
// 为 Post 实现 Summary 特征
impl Summary for Post {
    fn summarize(&self) -> String {
        format!("文章{}, 作者是{}", self.title, self.author)
    }
}

pub struct Weibo {
    pub username: String,
    pub content: String
}

impl Summary for Weibo {
    fn summarize(&self) -> String {
        format!("{}发表了微博{}", self.username, self.content)
    }
}
```
##### 特征定义与实现的位置（孤儿规则）
**如果你想要为类型**`**A**`**实现特征**`**T**`**，那么**`**A**`**或者**`**T**`**至少有一个是在当前作用域中定义的**
这个规则被称为孤儿规则，可以确保其他人编写的代码不会破坏你的代码，也确保了你不会莫名其妙就破坏了风马牛不相及的代码。
#### 默认实现
可以在特征中定义具有**默认实现**的方法，这样其它类型无需再实现该方法，或者也可以选择重载该方法:
```rust
pub trait Summary {
    fn summarize(&self) -> String {
        String::from("(Read more...)")
    }
}

// 默认特征方法
impl Summary for Post {}

// 重载特征方法
impl Summary for Weibo {
    fn summarize(&self) -> String {
        format!("{}发表了微博{}", self.username, self.content)
    }
}
```
默认实现允许调用相同特征中的其它方法，哪怕这些方法没有默认实现。如此，特征可以提供许多有用的功能而只需要实现指定的一小部分内容。
```rust
pub trait Summary {
    fn summarize_author(&self) -> String;

    fn summarize(&self) -> String {
        format!("(Read more from {}...)", self.summarize_author())
    }
}

// 为了使用 Summary，只需要实现 summarize_author方法即可
impl Summary for Weibo {
    fn summarize_author(&self) -> String {
        format!("@{}", self.username)
    }
}
println!("1 new weibo: {}", weibo.summarize());
```
`weibo.summarize()`会先调用`Summary`特征默认实现的`summarize`方法，通过该方法进而调用`Weibo`为`Summary`实现的`summarize_author`方法
#### 使用特征作为函数参数
> 类似于函数作为参数

```rust
pub fn notify(item: &impl Summary) {
    println!("Breaking news! {}", item.summarize());
}
```
你可以使用任何实现了 Summary 特征的类型作为该函数的参数，同时在函数体内，还可以调用该特征的方法，例如 summarize 方法。具体的说，可以传递 Post 或 Weibo 的实例来作为参数，而其它类如 String 或者 i32 的类型则不能用做该函数的参数，因为它们没有实现 Summary 特征。
#### 特征约束( trait bound)
`impl Trait`这种语法实际上是一个语法糖，它内部是通过特征约束来实现的
```rust
pub fn notify<T: Summary>(item: &T) {
    println!("Breaking news! {}", item.summarize());
}
```
#### where约束
这个写法的主要作用就是改变类型声明的位置，让代码结构更清晰
```rust
fn some_function<T, U>(t: &T, u: &U) -> i32
    where T: Display + Clone,
          U: Clone + Debug
{}
```
```rust
use std::fmt::Display;

struct Pair<T> {
    x: T,
    y: T,
}

impl<T> Pair<T> {
    fn new(x: T, y: T) -> Self {
        Self {
            x,
            y,
        }
    }
}

impl<T: Display + PartialOrd> Pair<T> {
    fn cmp_display(&self) {
        if self.x >= self.y {
            println!("The largest member is x = {}", self.x);
        } else {
            println!("The largest member is y = {}", self.y);
        }
    }
}

```
#### 函数返回中的 `impl Trait`
可以通过`impl Trait`来说明一个函数返回了一个类型，这个类型实现了某个特征
```rust
fn returns_summarizable() -> impl Summary {
    Weibo {
        username: String::from("sunface"),
        content: String::from(
            "m1 max太厉害了，电脑再也不会卡",
        )
    }
}
```
这样的弊端就是返回值只能有一个具体的类型
```rust
fn returns_summarizable(switch: bool) -> impl Summary {
    if switch {
        Post {
            title: String::from(
                "Penguins win the Stanley Cup Championship!",
            ),
            author: String::from("Iceburgh"),
            content: String::from(
                "The Pittsburgh Penguins once again are the best \
                 hockey team in the NHL.",
            ),
        }
    } else {
        Weibo {
            username: String::from("horse_ebooks"),
            content: String::from(
                "of course, as you probably already know, people",
            ),
        }
    }
}

```
像上面这段代码编译器就会报错
```rust
`if` and `else` have incompatible types
expected struct `Post`, found struct `Weibo`
```
### 特征对象
在 Rust 中，特征对象（Trait Object）是一种用于处理抽象类型和动态分发的机制。它允许在编译时不确定具体类型，而在运行时根据具体类型的实现来调用方法或执行其他操作。特征对象允许我们在面向对象编程中实现类似于多态（polymorphism）的行为。
特征对象的实现基于 Rust 的特征（Trait）系统，结合了 Rust 的所有权和生命周期规则，从而确保在运行时动态分发时仍然能够保持内存安全。	

- 可以通过`Box<dyn Trait> or &dyn Trait`创建，其中 `dyn`是 rust中的关键字，用于标识动态发放的特征对象
```rust
trait Draw {
    fn draw(&self) -> String;
}

impl Draw for u8 {
    fn draw(&self) -> String {
        format!("u8: {}", *self)
    }
}

impl Draw for f64 {
    fn draw(&self) -> String {
        format!("f64: {}", *self)
    }
}

// 若 T 实现了 Draw 特征， 则调用该函数时传入的 Box<T> 可以被隐式转换成函数参数签名中的 Box<dyn Draw>
fn draw1(x: Box<dyn Draw>) {
    // 由于实现了 Deref 特征，Box 智能指针会自动解引用为它所包裹的值，然后调用该值对应的类型上定义的 `draw` 方法
    x.draw();
}

fn draw2(x: &dyn Draw) {
    x.draw();
}

fn main() {
    let x = 1.1f64;
    // do_something(&x);
    let y = 8u8;

    // x 和 y 的类型 T 都实现了 `Draw` 特征，因为 Box<T> 可以在函数调用时隐式地被转换为特征对象 Box<dyn Draw> 
    // 基于 x 的值创建一个 Box<f64> 类型的智能指针，指针指向的数据被放置在了堆上
    draw1(Box::new(x));
    // 基于 y 的值创建一个 Box<u8> 类型的智能指针
    draw1(Box::new(y));
    draw2(&x);
    draw2(&y);
}
```

- `draw1`函数的参数是`Box<dyn Draw>`形式的特征对象，该特征对象是通过`Box::new(x)`的方式创建的
- `draw2`函数的参数是`&dyn Draw`形式的特征对象，该特征对象是通过`&x`的方式创建的
- `dyn`关键字只用在特征对象的类型声明上，在创建时无需使用`dyn`
### 深入特征
#### 关联类型
关联类型是在特征定义的语句块中，声明一个自定义类型，这样就可以在特征的方法签名中使用该类型：

- 主要的作用在于提高代码的可维护性
```rust
pub trait Iterator {
    type Item;

    fn next(&mut self) -> Option<Self::Item>;
}

impl Iterator for Counter {
    type Item = u32;

    fn next(&mut self) -> Option<Self::Item> {
        // --snip--
    }
}

fn main() {
    let c = Counter{..}
    c.next()
}
```
#### 默认泛型参数
使用上和ts基本一致。
```rust
trait Add<RHS=Self> {
    type Output;

    fn add(self, rhs: RHS) -> Self::Output;
}

```
#### 调用同名方法
```rust
trait Pilot {
    fn fly(&self);
}

trait Wizard {
    fn fly(&self);
}

struct Human;

impl Pilot for Human {
    fn fly(&self) {
        println!("This is your captain speaking.");
    }
}

impl Wizard for Human {
    fn fly(&self) {
        println!("Up!");
    }
}

impl Human {
    fn fly(&self) {
        println!("*waving arms furiously*");
    }
}


// 调用实例上的方法时会默认调用类型中定义的方法
fn main() {
    let person = Human;
    person.fly();
}

fn main() {
    let person = Human;
    Pilot::fly(&person); // 调用Pilot特征上的方法
    Wizard::fly(&person); // 调用Wizard特征上的方法
    person.fly(); // 调用Human类型自身的方法
}
```
#### 完全限定语法
用于处理关联函数无法定位的情况，它是调用函数最为明确的方式
```rust
//在尖括号中，通过 as 关键字，我们向 Rust 编译器提供了类型注解，也就是 Animal 就是 Dog
//，而不是其他动物，
fn main() {
    println!("A baby dog is called a {}", <Dog as Animal>::baby_name());
}
```
#### 特征定义中的特征约束
在 Rust 中，supertrait 是一种用于特性继承的概念。当一个特性需要拥有另一个特性的所有功能时，可以通过指定 supertrait 来实现继承关系。
具体来说，supertrait 是指在一个特性中引用另一个特性，使得前者包含了后者的所有方法和要求。这样一来，实现前者的类型必须同时满足后者的要求。通过这种方式，我们可以建立特性之间的层次结构，从而使代码更加模块化和可复用。
```rust
trait Animal {
    fn make_sound(&self);
}

trait Fly: Animal {
    fn fly(&self);
}

struct Bird;

impl Animal for Bird {
    fn make_sound(&self) {
        println!("Chirp!");
    }
}

impl Fly for Bird {
    fn fly(&self) {
        println!("Flying high!");
    }
}

fn main() {
    let bird = Bird;
    bird.make_sound(); // Output: Chirp!
    bird.fly();        // Output: Flying high!
}
```
#### 在外部类型上实现外部特征
使用 `new type`模式来规避**孤儿规则**。用于创建一个新类型来封装现有类型，并且在编译时确保不同类型之间的严格隔离。这种模式可以提高代码的可读性、安全性和模块化，同时也允许在需要时为新类型添加自定义行为。
在 Rust 中，Newtype 模式的实现依赖于元组结构体（Tuple Structs）或单元结构体（Unit Structs）。这些结构体具有与元组或单元类型相同的内部表现，但它们是不同的类型，因此在 Rust 中被视为不同的类型。
```rust
use std::fmt;

struct Wrapper(Vec<String>); // new type

impl fmt::Display for Wrapper {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "[{}]", self.0.join(", "))
    }
}

fn main() {
    let w = Wrapper(vec![String::from("hello"), String::from("world")]);
    println!("w = {}", w);
}
```
#### 作业
```rust

struct Container(i32, i32);

// 使用关联类型实现重新实现以下特征
// trait Contains {
//    type A;
//    type B;

trait Contains {
    type A;
    type B;
    fn contains(&self, _: &Self::A, _: &Self::B) -> bool;
    fn first(&self) -> i32;
    fn last(&self) -> i32;
}

impl Contains for Container {
    type A = i32;
    type B = i32;
    fn contains(&self, number_1: &Self::A, number_2: &Self::B) -> bool {
        (&self.0 == number_1) && (&self.1 == number_2)
    }
    // Grab the first number.
    fn first(&self) -> i32 { self.0 }

    // Grab the last number.
    fn last(&self) -> i32 { self.1 }
}
// 使用到了特征对象，注意这里使用泛型默认参数将type A , type B的值传入了
fn difference(container: &dyn Contains<A=i32, B=i32>) -> i32 {
    container.last() - container.first()
}

fn main() {
    let number_1 = 3;
    let number_2 = 10;

    let container = Container(number_1, number_2);

    println!("Does container contain {} and {}: {}",
        &number_1, &number_2,
        container.contains(&number_1, &number_2));
    println!("First number: {}", container.first());
    println!("Last number: {}", container.last());
    
    println!("The difference is: {}", difference(&container));
}

```
## 集合类型
### Vector
#### 创建动态数组
```rust
let v: Vec<i32> = Vec::new(); // 指定类型

let mut v = Vec::new(); // 自动推断类型
v.push(1);
```
```rust
// vec!是rust中的一种宏，可以在创建的同时赋予初始值
let v = vec![1, 2, 3];
```
#### 更新
```rust
let mut v = Vec::new();
v.push(1);
```
#### 销毁
在离开作用域之后，`vec`和它的值会被一同销毁
```rust
{
    let v = vec![1, 2, 3];

    // ...
} // <- v超出作用域并在此处被删除
```
#### 读取元素

- 通过下标索引访问
- 使用`get`方法
```rust
let v = vec![1, 2, 3, 4, 5];

let third: &i32 = &v[2];
println!("第三个元素是 {}", third);

// 使用get方法返回的是 Option，需要通过 match 来解构
// 使用get方法可以处理越界的情况，保证程序不会崩溃
match v.get(2) {
    Some(third) => println!("第三个元素是 {third}"),
    None => println!("去你的第三个元素，根本没有！"),
}
```
#### 同时借用多个数组元素

- 需要注意借用的原则
#### 迭代数组
```rust
let v = vec![1, 2, 3];
for i in &v {
    println!("{i}");
}

// 迭代过程中修改
let mut v = vec![1, 2, 3];
for i in &mut v {
    *i += 10
}
```
#### 存储不同类型的元素
通过枚举和特征对象来实现不同类型元素的存储
```rust
#[derive(Debug)]
enum IpAddr {
    V4(String),
    V6(String)
}
fn main() {
    let v = vec![
        IpAddr::V4("127.0.0.1".to_string()),
        IpAddr::V6("::1".to_string())
    ];

    for ip in v {
        show_addr(ip)
    }
}

fn show_addr(ip: IpAddr) {
    println!("{:?}",ip);
}
```
```rust
trait IpAddr {
    fn display(&self);
}

struct V4(String);
impl IpAddr for V4 {
    fn display(&self) {
        println!("ipv4: {:?}",self.0)
    }
}
struct V6(String);
impl IpAddr for V6 {
    fn display(&self) {
        println!("ipv6: {:?}",self.0)
    }
}

fn main() {
    let v: Vec<Box<dyn IpAddr>> = vec![
        Box::new(V4("127.0.0.1".to_string())),
        Box::new(V6("::1".to_string())),
    ];

    for ip in v {
        ip.display();
    }
}
```
在实际使用场景中，特征对象数组要比枚举数组常见很多，主要原因在于特征对象非常灵活，而编译器对枚举的限制比较多，且无法动态增加类型
#### 排序
在rust中实现了两种排序算法，分别为稳定的排序`sort`和`sort_by`，以及非稳定排序`sort_unstable`和`sort_unstable_by`
```rust
fn main() {
    let mut vec = vec![1, 5, 10, 2, 15];    
    vec.sort_unstable();    
    assert_eq!(vec, vec![1, 2, 5, 10, 15]);
}
```
```rust
fn main() {
    let mut vec = vec![1.0, 5.6, 10.3, 2.0, 15f32];    
    vec.sort_unstable();    
    assert_eq!(vec, vec![1.0, 2.0, 5.6, 10.3, 15f32]);
}
```
上述对浮点数的排序会报错，因为`f32`并没有实现全数值可比较`Ord`特性，而是实现了部分可比较的特性`PartialOrd`
如果我们浮点数数组中不存在`NaN`的值，那么我们可以使用`partial_cmp`来作为大小判断的依据
```rust
fn main() {
    let mut vec = vec![1.0, 5.6, 10.3, 2.0, 15f32];    
    vec.sort_unstable_by(|a, b| a.partial_cmp(b).unwrap());    
    assert_eq!(vec, vec![1.0, 2.0, 5.6, 10.3, 15f32]);
}

// 对结构体排序
#[derive(Debug)]
struct Person {
    name: String,
    age: u32,
}

impl Person {
    fn new(name: String, age: u32) -> Person {
        Person { name, age }
    }
}

fn main() {
    let mut people = vec![
        Person::new("Zoe".to_string(), 25),
        Person::new("Al".to_string(), 60),
        Person::new("John".to_string(), 1),
    ];
    // 定义一个按照年龄倒序排序的对比函数
    people.sort_unstable_by(|a, b| b.age.cmp(&a.age));

    println!("{:?}", people);
}
```
### HashMap
#### 创建HashMap
```rust
use std::collections::HashMap;

// 创建一个HashMap，用于存储宝石种类和对应的数量
let mut my_gems = HashMap::new();

// 将宝石类型和对应的数量写入表中
my_gems.insert("红宝石", 1);
my_gems.insert("蓝宝石", 2);
my_gems.insert("河边捡的误以为是宝石的破石头", 18);
```
跟 Vec 一样，如果预先知道要存储的 KV 对个数，可以使用`HashMap::with_capacity(capacity)` 创建指定大小的 HashMap，避免频繁的内存分配和拷贝，提升性能。
```rust
// 笨方法
fn main() {
    use std::collections::HashMap;

    let teams_list = vec![
        ("中国队".to_string(), 100),
        ("美国队".to_string(), 10),
        ("日本队".to_string(), 50),
    ];

    let mut teams_map = HashMap::new();
    for team in &teams_list {
        teams_map.insert(&team.0, team.1);
    }

    println!("{:?}",teams_map)
}

// 先转换为迭代器，再通过collect方法，经迭代器中的元素收集之后，转成HashMap
fn main() {
    use std::collections::HashMap;

    let teams_list = vec![
        ("中国队".to_string(), 100),
        ("美国队".to_string(), 10),
        ("日本队".to_string(), 50),
    ];

    let teams_map: HashMap<_,_> = teams_list.into_iter().collect();
    
    println!("{:?}",teams_map)
}

```
#### 所有权转移
`HashMap`的所有权规则与其它Rust类型一致：

- 若类型实现`Copy`特征，该类型会被复制进`HashMap`，因此无所谓所有权
- 若没实现`Copy`特征，所有权将被转移给`HashMap`中

如果使用引用类型放入`HashMap`中，需要确保该引用的生命周期至少跟`HashMap`活得一样久
```rust
fn main() {
    use std::collections::HashMap;

    let name = String::from("Sunface");
    let age = 18;

    let mut handsome_boys = HashMap::new();
    handsome_boys.insert(&name, age);

    std::mem::drop(name); // 引用对应的数据已经被清除
    println!("因为过于无耻，{:?}已经被除名", handsome_boys);
    println!("还有，他的真实年龄远远不止{}岁", age);
}
```
#### 查询`HashMap`
```rust
use std::collections::HashMap;

let mut scores = HashMap::new();

scores.insert(String::from("Blue"), 10);
scores.insert(String::from("Yellow"), 50);

let team_name = String::from("Blue");
// 注意返回的是一个Option，且值是借用，如果不是借用，可能会发生所有权的转移
let score: Option<&i32> = scores.get(&team_name);
```
#### 遍历
```rust
use std::collections::HashMap;

let mut scores = HashMap::new();

scores.insert(String::from("Blue"), 10);
scores.insert(String::from("Yellow"), 50);

for (key, value) in &scores {
    println!("{}: {}", key, value);
}

```
#### 更新map中的值
```rust
fn main() {
    use std::collections::HashMap;

    let mut scores = HashMap::new();

    scores.insert("Blue", 10);

    // 覆盖已有的值
    let old = scores.insert("Blue", 20);
    assert_eq!(old, Some(10));

    // 查询新插入的值
    let new = scores.get("Blue");
    assert_eq!(new, Some(&20));

    // 查询Yellow对应的值，若不存在则插入新值
    let v = scores.entry("Yellow").or_insert(5);
    assert_eq!(*v, 5); // 不存在，插入5

    // 查询Yellow对应的值，若不存在则插入新值
    let v = scores.entry("Yellow").or_insert(50);
    assert_eq!(*v, 5); // 已经存在，因此50没有插入
}
```
```rust
use std::collections::HashMap;

let text = "hello world wonderful world";

let mut map = HashMap::new();
// 根据空格来切分字符串(英文单词都是通过空格切分)
for word in text.split_whitespace() {
    let count = map.entry(word).or_insert(0); // 返回 &mut v 引用，因此可以通过它修改map中的值
    *count += 1;// 使用 count 引用时，需要先进行解引用，否则会出现类型不匹配
}

println!("{:?}", map);
```
## 生命周期
Rust中的生命周期(lifetime)是一个非常重要的概念,主要用于解决引用的**悬空指针问题**。
生命周期的主要作用有:

1. 保证引用在使用时总是有效的。Rust编译器通过生命周期来跟踪引用,确保引用在使用前都是有效的。这可以防止悬空指针的出现。
2. 允许借用关系链的存在。生命周期允许函数接收引用参数,并**返回含有借用的类型**。这使得值可以通过多个函数传递,同时仍保证借用的有效性。
3. 支持泛型生命周期参数。生命周期可以作为**泛型参数**,用于约束泛型函数、结构体等的生命周期。
```rust
fn longest(x: &str, y: &str) -> &str {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}

// error below
error[E0106]: missing lifetime specifier
 --> src/main.rs:9:33
  |
9 | fn longest(x: &str, y: &str) -> &str {
  |               ----     ----     ^ expected named lifetime parameter // 参数需要一个生命周期
  |
  = help: this function's return type contains a borrowed value, but the signature does not say whether it is
  borrowed from `x` or `y`
  = 帮助： 该函数的返回值是一个引用类型，但是函数签名无法说明，该引用是借用自 `x` 还是 `y`
help: consider introducing a named lifetime parameter // 考虑引入一个生命周期
  |
9 | fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
  |           ^^^^    ^^^^^^^     ^^^^^^^     ^^^

```
在存在多个引用时，编译器有时会无法自动推导生命周期，此时就需要我们手动去标注，通过为参数标注合适的生命周期来帮助编译器进行借用检查的分析。
### 生命周期标注语法
> 生命周期标注并不会改变任何引用的实际作用域

```rust
&i32        // 一个引用
&'a i32     // 具有显式生命周期的引用
&'a mut i32 // 具有显式生命周期的可变引用

// 函数中的标注
fn useless<'a>(first: &'a i32, second: &'a i32) {}

fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}
```
**在通过函数签名指定生命周期参数时，我们并没有改变传入引用或者返回引用的真实生命周期，而是告诉编译器当不满足此约束条件时，就拒绝编译通过**。
```rust
fn main() {
    let string1 = String::from("long string is long");

    {
        let string2 = String::from("xyz");
        let result = longest(string1.as_str(), string2.as_str());
        println!("The longest string is {}", result);
    }
}
```
显式的使用生命周期，可以让编译器正确的认识到多个引用之间的关系，最终帮我们提前规避可能存在的代码风险。rust编译器在调教上比较保守：当可能出错也可能不出错时，它会选择前者，抛出编译错误。
### 深入思考生命周期标注
使用生命周期的方式往往取决于函数的功能
函数的返回值如果是一个引用类型，那么它的生命周期只会来源于：

- 函数参数的生命周期
- 函数体中某个新建引用的生命周期

生命周期语法用来将函数的多个引用参数和返回值的作用域关联到一起，一旦关联到一起后，Rust就拥有充分的信息来确保我们的操作是内存安全的。
### 结构体中的生命周期
在结构体中的生命周期和函数中的类似：为**每一个引用类型**的变量表示生命周期即可
```rust
struct ImportantExcerpt<'a> {
    part: &'a str,
}

fn main() {
    let novel = String::from("Call me Ishmael. Some years ago...");
    let first_sentence = novel.split('.').next().expect("Could not find a '.'");
    let i = ImportantExcerpt {
        part: first_sentence,
    };
}
```
`ImportantExcerpt` 结构体中有一个引用类型的字段 `part`，因此需要为它标注上生命周期。结构体的生命周期标注语法跟泛型参数语法很像，需要对生命周期参数进行声明 `<'a>`。该生命周期标注说明，**结构体 **`**ImportantExcerpt**`** 所引用的字符串 **`**str**`** 必须比该结构体活得更久**。
### 生命周期消除
对于编译器来说，每一个引用类型都有一个生命周期，但很多时候我们并不需要为变量标注生命周期，这是因为编译器自动对我们的引用变量进行了**生命周期消除**。
```rust
fn first_word(s: &str) -> &str {
    let bytes = s.as_bytes();

    for (i, &item) in bytes.iter().enumerate() {
        if item == b' ' {
            return &s[0..i];
        }
    }

    &s[..]
}
```
在上述例子中，返回变量的生命周期来自于传入变量的生命周期，而不是内部创建的生命周期，这样不会导致垂悬引用问题。编译器可以发现这一点，所以在这种情况下可以不用标注生命周期。
#### 三条消除规则
当编译器发现三条规则都不适用时，就会报错，提示你需要手动标注生命周期。

1. 每一个引用参数都会获得独自的生命周期
2. 若只有一个输入生命周期（函数参数中只有一个引用类型），那么该生命周期会被赋给所有的输出生命周期
3. 若存在多个输入生命周期，且其中一个是`&self`或`&self`，则`&self`的生命周期被赋给所有的输出生命周期。拥有`&self`形式的参数，说明该函数是一个`方法`，该规则让方法的使用便利度大幅提升
```rust
// 规则1
fn foo<'a>(x: &'a i32)
fn foo<'a, 'b>(x: &'a i32, y: &'b i32)

// 规则2
fn foo(x: &i32) -> i32
```
#### 方法中的生命周期
```rust
struct ImportantExcerpt<'a> {
    part: &'a str,
}

impl<'a> ImportantExcerpt<'a> {
    fn level(&self) -> i32 {
        3
    }
}
```

- `impl`中必须使用结构体的完整名称，包括`<'a>`，因为生命周期标注也是结构体类型的一部分
- 方法签名中，往往不需要标注生命周期，得益于生命周期消除的第一和第三规则
```rust
impl<'a> ImportantExcerpt<'a> {
    // 其中返回值自动标注生命周期
    fn announce_and_return_part<'b>(&'a self, announcement: &'b str) -> &'a str {
        println!("Attention please: {}", announcement);
        self.part
    }
}
```
由于` &'a self` 是被引用的一方，因此引用它的`&'b str `必须要活得比它短，否则会出现悬垂引用。因此说明生命周期 `'b`必须要比`'a` 小，只要满足了这一点，编译器就不会再报错。
```rust
impl<'a: 'b, 'b> ImportantExcerpt<'a> {
    fn announce_and_return_part(&'a self, announcement: &'b str) -> &'b str {
        println!("Attention please: {}", announcement);
        self.part
    }
}
```

- `'a: 'b`，是生命周期约束语法，跟泛型约束类似，用于说明`'a`必须比`'b`活得久
- 可以把`'a`和`'b`都在同一个地方声明，或者分开声明但通过`where 'a: 'b`约束生命周期关系：
```rust
impl<'a> ImportantExcerpt<'a> {
    fn announce_and_return_part<'b>(&'a self, announcement: &'b str) -> &'b str
    where
        'a: 'b,
    {
        println!("Attention please: {}", announcement);
        self.part
    }
}
```
### 静态生命周期
Rust中一个非常特殊的生命周期`'static`，拥有该生命周期的引用可以和整个程序活得一样久。字符串字面量是被硬编码进Rust的二进制文件中，因此它们都有`'static`的生命周期：
```rust
let s: &'static str = "live long";
```
	这个声明周期一般用于处理非常复杂的生命周期问题，只要你能确定：**所有引用的生命周期都是正确的，只是编译器不够聪明**。

- 生命周期`'static`意味着能和程序活得一样就，例如字符串字面量和特征对象
- 如果遇到实在解决不了的生命周期标注问题，可以尝试`T:'static`，有时候它会给你奇迹
```rust
use std::fmt::Display;

fn longest_with_an_announcement<'a, T>(
    x: &'a str,
    y: &'a str,
    ann: T,
) -> &'a str
where
    T: Display,
{
    println!("Announcement! {}", ann);
    if x.len() > y.len() {
        x
    } else {
        y
    }
}

```
# 返回值和错误处理
## panic!深入剖析
```rust
use std::net::IpAddr;
// 这里 unwarp的作用是：如果解析成功，将Ok(IpAddr)中的值赋给home，如果失败，则直接panic
let home: IpAddr = "127.0.0.1".parse().unwrap();

```
### 可能导致全局有害状态时
有害状态大概分为几类：

- 非预期的错误
- 后续代码的运行会收到显著影响
- 内存安全问题

## 返回值 Result 和 ?


