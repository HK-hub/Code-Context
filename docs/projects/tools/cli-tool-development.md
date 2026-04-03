---
title: CLI命令行工具开发实战指南
date: 2025-01-28
categories: [projects, tools]
tags: [CLI, Node.js, 命令行, 工具开发, npm]
description: 全面介绍CLI命令行工具的开发流程，包括项目架构、参数处理、交互设计、发布维护等核心环节的实践经验
---

# CLI命令行工具开发实战指南

## CLI工具开发概述

命令行界面（CLI）工具是开发者日常工作中不可或缺的利器。从git到npm，从webpack到docker，优秀的CLI工具极大提升了开发效率。掌握CLI开发技能，不仅能创建提升个人效率的工具，更能为社区贡献有价值的解决方案。

### CLI工具的核心价值

**效率提升**：
- 执行速度快：无需GUI渲染，直接执行
- 批量操作：一次命令处理多个任务
- 可自动化：易于脚本集成、CI/CD流程
- 可复现：命令可记录、可重复执行

**开发者友好**：
- 简洁明了：命令语义清晰，易于理解
- 可组合：命令可链式组合、管道操作
- 可配置：参数灵活，适应不同场景
- 可扩展：插件机制，功能可扩展

**系统集成**：
- 自动化流程：CI/CD、自动化脚本
- 跨平台兼容：Windows/macOS/Linux统一体验
- 远程执行：SSH环境友好
- 低资源占用：无需复杂GUI环境

### CLI开发技术栈选择

```markdown
# CLI开发语言对比

| 语言 | 优势 | 劣势 | 适用场景 |
|------|------|------|----------|
| Node.js | npm生态丰富、开发快、跨平台 | 性能一般、依赖重 | 通用开发工具 |
| Go | 性能好、单文件分发、跨平台编译 | 开发门槛稍高 | 高频使用工具 |
| Rust | 性能最优、安全性高 | 学习曲线陡 | 系统级工具 |
| Python | 简单易学、生态丰富 | 性能一般、依赖管理 | 数据处理工具 |
| Shell | 系统原生、轻量 | 功能有限、跨平台差 | 简单脚本 |

推荐：
- 面向开发者：Node.js（npm生态优势）
- 高频工具：Go（分发友好）
- 系统工具：Rust/Go
- 数据工具：Python
```

## 项目架构设计

### CLI项目结构

```
cli-project/
├── bin/                     # 入口文件目录
│   └── cli.js               # CLI主入口
│
├── src/                     # 源代码目录
│   ├── index.js             # 主逻辑入口
│   ├── commands/            # 命令模块
│   │   ├── init.js          # init命令
│   │   ├── build.js         # build命令
│   │   ├── serve.js         # serve命令
│   │   └── config.js        # config命令
│   │   └── index.js         # 命令注册
│   │
│   ├── utils/               # 工具函数
│   │   ├── logger.js        # 日志工具
│   │   ├── config.js        # 配置处理
│   │   ├── fs.js            # 文件操作
│   │   ├── spawn.js         # 子进程
│   │   └── prompt.js        # 交互提示
│   │
│   ├── lib/                 # 核心库
│   │   ├── generator.js     # 代码生成器
│   │   ├── watcher.js       # 文件监听
│   │   └── server.js        # 本地服务
│   │
│   └── constants.js         # 常量定义
│   └── types.js             # 类型定义（TS）
│
├── templates/               # 模板文件
│   ├── project/             # 项目模板
│   ├── component/           # 组件模板
│   └── config/              # 配置模板
│
├── tests/                   # 测试文件
│   ├── unit/                # 单元测试
│   └── integration/         # 集成测试
│
├── docs/                    # 文档目录
│   ├── README.md            # 使用文档
│   ├── ARCHITECTURE.md      # 架构文档
│   └── CONTRIBUTING.md      # 贡献指南
│
├── package.json             # 项目配置
├── tsconfig.json            # TypeScript配置
├── .eslintrc.js             # ESLint配置
├── .prettierrc              # Prettier配置
├── LICENSE                  # 许可证
└── README.md                # 项目说明
```

### package.json配置

