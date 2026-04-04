<script setup lang="ts">
import { useData, useRoute } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { computed, onMounted, watch, ref } from 'vue'
import PostMeta from './components/PostMeta.vue'
import BackToTop from './components/BackToTop.vue'

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

    <!-- Bottom layout area -->
    <template #layout-bottom>
      <BackToTop />
    </template>
  </DefaultTheme.Layout>
</template>