import React from 'react'

export type FeatureItem = {
  title: string;
  link: string;
  Svg: React.ComponentType<React.ComponentProps<"svg">>;
  description: JSX.Element;
};

export const FeatureList: FeatureItem[] = [
  {
    title: "Odin",
    Svg: require("@site/static/img/undraw_docusaurus_mountain.svg").default,
    link: 'https://odin.neuqer.com/',
    description: (
      <>
        一个低代码平台，使用vue、vite、js开发，实现了可视化拖动、预览、模板复用等功能
      </>
    ),
  },
  {
    title: "Byte-掘金",
    Svg: require("@site/static/img/undraw_docusaurus_tree.svg").default,
    link: '',
    description: (
      <>
        基于nextjs、react、ts开发的仿掘金网站，实现了掘金网站的部分功能         
      </>
    ),
  },
];
