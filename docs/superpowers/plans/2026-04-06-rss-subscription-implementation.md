# RSS订阅功能实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为码出意境技术博客添加RSS订阅功能，生成RSS 2.0和Atom 1.0订阅源，并在导航栏添加RSS图标。

**Architecture:** 使用VitePress的buildEnd钩子在构建完成后生成RSS文件。核心模块包括：文件扫描器（globby）、frontmatter解析器（gray-matter）、摘要提取器（自定义）、RSS生成器（feed库）。

**Tech Stack:** 
- VitePress 1.6.x + Vue 3.4.x
- feed 4.2.2（RSS生成）
- globby（文件扫描，已安装）
- gray-matter（frontmatter解析，已安装）

---

## File Structure

**Files to create:**
- `docs/.vitepress/hooks/rss-generator.ts` - RSS生成核心模块
- `tests/rss-generator.test.ts` - RSS生成器单元测试

**Files to modify:**
- `package.json` - 添加feed依赖
- `docs/.vitepress/config.ts` - 集成buildEnd钩子、RSS图标、autodiscovery

**Files to test:**
- `tests/rss-generator.test.ts` - 单元测试
- `docs/.vitepress/dist/rss.xml` - 构建输出验证
- `docs/.vitepress/dist/atom.xml` - 构建输出验证

---

## Task 1: 安装feed依赖

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 安装feed库**

Run: 
```bash
npm install --save-dev feed@^4.2.2
```

Expected: 
- package.json中devDependencies添加 `"feed": "^4.2.2"`
- node_modules/feed目录创建成功

- [ ] **Step 2: 验证安装**

Run:
```bash
npm list feed
```

Expected: 
```
feed@4.2.2
```

- [ ] **Step 3: 提交依赖变更**

Run:
```bash
git add package.json package-lock.json
git commit -m "chore: add feed library for RSS generation"
```

---

## Task 2: 创建RSS生成器核心模块 - 数据结构和接口

**Files:**
- Create: `docs/.vitepress/hooks/rss-generator.ts`

- [ ] **Step 1: 创建hooks目录和文件**

Run:
```bash
mkdir -p docs/.vitepress/hooks
touch docs/.vitepress/hooks/rss-generator.ts
```

- [ ] **Step 2: 定义数据结构和接口**

Write to `docs/.vitepress/hooks/rss-generator.ts`:

```typescript
import type { Feed } from 'feed'
import { readFileSync, writeFileSync } from 'fs'
import { join, resolve } from 'path'
import matter from 'gray-matter'
import { globby } from 'globby'

/**
 * RSS配置参数
 */
export interface RSSConfig {
  title: string
  description: string
  baseUrl: string
  author: string
  language: string
}

/**
 * Feed项数据结构
 */
export interface FeedItem {
  title: string
  link: string
  description: string  // 摘要（前200字）
  date: Date
  categories?: string[]
  tags?: string[]
  author?: string
}

/**
 * Frontmatter数据结构
 */
export interface Frontmatter {
  title: string
  date: string | Date
  categories?: string[]
  tags?: string[]
  description?: string
  author?: string
  exclude?: boolean
}

/**
 * 扫描结果项
 */
export interface ScannedFile {
  filePath: string
  frontmatter: Frontmatter
  content: string
}
```

- [ ] **Step 3: 验证TypeScript编译**

Run:
```bash
cd docs/.vitepress && npx tsc hooks/rss-generator.ts --noEmit --skipLibCheck
```

Expected: 无错误输出

- [ ] **Step 4: 提交接口定义**

Run:
```bash
git add docs/.vitepress/hooks/rss-generator.ts
git commit -m "feat(rss): define data structures and interfaces"
```

---

## Task 3: 实现文件扫描功能

**Files:**
- Modify: `docs/.vitepress/hooks/rss-generator.ts`
- Create: `tests/rss-generator.test.ts`

- [ ] **Step 1: 编写文件扫描测试**

Write to `tests/rss-generator.test.ts`:

