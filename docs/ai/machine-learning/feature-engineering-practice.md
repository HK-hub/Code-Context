---
title: 特征工程实践：数据预处理与特征构建
date: 2025-02-08T00:00:00.000Z
categories:
  - ai
  - machine-learning
tags:
  - 特征工程
  - 数据预处理
  - 特征选择
  - sklearn
  - 数据科学
description: 系统讲解特征工程的核心技术，包括数据清洗、特征变换、特征选择与构建方法
author: HK意境
---

# 特征工程实践：数据预处理与特征构建

特征工程是机器学习项目中最关键的环节之一。业界有句名言："数据和特征决定了机器学习的上限，模型和算法只是逼近这个上限"。本文将系统地介绍特征工程的核心技术，帮助读者掌握这一核心技能。

## 一、特征工程概述

### 1.1 什么是特征工程

特征工程（Feature Engineering）是指利用领域知识从原始数据中提取特征，使机器学习算法能够更有效地学习的过程。它包括以下几个主要步骤：

1. **数据探索与理解**：深入了解数据的特点和分布
2. **数据清洗**：处理缺失值、异常值和噪声数据
3. **特征变换**：将特征转换为更适合模型的形式
4. **特征构建**：创建新的特征以表达更多信息
5. **特征选择**：选择最相关的特征子集

### 1.2 特征工程的重要性

特征工程的重要性体现在多个方面：

- **提升模型性能**：好的特征可以显著提高模型准确率
- **加速模型训练**：减少冗余特征可以加快训练速度
- **提高模型可解释性**：合理的特征让模型决策更透明
- **降低过拟合风险**：特征选择可以减少噪声特征的影响

## 二、数据清洗

### 2.1 处理缺失值

缺失值是实际数据中最常见的问题之一。处理策略包括：

**删除法**：直接删除含有缺失值的样本或特征

```python
import numpy as np
import pandas as pd
from sklearn.datasets import fetch_openml

# 创建示例数据
np.random.seed(42)
data = pd.DataFrame({
    'age': np.random.randint(18, 80, 100),
    'income': np.random.normal(50000, 15000, 100),
    'education': np.random.choice(['高中', '本科', '硕士', '博士'], 100),
    'score': np.random.uniform(0, 100, 100)
})

# 人为引入缺失值
data.loc[np.random.choice(100, 15), 'income'] = np.nan
data.loc[np.random.choice(100, 10), 'age'] = np.nan
data.loc[np.random.choice(100, 8), 'education'] = np.nan

print("缺失值统计:")
print(data.isnull().sum())

# 方法1：删除缺失值
data_drop = data.dropna()
print(f"\n删除后样本数: {len(data_drop)}")

# 方法2：删除缺失比例过高的特征
threshold = 0.2  # 缺失比例超过20%的特征删除
data_drop_cols = data.dropna(thresh=len(data) * (1 - threshold), axis=1)
print(f"删除的特征数: {data.shape[1] - data_drop_cols.shape[1]}")
```

**填充法**：用特定值填充缺失值

```python
from sklearn.impute import SimpleImputer, KNNImputer

# 数值特征填充
numerical_cols = ['age', 'income', 'score']

# 均值填充
mean_imputer = SimpleImputer(strategy='mean')
data_mean = data.copy()
data_mean[numerical_cols] = mean_imputer.fit_transform(data[numerical_cols])

# 中位数填充
median_imputer = SimpleImputer(strategy='median')
data_median = data.copy()
data_median[numerical_cols] = median_imputer.fit_transform(data[numerical_cols])

# KNN填充
knn_imputer = KNNImputer(n_neighbors=5)
data_knn = data.copy()
data_knn[numerical_cols] = knn_imputer.fit_transform(data[numerical_cols])

print("\n各填充方法结果比较:")
print(f"原始数据income均值: {data['income'].mean():.2f}")
print(f"均值填充后: {data_mean['income'].mean():.2f}")
print(f"KNN填充后: {data_knn['income'].mean():.2f}")

# 分类特征填充
cat_imputer = SimpleImputer(strategy='most_frequent')
data_cat = data.copy()
data_cat['education'] = cat_imputer.fit_transform(data[['education']]).ravel()
print(f"\n教育程度众数: {cat_imputer.statistics_[0]}")
```

