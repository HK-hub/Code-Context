import { z } from 'zod'

/**
 * Zod schema for frontmatter validation
 *
 * Required fields:
 * - title: string (non-empty)
 * - date: string in YYYY-MM-DD format
 * - categories: string[] (defaults to [])
 * - tags: string[] (defaults to [])
 *
 * Optional fields:
 * - description: string
 * - author: string (defaults to 'HK-hub')
 * - order: number
 * - sticky: boolean (defaults to false)
 * - draft: boolean (defaults to false)
 */
export const frontmatterSchema = z.object({
  // Required fields
  title: z.string().min(1, 'Title is required and cannot be empty'),
  date: z.string().regex(
    /^\d{4}-\d{2}-\d{2}$/,
    'Date must be in YYYY-MM-DD format (e.g., 2026-04-02)'
  ),
  categories: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),

  // Optional fields
  description: z.string().optional(),
  author: z.string().default('HK-hub'),
  order: z.number().optional(),
  sticky: z.boolean().default(false),
  draft: z.boolean().default(false),

  // Article type fields
  author_type: z.enum(['original', 'reprint']).default('original'),
  source_url: z.string().url().optional(),
  source_title: z.string().optional()
})

export type Frontmatter = z.infer<typeof frontmatterSchema>

/**
 * Validates frontmatter data and throws on invalid data
 * @param data - Raw frontmatter data to validate
 * @returns Validated and typed Frontmatter object
 * @throws ZodError if validation fails
 */
export function validateFrontmatter(data: unknown): Frontmatter {
  return frontmatterSchema.parse(data)
}

/**
 * Safely validates frontmatter without throwing
 * @param data - Raw frontmatter data to validate
 * @returns Object with success flag and either data or errors
 */
export function safeValidateFrontmatter(data: unknown): {
  success: true
  data: Frontmatter
} | {
  success: false
  errors: string[]
} {
  const result = frontmatterSchema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  } else {
    const errors = result.error.errors.map(e =>
      `${e.path.join('.')}: ${e.message}`
    )
    return { success: false, errors }
  }
}