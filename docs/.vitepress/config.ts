import { defineConfig } from 'vitepress'
import type { UserConfig } from 'vitepress'

// Environment-based base path configuration
// GitHub Pages: BASE_URL=/repo-name/ (or auto-detected from GITHUB_REPOSITORY)
// Vercel: BASE_URL=/ (or leave unset)
// Default: /

export function detectBasePath(): string {
  // Priority 1: Explicit BASE_URL environment variable
  if (process.env.BASE_URL) {
    // Ensure it starts with / and ends with /
    const base = process.env.BASE_URL.startsWith('/')
      ? process.env.BASE_URL
      : `/${process.env.BASE_URL}`
    return base.endsWith('/') ? base : `${base}/`
  }

  // Priority 2: GitHub Pages detection
  if (process.env.GITHUB_PAGES === 'true') {
    // Extract repo name from GITHUB_REPOSITORY (format: owner/repo)
    if (process.env.GITHUB_REPOSITORY) {
      const [, repoName] = process.env.GITHUB_REPOSITORY.split('/')
      if (repoName) {
        return `/${repoName}/`
      }
    }
    // Fallback: use HContext as default repo name
    return '/HContext/'
  }

  // Priority 3: Vercel detection (uses root by default)
  if (process.env.VERCEL === '1') {
    return '/'
  }

  // Default: root path for local development
  return '/'
}

const base = detectBasePath()

// Log base path for debugging
console.log(`[VitePress] Base path: ${base}`)
console.log(`[VitePress] Environment: ${process.env.GITHUB_PAGES === 'true' ? 'GitHub Pages' : process.env.VERCEL === '1' ? 'Vercel' : 'Local'}`)

const config: UserConfig = {
  lang: 'zh-CN',
  title: 'HK-hub Tech Blog',
  description: '技术博客与开源文档站',

  // Base path for dual deployment
  base,

  // Source directory
  srcDir: '.',

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

    sidebar: {
      // Will be auto-generated in Phase 2
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/HK-hub' }
    ],

    footer: {
      message: '基于 VitePress 构建',
      copyright: 'Copyright © 2026 HK-hub'
    },

    // Dark mode
    appearance: true
  },

  // Vite configuration
  vite: {
    define: {
      // Make base path available to client code if needed
      __BASE_PATH__: JSON.stringify(base)
    }
  }
}

export default defineConfig(config)