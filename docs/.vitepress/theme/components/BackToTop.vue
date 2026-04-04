<script setup lang="ts">
import { useWindowScroll, useWindowSize } from '@vueuse/core'
import { computed, ref, onMounted } from 'vue'

// 滚动位置
const { y } = useWindowScroll()
// 窗口高度
const { height: windowHeight } = useWindowSize()

// 文档总高度
const docHeight = ref(0)

// 更新文档高度
onMounted(() => {
  docHeight.value = document.documentElement.scrollHeight
})

// 显示阈值：滚动超过 300px
const showThreshold = 300

// 是否显示按钮
const isVisible = computed(() => y.value > showThreshold)

// 阅读进度百分比 (0-100)
const progress = computed(() => {
  if (docHeight.value <= windowHeight.value) return 0
  const scrollableHeight = docHeight.value - windowHeight.value
  return Math.min(100, Math.round((y.value / scrollableHeight) * 100))
})

// SVG 圆环参数
const radius = 20
const circumference = 2 * Math.PI * radius
const strokeOffset = computed(() => circumference - (progress.value / 100) * circumference)

// 点击回到顶部
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// 监听路由变化，重置文档高度
import { useRoute } from 'vitepress'
const route = useRoute()

// 每次路由变化后重新计算文档高度
import { watch } from 'vue'
watch(route, () => {
  setTimeout(() => {
    docHeight.value = document.documentElement.scrollHeight
  }, 100)
})
</script>

<template>
  <Transition name="fade">
    <button
      v-if="isVisible"
      class="back-to-top"
      @click="scrollToTop"
      :aria-label="`回到顶部 (${progress}%已阅读)`"
      title="回到顶部"
    >
      <!-- SVG 进度环 -->
      <svg
        class="progress-ring"
        viewBox="0 0 48 48"
        width="48"
        height="48"
      >
        <!-- 背景圆环 -->
        <circle
          cx="24"
          cy="24"
          :r="radius"
          fill="none"
          stroke="var(--vp-c-border)"
          stroke-width="3"
        />
        <!-- 进度圆环 -->
        <circle
          cx="24"
          cy="24"
          :r="radius"
          fill="none"
          stroke="var(--vp-c-brand-1)"
          stroke-width="3"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="strokeOffset"
          stroke-linecap="round"
          transform="rotate(-90 24 24)"
        />
      </svg>
      <!-- 向上箭头图标 -->
      <svg
        class="arrow-icon"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M18 15l-6-6-6 6" />
      </svg>
      <!-- 进度数字 -->
      <span class="progress-text">{{ progress }}</span>
    </button>
  </Transition>
</template>

<style scoped>
.back-to-top {
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 50%;
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
  z-index: 100;
}

.back-to-top:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  background: var(--vp-c-bg);
}

.back-to-top:active {
  transform: translateY(0);
}

.progress-ring {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
}

.arrow-icon {
  color: var(--vp-c-text-1);
  z-index: 1;
}

.progress-text {
  position: absolute;
  bottom: -20px;
  font-size: 11px;
  color: var(--vp-c-text-2);
  font-weight: 500;
  pointer-events: none;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* 暗色模式适配 */
.dark .back-to-top {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}

.dark .back-to-top:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}
</style>