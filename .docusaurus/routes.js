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
    component: ComponentCreator('/blog', 'da2'),
    exact: true
  },
  {
    path: '/blog/archive',
    component: ComponentCreator('/blog/archive', '52b'),
    exact: true
  },
  {
    path: '/blog/react18如何提高应用性能',
    component: ComponentCreator('/blog/react18如何提高应用性能', '1e8'),
    exact: true
  },
  {
    path: '/blog/tags',
    component: ComponentCreator('/blog/tags', 'b5e'),
    exact: true
  },
  {
    path: '/blog/tags/react',
    component: ComponentCreator('/blog/tags/react', 'f79'),
    exact: true
  },
  {
    path: '/markdown-page',
    component: ComponentCreator('/markdown-page', '89b'),
    exact: true
  },
  {
    path: '/docs',
    component: ComponentCreator('/docs', '1ce'),
    routes: [
      {
        path: '/docs/category/sre学习',
        component: ComponentCreator('/docs/category/sre学习', '2af'),
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
        path: '/docs/devOps/rust入门篇',
        component: ComponentCreator('/docs/devOps/rust入门篇', 'eca'),
        exact: true,
        sidebar: "Records"
      },
      {
        path: '/docs/devOps/rust自动化测试',
        component: ComponentCreator('/docs/devOps/rust自动化测试', '8d0'),
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
        path: '/docs/web前端/ts学习',
        component: ComponentCreator('/docs/web前端/ts学习', '2c7'),
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