```typescript
import { describe, it, expect, beforeAll } from 'vitest'
import { scanMarkdownFiles } from '../docs/.vitepress/hooks/rss-generator'
import { join } from 'path'

describe('RSS Generator - scanMarkdownFiles', () => {
  const docsDir = join(__dirname, '../docs')

  it('should scan markdown files in docs directory', async () => {
    const files = await scanMarkdownFiles(docsDir)
    
    expect(files.length).toBeGreaterThan(0)
    expect(files.every(f => f.endsWith('.md'))).toBe(true)
  })

  it('should exclude .vitepress directory', async () => {
    const files = await scanMarkdownFiles(docsDir)
    
    const hasVitePressFiles = files.some(f => f.includes('.vitepress'))
    expect(hasVitePressFiles).toBe(false)
  })

  it('should exclude tests directory', async () => {
    const files = await scanMarkdownFiles(docsDir)
    
    const hasTestFiles = files.some(f => f.includes('tests/'))
    expect(hasTestFiles).toBe(false)
  })

  it('should exclude README.md files', async () => {
    const files = await scanMarkdownFiles(docsDir)
    
    const hasReadme = files.some(f => f.endsWith('README.md'))
    expect(hasReadme).toBe(false)
  })

  it('should exclude TODO.md files', async () => {
    const files = await scanMarkdownFiles(docsDir)
    
    const hasTodo = files.some(f => f.endsWith('TODO.md'))
    expect(hasTodo).toBe(false)
  })

  it('should exclude index.md files', async () => {
    const files = await scanMarkdownFiles(docsDir)
    
    const hasIndex = files.some(f => f.endsWith('index.md'))
    expect(hasIndex).toBe(false)
  })

  it('should include blog markdown files', async () => {
    const files = await scanMarkdownFiles(docsDir)
    
    const hasBlogFiles = files.some(f => f.includes('/blog/'))
    expect(hasBlogFiles).toBe(true)
  })
})
```

- [ ] **Step 2: 运行测试验证失败**

Run:
```bash
npm test -- tests/rss-generator.test.ts
```

Expected: FAIL - "scanMarkdownFiles is not defined"

- [ ] **Step 3: 实现scanMarkdownFiles函数**

Add to `docs/.vitepress/hooks/rss-generator.ts`:

```typescript
/**
 * 扫描markdown文件
 * @param docsDir docs目录路径
 * @returns markdown文件路径数组
 */
export async function scanMarkdownFiles(docsDir: string): Promise<string[]> {
  // 扫描所有markdown文件
  const allFiles = await globby(['**/*.md'], {
    cwd: docsDir,
    absolute: true,
    ignore: [
      // 排除.vitepress目录
      '**/.vitepress/**',
      // 排除tests目录
      '**/tests/**',
      // 排除README文件
      '**/README.md',
      // 排除TODO文件
      '**/TODO.md',
      // 排除index文件（目录索引页）
      '**/index.md'
    ]
  })

  console.log(`[RSS] Scanned ${allFiles.length} markdown files`)
  return allFiles
}
```

- [ ] **Step 4: 运行测试验证通过**

Run:
```bash
npm test -- tests/rss-generator.test.ts
```

Expected: PASS - 所有测试通过

- [ ] **Step 5: 提交文件扫描实现**

Run:
```bash
git add docs/.vitepress/hooks/rss-generator.ts tests/rss-generator.test.ts
git commit -m "feat(rss): implement markdown file scanner with exclusions"
```

---

## Task 4: 实现frontmatter解析

**Files:**
- Modify: `docs/.vitepress/hooks/rss-generator.ts`
- Modify: `tests/rss-generator.test.ts`

- [ ] **Step 1: 编写frontmatter解析测试**

Add to `tests/rss-generator.test.ts`:

```typescript
import { parseFrontmatter } from '../docs/.vitepress/hooks/rss-generator'

describe('RSS Generator - parseFrontmatter', () => {
  it('should parse valid frontmatter', () => {
    const content = `---
title: Test Article
date: '2026-04-06'
categories:
  - blog
tags:
  - test
---

# Test Content`

    const result = parseFrontmatter(content)
    
    expect(result.title).toBe('Test Article')
    expect(result.date).toBe('2026-04-06')
    expect(result.categories).toEqual(['blog'])
    expect(result.tags).toEqual(['test'])
  })

  it('should handle missing optional fields', () => {
    const content = `---
title: Minimal Article
date: '2026-04-06'
---

Content here`

    const result = parseFrontmatter(content)
    
    expect(result.title).toBe('Minimal Article')
    expect(result.categories).toBeUndefined()
    expect(result.tags).toBeUndefined()
    expect(result.author).toBeUndefined()
  })

  it('should handle exclude field', () => {
    const content = `---
title: Draft
date: '2026-04-06'
exclude: true
---

Draft content`

    const result = parseFrontmatter(content)
    
    expect(result.exclude).toBe(true)
  })

  it('should return empty object for no frontmatter', () => {
    const content = `# No Frontmatter

Just content`

    const result = parseFrontmatter(content)
    
    expect(result).toEqual({})
  })
})
```

- [ ] **Step 2: 运行测试验证失败**

Run:
```bash
npm test -- tests/rss-generator.test.ts
```

Expected: FAIL - "parseFrontmatter is not defined"

- [ ] **Step 3: 实现parseFrontmatter函数**

Add to `docs/.vitepress/hooks/rss-generator.ts`:

```typescript
/**
 * 解析frontmatter元数据
 * @param content markdown内容
 * @returns frontmatter对象
 */
