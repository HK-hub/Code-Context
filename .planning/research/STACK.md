# Technology Stack

**Project:** VitePress Technical Blog + Documentation Site
**Researched:** 2026-04-02

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| VitePress | ^1.6.x | Static site generator | Official stable release (1.6.3 as of March 2025). Vue 3 + Vite based, optimized for documentation. Native Algolia integration support. **Confidence: HIGH** |
| Vue | ^3.4.x | Component framework | VitePress built on Vue 3 Composition API. Required for custom theme components (archive UI, reading progress). **Confidence: HIGH** |
| Vite | ^5.x | Build tool | VitePress 1.6+ requires Vite 5. Provides instant HMR and optimized production builds. **Confidence: HIGH** |
| TypeScript | ^5.x | Type safety | Native support in VitePress. Essential for custom plugin development (auto-nav, archives). **Confidence: HIGH** |

### Search Solution

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Algolia DocSearch v3 | Latest | AI-powered search | VitePress native `themeConfig.algolia` support. "Ask AI" capability requires Algolia Assistant (separate from standard DocSearch). This is what VitePress official site uses. **Confidence: HIGH** |

**Search Alternatives Analysis:**

| Option | Use When | Why Not Default |
|--------|----------|-----------------|
| VitePress Local Search (MiniSearch) | Small sites (<100 pages), no budget | No AI capabilities, limited relevance scoring |
| Pagefind | Self-hosted requirement, privacy focus | Requires build-time indexing, no AI features |
| Inkeep AI | Quick AI integration without Algolia setup | Third-party dependency, paid for scale |

**Algolia Ask AI Requirements (Critical):**
- Standard DocSearch provides keyword search only
- "Ask AI" requires separate Algolia Assistant application
- Must apply via Algolia website for Assistant ID
- Not automatically included with DocSearch

### Comments System

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Giscus | ^1.x | Comment system | GitHub Discussions integration - developer community standard. No separate user database. Theme-aware, lazy loading supported. VitePress community widely adopted. **Confidence: HIGH** |

**Giscus Integration Pattern:**
```javascript
// Component-based integration in custom theme
// Lazy-loaded on scroll to comment section
// Theme synchronization with VitePress dark mode
```

**Alternatives Rejected:**
- **Twikoo**: Requires separate database/server, adds complexity
- **Waline**: Self-hosted, additional maintenance burden
- **Disqus**: Privacy concerns, ad injection, developer unfriendly

### RSS Feed Generation

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| vitepress-plugin-rss | ^0.0.x | RSS/Atom/JSON feeds | Community standard for VitePress RSS. Scans markdown frontmatter. Supports multiple output formats. **Confidence: MEDIUM** |

**Warning:** Plugin is pre-1.0 (0.0.3 as of 2025). Monitor for breaking changes. Consider pinning version in package.json.

**Alternative:** Custom build hook using `feed` npm package if plugin stability becomes issue.

### Markdown Extensions

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| markdown-it-mathjax3 | ^4.x | Math rendering | MathJax v3 for full LaTeX support. Better accessibility than KaTeX. Use for complex equations. **Confidence: HIGH** |
| @mdit/plugin-katex | ^0.10.x | Math rendering (alt) | Faster rendering, smaller bundle. Use for simple equations where speed matters. **Confidence: MEDIUM** |
| mermaid | ^10.x | Diagrams | Standard for flowcharts, sequence diagrams. Requires markdown-it plugin integration. **Confidence: HIGH** |
| markdown-it-footnote | ^3.x | Footnotes | Academic/technical writing standard. **Confidence: HIGH** |
| Shiki | Built-in | Code highlighting | VitePress default. Better than Prism for accuracy. **Confidence: HIGH** |

**Math Plugin Decision Matrix:**

| Scenario | Recommended | Reason |
|----------|-------------|--------|
| Standard blog posts | VitePress built-in `math: true` (KaTeX) | Zero config, good enough for most |
| Academic papers, heavy math | markdown-it-mathjax3 | Full LaTeX feature support |
| Performance critical | @mdit/plugin-katex | Fastest render, smallest bundle |

### Navigation & Archive Features

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| vitepress-plugin-sidebar | ^1.x | Auto sidebar generation | Mature community plugin. Scans file structure, supports nested directories. **Confidence: MEDIUM** |
| vitepress-plugin-nav | ^0.x | Auto nav generation | Alternative with frontmatter-based ordering. Less mature but flexible. **Confidence: LOW** |

