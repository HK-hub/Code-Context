---
title: Spring Cloud微服务入门
date: 2025-03-18T00:00:00.000Z
categories:
  - backend
  - spring-boot
tags:
  - Spring Cloud
  - 微服务
  - 服务注册
  - 配置中心
  - 服务网关
description: Spring Cloud核心组件、服务注册发现、配置中心、服务网关实战详解
author: HK意境
---

# Spring Cloud微服务入门

## 引言

微服务架构是当今企业级应用的主流架构模式。它将单一应用拆分为一组小型服务，每个服务运行在独立的进程中，服务间通过轻量级通信机制协作。微服务架构带来了更好的可扩展性、技术栈灵活性和团队协作效率，但也引入了服务治理、配置管理、服务发现等新的挑战。

Spring Cloud为微服务架构提供了一站式解决方案。它整合了Netflix OSS、Alibaba等成熟的开源组件，提供了服务注册发现、配置中心、服务网关、负载均衡、熔断降级、分布式消息等核心功能。Spring Cloud让开发者能够快速构建完整的微服务系统，无需从零实现复杂的基础设施。

本文将从微服务基础概念出发，详细介绍Spring Cloud的核心组件，包括服务注册发现、配置中心、服务网关、负载均衡、熔断降级等内容，帮助开发者掌握微服务开发的核心技能。

## 微服务架构概述

### 单体架构vs微服务架构

**单体架构特点：**

- 所有功能打包在一个应用中
- 统一部署和扩展
- 技术栈统一
- 开发简单，测试方便
- 但随着业务增长面临以下问题：
  - 代码量庞大，维护困难
  - 部署周期长，风险高
  - 扩展只能整体扩展，资源浪费
  - 技术栈难以升级
  - 团队协作冲突频繁

**微服务架构特点：**

- 服务按业务领域拆分
- 每个服务独立部署和扩展
- 服务可使用不同技术栈
- 团队可独立开发、测试、部署
- 需要额外的服务治理：
  - 服务注册与发现
  - 服务间通信
  - 配置管理
  - 服务监控
  - 熔断降级

### Spring Cloud架构图

```
┌─────────────────────────────────────────────────────────────┐
│                      Spring Cloud架构                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌──────────────┐    ┌──────────────┐                     │
│   │   Gateway    │────│   Sentinel   │   外部请求入口       │
│   │   服务网关   │    │   熔断限流   │                     │
│   └──────┬───────┘    └──────────────┘                     │
│          │                                                 │
│          ▼                                                 │
│   ┌───────────────────────────────────────────────────┐   │
│   │            服务注册中心 Nacos/Eureka              │   │
│   │            服务发现 + 配置管理                    │   │
│   └─────────────────────┬─────────────────────────────┘   │
│                         │                                  │
│         ┌───────────────┼───────────────┐                 │
│         │               │               │                 │
│         ▼               ▼               ▼                 │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐           │
│   │ Service A│    │ Service B│    │ Service C│           │
│   │ 用户服务 │────│ 订单服务 │────│ 商品服务 │           │
│   └────┬─────┘    └────┬─────┘    └────┬─────┘           │
│        │               │               │                  │
│        └───────────────┴───────────────┘                  │
│                    服务间调用                              │
│                    OpenFeign/Ribbon                        │
│                                                             │
│   ┌───────────────────────────────────────────────────┐   │
│   │          分布式消息 RocketMQ/Kafka/RabbitMQ       │   │
│   └───────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Spring Cloud版本

Spring Cloud与Spring Boot版本对应关系：

| Spring Cloud | Spring Boot | 说明 |
|--------------|-------------|------|
| 2023.x (Leyton) | 3.2.x | 最新版本 |
| 2022.x ( Kilburn) | 3.0.x, 3.1.x | 主流版本 |
| 2021.x ( Jubilee) | 2.6.x, 2.7.x | 稳定版本 |
| 2020.x ( Ilford) | 2.4.x, 2.5.x | 已停止维护 |

Spring Cloud Alibaba版本：

| Spring Cloud Alibaba | Spring Cloud | Spring Boot |
|---------------------|--------------|-------------|
| 2022.0.0.0 | 2022.x | 3.0.x |
| 2021.0.5.0 | 2021.x | 2.6.x |
| 2.2.10-RC2 | Hoxton.SR12 | 2.3.x |

## 服务注册与发现

### Nacos注册中心

Nacos是阿里巴巴开源的服务发现和配置管理平台，提供服务注册发现、动态配置管理、动态DNS服务等功能。

```xml
<!-- 添加依赖 -->
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
</dependency>
```

```yaml
# application.yml配置
spring:
  application:
    name: user-service
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848
        namespace: public
        group: DEFAULT_GROUP
        service: ${spring.application.name}
        weight: 1
        enabled: true
        ephemeral: true  # 临时实例
        heart-beat-interval: 5000  # 心跳间隔
        heart-beat-timeout: 15000  # 心跳超时
        ip-delete-timeout: 30000  # IP删除超时
