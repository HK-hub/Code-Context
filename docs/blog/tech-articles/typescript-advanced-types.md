---
title: TypeScript高级类型技巧
date: 2025-02-08T00:00:00.000Z
categories:
  - blog
  - tech-articles
tags:
  - TypeScript
  - 类型系统
  - 泛型
  - 类型体操
  - 前端工程化
description: 深入探讨TypeScript高级类型技巧，包括条件类型、映射类型、模板字面量类型等进阶特性
author: HK意境
---

# TypeScript高级类型技巧

TypeScript的类型系统是图灵完备的，这意味着我们可以在类型层面进行复杂的逻辑运算。本文将深入探讨TypeScript的高级类型技巧，帮助你编写更加类型安全的代码。

## 一、条件类型

条件类型允许我们根据类型关系进行条件判断，类似于JavaScript中的三元表达式。

### 1.1 基础语法

```typescript
type IsString<T> = T extends string ? true : false

type A = IsString<string> // true
type B = IsString<number> // false
type C = IsString<'hello'> // true
```

### 1.2 条件类型分发

当条件类型作用于联合类型时，会自动进行分发：

```typescript
type ToArray<T> = T extends any ? T[] : never

type Result = ToArray<string | number>
// 等价于 string[] | number[]
```

这种分发特性在处理联合类型时非常有用，但有时我们需要禁止分发：

```typescript
type ToArrayNoDistribute<T> = [T] extends [any] ? T[] : never

type Result = ToArrayNoDistribute<string | number>
// 结果为 (string | number)[]
```

### 1.3 实用案例

实现一个类型，提取函数的返回类型：

```typescript
type GetReturnType<T> = T extends (...args: any[]) => infer R ? R : never

function greet(): string {
  return 'hello'
}

function count(): number {
  return 42
}

type GreetReturn = GetReturnType<typeof greet> // string
type CountReturn = GetReturnType<typeof count> // number
```

## 二、infer关键字

infer关键字用于在条件类型中推断类型，它必须与extends配合使用。

### 2.1 提取数组元素类型

```typescript
type UnwrapArray<T> = T extends (infer U)[] ? U : T

type A = UnwrapArray<string[]> // string
type B = UnwrapArray<number[]> // number
type C = UnwrapArray<string> // string
```

### 2.2 提取Promise值类型

```typescript
type Awaited<T> = T extends Promise<infer U> ? Awaited<U> : T

type A = Awaited<Promise<string>> // string
type B = Awaited<Promise<Promise<number>>> // number (递归解包)
type C = Awaited<string> // string
```

### 2.3 提取函数参数类型

```typescript
type Parameters<T> = T extends (...args: infer P) => any ? P : never

function add(a: number, b: string): void {}

type AddParams = Parameters<typeof add>
// [a: number, b: string]
```

## 三、映射类型

映射类型允许我们基于现有类型创建新类型，通过keyof和in关键字遍历类型的属性。

### 3.1 基础映射类型

```typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P]
}

type Partial<T> = {
  [P in keyof T]?: T[P]
}

interface User {
  id: number
  name: string
  email: string
}

type ReadonlyUser = Readonly<User>
// { readonly id: number; readonly name: string; readonly email: string }

type PartialUser = Partial<User>
// { id?: number; name?: string; email?: string }
```

### 3.2 属性修饰符操作

我们可以使用+和-来添加或移除属性修饰符：

```typescript
type Required<T> = {
  [P in keyof T]-?: T[P]
}

interface OptionalUser {
  id?: number
  name?: string
}

type RequiredUser = Required<OptionalUser>
// { id: number; name: string }

type Mutable<T> = {
  -readonly [P in keyof T]: T[P]
}

interface ReadonlyUser {
  readonly id: number
  readonly name: string
}

type MutableUser = Mutable<ReadonlyUser>
// { id: number; name: string }
```

### 3.3 键名重映射

TypeScript 4.1引入了键名重映射功能，允许我们在映射时修改键名：

```typescript
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K]
}

interface Person {
  name: string
  age: number
}

type PersonGetters = Getters<Person>
// { getName: () => string; getAge: () => number }
```

### 3.4 值类型过滤

使用as子句可以过滤掉不需要的属性：

```typescript
type OnlyString<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K]
}

interface Mixed {
  name: string
  age: number
  active: boolean
  email: string
}

type StringProps = OnlyString<Mixed>
// { name: string; email: string }
```

## 四、模板字面量类型

TypeScript 4.1引入了模板字面量类型，允许我们对字符串类型进行操作。

### 4.1 基础语法