### 2.2 处理异常值

异常值检测和处理是数据质量保障的关键：

```python
import matplotlib.pyplot as plt
import seaborn as sns

# 生成含异常值的数据
np.random.seed(42)
outlier_data = pd.DataFrame({
    'value': np.concatenate([
        np.random.normal(50, 5, 95),
        np.random.normal(150, 10, 5)  # 异常值
    ])
})

# 可视化异常值
fig, axes = plt.subplots(1, 3, figsize=(15, 4))

# 箱线图
axes[0].boxplot(outlier_data['value'])
axes[0].set_title('箱线图检测异常值')
axes[0].set_ylabel('值')

# 直方图
axes[1].hist(outlier_data['value'], bins=30, edgecolor='black')
axes[1].set_title('直方图分布')
axes[1].set_xlabel('值')

# 散点图
axes[2].scatter(range(len(outlier_data)), outlier_data['value'], alpha=0.5)
axes[2].axhline(y=outlier_data['value'].mean() + 3*outlier_data['value'].std(),
                color='r', linestyle='--', label='3σ')
axes[2].set_title('散点图')
axes[2].legend()

plt.tight_layout()
plt.show()

# Z-Score方法
def detect_outliers_zscore(data, threshold=3):
    z_scores = np.abs((data - data.mean()) / data.std())
    return z_scores > threshold

outliers_zscore = detect_outliers_zscore(outlier_data['value'])
print(f"Z-Score检测到的异常值数量: {outliers_zscore.sum()}")

# IQR方法
def detect_outliers_iqr(data, k=1.5):
    Q1 = data.quantile(0.25)
    Q3 = data.quantile(0.75)
    IQR = Q3 - Q1
    lower_bound = Q1 - k * IQR
    upper_bound = Q3 + k * IQR
    return (data < lower_bound) | (data > upper_bound)

outliers_iqr = detect_outliers_iqr(outlier_data['value'])
print(f"IQR方法检测到的异常值数量: {outliers_iqr.sum()}")

# 处理异常值
# 方法1：删除
data_remove = outlier_data[~outliers_iqr]

# 方法2：截断
def clip_outliers(data, k=1.5):
    Q1 = data.quantile(0.25)
    Q3 = data.quantile(0.75)
    IQR = Q3 - Q1
    lower_bound = Q1 - k * IQR
    upper_bound = Q3 + k * IQR
    return data.clip(lower_bound, upper_bound)

data_clipped = outlier_data.copy()
data_clipped['value'] = clip_outliers(outlier_data['value'])

print(f"\n原始数据: 均值={outlier_data['value'].mean():.2f}, 标准差={outlier_data['value'].std():.2f}")
print(f"删除异常值后: 均值={data_remove['value'].mean():.2f}, 标准差={data_remove['value'].std():.2f}")
print(f"截断异常值后: 均值={data_clipped['value'].mean():.2f}, 标准差={data_clipped['value'].std():.2f}")
```

## 三、特征变换

### 3.1 数值特征标准化

不同特征的量纲和范围差异会影响模型性能，标准化是常用的处理方法：

