/**
 * Sidebar Configuration - Auto-generated at build time
 *
 * This module generates sidebar configuration dynamically by scanning
 * the docs directory structure and reading frontmatter metadata.
 *
 * Supported frontmatter properties:
 * - title: Display title in sidebar (fallback: filename)
 * - order: Sorting priority (lower number = higher position)
 * - exclude: Set to true to exclude from sidebar
 * - date: Publication date (auto-filled with current date if missing)
 * - author: Author name (auto-filled with "HK意境" if missing)
 */

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { fileURLToPath } from 'url'
import type { DefaultTheme } from 'vitepress'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DOCS_DIR = path.resolve(__dirname, '../../')

// Top-level sections configuration
const SECTIONS = ['ai', 'backend', 'blog', 'projects', 'books']

// Projects subdirectories get independent sidebars
const PROJECT_SUBDIRS = ['demos', 'experiments', 'hcontext', 'opensource', 'tools']

// Default frontmatter values
const DEFAULT_AUTHOR = 'HK意境'

/**
 * Get current date in YYYY-MM-DD format
 */
function getCurrentDate(): string {
  const now = new Date()
  return now.toISOString().split('T')[0]
}

/**
 * Process frontmatter: fill missing required fields and persist to file
 * Returns the processed frontmatter data
 */
function processFrontmatter(filePath: string): { data: Record<string, unknown>; content: string } {
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(fileContent)
  let modified = false

  // Auto-fill date if missing
  if (!data.date) {
    data.date = getCurrentDate()
    modified = true
  }

  // Auto-fill author if missing
  if (!data.author) {
    data.author = DEFAULT_AUTHOR
    modified = true
  }

  // Persist changes to file if any modifications were made
  if (modified) {
    const newContent = matter.stringify(content, data)
    fs.writeFileSync(filePath, newContent, 'utf-8')
    console.log(`[Frontmatter] Updated: ${path.relative(DOCS_DIR, filePath)}`)
  }

  return { data, content }
}

/**
 * Cache for processed frontmatter to avoid re-reading files
 */
const frontmatterCache = new Map<string, { data: Record<string, unknown>; content: string }>()

interface SidebarItem {
  text: string
  link?: string
  items?: SidebarItem[]
  collapsed?: boolean
}

interface SidebarGroup {
  base: string
  items: SidebarItem[]
}

/**
 * Get or process frontmatter (with caching)
 */
function getFrontmatter(filePath: string): { data: Record<string, unknown>; content: string } {
  if (frontmatterCache.has(filePath)) {
    return frontmatterCache.get(filePath)!
  }

  const result = processFrontmatter(filePath)
  frontmatterCache.set(filePath, result)
  return result
}

/**
 * Get title from markdown file frontmatter or filename
 */
function getTitle(filePath: string): string {
  const { data } = getFrontmatter(filePath)

  if (data.title) {
    return data.title as string
  }

  // Fallback: use filename without extension and number prefix
  const filename = path.basename(filePath, '.md')
  return filename.replace(/^\d+[-_.]?/, '').replace(/[-_]/g, ' ')
}

/**
 * Get order from frontmatter for sorting
 */
function getOrder(filePath: string): number {
  const { data } = getFrontmatter(filePath)
  return (data.order as number) ?? 999
}

/**
 * Get order for a directory (from its index.md)
 */
function getDirectoryOrder(dirPath: string): number {
  const indexPath = path.join(dirPath, 'index.md')
  if (fs.existsSync(indexPath)) {
    return getOrder(indexPath)
  }
  return 999
}

/**
 * Check if file should be excluded from sidebar
 */
function isExcluded(filePath: string): boolean {
  const { data } = getFrontmatter(filePath)
  return data.exclude === true
}

/**
 * Check if file should be ignored (system files)
 */
function shouldIgnore(filename: string): boolean {
  return filename.startsWith('.') || filename === 'index.md'
}

/**
 * Generate sidebar items for a directory
 */
