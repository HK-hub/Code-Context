---
title: 从零搭建Vue3项目完整指南
date: 2025-01-20T00:00:00.000Z
categories:
  - blog
  - tutorials
tags:
  - Vue3
  - Vite
  - 项目搭建
  - TypeScript
  - 前端框架
description: 详细的Vue3项目搭建教程，从环境准备到项目配置，涵盖TypeScript、路由、状态管理等核心功能
author: HK意境
---

# 从零搭建Vue3项目完整指南

Vue3作为Vue.js的最新版本，带来了Composition API、更好的TypeScript支持、更快的渲染性能等重要改进。本文将带你从零开始搭建一个现代化的Vue3项目。

## 一、环境准备

### 1.1 Node.js安装

Vue3项目需要Node.js 18或更高版本。可以通过以下方式安装：

```bash
# 使用nvm安装Node.js（推荐）
nvm install 18
nvm use 18

# 或直接从官网下载安装
# https://nodejs.org/

# 验证安装
node -v  # 应显示 v18.x.x
npm -v   # 应显示 9.x.x
```

### 1.2 包管理器选择

npm是Node.js默认的包管理器，但也可以选择pnpm或yarn：

```bash
# npm（默认）
npm install package-name

# pnpm（更快、节省磁盘空间）
npm install -g pnpm
pnpm install package-name

# yarn（稳定、功能丰富）
npm install -g yarn
yarn add package-name
```

### 1.3 IDE配置

推荐使用VS Code，并安装以下插件：

- **Vue - Official** (Vue.volar)：Vue3语法支持
- **TypeScript Vue Plugin (Volar)**：TypeScript支持
- **ESLint**：代码检查
- **Prettier**：代码格式化
- **Vite**：Vite配置文件支持

```json
// VS Code settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "[vue]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

## 二、创建项目

### 2.1 使用Vite创建项目

Vite是Vue官方推荐的构建工具，提供极速的开发体验：

```bash
# 使用npm
npm create vite@latest my-vue-app -- --template vue-ts

# 使用pnpm
pnpm create vite my-vue-app --template vue-ts

# 使用yarn
yarn create vite my-vue-app --template vue-ts
```

### 2.2 项目结构解析

创建后的项目结构如下：

```
my-vue-app/
├── public/              # 静态资源目录
│   └── vite.svg
├── src/
│   ├── assets/          # 需要构建的资源
│   │   └── vue.svg
│   ├── components/      # 组件目录
│   │   └── HelloWorld.vue
│   ├── App.vue          # 根组件
│   ├── main.ts          # 入口文件
│   ├── style.css        # 全局样式
│   └── vite-env.d.ts    # Vite类型定义
├── .gitignore
├── index.html           # 入口HTML文件
├── package.json
├── tsconfig.json        # TypeScript配置
├── tsconfig.node.json   # Node环境TypeScript配置
└── vite.config.ts       # Vite配置文件
```

### 2.3 安装依赖并启动

```bash
# 进入项目目录
cd my-vue-app

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:5173
```

## 三、TypeScript配置

### 3.1 tsconfig.json详解

```json
{
  "compilerOptions": {
    "target": "ES2020",                    // 编译目标
    "useDefineForClassFields": true,       // 类字段行为
    "module": "ESNext",                    // 模块系统
    "lib": ["ES2020", "DOM", "DOM.Iterable"], // 包含的库
    "skipLibCheck": true,                  // 跳过库类型检查

    /* Bundler mode */
    "moduleResolution": "bundler",         // 模块解析策略
    "allowImportingTsExtensions": true,    // 允许导入.ts扩展名
    "resolveJsonModule": true,             // 解析JSON模块
    "isolatedModules": true,               // 每个文件作为单独模块
    "noEmit": true,                        // 不输出文件（由Vite处理）
    "jsx": "preserve",                     // JSX处理方式

    /* Linting */
    "strict": true,                        // 严格模式
    "noUnusedLocals": true,                // 未使用的局部变量报错
    "noUnusedParameters": true,            // 未使用的参数报错
    "noFallthroughCasesInSwitch": true,    // switch穿透报错

    /* Path aliases */
    "baseUrl": ".",                        // 基础路径
    "paths": {
      "@/*": ["src/*"]                     // 路径别名
    }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"],
  "exclude": ["node_modules"]
}
```

### 3.2 类型定义文件

```typescript
// src/vite-env.d.ts
/// <reference types="vite/client" />

// 自定义类型定义
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 环境变量类型定义
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### 3.3 类型检查脚本

```json
// package.json
{
  "scripts": {
    "type-check": "vue-tsc --noEmit",
    "type-check:watch": "vue-tsc --noEmit --watch"
  }
}
```

## 四、Vite配置详解

### 4.1 基础配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  // 插件配置
  plugins: [
    vue()
  ],
  
  // 路径别名
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  
  // 开发服务器配置
  server: {
    host: '0.0.0.0',  // 允许外部访问
    port: 3000,       // 端口
    open: true,       // 自动打开浏览器
    cors: true,       // 启用CORS
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  
  // 构建配置
  build: {
    outDir: 'dist',               // 输出目录
    sourcemap: false,             // 不生成sourcemap
    minify: 'terser',             // 使用terser压缩
    chunkSizeWarningLimit: 500,   // chunk大小警告阈值
    rollupOptions: {
      output: {
        // 分包策略
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-vendor': ['element-plus']
        },
        // 文件命名
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: '[ext]/[name]-[hash].[ext]'
      }
    }
  }
})
```

### 4.2 环境变量配置

```bash
# .env.development
VITE_APP_TITLE=Vue3 App - Dev
VITE_API_URL=http://localhost:8080/api