```python
from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler

# 创建示例数据
np.random.seed(42)
scale_data = pd.DataFrame({
    'age': np.random.randint(18, 80, 200),
    'income': np.random.normal(50000, 15000, 200),
    'score': np.random.uniform(0, 100, 200)
})

fig, axes = plt.subplots(2, 4, figsize=(16, 8))

# 原始数据
for i, col in enumerate(scale_data.columns):
    axes[0, i].hist(scale_data[col], bins=30, edgecolor='black')
    axes[0, i].set_title(f'{col} (原始)')
    axes[0, i].set_xlabel('值')

# Z-Score标准化
scaler_standard = StandardScaler()
data_standard = pd.DataFrame(
    scaler_standard.fit_transform(scale_data),
    columns=scale_data.columns
)

for i, col in enumerate(data_standard.columns):
    axes[1, i].hist(data_standard[col], bins=30, edgecolor='black', color='green')
    axes[1, i].set_title(f'{col} (Z-Score)')
    axes[1, i].set_xlabel('值')

plt.tight_layout()
plt.show()

print("Z-Score标准化后的统计量:")
print(f"均值:\n{data_standard.mean()}")
print(f"\n标准差:\n{data_standard.std()}")

# Min-Max归一化
scaler_minmax = MinMaxScaler()
data_minmax = pd.DataFrame(
    scaler_minmax.fit_transform(scale_data),
    columns=scale_data.columns
)

print("\nMin-Max归一化后:")
print(f"最小值:\n{data_minmax.min()}")
print(f"\n最大值:\n{data_minmax.max()}")

# RobustScaler (对异常值鲁棒)
scaler_robust = RobustScaler()
data_robust = pd.DataFrame(
    scaler_robust.fit_transform(scale_data),
    columns=scale_data.columns
)
```

### 3.2 非线性变换

某些情况下，线性变换不足以处理数据的分布特性：

```python
from sklearn.preprocessing import PowerTransformer, QuantileTransformer

# 生成偏态数据
np.random.seed(42)
skewed_data = pd.DataFrame({
    'lognormal': np.random.lognormal(0, 1, 1000),
    'exponential': np.random.exponential(2, 1000)
})

fig, axes = plt.subplots(2, 4, figsize=(16, 8))

# 原始数据分布
for i, col in enumerate(skewed_data.columns):
    axes[0, i].hist(skewed_data[col], bins=50, edgecolor='black')
    axes[0, i].set_title(f'{col} (原始)')

# 对数变换
log_transformed = np.log1p(skewed_data)
for i, col in enumerate(log_transformed.columns):
    axes[1, i].hist(log_transformed[col], bins=50, edgecolor='black', color='orange')
    axes[1, i].set_title(f'{col} (对数变换)')

# Box-Cox变换
pt = PowerTransformer(method='box-cox')
boxcox_transformed = pd.DataFrame(
    pt.fit_transform(skewed_data + 1e-6),  # 避免零值
    columns=skewed_data.columns
)

# Yeo-Johnson变换 (可处理负值)
pt_yj = PowerTransformer(method='yeo-johnson')
yeojohnson_transformed = pd.DataFrame(
    pt_yj.fit_transform(skewed_data),
    columns=skewed_data.columns
)

# 分位数变换
qt = QuantileTransformer(output_distribution='normal')
quantile_transformed = pd.DataFrame(
    qt.fit_transform(skewed_data),
    columns=skewed_data.columns
)

plt.tight_layout()
plt.show()

print("偏度比较:")
print(f"原始数据偏度: {skewed_data.skew()}")
print(f"对数变换后偏度: {log_transformed.skew()}")
print(f"Yeo-Johnson变换后偏度: {yeojohnson_transformed.skew()}")
```

### 3.3 分类特征编码

分类特征需要转换为数值形式才能被模型处理：

