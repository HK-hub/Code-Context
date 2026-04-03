---
title: Docker入门实践指南
date: 2025-03-05
categories: [blog, tutorials]
tags: [Docker, 容器化, DevOps, 后端运维, 部署]
description: 从基础概念到实际应用，详解Docker容器化技术的入门实践，助你快速掌握容器部署技能
---

# Docker入门实践指南

Docker作为现代容器化技术的代表，已经成为DevOps和微服务架构的标准工具。本文将从零开始介绍Docker的核心概念和实践应用。

## 一、Docker基础概念

### 1.1 什么是Docker

Docker是一个开源的容器化平台，它允许开发者将应用程序及其依赖打包到一个轻量级、可移植的容器中。容器之间相互隔离，确保应用在任何环境中都能一致运行。

**核心优势：**

- **一致性**：开发、测试、生产环境完全一致
- **轻量级**：相比虚拟机，容器占用更少资源
- **快速启动**：容器启动速度远快于虚拟机
- **可移植**：容器可以在任何支持Docker的平台上运行

### 1.2 核心组件

**镜像**

镜像是一个只读的模板，包含创建容器所需的所有内容：代码、运行时、库、环境变量和配置文件。

**容器**

容器是镜像的运行实例。每个容器都是独立隔离的运行环境，确保应用的安全性和可移植性。

**仓库**

仓库用于存储和分发镜像。Docker Hub是最大的公共仓库，也可以搭建私有仓库。

### 1.3 Docker架构

```
┌─────────────────────────────────────┐
│           Docker Client             │
│  (docker CLI, Docker Desktop)       │
└──────────────────┬──────────────────┘
                   │ API
┌──────────────────▼──────────────────┐
│          Docker Daemon              │
│  (dockerd, Container Management)    │
└──────────────────┬──────────────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
┌───▼───┐    ┌───▼───┐    ┌───▼───┐
│Images │    │Contai-│    │Network│
│       │    │ners   │    │s      │
└───────┘    └───────┘    └───────┘
```

## 二、安装与配置

### 2.1 安装Docker

**Windows/macOS**

下载并安装Docker Desktop：https://www.docker.com/products/docker-desktop

**Linux (Ubuntu)**

```bash
# 更新软件源
sudo apt-get update

# 安装依赖
sudo apt-get install ca-certificates curl gnupg lsb-release

# 添加Docker官方GPG密钥
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# 设置稳定版仓库
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装Docker
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 验证安装
sudo docker run hello-world
```

### 2.2 基本配置

```bash
# 将当前用户添加到docker组（避免每次使用sudo）
sudo usermod -aG docker $USER

# 配置Docker镜像加速（国内环境）
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": [
    "https://mirror.ccs.tencentyun.com",
    "https://registry.docker-cn.com"
  ],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

# 重启Docker服务
sudo systemctl daemon-reload
sudo systemctl restart docker

# 设置Docker开机自启
sudo systemctl enable docker
```

### 2.3 Docker Desktop配置

**资源分配**

```
Settings > Resources:
- Memory: 建议4GB以上
- CPUs: 建议2核以上
- Disk image size: 建议64GB以上
```

**Docker Engine配置**

```json
{
  "builder": {
    "gc": {
      "defaultKeepStorage": "20GB",
      "enabled": true
    }
  },
  "experimental": false,
  "features": {
    "buildkit": true
  }
}
```

## 三、镜像管理

### 3.1 镜像搜索与拉取

```bash
# 搜索镜像
docker search nginx

# 搜索特定标签的镜像
docker search nginx --limit 5

# 拉取镜像（默认latest标签）
docker pull nginx

# 拉取特定版本
docker pull nginx:1.24
docker pull nginx:alpine

# 查看本地镜像
docker images
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

# 查看镜像详细信息
docker inspect nginx:latest
```

### 3.2 镜像标签与管理

```bash
# 给镜像添加标签
docker tag nginx:latest mynginx:v1

# 删除镜像
docker rmi nginx:latest
docker rmi -f nginx:latest  # 强制删除（即使有容器在使用）

# 清理悬空镜像（没有标签的镜像）
docker image prune

# 清理所有未使用的镜像
docker image prune -a

# 导出镜像
docker save -o nginx.tar nginx:latest

# 导入镜像
docker load -i nginx.tar

# 推送镜像到仓库
docker push username/nginx:v1
```

### 3.3 Dockerfile编写

Dockerfile是定义镜像构建过程的文本文件：

```dockerfile
# 基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制应用代码
COPY . .

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# 启动命令
CMD ["node", "server.js"]
```

**Dockerfile指令详解：**