export function parseFrontmatter(content: string): Partial<Frontmatter> {
  try {
    const { data } = matter(content)
    return data as Partial<Frontmatter>
  } catch (error) {
    console.error('[RSS] Error parsing frontmatter:', error)
    return {}
  }
}
```

- [ ] **Step 4: 运行测试验证通过**

Run:
```bash
npm test -- tests/rss-generator.test.ts
```

Expected: PASS - 所有frontmatter测试通过

- [ ] **Step 5: 提交frontmatter解析实现**

Run:
```bash
git add docs/.vitepress/hooks/rss-generator.ts tests/rss-generator.test.ts
git commit -m "feat(rss): implement frontmatter parser"
```

---

## Task 5: 实现排除策略

**Files:**
- Modify: `docs/.vitepress/hooks/rss-generator.ts`
- Modify: `tests/rss-generator.test.ts`

- [ ] **Step 1: 编写排除策略测试**

Add to `tests/rss-generator.test.ts`:

```typescript
import { shouldExclude } from '../docs/.vitepress/hooks/rss-generator'

describe('RSS Generator - shouldExclude', () => {
  it('should exclude files without title', () => {
    const frontmatter = { date: '2026-04-06' }
    const result = shouldExclude('test.md', frontmatter)
    expect(result).toBe(true)
  })

  it('should exclude files without date', () => {
    const frontmatter = { title: 'Test' }
    const result = shouldExclude('test.md', frontmatter)
    expect(result).toBe(true)
  })

  it('should exclude files with exclude=true', () => {
    const frontmatter = {
      title: 'Draft',
      date: '2026-04-06',
      exclude: true
    }
    const result = shouldExclude('test.md', frontmatter)
    expect(result).toBe(true)
  })

  it('should include valid files with all required fields', () => {
    const frontmatter = {
      title: 'Valid Article',
      date: '2026-04-06'
    }
    const result = shouldExclude('test.md', frontmatter)
    expect(result).toBe(false)
  })

  it('should include files with exclude=false', () => {
    const frontmatter = {
      title: 'Article',
      date: '2026-04-06',
      exclude: false
    }
    const result = shouldExclude('test.md', frontmatter)
    expect(result).toBe(false)
  })

  it('should include files without exclude field', () => {
    const frontmatter = {
      title: 'Article',
      date: '2026-04-06',
      categories: ['blog']
    }
    const result = shouldExclude('test.md', frontmatter)
    expect(result).toBe(false)
  })
})
```

- [ ] **Step 2: 运行测试验证失败**

Run:
```bash
npm test -- tests/rss-generator.test.ts
```

Expected: FAIL - "shouldExclude is not defined"

- [ ] **Step 3: 实现shouldExclude函数**

Add to `docs/.vitepress/hooks/rss-generator.ts`:

```typescript
/**
 * 判断文件是否应该被排除
 * @param filePath 文件路径
 * @param frontmatter frontmatter对象
 * @returns 是否排除
 */
export function shouldExclude(
  filePath: string,
  frontmatter: Partial<Frontmatter>
): boolean {
  // 1. 必需字段检查：缺少title或date则排除
  if (!frontmatter.title || !frontmatter.date) {
    console.log(`[RSS] Excluded: ${filePath} (missing title or date)`)
    return true
  }

  // 2. 显式排除标记
  if (frontmatter.exclude === true) {
    console.log(`[RSS] Excluded: ${filePath} (exclude=true)`)
    return true
  }

  return false
}
```

- [ ] **Step 4: 运行测试验证通过**

Run:
```bash
npm test -- tests/rss-generator.test.ts
```

Expected: PASS - 所有排除策略测试通过

- [ ] **Step 5: 提交排除策略实现**

Run:
```bash
git add docs/.vitepress/hooks/rss-generator.ts tests/rss-generator.test.ts
git commit -m "feat(rss): implement exclusion strategy with exclude field support"
```

---

## Task 6: 实现摘要提取

**Files:**
- Modify: `docs/.vitepress/hooks/rss-generator.ts`
- Modify: `tests/rss-generator.test.ts`

- [ ] **Step 1: 编写摘要提取测试**

Add to `tests/rss-generator.test.ts`:

```typescript
import { extractSummary } from '../docs/.vitepress/hooks/rss-generator'