**Custom Components Required:**
Archive/timeline UI and tag clouds must be custom Vue components - no mature plugin exists for VitePress-specific archive patterns.

### UX Enhancement

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| vitepress-plugin-back-to-top | ^1.x | Scroll-to-top button | Circular progress indicator. Theme-aware. **Confidence: MEDIUM** |
| @vueuse/core | ^10.x | Vue utilities | Reading progress, scroll tracking, intersection observer. Industry standard. **Confidence: HIGH** |

**Reading Progress Implementation:**
Custom Vue component using `@vueuse/core` `useScroll` and `useElementVisibility` - no dedicated plugin needed.

### Build & Deployment

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| GitHub Actions | N/A | CI/CD | Native GitHub integration. Free for public repos. **Confidence: HIGH** |
| Vercel CLI | ^34.x | Deployment | Preview deployments, edge network. **Confidence: HIGH** |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Search | Algolia DocSearch | Inkeep AI | Algolia native integration is simpler; Inkeep adds another vendor dependency |
| Math | markdown-it-mathjax3 | KaTeX | KaTeX lacks some LaTeX packages; MathJax v3 more complete |
| Comments | Giscus | Twikoo | Twikoo requires database; Giscus uses existing GitHub infrastructure |
| Sidebar | vitepress-plugin-sidebar | Custom script | Manual script maintenance burden; plugin actively maintained |
| RSS | vitepress-plugin-rss | Custom build hook | Custom hook more flexible but higher maintenance |

## Installation Commands

```bash
# Core
npm install -D vitepress@^1.6.3

# Search (user configures via VitePress themeConfig, no npm package needed)
# Algolia DocSearch is CDN-loaded by VitePress

# Comments
npm install -D @giscus/vue

# RSS
npm install -D vitepress-plugin-rss

# Markdown Extensions
npm install -D markdown-it-mathjax3
npm install -D @mdit/plugin-katex  # Alternative to mathjax3
npm install -D mermaid
npm install -D markdown-it-footnote

# Navigation
npm install -D vitepress-plugin-sidebar

# UX
npm install -D vitepress-plugin-back-to-top
npm install -D @vueuse/core

# Build/Type Support
npm install -D typescript@^5.4
```

## Version Compatibility Matrix

| Package | VitePress 1.5.x | VitePress 1.6.x | Notes |
|---------|-----------------|-----------------|-------|
| vitepress-plugin-rss | 0.0.2 | 0.0.3 | Pre-1.0, monitor updates |
| vitepress-plugin-sidebar | 1.2.x | 1.3.x | Stable, follow semver |
| @giscus/vue | 2.x | 3.x | Check for Vue 3.4 compatibility |
| markdown-it-mathjax3 | 4.3.x | 4.3.x | Stable |

## What NOT to Use

| Technology | Why Avoid | Alternative |
|------------|-----------|-------------|
| VuePress (legacy) | Maintenance mode, Vue 2 based | VitePress (Vue 3) |
| Disqus | Privacy issues, ads, slow loading | Giscus |
| vuepress-plugin-blog | For VuePress, not VitePress | Custom VitePress components |
| Algolia Search (not DocSearch) | DocSearch is free for OSS docs | Algolia DocSearch |
| MathJax v2 | Outdated, slower than v3 | markdown-it-mathjax3 (v3) |

## Confidence Assessment

| Area | Level | Reason |
|------|-------|--------|
| Core (VitePress, Vue, Vite) | HIGH | Official docs, active maintenance, stable releases |
| Algolia Integration | HIGH | Native VitePress support, official documentation |
| Giscus | HIGH | Widely adopted, GitHub-backed, stable API |
| Math/Diagrams | MEDIUM | Multiple options, config varies by use case |
| Auto-nav plugins | MEDIUM | Community plugins, some pre-1.0 |
| RSS | LOW | Pre-1.0 plugin, may need custom fallback |

## Sources

- [VitePress Official Documentation](https://vitepress.dev/) - Core framework
- [Algolia DocSearch Documentation](https://docsearch.algolia.com/) - Search integration
- [Giscus GitHub Repository](https://github.com/giscus/giscus) - Comments
- [NPM Registry Search](https://www.npmjs.com/) - Package versions verified March 2025
- [vitepress-plugin-rss NPM](https://www.npmjs.com/package/vitepress-plugin-rss) - RSS generation
- [vitepress-plugin-sidebar GitHub](https://github.com/jc-wang/vitepress-plugin-sidebar) - Navigation
- [markdown-it-mathjax3 Documentation](https://github.com/tani/markdown-it-mathjax3) - Math rendering
