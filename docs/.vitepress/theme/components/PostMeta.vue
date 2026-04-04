<script setup lang="ts">
import { useData } from 'vitepress'
import { computed, ref, onMounted, nextTick, watch } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps<{
  wordCount?: number
}>()

const { frontmatter, page } = useData()

// Word count from prop or calculate
const wordCount = ref(props.wordCount || 0)

// Reading time
const readingTime = computed(() => {
  const minutes = Math.ceil(wordCount.value / 350)
  return Math.max(1, minutes)
})

// Calculate word count from page content (build time) or DOM (client time)
onMounted(async () => {
  if (wordCount.value > 0) return

  await nextTick()

  // Try to get from page content first
  const content = page.value.content
  if (content) {
    const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length
    const englishWords = content
      .replace(/[\u4e00-\u9fa5]/g, ' ')
      .split(/\s+/)
      .filter(w => /^[a-zA-Z]+$/.test(w))
      .length
    wordCount.value = chineseChars + englishWords
    return
  }

  // Fallback: calculate from DOM
  setTimeout(() => {
    const article = document.querySelector('.vp-doc')
    if (article) {
      const text = article.textContent || ''
      const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length
      const englishWords = text
        .replace(/[\u4e00-\u9fa5]/g, ' ')
        .split(/\s+/)
        .filter(w => /^[a-zA-Z]+$/.test(w))
        .length
      wordCount.value = chineseChars + englishWords
    }
  }, 200)
})

// Format date
const formattedDate = computed(() => {
  const date = frontmatter.value.date
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '-')
})

// Author type
const isOriginal = computed(() => frontmatter.value.author_type !== 'reprint')
const sourceUrl = computed(() => frontmatter.value.source_url)

// Top-level directories to filter out
const TOP_LEVEL_DIRS = ['blog', 'ai', 'backend', 'projects', 'categories', 'archives']

// Categories & Tags (from frontmatter, filter out top-level dirs)
const categories = computed(() => {
  return (frontmatter.value.categories || []).filter((c: string) => !TOP_LEVEL_DIRS.includes(c))
})
const tags = computed(() => frontmatter.value.tags || [])
</script>

<template>
  <div class="post-meta" v-if="frontmatter.date">
    <!-- Author -->
    <span class="meta-item" v-if="frontmatter.author">
      <Icon icon="carbon:user" class="meta-icon" />
      <span class="meta-text">{{ frontmatter.author }}</span>
    </span>

    <!-- Author type -->
    <span class="meta-item">
      <template v-if="isOriginal">
        <Icon icon="carbon:pen" class="meta-icon" />
        <span class="meta-text">原创</span>
      </template>
      <template v-else-if="sourceUrl">
        <Icon icon="carbon:link" class="meta-icon" />
        <a :href="sourceUrl" target="_blank" rel="noopener" class="meta-link">转载</a>
      </template>
    </span>

    <!-- Date -->
    <span class="meta-item" v-if="formattedDate">
      <Icon icon="carbon:calendar" class="meta-icon" />
      <span class="meta-text">{{ formattedDate }}</span>
    </span>

    <!-- Categories -->
    <span class="meta-item" v-if="categories.length > 0">
      <Icon icon="carbon:folder" class="meta-icon" />
      <span class="meta-links">
        <a
          v-for="(cat, i) in categories"
          :key="cat"
          :href="`/categories?category=${encodeURIComponent(cat)}`"
          class="meta-link-item"
        >
          {{ cat }}
        </a>
      </span>
    </span>

    <!-- Tags -->
    <span class="meta-item" v-if="tags.length > 0">
      <Icon icon="carbon:tag" class="meta-icon" />
      <span class="meta-tags">
        <a
          v-for="(tag, i) in tags"
          :key="tag"
          :href="`/categories?tag=${encodeURIComponent(tag)}`"
          class="tag"
        >
          {{ tag }}
        </a>
      </span>
    </span>

    <!-- Word count -->
    <span class="meta-item">
      <Icon icon="carbon:document" class="meta-icon" />
      <span class="meta-text">约{{ wordCount }}字</span>
    </span>

    <!-- Reading time -->
    <span class="meta-item">
      <Icon icon="carbon:time" class="meta-icon" />
      <span class="meta-text">约{{ readingTime }}分钟</span>
    </span>
  </div>
</template>

<style scoped>
.post-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 1rem;
  padding: 0.75rem 0;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  border-bottom: 1px solid var(--vp-c-divider);
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.meta-icon {
  font-size: 1rem;
  color: var(--vp-c-text-2);
}

.meta-text {
  color: var(--vp-c-text-2);
}

.meta-links {
  display: inline-flex;
  gap: 0.25rem;
}

.meta-link-item {
  color: var(--vp-c-text-2);
  text-decoration: none;
}

.meta-link-item:hover {
  color: var(--vp-c-brand-1);
}

.meta-link-item:not(:last-child)::after {
  content: ' /';
  color: var(--vp-c-text-3);
}

.meta-link {
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

.meta-link:hover {
  text-decoration: underline;
}

.meta-tags {
  display: inline-flex;
  gap: 0.25rem;
}

.tag {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  padding: 0.125rem 0.375rem;
  border-radius: 3px;
  font-size: 0.8rem;
  text-decoration: none;
}

.tag:hover {
  background: var(--vp-c-brand-1);
  color: white;
}
</style>