# .env.production
VITE_APP_TITLE=Vue3 App
VITE_API_URL=https://api.example.com

# .env.staging
VITE_APP_TITLE=Vue3 App - Staging
VITE_API_URL=https://staging-api.example.com
```

```typescript
// 使用环境变量
const apiUrl = import.meta.env.VITE_API_URL
const appTitle = import.meta.env.VITE_APP_TITLE
```

### 4.3 常用插件集成

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'           // JSX支持
import Components from 'unplugin-vue-components/vite' // 自动导入组件
import AutoImport from 'unplugin-auto-import/vite'    // 自动导入API
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    
    // 自动导入Vue API
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-imports.d.ts'
    }),
    
    // 自动导入组件
    Components({
      resolvers: [],
      dts: 'src/components.d.ts'
    })
  ]
})
```

## 五、Vue Router配置

### 5.1 安装和基础配置

```bash
npm install vue-router@4
```

```typescript
// src/router/index.ts
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: {
      title: '首页'
    }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About.vue'),
    meta: {
      title: '关于'
    }
  },
  {
    path: '/user/:id',
    name: 'UserDetail',
    component: () => import('@/views/UserDetail.vue'),
    meta: {
      title: '用户详情',
      requiresAuth: true
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

export default router
```

### 5.2 路由守卫

```typescript
// src/router/guards.ts
import type { Router } from 'vue-router'
import { useUserStore } from '@/store/user'

export function setupRouterGuards(router: Router) {
  // 全局前置守卫
  router.beforeEach((to, from, next) => {
    // 设置页面标题
    document.title = to.meta.title as string || 'Vue3 App'
    
    // 检查登录状态
    const userStore = useUserStore()
    if (to.meta.requiresAuth && !userStore.isLoggedIn) {
      next({
        name: 'Login',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  })
  
  // 全局后置钩子
  router.afterEach((to, from) => {
    // 记录路由变化
    console.log(`Navigated from ${from.path} to ${to.path}`)
  })
}

// src/main.ts
import { setupRouterGuards } from '@/router/guards'

setupRouterGuards(router)
```

### 5.3 路由模块化

```typescript
// src/router/modules/user.ts
import type { RouteRecordRaw } from 'vue-router'

const userRoutes: RouteRecordRaw[] = [
  {
    path: '/user',
    name: 'UserRoot',
    redirect: '/user/profile',
    children: [
      {
        path: 'profile',
        name: 'UserProfile',
        component: () => import('@/views/user/Profile.vue'),
        meta: { title: '个人中心' }
      },
      {
        path: 'settings',
        name: 'UserSettings',
        component: () => import('@/views/user/Settings.vue'),
        meta: { title: '账号设置' }
      }
    ]
  }
]

export default userRoutes

// src/router/index.ts
import userRoutes from './modules/user'

const routes: RouteRecordRaw[] = [
  // ...基础路由
  ...userRoutes
]
```

## 六、状态管理

### 6.1 Pinia安装和配置

```bash
npm install pinia
```

```typescript
// src/store/index.ts
import { createPinia } from 'pinia'

const pinia = createPinia()

export default pinia

// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './store'

const app = createApp(App)

app.use(pinia)
app.use(router)
app.mount('#app')
```

### 6.2 定义Store

