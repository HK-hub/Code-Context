---
title: MySQL索引优化实战
date: 2025-01-25T00:00:00.000Z
categories:
  - backend
  - database
tags:
  - MySQL
  - 索引优化
  - 查询优化
  - 数据库性能
  - SQL调优
description: MySQL索引原理、类型选择、优化策略与实战案例分析，提升数据库查询性能
author: HK意境
---

# MySQL索引优化实战

## 引言

索引是数据库性能优化的核心利器。合理设计的索引可以将查询性能提升数倍甚至数十倍，而不当的索引不仅无法提升性能，还会占用大量存储空间，降低写入效率。理解索引的原理和优化策略，对于数据库开发和运维至关重要。

MySQL作为最流行的开源关系型数据库，其InnoDB存储引擎使用B+树作为索引结构。本文将从索引的基础原理出发，详细介绍索引的类型、设计原则、优化策略，并通过实战案例展示索引优化的具体方法。

## 索引原理

### B+树结构

MySQL InnoDB存储引擎使用B+树作为索引的底层存储结构。B+树是一种多路平衡查找树，具有以下特点：

```
B+树结构示意图（3层）：

                    根节点
                   [20, 40]
                   /    |    \
                  /     |     \
        [10, 20] [30, 40] [50, 60]  中间节点
        /    |    /    |    /    |  
       /     |   /     |   /     |   
      5-10 10-20 20-30 30-40 40-50 50-60  叶子节点
      ↓     ↓    ↓     ↓    ↓     ↓
    数据页  数据页 数据页 数据页 数据页 数据页

特点：
1. 所有数据存储在叶子节点
2. 叶子节点通过双向链表连接
3. 非叶子节点只存储键值和指针
4. 树高度通常为2-4层
5. 每个节点可以存储大量键值
```

B+树的优势：

**查询效率稳定**：所有数据都在叶子节点，查询任何数据的路径长度相同，时间复杂度O(log n)。

**范围查询高效**：叶子节点通过链表连接，范围查询只需找到起点，顺序遍历即可。

**磁盘IO少**：树高度低（通常3层），一次查询最多3次磁盘IO。

**节点利用率高**：每个节点可存储大量键值，减少树高度。

### InnoDB页结构

InnoDB数据存储在页（Page）中，默认页大小16KB：

```
InnoDB页结构：

┌──────────────────────────────────────────┐
│ File Header (38字节) - 页通用信息         │
├──────────────────────────────────────────┤
│ Page Header (56字节) - 页专用信息         │
├──────────────────────────────────────────┤
│ Infimum + Supremum (26字节) - 最小最大记录 │
├──────────────────────────────────────────┤
│ User Records - 用户记录                   │
│ 行格式：                                  │
│ [记录头|主键|事务ID|回滚指针|其他字段]      │
├──────────────────────────────────────────┤
│ Free Space - 空闲空间                     │
├──────────────────────────────────────────┤
│ Page Directory - 页目录（槽位）           │
├──────────────────────────────────────────┤
│ File Trailer (8字节) - 校验和             │
└──────────────────────────────────────────┘

每页存储：
- 默认16KB
- 可存储数百到上千条记录
- 记录按主键排序
```

### 聚簇索引与非聚簇索引

**聚簇索引**

聚簇索引将数据和索引存储在一起，InnoDB的主键索引就是聚簇索引：

```sql
-- 聚簇索引结构
CREATE TABLE users (
    id INT PRIMARY KEY,           -- 聚簇索引
    username VARCHAR(50),
    email VARCHAR(100)
);

-- 聚簇索引叶子节点存储完整行数据
-- [id=1 | username='Alice' | email='alice@example.com']
-- [id=2 | username='Bob'   | email='bob@example.com']
```

聚簇索引特点：

- 数据按主键顺序存储
- 主键查询效率最高
- 范围查询效率高
- 一个表只能有一个聚簇索引

**非聚簇索引（二级索引）**

非聚簇索引存储索引键和主键值：

