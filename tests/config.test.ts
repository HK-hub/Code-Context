import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('Base Path Configuration', () => {
  // Store original env
  const originalEnv = { ...process.env }

  beforeEach(() => {
    // Reset modules to get fresh imports with new env vars
    vi.resetModules()
    // Clear relevant env vars
    delete process.env.BASE_URL
    delete process.env.GITHUB_PAGES
    delete process.env.GITHUB_REPOSITORY
    delete process.env.VERCEL
  })

  afterEach(() => {
    // Restore original env
    process.env = { ...originalEnv }
    vi.resetModules()
  })

  describe('detectBasePath function', () => {
    it('should use BASE_URL when explicitly set', async () => {
      process.env.BASE_URL = '/my-app/'

      const { detectBasePath } = await import('../docs/.vitepress/config.ts')

      expect(detectBasePath()).toBe('/my-app/')
    })

    it('should add leading slash to BASE_URL if missing', async () => {
      process.env.BASE_URL = 'my-app/'

      const { detectBasePath } = await import('../docs/.vitepress/config.ts')

      expect(detectBasePath()).toBe('/my-app/')
    })

    it('should add trailing slash to BASE_URL if missing', async () => {
      process.env.BASE_URL = '/my-app'

      const { detectBasePath } = await import('../docs/.vitepress/config.ts')

      expect(detectBasePath()).toBe('/my-app/')
    })

    it('should handle both missing slashes', async () => {
      process.env.BASE_URL = 'my-app'

      const { detectBasePath } = await import('../docs/.vitepress/config.ts')

      expect(detectBasePath()).toBe('/my-app/')
    })
  })

  describe('GitHub Pages Detection', () => {
    it('should detect GitHub Pages from GITHUB_PAGES env var', async () => {
      process.env.GITHUB_PAGES = 'true'

      const { detectBasePath } = await import('../docs/.vitepress/config.ts')

      // Should default to /HContext/ when GITHUB_REPOSITORY not set
      expect(detectBasePath()).toBe('/HContext/')
    })

    it('should use repo name from GITHUB_REPOSITORY', async () => {
      process.env.GITHUB_PAGES = 'true'
      process.env.GITHUB_REPOSITORY = 'HK-hub/my-blog'

      const { detectBasePath } = await import('../docs/.vitepress/config.ts')

      expect(detectBasePath()).toBe('/my-blog/')
    })

    it('should handle complex repo names', async () => {
      process.env.GITHUB_PAGES = 'true'
      process.env.GITHUB_REPOSITORY = 'org-name/repo-name-with-dashes'

      const { detectBasePath } = await import('../docs/.vitepress/config.ts')

      expect(detectBasePath()).toBe('/repo-name-with-dashes/')
    })
  })

  describe('Vercel Detection', () => {
    it('should use root path for Vercel', async () => {
      process.env.VERCEL = '1'

      const { detectBasePath } = await import('../docs/.vitepress/config.ts')

      expect(detectBasePath()).toBe('/')
    })
  })

  describe('Default Behavior', () => {
    it('should default to root path when no env vars set', async () => {
      const { detectBasePath } = await import('../docs/.vitepress/config.ts')

      expect(detectBasePath()).toBe('/')
    })
  })

  describe('Priority Order', () => {
    it('should prioritize BASE_URL over GITHUB_PAGES', async () => {
      process.env.BASE_URL = '/custom/'
      process.env.GITHUB_PAGES = 'true'
      process.env.GITHUB_REPOSITORY = 'user/repo'

      const { detectBasePath } = await import('../docs/.vitepress/config.ts')

      expect(detectBasePath()).toBe('/custom/')
    })

    it('should prioritize GITHUB_PAGES over VERCEL', async () => {
      process.env.GITHUB_PAGES = 'true'
      process.env.VERCEL = '1'

      const { detectBasePath } = await import('../docs/.vitepress/config.ts')

      expect(detectBasePath()).toBe('/HContext/')
    })
  })
})

