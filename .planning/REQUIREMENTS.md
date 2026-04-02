# Requirements: VitePress Technical Blog + Documentation Site

**Defined:** 2026-04-02
**Core Value:** AI 驱动的智能内容发现 — 通过 Algolia Ask AI 实现问答式检索

## v1 Requirements

### Foundation (基础架构)

- [ ] **FND-01**: VitePress 项目初始化，配置 TypeScript 支持
- [ ] **FND-02**: 目录结构规划（docs/blog, docs/ai, docs/backend, docs/projects 等）
- [ ] **FND-03**: 主题扩展配置（继承默认主题，自定义 Layout.vue）
- [ ] **FND-04**: Frontmatter 标准定义（title, date, categories, tags, description）
- [ ] **FND-05**: Frontmatter 验证机制（Zod schema 或 JSON Schema）
- [ ] **FND-06**: GitHub Pages base path 配置（环境变量适配）
- [ ] **FND-07**: 暗色模式支持（CSS 变量 + localStorage 持久化）

### Navigation (导航系统)

- [ ] **NAV-01**: 自动导航栏生成（扫描 docs 目录结构）
- [ ] **NAV-02**: 自动侧边栏生成（基于目录结构和 frontmatter）
- [ ] **NAV-03**: `_meta.json` 自定义覆盖支持
- [ ] **NAV-04**: frontmatter `order` 字段排序支持

### Search (搜索系统)

- [ ] **SCH-01**: Algolia DocSearch 基础搜索配置
- [ ] **SCH-02**: Algolia Ask AI 集成（需申请 Assistant ID）
- [ ] **SCH-03**: 本地搜索回退方案（MiniSearch，应对配额限制）
- [ ] **SCH-04**: 搜索权重优化（标题 > 正文）

### Comments (评论系统)

- [ ] **CMT-01**: Giscus 组件集成（GitHub Discussions）
- [ ] **CMT-02**: 主题同步（暗/亮模式自动切换评论主题）
- [ ] **CMT-03**: 懒加载实现（滚动到底部时加载）
- [ ] **CMT-04**: 中英文语言支持

### RSS (订阅系统)

- [ ] **RSS-01**: 全站 RSS feed 生成（RSS 2.0 格式）
- [ ] **RSS-02**: Atom feed 生成（Atom 1.0 格式）
- [ ] **RSS-03**: 订阅页面（/subscribe/ 展示订阅方式）

### Archive (归档系统)

- [ ] **ARC-01**: Frontmatter 元数据提取脚本
- [ ] **ARC-02**: 归档数据 JSON 生成（构建时）
- [ ] **ARC-03**: 时间归档页（年份时间线 + 月度列表）
- [ ] **ARC-04**: 标签归档页（标签列表 + 文章关联）
- [ ] **ARC-05**: 分类归档页（分类树形结构）
- [ ] **ARC-06**: 全部文章列表页（支持筛选）

### Markdown Extensions (Markdown 扩展)

- [ ] **MDX-01**: Mermaid 流程图支持（flowchart, sequence, gantt 等）
- [ ] **MDX-02**: 数学公式支持（LaTeX 语法，$...$ 和 $$...$$）
- [ ] **MDX-03**: 脚注支持（[^1] 语法）
- [ ] **MDX-04**: 代码行号显示
- [ ] **MDX-05**: 代码一键复制按钮

### UX Enhancements (用户体验)

- [ ] **UX-01**: 回到顶部按钮（滚动出现，平滑动画）
- [ ] **UX-02**: 阅读进度条（页面顶部）
- [ ] **UX-03**: 目录高亮跟随（当前阅读章节）
- [ ] **UX-04**: 自定义滚动条样式（暗/亮主题适配）

### Deployment (部署)

- [ ] **DEP-01**: GitHub Actions CI/CD 配置
- [ ] **DEP-02**: GitHub Pages 部署
- [ ] **DEP-03**: Vercel 部署（备用/预览）
- [ ] **DEP-04**: sitemap.xml 生成
- [ ] **DEP-05**: robots.txt 配置
- [ ] **DEP-06**: Open Graph + Twitter Card 元标签

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Enhanced Archive (增强归档)

- **EARC-01**: 标签云可视化（热门标签高亮/大字号）
- **EARC-02**: 分类树交互展开/折叠
- **EARC-03**: 分类 RSS feed（按分类订阅）
- **EARC-04**: 高级筛选（日期范围、多标签组合）

### Content Features (内容功能)

