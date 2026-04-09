---
title: CLI工具开发实战：从想法到发布
date: 2025-03-05T00:00:00.000Z
categories:
  - projects
  - tools
tags:
  - CLI
  - 命令行工具
  - Node.js
  - 工具开发
description: 系统讲解CLI工具开发全流程，从参数解析到交互设计，从本地测试到npm发布，打造实用的命令行工具
author: HK意境
---

# CLI工具开发实战：从想法到发布

CLI工具是开发者日常工作的得力助手。本文将带你从零开发一个实用的命令行工具。

## 一、CLI工具设计

### 1.1 需求分析

**问题**：频繁执行重复性任务

**解决方案**：开发CLI工具自动化

**示例场景**：
- 项目脚手架
- 代码生成器
- 批量文件处理
- 数据格式转换

### 1.2 技术选型

| 语言 | 框架 | 适用场景 |
|------|------|---------|
| Node.js | Commander、Inquirer | 快速开发、生态丰富 |
| Python | Click、Typer | 数据处理、AI相关 |
| Go | Cobra | 高性能、跨平台 |
| Rust | Clap | 极致性能、安全 |

## 二、Node.js CLI开发

### 2.1 项目初始化

```bash
mkdir my-cli
cd my-cli
npm init -y
npm install commander inquirer chalk ora
```

### 2.2 入口文件

```javascript
#!/usr/bin/env node

const { program } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');

program
  .name('my-cli')
  .description('一个示例CLI工具')
  .version('1.0.0');

program
  .command('create <name>')
  .description('创建新项目')
  .option('-t, --template <template>', '模板类型', 'default')
  .action(async (name, options) => {
    console.log(chalk.blue(`创建项目: ${name}`));
    console.log(chalk.gray(`使用模板: ${options.template}`));
    
    // 交互式问答
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'framework',
        message: '选择框架:',
        choices: ['React', 'Vue', 'Angular']
      },
      {
        type: 'confirm',
        name: 'typescript',
        message: '使用TypeScript?',
        default: true
      }
    ]);
    
    console.log('配置:', answers);
    
    // 加载动画
    const spinner = ora('正在创建...').start();
    
    // 模拟异步操作
    setTimeout(() => {
      spinner.succeed('创建成功!');
    }, 2000);
  });

program.parse();
```

### 2.3 package.json配置

```json
{
  "name": "my-cli",
  "version": "1.0.0",
  "bin": {
    "my-cli": "./bin/index.js"
  },
  "files": [
    "bin",
    "templates"
  ],
  "keywords": ["cli", "scaffold"],
  "license": "MIT"
}
```

## 三、核心功能实现

### 3.1 参数解析

```javascript
// 位置参数
program
  .command('generate <type> <name>')
  .action((type, name) => {
    console.log(`生成 ${type}: ${name}`);
  });

// 可选参数
program
  .command('build')
  .option('-o, --output <dir>', '输出目录', 'dist')
  .option('-m, --minify', '压缩代码')
  .action((options) => {
    console.log('配置:', options);
  });
```

### 3.2 交互式UI

```javascript
// 输入框
{
  type: 'input',
  name: 'projectName',
  message: '项目名称:',
  default: 'my-project'
}

// 选择列表
{
  type: 'list',
  name: 'template',
  message: '选择模板:',
  choices: [
    { name: 'React', value: 'react' },
    { name: 'Vue', value: 'vue' },
    { name: 'Angular', value: 'angular' }
  ]
}

// 多选
{
  type: 'checkbox',
  name: 'features',
  message: '选择功能:',
  choices: ['Router', 'Vuex', 'ESLint']
}

// 确认
{
  type: 'confirm',
  name: 'install',
  message: '安装依赖?',
  default: true
}
```

### 3.3 文件操作

```javascript
const fs = require('fs-extra');
const path = require('path');

// 创建目录
await fs.ensureDir('src/components');

// 复制模板
await fs.copy(templatePath, targetPath);

// 写入文件
await fs.writeJson('package.json', packageJson, { spaces: 2 });

// 读取模板
const template = await fs.readFile('template.md', 'utf-8');
const content = template.replace(/\{\{name\}\}/g, projectName);
```

