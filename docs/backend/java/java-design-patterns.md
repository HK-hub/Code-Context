---
title: Java设计模式实践
date: 2025-03-12
categories: [backend, java]
tags: [Java, 设计模式, 面向对象, 架构设计, 代码重构]
description: 深入讲解23种设计模式及其在Java开发中的实际应用，包含丰富的代码示例和最佳实践
---

# Java设计模式实践

## 引言

设计模式是软件开发人员在软件开发过程中面临的一般问题的解决方案。这些解决方案是众多软件开发人员经过相当长的一段时间的试验和错误总结出来的。使用设计模式是为了重用代码、让代码更容易被他人理解、保证代码可靠性。

1994年，Erich Gamma、Richard Helm、Ralph Johnson和John Vlissides四人合著出版了《设计模式：可复用面向对象软件的基础》一书，该书首次系统地介绍了23种设计模式，这四人被称为"四人组"（GoF）。时至今日，设计模式已成为面向对象软件开发的基石。

本文将深入探讨23种设计模式，将其分为创建型、结构型和行为型三大类，通过丰富的Java代码示例展示每种模式的应用场景和实现方式。

## 设计模式原则

在深入设计模式之前，我们需要理解面向对象设计的基本原则——SOLID原则。

### 单一职责原则

一个类应该只有一个引起它变化的原因。简单来说，一个类只负责一项职责。

```java
// 违反单一职责原则
public class User {
    public void login() { /* 登录逻辑 */ }
    public void register() { /* 注册逻辑 */ }
    public void sendEmail() { /* 发送邮件 */ }
    public void generateReport() { /* 生成报告 */ }
}

// 遵循单一职责原则
public class UserAuth {
    public void login() { /* 登录逻辑 */ }
    public void register() { /* 注册逻辑 */ }
}

public class EmailService {
    public void sendEmail() { /* 发送邮件 */ }
}

public class ReportGenerator {
    public void generateReport() { /* 生成报告 */ }
}
```

### 开闭原则

软件实体应该对扩展开放，对修改关闭。即在不修改现有代码的情况下，通过扩展来增加新功能。

```java
// 违反开闭原则
public class AreaCalculator {
    public double calculateArea(Object shape) {
        if (shape instanceof Circle) {
            Circle circle = (Circle) shape;
            return Math.PI * circle.getRadius() * circle.getRadius();
        } else if (shape instanceof Rectangle) {
            Rectangle rectangle = (Rectangle) shape;
            return rectangle.getWidth() * rectangle.getHeight();
        }
        return 0;
    }
}

// 遵循开闭原则
public interface Shape {
    double calculateArea();
}

public class Circle implements Shape {
    private double radius;
    
    @Override
    public double calculateArea() {
        return Math.PI * radius * radius;
    }
}

public class Rectangle implements Shape {
    private double width;
    private double height;
    
    @Override
    public double calculateArea() {
        return width * height;
    }
}

// 新增形状只需实现Shape接口，无需修改现有代码
public class Triangle implements Shape {
    private double base;
    private double height;
    
    @Override
    public double calculateArea() {
        return 0.5 * base * height;
    }
}
```

### 里氏替换原则

所有引用基类的地方必须能透明地使用其子类的对象。子类可以扩展父类的功能，但不能改变父类原有的功能。

```java
// 违反里氏替换原则
public class Bird {
    public void fly() { /* 飞行 */ }
}

public class Penguin extends Bird {
    @Override
    public void fly() {
        throw new UnsupportedOperationException("Penguins cannot fly");
    }
}

// 遵循里氏替换原则
public interface Bird {
    void move();
}

public class FlyingBird implements Bird {
    @Override
    public void move() {
        fly();
    }
    
    protected void fly() { /* 飞行 */ }
}

public class Penguin implements Bird {
    @Override
    public void move() {
        walk();
    }
    
    private void walk() { /* 行走 */ }
}
```

### 接口隔离原则

客户端不应该依赖它不需要的接口。一个类对另一个类的依赖应该建立在最小的接口上。

```java
// 违反接口隔离原则
public interface Worker {
    void work();
    void eat();
    void sleep();
}

public class Robot implements Worker {
    @Override
    public void work() { /* 工作 */ }
    
    @Override
    public void eat() {
        throw new UnsupportedOperationException("Robots don't eat");
    }
    
    @Override
    public void sleep() {
        throw new UnsupportedOperationException("Robots don't sleep");
    }
}

// 遵循接口隔离原则
public interface Workable {
    void work();
}

public interface Feedable {
    void eat();
}

public interface Sleepable {
    void sleep();
}

public class HumanWorker implements Workable, Feedable, Sleepable {
    @Override
    public void work() { /* 工作 */ }
    
    @Override
    public void eat() { /* 吃饭 */ }
    
    @Override
    public void sleep() { /* 睡觉 */ }
}

public class RobotWorker implements Workable {
    @Override
    public void work() { /* 工作 */ }
}
```

