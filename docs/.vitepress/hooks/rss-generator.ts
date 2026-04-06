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