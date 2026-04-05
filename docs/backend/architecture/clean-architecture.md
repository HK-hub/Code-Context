---
title: 清洁架构理念
date: 2025-03-01T00:00:00.000Z
categories:
  - backend
  - architecture
tags:
  - 清洁架构
  - 依赖规则
  - 分层架构
  - Robert Martin
  - 架构设计
description: 清洁架构核心原则、依赖规则、层次结构与实践应用详解
author: HK意境
---

# 清洁架构理念

## 引言

清洁架构（Clean Architecture）是由Robert C. Martin（Uncle Bob）在2012年提出的软件架构模式。它结合了多种架构模式的优点，包括六边形架构、洋葱架构和尖叫架构等，强调关注点分离和依赖规则。

清洁架构的核心思想是：系统架构应该独立于框架、独立于UI、独立于数据库、独立于任何外部机构。业务逻辑应该位于架构中心，外围是实现细节。

## 架构原理

### 同心圆结构

```
清洁架构同心圆：

┌──────────────────────────────────────────────────────────────────┐
│                        Frameworks & Drivers                       │
│   (Web框架、数据库、外部API、UI框架)                               │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    Interface Adapters                       │  │
│  │   (Controllers、Gateways、Presenters)                       │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │                  Use Cases                            │  │  │
│  │  │   (应用业务规则、用例)                                 │  │  │
│  │  │  ┌────────────────────────────────────────────────┐  │  │  │
│  │  │  │             Entities                            │  │  │  │
│  │  │  │   (企业业务规则、核心业务对象)                    │  │  │  │
│  │  │  │                                                │  │  │  │
│  │  │  └────────────────────────────────────────────────┘  │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘

依赖方向：外层 → 内层（单向）
```

### 依赖规则

```
依赖规则：

1. 内层不知道外层的存在
2. 外层依赖内层，内层不依赖外层
3. 业务逻辑（内层）独立于：
   - UI
   - 框架
   - 数据库
   - 外部服务
   - 任何实现细节

数据流：
请求 → Controllers → Use Cases → Entities
                                  ↓
                              Use Cases ← Gateways
                                  ↓
                             Presenters → UI
```

## 层次结构

### Entities（实体）

实体封装企业级业务规则：

```java
// 实体：核心业务对象
public class User {
    private UserId id;
    private Username username;
    private Email email;
    private Password password;
    private AccountStatus status;
    
    public User(UserId id, Username username, Email email, Password password) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.status = AccountStatus.ACTIVE;
    }
    
    // 业务规则：用户激活
    public void activate() {
        if (status == AccountStatus.SUSPENDED) {
            throw new BusinessException("Suspended account cannot be activated");
        }
        this.status = AccountStatus.ACTIVE;
    }
    
    // 业务规则：用户暂停
    public void suspend() {
        if (status == AccountStatus.SUSPENDED) {
            throw new BusinessException("Account already suspended");
        }
        this.status = AccountStatus.SUSPENDED;
    }
    
    // 业务规则：身份验证
    public boolean authenticate(Password password) {
        if (status != AccountStatus.ACTIVE) {
            return false;
        }
        return this.password.matches(password);
    }
}

// 实体：订单
public class Order {
    private OrderId id;
    private CustomerId customerId;
    private List<OrderItem> items;
    private OrderStatus status;
    private Money totalAmount;
    
    // 业务规则：添加商品
    public void addItem(Product product, int quantity) {
        if (status != OrderStatus.DRAFT) {
            throw new BusinessException("Cannot add items to non-draft order");
        }
        if (quantity <= 0) {
            throw new BusinessException("Quantity must be positive");
        }
        
        OrderItem item = new OrderItem(product, quantity);
        items.add(item);
        recalculateTotal();
    }
    
    // 业务规则：提交订单
    public void submit() {
        if (items.isEmpty()) {
            throw new BusinessException("Cannot submit empty order");
        }
        if (status != OrderStatus.DRAFT) {
            throw new BusinessException("Order already submitted");
        }
        this.status = OrderStatus.SUBMITTED;
    }
    
    private void recalculateTotal() {
        totalAmount = items.stream()
            .map(OrderItem::getAmount)
            .reduce(Money.ZERO, Money::add);
    }
}
```

