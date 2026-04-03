---
title: 六边形架构实践
date: 2025-02-22
categories: [backend, architecture]
tags: [六边形架构, 端口适配器, 架构模式, 解耦, 可测试性]
description: 六边形架构原理、端口适配器模式与实际项目落地实践详解
---

# 六边形架构实践

## 引言

六边形架构（Hexagonal Architecture），又称端口与适配器架构（Ports and Adapters），由Alistair Cockburn于2005年提出。这种架构强调将应用核心与外部世界隔离，通过定义清晰的端口和适配器边界，实现业务逻辑与技术实现的解耦。

六边形架构的核心思想是：应用应该由业务逻辑驱动，而不是由外部技术决定。这种架构提供了更好的可测试性、可维护性和技术灵活性。

## 架构原理

### 六边形模型

```
六边形架构示意图：

        ┌─────────────────────────────────────────┐
        │              外部世界                    │
        │  Web UI  │  CLI  │  REST API  │  MQ     │
        └────────┬────────┴───┬──┴──────┬────────┘
                 │            │         │
        ┌────────▼────────────▼─────────▼────────┐
        │           驱动适配器 (Primary)          │
        │      REST Controller │ CLI Handler     │
        └────────┬─────────────┴─────────┬───────┘
                 │                       │
        ┌────────▼───────────────────────▼───────┐
        │              驱动端口                   │
        │        Service Interface               │
        └────────┬───────────────────────┬───────┘
                 │                       │
        ┌────────▼───────────────────────▼───────┐
        │              应用核心                   │
        │                                        │
        │    ┌────────────────────────────┐      │
        │    │        领域模型            │      │
        │    │   Entity │ Value Object    │      │
        │    │   Domain Service           │      │
        │    └────────────────────────────┘      │
        │                                        │
        │    ┌────────────────────────────┐      │
        │    │        应用服务            │      │
        │    │   Use Case │ Application   │      │
        │    │            Service         │      │
        │    └────────────────────────────┘      │
        │                                        │
        └────────┬───────────────────────┬───────┘
                 │                       │
        ┌────────▼───────────────────────▼───────┐
        │             被驱动端口                  │
        │   Repository │ External Service        │
        │   Interface  │ Interface               │
        └────────┬─────────────────────┬─────────┘
                 │                     │
        ┌────────▼─────────────────────▼─────────┐
        │           被驱动适配器 (Secondary)      │
        │  JPA Repository │ REST Client          │
        │  Redis Client   │ Message Producer     │
        └────────┬────────┴───────┬───────────────┘
                 │                │
        ┌────────▼────────────────▼───────────────┐
        │              外部基础设施                │
        │  Database  │  Redis  │  External API    │
        └─────────────────────────────────────────┘
```

### 核心概念

**端口（Port）**

端口是应用核心定义的接口，分为两类：

- **驱动端口（Driving Port/Primary Port）**：定义外部世界如何与应用交互
- **被驱动端口（Driven Port/Secondary Port）**：定义应用如何与外部世界交互

**适配器（Adapter）**

适配器是端口的实现，分为两类：

- **驱动适配器（Driving Adapter/Primary Adapter）**：实现驱动端口，如REST Controller、CLI
- **被驱动适配器（Driven Adapter/Secondary Adapter）**：实现被驱动端口，如JPA Repository

## 代码实现

### 领域层

```java
// 领域实体
public class User {
    private UserId id;
    private Username username;
    private Email email;
    private Password password;
    
    public User(UserId id, Username username, Email email, Password password) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
    }
    
    public void changeEmail(Email newEmail) {
        if (newEmail == null) {
            throw new IllegalArgumentException("Email cannot be null");
        }
        this.email = newEmail;
    }
    
    public boolean authenticate(Password password) {
        return this.password.matches(password);
    }
}

// 值对象
public record UserId(String value) {
    public UserId {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("User ID cannot be empty");
        }
    }
    
    public static UserId generate() {
        return new UserId(UUID.randomUUID().toString());
    }
}

public record Username(String value) {
    public Username {
        if (value == null || value.length() < 3 || value.length() > 50) {
            throw new IllegalArgumentException("Username must be 3-50 characters");
        }
    }
}

public record Email(String value) {
    private static final Pattern EMAIL_PATTERN = 
        Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");
    
    public Email {
        if (value == null || !EMAIL_PATTERN.matcher(value).matches()) {
            throw new IllegalArgumentException("Invalid email format");
        }
    }
}
```

### 端口定义

