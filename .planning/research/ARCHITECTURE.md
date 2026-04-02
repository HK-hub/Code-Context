# Architecture Patterns: VitePress Blog/Documentation System

**Domain:** VitePress Static Site Generator (Vue 3 + Vite)
**Researched:** 2026-04-02
**Confidence:** HIGH (based on official docs patterns, community best practices, and 2025-2026 ecosystem trends)

## Recommended Architecture

### Directory Structure Overview

```
.vitepress/
├── config.ts              # Main site configuration
├── config.mts             # ESM TypeScript config (recommended 2025+)
├── theme/                 # Custom theme components
│   ├── index.ts           # Theme entry point (REQUIRED)
│   ├── Layout.vue         # Root layout component (REQUIRED)
│   ├── components/        # Reusable Vue components
│   │   ├── Giscus.vue     # GitHub Discussions comments
│   │   ├── Archives.vue   # Archive timeline view
│   │   ├── BackTop.vue    # Back to top button
│   │   ├── ProgressBar.vue # Reading progress indicator
│   │   ├── PostList.vue   # Article listing component
│   │   ├── Tags.vue       # Tag cloud/filter
│   │   └── Pagination.vue # Page navigation
│   ├── composables/       # Vue Composition API hooks
│   │   ├── useSidebar.ts  # Sidebar state management
│   │   ├── useArchive.ts  # Archive data transformation
│   │   └── useProgress.ts # Scroll progress tracking
│   └── styles/
│       ├── vars.css       # CSS custom properties
│       └── custom.css     # Blog-specific styles
├── utils/                 # Data loading and utilities
│   └── posts.data.ts      # createContentLoader for posts
└── scripts/               # Build automation scripts
    ├── generateSidebar.ts # Auto-generate navigation
    ├── generateArchive.ts # Build archive data files
    └── generateRSS.ts     # RSS feed generation

docs/                      # Content root
├── index.md              # Homepage
├── blog/                 # Blog posts
│   ├── 2026/
│   │   ├── 01/
│   │   │   └── hello-world.md
│   │   └── 02/
│   │       └── advanced-topic.md
│   └── 2025/
├── ai/                   # AI-related content
├── backend/              # Backend development content
├── projects/             # Project documentation
└── archives/             # Archive index pages

public/                   # Static assets
├── images/
├── fonts/
└── favicon.ico

.github/
└── workflows/
    ├── deploy-github-pages.yml  # GitHub Pages deployment
    └── deploy-vercel.yml        # Vercel deployment
```

## Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **VitePress Core** | Static site generation, routing, Markdown processing | Theme, Scripts, Config |
| **Theme (Layout.vue)** | Page structure, slots injection | Components, Composables, DefaultTheme |
| **Custom Components** | UI elements (Giscus, Archives, BackTop, ProgressBar) | Layout, Composables, Data |
| **Composables** | Shared reactive logic, data transformation | Components, Utils |
| **Data Loaders (posts.data.ts)** | Content scanning, frontmatter extraction, sorting | Components, Build process |
| **Build Scripts** | Sidebar generation, RSS feed, archive data | VitePress hooks (buildEnd), File system |
| **CI/CD Workflows** | Build and deploy automation | Build output, GitHub Pages, Vercel |

## Data Flow

### 1. Development/Content Creation Flow

```
Markdown Files (docs/)
    ↓
[Frontmatter Parsing] → Post metadata (title, date, tags, categories)
    ↓
[createContentLoader] → posts.data.ts → HMR hot reload
    ↓
[Components] ← useData() hook
    ↓
Browser rendering with Vue 3 SSR
```

### 2. Build Process Flow

```
Markdown Files
    ↓
VitePress Build Process
    ├── SSG: Generate static HTML
    ├── [buildEnd Hook] → Scripts execute
    │   ├── generateSidebar.ts → sidebar config
    │   ├── generateArchive.ts → archive data files
    │   └── generateRSS.ts → feed.xml
    └── Assets bundling (Vite)
    ↓
Output: docs/.vitepress/dist/
    ↓
CI/CD Deployment → GitHub Pages + Vercel
```

### 3. Runtime Data Flow (Client)

```
User Request
    ↓
Static HTML (SSR rendered)
    ↓
Vue 3 Hydration
    ↓
[Layout.vue mounts]
    ├── Components initialize
    │   ├── Giscus.vue → Loads GitHub Discussions
    │   ├── ProgressBar.vue → Scroll event listeners
    │   └── BackTop.vue → Scroll position tracking
    ├── Composables activate
    │   ├── useSidebar.ts → Reactive sidebar state
    │   └── useArchive.ts → Transform archive data
    ↓
Interactive SPA behavior
```

## Patterns to Follow

### Pattern 1: Theme Extension (Recommended)

**What:** Extend DefaultTheme rather than rebuilding from scratch