```python
from sklearn.preprocessing import LabelEncoder, OneHotEncoder, OrdinalEncoder

# 创建分类数据
cat_data = pd.DataFrame({
    'color': ['红', '蓝', '绿', '红', '蓝', '绿', '红', '蓝'] * 125,
    'size': ['S', 'M', 'L', 'XL', 'S', 'M', 'L', 'XL'] * 125,
    'brand': ['A', 'B', 'C', 'D', 'A', 'B', 'C', 'D'] * 125,
    'price': np.random.uniform(10, 1000, 1000)
})

# 标签编码
le = LabelEncoder()
cat_data['color_encoded'] = le.fit_transform(cat_data['color'])
print("标签编码映射:")
for i, cls in enumerate(le.classes_):
    print(f"  {cls} -> {i}")

# 独热编码
ohe = OneHotEncoder(sparse_output=False, drop='first')
brand_onehot = ohe.fit_transform(cat_data[['brand']])
brand_cols = [f'brand_{c}' for c in ohe.categories_[0][1:]]
brand_df = pd.DataFrame(brand_onehot, columns=brand_cols)
print(f"\n独热编码结果示例:\n{brand_df.head()}")

# 序数编码 (保持有序性)
size_order = ['S', 'M', 'L', 'XL']
oe = OrdinalEncoder(categories=[size_order])
cat_data['size_encoded'] = oe.fit_transform(cat_data[['size']])
print(f"\n序数编码 (size):\n{cat_data[['size', 'size_encoded']].head(10)}")

# 目标编码 (Target Encoding)
def target_encode(data, col, target, weight=10):
    """目标编码实现"""
    means = target.groupby(data[col]).mean()
    overall_mean = target.mean()
    counts = data[col].value_counts()
    
    encoded = data[col].map(
        lambda x: (means[x] * counts[x] + overall_mean * weight) / 
                  (counts[x] + weight)
    )
    return encoded

cat_data['brand_target_enc'] = target_encode(
    cat_data, 'brand', cat_data['price']
)
print(f"\n目标编码 (brand):\n{cat_data[['brand', 'brand_target_enc']].head(10)}")
```

## 四、特征构建

### 4.1 多项式特征

```python
from sklearn.preprocessing import PolynomialFeatures

# 创建示例数据
X = np.array([[1, 2], [3, 4], [5, 6], [7, 8]])

# 生成多项式特征
poly = PolynomialFeatures(degree=2, include_bias=False)
X_poly = poly.fit_transform(X)

print(f"原始特征形状: {X.shape}")
print(f"多项式特征形状: {X_poly.shape}")
print(f"特征名称: {poly.get_feature_names_out(['x1', 'x2'])}")

# 实际应用示例
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import Pipeline

np.random.seed(42)
X_nonlinear = np.sort(np.random.uniform(-3, 3, 100)).reshape(-1, 1)
y_nonlinear = 0.5 * X_nonlinear.ravel()**2 + X_nonlinear.ravel() + 2 + \
              np.random.normal(0, 0.5, 100)

# 比较线性回归和多项式回归
X_train, X_test, y_train, y_test = train_test_split(
    X_nonlinear, y_nonlinear, test_size=0.2, random_state=42
)

# 线性模型
linear_model = LinearRegression()
linear_model.fit(X_train, y_train)
linear_score = linear_model.score(X_test, y_test)

# 多项式模型 (degree=2)
poly_model = Pipeline([
    ('poly', PolynomialFeatures(degree=2, include_bias=False)),
    ('linear', LinearRegression())
])
poly_model.fit(X_train, y_train)
poly_score = poly_model.score(X_test, y_test)

print(f"线性模型 R²: {linear_score:.4f}")
print(f"多项式模型 R²: {poly_score:.4f}")
```

### 4.2 交互特征

```python
# 创建交互特征
def create_interaction_features(df, num_cols):
    """创建交互特征"""
    result = df.copy()
    n = len(num_cols)
    for i in range(n):
        for j in range(i+1, n):
            col1, col2 = num_cols[i], num_cols[j]
            # 乘法交互
            result[f'{col1}_x_{col2}'] = df[col1] * df[col2]
            # 加法交互
            result[f'{col1}_plus_{col2}'] = df[col1] + df[col2]
            # 比值交互
            result[f'{col1}_div_{col2}'] = df[col1] / (df[col2] + 1e-6)
    return result

# 应用交互特征创建
interaction_data = scale_data.copy()
num_cols = ['age', 'income', 'score']
interaction_data = create_interaction_features(interaction_data, num_cols)

print("交互特征创建后:")
print(interaction_data.columns.tolist())
print(f"\n特征数量: {len(interaction_data.columns)}")
```

### 4.3 时间特征提取

