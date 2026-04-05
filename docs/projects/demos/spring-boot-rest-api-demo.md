---
title: Spring Boot REST API示例项目实战
date: 2025-02-18T00:00:00.000Z
categories:
  - projects
  - demos
tags:
  - Spring Boot
  - REST API
  - Java
  - 后端开发
  - 微服务
description: 通过完整的示例项目展示Spring Boot REST API开发实践，包括项目结构、API设计、数据验证、异常处理和测试策略
author: HK意境
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
