<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vitepress'
import { Icon } from '@iconify/vue'
import { data as posts } from '../../data/posts.data'

const route = useRoute()
const router = useRouter()

// Get all unique categories and tags
const allCategories = computed(() => {
  const set = new Set<string>()
  for (const post of posts) {
    for (const cat of post.categories) {
      set.add(cat)
    }
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'zh-CN'))
})

const allTags = computed(() => {
  const set = new Set<string>()
  for (const post of posts) {
    for (const tag of post.tags) {
      set.add(tag)
    }
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'zh-CN'))
})

// Selected filters
const selectedCategory = ref<string | null>(null)
const selectedTag = ref<string | null>(null)

// Pagination
const pageSize = 20
const currentPage = ref(1)

// Expand/collapse state for filters (default: collapsed, show 3 rows)
const categoriesExpanded = ref(false)
const tagsExpanded = ref(false)

// Calculate items per row based on button width (~80px average + 8px gap)
// 3 rows ≈ items that fit in container width / button width * 3
// For 900px container, filter-options ≈ 800px, each btn ≈ 80px, so ~10 per row, 30 items for 3 rows
const maxVisibleItems = 30 // approximately 3 rows

// Visible categories/tags
const visibleCategories = computed(() => {
  if (categoriesExpanded.value || allCategories.value.length <= maxVisibleItems) {
    return allCategories.value
  }
  return allCategories.value.slice(0, maxVisibleItems)
})

const visibleTags = computed(() => {
  if (tagsExpanded.value || allTags.value.length <= maxVisibleItems) {
    return allTags.value
  }
  return allTags.value.slice(0, maxVisibleItems)
})

const hasMoreCategories = computed(() => allCategories.value.length > maxVisibleItems)
const hasMoreTags = computed(() => allTags.value.length > maxVisibleItems)

// Initialize from URL params
onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  const cat = params.get('category')
  const tag = params.get('tag')
  if (cat && allCategories.value.includes(cat)) {
    selectedCategory.value = cat
  }
  if (tag && allTags.value.includes(tag)) {
    selectedTag.value = tag
  }
})

// Filtered posts
const filteredPosts = computed(() => {
  let result = posts

  if (selectedCategory.value) {
    result = result.filter(p => p.categories.includes(selectedCategory.value!))
  }

  if (selectedTag.value) {
    result = result.filter(p => p.tags.includes(selectedTag.value!))
  }

  return result
})

// Paginated posts
const totalPages = computed(() => Math.ceil(filteredPosts.value.length / pageSize))

const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredPosts.value.slice(start, end)
})

// Select category
const selectCategory = (cat: string | null) => {
  selectedCategory.value = cat
  currentPage.value = 1
  updateUrl()
}

// Select tag
const selectTag = (tag: string | null) => {
  selectedTag.value = tag
  currentPage.value = 1
  updateUrl()
}

// Toggle expand/collapse
const toggleCategories = () => {
  categoriesExpanded.value = !categoriesExpanded.value
}

const toggleTags = () => {
  tagsExpanded.value = !tagsExpanded.value
}

// Update URL params
const updateUrl = () => {
  const params = new URLSearchParams()
  if (selectedCategory.value) params.set('category', selectedCategory.value)
  if (selectedTag.value) params.set('tag', selectedTag.value)
  const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname
  window.history.replaceState({}, '', newUrl)
}

// Format date
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
</script>