describe('Config Structure', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    vi.resetModules()
    delete process.env.BASE_URL
    delete process.env.GITHUB_PAGES
    delete process.env.GITHUB_REPOSITORY
    delete process.env.VERCEL
  })

  afterEach(() => {
    process.env = { ...originalEnv }
    vi.resetModules()
  })

  it('should have required config properties', async () => {
    const { default: configPromise } = await import('../docs/.vitepress/config.ts')
    const config = await configPromise

    expect(config).toHaveProperty('lang', 'zh-CN')
    expect(config).toHaveProperty('title', 'HK-hub Tech Blog')
    expect(config).toHaveProperty('description', '技术博客与开源文档站')
    expect(config).toHaveProperty('base')
    expect(config).toHaveProperty('themeConfig')
  })

  it('should have nav configuration', async () => {
    const { default: configPromise } = await import('../docs/.vitepress/config.ts')
    const config = await configPromise

    expect(config.themeConfig).toHaveProperty('nav')
    expect(config.themeConfig.nav).toBeInstanceOf(Array)
    expect(config.themeConfig.nav.length).toBeGreaterThan(0)
  })

  it('should have social links', async () => {
    const { default: configPromise } = await import('../docs/.vitepress/config.ts')
    const config = await configPromise

    expect(config.themeConfig).toHaveProperty('socialLinks')
    expect(config.themeConfig.socialLinks).toBeInstanceOf(Array)
  })

  it('should have footer configuration', async () => {
    const { default: configPromise } = await import('../docs/.vitepress/config.ts')
    const config = await configPromise

    expect(config.themeConfig).toHaveProperty('footer')
    expect(config.themeConfig.footer).toHaveProperty('message')
    expect(config.themeConfig.footer).toHaveProperty('copyright')
  })

  it('should have dark mode enabled', async () => {
    const { default: configPromise } = await import('../docs/.vitepress/config.ts')
    const config = await configPromise

    expect(config.themeConfig).toHaveProperty('appearance', true)
  })

  it('should have sidebar placeholder', async () => {
    const { default: configPromise } = await import('../docs/.vitepress/config.ts')
    const config = await configPromise

    expect(config.themeConfig).toHaveProperty('sidebar')
    // Sidebar should be empty object (placeholder for Phase 2)
    expect(typeof config.themeConfig.sidebar).toBe('object')
  })
})

describe('Vite Configuration', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    vi.resetModules()
    delete process.env.BASE_URL
    delete process.env.GITHUB_PAGES
    delete process.env.GITHUB_REPOSITORY
    delete process.env.VERCEL
  })

  afterEach(() => {
    process.env = { ...originalEnv }
    vi.resetModules()
  })

  it('should expose __BASE_PATH__ to client', async () => {
    const { default: configPromise } = await import('../docs/.vitepress/config.ts')
    const config = await configPromise

    expect(config).toHaveProperty('vite')
    expect(config.vite).toHaveProperty('define')
    expect(config.vite.define).toHaveProperty('__BASE_PATH__')
  })

  it('should set __BASE_PATH__ to match base config', async () => {
    process.env.BASE_URL = '/test-app/'

    const { default: configPromise } = await import('../docs/.vitepress/config.ts')
    const config = await configPromise

    expect(config.base).toBe('/test-app/')
    expect(config.vite.define.__BASE_PATH__).toBe('"/test-app/"')
  })

  it('should set __BASE_PATH__ to root by default', async () => {
    const { default: configPromise } = await import('../docs/.vitepress/config.ts')
    const config = await configPromise

    expect(config.base).toBe('/')
    expect(config.vite.define.__BASE_PATH__).toBe('"/"')
  })
})

describe('Edge Cases', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    vi.resetModules()
    delete process.env.BASE_URL
    delete process.env.GITHUB_PAGES
    delete process.env.GITHUB_REPOSITORY
    delete process.env.VERCEL
  })

  afterEach(() => {
    process.env = { ...originalEnv }
    vi.resetModules()
  })

  it('should handle empty BASE_URL string', async () => {
    process.env.BASE_URL = ''

    const { detectBasePath } = await import('../docs/.vitepress/config.ts')

    // Empty string is falsy, should fall through to default
    expect(detectBasePath()).toBe('/')
  })

  it('should handle BASE_URL with only slashes', async () => {
    process.env.BASE_URL = '/'

    const { detectBasePath } = await import('../docs/.vitepress/config.ts')

    expect(detectBasePath()).toBe('/')
  })

  it('should handle GITHUB_REPOSITORY with empty repo name', async () => {
    process.env.GITHUB_PAGES = 'true'
    process.env.GITHUB_REPOSITORY = 'owner/'

    const { detectBasePath } = await import('../docs/.vitepress/config.ts')

    // Should fallback to default repo name
    expect(detectBasePath()).toBe('/HContext/')
  })

  it('should handle GITHUB_REPOSITORY with special characters', async () => {
    process.env.GITHUB_PAGES = 'true'
    process.env.GITHUB_REPOSITORY = 'org/repo_name-123'

    const { detectBasePath } = await import('../docs/.vitepress/config.ts')

    expect(detectBasePath()).toBe('/repo_name-123/')
  })
})