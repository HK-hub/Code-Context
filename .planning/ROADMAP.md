# Roadmap: VitePress Technical Blog + Documentation Site

**Granularity:** Standard
**Phases:** 8
**Coverage:** 43/43 v1 requirements mapped

## Phases

- [ ] **Phase 1: Foundation** - VitePress scaffolded with theme extension, frontmatter schema, base path configured
- [ ] **Phase 2: Content Infrastructure** - Auto-navigation, content loaders, directory structure standardized
- [ ] **Phase 3: AI Search Integration** - Algolia DocSearch + Ask AI with local fallback
- [ ] **Phase 4: Engagement Features** - Giscus comments, RSS feeds, social metadata
- [ ] **Phase 5: Markdown Extensions** - Mermaid diagrams, math equations, footnotes
- [ ] **Phase 6: Archive System** - Three-dimensional archive (timeline + tags + categories)
- [ ] **Phase 7: UX Polish** - Reading progress, back-to-top, TOC highlighting
- [ ] **Phase 8: Deployment & CI/CD** - GitHub Pages + Vercel dual deployment

## Phase Details

### Phase 1: Foundation
**Goal**: VitePress site scaffolded with extensible theme, frontmatter standards enforced, base path ready for dual deployment
**Depends on**: Nothing (first phase)
**Requirements**: FND-01, FND-02, FND-03, FND-04, FND-05, FND-06, FND-07
**Success Criteria** (what must be TRUE):
  1. `npm run dev` starts VitePress dev server without errors
  2. Site renders with custom theme extension (Layout.vue overriding default)
  3. Dark mode toggle works and persists across page reloads
  4. Adding a markdown file with invalid frontmatter fails build with clear error
  5. `base` path configures correctly from environment variable for GitHub Pages
**Plans**: TBD

### Phase 2: Content Infrastructure
**Goal**: Content discovery works automatically - navigation reflects directory structure without manual config updates
**Depends on**: Phase 1
**Requirements**: NAV-01, NAV-02, NAV-03, NAV-04
**Success Criteria** (what must be TRUE):
  1. Creating a new file in `docs/blog/` automatically appears in navigation within 5 seconds (dev HMR)
  2. Sidebar shows correct hierarchy based on directory structure
  3. `order` field in frontmatter correctly sorts pages within their section
  4. `_meta.json` can override auto-generated navigation when needed
  5. Mixed content (blog posts + project docs) displays correct navigation per section
**Plans**: TBD

### Phase 3: AI Search Integration
**Goal**: Users can find content via AI-powered Q&A search with reliable fallback
**Depends on**: Phase 2
**Requirements**: SCH-01, SCH-02, SCH-03, SCH-04
**Success Criteria** (what must be TRUE):
  1. Search modal opens with Cmd+K / Ctrl+K
  2. Typing a question returns AI-generated answer with source citations (Ask AI)
  3. If Algolia quota exceeded, search falls back to local MiniSearch without user intervention
  4. Search results prioritize title matches over body content
  5. Search works on both GitHub Pages and Vercel deployments
**Plans**: TBD
**Research flag**: HIGH - Algolia Assistant ID application timeline uncertain

### Phase 4: Engagement Features
**Goal**: Readers can comment, subscribe, and share content
**Depends on**: Phase 1
**Requirements**: CMT-01, CMT-02, CMT-03, CMT-04, RSS-01, RSS-02, RSS-03
**Success Criteria** (what must be TRUE):
  1. Scroll to bottom of article loads Giscus comment section (lazy loaded)
  2. Toggling dark mode updates comment section theme immediately
  3. `/feed.rss` returns valid RSS 2.0 feed with last 20 articles
  4. `/feed.atom` returns valid Atom 1.0 feed
  5. `/subscribe/` page displays feed URLs with copy-to-clipboard buttons
  6. Article pages include Open Graph and Twitter Card meta tags for social sharing
**Plans**: TBD