<template>
  <div class="categories-page">
    <h1>分类</h1>
    <p class="summary">共 {{ posts.length }} 篇文章</p>

    <!-- Categories Row -->
    <div class="filter-section">
      <div class="filter-label">
        <Icon icon="carbon:folder" />
        <span>分类</span>
      </div>
      <div class="filter-options">
        <button
          :class="['filter-btn', { active: !selectedCategory }]"
          @click="selectCategory(null)"
        >
          全部
        </button>
        <button
          v-for="cat in visibleCategories"
          :key="cat"
          :class="['filter-btn', { active: selectedCategory === cat }]"
          @click="selectCategory(cat)"
        >
          {{ cat }}
        </button>
        <button
          v-if="hasMoreCategories"
          class="expand-btn"
          @click="toggleCategories"
        >
          {{ categoriesExpanded ? '收起' : `展开 (${allCategories.length - maxVisibleItems})` }}
          <Icon :icon="categoriesExpanded ? 'carbon:chevron-up' : 'carbon:chevron-down'" />
        </button>
      </div>
    </div>

    <!-- Tags Row -->
    <div class="filter-section">
      <div class="filter-label">
        <Icon icon="carbon:tag" />
        <span>标签</span>
      </div>
      <div class="filter-options">
        <button
          :class="['filter-btn tag-btn', { active: !selectedTag }]"
          @click="selectTag(null)"
        >
          全部
        </button>
        <button
          v-for="tag in visibleTags"
          :key="tag"
          :class="['filter-btn tag-btn', { active: selectedTag === tag }]"
          @click="selectTag(tag)"
        >
          {{ tag }}
        </button>
        <button
          v-if="hasMoreTags"
          class="expand-btn"
          @click="toggleTags"
        >
          {{ tagsExpanded ? '收起' : `展开 (${allTags.length - maxVisibleItems})` }}
          <Icon :icon="tagsExpanded ? 'carbon:chevron-up' : 'carbon:chevron-down'" />
        </button>
      </div>
    </div>

    <!-- Posts List -->
    <div class="posts-section">
      <div class="posts-info">
        显示 {{ paginatedPosts.length }} 篇，共 {{ filteredPosts.length }} 篇
      </div>

      <ul class="post-list">
        <li v-for="post in paginatedPosts" :key="post.url" class="post-item">
          <span class="post-date">{{ formatDate(post.date) }}</span>
          <a :href="post.url" class="post-link">{{ post.title }}</a>
          <div class="post-tags">
            <button
              v-for="cat in post.categories"
              :key="cat"
              class="post-category"
              @click.prevent="selectCategory(cat)"
            >
              {{ cat }}
            </button>
            <button
              v-for="tag in post.tags"
              :key="tag"
              class="post-tag"
              @click.prevent="selectTag(tag)"
            >
              {{ tag }}
            </button>
          </div>
        </li>
      </ul>

      <!-- Pagination -->
      <div class="pagination" v-if="totalPages > 1">
        <button
          class="page-btn"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          上一页
        </button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        <button
          class="page-btn"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.categories-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.summary {
  color: var(--vp-c-text-2);
  margin-bottom: 1.5rem;
}

/* Filter Section */
.filter-section {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  min-width: 60px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  padding-top: 0.25rem;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  flex: 1;
}

.filter-btn {
  padding: 0.25rem 0.75rem;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  transition: all 0.2s;
}

.filter-btn:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.filter-btn.active {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  color: white;
}

.tag-btn.active {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.expand-btn {
  padding: 0.25rem 0.75rem;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--vp-c-brand-1);
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.2s;
}

.expand-btn:hover {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand-1);
}

/* Posts Section */
.posts-section {
  margin-top: 1.5rem;
}

.posts-info {
  color: var(--vp-c-text-3);
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
}

.post-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.post-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--vp-c-divider);
}

.post-date {
  color: var(--vp-c-text-3);
  font-size: 0.875rem;
  font-family: monospace;
  min-width: 5.5rem;
}

.post-link {
  color: var(--vp-c-text-1);
  text-decoration: none;
  font-weight: 500;
  flex: 1;
}

.post-link:hover {
  color: var(--vp-c-brand-1);
}

.post-category {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  padding: 0.125rem 0.5rem;
  border-radius: 3px;
  font-size: 0.75rem;
  border: none;
  cursor: pointer;
}

.post-category:hover {
  background: var(--vp-c-brand-1);
  color: white;
}

.post-tag {
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-2);
  padding: 0.125rem 0.5rem;
  border-radius: 3px;
  font-size: 0.75rem;
  border: none;
  cursor: pointer;
}

.post-tag:hover {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.post-tags {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
}

.page-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

.page-btn:hover:not(:disabled) {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: var(--vp-c-text-2);
  font-size: 0.875rem;
}
</style>