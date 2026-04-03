---
title: Spring Security安全配置
date: 2025-02-15
categories: [backend, spring-boot]
tags: [Spring Security, 认证, 授权, JWT, OAuth2]
description: Spring Security核心原理、认证授权配置、JWT集成与安全最佳实践详解
---

# Spring Security安全配置

## 引言

安全性是企业级应用的核心需求之一。无论是用户数据保护、防止恶意攻击，还是合规性要求，安全都是不可忽视的重要组成部分。Spring Security作为Spring生态系统的安全框架，提供了全面的安全解决方案，涵盖认证、授权、CSRF防护、会话管理等各个方面。

Spring Security的设计理念是"默认安全"，即开箱即用的配置已经提供了基本的安全保护。开发者可以通过配置进行定制，满足特定的业务需求。然而，Spring Security的配置相对复杂，理解其核心原理对于正确使用至关重要。

本文将深入探讨Spring Security的核心架构、认证授权机制、JWT集成、OAuth2配置以及安全最佳实践，帮助开发者构建安全可靠的应用系统。

## Spring Security架构

### 核心组件

Spring Security的核心架构由以下组件构成：

**SecurityFilterChain**

SecurityFilterChain是一组过滤器的链，每个请求都会经过这些过滤器的处理。过滤器负责执行认证、授权、CSRF防护等安全操作。

```
请求 -> SecurityFilterChain -> 目标资源

SecurityFilterChain过滤器顺序：
1. DisableEncodeUrlFilter
2. ForceEagerSessionCreationFilter
3. ChannelProcessingFilter
4. WebAsyncManagerIntegrationFilter
5. SecurityContextHolderFilter
6. ConcurrentSessionFilter
7. HeaderWriterFilter
8. CorsFilter
9. CsrfFilter
10. LogoutFilter
11. OAuth2AuthorizationRequestRedirectFilter
12. Saml2WebSsoAuthenticationRequestFilter
13. X509AuthenticationFilter
14. BasicAuthenticationFilter
15. OAuth2LoginAuthenticationFilter
16. OAuth2AuthorizationCodeAuthenticationFilter
17. Saml2WebSsoAuthenticationFilter
18. OpenIDAuthenticationFilter
19. UsernamePasswordAuthenticationFilter
20. DefaultLoginPageGeneratingFilter
21. DefaultLogoutPageGeneratingFilter
22. ConcurrentSessionFilter
23. DigestAuthenticationFilter
24. BearerTokenAuthenticationFilter
25. RememberMeAuthenticationFilter
26. SessionManagementFilter
27. ExceptionTranslationFilter
28. AuthorizationFilter
```

**SecurityContextHolder**

SecurityContextHolder用于存储安全上下文信息，包括当前认证用户的详细信息。

```java
// 获取当前认证用户
SecurityContext context = SecurityContextHolder.getContext();
Authentication authentication = context.getAuthentication();
String username = authentication.getName();
Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
```

**Authentication**

Authentication接口表示认证信息，包含用户身份、凭据和权限：

```java
public interface Authentication extends Principal, Serializable {
    Collection<? extends GrantedAuthority> getAuthorities();  // 权限列表
    Object getCredentials();    // 凭据（密码等，认证后通常清除）
    Object getDetails();        // 详细信息
    Object getPrincipal();      // 用户身份
    boolean isAuthenticated();  // 是否已认证
    void setAuthenticated(boolean isAuthenticated);
}
```

**UserDetails**

UserDetails接口定义用户详细信息：

```java
public interface UserDetails extends Serializable {
    Collection<? extends GrantedAuthority> getAuthorities();  // 用户权限
    String getPassword();      // 密码
    String getUsername();      // 用户名
    boolean isAccountNonExpired();      // 账户是否未过期
    boolean isAccountNonLocked();       // 账户是否未锁定
    boolean isCredentialsNonExpired();  // 凭据是否未过期
    boolean isEnabled();                // 账户是否启用
}
```

**GrantedAuthority**

GrantedAuthority表示用户权限：

```java
public interface GrantedAuthority extends Serializable {
    String getAuthority();  // 权限字符串
}

// Spring Security提供的实现
SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_USER");
```

