---
title: Java新特性解读
date: 2025-02-28
categories: [backend, java]
tags: [Java, Java新特性, Java17, Java21, 函数式编程, 并发]
description: 全面解读Java 9到Java 21的重要新特性，包括模块化、记录类、模式匹配、虚拟线程等
---

# Java新特性解读

## 引言

Java作为一门成熟的编程语言，在保持向后兼容性的同时，不断引入新特性以满足现代软件开发的需求。自Java 8引入Lambda表达式和Stream API以来，Java在函数式编程、并发编程、语法简化等方面持续进化。Java 17和Java 21作为长期支持（LTS）版本，带来了许多激动人心的新特性。

本文将全面解读从Java 9到Java 21的重要新特性，包括模块化系统、记录类、密封类、模式匹配、文本块、虚拟线程等，帮助开发者掌握现代Java开发的最佳实践。

## Java 9 模块化系统

### 模块化概述

Java 9引入了模块化系统（JPMS，Java Platform Module System），这是Java历史上最重要的架构变革之一。模块化系统通过module-info.java文件定义模块，明确声明模块的依赖和导出的包。

```java
// module-info.java
module com.example.myapp {
    requires java.sql;           // 依赖java.sql模块
    requires transitive java.logging;  // 传递依赖
    requires static java.compiler;  // 编译时依赖
    
    exports com.example.api;     // 导出包供其他模块使用
    exports com.example.internal to com.example.other;  // 限定导出
    
    uses com.example.Service;    // 声明使用服务
    provides com.example.Service with com.example.impl.ServiceImpl;  // 提供服务实现
}
```

### 模块化的优势

模块化带来了以下核心优势：

**强封装性**：模块可以明确控制哪些包对外可见，防止内部API被意外使用。未通过exports导出的包，其他模块无法访问。

**可靠的配置**：通过requires关键字明确声明依赖关系，避免类路径下的依赖冲突问题。

**更好的性能**：JVM可以优化模块加载，只加载必要的模块，减少启动时间和内存占用。

**可维护性**：模块边界强制开发者思考代码的组织结构，提高代码的可维护性。

### ServiceLoader增强

Java 9增强了ServiceLoader，支持模块化服务加载：

```java
// 定义服务接口
public interface DataService {
    String processData(String input);
}

// 服务实现
public class DefaultDataService implements DataService {
    @Override
    public String processData(String input) {
        return "Processed: " + input;
    }
}

// module-info.java
module data.module {
    exports DataService;
    provides DataService with DefaultDataService;
}

// 使用服务
public class ServiceClient {
    public static void main(String[] args) {
        ServiceLoader<DataService> loader = ServiceLoader.load(DataService.class);
        loader.stream()
            .map(ServiceLoader.Provider::get)
            .forEach(service -> System.out.println(service.processData("test")));
    }
}
```

### JShell交互式编程

Java 9引入了JShell，一个交互式的Java编程环境：

```java
// 启动JShell
// $ jshell

// 直接执行表达式
jshell> 1 + 2
$1 ==> 3

// 定义变量
jshell> int x = 10
x ==> 10

// 定义方法
jshell> int add(int a, int b) {
   ...>     return a + b;
   ...> }
|  created method add(int,int)

jshell> add(3, 5)
$2 ==> 8

// 定义类
jshell> class Person {
   ...>     String name;
   ...>     Person(String name) { this.name = name; }
   ...> }
|  created class Person

// 导入包
jshell> import java.util.stream.*

// 查看定义
jshell> /vars
jshell> /methods
jshell> /types
```

### 接口私有方法

Java 9允许接口定义私有方法，用于复用代码：

```java
public interface DataProcessor {
    
    default void process(String data) {
        validate(data);
        String transformed = transform(data);
        save(transformed);
    }
    
    private void validate(String data) {
        if (data == null || data.isEmpty()) {
            throw new IllegalArgumentException("Data cannot be empty");
        }
    }
    
    private String transform(String data) {
        return data.toUpperCase();
    }
    
    private void save(String data) {
        System.out.println("Saving: " + data);
    }
}
```

## Java 10 局部变量类型推断

### var关键字

Java 10引入了var关键字，支持局部变量类型推断：