```python
# 创建时间数据
dates = pd.date_range('2020-01-01', '2024-12-31', freq='D')
time_data = pd.DataFrame({
    'date': dates,
    'value': np.random.randn(len(dates)).cumsum()
})

# 提取时间特征
time_data['year'] = time_data['date'].dt.year
time_data['month'] = time_data['date'].dt.month
time_data['day'] = time_data['date'].dt.day
time_data['dayofweek'] = time_data['date'].dt.dayofweek
time_data['dayofyear'] = time_data['date'].dt.dayofyear
time_data['weekofyear'] = time_data['date'].dt.isocalendar().week
time_data['quarter'] = time_data['date'].dt.quarter
time_data['is_weekend'] = time_data['dayofweek'].isin([5, 6]).astype(int)
time_data['is_month_start'] = time_data['date'].dt.is_month_start.astype(int)
time_data['is_month_end'] = time_data['date'].dt.is_month_end.astype(int)

# 周期性编码 (正弦/余弦变换)
time_data['month_sin'] = np.sin(2 * np.pi * time_data['month'] / 12)
time_data['month_cos'] = np.cos(2 * np.pi * time_data['month'] / 12)
time_data['dayofweek_sin'] = np.sin(2 * np.pi * time_data['dayofweek'] / 7)
time_data['dayofweek_cos'] = np.cos(2 * np.pi * time_data['dayofweek'] / 7)

print("时间特征示例:")
print(time_data.head(10))

# 滞后特征
for lag in [1, 7, 30]:
    time_data[f'value_lag_{lag}'] = time_data['value'].shift(lag)

# 滚动特征
time_data['value_rolling_mean_7'] = time_data['value'].rolling(window=7).mean()
time_data['value_rolling_std_7'] = time_data['value'].rolling(window=7).std()

print("\n滞后和滚动特征示例:")
print(time_data[['date', 'value', 'value_lag_1', 'value_lag_7', 
                  'value_rolling_mean_7']].head(15))
```

## 五、特征选择

### 5.1 过滤法

```python
from sklearn.feature_selection import VarianceThreshold, SelectKBest, f_classif, mutual_info_classif

# 创建分类数据集
from sklearn.datasets import make_classification
X_cls, y_cls = make_classification(
    n_samples=1000, n_features=20, n_informative=10,
    n_redundant=5, n_repeated=2, random_state=42
)

feature_names = [f'feature_{i}' for i in range(X_cls.shape[1])]

# 低方差特征过滤
vt = VarianceThreshold(threshold=0.1)
X_variance = vt.fit_transform(X_cls)
print(f"低方差过滤: {X_cls.shape[1]} -> {X_variance.shape[1]} 特征")

# 单变量特征选择
skb = SelectKBest(f_classif, k=10)
X_selected = skb.fit_transform(X_cls, y_cls)
selected_idx = skb.get_support(indices=True)
print(f"\n选择的特征索引: {selected_idx}")
print(f"F-分数: {skb.scores_[selected_idx]}")

# 互信息选择
mi_selector = SelectKBest(mutual_info_classif, k=10)
X_mi = mi_selector.fit_transform(X_cls, y_cls)
mi_selected_idx = mi_selector.get_support(indices=True)
print(f"\n互信息选择的特征索引: {mi_selected_idx}")
```

### 5.2 包装法

```python
from sklearn.feature_selection import RFE, RFECV
from sklearn.ensemble import RandomForestClassifier

# 递归特征消除
rf = RandomForestClassifier(n_estimators=100, random_state=42)
rfe = RFE(estimator=rf, n_features_to_select=10)
X_rfe = rfe.fit_transform(X_cls, y_cls)

print(f"RFE选择的特征数量: {X_rfe.shape[1]}")
print(f"特征排名: {rfe.ranking_}")

# 带交叉验证的RFE
rfecv = RFECV(estimator=rf, step=1, cv=5, scoring='accuracy')
rfecv.fit(X_cls, y_cls)

print(f"\nRFECV最优特征数: {rfecv.n_features_}")
print(f"交叉验证分数: {rfecv.cv_results_['mean_test_score']}")

# 可视化
plt.figure(figsize=(10, 6))
plt.plot(range(1, len(rfecv.cv_results_['mean_test_score']) + 1),
         rfecv.cv_results_['mean_test_score'])
plt.xlabel('特征数量')
plt.ylabel('交叉验证准确率')
plt.title('RFECV特征选择曲线')
plt.grid(True)
plt.show()
```