function generateItems(dirPath: string, section: string, depth: number = 0): SidebarItem[] {
  const items: SidebarItem[] = []
  const entries = fs.readdirSync(dirPath, { withFileTypes: true })

  // Process directories first (for nested groups)
  const directories = entries
    .filter(e => e.isDirectory() && !shouldIgnore(e.name))
    .sort((a, b) => {
      const orderA = getDirectoryOrder(path.join(dirPath, a.name))
      const orderB = getDirectoryOrder(path.join(dirPath, b.name))
      if (orderA !== orderB) return orderA - orderB
      return a.name.localeCompare(b.name)
    })

  for (const dir of directories) {
    const subDirPath = path.join(dirPath, dir.name)
    const subItems = generateItems(subDirPath, section, depth + 1)

    if (subItems.length > 0) {
      // Use clean name without number prefix
      const groupTitle = dir.name.replace(/^\d+[-_.]?/, '').replace(/[-_]/g, ' ')
      items.push({
        text: groupTitle,
        collapsed: depth === 0, // Top-level directories collapsed by default
        items: subItems
      })
    }
  }

  // Process markdown files
  const files = entries
    .filter(e => e.isFile() && e.name.endsWith('.md') && !shouldIgnore(e.name))
    .filter(e => !isExcluded(path.join(dirPath, e.name)))
    .sort((a, b) => {
      const orderA = getOrder(path.join(dirPath, a.name))
      const orderB = getOrder(path.join(dirPath, b.name))
      if (orderA !== orderB) return orderA - orderB
      return a.name.localeCompare(b.name)
    })

  for (const file of files) {
    const filePath = path.join(dirPath, file.name)
    const title = getTitle(filePath)

    // Link relative to section base (without /section/ prefix)
    const relativePath = path.relative(path.join(DOCS_DIR, section), filePath)
      .replace(/\\/g, '/')
      .replace('.md', '')
      .replace('/index', '/')

    items.push({
      text: title,
      link: relativePath
    })
  }

  return items
}

/**
 * Generate sidebar config for a section (blog, ai, backend)
 */
function generateSectionSidebar(section: string): SidebarGroup {
  const sectionPath = path.join(DOCS_DIR, section)

  return {
    base: `/${section}/`,
    items: generateItems(sectionPath, section)
  }
}

/**
 * Generate sidebar config for a project subdirectory
 */
function generateProjectSubdirSidebar(subdir: string): SidebarGroup {
  const subdirPath = path.join(DOCS_DIR, 'projects', subdir)
  const items: SidebarItem[] = []

  const entries = fs.readdirSync(subdirPath, { withFileTypes: true })

  // Process markdown files (not subdirectories for projects)
  const files = entries
    .filter(e => e.isFile() && e.name.endsWith('.md') && !shouldIgnore(e.name))
    .filter(e => !isExcluded(path.join(subdirPath, e.name)))
    .sort((a, b) => {
      const orderA = getOrder(path.join(subdirPath, a.name))
      const orderB = getOrder(path.join(subdirPath, b.name))
      if (orderA !== orderB) return orderA - orderB
      return a.name.localeCompare(b.name)
    })

  for (const file of files) {
    const filePath = path.join(subdirPath, file.name)
    const title = getTitle(filePath)

    // Link is just the filename without .md (relative to subdir base)
    const link = file.name.replace('.md', '').replace('index', '/')

    items.push({
      text: title,
      link
    })
  }

  return {
    base: `/projects/${subdir}/`,
    items
  }
}

/**
 * Generate projects overview sidebar (for /projects/ root page)
 */
function generateProjectsOverviewSidebar(): SidebarGroup {
  const items: SidebarItem[] = []

  for (const subdir of PROJECT_SUBDIRS) {
    const indexFile = path.join(DOCS_DIR, 'projects', subdir, 'index.md')
    if (fs.existsSync(indexFile)) {
      const title = getTitle(indexFile)
      items.push({
        text: title
          .replace(' 示例项目', '')
          .replace(' 实验项目', '')
          .replace(' 项目文档', '')
          .replace(' 开源项目', '')
          .replace(' 开发工具', ''),
        link: `${subdir}/`
      })
    }
  }

  return {
    base: '/projects/',
    items
  }
}

/**
 * Generate all sidebar configs
 */
function generateSidebar(): DefaultTheme.Config['sidebar'] {
  const sidebar: Record<string, SidebarGroup> = {}

  for (const section of SECTIONS) {
    if (section === 'projects') {
      // projects: each subproject gets independent sidebar
      for (const subdir of PROJECT_SUBDIRS) {
        const subdirPath = path.join(DOCS_DIR, 'projects', subdir)
        if (fs.existsSync(subdirPath)) {
          sidebar[`/projects/${subdir}/`] = generateProjectSubdirSidebar(subdir)
        }
      }
      // Keep /projects/ root sidebar (shows all subproject overview)
      sidebar['/projects/'] = generateProjectsOverviewSidebar()
    } else {
      // Other sections: single sidebar
      sidebar[`/${section}/`] = generateSectionSidebar(section)
    }
  }

  return sidebar
}

// Export generated sidebar - computed at build time
export const sidebar = generateSidebar()