```typescript
// src/store/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Option Store风格
export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null as UserInfo | null,
    token: '',
    isLoggedIn: false
  }),
  
  getters: {
    userName: (state) => state.userInfo?.name || '未登录',
    isAdmin: (state) => state.userInfo?.role === 'admin'
  },
  
  actions: {
    async login(username: string, password: string) {
      const response = await api.login({ username, password })
      this.token = response.token
      this.userInfo = response.user
      this.isLoggedIn = true
    },
    
    logout() {
      this.token = ''
      this.userInfo = null
      this.isLoggedIn = false
    },
    
    updateProfile(data: Partial<UserInfo>) {
      if (this.userInfo) {
        Object.assign(this.userInfo, data)
      }
    }
  }
})

// Setup Store风格（推荐）
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  
  function increment() {
    count.value++
  }
  
  function decrement() {
    count.value--
  }
  
  async function fetchCount() {
    const response = await api.getCount()
    count.value = response.data
  }
  
  return { count, doubleCount, increment, decrement, fetchCount }
})
```

### 6.3 使用Store

```vue
<!-- src/components/Counter.vue -->
<script setup lang="ts">
import { useCounterStore } from '@/store/counter'

const counterStore = useCounterStore()

// 直接访问状态
console.log(counterStore.count)

// 访问getter
console.log(counterStore.doubleCount)

// 调用action
counterStore.increment()

// 解构（需要使用storeToRefs）
import { storeToRefs } from 'pinia'
const { count, doubleCount } = storeToRefs(counterStore)
</script>

<template>
  <div>
    <p>Count: {{ counterStore.count }}</p>
    <p>Double: {{ counterStore.doubleCount }}</p>
    <button @click="counterStore.increment">+1</button>
    <button @click="counterStore.decrement">-1</button>
  </div>
</template>
```

### 6.4 持久化存储

```typescript
// src/store/plugins/persist.ts
import type { PiniaPluginContext } from 'pinia'

export function persistPlugin({ store, options }: PiniaPluginContext) {
  if (options.persist) {
    const key = `pinia-${store.$id}`
    
    // 从localStorage恢复状态
    const savedState = localStorage.getItem(key)
    if (savedState) {
      store.$patch(JSON.parse(savedState))
    }
    
    // 监听变化并保存
    store.$subscribe((mutation, state) => {
      localStorage.setItem(key, JSON.stringify(state))
    })
  }
}

// src/store/index.ts
import { createPinia } from 'pinia'
import { persistPlugin } from './plugins/persist'

const pinia = createPinia()
pinia.use(persistPlugin)

export default pinia

// 使用持久化
export const useUserStore = defineStore('user', {
  state: () => ({ ... }),
  persist: true  // 启用持久化
})
```

## 七、API请求封装

### 7.1 Axios配置

```bash
npm install axios
```

```typescript
// src/utils/request.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { useUserStore } from '@/store/user'
import { ElMessage } from 'element-plus'

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const { code, message, data } = response.data
    
    if (code === 200) {
      return data
    }
    
    ElMessage.error(message || '请求失败')
    return Promise.reject(new Error(message))
  },
  (error) => {
    if (error.response) {
      const { status } = error.response
      
      switch (status) {
        case 401:
          ElMessage.error('未授权，请重新登录')
          useUserStore().logout()
          break
        case 403:
          ElMessage.error('拒绝访问')
          break
        case 404:
          ElMessage.error('请求地址不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error('网络错误')
      }
    }
    
    return Promise.reject(error)
  }
)

export default service
```

### 7.2 API模块化

```typescript
// src/api/types.ts
export interface LoginParams {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: UserInfo
}

export interface UserInfo {
  id: number
  name: string
  email: string
  role: string
}

// src/api/user.ts
import request from '@/utils/request'
import type { LoginParams, LoginResponse, UserInfo } from './types'

export function login(data: LoginParams): Promise<LoginResponse> {
  return request.post('/auth/login', data)
}

export function logout(): Promise<void> {
  return request.post('/auth/logout')
}

export function getUserInfo(): Promise<UserInfo> {
  return request.get('/user/info')
}

export function updateUserInfo(data: Partial<UserInfo>): Promise<UserInfo> {
  return request.put('/user/info', data)
}

// src/api/index.ts
export * from './user'
export * from './product'
export * from './order'
```

### 7.3 请求Hook

```typescript
// src/hooks/useRequest.ts
import { ref, Ref } from 'vue'

interface UseRequestOptions<T> {
  immediate?: boolean
  initialData?: T
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

export function useRequest<T>(
  requestFn: () => Promise<T>,
  options: UseRequestOptions<T> = {}
) {
  const data: Ref<T | undefined> = ref(options.initialData)
  const loading = ref(false)
  const error: Ref<Error | undefined> = ref(undefined)

  async function execute() {
    loading.value = true
    error.value = undefined
    
    try {
      const result = await requestFn()
      data.value = result
      options.onSuccess?.(result)
    } catch (e) {
      error.value = e as Error
      options.onError?.(e as Error)
    } finally {
      loading.value = false
    }
  }

  if (options.immediate) {
    execute()
  }

  return {
    data,
    loading,
    error,
    execute
  }
}

// 使用示例
const { data, loading, error, execute } = useRequest(
  getUserInfo,
  { immediate: true }
)
```

