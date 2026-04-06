# RSS订阅功能设计文档

**日期**: 2026-04-06  
**作者**: AI Assistant  
**状态**: 待审查

## 概述

为码出意境技术博客添加RSS订阅功能，实现全站内容订阅，并在导航栏添加RSS订阅图标。

### 核心需求

1. **RSS订阅源**: 提供RSS 2.0和Atom 1.0两种格式
2. **内容范围**: 包含全站所有markdown文章（博客、AI、后端、书籍、项目）
3. **摘要模式**: RSS只包含文章摘要（前200字符），不输出完整内容
4. **导航栏集成**: 在socialLinks中添加RSS订阅图标
5. **统一排除策略**: 支持frontmatter的`exclude`字段控制是否出现在RSS

## 技术方案

### 实现方案选择

**方案B: 自定义VitePress build hook**

使用VitePress的`buildEnd`钩子，在构建完成后生成RSS文件。

**优势**:
- 完全控制RSS生成逻辑
- 精确控制摘要内容提取
- 无第三方依赖，稳定性高
- 可适配项目特殊需求

**依赖库**:
- `feed@4.2.2` - RSS/Atom生成库
- `globby` - 文件扫描（已安装）
- `gray-matter` - Frontmatter解析（已安装）

## 架构设计

### 整体架构

```
构建流程中的RSS生成
┌─────────────────────────────────────────────────────┐
│ VitePress Build Process                             │
│                                                      │
│  1. 初始化配置 (config.ts)                           │
│  2. Markdown文件扫描                                 │
│  3. 构建HTML页面                                     │
│  4. buildEnd Hook ──────> RSS生成器                 │
│     ├── 扫描所有.md文件                              │
│     ├── 解析frontmatter元数据                       │
│     ├── 应用排除策略                                 │
│     ├── 提取文章摘要（前200字）                      │
│     ├── 生成RSS项                                    │
│     └── 输出XML文件                                  │
│         ├── /rss.xml (RSS 2.0)                      │
│         └── /atom.xml (Atom 1.0)                    │
│  5. 构建完成                                         │
└─────────────────────────────────────────────────────┘
```

### 文件结构

```
docs/.vitepress/
├── config.ts                  # 主配置，集成buildEnd hook
├── hooks/
│   └── rss-generator.ts       # RSS生成核心模块（新增）
├── utils/
│   └── markdown-parser.ts     # Markdown解析工具（复用现有）
└── theme/
    └── index.ts               # 主题配置
```

## 核心模块设计

### RSS生成器 (rss-generator.ts)

#### 数据结构

```typescript
interface RSSConfig {
  title: string
  description: string
  baseUrl: string
  author: string
  language: string
}

interface FeedItem {
  title: string
  link: string
  description: string  // 摘要（前200字）
  date: Date
  categories?: string[]
  tags?: string[]
  author?: string
}

interface Frontmatter {
  title: string
  date: string | Date
  categories?: string[]
  tags?: string[]
  description?: string
  author?: string
  exclude?: boolean  // 统一排除控制字段
}
```

#### 核心函数

**1. generateRSS(config: RSSConfig): Promise<void>**
- 创建Feed实例（支持RSS 2.0 + Atom）
- 调用scanMarkdownFiles()
- 调用parseFeedItems()
- 输出rss.xml和atom.xml

**2. scanMarkdownFiles(): Promise<string[]>**
- 使用globby扫描`docs/**/*.md`
- 排除特殊文件：README.md, TODO.md, index.md
- 排除非内容目录：.vitepress/, tests/
- 返回markdown文件路径列表

**3. parseFeedItems(files: string[]): FeedItem[]**
- 使用gray-matter解析frontmatter
- 验证必需字段：title, date
- 应用排除策略（exclude字段）
- 提取摘要：移除markdown语法，取前200字符
- 构建FeedItem对象数组

**4. extractSummary(content: string): string**
- 移除markdown语法（标题、链接、代码块等）
- 清理HTML标签（如果有）
- 截取前200字符
- 返回纯文本摘要

**5. shouldExclude(filePath: string, frontmatter: Frontmatter): boolean**
- 必需字段检查：缺少title或date则排除
- 显式排除标记：`exclude === true` 则排除
- 统一排除策略，未来可复用于sidebar生成

#### 摘要提取算法

