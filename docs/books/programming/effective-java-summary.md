---
title: 《Effective Java》核心要点：构建高质量Java代码
date: 2025-02-22T00:00:00.000Z
categories:
  - books
  - programming
tags:
  - Java
  - Effective Java
  - 编程规范
  - 最佳实践
description: 总结《Effective Java》核心要点，涵盖对象创建、方法设计、泛型、并发等关键主题，提升Java编程水平
author: HK意境
---

# 《Effective Java》核心要点：构建高质量Java代码

《Effective Java》被誉为Java程序员必读经典。本文提炼书中核心要点，助你写出更优雅、更高效的代码。

## 一、创建和销毁对象

### 1.1 用静态工厂方法代替构造器

```java
public class User {
    private String name;
    
    // 私有构造器
    private User(String name) {
        this.name = name;
    }
    
    // 静态工厂方法
    public static User of(String name) {
        return new User(name);
    }
    
    public static User defaultUser() {
        return new User("Guest");
    }
}
```

**优势**：
- 有名称，更易理解
- 不必每次创建新对象
- 可以返回子类型

### 1.2 遇到多个构造器参数时考虑Builder模式

```java
public class NutritionFacts {
    private final int servingSize;
    private final int servings;
    private final int calories;
    private final int fat;
    
    public static class Builder {
        private final int servingSize;
        private final int servings;
        private int calories = 0;
        private int fat = 0;
        
        public Builder(int servingSize, int servings) {
            this.servingSize = servingSize;
            this.servings = servings;
        }
        
        public Builder calories(int val) {
            calories = val;
            return this;
        }
        
        public Builder fat(int val) {
            fat = val;
            return this;
        }
        
        public NutritionFacts build() {
            return new NutritionFacts(this);
        }
    }
    
    private NutritionFacts(Builder builder) {
        servingSize = builder.servingSize;
        servings = builder.servings;
        calories = builder.calories;
        fat = builder.fat;
    }
}

// 使用
NutritionFacts cocaCola = new NutritionFacts.Builder(240, 8)
    .calories(100).fat(0).build();
```

### 1.3 避免创建不必要的对象

```java
// 不推荐：每次创建新对象
String s = new String("hello");  

// 推荐：使用字符串常量
String s = "hello";

// 推荐：重用对象
static final Pattern ROMAN = Pattern.compile("...");

boolean isRomanNumeral(String s) {
    return ROMAN.matcher(s).matches();
}
```

## 二、方法设计

### 2.1 检查参数有效性

```java
public BigInteger mod(BigInteger m) {
    if (m.signum() <= 0)
        throw new ArithmeticException("Modulus <= 0: " + m);
    // 计算逻辑
}
```

### 2.2 慎用重载

```java
// 错误示例：重载导致歧义
public void print(Set<Integer> set) { }
public void print(Set<String> set) { }

// 编译器无法区分，运行时错误
```

### 2.3 返回零长度的数组或集合，而不是null

```java
// 不推荐
public List<Cheese> getCheeses() {
    return cheesesInStock.isEmpty() ? null : new ArrayList<>(cheesesInStock);
}

// 推荐
public List<Cheese> getCheeses() {
    return new ArrayList<>(cheesesInStock);  // 空集合而非null
}

// 更好：返回不可变空集合
public List<Cheese> getCheeses() {
    return cheesesInStock.isEmpty() ? Collections.emptyList() : new ArrayList<>(cheesesInStock);
}
```

## 三、泛型

### 3.1 不要在新代码中使用原生态类型

```java
// 不推荐：原生态类型
List list = new ArrayList();

// 推荐：泛型
List<String> list = new ArrayList<>();
```

### 3.2 优先考虑泛型方法

```java
public static <E> Set<E> union(Set<E> s1, Set<E> s2) {
    Set<E> result = new HashSet<>(s1);
    result.addAll(s2);
    return result;
}
```

### 3.3 优先考虑泛型

