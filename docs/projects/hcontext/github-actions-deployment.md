---
title: GitHub Actions部署与CI/CD配置实践
date: 2025-03-18
categories: [projects, hcontext]
tags: [GitHub Actions, CI/CD, Vercel, 部署, 自动化]
description: 详细介绍HContext项目的自动化部署流程，包括GitHub Actions配置、Vercel集成、双部署策略和性能优化
---

# GitHub Actions部署与CI/CD配置实践

## CI/CD概述

持续集成与持续部署（CI/CD）是现代软件工程的核心实践，对于静态站点项目同样重要。良好的CI/CD流程能够：

1. **保证质量**：每次提交自动测试，及时发现问题
2. **提升效率**：自动化构建和部署，减少人工操作
3. **快速反馈**：问题快速暴露，修复周期缩短
4. **安全可靠**：标准化流程，减少人为失误

HContext项目采用GitHub Actions作为CI/CD核心工具，配合Vercel实现双部署策略。

### 工作流程概览

```
┌─────────────────────────────────────────────────────┐
│                    开发者提交                        │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│               GitHub Actions触发                     │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐       │
│  │ 代码检查  │→│ 单元测试  │→│ 构建验证  │        │
│  └───────────┘  └───────────┘  └───────────┘       │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│                  部署决策                            │
│         [PR] → Preview Deploy                       │
│         [main] → Production Deploy                  │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│              双部署执行                              │
│  ┌────────────┐           ┌────────────┐           │
│  │GitHub Pages│           │   Vercel   │            │
│  │  (主域名)  │           │ (预览/加速) │            │
│  └────────────┘           └────────────┘           │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│              部署通知与监控                          │
│         Slack/邮件通知 + 性能监控                    │
└─────────────────────────────────────────────────────┘
```

## GitHub Actions基础配置

### 工作流文件结构

GitHub Actions工作流文件存放在`.github/workflows/`目录：

```
.github/
└── workflows/
    ├── ci.yml           # 持续集成
    ├── deploy.yml       # 生产部署
    ├── preview.yml      # 预览部署
    └── cleanup.yml      # 清理旧部署
```

### 持续集成工作流

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches-ignore: [main]  # main分支由deploy.yml处理
  pull_request:
    branches: [main]

# 并发控制：同一PR/分支只运行一个工作流
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  # 代码质量检查
  lint:
    name: 代码检查
    runs-on: ubuntu-latest
    steps:
      - name: 检出代码
        uses: actions/checkout@v4
      
      - name: 设置 pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 8
      
      - name: 设置 Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: 安装依赖
        run: pnpm install --frozen-lockfile
      
      - name: 运行 ESLint
        run: pnpm lint
      
      - name: 运行 TypeScript 检查
        run: pnpm type-check
      
      - name: 检查 Markdown 格式
        run: pnpm markdownlint "**/*.md"

  # 构建验证
  build:
    name: 构建验证
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - name: 检出代码
        uses: actions/checkout@v4
      
      - name: 设置 pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 8
      
      - name: 设置 Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: 安装依赖
        run: pnpm install --frozen-lockfile
      
      - name: 构建项目
        run: pnpm build
        env:
          NODE_ENV: production
      
      - name: 验证构建产物
        run: |
          # 检查必要文件是否存在
          test -f docs/.vitepress/dist/index.html
          test -d docs/.vitepress/dist/assets
          
          # 检查构建大小
          SIZE=$(du -sb docs/.vitepress/dist | cut -f1)
          if [ $SIZE -gt 50000000 ]; then
            echo "构建产物过大: $SIZE bytes (限制: 50MB)"
            exit 1
          fi
      
      - name: 上传构建产物
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: docs/.vitepress/dist
          retention-days: 7

  # 单元测试（如果有）
  test:
    name: 单元测试
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - name: 检出代码
        uses: actions/checkout@v4
      
      - name: 设置 pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 8
      
      - name: 设置 Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: 安装依赖
        run: pnpm install --frozen-lockfile
      
      - name: 运行测试
        run: pnpm test
      
      - name: 上传测试报告
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-report
          path: coverage/

  # Lighthouse性能测试
  lighthouse:
    name: Lighthouse 性能测试
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: 检出代码
        uses: actions/checkout@v4
      
      - name: 下载构建产物
        uses: actions/download-artifact@v4
        with:
          name: dist
          path: docs/.vitepress/dist
      
      - name: 运行 Lighthouse
        uses: treosh/lighthouse-ci-action@v10
        with:
          configPath: .lighthouserc.json
          temporaryPublicStorage: true
      
      - name: 上传 Lighthouse 报告
        uses: actions/upload-artifact@v4
        with:
          name: lighthouse-report
          path: .lighthouseci
