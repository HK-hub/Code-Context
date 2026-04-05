---
title: Spring Boot自动配置原理
date: 2025-03-28T00:00:00.000Z
categories:
  - backend
  - spring-boot
tags:
  - Spring Boot
  - 自动配置
  - 源码分析
  - 条件注解
  - Spring原理
description: 深入剖析Spring Boot自动配置原理、条件注解机制、启动流程与核心组件
author: HK意境
---

# Spring Boot自动配置原理

## 引言

Spring Boot最吸引人的特性莫过于自动配置。只需引入相关依赖，Spring Boot就能自动配置好所需的各种组件，开发者无需编写繁琐的XML配置或Java配置类。这种"约定优于配置"的理念极大地简化了Spring应用的搭建和开发过程。

然而，理解自动配置的原理对于深入掌握Spring Boot至关重要。当自动配置不符合预期时，开发者需要知道如何排查问题、如何覆盖默认配置、如何自定义自动配置。本文将从Spring Boot的启动流程入手，深入剖析自动配置的实现原理，包括条件注解机制、自动配置类加载、配置覆盖等内容。

## Spring Boot启动流程

### SpringApplication初始化

Spring Boot应用的启动从SpringApplication类开始：

```java
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}

// SpringApplication.run()内部调用
public static ConfigurableApplicationContext run(Class<?> primarySource, String... args) {
    return run(new Class<?>[] { primarySource }, args);
}

public static ConfigurableApplicationContext run(Class<?>[] primarySources, String[] args) {
    return new SpringApplication(primarySources)
        .run(args);
}
```

SpringApplication构造过程：

```java
public SpringApplication(Class<?>... primarySources) {
    this.primarySources = new LinkedHashSet<>(Arrays.asList(primarySources));
    
    // 1. 判断应用类型（Servlet/Reactive/None）
    this.webApplicationType = WebApplicationType.deduceFromClasspath();
    
    // 2. 加载BootstrapRegistryInitializer
    this.bootstrapRegistryInitializers = getBootstrapRegistryInitializersFromSpringFactories();
    
    // 3. 加载ApplicationContextInitializer
    setInitializers((Collection) getSpringFactoriesInstances(ApplicationContextInitializer.class));
    
    // 4. 加载ApplicationListener
    setListeners((Collection) getSpringFactoriesInstances(ApplicationListener.class));
    
    // 5. 推断主类
    this.mainApplicationClass = deduceMainApplicationClass();
}

// 判断应用类型
static WebApplicationType deduceFromClasspath() {
    if (ClassUtils.isPresent("org.springframework.web.reactive.DispatcherHandler", null)
        && !ClassUtils.isPresent("org.springframework.web.servlet.DispatcherServlet", null)) {
        return WebApplicationType.REACTIVE;  // WebFlux应用
    }
    for (String className : SERVLET_INDICATOR_CLASSES) {
        if (!ClassUtils.isPresent(className, null)) {
            return WebApplicationType.NONE;  // 非Web应用
        }
    }
    return WebApplicationType.SERVLET;  // Servlet Web应用
}
```

### run方法执行流程

```java
public ConfigurableApplicationContext run(String... args) {
    long startTime = System.nanoTime();
    
    // 1. 创建BootstrapContext
    DefaultBootstrapContext bootstrapContext = createBootstrapContext();
    
    // 2. 获取SpringApplicationRunListeners
    SpringApplicationRunListeners listeners = getRunListeners(args);
    listeners.starting(bootstrapContext, this.mainApplicationClass);
    
    try {
        // 3. 解析应用参数
        ApplicationArguments applicationArguments = new DefaultApplicationArguments(args);
        
        // 4. 准备环境
        ConfigurableEnvironment environment = prepareEnvironment(listeners, bootstrapContext, applicationArguments);
        
        // 5. 打印Banner
        Banner printedBanner = printBanner(environment);
        
        // 6. 创建ApplicationContext
        context = createApplicationContext();
        
        // 7. 准备Context
        prepareContext(bootstrapContext, context, listeners, applicationArguments, printedBanner);
        
        // 8. 刷新Context（核心步骤）
        refreshContext(context);
        
        // 9. 刷新后处理
        afterRefresh(context, applicationArguments);
        
        listeners.finished(context, null);
        
        return context;
    } catch (Throwable ex) {
        // 异常处理
        handleRunFailure(context, ex, listeners);
        throw new IllegalStateException(ex);
    }
}
```

### ApplicationContext创建

