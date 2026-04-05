<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useData, useRoute } from 'vitepress'
import { Icon } from '@iconify/vue'

const { frontmatter, site } = useData()
const route = useRoute()

// Dropdown state
const dropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

// Toast message state
const toastMessage = ref('')
const toastType = ref<'success' | 'error' | 'info'>('success')
const toastVisible = ref(false)

// Check if current page is a post (has date in frontmatter)
const isPost = computed(() => frontmatter.value.date)

// Get base URL for image path replacement
const baseUrl = computed(() => {
  const base = site.value.base
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return origin + base
})

// Get current page URL
const currentUrl = computed(() => {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return origin + route.path
})

// Show toast message
const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
  toastMessage.value = message
  toastType.value = type
  toastVisible.value = true
  setTimeout(() => {
    toastVisible.value = false
  }, 2500)
}

// Get article content element
const getArticleElement = () => {
  return document.querySelector('.vp-doc') as HTMLElement | null
}

// Get article markdown source (we need to fetch the raw .md file)
const getMarkdownContent = async (): Promise<string> => {
  // Get the current file path from route
  const path = route.data.relativePath
  if (!path) return ''

  try {
    // Fetch the raw markdown file
    const response = await fetch(`${site.value.base}${path}`)
    if (!response.ok) {
      throw new Error('Failed to fetch markdown')
    }
    const text = await response.text()
    return text
  } catch (e) {
    // Fallback: generate from DOM
    return generateMarkdownFromDOM()
  }
}

// Generate markdown from DOM (fallback)
const generateMarkdownFromDOM = (): string => {
  const article = getArticleElement()
  if (!article) return ''

  let markdown = ''

  // Title
  const title = frontmatter.value.title || document.querySelector('h1')?.textContent || ''
  markdown += `# ${title}\n\n`

  // Description
  if (frontmatter.value.description) {
    markdown += `${frontmatter.value.description}\n\n`
  }

  // Process content
  const content = article.cloneNode(true) as HTMLElement

  // Remove elements we don't want
  content.querySelectorAll('.vp-doc h1').forEach(el => el.remove())
  content.querySelectorAll('code-group').forEach(el => el.remove())

  // Process each element
  const processElement = (el: Element): string => {
    if (el.tagName === 'H2') {
      return `## ${el.textContent?.trim() || ''}\n\n`
    }
    if (el.tagName === 'H3') {
      return `### ${el.textContent?.trim() || ''}\n\n`
    }
    if (el.tagName === 'H4') {
      return `#### ${el.textContent?.trim() || ''}\n\n`
    }
    if (el.tagName === 'P') {
      return `${el.textContent?.trim() || ''}\n\n`
    }
    if (el.tagName === 'PRE') {
      const code = el.querySelector('code')
      const lang = code?.className?.match(/language-(\w+)/)?.[1] || ''
      return `\`\`\`${lang}\n${code?.textContent || ''}\n\`\`\`\n\n`
    }
    if (el.tagName === 'UL' || el.tagName === 'OL') {
      const items = el.querySelectorAll('li')
      const prefix = el.tagName === 'OL' ? '1. ' : '- '
      return items.map(li => `${prefix}${li.textContent?.trim() || ''}`).join('\n') + '\n\n'
    }
    if (el.tagName === 'BLOCKQUOTE') {
      const lines = el.textContent?.trim()?.split('\n') || []
      return lines.map(l => `> ${l}`).join('\n') + '\n\n'
    }
    if (el.tagName === 'IMG') {
      const src = el.getAttribute('src') || ''
      const alt = el.getAttribute('alt') || ''
      return `![${alt}](${src})\n\n`
    }
    return ''
  }

  // Iterate through children
  Array.from(content.children).forEach(child => {
    markdown += processElement(child)
  })

  return markdown
}

// Replace image URLs with absolute paths
const replaceImageUrls = (content: string, format: 'markdown' | 'html'): string => {
  const base = baseUrl.value

  if (format === 'markdown') {
    // Replace markdown image syntax
    return content.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
      if (src.startsWith('/') || src.startsWith('./') || src.startsWith('../')) {
        const absoluteSrc = src.startsWith('/')
          ? `${base}${src.slice(1)}`
          : `${base}${src.replace(/^\.\.?\/?/, '')}`
        return `![${alt}](${absoluteSrc})`
      }
      return match
    })
  } else {
    // Replace HTML img src
    return content.replace(/src="([^"]+)"/g, (match, src) => {
      if (src.startsWith('/') || src.startsWith('./') || src.startsWith('../')) {
        const absoluteSrc = src.startsWith('/')
          ? `${base}${src.slice(1)}`
          : `${base}${src.replace(/^\.\.?\/?/, '')}`
        return `src="${absoluteSrc}"`
      }
      return match
    })
  }
}

