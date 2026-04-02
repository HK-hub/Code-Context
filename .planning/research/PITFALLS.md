# Domain Pitfalls: VitePress Static Blog

**Domain:** VitePress-based technical blog with Algolia Ask AI, Giscus comments, and archive system
**Researched:** 2026-04-02
**Confidence:** MEDIUM (WebSearch sources, no direct project experience)

## Critical Pitfalls

Mistakes that cause rewrites or significant architectural changes.

### Pitfall 1: Underestimating Algolia Ask AI Quota Limits

**What goes wrong:**
- Free tier only allows **100 Ask AI responses per month**
- At $0.10 per response beyond free tier, a moderately popular blog could incur unexpected costs
- Search requests (1,000/month free) are separate from Ask AI responses
- No graceful degradation strategy means search breaks when quota exceeded

**Why it happens:**
- Developers assume "search" and "Ask AI" share the same quota
- Testing phase doesn't simulate production traffic patterns
- No monitoring or alerting on quota consumption

**Consequences:**
- Search functionality degrades or fails for users
- Unexpected billing charges
- Forced to either pay premium or remove AI feature
- Poor user experience during high-traffic periods

**Prevention:**
1. Implement **dual-search strategy**: Local search fallback when Ask AI quota exceeded
2. Add usage tracking/alerts before hitting 80% of quota
3. Cache common queries to reduce API calls
4. Consider **hybrid approach**: Use local search for basic queries, Ask AI only for conversational queries

**Detection (warning signs):**
- Algolia dashboard shows rapid Ask AI consumption
- Users report search "not working" intermittently
- Console errors from Algolia client about rate limiting

**Phase to address:** Phase 2 (Algolia DocSearch + Ask AI configuration)

---

### Pitfall 2: Archive Data Generation Blocking Build Performance

**What goes wrong:**
- Scanning hundreds of articles to generate archive data at build time becomes O(n) or worse
- Three-dimensional archive (timeline, tags, categories) requires multiple passes over all content
- Build times grow from seconds to minutes as content scales
- Memory usage spikes during archive generation

**Why it happens:**
- Naive implementation reads each file multiple times (once per archive type)
- No caching of parsed frontmatter between passes
- Synchronous file I/O operations
- Attempting to generate archive pages as actual routes instead of client-side computed data

**Consequences:**
- Developer experience degrades (slow feedback loop)
- CI/CD pipelines timeout
- Memory exhaustion on resource-constrained build environments
- Hesitation to add more content due to build pain

**Prevention:**
1. **Single-pass architecture**: Parse all frontmatter once, cache in memory, generate all three archive views from cached data
2. **Incremental build support**: Consider VitePress's experimental incremental build features
3. **Defer to client-side**: Generate archive data as JSON endpoint, render with Vue component (trade initial load for build speed)
4. **Lazy loading**: Paginate archive views, don't render all 500 articles at once

**Detection (warning signs):**
- Build time increases linearly with article count
- `vitepress build` hangs at "building client + server bundles" step
- Memory usage > 4GB during build

**Phase to address:** Phase 6 (Three-dimensional archive system)

---

### Pitfall 3: Mermaid Rendering Performance in Static Build

**What goes wrong:**
- Mermaid diagrams render client-side, causing hydration mismatches between server HTML and client hydration
- Large diagrams (>50 nodes) cause significant frame drops and poor UX
- Bundle size increases dramatically with Mermaid dependency (~500KB+)
- Server-side rendering attempts to execute Mermaid, causing build errors or timeouts

**Why it happens:**
- Default Mermaid integration attempts SSR, but Mermaid requires browser APIs
- Mermaid is bundled into the main chunk even if only used on a few pages
- No lazy loading or code splitting for diagram-heavy pages

**Consequences:**
- Layout shift during hydration (diagrams "pop in")
- Poor mobile performance
- Increased Time-to-Interactive (TTI)
- SEO impact: search engines see placeholder, not diagram content

**Prevention:**
1. **Pre-render at build time**: Use `mermaid-cli` or Puppeteer to generate SVGs during build, embed static images
2. **Client-only rendering**: Wrap Mermaid components in `<ClientOnly>` to skip SSR entirely
3. **Code splitting**: Dynamic import Mermaid only when diagrams present on page
4. **Progressive enhancement**: Show static code block, enhance to diagram on client
5. **Limit complexity**: Establish guidelines (max 30 nodes) for diagrams