## 八、组件开发规范

### 8.1 组件结构

```vue
<!-- src/components/UserCard.vue -->
<script setup lang="ts">
// 1. 导入
import { computed, ref } from 'vue'
import type { PropType } from 'vue'

// 2. Props定义
interface User {
  id: number
  name: string
  avatar: string
  role: string
}

const props = defineProps({
  user: {
    type: Object as PropType<User>,
    required: true
  },
  showDetails: {
    type: Boolean,
    default: false
  }
})

// 3. Emits定义
const emit = defineEmits<{
  (e: 'click', user: User): void
  (e: 'update', id: number): void
}>()

// 4. 响应式状态
const isExpanded = ref(false)

// 5. 计算属性
const avatarUrl = computed(() => {
  return props.user.avatar || '/default-avatar.png'
})

// 6. 方法
function handleClick() {
  emit('click', props.user)
}

function toggleExpand() {
  isExpanded.value = !isExpanded.value
}
</script>

<template>
  <div class="user-card" @click="handleClick">
    <img :src="avatarUrl" :alt="user.name" class="avatar" />
    <div class="info">
      <h3>{{ user.name }}</h3>
      <p>{{ user.role }}</p>
    </div>
    <button v-if="showDetails" @click.stop="toggleExpand">
      {{ isExpanded ? '收起' : '展开' }}
    </button>
    <div v-if="isExpanded && showDetails" class="details">
      <!-- 详情内容 -->
    </div>
  </div>
</template>

<style scoped>
.user-card {
  display: flex;
  padding: 16px;
  border-radius: 8px;
  background: #fff;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
}
</style>
```

### 8.2 组合式函数

```typescript
// src/composables/useUser.ts
import { ref, computed } from 'vue'
import { getUserInfo, updateUserInfo } from '@/api/user'
import type { UserInfo } from '@/api/types'

export function useUser() {
  const user = ref<UserInfo | null>(null)
  const loading = ref(false)

  const userName = computed(() => user.value?.name || 'Guest')
  const isLoggedIn = computed(() => user.value !== null)

  async function fetchUser() {
    loading.value = true
    try {
      user.value = await getUserInfo()
    } finally {
      loading.value = false
    }
  }

  async function updateUser(data: Partial<UserInfo>) {
    loading.value = true
    try {
      user.value = await updateUserInfo(data)
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    loading,
    userName,
    isLoggedIn,
    fetchUser,
    updateUser
  }
}

// 使用组合式函数
const { user, loading, fetchUser } = useUser()
onMounted(fetchUser)
```

### 8.3 组件通信模式

```vue
<!-- 父组件 -->
<script setup lang="ts">
import ChildComponent from './ChildComponent.vue'
import { ref } from 'vue'

const message = ref('Hello')
const childData = ref('')

function handleChildUpdate(data: string) {
  childData.value = data
}
</script>

<template>
  <ChildComponent 
    :message="message"
    @update="handleChildUpdate"
  />
</template>

<!-- 子组件 -->
<script setup lang="ts">
const props = defineProps<{
  message: string
}>()

const emit = defineEmits<{
  (e: 'update', data: string): void
}>()

const localData = ref('')

watch(localData, (newVal) => {
  emit('update', newVal)
})
</script>
```

## 九、总结

搭建Vue3项目涉及多个技术环节，核心要点包括：

**构建工具选择**：Vite提供了极快的开发体验，是Vue3项目的首选构建工具。

**TypeScript集成**：Vue3原生支持TypeScript，建议在项目中全面使用TypeScript以获得更好的类型安全。

**状态管理**：Pinia作为Vue官方推荐的状态管理库，比Vuex更简单、更灵活。

**路由配置**：Vue Router 4与Vue3完美配合，支持Composition API和类型化路由。

**API封装**：统一的API请求封装有助于代码维护和错误处理。

通过本文的指导，你已经掌握了从零搭建Vue3项目的完整流程。建议在实际项目中逐步完善项目结构，添加更多的工程化配置，形成适合自己团队的项目模板。

## 参考资料

- Vue3官方文档：https://vuejs.org/
- Vite官方文档：https://vitejs.dev/
- Vue Router官方文档：https://router.vuejs.org/
- Pinia官方文档：https://pinia.vuejs.org/
- TypeScript官方文档：https://www.typescriptlang.org/