```dockerfile
# FROM: 指定基础镜像（必须作为第一条指令）
FROM ubuntu:22.04
FROM node:18-alpine AS builder  # 多阶段构建

# RUN: 执行命令
RUN apt-get update && apt-get install -y curl
RUN npm install  # 每个RUN创建一个新的镜像层

# 合理使用RUN减少镜像层
RUN apt-get update \
    && apt-get install -y \
        curl \
        vim \
        git \
    && rm -rf /var/lib/apt/lists/*

# COPY: 复制文件或目录
COPY src/ /app/src/
COPY --from=builder /app/dist /app/dist  # 从其他阶段复制

# ADD: 类似COPY，但支持URL和解压tar文件
ADD https://example.com/file.tar.gz /tmp/
ADD archive.tar.gz /app/

# WORKDIR: 设置工作目录
WORKDIR /app  # 后续指令都在此目录执行

# ENV: 设置环境变量
ENV APP_ENV=production
ENV DB_HOST=localhost \
    DB_PORT=5432

# EXPOSE: 声明端口（仅声明，不实际发布）
EXPOSE 3000
EXPOSE 80 443

# VOLUME: 创建挂载点
VOLUME /data
VOLUME /app/logs

# USER: 指定运行用户
USER node

# ARG: 构建参数（仅构建时有效）
ARG VERSION=1.0
RUN echo "Building version ${VERSION}"

# CMD: 容器启动命令（只有一个生效）
CMD ["node", "app.js"]
CMD ["npm", "start"]

# ENTRYPOINT: 入口点（配合CMD使用）
ENTRYPOINT ["node"]
CMD ["app.js"]

# HEALTHCHECK: 健康检查
HEALTHCHECK --interval=30s CMD curl -f http://localhost/ || exit 1

# ONBUILD: 延迟执行指令（子镜像构建时执行）
ONBUILD COPY . /app
ONBUILD RUN npm install

# LABEL: 添加元数据
LABEL version="1.0" \
      description="My application" \
      maintainer="your@email.com"

# STOPSIGNAL: 停止信号
STOPSIGNAL SIGTERM
```

### 3.4 构建镜像

```bash
# 基本构建
docker build -t myapp:v1 .

# 指定Dockerfile路径
docker build -t myapp:v1 -f Dockerfile.prod .

# 使用构建参数
docker build -t myapp:v1 --build-arg VERSION=2.0 .

# 多阶段构建示例
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# 构建缓存优化
docker build --no-cache -t myapp:v1 .  # 不使用缓存
docker build --cache-from myapp:v0 -t myapp:v1 .  # 指定缓存源
```

### 3.5 最佳实践Dockerfile

```dockerfile
# 使用最小化基础镜像
FROM node:18-alpine

# 使用非root用户
RUN addgroup -g 1000 -S appgroup \
    && adduser -u 1000 -S appuser -G appgroup

# 设置工作目录
WORKDIR /app

# 先复制依赖文件，利用缓存层
COPY package*.json ./

# 安装依赖并清理
RUN npm ci --only=production \
    && npm cache clean --force \
    && rm -rf /tmp/*

# 复制应用代码
COPY --chown=appuser:appgroup . .

# 切换到非root用户
USER appuser

# 设置环境变量
ENV NODE_ENV=production

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# 启动应用
CMD ["node", "server.js"]
```

## 四、容器操作

### 4.1 创建与运行容器

```bash
# 运行容器（前台模式）
docker run nginx

# 运行容器（后台模式）
docker run -d nginx

# 指定容器名称
docker run -d --name mynginx nginx

# 端口映射
docker run -d -p 8080:80 nginx           # 主机8080映射到容器80
docker run -d -p 192.168.1.100:8080:80 nginx  # 指定主机IP

# 环境变量
docker run -d -e MYSQL_ROOT_PASSWORD=root mysql

# 挂载卷
docker run -d -v /host/path:/container/path nginx
docker run -d -v myvolume:/data nginx    # 使用命名卷

# 自动重启策略
docker run -d --restart=always nginx     # 始终重启
docker run -d --restart=on-failure:5 nginx  # 失败时重启（最多5次）
docker run -d --restart=unless-stopped nginx  # 除非手动停止

# 资源限制
docker run -d --memory="512m" nginx      # 内存限制
docker run -d --cpus="1.5" nginx         # CPU限制
docker run -d --memory="512m" --memory-swap="1g" nginx  # 内存+交换区

# 使用特定网络
docker run -d --network=my-network nginx

# 完整示例
docker run -d \
  --name myapp \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DB_URL=mysql://localhost:3306 \
  -v /app/data:/data \
  -v /app/logs:/logs \
  --restart=unless-stopped \
  --memory="1g" \
  --cpus="2" \
  myapp:v1
```

