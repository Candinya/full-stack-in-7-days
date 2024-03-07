import { defineConfig } from "vitepress";

export const zh = defineConfig({
  lang: 'zh-Hans',
  
  title: "7天全栈计划",
  description: "挑战自己，用一周的时间走通整套全栈开发的流程",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config

    sidebar: [
      {
        text: '目录',
        collapsed: false,
        link: '/contents/',
        items: [
          { text: '序言', link: '/preface/' },
          { text: 'Day 1 - 初探编程', link: '/what-is-programming/' },
          { text: 'Day 2 - 前端的魅力', link: '/frontend-intro/' },
          { text: 'Day 3 - 我的第一个前端项目', link: '/hello-browser/' },
          { text: 'Day 4 - 神奇后端在哪里', link: '/hello-server/' },
        ]
      }
    ],

    editLink: {
      pattern: 'https://github.com/Candinya/full-stack-in-7-days/edit/master/:path',
      text: '在 GitHub 上编辑此页面'
    },

    footer: {
      message: '基于 <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.zh-hans" target="_blank">CC-BY-SA-4.0</a> 授权',
      copyright: `版权所有 © 2024-${new Date().getFullYear()} Nya Candy`
    },

    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    outline: {
      level: [1,3],
      label: '页面导航'
    },

    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    },

    langMenuLabel: '多语言',
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',

    search: {
      provider: "local",
      options: {
        translations: {
          button: {
            buttonText: "搜索文档",
            buttonAriaLabel: "搜索文档",
          },
          modal: {
            displayDetails: "显示详情",
            resetButtonTitle: "清除查询条件",
            backButtonTitle: "返回",
            noResultsText: "抱歉，暂时没有相关结果",
            footer: {
              selectText: "选择",
              navigateText: "切换",
              closeText: "关闭",
            },
          },
        },
      },
    },
  },
  
})