```sql
-- 二级索引
CREATE INDEX idx_username ON users(username);

-- 二级索引叶子节点存储
-- [username='Alice' | 主键id=1]
-- [username='Bob'   | 主键id=2]

-- 查询流程：
-- 1. 在idx_username中找到username='Alice'，得到主键id=1
-- 2. 回表：在聚簇索引中用id=1查找完整数据
```

非聚簇索引特点：

- 需要回表查询完整数据
- 可以创建多个
- 索引覆盖可避免回表

## 索引类型

### 主键索引

```sql
-- 创建表时定义主键
CREATE TABLE orders (
    order_id BIGINT PRIMARY KEY,
    user_id INT,
    product_id INT,
    amount DECIMAL(10,2),
    created_at TIMESTAMP
);

-- 修改表添加主键
ALTER TABLE orders ADD PRIMARY KEY (order_id);

-- 主键选择原则：
-- 1. 唯一且非空
-- 2. 尽量使用自增整数（避免页分裂）
-- 3. 避免使用UUID（随机插入导致大量页分裂）
```

### 唯一索引

```sql
-- 创建唯一索引
CREATE UNIQUE INDEX idx_email ON users(email);

-- 创建表时定义唯一键
CREATE TABLE users (
    id INT PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(100) UNIQUE
);

-- 复合唯一索引
CREATE UNIQUE INDEX idx_user_product ON user_products(user_id, product_id);
```

### 普通索引

```sql
-- 创建普通索引
CREATE INDEX idx_user_id ON orders(user_id);

-- 创建复合索引
CREATE INDEX idx_user_product_time ON orders(user_id, product_id, created_at);

-- 创建前缀索引（字符串列）
CREATE INDEX idx_email_prefix ON users(email(10));

-- 创建函数索引（MySQL 8.0+）
CREATE INDEX idx_lower_email ON users((LOWER(email)));
```

### 全文索引

```sql
-- 创建全文索引
CREATE FULLTEXT INDEX idx_content ON articles(title, content);

-- 全文搜索
SELECT * FROM articles 
WHERE MATCH(title, content) AGAINST('database optimization' IN NATURAL LANGUAGE MODE);

-- 布尔模式搜索
SELECT * FROM articles 
WHERE MATCH(title, content) AGAINST('+database +optimization' IN BOOLEAN MODE);
```

### 空间索引

```sql
-- 创建空间索引（需要GIS数据类型）
CREATE TABLE locations (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    coordinates POINT NOT NULL,
    SPATIAL INDEX idx_coords(coordinates)
);

-- 空间查询
SELECT * FROM locations 
WHERE ST_Distance_Sphere(coordinates, POINT(116.4, 39.9)) < 1000;
```

## 索引设计原则

### 选择合适的列

**高选择性列**

索引应该选择区分度高的列：

```sql
-- 计算选择性
SELECT COUNT(DISTINCT email) / COUNT(*) FROM users;  -- 接近1，适合索引
SELECT COUNT(DISTINCT gender) / COUNT(*) FROM users;  -- 接近0，不适合索引

-- 高选择性：email、username、phone
-- 低选择性：gender、status（少量状态值）
```

**WHERE条件列**

经常出现在WHERE条件中的列应该创建索引：

```sql
-- 查询模式分析
SELECT user_id, COUNT(*) as query_count 
FROM query_logs 
WHERE condition LIKE '%user_id%' 
GROUP BY user_id;

-- 为高频查询条件创建索引
CREATE INDEX idx_user_id ON orders(user_id);
```

**JOIN关联列**

JOIN操作关联的列应该创建索引：

```sql
-- JOIN查询
SELECT o.*, u.username 
FROM orders o 
JOIN users u ON o.user_id = u.id;

-- 为关联列创建索引
CREATE INDEX idx_user_id ON orders(user_id);  -- orders表
-- users.id是主键，已有索引
```

**ORDER BY和GROUP BY列**