```typescript
function extractSummary(markdown: string): string {
  // 1. 移除frontmatter（已解析，无需处理）
  // 2. 移除markdown语法：
  //    - 标题标记：# ## ### → 空格
  //    - 链接：[text](url) → text
  //    - 图片：![alt](url) → 空字符串
  //    - 代码块：```code``` → 空字符串
  //    - 粗体/斜体：**text** _text_ → text
  // 3. 移除HTML标签（如果有）
  // 4. 清理多余空白和换行
  // 5. 截取前200字符
  // 6. 返回摘要文本
}
```

### 文件过滤规则

**包含范围**:
- `docs/blog/**/*.md` - 博客文章
- `docs/ai/**/*.md` - AI相关文章
- `docs/backend/**/*.md` - 后端相关文章
- `docs/books/**/*.md` - 书籍笔记
- `docs/projects/**/*.md` - 项目文档

**排除规则**:
- `docs/.vitepress/**/*.md`
- `tests/**/*.md`
- `**/README.md`
- `**/TODO.md`
- `**/index.md` (目录索引页)
- 缺少必需frontmatter字段的文件（title, date）
- `frontmatter.exclude === true` 的文件

### 排除策略设计

#### Frontmatter扩展

```markdown
---
title: 草稿文章 - 未完成
date: 2026-04-06
exclude: true  # 统一排除控制字段
categories:
  - draft
---

# 草稿内容
这篇文章还在编写中...
```

**exclude字段用途**:
- `exclude: true` → 不出现在sidebar
- `exclude: true` → 不出现在RSS订阅
- `exclude: true` → 不出现在搜索索引（可选）

**应用场景**:
1. 临时草稿文章（未完成）
2. 测试/示例文章
3. 私有笔记（暂不公开）
4. 过期内容（已废弃）

## 导航栏集成

### SocialLinks配置

项目已使用`@iconify/vue`图标库，但VitePress的`socialLinks`只支持预设图标或自定义SVG。

**方案**: 使用Iconify图标（mdi:rss）的SVG代码

```typescript
// docs/.vitepress/config.ts

const rssSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path fill="currentColor" d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44M4 10.1A9.9 9.9 0 0 1 13.9 20h-2.83A7.07 7.07 0 0 0 4 12.93V10.1Z"/>
</svg>`

themeConfig: {
  socialLinks: [
    { icon: 'github', link: 'https://github.com/HK-hub' },
    {
      icon: { svg: rssSVG },
      link: '/rss.xml',
      ariaLabel: 'RSS订阅 - 获取最新文章更新'
    }
  ]
}
```

**优势**:
- 使用Iconify图标（mdi:rss）的SVG代码
- 符合VitePress官方规范
- 与项目已使用的Iconify图标库保持一致
- 简单配置，无需自定义组件
- 自动继承VitePress主题样式

### Head元数据

在`head`中添加RSS autodiscovery链接，让浏览器和阅读器自动发现订阅源：

```typescript
head: [
  ['link', { 
    rel: 'alternate', 
    type: 'application/rss+xml', 
    title: '码出意境 - RSS订阅', 
    href: '/rss.xml' 
  }],
  ['link', { 
    rel: 'alternate', 
    type: 'application/atom+xml', 
    title: '码出意境 - Atom订阅', 
    href: '/atom.xml' 
  }]
]
```

**效果**:
- 浏览器地址栏显示RSS图标（自动发现）
- RSS阅读器可直接检测订阅源
- 用户无需手动输入订阅链接

## Config.ts集成

```typescript
// docs/.vitepress/config.ts

import { generateRSS } from './hooks/rss-generator'

const rssSVG = `...` // RSS图标SVG

const config: UserConfig = {
  // 现有配置保持不变...
  
  buildEnd: async (siteConfig) => {
    console.log('[VitePress] Generating RSS feeds...')
    
    const rssConfig = {
      title: siteConfig.siteConfig.title,
      description: siteConfig.siteConfig.description,
      baseUrl: hostname,
      author: 'HK-hub',
      language: 'zh-CN'
    }
    
    await generateRSS(rssConfig)
    
    console.log('[VitePress] RSS feeds generated successfully')
  },
  
  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/HK-hub' },
      {
        icon: { svg: rssSVG },
        link: '/rss.xml',
        ariaLabel: 'RSS订阅 - 获取最新文章更新'
      }
    ]
  },
  
  head: [
    // RSS autodiscovery
    ['link', { rel: 'alternate', type: 'application/rss+xml', title: '码出意境 - RSS订阅', href: '/rss.xml' }],
    ['link', { rel: 'alternate', type: 'application/atom+xml', title: '码出意境 - Atom订阅', href: '/atom.xml' }]
  ]
}
```

## 构建流程

```bash
npm run docs:build