```java
public class VarDemo {
    public static void main(String[] args) {
        // 基本类型推断
        var count = 10;              // int
        var price = 99.99;           // double
        var name = "Java";           // String
        var flag = true;             // boolean
        
        // 集合类型推断
        var list = new ArrayList<String>();  // ArrayList<String>
        var map = new HashMap<String, Integer>();  // HashMap<String, Integer>
        
        // 流操作中简化代码
        var stream = list.stream()
            .filter(s -> s.length() > 3)
            .map(String::toUpperCase);
        
        // 循环中使用
        for (var item : list) {
            System.out.println(item);
        }
        
        // try-with-resources
        try (var reader = new BufferedReader(new FileReader("test.txt"))) {
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println(line);
            }
        }
    }
}
```

### var使用限制

var有一些使用限制需要注意：

```java
public class VarLimitations {
    // 不能用于成员变量
    // var instanceVar = 10;  // 编译错误
    
    // 不能用于参数
    // public void method(var param) { }  // 编译错误
    
    // 不能用于方法返回类型
    // public var getValue() { return 10; }  // 编译错误
    
    // 必须有初始化表达式
    // var uninitialized;  // 编译错误
    
    // 不能赋值为null
    // var nullVar = null;  // 编译错误
    
    // 不能用于数组初始化
    // var array = {1, 2, 3};  // 编译错误
    
    public void demo() {
        var array = new int[]{1, 2, 3};  // 正确
        
        // Lambda表达式需要目标类型
        // var lambda = s -> s.length();  // 编译错误
        var function = (Function<String, Integer>) s -> s.length();  // 正确
    }
}
```

## Java 11 新特性

### 字符串增强

Java 11为String类添加了实用的新方法：

```java
public class StringDemo {
    public static void main(String[] args) {
        // isBlank() - 判断是否为空白
        String blank = "   ";
        System.out.println(blank.isBlank());  // true
        
        // lines() - 按行分割
        String text = "Line1\nLine2\nLine3";
        text.lines().forEach(System.out::println);
        
        // strip() - 去除首尾空白（比trim更智能）
        String unicodeSpace = "\u2000Hello\u2000";
        System.out.println(unicodeSpace.strip());  // 正确处理Unicode空白
        System.out.println(unicodeSpace.stripLeading());  // 只去除首部
        System.out.println(unicodeSpace.stripTrailing());  // 只去除尾部
        
        // repeat() - 重复字符串
        String repeated = "Java".repeat(3);
        System.out.println(repeated);  // JavaJavaJava
    }
}
```

### 文件读写增强

Java 11简化了文件读写操作：

```java
import java.nio.file.Files;
import java.nio.file.Path;

public class FileDemo {
    public static void main(String[] args) throws Exception {
        Path path = Path.of("test.txt");
        
        // 写入字符串
        Files.writeString(path, "Hello, Java 11!");
        
        // 读取字符串
        String content = Files.readString(path);
        System.out.println(content);
        
        // 写入时指定字符集
        Files.writeString(path, "中文内容", StandardCharsets.UTF_8);
        
        // 读取时指定字符集
        String chinese = Files.readString(path, StandardCharsets.UTF_8);
    }
}
```

### 集合增强

Java 11添加了将集合转换为数组的便捷方法：

```java
import java.util.List;
import java.util.Set;

public class CollectionDemo {
    public static void main(String[] args) {
        List<String> list = List.of("Java", "Python", "Go");
        
        // toArray方法可以返回指定类型的数组
        String[] array = list.toArray(String[]::new);
        
        // 之前的方式需要传入正确大小的数组
        // String[] array = list.toArray(new String[0]);
        
        // 不可变集合（Java 9引入）
        List<String> immutableList = List.of("a", "b", "c");
        Set<String> immutableSet = Set.of("a", "b", "c");
        Map<String, Integer> immutableMap = Map.of("one", 1, "two", 2);
    }
}
```

## Java 14-16 记录类与模式匹配

### 记录类（Record）

Java 14引入预览版，Java 16正式发布记录类，用于简化数据载体的定义：

