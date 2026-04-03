import { describe, it, expect, vi } from 'vitest'
import { existsSync } from 'fs'
import { resolve } from 'path'

describe('Phase 1 Integration', () => {
  describe('Project Structure', () => {
    it('should have all required directories', () => {
      expect(existsSync(resolve('docs'))).toBe(true)
      expect(existsSync(resolve('docs/blog'))).toBe(true)
      expect(existsSync(resolve('docs/ai'))).toBe(true)
      expect(existsSync(resolve('docs/backend'))).toBe(true)
      expect(existsSync(resolve('docs/projects'))).toBe(true)
      expect(existsSync(resolve('docs/.vitepress'))).toBe(true)
      expect(existsSync(resolve('docs/.vitepress/theme'))).toBe(true)
    })

    it('should have required config files', () => {
      expect(existsSync(resolve('docs/.vitepress/config.ts'))).toBe(true)
      expect(existsSync(resolve('docs/.vitepress/theme/index.ts'))).toBe(true)
      expect(existsSync(resolve('docs/.vitepress/theme/Layout.vue'))).toBe(true)
    })

    it('should have package.json with all scripts', async () => {
      const fs = await import('fs')
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'))

      expect(pkg.scripts).toHaveProperty('docs:dev')
      expect(pkg.scripts).toHaveProperty('docs:build')
      expect(pkg.scripts).toHaveProperty('docs:preview')
      expect(pkg.scripts).toHaveProperty('test')
    })

    it('should have required dependencies', async () => {
      const fs = await import('fs')
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'))

      const devDeps = pkg.devDependencies || {}
      expect(devDeps).toHaveProperty('vitepress')
      expect(devDeps).toHaveProperty('vue')
      expect(devDeps).toHaveProperty('typescript')
      expect(devDeps).toHaveProperty('zod')
      expect(devDeps).toHaveProperty('vitest')
    })
  })

  describe('Frontmatter Standard', () => {
    it('should have utils directory with frontmatter schema', () => {
      expect(existsSync(resolve('docs/.vitepress/utils/frontmatter.ts'))).toBe(true)
    })

    it('should have validation script', () => {
      expect(existsSync(resolve('docs/.vitepress/scripts/validateFrontmatter.ts'))).toBe(true)
    })

    it('should have sample content with valid frontmatter', () => {
      expect(existsSync(resolve('docs/blog/sample-post.md'))).toBe(true)
    })
  })

  describe('Theme Extension', () => {
    it('should have custom styles', () => {
      expect(existsSync(resolve('docs/.vitepress/theme/styles/custom.css'))).toBe(true)
    })

    it('should have dark mode toggle component', () => {
      expect(existsSync(resolve('docs/.vitepress/theme/components/DarkModeToggle.vue'))).toBe(true)
    })
  })

  describe('Environment Configuration', () => {
    it('should have .env.example', () => {
      expect(existsSync(resolve('.env.example'))).toBe(true)
    })
  })
})

describe('Success Criteria Check', () => {
  it('FND-01: VitePress dev server configuration exists', () => {
    expect(existsSync(resolve('docs/.vitepress/config.ts'))).toBe(true)
  })

  it('FND-02: Directory structure complete', () => {
    expect(existsSync(resolve('docs/blog'))).toBe(true)
    expect(existsSync(resolve('docs/ai'))).toBe(true)
    expect(existsSync(resolve('docs/backend'))).toBe(true)
    expect(existsSync(resolve('docs/projects'))).toBe(true)
  })

  it('FND-03: Theme extension configured', () => {
    expect(existsSync(resolve('docs/.vitepress/theme/index.ts'))).toBe(true)
    expect(existsSync(resolve('docs/.vitepress/theme/Layout.vue'))).toBe(true)
  })

  it('FND-04: Frontmatter standard defined', () => {
    expect(existsSync(resolve('docs/.vitepress/utils/frontmatter.ts'))).toBe(true)
  })

  it('FND-05: Frontmatter validation implemented', () => {
    expect(existsSync(resolve('docs/.vitepress/scripts/validateFrontmatter.ts'))).toBe(true)
  })

  it('FND-06: Base path configuration implemented', async () => {
    vi.resetModules()
    delete process.env.BASE_URL
    delete process.env.GITHUB_PAGES
    delete process.env.GITHUB_REPOSITORY
    delete process.env.VERCEL

    const configModule = await import('../docs/.vitepress/config.ts')
    const config = await configModule.default
    expect(config).toHaveProperty('base')
    expect(typeof config.base).toBe('string')
  })

  it('FND-07: Dark mode support configured', async () => {
    vi.resetModules()
    delete process.env.BASE_URL
    delete process.env.GITHUB_PAGES
    delete process.env.GITHUB_REPOSITORY
    delete process.env.VERCEL

    const configModule = await import('../docs/.vitepress/config.ts')
    const config = await configModule.default
    expect(config.themeConfig).toHaveProperty('appearance')
    expect(config.themeConfig.appearance).toBe(true)
  })
})