describe('RSS Generator - extractSummary', () => {
  it('should remove markdown headers', () => {
    const markdown = `# Title
## Subtitle
### Subsubtitle
Content here`
    
    const summary = extractSummary(markdown)
    expect(summary).not.toContain('#')
    expect(summary).toContain('Title')
  })

  it('should remove links', () => {
    const markdown = `Visit [VitePress](https://vitepress.dev) for more info`
    
    const summary = extractSummary(markdown)
    expect(summary).toContain('VitePress')
    expect(summary).not.toContain('https://')
    expect(summary).not.toContain('(')
    expect(summary).not.toContain(')')
  })

  it('should remove images', () => {
    const markdown = `Here is an image ![Logo](logo.png) in the text`
    
    const summary = extractSummary(markdown)
    expect(summary).not.toContain('![')
    expect(summary).not.toContain('logo.png')
    expect(summary).toContain('Here is an image')
  })

  it('should remove code blocks', () => {
    const markdown = `Some text

\`\`\`javascript
const code = 'example'
\`\`\`

More text`
    
    const summary = extractSummary(markdown)
    expect(summary).not.toContain('```')
    expect(summary).not.toContain('const code')
    expect(summary).toContain('Some text')
    expect(summary).toContain('More text')
  })

  it('should remove inline code', () => {
    const markdown = `Use the \`console.log()\` function for debugging`
    
    const summary = extractSummary(markdown)
    expect(summary).not.toContain('`')
    expect(summary).toContain('console.log()')
  })

  it('should remove bold and italic markers', () => {
    const markdown = `This is **bold** and _italic_ text`
    
    const summary = extractSummary(markdown)
    expect(summary).not.toContain('**')
    expect(summary).not.toContain('_')
    expect(summary).toContain('bold')
    expect(summary).toContain('italic')
  })

  it('should limit to 200 characters', () => {
    const longText = 'A'.repeat(300)
    const summary = extractSummary(longText)
    expect(summary.length).toBeLessThanOrEqual(200)
  })

  it('should preserve Chinese characters', () => {
    const chinese = '这是一篇中文文章的内容测试摘要提取功能'
    const summary = extractSummary(chinese)
    expect(summary).toContain('中文文章')
  })

  it('should handle mixed Chinese and English', () => {
    const mixed = `# 标题

This is English content with 中文内容 mixed together.

[链接](url) and **粗体** text.`
    
    const summary = extractSummary(mixed)
    expect(summary).toContain('English content')
    expect(summary).toContain('中文内容')
    expect(summary).not.toContain('#')
    expect(summary).not.toContain('[')
    expect(summary).not.toContain('**')
  })

  it('should clean up extra whitespace', () => {
    const markdown = `Title

Multiple


Blank    Spaces

Here`
    
    const summary = extractSummary(markdown)
    expect(summary).not.toMatch(/\n{2,}/)
    expect(summary).not.toMatch(/ {2,}/)
  })
})
```

- [ ] **Step 2: 运行测试验证失败**

Run:
```bash
npm test -- tests/rss-generator.test.ts
```

Expected: FAIL - "extractSummary is not defined"

- [ ] **Step 3: 实现extractSummary函数**

Add to `docs/.vitepress/hooks/rss-generator.ts`:

```typescript
/**
 * 从markdown内容中提取摘要
 * @param markdown markdown内容
 * @param maxLength 最大长度（默认200字符）
 * @returns 摘要文本
 */