### Use Cases（用例）

用例封装应用业务规则：

```java
// 用例接口
public interface CreateUserUseCase {
    User execute(CreateUserRequest request);
}

public interface GetUserUseCase {
    User execute(UserId userId);
}

public interface CreateOrderUseCase {
    Order execute(CreateOrderRequest request);
}

// 用例实现
public class CreateUserUseCaseImpl implements CreateUserUseCase {
    
    private final UserRepository userRepository;
    private final NotificationGateway notificationGateway;
    private final PasswordEncoder passwordEncoder;
    
    public CreateUserUseCaseImpl(
            UserRepository userRepository,
            NotificationGateway notificationGateway,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.notificationGateway = notificationGateway;
        this.passwordEncoder = passwordEncoder;
    }
    
    @Override
    public User execute(CreateUserRequest request) {
        // 检查用户名唯一性
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new UserAlreadyExistsException("Username already exists");
        }
        
        // 检查邮箱唯一性
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email already exists");
        }
        
        // 创建用户实体
        Password encodedPassword = passwordEncoder.encode(request.getPassword());
        User user = new User(
            UserId.generate(),
            request.getUsername(),
            request.getEmail(),
            encodedPassword
        );
        
        // 持久化
        userRepository.save(user);
        
        // 发送通知（通过网关）
        notificationGateway.sendWelcomeNotification(user);
        
        return user;
    }
}

// 订单用例
public class CreateOrderUseCaseImpl implements CreateOrderUseCase {
    
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final InventoryGateway inventoryGateway;
    
    @Override
    public Order execute(CreateOrderRequest request) {
        // 验证商品
        List<OrderItemData> itemDataList = new ArrayList<>();
        for (OrderItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                .orElseThrow(() -> new ProductNotFoundException("Product not found"));
            
            // 检查库存
            if (!inventoryGateway.checkAvailability(product.getId(), itemRequest.getQuantity())) {
                throw new InsufficientInventoryException("Insufficient inventory");
            }
            
            itemDataList.add(new OrderItemData(product, itemRequest.getQuantity()));
        }
        
        // 创建订单实体
        Order order = new Order(OrderId.generate(), request.getCustomerId());
        
        for (OrderItemData itemData : itemDataList) {
            order.addItem(itemData.getProduct(), itemData.getQuantity());
        }
        
        // 提交订单
        order.submit();
        
        // 持久化
        orderRepository.save(order);
        
        // 预留库存
        inventoryGateway.reserveInventory(order);
        
        return order;
    }
}
```

### Interface Adapters（接口适配器）

