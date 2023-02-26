---
layout:     post 
title:      "Vue的服务端渲染"
subtitle:   "Vue.js设计与实现读书笔记"
description: "vue服务端渲染与实现方案"
date:       2023-02-26
author:     "kcfuler"
URL: "/2023/02/26/vuejs-ssr/"
categories: [ tech ]
tags: 
    - vue

image:      "https://dogefs.s3.ladydaily.com/~/source/unsplash/photo-1676675356577-ccdb5bec1f0f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1632&q=80"
---

## CSR & SSR

![](https://gb6tpk84yf.feishu.cn/space/api/box/stream/download/asynccode/?code=OGE5NDczN2ZjOTM0NGEzMmFkZjg5ODRjNDM2MDU0YWFfcnJRcFFQbzE1bWNqZFkyVzJ0WkQ2MExvZVpNRFlveFlfVG9rZW46Ym94Y25POHRhbU5TbHJFM2V5VzhMdkZEUHRiXzE2Nzc0MDMxOTc6MTY3NzQwNjc5N19WNA)

## 同构

实际上，同构渲染中的首次渲染与 SSR 的工作流程是一致的。也就是说，当首次访问或者刷新页面时，整个页面的内容是在服务端完成渲染的，浏览器最终得到的是渲染好的 HTML 页面。但是该页面是纯静态的，这意味着用户还不能与页面进行任何交互，因为整个应用程序的脚本还没有加载和执行。另外，该静态的 HTML 页面中也会包含 <link>、<script> 等标签。除此之外，同构渲染所产生的 HTML 页面与 SSR 所产生的 HTML 页面有一点最大的不同，即前者会包含当前页面所需要的初始化数据。直白地说，服务器通过 API 请求的数据会被序列化为字符串，并拼接到静态的 HTML 字符串中，最后一并发送给浏览器。这么做实际上是为了后续的激活操作，后文会详细讲解。

假设浏览器已经接收到初次渲染的静态 HTML 页面，接下来浏览器会解析并渲染该页面。在解析过程中，浏览器会发现 HTML 代码中存在 <link> 和 <script> 标签，于是会从 CDN 或服务器获取相应的资源，这一步与 CSR 一致。当JavaScript 资源加载完毕后，会进行激活操作，这里的激活就是我们在 Vue.js 中常说的 “hydration”。激活包含两部分工作内容。

-   Vue.js 在当前页面已经渲染的 DOM 元素以及 Vue.js 组件所渲染的虚拟 DOM 之间建立联系。
    
-   Vue.js 从 HTML 页面中提取由服务端序列化后发送过来的数据，用以初始化整个Vue.js 应用程序。
    

激活完成后，整个应用程序已经完全被 Vue.js 接管为 CSR 应用程序了。后续操作都会按照 CSR 应用程序的流程来执行。当然，如果刷新页面，仍然会进行服务端渲染，然后再进行激活，如此往复。

表 18-2　SSR、CSR 和同构渲染之间的对比

![](https://gb6tpk84yf.feishu.cn/space/api/box/stream/download/asynccode/?code=MzM4MWU1ZjM1YzRhNDMyY2M0ZmZjZjRhMjdhYjBkMGFfbFp1QXBwbEd0T3U2OUdLMDBlVWkxZU1EVVhKV0ZsMW1fVG9rZW46Ym94Y24zSXMxdnREU3AwZ2NBbXczcWxSTU5oXzE2Nzc0MDMxOTc6MTY3NzQwNjc5N19WNA)

另外，对同构渲染最多的误解是，它能够提升**可交互时间（TTI）**。事实是同构渲染仍然需要像 CSR 那样等待 JavaScript 资源加载完成，并且客户端激活完成后，才能响应用户操作。因此，理论上同构渲染无法提升可交互时间。

## 总结

  

我们讨论了 Vue.js 是如何把虚拟节点渲染为字符串的。以普通标签节点为例，在将其渲染为字符串时，要考虑以下内容。

-   自闭合标签的处理。对于自闭合标签，无须为其渲染闭合标签部分，也无须处理其子节点。
    
-   属性名称的合法性，以及属性值的转义。
    
-   文本子节点的转义。具体的转义规则如下。
    
-   对于普通内容，应该对文本中的以下字符进行转义。○将字符 & 转义为实体 &amp;。○将字符 < 转义为实体 &lt;。○将字符 > 转义为实体 &gt;。
    
-   对于属性值，除了上述三个字符应该转义之外，还应该转义下面两个字符。○将字符 " 转义为实体 &quot;。○将字符 ' 转义为实体 &#39;
    

然后，我们讨论了如何将组件渲染为 HTML 字符串。在服务端渲染组件与渲染普通标签并没有本质区别。我们只需要通过执行组件的 render 函数，得到该组件所渲染的 subTree 并将其渲染为 HTML 字符串即可。另外，在渲染组件时，需要考虑以下几点。

-   服务端渲染不存在数据变更后的重新渲染，所以无须调用 reactive 函数对 data 等数据进行包装，也无须使用 shallowReactive 函数对 props 数据进行包装。正因如此，我们也无须调用 beforeUpdate 和 updated 钩子。
    
-   服务端渲染时，由于不需要渲染真实 DOM 元素，所以无须调用组件的beforeMount 和 mounted 钩子。
    

之后，我们讨论了客户端激活的原理。在同构渲染过程中，组件的代码会分别在服务端和浏览器中执行一次。在服务端，组件会被渲染为静态的 HTML 字符串，并发送给浏览器。浏览器则会渲染由服务端返回的静态的 HTML 内容，并下载打包在静态资源中的组件代码。当下载完毕后，浏览器会解释并执行该组件代码。当组件代码在客户端执行时，由于页面中已经存在对应的 DOM 元素，所以渲染器并不会执行创建 DOM 元素的逻辑，而是会执行激活操作。激活操作可以总结为两个步骤。

-   在虚拟节点与真实 DOM 元素之间建立联系，即 vnode.el = el。这样才能保证后续更新程序正确运行。
    
-   为 DOM 元素添加事件绑定。最后，我们讨论了如何编写同构的组件代码。由于组件代码既运行于服务端，也运行于客户端，所以当我们编写组件代码时要额外注意。具体可以总结为以下几点。
    
-   注意组件的生命周期。beforeUpdate、updated、beforeMount、mounted、beforeUnmount、unmounted 等生命周期钩子函数不会在服务端执行。
    
-   使用跨平台的 API。由于组件的代码既要在浏览器中运行，也要在服务器中运行，所以编写组件代码时，要额外注意代码的跨平台性。通常我们在选择第三方库的时候，会选择支持跨平台的库，例如使用 Axios 作为网络请求库。
    
-   特定端的实现。无论在客户端还是在服务端，都应该保证功能的一致性。例如，组件需要读取 cookie 信息。在客户端，我们可以通过 document.cookie 来实现读取；而在服务端，则需要根据请求头来实现读取。所以，很多功能模块需要我们为客户端和服务端分别实现。
    
-   避免交叉请求引起的状态污染。状态污染既可以是应用级的，也可以是模块级的。对于应用，我们应该为每一个请求创建一个独立的应用实例。对于模块，我们应该避免使用模块级的全局变量。这是因为在不做特殊处理的情况下，多个请求会共用模块级的全局变量，造成请求间的交叉污染。
    
-   仅在客户端渲染组件中的部分内容。这需要我们自行封装 <ClientOnly> 组件，被该组件包裹的内容仅在客户端才会被渲染。