<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { linkCategories, mySiteInfo } from '../../data/links'
import type { Link } from '../../data/links'

// Copy status
const copyStatus = ref<'idle' | 'success' | 'error'>('idle')

// Copy site info to clipboard
const copySiteInfo = async () => {
  const info = `- **博客名称**: ${mySiteInfo.name}
- **博客地址**: ${mySiteInfo.url}
- **博客描述**: ${mySiteInfo.desc}
- **Logo**: ${mySiteInfo.avatar}`

  try {
    await navigator.clipboard.writeText(info)
    copyStatus.value = 'success'
    setTimeout(() => {
      copyStatus.value = 'idle'
    }, 2000)
  } catch {
    copyStatus.value = 'error'
    setTimeout(() => {
      copyStatus.value = 'idle'
    }, 2000)
  }
}

// Total links count
const totalLinks = computed(() => {
  return linkCategories.reduce((sum, cat) => sum + cat.links.length, 0)
})

// Animation on hover
const handleMouseEnter = (e: MouseEvent) => {
  const target = e.currentTarget as HTMLElement
  target.style.transform = 'translateY(-4px)'
}

const handleMouseLeave = (e: MouseEvent) => {
  const target = e.currentTarget as HTMLElement
  target.style.transform = 'translateY(0)'
}
</script>

<template>
  <div class="links-page">
    <h1>友链站点</h1>
    <p class="summary">共 {{ totalLinks }} 个友链，欢迎交换！</p>

    <!-- My Site Info Card -->
    <div class="my-site-section">
      <h2>
        <Icon icon="carbon:star" class="section-icon" />
        本站信息
      </h2>
      <div class="my-site-card" :style="{ borderColor: mySiteInfo.color }">
        <div class="my-site-avatar">
          <img :src="mySiteInfo.avatar" :alt="mySiteInfo.name" />
        </div>
        <div class="my-site-info">
          <h3>{{ mySiteInfo.name }}</h3>
          <p class="my-site-desc">{{ mySiteInfo.desc }}</p>
          <a :href="mySiteInfo.url" target="_blank" class="my-site-url">
            <Icon icon="carbon:link" />
            {{ mySiteInfo.url }}
          </a>
        </div>
        <button
          class="copy-btn"
          :class="{ success: copyStatus === 'success', error: copyStatus === 'error' }"
          @click="copySiteInfo"
        >
          <Icon v-if="copyStatus === 'idle'" icon="carbon:copy" />
          <Icon v-if="copyStatus === 'success'" icon="carbon:checkmark" />
          <Icon v-if="copyStatus === 'error'" icon="carbon:close" />
          {{ copyStatus === 'success' ? '已复制' : copyStatus === 'error' ? '失败' : '复制信息' }}
        </button>
      </div>
    </div>

    <!-- Link Categories -->
    <div v-for="category in linkCategories" :key="category.name" class="category-section">
      <h2>
        <Icon icon="carbon:folder" class="section-icon" />
        {{ category.name }}
        <span class="category-count">{{ category.links.length }}</span>
      </h2>

      <div class="links-grid">
        <a
          v-for="link in category.links"
          :key="link.name"
          :href="link.url"
          target="_blank"
          rel="noopener noreferrer"
          class="link-card"
          :style="{ borderColor: link.color || '#7c3aed' }"
          @mouseenter="handleMouseEnter"
          @mouseleave="handleMouseLeave"
        >
          <div class="link-avatar">
            <img :src="link.avatar" :alt="link.name" loading="lazy" />
          </div>
          <div class="link-info">
            <h3 class="link-name">{{ link.name }}</h3>
            <p class="link-desc">{{ link.desc }}</p>
          </div>
          <div class="link-arrow">
            <Icon icon="carbon:arrow-right" />
          </div>
        </a>
      </div>
    </div>

    <!-- How to Apply -->
    <div class="apply-section">
      <h2>
        <Icon icon="carbon:add" class="section-icon" />
        申请友链
      </h2>
      <div class="apply-content">
        <p>如果你希望交换友链，请通过以下方式联系我：</p>
        <ul>
          <li>在 GitHub 上提交 Issue</li>
          <li>发送邮件至我的邮箱</li>
        </ul>
        <p>请提供以下信息：</p>
        <ul>
          <li>博客/站点名称</li>
          <li>博客地址</li>
          <li>站点描述（简短介绍）</li>
          <li>头像/Logo链接</li>
          <li>主题色（可选）</li>
        </ul>
        <div class="apply-tip">
          <Icon icon="carbon:information" />
          <span>友链要求：网站内容主要为技术类或个人博客，网站能够正常访问，内容积极向上</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.links-page {
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

/* Section Header */
h2 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--vp-c-text-1);
}

.section-icon {
  font-size: 1.25rem;
  color: var(--vp-c-brand-1);
}

.category-count {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

/* My Site Section */
.my-site-section {
  margin-bottom: 2rem;
}

.my-site-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  border-left: 4px solid;
  transition: all 0.3s ease;
}

.my-site-avatar {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  overflow: hidden;
  background: var(--vp-c-bg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.my-site-avatar img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 8px;
}

.my-site-info {
  flex: 1;
}

.my-site-info h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: var(--vp-c-text-1);
}

.my-site-desc {
  color: var(--vp-c-text-2);
  font-size: 0.875rem;
  margin: 0 0 0.5rem 0;
  line-height: 1.5;
}

.my-site-url {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--vp-c-brand-1);
  font-size: 0.875rem;
  text-decoration: none;
}

.my-site-url:hover {
  text-decoration: underline;
}

.copy-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  transition: all 0.2s;
}

.copy-btn:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.copy-btn.success {
  border-color: #22c55e;
  color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
}

.copy-btn.error {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

/* Category Section */
.category-section {
  margin-bottom: 2rem;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.link-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  border-left: 3px solid;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
}

.link-card:hover {
  background: var(--vp-c-bg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.link-avatar {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  background: var(--vp-c-bg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.link-avatar img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 4px;
}

.link-info {
  flex: 1;
  overflow: hidden;
}

.link-name {
  font-size: 0.9375rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: var(--vp-c-text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.link-desc {
  font-size: 0.8125rem;
  color: var(--vp-c-text-2);
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.link-arrow {
  color: var(--vp-c-text-3);
  font-size: 1rem;
  transition: transform 0.2s;
}

.link-card:hover .link-arrow {
  transform: translateX(4px);
  color: var(--vp-c-brand-1);
}

/* Apply Section */
.apply-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--vp-c-divider);
}

.apply-content {
  background: var(--vp-c-bg-soft);
  padding: 1.5rem;
  border-radius: 8px;
}

.apply-content p {
  color: var(--vp-c-text-1);
  margin: 0 0 0.5rem 0;
}

.apply-content ul {
  color: var(--vp-c-text-2);
  margin: 0 0 1rem 0;
  padding-left: 1.5rem;
}

.apply-content li {
  margin-bottom: 0.25rem;
}

.apply-tip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--vp-c-brand-soft);
  border-radius: 6px;
  color: var(--vp-c-brand-1);
  font-size: 0.875rem;
  margin-top: 1rem;
}

/* Responsive */
@media (max-width: 640px) {
  .links-page {
    padding: 1rem;
  }

  .my-site-card {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .my-site-info {
    text-align: center;
  }

  .copy-btn {
    width: 100%;
    justify-content: center;
  }

  .links-grid {
    grid-template-columns: 1fr;
  }
}
</style>