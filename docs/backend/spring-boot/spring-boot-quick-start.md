---
title: Spring Boot快速入门
date: 2025-01-20
categories: [backend, spring-boot]
tags: [Spring Boot, Java, Web开发, 微服务, 自动配置]
description: Spring Boot核心概念、项目结构、自动配置原理与最佳实践，快速构建生产级应用
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
│   │   └── com/example/demo/
│   │       ├── controller/
│   │       │   ├── UserControllerTest.java
│   │       ├── service/
│   │       │   ├── UserServiceTest.java
│   ├── resources/
```

### 启动类

```java
@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}

// @SpringBootApplication是组合注解，等同于：
@SpringBootConfiguration      // 表示这是一个配置类
@EnableAutoConfiguration      // 启用自动配置
@ComponentScan(               // 组件扫描
    basePackages = "com.example.demo"
)
public class DemoApplication {
    // ...
}

// 自定义启动参数
@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(DemoApplication.class);
        app.setAdditionalProfiles("dev");  // 添加环境配置
        app.setBannerMode(Banner.Mode.OFF);  // 关闭启动Banner
        app.run(args);
    }
}

// 使用SpringApplicationBuilder构建
@SpringBootApplication
public class DemoApplication extends SpringBootServletInitializer {
    
    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder builder) {
        return builder.sources(DemoApplication.class);
    }
    
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
```

## RESTful API开发

### 控制器开发

```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    // GET请求：获取用户列表
    @GetMapping
    public List<UserDTO> getUsers(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        return userService.getUsers(page, size);
    }
    
    // GET请求：获取单个用户
    @GetMapping("/{id}")
    public UserDTO getUser(@PathVariable Long id) {
        return userService.getUserById(id);
    }
    
    // POST请求：创建用户
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserDTO createUser(@Valid @RequestBody UserRequest request) {
        return userService.createUser(request);
    }
    
    // PUT请求：更新用户
    @PutMapping("/{id}")
    public UserDTO updateUser(
        @PathVariable Long id,
        @Valid @RequestBody UserRequest request
    ) {
        return userService.updateUser(id, request);
    }
    
    // DELETE请求：删除用户
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }
    
    // HEAD请求：检查资源是否存在
    @HeadMapping("/{id}")
    public void checkUser(@PathVariable Long id) {
        if (!userService.exists(id)) {
            throw new NotFoundException("User not found");
        }
    }
    
    // OPTIONS请求：获取支持的HTTP方法
    @OptionsMapping
    public ResponseEntity<Void> options() {
        HttpHeaders headers = new HttpHeaders();
        headers.allow(HttpMethod.GET, HttpMethod.POST, HttpMethod.PUT, HttpMethod.DELETE);
        return ResponseEntity.ok().headers(headers).build();
    }
}
```

### 参数接收

```java
@RestController
public class ParameterController {
    
    // @PathVariable：路径参数
    @GetMapping("/users/{id}/orders/{orderId}")
    public Order getOrder(
        @PathVariable Long id,
        @PathVariable("orderId") Long orderId
    ) {
        return orderService.getOrder(id, orderId);
    }
    
    // @RequestParam：查询参数
    @GetMapping("/search")
    public List<User> search(
        @RequestParam String keyword,
        @RequestParam(required = false) String status,
        @RequestParam(defaultValue = "10") int limit
    ) {
        return userService.search(keyword, status, limit);
    }
    
    // @RequestBody：请求体（JSON）
    @PostMapping("/users")
    public User createUser(@RequestBody UserRequest request) {
        return userService.createUser(request);
    }
    
    // @RequestHeader：请求头
    @GetMapping("/info")
    public Map<String, String> getInfo(
        @RequestHeader("Authorization") String auth,
        @RequestHeader(value = "X-Request-Id", required = false) String requestId
    ) {
        Map<String, String> info = new HashMap<>();
        info.put("auth", auth);
        info.put("requestId", requestId);
        return info;
    }
    