```java
// 定义记录类
public record Person(String name, int age, String email) {
    // 编译器自动生成：
    // - 所有字段的private final修饰
    // - 构造方法
    // - getter方法（name(), age(), email()）
    // - equals(), hashCode(), toString()
    
    // 可以添加验证逻辑
    public Person {
        if (age < 0) {
            throw new IllegalArgumentException("Age cannot be negative");
        }
    }
    
    // 可以添加实例方法
    public boolean isAdult() {
        return age >= 18;
    }
    
    // 可以添加静态方法
    public static Person of(String name, int age) {
        return new Person(name, age, null);
    }
}

// 使用记录类
public class RecordDemo {
    public static void main(String[] args) {
        Person person = new Person("Alice", 25, "alice@example.com");
        
        // 访问字段
        System.out.println(person.name());  // Alice
        System.out.println(person.age());   // 25
        
        // 调用方法
        System.out.println(person.isAdult());  // true
        
        // equals比较
        Person person2 = new Person("Alice", 25, "alice@example.com");
        System.out.println(person.equals(person2));  // true
        
        // toString
        System.out.println(person);  // Person[name=Alice, age=25, email=alice@example.com]
        
        // 解构
        String name = person.name();
        int age = person.age();
    }
}
```

### 记录类的高级用法

```java
// 实现接口
public interface JsonSerializable {
    String toJson();
}

public record Product(String id, String name, double price) 
    implements JsonSerializable {
    @Override
    public String toJson() {
        return String.format("{\"id\":\"%s\",\"name\":\"%s\",\"price\":%.2f}", 
            id, name, price);
    }
}

// 嵌套记录
public record Order(String orderId, Customer customer, List<Item> items) {
    public record Customer(String id, String name) {}
    public record Item(String productId, int quantity, double price) {}
    
    public double totalAmount() {
        return items.stream()
            .mapToDouble(item -> item.quantity() * item.price())
            .sum();
    }
}

// 泛型记录
public record Pair<T, U>(T first, U second) {
    public Pair<T, U> swap() {
        return new Pair<>(second, first);
    }
}

// 记录作为Map键
public class RecordAsKeyDemo {
    public static void main(String[] args) {
        Map<Person, String> map = new HashMap<>();
        Person p1 = new Person("Alice", 25, "alice@example.com");
        Person p2 = new Person("Alice", 25, "alice@example.com");
        
        map.put(p1, "Value1");
        System.out.println(map.get(p2));  // Value1 (正确工作，因为equals和hashCode已实现)
    }
}
```

### instanceof模式匹配

Java 16正式引入instanceof模式匹配：

```java
public class PatternMatchingDemo {
    
    // 传统方式
    public static void oldWay(Object obj) {
        if (obj instanceof String) {
            String str = (String) obj;
            System.out.println(str.length());
        }
    }
    
    // 模式匹配
    public static void newWay(Object obj) {
        if (obj instanceof String str) {
            System.out.println(str.length());
        }
    }
    
    // 带条件的模式匹配
    public static void conditionalPattern(Object obj) {
        if (obj instanceof String str && str.length() > 5) {
            System.out.println("Long string: " + str);
        }
    }
    
    // 在方法中的应用
    public static String format(Object obj) {
        if (obj instanceof Integer num) {
            return "Integer: " + num;
        } else if (obj instanceof Double num) {
            return "Double: " + num;
        } else if (obj instanceof String str) {
            return "String: " + str;
        }
        return "Unknown";
    }
}
```

## Java 17 密封类

### 密封类概述

Java 17引入密封类（Sealed Classes），允许类声明哪些类可以继承或实现它：

```java
// 密封类定义
public sealed class Shape 
    permits Circle, Rectangle, Triangle {
    
    public abstract double area();
}

// 允许的子类必须是final、sealed或non-sealed
public final class Circle extends Shape {
    private final double radius;
    
    public Circle(double radius) {
        this.radius = radius;
    }
    
    @Override
    public double area() {
        return Math.PI * radius * radius;
    }
}

public final class Rectangle extends Shape {
    private final double width;
    private final double height;
    
    public Rectangle(double width, double height) {
        this.width = width;
        this.height = height;
    }
    
    @Override
    public double area() {
        return width * height;
    }
}

public non-sealed class Triangle extends Shape {
    // non-sealed允许进一步继承
    private final double base;
    private final double height;
    
    public Triangle(double base, double height) {
        this.base = base;
        this.height = height;
    }
    
    @Override
    public double area() {
        return 0.5 * base * height;
    }
}
```

### 密封接口