**When:** You want customization while maintaining core functionality

**Implementation:**

```typescript
// .vitepress/theme/index.ts
import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import Giscus from './components/Giscus.vue'
import './styles/custom.css'

export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, {
    // Inject custom components into slots
    'nav-bar-content-after': () => h(ProgressBar),
    'doc-footer-before': () => h(Giscus),
    'layout-bottom': () => h(BackTop)
  }),
  enhanceApp({ app }) {
    app.component('Archives', Archives)
    app.component('Tags', Tags)
  }
}
```

### Pattern 2: Content Data Loading with createContentLoader

**What:** Declarative content querying with automatic HMR

**When:** Building post lists, archives, tags - any content aggregation

**Implementation:**

```typescript
// .vitepress/utils/posts.data.ts
import { createContentLoader } from 'vitepress'

export default createContentLoader('blog/**/*.md', {
  excerpt: true,              // Extract excerpt for previews
  render: true,               // Enable HTML rendering
  includeSrc: true,           // Include raw markdown source
  transform(raw) {
    // Sort by date descending
    const posts = raw.sort((a, b) => 
      +new Date(b.frontmatter.date) - +new Date(a.frontmatter.date)
    )
    
    // Group by year for archives
    const archives = posts.reduce((acc, post) => {
      const year = new Date(post.frontmatter.date).getFullYear()
      if (!acc[year]) acc[year] = []
      acc[year].push(post)
      return acc
    }, {})
    
    // Extract all tags
    const tags = [...new Set(posts.flatMap(p => p.frontmatter.tags || []))]
    
    return { posts, archives, tags }
  }
})
```

**Usage in Components:**

```vue
<script setup>
import { data } from '../utils/posts.data.ts'

const { posts, archives, tags } = data
</script>
```

### Pattern 3: Build Hook Automation

**What:** Execute scripts during build lifecycle to generate derived data

**When:** Sidebar generation, RSS feeds, search indexes - build-time operations

**Implementation:**

```typescript
// .vitepress/config.ts
import { defineConfig } from 'vitepress'
import { generateSidebar } from './scripts/generateSidebar'
import { generateRSS } from './scripts/generateRSS'
import { generateArchive } from './scripts/generateArchive'

export default defineConfig({
  // ... config
  
  async buildEnd(siteConfig) {
    // Runs after VitePress build completes
    const posts = await getAllPosts()
    
    // Generate sidebar from file structure
    await generateSidebar(posts, './.vitepress/sidebar.json')
    
    // Generate RSS feed
    await generateRSS(posts, {
      title: 'My Blog',
      baseUrl: 'https://example.com',
      output: './.vitepress/dist/feed.xml'
    })
    
    // Generate archive data files
    await generateArchive(posts, './.vitepress/dist/archives/')
  }
})
```

### Pattern 4: Dual Deployment Configuration

**What:** Handle different base URLs for GitHub Pages vs Vercel

**When:** Deploying to multiple platforms with different path requirements

**Implementation:**