```

### Lighthouse配置文件

```json
// .lighthouserc.json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:3000/"],
      "staticDistDir": "docs/.vitepress/dist",
      "isStaticDistDir": true
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }],
        "categories:seo": ["error", { "minScore": 0.9 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

## 生产部署工作流

### GitHub Pages部署

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:  # 手动触发

# 设置环境权限
permissions:
  contents: read
  pages: write
  id-token: write

# 并发控制
concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  # 构建任务
  build:
    name: 构建
    runs-on: ubuntu-latest
    steps:
      - name: 检出代码
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # 获取完整历史，用于lastUpdated
      
      - name: 设置 pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 8
      
      - name: 设置 Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: 安装依赖
        run: pnpm install --frozen-lockfile
      
      - name: 构建项目
        run: pnpm build
        env:
          NODE_ENV: production
          VITE_ALGOLIA_APP_ID: ${{ secrets.ALGOLIA_APP_ID }}
          VITE_ALGOLIA_SEARCH_KEY: ${{ secrets.ALGOLIA_SEARCH_KEY }}
      
      - name: 生成站点地图
        run: pnpm sitemap
      
      - name: 优化图片
        run: |
          # 使用 ImageMagick 优化图片
          find docs/.vitepress/dist -name "*.png" -exec mogrify -format webp {} \;
          find docs/.vitepress/dist -name "*.jpg" -exec mogrify -format webp {} \;
      
      - name: 上传 Pages 产物
        uses: actions/upload-pages-artifact@v3
        with:
          path: docs/.vitepress/dist

  # GitHub Pages部署
  deploy-pages:
    name: 部署到 GitHub Pages
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: 部署到 GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
      
      - name: 等待部署生效
        run: sleep 30
      
      - name: 验证部署
        run: |
          curl -sSf https://hcontext.dev/ > /dev/null && \
          echo "GitHub Pages 部署成功" || \
          echo "GitHub Pages 部署验证失败"

  # Vercel部署
  deploy-vercel:
    name: 部署到 Vercel
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: 检出代码
        uses: actions/checkout@v4
      
      - name: 部署到 Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: ./
      
      - name: 获取部署URL
        id: vercel-url
        run: |
          URL=$(curl -s "https://api.vercel.com/v13/deployments?projectId=${{ secrets.VERCEL_PROJECT_ID }}&limit=1" \
            -H "Authorization: Bearer ${{ secrets.VERCEL_TOKEN }}" | jq -r '.deployments[0].url')
          echo "url=$URL" >> $GITHUB_OUTPUT
      
      - name: 验证 Vercel 部署
        run: |
          curl -sSf https://${{ steps.vercel-url.outputs.url }}/ > /dev/null && \
          echo "Vercel 部署成功" || \
          echo "Vercel 部署验证失败"

  # 部署通知
  notify:
    name: 发送通知
    needs: [deploy-pages, deploy-vercel]
    runs-on: ubuntu-latest
    if: always()
    steps:
      - name: 确定状态
        id: status
        run: |
          if [ "${{ needs.deploy-pages.result }}" == "success" ] && \
             [ "${{ needs.deploy-vercel.result }}" == "success" ]; then
            echo "status=success" >> $GITHUB_OUTPUT
            echo "message=部署成功" >> $GITHUB_OUTPUT
          else
            echo "status=failure" >> $GITHUB_OUTPUT
            echo "message=部署失败" >> $GITHUB_OUTPUT
          fi
      
      - name: 发送 Slack 通知
        if: ${{ env.SLACK_WEBHOOK_URL != '' }}
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
        run: |
          curl -X POST "$SLACK_WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d '{
              "attachments": [{
                "color": "${{ steps.status.outputs.status == 'success' && '#36a64f' || '#dc3545' }}",
                "title": "HContext 部署通知",
                "text": "${{ steps.status.outputs.message }}",
                "fields": [
                  {
                    "title": "分支",
                    "value": "${{ github.ref_name }}",
                    "short": true
                  },
                  {
                    "title": "提交",
                    "value": "${{ github.sha }}",
                    "short": true
                  },
                  {
                    "title": "GitHub Pages",
                    "value": "https://hcontext.dev",
                    "short": false
                  },
                  {
                    "title": "Vercel",
                    "value": "https://hcontext.vercel.app",
                    "short": false
                  }
                ],
                "footer": "GitHub Actions",
                "ts": ${{ github.event.head_commit.timestamp }}
              }]
            }'
```

## 预览部署工作流

### Pull Request预览

```yaml
# .github/workflows/preview.yml
name: Preview Deployment

on:
  pull_request:
    types: [opened, synchronize, reopened]

# 并发控制：同一PR只运行一个预览部署
concurrency:
  group: preview-${{ github.event.pull_request.number }}
  cancel-in-progress: true

jobs:
  # 预览部署
  preview:
    name: 创建预览部署
    runs-on: ubuntu-latest
    steps:
      - name: 检出代码
        uses: actions/checkout@v4
        with:
          ref: ${{ github.event.pull_request.head.sha }}
      
      - name: 设置 pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 8
      
      - name: 设置 Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: 安装依赖
        run: pnpm install --frozen-lockfile
      
      - name: 构建预览版本
        run: pnpm build
        env:
          NODE_ENV: production
      
      - name: 部署到 Vercel（预览）
        id: deploy
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
          github-comment: true  # 自动在PR中评论预览链接
      
      - name: 输出预览URL
        run: |
          echo "预览URL: ${{ steps.deploy.outputs.preview-url }}"
      
      - name: 运行 Lighthouse 测试
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            ${{ steps.deploy.outputs.preview-url }}
            ${{ steps.deploy.outputs.preview-url }}/blog/
          uploadArtifacts: true
```

## Vercel配置

### 项目配置文件

```json
// vercel.json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "pnpm build",
  "outputDirectory": "docs/.vitepress/dist",
  "framework": "vitepress",
  
  // 路由重写规则
  "rewrites": [
    {
      "source": "/rss.xml",
      "destination": "/feed.rss"
    },
    {
      "source": "/atom.xml",
      "destination": "/feed.atom"
    }
  ],
  
  // 重定向规则
  "redirects": [
    {
      "source": "/old-blog/:path*",
      "destination": "/blog/:path*",
      "permanent": true
    }
  ],
  
  // Headers配置
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  
  // 预览部署配置
  "preview": {
    "scope": "hcontext.dev"
  },
  
  // 区域配置
  "regions": ["iad1"]  // 美国东部，适合国内访问
}
```

### 环境变量配置

在Vercel Dashboard设置环境变量：

```
Production Environment:
├── VITE_ALGOLIA_APP_ID
├── VITE_ALGOLIA_SEARCH_KEY
├── VITE_ALGOLIA_INDEX_NAME
└── GISCUS_REPO_ID