```json
{
  "name": "my-cli",
  "version": "1.0.0",
  "description": "A powerful CLI tool for developers",
  "keywords": ["cli", "developer-tools", "automation"],
  "author": "Your Name",
  "license": "MIT",
  
  // CLI入口配置
  "bin": {
    "my-cli": "./bin/cli.js",
    "mc": "./bin/cli.js"  // 简短别名
  },
  
  // 文件包含配置
  "files": [
    "bin",
    "src",
    "templates",
    "README.md",
    "LICENSE"
  ],
  
  // 依赖配置
  "dependencies": {
    "commander": "^11.0.0",      // 命令行参数解析
    "inquirer": "^9.0.0",        // 交互式提示
    "chalk": "^5.0.0",           // 终端颜色
    "ora": "^6.0.0",             // 加载动画
    "fs-extra": "^11.0.0",       // 文件操作增强
    "glob": "^10.0.0",           // 文件匹配
    "lodash": "^4.17.0"          // 工具函数
  },
  
  // 开发依赖
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "vitest": "^1.0.0",
    "eslint": "^8.0.0"
  },
  
  // 脚本配置
  "scripts": {
    "dev": "node bin/cli.js",
    "build": "tsc",
    "test": "vitest run",
    "lint": "eslint src",
    "release": "npm publish"
  },
  
  // 引擎配置
  "engines": {
    "node": ">=16.0.0"
  }
}
```

### CLI入口文件设计

```javascript
// bin/cli.js
#!/usr/bin/env node

/**
 * CLI入口文件
 * - 处理Node.js环境检查
 * - 加载主程序
 * - 处理异常情况
 */

const currentNodeVersion = process.versions.node
const semver = currentNodeVersion.split('.')
const major = Number(semver[0])

// Node.js版本检查
if (major < 16) {
  console.error(
    'You are running Node ' + currentNodeVersion + '.\n' +
    'my-cli requires Node 16 or higher. \n' +
    'Please update your version of Node.'
  )
  process.exit(1)
}

// 加载主程序
const program = require('../src/index')

// 启动CLI
program.run()
```

## 命令参数处理

### Commander.js使用详解

```javascript
// src/index.js
const { Command } = require('commander')
const chalk = require('chalk')
const packageJson = require('../package.json')

// 创建命令程序
const program = new Command()

// 基本信息
program
  .name('my-cli')
  .description('A powerful CLI tool for developers')
  .version(packageJson.version, '-v, --version', 'output current version')
  .usage('[command] [options]')

// init命令
program
  .command('init [project-name]')
  .description('Initialize a new project')
  .option('-t, --template <template>', 'specify project template', 'default')
  .option('-f, --force', 'force overwrite existing directory')
  .option('--no-install', 'skip dependency installation')
  .action((projectName, options) => {
    require('./commands/init')(projectName, options)
  })

// build命令
program
  .command('build')
  .description('Build the project')
  .option('-m, --mode <mode>', 'build mode (development|production)', 'production')
  .option('-o, --output <dir>', 'output directory', 'dist')
  .option('--analyze', 'analyze build result')
  .option('--watch', 'watch mode')
  .action((options) => {
    require('./commands/build')(options)
  })

// serve命令
program
  .command('serve')
  .description('Start development server')
  .option('-p, --port <port>', 'server port', '3000')
  .option('-h, --host <host>', 'server host', 'localhost')
  .option('-o, --open', 'open browser automatically')
  .action((options) => {
    require('./commands/serve')(options)
  })

// config命令
program
  .command('config <action>')
  .description('Manage CLI configuration')
  .option('-k, --key <key>', 'config key')
  .option('-v, --value <value>', 'config value')
  .action((action, options) => {
    require('./commands/config')(action, options)
  })

// generate命令（子命令示例）
program
  .command('generate <type>')
  .description('Generate code templates')
  .argument('[name]', 'component/model/service name')
  .option('-d, --directory <dir>', 'output directory')
  .action((type, name, options) => {
    require('./commands/generate')(type, name, options)
  })

// 帮助信息自定义
program
  .addHelpText('before', '\n' + chalk.bold.blue('My CLI - Developer Tool\n'))
  .addHelpText('after', '\n' + chalk.gray('For more information, visit: https://github.com/your-repo/my-cli\n'))

// 处理未知命令
program.on('command:*', (operands) => {
  console.error(chalk.red(`Error: unknown command '${operands[0]}'`))
  console.log(chalk.gray('See available commands with --help'))
  process.exit(1)
})

// 解析参数
program.parse(process.argv)

// 无命令时显示帮助
if (!process.argv.slice(2).length) {
  program.outputHelp()
}
```

