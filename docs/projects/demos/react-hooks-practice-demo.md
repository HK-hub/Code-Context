---
title: React Hooks实践示例与模式探索
date: 2025-02-28T00:00:00.000Z
categories:
  - projects
  - demos
tags:
  - React
  - Hooks
  - 前端开发
  - 状态管理
  - 组件设计
description: 通过丰富的实践示例深入探讨React Hooks的使用模式，包括自定义Hooks设计、性能优化和最佳实践
author: HK意境
---

# React Hooks实践示例与模式探索

React Hooks彻底改变了React组件的编写方式，使函数组件拥有状态和生命周期能力。本文通过丰富的实践示例，深入探讨Hooks的使用模式和最佳实践。

## 基础Hooks实践

### useState深入理解

```typescript
// useState基础用法
import { useState } from 'react'

// 1. 基本状态
function Counter() {
  const [count, setCount] = useState(0)
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(prev => prev - 1)}>Decrement</button>
    </div>
  )
}

// 2. 对象状态
function UserProfile() {
  const [user, setUser] = useState({
    name: '',
    email: '',
    age: 0
  })
  
  const updateName = (name: string) => {
    setUser(prev => ({ ...prev, name }))
  }
  
  const updateEmail = (email: string) => {
    setUser(prev => ({ ...prev, email }))
  }
  
  return (
    <div>
      <input
        value={user.name}
        onChange={(e) => updateName(e.target.value)}
      />
      <input
        value={user.email}
        onChange={(e) => updateEmail(e.target.value)}
      />
    </div>
  )
}

// 3. 惰性初始化
function ExpensiveComponent() {
  // 初始值通过函数计算，只在首次渲染执行
  const [state, setState] = useState(() => {
    const initialState = expensiveCalculation()
    return initialState
  })
  
  return <div>{state}</div>
}
```

### useEffect使用模式

```typescript
import { useEffect, useState } from 'react'

// 1. 数据获取
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  useEffect(() => {
    let isMounted = true
    
    async function fetchUser() {
      try {
        setLoading(true)
        const response = await fetch(`/api/users/${userId}`)
        const data = await response.json()
        
        if (isMounted) {
          setUser(data)
          setError(null)
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }
    
    fetchUser()
    
    // 清理函数：防止内存泄漏
    return () => {
      isMounted = false
    }
  }, [userId]) // 依赖userId
  
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!user) return null
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  )
}

// 2. 事件监听
function WindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })
  
  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }
    
    window.addEventListener('resize', handleResize)
    
    // 清理事件监听
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, []) // 空依赖数组，只在挂载和卸载时执行
  
  return (
    <div>
      Width: {size.width}, Height: {size.height}
    </div>
  )
}

// 3. 定时器
function Timer() {
  const [seconds, setSeconds] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1)
    }, 1000)
    
    // 清理定时器
    return () => {
      clearInterval(interval)
    }
  }, [])
  
  return <div>Seconds: {seconds}</div>
}
```

### useContext应用

```typescript
import { createContext, useContext, useState, ReactNode } from 'react'

// 1. 定义Context类型
interface ThemeContextType {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

// 2. 创建Context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// 3. 创建Provider组件
function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// 4. 创建自定义Hook使用Context
function useTheme() {
  const context = useContext(ThemeContext)
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  
  return context
}

// 5. 使用Context
function ThemeButton() {
  const { theme, toggleTheme } = useTheme()
  
  return (
    <button
      onClick={toggleTheme}
      style={{
        background: theme === 'light' ? '#fff' : '#333',
        color: theme === 'light' ? '#333' : '#fff'
      }}
    >
      Current: {theme}
    </button>
  )
}

// 6. 在App中使用
function App() {
  return (
    <ThemeProvider>
      <ThemeButton />
    </ThemeProvider>
  )
}
```

## 自定义Hooks设计

### useLocalStorage

```typescript
import { useState, useEffect } from 'react'

function useLocalStorage<T>(key: string, initialValue: T) {
  // 惰性初始化
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(error)
      return initialValue
    }
  })
  
  // 同步到localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue))
    } catch (error) {
      console.error(error)
    }
  }, [key, storedValue])
  
  return [storedValue, setStoredValue] as const
}

// 使用示例
function SettingsForm() {
  const [settings, setSettings] = useLocalStorage('app-settings', {
    theme: 'light',
    language: 'zh-CN',
    notifications: true
  })
  
  return (
    <div>
      <select
        value={settings.theme}
        onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  )
}
```

### useDebounce

