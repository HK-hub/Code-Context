---
title: Spring Boot REST API示例项目实战
date: 2025-02-18
categories: [projects, demos]
tags: [Spring Boot, REST API, Java, 后端开发, 微服务]
description: 通过完整的示例项目展示Spring Boot REST API开发实践，包括项目结构、API设计、数据验证、异常处理和测试策略
---

# Spring Boot REST API示例项目实战

## 项目架构设计

Spring Boot作为Java生态中最流行的微服务框架，提供了快速构建REST API的能力。一个规范的Spring Boot项目需要清晰的架构设计和最佳实践。

### 项目结构

```
spring-boot-api-demo/
├── src/main/java/com/example/demo/
│   ├── DemoApplication.java          # 启动类
│   ├── config/                        # 配置类
│   │   ├── SecurityConfig.java
│   │   ├── SwaggerConfig.java
│   │   └── WebConfig.java
│   ├── controller/                    # 控制器层
│   │   ├── UserController.java
│   │   └── dto/                       # 数据传输对象
│   │       ├── UserCreateDTO.java
│   │       └── UserUpdateDTO.java
│   ├── service/                       # 服务层
│   │   ├── UserService.java
│   │   └── impl/
│   │       └── UserServiceImpl.java
│   ├── repository/                    # 数据访问层
│   │   └── UserRepository.java
│   ├── entity/                        # 实体类
│   │   └── User.java
│   ├── exception/                     # 异常处理
│   │   ├── GlobalExceptionHandler.java
│   │   ├── ResourceNotFoundException.java
│   │   └── BusinessException.java
│   ├── security/                      # 安全相关
│   │   ├── JwtTokenProvider.java
│   │   └── JwtAuthenticationFilter.java
│   └── util/                          # 工具类
│       └── DateUtil.java
├── src/main/resources/
│   ├── application.yml                # 配置文件
│   ├── application-dev.yml            # 开发环境配置
│   ├── application-prod.yml           # 生产环境配置
│   └── db/migration/                  # 数据库迁移脚本
│       └── V1__init_schema.sql
├── src/test/java/                     # 测试代码
└── pom.xml                            # Maven配置
```

## REST API设计实践

### 控制器层实现

```java
// UserController.java
@RestController
@RequestMapping("/api/v1/users")
@Validated
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<PageResponse<UserDTO>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        PageRequest pageRequest = PageRequest.of(
            page, size, 
            Sort.by(Sort.Direction.fromString(sortDir), sortBy)
        );
        
        PageResponse<UserDTO> response = userService.findAll(pageRequest);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        UserDTO user = userService.findById(id);
        return ResponseEntity.ok(user);
    }

    @PostMapping
    public ResponseEntity<UserDTO> createUser(
            @Valid @RequestBody UserCreateDTO dto,
            UriComponentsBuilder uriBuilder) {
        
        UserDTO created = userService.create(dto);
        URI location = uriBuilder
            .path("/api/v1/users/{id}")
            .buildAndExpand(created.getId())
            .toUri();
        
        return ResponseEntity
            .created(location)
            .body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateDTO dto) {
        
        UserDTO updated = userService.update(id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserDTO>> searchUsers(
            @RequestParam String keyword,
            @RequestParam(required = false) String status) {
        
        List<UserDTO> users = userService.search(keyword, status);
        return ResponseEntity.ok(users);
    }
}
```

### 服务层实现

```java
// UserService.java
public interface UserService {
    PageResponse<UserDTO> findAll(PageRequest pageRequest);
    UserDTO findById(Long id);
    UserDTO create(UserCreateDTO dto);
    UserDTO update(Long id, UserUpdateDTO dto);
    void delete(Long id);
    List<UserDTO> search(String keyword, String status);
}

// UserServiceImpl.java
@Service
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserDTO> findAll(PageRequest pageRequest) {
        Page<User> userPage = userRepository.findAll(pageRequest);
        
        List<UserDTO> content = userPage.getContent()
            .stream()
            .map(userMapper::toDTO)
            .collect(Collectors.toList());
        
        return new PageResponse<>(
            content,
            userPage.getNumber(),
            userPage.getSize(),
            userPage.getTotalElements(),
            userPage.getTotalPages()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public UserDTO findById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        
        return userMapper.toDTO(user);
    }

    @Override
    public UserDTO create(UserCreateDTO dto) {
        // 检查用户名是否已存在
        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new BusinessException("Username already exists");
        }
        
        // 检查邮箱是否已存在
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new BusinessException("Email already exists");
        }
        
        User user = userMapper.toEntity(dto);
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setStatus(UserStatus.ACTIVE);
        user.setCreatedAt(LocalDateTime.now());
        
        User saved = userRepository.save(user);
        return userMapper.toDTO(saved);
    }

    @Override
    public UserDTO update(Long id, UserUpdateDTO dto) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        
        // 更新字段
        if (dto.getEmail() != null && !dto.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(dto.getEmail())) {
                throw new BusinessException("Email already exists");
            }
            user.setEmail(dto.getEmail());
        }
        
        if (dto.getNickname() != null) {
            user.setNickname(dto.getNickname());
        }
        
        user.setUpdatedAt(LocalDateTime.now());
        
        User updated = userRepository.save(user);
        return userMapper.toDTO(updated);
    }

    @Override
    public void delete(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        
        user.setStatus(UserStatus.DELETED);
        user.setDeletedAt(LocalDateTime.now());
        userRepository.save(user);
    }
}
```

