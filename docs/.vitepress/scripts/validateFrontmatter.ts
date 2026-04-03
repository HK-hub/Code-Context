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

    const result = frontmatterSchema.safeParse(data)

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

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`.replace(/\\/g, '/')) {
  validateAllFrontmatter().catch(err => {
    console.error('Validation error:', err)
    process.exit(1)
  })
}