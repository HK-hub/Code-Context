---
title: PostgreSQL高级特性
date: 2025-03-08
categories: [backend, database]
tags: [PostgreSQL, JSONB, 全文搜索, 窗口函数, 物化视图]
description: PostgreSQL高级特性详解，包括JSONB操作、全文搜索、窗口函数、物化视图与扩展插件
---

# PostgreSQL高级特性

## 引言

PostgreSQL被誉为"世界上最先进的开源数据库"，它不仅具备传统关系型数据库的完整功能，还提供了丰富的NoSQL特性、全文搜索、地理信息处理等高级功能。PostgreSQL的可扩展性是其最大亮点，开发者可以通过扩展插件添加新的数据类型、索引方法、函数等。

本文将从PostgreSQL的高级特性出发，详细介绍JSONB数据类型、全文搜索、窗口函数、物化视图、扩展插件等内容，帮助开发者掌握PostgreSQL的强大功能。

## JSONB数据类型

### JSONB概述

PostgreSQL支持两种JSON数据类型：JSON和JSONB。JSON存储原始JSON文本，需要解析才能使用；JSONB存储解析后的二进制格式，查询更快，支持索引。

```sql
-- 创建表
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    attributes JSONB
);

-- 插入数据
INSERT INTO products (name, attributes) VALUES
('Laptop', '{"brand": "Dell", "specs": {"cpu": "i7", "ram": 16}, "tags": ["computer", "work"]}'),
('Phone', '{"brand": "Apple", "specs": {"cpu": "A15", "ram": 4}, "tags": ["mobile", "premium"]}'),
('Tablet', '{"brand": "Samsung", "specs": {"cpu": "Exynos", "ram": 8}, "tags": ["mobile", "budget"}');

-- JSONB特点：
-- 1. 解析后存储，查询速度快
-- 2. 支持GIN索引，高效搜索
-- 3. 不保留原始顺序和空格
-- 4. 自动去除重复键
```

### JSONB操作符

```sql
-- 提取值 -> 和 ->>
-- -> 返回JSONB类型
-- ->> 返回文本类型

SELECT attributes->'brand' FROM products;         -- "Dell"（JSONB）
SELECT attributes->>'brand' FROM products;        -- Dell（文本）
SELECT attributes->'specs'->'ram' FROM products;  -- 16（JSONB）
SELECT attributes->'specs'->>'ram' FROM products; -- 16（文本）

-- 路径提取 #> 和 #>>
SELECT attributes#>'{specs,ram}' FROM products;   -- JSONB
SELECT attributes#>>'{specs,ram}' FROM products;  -- 文本

-- 包含判断 @> 和 <@
SELECT * FROM products WHERE attributes @> '{"brand": "Dell"}';
-- attributes包含{"brand": "Dell"}时返回true

SELECT * FROM products WHERE '{"brand": "Dell"}' <@ attributes;
-- 相同效果

-- 键存在判断 ? 和 ?| 和 ?&
SELECT * FROM products WHERE attributes ? 'brand';      -- 存在brand键
SELECT * FROM products WHERE attributes ?| array['brand', 'model']; -- 存在任一键
SELECT * FROM products WHERE attributes ?& array['brand', 'specs']; -- 存在所有键

-- 数组元素包含
SELECT * FROM products WHERE attributes->'tags' ? 'mobile';
-- tags数组中包含mobile元素

-- 更新操作
UPDATE products 
SET attributes = attributes || '{"color": "black"}'::jsonb
WHERE name = 'Laptop';
-- || 合并JSONB

UPDATE products 
SET attributes = jsonb_set(attributes, '{specs,ram}', '32')
WHERE name = 'Laptop';
-- jsonb_set更新指定路径

UPDATE products 
SET attributes = attributes - 'color'
WHERE name = 'Laptop';
-- - 删除键

-- 删除嵌套键
UPDATE products 
SET attributes = attributes #- '{specs,cpu}'
WHERE name = 'Laptop';
```

### JSONB函数

