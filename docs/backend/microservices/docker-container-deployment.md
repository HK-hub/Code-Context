---
title: Docker容器化部署
date: 2025-03-05
categories: [backend, microservices]
tags: [Docker, 容器化, 部署, DevOps, 微服务]
description: Docker核心概念、镜像构建、容器编排与生产环境最佳实践详解
---

# Docker容器化部署

## 引言

Docker是当今最流行的容器化平台，它通过容器技术实现应用的标准化打包、分发和运行。相比传统虚拟机，Docker容器更轻量、启动更快、资源利用率更高，已经成为云原生应用的标准部署方式。

本文将从Docker核心概念出发，详细介绍镜像构建、容器管理、网络配置、数据持久化、Docker Compose编排等内容，帮助开发者掌握Docker容器化部署的核心技能。

## Docker核心概念

### 镜像（Image）

镜像是容器的模板，包含运行应用所需的所有内容：

```
镜像特点：
1. 只读模板
2. 分层存储
3. 通过Dockerfile构建
4. 存储在Registry

镜像分层：
┌─────────────────┐
│  应用层 (App)    │  读写层
├─────────────────┤
│  依赖层 (Deps)   │  只读层
├─────────────────┤
│  运行时层 (JRE)  │  只读层
├─────────────────┤
│  基础层 (OS)     │  只读层
└─────────────────┘
```

### 容器（Container）

容器是镜像的运行实例：

```
容器特点：
1. 镜像的可运行实例
2. 相互隔离的进程
3. 有自己的网络、存储
4. 可启动、停止、删除

容器 vs 虚拟机：

容器：                  虚拟机：
┌──────────┐           ┌──────────┐
│   App A  │           │   App A  │
├──────────┤           ├──────────┤
│ Docker   │           │ Guest OS │
├──────────┤           ├──────────┤
│ Host OS  │           │ Hypervisor│
├──────────┤           ├──────────┤
│ Hardware │           │ Host OS  │
└──────────┘           ├──────────┤
                       │ Hardware │
                       └──────────┘

启动时间：秒级         启动时间：分钟级
资源占用：MB级         资源占用：GB级
```

### 仓库（Registry）

仓库用于存储和分发镜像：

```
公共仓库：
- Docker Hub（docker.io）
- GitHub Container Registry
- 阿里云镜像仓库

私有仓库：
- Harbor
- Nexus
- GitLab Container Registry

镜像命名：
[registry/]namespace/repository[:tag]

示例：
docker.io/library/nginx:latest
registry.cn-hangzhou.aliyuncs.com/myapp/backend:v1.0
```

## Docker基础命令

### 镜像操作

```bash
# 搜索镜像
docker search nginx

# 拉取镜像
docker pull nginx:latest
docker pull nginx:1.21-alpine

# 查看本地镜像
docker images
docker image ls

# 查看镜像详情
docker image inspect nginx:latest

# 查看镜像历史
docker history nginx:latest

# 删除镜像
docker rmi nginx:latest
docker image rm nginx:latest

# 清理悬空镜像
docker image prune

# 标记镜像
docker tag nginx:latest myregistry/nginx:v1.0

# 推送镜像
docker push myregistry/nginx:v1.0

# 导出镜像
docker save nginx:latest -o nginx.tar

# 导入镜像
docker load -i nginx.tar
```

### 容器操作

```bash
# 创建并启动容器
docker run -d --name nginx -p 80:80 nginx:latest

# 常用选项
-d, --detach          # 后台运行
-p, --publish         # 端口映射 host:container
-P, --publish-all     # 随机端口映射
-v, --volume          # 挂载卷
-e, --env             # 环境变量
--name                # 容器名称
--restart             # 重启策略
--network             # 网络模式

# 查看容器
docker ps             # 运行中的容器
docker ps -a          # 所有容器
docker container ls

# 查看容器详情
docker inspect nginx

# 查看容器日志
docker logs nginx
docker logs -f nginx  # 实时跟踪
docker logs --tail 100 nginx  # 最后100行

# 进入容器
docker exec -it nginx /bin/bash
docker exec -it nginx sh  # Alpine

# 查看容器进程
docker top nginx

# 查看容器资源使用
docker stats nginx

# 启动/停止/重启容器
docker start nginx
docker stop nginx
docker restart nginx

# 删除容器
docker rm nginx
docker rm -f nginx    # 强制删除运行中的容器

# 清理所有停止的容器
docker container prune
```

## Dockerfile详解

### 基础结构

```dockerfile
# 基础镜像
FROM openjdk:17-jdk-slim

# 维护者信息
LABEL maintainer="admin@example.com"

# 设置工作目录
WORKDIR /app

# 复制文件
COPY target/app.jar app.jar

# 环境变量
ENV JAVA_OPTS="-Xms256m -Xmx512m"
ENV APP_ENV="production"

# 暴露端口
EXPOSE 8080

# 数据卷
VOLUME /app/logs

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# 启动命令
ENTRYPOINT ["java", "-jar", "app.jar"]
CMD ["--spring.profiles.active=prod"]
```

### 指令详解

