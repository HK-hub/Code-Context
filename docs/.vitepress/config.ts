import { defineConfig } from 'vitepress'
import type { UserConfig } from 'vitepress'

const config: UserConfig = {
  lang: 'zh-CN',
  title: 'HK-hub Tech Blog',
  description: '技术博客与开源文档站',

  // Base path - will be configured from environment in Plan 04
  base: '/',

  // Markdown configuration
  // Math support will be enabled in Phase 5 with markdown-it-mathjax3
  markdown: {
    lineNumbers: true
  },

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '博客', link: '/blog/' },
      { text: 'AI', link: '/ai/' },
      { text: '后端', link: '/backend/' },
      { text: '项目', link: '/projects/' }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/HK-hub' }
    ],

    footer: {
      message: '基于 VitePress 构建',
      copyright: 'Copyright © 2026 HK-hub'
    },

    // Dark mode
    appearance: true
  }
}

export default defineConfig(config)