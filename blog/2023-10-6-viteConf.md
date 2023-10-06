---
slug: viteConf简记
title: viteConf简记
authors: kcfuler
tags: [vite]
---

# viteConf简记

## Evan you

### state of vite

#### 4.0

- rollup 3.0
- swc

#### 4.2

- source-map debug improvement

#### 4.3

- performance improvement

#### 4.4

- Experimental Lightning CSS support
- Solid and Qwik templates in create-vite

#### 5.0(bate)

- node 18
- CommonJS API deprecated

#### mission

The shared **foundation** for higher-level innovations in the web ecosystem

#### vite's Philosophy

- Lean and Extensible Core
- Push for the Modern Web
- A Pragmatic Approach to Performance
- Support Higher-Level Frameworks
- Foster a Collaborative Ecosystem

### Next

#### Current Problems of Vite

> vite is far from perfect

- Relatively slow production build speed
- Inconsistency between dev & prod environments
- Network overhead of unbundled ESM during dev
- Confusing SSR externals issues
- Limited control over chunk splitting
- Lack of first-party Module Federation support

#### challenges

- Most issues need to be resolved at the bundler level
- esbuild(or bun) is extremely fast, but:
  - very limited control for build asset optimization
  - Plugin API not flexible enough
- Rollup is mature and flexible, but:
  - Still slow compared to native bundlers
  - Handling of ESM/CJS interop can be improved
- Two bundlers that cannot fully replace one another, and with subtle behavior inconsistencies

### Rolldown

> a rust port of Rollup

- focus: performance with best-effort compatibility with Rollup
- Goal: switch to it in Vite with minimal impact on end users

#### state

![image-20231006121545472](https://s2.loli.net/2023/10/06/YHueZR4nmIdocwA.png)

#### Roadmap

1. basic bundling

   replace esbuild for dependency pre-bundling

   - CommonJS & Faux-ESM compatibility

2. Advanced Bundling

   - rollup feature parity
     - plugin compatibility
     - tree-shaking
     - Advanced Chunk-splitting control

3. Build-in Transforms

   - TS
   - JSX
   - Minification
   - Syntax lowering

4. Rustify Vite

   - Rolldown exposing plugin container as API
   - Vite introducing a Rust core , Rolldown as dependency
   - Rustify perf critical Vite internal pugins & ssrLoadModule transform
   - Full-bundle mode alternative to unbundled ESM

   后面的主要就是看兴趣来了。一个个写下来比较费时间。

   

## Dr. Lukas

> maintainer of RollupJS

### main complaint

- speed
- memory comsuption

![image-20231006141021957](https://s2.loli.net/2023/10/06/yIMGUQu6aitWeZc.png)

![image-20231006141323621](https://s2.loli.net/2023/10/06/vqgH5rNI3RTCzWo.png)

`rolldown`这个名字确实搞😂

![image-20231006142117800](https://s2.loli.net/2023/10/06/NAVdQzUkwhT8OI6.png)

## Design System

### Figma - Emil sjolander

> Bringing developers into the design process -- figma

![image-20231006144224773](https://s2.loli.net/2023/10/06/opExiR3GMzSDfdh.png)

#### problems

1. design software is not built for devs
2. Designs don't easily translate to code
3. miscommunication leads to mistakes

> nothing great made alone

### Storybook - Jeppe Reinholt

> Storybook & Vite: It Keeps Getting Better

## Framework

### unjs - Pooya Parsa

> State of Nitro 2023

![image-20231006150714710](https://s2.loli.net/2023/10/06/zpOq6at8y5WmxI3.png)

### vitest

...