```typescript
type World = 'world'

type Greeting = `hello ${World}`
// "hello world"

type EmailLocale = 'en' | 'ja' | 'zh'
type LocaleMessage = `msg_${EmailLocale}`
// "msg_en" | "msg_ja" | "msg_zh"
```

### 4.2 字符串操作类型

TypeScript内置了四个字符串操作类型：

```typescript
type Uppercase<S extends string> = intrinsic // 转大写
type Lowercase<S extends string> = intrinsic // 转小写
type Capitalize<S extends string> = intrinsic // 首字母大写
type Uncapitalize<S extends string> = intrinsic // 首字母小写

type Upper = Uppercase<'hello'> // "HELLO"
type Lower = Lowercase<'HELLO'> // "hello"
type Cap = Capitalize<'hello'> // "Hello"
type Uncap = Uncapitalize<'Hello'> // "hello"
```

### 4.3 事件处理类型

```typescript
type EventName = 'click' | 'focus' | 'blur'

type EventHandler = `on${Capitalize<EventName>}`
// "onClick" | "onFocus" | "onBlur"

type Props = {
  [K in EventHandler]: () => void
}
```

### 4.4 高级模式匹配

```typescript
type Split<S extends string, D extends string> =
  S extends `${infer Head}${D}${infer Tail}`
    ? [Head, ...Split<Tail, D>]
    : S extends '' ? [] : [S]

type Result = Split<'a-b-c', '-'>
// ["a", "b", "c"]

type Join<T extends string[], D extends string> =
  T extends [infer First extends string, ...infer Rest extends string[]]
    ? Rest extends []
      ? First
      : `${First}${D}${Join<Rest, D>}`
    : ''

type Joined = Join<['a', 'b', 'c'], '-'>
// "a-b-c"
```

## 五、递归类型

递归类型允许类型引用自身，用于处理嵌套结构。

### 5.1 深层Readonly

```typescript
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? T[P] extends Function
      ? T[P]
      : DeepReadonly<T[P]>
    : T[P]
}

interface Nested {
  user: {
    profile: {
      name: string
      settings: {
        theme: string
      }
    }
  }
}

type DeepNested = DeepReadonly<Nested>
// 所有嵌套属性都变为readonly
```

### 5.2 深层Required

```typescript
type DeepRequired<T> = T extends object
  ? {
      [P in keyof T]-?: DeepRequired<T[P]>
    }
  : T

interface Optional {
  user?: {
    name?: string
    address?: {
      city?: string
    }
  }
}

type RequiredOptional = DeepRequired<Optional>
// 所有嵌套属性都变为必需
```

### 5.3 数组元素类型

```typescript
type Flatten<T> = T extends Array<infer U> ? Flatten<U> : T

type NestedArray = [1, [2, [3, 4]], 5]
type Flattened = Flatten<NestedArray>
// 1 | 2 | 3 | 4 | 5
```

## 六、类型体操实战

### 6.1 实现Pick

```typescript
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P]
}

interface Todo {
  title: string
  description: string
  completed: boolean
}

type TodoPreview = MyPick<Todo, 'title' | 'completed'>
// { title: string; completed: boolean }
```

### 6.2 实现Omit

```typescript
type MyOmit<T, K extends keyof any> = {
  [P in keyof T as P extends K ? never : P]: T[P]
}

type TodoWithoutDescription = MyOmit<Todo, 'description'>
// { title: string; completed: boolean }
```

### 6.3 实现Record

```typescript
type MyRecord<K extends keyof any, V> = {
  [P in K]: V
}

type UserRoles = MyRecord<'admin' | 'user' | 'guest', boolean>
// { admin: boolean; user: boolean; guest: boolean }
```

### 6.4 实现Exclude

```typescript
type MyExclude<T, U> = T extends U ? never : T

type Result = MyExclude<'a' | 'b' | 'c', 'a'>
// "b" | "c"
```

### 6.5 实现Extract

```typescript
type MyExtract<T, U> = T extends U ? T : never

type Result = MyExtract<'a' | 'b' | 'c', 'a' | 'd'>
// "a"
```

## 七、协变与逆变

理解协变和逆变对于处理复杂类型关系至关重要。

### 7.1 协变

协变是指类型在继承关系中保持一致的方向：

```typescript
interface Animal {
  name: string
}

interface Dog extends Animal {
  breed: string
}

// 协变示例
let animals: Animal[] = []
let dogs: Dog[] = []

animals = dogs // OK: Dog[] 是 Animal[] 的子类型
```

### 7.2 逆变

逆变发生在函数参数类型上：