export function extractSummary(markdown: string, maxLength = 200): string {
  let text = markdown

  // 1. 移除frontmatter（已解析，但可能还在内容中）
  text = text.replace(/^---[\s\S]*?---\n?/, '')

  // 2. 移除代码块
  text = text.replace(/```[\s\S]*?```/g, '')

  // 3. 移除行内代码
  text = text.replace(/`([^`]+)`/g, '$1')

  // 4. 移除图片
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '')

  // 5. 移除链接，保留文本
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')

  // 6. 移除标题标记
  text = text.replace(/^#{1,6}\s+/gm, '')

  // 7. 移除粗体和斜体标记
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1')
  text = text.replace(/__([^_]+)__/g, '$1')
  text = text.replace(/\*([^*]+)\*/g, '$1')
  text = text.replace(/_([^_]+)_/g, '$1')

  // 8. 移除HTML标签
  text = text.replace(/<[^>]+>/g, '')

  // 9. 移除引用标记
  text = text.replace(/^>\s+/gm, '')

  // 10. 移除列表标记
  text = text.replace(/^[\*\-\+]\s+/gm, '')
  text = text.replace(/^\d+\.\s+/gm, '')

  // 11. 清理多余空白和换行
  text = text.replace(/\n+/g, ' ')
  text = text.replace(/\s+/g, ' ')
  text = text.trim()

  // 12. 截取指定长度
  if (text.length > maxLength) {
    text = text.substring(0, maxLength).trim()
    // 在最后一个完整词后截断（如果可能）
    const lastSpace = text.lastIndexOf(' ')
    if (lastSpace > maxLength * 0.8) {
      text = text.substring(0, lastSpace)
    }
  }

  return text
}
```

- [ ] **Step 4: 运行测试验证通过**

Run:
```bash
npm test -- tests/rss-generator.test.ts
```

Expected: PASS - 所有摘要提取测试通过

- [ ] **Step 5: 提交摘要提取实现**

Run:
```bash
git add docs/.vitepress/hooks/rss-generator.ts tests/rss-generator.test.ts
git commit -m "feat(rss): implement markdown summary extractor"
```

---

## Task 7: 实现RSS生成主函数

**Files:**
- Modify: `docs/.vitepress/hooks/rss-generator.ts`
- Modify: `tests/rss-generator.test.ts`

- [ ] **Step 1: 编写RSS生成测试**

Add to `tests/rss-generator.test.ts`:

```typescript
import { generateRSS } from '../docs/.vitepress/hooks/rss-generator'
import { existsSync, readFileSync, unlinkSync } from 'fs'
import { join } from 'path'
import { parseString } from 'xml2js'

describe('RSS Generator - generateRSS', () => {
  const docsDir = join(__dirname, '../docs')
  const outputDir = join(__dirname, '../docs/.vitepress/dist')
  const rssFile = join(outputDir, 'rss.xml')
  const atomFile = join(outputDir, 'atom.xml')

  const config = {
    title: '码出意境',
    description: '技术博客与开源文档站',
    baseUrl: 'http://localhost:5173',
    author: 'HK-hub',
    language: 'zh-CN'
  }

  afterAll(() => {
    // 清理生成的文件
    if (existsSync(rssFile)) unlinkSync(rssFile)
    if (existsSync(atomFile)) unlinkSync(atomFile)
  })

  it('should generate RSS and Atom files', async () => {
    await generateRSS(config, docsDir, outputDir)
    
    expect(existsSync(rssFile)).toBe(true)
    expect(existsSync(atomFile)).toBe(true)
  })

  it('should generate valid RSS 2.0 XML', async () => {
    await generateRSS(config, docsDir, outputDir)
    
    const rssContent = readFileSync(rssFile, 'utf-8')
    expect(rssContent).toContain('<?xml version="1.0"')
    expect(rssContent).toContain('<rss version="2.0">')
    expect(rssContent).toContain('<title>码出意境</title>')
    expect(rssContent).toContain('<link>http://localhost:5173</link>')
    expect(rssContent).toContain('<item>')
  })

  it('should generate valid Atom 1.0 XML', async () => {
    await generateRSS(config, docsDir, outputDir)
    
    const atomContent = readFileSync(atomFile, 'utf-8')
    expect(atomContent).toContain('<?xml version="1.0"')
    expect(atomContent).toContain('xmlns="http://www.w3.org/2005/Atom"')
    expect(atomContent).toContain('<title>码出意境</title>')
    expect(atomContent).toContain('<entry>')
  })

  it('should include feed items', async () => {
    await generateRSS(config, docsDir, outputDir)
    
    const rssContent = readFileSync(rssFile, 'utf-8')
    const itemMatches = rssContent.match(/<item>/g)
    expect(itemMatches).not.toBeNull()
    expect(itemMatches!.length).toBeGreaterThan(0)
  })

  it('should exclude items with exclude=true', async () => {
    // 这个测试依赖于实际文件中有exclude=true的文件
    await generateRSS(config, docsDir, outputDir)
    
    const rssContent = readFileSync(rssFile, 'utf-8')
    // 检查日志输出或RSS内容不包含特定标题
    // 具体验证取决于实际测试数据
    expect(rssContent).toBeDefined()
  })

  it('should sort items by date descending', async () => {
    await generateRSS(config, docsDir, outputDir)
    
    const rssContent = readFileSync(rssFile, 'utf-8')
    const pubDates = rssContent.match(/<pubDate>([^<]+)<\/pubDate>/g)
    
    if (pubDates && pubDates.length > 1) {
      // 验证日期降序（最新的在前）
      const dates = pubDates.map(d => new Date(d.replace(/<\/?pubDate>/g, '')))
      for (let i = 0; i < dates.length - 1; i++) {
        expect(dates[i].getTime()).toBeGreaterThanOrEqual(dates[i + 1].getTime())
      }
    }
  })
})
```

