---
title: Markdown 功能测试
date: 2026-04-04
categories: [blog, tutorials]
tags: [markdown, math, fancybox, mermaid, 测试]
description: 测试 VitePress 的数学公式、Mermaid 图表和图片查看器功能
---

# Markdown 功能测试

## 一、Mermaid 图表测试

### 1.1 流程图

```mermaid
flowchart TD
    A[开始] --> B{是否登录?}
    B -->|是| C[显示主页]
    B -->|否| D[显示登录页]
    D --> E[用户登录]
    E --> B
    C --> F[结束]
```

### 1.2 时序图

```mermaid
sequenceDiagram
    participant 用户
    participant 前端
    participant 后端
    
    用户->>前端: 发起请求
    前端->>后端: API 调用
    后端-->>前端: 响应数据
    前端-->>用户: 渲染页面
```

### 1.3 类图

```mermaid
classDiagram
    class User {
        +String name
        +String email
        +login()
    }
    class Post {
        +String title
        +publish()
    }
    User --> Post : writes
```

## 二、数学公式测试

### 1.1 行内公式

爱因斯坦质能方程：$E = mc^2$，表示能量与质量的关系。

欧拉公式：$e^{i\pi} + 1 = 0$

### 1.2 块级公式

**牛顿第二定律：**

$$F = ma$$

**积分公式：**

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

**矩阵：**

$$
\mathbf{A} = \begin{bmatrix}
a_{11} & a_{12} \\
a_{21} & a_{22}
\end{bmatrix}
$$

## 三、图片测试（Fancybox 点击放大）

![Logo](/logo.svg)

点击图片可以放大查看（使用 Fancybox）。

## 四、代码块测试

```typescript
const greeting: string = 'Hello, VitePress!'
console.log(greeting)
```

## 五、表格测试

| 功能 | 状态 |
|------|------|
| Mermaid 图表 | ✅ |
| 数学公式 | ✅ |
| 图片放大 | ✅ |
| 代码高亮 | ✅ |