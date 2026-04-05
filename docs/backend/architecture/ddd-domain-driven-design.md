---
title: DDD领域驱动设计
date: 2025-02-18T00:00:00.000Z
categories:
  - backend
  - architecture
tags:
  - DDD
  - 领域驱动设计
  - 领域模型
  - 战术设计
  - 战略设计
description: DDD领域驱动设计核心概念、战略设计、战术设计与落地实践详解
author: HK意境
---

# DDD领域驱动设计

## 引言

领域驱动设计（Domain-Driven Design，DDD）是由Eric Evans在2003年提出的软件设计方法论。DDD强调以业务领域为核心，通过统一语言、领域建模、分层架构等方式，解决复杂业务系统的设计和开发问题。

在微服务架构盛行的今天，DDD为服务拆分、边界划分、架构设计提供了理论指导。本文将从DDD的核心概念出发，详细介绍战略设计、战术设计、代码落地等内容。

## DDD核心概念

### 统一语言

统一语言（Ubiquitous Language）是DDD的基础，要求开发团队和业务专家使用相同的术语描述业务：

```
统一语言示例：

业务术语 → 代码术语

用户 → User
订单 → Order
商品 → Product
购物车 → ShoppingCart
支付 → Payment
发货 → Shipment

避免翻译和歧义：
- 业务说的"用户"就是代码中的User
- 不允许使用customer、client等近义词
- 保持术语的一致性
```

### 领域与子域

**领域（Domain）**

领域是业务问题空间，代表业务范围和边界：

```
电商领域示例：

核心域（Core Domain）：订单、商品、用户
支撑域（Supporting Domain）：支付、物流、搜索
通用域（Generic Domain）：认证、权限、消息
```

**子域（Subdomain）**

子域是领域的细分：

```
订单子域：
- 订单创建
- 订单支付
- 订单发货
- 订单完成
- 订单取消
- 订单退款

用户子域：
- 用户注册
- 用户认证
- 用户信息管理
- 会员等级
```

### 限界上下文

限界上下文（Bounded Context）是DDD的核心概念，定义了模型的边界：

```
限界上下文示例：

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   订单上下文    │  │   用户上下文    │  │   商品上下文    │
├─────────────────┤  ├─────────────────┤  ├─────────────────┤
│ Order           │  │ User            │  │ Product         │
│ OrderItem       │  │ Account         │  │ Category        │
│ OrderStatus     │  │ Profile         │  │ Inventory       │
│ OrderService    │  │ UserService     │  │ ProductService  │
│ OrderRepository │  │ UserRepository  │  │ ProductRepository│
└─────────────────┘  └─────────────────┘  └─────────────────┘

上下文映射：
订单上下文.Order → 用户上下文.User（通过用户ID引用）
订单上下文.Order → 商品上下文.Product（通过商品ID引用）
```

### 上下文映射

上下文映射描述限界上下文之间的关系：

```
上下文关系类型：

1. 共享内核（Shared Kernel）
   两个上下文共享部分模型

2. 客户-供应商（Customer-Supplier）
   下游依赖上游提供的模型

3. 遵奉者（Conformist）
   下游完全接受上游模型

4. 防腐层（Anti-Corruption Layer）
   下游通过适配器隔离上游模型变化

5. 开放主机服务（Open Host Service）
   上游提供标准化接口

6. 发布语言（Published Language）
   使用标准协议通信
```

## 战术设计

### 实体与值对象

**实体（Entity）**

实体有唯一标识，身份贯穿生命周期：

```java
// 订单实体
@Entity
public class Order {
    
    @Id
    private OrderId id;  // 唯一标识
    private CustomerId customerId;
    private List<OrderItem> items;
    private OrderStatus status;
    private Money totalAmount;
    private Instant createdAt;
    
    // 行为方法
    public void addItem(Product product, int quantity) {
        OrderItem item = new OrderItem(product, quantity);
        items.add(item);
        recalculateTotal();
    }
    
    public void removeItem(OrderItemId itemId) {
        items.removeIf(item -> item.getId().equals(itemId));
        recalculateTotal();
    }
    
    public void submit() {
        if (items.isEmpty()) {
            throw new OrderException("订单不能为空");
        }
        if (status != OrderStatus.DRAFT) {
            throw new OrderException("只有草稿订单可以提交");
        }
        status = OrderStatus.SUBMITTED;
    }
    
    public void pay(Payment payment) {
        if (status != OrderStatus.SUBMITTED) {
            throw new OrderException("只有已提交订单可以支付");
        }
        status = OrderStatus.PAID;
    }
    
    public void cancel(String reason) {
        if (status == OrderStatus.COMPLETED) {
            throw new OrderException("已完成的订单不能取消");
        }
        status = OrderStatus.CANCELLED;
    }
    
    private void recalculateTotal() {
        totalAmount = items.stream()
            .map(OrderItem::getAmount)
            .reduce(Money.ZERO, Money::add);
    }
}
```

**值对象（Value Object）**

值对象无标识，通过属性值判断相等：

