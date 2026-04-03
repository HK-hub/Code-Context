---
title: Vue3组件库示例与最佳实践
date: 2025-01-30
categories: [projects, demos]
tags: [Vue3, 组件库, TypeScript, Composition API, 组件设计]
description: 通过实际案例展示Vue3组件库的开发流程，包括组件设计原则、API设计、文档编写和测试策略
---

# Vue3组件库示例与最佳实践

## 组件库设计原则

Vue3组件库的设计需要遵循一系列原则，确保组件的可复用性、可维护性和用户体验的一致性。

### 核心设计原则

**单一职责原则**：每个组件只做一件事，保持功能单一和职责清晰。按钮组件只负责按钮功能，输入组件只负责输入功能，避免组件功能膨胀。

**可组合性原则**：组件应该可以自由组合，通过插槽、props和事件实现灵活的组合方式。复杂的UI通过简单组件组合实现，而不是创建复杂的复合组件。

**可访问性原则**：所有组件必须符合WCAG 2.1 AA级别标准，支持键盘导航、屏幕阅读器、焦点管理等无障碍功能。

**可定制性原则**：通过props、插槽、CSS变量提供足够的定制能力，满足不同项目的样式和功能需求。

## 组件API设计

### Props设计模式

```typescript
// 组件Props设计示例
import { PropType, defineComponent } from 'vue'

// 类型定义
type ButtonSize = 'small' | 'medium' | 'large'
type ButtonType = 'primary' | 'secondary' | 'danger' | 'ghost'

interface ButtonProps {
  type: ButtonType
  size: ButtonSize
  disabled: boolean
  loading: boolean
  block: boolean
  icon?: string
  iconPosition: 'left' | 'right'
}

// 组件定义
export default defineComponent({
  name: 'MyButton',
  
  props: {
    // 按钮类型
    type: {
      type: String as PropType<ButtonType>,
      default: 'primary',
      validator: (value: ButtonType) => {
        return ['primary', 'secondary', 'danger', 'ghost'].includes(value)
      }
    },
    
    // 按钮尺寸
    size: {
      type: String as PropType<ButtonSize>,
      default: 'medium'
    },
    
    // 禁用状态
    disabled: {
      type: Boolean,
      default: false
    },
    
    // 加载状态
    loading: {
      type: Boolean,
      default: false
    },
    
    // 块级按钮
    block: {
      type: Boolean,
      default: false
    },
    
    // 图标
    icon: {
      type: String,
      default: undefined
    },
    
    // 图标位置
    iconPosition: {
      type: String as PropType<'left' | 'right'>,
      default: 'left'
    }
  },
  
  emits: ['click'],
  
  setup(props, { emit, slots }) {
    const handleClick = (event: MouseEvent) => {
      if (!props.disabled && !props.loading) {
        emit('click', event)
      }
    }
    
    const buttonClass = computed(() => ({
      'my-button': true,
      [`my-button--${props.type}`]: true,
      [`my-button--${props.size}`]: true,
      'my-button--disabled': props.disabled,
      'my-button--loading': props.loading,
      'my-button--block': props.block
    }))
    
    return () => (
      <button
        class={buttonClass.value}
        disabled={props.disabled || props.loading}
        onClick={handleClick}
      >
        {props.loading && <span class="my-button__loading-icon" />}
        {props.icon && props.iconPosition === 'left' && !props.loading && (
          <span class="my-button__icon">{props.icon}</span>
        )}
        {slots.default?.()}
        {props.icon && props.iconPosition === 'right' && (
          <span class="my-button__icon">{props.icon}</span>
        )}
      </button>
    )
  }
})
```

### 事件设计模式

```typescript
// 事件设计示例
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'MyInput',
  
  props: {
    modelValue: {
      type: [String, Number],
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    disabled: Boolean,
    readonly: Boolean,
    maxlength: Number,
    clearable: Boolean
  },
  
  emits: {
    // v-model更新事件
    'update:modelValue': (value: string | number) => true,
    
    // 输入事件
    input: (event: Event) => true,
    
    // 值变化事件
    change: (value: string | number) => true,
    
    // 聚焦事件
    focus: (event: FocusEvent) => true,
    
    // 失焦事件
    blur: (event: FocusEvent) => true,
    
    // 清空事件
    clear: () => true,
    
    // 键盘事件
    keydown: (event: KeyboardEvent) => true,
    keyup: (event: KeyboardEvent) => true,
    keypress: (event: KeyboardEvent) => true
  },
  
  setup(props, { emit, slots }) {
    const inputRef = ref<HTMLInputElement>()
    const isFocused = ref(false)
    
    const handleInput = (event: Event) => {
      const target = event.target as HTMLInputElement
      emit('update:modelValue', target.value)
      emit('input', event)
    }
    
    const handleChange = () => {
      emit('change', props.modelValue)
    }
    
    const handleFocus = (event: FocusEvent) => {
      isFocused.value = true
      emit('focus', event)
    }
    
    const handleBlur = (event: FocusEvent) => {
      isFocused.value = false
      emit('blur', event)
    }
    
    const handleClear = () => {
      emit('update:modelValue', '')
      emit('clear')
      inputRef.value?.focus()
    }
    
    const focus = () => inputRef.value?.focus()
    const blur = () => inputRef.value?.blur()
    
    // 暴露方法
    defineExpose({ focus, blur })
    
    return {
      inputRef,
      isFocused,
      handleInput,
      handleChange,
      handleFocus,
      handleBlur,
      handleClear
    }
  }
})
```

## 复杂组件实现

### 表格组件实现