```sql
-- jsonb_each：展开为键值对行
SELECT jsonb_each(attributes) FROM products;
-- (key, value) 键值对

SELECT key, value FROM products, jsonb_each(attributes);
-- 展开每个键值对

-- jsonb_array_elements：展开数组元素
SELECT jsonb_array_elements(attributes->'tags') FROM products;

-- jsonb_object_keys：获取所有键
SELECT jsonb_object_keys(attributes) FROM products;

-- jsonb_typeof：获取值类型
SELECT attributes->'specs'->'ram', jsonb_typeof(attributes->'specs'->'ram') FROM products;
-- 类型：object, array, string, number, boolean, null

-- jsonb_pretty：美化输出
SELECT jsonb_pretty(attributes) FROM products;

-- jsonb_strip_nulls：删除null值
SELECT jsonb_strip_nulls(attributes) FROM products;

-- 获取JSONB长度
SELECT jsonb_array_length(attributes->'tags') FROM products;

-- 获取JSONB深度
SELECT jsonb_depth(attributes) FROM products;
```

### JSONB索引

```sql
-- GIN索引（通用倒排索引）
CREATE INDEX idx_products_attributes ON products USING GIN (attributes);

-- 支持的查询：
-- @> 包含查询
-- ? 键存在查询
-- ?| ?& 多键存在查询

-- 查询示例
SELECT * FROM products WHERE attributes @> '{"brand": "Dell"}';
-- 使用GIN索引

-- JSONB路径索引（PostgreSQL 12+）
CREATE INDEX idx_products_specs ON products USING GIN (attributes->'specs');

-- 针对特定路径创建索引
SELECT * FROM products WHERE attributes->'specs' @> '{"ram": 16}';
-- 使用路径索引

-- 默认GIN索引选项
CREATE INDEX idx_products_attributes ON products USING GIN (attributes jsonb_path_ops);
-- 只支持@>操作符，更紧凑更高效

-- B-tree索引（用于排序）
CREATE INDEX idx_products_brand ON products ((attributes->>'brand'));
-- 对提取的文本值创建B-tree索引

-- 支持排序查询
SELECT * FROM products ORDER BY attributes->>'brand';
```

### JSONB实战案例

```sql
-- 创建电商产品表
CREATE TABLE ecommerce_products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(50),
    attributes JSONB NOT NULL,
    price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_attributes ON ecommerce_products USING GIN (attributes);
CREATE INDEX idx_category ON ecommerce_products (category);
CREATE INDEX idx_price ON ecommerce_products (price);

-- 插入示例数据
INSERT INTO ecommerce_products (name, category, attributes, price) VALUES
('MacBook Pro', 'laptops', 
 '{"brand": "Apple", "specs": {"cpu": "M2", "ram": 16, "storage": 512}, 
   "colors": ["silver", "space-gray"], "features": ["retina", "touch-bar"]}', 
 1999.99),
('iPhone 14', 'phones', 
 '{"brand": "Apple", "specs": {"cpu": "A15", "ram": 6, "storage": 128}, 
   "colors": ["black", "white", "red"], "features": ["face-id", "dual-camera"]}', 
 799.99),
('Galaxy S23', 'phones', 
 '{"brand": "Samsung", "specs": {"cpu": "Snapdragon 8", "ram": 8, "storage": 256}, 
   "colors": ["black", "green", "cream"], "features": ["amoled", "s-pen"]}', 
 899.99);

-- 查询案例

-- 1. 查找Apple品牌产品
SELECT name, price FROM ecommerce_products 
WHERE attributes @> '{"brand": "Apple"}';

-- 2. 查找特定规格产品
SELECT name FROM ecommerce_products 
WHERE attributes->'specs' @> '{"ram": 16}';

-- 3. 查找包含特定颜色的产品
SELECT name FROM ecommerce_products 
WHERE attributes->'colors' ? 'black';

-- 4. 查找包含多个特性的产品
SELECT name FROM ecommerce_products 
WHERE attributes->'features' ?& array['face-id', 'dual-camera'];

-- 5. 统计各品牌产品数量
SELECT attributes->>'brand' as brand, COUNT(*) as count
FROM ecommerce_products
GROUP BY attributes->>'brand';

-- 6. 计算各品牌平均价格
SELECT attributes->>'brand' as brand, AVG(price) as avg_price
FROM ecommerce_products
GROUP BY attributes->>'brand';

-- 7. 查找多条件产品
SELECT name FROM ecommerce_products
WHERE category = 'phones'
AND attributes @> '{"brand": "Apple"}'
AND price < 1000;

-- 8. 更新产品属性
UPDATE ecommerce_products
SET attributes = attributes || 
    '{"specs": {"ram": 32}}'::jsonb || 
    '{"discount": 10}'::jsonb
WHERE name = 'MacBook Pro';
```

## 全文搜索

### 全文搜索概述

