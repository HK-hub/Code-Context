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
      // 排除index文件(目录索引页)
      '**/index.md'
    ]
  })

  console.log(`[RSS] Scanned ${allFiles.length} markdown files`)
  return allFiles
}

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

/**
 * 判断文件是否应排除
 * @param filePath 文件路径
 * @param frontmatter frontmatter数据
 * @returns 是否排除
 */
export function shouldExclude(filePath: string, frontmatter: Partial<Frontmatter>): boolean {
  if (!frontmatter.title || !frontmatter.date) {
    console.log(`[RSS] Excluded: ${filePath} (missing title or date)`)
    return true
  }
  if (frontmatter.exclude === true) {
    console.log(`[RSS] Excluded: ${filePath} (exclude=true)`)
    return true
  }
  return false
}

/**
 * 从markdown内容提取摘要
 * @param markdown markdown内容
 * @param maxLength 最大长度，默认200
 * @returns 清理后的摘要文本
 */
export function extractSummary(markdown: string, maxLength = 200): string {
  let text = markdown
  
  // Remove frontmatter
  text = text.replace(/^---[\s\S]*?---\n?/, '')
  
  // Remove code blocks
  text = text.replace(/```[\s\S]*?```/g, '')
  
  // Remove inline code
  text = text.replace(/`([^`]+)`/g, '$1')
  
  // Remove images
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
  
  // Remove links but keep text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
  
  // Remove headers
  text = text.replace(/^#{1,6}\s+/gm, '')
  
  // Remove bold
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1')
  text = text.replace(/__([^_]+)__/g, '$1')
  
  // Remove italic
  text = text.replace(/\*([^*]+)\*/g, '$1')
  text = text.replace(/_([^_]+)_/g, '$1')
  
  // Remove HTML
  text = text.replace(/<[^>]+>/g, '')
  
  // Remove quotes
  text = text.replace(/^>\s+/gm, '')
  
  // Remove list markers
  text = text.replace(/^[\*\-\+]\s+/gm, '')
  text = text.replace(/^\d+\.\s+/gm, '')
  
  // Clean whitespace
  text = text.replace(/\n+/g, ' ')
  text = text.replace(/\s+/g, ' ')
  text = text.trim()
  
  // Limit length
  if (text.length > maxLength) {
    text = text.substring(0, maxLength).trim()
    const lastSpace = text.lastIndexOf(' ')
    if (lastSpace > maxLength * 0.8) {
      text = text.substring(0, lastSpace)
    }
  }
  
  return text
}