排序和分组列考虑创建索引：

```sql
-- 排序查询
SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;
CREATE INDEX idx_created_at ON orders(created_at);

-- 分组查询
SELECT user_id, COUNT(*) FROM orders GROUP BY user_id;
CREATE INDEX idx_user_id ON orders(user_id);

-- 复合排序
SELECT * FROM orders ORDER BY user_id, created_at DESC;
CREATE INDEX idx_user_created ON orders(user_id, created_at);
```

### 复合索引设计

**最左前缀原则**

复合索引按最左前缀匹配：

```sql
-- 创建复合索引
CREATE INDEX idx_a_b_c ON table(a, b, c);

-- 可以使用索引的查询
WHERE a = 1                      -- 使用索引a部分
WHERE a = 1 AND b = 2            -- 使用索引a,b部分
WHERE a = 1 AND b = 2 AND c = 3  -- 使用索引a,b,c部分
WHERE a = 1 AND c = 3            -- 使用索引a部分（c无法使用）
WHERE a = 1 AND b = 2 ORDER BY c -- 使用索引a,b部分，排序也使用c

-- 无法使用索引的查询
WHERE b = 2                      -- 不满足最左前缀
WHERE b = 2 AND c = 3            -- 不满足最左前缀
WHERE c = 3                      -- 不满足最左前缀
```

**列顺序选择**

将最常用的列放在最前面：

```sql
-- 查询模式1：WHERE user_id = ? AND status = ?
-- 查询模式2：WHERE user_id = ? AND status = ? AND created_at > ?

-- 设计复合索引
CREATE INDEX idx_user_status_time ON orders(user_id, status, created_at);

-- user_id区分度高，放在最前面
-- status区分度低，放在中间
-- created_at用于范围查询，放在最后
```

**避免冗余索引**

```sql
-- 冗余索引示例
CREATE INDEX idx_a ON table(a);
CREATE INDEX idx_a_b ON table(a, b);  -- idx_a被idx_a_b覆盖，可删除

-- 正确做法：只保留复合索引
DROP INDEX idx_a ON table;
```

### 索引覆盖

```sql
-- 索引覆盖：查询列都在索引中，避免回表

-- 创建复合索引
CREATE INDEX idx_user_email_status ON users(user_id, email, status);

-- 查询使用索引覆盖
SELECT user_id, email, status FROM users WHERE user_id = 1;
-- 只访问索引，不回表

-- 查询不使用索引覆盖
SELECT user_id, email, status, created_at FROM users WHERE user_id = 1;
-- created_at不在索引中，需要回表
```

## 索引优化实战

### 慢查询分析

```sql
-- 开启慢查询日志
SET GLOBAL slow_query_log = ON;
SET GLOBAL long_query_time = 2;  -- 超过2秒记录
SET GLOBAL slow_query_log_file = '/var/log/mysql/slow.log';

-- 查看慢查询
SHOW VARIABLES LIKE 'slow_query%';

-- 分析慢查询日志
mysqldumpslow -s t -t 10 /var/log/mysql/slow.log  -- 按时间排序前10条
```

### EXPLAIN分析

```sql
-- 使用EXPLAIN分析查询
EXPLAIN SELECT * FROM orders WHERE user_id = 100;

-- 结果解读
+----+-------------+-------+------------+------+---------------+------+---------+-------+------+----------+-------+
| id | select_type | table | partitions | type | possible_keys | key  | key_len | ref   | rows | filtered | Extra |
+----+-------------+-------+------------+------+---------------+------+---------+-------+------+----------+-------+

-- type列（访问类型，从好到差）：
-- system    > const > eq_ref > ref > range > index > ALL
-- system/const：主键或唯一索引单条查询
-- eq_ref：JOIN时使用主键或唯一索引
-- ref：普通索引查询
-- range：范围查询（>、<、between、in）
-- index：全索引扫描
-- ALL：全表扫描（需要优化）

-- key列：实际使用的索引
-- rows列：预估扫描行数
-- Extra列：额外信息
-- Using index：索引覆盖
-- Using where：需要回表过滤
-- Using index condition：索引条件下推
-- Using temporary：使用临时表
-- Using filesort：文件排序（需要优化）
```