```

```java
// 启动类
@SpringBootApplication
@EnableDiscoveryClient
public class UserServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }
}

// 服务间调用示例
@Service
public class OrderService {
    
    @Autowired
    private LoadBalancerClient loadBalancer;
    
    public User getUser(Long userId) {
        // 通过负载均衡器获取服务实例
        ServiceInstance instance = loadBalancer.choose("user-service");
        
        String url = instance.getUri() + "/api/users/" + userId;
        
        RestTemplate restTemplate = new RestTemplate();
        return restTemplate.getForObject(url, User.class);
    }
}
```

### Eureka注册中心（传统方案）

```xml
<!-- Eureka Server -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
</dependency>

<!-- Eureka Client -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>
```

```java
// Eureka Server启动类
@SpringBootApplication
@EnableEurekaServer
public class EurekaServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(EurekaServerApplication.class, args);
    }
}
```

```yaml
# Eureka Server配置
server:
  port: 8761

eureka:
  instance:
    hostname: localhost
  client:
    register-with-eureka: false  # 不注册自己
    fetch-registry: false        # 不拉取注册信息
    service-url:
      defaultZone: http://${eureka.instance.hostname}:${server.port}/eureka/
  server:
    enable-self-preservation: false  # 开发环境关闭自我保护
```

```yaml
# Eureka Client配置
spring:
  application:
    name: user-service

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
  instance:
    prefer-ip-address: true
    instance-id: ${spring.application.name}:${spring.cloud.client.ip-address}:${server.port}
```

### 服务健康检查

```java
@Component
public class CustomHealthIndicator implements HealthIndicator {
    
    @Override
    public Health health() {
        // 自定义健康检查逻辑
        boolean isHealthy = checkServiceHealth();
        
        if (isHealthy) {
            return Health.up()
                .withDetail("service", "user-service")
                .withDetail("timestamp", LocalDateTime.now())
                .build();
        } else {
            return Health.down()
                .withDetail("error", "Service unavailable")
                .build();
        }
    }
    
    private boolean checkServiceHealth() {
        // 检查数据库连接、外部服务等
        return true;
    }
}
```

## 配置中心

### Nacos配置管理

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
</dependency>
```

```yaml
# bootstrap.yml（配置中心配置需要在bootstrap中）
spring:
  application:
    name: user-service
  profiles:
    active: dev
  cloud:
    nacos:
      config:
        server-addr: localhost:8848
        namespace: public
        group: DEFAULT_GROUP
        file-extension: yaml
        shared-configs:
          - data-id: common.yaml
            group: DEFAULT_GROUP
            refresh: true
        extension-configs:
          - data-id: database.yaml
            group: DATABASE_GROUP
            refresh: true
        refresh-enabled: true  # 开启自动刷新
```

```java
// 使用配置属性
@RestController
@RefreshScope  // 支持配置动态刷新
public class ConfigController {
    
    @Value("${app.config.message}")
    private String message;
    
    @Value("${app.config.max-connections:100}")  // 默认值
    private int maxConnections;
    
    @GetMapping("/config")
    public Map<String, Object> getConfig() {
        Map<String, Object> config = new HashMap<>();
        config.put("message", message);
        config.put("maxConnections", maxConnections);
        return config;
    }
}

// 配置属性类
@ConfigurationProperties(prefix = "app.config")
@Component
@RefreshScope
public class AppConfig {
    
    private String message;
    private int maxConnections = 100;
    private boolean featureEnabled = false;
    
    // getter和setter
}
```

### Spring Cloud Config（传统方案）

```xml
<!-- Config Server -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-config-server</artifactId>
</dependency>

<!-- Config Client -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-config</artifactId>
</dependency>
```

```java
// Config Server启动类
@SpringBootApplication
@EnableConfigServer
public class ConfigServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(ConfigServerApplication.class, args);
    }
}
```

