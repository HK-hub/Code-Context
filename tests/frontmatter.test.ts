import { describe, it, expect } from 'vitest'
import {
  frontmatterSchema,
  validateFrontmatter,
  safeValidateFrontmatter,
  type Frontmatter
} from '../docs/.vitepress/utils/frontmatter'

describe('Frontmatter Schema', () => {
  describe('Required Fields', () => {
    it('should validate complete valid frontmatter', () => {
      const valid = {
        title: 'Test Article',
        date: '2026-04-02',
        categories: ['blog', 'tech'],
        tags: ['vue', 'typescript']
      }

      const result = safeValidateFrontmatter(valid)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.title).toBe('Test Article')
        expect(result.data.date).toBe('2026-04-02')
      }
    })

    it('should reject missing title', () => {
      const invalid = {
        date: '2026-04-02',
        categories: [],
        tags: []
      }

      const result = safeValidateFrontmatter(invalid)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors.some(e => e.includes('title'))).toBe(true)
      }
    })

    it('should reject empty title', () => {
      const invalid = {
        title: '',
        date: '2026-04-02',
        categories: [],
        tags: []
      }

      const result = safeValidateFrontmatter(invalid)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors.some(e => e.includes('Title is required'))).toBe(true)
      }
    })

    it('should reject missing date', () => {
      const invalid = {
        title: 'Test Article',
        categories: [],
        tags: []
      }

      const result = safeValidateFrontmatter(invalid)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors.some(e => e.includes('date'))).toBe(true)
      }
    })

    it('should reject invalid date format', () => {
      const invalid = {
        title: 'Test Article',
        date: 'April 2, 2026',
        categories: [],
        tags: []
      }

      const result = safeValidateFrontmatter(invalid)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors.some(e => e.includes('YYYY-MM-DD'))).toBe(true)
      }
    })

    it('should reject malformed date string (invalid format)', () => {
      const invalid = {
        title: 'Test Article',
        date: '2026/13/45', // Wrong separator format
        categories: [],
        tags: []
      }

      const result = safeValidateFrontmatter(invalid)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors.some(e => e.includes('YYYY-MM-DD'))).toBe(true)
      }
    })
  })

  describe('Default Values', () => {
    it('should default categories to empty array', () => {
      const partial = {
        title: 'Test Article',
        date: '2026-04-02',
        tags: ['vue']
      }

      const result = safeValidateFrontmatter(partial)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.categories).toEqual([])
      }
    })

    it('should default tags to empty array', () => {
      const partial = {
        title: 'Test Article',
        date: '2026-04-02',
        categories: ['blog']
      }

      const result = safeValidateFrontmatter(partial)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.tags).toEqual([])
      }
    })

    it('should default author to HK-hub', () => {
      const partial = {
        title: 'Test Article',
        date: '2026-04-02',
        categories: [],
        tags: []
      }

      const result = safeValidateFrontmatter(partial)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.author).toBe('HK-hub')
      }
    })

    it('should default sticky to false', () => {
      const partial = {
        title: 'Test Article',
        date: '2026-04-02',
        categories: [],
        tags: []
      }

      const result = safeValidateFrontmatter(partial)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.sticky).toBe(false)
      }
    })

    it('should default draft to false', () => {
      const partial = {
        title: 'Test Article',
        date: '2026-04-02',
        categories: [],
        tags: []
      }

      const result = safeValidateFrontmatter(partial)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.draft).toBe(false)
      }
    })
  })

  describe('Optional Fields', () => {
    it('should accept description', () => {
      const withDescription = {
        title: 'Test Article',
        date: '2026-04-02',
        categories: [],
        tags: [],
        description: 'A test article description'
      }

      const result = safeValidateFrontmatter(withDescription)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.description).toBe('A test article description')
      }
    })

    it('should accept custom author', () => {
      const withAuthor = {
        title: 'Test Article',
        date: '2026-04-02',
        categories: [],
        tags: [],
        author: 'Custom Author'
      }

      const result = safeValidateFrontmatter(withAuthor)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.author).toBe('Custom Author')
      }
    })

    it('should accept order', () => {
      const withOrder = {
        title: 'Test Article',
        date: '2026-04-02',
        categories: [],
        tags: [],
        order: 10
      }

      const result = safeValidateFrontmatter(withOrder)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.order).toBe(10)
      }
    })

    it('should accept sticky flag', () => {
      const withSticky = {
        title: 'Test Article',
        date: '2026-04-02',
        categories: [],
        tags: [],
        sticky: true
      }

      const result = safeValidateFrontmatter(withSticky)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.sticky).toBe(true)
      }
    })

    it('should accept draft flag', () => {
      const withDraft = {
        title: 'Test Article',
        date: '2026-04-02',
        categories: [],
        tags: [],
        draft: true
      }

      const result = safeValidateFrontmatter(withDraft)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.draft).toBe(true)
      }
    })
  })

  describe('validateFrontmatter (throwing version)', () => {
    it('should return data for valid frontmatter', () => {
      const valid = {
        title: 'Test Article',
        date: '2026-04-02',
        categories: [],
        tags: []
      }

      const result = validateFrontmatter(valid)
      expect(result.title).toBe('Test Article')
    })

    it('should throw for invalid frontmatter', () => {
      const invalid = {
        title: '',
        date: 'invalid',
        categories: [],
        tags: []
      }

      expect(() => validateFrontmatter(invalid)).toThrow()
    })
  })
})