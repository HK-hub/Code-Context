import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DOCS_DIR = path.resolve(__dirname, '../../')

// 顶级分区配置
// - 'blog', 'ai', 'backend': 单一 sidebar，所有子目录折叠显示
// - 'projects': 每个子项目独立 sidebar，进入子项目后只显示该项目内容
const SECTIONS = ['ai', 'backend', 'blog', 'projects']

// projects 下的子项目需要独立 sidebar
const PROJECT_SUBDIRS = ['demos', 'experiments', 'hcontext', 'opensource', 'tools']

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
 * Get title from markdown file frontmatter or filename
 */
function getTitle(filePath: string): string {
  const content = fs.readFileSync(filePath, 'utf-8')
  const { data } = matter(content)

  if (data.title) {
    return data.title
  }

  // Fallback: use filename without extension and number prefix
  const filename = path.basename(filePath, '.md')
  return filename.replace(/^\d+[-_.]?/, '').replace(/[-_]/g, ' ')
}

/**
 * Get order from frontmatter for sorting
 */
function getOrder(filePath: string): number {
  const content = fs.readFileSync(filePath, 'utf-8')
  const { data } = matter(content)
  return data.order ?? 999
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
 * Check if file should be ignored
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
        collapsed: depth === 0, // 顶级目录默认折叠
        items: subItems
      })
    }
  }

  // Process markdown files
  const files = entries
    .filter(e => e.isFile() && e.name.endsWith('.md') && !shouldIgnore(e.name))
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
 * Generate all sidebar configs
 */
function generateAllSidebars(): Record<string, SidebarGroup> {
  const sidebar: Record<string, SidebarGroup> = {}

  for (const section of SECTIONS) {
    if (section === 'projects') {
      // projects: 为每个子项目生成独立 sidebar
      for (const subdir of PROJECT_SUBDIRS) {
        const subdirPath = path.join(DOCS_DIR, 'projects', subdir)
        if (fs.existsSync(subdirPath)) {
          sidebar[`/projects/${subdir}/`] = generateProjectSubdirSidebar(subdir)
        }
      }
      // 同时保留 /projects/ 的根 sidebar（显示所有子项目概览）
      sidebar['/projects/'] = generateProjectsOverviewSidebar()
    } else {
      // 其他分区：单一 sidebar
      sidebar[`/${section}/`] = generateSectionSidebar(section)
    }
  }

  return sidebar
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
        text: title.replace(' 示例项目', '').replace(' 实验项目', '').replace(' 项目文档', '').replace(' 开源项目', '').replace(' 开发工具', ''),
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
 * Write sidebar config to file
 */
function writeSidebarConfig(sidebar: Record<string, SidebarGroup>): void {
  const outputPath = path.resolve(__dirname, '../sidebar/index.ts')
  const outputDir = path.dirname(outputPath)

  // Ensure directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const content = `// Auto-generated sidebar configuration
// Run: npx tsx docs/.vitepress/scripts/generateSidebar.ts
//
// Structure:
// - /ai/, /backend/, /blog/: 单一 sidebar，子目录折叠
// - /projects/: 概览 sidebar，显示各子项目入口
// - /projects/demos/, /projects/experiments/, etc: 独立 sidebar，仅显示当前子项目

import type { DefaultTheme } from 'vitepress'

export const sidebar: DefaultTheme.Config['sidebar'] = ${JSON.stringify(sidebar, null, 2)}
`

  fs.writeFileSync(outputPath, content, 'utf-8')
  console.log(`[Sidebar] Generated: ${outputPath}`)
}

// Main execution
const sidebar = generateAllSidebars()
writeSidebarConfig(sidebar)

console.log('[Sidebar] Sections generated:')
for (const [pathKey, config] of Object.entries(sidebar)) {
  const itemCount = config.items.length
  console.log(`  ${pathKey}: ${itemCount} top-level items`)
}