---
title: 代码生成器设计与实现深度解析
date: 2025-02-12T00:00:00.000Z
categories:
  - projects
  - tools
tags:
  - 代码生成
  - 模板引擎
  - 自动化
  - 开发效率
  - CLI
description: 深入探讨代码生成器的架构设计、模板引擎实现、多语言支持和最佳实践，帮助开发者构建高效的代码生成工具
author: HK意境
---

# 代码生成器设计与实现深度解析

## 代码生成器概述

代码生成器是提升开发效率的重要工具，通过模板化和自动化方式批量生成代码，减少重复劳动，保证代码风格一致。从简单的脚手架工具到复杂的领域驱动代码生成系统，代码生成器在现代软件开发中扮演着越来越重要的角色。

### 代码生成的应用场景

**项目初始化**：
- 脚手架生成：Vue CLI、Create React App
- 项目模板：根据配置生成项目结构
- 配置文件：package.json、tsconfig.json等

**模块生成**：
- 组件生成：Vue组件、React组件
- API生成：基于Swagger生成API客户端
- 服务生成：CRUD服务模板

**文档生成**：
- API文档：从代码注释生成文档
- 类型定义：从JSON生成TypeScript类型
- README：项目说明文档模板

**数据库相关**：
- ORM模型：从数据库schema生成模型
- CRUD操作：生成增删改查代码
- 迁移脚本：数据库迁移文件生成

### 代码生成核心要素

```
代码生成器核心架构：

┌─────────────────────────────────────────────┐
│              【输入数据源】                    │
│                                             │
│  配置输入：CLI参数、交互式配置、配置文件         │
│  元数据输入：数据库schema、Swagger、JSON       │
│  模板输入：用户自定义模板、内置模板             │
│                                             │
└─────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│              【数据预处理】                    │
│                                             │
│  数据验证：格式检查、必填验证                  │
│  数据转换：标准化处理、类型转换                 │
│  数据增强：默认值填充、计算字段                 │
│                                             │
└─────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│              【模板引擎】                      │
│                                             │
│  模板解析：变量提取、语法解析                  │
│  数据绑定：变量替换、表达式计算                 │
│  内容生成：文本输出、文件生成                  │
│                                             │
└─────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│              【输出处理】                      │
│                                             │
│  文件写入：创建目录、写入文件                  │
│  格式化：代码格式化、美化输出                  │
│  后处理：依赖安装、Git初始化                  │
│                                             │
└─────────────────────────────────────────────┘
```

## 模板引擎设计

### 模板语法选择

```markdown
# 模板引擎对比

| 引擎 | 语法风格 | 优点 | 缺点 | 适用场景 |
|------|----------|------|------|----------|
| Handlebars | {{ }} | 简洁、安全 | 逻辑有限 | 简单文本生成 |
| Mustache | {{ }} | 跨语言 | 无逻辑 | 简单替换 |
| EJS | <% %> | 灵活、JS语法 | 复杂、不安全 | 复杂逻辑 |
| Pug | 缩进 | HTML简洁 | 学习曲线 | HTML生成 |
| Liquid | {% %} | 安全、功能全 | 性能一般 | 内容管理 |
| 自定义 | 灵活定义 | 完全可控 | 开发成本 | 特殊需求 |

推荐选择：
- 简单代码生成：Handlebars
- 复杂逻辑生成：EJS
- HTML模板：Pug
- 安全要求高：Liquid
```

### Handlebars模板实现