```java
// 金额值对象
public record Money(
    BigDecimal amount,
    String currency
) {
    public Money {
        if (amount.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("金额不能为负数");
        }
    }
    
    public static final Money ZERO = new Money(BigDecimal.ZERO, "CNY");
    
    public Money add(Money other) {
        if (!currency.equals(other.currency)) {
            throw new IllegalArgumentException("货币类型不匹配");
        }
        return new Money(amount.add(other.amount), currency);
    }
    
    public Money multiply(int multiplier) {
        return new Money(amount.multiply(BigDecimal.valueOf(multiplier)), currency);
    }
}

// 地址值对象
public record Address(
    String province,
    String city,
    String district,
    String street,
    String zipCode
) {
    public String fullAddress() {
        return province + city + district + street;
    }
}

// 订单ID值对象
public record OrderId(String value) {
    public OrderId {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("订单ID不能为空");
        }
    }
    
    public static OrderId generate() {
        return new OrderId(UUID.randomUUID().toString());
    }
}
```

### 聚合

聚合是一组相关对象的集合，作为数据修改的单元：

```java
// 订单聚合
public class Order {  // 聚合根
    
    private OrderId id;
    private CustomerId customerId;
    private List<OrderItem> items;  // 聚合内部实体
    private OrderStatus status;
    private Money totalAmount;
    private ShippingAddress shippingAddress;  // 值对象
    
    // 聚合内部规则：只通过聚合根修改内部对象
    public void updateItemQuantity(OrderItemId itemId, int quantity) {
        OrderItem item = findItem(itemId);
        if (item == null) {
            throw new OrderException("订单项不存在");
        }
        item.updateQuantity(quantity);
        recalculateTotal();
    }
    
    // 聚合边界内的不变性约束
    private void recalculateTotal() {
        totalAmount = items.stream()
            .map(OrderItem::getAmount)
            .reduce(Money.ZERO, Money::add);
    }
    
    private OrderItem findItem(OrderItemId itemId) {
        return items.stream()
            .filter(item -> item.getId().equals(itemId))
            .findFirst()
            .orElse(null);
    }
}

// 订单项（聚合内部实体）
public class OrderItem {
    
    private OrderItemId id;
    private ProductId productId;
    private String productName;  // 快照
    private Money unitPrice;      // 快照
    private int quantity;
    
    void updateQuantity(int newQuantity) {
        if (newQuantity <= 0) {
            throw new OrderException("数量必须大于0");
        }
        this.quantity = newQuantity;
    }
    
    Money getAmount() {
        return unitPrice.multiply(quantity);
    }
}
```

### 领域服务

领域服务封装不属于任何实体或值对象的业务逻辑：

```java
// 转账领域服务
public interface TransferService {
    
    void transfer(AccountId from, AccountId to, Money amount);
}

@Service
public class TransferServiceImpl implements TransferService {
    
    private AccountRepository accountRepository;
    
    @Override
    @Transactional
    public void transfer(AccountId from, AccountId to, Money amount) {
        Account fromAccount = accountRepository.findById(from);
        Account toAccount = accountRepository.findById(to);
        
        if (fromAccount == null || toAccount == null) {
            throw new AccountException("账户不存在");
        }
        
        fromAccount.debit(amount);
        toAccount.credit(amount);
        
        accountRepository.save(fromAccount);
        accountRepository.save(toAccount);
    }
}

// 订单折扣服务
public interface DiscountService {
    
    Money calculateDiscount(Order order, Customer customer);
}

@Service
public class DiscountServiceImpl implements DiscountService {
    
    private CustomerRepository customerRepository;
    private PromotionRepository promotionRepository;
    
    @Override
    public Money calculateDiscount(Order order, Customer customer) {
        Money discount = Money.ZERO;
        
        // 会员等级折扣
        if (customer.isVIP()) {
            discount = discount.add(order.getTotalAmount().multiply(0.1));
        }
        
        // 促销活动折扣
        List<Promotion> promotions = promotionRepository.findActive();
        for (Promotion promotion : promotions) {
            if (promotion.isApplicable(order)) {
                discount = discount.add(promotion.calculateDiscount(order));
            }
        }
        
        return discount;
    }
}
```

### 仓库

仓库封装数据访问逻辑：

```java
// 仓库接口（领域层）
public interface OrderRepository {
    
    Order findById(OrderId id);
    List<Order> findByCustomerId(CustomerId customerId);
    List<Order> findByStatus(OrderStatus status);
    void save(Order order);
    void delete(Order order);
}

// 仓库实现（基础设施层）
@Repository
public class OrderRepositoryImpl implements OrderRepository {
    
    private final OrderJpaRepository jpaRepository;
    private final OrderMapper mapper;
    
    @Override
    public Order findById(OrderId id) {
        OrderPO po = jpaRepository.findById(id.value()).orElse(null);
        return mapper.toEntity(po);
    }
    
    @Override
    public void save(Order order) {
        OrderPO po = mapper.toPO(order);
        jpaRepository.save(po);
    }
}
```

### 工厂

