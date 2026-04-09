---
title: VitePress博客搭建指南：从零到部署
date: 2025-03-10T00:00:00.000Z
categories:
  - projects
  - project-docs
tags:
  - VitePress
  - 博客搭建
  - 静态网站
  - 部署
description: 详细记录VitePress技术博客搭建全过程，从初始化到自定义主题，从内容组织到部署上线
author: HK意境
---

# VitePress博客搭建指南：从零到部署

本文记录了使用VitePress搭建技术博客的完整过程，包括主题定制、内容组织和自动部署。

## 一、项目初始化

### 1.1 创建项目

```bash
# 创建项目目录
mkdir my-blog
cd my-blog

# 初始化项目
npm init -y

# 安装VitePress
npm install -D vitepress
```

### 1.2 目录结构

```
my-blog/
├── docs/
│   ├── .vitepress/
│   │   └── config.ts
│   ├── index.md
│   ├── blog/
│   ├── ai/
│   └── backend/
├── package.json
└── node_modules/
```

### 1.3 配置文件

```typescript
import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-CN',
  title: '我的博客',
  description: '技术分享与思考',
  
  themeConfig: {
    nav: [
      { text: '博客', link: '/blog/' },
      { text: 'AI', link: '/ai/' },
      { text: '后端', link: '/backend/' }
    ],
    
    sidebar: {
      '/blog/': [
        {
          text: '技术文章',
          items: [
            { text: 'Vue3实践', link: '/blog/vue3-practice' }
          ]
        }
      ]
    },
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/yourname' }
    ]
  }
})
```

## 二、主题定制

### 2.1 自定义样式

```css
/* .vitepress/theme/index.css */
:root {
  --vp-c-brand-1: #1890ff;
  --vp-c-brand-2: #40a9ff;
  --vp-c-brand-3: #69c0ff;
}

.dark {
  --vp-c-brand-1: #1890ff;
}

/* 自定义容器 */
.custom-block {
  border-radius: 8px;
}
```

### 2.2 自定义组件

```vue
<!-- .vitepress/theme/components/CustomComponent.vue -->
<template>
  <div class="custom-component">
    <slot />
  </div>
</template>

<style scoped>
.custom-component {
  padding: 20px;
  background: var(--vp-c-bg-soft);
}
</style>
```

### 2.3 注册全局组件

```typescript
// .vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme'
import CustomComponent from './components/CustomComponent.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('CustomComponent', CustomComponent)
  }
}
```

## 三、内容组织

### 3.1 Frontmatter规范

```yaml
---
title: 文章标题
date: 2025-03-10
categories:
  - backend
  - spring
tags:
  - Spring Boot
  - Java
description: 文章描述
author: 作者名
---
```

### 3.2 自动侧边栏

```typescript
// .vitepress/sidebar/index.ts
import fs from 'fs'
import path from 'path'

export function generateSidebar(dir: string) {
  const items = []
  const files = fs.readdirSync(dir)
  
  files.forEach(file => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    
    if (stat.isDirectory()) {
      items.push({
        text: file,
        items: generateSidebar(filePath)
      })
    } else if (file.endsWith('.md')) {
      items.push({
        text: file.replace('.md', ''),
        link: `/${file}`
      })
    }
  })
  
  return items
}
```

### 3.3 内容分类

```
docs/
├── ai/              # 人工智能
│   ├── machine-learning/
│   └── deep-learning/
├── backend/         # 后端开发
│   ├── java/
│   └── spring/
├── blog/            # 博客文章
│   ├── tech-articles/
│   └── tutorials/
└── books/           # 书籍笔记
```

## 四、功能扩展

### 4.1 评论系统

```vue
<!-- .vitepress/theme/components/Comments.vue -->
<template>
  <div class="comments">
    <script src="https://giscus.app/client.js"
      data-repo="yourname/repo"
      data-repo-id="xxx"
      data-category="Announcements"
      data-mapping="pathname"
      async>
    </script>
  </div>
</template>
```

### 4.2 搜索功能

```typescript
// config.ts
export default defineConfig({
  themeConfig: {
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索文档'
          }
        }
      }
    }
  }
})
```

### 4.3 RSS订阅

```typescript
// .vitepress/hooks/rss-generator.ts
import RSS from 'rss'

export function generateRSS(docsDir: string) {
  const feed = new RSS({
    title: '我的博客',
    description: '技术分享',
    feed_url: 'https://yourdomain.com/rss.xml'
  })
  
  // 扫描文章，添加到RSS
  
  return feed.xml()
}
```

## 五、部署上线

### 5.1 GitHub Pages

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: 18
      
      - name: Install
        run: npm install
      
      - name: Build
        run: npm run build
      
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: docs/.vitepress/dist
```

### 5.2 Vercel部署

```bash
# 安装Vercel CLI
npm i -g vercel

# 部署
vercel
```

### 5.3 自定义域名

```
# docs/public/CNAME
yourdomain.com
```

## 六、SEO优化

### 6.1 元数据配置

```typescript
export default defineConfig({
  head: [
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: '我的博客' }],
    ['meta', { name: 'keywords', content: '技术博客, Vue, React' }],
    ['link', { rel: 'icon', href: '/logo.svg' }]
  ]
})
```

### 6.2 Sitemap生成

```typescript
export default defineConfig({
  sitemap: {
    hostname: 'https://yourdomain.com'
  }
})
```

## 七、性能优化

### 7.1 图片优化

```markdown
<!-- 使用WebP格式 -->
<img src="/image.webp" alt="描述" />

<!-- 懒加载 -->
<img loading="lazy" src="/image.jpg" />
```

### 7.2 代码分割

```typescript
// 动态导入
const AsyncComponent = () => import('./components/Heavy.vue')
```

### 7.3 缓存策略

```
# _headers (Netlify)
/*
  Cache-Control: public, max-age=31536000, immutable

/*.html
  Cache-Control: public, max-age=0, must-revalidate
```

## 八、总结

VitePress博客搭建核心：

1. **初始化**：创建项目结构
2. **主题定制**：自定义样式和组件
3. **内容组织**：规范Frontmatter
4. **功能扩展**：评论、搜索、RSS
5. **部署上线**：自动化CI/CD
6. **SEO优化**：元数据、Sitemap
7. **性能优化**：图片、代码分割

记住：**内容为王，体验至上**。

---

**相关阅读**：
- [VitePress官方文档](https://vitepress.dev)
- [Vue3组件开发](/blog/tutorials/vue3-components)