```yaml
# Config Server配置
server:
  port: 8888

spring:
  cloud:
    config:
      server:
        git:
          uri: https://github.com/example/config-repo
          search-paths: config
          default-label: main
          username: ${GIT_USERNAME}
          password: ${GIT_PASSWORD}
```

```yaml
# Config Client配置（bootstrap.yml）
spring:
  application:
    name: user-service
  profiles:
    active: dev
  cloud:
    config:
      uri: http://localhost:8888
      label: main
      profile: dev
```

## 服务间调用

### OpenFeign声明式调用

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>
```

```java
// 启动类开启Feign
@SpringBootApplication
@EnableFeignClients
public class OrderServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(OrderServiceApplication.class, args);
    }
}

// 定义Feign客户端
@FeignClient(
    name = "user-service",
    path = "/api/users",
    fallback = UserClientFallback.class,
    configuration = FeignConfig.class
)
public interface UserClient {
    
    @GetMapping("/{id}")
    User getUser(@PathVariable("id") Long id);
    
    @GetMapping
    List<User> getUsers();
    
    @PostMapping
    User createUser(@RequestBody UserRequest request);
    
    @PutMapping("/{id}")
    User updateUser(@PathVariable("id") Long id, @RequestBody UserRequest request);
    
    @DeleteMapping("/{id}")
    void deleteUser(@PathVariable("id") Long id);
}

// Feign降级实现
@Component
public class UserClientFallback implements UserClient {
    
    @Override
    public User getUser(Long id) {
        return new User(id, "Fallback User", "fallback@example.com");
    }
    
    @Override
    public List<User> getUsers() {
        return Collections.emptyList();
    }
    
    @Override
    public User createUser(UserRequest request) {
        throw new ServiceUnavailableException("User service unavailable");
    }
}

// Feign配置类
public class FeignConfig {
    
    @Bean
    public Logger.Level feignLoggerLevel() {
        return Logger.Level.FULL;
    }
    
    @Bean
    public RequestInterceptor authInterceptor() {
        return template -> {
            // 添加认证头
            template.header("Authorization", "Bearer token");
        };
    }
    
    @Bean
    public Decoder feignDecoder() {
        return new ResponseEntityDecoder(new SpringDecoder(new SpringObjectMapper()));
    }
}
```

```java
// Service中使用Feign
@Service
public class OrderService {
    
    @Autowired
    private UserClient userClient;
    
    @Autowired
    private ProductClient productClient;
    
    public Order createOrder(OrderRequest request) {
        // 声明式调用用户服务
        User user = userClient.getUser(request.getUserId());
        
        // 声明式调用商品服务
        Product product = productClient.getProduct(request.getProductId());
        
        Order order = new Order();
        order.setUser(user);
        order.setProduct(product);
        order.setQuantity(request.getQuantity());
        
        return orderRepository.save(order);
    }
}
```

### Feign高级配置

```yaml
# application.yml
feign:
  client:
    config:
      default:
        connectTimeout: 5000
        readTimeout: 5000
        loggerLevel: basic
      user-service:
        connectTimeout: 3000
        readTimeout: 3000
        loggerLevel: full
  
  compression:
    request:
      enabled: true
      mime-types: text/xml,application/xml,application/json
      min-request-size: 2048
    response:
      enabled: true
  
  httpclient:
    enabled: true
    max-connections: 200
    max-connections-per-route: 50
```

### RestTemplate负载均衡

```java
@Configuration
public class RestTemplateConfig {
    
    @LoadBalanced
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}

@Service
public class OrderService {
    
    @Autowired
    @LoadBalanced
    private RestTemplate restTemplate;
    
    public User getUser(Long userId) {
        // 使用服务名代替具体地址
        String url = "http://user-service/api/users/" + userId;
        return restTemplate.getForObject(url, User.class);
    }
    
    public List<User> getUsers() {
        String url = "http://user-service/api/users";
        return restTemplate.getForObject(url, List.class);
    }
}
```

## 服务网关

### Spring Cloud Gateway

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-gateway</artifactId>
</dependency>
```