### 依赖倒置原则

高层模块不应该依赖低层模块，两者都应该依赖其抽象。抽象不应该依赖细节，细节应该依赖抽象。

```java
// 违反依赖倒置原则
public class Notification {
    private EmailSender emailSender;
    
    public Notification() {
        this.emailSender = new EmailSender();  // 直接依赖具体实现
    }
    
    public void send(String message) {
        emailSender.sendEmail(message);
    }
}

// 遵循依赖倒置原则
public interface MessageSender {
    void send(String message);
}

public class EmailSender implements MessageSender {
    @Override
    public void send(String message) {
        System.out.println("Sending email: " + message);
    }
}

public class SmsSender implements MessageSender {
    @Override
    public void send(String message) {
        System.out.println("Sending SMS: " + message);
    }
}

public class Notification {
    private MessageSender sender;
    
    // 依赖注入
    public Notification(MessageSender sender) {
        this.sender = sender;
    }
    
    public void send(String message) {
        sender.send(message);
    }
}
```

## 创建型模式

### 单例模式

单例模式确保一个类只有一个实例，并提供一个全局访问点。

```java
// 饿汉式（线程安全，立即加载）
public class EagerSingleton {
    private static final EagerSingleton INSTANCE = new EagerSingleton();
    
    private EagerSingleton() {}
    
    public static EagerSingleton getInstance() {
        return INSTANCE;
    }
}

// 懒汉式（延迟加载，线程不安全）
public class LazySingleton {
    private static LazySingleton instance;
    
    private LazySingleton() {}
    
    public static LazySingleton getInstance() {
        if (instance == null) {
            instance = new LazySingleton();
        }
        return instance;
    }
}

// 双重检查锁定（线程安全，延迟加载）
public class DoubleCheckedLockingSingleton {
    private static volatile DoubleCheckedLockingSingleton instance;
    
    private DoubleCheckedLockingSingleton() {}
    
    public static DoubleCheckedLockingSingleton getInstance() {
        if (instance == null) {
            synchronized (DoubleCheckedLockingSingleton.class) {
                if (instance == null) {
                    instance = new DoubleCheckedLockingSingleton();
                }
            }
        }
        return instance;
    }
}

// 静态内部类（推荐方式）
public class StaticInnerClassSingleton {
    private StaticInnerClassSingleton() {}
    
    private static class SingletonHolder {
        private static final StaticInnerClassSingleton INSTANCE = 
            new StaticInnerClassSingleton();
    }
    
    public static StaticInnerClassSingleton getInstance() {
        return SingletonHolder.INSTANCE;
    }
}

// 枚举（最安全的方式，防止反射攻击和序列化问题）
public enum EnumSingleton {
    INSTANCE;
    
    public void doSomething() {
        System.out.println("Singleton working");
    }
}
```

### 工厂方法模式

工厂方法模式定义一个创建对象的接口，让子类决定实例化哪一个类。

```java
// 产品接口
public interface Product {
    void use();
}

// 具体产品A
public class ConcreteProductA implements Product {
    @Override
    public void use() {
        System.out.println("Using Product A");
    }
}

// 具体产品B
public class ConcreteProductB implements Product {
    @Override
    public void use() {
        System.out.println("Using Product B");
    }
}

// 工厂接口
public interface Factory {
    Product createProduct();
}

// 具体工厂A
public class ConcreteFactoryA implements Factory {
    @Override
    public Product createProduct() {
        return new ConcreteProductA();
    }
}

// 具体工厂B
public class ConcreteFactoryB implements Factory {
    @Override
    public Product createProduct() {
        return new ConcreteProductB();
    }
}

// 客户端使用
public class Client {
    public static void main(String[] args) {
        Factory factoryA = new ConcreteFactoryA();
        Product productA = factoryA.createProduct();
        productA.use();
        
        Factory factoryB = new ConcreteFactoryB();
        Product productB = factoryB.createProduct();
        productB.use();
    }
}
```

### 抽象工厂模式

抽象工厂模式提供一个创建一系列相关或相互依赖对象的接口，而无需指定它们具体的类。