### 3.4 模板渲染

```javascript
const ejs = require('ejs');

const template = `
# <%= name %>

<%= description %>

## 安装
\`\`\`bash
npm install
\`\`\`
`;

const content = ejs.render(template, {
  name: 'my-project',
  description: '一个示例项目'
});
```

## 四、高级功能

### 4.1 子进程执行

```javascript
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// 执行命令
async function installDependencies(projectPath) {
  const spinner = ora('安装依赖...').start();
  
  try {
    await execPromise('npm install', { cwd: projectPath });
    spinner.succeed('依赖安装成功');
  } catch (error) {
    spinner.fail('安装失败');
    console.error(error);
  }
}
```

### 4.2 配置文件

```javascript
const cosmiconfig = require('cosmiconfig');

// 查找配置文件 (.myclirc, my-cli.config.js, package.json)
const explorer = cosmiconfig('my-cli');
const result = explorer.search();

if (result) {
  console.log('配置:', result.config);
}
```

### 4.3 插件机制

```javascript
class PluginLoader {
  constructor() {
    this.plugins = [];
  }
  
  load(pluginPath) {
    const plugin = require(pluginPath);
    this.plugins.push(plugin);
  }
  
  apply(context) {
    this.plugins.forEach(plugin => plugin.apply(context));
  }
}
```

## 五、测试与调试

### 5.1 本地测试

```bash
# 链接到全局
npm link

# 测试命令
my-cli create test-project

# 取消链接
npm unlink
```

### 5.2 单元测试

```javascript
const assert = require('assert');
const { parseArgs } = require('../src/cli');

describe('CLI测试', () => {
  it('参数解析', () => {
    const args = parseArgs(['--name', 'test']);
    assert.strictEqual(args.name, 'test');
  });
});
```

### 5.3 端到端测试

```javascript
const { execSync } = require('child_process');

describe('E2E测试', () => {
  it('创建项目', () => {
    execSync('my-cli create test-project');
    assert.ok(fs.existsSync('test-project'));
  });
});
```

## 六、发布到npm

### 6.1 准备工作

```bash
# 登录npm
npm login

# 检查包名是否可用
npm search my-cli
```

### 6.2 发布

```bash
# 发布
npm publish

# 发布beta版本
npm publish --tag beta
```

### 6.3 版本管理

```bash
# 升级补丁版本
npm version patch

# 升级次版本
npm version minor

# 升级主版本
npm version major
```

## 七、持续改进

### 7.1 错误处理

```javascript
process.on('uncaughtException', error => {
  console.error(chalk.red('错误:'), error.message);
  process.exit(1);
});

process.on('unhandledRejection', reason => {
  console.error(chalk.red('未处理的Promise拒绝:'), reason);
  process.exit(1);
});
```

### 7.2 日志系统

```javascript
const log = {
  info: (msg) => console.log(chalk.blue('ℹ'), msg),
  success: (msg) => console.log(chalk.green('✓'), msg),
  error: (msg) => console.log(chalk.red('✗'), msg),
  warn: (msg) => console.log(chalk.yellow('⚠'), msg)
};
```

### 7.3 更新检查

```javascript
const updateNotifier = require('update-notifier');
const pkg = require('./package.json');

updateNotifier({ pkg }).notify();
```

## 八、总结

CLI工具开发核心：

1. **设计**：明确需求，选对技术
2. **交互**：友好的用户体验
3. **功能**：文件操作、模板渲染
4. **测试**：本地测试、单元测试
5. **发布**：npm发布、版本管理
6. **维护**：错误处理、更新提示

记住：**好工具解决真实问题**。

---

**相关阅读**：
- [自动化脚本最佳实践](/projects/tools/automation-scripts)
- [Node.js工具开发](/projects/tools/nodejs-tools)