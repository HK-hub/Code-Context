---
title: Python数据处理示例与分析实践
date: 2025-03-12
categories: [projects, demos]
tags: [Python, 数据处理, Pandas, 数据分析, 可视化]
description: 通过实际案例展示Python数据处理的完整流程，包括数据清洗、转换、分析和可视化的最佳实践
---

# Python数据处理示例与分析实践

Python作为数据分析领域最流行的语言，提供了pandas、numpy、matplotlib等强大的数据处理库。本文通过实际案例展示数据处理的完整流程。

## 数据处理环境配置

### 依赖安装

```python
# requirements.txt
pandas>=2.0.0
numpy>=1.24.0
matplotlib>=3.7.0
seaborn>=0.12.0
scikit-learn>=1.3.0
jupyter>=1.0.0
openpyxl>=3.1.0
```

```python
# 安装依赖
# pip install -r requirements.txt

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
import warnings

warnings.filterwarnings('ignore')

# 设置绘图风格
plt.style.use('seaborn-v0_8-whitegrid')
sns.set_palette("husl")

# 设置pandas显示选项
pd.set_option('display.max_columns', 50)
pd.set_option('display.width', 1000)
pd.set_option('display.float_format', '{:.2f}'.format)
```

## 数据加载与初步探索

### 多格式数据加载

```python
class DataLoader:
    """数据加载器"""
    
    @staticmethod
    def load_csv(filepath, **kwargs):
        """加载CSV文件"""
        return pd.read_csv(filepath, **kwargs)
    
    @staticmethod
    def load_excel(filepath, sheet_name=0, **kwargs):
        """加载Excel文件"""
        return pd.read_excel(filepath, sheet_name=sheet_name, **kwargs)
    
    @staticmethod
    def load_json(filepath, **kwargs):
        """加载JSON文件"""
        return pd.read_json(filepath, **kwargs)
    
    @staticmethod
    def load_from_database(query, connection_string):
        """从数据库加载数据"""
        import sqlalchemy
        engine = sqlalchemy.create_engine(connection_string)
        return pd.read_sql(query, engine)

# 使用示例
# df = DataLoader.load_csv('data/sales.csv', encoding='utf-8')
# df = DataLoader.load_excel('data/sales.xlsx', sheet_name='Sheet1')
```

### 数据探索

```python
def explore_data(df, name='Dataset'):
    """数据探索函数"""
    print(f"\n{'='*60}")
    print(f"{name} 数据探索报告")
    print('='*60)
    
    # 基本信息
    print(f"\n数据维度: {df.shape[0]} 行 × {df.shape[1]} 列")
    
    # 列信息
    print("\n列信息:")
    print(df.dtypes.to_string())
    
    # 描述性统计
    print("\n数值列描述统计:")
    print(df.describe().to_string())
    
    # 缺失值分析
    print("\n缺失值统计:")
    missing = df.isnull().sum()
    missing_pct = (missing / len(df) * 100).round(2)
    missing_df = pd.DataFrame({
        '缺失数量': missing,
        '缺失比例(%)': missing_pct
    })
    print(missing_df[missing_df['缺失数量'] > 0].to_string())
    
    # 重复值检查
    duplicates = df.duplicated().sum()
    print(f"\n重复行数量: {duplicates}")
    
    return {
        'shape': df.shape,
        'missing': missing_df,
        'duplicates': duplicates
    }

# 执行数据探索
# report = explore_data(df, '销售数据')
```

## 数据清洗

### 缺失值处理

```python
class DataCleaner:
    """数据清洗工具类"""
    
    @staticmethod
    def handle_missing(df, strategy='mean', columns=None):
        """
        缺失值处理
        
        Parameters:
        - strategy: 'mean', 'median', 'mode', 'drop', 'fill'
        - columns: 指定处理的列，默认所有数值列
        """
        df_clean = df.copy()
        
        if columns is None:
            columns = df_clean.select_dtypes(include=[np.number]).columns
        
        for col in columns:
            if df_clean[col].isnull().sum() > 0:
                if strategy == 'mean':
                    df_clean[col].fillna(df_clean[col].mean(), inplace=True)
                elif strategy == 'median':
                    df_clean[col].fillna(df_clean[col].median(), inplace=True)
                elif strategy == 'mode':
                    df_clean[col].fillna(df_clean[col].mode()[0], inplace=True)
                elif strategy == 'drop':
                    df_clean = df_clean.dropna(subset=[col])
                elif isinstance(strategy, (int, float, str)):
                    df_clean[col].fillna(strategy, inplace=True)
        
        return df_clean
    
    @staticmethod
    def remove_duplicates(df, subset=None):
        """删除重复值"""
        return df.drop_duplicates(subset=subset, keep='first')
    
    @staticmethod
    def remove_outliers(df, columns, method='iqr', threshold=1.5):
        """
        移除异常值
        
        Parameters:
        - method: 'iqr' 或 'zscore'
        - threshold: IQR倍数或Z-score阈值
        """
        df_clean = df.copy()
        
        for col in columns:
            if method == 'iqr':
                Q1 = df_clean[col].quantile(0.25)
                Q3 = df_clean[col].quantile(0.75)
                IQR = Q3 - Q1
                lower = Q1 - threshold * IQR
                upper = Q3 + threshold * IQR
                df_clean = df_clean[(df_clean[col] >= lower) & (df_clean[col] <= upper)]
            elif method == 'zscore':
                from scipy import stats
                z_scores = np.abs(stats.zscore(df_clean[col]))
                df_clean = df_clean[z_scores < threshold]
        
        return df_clean

# 使用示例
# cleaner = DataCleaner()
# df_clean = cleaner.handle_missing(df, strategy='mean')
# df_clean = cleaner.remove_duplicates(df_clean)
# df_clean = cleaner.remove_outliers(df_clean, columns=['price', 'quantity'])
```