### 参数解析高级技巧

```javascript
// src/utils/args.js

/**
 * 参数解析与处理工具
 */

// 自定义参数验证
function validateOptions(options, schema) {
  const errors = []
  
  for (const [key, rule] of Object.entries(schema)) {
    const value = options[key]
    
    // 必需检查
    if (rule.required && !value) {
      errors.push(`Option '${key}' is required`)
      continue
    }
    
    // 类型检查
    if (value && rule.type) {
      if (rule.type === 'number' && isNaN(Number(value))) {
        errors.push(`Option '${key}' must be a number`)
      }
      if (rule.type === 'boolean' && !['true', 'false', '1', '0'].includes(value)) {
        errors.push(`Option '${key}' must be a boolean`)
      }
    }
    
    // 范围检查
    if (value && rule.enum && !rule.enum.includes(value)) {
      errors.push(`Option '${key}' must be one of: ${rule.enum.join(', ')}`)
    }
    
    // 正则检查
    if (value && rule.pattern && !rule.pattern.test(value)) {
      errors.push(`Option '${key}' format is invalid`)
    }
  }
  
  return { valid: errors.length === 0, errors }
}

// 参数默认值处理
function applyDefaults(options, defaults) {
  return Object.entries(defaults).reduce((acc, [key, value]) => {
    acc[key] = options[key] ?? value
    return acc
  }, {})
}

// 参数转换处理
function transformOptions(options, transformers) {
  return Object.entries(transformers).reduce((acc, [key, fn]) => {
    if (acc[key] !== undefined) {
      acc[key] = fn(acc[key])
    }
    return acc
  }, { ...options })
}

// 参数组合示例
function processCommandOptions(rawOptions) {
  const schema = {
    port: { type: 'number', min: 1, max: 65535 },
    mode: { enum: ['development', 'production'] },
    output: { pattern: /^[a-zA-Z0-9_-]+$/ }
  }
  
  const defaults = {
    port: 3000,
    mode: 'production',
    output: 'dist'
  }
  
  const transformers = {
    port: (v) => Number(v),
    mode: (v) => v.toLowerCase()
  }
  
  // 验证
  const { valid, errors } = validateOptions(rawOptions, schema)
  if (!valid) {
    throw new Error(errors.join('\n'))
  }
  
  // 应用默认值
  let options = applyDefaults(rawOptions, defaults)
  
  // 转换
  options = transformOptions(options, transformers)
  
  return options
}

module.exports = {
  validateOptions,
  applyDefaults,
  transformOptions,
  processCommandOptions
}
```

## 交互式体验设计

### Inquirer.js交互设计

