---
sidebar_position: 2
---

## 静态资源处理

### Web Worker脚本

```typescript
const start = () => {
  let count = 0;
  setInterval(() => {
    // 给主线程传值
    postMessage(++count);
  }, 2000);
};

start();
```

通过`?worker`来标识worker

```typescript
import Worker from './example.js?worker';
// 1. 初始化 Worker 实例
const worker = new Worker();
// 2. 主线程监听 worker 的信息
worker.addEventListener('message', (e) => {
  console.log(e);
});
```

### wasm

一个`.wasm`文件

```typescript
export function fib(n) {
  var a = 0,
    b = 1;
  if (n > 0) {
    while (--n) {
      let t = a + b;
      a = b;
      b = t;
    }
    return b;
  }
  return a;
}
```

​	在组件中导入`fib.wasm`文件，vite会对`.wasm`文件的内容进行封装，默认导出为 init 函数，这个函数返回一个Promise，因此我们可以在其 then 方法中拿到其导出的成员--`fib`方法

```typescript
// Header/index.tsx
import init from './fib.wasm?init';

type FibFunc = (num: number) => number;

init({}).then((instance) => {
  const fibFunc = instance.exports.fib as FibFunc;
  console.log('Fib result:', fibFunc(10));
});
```

### 生产环境处理

- 自定义部署域名

```typescript
// vite.config.ts
// 是否为生产环境，在生产环境一般会注入 NODE_ENV 这个环境变量，见下面的环境变量文件配置
const isProduction = process.env.NODE_ENV === 'production';
// 填入项目的 CDN 域名地址
const CDN_URL = 'xxxxxx';

// 具体配置
{
  base: isProduction ? CDN_URL: '/'
}

// .env.development
NODE_ENV=development

// .env.production
NODE_ENV=production
```

```typescript
// 开发环境优先级: .env.development > .env
// 生产环境优先级: .env.production > .env
// .env 文件
VITE_IMG_BASE_URL=https://my-image-cdn.com
```

- 单文件 or 内联

​	vite中，所有的静态资源都有两种构建方式，一种是打包成一个单文件，另一种是通过 base64 编码的格式内嵌到代码中。对于比较小的资源，适合内联到代码中，一方面`代码体积`的影响很小，另一方面可以减少不必要的网络请求，`优化网络性能`；而对于比较大的资源，就推荐单独打包成一个文件，而不是内联了，否则可能导致上 MB 的 base64 字符串内嵌到代码中，导致代码体积过大，页面加载性能下降。

​	vite内置的优化方案：如果静态资源体积 >= 4kb，则提取成单独的文件，否则转化为base64格式的字符串内联。这个大小也可以进行配置

```typescript
// vite.config.ts
{
  build: {
    // 8 KB
    assetsInlineLimit: 8 * 1024
  }
}
```

- 图片压缩

​	这里主要是使用一个知名的压缩库来实现：imagemin，对应的vite插件是`vite-plugin-imagemin`

```typescript
//vite.config.ts
import viteImagemin from 'vite-plugin-imagemin';

{
  plugins: [
    // 忽略前面的插件
    viteImagemin({
      // 无损压缩配置，无损压缩下图片质量不会变差
      optipng: {
        optimizationLevel: 7
      },
      // 有损压缩配置，有损压缩下图片质量可能会变差
      pngquant: {
        quality: [0.8, 0.9],
      },
      // svg 优化
      svgo: {
        plugins: [
          {
            name: 'removeViewBox'
          },
          {
            name: 'removeEmptyAttrs',
            active: false
          }
        ]
      }
    })
  ]
}
```



- 雪碧图优化

​	这个主要是对svg进行优化（对http2.0没有明显效果）。

```typescript
// vite.config.ts
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';

{
  plugins: [
    // 省略其它插件
    createSvgIconsPlugin({
      iconDirs: [path.join(__dirname, 'src/assets/icons')]
    })
  ]
}
```

# 架构

## 预构建

​	vite是一个提倡`no-bundle`的构建工具，相比于传统的webpack，能够做到开发时的模块**按需编译**，而不用先打包完成再加载。但这里需要注意：我们所说的模块代码其实分为两部分，一部分是源代码，也就是业务代码，另一部分是第三方依赖的代码。所谓的`no-bundle` **只是对于源代码而言**，对于第三方依赖而言，vite还是选择`bundle`，并且使用速度极快的打包器`ESbuild`来完成这一个过程

### 为什么需要预构建

1. vite是基于浏览器原生ES模块规范实现的Dev Server，不论是应用代码，还是第三方依赖的代码，理应符合ESM规范才能够正常运行。但很多第三方库没有适配ESM，比如`react`

