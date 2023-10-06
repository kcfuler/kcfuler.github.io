import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/__docusaurus/debug',
    component: ComponentCreator('/__docusaurus/debug', 'fd1'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/config',
    component: ComponentCreator('/__docusaurus/debug/config', 'c6e'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/content',
    component: ComponentCreator('/__docusaurus/debug/content', '070'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/globalData',
    component: ComponentCreator('/__docusaurus/debug/globalData', 'eec'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/metadata',
    component: ComponentCreator('/__docusaurus/debug/metadata', 'e1a'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/registry',
    component: ComponentCreator('/__docusaurus/debug/registry', '4dd'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/routes',
    component: ComponentCreator('/__docusaurus/debug/routes', '95c'),
    exact: true
  },
  {
    path: '/blog',
    component: ComponentCreator('/blog', '38b'),
    exact: true
  },
  {
    path: '/blog/23-9月总结',
    component: ComponentCreator('/blog/23-9月总结', 'b08'),
    exact: true
  },
  {
    path: '/blog/archive',
    component: ComponentCreator('/blog/archive', '52b'),
    exact: true
  },
  {
    path: '/blog/blog再构建',
    component: ComponentCreator('/blog/blog再构建', 'aa7'),
    exact: true
  },
  {
    path: '/blog/react18如何提高应用性能',
    component: ComponentCreator('/blog/react18如何提高应用性能', '99e'),
    exact: true
  },
  {
    path: '/blog/tags',
    component: ComponentCreator('/blog/tags', 'b5e'),
    exact: true
  },
  {
    path: '/blog/tags/plan',
    component: ComponentCreator('/blog/tags/plan', 'fc1'),
    exact: true
  },
  {
    path: '/blog/tags/react',
    component: ComponentCreator('/blog/tags/react', '273'),
    exact: true
  },
  {
    path: '/blog/tags/travel',
    component: ComponentCreator('/blog/tags/travel', '5dd'),
    exact: true
  },
  {
    path: '/blog/tags/trifling',
    component: ComponentCreator('/blog/tags/trifling', '703'),
    exact: true
  },
  {
    path: '/blog/tags/vite',
    component: ComponentCreator('/blog/tags/vite', '9b3'),
    exact: true
  },
  {
    path: '/blog/viteConf简记',
    component: ComponentCreator('/blog/viteConf简记', 'f66'),
    exact: true
  },
  {
    path: '/blog/国庆游',
    component: ComponentCreator('/blog/国庆游', 'dd3'),
    exact: true
  },
  {
    path: '/markdown-page',
    component: ComponentCreator('/markdown-page', '89b'),
    exact: true
  },
  {
    path: '/docs',
    component: ComponentCreator('/docs', '37f'),
    routes: [
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
        path: '/docs/devOps/概览',
        component: ComponentCreator('/docs/devOps/概览', 'd29'),
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
        path: '/docs/web前端/JavaScript/垃圾回收机制',
        component: ComponentCreator('/docs/web前端/JavaScript/垃圾回收机制', 'abf'),
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
        path: '/docs/web前端/概览',
        component: ComponentCreator('/docs/web前端/概览', 'd6b'),
        exact: true,
        sidebar: "Records"
      },
      {
        path: '/docs/概述',
        component: ComponentCreator('/docs/概述', '93c'),
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
        path: '/docs/算法/面试经典150题',
        component: ComponentCreator('/docs/算法/面试经典150题', 'd2e'),
        exact: true,
        sidebar: "Records"
      },
      {
        path: '/docs/阅读/思考，快与慢',
        component: ComponentCreator('/docs/阅读/思考，快与慢', 'f99'),
        exact: true,
        sidebar: "Records"
      }
    ]
  },
  {
    path: '/',
    component: ComponentCreator('/', 'a40'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