```yaml
# application.yml
server:
  port: 8080

spring:
  application:
    name: gateway-service
  cloud:
    gateway:
      routes:
        # 用户服务路由
        - id: user-service
          uri: lb://user-service
          predicates:
            - Path=/api/users/**,/api/auth/**
          filters:
            - StripPrefix=0
            - AddRequestHeader=X-Gateway, Gateway
            - AddResponseHeader=X-Response-Time, ${responseTime}
        
        # 订单服务路由
        - id: order-service
          uri: lb://order-service
          predicates:
            - Path=/api/orders/**
          filters:
            - name: RequestRateLimiter
              args:
                redis-rate-limiter.replenishRate: 10
                redis-rate-limiter.burstCapacity: 20
                key-resolver: "#{@userKeyResolver}"
        
        # 商品服务路由
        - id: product-service
          uri: lb://product-service
          predicates:
            - Path=/api/products/**
            - Method=GET,POST
          filters:
            - name: CircuitBreaker
              args:
                name: productCircuitBreaker
                fallbackUri: forward:/fallback
        
      default-filters:
        - AddRequestHeader=X-Request-Id, ${requestId}
        - AddResponseHeader=X-Response-Id, ${responseId}
      
      discovery:
        locator:
          enabled: true  # 开启服务发现路由
          lower-case-service-id: true
```

```java
// 自定义路由配置
@Configuration
public class GatewayConfig {
    
    @Bean
    public RouteLocator customRoutes(RouteLocatorBuilder builder) {
        return builder.routes()
            .route("user-service", r -> r
                .path("/api/users/**")
                .filters(f -> f
                    .filter(authFilter())
                    .retry(3)
                    .requestRateLimiter(config -> config
                        .setRateLimiter(rateLimiter())
                        .setKeyResolver(userKeyResolver())
                    )
                )
                .uri("lb://user-service")
            )
            .route("order-service", r -> r
                .path("/api/orders/**")
                .and()
                .method(HttpMethod.GET, HttpMethod.POST)
                .filters(f -> f
                    .circuitBreaker(config -> config
                        .setName("orderCircuitBreaker")
                        .setFallbackUri("forward:/fallback/orders")
                    )
                )
                .uri("lb://order-service")
            )
            .build();
    }
    
    @Bean
    public KeyResolver userKeyResolver() {
        return exchange -> {
            String userId = exchange.getRequest()
                .getHeaders()
                .getFirst("X-User-Id");
            return Mono.just(userId != null ? userId : "anonymous");
        };
    }
    
    @Bean
    public RedisRateLimiter rateLimiter() {
        return new RedisRateLimiter(10, 20);
    }
}

// 自定义过滤器
@Component
public class AuthFilter implements GlobalFilter, Ordered {
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        
        String token = request.getHeaders().getFirst("Authorization");
        
        if (token == null || !validateToken(token)) {
            ServerHttpResponse response = exchange.getResponse();
            response.setStatusCode(HttpStatus.UNAUTHORIZED);
            response.getHeaders().add("Content-Type", "application/json");
            
            String body = "{\"code\":401,\"message\":\"Unauthorized\"}";
            DataBuffer buffer = response.bufferFactory().wrap(body.getBytes());
            
            return response.writeWith(Mono.just(buffer));
        }
        
        return chain.filter(exchange);
    }
    
    @Override
    public int getOrder() {
        return -100;  // 最高优先级
    }
    
    private boolean validateToken(String token) {
        // Token验证逻辑
        return true;
    }
}
```

### 网关限流配置

```java
@Configuration
public class RateLimiterConfig {
    
    @Bean
    public KeyResolver ipKeyResolver() {
        return exchange -> Mono.just(
            exchange.getRequest()
                .getRemoteAddress()
                .getAddress()
                .getHostAddress()
        );
    }
    
    @Bean
    public KeyResolver userKeyResolver() {
        return exchange -> Mono.justOrEmpty(
            exchange.getRequest()
                .getHeaders()
                .getFirst("X-User-Id")
        ).defaultIfEmpty("anonymous");
    }
    
    @Bean
    public KeyResolver apiKeyResolver() {
        return exchange -> Mono.justOrEmpty(
            exchange.getRequest()
                .getQueryParams()
                .getFirst("api_key")
        ).defaultIfEmpty("default");
    }
}
```

## 熔断降级

### Sentinel熔断限流

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
</dependency>
```

```yaml
# application.yml
spring:
  cloud:
    sentinel:
      transport:
        dashboard: localhost:8080  # Sentinel控制台地址
        port: 8719  # 与控制台通信端口
      datasource:
        flow:
          nacos:
            server-addr: localhost:8848
            data-id: ${spring.application.name}-flow-rules
            group-id: SENTINEL_GROUP
            rule-type: flow
        degrade:
          nacos:
            server-addr: localhost:8848
            data-id: ${spring.application.name}-degrade-rules
            group-id: SENTINEL_GROUP
            rule-type: degrade