```java
// 驱动端口：定义用例接口
public interface UserService {
    
    User createUser(CreateUserCommand command);
    
    User getUser(UserId userId);
    
    void changeEmail(ChangeEmailCommand command);
    
    void deleteUser(UserId userId);
}

// 被驱动端口：定义存储接口
public interface UserRepository {
    
    User findById(UserId userId);
    
    User findByUsername(Username username);
    
    User findByEmail(Email email);
    
    void save(User user);
    
    void delete(UserId userId);
    
    boolean existsByUsername(Username username);
    
    boolean existsByEmail(Email email);
}

// 被驱动端口：定义外部服务接口
public interface NotificationService {
    
    void sendWelcomeEmail(Email email, Username username);
    
    void sendEmailChangeNotification(Email oldEmail, Email newEmail);
}
```

### 应用层实现

```java
// 应用服务实现
@Service
@Transactional
public class UserServiceImpl implements UserService {
    
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final PasswordEncoder passwordEncoder;
    
    public UserServiceImpl(
            UserRepository userRepository,
            NotificationService notificationService,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.passwordEncoder = passwordEncoder;
    }
    
    @Override
    public User createUser(CreateUserCommand command) {
        // 检查用户名是否存在
        if (userRepository.existsByUsername(command.getUsername())) {
            throw new UserAlreadyExistsException("Username already exists");
        }
        
        // 检查邮箱是否存在
        if (userRepository.existsByEmail(command.getEmail())) {
            throw new UserAlreadyExistsException("Email already exists");
        }
        
        // 创建用户
        User user = new User(
            UserId.generate(),
            command.getUsername(),
            command.getEmail(),
            passwordEncoder.encode(command.getPassword())
        );
        
        userRepository.save(user);
        
        // 发送欢迎邮件
        notificationService.sendWelcomeEmail(user.getEmail(), user.getUsername());
        
        return user;
    }
    
    @Override
    public User getUser(UserId userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
    }
    
    @Override
    public void changeEmail(ChangeEmailCommand command) {
        User user = getUser(command.getUserId());
        
        Email oldEmail = user.getEmail();
        user.changeEmail(command.getNewEmail());
        
        userRepository.save(user);
        
        notificationService.sendEmailChangeNotification(oldEmail, command.getNewEmail());
    }
    
    @Override
    public void deleteUser(UserId userId) {
        if (userRepository.findById(userId).isEmpty()) {
            throw new UserNotFoundException("User not found");
        }
        userRepository.delete(userId);
    }
}
```

### 驱动适配器

```java
// REST Controller适配器
@RestController
@RequestMapping("/api/users")
public class UserController {
    
    private final UserService userService;
    
    public UserController(UserService userService) {
        this.userService = userService;
    }
    
    @PostMapping
    public ResponseEntity<UserResponse> createUser(@RequestBody @Valid CreateUserRequest request) {
        CreateUserCommand command = new CreateUserCommand(
            new Username(request.getUsername()),
            new Email(request.getEmail()),
            new Password(request.getPassword())
        );
        
        User user = userService.createUser(command);
        
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(UserResponse.from(user));
    }
    
    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> getUser(@PathVariable String userId) {
        User user = userService.getUser(new UserId(userId));
        return ResponseEntity.ok(UserResponse.from(user));
    }
    
    @PutMapping("/{userId}/email")
    public ResponseEntity<Void> changeEmail(
            @PathVariable String userId,
            @RequestBody @Valid ChangeEmailRequest request) {
        
        ChangeEmailCommand command = new ChangeEmailCommand(
            new UserId(userId),
            new Email(request.getNewEmail())
        );
        
        userService.changeEmail(command);
        
        return ResponseEntity.noContent().build();
    }
    
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable String userId) {
        userService.deleteUser(new UserId(userId));
        return ResponseEntity.noContent().build();
    }
}

// CLI适配器
@Component
public class UserCli {
    
    private final UserService userService;
    
    public UserCli(UserService userService) {
        this.userService = userService;
    }
    
    public void createUser(String username, String email, String password) {
        CreateUserCommand command = new CreateUserCommand(
            new Username(username),
            new Email(email),
            new Password(password)
        );
        
        User user = userService.createUser(command);
        System.out.println("User created with ID: " + user.getId());
    }
}
```

### 被驱动适配器

