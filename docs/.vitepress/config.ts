import { defineConfig } from 'vitepress'
import type { UserConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import { sidebar } from './sidebar/index'

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
    // Fallback: use code-context as default repo name
    return '/code-context/'
  }

  // Priority 3: Vercel detection (uses root by default)
  if (process.env.VERCEL === '1') {
    return '/'
  }

  // Default: root path for local development
  return '/'
}

const base = detectBasePath()

// Determine hostname for sitemap and canonical URLs
const hostname = process.env.GITHUB_PAGES === 'true'
  ? 'https://hk-hub.github.io/code-context'
  : process.env.VERCEL === '1'
    ? 'https://code-context.vercel.app'
    : 'http://localhost:5173'

// Log base path for debugging
console.log(`[VitePress] Base path: ${base}`)
console.log(`[VitePress] Environment: ${process.env.GITHUB_PAGES === 'true' ? 'GitHub Pages' : process.env.VERCEL === '1' ? 'Vercel' : 'Local'}`)

const config: UserConfig = {
  // Site-level configuration
  lang: 'zh-CN',
  title: '码出意境',
  titleTemplate: true,
  description: 'Code Context - 技术博客与开源文档站，专注于后端、AI、全栈领域技术分享',

  // Base path for dual deployment
  base,

  // Source directory (relative to .vitepress/config.ts)
  srcDir: '.',

  // Exclude files from being processed
  srcExclude: ['**/README.md', '**/TODO.md'],

  // Clean URLs (remove .html extension)
  // Note: Requires server support, disable for local dev testing
  // cleanUrls: true,

  // Enable last updated timestamp from Git
  lastUpdated: true,

  // Extract metadata to separate chunk for better caching
  metaChunk: true,

  // SEO: Sitemap generation
  sitemap: {
    hostname: hostname.replace(/\/$/, '')
  },

  // Global head tags for SEO
  head: [
    // Open Graph
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: '码出意境' }],
    ['meta', { property: 'og:title', content: '码出意境 | Code Context' }],
    ['meta', { property: 'og:description', content: '技术博客与开源文档站，专注于后端、AI、全栈领域技术分享' }],
    ['meta', { property: 'og:image', content: `${hostname}/logo.svg` }],

    // Twitter Card
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: '码出意境' }],
    ['meta', { name: 'twitter:description', content: 'Code Context - 技术博客与开源文档站' }],

    // SEO Meta
    ['meta', { name: 'keywords', content: '码出意境, Code Context, 技术博客, 后端开发, 人工智能, 全栈开发, Java, Python, Vue, VitePress' }],
    ['meta', { name: 'author', content: 'HK-hub' }],

    // Favicon
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],

    // Preconnect for performance
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }]
  ],

  // Markdown configuration
  markdown: {
    lineNumbers: true,
    // Math support (MathJax)
    math: true,
    // Image lazy loading
    image: {
      lazyLoading: true
    }
  },

  // Theme configuration
  themeConfig: {
    // Logo
    logo: '/logo.svg',
    // Dark mode logo
    logoLink: '/',

    // Site title in nav bar
    siteTitle: '码出意境',

    // Navigation
    nav: [
      { text: '博客', link: '/blog/' },
      { text: 'AI', link: '/ai/' },
      { text: '后端', link: '/backend/' },
      { text: '书籍', link: '/books/' },
      {
        text: '项目',
        items: [
          { text: 'Demos', link: '/projects/demos/' },
          { text: 'Experiments', link: '/projects/experiments/' },
          { text: 'HContext', link: '/projects/hcontext/' },
          { text: '开源项目', link: '/projects/opensource/' },
          { text: '工具', link: '/projects/tools/' }
        ]
      },
      {
        text: '归档',
        items: [
          { text: '分类', link: '/categories' },
          { text: '归档', link: '/archives' }
        ]
      },
      {
        text: '关于',
        items: [
          { text: '我的信息', link: '/about/me' },
          { text: '友链站点', link: '/about/friends' },
          { text: '更新日志', link: '/about/changelog' }
        ]
      }
    ],

    // Sidebar (auto-generated)
    sidebar,

    // Outline (right-side table of contents)
    outline: {
      level: [2, 3],
      label: '目录'
    },

    // Previous/Next page links
    docFooter: {
      prev: '上一篇',
      next: '下一篇'
    },

    // Social links
    socialLinks: [
      { icon: 'github', link: 'https://github.com/HK-hub' }
    ],

    // Footer
    footer: {
      message: '基于 <a href="https://vitepress.dev" target="_blank">VitePress</a> 构建',
      copyright: 'Copyright © 2026-present <a href="https://github.com/HK-hub" target="_blank">HK-hub</a> | 码出意境'
    },

    // Edit link
    editLink: {
      pattern: 'https://github.com/HK-hub/code-context/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    },

    // Last updated text
    lastUpdatedText: '最后更新',

    // External link icon
    externalLinkIcon: true,

    // Return to top label (mobile)
    returnToTopLabel: '返回顶部',

    // Sidebar menu label (mobile)
    sidebarMenuLabel: '菜单',

    // Dark mode switch label
    darkModeSwitchLabel: '切换主题',

    // Dark mode
    appearance: true,

    // Local search (MiniSearch)
    search: {
      provider: 'local',
      options: {
        // MiniSearch 配置 - 优化中文搜索
        miniSearch: {
          options: {
            // 分词：支持中英文混合
            tokenize: (text: string) => {
              // 中文按字符分割，英文按空格分割
              const chineseTokens = text.match(/[\u4e00-\u9fa5]+/g) || []
              const englishTokens = text.toLowerCase().match(/[a-z0-9]+/g) || []
              return [...chineseTokens, ...englishTokens]
            },
            // 术语处理：统一转为小写
            processTerm: (term: string) => term.toLowerCase()
          },
          // 搜索选项：模糊搜索 + 权重提升
          searchOptions: {
            fuzzy: 0.2, // 允许20%模糊匹配
            prefix: true, // 支持前缀匹配
            boost: {
              title: 4, // 标题权重最高
              text: 2, // 正文权重次之
              titles: 1 // 其他标题权重最低
            }
          }
        },
        // 中文界面翻译
        translations: {
          button: {
            buttonText: '搜索文档',
            buttonAriaLabel: '搜索文档'
          },
          modal: {
            noResultsText: '没有找到相关结果',
            resetButtonTitle: '清除查询条件',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭'
            }
          }
        }
      }
    }
  },

  // Vite configuration
  vite: {
    define: {
      // Make base path available to client code if needed
      __BASE_PATH__: JSON.stringify(base)
    }
  },

  // Mermaid configuration
  mermaid: {
    startOnLoad: true,
    theme: 'default'
  }
}

// Export with mermaid support
export default withMermaid(defineConfig(config))