```java
// 产品族：按钮和文本框
public interface Button {
    void click();
}

public interface TextBox {
    void input();
}

// Windows产品族
public class WindowsButton implements Button {
    @Override
    public void click() {
        System.out.println("Windows Button clicked");
    }
}

public class WindowsTextBox implements TextBox {
    @Override
    public void input() {
        System.out.println("Windows TextBox input");
    }
}

// Mac产品族
public class MacButton implements Button {
    @Override
    public void click() {
        System.out.println("Mac Button clicked");
    }
}

public class MacTextBox implements TextBox {
    @Override
    public void input() {
        System.out.println("Mac TextBox input");
    }
}

// 抽象工厂
public interface GUIFactory {
    Button createButton();
    TextBox createTextBox();
}

// Windows工厂
public class WindowsFactory implements GUIFactory {
    @Override
    public Button createButton() {
        return new WindowsButton();
    }
    
    @Override
    public TextBox createTextBox() {
        return new WindowsTextBox();
    }
}

// Mac工厂
public class MacFactory implements GUIFactory {
    @Override
    public Button createButton() {
        return new MacButton();
    }
    
    @Override
    public TextBox createTextBox() {
        return new MacTextBox();
    }
}

// 客户端
public class Application {
    private Button button;
    private TextBox textBox;
    
    public Application(GUIFactory factory) {
        this.button = factory.createButton();
        this.textBox = factory.createTextBox();
    }
    
    public void render() {
        button.click();
        textBox.input();
    }
}
```

### 建造者模式

建造者模式将一个复杂对象的构建与它的表示分离，使得同样的构建过程可以创建不同的表示。

```java
public class Computer {
    private final String cpu;
    private final String ram;
    private final String storage;
    private final String gpu;
    private final String monitor;
    
    private Computer(Builder builder) {
        this.cpu = builder.cpu;
        this.ram = builder.ram;
        this.storage = builder.storage;
        this.gpu = builder.gpu;
        this.monitor = builder.monitor;
    }
    
    // 省略getter方法
    
    public static class Builder {
        private String cpu;
        private String ram;
        private String storage;
        private String gpu;
        private String monitor;
        
        public Builder cpu(String cpu) {
            this.cpu = cpu;
            return this;
        }
        
        public Builder ram(String ram) {
            this.ram = ram;
            return this;
        }
        
        public Builder storage(String storage) {
            this.storage = storage;
            return this;
        }
        
        public Builder gpu(String gpu) {
            this.gpu = gpu;
            return this;
        }
        
        public Builder monitor(String monitor) {
            this.monitor = monitor;
            return this;
        }
        
        public Computer build() {
            return new Computer(this);
        }
    }
}

// 使用示例
public class BuilderDemo {
    public static void main(String[] args) {
        Computer computer = new Computer.Builder()
            .cpu("Intel i9")
            .ram("32GB")
            .storage("1TB SSD")
            .gpu("RTX 4090")
            .monitor("4K Display")
            .build();
    }
}
```

### 原型模式

原型模式用原型实例指定创建对象的种类，并通过拷贝这些原型创建新的对象。

```java
// 实现Cloneable接口
public class Prototype implements Cloneable {
    private String name;
    private int age;
    private Address address;
    
    // 浅拷贝
    @Override
    protected Prototype clone() throws CloneNotSupportedException {
        return (Prototype) super.clone();
    }
    
    // 深拷贝
    public Prototype deepClone() throws CloneNotSupportedException {
        Prototype cloned = (Prototype) super.clone();
        cloned.setAddress(address.clone());
        return cloned;
    }
    
    // 省略getter/setter
}

public class Address implements Cloneable {
    private String city;
    private String street;
    
    @Override
    protected Address clone() throws CloneNotSupportedException {
        return (Address) super.clone();
    }
    
    // 省略getter/setter
}

// 原型管理器
public class PrototypeManager {
    private Map<String, Prototype> prototypes = new HashMap<>();
    
    public void addPrototype(String key, Prototype prototype) {
        prototypes.put(key, prototype);
    }
    
    public Prototype getPrototype(String key) throws CloneNotSupportedException {
        return prototypes.get(key).clone();
    }
}
```

## 结构型模式

### 适配器模式

适配器模式将一个类的接口转换成客户希望的另一个接口，使得原本由于接口不兼容而不能一起工作的类可以一起工作。