**Detection (warning signs):**
- Console hydration mismatch warnings in dev
- Pages with diagrams load noticeably slower
- Lighthouse performance score < 70 on diagram pages

**Phase to address:** Phase 3 (Markdown extensions) and Phase 7 (UX optimization)

---

### Pitfall 4: Auto-Sidebar Generation Complexity Explosion

**What goes wrong:**
- Attempting to auto-generate sidebar from directory structure becomes unmaintainable
- Special cases accumulate (hide certain files, custom ordering, nested groups)
- Configuration code becomes spaghetti of conditionals
- Performance degrades as glob operations scan entire docs tree on every build

**Why it happens:**
- Starts simple: "just scan /docs and generate"
- Reality: need to exclude drafts, sort by date, group by category, handle index files specially
- No separation between "source of truth" (file system) and "intent" (desired navigation)

**Consequences:**
- Sidebar config file grows to hundreds of lines
- Adding a new article requires understanding complex config
- Sidebar doesn't match mental model of content organization
- Abandoning auto-generation and manually maintaining sidebar (defeat)

**Prevention:**
1. **Frontmatter-driven ordering**: Use `order` field in frontmatter, generate sidebar from metadata
2. **Config-as-data**: Maintain separate `navigation.yml` or JSON file describing structure, not code
3. **Hybrid approach**: Auto-generate base structure, allow per-directory overrides via `_meta.json` files
4. **Document types**: Different sidebar strategies for "blog posts" vs "documentation" content

**Detection (warning signs):**
- Sidebar config file > 200 lines
- Multiple `if (path.includes('...'))` conditions
- Adding content breaks sidebar generation
- Team members avoid touching sidebar config

**Phase to address:** Phase 4 (Auto navigation/sidebar generation)

---

### Pitfall 5: Frontmatter Standardization Drift

**What goes wrong:**
- Archive system expects specific frontmatter fields (date, tags, categories)
- Content authors use inconsistent formats: `date: 2024-01-01` vs `date: Jan 1, 2024` vs `published: 2024-01-01`
- Optional fields cause runtime errors in components
- Migration pain when changing frontmatter schema

**Why it happens:**
- No validation at content creation time
- Different authors have different habits
- Copy-paste from external sources brings varied formats
- Schema evolves organically without migration plan

**Consequences:**
- Archive generation fails silently or produces wrong output
- Articles missing from expected categories/tags
- Build errors that are hard to debug ("Cannot read property of undefined")
- Technical debt accumulates; cleanup becomes daunting

**Prevention:**
1. **Schema validation**: Use Zod or JSON Schema to validate frontmatter at build time
2. **Linting**: `remark-frontmatter-schema` or custom linting in CI
3. **Templates**: Provide article templates with correct frontmatter structure
4. **Normalization layer**: Create adapter that normalizes various date/tag formats to canonical form
5. **Strict typing**: TypeScript interfaces for frontmatter that fail fast

**Detection (warning signs):**
- Conditional checks like `if (frontmatter.date)` throughout codebase
- Inconsistent sorting in archive views
- Some articles appear in "Uncategorized"
- Build warnings about invalid dates

**Phase to address:** Phase 1 (VitePress foundation) and Phase 6 (Archive system)

---

### Pitfall 6: GitHub Pages Base Path Misconfiguration

**What goes wrong:**
- VitePress builds successfully but deployed site shows 404 or broken assets
- Relative URLs resolve incorrectly on GitHub Pages project sites (`username.github.io/repo-name/`)
- Client-side navigation works, but direct links or refresh fails
- Images and links work locally but not in production

**Why it happens:**
- GitHub Pages project sites deploy to subdirectory, not root
- VitePress defaults to `base: '/'` assuming root deployment
- Forgetting to configure `base` option before first deployment
- Hardcoded absolute URLs in content that don't account for base path

**Consequences:**
- Broken production site on first deployment
- Emergency fix commits with trial-and-error base path adjustments
- Asset references need updating throughout content
- SEO impact from broken links

**Prevention:**
1. **Configure `base` from day one**:
   ```javascript
   // .vitepress/config.js
   export default {
     base: process.env.GITHUB_PAGES ? '/your-repo-name/' : '/'
   }
   ```