```javascript
// src/utils/prompt.js
const inquirer = require('inquirer')
const chalk = require('chalk')

/**
 * 交互式提示工具集
 */

// 项目初始化交互
async function promptForProject() {
  const questions = [
    {
      type: 'input',
      name: 'projectName',
      message: 'Project name:',
      default: 'my-project',
      validate: (input) => {
        if (!input.trim()) {
          return 'Project name is required'
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(input)) {
          return 'Project name can only contain letters, numbers, underscore and hyphen'
        }
        return true
      },
      transformer: (input) => chalk.cyan(input)
    },
    {
      type: 'input',
      name: 'description',
      message: 'Project description:',
      default: 'A awesome project'
    },
    {
      type: 'list',
      name: 'template',
      message: 'Select project template:',
      choices: [
        { name: 'Vue 3 + Vite', value: 'vue-vite' },
        { name: 'React + Vite', value: 'react-vite' },
        { name: 'Node.js + TypeScript', value: 'node-ts' },
        { name: 'Python + FastAPI', value: 'python-fastapi' },
        { name: 'Custom (advanced)', value: 'custom' }
      ],
      default: 'vue-vite'
    },
    {
      type: 'checkbox',
      name: 'features',
      message: 'Select features to include:',
      choices: [
        { name: 'TypeScript', value: 'typescript', checked: true },
        { name: 'ESLint + Prettier', value: 'linter', checked: true },
        { name: 'Unit Testing', value: 'testing' },
        { name: 'CI/CD (GitHub Actions)', value: 'cicd' },
        { name: 'Docker configuration', value: 'docker' }
      ]
    },
    {
      type: 'confirm',
      name: 'git',
      message: 'Initialize Git repository?',
      default: true
    },
    {
      type: 'confirm',
      name: 'install',
      message: 'Install dependencies now?',
      default: true
    }
  ]
  
  return inquirer.prompt(questions)
}

// 配置更新交互
async function promptForConfig(key, currentValue) {
  const questions = [
    {
      type: 'input',
      name: 'value',
      message: `Enter new value for ${key}:`,
      default: currentValue,
      validate: (input) => {
        if (input.trim() === '') {
          return 'Value cannot be empty'
        }
        return true
      }
    }
  ]
  
  return inquirer.prompt(questions)
}

// 文件冲突处理交互
async function promptForFileConflict(filePath) {
  const questions = [
    {
      type: 'expand',
      name: 'action',
      message: `File ${filePath} already exists. Choose an action:`,
      choices: [
        { key: 'o', name: 'Overwrite', value: 'overwrite' },
        { key: 'a', name: 'Overwrite all', value: 'overwrite-all' },
        { key: 's', name: 'Skip', value: 'skip' },
        { key: 'x', name: 'Abort', value: 'abort' }
      ],
      default: 'o'
    }
  ]
  
  return inquirer.prompt(questions)
}

// 多步骤确认交互
async function promptForMultiStep(steps) {
  const results = []
  
  for (const step of steps) {
    const answer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'proceed',
        message: step.message,
        default: true
      }
    ])
    
    if (!answer.proceed) {
      break
    }
    
    results.push({ step: step.name, completed: true })
  }
  
  return results
}

// 高级交互示例：自动补全
async function promptWithAutoComplete(message, options) {
  // 使用autocomplete插件
  inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'))
  
  return inquirer.prompt([
    {
      type: 'autocomplete',
      name: 'selection',
      message: message,
      source: async (answersSoFar, input) => {
        input = input || ''
        return options.filter(opt => 
          opt.name.toLowerCase().includes(input.toLowerCase())
        )
      }
    }
  ])
}

module.exports = {
  promptForProject,
  promptForConfig,
  promptForFileConflict,
  promptForMultiStep,
  promptWithAutoComplete
}
```

### 进度与状态展示

```javascript
// src/utils/logger.js
const chalk = require('chalk')
const ora = require('ora')
const figures = require('figures')

/**
 * 日志与进度展示工具
 */

class Logger {
  constructor(options = {}) {
    this.verbose = options.verbose || false
    this.spinner = null
  }
  
  // 基本日志方法
  log(message) {
    console.log(message)
  }
  
  info(message) {
    console.log(chalk.blue(figures.info), message)
  }
  
  success(message) {
    console.log(chalk.green(figures.tick), message)
  }
  
  warn(message) {
    console.log(chalk.yellow(figures.warning), message)
  }
  
  error(message) {
    console.log(chalk.red(figures.cross), message)
  }
  
  // 详细日志（仅verbose模式）
  debug(message) {
    if (this.verbose) {
      console.log(chalk.gray('[debug]'), message)
    }
  }
  
  // 分节标题
  title(message) {
    console.log()
    console.log(chalk.bold.underline(message))
    console.log()
  }
  
  // 步骤日志
  step(stepNumber, message) {
    console.log(chalk.cyan(`[${stepNumber}]`), message)
  }
  
  // 启动spinner
  startSpinner(message) {
    this.spinner = ora({
      text: message,
      spinner: 'dots'
    }).start()
  }
  
  // 更新spinner消息
  updateSpinner(message) {
    if (this.spinner) {
      this.spinner.text = message
    }
  }
  
  // spinner成功
  stopSpinner(message) {
    if (this.spinner) {
      this.spinner.succeed(message)
      this.spinner = null
    }
  }
  
  // spinner失败
  failSpinner(message) {
    if (this.spinner) {
      this.spinner.fail(message)
      this.spinner = null
    }
  }
  
  // 表格输出
  table(data, columns) {
    const Table = require('cli-table3')
    const table = new Table({
      head: columns,
      style: {
        head: ['cyan'],
        border: ['gray']
      }
    })
    
    data.forEach(row => table.push(row))
    console.log(table.toString())
  }
  
  // 清屏
  clear() {
    console.clear()
  }
  
  // 新行
  newLine(count = 1) {
    for (let i = 0; i < count; i++) {
      console.log()
    }
  }
}

// 进度条
class ProgressBar {
  constructor(total, options = {}) {
    this.total = total
    this.current = 0
    this.width = options.width || 40
    this.completeChar = options.completeChar || '█'
    this.incompleteChar = options.incompleteChar || '░'
  }
  
  update(current, message = '') {
    this.current = current
    const percent = Math.round((current / this.total) * 100)
    const complete = Math.round((current / this.total) * this.width)
    const incomplete = this.width - complete
    
    const bar = this.completeChar.repeat(complete) + 
                this.incompleteChar.repeat(incomplete)
    
    process.stdout.write(
      `\r[${bar}] ${percent}% ${message}`
    )
    
    if (current === this.total) {
      process.stdout.write('\n')
    }
  }
  
  increment(message) {
    this.update(this.current + 1, message)
  }
}

module.exports = {
  Logger,
  ProgressBar
}
```