```typescript
type AnimalHandler = (animal: Animal) => void
type DogHandler = (dog: Dog) => void

// 逆变：DogHandler 可以赋值给 AnimalHandler
let handler: AnimalHandler = (dog: Dog) => {
  console.log(dog.breed) // 这是安全的
}
```

### 7.3 严格函数类型

```typescript
// 在严格模式下，函数参数是双向协变的
// 这可能导致不安全的赋值
// 建议启用 strictFunctionTypes 编译选项
```

## 八、类型守卫与类型推断

### 8.1 自定义类型守卫

```typescript
interface Fish {
  swim: () => void
}

interface Bird {
  fly: () => void
}

function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined
}

function move(pet: Fish | Bird) {
  if (isFish(pet)) {
    pet.swim() // TypeScript知道pet是Fish类型
  } else {
    pet.fly() // TypeScript知道pet是Bird类型
  }
}
```

### 8.2 可辨识联合

```typescript
interface Circle {
  kind: 'circle'
  radius: number
}

interface Square {
  kind: 'square'
  sideLength: number
}

interface Triangle {
  kind: 'triangle'
  base: number
  height: number
}

type Shape = Circle | Square | Triangle

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2
    case 'square':
      return shape.sideLength ** 2
    case 'triangle':
      return (shape.base * shape.height) / 2
  }
}
```

### 8.3 satisfies操作符

TypeScript 4.9引入了satisfies操作符，用于确保表达式满足类型约束，同时保留表达式的具体类型：

```typescript
type Colors = 'red' | 'green' | 'blue'

const theme = {
  primary: 'red',
  secondary: 'green'
} satisfies Record<string, Colors>

// theme.primary 的类型是 "red"，不是 Colors
// 这比 : Record<string, Colors> 更精确
```

## 九、实际应用案例

### 9.1 类型安全的EventEmitter

```typescript
type EventMap = {
  click: { x: number; y: number }
  focus: { target: HTMLElement }
  blur: { target: HTMLElement }
}

class TypedEventEmitter<T extends Record<string, any>> {
  private listeners = new Map<keyof T, Set<Function>>()

  on<K extends keyof T>(event: K, listener: (data: T[K]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(listener)
  }

  emit<K extends keyof T>(event: K, data: T[K]) {
    this.listeners.get(event)?.forEach(listener => listener(data))
  }

  off<K extends keyof T>(event: K, listener: (data: T[K]) => void) {
    this.listeners.get(event)?.delete(listener)
  }
}

const emitter = new TypedEventEmitter<EventMap>()

emitter.on('click', (data) => {
  console.log(data.x, data.y) // 类型安全
})

emitter.emit('click', { x: 10, y: 20 })
```

### 9.2 类型安全的API客户端

```typescript
interface APIEndpoints {
  '/users': {
    GET: { response: User[] }
    POST: { body: CreateUserDTO; response: User }
  }
  '/users/:id': {
    GET: { params: { id: string }; response: User }
    PUT: { params: { id: string }; body: UpdateUserDTO; response: User }
    DELETE: { params: { id: string }; response: void }
  }
}

type Methods = 'GET' | 'POST' | 'PUT' | 'DELETE'

type EndpointFor<M extends Methods> = {
  [K in keyof APIEndpoints]: M extends keyof APIEndpoints[K] ? K : never
}[keyof APIEndpoints]

async function request<
  M extends Methods,
  E extends EndpointFor<M>
>(
  method: M,
  endpoint: E,
  options?: APIEndpoints[E][M] extends { body: any }
    ? { body: APIEndpoints[E][M]['body'] }
    : {}
): Promise<APIEndpoints[E][M]['response']> {
  // 实现...
}
```

## 十、总结

TypeScript的高级类型系统为我们提供了强大的类型编程能力。通过条件类型、映射类型、模板字面量类型等特性，我们可以：

**增强类型安全**：利用条件类型和类型守卫，在编译时捕获更多潜在错误。

**提高代码复用**：通过映射类型和工具类型，减少重复的类型定义。

**实现领域建模**：使用可辨识联合和模板字面量类型，更精确地表达业务逻辑。

**优化开发体验**：良好的类型推断和IDE支持，提升代码编写效率。

掌握这些高级类型技巧，能够帮助你编写更加健壮、可维护的TypeScript代码，充分发挥静态类型检查的优势。

## 参考资料

- TypeScript官方文档：https://www.typescriptlang.org/docs/
- TypeScript Deep Dive：https://basarat.gitbook.io/typescript/
- TypeScript类型体操练习：https://github.com/type-challenges/type-challenges