```dockerfile
# FROM：指定基础镜像
FROM ubuntu:20.04
FROM node:16-alpine AS builder  # 多阶段构建

# RUN：执行命令
RUN apt-get update && apt-get install -y \
    curl \
    vim \
    && rm -rf /var/lib/apt/lists/*  # 清理缓存

# 合并RUN指令减少层数
RUN apt-get update \
    && apt-get install -y curl \
    && rm -rf /var/lib/apt/lists/*

# COPY：复制文件
COPY src/ /app/src/
COPY package.json /app/
COPY --from=builder /app/dist /app/dist  # 从构建阶段复制

# ADD：复制并解压
ADD archive.tar.gz /app/
ADD https://example.com/file.txt /app/

# WORKDIR：工作目录
WORKDIR /app
WORKDIR /app/src  # 相对路径

# ENV：环境变量
ENV APP_HOME=/app
ENV PATH="${APP_HOME}/bin:${PATH}"

# ARG：构建参数
ARG VERSION=1.0
ARG BUILD_DATE
LABEL build_date=$BUILD_DATE

# EXPOSE：声明端口
EXPOSE 8080
EXPOSE 8443/tcp

# VOLUME：数据卷
VOLUME ["/app/logs", "/app/data"]

# USER：运行用户
RUN useradd -m appuser
USER appuser

# HEALTHCHECK：健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# CMD：默认命令（只能一个）
CMD ["java", "-jar", "app.jar"]
CMD java -jar app.jar

# ENTRYPOINT：入口点
ENTRYPOINT ["java", "-jar", "app.jar"]
ENTRYPOINT java -jar app.jar

# CMD和ENTRYPOINT组合
ENTRYPOINT ["java", "-jar", "app.jar"]
CMD ["--spring.profiles.active=prod"]
# 实际执行：java -jar app.jar --spring.profiles.active=prod

# ONBUILD：子镜像触发
ONBUILD COPY . /app
ONBUILD RUN npm install
```

### 多阶段构建

```dockerfile
# 构建阶段
FROM maven:3.8-openjdk-17 AS builder

WORKDIR /build
COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests

# 运行阶段
FROM openjdk:17-jdk-slim

WORKDIR /app

# 从构建阶段复制JAR文件
COPY --from=builder /build/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]

# Node.js多阶段构建
FROM node:16-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 最佳实践Dockerfile

```dockerfile
# Java应用
FROM eclipse-temurin:17-jre-alpine

# 创建非root用户
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# 复制JAR文件
COPY target/*.jar app.jar

# 更改所有权
RUN chown -R appuser:appgroup /app

# 切换用户
USER appuser

# 环境变量
ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseG1GC"

# 暴露端口
EXPOSE 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s \
    CMD wget -q --spider http://localhost:8080/actuator/health || exit 1

# 启动命令
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
```

## Docker Compose

### 基础配置

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        VERSION: 1.0
    image: myapp:latest
    container_name: myapp
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DB_HOST=db
      - DB_PORT=3306
    env_file:
      - .env
    volumes:
      - ./logs:/app/logs
      - app-data:/app/data
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 60s
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M

  db:
    image: mysql:8.0
    container_name: mysql
    restart: unless-stopped
    ports:
      - "3306:3306"
    environment:
      - MYSQL_ROOT_PASSWORD=rootpass
      - MYSQL_DATABASE=myapp
      - MYSQL_USER=appuser
      - MYSQL_PASSWORD=apppass
    volumes:
      - mysql-data:/var/lib/mysql
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - app-network
    command: redis-server --appendonly yes

  nginx:
    image: nginx:alpine
    container_name: nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  mysql-data:
  redis-data:
  app-data:
```

### Compose命令

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 停止并删除数据卷
docker-compose down -v

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs
docker-compose logs -f app

# 重新构建
docker-compose build
docker-compose build --no-cache

# 重启服务
docker-compose restart

# 扩展服务
docker-compose up -d --scale app=3

# 执行命令
docker-compose exec app bash

# 查看配置
docker-compose config
```

## 网络配置

### 网络模式

```bash
# bridge模式（默认）
docker run -d --name app --network bridge nginx

# host模式（共享主机网络）
docker run -d --name app --network host nginx

# none模式（无网络）
docker run -d --name app --network none nginx

# 自定义网络
docker network create app-network
docker run -d --name app --network app-network nginx

# 查看网络
docker network ls
docker network inspect app-network
```

### 网络配置

```yaml
# docker-compose.yml网络配置

networks:
  frontend:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
  backend:
    driver: bridge
    internal: true  # 内部网络，无法访问外网

services:
  app:
    networks:
      - frontend
      - backend
  db:
    networks:
      - backend
  nginx:
    networks:
      - frontend
```

## 数据持久化

### 数据卷

```bash
# 创建数据卷
docker volume create app-data

# 查看数据卷
docker volume ls
docker volume inspect app-data

# 删除数据卷
docker volume rm app-data

# 清理未使用的数据卷
docker volume prune
```

```yaml
# docker-compose.yml数据卷配置

volumes:
  # 命名卷
  mysql-data:
    driver: local
  
  # 指定存储位置
  app-data:
    driver: local
    driver_opts:
      type: none
      device: /data/app
      o: bind

services:
  db:
    volumes:
      - mysql-data:/var/lib/mysql  # 命名卷
      - ./init:/docker-entrypoint-initdb.d  # 绑定挂载
      - /data/logs:/var/log/mysql  # 绝对路径
```

## 总结

Docker通过容器技术实现了应用的标准化打包、分发和运行，是云原生应用的核心基础设施。本文详细介绍了Docker的核心概念、基础命令、Dockerfile编写、Docker Compose编排、网络配置和数据持久化等内容。

掌握Docker容器化部署，能够帮助开发者：

1. 实现应用的一致性部署
2. 提高开发和运维效率
3. 简化持续集成和持续部署
4. 支持微服务架构的落地
5. 为Kubernetes编排打下基础

## 参考资料

- Docker官方文档
- 《Docker技术入门与实战》
- Docker最佳实践指南
- Docker Compose官方文档