### 优化案例

**案例1：全表扫描优化**

```sql
-- 原查询（全表扫描）
EXPLAIN SELECT * FROM orders WHERE user_id = 100;
-- type: ALL, rows: 1000000

-- 添加索引
CREATE INDEX idx_user_id ON orders(user_id);

-- 优化后
EXPLAIN SELECT * FROM orders WHERE user_id = 100;
-- type: ref, rows: 10
```

**案例2：文件排序优化**

```sql
-- 原查询（Using filesort）
EXPLAIN SELECT * FROM orders WHERE user_id = 100 ORDER BY created_at DESC;
-- Extra: Using filesort

-- 创建复合索引
CREATE INDEX idx_user_time ON orders(user_id, created_at);

-- 优化后
EXPLAIN SELECT * FROM orders WHERE user_id = 100 ORDER BY created_at DESC;
-- Extra: Using index
```

**案例3：索引覆盖优化**

```sql
-- 原查询（Using where）
EXPLAIN SELECT user_id, email FROM users WHERE username = 'Alice';
-- Extra: Using where

-- 创建覆盖索引
CREATE INDEX idx_username_email ON users(username, email);

-- 优化后
EXPLAIN SELECT user_id, email FROM users WHERE username = 'Alice';
-- Extra: Using index
```

**案例4：复合索引优化**

```sql
-- 原查询（多个单列索引）
CREATE INDEX idx_a ON table(a);
CREATE INDEX idx_b ON table(b);
EXPLAIN SELECT * FROM table WHERE a = 1 AND b = 2;
-- 只能使用一个索引

-- 创建复合索引
CREATE INDEX idx_a_b ON table(a, b);
EXPLAIN SELECT * FROM table WHERE a = 1 AND b = 2;
-- 使用复合索引
```

**案例5：范围查询优化**

```sql
-- 范围查询破坏索引后续部分使用
CREATE INDEX idx_a_b_c ON table(a, b, c);

-- 查询
EXPLAIN SELECT * FROM table WHERE a = 1 AND b > 2 AND c = 3;
-- 只使用a和b部分索引

-- 调整索引顺序（如果c查询更重要）
CREATE INDEX idx_a_c_b ON table(a, c, b);
EXPLAIN SELECT * FROM table WHERE a = 1 AND b > 2 AND c = 3;
-- 使用a和c部分索引
```

**案例6：LIKE优化**

```sql
-- 左模糊无法使用索引
EXPLAIN SELECT * FROM users WHERE username LIKE '%Alice';
-- type: ALL

-- 右模糊可以使用索引
EXPLAIN SELECT * FROM users WHERE username LIKE 'Alice%';
-- type: range

-- 全模糊考虑全文索引或搜索引擎
```

**案例7：OR优化**

```sql
-- OR条件可能无法使用索引
EXPLAIN SELECT * FROM orders WHERE user_id = 100 OR product_id = 200;
-- type: ALL

-- 优化1：使用UNION
EXPLAIN 
SELECT * FROM orders WHERE user_id = 100
UNION
SELECT * FROM orders WHERE product_id = 200;
-- 各部分使用索引

-- 优化2：创建复合索引（如果OR都是同一个字段）
-- 无法优化
```

**案例8：IN优化**

```sql
-- IN列表查询
EXPLAIN SELECT * FROM orders WHERE user_id IN (1, 2, 3, 4, 5);
-- type: range

-- IN列表过长可能退化为全表扫描
-- 考虑使用JOIN代替
SELECT o.* FROM orders o 
JOIN user_ids u ON o.user_id = u.id;
```

### 避免索引失效