## 命令实现实践

### init命令实现

```javascript
// src/commands/init.js
const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const { Logger } = require('../utils/logger')
const { promptForProject, promptForFileConflict } = require('../utils/prompt')
const { execSync } = require('../utils/spawn')
const templates = require('../templates')

const logger = new Logger()

/**
 * init命令实现
 */
async function init(projectName, options) {
  try {
    // 交互式获取配置（如果未提供projectName）
    const config = projectName 
      ? { projectName, ...options }
      : await promptForProject()
    
    const targetDir = path.resolve(process.cwd(), config.projectName)
    
    // 检查目录是否存在
    if (fs.existsSync(targetDir)) {
      if (options.force) {
        logger.warn(`Removing existing directory: ${targetDir}`)
        fs.removeSync(targetDir)
      } else {
        const { action } = await promptForFileConflict(targetDir)
        
        if (action === 'overwrite') {
          fs.removeSync(targetDir)
        } else if (action === 'abort') {
          logger.info('Operation aborted')
          return
        } else if (action === 'skip') {
          logger.info(`Skipping ${targetDir}`)
          return
        }
      }
    }
    
    // 创建项目目录
    logger.step(1, 'Creating project directory')
    fs.ensureDirSync(targetDir)
    
    // 复制模板文件
    logger.step(2, 'Copying template files')
    logger.startSpinner('Copying...')
    
    const templatePath = templates.getTemplatePath(config.template)
    await copyTemplateFiles(templatePath, targetDir, config)
    
    logger.stopSpinner('Template copied')
    
    // 更新package.json
    logger.step(3, 'Updating package.json')
    updatePackageJson(targetDir, config)
    
    // 初始化Git
    if (config.git) {
      logger.step(4, 'Initializing Git repository')
      execSync('git', ['init'], { cwd: targetDir })
      execSync('git', ['add', '.'], { cwd: targetDir })
      execSync('git', ['commit', '-m', 'Initial commit'], { cwd: targetDir })
    }
    
    // 安装依赖
    if (config.install) {
      logger.step(5, 'Installing dependencies')
      logger.startSpinner('Installing...')
      
      execSync('npm', ['install'], { cwd: targetDir, stdio: 'inherit' })
      
      logger.stopSpinner('Dependencies installed')
    }
    
    // 完成
    logger.newLine()
    logger.success(`Project ${chalk.cyan(config.projectName)} created successfully!`)
    logger.newLine()
    logger.info('Next steps:')
    logger.log(`  cd ${config.projectName}`)
    logger.log('  npm run dev')
    logger.newLine()
    
  } catch (error) {
    logger.error('Failed to create project')
    logger.error(error.message)
    process.exit(1)
  }
}

// 复制模板文件
async function copyTemplateFiles(templatePath, targetDir, config) {
  const files = await fs.readdir(templatePath)
  
  for (const file of files) {
    const srcPath = path.join(templatePath, file)
    const destPath = path.join(targetDir, file)
    
    if (fs.statSync(srcPath).isDirectory()) {
      await copyTemplateFiles(srcPath, destPath, config)
    } else {
      // 处理模板变量替换
      let content = await fs.readFile(srcPath, 'utf-8')
      content = replaceTemplateVars(content, config)
      await fs.writeFile(destPath, content)
    }
  }
}

// 模板变量替换
function replaceTemplateVars(content, config) {
  return content
    .replace(/\{\{projectName\}\}/g, config.projectName)
    .replace(/\{\{description\}\}/g, config.description)
    .replace(/\{\{template\}\}/g, config.template)
}

// 更新package.json
function updatePackageJson(targetDir, config) {
  const pkgPath = path.join(targetDir, 'package.json')
  const pkg = fs.readJsonSync(pkgPath)
  
  pkg.name = config.projectName
  pkg.description = config.description
  
  fs.writeJsonSync(pkgPath, pkg, { spaces: 2 })
}

module.exports = init
```

