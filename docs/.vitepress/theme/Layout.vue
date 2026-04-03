<script setup lang="ts">
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { onMounted } from 'vue'

const { isDark } = useData()

// Ensure dark mode preference is properly initialized
onMounted(() => {
  // VitePress handles localStorage persistence automatically via appearance: true
  // This hook is available for future enhancements
})
</script>

<template>
  <DefaultTheme.Layout>
    <!-- Custom slot overrides for future phases -->
    <template #nav-bar-content-after>
      <!-- Dark mode toggle will be injected here by VitePress when appearance: true -->
    </template>

    <template #doc-footer-before>
      <!-- Reserved for Phase 4: Giscus comments -->
    </template>

    <template #layout-bottom>
      <!-- Reserved for Phase 7: Back-to-top button -->
    </template>
  </DefaultTheme.Layout>
</template>