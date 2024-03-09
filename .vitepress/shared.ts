import { defineConfig } from "vitepress";

export const shared = defineConfig({
  lastUpdated: true,
  cleanUrls: true,

  markdown: {
    math: true,
    lineNumbers: true,
  },

  base: '/full-stack-in-7-days/',

  ignoreDeadLinks: [
    // ignore all localhost links
    /^https?:\/\/localhost/,
  ],

  themeConfig: {

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Candinya/full-stack-in-7-days' }
    ],

    search: {
      provider: "local",
    },
  },
})