### 4.2 容器管理

```bash
# 查看运行中的容器
docker ps
docker ps -a  # 包括已停止的容器
docker ps -q  # 只显示容器ID
docker ps -l  # 显示最近创建的容器

# 查看容器详细信息
docker inspect mynginx
docker inspect --format='{{.State.Status}}' mynginx

# 查看容器资源使用情况
docker stats
docker stats mynginx

# 查看容器进程
docker top mynginx

# 查看容器日志
docker logs mynginx
docker logs -f mynginx      # 实时跟踪
docker logs --tail 100 mynginx  # 显示最后100行
docker logs --since 1h mynginx   # 显示最近1小时的日志

# 进入容器
docker exec -it mynginx sh
docker exec -it mynginx bash
docker exec mynginx ls /app  # 执行单个命令

# 暂停/恢复容器
docker pause mynginx
docker unpause mynginx

# 停止容器
docker stop mynginx
docker stop -t 10 mynginx  # 等待10秒后强制停止

# 启动已停止的容器
docker start mynginx

# 重启容器
docker restart mynginx

# 杀死容器（立即停止）
docker kill mynginx

# 删除容器
docker rm mynginx
docker rm -f mynginx  # 强制删除运行中的容器

# 批量删除
docker rm $(docker ps -aq)  # 删除所有容器
docker container prune      # 删除所有停止的容器
```

### 4.3 容器与主机文件交互

```bash
# 从容器复制文件到主机
docker cp mynginx:/etc/nginx/nginx.conf ./nginx.conf

# 从主机复制文件到容器
docker cp ./app.conf mynginx:/etc/nginx/conf.d/

# 查看容器内文件变化
docker diff mynginx
```

### 4.4 保存容器状态

```bash
# 将容器提交为镜像
docker commit mynginx mynginx:v2

# 带信息的提交
docker commit -m "Added custom config" -a "Your Name" mynginx mynginx:v2

# 导出容器
docker export mynginx > mynginx.tar

# 导入容器为镜像
docker import mynginx.tar mynginx:v3
```

## 五、网络管理

### 5.1 网络类型

Docker提供多种网络类型：

**bridge（默认）**

容器连接到虚拟网桥，可以通过端口映射访问。

**host**

容器直接使用主机网络，没有网络隔离。

**none**

容器没有网络接口。

**自定义网络**

用户创建的网络，容器可以通过容器名互相通信。

### 5.2 网络操作

```bash
# 查看网络列表
docker network ls

# 创建网络
docker network create my-network

# 创建指定类型的网络
docker network create --driver bridge my-bridge
docker network create --driver overlay my-overlay  # Swarm模式

# 查看网络详情
docker network inspect my-network

# 将容器连接到网络
docker network connect my-network mynginx

# 断开容器网络
docker network disconnect my-network mynginx

# 删除网络
docker network rm my-network

# 清理未使用的网络
docker network prune
```

### 5.3 网络配置示例

```bash
# 创建应用网络
docker network create app-network

# 启动数据库容器
docker run -d \
  --name mysql \
  --network app-network \
  -e MYSQL_ROOT_PASSWORD=root \
  mysql:8

# 启动应用容器（通过容器名连接数据库）
docker run -d \
  --name myapp \
  --network app-network \
  -e DB_HOST=mysql \
  myapp:v1

# 多网络连接
docker run -d --name web --network frontend nginx
docker network connect backend web
```

## 六、数据管理

### 6.1 数据卷操作

```bash
# 创建数据卷
docker volume create myvolume

# 查看数据卷列表
docker volume ls

# 查看数据卷详情
docker volume inspect myvolume

# 使用数据卷
docker run -d -v myvolume:/data nginx

# 删除数据卷
docker volume rm myvolume

# 清理未使用的数据卷
docker volume prune
```

### 6.2 绑定挂载与卷

**绑定挂载**

```bash
# 主机目录直接挂载到容器
docker run -d -v /host/app:/container/app nginx

# 挂载单个文件
docker run -d -v /host/config.conf:/container/config.conf nginx

# 只读挂载
docker run -d -v /host/app:/container/app:ro nginx
```

**数据卷**

```bash
# Docker管理的卷
docker run -d -v myvolume:/data nginx

# 匿名卷（容器删除时自动清理）
docker run -d -v /data nginx
```

### 6.3 数据备份与恢复

```bash
# 备份卷数据
docker run --rm \
  -v myvolume:/data \
  -v /backup:/backup \
  alpine tar czf /backup/myvolume-backup.tar.gz /data

# 恢复卷数据
docker run --rm \
  -v myvolume:/data \
  -v /backup:/backup \
  alpine tar xzf /backup/myvolume-backup.tar.gz -C /
```