    // @CookieValue：Cookie值
    @GetMapping("/session")
    public String getSessionId(@CookieValue("SESSIONID") String sessionId) {
        return sessionId;
    }
    
    // @MatrixVariable：矩阵变量
    @GetMapping("/cars/{path}")
    public List<Car> getCars(
        @PathVariable String path,
        @MatrixVariable(required = false) String color,
        @MatrixVariable(required = false) Integer year
    ) {
        // URL格式：/cars/sell;color=red;year=2023
        return carService.getCars(path, color, year);
    }
}
```

### 响应处理

```java
@RestController
public class ResponseController {
    
    // 直接返回对象（自动转换为JSON）
    @GetMapping("/user")
    public User getUser() {
        return userService.getCurrentUser();
    }
    
    // 使用ResponseEntity控制响应
    @GetMapping("/user/{id}")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        User user = userService.getUserById(id);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
            .header("X-User-Id", String.valueOf(id))
            .body(user);
    }
    
    // 异常处理
    @GetMapping("/user/{id}")
    public ResponseEntity<?> getUserWithError(@PathVariable Long id) {
        try {
            User user = userService.getUserById(id);
            return ResponseEntity.ok(user);
        } catch (NotFoundException e) {
            ErrorResponse error = new ErrorResponse("NOT_FOUND", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
    
    // 异步响应
    @GetMapping("/async/{id}")
    public CompletableFuture<User> getUserAsync(@PathVariable Long id) {
        return userService.getUserAsync(id);
    }
    
    // 流式响应
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<User> streamUsers() {
        return userService.streamUsers();
    }
}
```

## 数据校验

### 实体校验

```java
// 校验注解
public class UserRequest {
    
    @NotBlank(message = "用户名不能为空")
    @Size(min = 2, max = 50, message = "用户名长度必须在2-50之间")
    private String name;
    
    @NotNull(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    private String email;
    
    @NotNull(message = "年龄不能为空")
    @Min(value = 18, message = "年龄必须大于等于18")
    @Max(value = 100, message = "年龄必须小于等于100")
    private Integer age;
    
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String phone;
    
    @Past(message = "出生日期必须是过去的日期")
    private LocalDate birthday;
    
    @Valid
    @NotNull
    private Address address;  // 嵌套校验
    
    // getter和setter
}

public class Address {
    @NotBlank(message = "省份不能为空")
    private String province;
    
    @NotBlank(message = "城市不能为空")
    private String city;
    
    // getter和setter
}
```

### 自定义校验

```java
// 自定义校验注解
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = PhoneValidator.class)
public @interface Phone {
    String message() default "手机号格式不正确";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

// 校验实现类
public class PhoneValidator implements ConstraintValidator<Phone, String> {
    
    private static final Pattern PHONE_PATTERN = 
        Pattern.compile("^1[3-9]\\d{9}$");
    
    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) {
            return true;  // null值由@NotNull校验
        }
        return PHONE_PATTERN.matcher(value).matches();
    }
}

// 使用自定义校验
public class UserRequest {
    @Phone
    private String phone;
}
```

### 分组校验

```java
// 定义校验分组
public interface Create {}
public interface Update {}

// 使用分组
public class UserRequest {
    @NotNull(groups = Create.class, message = "创建时ID不能为空")
    @Null(groups = Update.class, message = "更新时ID必须为空")
    private Long id;
    
    @NotBlank(groups = {Create.class, Update.class})
    private String name;
    
    @Email(groups = {Create.class, Update.class})
    private String email;
}

// 控制器中使用分组
@RestController
public class UserController {
    
    @PostMapping
    public User create(@Validated(Create.class) @RequestBody UserRequest request) {
        return userService.create(request);
    }
    
    @PutMapping("/{id}")
    public User update(@Validated(Update.class) @RequestBody UserRequest request) {
        return userService.update(request);
    }
}
```

## 异常处理

### 全局异常处理

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    
    // 处理业务异常
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException e) {
        log.warn("Business exception: {}", e.getMessage());
        ErrorResponse error = new ErrorResponse(
            e.getCode(),
            e.getMessage(),
            LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
    
    // 处理参数校验异常
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
        MethodArgumentNotValidException e
    ) {
        List<String> errors = e.getBindingResult()
            .getFieldErrors()
            .stream()
            .map(error -> error.getField() + ": " + error.getDefaultMessage())
            .collect(Collectors.toList());
        
        ErrorResponse response = new ErrorResponse(
            "VALIDATION_ERROR",
            "参数校验失败",
            errors,
            LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
    
    // 处理资源不存在异常
    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFoundException(NotFoundException e) {
        ErrorResponse error = new ErrorResponse(
            "NOT_FOUND",
            e.getMessage(),
            LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
    
    // 处理所有未捕获异常
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception e) {
        log.error("Unexpected exception", e);
        ErrorResponse error = new ErrorResponse(
            "INTERNAL_ERROR",
            "服务器内部错误",
            LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}

// 错误响应DTO
public record ErrorResponse(
    String code,
    String message,
    List<String> details,
    LocalDateTime timestamp
) {
    public ErrorResponse(String code, String message, LocalDateTime timestamp) {
        this(code, message, null, timestamp);
    }
}
```

## 配置管理

### 外部化配置

Spring Boot支持多种配置源，按优先级从高到低：

1. 命令行参数
2. Java系统属性（System.getProperties()）
3. 操作系统环境变量
4. application-{profile}.yml
5. application.yml
6. @ConfigurationProperty注解的默认值

```yaml
# application.yml
spring:
  application:
    name: demo-app
  profiles:
    active: dev
  datasource:
    url: jdbc:mysql://localhost:3306/mydb
    username: root
    password: secret
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
  cache:
    type: redis
  redis:
    host: localhost
    port: 6379

server:
  port: 8080
  servlet:
    context-path: /api

logging:
  level:
    root: INFO
    com.example: DEBUG
  file:
    name: logs/app.log

# application-dev.yml（开发环境）
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mydb_dev
  jpa:
    show-sql: true
logging:
  level:
    com.example: DEBUG

# application-prod.yml（生产环境）
spring:
  datasource:
    url: jdbc:mysql://prod-db:3306/mydb
    hikari:
      maximum-pool-size: 20
  jpa:
    show-sql: false
logging:
  level:
    root: WARN
```

### 配置属性绑定

```java
@ConfigurationProperties(prefix = "app")
@Component
public class AppProperties {
    
    private String name;
    private String version;
    private boolean enabled = true;
    
    private Security security = new Security();
    private Feature feature = new Feature();
    
    // getter和setter
    
    public static class Security {
        private String apiKey;
        private long tokenExpiration = 3600;
        // getter和setter
    }
    
    public static class Feature {
        private boolean darkMode = false;
        private int maxUploadSize = 10;
        // getter和setter
    }
}

// application.yml
app:
  name: Demo App
  version: 1.0.0
  enabled: true
  security:
    api-key: secret-key
    token-expiration: 7200
  feature:
    dark-mode: true
    max-upload-size: 50
```

### 松散绑定

Spring Boot支持多种属性绑定格式：

```yaml
# 以下格式都绑定到security.apiKey属性
app:
  security:
    apiKey: value        # 标准格式
    api-key: value       # 短横线格式
    api_key: value       # 下划线格式
    API_KEY: value       # 大写格式（环境变量推荐）
```

## 日志管理

### 日志配置

```java
// 使用SLF4J + Logback
@RestController
public class LogController {
    
    private static final Logger log = LoggerFactory.getLogger(LogController.class);
    
    @GetMapping("/users/{id}")
    public User getUser(@PathVariable Long id) {
        log.info("Fetching user with id: {}", id);
        
        User user = userService.getUserById(id);
        
        if (user == null) {
            log.warn("User not found for id: {}", id);
            throw new NotFoundException("User not found");
        }
        
        log.debug("User details: {}", user);
        return user;
    }
    
    // 使用@Slf4j注解（Lombok）
    // @Slf4j
    // public class LogController {
    //     log.info("...");
    // }
}
```

```xml
<!-- logback-spring.xml -->
<configuration>
    <springProfile name="dev">
        <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
            <encoder>
                <pattern>%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n</pattern>
            </encoder>
        </appender>
        <root level="DEBUG">
            <appender-ref ref="CONSOLE"/>
        </root>
    </springProfile>
    
    <springProfile name="prod">
        <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
            <file>logs/app.log</file>
            <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
                <fileNamePattern>logs/app.%d{yyyy-MM-dd}.log</fileNamePattern>
                <maxHistory>30</maxHistory>
            </rollingPolicy>
            <encoder>
                <pattern>%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n</pattern>
            </encoder>
        </appender>
        <root level="INFO">
            <appender-ref ref="FILE"/>
        </root>
    </springProfile>
</configuration>
```

## 测试

### 单元测试

```java
@SpringBootTest
class UserServiceTest {
    
    @Autowired
    private UserService userService;
    
    @MockBean
    private UserRepository userRepository;
    
    @Test
    void shouldReturnUserWhenExists() {
        // Given
        User user = new User(1L, "Alice", "alice@example.com");
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        
        // When
        UserDTO result = userService.getUserById(1L);
        
        // Then
        assertThat(result.getName()).isEqualTo("Alice");
        assertThat(result.getEmail()).isEqualTo("alice@example.com");
    }
    
    @Test
    void shouldThrowExceptionWhenUserNotFound() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.empty());
        
        // When & Then
        assertThatThrownBy(() -> userService.getUserById(1L))
            .isInstanceOf(NotFoundException.class)
            .hasMessage("User not found");
    }
}
```

### Web层测试

```java
@WebMvcTest(UserController.class)
class UserControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private UserService userService;
    
    @Test
    void shouldReturnUser() throws Exception {
        // Given
        UserDTO user = new UserDTO(1L, "Alice", "alice@example.com");
        when(userService.getUserById(1L)).thenReturn(user);
        
        // When & Then
        mockMvc.perform(get("/api/users/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.name").value("Alice"))
            .andExpect(jsonPath("$.email").value("alice@example.com"));
    }
    
    @Test
    void shouldReturn404WhenUserNotFound() throws Exception {
        // Given
        when(userService.getUserById(1L)).thenThrow(new NotFoundException("User not found"));
        
        // When & Then
        mockMvc.perform(get("/api/users/1"))
            .andExpect(status().isNotFound());
    }
    
    @Test
    void shouldCreateUser() throws Exception {
        // Given
        UserRequest request = new UserRequest("Bob", "bob@example.com");
        UserDTO created = new UserDTO(2L, "Bob", "bob@example.com");
        when(userService.createUser(any())).thenReturn(created);
        
        // When & Then
        mockMvc.perform(post("/api/users")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(2));
    }
}
```

## 总结

Spring Boot通过自动配置、起步依赖、内嵌服务器等特性，极大简化了Spring应用的开发。开发者只需关注业务逻辑，无需花费大量时间在配置上。本文介绍了Spring Boot的核心特性、项目结构、RESTful API开发、数据校验、异常处理、配置管理和测试等内容。

在实际开发中，建议遵循以下最佳实践：

1. 使用分层架构，保持代码结构清晰
2. 统一异常处理，提供友好的错误信息
3. 使用配置属性类管理外部化配置
4. 编写充分的测试，保证代码质量
5. 合理使用日志，便于问题排查

掌握Spring Boot的核心概念和最佳实践，能够帮助开发者快速构建高质量的企业级应用。

## 参考资料

- Spring Boot官方文档
- 《Spring Boot实战》 - Craig Walls
- Spring Boot源码分析
- Spring Framework核心特性