```javascript
// src/lib/template-engine.js
const Handlebars = require('handlebars')
const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')

/**
 * Handlebars模板引擎封装
 */
class TemplateEngine {
  constructor() {
    this.registerHelpers()
    this.registerPartials()
  }
  
  // 注册辅助函数
  registerHelpers() {
    // 条件判断增强
    Handlebars.registerHelper('ifEq', (a, b, options) => {
      return a === b ? options.fn(this) : options.inverse(this)
    })
    
    Handlebars.registerHelper('ifNotEq', (a, b, options) => {
      return a !== b ? options.fn(this) : options.inverse(this)
    })
    
    // 循环增强
    Handlebars.registerHelper('eachWithIndex', (context, options) => {
      const result = []
      context.forEach((item, index) => {
        result.push(options.fn({ ...item, index, isFirst: index === 0, isLast: index === context.length - 1 }))
      })
      return result.join('')
    })
    
    // 字符串处理
    Handlebars.registerHelper('camelCase', (str) => {
      return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
    })
    
    Handlebars.registerHelper('pascalCase', (str) => {
      const camel = str.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
      return camel.charAt(0).toUpperCase() + camel.slice(1)
    })
    
    Handlebars.registerHelper('kebabCase', (str) => {
      return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
    })
    
    Handlebars.registerHelper('lowerCase', (str) => str.toLowerCase())
    Handlebars.registerHelper('upperCase', (str) => str.toUpperCase())
    
    // JSON处理
    Handlebars.registerHelper('json', (obj) => JSON.stringify(obj, null, 2))
    
    // 注释生成
    Handlebars.registerHelper('comment', (text, style = 'js') => {
      const styles = {
        js: `/**\n * ${text}\n */`,
        jsSingle: `// ${text}`,
        html: `<!-- ${text} -->`,
        py: `# ${text}`,
        java: `/**\n * ${text}\n */`
      }
      return styles[style] || styles.js
    })
    
    // 日期生成
    Handlebars.registerHelper('now', (format = 'YYYY-MM-DD') => {
      const date = new Date()
      // 简化实现，实际应使用date-fns等库
      return date.toISOString().split('T')[0]
    })
    
    // 类型映射
    Handlebars.registerHelper('mapType', (type, lang = 'ts') => {
      const typeMap = {
        ts: {
          string: 'string',
          number: 'number',
          boolean: 'boolean',
          date: 'Date',
          array: 'Array<any>'
        },
        java: {
          string: 'String',
          number: 'Integer',
          boolean: 'Boolean',
          date: 'Date',
          array: 'List<Object>'
        },
        py: {
          string: 'str',
          number: 'int',
          boolean: 'bool',
          date: 'datetime',
          array: 'list'
        }
      }
      return typeMap[lang]?.[type] || type
    })
  }
  
  // 注册Partial（模板片段）
  registerPartials() {
    const partialsDir = path.join(__dirname, '../templates/partials')
    
    if (fs.existsSync(partialsDir)) {
      const partials = fs.readdirSync(partialsDir)
      
      partials.forEach(file => {
        const name = path.basename(file, '.hbs')
        const content = fs.readFileSync(path.join(partialsDir, file), 'utf-8')
        Handlebars.registerPartial(name, content)
      })
    }
  }
  
  // 编译模板
  compile(templateContent) {
    return Handlebars.compile(templateContent)
  }
  
  // 从文件编译
  compileFromFile(templatePath) {
    const content = fs.readFileSync(templatePath, 'utf-8')
    return this.compile(content)
  }
  
  // 渲染模板
  render(template, data) {
    const compiled = this.compile(template)
    return compiled(data)
  }
  
  // 渲染文件
  renderFile(templatePath, data) {
    const compiled = this.compileFromFile(templatePath)
    return compiled(data)
  }
  
  // 批量渲染目录
  async renderDir(templateDir, outputDir, data) {
    const files = await fs.readdir(templateDir)
    
    for (const file of files) {
      const srcPath = path.join(templateDir, file)
      const stat = await fs.stat(srcPath)
      
      // 处理文件名模板
      const outputFileName = this.render(file, data)
      const destPath = path.join(outputDir, outputFileName)
      
      if (stat.isDirectory()) {
        await fs.ensureDir(destPath)
        await this.renderDir(srcPath, destPath, data)
      } else {
        const content = this.renderFile(srcPath, data)
        await fs.writeFile(destPath, content)
      }
    }
  }
}

module.exports = TemplateEngine
```

### EJS模板实现（复杂逻辑场景）

```javascript
// src/lib/ejs-engine.js
const ejs = require('ejs')
const fs = require('fs-extra')
const path = require('path')

/**
 * EJS模板引擎封装（支持复杂逻辑）
 */