```sql
-- 1. 避免在索引列上使用函数
-- 错误：函数导致索引失效
SELECT * FROM users WHERE YEAR(created_at) = 2025;
-- 正确：范围查询
SELECT * FROM users WHERE created_at >= '2025-01-01' AND created_at < '2026-01-01';

-- 2. 避隐式类型转换
-- 错误：字符串与数字比较导致转换
SELECT * FROM users WHERE phone = 13800138000;  -- phone是VARCHAR
-- 正确：使用字符串
SELECT * FROM users WHERE phone = '13800138000';

-- 3. 避免使用NOT IN、NOT EXISTS、<>、!=
-- 错误：反向查询效率低
SELECT * FROM orders WHERE status != 'cancelled';
-- 正确：正向查询
SELECT * FROM orders WHERE status IN ('pending', 'completed', 'shipped');

-- 4. 避免使用计算或表达式
-- 错误：表达式导致索引失效
SELECT * FROM orders WHERE user_id + 1 = 101;
-- 正确：直接比较
SELECT * FROM orders WHERE user_id = 100;

-- 5. 避免NULL判断
-- 错误：NULL判断效率低
SELECT * FROM users WHERE email IS NULL;
-- 正确：设置默认值，使用非NULL查询
SELECT * FROM users WHERE email = '';
```

## 索引维护

### 索引监控

```sql
-- 查看索引使用情况
SELECT 
    OBJECT_SCHEMA,
    OBJECT_NAME,
    INDEX_NAME,
    COUNT_READ,
    COUNT_FETCH
FROM performance_schema.table_io_waits_summary_by_index_usage
WHERE OBJECT_SCHEMA = 'mydb'
ORDER BY COUNT_FETCH DESC;

-- 查看未使用的索引
SELECT 
    OBJECT_SCHEMA,
    OBJECT_NAME,
    INDEX_NAME
FROM performance_schema.table_io_waits_summary_by_index_usage
WHERE INDEX_NAME IS NOT NULL
AND COUNT_READ = 0
AND COUNT_FETCH = 0
AND OBJECT_SCHEMA = 'mydb';

-- 查看索引大小
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    ROUND(STAT_VALUE * @@innodb_page_size / 1024 / 1024, 2) AS size_mb
FROM mysql.innodb_index_stats
WHERE STAT_NAME = 'size'
AND DATABASE_NAME = 'mydb'
ORDER BY size_mb DESC;
```

### 索引重建

```sql
-- 分析表（更新统计信息）
ANALYZE TABLE orders;

-- 重建索引
ALTER TABLE orders ENGINE=InnoDB;  -- 重建整个表

-- 删除冗余索引
DROP INDEX idx_a ON orders;

-- 添加新索引
CREATE INDEX idx_new ON orders(column);
```

### 索引碎片整理

```sql
-- 查看表碎片
SELECT 
    TABLE_NAME,
    DATA_FREE,
    ROUND(DATA_FREE / 1024 / 1024, 2) AS free_mb
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'mydb'
AND DATA_FREE > 0
ORDER BY DATA_FREE DESC;

-- 整理碎片
OPTIMIZE TABLE orders;  -- 锁表，谨慎使用

-- 在线整理（Percona工具）
pt-online-schema-change --alter "ENGINE=InnoDB" D=mydb,t=orders
```

## 总结

索引是MySQL性能优化的核心，合理设计和使用索引可以大幅提升查询性能。本文详细介绍了索引的原理、类型、设计原则和优化策略，并通过实战案例展示了具体优化方法。

索引优化需要遵循以下原则：

1. 选择高选择性的列创建索引
2. 复合索引遵循最左前缀原则
3. 尽量使用索引覆盖避免回表
4. 定期监控和清理冗余索引
5. 使用EXPLAIN分析查询执行计划
6. 避免索引失效的各种情况

掌握索引原理和优化技巧，能够帮助开发者构建高性能的数据库应用。

## 参考资料

- MySQL官方文档
- 《高性能MySQL》 - Baron Schwartz
- InnoDB存储引擎架构
- MySQL性能优化最佳实践