```java
public class Stack<E> {
    private E[] elements;
    private int size = 0;
    
    @SuppressWarnings("unchecked")
    public Stack() {
        elements = (E[]) new Object[10];
    }
    
    public void push(E e) {
        elements[size++] = e;
    }
    
    public E pop() {
        return elements[--size];
    }
}
```

## 四、枚举

### 4.1 用enum代替int常量

```java
// 不推荐
public static final int APPLE_FUJI = 0;
public static final int APPLE_PIPPIN = 1;

// 推荐
public enum Apple { FUJI, PIPPIN, GRANNY_SMITH }

// 带方法和字段的枚举
public enum Planet {
    MERCURY(3.302e+23, 2.439e6),
    VENUS(4.869e+24, 6.052e6);
    
    private final double mass;
    private final double radius;
    
    Planet(double mass, double radius) {
        this.mass = mass;
        this.radius = radius;
    }
    
    public double surfaceGravity() {
        return 6.67e-11 * mass / (radius * radius);
    }
}
```

### 4.2 用实例域代替序数

```java
// 不推荐
public enum Ensemble {
    SOLO, DUET, TRIO;
    
    public int numberOfMusicians() {
        return ordinal() + 1;  // 脆弱
    }
}

// 推荐
public enum Ensemble {
    SOLO(1), DUET(2), TRIO(3);
    
    private final int numberOfMusicians;
    
    Ensemble(int size) {
        this.numberOfMusicians = size;
    }
    
    public int numberOfMusicians() {
        return numberOfMusicians;
    }
}
```

## 五、并发

### 5.1 同步访问共享的可变数据

```java
// 不推荐：可能死循环
private static boolean stopRequested;

public static void main(String[] args) throws InterruptedException {
    Thread backgroundThread = new Thread(() -> {
        int i = 0;
        while (!stopRequested)
            i++;
    });
    backgroundThread.start();
    TimeUnit.SECONDS.sleep(1);
    stopRequested = true;
}

// 推荐：使用synchronized
private static boolean stopRequested;

private static synchronized void requestStop() {
    stopRequested = true;
}

private static synchronized boolean stopRequested() {
    return stopRequested;
}

// 更好：使用volatile
private static volatile boolean stopRequested;
```

### 5.2 避免过度同步

```java
// 不推荐：在同步块中调用外来方法
synchronized (listeners) {
    for (Observer listener : listeners)
        listener.observe(event);  // 可能导致死锁
}

// 推荐：复制一份再调用
Set<Observer> snapshot = null;
synchronized (listeners) {
    snapshot = new HashSet<>(listeners);
}
for (Observer listener : snapshot)
    listener.observe(event);
```

## 六、异常

### 6.1 只针对异常的情况才使用异常

```java
// 不推荐：用异常控制流程
try {
    int i = 0;
    while (true)
        range[i++].climb();
} catch (ArrayIndexOutOfBoundsException e) {
}

// 推荐：标准方式
for (Mountain m : range)
    m.climb();
```

### 6.2 优先使用标准的异常

| 异常 | 使用场景 |
|------|---------|
| IllegalArgumentException | 非null参数值不合适 |
| IllegalStateException | 对象状态不适合方法调用 |
| NullPointerException | null参数值不允许 |
| IndexOutOfBoundsException | 下标参数越界 |
| UnsupportedOperationException | 对象不支持方法 |

## 七、总结

《Effective Java》提供了编写高质量Java代码的90条规则。核心思想：

1. **对象管理**：合理创建和销毁对象
2. **方法设计**：清晰的签名和行为
3. **泛型使用**：类型安全
4. **并发控制**：正确同步
5. **异常处理**：合理使用异常

记住：**代码质量不在于多，而在于精**。

---

**相关阅读**：
- [《Java并发编程实战》笔记](/books/programming/java-concurrency-in-practice)
- [《Clean Code》总结](/books/programming/clean-code-summary)