```typescript
// .vitepress/config.ts
import { defineConfig } from 'vitepress'

const isGitHubPages = process.env.GITHUB_PAGES === 'true'

export default defineConfig({
  base: isGitHubPages ? '/repo-name/' : '/',
  
  themeConfig: {
    // Adjust URLs based on deployment target
    logo: isGitHubPages ? '/repo-name/logo.png' : '/logo.png'
  }
})
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Component Logic in Markdown

**What:** Writing complex Vue logic directly in Markdown files

**Why bad:** Breaks SSG, hard to maintain, inconsistent behavior

**Instead:** Extract to components, use frontmatter for data

### Anti-Pattern 2: Manual Sidebar Maintenance

**What:** Hardcoding sidebar configuration for large content sets

**Why bad:** Becomes unmaintainable, easy to miss pages

**Instead:** Use build scripts to auto-generate from file structure

### Anti-Pattern 3: Build-Time Data in Runtime

**What:** Attempting to access file system or run build scripts in browser

**Why bad:** SSR/SSG incompatibility, security issues

**Instead:** Use createContentLoader (dev + build), buildEnd hooks (build only)

### Anti-Pattern 4: State in Global Variables

**What:** Sharing component state through global variables

**Why bad:** SSR hydration mismatches, memory leaks

**Instead:** Use Vue composables with provide/inject or Pinia

## Scalability Considerations

| Concern | At 100 posts | At 1K posts | At 10K+ posts |
|---------|--------------|-------------|---------------|
| **Build Time** | < 10s | ~30s | Consider incremental builds |
| **Sidebar Generation** | Real-time | Build-time | Pre-computed JSON |
| **Archive Views** | In-memory | Virtual scrolling | Pagination + lazy loading |
| **Search** | Built-in local | Algolia DocSearch | Algolia with AI features |
| **RSS Feed** | Single file | Single file | Split by category |
| **Images** | Static | Optimized | CDN + responsive images |

## Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      VitePress Build                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │ Markdown │───→│   Vite   │───→│   SSG    │              │
│  │  Files   │    │  Build   │    │ Generate │              │
│  └──────────┘    └──────────┘    └────┬─────┘              │
│                                       │                      │
│  ┌────────────────────────────────────┘                     │
│  ↓                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Sidebar Gen │  │ Archive Gen │  │  RSS Gen    │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         └─────────────────┴─────────────────┘               │
│                           ↓                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              docs/.vitepress/dist/                   │   │
│  │  (Static HTML, CSS, JS, RSS, Archive data)          │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     Client Runtime                           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    Layout.vue                        │   │
│  │  ┌───────────────────────────────────────────────┐  │   │
│  │  │           DefaultTheme.Layout                  │  │   │
│  │  │  ┌─────────┐  ┌─────────┐  ┌─────────┐        │  │   │
│  │  │  │ NavBar  │  │ Sidebar │  │ Content │        │  │   │
│  │  │  └─────────┘  └─────────┘  └────┬────┘        │  │   │
│  │  └────────────────────────────────┼──────────────┘  │   │
│  │                                     │                │   │
│  │  ┌─────────┐  ┌─────────┐  ┌───────┴──────────┐    │   │
│  │  │ Giscus  │  │ BackTop │  │ ProgressBar      │    │   │
│  │  │(Footer) │  │(Bottom) │  │(Nav injection)   │    │   │
│  │  └─────────┘  └─────────┘  └──────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
│                              ↓                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Composables (Reactive State)            │   │
│  │  • useSidebar()  • useArchive()  • useProgress()    │   │
│  └─────────────────────────────────────────────────────┘   │
│                              ↓                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Data Layer (posts.data.ts)              │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Build Order Dependencies

```
Phase 1: Foundation
├── VitePress config setup
├── Theme structure (Layout.vue, index.ts)
└── Data loaders (posts.data.ts)
     ↓
Phase 2: Core UI
├── Navigation components
├── Post list components
└── Sidebar integration
     ↓
Phase 3: Enhancement Components
├── Giscus comments
├── BackTop button
└── Progress bar
     ↓
Phase 4: Automation Scripts
├── Sidebar generation
├── Archive data generation
└── RSS feed generation
     ↓
Phase 5: CI/CD
├── GitHub Actions workflows
├── GitHub Pages deployment
└── Vercel deployment
```

## Technology Integration Patterns

### Giscus Integration

```vue
<!-- .vitepress/theme/components/Giscus.vue -->
<template>
  <div class="giscus-container">
    <Giscus
      :repo="repo"
      :repo-id="repoId"
      :category="category"
      :category-id="categoryId"
      :mapping="'pathname'"
      :theme="isDark ? 'dark' : 'light'"
    />
  </div>
</template>
```

### Algolia DocSearch Integration

```typescript
// .vitepress/config.ts
themeConfig: {
  search: {
    provider: 'algolia',
    options: {
      appId: process.env.ALGOLIA_APP_ID,
      apiKey: process.env.ALGOLIA_API_KEY,
      indexName: 'blog',
      // AI-enhanced search options (2025+)
      insights: true,
      searchParameters: {
        hitsPerPage: 10
      }
    }
  }
}
```

### RSS Feed Generation

```typescript
// .vitepress/scripts/generateRSS.ts
import { writeFileSync } from 'fs'
import { Feed } from 'feed'

export async function generateRSS(posts, config) {
  const feed = new Feed({
    title: config.title,
    description: config.description,
    id: config.baseUrl,
    link: config.baseUrl,
    language: 'zh-CN'
  })
  
  posts.forEach(post => {
    feed.addItem({
      title: post.frontmatter.title,
      link: `${config.baseUrl}${post.url}`,
      date: new Date(post.frontmatter.date),
      description: post.excerpt
    })
  })
  
  writeFileSync(config.output, feed.rss2())
}
```

## Sources

- [VitePress Official Documentation](https://vitepress.dev/) (MEDIUM confidence - WebSearch)
- [VitePress Custom Theme Guide](https://vitepress.dev/guide/custom-theme) (MEDIUM confidence - WebSearch)
- [VitePress Data Loading](https://vitepress.dev/guide/data-loading) (MEDIUM confidence - WebSearch)
- [vitepress-sidebar Plugin](https://github.com/jooy2/vitepress-sidebar) (MEDIUM confidence - WebSearch)
- [vitepress-plugin-feed](https://github.com/emersonbottero/vitepress-plugin-feed) (MEDIUM confidence - WebSearch)
- Community blog theme patterns 2025 (MEDIUM confidence - WebSearch aggregation)
