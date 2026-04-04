<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { data as posts } from '../../data/posts.data'

// Pagination
const pageSize = 20
const currentPage = ref(1)

// Total pages
const totalPages = computed(() => Math.ceil(posts.length / pageSize))

// Paginated posts
const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return posts.slice(start, end)
})

// Group by year
const postsByYear = computed(() => {
  const map = new Map<number, typeof posts>()
  for (const post of paginatedPosts.value) {
    const year = new Date(post.date).getFullYear()
    if (!map.has(year)) {
      map.set(year, [])
    }
    map.get(year)!.push(post)
  }
  return new Map([...map.entries()].sort((a, b) => b[0] - a[0]))
})

// Format date
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}-${day}`
}
</script>

<template>
  <div class="archives-page">
    <h1>归档</h1>
    <p class="summary">共 {{ posts.length }} 篇文章</p>

    <div class="timeline">
      <div v-for="[year, yearPosts] of postsByYear" :key="year" class="year-group">
        <div class="year-header">
          <Icon icon="carbon:calendar" class="year-icon" />
          <h2>{{ year }}</h2>
          <span class="count">{{ yearPosts.length }} 篇</span>
        </div>

        <ul class="post-list">
          <li v-for="post in yearPosts" :key="post.url" class="post-item">
            <span class="post-date">{{ formatDate(post.date) }}</span>
            <a :href="post.url" class="post-link">{{ post.title }}</a>
            <div class="post-tags">
              <a
                v-for="cat in post.categories"
                :key="cat"
                :href="`/categories?category=${encodeURIComponent(cat)}`"
                class="post-category"
              >
                {{ cat }}
              </a>
              <a
                v-for="tag in post.tags"
                :key="tag"
                :href="`/categories?tag=${encodeURIComponent(tag)}`"
                class="post-tag"
              >
                {{ tag }}
              </a>
            </div>
          </li>
        </ul>
      </div>
    </div>

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
</template>

<style scoped>
.archives-page {
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
  margin-bottom: 2rem;
}

.timeline {
  position: relative;
  padding-left: 1rem;
}

.year-group {
  margin-bottom: 2rem;
}

.year-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--vp-c-brand-1);
}

.year-icon {
  font-size: 1.25rem;
  color: var(--vp-c-brand-1);
}

.year-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.count {
  color: var(--vp-c-text-2);
  font-size: 0.875rem;
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
  min-width: 3rem;
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
  text-decoration: none;
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
  text-decoration: none;
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
  margin-top: 2rem;
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