### config命令实现

```javascript
// src/commands/config.js
const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const { Logger } = require('../utils/logger')
const { promptForConfig } = require('../utils/prompt')

const logger = new Logger()

// 配置文件路径
const CONFIG_FILE = path.join(process.cwd(), '.my-cli.config.json')

/**
 * config命令实现
 */
async function config(action, options) {
  try {
    // 确保配置文件存在
    if (!fs.existsSync(CONFIG_FILE)) {
      fs.writeJsonSync(CONFIG_FILE, {}, { spaces: 2 })
    }
    
    const currentConfig = fs.readJsonSync(CONFIG_FILE)
    
    switch (action) {
      case 'list':
        listConfig(currentConfig)
        break
      
      case 'get':
        getConfigValue(currentConfig, options.key)
        break
      
      case 'set':
        await setConfigValue(currentConfig, options.key, options.value)
        break
      
      case 'delete':
        deleteConfigValue(currentConfig, options.key)
        break
      
      case 'reset':
        resetConfig()
        break
      
      default:
        logger.error(`Unknown action: ${action}`)
        logger.info('Valid actions: list, get, set, delete, reset')
    }
    
  } catch (error) {
    logger.error('Failed to manage config')
    logger.error(error.message)
    process.exit(1)
  }
}

// 列出所有配置
function listConfig(config) {
  logger.title('Current Configuration')
  
  if (Object.keys(config).length === 0) {
    logger.info('No configuration set')
    return
  }
  
  const data = Object.entries(config).map(([key, value]) => [key, value])
  logger.table(data, ['Key', 'Value'])
}

// 获取配置值
function getConfigValue(config, key) {
  if (!key) {
    logger.error('Key is required for get action')
    return
  }
  
  if (config[key] === undefined) {
    logger.warn(`Key '${key}' not found in config`)
    return
  }
  
  logger.log(chalk.cyan(key) + ':', config[key])
}

// 设置配置值
async function setConfigValue(config, key, value) {
  if (!key) {
    logger.error('Key is required for set action')
    return
  }
  
  // 如果未提供value，交互式获取
  if (!value) {
    const { newValue } = await promptForConfig(key, config[key])
    value = newValue
  }
  
  config[key] = value
  fs.writeJsonSync(CONFIG_FILE, config, { spaces: 2 })
  
  logger.success(`Set ${chalk.cyan(key)} = ${chalk.yellow(value)}`)
}

// 删除配置值
function deleteConfigValue(config, key) {
  if (!key) {
    logger.error('Key is required for delete action')
    return
  }
  
  if (config[key] === undefined) {
    logger.warn(`Key '${key}' not found in config`)
    return
  }
  
  delete config[key]
  fs.writeJsonSync(CONFIG_FILE, config, { spaces: 2 })
  
  logger.success(`Deleted key ${chalk.cyan(key)}`)
}

// 重置配置
function resetConfig() {
  fs.writeJsonSync(CONFIG_FILE, {}, { spaces: 2 })
  logger.success('Configuration reset to empty')
}

module.exports = config
```

## 发布与维护

### npm发布流程

```markdown
# CLI工具发布流程

## 1. 准备发布
- 确保测试通过
- 更新CHANGELOG
- 确认版本号
- 检查package.json

## 2. 版本管理
npm version major|minor|patch

## 3. 发布到npm
npm publish

## 4. 发布验证
npm info my-cli
npm install -g my-cli

## 5. 发布通知
- GitHub Release创建
- 社交媒体公告
- 文档更新
```

### 版本发布自动化

```yaml
# .github/workflows/release.yml

name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test

  publish:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## 最佳实践总结

1. **架构清晰**：bin入口、src模块化、templates分离
2. **参数规范**：Commander.js统一处理，验证完备
3. **交互友好**：Inquirer交互设计，progress展示
4. **错误处理**：异常捕获，友好提示
5. **文档完善**：README、USAGE、CHANGELOG齐全
6. **测试覆盖**：单元测试、集成测试覆盖
7. **持续维护**：版本管理、发布自动化、Issue响应

通过系统化的开发流程，打造出易用、稳定、可扩展的CLI工具，为开发者提效赋能。