// Copy as Markdown
const copyAsMarkdown = async () => {
  try {
    let content = await getMarkdownContent()

    // Remove frontmatter
    content = content.replace(/^---[\s\S]*?---\n?/, '')

    // Replace image URLs
    const processed = replaceImageUrls(content, 'markdown')

    await navigator.clipboard.writeText(processed)
    showToast('已复制 Markdown 内容', 'success')
    dropdownOpen.value = false
  } catch {
    showToast('复制失败', 'error')
  }
}

// Copy as HTML
const copyAsHTML = async () => {
  try {
    // Dynamic import markdown-it
    const { default: MarkdownIt } = await import('markdown-it')

    // Get markdown content
    let markdown = await getMarkdownContent()

    // Remove frontmatter
    markdown = markdown.replace(/^---[\s\S]*?---\n?/, '')

    // Replace image URLs
    const processedMarkdown = replaceImageUrls(markdown, 'markdown')

    // Create markdown-it instance
    const md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true
    })

    // Render to HTML
    let html = md.render(processedMarkdown)

    // Add title
    const title = frontmatter.value.title || ''
    const fullHtml = `# ${title}\n\n${frontmatter.value.description || ''}\n\n${html}`

    await navigator.clipboard.writeText(fullHtml)
    showToast('已复制 HTML 内容', 'success')
    dropdownOpen.value = false
  } catch {
    showToast('复制失败', 'error')
  }
}

// Copy link
const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(currentUrl.value)
    showToast('已复制文章链接', 'success')
    dropdownOpen.value = false
  } catch {
    showToast('复制失败', 'error')
  }
}