### Phase 5: Markdown Extensions
**Goal**: Technical content renders with diagrams, math, and enhanced code blocks
**Depends on**: Phase 1
**Requirements**: MDX-01, MDX-02, MDX-03, MDX-04, MDX-05
**Success Criteria** (what must be TRUE):
  1. Mermaid code blocks render as SVG diagrams (flowchart, sequence, gantt)
  2. Inline math `$...$` and block math `$$...$$` render correctly
  3. Footnote `[^1]` syntax creates linked footnotes
  4. Code blocks show line numbers
  5. Code blocks have copy button that copies content to clipboard
**Plans**: TBD
**Research flag**: MEDIUM - Mermaid SSR/hydration patterns need validation

### Phase 6: Archive System
**Goal**: Users can browse content by time, tags, and categories through three-dimensional archive
**Depends on**: Phase 2
**Requirements**: ARC-01, ARC-02, ARC-03, ARC-04, ARC-05, ARC-06
**Success Criteria** (what must be TRUE):
  1. `/archive/timeline/` shows years with expandable months, articles sorted reverse chronological
  2. `/archive/tags/` shows all tags with article counts, clicking tag shows related articles
  3. `/archive/categories/` shows category tree with nested subcategories
  4. `/archive/all/` displays paginated list of all articles with filter by tag/category
  5. Build completes in under 30 seconds for 100 articles (performance benchmark)
**Plans**: TBD
**UI hint**: yes
**Research flag**: HIGH - No existing VitePress pattern for three-dimensional archive

### Phase 7: UX Polish
**Goal**: Reading experience feels polished and professional
**Depends on**: Phase 1
**Requirements**: UX-01, UX-02, UX-03, UX-04
**Success Criteria** (what must be TRUE):
  1. Back-to-top button appears after scrolling 300px, smooth scrolls to top on click
  2. Reading progress bar at top of page updates as user scrolls
  3. Table of Contents highlights current section based on scroll position
  4. Scrollbar styled consistently with theme (visible in WebKit browsers)
**Plans**: TBD
**UI hint**: yes

### Phase 8: Deployment & CI/CD
**Goal**: Site deploys automatically to both platforms with proper SEO setup
**Depends on**: Phase 1 (base config), all previous phases (content ready)
**Requirements**: DEP-01, DEP-02, DEP-03, DEP-04, DEP-05, DEP-06
**Success Criteria** (what must be TRUE):
  1. Pushing to `main` branch triggers GitHub Actions workflow
  2. GitHub Pages deployment completes successfully at `username.github.io/repo-name/`
  3. Vercel deployment completes successfully with preview deployments for PRs
  4. `/sitemap.xml` exists and lists all public pages
  5. `/robots.txt` allows all crawlers and references sitemap
  6. Open Graph meta tags render correct images and descriptions for social sharing
**Plans**: TBD

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/1 | Not started | - |
| 2. Content Infrastructure | 0/1 | Not started | - |
| 3. AI Search Integration | 0/1 | Not started | - |
| 4. Engagement Features | 0/1 | Not started | - |
| 5. Markdown Extensions | 0/1 | Not started | - |
| 6. Archive System | 0/1 | Not started | - |
| 7. UX Polish | 0/1 | Not started | - |
| 8. Deployment & CI/CD | 0/1 | Not started | - |

## Success Criteria Summary

| Phase | Criteria | Observable Behaviors |
|-------|----------|---------------------|
| 1 | 5 | Dev server, theme extension, dark mode, validation, base config |
| 2 | 5 | Auto-nav, sidebar, ordering, overrides, mixed content |
| 3 | 5 | Search modal, AI answers, fallback, weighting, dual deploy |
| 4 | 6 | Comments, theme sync, RSS, Atom, subscribe page, social meta |
| 5 | 5 | Mermaid, math, footnotes, line numbers, copy button |
| 6 | 5 | Timeline, tags, categories, all articles, performance |
| 7 | 4 | Back-to-top, progress bar, TOC highlight, scrollbar |
| 8 | 6 | CI trigger, GitHub Pages, Vercel, sitemap, robots, OG tags |

**Total Success Criteria:** 41 across 8 phases

---
*Roadmap created: 2026-04-02*
*Granularity: Standard | Mode: yolo*