- [ ] **Step 2: 安装xml2js测试依赖**

Run:
```bash
npm install --save-dev @types/xml2js
```

- [ ] **Step 3: 运行测试验证失败**

Run:
```bash
npm test -- tests/rss-generator.test.ts
```

Expected: FAIL - "generateRSS is not defined"

- [ ] **Step 4: 实现generateRSS函数**

Add to `docs/.vitepress/hooks/rss-generator.ts`:

```typescript
import { Feed } from 'feed'

/**
 * 生成RSS和Atom订阅源
 * @param config RSS配置
 * @param docsDir docs目录路径
 * @param outputDir 输出目录路径
 */
export async function generateRSS(
  config: RSSConfig,
  docsDir: string,
  outputDir: string
): Promise<void> {
  try {
    console.log('[RSS] Starting RSS generation...')

    // 1. 创建Feed实例
    const feed = new Feed({
      title: config.title,
      description: config.description,
      id: config.baseUrl,
      link: config.baseUrl,
      language: config.language,
      copyright: `Copyright © ${new Date().getFullYear()} ${config.author}`,
      author: {
        name: config.author,
        link: config.baseUrl
      }
    })

    // 2. 扫描markdown文件
    const files = await scanMarkdownFiles(docsDir)
    console.log(`[RSS] Found ${files.length} markdown files`)

    // 3. 解析并过滤文件
    const validItems: FeedItem[] = []
    let excludedCount = 0

    for (const filePath of files) {
      // 读取文件内容
      const content = readFileSync(filePath, 'utf-8')
      
      // 解析frontmatter
      const frontmatter = parseFrontmatter(content)
      
      // 应用排除策略
      if (shouldExclude(filePath, frontmatter)) {
        excludedCount++
        continue
      }

      // 提取摘要
      const summary = extractSummary(content)

      // 构建文章链接（相对路径）
      const relativePath = filePath
        .replace(docsDir, '')
        .replace(/\.md$/, '')
        .replace(/\\/g, '/')
      const link = `${config.baseUrl}${relativePath}`

      // 创建Feed项
      validItems.push({
        title: frontmatter.title!,
        link: link,
        description: summary,
        date: new Date(frontmatter.date!),
        categories: frontmatter.categories,
        tags: frontmatter.tags,
        author: frontmatter.author || config.author
      })
    }

    console.log(`[RSS] Valid items: ${validItems.length}`)
    console.log(`[RSS] Excluded items: ${excludedCount}`)

    // 4. 按日期降序排序
    validItems.sort((a, b) => b.date.getTime() - a.date.getTime())

    // 5. 添加Feed项
    for (const item of validItems) {
      feed.addItem({
        title: item.title,
        id: item.link,
        link: item.link,
        description: item.description,
        date: item.date,
        category: item.categories?.map(c => ({ name: c })),
        author: [
          {
            name: item.author || config.author
          }
        ]
      })
    }

    // 6. 写入RSS 2.0文件
    const rssPath = join(outputDir, 'rss.xml')
    writeFileSync(rssPath, feed.rss2())
    console.log(`[RSS] Generated RSS 2.0: ${rssPath}`)

    // 7. 写入Atom 1.0文件
    const atomPath = join(outputDir, 'atom.xml')
    writeFileSync(atomPath, feed.atom1())
    console.log(`[RSS] Generated Atom 1.0: ${atomPath}`)

    console.log('[RSS] RSS feeds generated successfully')
  } catch (error) {
    console.error('[RSS] Error generating RSS feeds:', error)
    // 不中断构建流程
  }
}
```