2. 请求瀑布流问题：在依赖层级深、依赖模块数量多的情况下，会触发大量的网络请求，加上 Chrome 对同一域名下只能同时支持`6`个HTTP并发请求的限制，会导致页面加载十分缓慢。通过进行依赖的预构建之后，`lodash-es`这个库的代码被打包成一个文件，这样请求的数量就会减少很多，进而提升页面的加载速度

   下面是`lodash-es`中的`debounce`的依赖图。![image-20231004230917507](https://s2.loli.net/2023/10/04/GjzF8fSlCqtJpxQ.png)

### 如何开启预构建

#### 自动开启（默认）

​	对于依赖的请求结果，Vite的Dev Server会设置强缓存![image-20231004231649819](https://s2.loli.net/2023/10/04/EHn3ePu7p4Y2sAv.png)

​	缓存过期时间被设置为1年，表示缓存过期前浏览器对 react 预构建产物的请求不会再经过 Vite Dev Server，直接使用缓存结果。

​	除HTTP缓存外，Vite还设置了本地文件系统的缓存，所有预构建产物默认缓存在`node_modules/.vite`目录中。如果以下三个地方都没有改动，Vite将一直使用缓存文件：

- package.json的`dependencies`字段
- lock文件
- `optimizeDeps`配置内容

#### 手动开启

​	有时不希望使用本地的缓存文件，比如需要调试某个包的预构建结果，可以使用下面任意一种方法清除缓存：

1. 删除`node_modules/.vite`目录
2. 在 Vite 配置文件中，将`server.force`设为`true`，在`Vite 3.0`中需要将`optimizeDeps.force`设为`true`
3. 命令行执行`npx vite --force`或者`npx vite optimize`

### 自定义配置解析

#### 入口文件`entries`

```typescript
// 将所有的 .vue 文件作为扫描入口
entries: ["**/*.vue"];
```

#### 添加依赖`includes`

​	它决定了可以强制预构建的依赖项

```typescript
// vite.config.ts
optimizeDeps: {
  // 配置为一个字符串数组，将 `lodash-es` 和 `vue`两个包强制进行预构建
  include: ["lodash-es", "vue"];
}
```

##### 使用场景

1. 动态 import ，可以通过添加`includes`来减少二次预构建对性能的影响
2. 某些包被手动 exclude，主要针对包支持ESM，但包的依赖没有支持ESM的场景

### 自定义ESbuild行为

​	Vite提供了`esbuildOptions`参数让我们自定义Esbuild本身的配置，常见的场景是加入一些Esbuild插件：

```typescript
// vite.config.ts
{
  optimizeDeps: {
    esbuildOptions: {
       plugins: [
        // 加入 Esbuild 插件
      ];
    }
  }
}
```

​	这个配置主要是处理一些特殊情况



## 双引擎架构

> vite的架构并不是"开发阶段用 Esbuild，生产环境用Rollup"那么简单

![image-20231005141812902](https://s2.loli.net/2023/10/05/KEFPOQoWy541BXp.png)

### 性能利器-Esbuild

​	esbuild在很多`关键的构建阶段` 让vite获得了相当优异的性能，这些阶段如果用传统的打包器/编译器来完成的话，开发体验要下降一大截。

#### 依赖预构建-作为 Bundle 工具

![image-20231005142057418](https://s2.loli.net/2023/10/05/SLJuplK2tzHwUmr.png)

一般来说，`node_module`依赖的大小动辄几百MB甚至上GB，会远超项目源代码，这些依赖如果直接在vite中使用，会有一系列的问题。esbuild就完成了对第三方依赖的**打包**和**格式转换**

esbuild作为打包工具也有一些缺点：

- 不支持降级到`es5`的代码
- 不支持`const enum`等语法
- 不提供操作打包产物的接口，像Rollup中灵活处理打包产物的能力在esbuild中是没有的

#### 单文件编译-作为TS和JSX编译工具

在依赖预构建阶段，esbuild作为bundler的角色存在。而在 `ts/jsx`单文件编译上，vite也使用esbuild进行语法转译，也就是将esbuild作为**transformer**来使用![image-20231005142759780](https://s2.loli.net/2023/10/05/noUMFYltAdEpDjT.png)

图中的这个阶段。也就是说，esbuild转译ts或者jsx的能力通过vite插件提供，这个vite插件在开发环境和生产环境都会执行。这部分的工作原先是Babel或者TSC来执行，但它们都有性能问题。这里是几个常用工具的性能对比。![image-20231005143051902](https://s2.loli.net/2023/10/05/veHl7Og1DBocTG9.png)

#### 代码压缩--作为压缩工具

![image-20231005143253036](https://s2.loli.net/2023/10/05/GcPU4jwzDZXCAko.png)

在生产环境中，esbuild通过插件的形式融入到了rollup的打包流程中。传统的方式是使用terser这种js开发的压缩器来实现，在webpack或者rollup中作为一个plugin来完成代码打包后的压缩混淆的工作。但terser很慢，主要有两个原因：

1. 压缩工作涉及大量的AST操作，并且在传统的构建流程中，AST在各个工具之间无法共享
2. JS本身语言的执行效率问题

### 构建基石-rollup

#### 生产环境bundle

rollup在vite中的地位并不亚于esbuild，它成熟的生态、插件系统都是vite所需要的。vite也基于rollup的打包能力做了一些拓展优化：

1. CSS代码分割，如果异步模块中引入了CSS，vite会抽离单文件，提高线上产物的`缓存复用率` 
2. 自动预加载。Vite会自动为入口 chunk 的依赖自动生成预加载标签`<link ref = "modulepreload">`， 如：

```html
<head>
  <!-- 省略其它内容 -->
  <!-- 入口 chunk -->
  <script type="module" crossorigin src="/assets/index.250e0340.js"></script>
  <!--  自动预加载入口 chunk 所依赖的 chunk-->
  <link rel="modulepreload" href="/assets/vendor.293dca09.js">
</head>
```

3. 异步 Chunk 加载优化。在异步引入的时候，通常会有多级依赖模块。rollup的打包产物会一层一层寻找依赖，再发起请求。而vite就会将这部分chunk在请求上层依赖时预加载它的依赖，优化网络请求的时间。

![image-20231005145419125](https://s2.loli.net/2023/10/05/zCW5aAHhFIo1q7M.png)

#### 兼容插件机制

vite的插件机制设计兼容rollup生态，这样就保证了能够使用rollup多年沉淀下来的插件，减少了插件开发的成本。

### ESbuild功能使用与插件开发实战

#### esbuild快的原因

esbuild是Figma的CTO Evan Wallace基于Golang开发的一款打包工具，相比传统的打包工具，主打性能优势。

1. **使用Golang开发**。构建逻辑代码直接被编译为原生机器码，而不用像JS一样代码先解析为字节码，然后再转换为机器码，提高了逻辑的执行效率
2. **多核并行**。内部打包算法很好的利用了多核处理的优势，所有步骤尽可能并行执行，这也是得益于Go中多线程共享内存的优势
3. **从零造轮子**。几乎没有使用任何第三方库，所有逻辑自己编写，大到AST解析，小到字符串的操作，保证极致的代码性能
4. **高效的内存利用**。esbuild中从头到尾尽可能复用同一份AST节点数据，而不像JS打包工具中频繁地解析和传递AST数据（如string -> TS -> JS -> string），造成大量的内存浪费。

#### esbuild使用

```typescript
pnpm init -y
pnpm i esbuild
```

### rollup 插件机制

在执行`rollup`命令之后，在 cli 内部的主要逻辑简化如下

```typescript
// build阶段
const bundle = await rollup.rollup(inputOptions)
// output阶段
await Promise.all(outputOptions.map(bundle.write))
// 构建结束
await bundle.close()
```

rollup 内部主要经历了`Build`和`output`两大阶段

![image-20231006201513316](https://s2.loli.net/2023/10/06/mB6P8Oydh3luAnN.png)

build阶段主要负责创建模块依赖图，初始化各个模块的 AST 以及模块之间的依赖关系。

解析之后的节点信息：

```typescript
{
  cache: {
    modules: [
      {
        ast: 'AST 节点信息，具体内容省略',
        code: 'export const a = 1;',
        dependencies: [],
        id: '/Users/code/rollup-demo/src/data.js',
        // 其它属性省略
      },
      {
        ast: 'AST 节点信息，具体内容省略',
        code: "import { a } from './data';\n\nconsole.log(a);",
        dependencies: [
          '/Users/code/rollup-demo/src/data.js'
        ],
        id: '/Users/code/rollup-demo/src/index.js',
        // 其它属性省略
      }
    ],
    plugins: {}
  },
  closed: false,
  // 挂载后续阶段会执行的方法
  close: [AsyncFunction: close],
  generate: [AsyncFunction: generate],
  write: [AsyncFunction: write]
}
```

经过`build`阶段的`bundle`对象其实并没有进行模块的打包，这个对象的作用在于存储各个模块的内容及依赖关系，同时暴露`generate`和`write`方法，以进入到后续的`Output`阶段（write 和 generate 方法的区别在于前者打包完产物会写入磁盘，而后者不会）。

真正的打包过程是在`Output`阶段进行

```typescript
const rollup = require('rollup');
async function build() {
  const bundle = await rollup.rollup({
    input: ['./src/index.js'],
  });
  // 真正的打包过程
  const result = await bundle.generate({
    format: 'es',
  });
  console.log('result:', result);
}

build();
```

```typescript
{
  output: [
    {
      exports: [],
      facadeModuleId: '/Users/code/rollup-demo/src/index.js',
      isEntry: true,
      isImplicitEntry: false,
      type: 'chunk',
      code: 'const a = 1;\n\nconsole.log(a);\n',
      dynamicImports: [],
      fileName: 'index.js',
      // 其余属性省略
    }
  ]
}
```

对于一次完整的构建流程而言，Rollup 会先进入到 build 阶段，解析各模块的内容及依赖关系，然后进入 output 阶段，完成打包及输出的过程。对于不同的阶段，rollup 插件会有不同的插件工作流程。

#### 插件工作流

##### 插件 hook 类型

插件的各种 hook 可以根据这两个构建阶段分为两类：`Build Hook` 与 `Output Hook`。

- `Build Hook` 也就是在`Build` 阶段执行的钩子函数，在这个阶段主要进行模块代码的转换、AST 解析以及模块依赖的解析，在这个阶段主要进行代码的转换、AST 解析以及模块依赖的解析，那么这个阶段的 Hook 对于代码的操作粒度一般为`模块`级别，也就是单文件级别
- `Output Hook`（官方称为`output generation hook`)，则主要进行代码的打包，对于代码而言，操作粒度一般为`chunk`级别（一个 chunk 通常指很多文件打包到一起的产物）

除了根据构建阶段可以将 Rollup 插件进行分类，根据**不同的 hook 执行方式**也会有不同的分类，主要包括`Async`、`Sync`、`Parallel`、`Squential`、`First`这五种

1. Async & Sync

首先是`Async` 和 `Sync` 钩子函数，两者其实是相对的，分别代表`异步`和`同步` 的钩子函数，两者最大的区别在于同步钩子里不能有异步逻辑，而异步钩子可以有

2. Parallel

这里指并发执行的钩子函数，如果有多个插件实现了这个钩子的逻辑，一旦有钩子是异步逻辑，则并发执行钩子逻辑，不会等待当前钩子完成（底层使用`Promise.all`）

3. Sequential

Sequential 指串行的钩子函数。这种Hook往往适用于插件间处理结果相互依赖的情况，前一个插件 Hook 的返回值作为后续插件的入参，这种情况就需要等待前一个插件执行完 Hook，获得其执行结果，然后才能进行下一个插件相应 Hook 的调用，如`transform`

4. First

如果有多个插件实现了这个 Hook，那么 Hook 将依次运行，直到返回一个非null 或非 undefined 的值为止。比较典型的 Hook 是`resolveId`，一旦有插件的resolveId返回了一个路径，将停止执行后续插件的 resolveId逻辑。

##### Build 阶段工作流

![img](https://s2.loli.net/2023/10/06/8Yo7ljWqIhnfVMv.webp)

1. 首先经历 `options` 钩子进行配置的转换，得到处理后的配置对象。
2. 随之 Rollup 会调用`buildStart`钩子，正式开始构建流程。
3. Rollup 先进入到 `resolveId` 钩子中解析文件路径。(从 `input` 配置指定的入口文件开始)。
4. Rollup 通过调用`load`钩子加载模块内容。
5. 紧接着 Rollup 执行所有的 `transform` 钩子来对模块内容进行进行自定义的转换，比如 babel 转译。
6. 现在 Rollup 拿到最后的模块内容，进行 AST 分析，得到所有的 import 内容，调用 moduleParsed 钩子:
   - **6.1** 如果是普通的 import，则执行 `resolveId` 钩子，继续回到步骤`3`。
   - **6.2** 如果是动态 import，则执行 `resolveDynamicImport` 钩子解析路径，如果解析成功，则回到步骤`4`加载模块，否则回到步骤`3`通过 `resolveId` 解析路径。
7. 直到所有的 import 都解析完毕，Rollup 执行`buildEnd`钩子，Build 阶段结束。

当然，在 Rollup 解析路径的时候，即执行`resolveId`或者`resolveDynamicImport`的时候，有些路径可能会被标记为`external`(翻译为`排除`)，也就是说不参加 Rollup 打包过程，这个时候就不会进行`load`、`transform`等等后续的处理了。

在流程图最上面，不知道大家有没有注意到`watchChange`和`closeWatcher`这两个 Hook，这里其实是对应了 rollup 的`watch`模式。当你使用 `rollup --watch` 指令或者在配置文件配有`watch: true`的属性时，代表开启了 Rollup 的`watch`打包模式，这个时候 Rollup 内部会初始化一个 `watcher` 对象，当文件内容发生变化时，watcher 对象会自动触发`watchChange`钩子执行并对项目进行重新构建。在当前**打包过程结束**时，Rollup 会自动清除 watcher 对象调用`closeWacher`钩子。

##### Output 阶段工作流

![image-20231006212254593](https://s2.loli.net/2023/10/06/qZtPyeVhcTfOQ4a.png)

![image-20231006212342331](https://s2.loli.net/2023/10/06/jNDvoOKS6WUwnYs.png)

1. 执行所有插件的 `outputOptions` 钩子函数，对 `output` 配置进行转换。
2. 执行 `renderStart`，并发执行 renderStart 钩子，正式开始打包。
3. 并发执行所有插件的`banner`、`footer`、`intro`、`outro` 钩子(底层用 Promise.all 包裹所有的这四种钩子函数)，这四个钩子功能很简单，就是往打包产物的固定位置(比如头部和尾部)插入一些自定义的内容，比如协议声明内容、项目介绍等等。
4. 从入口模块开始扫描，针对动态 import 语句执行 `renderDynamicImport`钩子，来自定义动态 import 的内容。
5. 对每个即将生成的 `chunk`，执行 `augmentChunkHash`钩子，来决定是否更改 chunk 的哈希值，在 `watch` 模式下即可能会多次打包的场景下，这个钩子会比较适用。
6. 如果没有遇到 `import.meta` 语句，则进入下一步，否则:
   - **6.1** 对于 `import.meta.url` 语句调用 `resolveFileUrl` 来自定义 url 解析逻辑
   - **6.2** 对于其他`import.meta` 属性，则调用 `resolveImportMeta` 来进行自定义的解析。
7. 接着 Rollup 会生成所有 chunk 的内容，针对每个 chunk 会依次调用插件的`renderChunk`方法进行自定义操作，也就是说，在这里时候你可以直接操作打包产物了。
8. 随后会调用 `generateBundle` 钩子，这个钩子的入参里面会包含所有的打包产物信息，包括 `chunk` (打包后的代码)、`asset`(最终的静态资源文件)。你可以在这里删除一些 chunk 或者 asset，最终这些内容将不会作为产物输出。
9. 前面提到了`rollup.rollup`方法会返回一个`bundle`对象，这个对象是包含`generate`和`write`两个方法，两个方法唯一的区别在于后者会将代码写入到磁盘中，同时会触发`writeBundle`钩子，传入所有的打包产物信息，包括 chunk 和 asset，和 `generateBundle`钩子非常相似。不过值得注意的是，这个钩子执行的时候，产物已经输出了，而 generateBundle 执行的时候产物还并没有输出。顺序如下图所示:![image-20231006212735379](https://s2.loli.net/2023/10/06/AOVWikNU6yuRBHL.png)

10. 当上述的`bundle`的`close`方法被调用时，会触发`closeBundle`钩子，到这里 Output 阶段正式结束。

##### 常用 hook 实战

1. 二八定律：20% 的 api 对应 80% 的场景
2. 学会模仿

实际上开发 Rollup 插件就是在编写一个个 Hook 函数，rollup 插件基本就是各种 Hook 函数的组合。

###### 路径解析：resolveId

> 这里用官方的 alias 插件举例

```typescript
// rollup.config.js
import alias from '@rollup/plugin-alias';
module.exports = {
  input: 'src/index.js',
  output: {
    dir: 'output',
    format: 'cjs'
  },
  plugins: [
    alias({
      entries: [
        // 将把 import xxx from 'module-a' 
        // 转换为 import xxx from './module-a'
        { find: 'module-a', replacement: './module-a.js' },
      ]
    })
  ]
};
```

插件代码简化后如下：

```typescript
export default alias(options) {
  // 获取 entries 配置
  const entries = getEntries(options);
  return {
    // 传入三个参数，当前模块路径、引用当前模块的模块路径、其余参数
    resolveId(importee, importer, resolveOptions) {
      // 先检查能不能匹配别名规则
      const matchedEntry = entries.find((entry) => matches(entry.find, importee));
      // 如果不能匹配替换规则，或者当前模块是入口模块，则不会继续后面的别名替换流程
      if (!matchedEntry || !importerId) {
        // return null 后，当前的模块路径会交给下一个插件处理
        return null;
      }
      // 正式替换路径
      const updatedId = normalizeId(
        importee.replace(matchedEntry.find, matchedEntry.replacement)
      );
      // 每个插件执行时都会绑定一个上下文对象作为 this
      // 这里的 this.resolve 会执行所有插件(除当前插件外)的 resolveId 钩子
      return this.resolve(
        updatedId,
        importer,
        Object.assign({ skipSelf: true }, resolveOptions)
      ).then((resolved) => {
        // 替换后的路径即 updateId 会经过别的插件进行处理
        let finalResult: PartialResolvedId | null = resolved;
        if (!finalResult) {
          // 如果其它插件没有处理这个路径，则直接返回 updateId
          finalResult = { id: updatedId };
        }
        return finalResult;
      });
    }
  }
}
```

从这里你可以看到 resolveId 钩子函数的一些常用使用方式，它的入参分别是`当前模块路径`、`引用当前模块的模块路径`、`解析参数`，返回值可以是 null、string 或者一个对象，我们分情况讨论。

- 返回值为 null 时，会默认交给下一个插件的 resolveId 钩子处理。
- 返回值为 string 时，则停止后续插件的处理。这里为了让替换后的路径能被其他插件处理，特意调用了 this.resolve 来交给其它插件处理，否则将不会进入到其它插件的处理。
- 返回值为一个对象，也会停止后续插件的处理，不过这个对象就可以包含[更多的信息](https://link.juejin.cn/?target=https%3A%2F%2Frollupjs.org%2Fguide%2Fen%2F%23resolveid)了，包括解析后的路径、是否被 enternal、是否需要 tree-shaking 等等，不过大部分情况下返回一个 string 就够用了。

load 为`Async + First`类型，即**异步优先**的钩子，和`resolveId`类似。它的作用是通过 resolveId 解析后的路径来加载模块内容。这里，我们以官方的 [image 插件](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Frollup%2Fplugins%2Fblob%2Fmaster%2Fpackages%2Fimage%2Fsrc%2Findex.js) 为例来介绍一下 load 钩子的使用。源码简化后如下所示:

```js
js
复制代码const mimeTypes = {
  '.jpg': 'image/jpeg',
  // 后面图片类型省略
};

export default function image(opts = {}) {
  const options = Object.assign({}, defaults, opts);
  return {
    name: 'image',
    load(id) {
      const mime = mimeTypes[extname(id)];
      if (!mime) {
        // 如果不是图片类型，返回 null，交给下一个插件处理
        return null;
      }
      // 加载图片具体内容
      const isSvg = mime === mimeTypes['.svg'];
      const format = isSvg ? 'utf-8' : 'base64';
      const source = readFileSync(id, format).replace(/[\r\n]+/gm, '');
      const dataUri = getDataUri({ format, isSvg, mime, source });
      const code = options.dom ? domTemplate({ dataUri }) : constTemplate({ dataUri });

      return code.trim();
    }
  };
}
```

从中可以看到，load 钩子的入参是模块 id，返回值一般是 null、string 或者一个对象：

- 如果返回值为 null，则交给下一个插件处理；
- 如果返回值为 string 或者对象，则终止后续插件的处理，如果是对象可以包含 SourceMap、AST 等[更详细的信息](https://link.juejin.cn/?target=https%3A%2F%2Frollupjs.org%2Fguide%2Fen%2F%23load)。

1. **代码转换: transform**

`transform` 钩子也是非常常见的一个钩子函数，为`Async + Sequential`类型，也就是`异步串行`钩子，作用是对加载后的模块内容进行自定义的转换。我们以官方的 `replace` 插件为例，这个插件的使用方式如下:

```js
js
复制代码// rollup.config.js
import replace from '@rollup/plugin-replace';

module.exports = {
  input: 'src/index.js',
  output: {
    dir: 'output',
    format: 'cjs'
  },
  plugins: [
    // 将会把代码中所有的 __TEST__ 替换为 1
    replace({
      __TEST__: 1
    })
  ]
};
```

内部实现也并不复杂，主要通过字符串替换来实现，核心逻辑简化如下:

```js
js
复制代码import MagicString from 'magic-string';

export default function replace(options = {}) {
  return {
    name: 'replace',
    transform(code, id) {
      // 省略一些边界情况的处理
      // 执行代码替换的逻辑，并生成最后的代码和 SourceMap
      return executeReplacement(code, id);
    }
  }
}

function executeReplacement(code, id) {
  const magicString = new MagicString(code);
  // 通过 magicString.overwrite 方法实现字符串替换
  if (!codeHasReplacements(code, id, magicString)) {
    return null;
  }

  const result = { code: magicString.toString() };

  if (isSourceMapEnabled()) {
    result.map = magicString.generateMap({ hires: true });
  }

  // 返回一个带有 code 和 map 属性的对象
  return result;
}
```

[transform 钩子](https://link.juejin.cn/?target=https%3A%2F%2Frollupjs.org%2Fguide%2Fen%2F%23transform)的入参分别为`模块代码`、`模块 ID`，返回一个包含 `code`(代码内容) 和 `map`(SourceMap 内容) 属性的对象，当然也可以返回 null 来跳过当前插件的 transform 处理。需要注意的是，**当前插件返回的代码会作为下一个插件 transform 钩子的第一个入参**，实现类似于瀑布流的处理。

1. **Chunk 级代码修改: renderChunk**

这里我们继续以 `replace`插件举例，在这个插件中，也同样实现了 renderChunk 钩子函数:

```js
js
复制代码export default function replace(options = {}) {
  return {
    name: 'replace',
    transform(code, id) {
      // transform 代码省略
    },
    renderChunk(code, chunk) {
      const id = chunk.fileName;
      // 省略一些边界情况的处理
      // 拿到 chunk 的代码及文件名，执行替换逻辑
      return executeReplacement(code, id);
    },
  }
}
```

可以看到这里 replace 插件为了替换结果更加准确，在 renderChunk 钩子中又进行了一次替换，因为后续的插件仍然可能在 transform 中进行模块内容转换，进而可能出现符合替换规则的字符串。

这里我们把关注点放到 renderChunk 函数本身，可以看到有两个入参，分别为 `chunk 代码内容`、[chunk 元信息](https://link.juejin.cn/?target=https%3A%2F%2Frollupjs.org%2Fguide%2Fen%2F%23generatebundle)，返回值跟 `transform` 钩子类似，既可以返回包含 code 和 map 属性的对象，也可以通过返回 null 来跳过当前钩子的处理。

1. **产物生成最后一步: generateBundle**

generateBundle 也是`异步串行`的钩子，你可以在这个钩子里面自定义删除一些无用的 chunk 或者静态资源，或者自己添加一些文件。这里我们以 Rollup 官方的`html`插件来具体说明，这个插件的作用是通过拿到 Rollup 打包后的资源来生成包含这些资源的 HTML 文件，源码简化后如下所示:

```js
js
复制代码export default function html(opts: RollupHtmlOptions = {}): Plugin {
  // 初始化配置
  return {
    name: 'html',
    async generateBundle(output: NormalizedOutputOptions, bundle: OutputBundle) {
      // 省略一些边界情况的处理
      // 1. 获取打包后的文件
      const files = getFiles(bundle);
      // 2. 组装 HTML，插入相应 meta、link 和 script 标签
      const source = await template({ attributes, bundle, files, meta, publicPath, title});
      // 3. 通过上下文对象的 emitFile 方法，输出 html 文件
      const htmlFile: EmittedAsset = {
        type: 'asset',
        source,
        name: 'Rollup HTML Asset',
        fileName
      };
      this.emitFile(htmlFile);
    }
  }
}
```

相信从插件的具体实现中，你也能感受到这个钩子的强大作用了。入参分别为`output 配置`、[所有打包产物的元信息对象](https://link.juejin.cn/?target=https%3A%2F%2Frollupjs.org%2Fguide%2Fen%2F%23generatebundle)，通过操作元信息对象你可以删除一些不需要的 chunk 或者静态资源，也可以通过 插件上下文对象的`emitFile`方法输出自定义文件。

### 如何开发一个完整 vite 插件

...待补充

### HMR API 及原理

>  代码改动后，如何进行毫秒级别的更新

在很久之前我们主要是通过`live reload`，也就是自动刷新页面的方式来解决的。后面业界使用 HMR技术来解决问题。像Parcel、Webpack 这些打包工具都实现了一套 HMR API。而 Vite 的 HMR API 基于 ESM 实现，可以达到毫秒级别的更新

#### HMR 简介

HMR的全程叫做`Hot Module Replacement`，即`模块热替换`或者`模块热更新`。在页面中的效果就是：直接把页面中发生变化的模块替换为新的模块，同时不会影响其它模块的正常运作。通过 HMR 的技术，我们可以实现**局部刷新**和**状态保存**

#### 深入 HMR API

Vite 作为一个完整的构建工具，本身实现了一套 HMR 系统，这套系统和传统工具的区别在于它基于 ESM，在文件发生改变时 Vite 会侦测相应 ES 模块的变化，从而触发对应的 API，实现局部的更新。

Vite 的 HMR API 设计也并非空穴来风，它基于一套完整的[HMR标准](https://github.com/FredKSchott/esm-hmr)， 它由同时期的snowpack、wmr 与 vite一起指定，是一个比较通用的规范。

HMR API 的类型定义

```typescript
interface ImportMeta {
  readonly hot?: {
    readonly data: any
    accept(): void
    accept(cb: (mod: any) => void): void
    accept(dep: string, cb: (mod: any) => void): void
    accept(deps: string[], cb: (mods: any[]) => void): void
    prune(cb: () => void): void
    dispose(cb: (data: any) => void): void
    decline(): void
    invalidate(): void
    on(event: string, cb: (...args: any[]) => void): void
  }
}
```

这里`import.meta` 对象为现代浏览器原生的一个内置对象，Vite 做的事情就是在这个对象上的`hot` 属性中定义了一套完整的属性和方法。因此，在 vite 中可以通过`import.meta.hot`来发访问关于 HMR 的属性和方法

#### 解析HMR API

##### `hot.accept`

这个 api 在模块发生更新时候调用，主要分为以下三种情况：

1. 自身作为更新的模块更新
2. 单一子模块更新
3. 多个子模块更新

以上三种情况的模块更新边界都是模块本身

##### `hot.dispose`

代表在模块更新、旧模块需要**销毁**时需要做的一些事情。

![image-20231007220647397](https://s2.loli.net/2023/10/07/LIvQPD5nyCM6pGf.png)

可以用这个api 解决在更新的时候，原有定时器没有销毁，导致定时器效果叠加的问题

##### `hot.data`

这个属性用于在不同的模块实例间共享一些数据。

```typescript
let timer: number | undefined;
if (import.meta.hot) {
+  // 初始化 count
+  if (!import.meta.hot.data.count) {
+    import.meta.hot.data.count = 0;
+  }
  import.meta.hot.dispose(() => {
    if (timer) {
      clearInterval(timer);
    }
  })
}
export function initState() {
+  const getAndIncCount = () => {
+    const data = import.meta.hot?.data || {
+      count: 0
+    };
+    data.count = data.count + 1;
+    return data.count;
+  };
  timer = setInterval(() => {
    let countEle = document.getElementById('count');
+    countEle!.innerText =  getAndIncCount() + '';
  }, 1000);
}
```

## 常见工程化需求

### 代码拆包

在生产环境下，为了提高页面的加载性能，构建工具一般将代码打包(bundle)到一起，这样上线之后只需要请求少量的 JS 文件，大大减少 HTTP 请求。默认情况下 vite 使用 rollup 完成项目的打包

在实际的项目场景中，只用 vite 的默认策略是不够的，需要使用 rollup 底层拆包的能力。也需要解决**循环引用**的问题

几个拆包常用概念的解释：

- `bundle` 指的是整体的打包产物，包含 JS 和各种静态资源
- `chunk`指的是打包后的 JS 文件，是`bundle`的子集
- `vendor` 是指第三方包的打包产物，是一种特殊的 chunk

#### `Code Splitting`解决的问题

传统的单`chunk`打包模式下，当项目代码越来越庞大，最后会导致浏览器下载一个巨大的文件，从页面加载性能的角度来说，主要会导致两个问题：

1. 无法做到**按需加载**，即使是当前页面不需要的代码也会进行加载
2. 线上**缓存复用率低**，改动一行代码就会导致整个 bundle 产物的缓存失效

一般而言，一个前端页面中的 JS 代码可以分为两个部分：`Initial Chunk`和`Async Chunk`，前者指页面首屏需要的代码，而后者当前页面并不一定需要，一个典型的例子就是`路由组件`，与当前路由无关的组件不用加载。项目被打包成单`bundle`之后，无论是`Initial Chunk`还是`Async Chunk`，都会打包进同一个产物。

线上的缓存命中率是一个很重要的性能指标。对于线上站点而言，服务端一般在响应资源时加上一些 HTTP 响应头 ，最常见的响应头之一就是`cache-control`，可以制定浏览器的强缓存。在单 chunk打包模式下，一旦有一行代码变动，整个 chunk 的 url 地址都会变化，

![image-20231008212847352](https://s2.loli.net/2023/10/08/dSpo1f8YeM9OyuD.png)

由于构建工具一般都会根据产物的内容生成哈希值，一旦内容变化就会导致整个 chunk 产物的强缓存失效，所以单 chunk 打包模式的缓存命中率极低。

进行`Code Splitting`之后，代码的改动只会影响部分的 chunk 哈希改动![image-20231008213044069](https://s2.loli.net/2023/10/08/GBpWy2lr3XeMFHv.png)

#### Vite 默认拆包策略

![image-20231008213317709](https://s2.loli.net/2023/10/08/KqYIOEt6oCaciZx.png)

1. 一方面是CSS的自动代码分割能力，每个单独的css 文件都会单独生成
2. 另一方面就是 Vite 基于 rollup 的`manualChunks`API 实现了应用拆包的策略：
   - 对于`Initial Chunk`而言，业务代码和第三方代码分别打包为单独的 chunk，在上述的例子中分别对应`index.js`和`vendor.js`。vite2.9之后的版本会直接将所有的 js 代码全部打包到`index.js`中。
   - 对于`Async Chunk`而言，动态`import`的代码会被拆分成单独的`chunk`，如上述的`Dynamic`组件

vite 默认拆包的优势在于实现了 CSS 代码分割与业务代码、第三方库代码、动态 import 模块代码三者的分离，但缺点也比较直观，第三方库的打包产物容易变得比较臃肿。

#### 自定义拆包策略

对于更细粒度的拆包，Vite 的底层打包引擎 rollup 提供了`manualChunks`，让我们能自定义拆包策略，它属于 vite 配置的一部分：

```typescript
// vite.config.ts
export default {
  build: {
    rollupOptions: {
      output: {
        // manualChunks 配置
        manualChunks: {},
      },
    }
  },
}
```

`nanualChunks`主要有两种配置的方式：

1. 对象

```typescript
// vite.config.ts
{
  build: {
    rollupOptions: {
      output: {
        // manualChunks 配置
        manualChunks: {
          // 将 React 相关库打包成单独的 chunk 中
          'react-vendor': ['react', 'react-dom'],
          // 将 Lodash 库的代码单独打包
          'lodash': ['lodash-es'],
          // 将组件库的代码打包
          'library': ['antd', '@arco-design/web-react'],
        },
      },
    }
  },
}
```

2. 函数

```typescript
// Vite 部分源码
function createMoveToVendorChunkFn(config: ResolvedConfig): GetManualChunk {
  const cache = new Map<string, boolean>()
  // 返回值为 manualChunks 的配置
  return (id, { getModuleInfo }) => {
    // Vite 默认的配置逻辑其实很简单
    // 主要是为了把 Initial Chunk 中的第三方包代码单独打包成`vendor.[hash].js`
    if (
      id.includes('node_modules') &&
      !isCSSRequest(id) &&
      // 判断是否为 Initial Chunk
      staticImportedByEntry(id, getModuleInfo, cache)
    ) {
      return 'vendor'
    }
  }
}
// 对象配置中的第三方拆包逻辑
manualChunks(id) {
  if (id.includes('antd') || id.includes('@arco-design/web-react')) {
    return 'library';
  }
  if (id.includes('lodash')) {
    return 'lodash';
  }
  if (id.includes('react')) {
    return 'react';
  }
}
```

Rollup 会对每一个模块调用 manualChunks 函数，在 manualChunks 的函数入参中你可以拿到`模块 id` 及`模块详情信息`，经过一定的处理后返回 `chunk 文件的名称`，这样当前 id 代表的模块便会打包到你所指定的 chunk 文件中。

如果直接使用函数的方式进行拆包，容易发生循环引用的问题

```typescript
// a.js
import { funcB } from './b.js';

funcB();

export var funcA = () => {
  console.log('a');
} 
// b.js
import { funcA } from './a.js';

funcA();

export var funcB = () => {
  console.log('b')
}
```

- JS 引擎执行 `a.js` 时，发现引入了 `b.js`，于是去执行 `b.js`
- 引擎执行`b.js`，发现里面引入了`a.js`(出现循环引用)，**认为`a.js`已经加载完成**，继续往下执行
- 执行到`funcA()`语句时发现 funcA 并没有定义，于是报错。

![image-20231008222144155](https://s2.loli.net/2023/10/08/3wyVoatuXrciGhW.png)

![image-20231008222223230](https://s2.loli.net/2023/10/08/pkH9wzQm8yZxKF3.png)

报错的原因主要在于react 的依赖，它们可能并没有引入进来。

那我们能不能避免这种问题呢？当然是可以的，之前的 `manualChunks`逻辑过于简单粗暴，仅仅通过路径 id 来决定打包到哪个 chunk 中，而漏掉了间接依赖的情况。如果针对像`object-assign`这种间接依赖，我们也能识别出它属于 react 的依赖，将其自动打包到`react-vendor`中，这样就可以避免循环引用的问题。

解决思路如下：

1. 确定 react 相关包的入口路径
2. 在 manualChunk 中拿到模块的详细信息，向上追溯它的引用者，如果命中 react 的路径，则将模块放到`react-vendor`中

```typescript
// 确定 react 相关包的入口路径
const chunkGroups = {
  'react-vendor': [
    require.resolve('react'),
    require.resolve('react-dom')
  ],
}

// Vite 中的 manualChunks 配置
function manualChunks(id, { getModuleInfo }) { 
  for (const group of Object.keys(chunkGroups)) {
    const deps = chunkGroups[group];
    if (
      id.includes('node_modules') && 
      // 递归向上查找引用者，检查是否命中 chunkGroups 声明的包 
      isDepInclude(id, deps, [], getModuleInfo)
     ) { 
      return group;
    }
  }
}
```

```typescript
// 缓存对象
const cache = new Map();

function isDepInclude (id: string, depPaths: string[], importChain: string[], getModuleInfo): boolean | undefined  {
  const key = `${id}-${depPaths.join('|')}`;
  // 出现循环依赖，不考虑
  if (importChain.includes(id)) {
    cache.set(key, false);
    return false;
  }
  // 验证缓存
  if (cache.has(key)) {
    return cache.get(key);
  }
  // 命中依赖列表
  if (depPaths.includes(id)) {
    // 引用链中的文件都记录到缓存中
    importChain.forEach(item => cache.set(`${item}-${depPaths.join('|')}`, true));
    return true;
  }
  const moduleInfo = getModuleInfo(id);
  if (!moduleInfo || !moduleInfo.importers) {
    cache.set(key, false);
    return false;
  }
  // 核心逻辑，递归查找上层引用者
  const isInclude = moduleInfo.importers.some(
    importer => isDepInclude(importer, depPaths, importChain.concat(id), getModuleInfo)
  );
  // 设置缓存
  cache.set(key, isInclude);
  return isInclude;
};
```

#### 终极解决方案

`vite-plugin-chunk-split`

```typescript
// vite.config.ts
import { chunkSplitPlugin } from 'vite-plugin-chunk-split';

export default {
  chunkSplitPlugin({
    // 指定拆包策略
    customSplitting: {
      // 1. 支持填包名。`react` 和 `react-dom` 会被打包到一个名为`render-vendor`的 chunk 里面(包括它们的依赖，如 object-assign)
      'react-vendor': ['react', 'react-dom'],
      // 2. 支持填正则表达式。src 中 components 和 utils 下的所有文件被会被打包为`component-util`的 chunk 中
      'components-util': [/src\/components/, /src\/utils/]
    }
  })
}
```

### 语法降级与 polyfill

> 联合前端编译工具链，消灭低版本浏览器兼容问题

> 通过 Vite 构建，我们完全可以兼容各种低版本浏览器，打包出既支持现代浏览器又支持旧版浏览器的产物

常用的工具库：

1. babel
2. core-js
3. regenerator-runtime

### 模块联邦：如何实现优雅的跨应用代码共享

#### 模块共享方式

1. 发布 npm 包

   ![image-20231011205401516](https://s2.loli.net/2023/10/11/CqcfAvVKmbolgkn.png)

存在的问题：

- 开发效率，每次改动都需要发版，所有相关的应用安装新依赖，流程比较复杂
- 项目构建，引入了公共库后，公共库的代码都需要打包到项目最后的产物中，导致产物体积偏大，构建速度相对较慢

2. git Submodule

问题和 npm 包类似

3. 依赖外部化（external）+ CDN 引入

可以通过构建工具添加依赖 CDN 地址的方式

存在的问题：

- 兼容性问题。并不是所有的产物都有 UMD 格式的产物。因此这种格式的产物不能覆盖所有的第三方 npm 包

- 依赖顺序问题。第三方库一般也有自己的依赖，我们需要自己处理它们之间的依赖关系，工作量很大

- 产物体积问题。由于依赖包被声明之后，应用在引用 CDN 地址时，会全量引用依赖的代码，这种情况就没有办法通过Tree Shaking来去除无用代码了，会导致应用的性能有所下降

4. Monorepo

![image-20231011205515263](https://s2.loli.net/2023/10/11/FozGjlvx3k6CYSn.png)

对于应用间模块复用的问题，Monorepo 是一种优秀的解决方案，但它也会给团队带来一些挑战：

1. **所有的应用代码必须放到同一个仓库**。如果是旧有项目，并且每个应用使用一个 Git 仓库的情况，那么使用 Monorepo 之后项目架构调整会比较大，也就是说改造成本会相对比较高。
2. Monorepo 本身也存在一些天然的局限性，如项目数量多起来之后依赖安装时间会很久、项目整体构建时间会变长等等，我们也需要去解决这些局限性所带来的的开发效率问题。而这项工作一般需要投入专业的人去解决，如果没有足够的人员投入或者基建的保证，Monorepo 可能并不是一个很好的选择。
3. **项目构建问题**。跟 `发 npm 包`的方案一样，所有的公共代码都需要进入项目的构建流程中，产物体积还是会偏大。

#### MF 核心概念

模块联邦中主要有两种模块：本地模块 & 远程模块

本地模块即为普通模块，是当前构建流程的一部分，而远程模块不属于当前构建流程，在本地模块的运行时进行导入，同时本地模块和远程模块可以共享某些依赖的代码

![image-20231011210448219](https://s2.loli.net/2023/10/11/maIK9XPhprTJ67D.png)

值得强调的是，在模块联邦中，每个模块既可以是`本地模块`，导入其它的`远程模块`，又可以作为远程模块，被其他的模块导入。

![image-20231011210534539](https://s2.loli.net/2023/10/11/DjJCTfgQaSu6q7t.png)

MF的设计优势：

1. **实现任意粒度的模块共享**。这里所指的模块粒度可大可小，包括第三方 npm 依赖、业务组件、工具函数，甚至可以是整个前端应用！而整个前端应用能够共享产物，代表着各个应用单独开发、测试、部署，这也是一种`微前端`的实现。
2. **优化构建产物体积**。远程模块可以从本地模块运行时被拉取，而不用参与本地模块的构建，可以加速构建过程，同时也能减小构建产物。
3. **运行时按需加载**。远程模块导入的粒度可以很小，如果你只想使用 app1 模块的`add`函数，只需要在 app1 的构建配置中导出这个函数，然后在本地模块中按照诸如`import('app1/add')`的方式导入即可，这样就很好地实现了模块按需加载。
4. **第三方依赖共享**。通过模块联邦中的共享依赖机制，我们可以很方便地实现在模块间公用依赖代码，从而避免以往的`external + CDN 引入`方案的各种问题。

实现原理：

- 三大要素：

1. `Host`模块: 即本地模块，用来消费远程模块。
2. `Remote`模块: 即远程模块，用来生产一些模块，并暴露`运行时容器`供本地模块消费。
3. `Shared`依赖: 即共享依赖，用来在本地模块和远程模块中实现第三方依赖的共享。

![image-20231011211800968](https://s2.loli.net/2023/10/11/WxjDUJb8XHviqA3.png)

本地模块设置了`shared: ['vue']`参数之后，当它执行远程模块代码的时候，一旦遇到了引入`vue`的情况，会优先使用本地的 `vue`，而不是远端模块中的`vue`。

![image-20231011211922675](https://s2.loli.net/2023/10/11/LTFsQeuJPZ73kyN.png)

总体的运行流程![image-20231011212420054](https://s2.loli.net/2023/10/11/hAlXxYIGErb5egC.png)

## 进阶

### ESM 高级特性 & Pure ESM

**ESM 已经不仅仅局限于一个模块规范的概念，它代表了前端社区生态的走向以及各项前端基础设施的未来**。不管是浏览器、Node.js 还是 npm 上第三方包生态的发展，无一不在印证这一点。

#### import maps

在浏览器中我们可以使用包含`type="module"`属性的`script`标签来加载 ES 模块，而模块路径主要包含三种:

- 绝对路径，如 `https://cdn.skypack.dev/react`
- 相对路径，如`./module-a`
- `bare import`即直接写一个第三方包名，如`react`、`lodash`

对于前两种模块路径浏览器是原生支持的，而对于 `bare import`，在 Node.js 能直接执行，因为 Node.js 的路径解析算法会从项目的 node_modules 找到第三方包的模块路径，但是放在浏览器中无法直接执行。

浏览器内置的`import map`就可以解决上述的问题

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>

<body>
  <div id="root"></div>
  <script type="importmap">
  {
    "imports": {
      "react": "https://cdn.skypack.dev/react"
    }
  }
  </script>

  <script type="module">
    import React from 'react';
    console.log(React)
  </script>
</body>

</html>
```

它的问题在于兼容性

![image-20231011213754698](https://s2.loli.net/2023/10/11/smXL5OzaSohyMGR.png)

不过社区已经有对应的 polyfill 方案 https://github.com/guybedford/es-module-shims 实现了包括`import map`在内的 ESM 特性，包括：

1. `dynamic import`。即动态导入，部分老版本的 Firefox 和 Edge 不支持。
2. `import.meta`和`import.meta.url`。当前模块的元信息，类似 Node.js 中的 `__dirname`、`__filename`。
3. `modulepreload`。以前我们会在 link 标签中加上 `rel="preload"` 来进行资源预加载，即在浏览器解析 HTML 之前就开始加载资源，现在对于 ESM 也有对应的`modulepreload`来支持这个行为。
4. `JSON Modules`和 `CSS Modules`，即通过如下方式来引入`json`或者`css`:

```html
<script type="module">
// 获取 json 对象
import json from 'https://site.com/data.json' assert { type: 'json' };
// 获取 CSS Modules 对象
import sheet from 'https://site.com/sheet.css' assert { type: 'css' };
</script>
```

这个库是基于 wasm 来实现的，性能并不差：

![image-20231011214151947](https://s2.loli.net/2023/10/11/d9D7Yik2vJFpa4z.png)

#### Nodejs 包导入导出策略

- exports

```typescript
// package.json
{
  "name": "package-a",
  "type": "module",
  "exports": {
    // 默认导出，使用方式: import a from 'package-a'
    ".": "./dist/index.js",
    // 子路径导出，使用方式: import d from 'package-a/dist'
    "./dist": "./dist/index.js",
    "./dist/*": "./dist/*", // 这里可以使用 `*` 导出目录下所有的文件
    // 条件导出，区分 ESM 和 CommonJS 引入的情况
    "./main": {
      "import": "./main.js",
      "require": "./main.cjs"
    },
  }
}
```

条件导出

```typescript
{
  "exports": {
    {
      ".": {
       "node": {
         "import": "./main.js",
         "require": "./main.cjs"
        }     
      }
    }
  },
}
```

- imports

```typescript
{
  "imports": {
    // key 一般以 # 开头
    // 也可以直接赋值为一个字符串: "#dep": "lodash-es"
    "#dep": {
      "node": "lodash-es",
      "default": "./dep-polyfill.js"
    },
  },
  "dependencies": {
    "lodash-es": "^4.17.21"
  }
}
```

```typescript
// index.js
import { cloneDeep } from "#dep";

const obj = { a: 1 };

// { a: 1 }
console.log(cloneDeep(obj));
```

#### Pure ESM

1. npm 包都提供 ESM 产物
2. 废弃非 ESM 的产物

存在的问题：

- commonJS 和 ESM 并不能完全兼容
- 很多基础库都使用了 CommonJS

在 ESM 中无法使用 CommonJS 中的`__dirname`、`__firename`、`require.resolve`等语法，在 CommonJS 中同样无法使用`import.meta`对象

#### 新一代的打包工具 tsup

### 如何对 vite 项目做系统的性能优化

> 主要针对web vitals进行优化

主要优化思路有以下三种：

1. **网络优化**。包括 `HTTP2`、`DNS 预解析`、`Preload`、`Prefetch`等手段。
2. **资源优化**。包括`构建产物分析`、`资源压缩`、`产物拆包`、`按需加载`等优化方式。
3. **预渲染优化**，本文主要介绍`服务端渲染`(SSR)和`静态站点生成`(SSG)两种手段。

#### 网络

1. `vite-plugin-mkcert`，dev 模式开启http2（无 proxy 情况）
2. DNS 预解析，通过两个rel的值来起作用，`preconnect`可以提前建立与服务器的连接，`dns-prefetch`提前解析服务器域名

```html
<link rel="preconnect" href="https://fonts.gstatic.com/" crossorigin>
<link rel="dns-prefetch" href="https://fonts.gstatic.com/">
```

3. Preload/Prefetch

```html
在资源使用前加载
<link rel="preload" href="style.css" as="style">
<link rel="preload" href="main.js" as="script">
原生 esm 可以使用这个
<link rel="modulepreload" href="/src/app.js" />
在浏览器空闲的时候加载
<link rel="prefetch" href="https://B.com/index.js" as="script">
```

#### 资源优化

1. 资源分析报告

为了能可视化地感知到产物的体积情况，推荐大家用`rollup-plugin-visualizer`来进行产物分析

```typescript
// 注: 首先需要安装 rollup-plugin-visualizer 依赖
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      // 打包完成后自动打开浏览器，显示产物体积报告
      open: true,
    }),
  ],
});
```

2. 产物压缩

```typescript
// vite.config.ts
export default {
  build: {
    // 类型: boolean | 'esbuild' | 'terser'
    // 默认为 `esbuild`
    minify: 'esbuild',
    // 产物目标环境
    target: 'modules',
    // 如果 minify 为 terser，可以通过下面的参数配置具体行为
    // https://terser.org/docs/api-reference#minify-options
    terserOptions: {}
  }
}
```

```typescript
// vite 默认的 target 参数
['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1']
```

不同的target 产物会影响压缩工具的压缩算法，因为不同标准能使用的语法是不一样的

3. css 压缩

vite 模式使用 esbuild 进行压缩

4. 图片压缩

使用`vite-plugin-imagemin`进行图片压缩

5. 产物拆包

6. 预渲染

# 源码部分

待补充



