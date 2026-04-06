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