PostgreSQL内置全文搜索功能，支持中文、英文等多种语言的文本搜索。全文搜索将文本转换为可搜索的tsvector格式，支持精确匹配、模糊搜索、相关性排序等功能。

```sql
-- 创建全文搜索索引
CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建全文搜索索引
CREATE INDEX idx_articles_search ON articles 
USING GIN (to_tsvector('english', title || ' ' || content));

-- 创建tsvector列（存储解析后的全文）
ALTER TABLE articles ADD COLUMN search_vector tsvector;

UPDATE articles SET search_vector = 
    to_tsvector('english', title || ' ' || content);

CREATE INDEX idx_articles_vector ON articles USING GIN (search_vector);
```

### 全文搜索函数

```sql
-- to_tsvector：转换为tsvector
SELECT to_tsvector('english', 'This is a sample text for searching');
-- 转换为词元向量

-- to_tsquery：转换为tsquery
SELECT to_tsquery('english', 'searching & text');
-- 构建查询条件

-- plainto_tsquery：简单查询转换
SELECT plainto_tsquery('english', 'searching for text');
-- 自动处理查询语法

-- phraseto_tsquery：短语查询
SELECT phraseto_tsquery('english', 'sample text');
-- 精确短语匹配

-- websearch_to_tsquery：Web风格查询（PostgreSQL 11+）
SELECT websearch_to_tsquery('english', '"sample text" -unwanted OR other');
-- 支持Web搜索引擎语法
```

### 全文搜索操作

```sql
-- 基本搜索
SELECT * FROM articles
WHERE to_tsvector('english', title || ' ' || content) @@ 
      to_tsquery('english', 'database');

-- 多词搜索（AND）
SELECT * FROM articles
WHERE search_vector @@ to_tsquery('english', 'database & optimization');

-- 多词搜索（OR）
SELECT * FROM articles
WHERE search_vector @@ to_tsquery('english', 'database | optimization');

-- 排除词搜索
SELECT * FROM articles
WHERE search_vector @@ to_tsquery('english', 'database & !mysql');

-- 短语搜索
SELECT * FROM articles
WHERE search_vector @@ phraseto_tsquery('english', 'database optimization');

-- 相关性排序
SELECT title, ts_rank(search_vector, to_tsquery('english', 'database')) as rank
FROM articles
WHERE search_vector @@ to_tsquery('english', 'database')
ORDER BY rank DESC;

-- 高亮显示
SELECT title, ts_headline('english', content, to_tsquery('english', 'database'))
FROM articles
WHERE search_vector @@ to_tsquery('english', 'database');

-- 组合搜索
SELECT title, author, 
       ts_rank(search_vector, query) as rank,
       ts_headline('english', content, query) as headline
FROM articles, to_tsquery('english', 'database & optimization') query
WHERE search_vector @@ query
ORDER BY rank DESC;
```

### 中文全文搜索

```sql
-- 安装中文分词扩展
CREATE EXTENSION zhparser;

-- 创建中文配置
CREATE TEXT SEARCH CONFIGURATION zh (PARSER = zhparser);
COMMENT ON TEXT SEARCH CONFIGURATION zh IS 'Chinese configuration';

-- 添加分词字典
ALTER TEXT SEARCH CONFIGURATION zh ADD MAPPING FOR n,v,a,i,e,l 
WITH simple;

-- 创建中文全文索引
CREATE INDEX idx_articles_zh ON articles 
USING GIN (to_tsvector('zh', title || ' ' || content));

-- 中文搜索
SELECT * FROM articles
WHERE to_tsvector('zh', title || ' ' || content) @@ 
      to_tsquery('zh', '数据库 & 优化');

-- 中文相关性排序
SELECT title, 
       ts_rank(to_tsvector('zh', title || ' ' || content), 
               to_tsquery('zh', '数据库')) as rank
FROM articles
WHERE to_tsvector('zh', title || ' ' || content) @@ 
      to_tsquery('zh', '数据库')
ORDER BY rank DESC;
```

## 窗口函数

### 窗口函数概述

窗口函数允许在不减少行数的情况下进行聚合计算，常用于排名、累计求和、移动平均等场景。