执行步骤：
1. VitePress初始化配置
2. 扫描markdown文件，生成HTML页面
3. buildEnd钩子触发
   ├─ 调用generateRSS()
   ├─ 扫描所有.md文件
   ├─ 解析frontmatter元数据
   ├─ 应用排除策略（exclude字段）
   ├─ 提取文章摘要（前200字符）
   ├─ 按日期排序
   ├─ 生成RSS 2.0 → docs/.vitepress/dist/rss.xml
   └─ 生成Atom 1.0 → docs/.vitepress/dist/atom.xml
4. 复制静态资源到dist目录
5. 构建完成

输出文件：
docs/.vitepress/dist/
├── index.html
├── rss.xml          # RSS 2.0订阅源
├── atom.xml         # Atom 1.0订阅源
└── ...
```

## 环境适配

RSS链接根据部署环境动态调整：

```typescript
const hostname = process.env.GITHUB_PAGES === 'true'
  ? 'https://hk-hub.github.io/code-context'
  : process.env.VERCEL === '1'
    ? 'https://code-context.vercel.app'
    : 'http://localhost:5173'

// RSS配置中的baseUrl会自动适配：
// - GitHub Pages: https://hk-hub.github.io/code-context/rss.xml
// - Vercel: https://code-context.vercel.app/rss.xml
// - Local: http://localhost:5173/rss.xml
```

## 错误处理

```typescript
export async function generateRSS(config: RSSConfig): Promise<void> {
  try {
    console.log('[RSS] Starting RSS generation...')
    
    const files = await scanMarkdownFiles()
    console.log(`[RSS] Found ${files.length} markdown files`)
    
    const validItems = parseAndFilterItems(files)
    console.log(`[RSS] Valid items: ${validItems.length}`)
    console.log(`[RSS] Excluded items: ${files.length - validItems.length}`)
    
    const feed = createFeed(config, validItems)
    await writeRSSFiles(feed)
    
    console.log('[RSS] RSS feeds generated successfully')
    
  } catch (error) {
    console.error('[RSS] Error generating RSS feeds:', error)
    // 不中断构建流程，继续完成其他步骤
  }
}
```

## 测试策略

### 功能测试清单

**scanMarkdownFiles()**
- ✓ 正确扫描docs目录下所有.md文件
- ✓ 排除.vitepress、tests等非内容目录
- ✓ 排除README.md、TODO.md、index.md
- ✓ 返回正确的文件路径数组

**parseFrontmatter()**
- ✓ 正确解析yaml格式frontmatter
- ✓ 提取title、date、categories、tags等字段
- ✓ 处理缺失字段的情况
- ✓ 处理日期格式（字符串转Date对象）

**shouldExclude()**
- ✓ 排除缺少title的文件
- ✓ 排除缺少date的文件
- ✓ 排除exclude=true的文件
- ✓ 包含正常文件（所有必需字段完整）

**extractSummary()**
- ✓ 移除markdown标题标记（# ## ###）
- ✓ 移除链接语法（[text](url) → text）
- ✓ 移除图片语法（![alt](url) → 空）
- ✓ 移除代码块（```code``` → 空）
- ✓ 移除粗体/斜体标记（**text** → text）
- ✓ 清理多余空白和换行
- ✓ 正确截取前200字符
- ✓ 保留中文和英文字符

**generateRSS()**
- ✓ 生成有效的RSS 2.0 XML文件
- ✓ 生成有效的Atom 1.0 XML文件
- ✓ 文章按日期倒序排列
- ✓ 包含正确的站点元数据
- ✓ 包含所有必需的RSS字段

### 验证方法

#### 本地开发验证

```bash
npm run docs:dev

验证点：
✓ 访问 http://localhost:5173/rss.xml
✓ 访问 http://localhost:5173/atom.xml
✓ 查看导航栏RSS图标显示
✓ 点击RSS图标跳转到/rss.xml
✓ 浏览器显示RSS XML内容
✓ RSS内容包含正确的站点元数据
✓ 每个item有title、link、description、pubDate
```

#### 构建验证

```bash
npm run docs:build

验证点：
✓ 构建日志显示"RSS feeds generated successfully"
✓ docs/.vitepress/dist/rss.xml 存在
✓ docs/.vitepress/dist/atom.xml 存在
✓ XML文件格式正确（无语法错误）
✓ 文件大小合理（< 1MB）

npm run docs:preview