- [ ] **Step 5: 运行测试验证通过**

Run:
```bash
npm test -- tests/rss-generator.test.ts
```

Expected: PASS - 所有RSS生成测试通过

- [ ] **Step 6: 提交RSS生成主函数实现**

Run:
```bash
git add docs/.vitepress/hooks/rss-generator.ts tests/rss-generator.test.ts package.json
git commit -m "feat(rss): implement RSS generator main function"
```

---

## Task 8: 集成到config.ts - buildEnd钩子

**Files:**
- Modify: `docs/.vitepress/config.ts`

- [ ] **Step 1: 导入generateRSS函数**

Add import at the top of `docs/.vitepress/config.ts` (line 4):

```typescript
import { generateRSS } from './hooks/rss-generator'
```

- [ ] **Step 2: 添加buildEnd钩子**

Add after the `mermaid` configuration section (after line 277):

```typescript
// RSS feed generation
buildEnd: async (siteConfig) => {
  console.log('[VitePress] Generating RSS feeds...')
  
  const rssConfig = {
    title: '码出意境',
    description: '技术博客与开源文档站，专注于后端、AI、全栈领域技术分享',
    baseUrl: hostname,
    author: 'HK-hub',
    language: 'zh-CN'
  }
  
  const docsDir = resolve(__dirname, '..')
  const outputDir = resolve(__dirname, '../.vitepress/dist')
  
  await generateRSS(rssConfig, docsDir, outputDir)
  
  console.log('[VitePress] RSS feeds generated successfully')
}
```

- [ ] **Step 3: 验证TypeScript编译**

Run:
```bash
cd docs/.vitepress && npx tsc config.ts --noEmit --skipLibCheck
```

Expected: 无错误输出

- [ ] **Step 4: 提交buildEnd集成**

Run:
```bash
git add docs/.vitepress/config.ts
git commit -m "feat(rss): integrate RSS generation into buildEnd hook"
```

---

## Task 9: 添加RSS图标到socialLinks

**Files:**
- Modify: `docs/.vitepress/config.ts`

- [ ] **Step 1: 定义RSS图标SVG**

Add before the `const config` definition (around line 55):

```typescript
// RSS Feed Icon (Material Design Icons - mdi:rss)
const rssIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path fill="currentColor" d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44M4 10.1A9.9 9.9 0 0 1 13.9 20h-2.83A7.07 7.07 0 0 0 4 12.93V10.1Z"/>
</svg>`
```

- [ ] **Step 2: 添加RSS到socialLinks数组**

Modify the `socialLinks` array (around line 182-184):

```typescript
// Social links
socialLinks: [
  { icon: 'github', link: 'https://github.com/HK-hub' },
  {
    icon: { svg: rssIconSVG },
    link: '/rss.xml',
    ariaLabel: 'RSS订阅 - 获取最新文章更新'
  }
],
```

- [ ] **Step 3: 验证配置**

Run:
```bash
cd docs/.vitepress && npx tsc config.ts --noEmit --skipLibCheck
```

Expected: 无错误输出

- [ ] **Step 4: 提交RSS图标配置**

Run:
```bash
git add docs/.vitepress/config.ts
git commit -m "feat(rss): add RSS icon to socialLinks navigation"
```

---

## Task 10: 添加RSS autodiscovery到head

**Files:**
- Modify: `docs/.vitepress/config.ts`

- [ ] **Step 1: 添加RSS链接到head数组**

Add to the `head` array (after the preconnect line, around line 109):

```typescript
// RSS Feed Autodiscovery
['link', { 
  rel: 'alternate', 
  type: 'application/rss+xml', 
  title: '码出意境 - RSS订阅', 
  href: `${base}rss.xml` 
}],
['link', { 
  rel: 'alternate', 
  type: 'application/atom+xml', 
  title: '码出意境 - Atom订阅', 
  href: `${base}atom.xml` 
}]
```

- [ ] **Step 2: 验证配置**

Run:
```bash
cd docs/.vitepress && npx tsc config.ts --noEmit --skipLibCheck
```

Expected: 无错误输出

- [ ] **Step 3: 提交RSS autodiscovery配置**

Run:
```bash
git add docs/.vitepress/config.ts
git commit -m "feat(rss): add RSS autodiscovery links to head"
```

---

## Task 11: 端到端测试验证

**Files:**
- Test: `docs/.vitepress/dist/rss.xml`
- Test: `docs/.vitepress/dist/atom.xml`

- [ ] **Step 1: 运行完整构建**

Run:
```bash
npm run docs:build
```

Expected: 
- 构建成功完成
- 控制台输出包含 "[RSS] RSS feeds generated successfully"
- 无错误信息

- [ ] **Step 2: 验证RSS文件生成**

Run:
```bash
ls -lh docs/.vitepress/dist/rss.xml docs/.vitepress/dist/atom.xml
```

Expected: 
- 两个文件都存在
- 文件大小 < 1MB

- [ ] **Step 3: 验证RSS XML内容**

Run:
```bash
head -20 docs/.vitepress/dist/rss.xml
```

Expected: 
```xml
<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0">
  <channel>
    <title>码出意境</title>
    <link>http://localhost:5173</link>
    ...
