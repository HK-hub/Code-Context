import { createContentLoader } from 'vitepress'

export interface Post {
  title: string
  url: string
  date: string
  categories: string[]
  tags: string[]
  description?: string
  author: string
  authorType: 'original' | 'reprint'
  sourceUrl?: string
  sourceTitle?: string
}

declare const data: Post[]
export { data }

// Top-level directories to exclude from categories
const TOP_LEVEL_DIRS = ['blog', 'ai', 'backend', 'projects', 'categories', 'archives']

export default createContentLoader('**/*.md', {
  transform(raw): Post[] {
    return raw
      .filter(page => page.frontmatter.date && !page.frontmatter.draft)
      .map(page => {
        // Get directory path for fallback category/tag
        const urlParts = page.url.split('/').filter(Boolean)

        // Filter out top-level dirs from frontmatter categories
        let categories = (page.frontmatter.categories || []).filter(
          (c: string) => !TOP_LEVEL_DIRS.includes(c)
        )
        let tags = page.frontmatter.tags || []

        // If no categories after filtering, use subdirectory name
        if (categories.length === 0 && urlParts.length > 2) {
          const subDir = urlParts[1]
          if (subDir && subDir !== 'index') {
            categories = [subDir]
          }
        }

        // If no tags, use sub-subdirectory name (if exists and not same as category)
        if (tags.length === 0 && urlParts.length > 3) {
          const subSubDir = urlParts[2]
          if (subSubDir && subSubDir !== 'index' && !categories.includes(subSubDir)) {
            tags = [subSubDir]
          }
        }

        return {
          title: page.frontmatter.title || 'Untitled',
          url: page.url,
          date: page.frontmatter.date,
          categories,
          tags,
          description: page.frontmatter.description,
          author: page.frontmatter.author || 'HK-hub',
          authorType: page.frontmatter.author_type || 'original',
          sourceUrl: page.frontmatter.source_url,
          sourceTitle: page.frontmatter.source_title
        }
      })
      .sort((a, b) => +new Date(b.date) - +new Date(a.date))
  }
})