工厂封装复杂对象的创建：

```java
// 订单工厂
@Component
public class OrderFactory {
    
    private ProductRepository productRepository;
    private PricingService pricingService;
    
    public Order createOrder(CustomerId customerId, List<OrderItemRequest> items) {
        Order order = new Order();
        order.setId(OrderId.generate());
        order.setCustomerId(customerId);
        order.setStatus(OrderStatus.DRAFT);
        order.setCreatedAt(Instant.now());
        
        for (OrderItemRequest request : items) {
            Product product = productRepository.findById(request.getProductId());
            Money price = pricingService.calculatePrice(product, request.getQuantity());
            
            OrderItem item = new OrderItem();
            item.setId(OrderItemId.generate());
            item.setProductId(product.getId());
            item.setProductName(product.getName());
            item.setUnitPrice(price);
            item.setQuantity(request.getQuantity());
            
            order.addItem(item);
        }
        
        return order;
    }
}
```

## 分层架构

### 四层架构

```
用户界面层（User Interface Layer）
    ↓
应用层（Application Layer）
    ↓
领域层（Domain Layer）
    ↓
基础设施层（Infrastructure Layer）

依赖规则：外层依赖内层，内层不依赖外层
```

```java
// 领域层（核心）
package com.example.domain;

public class Order {
    // 领域模型和业务逻辑
}

// 应用层
package com.example.application;

@Service
public class OrderApplicationService {
    
    private OrderRepository orderRepository;  // 依赖领域层接口
    
    public Long createOrder(CreateOrderCommand command) {
        Order order = orderFactory.createOrder(...);
        return orderRepository.save(order).getId();
    }
}

// 基础设施层
package com.example.infrastructure;

@Repository
public class OrderRepositoryImpl implements OrderRepository {
    // 实现领域层接口
}

// 用户界面层
package com.example.interfaces;

@RestController
public class OrderController {
    
    private OrderApplicationService orderService;  // 依赖应用层
    
    @PostMapping("/orders")
    public Long createOrder(@RequestBody CreateOrderRequest request) {
        return orderService.createOrder(request.toCommand());
    }
}
```

### 领域事件

```java
// 领域事件定义
public record OrderCreatedEvent(
    OrderId orderId,
    CustomerId customerId,
    Money totalAmount,
    Instant occurredOn
) implements DomainEvent {}

// 领域事件发布
public class Order {
    
    @DomainEvents
    private List<DomainEvent> domainEvents = new ArrayList<>();
    
    public void submit() {
        status = OrderStatus.SUBMITTED;
        
        // 发布领域事件
        domainEvents.add(new OrderCreatedEvent(
            id, customerId, totalAmount, Instant.now()
        ));
    }
}

// 事件处理器
@Component
public class OrderEventHandler {
    
    @EventListener
    public void handle(OrderCreatedEvent event) {
        // 发送通知
        notificationService.sendOrderConfirmation(event.orderId());
        
        // 更新库存
        inventoryService.reserveStock(event.orderId());
    }
}
```

## 模块划分

```
项目结构：

com.example.order/
├── domain/              # 领域层
│   ├── model/
│   │   ├── Order.java
│   │   ├── OrderItem.java
│   │   ├── OrderStatus.java
│   │   └── OrderId.java
│   ├── repository/
│   │   └── OrderRepository.java
│   ├── service/
│   │   └── DiscountService.java
│   └── event/
│       └── OrderCreatedEvent.java
├── application/         # 应用层
│   ├── OrderApplicationService.java
│   ├── command/
│   │   ├── CreateOrderCommand.java
│   │   └── CancelOrderCommand.java
│   └── query/
│       └── OrderQueryService.java
├── infrastructure/      # 基础设施层
│   ├── persistence/
│   │   ├── OrderRepositoryImpl.java
│   │   └── OrderPO.java
│   ├── messaging/
│   │   └── OrderMessagePublisher.java
│   └── external/
│       └── PaymentGateway.java
└── interfaces/          # 用户界面层
    ├── rest/
    │   └── OrderController.java
    ├── dto/
    │   ├── CreateOrderRequest.java
    │   └── OrderResponse.java
    └── assembler/
        └── OrderAssembler.java
```

## 总结

DDD是一种以领域为核心的软件设计方法，通过统一语言、限界上下文、领域模型等概念，解决复杂业务系统的设计问题。本文详细介绍了DDD的战略设计、战术设计、分层架构等内容。

DDD的核心价值在于：

1. 统一语言消除沟通障碍
2. 限界上下文划分系统边界
3. 领域模型封装业务逻辑
4. 分层架构保证代码结构清晰
5. 领域事件实现模块解耦

在微服务架构中，DDD为服务拆分、边界划分提供了理论指导。掌握DDD，能够帮助开发者构建高质量的复杂业务系统。

## 参考资料

- 《领域驱动设计》 - Eric Evans
- 《实现领域驱动设计》 - Vaughn Vernon
- 《领域驱动设计精粹》 - Vaughn Vernon
- IDDD示例代码
