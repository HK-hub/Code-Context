<script setup lang="ts">
import { useData } from 'vitepress'

const { isDark } = useData()
</script>

<template>
  <button
    class="dark-mode-toggle"
    @click="isDark = !isDark"
    :title="isDark ? '切换到亮色模式' : '切换到暗色模式'"
    :aria-label="isDark ? '切换到亮色模式' : '切换到暗色模式'"
    type="button"
  >
    <span v-if="isDark" class="icon sun">&#9728;</span>
    <span v-else class="icon moon">&#127769;</span>
  </button>
</template>

<style scoped>
.dark-mode-toggle {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dark-mode-toggle:hover {
  background: var(--vp-c-bg-soft);
}

.icon {
  font-size: 18px;
  line-height: 1;
}

.sun {
  color: #f59e0b;
}

.moon {
  color: #6366f1;
}
</style>