// Download as PDF
const downloadAsPDF = async () => {
  dropdownOpen.value = false
  showToast('正在生成 PDF...', 'info')

  try {
    // Dynamic imports
    const { default: MarkdownIt } = await import('markdown-it')
    const { default: html2pdf } = await import('html2pdf.js')

    // Get markdown content
    let markdown = await getMarkdownContent()

    // Remove frontmatter
    markdown = markdown.replace(/^---[\s\S]*?---\n?/, '')

    // Replace image URLs in markdown
    const processedMarkdown = replaceImageUrls(markdown, 'markdown')

    // Create markdown-it instance
    const md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true
    })

    // Render markdown to HTML
    const htmlContent = md.render(processedMarkdown)

    // Create wrapper element
    const wrapper = document.createElement('div')
    wrapper.innerHTML = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.7; color: #333; max-width: 100%; padding: 20px;">
        <h1 style="font-size: 28px; margin-bottom: 8px; color: #1a1a1a; border-bottom: 2px solid #7c3aed; padding-bottom: 12px;">
          ${frontmatter.value.title || ''}
        </h1>
        ${frontmatter.value.description ? `<p style="color: #666; margin-bottom: 24px; font-size: 14px;">${frontmatter.value.description}</p>` : ''}
        ${frontmatter.value.date ? `<p style="color: #888; font-size: 12px; margin-bottom: 20px;">发布于 ${frontmatter.value.date}</p>` : ''}
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <div style="font-size: 14px;">
          ${htmlContent}
        </div>
      </div>
    `

    // Add custom styles
    const style = document.createElement('style')
    style.textContent = `
      h2 { font-size: 22px; margin-top: 32px; margin-bottom: 16px; color: #1a1a1a; border-left: 4px solid #7c3aed; padding-left: 12px; }
      h3 { font-size: 18px; margin-top: 24px; margin-bottom: 12px; color: #333; }
      h4 { font-size: 16px; margin-top: 20px; margin-bottom: 10px; color: #444; }
      p { margin-bottom: 16px; }
      code { background: #f5f5f5; padding: 2px 6px; border-radius: 4px; font-size: 13px; font-family: 'Fira Code', 'Consolas', monospace; }
      pre { background: #1e1e1e; color: #d4d4d4; padding: 16px; border-radius: 8px; overflow-x: auto; margin: 16px 0; }
      pre code { background: transparent; padding: 0; color: inherit; }
      blockquote { border-left: 4px solid #7c3aed; margin: 16px 0; padding: 8px 16px; background: #f8f8ff; color: #555; }
      table { border-collapse: collapse; width: 100%; margin: 16px 0; }
      th, td { border: 1px solid #ddd; padding: 10px 12px; text-align: left; }
      th { background: #f5f5f5; font-weight: 600; }
      tr:nth-child(even) { background: #fafafa; }
      img { max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0; }
      ul, ol { padding-left: 24px; margin-bottom: 16px; }
      li { margin-bottom: 8px; }
      a { color: #7c3aed; text-decoration: none; }
      hr { border: none; border-top: 1px solid #eee; margin: 24px 0; }
    `
    wrapper.prepend(style)

    const title = frontmatter.value.title || 'article'
    const filename = `${title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}.pdf`

    await html2pdf()
      .set({
        margin: [10, 15, 10, 15],
        filename: filename,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          letterRendering: true
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait'
        },
        pagebreak: { mode: 'avoid-all', before: '.page-break' }
      })
      .from(wrapper)
      .save()

    showToast('PDF 已下载', 'success')
  } catch (e) {
    console.error('PDF generation error:', e)
    showToast('生成 PDF 失败', 'error')
  }
}

// Close dropdown on outside click
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
</script>

<template>
  <div v-if="isPost" ref="dropdownRef" class="copy-article">
    <button class="copy-trigger" @click.stop="dropdownOpen = !dropdownOpen">
      <span class="trigger-label">复制</span>
      <Icon icon="carbon:copy" class="trigger-icon" />
      <Icon :icon="dropdownOpen ? 'carbon:chevron-up' : 'carbon:chevron-down'" class="trigger-arrow" />
    </button>

    <transition name="dropdown">
      <div v-if="dropdownOpen" class="copy-dropdown">
        <ul class="dropdown-list">
          <li class="dropdown-item" @click="copyAsMarkdown">
            <Icon icon="carbon:document" class="item-icon markdown" />
            <span class="item-label">复制为 Markdown</span>
          </li>
          <li class="dropdown-item" @click="copyAsHTML">
            <Icon icon="carbon:code" class="item-icon html" />
            <span class="item-label">复制为 HTML</span>
          </li>
          <li class="dropdown-item" @click="copyLink">
            <Icon icon="carbon:link" class="item-icon link" />
            <span class="item-label">复制链接</span>
          </li>
          <li class="dropdown-divider"></li>
          <li class="dropdown-item" @click="downloadAsPDF">
            <Icon icon="carbon:download" class="item-icon pdf" />
            <span class="item-label">下载为 PDF</span>
          </li>
        </ul>
      </div>
    </transition>

    <!-- Toast Message -->
    <transition name="toast">
      <div v-if="toastVisible" :class="['toast-message', toastType]">
        <Icon v-if="toastType === 'success'" icon="carbon:checkmark-filled" class="toast-icon" />
        <Icon v-if="toastType === 'error'" icon="carbon:close-filled" class="toast-icon" />
        <Icon v-if="toastType === 'info'" icon="carbon:information-filled" class="toast-icon" />
        <span>{{ toastMessage }}</span>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.copy-article {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.copy-trigger {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.2s ease;
}

.copy-trigger:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.trigger-label {
  font-size: 0.8125rem;
  font-weight: 500;
}

.trigger-icon {
  font-size: 0.875rem;
}

.trigger-arrow {
  font-size: 0.75rem;
}

.copy-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 160px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 100;
}

.dropdown-list {
  list-style: none;
  padding: 0.375rem 0;
  margin: 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.dropdown-item:hover {
  background: var(--vp-c-brand-soft);
}

.dropdown-divider {
  height: 1px;
  background: var(--vp-c-divider);
  margin: 0.375rem 0.75rem;
}

.item-icon {
  font-size: 0.875rem;
}

.item-icon.markdown {
  color: var(--vp-c-brand-1);
}

.item-icon.html {
  color: #e34c26;
}

.item-icon.link {
  color: #3b82f6;
}

.item-icon.pdf {
  color: #d14233;
}

.item-label {
  flex: 1;
  color: var(--vp-c-text-1);
  font-size: 0.8125rem;
}

/* Toast Message */
.toast-message {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: var(--vp-c-bg);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-size: 0.875rem;
  z-index: 200;
  border: 1px solid var(--vp-c-divider);
}

.toast-message.success {
  border-color: #22c55e;
}

.toast-message.success .toast-icon {
  color: #22c55e;
}

.toast-message.error {
  border-color: #ef4444;
}

.toast-message.error .toast-icon {
  color: #ef4444;
}

.toast-message.info {
  border-color: #3b82f6;
}

.toast-message.info .toast-icon {
  color: #3b82f6;
}

.toast-icon {
  font-size: 1rem;
}

/* Dropdown transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* Toast transition */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}
</style>