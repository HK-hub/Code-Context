---
title: Docker容器化部署教程：从入门到实践
date: 2025-02-15T00:00:00.000Z
categories:
  - blog
  - tutorials
tags:
  - Docker
  - 容器化
  - DevOps
  - 部署
description: 系统讲解Docker核心概念与实践技巧，从镜像构建到容器编排，从单机部署到集群管理，掌握容器化技术
author: HK意境
---

# Docker容器化部署教程：从入门到实践

Docker改变了应用的打包和部署方式。本文将从基础概念出发，逐步深入到生产级部署实践。

## 一、Docker核心概念

### 1.1 核心组件

- **镜像（Image）**：应用的只读模板
- **容器（Container）**：镜像的运行实例
- **仓库（Registry）**：镜像存储分发

### 1.2 安装验证

```bash
# 安装后验证
docker --version
docker run hello-world
```

## 二、镜像管理

### 2.1 Dockerfile编写

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### 2.2 构建镜像

```bash
# 构建镜像
docker build -t myapp:v1.0 .

# 查看镜像
docker images

# 推送到仓库
docker tag myapp:v1.0 registry.example.com/myapp:v1.0
docker push registry.example.com/myapp:v1.0
```

## 三、容器操作

### 3.1 基础命令

```bash
# 运行容器
docker run -d -p 3000:3000 --name myapp myapp:v1.0

# 查看容器
docker ps

# 进入容器
docker exec -it myapp sh

# 查看日志
docker logs myapp

# 停止容器
docker stop myapp

# 删除容器
docker rm myapp
```

### 3.2 数据管理

```bash
# 挂载卷
docker run -v /host/path:/container/path myapp

# 数据卷
docker volume create mydata
docker run -v mydata:/data myapp
```

## 四、Docker Compose

### 4.1 docker-compose.yml

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - db
  
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
    volumes:
      - db-data:/var/lib/mysql

volumes:
  db-data:
```

### 4.2 Compose命令

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 查看状态
docker-compose ps
```

## 五、网络配置

### 5.1 网络模式

```bash
# 创建网络
docker network create mynet

# 连接容器到网络
docker run --network mynet myapp
```

### 5.2 容器互联

```yaml
services:
  app:
    depends_on:
      - db
    environment:
      DB_HOST: db
  
  db:
    image: mysql:8.0
```

## 六、最佳实践

### 6.1 镜像优化

```dockerfile
# 多阶段构建
FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

### 6.2 安全实践

```dockerfile
# 非root用户
RUN addgroup -g 1000 appuser && \
    adduser -u 1000 -G appuser -D appuser
USER appuser
```

## 七、总结

Docker通过容器化实现了应用的标准化打包和部署，结合Docker Compose可快速搭建复杂应用环境。

---

**下一步学习**：
- [Kubernetes集群管理](/blog/tutorials/kubernetes-introduction)
- [CI/CD流水线实践](/blog/tutorials/cicd-pipeline)