```java
// 目标接口
public interface MediaPlayer {
    void play(String filename);
}

// 被适配对象
public class AdvancedMediaPlayer {
    public void playVlc(String filename) {
        System.out.println("Playing VLC: " + filename);
    }
    
    public void playMp4(String filename) {
        System.out.println("Playing MP4: " + filename);
    }
}

// 对象适配器
public class MediaAdapter implements MediaPlayer {
    private AdvancedMediaPlayer advancedPlayer;
    
    public MediaAdapter() {
        this.advancedPlayer = new AdvancedMediaPlayer();
    }
    
    @Override
    public void play(String filename) {
        if (filename.endsWith(".vlc")) {
            advancedPlayer.playVlc(filename);
        } else if (filename.endsWith(".mp4")) {
            advancedPlayer.playMp4(filename);
        }
    }
}

// 类适配器（使用继承）
public class ClassMediaAdapter extends AdvancedMediaPlayer implements MediaPlayer {
    @Override
    public void play(String filename) {
        if (filename.endsWith(".vlc")) {
            playVlc(filename);
        } else if (filename.endsWith(".mp4")) {
            playMp4(filename);
        }
    }
}
```

### 装饰器模式

装饰器模式动态地给一个对象添加一些额外的职责。就增加功能来说，装饰器模式比生成子类更为灵活。

```java
// 组件接口
public interface Coffee {
    String getDescription();
    double getCost();
}

// 具体组件
public class SimpleCoffee implements Coffee {
    @Override
    public String getDescription() {
        return "Simple Coffee";
    }
    
    @Override
    public double getCost() {
        return 10.0;
    }
}

// 装饰器基类
public abstract class CoffeeDecorator implements Coffee {
    protected Coffee decoratedCoffee;
    
    public CoffeeDecorator(Coffee coffee) {
        this.decoratedCoffee = coffee;
    }
    
    @Override
    public String getDescription() {
        return decoratedCoffee.getDescription();
    }
    
    @Override
    public double getCost() {
        return decoratedCoffee.getCost();
    }
}

// 具体装饰器
public class MilkDecorator extends CoffeeDecorator {
    public MilkDecorator(Coffee coffee) {
        super(coffee);
    }
    
    @Override
    public String getDescription() {
        return super.getDescription() + ", Milk";
    }
    
    @Override
    public double getCost() {
        return super.getCost() + 2.0;
    }
}

public class SugarDecorator extends CoffeeDecorator {
    public SugarDecorator(Coffee coffee) {
        super(coffee);
    }
    
    @Override
    public String getDescription() {
        return super.getDescription() + ", Sugar";
    }
    
    @Override
    public double getCost() {
        return super.getCost() + 1.0;
    }
}

// 使用示例
public class DecoratorDemo {
    public static void main(String[] args) {
        Coffee coffee = new SimpleCoffee();
        coffee = new MilkDecorator(coffee);
        coffee = new SugarDecorator(coffee);
        
        System.out.println(coffee.getDescription());  // Simple Coffee, Milk, Sugar
        System.out.println(coffee.getCost());        // 13.0
    }
}
```

### 代理模式

代理模式为其他对象提供一种代理以控制对这个对象的访问。

```java
// 主题接口
public interface Image {
    void display();
}

// 真实主题
public class RealImage implements Image {
    private String filename;
    
    public RealImage(String filename) {
        this.filename = filename;
        loadFromDisk();
    }
    
    private void loadFromDisk() {
        System.out.println("Loading " + filename + " from disk");
    }
    
    @Override
    public void display() {
        System.out.println("Displaying " + filename);
    }
}

// 代理
public class ProxyImage implements Image {
    private RealImage realImage;
    private String filename;
    
    public ProxyImage(String filename) {
        this.filename = filename;
    }
    
    @Override
    public void display() {
        if (realImage == null) {
            realImage = new RealImage(filename);
        }
        realImage.display();
    }
}

// 动态代理
public class DynamicProxyDemo {
    public static void main(String[] args) {
        Image image = new RealImage("test.jpg");
        
        Image proxyImage = (Image) Proxy.newProxyInstance(
            image.getClass().getClassLoader(),
            image.getClass().getInterfaces(),
            (proxy, method, args1) -> {
                System.out.println("Before calling " + method.getName());
                Object result = method.invoke(image, args1);
                System.out.println("After calling " + method.getName());
                return result;
            }
        );
        
        proxyImage.display();
    }
}
```

## 行为型模式

### 策略模式

策略模式定义一系列算法，把它们一个个封装起来，并且使它们可相互替换。

