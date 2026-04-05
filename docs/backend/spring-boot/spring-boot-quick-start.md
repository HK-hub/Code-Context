---
title: Spring Boot快速入门
date: 2025-01-20T00:00:00.000Z
categories:
  - backend
  - spring-boot
tags:
  - Spring Boot
  - Java
  - Web开发
  - 微服务
  - 自动配置
description: Spring Boot核心概念、项目结构、自动配置原理与最佳实践，快速构建生产级应用
author: HK意境
---

# Spring Boot快速入门

## 引言

Spring Boot是Spring生态系统的重要组成部分，它简化了Spring应用的初始搭建和开发过程。Spring Boot通过自动配置、起步依赖、内嵌服务器等特性，让开发者能够快速创建独立运行的、生产级别的Spring应用。

传统的Spring应用需要大量的XML配置或Java配置，开发者需要手动管理各种依赖版本，配置数据源、事务管理器、Web服务器等。Spring Boot的出现彻底改变了这一局面，它通过"约定优于配置"的理念，大幅减少了开发者的工作量。

本文将从Spring Boot的核心概念出发，详细介绍项目结构、自动配置原理、常用注解、配置管理等关键内容，帮助开发者快速掌握Spring Boot开发技能。

## Spring Boot核心特性

### 自动配置

Spring Boot的自动配置是其最核心的特性之一。它根据项目中的依赖、类路径下的类、已定义的配置等条件，自动配置Spring应用。

```java
// 自动配置示例：当类路径下有DataSource类时，自动配置数据源
@Configuration
@ConditionalOnClass({ DataSource.class, EmbeddedDatabaseType.class })
@EnableConfigurationProperties(DataSourceProperties.class)
public class DataSourceAutoConfiguration {
    
    @Bean
    @ConditionalOnMissingBean
    public DataSource dataSource(DataSourceProperties properties) {
        return properties.initializeDataSourceBuilder().build();
    }
}
```

自动配置的条件判断通过以下注解实现：

- `@ConditionalOnClass`：当类路径下存在指定类时生效
- `@ConditionalOnMissingClass`：当类路径下不存在指定类时生效
- `@ConditionalOnBean`：当容器中存在指定Bean时生效
- `@ConditionalOnMissingBean`：当容器中不存在指定Bean时生效
- `@ConditionalOnProperty`：当指定属性有特定值时生效
- `@ConditionalOnWebApplication`：当应用是Web应用时生效

### 起步依赖

起步依赖（Starter Dependencies）是Spring Boot提供的特殊依赖，它们将常用的依赖组合在一起，开发者只需引入一个起步依赖，就能自动获得一组协调好版本的依赖。

```xml
<!-- pom.xml -->
<dependencies>
    <!-- Web起步依赖：包含Spring MVC、Jackson、Tomcat等 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- 数据访问起步依赖：包含Spring Data JPA、Hibernate、HikariCP等 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    
    <!-- 测试起步依赖：包含JUnit、Mockito、Spring Test等 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
    
    <!-- 安全起步依赖：包含Spring Security -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    
    <!-- Actuator起步依赖：包含生产级监控功能 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>
</dependencies>
```

常用的起步依赖包括：

| 起步依赖 | 功能描述 |
|---------|---------|
| spring-boot-starter-web | Web开发，包含Spring MVC、Tomcat |
| spring-boot-starter-data-jpa | JPA数据访问，包含Hibernate |
| spring-boot-starter-data-mongodb | MongoDB数据访问 |
| spring-boot-starter-data-redis | Redis数据访问 |
| spring-boot-starter-security | Spring Security安全框架 |
| spring-boot-starter-validation | 参数校验 |
| spring-boot-starter-actuator | 生产级监控 |
| spring-boot-starter-aop | AOP支持 |
| spring-boot-starter-cache | 缓存支持 |
| spring-boot-starter-mail | 邮件发送 |
| spring-boot-starter-amqp | RabbitMQ消息队列 |

### 内嵌服务器

Spring Boot内嵌了Tomcat、Jetty、Undertow等Web服务器，开发者无需部署到外部服务器，应用可以直接运行。

```java
// 默认使用Tomcat
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}

// 切换到Jetty：排除Tomcat依赖，添加Jetty依赖
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <exclusions>
        <exclusion>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-tomcat</artifactId>
        </exclusion>
    </exclusions>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-jetty</artifactId>
</dependency>

// 切换到Undertow
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-undertow</artifactId>
</dependency>
```

服务器配置：

```yaml
# application.yml
server:
  port: 8080                    # 服务端口
  servlet:
    context-path: /api          # 应用上下文路径
  tomcat:
    max-threads: 200            # 最大工作线程数
    min-spare-threads: 10       # 最小备用线程数
    accept-count: 100           # 最大等待队列长度
    connection-timeout: 5000    # 连接超时时间
  jetty:
    threads:
      max: 200
      min: 8
  undertow:
    threads:
      io: 16
      worker: 200
```

## 项目结构

### 标准项目结构

Spring Boot推荐的项目结构：

```
src/
├── main/
│   ├── java/
│   │   └── com/example/demo/
│   │       ├── DemoApplication.java    # 启动类
│   │       ├── config/                 # 配置类
│   │       │   ├── SecurityConfig.java
│   │       │   ├── WebConfig.java
│   │       │   └── RedisConfig.java
│   │       ├── controller/             # 控制器
│   │       │   ├── UserController.java
│   │       │   ├── ProductController.java
│   │       ├── service/                # 服务层
│   │       │   ├── UserService.java
│   │       │   ├── impl/
│   │       │   │   ├── UserServiceImpl.java
│   │       ├── repository/             # 数据访问层
│   │       │   ├── UserRepository.java
│   │       │   ├── ProductRepository.java
│   │       ├── entity/                 # 实体类
│   │       │   ├── User.java
│   │       │   ├── Product.java
│   │       ├── dto/                    # 数据传输对象
│   │       │   ├── UserDTO.java
│   │       │   ├── UserRequest.java
│   │       ├── exception/              # 异常处理
│   │       │   ├── GlobalExceptionHandler.java
│   │       │   ├── BusinessException.java
│   │       ├── util/                   # 工具类
│   │       │   ├── DateUtils.java
│   │       │   ├── JsonUtils.java
│   ├── resources/
│   │   ├── application.yml             # 主配置文件
│   │   ├── application-dev.yml         # 开发环境配置
│   │   ├── application-prod.yml        # 生产环境配置
│   │   ├── static/                     # 静态资源
│   │   ├── templates/                  # 模板文件
│   │   ├── logback-spring.xml          # 日志配置
├── test/
│   ├── java/
│   │   └