### 5.3 嵌入法

```python
from sklearn.feature_selection import SelectFromModel
from sklearn.linear_model import Lasso, LogisticRegression

# 基于树模型的特征选择
rf_selector = SelectFromModel(
    RandomForestClassifier(n_estimators=100, random_state=42),
    threshold='median'
)
X_tree_selected = rf_selector.fit_transform(X_cls, y_cls)
print(f"树模型选择: {X_cls.shape[1]} -> {X_tree_selected.shape[1]} 特征")

# 基于L1正则化的特征选择
lasso_selector = SelectFromModel(
    LogisticRegression(penalty='l1', solver='saga', C=0.1, max_iter=1000),
    threshold='mean'
)
X_lasso_selected = lasso_selector.fit_transform(X_cls, y_cls)
print(f"Lasso选择: {X_cls.shape[1]} -> {X_lasso_selected.shape[1]} 特征")

# 特征重要性可视化
rf.fit(X_cls, y_cls)
importance = rf.feature_importances_

plt.figure(figsize=(12, 6))
plt.bar(feature_names, importance)
plt.xticks(rotation=45)
plt.xlabel('特征')
plt.ylabel('重要性')
plt.title('随机森林特征重要性')
plt.tight_layout()
plt.show()
```

## 六、特征工程流水线

### 6.1 构建完整的预处理流水线

```python
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

# 创建完整的示例数据
np.random.seed(42)
full_data = pd.DataFrame({
    'age': np.random.randint(18, 80, 500),
    'income': np.random.normal(50000, 20000, 500),
    'education': np.random.choice(['高中', '本科', '硕士', '博士'], 500),
    'city': np.random.choice(['北京', '上海', '广州', '深圳'], 500),
    'experience': np.random.randint(0, 40, 500),
    'target': np.random.randint(0, 2, 500)
})

# 人为引入缺失值
full_data.loc[np.random.choice(500, 50), 'income'] = np.nan
full_data.loc[np.random.choice(500, 30), 'age'] = np.nan

# 定义特征类型
numerical_features = ['age', 'income', 'experience']
categorical_features = ['education', 'city']

# 数值特征流水线
numerical_transformer = Pipeline(steps=[
    ('imputer', KNNImputer(n_neighbors=5)),
    ('scaler', StandardScaler())
])

# 分类特征流水线
categorical_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='most_frequent')),
    ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
])

# 组合流水线
preprocessor = ColumnTransformer(
    transformers=[
        ('num', numerical_transformer, numerical_features),
        ('cat', categorical_transformer, categorical_features)
    ]
)

# 完整流水线（预处理 + 模型）
full_pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))
])

# 准备数据
X = full_data.drop('target', axis=1)
y = full_data['target']

# 训练和评估
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
full_pipeline.fit(X_train, y_train)
accuracy = full_pipeline.score(X_test, y_test)

print(f"流水线模型准确率: {accuracy:.4f}")

# 查看处理后的特征
X_processed = preprocessor.fit_transform(X_train)
print(f"\n处理后特征数量: {X_processed.shape[1]}")
```

## 七、总结

特征工程是机器学习项目成功的关键因素。本文系统地介绍了：

1. **数据清洗**：处理缺失值和异常值的多种策略
2. **特征变换**：标准化、归一化和非线性变换方法
3. **特征编码**：处理分类特征的各种编码技术
4. **特征构建**：多项式特征、交互特征和时间特征
5. **特征选择**：过滤法、包装法和嵌入法三种主要方法

良好的特征工程实践需要深入理解数据和业务领域。建议：

- 始终从数据探索开始，理解数据的分布和特点
- 使用流水线保证预处理的一致性
- 进行充分的特征选择，避免过拟合
- 记录所有特征工程的决策和原因

掌握特征工程，将显著提升机器学习模型的表现和可靠性。