Preview Environment:
├── (继承Production环境变量)
```

### Git集成配置

Vercel Git集成设置：

```yaml
# Vercel Dashboard → Settings → Git
Git Repository: your-username/hcontext
Production Branch: main
Ignored Build Step: 
  - docs/**/*.md (仅文档修改不触发构建)
  
Build Hook: 
  - URL: https://api.vercel.com/v1/integrations/deploy/...
  - 用于手动触发或外部触发
```

## 包管理器配置

### pnpm配置

```yaml
# .npmrc
shamefully-hoist=true
strict-peer-dependencies=false
auto-install-peers=true

# 公共包镜像（可选）
registry=https://registry.npmmirror.com
```

```toml
# pnpm-workspace.yaml
packages:
  - 'docs'
  - 'packages/*'
```

### package.json配置

```json
{
  "name": "hcontext",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vitepress dev docs",
    "build": "vitepress build docs",
    "preview": "vitepress preview docs",
    "lint": "eslint . --ext .vue,.ts,.js",
    "type-check": "tsc --noEmit",
    "test": "vitest run",
    "sitemap": "node scripts/sitemap.js"
  },
  "engines": {
    "node": ">=18",
    "pnpm": ">=8"
  },
  "devDependencies": {
    "vitepress": "^1.6.0",
    "vue": "^3.4.0",
    "typescript": "^5.0.0",
    "eslint": "^8.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "vitest": "^1.0.0",
    "markdownlint-cli": "^0.38.0"
  }
}
```

## 性能优化配置

### 缓存策略

```yaml
# GitHub Actions 缓存优化
jobs:
  build:
    steps:
      - name: 检出代码
        uses: actions/checkout@v4
      
      - name: 设置 pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 8
      
      - name: 设置 Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'  # 自动缓存 pnpm store
      
      - name: 缓存 VitePress 产物
        uses: actions/cache@v4
        with:
          path: |
            docs/.vitepress/cache
            docs/.vitepress/dist/.temp
          key: vitepress-${{ hashFiles('docs/**/*.md', 'docs/.vitepress/config.ts') }}
          restore-keys: |
            vitepress-