```vue
<template>
  <div class="my-table-wrapper">
    <table class="my-table" :class="tableClass">
      <thead v-if="showHeader">
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            :style="getHeaderStyle(column)"
            :class="getHeaderClass(column)"
            @click="handleHeaderClick(column)"
          >
            <slot :name="`header-${column.key}`" :column="column">
              {{ column.title }}
            </slot>
            <span v-if="column.sortable" class="my-table__sort-icon">
              {{ getSortIcon(column.key) }}
            </span>
          </th>
        </tr>
      </thead>
      
      <tbody>
        <template v-if="data.length > 0">
          <tr
            v-for="(row, index) in processedData"
            :key="getRowKey(row, index)"
            :class="getRowClass(row, index)"
            @click="handleRowClick(row, index)"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              :style="getCellStyle(column)"
              :class="getCellClass(column)"
            >
              <slot
                :name="`cell-${column.key}`"
                :row="row"
                :column="column"
                :value="row[column.key]"
                :index="index"
              >
                {{ row[column.key] }}
              </slot>
            </td>
          </tr>
        </template>
        
        <tr v-else>
          <td :colspan="columns.length" class="my-table__empty">
            <slot name="empty">
              暂无数据
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
    
    <div v-if="pagination" class="my-table__pagination">
      <slot name="pagination" :pagination="paginationInfo">
        <MyPagination
          :current="paginationInfo.current"
          :total="paginationInfo.total"
          :page-size="paginationInfo.pageSize"
          @change="handlePageChange"
        />
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Column {
  key: string
  title: string
  width?: number | string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  fixed?: 'left' | 'right'
}

interface Props {
  columns: Column[]
  data: Record<string, any>[]
  showHeader?: boolean
  striped?: boolean
  bordered?: boolean
  hover?: boolean
  rowKey?: string | ((row: any) => string)
  pagination?: {
    current: number
    pageSize: number
    total: number
  }
}

const props = withDefaults(defineProps<Props>(), {
  showHeader: true,
  striped: false,
  bordered: false,
  hover: true
})

const emit = defineEmits<{
  rowClick: [row: any, index: number]
  sortChange: [sort: { key: string; order: 'asc' | 'desc' | null }]
  pageChange: [page: number]
}>()

// 排序状态
const sortState = ref<{ key: string; order: 'asc' | 'desc' | null }>({
  key: '',
  order: null
})

// 处理后的数据
const processedData = computed(() => {
  let result = [...props.data]
  
  // 排序
  if (sortState.value.key && sortState.value.order) {
    const column = props.columns.find(c => c.key === sortState.value.key)
    result.sort((a, b) => {
      const aVal = a[sortState.value.key]
      const bVal = b[sortState.value.key]
      const cmp = aVal > bVal ? 1 : aVal < bVal ? -1 : 0
      return sortState.value.order === 'asc' ? cmp : -cmp
    })
  }
  
  return result
})

// 表格样式
const tableClass = computed(() => ({
  'my-table--striped': props.striped,
  'my-table--bordered': props.bordered,
  'my-table--hover': props.hover
}))

// 方法
const getRowKey = (row: any, index: number) => {
  if (typeof props.rowKey === 'function') {
    return props.rowKey(row)
  }
  return props.rowKey ? row[props.rowKey] : index
}

const handleHeaderClick = (column: Column) => {
  if (!column.sortable) return
  
  if (sortState.value.key === column.key) {
    sortState.value.order = sortState.value.order === 'asc' ? 'desc' : null
  } else {
    sortState.value.key = column.key
    sortState.value.order = 'asc'
  }
  
  emit('sortChange', sortState.value)
}

const handleRowClick = (row: any, index: number) => {
  emit('rowClick', row, index)
}

const handlePageChange = (page: number) => {
  emit('pageChange', page)
}
</script>
```

## 组件库文档

### 文档结构设计

```markdown
# 组件文档模板

## 组件名称
Button 按钮

## 描述
按钮用于触发即时操作。

## 何时使用
- 标记一个或封装一个操作
- 触发表单提交
- 触发页面跳转

## 代码演示

### 基础用法
最简单的按钮用法。

\`\`\`vue
<template>
  <my-button>默认按钮</my-button>
  <my-button type="primary">主要按钮</my-button>
  <my-button type="secondary">次要按钮</my-button>
  <my-button type="danger">危险按钮</my-button>
</template>
\`\`\`

### 尺寸
按钮有大、中、小三种尺寸。

\`\`\`vue
<template>
  <my-button size="small">小型按钮</my-button>
  <my-button size="medium">中型按钮</my-button>
  <my-button size="large">大型按钮</my-button>
</template>
\`\`\`

### 加载状态
通过设置 loading 属性，让按钮处于加载状态。

\`\`\`vue
<template>
  <my-button loading>加载中</my-button>
</template>
\`\`\`

## API

### Props
| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| type | 按钮类型 | 'primary' \| 'secondary' \| 'danger' \| 'ghost' | 'primary' |
| size | 按钮尺寸 | 'small' \| 'medium' \| 'large' | 'medium' |
| disabled | 禁用状态 | boolean | false |
| loading | 加载状态 | boolean | false |
| block | 块级按钮 | boolean | false |
| icon | 图标名称 | string | - |
| iconPosition | 图标位置 | 'left' \| 'right' | 'left' |

### Events
| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| click | 点击按钮时触发 | (event: MouseEvent) => void |

### Slots
| 名称 | 说明 |
|------|------|
| default | 按钮内容 |
```

## 总结

Vue3组件库开发需要系统化的设计思维和工程实践：

1. **设计原则**：单一职责、可组合、可访问、可定制
2. **API设计**：Props、Events、Slots、Expose合理设计
3. **代码质量**：TypeScript类型、单元测试、文档完善
4. **工程化**：构建配置、发布流程、版本管理

通过遵循这些最佳实践，可以开发出高质量、易用、可维护的Vue3组件库。