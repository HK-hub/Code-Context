---
title: 《微服务架构设计模式》笔记：从单体到微服务
date: 2025-02-25T00:00:00.000Z
categories:
  - books
  - architecture
tags:
  - 微服务
  - 架构模式
  - 分布式系统
  - 设计模式
description: 总结《微服务架构设计模式》核心内容，涵盖服务拆分、通信、数据管理等关键模式，构建微服务架构设计能力
author: HK意境
---

# 《微服务架构设计模式》笔记：从单体到微服务

本书系统讲解了微服务架构的设计模式。本文提炼核心要点，助你掌握微服务设计精髓。

## 一、从单体到微服务

### 1.1 单体架构的问题

- **复杂性增长**：代码库庞大，难以理解
- **开发缓慢**：应用启动、部署耗时长
- **扩展受限**：整体扩展，资源浪费
- **技术栈固化**：难以引入新技术

### 1.2 微服务架构优势

- **服务独立**：独立开发、测试、部署
- **团队自治**：小团队负责服务全生命周期
- **灵活扩展**：按需扩展单个服务
- **技术多样性**：服务可用不同技术栈

### 1.3 拆分策略

**按业务能力拆分**：

```
订单服务
库存服务
用户服务
支付服务
```

**按子域拆分（DDD）**：

```
订单子域
库存子域
用户子域
支付子域
```

## 二、服务通信模式

### 2.1 同步通信

**RESTful API**：

```java
@GetMapping("/orders/{orderId}")
public Order getOrder(@PathVariable String orderId) {
    return orderService.findById(orderId);
}
```

**gRPC**：

```protobuf
service OrderService {
    rpc GetOrder(OrderRequest) returns (OrderResponse);
}
```

### 2.2 异步消息

**事件驱动**：

```java
// 发布事件
orderCreatedEventPublisher.publish(orderCreatedEvent);

// 订阅事件
@EventHandler
public void handle(OrderCreatedEvent event) {
    // 处理逻辑
}
```

### 2.3 API组合模式

```java
public class OrderDetails {
    private Order order;
    private Customer customer;
    private Restaurant restaurant;
}

// 组合多个服务
public OrderDetails getOrderDetails(String orderId) {
    Order order = orderService.getOrder(orderId);
    Customer customer = customerService.getCustomer(order.getCustomerId());
    Restaurant restaurant = restaurantService.getRestaurant(order.getRestaurantId());
    
    return new OrderDetails(order, customer, restaurant);
}
```

## 三、数据管理

### 3.1 每服务一数据库

```
用户服务 → 用户数据库
订单服务 → 订单数据库
商品服务 → 商品数据库
```

**优势**：
- 服务松耦合
- 独立扩展
- 技术选择灵活

### 3.2 分布式事务

**Saga模式**：

```java
// 创建订单Saga
public class CreateOrderSaga {
    
    public void execute(OrderDetails orderDetails) {
        // 步骤1：创建订单
        Order order = orderService.create(orderDetails);
        
        // 步骤2：预留库存
        try {
            inventoryService.reserve(orderDetails);
        } catch (Exception e) {
            // 补偿：取消订单
            orderService.cancel(order.getId());
        }
    }
}
```

### 3.3 CQRS

```java
// 命令模型
public class OrderCommandService {
    public void createOrder(CreateOrderCommand cmd) {
        // 写入数据库
    }
}

// 查询模型
public class OrderQueryService {
    public OrderSummary getOrderSummary(String orderId) {
        // 从读库查询
    }
}
```

## 四、服务发现

### 4.1 客户端发现

```java
// 客户端查询注册中心获取实例列表
List<ServiceInstance> instances = discoveryClient.getInstances("order-service");

// 客户端负载均衡
ServiceInstance instance = loadBalancer.choose(instances);
String url = instance.getUri() + "/orders";
```

### 4.2 服务端发现

```
客户端 → 负载均衡器 → 服务实例
              ↑
           注册中心
```

## 五、可靠性模式

### 5.1 断路器

```java
@CircuitBreaker(name = "orderService", fallbackMethod = "fallback")
public Order getOrder(String orderId) {
    return orderClient.getOrder(orderId);
}

public Order fallback(String orderId, Exception e) {
    return new Order();  // 降级响应
}
```

### 5.2 舱壁模式

```java
// 隔离不同服务的线程池
@Bulkhead(name = "orderService", type = Bulkhead.Type.THREADPOOL)
public Order getOrder(String orderId) {
    return orderClient.getOrder(orderId);
}
```

### 5.3 重试模式

```java
@Retry(name = "orderService", maxAttempts = 3)
public Order getOrder(String orderId) {
    return orderClient.getOrder(orderId);
}
```

## 六、安全模式

### 6.1 API Gateway模式

```
客户端 → API Gateway → 微服务
            ↓
        认证授权
        限流熔断
        路由转发
```

### 6.2 Token验证

```java
// Gateway验证Token
public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
    String token = exchange.getRequest().getHeaders().getFirst("Authorization");
    
    if (!jwtUtil.validateToken(token)) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        return exchange.getResponse().setComplete();
    }
    
    return chain.filter(exchange);
}
```

## 七、测试模式

### 7.1 服务测试

```java
@SpringBootTest
class OrderServiceTest {
    
    @MockBean
    private OrderRepository orderRepository;
    
    @Test
    void shouldCreateOrder() {
        Order order = orderService.create(createOrderRequest());
        assertNotNull(order.getId());
    }
}
```

### 7.2 契约测试

```java
// 消费者契约
@Pact(consumer = "OrderService")
public RequestResponsePact createPact(PactDslWithProvider builder) {
    return builder
        .given("order exists")
        .uponReceiving("a request for order")
        .path("/orders/123")
        .method("GET")
        .willRespondWith()
        .status(200)
        .body("{\"id\": \"123\"}")
        .toPact();
}
```

## 八、部署模式

### 8.1 容器化

```yaml
# Docker Compose
services:
  order-service:
    build: ./order-service
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
```

### 8.2 Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: order-service
  template:
    spec:
      containers:
      - name: order-service
        image: order-service:latest
```

## 九、总结

微服务架构设计模式核心：

1. **服务拆分**：按业务能力或子域
2. **通信机制**：同步/异步，API组合
3. **数据管理**：Saga、CQRS
4. **可靠性**：断路器、重试、舱壁
5. **安全性**：API Gateway、Token验证
6. **测试**：单元、集成、契约测试
7. **部署**：容器化、Kubernetes

记住：**微服务不是银弹，需要权衡利弊**。

---

**相关阅读**：
- [微服务架构实践](/backend/architecture/microservices-practice)
- [分布式系统设计](/backend/architecture/distributed-systems)