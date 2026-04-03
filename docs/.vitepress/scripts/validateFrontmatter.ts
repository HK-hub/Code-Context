import { frontmatterSchema } from '../utils/frontmatter.js'
import { globby } from 'globby'
import matter from 'gray-matter'
import { readFileSync } from 'fs'
import { relative } from 'path'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const srcDir = join(__dirname, '../../..', 'docs')

/**
 * Validates frontmatter in all markdown files in the docs directory
 * Exits with code 1 if any validation errors are found
 */
export async function validateAllFrontmatter(): Promise<void> {
  // Find all markdown files except node_modules and dist
  const files = await globby('**/*.md', {
    cwd: srcDir,
    absolute: true,
    ignore: ['**/node_modules/**', '**/.vitepress/dist/**']
  })

  const errors: string[] = []
  let validatedCount = 0

  for (const file of files) {
    const content = readFileSync(file, 'utf-8')
    const { data } = matter(content)

    // Skip files without frontmatter (like index pages)
    if (Object.keys(data).length === 0) {
      continue
    }

    // Skip VitePress special pages (home page, layout pages)
    if (data.layout) {
      continue
    }

    // Handle gray-matter's Date parsing for YYYY-MM-DD format
    // gray-matter converts date strings like '2026-04-02' to Date objects
    // We need to convert them back to strings for Zod validation
    const processedData = { ...data }
    if (processedData.date instanceof Date) {
      processedData.date = processedData.date.toISOString().split('T')[0]
    }

    const result = frontmatterSchema.safeParse(processedData)

    if (!result.success) {
      const fileName = relative(srcDir, file)
      const errorMessages = result.error.errors.map(e =>
        `  - ${e.path.join('.')}: ${e.message}`
      ).join('\n')
      errors.push(`\n${fileName}:\n${errorMessages}`)
    } else {
      validatedCount++
    }
  }

  if (errors.length > 0) {
    console.error('Frontmatter validation failed:')
    console.error(errors.join('\n'))
    console.error(`\n${errors.length} file(s) with invalid frontmatter`)
    process.exit(1)
  }

  console.log(`Validated frontmatter in ${validatedCount} file(s)`)
}

// Run validation if called directly via npx tsx or node
const isMainModule = process.argv[1]?.includes('validateFrontmatter.ts')
if (isMainModule) {
  console.log('Running frontmatter validation...')
  validateAllFrontmatter().catch(err => {
    console.error('Validation error:', err)
    process.exit(1)
  })
}