- **CONT-01**: 阅读时间估算
- [ ] **CONT-02**: 相关文章推荐
- [ ] **CONT-03**: 文章系列/多部分支持
- [ ] **CONT-04**: 置顶文章功能（frontmatter sticky 字段）

### Analytics (分析)

- **ANL-01**: 搜索使用分析
- **ANL-02**: 页面访问统计集成（Plausible/GA4）

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| 移动端手势导航 | 非核心体验，Web 响应式已足够 |
| 多语言国际化 (i18n) | 初期专注中文内容，英文版后续扩展 |
| OAuth 第三方登录 | Giscus 已基于 GitHub 登录 |
| 视频内容托管 | 存储带宽成本高，与文字博客定位不符 |
| 实时聊天功能 | 评论系统已足够，复杂度高 |
| 用户账户系统 | 无个性化需求，增加大量复杂性 |
| 邮件订阅系统 | RSS 已满足订阅需求，邮件需额外基础设施 |
| PDF 导出 | 浏览器打印功能可替代 |
| 文章表情反应 | 评论互动更有价值 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status | Success Criteria |
|-------------|-------|--------|------------------|
| FND-01 | Phase 1 | Pending | VitePress dev server starts |
| FND-02 | Phase 1 | Pending | Directory structure defined |
| FND-03 | Phase 1 | Pending | Theme extension configured |
| FND-04 | Phase 1 | Pending | Frontmatter standard defined |
| FND-05 | Phase 1 | Pending | Frontmatter validation works |
| FND-06 | Phase 1 | Pending | Base path configures correctly |
| FND-07 | Phase 1 | Pending | Dark mode toggle works |
| NAV-01 | Phase 2 | Pending | Auto-nav reflects directory changes |
| NAV-02 | Phase 2 | Pending | Auto-sidebar shows hierarchy |
| NAV-03 | Phase 2 | Pending | _meta.json overrides work |
| NAV-04 | Phase 2 | Pending | Order field sorts correctly |
| SCH-01 | Phase 3 | Pending | DocSearch configured |
| SCH-02 | Phase 3 | Pending | Ask AI returns answers |
| SCH-03 | Phase 3 | Pending | Local fallback works |
| SCH-04 | Phase 3 | Pending | Search weighting works |
| CMT-01 | Phase 4 | Pending | Giscus comments load |
| CMT-02 | Phase 4 | Pending | Theme sync works |
| CMT-03 | Phase 4 | Pending | Lazy loading works |
| CMT-04 | Phase 4 | Pending | Language switching works |
| RSS-01 | Phase 4 | Pending | RSS feed valid |
| RSS-02 | Phase 4 | Pending | Atom feed valid |
| RSS-03 | Phase 4 | Pending | Subscribe page exists |
| MDX-01 | Phase 5 | Pending | Mermaid diagrams render |
| MDX-02 | Phase 5 | Pending | Math equations render |
| MDX-03 | Phase 5 | Pending | Footnotes work |
| MDX-04 | Phase 5 | Pending | Code line numbers show |
| MDX-05 | Phase 5 | Pending | Copy button works |
| ARC-01 | Phase 6 | Pending | Metadata extraction works |
| ARC-02 | Phase 6 | Pending | Archive JSON generated |
| ARC-03 | Phase 6 | Pending | Timeline view works |
| ARC-04 | Phase 6 | Pending | Tags view works |
| ARC-05 | Phase 6 | Pending | Categories view works |
| ARC-06 | Phase 6 | Pending | All articles page works |
| UX-01 | Phase 7 | Pending | Back-to-top button works |
| UX-02 | Phase 7 | Pending | Progress bar updates |
| UX-03 | Phase 7 | Pending | TOC highlight follows scroll |
| UX-04 | Phase 7 | Pending | Scrollbar styled |
| DEP-01 | Phase 8 | Pending | CI/CD workflow runs |
| DEP-02 | Phase 8 | Pending | GitHub Pages deploys |
| DEP-03 | Phase 8 | Pending | Vercel deploys |
| DEP-04 | Phase 8 | Pending | Sitemap generated |
| DEP-05 | Phase 8 | Pending | Robots.txt configured |
| DEP-06 | Phase 8 | Pending | OG/Twitter cards render |

**Coverage:**
- v1 requirements: 43 total
- Mapped to phases: 43
- Unmapped: 0

---
*Requirements defined: 2026-04-02*
*Last updated: 2026-04-02 after roadmap creation*
