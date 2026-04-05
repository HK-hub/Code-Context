<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'
import { data as posts } from '../../data/posts.data'

// Get all unique years
const allYears = computed(() => {
  const years = new Set<number>()
  for (const post of posts) {
    years.add(new Date(post.date).getFullYear())
  }
  return Array.from(years).sort((a, b) => b[0] - a[0])
})

// Year with count
const yearOptions = computed(() => {
  return allYears.value.map(year => ({
    value: year,
    label: `${year}年`,
    count: posts.filter(p => new Date(p.date).getFullYear() === year).length
  }))
})

// Selected year filter
const selectedYear = ref<number | null>(null)

// Dropdown state
const dropdownOpen = ref(false)

// Pagination
const pageSize = 20
const currentPage = ref(1)

// Filter posts by year
const filteredPosts = computed(() => {
  if (selectedYear.value === null) {
    return posts
  }
  return posts.filter(post => new Date(post.date).getFullYear() === selectedYear.value)
})

// Total pages
const totalPages = computed(() => Math.ceil(filteredPosts.value.length / pageSize))

// Paginated posts
const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredPosts.value.slice(start, end)
})

// Selected label
const selectedLabel = computed(() => {
  if (selectedYear.value === null) {
    return '全部年份'
  }
  const opt = yearOptions.value.find(y => y.value === selectedYear.value)
  return opt ? `${opt.label} (${opt.count}篇)` : '全部年份'
})

// Reset pagination when year changes
const selectYear = (year: number | null) => {
  selectedYear.value = year
  currentPage.value = 1
  dropdownOpen.value = false
}

// Toggle dropdown
const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

// Close dropdown on outside click
const dropdownRef = ref<HTMLElement | null>(null)

const handleClickOutside = (e: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    dropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
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
    <div class="header-row">
      <h1>归档</h1>
      <div ref="dropdownRef" class="year-filter">
        <button class="filter-trigger" @click="toggleDropdown">
          <Icon icon="carbon:calendar" class="trigger-icon" />
          <span>{{ selectedLabel }}</span>
          <Icon :icon="dropdownOpen ? 'carbon:chevron-up' : 'carbon:chevron-down'" class="trigger-arrow" />
        </button>
        <transition name="dropdown">
          <div v-if="dropdownOpen" class="filter-dropdown">
            <div class="dropdown-header">
              <Icon icon="carbon:filter" />
              <span>选择年份</span>
            </div>
            <ul class="dropdown-list">
              <li
                :class="['dropdown-item', { active: selectedYear === null }]"
                @click="selectYear(null)"
              >
                <Icon icon="carbon:grid" class="item-icon" />
                <span class="item-label">全部年份</span>
                <span class="item-count">{{ posts.length }}篇</span>
              </li>
              <li
                v-for="opt in yearOptions"
                :key="opt.value"
                :class="['dropdown-item', { active: selectedYear === opt.value }]"
                @click="selectYear(opt.value)"
              >
                <Icon icon="carbon:calendar" class="item-icon" />
                <span class="item-label">{{ opt.label }}</span>
                <span class="item-count">{{ opt.count }}篇</span>
              </li>
            </ul>
          </div>
        </transition>
      </div>
    </div>
    <p class="summary">共 {{ filteredPosts.length }} 篇文章</p>

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

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

h1 {
  font-size: 2rem;
  font-weight: 600;
  margin: 0;
}

.year-filter {
  position: relative;
  display: flex;
  align-items: center;
}

.filter-trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-trigger:hover {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-bg);
}

.trigger-icon {
  font-size: 1rem;
  color: var(--vp-c-brand-1);
}

.trigger-arrow {
  font-size: 0.875rem;
  color: var(--vp-c-text-3);
  transition: transform 0.2s;
}

.filter-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 200px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  z-index: 100;
}

.dropdown-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  font-size: 0.8125rem;
  font-weight: 500;
}

.dropdown-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 300px;
  overflow-y: auto;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all 0.15s ease;
  border-bottom: 1px solid var(--vp-c-divider-light);
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background: var(--vp-c-brand-soft);
}

.dropdown-item.active {
  background: var(--vp-c-brand-soft);
  border-left: 3px solid var(--vp-c-brand-1);
}

.item-icon {
  font-size: 1rem;
  color: var(--vp-c-text-3);
}

.dropdown-item.active .item-icon {
  color: var(--vp-c-brand-1);
}

.item-label {
  flex: 1;
  color: var(--vp-c-text-1);
  font-size: 0.875rem;
}

.item-count {
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-2);
  padding: 0.125rem 0.5rem;
  border-radius: 10px;
  font-size: 0.75rem;
}

.dropdown-item.active .item-count {
  background: var(--vp-c-brand-1);
  color: white;
}

/* Dropdown transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.summary {
  color: var(--vp-c-text-2);
  margin-top: 0.5rem;
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