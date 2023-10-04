# 编写测试及控制执行
在Rust中，测试通过函数的方式实现的，它可以用于验证被测试代码的正确性。测试函数往往一次执行以下三种行为：

1. 设置所需的数据或状态
2. 运行想要测试的代码
3. 判断(assert)返回的结果是否符合预期
## 测试函数
当使用`Cargo`创建一个`lib`类型的包时，它会为我们自动生成一个测试模块。
```rust
$ cargo new adder --lib
     Created library `adder` project
$ cd adder
```
生成的项目会附带测试样例
```rust
pub fn add(left: usize, right: usize) -> usize {
    left + right
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test] // 标识测试函数
    fn it_works() {
        let result = add(2, 2);
        assert_eq!(result, 4); // 测试断言
    }
}
```
## Cargo test
这是rust的一个命令，可以帮助我们运行项目中的测试样例
```rust
$ cargo test
   Compiling adder v0.1.0 (file:///projects/adder)
    Finished test [unoptimized + debuginfo] target(s) in 0.57s
     Running unittests (target/debug/deps/adder-92948b65e88960b4)

running 1 test // 总的测试数量
// it_works是测试函数的函数名
test tests::it_works ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

   Doc-tests adder // 这里代表的是文档测试中的测试

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

```
可以通过给`assert!`函数添加参数来输出更多和错误相关的信息
```rust
fn greeting_contains_name() {
    let result = greeting("Sunface");
    let target = "孙飞";
    assert!(
        result.contains(target),
        // 它的效果和fmt函数类似	
        "你的问候中并没有包含目标姓名 {} ，你的问候是 `{}`",
        target,
        result
    );
}
```
## 测试Panic
如果一个函数本来就会`panic`，我们可以通过`[should_panic]`这个属性注解来进行标识，使用方式和`test`注解一样，对目标测试函数进行标注即可
```rust
pub struct Guess {
    value: i32,
}

impl Guess {
    pub fn new(value: i32) -> Guess {
        if value < 1 || value > 100 {
            panic!("Guess value must be between 1 and 100, got {}.", value);
        }

        Guess { value }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    #[should_panic] // 直接进行标注，表示这种情况一定会panic
    fn greater_than_100() {
        Guess::new(200);
    }
}
```
	在使用`should`标识之后，如果这个函数没有`panic`，测试会失败
### expected
我们可以使用`expected`来标识想要的结果，如果不是这个结果，测试也会失败。这个关键字可以帮助我们在`panic`时，对不同的`panic`进行细分处理
```rust
// --snip--
impl Guess {
    pub fn new(value: i32) -> Guess {
        if value < 1 {
            panic!(
                "Guess value must be greater than or equal to 1, got {}.",
                value
            );
        } else if value > 100 {
            panic!(
                "Guess value must be less than or equal to 100, got {}.",
                value
            );
        }

        Guess { value }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    // 通过 expected，可以帮助我们细分panic的情况
    #[should_panic(expected = "Guess value must be less than or equal to 100")]
    fn greater_than_100() {
        Guess::new(200);
    }
}
```
## 使用Result
在使用了`?`操作符进行链式调用时，我们就需要使用`Result<T, E>`来处理我们的测试了
```rust
#[cfg(test)]
mod tests {
    #[test]
    fn it_works() -> Result<(), String> {
        if 2 + 2 == 4 {
            Ok(())
        } else {
            Err(String::from("two plus two does not equal four"))
        }
    }
}
```
在这种情况下，我们无法使用`should_panic`关键字来处理
## 使用 -- 分割命令行参数
### 测试用例的并行或顺序执行
并行可以让我们的测试执行得更快，但如果我们的测试样例依赖了同一份数据，那么并发的读写数据会让我们的测试结果变得不可靠。解决方法如下：

1. 速度优先：让每个测试写入自己独立的文件中
2. 准确优先：通过命令行参数让测试顺序执行