```sql
-- 创建销售数据表
CREATE TABLE sales (
    id SERIAL PRIMARY KEY,
    salesman VARCHAR(50) NOT NULL,
    region VARCHAR(30),
    sale_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL
);

INSERT INTO sales (salesman, region, sale_date, amount) VALUES
('Alice', 'North', '2025-01-01', 5000),
('Alice', 'North', '2025-01-02', 6000),
('Bob', 'South', '2025-01-01', 4000),
('Bob', 'South', '2025-01-02', 7000),
('Charlie', 'East', '2025-01-01', 3000),
('Charlie', 'East', '2025-01-02', 4500),
('Alice', 'North', '2025-01-03', 5500),
('Bob', 'South', '2025-01-03', 8000);
```

### 基本窗口函数

```sql
-- ROW_NUMBER：行号
SELECT salesman, sale_date, amount,
       ROW_NUMBER() OVER (ORDER BY sale_date) as row_num
FROM sales;

-- RANK：排名（有并列）
SELECT salesman, amount,
       RANK() OVER (ORDER BY amount DESC) as rank
FROM sales;

-- DENSE_RANK：密集排名（并列后不跳号）
SELECT salesman, amount,
       DENSE_RANK() OVER (ORDER BY amount DESC) as dense_rank
FROM sales;

-- NTILE：分桶
SELECT salesman, amount,
       NTILE(3) OVER (ORDER BY amount DESC) as bucket
FROM sales;

-- LEAD/LAG：前后行值
SELECT salesman, sale_date, amount,
       LAG(amount, 1) OVER (ORDER BY sale_date) as prev_amount,
       LEAD(amount, 1) OVER (ORDER BY sale_date) as next_amount
FROM sales;

-- FIRST_VALUE/LAST_VALUE：首尾值
SELECT salesman, sale_date, amount,
       FIRST_VALUE(amount) OVER (ORDER BY sale_date) as first_amount,
       LAST_VALUE(amount) OVER (ORDER BY sale_date ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) as last_amount
FROM sales;
```

### 分组窗口函数

```sql
-- 按销售人员分组统计
SELECT salesman, sale_date, amount,
       SUM(amount) OVER (PARTITION BY salesman) as total_by_salesman,
       AVG(amount) OVER (PARTITION BY salesman) as avg_by_salesman,
       COUNT(*) OVER (PARTITION BY salesman) as count_by_salesman
FROM sales;

-- 按区域分组排名
SELECT salesman, region, amount,
       RANK() OVER (PARTITION BY region ORDER BY amount DESC) as region_rank
FROM sales;

-- 组内累计求和
SELECT salesman, sale_date, amount,
       SUM(amount) OVER (PARTITION BY salesman ORDER BY sale_date) as cumulative_sum
FROM sales;

-- 组内移动平均
SELECT salesman, sale_date, amount,
       AVG(amount) OVER (
           PARTITION BY salesman 
           ORDER BY sale_date 
           ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
       ) as moving_avg_3
FROM sales;
```

### 窗口范围

```sql
-- ROWS范围：基于行数
SELECT salesman, sale_date, amount,
       SUM(amount) OVER (
           ORDER BY sale_date 
           ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
       ) as cumulative_sum,
       SUM(amount) OVER (
           ORDER BY sale_date 
           ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING
       ) as window_3_sum
FROM sales;

-- RANGE范围：基于值
SELECT salesman, sale_date, amount,
       SUM(amount) OVER (
           ORDER BY amount 
           RANGE BETWEEN 1000 PRECEDING AND 1000 FOLLOWING
       ) as range_sum
FROM sales;

-- GROUPS范围：基于分组（PostgreSQL 12+）
SELECT salesman, sale_date, amount,
       SUM(amount) OVER (
           PARTITION BY salesman 
           ORDER BY sale_date 
           GROUPS BETWEEN 1 PRECEDING AND CURRENT GROUP
       ) as groups_sum
FROM sales;

-- EXCLUDE选项（PostgreSQL 12+）
SELECT salesman, sale_date, amount,
       SUM(amount) OVER (
           ORDER BY sale_date 
           ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING 
           EXCLUDE CURRENT ROW
       ) as sum_exclude_current
FROM sales;
```

## 物化视图

### 物化视图概述

物化视图是预先计算并存储结果的视图，适合复杂查询需要频繁执行的场景。

