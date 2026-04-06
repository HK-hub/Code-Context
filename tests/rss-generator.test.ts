import { describe, it, expect, beforeAll } from 'vitest'
import { scanMarkdownFiles, parseFrontmatter, shouldExclude, extractSummary } from '../docs/.vitepress/hooks/rss-generator'
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
    const frontmatter = { title: 'Draft', date: '2026-04-06', exclude: true }
    const result = shouldExclude('draft.md', frontmatter)
    expect(result).toBe(true)
  })

  it('should include valid files with all required fields', () => {
    const frontmatter = { title: 'Valid Article', date: '2026-04-06' }
    const result = shouldExclude('test.md', frontmatter)
    expect(result).toBe(false)
  })

  it('should include files with exclude=false', () => {
    const frontmatter = { title: 'Article', date: '2026-04-06', exclude: false }
    const result = shouldExclude('article.md', frontmatter)
    expect(result).toBe(false)
  })

  it('should include files without exclude field', () => {
    const frontmatter = { title: 'Article', date: '2026-04-06', categories: ['blog'] }
    const result = shouldExclude('test.md', frontmatter)
    expect(result).toBe(false)
  })
})

describe('RSS Generator - extractSummary', () => {
  it('should remove frontmatter from markdown', () => {
    const markdown = `---
title: Test Article
date: '2026-04-06'
---

# Content here`
    const result = extractSummary(markdown)
    expect(result).not.toContain('title')
    expect(result).not.toContain('date')
    expect(result).toContain('Content here')
  })

  it('should remove code blocks', () => {
    const markdown = `
Some text before.

\`\`\`javascript
const code = 'should be removed'
\`\`\`

Some text after.`
    const result = extractSummary(markdown)
    expect(result).not.toContain('const code')
    expect(result).toContain('Some text before')
    expect(result).toContain('Some text after')
  })

  it('should remove inline code', () => {
    const markdown = `Use the \`console.log()\` function for debugging.`
    const result = extractSummary(markdown)
    expect(result).toBe('Use the console.log() function for debugging.')
  })

  it('should remove images', () => {
    const markdown = `See the diagram ![Architecture](./image.png) for details.`
    const result = extractSummary(markdown)
    expect(result).not.toContain('![Architecture]')
    expect(result).toBe('See the diagram for details.')
  })

  it('should remove links but keep text', () => {
    const markdown = `Check [Official Docs](https://example.com) for more info.`
    const result = extractSummary(markdown)
    expect(result).not.toContain('https://example.com')
    expect(result).toBe('Check Official Docs for more info.')
  })

  it('should remove headers markers', () => {
    const markdown = `# Main Title
## Subsection
### Details`
    const result = extractSummary(markdown)
    expect(result).not.toContain('#')
    expect(result).toContain('Main Title')
    expect(result).toContain('Subsection')
  })

  it('should remove bold markers', () => {
    const markdown = `This is **important** and __critical__ information.`
    const result = extractSummary(markdown)
    expect(result).toBe('This is important and critical information.')
  })

  it('should remove italic markers', () => {
    const markdown = `This is *emphasized* and _highlighted_ text.`
    const result = extractSummary(markdown)
    expect(result).toBe('This is emphasized and highlighted text.')
  })

  it('should remove HTML tags', () => {
    const markdown = `Use <strong>strong</strong> and <em>emphasis</em> tags.`
    const result = extractSummary(markdown)
    expect(result).not.toContain('<strong>')
    expect(result).not.toContain('<em>')
    expect(result).toContain('strong')
  })

  it('should clean up whitespace and limit length', () => {
    const markdown = `
Paragraph one.

Paragraph   two.

Paragraph three with lots of words to exceed the limit.`
    const result = extractSummary(markdown)
    expect(result).not.toContain('\n\n')
    expect(result).not.toContain('   ')
  })
})