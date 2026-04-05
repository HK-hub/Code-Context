import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { useRoute } from 'vitepress'
import Layout from './Layout.vue'
import Categories from './components/Categories.vue'
import Archives from './components/Archives.vue'
import Links from './components/Links.vue'
import PostMeta from './components/PostMeta.vue'
import BackToTop from './components/BackToTop.vue'
import CopyArticle from './components/CopyArticle.vue'
import { Icon } from '@iconify/vue'
import imageViewer from 'vitepress-plugin-image-viewer'
import vImageViewer from 'vitepress-plugin-image-viewer/lib/vImageViewer.vue'
import 'viewerjs/dist/viewer.min.css'
import './styles/custom.css'

export default {
  extends: DefaultTheme,
  Layout: Layout,
  enhanceApp({ app, router, siteData }) {
    // Register global components for use in markdown
    app.component('Categories', Categories)
    app.component('Archives', Archives)
    app.component('Links', Links)
    app.component('PostMeta', PostMeta)
    app.component('BackToTop', BackToTop)
    app.component('Icon', Icon)
    // Register image viewer component
    app.component('vImageViewer', vImageViewer)
  },
  setup() {
    const route = useRoute()
    // Initialize image viewer
    imageViewer(route, '.vp-doc', {
      toolbar: {
        zoomIn: true,
        zoomOut: true,
        oneToOne: true,
        reset: true,
        prev: true,
        play: true,
        next: true,
        rotateLeft: true,
        rotateRight: true,
        flipHorizontal: true,
        flipVertical: true
      }
    })
  }
} satisfies Theme