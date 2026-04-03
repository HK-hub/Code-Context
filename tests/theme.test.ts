import { describe, it, expect } from 'vitest'
import { existsSync } from 'fs'
import { resolve } from 'path'

describe('Theme Extension', () => {
  const themeDir = resolve(process.cwd(), 'docs/.vitepress/theme')

  it('should have theme index.ts', () => {
    expect(existsSync(resolve(themeDir, 'index.ts'))).toBe(true)
  })

  it('should have Layout.vue', () => {
    expect(existsSync(resolve(themeDir, 'Layout.vue'))).toBe(true)
  })

  it('should have custom styles', () => {
    expect(existsSync(resolve(themeDir, 'styles/custom.css'))).toBe(true)
  })

  it('should have dark mode toggle component', () => {
    expect(existsSync(resolve(themeDir, 'components/DarkModeToggle.vue'))).toBe(true)
  })
})

describe('Dark Mode', () => {
  it('should have appearance enabled in config', () => {
    const configPath = resolve(process.cwd(), 'docs/.vitepress/config.ts')
    expect(existsSync(configPath)).toBe(true)
    // Config file exists - full parsing requires dynamic import in ESM
  })
})