```

```java
// 使用Sentinel注解
@Service
public class UserService {
    
    @SentinelResource(
        value = "getUser",
        blockHandler = "getUserBlockHandler",
        fallback = "getUserFallback",
        exceptionsToIgnore = {IllegalArgumentException.class}
    )
    public User getUser(Long id) {
        if (id < 0) {
            throw new IllegalArgumentException("Invalid user id");
        }
        return userRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("User not found"));
    }
    
    // 限流处理方法
    public User getUserBlockHandler(Long id, BlockException ex) {
        return new User(id, "Blocked User", "blocked@example.com");
    }
    
    // 降级处理方法
    public User getUserFallback(Long id, Throwable ex) {
        return new User(id, "Fallback User", "fallback@example.com");
    }
}

// 网关整合Sentinel
@Configuration
public class GatewaySentinelConfig {
    
    @Bean
    @Order(-1)
    public GlobalFilter sentinelGatewayFilter() {
        return (exchange, chain) -> {
            String routeId = exchange.getAttribute(ServerWebExchangeUtils.GATEWAY_ROUTE_ATTR);
            
            Entry entry = null;
            try {
                entry = SphU.entry(routeId, EntryType.IN);
                return chain.filter(exchange);
            } catch (BlockException e) {
                return handleBlockedRequest(exchange);
            } finally {
                if (entry != null) {
                    entry.exit();
                }
            }
        };
    }
    
    private Mono<Void> handleBlockedRequest(ServerWebExchange exchange) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
        
        String body = "{\"code\":429,\"message\":\"Too many requests\"}";
        DataBuffer buffer = response.bufferFactory().wrap(body.getBytes());
        
        return response.writeWith(Mono.just(buffer));
    }
}
```

## 分布式事务

### Seata分布式事务

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-seata</artifactId>
</dependency>
```

```yaml
# application.yml
seata:
  enabled: true
  application-id: ${spring.application.name}
  tx-service-group: my_tx_group
  service:
    vgroup-mapping:
      my_tx_group: default
    grouplist:
      default: 127.0.0.1:8091
  config:
    type: nacos
    nacos:
      server-addr: localhost:8848
      namespace: public
      group: SEATA_GROUP
  registry:
    type: nacos
    nacos:
      server-addr: localhost:8848
      namespace: public
      group: SEATA_GROUP
```

```java
// 使用分布式事务
@Service
public class OrderService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private UserClient userClient;
    
    @Autowired
    private ProductClient productClient;
    
    @Autowired
    private InventoryClient inventoryClient;
    
    @GlobalTransactional(name = "create-order", rollbackFor = Exception.class)
    public Order createOrder(OrderRequest request) {
        // 1. 创建订单
        Order order = new Order();
        order.setUserId(request.getUserId());
        order.setProductId(request.getProductId());
        order.setQuantity(request.getQuantity());
        order.setStatus(OrderStatus.CREATED);
        orderRepository.save(order);
        
        // 2. 调用用户服务扣减余额
        userClient.deductBalance(request.getUserId(), request.getTotalAmount());
        
        // 3. 调用商品服务扣减库存
        inventoryClient.deductStock(request.getProductId(), request.getQuantity());
        
        // 如果任何一步失败，整个事务回滚
        return order;
    }
}
```

## 总结

Spring Cloud为微服务架构提供了完整的技术栈，包括服务注册发现、配置中心、服务网关、负载均衡、熔断降级、分布式事务等核心功能。本文详细介绍了各个组件的配置和使用方法，帮助开发者快速构建微服务系统。

在实际项目中，建议遵循以下最佳实践：

1. 服务拆分粒度适中，避免过度拆分
2. 合理设计服务边界，遵循业务领域划分
3. 服务间通信使用Feign声明式调用
4. 配置集中管理，使用配置中心
5. 服务网关统一入口，实现限流熔断
6. 监控服务健康，及时发现问题
7. 完善日志记录，便于问题排查

微服务架构增加了系统复杂度，需要在可扩展性、可维护性之间平衡。掌握Spring Cloud的核心组件，能够帮助开发者应对微服务带来的挑战，构建高质量的企业级分布式系统。

## 参考资料

- Spring Cloud官方文档
- Spring Cloud Alibaba官方文档
- Nacos官方文档
- Sentinel官方文档
- Seata官方文档