## 数据验证与异常处理

### 数据验证

```java
// UserCreateDTO.java
@Data
public class UserCreateDTO {
    
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username can only contain letters, numbers and underscores")
    private String username;
    
    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$", 
             message = "Password must contain at least one uppercase letter, one lowercase letter and one number")
    private String password;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
    
    @Size(max = 100, message = "Nickname must not exceed 100 characters")
    private String nickname;
    
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "Invalid phone number format")
    private String phone;
}

// UserUpdateDTO.java
@Data
public class UserUpdateDTO {
    
    @Email(message = "Invalid email format")
    private String email;
    
    @Size(max = 100, message = "Nickname must not exceed 100 characters")
    private String nickname;
    
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "Invalid phone number format")
    private String phone;
}
```

### 全局异常处理

```java
// GlobalExceptionHandler.java
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(MethodArgumentNotValidException ex) {
        List<String> errors = ex.getBindingResult()
            .getFieldErrors()
            .stream()
            .map(error -> error.getField() + ": " + error.getDefaultMessage())
            .collect(Collectors.toList());
        
        ErrorResponse response = new ErrorResponse(
            HttpStatus.BAD_REQUEST.value(),
            "Validation failed",
            errors
        );
        
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(ResourceNotFoundException ex) {
        ErrorResponse response = new ErrorResponse(
            HttpStatus.NOT_FOUND.value(),
            ex.getMessage(),
            null
        );
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException ex) {
        ErrorResponse response = new ErrorResponse(
            HttpStatus.BAD_REQUEST.value(),
            ex.getMessage(),
            null
        );
        
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        log.error("Unexpected error occurred", ex);
        
        ErrorResponse response = new ErrorResponse(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            "An unexpected error occurred",
            null
        );
        
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(response);
    }
}

// ErrorResponse.java
@Data
@AllArgsConstructor
public class ErrorResponse {
    private int status;
    private String message;
    private List<String> details;
}
```

## 安全配置

```java
// SecurityConfig.java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .requestMatchers("/api/v1/**").authenticated()
                .anyRequest().authenticated()
            )
            .addFilterBefore(
                new JwtAuthenticationFilter(jwtTokenProvider, userDetailsService),
                UsernamePasswordAuthenticationFilter.class
            );
        
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) 
            throws Exception {
        return config.getAuthenticationManager();
    }
}
```

## 单元测试

```java
// UserControllerTest.java
@WebMvcTest(UserController.class)
@Import({UserServiceImpl.class})
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserRepository userRepository;

    @Test
    void getUserById_ShouldReturnUser_WhenUserExists() throws Exception {
        User user = new User();
        user.setId(1L);
        user.setUsername("testuser");
        user.setEmail("test@example.com");
        
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        
        mockMvc.perform(get("/api/v1/users/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.username").value("testuser"))
            .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    @Test
    void createUser_ShouldReturnCreatedUser_WhenValidInput() throws Exception {
        UserCreateDTO dto = new UserCreateDTO();
        dto.setUsername("newuser");
        dto.setPassword("Password123");
        dto.setEmail("new@example.com");
        
        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User saved = invocation.getArgument(0);
            saved.setId(1L);
            return saved;
        });
        
        mockMvc.perform(post("/api/v1/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.username").value("newuser"));
    }
}
```

## 总结

Spring Boot REST API开发需要系统化的实践：

1. **架构设计**：清晰的分层架构，职责分明
2. **API设计**：遵循RESTful规范，统一响应格式
3. **数据验证**：全面的参数校验，友好的错误提示
4. **异常处理**：全局异常捕获，统一的错误响应
5. **安全配置**：JWT认证、权限控制、CSRF防护
6. **测试覆盖**：单元测试、集成测试确保质量

通过这些最佳实践，可以构建出高质量、可维护、安全的Spring Boot REST API项目。