```sql
-- 创建物化视图
CREATE MATERIALIZED VIEW sales_summary AS
SELECT salesman, region,
       SUM(amount) as total_sales,
       AVG(amount) as avg_sales,
       COUNT(*) as sale_count,
       MIN(sale_date) as first_sale,
       MAX(sale_date) as last_sale
FROM sales
GROUP BY salesman, region;

-- 创建索引
CREATE INDEX idx_sales_summary_region ON sales_summary (region);
CREATE INDEX idx_sales_summary_total ON sales_summary (total_sales);

-- 查询物化视图
SELECT * FROM sales_summary ORDER BY total_sales DESC;

-- 刷新物化视图（全量刷新）
REFRESH MATERIALIZED VIEW sales_summary;

-- 并发刷新（不阻塞查询）
REFRESH MATERIALIZED VIEW CONCURRENTLY sales_summary;

-- 删除物化视图
DROP MATERIALIZED VIEW sales_summary;
```

### 定时刷新

```sql
-- 创建刷新函数
CREATE OR REPLACE FUNCTION refresh_sales_summary()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY sales_summary;
END;
$$ LANGUAGE plpgsql;

-- 安装pg_cron扩展
CREATE EXTENSION pg_cron;

-- 定时刷新（每小时）
SELECT cron.schedule('refresh_sales_summary', '0 * * * *', 
    'REFRESH MATERIALIZED VIEW CONCURRENTLY sales_summary');

-- 定时刷新（每天凌晨）
SELECT cron.schedule('daily_refresh', '0 0 * * *', 
    'REFRESH MATERIALIZED VIEW sales_summary');

-- 查看定时任务
SELECT * FROM cron.job;

-- 删除定时任务
SELECT cron.unschedule('refresh_sales_summary');
```

## 扩展插件

### 常用扩展插件

```sql
-- 查看已安装扩展
SELECT * FROM pg_extension;

-- 查看可用扩展
SELECT * FROM pg_available_extensions;

-- 常用扩展：

-- 1. pg_stat_statements：查询统计
CREATE EXTENSION pg_stat_statements;

SELECT query, calls, total_time, mean_time, rows
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;

-- 2. pg_trgm：模糊搜索
CREATE EXTENSION pg_trgm;

-- 创建trigram索引
CREATE INDEX idx_name_trgm ON users USING GIN (name gin_trgm_ops);

-- 模糊搜索
SELECT * FROM users WHERE name % 'Alic';  -- 相似匹配
SELECT * FROM users WHERE name LIKE '%alic%';  -- 使用索引

-- 相似度计算
SELECT name, similarity(name, 'Alice') as sim
FROM users
WHERE similarity(name, 'Alice') > 0.3
ORDER BY sim DESC;

-- 3. uuid-ossp：UUID生成
CREATE EXTENSION "uuid-ossp";

SELECT uuid_generate_v4();  -- 随机UUID
SELECT uuid_generate_v1();  -- 时间UUID

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100)
);

-- 4. PostGIS：地理信息
CREATE EXTENSION postgis;

CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    coordinates GEOGRAPHY(POINT, 4326)
);

INSERT INTO locations (name, coordinates) VALUES
('Beijing', ST_GeogFromText('POINT(116.4 39.9)')),
('Shanghai', ST_GeogFromText('POINT(121.47 31.23)'));

-- 距离查询
SELECT name, ST_Distance(coordinates, ST_GeogFromText('POINT(116.4 39.9)')) as distance
FROM locations;

-- 5. hstore：键值存储
CREATE EXTENSION hstore;

CREATE TABLE user_settings (
    user_id INT PRIMARY KEY,
    settings hstore
);

INSERT INTO user_settings VALUES
(1, '"theme"=>"dark", "language"=>"zh", "notifications"=>"true"');

-- 查询键值
SELECT settings->'theme' FROM user_settings WHERE user_id = 1;

-- 包含查询
SELECT * FROM user_settings WHERE settings @> '"theme"=>"dark"';
```

## 总结

PostgreSQL提供了丰富的NoSQL特性、全文搜索、窗口函数、物化视图等高级功能，使其成为功能最全面的开源数据库。本文详细介绍了JSONB操作、全文搜索、窗口函数、物化视图和扩展插件等内容。

PostgreSQL的高级特性使其适用于各种复杂场景：

1. JSONB适合存储灵活结构的数据，如用户配置、产品属性
2. 全文搜索适合文档检索、博客搜索等场景
3. 窗口函数适合报表统计、排名分析等业务
4. 物化视图适合复杂查询需要频繁执行的场景
5. 扩展插件提供了地理信息、模糊搜索等专业功能

掌握PostgreSQL的高级特性，能够帮助开发者构建功能丰富、性能优良的应用系统。

## 参考资料

- PostgreSQL官方文档
- 《PostgreSQL实战》 - 李强
- PostGIS官方文档
- PostgreSQL扩展插件指南