class EJSEngine {
  constructor(options = {}) {
    this.options = {
      cache: options.cache || false,
      compileDebug: options.compileDebug || true,
      delimiter: options.delimiter || '%',
      ...options
    }
  }
  
  // 渲染字符串模板
  render(template, data, options = {}) {
    return ejs.render(template, data, { ...this.options, ...options })
  }
  
  // 渲染文件
  async renderFile(templatePath, data, options = {}) {
    return await ejs.renderFile(templatePath, data, { ...this.options, ...options })
  }
  
  // 渲染目录
  async renderDir(templateDir, outputDir, data) {
    const files = await fs.readdir(templateDir)
    
    for (const file of files) {
      const srcPath = path.join(templateDir, file)
      const stat = await fs.stat(srcPath)
      
      // 文件名渲染
      const outputFileName = this.render(file, data)
      const destPath = path.join(outputDir, outputFileName)
      
      if (stat.isDirectory()) {
        await fs.ensureDir(destPath)
        await this.renderDir(srcPath, destPath, data)
      } else if (file.endsWith('.ejs')) {
        // EJS文件渲染
        const content = await this.renderFile(srcPath, data)
        // 移除.ejs后缀
        const finalDest = destPath.replace('.ejs', '')
        await fs.writeFile(finalDest, content)
      } else {
        // 静态文件直接复制
        await fs.copy(srcPath, destPath)
      }
    }
  }
  
  // 编译缓存
  compile(template, options = {}) {
    return ejs.compile(template, { ...this.options, ...options })
  }
}

