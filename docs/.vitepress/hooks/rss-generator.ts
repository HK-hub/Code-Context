import type { Feed } from 'feed'
import { readFileSync, writeFileSync } from 'fs'
import { join, resolve } from 'path'
import * as matter from 'gray-matter'
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