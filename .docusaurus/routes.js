import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/__docusaurus/debug',
    component: ComponentCreator('/__docusaurus/debug', '7e1'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/config',
    component: ComponentCreator('/__docusaurus/debug/config', 'f73'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/content',
    component: ComponentCreator('/__docusaurus/debug/content', '32d'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/globalData',
    component: ComponentCreator('/__docusaurus/debug/globalData', '826'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/metadata',
    component: ComponentCreator('/__docusaurus/debug/metadata', '4cd'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/registry',
    component: ComponentCreator('/__docusaurus/debug/registry', '3d0'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/routes',
    component: ComponentCreator('/__docusaurus/debug/routes', '7ad'),
    exact: true
  },
  {
    path: '/blog',
    component: ComponentCreator('/blog', 'f31'),
    exact: true
  },
  {
    path: '/blog/23-9月总结',
    component: ComponentCreator('/blog/23-9月总结', 'cb4'),
    exact: true
  },
  {
    path: '/blog/国庆游',
    component: ComponentCreator('/blog/国庆游', '92c'),
    exact: true
  },
  {
    path: '/blog/archive',
    component: ComponentCreator('/blog/archive', '005'),
    exact: true
  },
  {
    path: '/blog/blog再构建',
    component: ComponentCreator('/blog/blog再构建', '67e'),
    exact: true
  },
  {
    path: '/blog/react18如何提高应用性能',
    component: ComponentCreator('/blog/react18如何提高应用性能', '2ae'),
    exact: true
  },
  {
    path: '/blog/tags',
    component: ComponentCreator('/blog/tags', '599'),
    exact: true
  },
  {
    path: '/blog/tags/plan',
    component: ComponentCreator('/blog/tags/plan', '5b7'),
    exact: true
  },
  {
    path: '/blog/tags/react',
    component: ComponentCreator('/blog/tags/react', '7f8'),
    exact: true
  },
  {
    path: '/blog/tags/travel',
    component: ComponentCreator('/blog/tags/travel', '1c2'),
    exact: true
  },
  {
    path: '/blog/tags/trifling',
    component: ComponentCreator('/blog/tags/trifling', '390'),
    exact: true
  },
  {
    path: '/blog/tags/vite',
    component: ComponentCreator('/blog/tags/vite', 'a29'),
    exact: true
  },
  {
    path: '/blog/viteConf简记',
    component: ComponentCreator('/blog/viteConf简记', 'f21'),
    exact: true
  },
  {
    path: '/markdown-page',
    component: ComponentCreator('/markdown-page', '4fe'),
    exact: true
  },
  {
    path: '/docs',
    component: ComponentCreator('/docs', 'ba3'),
    routes: [
      {
        path: '/docs/概述',
        component: ComponentCreator('/docs/概述', '93c'),
        exact: true,
        sidebar: "Records"
      },
      {
        path: '/docs/算法/面试经典150题',
        component: ComponentCreator('/docs/算法/面试经典150题', 'd2e'),
        exact: true,
        sidebar: "Records"
      },
      {
        path: '/docs/算法/算法基础模板',
        component: ComponentCreator('/docs/算法/算法基础模板', '365'),
        exact: true,
        sidebar: "Records"
      },
      {
        path: '/docs/阅读/思考，快与慢',
        component: ComponentCreator('/docs/阅读/思考，快与慢', 'f99'),
        exact: true,
        sidebar: "Records"
      },
      {
        path: '/docs/category/算法学习',
        component: ComponentCreator('/docs/category/算法学习', '913'),
        exact: true,
        sidebar: "Records"
      },
      {
        path: '/docs/category/阅读',
        component: ComponentCreator('/docs/category/阅读', 'd4a'),
        exact: true,
        sidebar: "Records"
      },
      {
        path: '/docs/category/devops学习',
        component: ComponentCreator('/docs/category/devops学习', '224'),
        exact: true,
        sidebar: "Records"
      },
      {
        path: '/docs/category/web前端',
        component: ComponentCreator('/docs/category/web前端', '218'),
        exact: true,
        sidebar: "Records"
      },
      {
        path: '/docs/devOps/概览',
        component: ComponentCreator('/docs/devOps/概览', 'd29'),
        exact: true,
        sidebar: "Records"
      },
      {
        path: '/docs/devOps/rust/rust入门篇',
        component: ComponentCreator('/docs/devOps/rust/rust入门篇', '966'),
        exact: true,
        sidebar: "Records"
      },
      {
        path: '/docs/devOps/rust/rust自动化测试',
        component: ComponentCreator('/docs/devOps/rust/rust自动化测试', '85d'),
        exact: true,
        sidebar: "Records"
      },
      {
        path: '/docs/web前端/概览',
        component: ComponentCreator('/docs/web前端/概览', 'd6b'),
        exact: true,
        sidebar: "Records"
      },
      {
        path: '/docs/web前端/工程化/ts学习',
        component: ComponentCreator('/docs/web前端/工程化/ts学习', 'b84'),
        exact: true,
        sidebar: "Records"
      },
      {
        path: '/docs/web前端/工程化/vite实现原理',
        component: ComponentCreator('/docs/web前端/工程化/vite实现原理', '6f1'),
        exact: true,
        sidebar: "Records"
      },
      {
        path: '/docs/web前端/工程化/webpack实现原理',
        component: ComponentCreator('/docs/web前端/工程化/webpack实现原理', '997'),
        exact: true,
        sidebar: "Records"
      },
      {
        path: '/docs/web前端/JavaScript/垃圾回收机制',
        component: ComponentCreator('/docs/web前端/JavaScript/垃圾回收机制', 'abf'),
        exact: true,
        sidebar: "Records"
      },
      {
        path: '/docs/web前端/JavaScript/JS内置数据结构',
        component: ComponentCreator('/docs/web前端/JavaScript/JS内置数据结构', '982'),
        exact: true,
        sidebar: "Records"
      },
      {
        path: '/docs/web前端/UI框架/React与Vue的响应式原理',
        component: ComponentCreator('/docs/web前端/UI框架/React与Vue的响应式原理', '813'),
        exact: true,
        sidebar: "Records"
      },
      {
        path: '/docs/web前端/W3C/二进制数据、文件',
        component: ComponentCreator('/docs/web前端/W3C/二进制数据、文件', '92d'),
        exact: true,
        sidebar: "Records"
      },
      {
        path: '/docs/web前端/W3C/浏览器存储',
        component: ComponentCreator('/docs/web前端/W3C/浏览器存储', '81d'),
        exact: true,
        sidebar: "Records"
      },
      {
        path: '/docs/web前端/W3C/网络请求',
        component: ComponentCreator('/docs/web前端/W3C/网络请求', 'e5c'),
        exact: true,
        sidebar: "Records"
      },
      {
        path: '/docs/web前端/W3C/Frame和window',
        component: ComponentCreator('/docs/web前端/W3C/Frame和window', 'c64'),
        exact: true,
        sidebar: "Records"
      },
      {
        path: '/docs/web前端/W3C/web_component',
        component: ComponentCreator('/docs/web前端/W3C/web_component', 'e45'),
        exact: true,
        sidebar: "Records"
      }
    ]
  },
  {
    path: '/',
    component: ComponentCreator('/', 'd3b'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
