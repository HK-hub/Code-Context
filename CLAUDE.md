<!-- GSD:project-start source:PROJECT.md -->
## Project

**VitePress 技术博客与开源文档站**

基于 VitePress 构建的多功能技术内容平台，融合三大身份：个人技术博客（后端/AI/全栈领域）、教学笔记库、开源项目官方文档托管站。面向技术同行、学生和开源项目用户，提供 AI 驱动的智能内容发现和极致阅读体验。

**Core Value:** **AI 驱动的智能内容发现** — 通过 Algolia Ask AI 实现问答式检索，让用户快速找到有价值的内容。如果搜索体验不好，用户无法发现内容，其他功能再好也无意义。

### Constraints

- **Tech Stack**: VitePress (Vue 3 + Vite) — 用户明确指定
- **部署平台**: GitHub Pages + Vercel — 双部署策略
- **内容标准**: 所有文章必须有 frontmatter（title, date, categories, tags）
- **性能目标**: Lighthouse 评分 ≥ 90，首屏加载 < 1.5s
- **兼容性**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+，响应式 320px-2560px
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

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
| Option | Use When | Why Not Default |
|--------|----------|-----------------|
| VitePress Local Search (MiniSearch) | Small sites (<100 pages), no budget | No AI capabilities, limited relevance scoring |
| Pagefind | Self-hosted requirement, privacy focus | Requires build-time indexing, no AI features |
| Inkeep AI | Quick AI integration without Algolia setup | Third-party dependency, paid for scale |
- Standard DocSearch provides keyword search only
- "Ask AI" requires separate Algolia Assistant application
- Must apply via Algolia website for Assistant ID
- Not automatically included with DocSearch
### Comments System
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Giscus | ^1.x | Comment system | GitHub Discussions integration - developer community standard. No separate user database. Theme-aware, lazy loading supported. VitePress community widely adopted. **Confidence: HIGH** |
- **Twikoo**: Requires separate database/server, adds complexity
- **Waline**: Self-hosted, additional maintenance burden
- **Disqus**: Privacy concerns, ad injection, developer unfriendly
### RSS Feed Generation
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| vitepress-plugin-rss | ^0.0.x | RSS/Atom/JSON feeds | Community standard for VitePress RSS. Scans markdown frontmatter. Supports multiple output formats. **Confidence: MEDIUM** |
### Markdown Extensions
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| markdown-it-mathjax3 | ^4.x | Math rendering | MathJax v3 for full LaTeX support. Better accessibility than KaTeX. Use for complex equations. **Confidence: HIGH** |
| @mdit/plugin-katex | ^0.10.x | Math rendering (alt) | Faster rendering, smaller bundle. Use for simple equations where speed matters. **Confidence: MEDIUM** |
| mermaid | ^10.x | Diagrams | Standard for flowcharts, sequence diagrams. Requires markdown-it plugin integration. **Confidence: HIGH** |
| markdown-it-footnote | ^3.x | Footnotes | Academic/technical writing standard. **Confidence: HIGH** |
| Shiki | Built-in | Code highlighting | VitePress default. Better than Prism for accuracy. **Confidence: HIGH** |
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
### UX Enhancement
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| vitepress-plugin-back-to-top | ^1.x | Scroll-to-top button | Circular progress indicator. Theme-aware. **Confidence: MEDIUM** |
| @vueuse/core | ^10.x | Vue utilities | Reading progress, scroll tracking, intersection observer. Industry standard. **Confidence: HIGH** |
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
# Core
# Search (user configures via VitePress themeConfig, no npm package needed)
# Algolia DocSearch is CDN-loaded by VitePress
# Comments
# RSS
# Markdown Extensions
# Navigation
# UX
# Build/Type Support
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
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
