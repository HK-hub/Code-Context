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
            "text": "architecture",
            "collapsed": false,
            "items": [
              {
                "text": "cnn",
                "collapsed": false,
                "items": [
                  {
                    "text": "Convolution Layer Design",
                    "link": "deep-learning/architecture/cnn/convolution-layer-design"
                  },
                  {
                    "text": "Pooling Strategies",
                    "link": "deep-learning/architecture/cnn/pooling-strategies"
                  },
                  {
                    "text": "Residual Network Principles",
                    "link": "deep-learning/architecture/cnn/residual-network-principles"
                  }
                ]
              },
              {
                "text": "rnn",
                "collapsed": false,
                "items": [
                  {
                    "text": "Attention Mechanism",
                    "link": "deep-learning/architecture/rnn/attention-mechanism"
                  },
                  {
                    "text": "Lstm Vs Gru",
                    "link": "deep-learning/architecture/rnn/lstm-vs-gru"
                  },
                  {
                    "text": "Sequence To Sequence",
                    "link": "deep-learning/architecture/rnn/sequence-to-sequence"
                  }
                ]
              },
              {
                "text": "transformer",
                "collapsed": false,
                "items": [
                  {
                    "text": "Multi Head Attention Design",
                    "link": "deep-learning/architecture/transformer/multi-head-attention-design"
                  },
                  {
                    "text": "Position Encoding Methods",
                    "link": "deep-learning/architecture/transformer/position-encoding-methods"
                  },
                  {
                    "text": "Self Attention Mechanism",
                    "link": "deep-learning/architecture/transformer/self-attention-mechanism"
                  }
                ]
              }
            ]
          },
          {
            "text": "pytorch",
            "collapsed": false,
            "items": [
              {
                "text": "basics",
                "collapsed": false,
                "items": [
                  {
                    "text": "Autograd Mechanism",
                    "link": "deep-learning/pytorch/basics/autograd-mechanism"
                  },
                  {
                    "text": "Model Construction Patterns",
                    "link": "deep-learning/pytorch/basics/model-construction-patterns"
                  },
                  {
                    "text": "Tensor Operations Guide",
                    "link": "deep-learning/pytorch/basics/tensor-operations-guide"
                  }
                ]
              },
              {
                "text": "deployment",
                "collapsed": false,
                "items": [
                  {
                    "text": "Mobile Deployment Tips",
                    "link": "deep-learning/pytorch/deployment/mobile-deployment-tips"
                  },
                  {
                    "text": "Model Export Onnx",
                    "link": "deep-learning/pytorch/deployment/model-export-onnx"
                  },
                  {
                    "text": "Torchserve Deployment",
                    "link": "deep-learning/pytorch/deployment/torchserve-deployment"
                  }
                ]
              },
              {
                "text": "training",
                "collapsed": false,
                "items": [
                  {
                    "text": "Loss Function Selection",
                    "link": "deep-learning/pytorch/training/loss-function-selection"
                  },
                  {
                    "text": "Optimizer Algorithms",
                    "link": "deep-learning/pytorch/training/optimizer-algorithms"
                  },
                  {
                    "text": "Training Loop Optimization",
                    "link": "deep-learning/pytorch/training/training-loop-optimization"
                  }
                ]
              }
            ]
          },
          {
            "text": "training",
            "collapsed": false,
            "items": [
              {
                "text": "distributed",
                "collapsed": false,
                "items": [
                  {
                    "text": "Data Parallel Training",
                    "link": "deep-learning/training/distributed/data-parallel-training"
                  },
                  {
                    "text": "Mixed Precision Training",
                    "link": "deep-learning/training/distributed/mixed-precision-training"
                  },
                  {
                    "text": "Model Parallel Training",
                    "link": "deep-learning/training/distributed/model-parallel-training"
                  }
                ]
              },
              {
                "text": "optimization",
                "collapsed": false,
                "items": [
                  {
                    "text": "Batch Normalization",
                    "link": "deep-learning/training/optimization/batch-normalization"
                  },
                  {
                    "text": "Gradient Descent Variants",
                    "link": "deep-learning/training/optimization/gradient-descent-variants"
                  },
                  {
                    "text": "Learning Rate Scheduling",
                    "link": "deep-learning/training/optimization/learning-rate-scheduling"
                  }
                ]
              },
              {
                "text": "regularization",
                "collapsed": false,
                "items": [
                  {
                    "text": "Dropout Techniques",
                    "link": "deep-learning/training/regularization/dropout-techniques"
                  },
                  {
                    "text": "Early Stopping Strategies",
                    "link": "deep-learning/training/regularization/early-stopping-strategies"
                  },
                  {
                    "text": "Weight Decay Methods",
                    "link": "deep-learning/training/regularization/weight-decay-methods"
                  }
                ]
              }
            ]
          },
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
            "text": "gpt",
            "collapsed": false,
            "items": [
              {
                "text": "applications",
                "collapsed": false,
                "items": [
                  {
                    "text": "Chatbot Construction",
                    "link": "llm/gpt/applications/chatbot-construction"
                  },
                  {
                    "text": "Code Assistant Development",
                    "link": "llm/gpt/applications/code-assistant-development"
                  },
                  {
                    "text": "Text Generation Patterns",
                    "link": "llm/gpt/applications/text-generation-patterns"
                  }
                ]
              },
              {
                "text": "architecture",
                "collapsed": false,
                "items": [
                  {
                    "text": "Context Window Mechanism",
                    "link": "llm/gpt/architecture/context-window-mechanism"
                  },
                  {
                    "text": "Decoder Only Transformer",
                    "link": "llm/gpt/architecture/decoder-only-transformer"
                  },
                  {
                    "text": "Gpt Model Evolution",
                    "link": "llm/gpt/architecture/gpt-model-evolution"
                  }
                ]
              },
              {
                "text": "training",
                "collapsed": false,
                "items": [
                  {
                    "text": "Fine Tuning Methods",
                    "link": "llm/gpt/training/fine-tuning-methods"
                  },
                  {
                    "text": "Pre Training Process",
                    "link": "llm/gpt/training/pre-training-process"
                  },
                  {
                    "text": "Rlhf Alignment",
                    "link": "llm/gpt/training/rlhf-alignment"
                  }
                ]
              }
            ]
          },
          {
            "text": "prompt",
            "collapsed": false,
            "items": [
              {
                "text": "best practices",
                "collapsed": false,
                "items": [
                  {
                    "text": "Prompt Evaluation Metrics",
                    "link": "llm/prompt/best-practices/prompt-evaluation-metrics"
                  },
                  {
                    "text": "Prompt Security Defense",
                    "link": "llm/prompt/best-practices/prompt-security-defense"
                  },
                  {
                    "text": "Prompt Version Management",
                    "link": "llm/prompt/best-practices/prompt-version-management"
                  }
                ]
              },
              {
                "text": "engineering",
                "collapsed": false,
                "items": [
                  {
                    "text": "Multi Turn Conversation",
                    "link": "llm/prompt/engineering/multi-turn-conversation"
                  },
                  {
                    "text": "Prompt Template Design",
                    "link": "llm/prompt/engineering/prompt-template-design"
                  },
                  {
                    "text": "Structured Output Prompting",
                    "link": "llm/prompt/engineering/structured-output-prompting"
                  }
                ]
              },
              {
                "text": "techniques",
                "collapsed": false,
                "items": [
                  {
                    "text": "Chain Of Thought",
                    "link": "llm/prompt/techniques/chain-of-thought"
                  },
                  {
                    "text": "Few Shot Prompting",
                    "link": "llm/prompt/techniques/few-shot-prompting"
                  },
                  {
                    "text": "Zero Shot Prompting",
                    "link": "llm/prompt/techniques/zero-shot-prompting"
                  }
                ]
              }
            ]
          },
          {
            "text": "rag",
            "collapsed": false,
            "items": [
              {
                "text": "generation",
                "collapsed": false,
                "items": [
                  {
                    "text": "Answer Synthesis Patterns",
                    "link": "llm/rag/generation/answer-synthesis-patterns"
                  },
                  {
                    "text": "Context Integration Methods",
                    "link": "llm/rag/generation/context-integration-methods"
                  },
                  {
                    "text": "Multi Source Fusion",
                    "link": "llm/rag/generation/multi-source-fusion"
                  }
                ]
              },
              {
                "text": "optimization",
                "collapsed": false,
                "items": [
                  {
                    "text": "Chunk Strategies",
                    "link": "llm/rag/optimization/chunk-strategies"
                  },
                  {
                    "text": "Knowledge Graph Integration",
                    "link": "llm/rag/optimization/knowledge-graph-integration"
                  },
                  {
                    "text": "Reranking Techniques",
                    "link": "llm/rag/optimization/reranking-techniques"
                  }
                ]
              },
              {
                "text": "retrieval",
                "collapsed": false,
                "items": [
                  {
                    "text": "Hybrid Retrieval Strategies",
                    "link": "llm/rag/retrieval/hybrid-retrieval-strategies"
                  },
                  {
                    "text": "Similarity Search Algorithms",
                    "link": "llm/rag/retrieval/similarity-search-algorithms"
                  },
                  {
                    "text": "Vector Embedding Basics",
                    "link": "llm/rag/retrieval/vector-embedding-basics"
                  }
                ]
              }
            ]
          },
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
            "text": "mysql",
            "collapsed": false,
            "items": [
              {
                "text": "index optimization",
                "collapsed": false,
                "items": [
                  {
                    "text": "Btree Index Principles",
                    "link": "database/mysql/-optimization/btree-index-principles"
                  },
                  {
                    "text": "Composite Index Design",
                    "link": "database/mysql/-optimization/composite-index-design"
                  },
                  {
                    "text": "Index Maintenance Practice",
                    "link": "database/mysql/-optimization/index-maintenance-practice"
                  }
                ]
              },
              {
                "text": "query optimization",
                "collapsed": false,
                "items": [
                  {
                    "text": "Join Optimization Techniques",
                    "link": "database/mysql/query-optimization/join-optimization-techniques"
                  },
                  {
                    "text": "Slow Query Analysis",
                    "link": "database/mysql/query-optimization/slow-query-analysis"
                  },
                  {
                    "text": "Subquery Optimization",
                    "link": "database/mysql/query-optimization/subquery-optimization"
                  }
                ]
              },
              {
                "text": "storage engine",
                "collapsed": false,
                "items": [
                  {
                    "text": "Innodb Architecture",
                    "link": "database/mysql/storage-engine/innodb-architecture"
                  },
                  {
                    "text": "Myisam Vs Innodb",
                    "link": "database/mysql/storage-engine/myisam-vs-innodb"
                  },
                  {
                    "text": "Transaction Log Mechanism",
                    "link": "database/mysql/storage-engine/transaction-log-mechanism"
                  }
                ]
              }
            ]
          },
          {
            "text": "postgresql",
            "collapsed": false,
            "items": [
              {
                "text": "advanced features",
                "collapsed": false,
                "items": [
                  {
                    "text": "Jsonb Data Type",
                    "link": "database/postgresql/advanced-features/jsonb-data-type"
                  },
                  {
                    "text": "Table Inheritance",
                    "link": "database/postgresql/advanced-features/table-inheritance"
                  },
                  {
                    "text": "Window Functions",
                    "link": "database/postgresql/advanced-features/window-functions"
                  }
                ]
              },
              {
                "text": "extensions",
                "collapsed": false,
                "items": [
                  {
                    "text": "Pg Stat Statements",
                    "link": "database/postgresql/extensions/pg-stat-statements"
                  },
                  {
                    "text": "Pg Trgm Text Search",
                    "link": "database/postgresql/extensions/pg-trgm-text-search"
                  },
                  {
                    "text": "Postgis Geographic Data",
                    "link": "database/postgresql/extensions/postgis-geographic-data"
                  }
                ]
              },
              {
                "text": "performance tuning",
                "collapsed": false,
                "items": [
                  {
                    "text": "Index Types Comparison",
                    "link": "database/postgresql/performance-tuning/-types-comparison"
                  },
                  {
                    "text": "Query Plan Analysis",
                    "link": "database/postgresql/performance-tuning/query-plan-analysis"
                  },
                  {
                    "text": "Vacuum And Autovacuum",
                    "link": "database/postgresql/performance-tuning/vacuum-and-autovacuum"
                  }
                ]
              }
            ]
          },
          {
            "text": "redis",
            "collapsed": false,
            "items": [
              {
                "text": "cache patterns",
                "collapsed": false,
                "items": [
                  {
                    "text": "Cache Aside Pattern",
                    "link": "database/redis/cache-patterns/cache-aside-pattern"
                  },
                  {
                    "text": "Cache Penetration Defense",
                    "link": "database/redis/cache-patterns/cache-penetration-defense"
                  },
                  {
                    "text": "Distributed Cache Lock",
                    "link": "database/redis/cache-patterns/distributed-cache-lock"
                  }
                ]
              },
              {
                "text": "cluster",
                "collapsed": false,
                "items": [
                  {
                    "text": "Cluster Mode Deployment",
                    "link": "database/redis/cluster/cluster-mode-deployment"
                  },
                  {
                    "text": "Master Slave Replication",
                    "link": "database/redis/cluster/master-slave-replication"
                  },
                  {
                    "text": "Sentinel High Availability",
                    "link": "database/redis/cluster/sentinel-high-availability"
                  }
                ]
              },
              {
                "text": "data structures",
                "collapsed": false,
                "items": [
                  {
                    "text": "List And Set Operations",
                    "link": "database/redis/data-structures/list-and-set-operations"
                  },
                  {
                    "text": "Sorted Set Applications",
                    "link": "database/redis/data-structures/sorted-set-applications"
                  },
                  {
                    "text": "String And Hash Commands",
                    "link": "database/redis/data-structures/string-and-hash-commands"
                  }
                ]
              }
            ]
          },
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
            "text": "concurrency",
            "collapsed": false,
            "items": [
              {
                "text": "advanced patterns",
                "collapsed": false,
                "items": [
                  {
                    "text": "Future And Completablefuture",
                    "link": "java/concurrency/advanced-patterns/future-and-completablefuture"
                  },
                  {
                    "text": "Producer Consumer Pattern",
                    "link": "java/concurrency/advanced-patterns/producer-consumer-pattern"
                  },
                  {
                    "text": "Reactive Programming Intro",
                    "link": "java/concurrency/advanced-patterns/reactive-programming-intro"
                  }
                ]
              },
              {
                "text": "juc framework",
                "collapsed": false,
                "items": [
                  {
                    "text": "Atomic Classes Usage",
                    "link": "java/concurrency/juc-framework/atomic-classes-usage"
                  },
                  {
                    "text": "Concurrent Collections",
                    "link": "java/concurrency/juc-framework/concurrent-collections"
                  },
                  {
                    "text": "Executor Service Guide",
                    "link": "java/concurrency/juc-framework/executor-service-guide"
                  }
                ]
              },
              {
                "text": "thread fundamentals",
                "collapsed": false,
                "items": [
                  {
                    "text": "Synchronized Vs Lock",
                    "link": "java/concurrency/thread-fundamentals/synchronized-vs-lock"
                  },
                  {
                    "text": "Thread Lifecycle States",
                    "link": "java/concurrency/thread-fundamentals/thread-lifecycle-states"
                  },
                  {
                    "text": "Thread Pool Best Practices",
                    "link": "java/concurrency/thread-fundamentals/thread-pool-best-practices"
                  }
                ]
              }
            ]
          },
          {
            "text": "jvm",
            "collapsed": false,
            "items": [
              {
                "text": "class loading",
                "collapsed": false,
                "items": [
                  {
                    "text": "Class Loader Mechanism",
                    "link": "java/jvm/class-loading/class-loader-mechanism"
                  },
                  {
                    "text": "Dynamic Class Loading",
                    "link": "java/jvm/class-loading/dynamic-class-loading"
                  },
                  {
                    "text": "Jvm Bytecode Basics",
                    "link": "java/jvm/class-loading/jvm-bytecode-basics"
                  }
                ]
              },
              {
                "text": "memory model",
                "collapsed": false,
                "items": [
                  {
                    "text": "Garbage Collection Algorithms",
                    "link": "java/jvm/memory-model/garbage-collection-algorithms"
                  },
                  {
                    "text": "Heap And Stack Structure",
                    "link": "java/jvm/memory-model/heap-and-stack-structure"
                  },
                  {
                    "text": "Memory Allocation Strategies",
                    "link": "java/jvm/memory-model/memory-allocation-strategies"
                  }
                ]
              },
              {
                "text": "performance tuning",
                "collapsed": false,
                "items": [
                  {
                    "text": "Gc Log Analysis",
                    "link": "java/jvm/performance-tuning/gc-log-analysis"
                  },
                  {
                    "text": "Jvm Parameter Optimization",
                    "link": "java/jvm/performance-tuning/jvm-parameter-optimization"
                  },
                  {
                    "text": "Memory Leak Detection",
                    "link": "java/jvm/performance-tuning/memory-leak-detection"
                  }
                ]
              }
            ]
          },
          {
            "text": "spring",
            "collapsed": false,
            "items": [
              {
                "text": "core concepts",
                "collapsed": false,
                "items": [
                  {
                    "text": "Bean Lifecycle Management",
                    "link": "java/spring/core-concepts/bean-lifecycle-management"
                  },
                  {
                    "text": "Dependency Injection Patterns",
                    "link": "java/spring/core-concepts/dependency-injection-patterns"
                  },
                  {
                    "text": "Ioc Container Principles",
                    "link": "java/spring/core-concepts/ioc-container-principles"
                  }
                ]
              },
              {
                "text": "spring boot",
                "collapsed": false,
                "items": [
                  {
                    "text": "Actuator Monitoring",
                    "link": "java/spring/spring-boot/actuator-monitoring"
                  },
                  {
                    "text": "Auto Configuration Analysis",
                    "link": "java/spring/spring-boot/auto-configuration-analysis"
                  },
                  {
                    "text": "Starter Dependency Management",
                    "link": "java/spring/spring-boot/starter-dependency-management"
                  }
                ]
              },
              {
                "text": "spring cloud",
                "collapsed": false,
                "items": [
                  {
                    "text": "Config Server Setup",
                    "link": "java/spring/spring-cloud/config-server-setup"
                  },
                  {
                    "text": "Gateway Routing Patterns",
                    "link": "java/spring/spring-cloud/gateway-routing-patterns"
                  },
                  {
                    "text": "Service Discovery Eureka",
                    "link": "java/spring/spring-cloud/service-discovery-eureka"
                  }
                ]
              }
            ]
          },
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
            "text": "backend",
            "collapsed": false,
            "items": [
              {
                "text": "architecture",
                "collapsed": false,
                "items": [
                  {
                    "text": "Api Design Patterns",
                    "link": "tech-articles/backend/architecture/api-design-patterns"
                  },
                  {
                    "text": "Database Schema Design",
                    "link": "tech-articles/backend/architecture/database-schema-design"
                  },
                  {
                    "text": "Microservices Design",
                    "link": "tech-articles/backend/architecture/microservices-design"
                  }
                ]
              },
              {
                "text": "performance",
                "collapsed": false,
                "items": [
                  {
                    "text": "Cache Strategy Selection",
                    "link": "tech-articles/backend/performance/cache-strategy-selection"
                  },
                  {
                    "text": "Database Query Optimization",
                    "link": "tech-articles/backend/performance/database-query-optimization"
                  },
                  {
                    "text": "Server Performance Tuning",
                    "link": "tech-articles/backend/performance/server-performance-tuning"
                  }
                ]
              },
              {
                "text": "security",
                "collapsed": false,
                "items": [
                  {
                    "text": "Api Security Best Practices",
                    "link": "tech-articles/backend/security/api-security-best-practices"
                  },
                  {
                    "text": "Authentication Patterns",
                    "link": "tech-articles/backend/security/authentication-patterns"
                  },
                  {
                    "text": "Input Validation Defense",
                    "link": "tech-articles/backend/security/input-validation-defense"
                  }
                ]
              }
            ]
          },
          {
            "text": "frontend",
            "collapsed": false,
            "items": [
              {
                "text": "react",
                "collapsed": false,
                "items": [
                  {
                    "text": "Hooks Best Practices",
                    "link": "tech-articles/frontend/react/hooks-best-practices"
                  },
                  {
                    "text": "React Render Optimization",
                    "link": "tech-articles/frontend/react/react-render-optimization"
                  },
                  {
                    "text": "React State Management",
                    "link": "tech-articles/frontend/react/react-state-management"
                  }
                ]
              },
              {
                "text": "typescript",
                "collapsed": false,
                "items": [
                  {
                    "text": "Advanced Type Patterns",
                    "link": "tech-articles/frontend/typescript/advanced-type-patterns"
                  },
                  {
                    "text": "Generic Programming",
                    "link": "tech-articles/frontend/typescript/generic-programming"
                  },
                  {
                    "text": "Type Inference Mechanism",
                    "link": "tech-articles/frontend/typescript/type-inference-mechanism"
                  }
                ]
              },
              {
                "text": "vue",
                "collapsed": false,
                "items": [
                  {
                    "text": "Vue Performance Optimization",
                    "link": "tech-articles/frontend/vue/vue-performance-optimization"
                  },
                  {
                    "text": "Vue Reactivity Deep Dive",
                    "link": "tech-articles/frontend/vue/vue-reactivity-deep-dive"
                  },
                  {
                    "text": "Vue3 Composition Api",
                    "link": "tech-articles/frontend/vue/vue3-composition-api"
                  }
                ]
              }
            ]
          },
          {
            "text": "tools",
            "collapsed": false,
            "items": [
              {
                "text": "ci cd",
                "collapsed": false,
                "items": [
                  {
                    "text": "Automated Testing Integration",
                    "link": "tech-articles/tools/ci-cd/automated-testing-integration"
                  },
                  {
                    "text": "Deployment Automation",
                    "link": "tech-articles/tools/ci-cd/deployment-automation"
                  },
                  {
                    "text": "Github Actions Patterns",
                    "link": "tech-articles/tools/ci-cd/github-actions-patterns"
                  }
                ]
              },
              {
                "text": "docker",
                "collapsed": false,
                "items": [
                  {
                    "text": "Docker Compose Patterns",
                    "link": "tech-articles/tools/docker/docker-compose-patterns"
                  },
                  {
                    "text": "Docker Image Optimization",
                    "link": "tech-articles/tools/docker/docker-image-optimization"
                  },
                  {
                    "text": "Docker Networking Guide",
                    "link": "tech-articles/tools/docker/docker-networking-guide"
                  }
                ]
              },
              {
                "text": "git",
                "collapsed": false,
                "items": [
                  {
                    "text": "Git Hooks Automation",
                    "link": "tech-articles/tools/git/git-hooks-automation"
                  },
                  {
                    "text": "Git Internal Mechanism",
                    "link": "tech-articles/tools/git/git-internal-mechanism"
                  },
                  {
                    "text": "Git Workflow Strategies",
                    "link": "tech-articles/tools/git/git-workflow-strategies"
                  }
                ]
              }
            ]
          },
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
  },
  "/books/": {
    "base": "/books/",
    "items": [
      {
        "text": "ai",
        "collapsed": true,
        "items": [
          {
            "text": "deep learning",
            "collapsed": false,
            "items": [
              {
                "text": "Deep Learning Book",
                "link": "ai/deep-learning/deep-learning-book"
              },
              {
                "text": "Neural Network Design",
                "link": "ai/deep-learning/neural-network-design"
              },
              {
                "text": "Practical Deep Learning",
                "link": "ai/deep-learning/practical-deep-learning"
              }
            ]
          },
          {
            "text": "machine learning",
            "collapsed": false,
            "items": [
              {
                "text": "Hands On Machine Learning",
                "link": "ai/machine-learning/hands-on-machine-learning"
              },
              {
                "text": "Ml Algorithm Internals",
                "link": "ai/machine-learning/ml-algorithm-internals"
              },
              {
                "text": "Statistical Learning Methods",
                "link": "ai/machine-learning/statistical-learning-methods"
              }
            ]
          },
          {
            "text": "nlp",
            "collapsed": false,
            "items": [
              {
                "text": "Natural Language Processing",
                "link": "ai/nlp/natural-language-processing"
              },
              {
                "text": "Speech And Language Processing",
                "link": "ai/nlp/speech-and-language-processing"
              },
              {
                "text": "Transformer Revolution",
                "link": "ai/nlp/transformer-revolution"
              }
            ]
          }
        ]
      },
      {
        "text": "architecture",
        "collapsed": true,
        "items": [
          {
            "text": "ddd",
            "collapsed": false,
            "items": [
              {
                "text": "Ddd Domain Modeling",
                "link": "architecture/ddd/ddd-domain-modeling"
              },
              {
                "text": "Ddd Strategic Design",
                "link": "architecture/ddd/ddd-strategic-design"
              },
              {
                "text": "Ddd Tactical Patterns",
                "link": "architecture/ddd/ddd-tactical-patterns"
              }
            ]
          },
          {
            "text": "design patterns",
            "collapsed": false,
            "items": [
              {
                "text": "Distributed Systems Patterns",
                "link": "architecture/design-patterns/distributed-systems-patterns"
              },
              {
                "text": "Enterprise Patterns Summary",
                "link": "architecture/design-patterns/enterprise-patterns-summary"
              },
              {
                "text": "Gang Of Four Patterns",
                "link": "architecture/design-patterns/gang-of-four-patterns"
              }
            ]
          },
          {
            "text": "microservices",
            "collapsed": false,
            "items": [
              {
                "text": "Building Microservices",
                "link": "architecture/microservices/building-microservices"
              },
              {
                "text": "Microservices Architecture Book",
                "link": "architecture/microservices/microservices-architecture-book"
              },
              {
                "text": "Microservices Security",
                "link": "architecture/microservices/microservices-security"
              }
            ]
          }
        ]
      },
      {
        "text": "programming",
        "collapsed": true,
        "items": [
          {
            "text": "go",
            "collapsed": false,
            "items": [
              {
                "text": "Go Concurrency Patterns",
                "link": "programming/go/go-concurrency-patterns"
              },
              {
                "text": "Go Design Principles",
                "link": "programming/go/go-design-principles"
              },
              {
                "text": "Go Programming Blueprint",
                "link": "programming/go/go-programming-blueprint"
              }
            ]
          },
          {
            "text": "java",
            "collapsed": false,
            "items": [
              {
                "text": "Effective Java Summary",
                "link": "programming/java/effective-java-summary"
              },
              {
                "text": "Java Concurrency In Practice",
                "link": "programming/java/java-concurrency-in-practice"
              },
              {
                "text": "Java Performance Guide",
                "link": "programming/java/java-performance-guide"
              }
            ]
          },
          {
            "text": "python",
            "collapsed": false,
            "items": [
              {
                "text": "Fluent Python Notes",
                "link": "programming/python/fluent-python-notes"
              },
              {
                "text": "Python Performance Tuning",
                "link": "programming/python/python-performance-tuning"
              },
              {
                "text": "Python Tricks Collection",
                "link": "programming/python/python-tricks-collection"
              }
            ]
          }
        ]
      }
    ]
  }
}
