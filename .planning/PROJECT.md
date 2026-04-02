# VitePress 技术博客与开源文档站

## What This Is

基于 VitePress 构建的多功能技术内容平台，融合三大身份：个人技术博客（后端/AI/全栈领域）、教学笔记库、开源项目官方文档托管站。面向技术同行、学生和开源项目用户，提供 AI 驱动的智能内容发现和极致阅读体验。

## Core Value

**AI 驱动的智能内容发现** — 通过 Algolia Ask AI 实现问答式检索，让用户快速找到有价值的内容。如果搜索体验不好，用户无法发现内容，其他功能再好也无意义。

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] VitePress 基础框架搭建（项目初始化、目录结构、基础配置）
- [ ] Algolia DocSearch + Ask AI 搜索配置
- [ ] Markdown 扩展支持（Mermaid 流程图、数学公式、脚注、代码高亮）
- [ ] 自动导航栏/侧边栏生成（扫描 docs 目录结构自动映射）
- [ ] Giscus 评论系统集成（GitHub Discussions、主题跟随、懒加载）
- [ ] RSS 订阅系统（全站 RSS + 分类 RSS）
- [ ] 三维度归档系统（时间线视图、标签云、分类树）
- [ ] 用户体验优化（回到顶部、阅读进度条、滚动条美化、目录高亮）
- [ ] GitHub Pages + Vercel 双部署配置
- [ ] GitHub Actions CI/CD 自动部署流程

### Out of Scope

- **移动端手势导航** — 非核心体验，Web 响应式已足够满足移动端需求
- **多语言国际化 (i18n)** — 初期专注中文内容，英文版可后续扩展
- **OAuth 第三方登录** — Giscus 已基于 GitHub 登录，无需额外 OAuth
- **视频内容支持** — 存储带宽成本高，与文字博客定位不符
- **实时聊天功能** — 评论系统已足够，复杂度高且非核心

## Context

**技术背景**：
- 用户为后端/AI/全栈领域开发者，维护个人开源项目
- 需要统一平台管理多种内容形态，避免多站点分散维护
- VitePress 官方原生支持 Algolia Ask AI，配置成本低

**内容规划**：
- 内容领域：后端、AI、计算机基础、全栈
- 内容规模：数百篇文章起步
- 组织策略：全部内容放在 `/docs` 目录，通过导航栏区分博客与项目文档

**已知技术决策**：
- 搜索方案：Algolia Ask AI（官网同款）
- 评论方案：Giscus（GitHub Discussions 集成）
- 部署方案：GitHub Pages 主部署 + Vercel 备用/预览

**待解决问题**：
- 自动导航生成需调研现有插件或自定义脚本实现
- 三维度归档 UI 需 Vue 组件开发
- Algolia Ask AI 需申请 Assistant ID 配置

## Constraints

- **Tech Stack**: VitePress (Vue 3 + Vite) — 用户明确指定
- **部署平台**: GitHub Pages + Vercel — 双部署策略
- **内容标准**: 所有文章必须有 frontmatter（title, date, categories, tags）
- **性能目标**: Lighthouse 评分 ≥ 90，首屏加载 < 1.5s
- **兼容性**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+，响应式 320px-2560px

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Algolia Ask AI 搜索 | VitePress 官网同款，原生支持，AI 问答式检索体验最佳 | — Pending |
| 全部内容放 /docs 目录 | 统一管理，通过导航区分区域，简化结构 | — Pending |
| 归档 UI 一步到位 | 用户明确要求"要做就做最好" | — Pending |
| GitHub Pages + Vercel 双部署 | 主部署稳定可靠，备用平台提供 PR 预览能力 | — Pending |
| Giscus 评论系统 | GitHub Discussions 集成，开发者社区标配，登录门槛低 | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-02 after initialization*