```

### 构建优化

```typescript
// docs/.vitepress/config.ts
export default defineConfig({
  // 构建优化
  vite: {
    build: {
      // 代码分割策略
      rollupOptions: {
        output: {
          manualChunks: {
            'vue-vendor': ['vue'],
            'theme-vendor': ['@vueuse/core'],
          }
        }
      },
      // 压缩配置
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      },
      // Chunk大小警告阈值
      chunkSizeWarningLimit: 1000
    },
    
    // 依赖预构建
    optimizeDeps: {
      include: ['vue', '@vueuse/core']
    }
  },
  
  // 缓存配置
  cache: {
    // 启用构建缓存
    maxAge: 24 * 60 * 60 * 1000  // 24小时
  }
})
```

## 监控与告警

### 部署监控

```yaml
# .github/workflows/monitor.yml
name: Deployment Monitoring

on:
  schedule:
    - cron: '0 */6 * * *'  # 每6小时检查一次
  workflow_dispatch:

jobs:
  health-check:
    name: 健康检查
    runs-on: ubuntu-latest
    steps:
      - name: 检查 GitHub Pages
        id: pages
        run: |
          RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://hcontext.dev/)
          echo "status=$RESPONSE" >> $GITHUB_OUTPUT
          if [ "$RESPONSE" != "200" ]; then
            echo "::warning::GitHub Pages 返回非200状态码: $RESPONSE"
          fi
      
      - name: 检查 Vercel
        id: vercel
        run: |
          RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://hcontext.vercel.app/)
          echo "status=$RESPONSE" >> $GITHUB_OUTPUT
          if [ "$RESPONSE" != "200" ]; then
            echo "::warning::Vercel 返回非200状态码: $RESPONSE"
          fi
      
      - name: 检查响应时间
        id: timing
        run: |
          # GitHub Pages 响应时间
          PAGES_TIME=$(curl -s -o /dev/null -w "%{time_total}" https://hcontext.dev/)
          echo "pages_time=$PAGES_TIME" >> $GITHUB_OUTPUT
          
          # Vercel 响应时间
          VERCEL_TIME=$(curl -s -o /dev/null -w "%{time_total}" https://hcontext.vercel.app/)
          echo "vercel_time=$VERCEL_TIME" >> $GITHUB_OUTPUT
          
          # 检查是否超过阈值（3秒）
          if [ $(echo "$PAGES_TIME > 3" | bc) -eq 1 ]; then
            echo "::warning::GitHub Pages 响应时间过长: $PAGES_TIME 秒"
          fi
          if [ $(echo "$VERCEL_TIME > 3" | bc) -eq 1 ]; then
            echo "::warning::Vercel 响应时间过长: $VERCEL_TIME 秒"
          fi
      
      - name: 生成报告
        run: |
          echo "## 健康检查报告" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "| 站点 | 状态码 | 响应时间 |" >> $GITHUB_STEP_SUMMARY
          echo "|------|--------|----------|" >> $GITHUB_STEP_SUMMARY
          echo "| GitHub Pages | ${{ steps.pages.outputs.status }} | ${{ steps.timing.outputs.pages_time }}s |" >> $GITHUB_STEP_SUMMARY
          echo "| Vercel | ${{ steps.vercel.outputs.status }} | ${{ steps.timing.outputs.vercel_time }}s |" >> $GITHUB_STEP_SUMMARY
```

### 错误告警

```yaml
# .github/workflows/alert.yml
name: Error Alert

on:
  workflow_run:
    workflows: ["Deploy to Production"]
    types: [completed]

jobs:
  alert-on-failure:
    name: 失败告警
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.conclusion == 'failure' }}
    steps:
      - name: 发送告警
        uses: 8398a7/action-slack@v3
        with:
          status: failure
          fields: repo,workflow,commit,author
          text: |
            🚨 生产部署失败！
            
            请立即检查：
            - GitHub Actions 日志
            - 构建产物
            - 环境变量配置
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