```java
// JPA Repository适配器
@Repository
public class JpaUserRepository implements UserRepository {
    
    private final UserJpaRepository jpaRepository;
    private final UserMapper mapper;
    
    public JpaUserRepository(UserJpaRepository jpaRepository, UserMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }
    
    @Override
    public User findById(UserId userId) {
        return jpaRepository.findById(userId.value())
            .map(mapper::toDomain)
            .orElse(null);
    }
    
    @Override
    public void save(User user) {
        UserEntity entity = mapper.toEntity(user);
        jpaRepository.save(entity);
    }
    
    @Override
    public void delete(UserId userId) {
        jpaRepository.deleteById(userId.value());
    }
    
    @Override
    public boolean existsByUsername(Username username) {
        return jpaRepository.existsByUsername(username.value());
    }
}

// 邮件服务适配器
@Service
public class EmailNotificationService implements NotificationService {
    
    private final JavaMailSender mailSender;
    
    public EmailNotificationService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }
    
    @Override
    public void sendWelcomeEmail(Email email, Username username) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email.value());
        message.setSubject("Welcome!");
        message.setText("Welcome " + username.value() + "!");
        mailSender.send(message);
    }
}
```

### 依赖注入配置

```java
@Configuration
public class HexagonalArchitectureConfig {
    
    // 驱动端口实现
    @Bean
    public UserService userService(
            UserRepository userRepository,
            NotificationService notificationService,
            PasswordEncoder passwordEncoder) {
        return new UserServiceImpl(userRepository, notificationService, passwordEncoder);
    }
    
    // 被驱动端口适配器
    @Bean
    public UserRepository userRepository(
            UserJpaRepository jpaRepository,
            UserMapper mapper) {
        return new JpaUserRepository(jpaRepository, mapper);
    }
    
    @Bean
    public NotificationService notificationService(JavaMailSender mailSender) {
        return new EmailNotificationService(mailSender);
    }
}
```

## 测试策略

### 单元测试

```java
// 领域模型测试
class UserTest {
    
    @Test
    void shouldCreateUser() {
        UserId id = UserId.generate();
        Username username = new Username("testuser");
        Email email = new Email("test@example.com");
        Password password = new Password("password123");
        
        User user = new User(id, username, email, password);
        
        assertThat(user.getId()).isEqualTo(id);
        assertThat(user.getUsername()).isEqualTo(username);
        assertThat(user.getEmail()).isEqualTo(email);
    }
    
    @Test
    void shouldChangeEmail() {
        User user = createUser();
        Email newEmail = new Email("new@example.com");
        
        user.changeEmail(newEmail);
        
        assertThat(user.getEmail()).isEqualTo(newEmail);
    }
}

// 应用服务测试
class UserServiceImplTest {
    
    private UserServiceImpl userService;
    private UserRepository userRepository;
    private NotificationService notificationService;
    
    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        notificationService = mock(NotificationService.class);
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        
        userService = new UserServiceImpl(userRepository, notificationService, passwordEncoder);
    }
    
    @Test
    void shouldCreateUser() {
        // Given
        when(userRepository.existsByUsername(any())).thenReturn(false);
        when(userRepository.existsByEmail(any())).thenReturn(false);
        
        CreateUserCommand command = new CreateUserCommand(
            new Username("testuser"),
            new Email("test@example.com"),
            new Password("password123")
        );
        
        // When
        User user = userService.createUser(command);
        
        // Then
        assertThat(user).isNotNull();
        verify(userRepository).save(any(User.class));
        verify(notificationService).sendWelcomeEmail(any(), any());
    }
}
```

### 集成测试

```java
@SpringBootTest
class UserControllerIntegrationTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private UserRepository userRepository;
    
    @MockBean
    private NotificationService notificationService;
    
    @Test
    void shouldCreateUser() throws Exception {
        // Given
        when(userRepository.existsByUsername(any())).thenReturn(false);
        when(userRepository.existsByEmail(any())).thenReturn(false);
        
        String requestBody = """
            {
                "username": "testuser",
                "email": "test@example.com",
                "password": "password123"
            }
            """;
        
        // When & Then
        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.username").value("testuser"));
    }
}
```

## 总结

六边形架构通过端口与适配器模式，实现了业务逻辑与外部世界的解耦。核心优势包括：

1. 业务逻辑独立，不受外部技术影响
2. 可测试性强，易于模拟依赖
3. 技术可替换性强，适配器可灵活更换
4. 关注点分离清晰，架构边界明确

六边形架构适用于需要长期维护、技术灵活性强、可测试性要求高的项目。

## 参考资料

- 《六边形架构》 - Alistair Cockburn
- 《实现领域驱动设计》 - Vaughn Vernon
- 端口与适配器架构模式