### 认证流程

Spring Security的认证流程：

```
用户提交认证信息
    ↓
UsernamePasswordAuthenticationFilter拦截请求
    ↓
创建Authentication对象（未认证状态）
    ↓
调用AuthenticationManager.authenticate()
    ↓
AuthenticationManager委托给AuthenticationProvider
    ↓
AuthenticationProvider调用UserDetailsService获取用户信息
    ↓
验证凭据（密码匹配）
    ↓
创建已认证的Authentication对象
    ↓
存入SecurityContextHolder
    ↓
认证成功
```

## 基础配置

### 最简配置

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 授权规则
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/public/**").permitAll()
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            // 表单登录
            .formLogin(form -> form
                .loginPage("/login")
                .permitAll()
            )
            // 记住我功能
            .rememberMe(remember -> remember
                .key("uniqueAndSecret")
                .tokenValiditySeconds(86400)  // 1天
            )
            // 登出配置
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/login?logout")
                .permitAll()
            );
        
        return http.build();
    }
    
    @Bean
    public UserDetailsService userDetailsService() {
        UserDetails user = User.withUsername("user")
            .password(passwordEncoder().encode("password"))
            .roles("USER")
            .build();
        
        UserDetails admin = User.withUsername("admin")
            .password(passwordEncoder().encode("admin"))
            .roles("ADMIN", "USER")
            .build();
        
        return new InMemoryUserDetailsManager(user, admin);
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

### 基于数据库的用户认证

```java
@Service
public class CustomUserDetailsService implements UserDetailsService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        
        return new CustomUserDetails(user);
    }
}

public class CustomUserDetails implements UserDetails {
    
    private final User user;
    
    public CustomUserDetails(User user) {
        this.user = user;
    }
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return user.getRoles().stream()
            .map(role -> new SimpleGrantedAuthority("ROLE_" + role.getName()))
            .collect(Collectors.toList());
    }
    
    @Override
    public String getPassword() {
        return user.getPassword();
    }
    
    @Override
    public String getUsername() {
        return user.getUsername();
    }
    
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }
    
    @Override
    public boolean isAccountNonLocked() {
        return !user.isLocked();
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
    
    @Override
    public boolean isEnabled() {
        return user.isEnabled();
    }
    
    public Long getId() {
        return user.getId();
    }
}
```

### 自定义登录处理

```java
@Configuration
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginProcessingUrl("/api/auth/login")
                .successHandler(authenticationSuccessHandler())
                .failureHandler(authenticationFailureHandler())
            )
            .logout(logout -> logout
                .logoutUrl("/api/auth/logout")
                .logoutSuccessHandler(logoutSuccessHandler())
            )
            .csrf(csrf -> csrf
                .ignoringRequestMatchers("/api/**")
            );
        
        return http.build();
    }
    
    @Bean
    public AuthenticationSuccessHandler authenticationSuccessHandler() {
        return new CustomAuthenticationSuccessHandler();
    }
    
    @Bean
    public AuthenticationFailureHandler authenticationFailureHandler() {
        return new CustomAuthenticationFailureHandler();
    }
    
    @Bean
    public LogoutSuccessHandler logoutSuccessHandler() {
        return new CustomLogoutSuccessHandler();
    }
}

@Component
public class CustomAuthenticationSuccessHandler implements AuthenticationSuccessHandler {
    
    @Override
    public void onAuthenticationSuccess(
        HttpServletRequest request,
        HttpServletResponse response,
        Authentication authentication
    ) throws IOException {
        response.setStatus(HttpStatus.OK.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        
        Map<String, Object> data = new HashMap<>();
        data.put("success", true);
        data.put("username", authentication.getName());
        
        new ObjectMapper().writeValue(response.getOutputStream(), data);
    }
}

@Component
public class CustomAuthenticationFailureHandler implements AuthenticationFailureHandler {
    
    @Override
    public void onAuthenticationFailure(
        HttpServletRequest request,
        HttpServletResponse response,
        AuthenticationException exception
    ) throws IOException {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        
        Map<String, Object> data = new HashMap<>();
        data.put("success", false);
        data.put("message", exception.getMessage());
        
        new ObjectMapper().writeValue(response.getOutputStream(), data);
    }
}
```

## JWT认证

### JWT概述

JWT（JSON Web Token）是一种开放标准，用于在各方之间安全传输信息。JWT由三部分组成：

```
Header.Payload.Signature

Header:  {"alg": "HS256", "typ": "JWT"}
Payload: {"sub": "user123", "iat": 1516239022, "exp": 1516242622}
Signature: HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)
```

### JWT工具类

```java
@Component
public class JwtUtils {
    
    @Value("${jwt.secret}")
    private String secret;
    
    @Value("${jwt.expiration}")
    private long expiration;
    
    private final SecretKey key;
    
    public JwtUtils(@Value("${jwt.secret}") String secret) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }
    
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", userDetails.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .collect(Collectors.toList()));
        
        return Jwts.builder()
            .claims(claims)
            .subject(userDetails.getUsername())
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + expiration))
            .signWith(key)
            .compact();
    }
    
    public String getUsernameFromToken(String token) {
        return Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .getPayload()
            .getSubject();
    }
    
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
    
    public boolean isTokenExpired(String token) {
        Date expiration = Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .getPayload()
            .getExpiration();
        return expiration.before(new Date());
    }
}
```

### JWT认证过滤器

```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Autowired
    private JwtUtils jwtUtils;
    
    @Autowired
    private UserDetailsService userDetailsService;
    
    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {
        
        String token = extractToken(request);
        
        if (token != null && jwtUtils.validateToken(token)) {
            String username = jwtUtils.getUsernameFromToken(token);
            
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                
                UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities()
                    );
                
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }
        
        filterChain.doFilter(request, response);
    }
    
    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
```

### JWT安全配置

```java
@Configuration
@EnableWebSecurity
public class JwtSecurityConfig {
    
    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;
    
    @Autowired
    private AuthenticationEntryPoint authenticationEntryPoint;
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(authenticationEntryPoint)
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    @Bean
    public AuthenticationEntryPoint authenticationEntryPoint() {
        return new CustomAuthenticationEntryPoint();
    }
}

@Component
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {
    
    @Override
    public void commence(
        HttpServletRequest request,
        HttpServletResponse response,
        AuthenticationException authException
    ) throws IOException {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        
        Map<String, Object> data = new HashMap<>();
        data.put("timestamp", LocalDateTime.now());
        data.put("status", HttpStatus.UNAUTHORIZED.value());
        data.put("error", "Unauthorized");
        data.put("message", authException.getMessage());
        data.put("path", request.getRequestURI());
        
        new ObjectMapper().writeValue(response.getOutputStream(), data);
    }
}
```

### 登录接口

```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @Autowired
    private AuthenticationService authenticationService;
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        AuthenticationResponse response = authenticationService.login(request);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        AuthenticationResponse response = authenticationService.register(request);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody RefreshTokenRequest request) {
        AuthenticationResponse response = authenticationService.refreshToken(request);
        return ResponseEntity.ok(response);
    }
}

@Service
public class AuthenticationService {
    
    @Autowired
    private UserDetailsService userDetailsService;
    
    @Autowired
    private JwtUtils jwtUtils;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    public AuthenticationResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String token = jwtUtils.generateToken(userDetails);
        String refreshToken = jwtUtils.generateRefreshToken(userDetails);
        
        return new AuthenticationResponse(token, refreshToken, userDetails.getUsername());
    }
    
    public AuthenticationResponse register(RegisterRequest request) {
        // 创建用户
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        userRepository.save(user);
        
        // 生成token
        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        String token = jwtUtils.generateToken(userDetails);
        
        return new AuthenticationResponse(token, null, request.getUsername());
    }
}
```

## OAuth2集成

### OAuth2概述

OAuth2是一种授权框架，允许第三方应用在用户授权下访问用户的资源，而无需获取用户的密码。常见的OAuth2提供商包括GitHub、Google、Facebook等。

### OAuth2客户端配置

```java
@Configuration
public class OAuth2Config {
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/login/**", "/error").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .loginPage("/login")
                .authorizationEndpoint(auth -> auth
                    .baseUri("/login/oauth2/authorization")
                )
                .redirectionEndpoint(redirect -> redirect
                    .baseUri("/login/oauth2/code/*")
                )
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(customOAuth2UserService())
                )
                .successHandler(oauth2AuthenticationSuccessHandler())
            );
        
        return http.build();
    }
    
    @Bean
    public OAuth2UserService<OAuth2UserRequest, OAuth2User> customOAuth2UserService() {
        return new CustomOAuth2UserService();
    }
    
    @Bean
    public AuthenticationSuccessHandler oauth2AuthenticationSuccessHandler() {
        return new OAuth2AuthenticationSuccessHandler();
    }
}

@Service
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {
    
    @Autowired
    private UserRepository userRepository;
    
    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2UserService<OAuth2UserRequest, OAuth2User> delegate = 
            new DefaultOAuth2UserService();
        
        OAuth2User oauth2User = delegate.loadUser(userRequest);
        
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        String userNameAttributeName = userRequest.getClientRegistration()
            .getProviderDetails().getUserInfoEndpoint().getUserNameAttributeName();
        
        // 处理不同OAuth2提供商的用户信息
        OAuth2UserInfo userInfo = OAuth2UserInfoFactory.getOAuth2UserInfo(
            registrationId, oauth2User.getAttributes()
        );
        
        // 查找或创建用户
        User user = userRepository.findByEmail(userInfo.getEmail())
            .orElseGet(() -> createOAuth2User(userInfo, registrationId));
        
        return new CustomOAuth2User(oauth2User, user, userNameAttributeName);
    }
    
    private User createOAuth2User(OAuth2UserInfo userInfo, String registrationId) {
        User user = new User();
        user.setEmail(userInfo.getEmail());
        user.setName(userInfo.getName());
        user.setAuthProvider(AuthProvider.valueOf(registrationId.toUpperCase()));
        return userRepository.save(user);
    }
}
```

### application.yml配置

```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          github:
            client-id: ${GITHUB_CLIENT_ID}
            client-secret: ${GITHUB_CLIENT_SECRET}
            scope: read:user, user:email
            redirect-uri: "{baseUrl}/login/oauth2/code/{registrationId}"
          
          google:
            client-id: ${GOOGLE_CLIENT_ID}
            client-secret: ${GOOGLE_CLIENT_SECRET}
            scope: profile, email
            redirect-uri: "{baseUrl}/login/oauth2/code/{registrationId}"
          
          facebook:
            client-id: ${FACEBOOK_CLIENT_ID}
            client-secret: ${FACEBOOK_CLIENT_SECRET}
            scope: public_profile, email
            redirect-uri: "{baseUrl}/login/oauth2/code/{registrationId}"
        
        provider:
          github:
            authorization-uri: https://github.com/login/oauth/authorize
            token-uri: https://github.com/login/oauth/access_token
            user-info-uri: https://api.github.com/user
            user-name-attribute: id
          
          google:
            authorization-uri: https://accounts.google.com/o/oauth2/v2/auth
            token-uri: https://oauth2.googleapis.com/token
            user-info-uri: https://www.googleapis.com/oauth2/v3/userinfo
            user-name-attribute: sub
```

## 方法级安全

### 启用方法安全

```java
@Configuration
@EnableMethodSecurity
public class MethodSecurityConfig {
    
    // 启用后可在方法上使用安全注解
}
```

### 安全注解使用

```java
@Service
public class ProductService {
    
    // @PreAuthorize：方法执行前检查
    @PreAuthorize("hasRole('ADMIN')")
    public Product createProduct(ProductRequest request) {
        return productRepository.save(new Product(request));
    }
    
    @PreAuthorize("hasRole('ADMIN') or #product.owner == authentication.name")
    public Product updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Product not found"));
        
        // 只有ADMIN或产品所有者可以更新
        product.update(request);
        return productRepository.save(product);
    }
    
    // @PostAuthorize：方法执行后检查
    @PostAuthorize("returnObject.owner == authentication.name or hasRole('ADMIN')")
    public Product getProduct(Long id) {
        return productRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Product not found"));
    }
    
    // @PreFilter：过滤输入参数
    @PreAuthorize("hasRole('ADMIN')")
    @PreFilter("filterObject.owner == authentication.name")
    public void deleteProducts(List<Product> products) {
        productRepository.deleteAll(products);
    }
    
    // @PostFilter：过滤返回结果
    @PostFilter("filterObject.public or filterObject.owner == authentication.name")
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
    
    // @Secured：简单的角色检查
    @Secured("ROLE_ADMIN")
    public void adminOperation() {
        // 管理员专用操作
    }
}
```

### 自定义权限表达式

```java
@Component("productSecurity")
public class ProductSecurityExpressions {
    
    @Autowired
    private ProductRepository productRepository;
    
    public boolean isOwner(Long productId, String username) {
        Product product = productRepository.findById(productId)
            .orElse(null);
        return product != null && product.getOwner().equals(username);
    }
    
    public boolean canView(Long productId, Authentication authentication) {
        Product product = productRepository.findById(productId)
            .orElse(null);
        
        if (product == null) {
            return false;
        }
        
        // 公开产品所有人可见
        if (product.isPublic()) {
            return true;
        }
        
        // 管理员可见所有
        if (authentication.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return true;
        }
        
        // 所有者可见
        return product.getOwner().equals(authentication.getName());
    }
}

// 使用自定义表达式
@Service
public class ProductService {
    
    @PreAuthorize("@productSecurity.isOwner(#id, authentication.name)")
    public Product updateProduct(Long id, ProductRequest request) {
        // ...
    }
    
    @PreAuthorize("@productSecurity.canView(#id, authentication)")
    public Product getProduct(Long id) {
        // ...
    }
}
```

## CSRF防护

### CSRF原理

CSRF（Cross-Site Request Forgery）攻击利用用户已认证的身份，在用户不知情的情况下执行恶意操作。Spring Security默认启用CSRF防护。

```java
@Configuration
public class CsrfSecurityConfig {
    
    // 默认配置：启用CSRF
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
            );
        
        return http.build();
    }
    
    // 禁用CSRF（仅用于无状态的API）
    @Bean
    public SecurityFilterChain disableCsrfConfig(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable());
        
        return http.build();
    }
    
    // 自定义CSRF配置
    @Bean
    public SecurityFilterChain customCsrfConfig(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf
                .csrfTokenRepository(new CustomCsrfTokenRepository())
                .ignoringRequestMatchers("/api/public/**")
            );
        
        return http.build();
    }
}
```

### 前端集成

```javascript
// 从Cookie获取CSRF Token
function getCsrfToken() {
    const name = 'XSRF-TOKEN';
    const cookies = document.cookie.split(';');
    
    for (let cookie of cookies) {
        let [key, value] = cookie.trim().split('=');
        if (key === name) {
            return decodeURIComponent(value);
        }
    }
    return null;
}

// 发送请求时携带CSRF Token
fetch('/api/data', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-XSRF-TOKEN': getCsrfToken()
    },
    body: JSON.stringify(data)
});
```

## CORS配置

```java
@Configuration
public class CorsConfig {
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors
                .configurationSource(corsConfigurationSource())
            );
        
        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // 允许的来源
        configuration.setAllowedOrigins(Arrays.asList("https://example.com"));
        // 或使用allowedOriginPatterns支持通配符
        configuration.setAllowedOriginPatterns(Arrays.asList("https://*.example.com"));
        
        // 允许的方法
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        
        // 允许的头
        configuration.setAllowedHeaders(Arrays.asList("*"));
        
        // 允许携带凭证
        configuration.setAllowCredentials(true);
        
        // 暴露的响应头
        configuration.setExposedHeaders(Arrays.asList("X-Total-Count"));
        
        // 预检请求缓存时间
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        
        return source;
    }
}
```

## 密码编码

```java
@Configuration
public class PasswordEncoderConfig {
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        // BCrypt（推荐）
        return new BCryptPasswordEncoder(12);  // 强度参数
        
        // 其他选项
        // Argon2（最强，但需要额外依赖）
        // return new Argon2PasswordEncoder();
        
        // SCrypt
        // return new SCryptPasswordEncoder();
        
        // PBKDF2
        // return new Pbkdf2PasswordEncoder();
        
        // 不推荐：MD5、SHA等哈希（不安全）
        // return new MessageDigestPasswordEncoder("SHA-256");
    }
}

@Service
public class UserService {
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private UserRepository userRepository;
    
    public User createUser(UserRequest request) {
        User user = new User();
        user.setUsername(request.getUsername());
        // 加密密码
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        return userRepository.save(user);
    }
    
    public boolean checkPassword(User user, String rawPassword) {
        return passwordEncoder.matches(rawPassword, user.getPassword());
    }
    
    public void changePassword(User user, String newPassword) {
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
```

## 安全最佳实践

### 输入验证

```java
@RestController
public class UserController {
    
    @PostMapping("/users")
    public User createUser(@Valid @RequestBody UserRequest request) {
        // 使用@Valid进行参数校验
        return userService.createUser(request);
    }
}

public class UserRequest {
    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 50, message = "用户名长度3-50")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "用户名只能包含字母数字下划线")
    private String username;
    
    @NotBlank(message = "密码不能为空")
    @Size(min = 8, max = 100, message = "密码长度8-100")
    @Pattern(regexp = ".*[A-Z].*", message = "密码必须包含大写字母")
    @Pattern(regexp = ".*[a-z].*", message = "密码必须包含小写字母")
    @Pattern(regexp = ".*[0-9].*", message = "密码必须包含数字")
    private String password;
    
    @Email(message = "邮箱格式不正确")
    private String email;
}
```

### 防止SQL注入

```java
@Repository
public class UserRepository {
    
    // 使用JPA/Hibernate的命名查询（安全）
    @Query("SELECT u FROM User u WHERE u.username = :username")
    Optional<User> findByUsername(@Param("username") String username);
    
    // 使用Criteria API（安全）
    public User findByEmailCriteria(String email) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<User> query = cb.createQuery(User.class);
        Root<User> root = query.from(User.class);
        
        query.select(root).where(cb.equal(root.get("email"), email));
        
        return entityManager.createQuery(query).getSingleResult();
    }
    
    // 危险：直接拼接SQL（不要这样做）
    // public User findByUsernameUnsafe(String username) {
    //     String sql = "SELECT * FROM users WHERE username = '" + username + "'";
    //     // SQL注入风险！
    // }
}
```

### 敏感数据保护

```java
@Entity
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String username;
    
    // 不存储明文密码
    @Column(name = "password_hash")
    private String password;
    
    // 加密存储敏感信息
    @Column(name = "credit_card")
    @Convert(converter = CreditCardEncryptor.class)
    private String creditCard;
    
    // 不记录敏感日志
    // toString()中排除敏感字段
    @Override
    public String toString() {
        return "User{id=" + id + ", username='" + username + "'}";
    }
}

public class CreditCardEncryptor implements AttributeConverter<String, String> {
    
    @Autowired
    private EncryptionService encryptionService;
    
    @Override
    public String convertToDatabaseColumn(String attribute) {
        return encryptionService.encrypt(attribute);
    }
    
    @Override
    public String convertToEntityAttribute(String dbData) {
        return encryptionService.decrypt(dbData);
    }
}
```

## 总结

Spring Security提供了全面的安全解决方案，从认证授权到CSRF防护、密码编码等各个方面。本文详细介绍了Spring Security的核心架构、认证机制、JWT集成、OAuth2配置、方法级安全和安全最佳实践。

在实际应用中，建议遵循以下原则：

1. 默认拒绝访问，只开放必要的资源
2. 使用强密码编码器，如BCrypt
3. 无状态API使用JWT，有状态应用使用Session
4. 启用CSRF防护，除非是无状态API
5. 定期更新依赖，修复安全漏洞
6. 对敏感数据进行加密存储
7. 记录安全日志，便于审计和问题排查

安全性是一个持续的过程，需要开发者时刻保持警惕，及时更新知识，应对新的安全威胁。

## 参考资料

- Spring Security官方文档
- 《Spring Security实战》 - 陈旭
- OAuth2规范文档
- JWT最佳实践指南