## 清理工作流

### 清理过期产物

```yaml
# .github/workflows/cleanup.yml
name: Cleanup Artifacts

on:
  schedule:
    - cron: '0 2 * * 0'  # 每周日凌晨2点
  workflow_dispatch:

jobs:
  cleanup:
    name: 清理过期产物
    runs-on: ubuntu-latest
    permissions:
      actions: write
    steps:
      - name: 清理 GitHub Actions 产物
        uses: c-hive/gha-remove-artifacts@v1
        with:
          age: '7 days'  # 删除7天前的产物
          skip-recent: 5  # 保留最近的5个
          
      - name: 清理旧预览部署
        run: |
          # 通过 Vercel API 清理旧预览部署
          curl -X DELETE "https://api.vercel.com/v13/deployments?projectId=${{ secrets.VERCEL_PROJECT_ID }}&limit=100&state=READY&production=false&age=7d" \
            -H "Authorization: Bearer ${{ secrets.VERCEL_TOKEN }}"
```

## 最佳实践总结

### 配置原则

1. **最小权限**：只授予必要的权限
2. **安全变量**：敏感信息使用Secrets存储
3. **并发控制**：避免重复构建浪费资源
4. **快速失败**：构建失败立即通知

### 性能优化

1. **缓存利用**：充分利用依赖缓存和构建缓存
2. **并行执行**：独立任务并行执行
3. **增量构建**：利用VitePress增量编译能力
4. **产物优化**：压缩、代码分割、图片优化

### 可维护性

1. **模块化工作流**：分离CI、部署、预览
2. **版本固定**：Actions版本固定，避免意外变更
3. **注释清晰**：关键步骤添加注释
4. **文档同步**：配置变更同步更新文档

## 总结

HContext项目通过精心设计的CI/CD流程，实现了：

- **自动化构建**：提交即构建，无需人工干预
- **质量保证**：Lint、测试、Lighthouse多重检查
- **双部署策略**：GitHub Pages稳定托管 + Vercel加速预览
- **快速反馈**：PR预览、部署通知、健康监控
- **安全可靠**：最小权限、Secret管理、错误告警

这套CI/CD流程为项目的持续迭代提供了坚实的技术保障，确保每次部署都是高质量、高性能、安全可靠的版本。