/**
 * Calculate word count for mixed Chinese/English content
 * Chinese characters count as 1 word each
 * English words count as 1 word per word
 */
export function getWordCount(content: string): number {
  // Remove code blocks, inline code, links, markdown symbols
  const pureText = content
    .replace(/```[\s\S]*?```/g, '')      // Remove code blocks
    .replace(/`[^`]+`/g, '')             // Remove inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // Keep link text only
    .replace(/[#*_-~>`]/g, '')           // Remove markdown symbols
    .replace(/\s+/g, ' ')                // Normalize whitespace
    .trim()

  // Count Chinese characters
  const chineseChars = (pureText.match(/[\u4e00-\u9fa5]/g) || []).length

  // Count English words (sequences of letters)
  const englishWords = pureText
    .replace(/[\u4e00-\u9fa5]/g, ' ')
    .split(/\s+/)
    .filter(word => /^[a-zA-Z]+$/.test(word))
    .length

  return chineseChars + englishWords
}

/**
 * Calculate estimated reading time
 * Chinese: ~400 characters/minute
 * English: ~200 words/minute
 * Mixed content: weighted average
 */
export function getReadingTime(wordCount: number): number {
  // Assume ~70% Chinese, ~30% English for typical tech blog
  const chineseCount = Math.floor(wordCount * 0.7)
  const englishCount = Math.floor(wordCount * 0.3)

  const chineseTime = chineseCount / 400  // minutes
  const englishTime = englishCount / 200  // minutes

  const totalMinutes = Math.ceil(chineseTime + englishTime)
  return Math.max(1, totalMinutes)  // Minimum 1 minute
}