### 数据类型转换

```python
def convert_data_types(df, type_mapping):
    """
    数据类型转换
    
    Parameters:
    - type_mapping: dict, 列名 -> 目标类型
    """
    df_converted = df.copy()
    
    for col, dtype in type_mapping.items():
        if col in df_converted.columns:
            if dtype == 'datetime':
                df_converted[col] = pd.to_datetime(df_converted[col], errors='coerce')
            elif dtype == 'category':
                df_converted[col] = df_converted[col].astype('category')
            elif dtype == 'numeric':
                df_converted[col] = pd.to_numeric(df_converted[col], errors='coerce')
            else:
                df_converted[col] = df_converted[col].astype(dtype)
    
    return df_converted

# 使用示例
# type_mapping = {
#     'date': 'datetime',
#     'category': 'category',
#     'price': 'numeric'
# }
# df = convert_data_types(df, type_mapping)
```

## 数据分析与聚合

### 分组聚合分析

```python
def analyze_by_group(df, group_cols, agg_dict):
    """
    分组聚合分析
    
    Parameters:
    - group_cols: 分组列名列表
    - agg_dict: 聚合字典，如 {'sales': ['sum', 'mean'], 'quantity': 'count'}
    """
    result = df.groupby(group_cols).agg(agg_dict)
    result.columns = ['_'.join(col) if isinstance(col, tuple) else col 
                      for col in result.columns]
    return result.reset_index()

# 使用示例
# agg_result = analyze_by_group(
#     df,
#     group_cols=['category', 'region'],
#     agg_dict={
#         'sales': ['sum', 'mean', 'std'],
#         'quantity': ['sum', 'count'],
#         'profit': ['sum', 'mean']
#     }
# )
```

### 时间序列分析

```python
def time_series_analysis(df, date_col, value_col, freq='M'):
    """
    时间序列分析
    
    Parameters:
    - freq: 重采样频率 'D', 'W', 'M', 'Q', 'Y'
    """
    df_ts = df.set_index(date_col)
    df_ts = df_ts.sort_index()
    
    # 重采样
    resampled = df_ts[value_col].resample(freq)
    
    result = pd.DataFrame({
        f'{value_col}_sum': resampled.sum(),
        f'{value_col}_mean': resampled.mean(),
        f'{value_col}_count': resampled.count()
    })
    
    # 计算环比增长率
    result[f'{value_col}_growth'] = result[f'{value_col}_sum'].pct_change()
    
    # 计算移动平均
    result[f'{value_col}_ma7'] = result[f'{value_col}_sum'].rolling(window=7).mean()
    result[f'{value_col}_ma30'] = result[f'{value_col}_sum'].rolling(window=30).mean()
    
    return result

# 使用示例
# ts_result = time_series_analysis(df, date_col='order_date', value_col='sales', freq='M')
```

## 数据可视化

### 基础可视化

```python
def plot_distribution(df, column, title=None):
    """绘制数据分布"""
    fig, axes = plt.subplots(1, 2, figsize=(12, 4))
    
    # 直方图
    axes[0].hist(df[column].dropna(), bins=30, edgecolor='black', alpha=0.7)
    axes[0].set_xlabel(column)
    axes[0].set_ylabel('Frequency')
    axes[0].set_title(f'{title or column} Distribution')
    
    # 箱线图
    axes[1].boxplot(df[column].dropna(), vert=True)
    axes[1].set_ylabel(column)
    axes[1].set_title(f'{title or column} Boxplot')
    
    plt.tight_layout()
    plt.show()

def plot_correlation_heatmap(df, figsize=(10, 8)):
    """绘制相关性热力图"""
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    corr = df[numeric_cols].corr()
    
    plt.figure(figsize=figsize)
    sns.heatmap(corr, annot=True, fmt='.2f', cmap='coolwarm', 
                center=0, square=True, linewidths=0.5)
    plt.title('Feature Correlation Heatmap')
    plt.show()

def plot_time_series(df, date_col, value_col, title=None):
    """绘制时间序列图"""
    plt.figure(figsize=(12, 6))
    
    plt.plot(df[date_col], df[value_col], marker='o', linestyle='-', markersize=3)
    
    plt.xlabel('Date')
    plt.ylabel(value_col)
    plt.title(title or f'{value_col} over Time')
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.show()

# 使用示例
# plot_distribution(df, 'sales', 'Sales Distribution')
# plot_correlation_heatmap(df)
# plot_time_series(ts_result.reset_index(), 'order_date', 'sales_sum', 'Monthly Sales Trend')
```

## 总结

Python数据处理流程的关键步骤：

1. **数据加载**：支持多种格式，灵活读取
2. **数据探索**：了解数据特征，发现潜在问题
3. **数据清洗**：处理缺失值、异常值、重复值
4. **类型转换**：确保数据类型正确
5. **分析聚合**：多维度分析，发现规律
6. **可视化**：直观展示分析结果

通过pandas等工具的合理使用，可以高效完成数据分析任务。