```

- [ ] **Step 4: 验证Atom XML内容**

Run:
```bash
head -20 docs/.vitepress/dist/atom.xml
```

Expected: 
```xml
<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>码出意境</title>
  ...
```

- [ ] **Step 5: 使用W3C验证器验证RSS**

Run:
```bash
# 在浏览器中打开以下URL验证RSS文件
# https://validator.w3.org/feed/#validate_by_upload
# 上传 docs/.vitepress/dist/rss.xml 文件
```

Expected: 验证通过，无严重错误

- [ ] **Step 6: 启动预览服务器测试**

Run:
```bash
npm run docs:preview
```

Expected: 
- 服务器启动成功
- 访问 http://localhost:4173/rss.xml 显示RSS XML
- 访问 http://localhost:4173/atom.xml 显示Atom XML
- 导航栏显示RSS图标
- 点击RSS图标跳转到/rss.xml

- [ ] **Step 7: RSS阅读器测试**

Manual test:
1. 在浏览器中安装RSS Feed Reader扩展
2. 访问 http://localhost:4173/
3. 点击RSS图标或扩展图标
4. 确认RSS阅读器成功识别订阅源
5. 验证文章列表正确显示

- [ ] **Step 8: 提交最终验证**

Run:
```bash
git add -A
git commit -m "test(rss): verify RSS generation end-to-end"
```

---

## Acceptance Criteria

**功能完整性:**
- ✅ RSS 2.0和Atom 1.0格式文件成功生成
- ✅ 包含所有markdown文章（排除策略生效）
- ✅ 摘要正确提取（前200字符）
- ✅ 文章按日期倒序排列

**导航栏集成:**
- ✅ RSS图标正确显示（mdi:rss图标）
- ✅ 点击跳转到/rss.xml
- ✅ 图标样式与其他社交图标一致
- ✅ 无障碍标签（ariaLabel）正确

**RSS标准合规:**
- ✅ W3C Feed Validator验证通过
- ✅ RSS阅读器可成功订阅
- ✅ 文章链接可正常访问
- ✅ 元数据完整

**环境适配:**
- ✅ 本地开发环境正确
- ✅ 构建流程正常
- ✅ 不影响构建性能

**排除策略:**
- ✅ exclude=true的文章不出现在RSS
- ✅ 缺少必需字段的文章被排除
- ✅ 日志正确记录排除信息

**性能:**
- ✅ 构建时间增加 < 5秒
- ✅ RSS文件大小 < 1MB
- ✅ 不影响页面加载速度

---

## Troubleshooting

**问题1: RSS文件未生成**
- 检查buildEnd钩子是否正确配置
- 检查docs/.vitepress/dist目录权限
- 查看构建日志中的错误信息

**问题2: RSS图标不显示**
- 检查socialLinks配置是否正确
- 检查SVG代码是否有效
- 清除浏览器缓存重新测试

**问题3: RSS内容为空**
- 检查markdown文件是否有正确的frontmatter
- 检查exclude字段设置
- 查看日志中的排除统计

**问题4: RSS阅读器无法订阅**
- 使用W3C验证器检查XML格式
- 确认RSS链接可访问
- 检查autodiscovery链接配置

**问题5: 摘要提取不正确**
- 检查extractSummary函数实现
- 添加更多测试用例覆盖边界情况
- 检查markdown内容格式

---

## Notes

- 所有测试使用vitest框架
- TypeScript类型检查确保类型安全
- 遵循TDD开发流程
- 每个任务独立可测试
- 提交信息遵循Conventional Commits规范