```java
// 密封接口
public sealed interface Expression 
    permits Constant, Add, Multiply, Negate {
    
    int evaluate();
}

public record Constant(int value) implements Expression {
    @Override
    public int evaluate() {
        return value;
    }
}

public record Add(Expression left, Expression right) implements Expression {
    @Override
    public int evaluate() {
        return left.evaluate() + right.evaluate();
    }
}

public record Multiply(Expression left, Expression right) implements Expression {
    @Override
    public int evaluate() {
        return left.evaluate() * right.evaluate();
    }
}

public record Negate(Expression expression) implements Expression {
    @Override
    public int evaluate() {
        return -expression.evaluate();
    }
}

// 表达式求值示例
public class ExpressionDemo {
    public static void main(String[] args) {
        // (5 + 3) * 2 - 4 = 12
        Expression expr = new Negate(
            new Multiply(
                new Add(new Constant(5), new Constant(3)),
                new Constant(2)
            )
        );
        System.out.println(expr.evaluate());  // -16
    }
}
```

## Java 21 虚拟线程

### 虚拟线程概述

虚拟线程（Virtual Threads）是Java 21最重要的新特性之一，它解决了传统平台线程的开销问题，使得创建百万级线程成为可能。虚拟线程由JVM调度，而不是操作系统，极大地降低了线程的创建和切换开销。

```java
import java.util.concurrent.Executors;

public class VirtualThreadDemo {
    public static void main(String[] args) throws Exception {
        // 创建虚拟线程
        Thread virtualThread = Thread.ofVirtual().start(() -> {
            System.out.println("Hello from virtual thread");
        });
        virtualThread.join();
        
        // 使用Executors创建虚拟线程执行器
        try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
            for (int i = 0; i < 10000; i++) {
                executor.submit(() -> {
                    Thread.sleep(1000);
                    return "Task completed";
                });
            }
        }
        
        // 创建命名的虚拟线程
        Thread namedVirtualThread = Thread.ofVirtual()
            .name("my-virtual-thread-", 0)
            .start(() -> {
                System.out.println("Thread: " + Thread.currentThread().getName());
            });
        
        // 工厂方式创建
        ThreadFactory factory = Thread.ofVirtual()
            .name("worker-", 0)
            .factory();
        Thread worker = factory.newThread(() -> System.out.println("Working..."));
        worker.start();
    }
}
```

### 虚拟线程与传统线程对比

```java
public class ThreadComparison {
    // 使用传统线程池
    public static void withPlatformThreads() throws Exception {
        try (var executor = Executors.newFixedThreadPool(100)) {
            long start = System.currentTimeMillis();
            
            var futures = new ArrayList<Future<Integer>>();
            for (int i = 0; i < 10000; i++) {
                final int num = i;
                futures.add(executor.submit(() -> {
                    Thread.sleep(100);
                    return num * 2;
                }));
            }
            
            for (var future : futures) {
                future.get();
            }
            
            System.out.println("Platform threads: " + 
                (System.currentTimeMillis() - start) + "ms");
        }
    }
    
    // 使用虚拟线程
    public static void withVirtualThreads() throws Exception {
        try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
            long start = System.currentTimeMillis();
            
            var futures = new ArrayList<Future<Integer>>();
            for (int i = 0; i < 10000; i++) {
                final int num = i;
                futures.add(executor.submit(() -> {
                    Thread.sleep(100);
                    return num * 2;
                }));
            }
            
            for (var future : futures) {
                future.get();
            }
            
            System.out.println("Virtual threads: " + 
                (System.currentTimeMillis() - start) + "ms");
        }
    }
}
```

### 虚拟线程最佳实践

```java
public class VirtualThreadBestPractices {
    
    // 正确：虚拟线程适合IO密集型任务
    public void ioIntensiveTask() {
        try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
            for (int i = 0; i < 1000; i++) {
                executor.submit(() -> {
                    // HTTP请求、数据库查询等IO操作
                    fetchDataFromDatabase();
                    callRemoteService();
                    writeFile();
                });
            }
        }
    }
    
    // 错误：虚拟线程不适合CPU密集型任务
    public void cpuIntensiveTask() {
        // CPU密集型任务应该使用传统线程池
        try (var executor = Executors.newFixedThreadPool(
            Runtime.getRuntime().availableProcessors())) {
            executor.submit(() -> {
                // 计算、加密等CPU密集型操作
                complexCalculation();
            });
        }
    }
    
    // 避免synchronized锁：使用ReentrantLock代替
    public void lockUsage() {
        // 避免：synchronized会钉住虚拟线程
        // synchronized(lock) { }
        
        // 推荐：使用ReentrantLock
        ReentrantLock lock = new ReentrantLock();
        lock.lock();
        try {
            // 临界区代码
        } finally {
            lock.unlock();
        }
    }
    
    private void fetchDataFromDatabase() { }
    private void callRemoteService() { }
    private void writeFile() { }
    private void complexCalculation() { }
}
```