验证点：
✓ 访问 http://localhost:4173/rss.xml
✓ 访问 http://localhost:4173/atom.xml
✓ RSS阅读器可识别订阅源
```

#### RSS阅读器测试

测试工具：
1. 浏览器RSS扩展
   - Chrome: RSS Feed Reader
   - Firefox: 内置RSS预览

2. 桌面RSS阅读器
   - Feedly (https://feedly.com)
   - Inoreader (https://inoreader.com)

3. 在线验证工具
   - W3C Feed Validator: https://validator.w3.org/feed/
   - RSS Validator: https://www.rssboard.org/rss-validator/

验证步骤：
1. 复制RSS链接
2. 在RSS阅读器中添加订阅
3. 确认订阅标题、站点描述、文章列表正确显示

#### 部署环境验证

**GitHub Pages**:
```bash
npm run docs:build
# 设置 BASE_URL=/code-context/

验证：
✓ RSS链接: https://hk-hub.github.io/code-context/rss.xml
✓ Atom链接: https://hk-hub.github.io/code-context/atom.xml
✓ 文章链接包含正确的基础路径
✓ RSS图标在导航栏正确显示
```

**Vercel**:
```bash
git push origin main
# Vercel自动部署

验证：
✓ RSS链接: https://code-context.vercel.app/rss.xml
✓ Atom链接: https://code-context.vercel.app/atom.xml
✓ 文章链接使用Vercel域名
✓ RSS图标正确显示
```

### 验收标准

**功能完整性**:
- ✅ RSS 2.0和Atom 1.0格式文件成功生成
- ✅ 包含所有markdown文章（排除策略生效）
- ✅ 摘要正确提取（前200字符）
- ✅ 文章按日期倒序排列

**导航栏集成**:
- ✅ RSS图标正确显示（mdi:rss图标）
- ✅ 点击跳转到/rss.xml
- ✅ 图标样式与其他社交图标一致
- ✅ 无障碍标签（ariaLabel）正确

**RSS标准合规**:
- ✅ W3C Feed Validator验证通过
- ✅ RSS阅读器可成功订阅
- ✅ 文章链接可正常访问
- ✅ 元数据完整（title、description、link等）

**环境适配**:
- ✅ 本地开发环境正确
- ✅ GitHub Pages路径正确
- ✅ Vercel域名正确
- ✅ 不影响构建流程

**排除策略**:
- ✅ exclude=true的文章不出现在RSS
- ✅ 缺少必需字段的文章被排除
- ✅ 日志正确记录排除信息

**性能**:
- ✅ 构建时间增加 < 5秒
- ✅ RSS文件大小 < 1MB
- ✅ 不影响页面加载速度

## 实施计划

### 依赖安装

```bash
npm install --save-dev feed@^4.2.2
```

### 开发任务

1. **创建RSS生成器模块** (`docs/.vitepress/hooks/rss-generator.ts`)
   - 实现scanMarkdownFiles()
   - 实现parseFrontmatter()
   - 实现shouldExclude()
   - 实现extractSummary()
   - 实现generateRSS()

2. **集成到config.ts**
   - 导入generateRSS
   - 添加buildEnd钩子
   - 添加RSS图标到socialLinks
   - 添加RSS autodiscovery到head

3. **测试验证**
   - 本地开发验证
   - 构建验证
   - RSS阅读器测试
   - 部署环境验证

4. **文档更新**
   - 更新README.md说明RSS功能
   - 更新frontmatter文档说明exclude字段

## 风险与缓解

**风险1**: RSS生成失败影响构建
- **缓解**: 错误处理不中断构建流程，记录日志

**风险2**: 摘要提取不完整
- **缓解**: 编写充分的单元测试，覆盖各种markdown语法

**风险3**: 大量文章导致RSS文件过大
- **缓解**: 限制RSS项数量（如最近100篇），或提供分页RSS

**风险4**: 排除策略与其他功能冲突
- **缓解**: exclude字段设计为统一控制，未来可扩展更多用途

## 后续优化

1. **分页RSS**: 当文章数量超过100篇时，提供分页RSS订阅
2. **分类RSS**: 提供按分类订阅的功能（如单独订阅AI文章）
3. **全文RSS选项**: 通过frontmatter字段控制特定文章输出全文
4. **RSS样式**: 添加XSLT样式表，让RSS在浏览器中更美观
5. **订阅统计**: 集成分析工具统计RSS订阅情况

## 参考资料

- [VitePress官方文档 - SocialLinks](https://vitepress.dev/zh/reference/default-theme-config#sociallinks)
- [Feed库文档](https://github.com/jpmonette/feed)
- [RSS 2.0规范](https://www.rssboard.org/rss-specification)
- [Atom 1.0规范](https://tools.ietf.org/html/rfc4287)
- [W3C Feed验证器](https://validator.w3.org/feed/)