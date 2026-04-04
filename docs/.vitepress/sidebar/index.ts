// Auto-generated sidebar configuration
// Run: npx tsx docs/.vitepress/scripts/generateSidebar.ts
//
// Structure:
// - /ai/, /backend/, /blog/: 单一 sidebar，子目录折叠
// - /projects/: 概览 sidebar，显示各子项目入口
// - /projects/demos/, /projects/experiments/, etc: 独立 sidebar，仅显示当前子项目

import type { DefaultTheme } from 'vitepress'

export const sidebar: DefaultTheme.Config['sidebar'] = {
  "/ai/": {
    "base": "/ai/",
    "items": [
      {
        "text": "computer vision",
        "collapsed": true,
        "items": [
          {
            "text": "人脸识别原理：从检测到识别",
            "link": "computer-vision/face-recognition-principles"
          },
          {
            "text": "图像分类实战：从数据到模型",
            "link": "computer-vision/image-classification-practice"
          },
          {
            "text": "图像分割技术：语义分割与实例分割",
            "link": "computer-vision/image-segmentation-techniques"
          },
          {
            "text": "OCR文字识别实践：从图像到文本",
            "link": "computer-vision/ocr-text-recognition"
          },
          {
            "text": "目标检测YOLO教程：从原理到实践",
            "link": "computer-vision/yolo-object-detection"
          }
        ]
      },
      {
        "text": "deep learning",
        "collapsed": true,
        "items": [
          {
            "text": "CNN架构设计：卷积神经网络原理与实战",
            "link": "deep-learning/cnn-architecture-design"
          },
          {
            "text": "神经网络基础入门：从感知机到多层网络",
            "link": "deep-learning/neural-network-basics"
          },
          {
            "text": "深度学习优化技巧：从训练到调参",
            "link": "deep-learning/optimization-techniques"
          },
          {
            "text": "PyTorch框架教程：从入门到实战",
            "link": "deep-learning/pytorch-framework-tutorial"
          },
          {
            "text": "RNN序列建模：循环神经网络原理与应用",
            "link": "deep-learning/rnn-sequence-modeling"
          }
        ]
      },
      {
        "text": "llm",
        "collapsed": true,
        "items": [
          {
            "text": "GPT模型原理深度解析",
            "link": "llm/gpt-model-principles"
          },
          {
            "text": "LLM应用开发指南：从理论到实践",
            "link": "llm/llm-application-development"
          },
          {
            "text": "大模型微调技术：从全参数到高效微调",
            "link": "llm/llm-fine-tuning-techniques"
          },
          {
            "text": "Prompt工程实践：高效利用大语言模型",
            "link": "llm/prompt-engineering-practice"
          },
          {
            "text": "RAG检索增强生成：让LLM拥有外部知识",
            "link": "llm/rag-retrieval-augmented-generation"
          }
        ]
      },
      {
        "text": "machine learning",
        "collapsed": true,
        "items": [
          {
            "text": "特征工程实践：数据预处理与特征构建",
            "link": "machine-learning/feature-engineering-practice"
          },
          {
            "text": "机器学习数学基础：从概率到优化",
            "link": "machine-learning/math-fundamentals"
          },
          {
            "text": "模型评估方法：从指标到验证策略",
            "link": "machine-learning/model-evaluation-methods"
          },
          {
            "text": "Scikit-learn实战技巧：高效机器学习开发",
            "link": "machine-learning/sklearn-practical-tips"
          },
          {
            "text": "监督学习算法详解：从理论到实践",
            "link": "machine-learning/supervised-learning-algorithms"
          }
        ]
      },
      {
        "text": "nlp",
        "collapsed": true,
        "items": [
          {
            "text": "NER命名实体识别：从规则到深度学习",
            "link": "nlp/ner-named-entity-recognition"
          },
          {
            "text": "情感分析实战：从文本到情感判断",
            "link": "nlp/sentiment-analysis-practice"
          },
          {
            "text": "文本预处理技术：从原始文本到结构化数据",
            "link": "nlp/text-preprocessing-techniques"
          },
          {
            "text": "Transformer架构分析：注意力机制的核心原理",
            "link": "nlp/transformer-architecture-analysis"
          },
          {
            "text": "词向量模型详解：从Word2Vec到FastText",
            "link": "nlp/word-embedding-models"
          }
        ]
      }
    ]
  },
  "/backend/": {
    "base": "/backend/",
    "items": [
      {
        "text": "architecture",
        "collapsed": true,
        "items": [
          {
            "text": "架构设计原则总结",
            "link": "architecture/architecture-design-principles"
          },
          {
            "text": "清洁架构理念",
            "link": "architecture/clean-architecture"
          },
          {
            "text": "DDD领域驱动设计",
            "link": "architecture/ddd-domain-driven-design"
          },
          {
            "text": "六边形架构实践",
            "link": "architecture/hexagonal-architecture"
          },
          {
            "text": "MVC架构模式详解",
            "link": "architecture/mvc-architecture-pattern"
          }
        ]
      },
      {
        "text": "database",
        "collapsed": true,
        "items": [
          {
            "text": "数据库事务处理详解",
            "link": "database/database-transaction-processing"
          },
          {
            "text": "MySQL索引优化实战",
            "link": "database/mysql-index-optimization"
          },
          {
            "text": "PostgreSQL高级特性",
            "link": "database/postgresql-advanced-features"
          },
          {
            "text": "Redis缓存应用实践",
            "link": "database/redis-cache-practice"
          },
          {
            "text": "SQL性能优化技巧",
            "link": "database/sql-performance-optimization"
          }
        ]
      },
      {
        "text": "java",
        "collapsed": true,
        "items": [
          {
            "text": "Java并发编程深入理解",
            "link": "java/java-concurrent-programming"
          },
          {
            "text": "Java设计模式实践",
            "link": "java/java-design-patterns"
          },
          {
            "text": "Java新特性解读",
            "link": "java/java-new-features"
          },
          {
            "text": "Java性能调优指南",
            "link": "java/java-performance-tuning"
          },
          {
            "text": "JVM内存模型详解",
            "link": "java/jvm-memory-model"
          }
        ]
      },
      {
        "text": "microservices",
        "collapsed": true,
        "items": [
          {
            "text": "Docker容器化部署",
            "link": "microservices/docker-container-deployment"
          },
          {
            "text": "Kubernetes编排入门",
            "link": "microservices/kubernetes-orchestration"
          },
          {
            "text": "微服务架构设计原则",
            "link": "microservices/microservices-design-principles"
          },
          {
            "text": "服务网格技术解析",
            "link": "microservices/service-mesh-technology"
          }
        ]
      },
      {
        "text": "spring boot",
        "collapsed": true,
        "items": [
          {
            "text": "Spring Boot自动配置原理",
            "link": "spring-boot/spring-boot-auto-configuration"
          },
          {
            "text": "Spring Boot快速入门",
            "link": "spring-boot/spring-boot-quick-start"
          },
          {
            "text": "Spring Cloud微服务入门",
            "link": "spring-boot/spring-cloud-microservices"
          },
          {
            "text": "Spring Data JPA实战",
            "link": "spring-boot/spring-data-jpa-practice"
          },
          {
            "text": "Spring Security安全配置",
            "link": "spring-boot/spring-security-config"
          }
        ]
      }
    ]
  },
  "/blog/": {
    "base": "/blog/",
    "items": [
      {
        "text": "experiences",
        "collapsed": true,
        "items": [
          {
            "text": "代码重构实践经验分享",
            "link": "experiences/code-refactoring-practice"
          },
          {
            "text": "开源贡献的心路历程",
            "link": "experiences/open-source-contribution-journey"
          },
          {
            "text": "程序员成长之路的心路历程",
            "link": "experiences/programmer-growth-journey"
          },
          {
            "text": "团队协作的感悟与心得",
            "link": "experiences/team-collaboration-insights"
          },
          {
            "text": "技术选型的经验与思考",
            "link": "experiences/technology-selection-experience"
          }
        ]
      },
      {
        "text": "reviews",
        "collapsed": true,
        "items": [
          {
            "text": "2025前端技术趋势展望",
            "link": "reviews/2025-frontend-trends"
          },
          {
            "text": "新兴前端框架评测分析",
            "link": "reviews/emerging-frameworks-review"
          },
          {
            "text": "前端开发工具推荐精选",
            "link": "reviews/frontend-tools-recommendation"
          },
          {
            "text": "编程语言选择深度分析",
            "link": "reviews/programming-languages-analysis"
          },
          {
            "text": "React与Vue框架对比分析",
            "link": "reviews/react-vs-vue-comparison"
          }
        ]
      },
      {
        "text": "tech articles",
        "collapsed": true,
        "items": [
          {
            "text": "前端工程化最佳实践",
            "link": "tech-articles/frontend-engineering-best-practices"
          },
          {
            "text": "Git工作流规范与最佳实践",
            "link": "tech-articles/git-workflow-best-practices"
          },
          {
            "text": "TypeScript高级类型技巧",
            "link": "tech-articles/typescript-advanced-types"
          },
          {
            "text": "Vue3响应式原理深入理解",
            "link": "tech-articles/vue3-reactivity-deep-dive"
          },
          {
            "text": "现代Web应用架构设计实践",
            "link": "tech-articles/web-architecture-design"
          },
          {
            "text": "Web性能优化实战指南",
            "link": "tech-articles/web-performance-optimization"
          }
        ]
      },
      {
        "text": "thoughts",
        "collapsed": true,
        "items": [
          {
            "text": "技术人的职业思考",
            "link": "thoughts/career-reflections"
          },
          {
            "text": "代码与人生",
            "link": "thoughts/code-and-life"
          },
          {
            "text": "持续学习之道",
            "link": "thoughts/continuous-learning"
          },
          {
            "text": "开源精神感悟",
            "link": "thoughts/open-source-spirit"
          },
          {
            "text": "技术债务的处理之道",
            "link": "thoughts/technical-debt-reflections"
          }
        ]
      },
      {
        "text": "tutorials",
        "collapsed": true,
        "items": [
          {
            "text": "Docker入门实践指南",
            "link": "tutorials/docker-introduction-guide"
          },
          {
            "text": "Git分支管理完全指南",
            "link": "tutorials/git-branch-management-guide"
          },
          {
            "text": "Markdown 功能测试",
            "link": "tutorials/markdown-test"
          },
          {
            "text": "Markdown写作技巧与实践",
            "link": "tutorials/markdown-writing-guide"
          },
          {
            "text": "VitePress博客搭建完整教程",
            "link": "tutorials/vitepress-blog-setup-tutorial"
          },
          {
            "text": "从零搭建Vue3项目完整指南",
            "link": "tutorials/vue3-project-setup-guide"
          }
        ]
      },
      {
        "text": "示例文章 - VitePress 技术博客搭建",
        "link": "sample-post"
      }
    ]
  },
  "/projects/demos/": {
    "base": "/projects/demos/",
    "items": [
      {
        "text": "Go微服务架构示例与实践",
        "link": "go-microservice-demo"
      },
      {
        "text": "Python数据处理示例与分析实践",
        "link": "python-data-processing-demo"
      },
      {
        "text": "React Hooks实践示例与模式探索",
        "link": "react-hooks-practice-demo"
      },
      {
        "text": "Spring Boot REST API示例项目实战",
        "link": "spring-boot-rest-api-demo"
      },
      {
        "text": "Vue3组件库示例与最佳实践",
        "link": "vue3-component-library-demo"
      }
    ]
  },
  "/projects/experiments/": {
    "base": "/projects/experiments/",
    "items": [
      {
        "text": "架构方案验证方法与实践",
        "link": "architecture-verification"
      },
      {
        "text": "新技术探索实验方法论与实践",
        "link": "new-technology-exploration"
      },
      {
        "text": "性能对比测试方法论与实践",
        "link": "performance-comparison-testing"
      },
      {
        "text": "原型开发实践与快速验证方法论",
        "link": "prototype-development-practice"
      },
      {
        "text": "技术可行性分析方法论与实践",
        "link": "technical-feasibility-analysis"
      }
    ]
  },
  "/projects/hcontext/": {
    "base": "/projects/hcontext/",
    "items": [
      {
        "text": "Algolia搜索功能集成实践",
        "link": "algolia-search-integration"
      },
      {
        "text": "Giscus评论系统配置指南",
        "link": "giscus-comments-setup"
      },
      {
        "text": "GitHub Actions部署与CI/CD配置实践",
        "link": "github-actions-deployment"
      },
      {
        "text": "HContext项目架构设计与实现",
        "link": "hcontext-architecture"
      },
      {
        "text": "VitePress主题定制开发实践",
        "link": "vitepress-theme-customization"
      }
    ]
  },
  "/projects/opensource/": {
    "base": "/projects/opensource/",
    "items": [
      {
        "text": "GitHub协作最佳实践与工作流优化",
        "link": "github-collaboration-best-practices"
      },
      {
        "text": "如何参与开源项目从零开始的实践指南",
        "link": "how-to-contribute-open-source"
      },
      {
        "text": "开源社区建设心得与运营实践",
        "link": "open-source-community-building"
      },
      {
        "text": "开源许可证选择指南与实践分析",
        "link": "open-source-license-guide"
      },
      {
        "text": "开源项目维护经验与心得分享",
        "link": "open-source-maintenance-experience"
      }
    ]
  },
  "/projects/tools/": {
    "base": "/projects/tools/",
    "items": [
      {
        "text": "自动化脚本编写与最佳实践指南",
        "link": "automation-scripts-best-practices"
      },
      {
        "text": "CLI命令行工具开发实战指南",
        "link": "cli-tool-development"
      },
      {
        "text": "代码生成器设计与实现深度解析",
        "link": "code-generator-implementation"
      },
      {
        "text": "开发辅助工具设计与实现",
        "link": "developer-tools-design"
      },
      {
        "text": "性能分析工具实践与应用",
        "link": "performance-analysis-tools"
      }
    ]
  },
  "/projects/": {
    "base": "/projects/",
    "items": [
      {
        "text": "Demos",
        "link": "demos/"
      },
      {
        "text": "Experiments",
        "link": "experiments/"
      },
      {
        "text": "HContext",
        "link": "hcontext/"
      },
      {
        "text": "开源项目",
        "link": "opensource/"
      },
      {
        "text": "开发工具",
        "link": "tools/"
      }
    ]
  }
}