这里主要介绍的是顺序执行，也就是通过`cargo test -- --test-threads=1`这个命令指定线程数，让它在单线程环境中进行测试
### 测试函数中的`println!`
默认情况下测试执行时，不会显示通过标准输出写入的内容，这时候我们就可以通过另外一个命令行参数来显示它：
`$ cargo test -- --show-output`
### 运行指定的测试
```rust
$ cargo test one_hundred // 通过指定测试名称来运行对应的测试
running 1 test
test tests::one_hundred ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 2 filtered out; finished in 0.00s

```
```rust
$ cargo test add
running 2 tests
test tests::add_three_and_two ... ok
test tests::add_two_and_two ... ok

test result: ok. 2 passed; 0 failed; 0 ignored; 0 measured; 1 filtered out; finished in 0.00s
```
### 忽略对应部分测试
我们可以通过`[ignore]`关键字来忽略指定的测试用例
```rust
#[test]
fn it_works() {
    assert_eq!(2 + 2, 4);
}

#[test]
#[ignore]
fn expensive_test() {
    // 这里的代码需要几十秒甚至几分钟才能完成
}
```
```rust
$ cargo test -- --ignored
running 1 test
test expensive_test ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 1 filtered out; finished in 0.00s

   Doc-tests adder

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```
```rust
$ cargo test run -- --ignored
running 1 test
test tests::expensive_run ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 2 filtered out; finished in 0.00s

```
## [dev-dependencies]
与`package.json`中的`devDependencies`一样，Rust也能引入只在开发测试场景使用的外部依赖
比如`pretty_assertions`，它可以用来拓展标准库中的`assert_eq!`和`assert_ne!`，可以提供彩色字体的对比结果
```rust
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

#[cfg(test)]
mod tests {
    use super::*;
    use pretty_assertions::assert_eq; // 该包仅能用于测试

    #[test]
    fn test_add() {
        assert_eq!(add(2, 3), 5);
    }
}
```
## 生成测试二进制文件
它的主要作用就是生成测试的二进制文件，方便给别人分享。默认执行`cargo test`时其实就会生成一个可运行测试的二进制文件，存放在`target/debug/deps`目录下
如果只想生成可执行文件，不想看`cargo test`的输出结果，还可以使用`cargo test --no-run`
# 单元测试和集成测试
单元测试目标是测试某一个**代码单元**（一般都是函数），验证该单元是否能按预期进行工作。在rust中，单元测试的惯例是将测试代码的模块和待测试的正常代码放入同一个文件中。
```rust
pub fn add_two(a: i32) -> i32 {
    a + 2
}

#[cfg(test)] 
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        assert_eq!(add_two(2), 4);
    }
}
```
	这段代码中的`#[cfg(test)]`标注可以告诉rust只有在`cargo test`时才编译和运行模块`tests`，其它时候被`test`标注的代码不会进行编译。这样的好处有几个：

- 节省构建代码时的编译时间
- 减少编译出的可执行文件的体积

`#[cfg(test)]`中，`cfg`是`configuration`的缩写，它告诉Rust：当`test`配置项存在时，才会运行下面的代码，在`cargo test`运行时，就会将`test`配置项传入，因此后面的`tests`模块会被包含进来。                                                                                                                                  
## 集成测试
集成测试是对更复杂的功能、模块整体进行测试。在rust中表现为单独的`tests`目录下的测试文件
# 用GitHub Actions进行持续集成
```rust
# 下面是一个基础的工作流，你可以基于它来编写自己的 GitHub Actions
name: CI

# 控制工作流何时运行
on:
  # 当 `push` 或 `pull request` 事件发生时就触发工作流的执行，这里仅仅针对 `main` 分支
  push:
    branches: [main]
  pull_request:
    branches: [main]

  # 允许用于在 `Actions` 标签页中手动运行工作流
  workflow_dispatch:

# 工作流由一个或多个作业( job )组成，这些作业可以顺序运行也可以并行运行
jobs:
  # 当前的工作流仅包含一个作业，作业 id 是 "build"
  build:
    # 作业名称
    name: build rust action
    # 执行作业所需的运行器 runner
    runs-on: ubuntu-latest

    # steps 代表了作业中包含的一系列可被执行的任务
    steps:
      # 在 $GITHUB_WORKSPACE 下 checks-out 当前仓库，这样当前作业就可以访问该仓库
      - uses: actions/checkout@v2

      # 使用运行器的终端来运行一个命令
      - name: Run a one-line script
        run: echo Hello, world!

      # 使用运行器的终端运行一组命令
      - name: Run a multi-line script
        run: |
          echo Add other actions to build,
          echo test, and deploy your project.

```
## 基本概念

- Gihub Actions，每个项目都拥有一个`Actions`，可以包含多个工作流
- workflow 工作流，描述了一次持续集成的过程
- job 作业，一个工作可以包含多个作业，因为一次持续集成本省就由多个不同的部分组成
- step 步骤，每个作业由多个步骤组成，按顺序一步一步完成
- action 动作，每个步骤包含多个动作， 上面的`Run a multi-line script`步骤就包含了两个动作

# 测试驱动（TDD）
主要就是三个步骤：

1. 编写一个注定失败的测试，并且失败原因和指定的一样
2. 编写一个成功的测试
3. 编写逻辑代码，直到通过测试

在开发过程中不断循环这三个步骤，直到所有代码都开发完成并通过所有测试。

