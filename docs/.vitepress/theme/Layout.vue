<script setup lang="ts">
import { useData, useRoute } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { computed, onMounted, watch, ref } from 'vue'
import PostMeta from './components/PostMeta.vue'
import BackToTop from './components/BackToTop.vue'
import CopyArticle from './components/CopyArticle.vue'

const { isDark, frontmatter } = useData()
const route = useRoute()

// Check if current page is a post (has date in frontmatter)
const isPost = computed(() => frontmatter.value.date)

// Ensure dark mode preference is properly initialized
onMounted(() => {
  // VitePress handles localStorage persistence automatically via appearance: true
  // This hook is available for future enhancements
})
</script>

<template>
  <DefaultTheme.Layout>
    <!-- Post meta info after title -->
    <template #doc-before>
      <PostMeta v-if="isPost" />
    </template>

    <!-- Dark mode toggle in navbar -->
    <template #nav-bar-content-after>
      <!-- Dark mode toggle will be injected here by VitePress when appearance: true -->
    </template>

    <!-- Footer area (for comments etc.) -->
    <template #doc-footer-before>
      <!-- Reserved for Phase 4: Giscus comments -->
    </template>

    <!-- Outline header with copy button -->
    <template #aside-outline-before>
      <div class="outline-header">
        <span class="outline-title">导出</span>
        <CopyArticle />
      </div>
    </template>

    <!-- Bottom layout area -->
    <template #layout-bottom>
      <BackToTop />
    </template>
  </DefaultTheme.Layout>
</template>

<style>
/* Outline header styling */
.outline-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px 8px;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.outline-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-text-2);
}
</style>