```java
protected ConfigurableApplicationContext createApplicationContext() {
    return this.applicationContextFactory.create(this.webApplicationType);
}

// 根据应用类型创建不同的Context
public static final String DEFAULT_CONTEXT_CLASS = "org.springframework.context.support.GenericApplicationContext";
public static final String DEFAULT_SERVLET_WEB_CONTEXT_CLASS = "org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext";
public static final String DEFAULT_REACTIVE_WEB_CONTEXT_CLASS = "org.springframework.boot.web.reactive.context.ReactiveWebServerApplicationContext";

protected ConfigurableApplicationContext createApplicationContext() {
    Class<?> contextClass = this.contextClass;
    if (contextClass == null) {
        switch (this.webApplicationType) {
            case SERVLET:
                contextClass = DEFAULT_SERVLET_WEB_CONTEXT_CLASS;
                break;
            case REACTIVE:
                contextClass = DEFAULT_REACTIVE_WEB_CONTEXT_CLASS;
                break;
            default:
                contextClass = DEFAULT_CONTEXT_CLASS;
        }
    }
    return (ConfigurableApplicationContext) BeanUtils.instantiateClass(contextClass);
}
```

### Context刷新过程

```java
// AbstractApplicationContext.refresh()
public void refresh() throws BeansException, IllegalStateException {
    synchronized (this.startupShutdownMonitor) {
        StartupStep contextRefresh = this.applicationStartup.start("spring.context.refresh");
        
        // 1. 准备刷新
        prepareRefresh();
        
        // 2. 获取BeanFactory
        ConfigurableListableBeanFactory beanFactory = obtainFreshBeanFactory();
        
        // 3. 准备BeanFactory
        prepareBeanFactory(beanFactory);
        
        try {
            // 4. BeanFactory后处理
            postProcessBeanFactory(beanFactory);
            
            StartupStep beanPostProcess = this.applicationStartup.start("spring.context.beans.post-process");
            
            // 5. 执行BeanFactoryPostProcessor
            invokeBeanFactoryPostProcessors(beanFactory);
            
            // 6. 注册BeanPostProcessor
            registerBeanPostProcessors(beanFactory);
            
            beanPostProcess.end();
            
            // 7. 初始化消息源
            initMessageSource();
            
            // 8. 初始化事件广播器
            initApplicationEventMulticaster();
            
            // 9. 初始化其他特殊Bean
            onRefresh();
            
            // 10. 注册监听器
            registerListeners();
            
            // 11. 完成所有单例Bean初始化
            finishBeanFactoryInitialization(beanFactory);
            
            // 12. 完成刷新
            finishRefresh();
            
        } catch (BeansException ex) {
            // 异常处理
            destroyBeans();
            cancelRefresh(ex);
            throw ex;
        }
    }
}
```

## @SpringBootApplication注解解析

### 注解结构

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
@SpringBootConfiguration      // 配置类注解
@EnableAutoConfiguration      // 启用自动配置
@ComponentScan(               // 组件扫描
    excludeFilters = {
        @Filter(type = FilterType.CUSTOM, classes = TypeExcludeFilter.class),
        @Filter(type = FilterType.CUSTOM, classes = AutoConfigurationExcludeFilter.class)
    }
)
public @interface SpringBootApplication {
    
    // 排除特定的自动配置类
    @AliasFor(annotation = EnableAutoConfiguration.class)
    Class<?>[] exclude() default {};
    
    // 排除特定的自动配置类名
    @AliasFor(annotation = EnableAutoConfiguration.class)
    String[] excludeName() default {};
    
    // 组件扫描的基础包
    @AliasFor(annotation = ComponentScan.class, attribute = "basePackages")
    String[] scanBasePackages() default {};
    
    // 组件扫描的基础类
    @AliasFor(annotation = ComponentScan.class, attribute = "basePackageClasses")
    Class<?>[] scanBasePackageClasses() default {};
}
```

### @EnableAutoConfiguration解析

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
@AutoConfigurationPackage      // 自动配置包
@Import(AutoConfigurationImportSelector.class)  // 导入自动配置选择器
public @interface EnableAutoConfiguration {
    
    String ENABLED_OVERRIDE_PROPERTY = "spring.boot.enableautoconfiguration";
    
    Class<?>[] exclude() default {};
    
    String[] excludeName() default {};
}
```

### AutoConfigurationImportSelector