2. **Use relative paths** in markdown: `[link](./other-page.md)` not `[link](/other-page)`
3. **Test with base path locally**: `vitepress dev --base /repo-name/`
4. **GitHub Actions**: Set `base` automatically based on repository name

**Detection (warning signs):**
- 404 errors on GitHub Pages after deployment
- CSS/JS returning 404 in browser dev tools
- Working navigation but broken assets

**Phase to address:** Phase 1 (Foundation) and Phase 9 (Deployment)

---

### Pitfall 7: Hydration Mismatch from Content-Sensitive Components

**What goes wrong:**
- Component renders different HTML on server vs client, causing Vue hydration mismatch
- Common causes: `new Date()`, `Math.random()`, `window` access during SSR
- Mismatches cause full client-side re-render, negating SSR benefits
- Console flooded with hydration warnings

**Why it happens:**
- Using browser-only APIs without checking environment
- Timestamps or random IDs generated during render
- Reading from `localStorage` or `document` during SSR
- Third-party components not SSR-safe

**Consequences:**
- Flash of unstyled content (FOUC) or layout shift
- Slower initial page load (double render)
- Errors in production that don't appear in dev
- Poor SEO (search engines see broken content)

**Prevention:**
1. **Use `onMounted` for client-only operations**:
   ```javascript
   const date = ref('')
   onMounted(() => {
     date.value = new Date().toLocaleString() // Safe: only runs client-side
   })
   ```
2. **`<ClientOnly>` wrapper**: For components that can't work server-side
3. **`import.meta.env.SSR` check**: Conditional logic based on environment
4. **Stable IDs**: Use deterministic IDs based on content hash, not random

**Detection (warning signs):**
- Console warnings: "Hydration completed but contains mismatches"
- Content "jumps" or changes after page loads
- `window is not defined` errors during build

**Phase to address:** Phase 3 (Markdown extensions) and Phase 7 (UX components)

---

### Pitfall 8: Memory Leaks in Custom Components

**What goes wrong:**
- SPA navigation accumulates memory; refreshing page releases it
- Event listeners, timers, observers not cleaned up on component unmount
- Most noticeable in dev mode with HMR, but affects production too
- Large third-party libraries (charts, maps, editors) not properly disposed

**Why it happens:**
- VitePress has SPA behavior; components mount/unmount as user navigates
- Custom Vue components using `onMounted` without corresponding cleanup
- Third-party libraries requiring explicit `.destroy()` or `.disconnect()` calls
- Global event listeners (`window.addEventListener`) never removed

**Consequences:**
- Browser tab memory grows with navigation
- Eventually tab crashes or becomes unresponsive
- Mobile devices affected more severely
- Poor user experience on long browsing sessions

**Prevention:**
1. **Always cleanup in `onUnmounted`**:
   ```javascript
   const observer = ref(null)
   const timer = ref(null)
   
   onMounted(() => {
     observer.value = new IntersectionObserver(callback)
     timer.value = setInterval(poll, 5000)
   })
   
   onUnmounted(() => {
     observer.value?.disconnect()
     clearInterval(timer.value)
     window.removeEventListener('scroll', handleScroll)
   })
   ```
2. **Prefer `useEventListener` composables** that auto-cleanup
3. **Review third-party libs**: Check docs for cleanup methods
4. **Memory profiling**: Use Chrome DevTools to verify after navigation

**Detection (warning signs):**
- Tab memory grows > 500MB after browsing multiple articles
- Performance degrades over time
- Console warnings about event listener leaks

**Phase to address:** Phase 3 (Markdown extensions) and Phase 7 (UX components)

---

## Moderate Pitfalls

Mistakes that cause frustration but are fixable without major rework.

### Pitfall 9: RSS Feed Generation Strategy

**What goes wrong:**
- Attempting to generate RSS at runtime instead of build time
- RSS includes full article content, bloating feed size
- No caching leads to redundant processing
- Feed URL not discoverable or incorrectly formatted

**Prevention:**
- Generate RSS as static file during build using `buildEnd` hook
- Include excerpts only, link to full articles
- Validate RSS with W3C Feed Validation Service

**Phase to address:** Phase 6 (Archive/RSS system)

---

### Pitfall 10: Giscus Theme Synchronization Issues

