import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/blog',
    component: ComponentCreator('/blog', 'b3f'),
    exact: true
  },
  {
    path: '/blog/archive',
    component: ComponentCreator('/blog/archive', '52b'),
    exact: true
  },
  {
    path: '/blog/first-blog-post',
    component: ComponentCreator('/blog/first-blog-post', '8a9'),
    exact: true
  },
  {
    path: '/blog/long-blog-post',
    component: ComponentCreator('/blog/long-blog-post', '83f'),
    exact: true
  },
  {
    path: '/blog/mdx-blog-post',
    component: ComponentCreator('/blog/mdx-blog-post', 'fdd'),
    exact: true
  },
  {
    path: '/blog/tags',
    component: ComponentCreator('/blog/tags', 'b5e'),
    exact: true
  },
  {
    path: '/blog/tags/docusaurus',
    component: ComponentCreator('/blog/tags/docusaurus', '47b'),
    exact: true
  },
  {
    path: '/blog/tags/facebook',
    component: ComponentCreator('/blog/tags/facebook', 'c92'),
    exact: true
  },
  {
    path: '/blog/tags/hello',
    component: ComponentCreator('/blog/tags/hello', '7a3'),
    exact: true
  },
  {
    path: '/blog/tags/hola',
    component: ComponentCreator('/blog/tags/hola', 'a00'),
    exact: true
  },
  {
    path: '/blog/welcome',
    component: ComponentCreator('/blog/welcome', 'e39'),
    exact: true
  },
  {
    path: '/markdown-page',
    component: ComponentCreator('/markdown-page', '89b'),
    exact: true
  },
  {
    path: '/docs',
    component: ComponentCreator('/docs', '3b0'),
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
        path: '/docs/intro',
        component: ComponentCreator('/docs/intro', 'e8a'),
        exact: true,
        sidebar: "Records"
      },
      {
        path: '/docs/SRE/概览',
        component: ComponentCreator('/docs/SRE/概览', '441'),
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