```typescript
import { useState, useEffect } from 'react'

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  
  return debouncedValue
}

// 使用示例
function SearchInput() {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  
  useEffect(() => {
    if (debouncedSearchTerm) {
      // 执行搜索
      searchAPI(debouncedSearchTerm)
    }
  }, [debouncedSearchTerm])
  
  return (
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search..."
    />
  )
}
```

### useFetch

```typescript
import { useState, useEffect, useCallback } from 'react'

interface FetchState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

function useFetch<T>(url: string) {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null
  })
  
  const fetchData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setState({ data, loading: false, error: null })
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error })
    }
  }, [url])
  
  useEffect(() => {
    fetchData()
  }, [fetchData])
  
  return { ...state, refetch: fetchData }
}

// 使用示例
function UserList() {
  const { data: users, loading, error, refetch } = useFetch<User[]>('/api/users')
  
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  
  return (
    <div>
      <button onClick={refetch}>Refresh</button>
      <ul>
        {users?.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  )
}
```

### usePrevious

```typescript
import { useRef, useEffect } from 'react'

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>()
  
  useEffect(() => {
    ref.current = value
  }, [value])
  
  return ref.current
}

// 使用示例
function Counter() {
  const [count, setCount] = useState(0)
  const prevCount = usePrevious(count)
  
  return (
    <div>
      <p>Current: {count}</p>
      <p>Previous: {prevCount}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  )
}
```

## 性能优化Hooks

### useMemo与useCallback

```typescript
import { useMemo, useCallback, useState } from 'react'

function ExpensiveComponent({ items, onItemClick }: Props) {
  // 1. useMemo: 缓存计算结果
  const sortedItems = useMemo(() => {
    console.log('Sorting items...')
    return [...items].sort((a, b) => a.name.localeCompare(b.name))
  }, [items])
  
  // 2. useMemo: 缓存复杂对象
  const itemStyles = useMemo(() => ({
    container: {
      display: 'flex',
      flexDirection: 'column' as const
    },
    item: {
      padding: '10px',
      borderBottom: '1px solid #eee'
    }
  }), [])
  
  // 3. useCallback: 缓存回调函数
  const handleClick = useCallback((id: string) => {
    onItemClick(id)
  }, [onItemClick])
  
  // 4. useCallback: 事件处理
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      // 处理回车
    }
  }, [])
  
  return (
    <div style={itemStyles.container}>
      {sortedItems.map(item => (
        <div
          key={item.id}
          style={itemStyles.item}
          onClick={() => handleClick(item.id)}
          onKeyDown={handleKeyDown}
        >
          {item.name}
        </div>
      ))}
    </div>
  )
}
```

### useReducer复杂状态

```typescript
import { useReducer } from 'react'

// 1. 定义状态类型和Action类型
interface State {
  count: number
  history: number[]
}

type Action =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'reset'; payload: number }
  | { type: 'undo' }

// 2. 定义reducer函数
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment':
      return {
        count: state.count + 1,
        history: [...state.history, state.count]
      }
    case 'decrement':
      return {
        count: state.count - 1,
        history: [...state.history, state.count]
      }
    case 'reset':
      return {
        count: action.payload,
        history: [...state.history, state.count]
      }
    case 'undo':
      if (state.history.length === 0) return state
      const previousCount = state.history[state.history.length - 1]
      return {
        count: previousCount,
        history: state.history.slice(0, -1)
      }
    default:
      return state
  }
}

// 3. 使用useReducer
function CounterWithHistory() {
  const [state, dispatch] = useReducer(reducer, {
    count: 0,
    history: []
  })
  
  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <button onClick={() => dispatch({ type: 'reset', payload: 0 })}>Reset</button>
      <button
        onClick={() => dispatch({ type: 'undo' })}
        disabled={state.history.length === 0}
      >
        Undo
      </button>
      <p>History: {state.history.join(', ')}</p>
    </div>
  )
}
```

## 最佳实践总结

1. **Hook规则**：只在顶层调用Hook，只在React函数中调用Hook
2. **依赖数组**：正确填写useEffect的依赖数组，避免遗漏
3. **性能优化**：合理使用useMemo和useCallback，避免过度优化
4. **自定义Hook**：将复杂逻辑封装为自定义Hook，提高复用性
5. **类型安全**：使用TypeScript确保Hook的类型安全
6. **清理副作用**：在useEffect中返回清理函数，防止内存泄漏

React Hooks为函数组件提供了强大的能力，通过合理的模式和实践，可以构建出高效、可维护的React应用。