## 七、Docker Compose

### 7.1 Compose简介

Docker Compose是一个用于定义和运行多容器应用的工具。通过YAML文件配置应用的服务、网络和卷，然后使用单个命令创建和启动所有服务。

### 7.2 compose.yaml编写

```yaml
# compose.yaml
version: '3.8'

services:
  # Web服务
  web:
    build: 
      context: ./web
      dockerfile: Dockerfile
    image: myapp:v1
    container_name: myapp-web
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=db
      - DB_PORT=5432
    volumes:
      - ./web:/app
      - web-data:/data
    depends_on:
      - db
      - redis
    networks:
      - frontend
      - backend
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 3s
      retries: 3

  # 数据库服务
  db:
    image: postgres:15-alpine
    container_name: myapp-db
    environment:
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=myapp
    volumes:
      - db-data:/var/lib/postgresql/data
    networks:
      - backend
    restart: unless-stopped

  # Redis服务
  redis:
    image: redis:7-alpine
    container_name: myapp-redis
    volumes:
      - redis-data:/data
    networks:
      - backend
    restart: unless-stopped

# 命名卷
volumes:
  web-data:
  db-data:
  redis-data:

# 网络
networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true  # 内部网络，不对外暴露
```

### 7.3 Compose命令

```bash
# 启动所有服务
docker compose up
docker compose up -d  # 后台模式

# 构建并启动
docker compose up --build

# 启动特定服务
docker compose up web db

# 查看服务状态
docker compose ps

# 查看服务日志
docker compose logs
docker compose logs web
docker compose logs -f  # 实时跟踪

# 停止服务
docker compose stop

# 启动已停止的服务
docker compose start

# 重启服务
docker compose restart

# 停止并删除容器、网络
docker compose down

# 停止并删除容器、网络、卷
docker compose down -v

# 进入服务容器
docker compose exec web sh

# 在服务中执行命令
docker compose exec web npm test

# 拉取所有服务的镜像
docker compose pull

# 推送所有服务的镜像
docker compose push
```

### 7.4 环境变量配置

```yaml
# compose.yaml中使用环境变量
services:
  web:
    environment:
      - NODE_ENV=${NODE_ENV}
      - DB_URL=${DB_URL}
    ports:
      - "${PORT}:3000"
```

```bash
# .env文件
NODE_ENV=production
DB_URL=postgresql://admin:password@db:5432/myapp
PORT=8080
```

```bash
# 使用.env文件启动
docker compose --env-file .env.prod up -d
```

## 八、实际应用案例

### 8.1 Web应用部署

```yaml
# 完整Web应用部署示例
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./html:/usr/share/nginx/html:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    networks:
      - frontend

  app:
    build: 
      context: ./app
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - REDIS_HOST=redis
    volumes:
      - app-data:/app/data
    depends_on:
      - postgres
      - redis
    networks:
      - frontend
      - backend
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1'
          memory: 512M

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=myapp
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - backend

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data
    networks:
      - backend

volumes:
  app-data:
  postgres-data:
  redis-data:

networks:
  frontend:
  backend:
    internal: true
```

### 8.2 开发环境配置

```yaml
# 开发环境compose.yaml
version: '3.8'

services:
  dev:
    build:
      context: .
      dockerfile: Dockerfile.dev
    volumes:
      - .:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    command: npm run dev

  db:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=dev
      - POSTGRES_PASSWORD=dev
      - POSTGRES_DB=devdb

  adminer:
    image: adminer
    ports:
      - "8080:8080"
```

## 九、总结

Docker容器化技术为现代软件开发带来了革命性的变化：

**环境一致性**：开发、测试、生产环境统一，消除环境差异导致的部署问题。

**快速部署**：容器启动速度快，可以实现秒级部署和扩展。

**资源效率**：相比虚拟机，容器占用更少资源，提高服务器利用率。

**微服务支持**：容器天然适合微服务架构，便于服务拆分和独立部署。

掌握Docker的核心概念和操作，是现代开发者必备技能。从镜像构建、容器管理到Compose编排，Docker提供了完整的容器化解决方案。建议在实际项目中逐步应用Docker，从简单的单容器应用开始，逐步过渡到多容器编排部署。

## 参考资料

- Docker官方文档：https://docs.docker.com/
- Docker Hub：https://hub.docker.com/
- Docker最佳实践：https://docs.docker.com/develop/develop-images/dockerfile_best-practices/
- Docker Compose文档：https://docs.docker.com/compose/