### 结构化并发

Java 21引入了结构化并发（Structured Concurrency）预览特性：

```java
import java.util.concurrent.StructuredTaskScope;
import java.util.concurrent.Future;

public class StructuredConcurrencyDemo {
    
    public record User(String name, String email) {}
    public record Order(String orderId, double amount) {}
    public record Response(User user, Order order) {}
    
    // 传统方式
    public Response fetchDataTraditional() throws Exception {
        ExecutorService executor = Executors.newCachedThreadPool();
        try {
            Future<User> userFuture = executor.submit(this::fetchUser);
            Future<Order> orderFuture = executor.submit(this::fetchOrder);
            
            return new Response(userFuture.get(), orderFuture.get());
        } finally {
            executor.shutdown();
        }
    }
    
    // 结构化并发
    public Response fetchDataStructured() throws Exception {
        try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
            StructuredTaskScope.Subtask<User> userTask = 
                scope.fork(this::fetchUser);
            StructuredTaskScope.Subtask<Order> orderTask = 
                scope.fork(this::fetchOrder);
            
            scope.join();           // 等待所有任务完成
            scope.throwIfFailed();  // 如果有任务失败则抛出异常
            
            return new Response(userTask.get(), orderTask.get());
        }
    }
    
    private User fetchUser() {
        return new User("Alice", "alice@example.com");
    }
    
    private Order fetchOrder() {
        return new Order("ORD-001", 99.99);
    }
}
```

## Java 21 switch模式匹配

### switch模式匹配

Java 21正式引入switch的模式匹配：

```java
public class SwitchPatternMatchingDemo {
    
    // 传统switch
    public static String oldSwitch(Object obj) {
        String result = "";
        switch (obj.getClass().getSimpleName()) {
            case "Integer":
                result = "Integer: " + obj;
                break;
            case "String":
                result = "String: " + obj;
                break;
            default:
                result = "Unknown";
        }
        return result;
    }
    
    // 模式匹配switch
    public static String newSwitch(Object obj) {
        return switch (obj) {
            case Integer i -> "Integer: " + i;
            case String s -> "String: " + s;
            case Double d -> "Double: " + d;
            case null -> "Null value";
            default -> "Unknown: " + obj;
        };
    }
    
    // 带守卫的模式匹配
    public static String guardedPattern(Object obj) {
        return switch (obj) {
            case String s when s.length() > 5 -> "Long string: " + s;
            case String s -> "Short string: " + s;
            case Integer i when i > 0 -> "Positive: " + i;
            case Integer i when i < 0 -> "Negative: " + i;
            case Integer i -> "Zero";
            default -> "Unknown";
        };
    }
    
    // 与密封类配合使用
    public static double calculateArea(Shape shape) {
        return switch (shape) {
            case Circle c -> Math.PI * c.radius() * c.radius();
            case Rectangle r -> r.width() * r.height();
            case Triangle t -> 0.5 * t.base() * t.height();
        };
    }
    
    // 枚举模式匹配
    public static String describeDay(DayOfWeek day) {
        return switch (day) {
            case MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY -> "Weekday";
            case SATURDAY, SUNDAY -> "Weekend";
        };
    }
}

sealed interface Shape permits Circle, Rectangle, Triangle {}
record Circle(double radius) implements Shape {}
record Rectangle(double width, double height) implements Shape {}
record Triangle(double base, double height) implements Shape {}
```

## 总结

Java语言在不断演进，从Java 9的模块化系统到Java 21的虚拟线程，每次更新都带来了显著的改进。模块化系统提高了大型应用的可维护性；记录类简化了数据载体的定义；模式匹配让代码更加简洁清晰；虚拟线程则彻底改变了Java并发编程的范式。

掌握这些新特性，开发者可以编写更加简洁、高效、可维护的代码。在实际项目中，建议优先使用LTS版本（如Java 17和Java 21），以获得长期支持和稳定性。

## 参考资料

- Oracle Java Documentation
- 《Modern Java in Action》 - Raoul-Gabriel Urma
- JEP (JDK Enhancement Proposals)
- Java Language Specification