```java
// 控制器
@RestController
@RequestMapping("/api/users")
public class UserController {
    
    private final CreateUserUseCase createUserUseCase;
    private final GetUserUseCase getUserUseCase;
    private final UserPresenter userPresenter;
    
    public UserController(
            CreateUserUseCase createUserUseCase,
            GetUserUseCase getUserUseCase,
            UserPresenter userPresenter) {
        this.createUserUseCase = createUserUseCase;
        this.getUserUseCase = getUserUseCase;
        this.userPresenter = userPresenter;
    }
    
    @PostMapping
    public ResponseEntity<UserResponse> createUser(@RequestBody CreateUserRequest request) {
        User user = createUserUseCase.execute(request);
        return userPresenter.present(user);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUser(@PathVariable String id) {
        User user = getUserUseCase.execute(new UserId(id));
        return userPresenter.present(user);
    }
}

// 展示器
@Component
public class UserPresenter {
    
    public ResponseEntity<UserResponse> present(User user) {
        UserResponse response = UserResponse.builder()
            .id(user.getId().value())
            .username(user.getUsername().value())
            .email(user.getEmail().value())
            .status(user.getStatus().name())
            .build();
        
        return ResponseEntity.ok(response);
    }
}

// 网关接口（定义在用例层）
public interface UserRepository {
    User findById(UserId userId);
    void save(User user);
    boolean existsByUsername(Username username);
    boolean existsByEmail(Email email);
}

public interface NotificationGateway {
    void sendWelcomeNotification(User user);
}

public interface InventoryGateway {
    boolean checkAvailability(ProductId productId, int quantity);
    void reserveInventory(Order order);
}

// 网关实现（数据访问）
@Repository
public class JpaUserRepository implements UserRepository {
    
    private final UserJpaRepository jpaRepository;
    
    @Override
    public User findById(UserId userId) {
        return jpaRepository.findById(userId.value())
            .map(this::toDomain)
            .orElse(null);
    }
    
    @Override
    public void save(User user) {
        UserEntity entity = toEntity(user);
        jpaRepository.save(entity);
    }
}

// 外部服务网关
@Service
public class EmailNotificationGateway implements NotificationGateway {
    
    private final EmailService emailService;
    
    @Override
    public void sendWelcomeNotification(User user) {
        emailService.sendWelcomeEmail(user.getEmail().value(), user.getUsername().value());
    }
}
```

### Frameworks & Drivers（框架与驱动）

```java
// JPA配置
@Configuration
@EnableJpaRepositories(basePackages = "com.example.infrastructure.persistence")
public class JpaConfig {
    // JPA配置
}

// Web配置
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {
    // Web配置
}

// 实体（JPA）
@Entity
@Table(name = "users")
public class UserEntity {
    @Id
    private String id;
    private String username;
    private String email;
    private String password;
    private String status;
    // ...
}

// JPA Repository
public interface UserJpaRepository extends JpaRepository<UserEntity, String> {
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}
```

## 测试策略

```java
// 实体测试
class UserTest {
    
    @Test
    void shouldActivateUser() {
        User user = createActiveUser();
        
        user.activate();
        
        assertThat(user.getStatus()).isEqualTo(AccountStatus.ACTIVE);
    }
    
    @Test
    void shouldNotActivateSuspendedUser() {
        User user = createSuspendedUser();
        
        assertThatThrownBy(user::activate)
            .isInstanceOf(BusinessException.class);
    }
}

// 用例测试
class CreateUserUseCaseTest {
    
    private CreateUserUseCase useCase;
    private UserRepository userRepository;
    private NotificationGateway notificationGateway;
    
    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        notificationGateway = mock(NotificationGateway.class);
        PasswordEncoder passwordEncoder = new PlainPasswordEncoder();
        
        useCase = new CreateUserUseCaseImpl(
            userRepository, notificationGateway, passwordEncoder
        );
    }
    
    @Test
    void shouldCreateUser() {
        when(userRepository.existsByUsername(any())).thenReturn(false);
        when(userRepository.existsByEmail(any())).thenReturn(false);
        
        CreateUserRequest request = new CreateUserRequest(
            new Username("test"),
            new Email("test@example.com"),
            new Password("password")
        );
        
        User user = useCase.execute(request);
        
        assertThat(user).isNotNull();
        verify(userRepository).save(any());
        verify(notificationGateway).sendWelcomeNotification(any());
    }
}
```

## 总结

清洁架构通过依赖规则实现了业务逻辑与技术实现的解耦。核心优势包括：

1. 业务逻辑独立于框架和外部依赖
2. 高可测试性，易于编写单元测试
3. 技术可替换性，UI、数据库、框架可灵活更换
4. 关注点分离清晰，架构边界明确

清洁架构适用于需要长期维护、业务逻辑复杂、技术灵活性强的大型项目。

## 参考资料

- 《清洁架构》 - Robert C. Martin
- 《敏捷软件开发》 - Robert C. Martin
- 清洁架构原文博客