```java
// 策略接口
public interface PaymentStrategy {
    void pay(int amount);
}

// 具体策略
public class CreditCardStrategy implements PaymentStrategy {
    private String cardNumber;
    
    public CreditCardStrategy(String cardNumber) {
        this.cardNumber = cardNumber;
    }
    
    @Override
    public void pay(int amount) {
        System.out.println("Paid " + amount + " using Credit Card");
    }
}

public class AlipayStrategy implements PaymentStrategy {
    private String email;
    
    public AlipayStrategy(String email) {
        this.email = email;
    }
    
    @Override
    public void pay(int amount) {
        System.out.println("Paid " + amount + " using Alipay");
    }
}

// 上下文
public class ShoppingCart {
    private PaymentStrategy paymentStrategy;
    
    public void setPaymentStrategy(PaymentStrategy strategy) {
        this.paymentStrategy = strategy;
    }
    
    public void checkout(int amount) {
        paymentStrategy.pay(amount);
    }
}

// 使用示例
public class StrategyDemo {
    public static void main(String[] args) {
        ShoppingCart cart = new ShoppingCart();
        
        cart.setPaymentStrategy(new CreditCardStrategy("1234-5678-9012"));
        cart.checkout(100);
        
        cart.setPaymentStrategy(new AlipayStrategy("user@example.com"));
        cart.checkout(200);
    }
}
```

### 观察者模式

观察者模式定义对象间的一种一对多的依赖关系，当一个对象的状态发生改变时，所有依赖于它的对象都得到通知并被自动更新。

```java
// 观察者接口
public interface Observer {
    void update(String message);
}

// 主题接口
public interface Subject {
    void attach(Observer observer);
    void detach(Observer observer);
    void notifyObservers();
}

// 具体主题
public class NewsPublisher implements Subject {
    private List<Observer> observers = new ArrayList<>();
    private String news;
    
    @Override
    public void attach(Observer observer) {
        observers.add(observer);
    }
    
    @Override
    public void detach(Observer observer) {
        observers.remove(observer);
    }
    
    @Override
    public void notifyObservers() {
        for (Observer observer : observers) {
            observer.update(news);
        }
    }
    
    public void publishNews(String news) {
        this.news = news;
        notifyObservers();
    }
}

// 具体观察者
public class NewsSubscriber implements Observer {
    private String name;
    
    public NewsSubscriber(String name) {
        this.name = name;
    }
    
    @Override
    public void update(String message) {
        System.out.println(name + " received news: " + message);
    }
}

// 使用示例
public class ObserverDemo {
    public static void main(String[] args) {
        NewsPublisher publisher = new NewsPublisher();
        
        publisher.attach(new NewsSubscriber("Alice"));
        publisher.attach(new NewsSubscriber("Bob"));
        
        publisher.publishNews("Java 21 released!");
    }
}
```

### 模板方法模式

模板方法模式定义一个操作中的算法的骨架，而将一些步骤延迟到子类中。

```java
// 抽象类
public abstract class DataProcessor {
    // 模板方法
    public final void process() {
        readData();
        processData();
        writeData();
    }
    
    protected abstract void readData();
    
    protected abstract void processData();
    
    protected void writeData() {
        System.out.println("Writing data to output");
    }
}

// 具体类
public class CsvDataProcessor extends DataProcessor {
    @Override
    protected void readData() {
        System.out.println("Reading CSV data");
    }
    
    @Override
    protected void processData() {
        System.out.println("Processing CSV data");
    }
}

public class JsonDataProcessor extends DataProcessor {
    @Override
    protected void readData() {
        System.out.println("Reading JSON data");
    }
    
    @Override
    protected void processData() {
        System.out.println("Processing JSON data");
    }
}
```

## 总结

设计模式是软件开发的宝贵经验总结，合理运用设计模式可以提高代码的可读性、可维护性和可扩展性。本文详细介绍了创建型、结构型和行为型三大类设计模式，通过丰富的Java代码示例展示了每种模式的应用场景。

在实际开发中，设计模式不是银弹，不应该为了使用模式而使用模式。重要的是理解每种模式解决的问题和适用场景，在实际需求中灵活运用。过度使用设计模式可能导致代码复杂度增加，反而不利于维护。设计模式应该成为开发者的工具箱，在合适的时机选择合适的工具。

## 参考资料

- 《设计模式：可复用面向对象软件的基础》 - GoF
- 《Head First设计模式》 - Eric Freeman
- 《Effective Java》 - Joshua Bloch
- Java官方文档