**What goes wrong:**
- Giscus theme doesn't automatically follow VitePress dark mode toggle
- Flash of wrong theme on initial load (white comments on dark page)
- Theme change requires page refresh to take effect

**Prevention:**
- Listen to VitePress theme change event and update Giscus `theme` attribute
- Use `data-theme` attribute that matches VitePress theme class
- Consider `data-loading="lazy"` to defer comment loading

**Phase to address:** Phase 5 (Giscus integration)

---

### Pitfall 11: Build Output Directory Confusion

**What goes wrong:**
- GitHub Actions publishes wrong directory (e.g., `dist` instead of `.vitepress/dist`)
- Artifact uploads include source files, not just built output
- Vercel deployment fails because of incorrect output directory setting

**Prevention:**
- Document: VitePress builds to `.vitepress/dist`, not `dist/`
- Verify with local build before pushing: `npm run docs:build && npx serve .vitepress/dist`
- Use `publish_dir: ./.vitepress/dist` in GitHub Actions

**Phase to address:** Phase 9-10 (Deployment/CI-CD)

---

### Pitfall 12: Ignoring Dead Link Checking

**What goes wrong:**
- Internal links break as content structure evolves
- External links rot over time
- No automated checking means broken links accumulate
- Build times increase significantly when dead link checking is enabled on large sites

**Prevention:**
- Enable `markdown.links.validate: true` in dev, consider disabling in CI for speed
- Run periodic external link checking separately from builds
- Use relative paths for internal links to catch breaks during build

**Phase to address:** Phase 1 (Foundation) and ongoing

---

## Minor Pitfalls

### Pitfall 13: Over-customizing Default Theme

**What goes wrong:**
- Extensive CSS overrides break with VitePress updates
- Forking default theme makes updates painful
- Custom components diverge from VitePress design patterns

**Prevention:**
- Prefer theme extension over theme replacement
- Use CSS custom properties (variables) that VitePress provides
- Isolate custom styles with specific selectors

---

### Pitfall 14: Not Leveraging VitePress Caching

**What goes wrong:**
- Slow dev server restart because cache disabled or misconfigured
- Re-processing unchanged markdown files on every build

**Prevention:**
- Use `vite.cacheDir` configuration
- Enable experimental features like `mpa: true` for pure static sites (no hydration)

---

## Phase-Specific Warnings

| Phase | Topic | Likely Pitfall | Mitigation |
|-------|-------|----------------|------------|
| Phase 1 | Foundation | GitHub Pages base path | Configure `base` from start |
| Phase 2 | Algolia | Quota limits | Implement fallback search |
| Phase 3 | Markdown | Mermaid SSR issues | Pre-render or ClientOnly wrapper |
| Phase 4 | Navigation | Sidebar config spaghetti | Frontmatter-driven generation |
| Phase 5 | Comments | Theme sync issues | Listen to theme change events |
| Phase 6 | Archive | Build performance | Single-pass, cached frontmatter |
| Phase 7 | UX | Hydration mismatches | onMounted for client-only code |
| Phase 8-10 | Deploy | Wrong output directory | Document `.vitepress/dist` path |

---

## Confidence Assessment

| Pitfall | Confidence | Notes |
|---------|------------|-------|
| Algolia quota limits | MEDIUM | Pricing from Algolia docs 2024 |
| Archive build performance | MEDIUM | General SSG patterns, not VitePress-specific |
| Mermaid rendering | MEDIUM | Common SSG + client-side lib issue |
| Auto-sidebar complexity | HIGH | Classic config sprawl problem |
| Frontmatter standardization | HIGH | Universal content management issue |
| GitHub Pages base path | HIGH | Documented common issue |
| Hydration mismatch | MEDIUM | Vue SSR common pattern |
| Memory leaks | MEDIUM | SPA navigation pattern |

---

## Sources

- Algolia Pricing: https://www.algolia.com/pricing/
- VitePress Issues (GitHub): Various discussions on performance and configuration
- Vue SSR Documentation: https://vuejs.org/guide/scaling-up/ssr.html
- Web search results on VitePress deployment and performance (2024-2025)

**Research gaps:**
- Direct VitePress documentation fetch failed; relying on search summaries
- No access to specific GitHub issue threads for verified user reports
- Algolia pricing subject to change; verify current rates before implementation