```java
public class AutoConfigurationImportSelector implements DeferredImportSelector, 
    BeanClassLoaderAware, BeanFactoryAware, EnvironmentAware, ResourceLoaderAware {
    
    @Override
    public String[] selectImports(AnnotationMetadata annotationMetadata) {
        if (!isEnabled(annotationMetadata)) {
            return NO_IMPORTS;
        }
        
        // 获取自动配置条目
        AutoConfigurationEntry autoConfigurationEntry = 
            getAutoConfigurationEntry(annotationMetadata);
        
        return StringUtils.toStringArray(autoConfigurationEntry.getConfigurations());
    }
    
    protected AutoConfigurationEntry getAutoConfigurationEntry(AnnotationMetadata annotationMetadata) {
        if (!isEnabled(annotationMetadata)) {
            return EMPTY_ENTRY;
        }
        
        // 1. 获取注解属性
        AnnotationAttributes attributes = getAttributes(annotationMetadata);
        
        // 2. 获取候选配置类
        List<String> configurations = getCandidateConfigurations(annotationMetadata, attributes);
        
        // 3. 去除重复
        configurations = removeDuplicates(configurations);
        
        // 4. 获取排除配置
        Set<String> exclusions = getExclusions(annotationMetadata, attributes);
        
        // 5. 检查排除类是否存在
        checkExcludedClasses(configurations, exclusions);
        
        // 6. 应用排除
        configurations.removeAll(exclusions);
        
        // 7. 过滤配置（条件注解过滤）
        configurations = getConfigurationClassFilter().filter(configurations);
        
        // 8. 触发自动配置导入事件
        fireAutoConfigurationImportEvents(configurations, exclusions);
        
        return new AutoConfigurationEntry(configurations, exclusions);
    }
    
    // 获取候选配置类（核心方法）
    protected List<String> getCandidateConfigurations(AnnotationMetadata metadata, AnnotationAttributes attributes) {
        // 使用SpringFactoriesLoader加载
        List<String> configurations = SpringFactoriesLoader.loadFactoryNames(
            getSpringFactoriesLoaderFactoryClass(), 
            getBeanClassLoader()
        );
        
        Assert.notEmpty(configurations, 
            "No auto configuration classes found in META-INF/spring.factories.");
        
        return configurations;
    }
}
```

## Spring Factories机制

### spring.factories文件

Spring Boot通过SpringFactoriesLoader从META-INF/spring.factories文件加载自动配置类：

```properties
# META-INF/spring.factories示例
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
org.springframework.boot.autoconfigure.web.servlet.WebMvcAutoConfiguration,\
org.springframework.boot.autoconfigure.web.servlet.ServletWebServerFactoryAutoConfiguration,\
org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration,\
org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration,\
org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration,\
org.springframework.boot.autoconfigure.cache.CacheAutoConfiguration,\
org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration
```

### SpringFactoriesLoader实现

```java
public final class SpringFactoriesLoader {
    
    public static final String FACTORIES_RESOURCE_LOCATION = "META-INF/spring.factories";
    
    public static List<String> loadFactoryNames(Class<?> factoryType, @Nullable ClassLoader classLoader) {
        String factoryTypeName = factoryType.getName();
        
        // 加载所有spring.factories文件
        return loadSpringFactories(classLoader)
            .getOrDefault(factoryTypeName, Collections.emptyList());
    }
    
    private static Map<String, List<String>> loadSpringFactories(@Nullable ClassLoader classLoader) {
        MultiValueMap<String, String> result = cache.get(classLoader);
        if (result != null) {
            return result;
        }
        
        result = new LinkedMultiValueMap<>();
        try {
            // 扫描所有jar包中的META-INF/spring.factories
            Enumeration<URL> urls = (classLoader != null ?
                classLoader.getResources(FACTORIES_RESOURCE_LOCATION) :
                ClassLoader.getSystemResources(FACTORIES_RESOURCE_LOCATION));
            
            while (urls.hasMoreElements()) {
                URL url = urls.nextElement();
                UrlResource resource = new UrlResource(url);
                Properties properties = PropertiesLoaderUtils.loadProperties(resource);
                
                for (Map.Entry<?, ?> entry : properties.entrySet()) {
                    String factoryTypeName = ((String) entry.getKey()).trim();
                    for (String factoryImplementationName : 
                        StringUtils.commaDelimitedListToStringArray((String) entry.getValue())) {
                        result.add(factoryTypeName, factoryImplementationName.trim());
                    }
                }
            }
            
            cache.put(classLoader, result);
            return result;
        } catch (IOException ex) {
            throw new IllegalArgumentException("Unable to load factories from location [" + 
                FACTORIES_RESOURCE_LOCATION + "]", ex);
        }
    }
}
```

### Spring Boot 2.7+新机制

Spring Boot 2.7引入了新的自动配置加载机制：

```properties
# META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports
org.springframework.boot.autoconfigure.web.servlet.WebMvcAutoConfiguration
org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration
org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration
```

每个配置类单独一行，更易于维护和扩展。

## 条件注解机制

### 条件注解概述

Spring Boot通过条件注解控制自动配置类的生效时机：

```java
@Configuration
@ConditionalOnClass({ DataSource.class, EmbeddedDatabaseType.class })
@ConditionalOnMissingBean({ DataSource.class, XADataSource.class })
@ConditionalOnProperty(prefix = "spring.datasource", name = "type")
@EnableConfigurationProperties(DataSourceProperties.class)
public class DataSourceAutoConfiguration {
    
    @Bean
    @ConditionalOnMissingBean
    public DataSource dataSource(DataSourceProperties properties) {
        return properties.initializeDataSourceBuilder().build();
    }
}
```

### 核心条件注解

**@Conditional**

最基础的条件注解，自定义条件判断：

```java
@Target({ ElementType.TYPE, ElementType.METHOD })
@Retention(RetentionPolicy.RUNTIME)
public @interface Conditional {
    Class<? ex