module.exports = EJSEngine
```

## 模板示例设计

### Vue组件模板

```handlebars
<!-- templates/vue-component.hbs -->
<template>
  <div class="<%= kebabCase(name) %>">
    {{#if props}}
    {{#each props}}
    <!-- {{description}} -->
    <div class="{{kebabCase name}}-{{name}}">
      {{name}}: {{name}}
    </div>
    {{/each}}
    {{/if}}
  </div>
</template>

<script setup lang="ts">
{{comment name}}
import { ref, computed {{#if props}}, defineProps{{/if}} } from 'vue'

{{#if props}}
// Props定义
interface {{pascalCase name}}Props {
{{#each props}}
  {{name}}: {{mapType type}} {{#if required}}// {{description}}{{else}}? // {{description}}{{/if}}
{{/each}}
}

const props = defineProps<{{pascalCase name}}Props>()
{{/if}}

{{#if state}}
// 状态定义
{{#each state}}
const {{name}} = ref<{{mapType type}}>({{#if defaultValue}}{{defaultValue}}{{else}}undefined{{/if}})
{{/each}}
{{/if}}

{{#if computed}}
// 计算属性
{{#each computed}}
const {{name}} = computed(() => {
  // {{description}}
  return {{#if logic}}{{logic}}{{else}}null{{/if}}
})
{{/each}}
{{/if}}

{{#if methods}}
// 方法定义
{{#each methods}}
const {{name}} = () => {
  // {{description}}
{{#if body}}
{{body}}
{{/if}}
}
{{/each}}
{{/if}}
</script>

<style scoped>
.<%= kebabCase(name) %> {
  {{#if styles}}
  {{#each styles}}
  {{name}}: {{value}};
  {{/each}}
  {{/if}}
}
</style>
```

### TypeScript类型模板

```handlebars
<!-- templates/typescript-types.hbs -->
{{comment "Auto-generated TypeScript types"}}
{{comment "Generated at: "}}{{now}}

{{#if imports}}
{{#each imports}}
import { {{items}} } from '{{path}}'
{{/each}}
{{/if}}

{{#if types}}
// Type definitions
{{#each types}}
export type {{pascalCase name}} = {{value}}
{{/each}}
{{/if}}

{{#if interfaces}}
// Interface definitions
{{#each interfaces}}
export interface {{pascalCase name}} {
{{#each fields}}
  {{name}}: {{mapType type}}{{#if optional}}?{{/if}} {{#if description}}// {{description}}{{/if}}
{{/each}}
}
{{/each}}
{{/if}}

{{#if enums}}
// Enum definitions
{{#each enums}}
export enum {{pascalCase name}} {
{{#each values}}
  {{pascalCase name}} = '{{value}}',
{{/each}}
}
{{/each}}
{{/if}}
```

### API服务模板

```handlebars
<!-- templates/api-service.hbs -->
{{comment name 'java'}}
{{comment "Generated at: "}}{{now}}

package {{package}}.service;

{{#if imports}}
{{#each imports}}
import {{path}};
{{/each}}
{{/if}}

public class {{pascalCase name}}Service {

    {{#if dependencies}}
    {{#each dependencies}}
    @Autowired
    private {{pascalCase type}} {{camelCase name}};
    {{/each}}
    {{/if}}

    {{#if methods}}
    {{#each methods}}
    /**
     * {{description}}
     {{#if params}}
     {{#each params}}
     * @param {{name}} {{description}}
     {{/each}}
     {{/if}}
     {{#if returnType}}
     * @return {{returnDescription}}
     {{/if}}
     */
    public {{returnType}} {{camelCase name}}(
      {{#if params}}
      {{#eachWithIndex params}}
      {{type}} {{name}}{{#unless isLast}}, {{/unless}}
      {{/eachWithIndex}}
      {{/if}}
    ) {
      {{#if body}}
      {{body}}
      {{else}}
      // TODO: Implement
      {{/if}}
    }
    {{/each}}
    {{/if}}
}
```

## 元数据驱动生成

### JSON Schema生成器

```javascript
// src/lib/json-schema-generator.js
const TemplateEngine = require('./template-engine')
const fs = require('fs-extra')
const path = require('path')

/**
 * 基于JSON Schema的代码生成器
 */
class JSONSchemaGenerator {
  constructor() {
    this.templateEngine = new TemplateEngine()
  }
  
  // 解析JSON Schema
  parseSchema(schema) {
    const result = {
      name: schema.title || 'Generated',
      description: schema.description || '',
      properties: [],
      required: schema.required || []
    }
    
    if (schema.properties) {
      for (const [name, prop] of Object.entries(schema.properties)) {
        result.properties.push({
          name,
          type: this.mapSchemaType(prop.type, prop),
          description: prop.description || '',
          required: result.required.includes(name),
          format: prop.format,
          default: prop.default,
          enum: prop.enum,
          items: prop.items,
          ...prop
        })
      }
    }
    
    return result
  }
  
  // 类型映射
  mapSchemaType(schemaType, prop) {
    const typeMap = {
      string: prop.format === 'date-time' ? 'Date' : 'string',
      number: 'number',
      integer: 'number',
      boolean: 'boolean',
      array: 'Array<any>',
      object: 'Record<string, any>'
    }
    
    if (prop.enum) {
      return prop.enum.map(v => `'${v}'`).join(' | ')
    }
    
    return typeMap[schemaType] || schemaType
  }
  
  // 生成TypeScript接口
  generateTSInterface(schema, options = {}) {
    const data = this.parseSchema(schema)
    const template = `
/**
 * {{description}}
 */
export interface {{pascalCase name}} {
{{#each properties}}
  {{name}}: {{type}}{{#unless required}}?{{/unless}} {{#if description}}// {{description}}{{/if}}
{{/each}}
}
`
    return this.templateEngine.render(template, data)
  }
  
  // 生成Java类
  generateJavaClass(schema, options = {}) {
    const data = this.parseSchema(schema)
    data.package = options.package || 'com.example.model'
    
    const template = `
package {{package}}

/**
 * {{description}}
 */
public class {{pascalCase name}} {
{{#each properties}}
    private {{mapType type 'java'}} {{camelCase name}};
{{/each}}

{{#each properties}}
    public {{mapType type 'java'}} get{{pascalCase name}}() {
        return {{camelCase name}};
    }

    public void set{{pascalCase name}}({{mapType type 'java'}} {{camelCase name}}) {
        this.{{camelCase name}} = {{camelCase name}};
    }
{{/each}}
}
`
    return this.templateEngine.render(template, data)
  }
  
  // 生成Python类
  generatePythonClass(schema, options = {}) {
    const data = this.parseSchema(schema)
    
    const template = `
"""
{{description}}
"""
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class {{pascalCase name}}(BaseModel):
{{#each properties}}
    {{name}}: {{#if required}}{{mapType type 'py'}}{{else}}Optional[{{mapType type 'py'}}] = None{{/if}} {{#if description}}# {{description}}{{/if}}
{{/each}}
`
    return this.templateEngine.render(template, data)
  }
  
  // 从文件生成
  async generateFromFile(schemaPath, outputDir, options = {}) {
    const schema = await fs.readJson(schemaPath)
    const lang = options.lang || 'ts'
    
    const generators = {
      ts: this.generateTSInterface,
      java: this.generateJavaClass,
      py: this.generatePythonClass
    }
    
    const content = generators[lang](schema, options)
    const fileName = `${schema.title || 'Generated'}.${lang === 'ts' ? 'ts' : lang === 'py' ? 'py' : 'java'}`
    
    await fs.ensureDir(outputDir)
    await fs.writeFile(path.join(outputDir, fileName), content)
  }
}

module.exports = JSONSchemaGenerator
```

### Swagger API生成器

```javascript
// src/lib/swagger-generator.js
const TemplateEngine = require('./template-engine')
const fs = require('fs-extra')
const path = require('path')

/**
 * Swagger/OpenAPI驱动的API代码生成器
 */
class SwaggerGenerator {
  constructor() {
    this.templateEngine = new TemplateEngine()
  }
  
  // 解析Swagger文档
  parseSwagger(swagger) {
    const result = {
      baseUrl: swagger.host || '',
      basePath: swagger.basePath || '',
      endpoints: [],
      models: []
    }
    
    // 解析路径
    if (swagger.paths) {
      for (const [path, methods] of Object.entries(swagger.paths)) {
        for (const [method, spec] of Object.entries(methods)) {
          if (['get', 'post', 'put', 'delete', 'patch'].includes(method)) {
            result.endpoints.push({
              path,
              method: method.toUpperCase(),
              operationId: spec.operationId,
              summary: spec.summary || '',
              description: spec.description || '',
              tags: spec.tags || [],
              parameters: this.parseParameters(spec.parameters),
              requestBody: this.parseRequestBody(spec.requestBody),
              responses: this.parseResponses(spec.responses)
            })
          }
        }
      }
    }
    
    // 解析模型定义
    if (swagger.definitions || swagger.components?.schemas) {
      const schemas = swagger.definitions || swagger.components.schemas
      for (const [name, schema] of Object.entries(schemas)) {
        result.models.push({
          name,
          ...schema
        })
      }
    }
    
    return result
  }
  
  // 解析参数
  parseParameters(parameters) {
    if (!parameters) return []
    
    return parameters.map(param => ({
      name: param.name,
      in: param.in,
      type: param.type || param.schema?.type,
      required: param.required,
      description: param.description
    }))
  }
  
  // 解析请求体
  parseRequestBody(requestBody) {
    if (!requestBody) return null
    
    return {
      description: requestBody.description,
      content: requestBody.content,
      required: requestBody.required
    }
  }
  
  // 解析响应
  parseResponses(responses) {
    if (!responses) return []
    
    return Object.entries(responses).map(([code, spec]) => ({
      code,
      description: spec.description,
      schema: spec.schema
    }))
  }
  
  // 生成Axios API客户端
  generateAxiosClient(swagger, options = {}) {
    const data = this.parseSwagger(swagger)
    data.baseUrl = options.baseUrl || data.baseUrl
    
    const template = `
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'

const BASE_URL = '{{baseUrl}}{{basePath}}'

{{#if models}}
// Type definitions
{{#each models}}
export interface {{pascalCase name}} {
  // TODO: Add properties based on schema
}
{{/each}}
{{/if}}

{{#if endpoints}}
// API endpoints
{{#each endpoints}}
/**
 * {{summary}}
 * {{description}}
 */
export async function {{camelCase operationId}}(
{{#if parameters}}
{{#each parameters}}
  {{name}}: {{#if required}}{{type}}{{else}}{{type}} | undefined{{/if}},
{{/each}}
{{/if}}
{{#if requestBody}}
  body: any,
{{/if}}
  config?: AxiosRequestConfig
): Promise<AxiosResponse<{{#if responses}}{{#each responses}}{{#if @first}}{{schema?.type || 'any'}}{{/if}}{{/each}}{{else}}any{{/if}}> {
  const url = '{{path}}'
    {{#if parameters}}
    {{#each parameters}}
    {{#ifEq in 'path'}}
    .replace('{{name}}', String({{name}}))
    {{/ifEq}}
    {{/each}}
    {{/if}}
  
  return axios.request({
    method: '{{method}}',
    url: BASE_URL + url,
    {{#if parameters}}
    {{#each parameters}}
    {{#ifEq in 'query'}}
    params: { ...{{name}} },
    {{/ifEq}}
    {{#ifEq in 'header'}}
    headers: { '{{name}}': {{name}} },
    {{/ifEq}}
    {{/each}}
    {{/if}}
    {{#if requestBody}}
    data: body,
    {{/if}}
    ...config
  })
}
{{/each}}
{{/if}}
`
    
    return this.templateEngine.render(template, data)
  }
  
  // 生成Fetch API客户端
  generateFetchClient(swagger, options = {}) {
    const data = this.parseSwagger(swagger)
    data.baseUrl = options.baseUrl || data.baseUrl
    
    const template = `
const BASE_URL = '{{baseUrl}}{{basePath}}'

{{#if models}}
// Type definitions
{{#each models}}
export interface {{pascalCase name}} {
  // TODO: Add properties
}
{{/each}}
{{/if}}

{{#if endpoints}}
// API endpoints
{{#each endpoints}}
/**
 * {{summary}}
 * {{description}}
 */
export async function {{camelCase operationId}}(
{{#if parameters}}
{{#each parameters}}
  {{name}}: {{#if required}}{{type}}{{else}}{{type}} | undefined{{/if}},
{{/each}}
{{/if}}
{{#if requestBody}}
  body: any,
{{/if}}
): Promise<Response> {
  const url = '{{path}}'
    {{#if parameters}}
    {{#each parameters}}
    {{#ifEq in 'path'}}
    .replace('{{name}}', String({{name}}))
    {{/ifEq}}
    {{/each}}
    {{/if}}
  
  {{#ifEq method 'GET'}}
  const params = new URLSearchParams(
    {{#if parameters}}
    Object.entries({
      {{#each parameters}}
      {{#ifEq in 'query'}}
      {{name}},
      {{/ifEq}}
      {{/each}}
    }).filter(([_, v]) => v !== undefined)
    {{else}}
    {}
    {{/if}}
  )
  {{/ifEq}}
  
  return fetch(BASE_URL + url {{#ifEq method 'GET'}}+ '?' + params.toString(){{/ifEq}}, {
    method: '{{method}}',
    {{#if requestBody}}
    body: JSON.stringify(body),
    {{/if}}
    headers: {
      'Content-Type': 'application/json',
      {{#if parameters}}
      {{#each parameters}}
      {{#ifEq in 'header'}}
      '{{name}}': String({{name}}),
      {{/ifEq}}
      {{/each}}
      {{/if}}
    }
  })
}
{{/each}}
{{/if}}
`
    
    return this.templateEngine.render(template, data)
  }
  
  // 从文件生成
  async generateFromFile(swaggerPath, outputDir, options = {}) {
    const swagger = await fs.readJson(swaggerPath)
    const clientType = options.clientType || 'axios'
    
    const generators = {
      axios: this.generateAxiosClient,
      fetch: this.generateFetchClient
    }
    
    const content = generators[clientType](swagger, options)
    const fileName = 'api-client.ts'
    
    await fs.ensureDir(outputDir)
    await fs.writeFile(path.join(outputDir, fileName), content)
  }
}

module.exports = SwaggerGenerator
```

## 生成器CLI实现

```javascript
// src/commands/generate.js
const chalk = require('chalk')
const inquirer = require('inquirer')
const { Logger } = require('../utils/logger')
const TemplateEngine = require('../lib/template-engine')
const JSONSchemaGenerator = require('../lib/json-schema-generator')
const SwaggerGenerator = require('../lib/swagger-generator')
const fs = require('fs-extra')
const path = require('path')

const logger = new Logger()

/**
 * generate命令实现
 */
async function generate(type, name, options) {
  try {
    logger.title(`Generating ${type}`)
    
    switch (type) {
      case 'component':
        await generateComponent(name, options)
        break
      
      case 'service':
        await generateService(name, options)
        break
      
      case 'model':
        await generateModel(name, options)
        break
      
      case 'types':
        await generateTypes(name, options)
        break
      
      case 'api':
        await generateAPI(name, options)
        break
      
      default:
        logger.error(`Unknown type: ${type}`)
        logger.info('Valid types: component, service, model, types, api')
    }
    
  } catch (error) {
    logger.error('Failed to generate')
    logger.error(error.message)
    process.exit(1)
  }
}

// 生成组件
async function generateComponent(name, options) {
  const config = await inquirer.prompt([
    {
      type: 'list',
      name: 'framework',
      message: 'Select framework:',
      choices: ['Vue 3', 'React', 'Svelte'],
      default: 'Vue 3'
    },
    {
      type: 'checkbox',
      name: 'features',
      message: 'Select features:',
      choices: [
        { name: 'Props', value: 'props', checked: true },
        { name: 'State', value: 'state' },
        { name: 'Computed', value: 'computed' },
        { name: 'Methods', value: 'methods' },
        { name: 'Styles', value: 'styles', checked: true }
      ]
    }
  ])
  
  const engine = new TemplateEngine()
  const templatePath = path.join(__dirname, '../templates', config.framework.toLowerCase().replace(' ', '-'), 'component.hbs')
  
  const data = {
    name,
    props: config.features.includes('props') ? [{ name: 'value', type: 'string', description: 'Component value' }] : null,
    state: config.features.includes('state') ? [{ name: 'count', type: 'number', defaultValue: 0 }] : null,
    computed: config.features.includes('computed') ? [{ name: 'doubleCount', description: 'Double the count', logic: 'props.count * 2' }] : null,
    methods: config.features.includes('methods') ? [{ name: 'increment', description: 'Increment count', body: 'count.value++' }] : null,
    styles: config.features.includes('styles') ? [{ name: 'padding', value: '1rem' }] : null
  }
  
  const content = engine.renderFile(templatePath, data)
  
  const outputDir = options.directory || path.join(process.cwd(), 'src/components')
  await fs.ensureDir(outputDir)
  
  const fileName = `${name}.vue`
  await fs.writeFile(path.join(outputDir, fileName), content)
  
  logger.success(`Component ${chalk.cyan(name)} generated at ${outputDir}`)
}

// 从JSON Schema生成类型
async function generateTypes(schemaPath, options) {
  const generator = new JSONSchemaGenerator()
  const outputDir = options.directory || path.join(process.cwd(), 'src/types')
  
  await generator.generateFromFile(schemaPath, outputDir, { lang: options.lang || 'ts' })
  
  logger.success(`Types generated at ${outputDir}`)
}

// 从Swagger生成API客户端
async function generateAPI(swaggerPath, options) {
  const generator = new SwaggerGenerator()
  const outputDir = options.directory || path.join(process.cwd(), 'src/api')
  
  await generator.generateFromFile(swaggerPath, outputDir, {
    clientType: options.client || 'axios',
    baseUrl: options.baseUrl
  })
  
  logger.success(`API client generated at ${outputDir}`)
}

module.exports = generate
```

## 最佳实践总结

1. **模板设计**：灵活语法、Partial复用、Helper扩展
2. **数据驱动**：JSON Schema、Swagger等元数据驱动生成
3. **多语言支持**：模板语言适配、类型映射处理
4. **交互友好**：配置选择、进度展示、错误处理
5. **文件管理**：目录创建、命名规范、格式化输出
6. **可扩展性**：自定义模板、自定义Helper、插件机制
7. **文档完善**：模板说明、生成示例、使用指南

代码生成器是提升开发效率的关键工具，通过系统化的设计和实现，可以大幅减少重复编码工作，保证代码质量和一致性。
