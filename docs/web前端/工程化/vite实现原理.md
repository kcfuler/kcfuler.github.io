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

