---
title: 模型评估方法：从指标到验证策略
date: 2025-02-22
categories: [ai, machine-learning]
tags: [模型评估, 交叉验证, 性能指标, sklearn, 机器学习]
description: 全面讲解机器学习模型评估的核心方法，包括分类和回归指标、交叉验证策略、模型选择技巧
---

# 模型评估方法：从指标到验证策略

模型评估是机器学习流程中至关重要的环节。正确的评估方法能够准确衡量模型性能，避免过拟合，并为模型选择提供可靠依据。本文将系统介绍模型评估的核心方法和最佳实践。

## 一、模型评估概述

### 1.1 为什么需要模型评估

模型评估的核心目的在于：

- **衡量模型性能**：量化模型在数据上的表现
- **检测过拟合**：验证模型是否具备良好的泛化能力
- **模型选择**：在多个候选模型中选择最优方案
- **超参数调优**：为模型优化提供反馈

### 1.2 评估的核心原则

评估模型时需要遵循以下原则：

1. **独立性原则**：测试数据必须与训练数据独立
2. **代表性原则**：测试数据应能代表实际应用场景
3. **一致性原则**：评估方法应与业务目标一致
4. **可重复性原则**：评估结果应可复现

## 二、分类模型评估指标

### 2.1 基础指标

分类问题的基础指标建立在混淆矩阵之上。对于二分类问题，混淆矩阵定义为：

$$
\begin{bmatrix}
TP & FN \\
FP & TN
\end{bmatrix}
$$

其中：
- TP (True Positive)：真正例，预测为正且实际为正
- FP (False Positive)：假正例，预测为正但实际为负
- TN (True Negative)：真负例，预测为负且实际为负
- FN (False Negative)：假负例，预测为负但实际为正

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.datasets import make_classification, make_regression
from sklearn.model_selection import (
    train_test_split, cross_val_score, KFold, StratifiedKFold,
    GridSearchCV, learning_curve, validation_curve
)
from sklearn.linear_model import LogisticRegression, LinearRegression, Ridge
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.metrics import (
    confusion_matrix, accuracy_score, precision_score, recall_score,
    f1_score, classification_report, roc_curve, auc, precision_recall_curve,
    mean_squared_error, mean_absolute_error, r2_score, mean_absolute_percentage_error
)
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

# 创建示例数据
np.random.seed(42)
X, y = make_classification(
    n_samples=1000, n_features=20, n_informative=15,
    n_redundant=3, n_classes=2, weights=[0.7, 0.3], random_state=42
)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# 训练模型
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)
y_pred = model.predict(X_test)
y_prob = model.predict_proba(X_test)[:, 1]

# 混淆矩阵
cm = confusion_matrix(y_test, y_pred)
print("混淆矩阵:")
print(cm)

# 可视化混淆矩阵
plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=['预测负', '预测正'],
            yticklabels=['实际负', '实际正'])
plt.xlabel('预测标签')
plt.ylabel('真实标签')
plt.title('混淆矩阵可视化')
plt.tight_layout()
plt.show()

# 计算基础指标
accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred)
recall = recall_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred)

print(f"\n准确率 (Accuracy): {accuracy:.4f}")
print(f"精确率 (Precision): {precision:.4f}")
print(f"召回率 (Recall): {recall:.4f}")
print(f"F1分数: {f1:.4f}")

print("\n详细分类报告:")
print(classification_report(y_test, y_pred, target_names=['类别0', '类别1']))
```

### 2.2 ROC曲线与AUC

ROC曲线（Receiver Operating Characteristic）展示了不同分类阈值下的真阳性率（TPR）和假阳性率（FPR）：

$$TPR = \frac{TP}{TP + FN}$$

$$FPR = \frac{FP}{FP + TN}$$

AUC（Area Under Curve）是ROC曲线下的面积，衡量分类器的整体性能：

```python
# 计算ROC曲线
fpr, tpr, thresholds = roc_curve(y_test, y_prob)
roc_auc = auc(fpr, tpr)

# 绘制ROC曲线
plt.figure(figsize=(10, 8))
plt.plot(fpr, tpr, color='darkorange', lw=2, label=f'ROC曲线 (AUC = {roc_auc:.4f})')
plt.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--', label='随机猜测')
plt.xlim([0.0, 1.0])
plt.ylim([0.0, 1.05])
plt.xlabel('假阳性率 (FPR)')
plt.ylabel('真阳性率 (TPR)')
plt.title('ROC曲线')
plt.legend(loc='lower right')
plt.grid(True, alpha=0.3)
plt.show()

# 找到最优阈值（Youden's J统计量）
optimal_idx = np.argmax(tpr - fpr)
optimal_threshold = thresholds[optimal_idx]
print(f"\n最优阈值: {optimal_threshold:.4f}")
print(f"对应TPR: {tpr[optimal_idx]:.4f}")
print(f"对应FPR: {fpr[optimal_idx]:.4f}")

# 多模型ROC比较
models = {
    '随机森林': RandomForestClassifier(n_estimators=100, random_state=42),
    '逻辑回归': LogisticRegression(max_iter=1000),
    'SVM': Pipeline([('scaler', StandardScaler()), ('svm', SVC(probability=True))])
}

plt.figure(figsize=(10, 8))
for name, model in models.items():
    model.fit(X_train, y_train)
    if hasattr(model, 'predict_proba'):
        y_prob = model.predict_proba(X_test)[:, 1]
    else:
        y_prob = model.decision_function(X_test)
    fpr, tpr, _ = roc_curve(y_test, y_prob)
    roc_auc = auc(fpr, tpr)
    plt.plot(fpr, tpr, lw=2, label=f'{name} (AUC = {roc_auc:.4f})')

plt.plot([0, 1], [0, 1], 'k--', lw=2)
plt.xlabel('假阳性率')
plt.ylabel('真阳性率')
plt.title('多模型ROC曲线比较')
plt.legend(loc='lower right')
plt.grid(True, alpha=0.3)
plt.show()
```

### 2.3 精确率-召回率曲线

对于类别不平衡问题，PR曲线比ROC曲线更有意义：

```python
# 精确率-召回率曲线
precision_curve, recall_curve, pr_thresholds = precision_recall_curve(y_test, y_prob)
pr_auc = auc(recall_curve, precision_curve)

plt.figure(figsize=(10, 8))
plt.plot(recall_curve, precision_curve, color='blue', lw=2,
         label=f'PR曲线 (AUC = {pr_auc:.4f})')
plt.xlabel('召回率')
plt.ylabel('精确率')
plt.title('精确率-召回率曲线')
plt.legend()
plt.grid(True, alpha=0.3)
plt.show()

# 比较ROC和PR曲线
fig, axes = plt.subplots(1, 2, figsize=(14, 6))

# ROC
axes[0].plot(fpr, tpr, color='darkorange', lw=2, label=f'ROC (AUC = {roc_auc:.4f})')
axes[0].plot([0, 1], [0, 1], 'k--', lw=2)
axes[0].set_xlabel('假阳性率')
axes[0].set_ylabel('真阳性率')
axes[0].set_title('ROC曲线')
axes[0].legend()
axes[0].grid(True, alpha=0.3)

# PR
axes[1].plot(recall_curve, precision_curve, color='blue', lw=2,
             label=f'PR (AUC = {pr_auc:.4f})')
axes[1].set_xlabel('召回率')
axes[1].set_ylabel('精确率')
axes[1].set_title('PR曲线')
axes[1].legend()
axes[1].grid(True, alpha=0.3)

plt.tight_layout()
plt.show()
```

### 2.4 多分类指标

```python
from sklearn.metrics import cohen_kappa_score, matthews_corrcoef, log_loss

# 创建多分类数据
X_multi, y_multi = make_classification(
    n_samples=1000, n_features=20, n_informative=15,
    n_classes=3, random_state=42
)
X_train_m, X_test_m, y_train_m, y_test_m = train_test_split(
    X_multi, y_multi, test_size=0.2, random_state=42
)

# 训练模型
multi_model = RandomForestClassifier(n_estimators=100, random_state=42)
multi_model.fit(X_train_m, y_train_m)
y_pred_m = multi_model.predict(X_test_m)
y_prob_m = multi_model.predict_proba(X_test_m)

# 多分类报告
print("多分类报告:")
print(classification_report(y_test_m, y_pred_m))

# 混淆矩阵
cm_multi = confusion_matrix(y_test_m, y_pred_m)
plt.figure(figsize=(8, 6))
sns.heatmap(cm_multi, annot=True, fmt='d', cmap='Greens')
plt.xlabel('预测标签')
plt.ylabel('真实标签')
plt.title('多分类混淆矩阵')
plt.show()

# 其他指标
kappa = cohen_kappa_score(y_test_m, y_pred_m)
mcc = matthews_corrcoef(y_test_m, y_pred_m)
logloss = log_loss(y_test_m, y_prob_m)

print(f"\nCohen's Kappa: {kappa:.4f}")
print(f"Matthews相关系数: {mcc:.4f}")
print(f"Log Loss: {logloss:.4f}")
```

## 三、回归模型评估指标

### 3.1 常用回归指标

回归问题的常用指标包括：

**均方误差 (MSE)**：
$$MSE = \frac{1}{n}\sum_{i=1}^{n}(y_i - \hat{y}_i)^2$$

**均方根误差 (RMSE)**：
$$RMSE = \sqrt{MSE} = \sqrt{\frac{1}{n}\sum_{i=1}^{n}(y_i - \hat{y}_i)^2}$$

**平均绝对误差 (MAE)**：
$$MAE = \frac{1}{n}\sum_{i=1}^{n}|y_i - \hat{y}_i|$$

**决定系数 (R²)**：
$$R^2 = 1 - \frac{\sum_{i=1}^{n}(y_i - \hat{y}_i)^2}{\sum_{i=1}^{n}(y_i - \bar{y})^2}$$

```python
# 创建回归数据
X_reg, y_reg = make_regression(
    n_samples=1000, n_features=20, n_informative=15,
    noise=10, random_state=42
)
X_train_r, X_test_r, y_train_r, y_test_r = train_test_split(
    X_reg, y_reg, test_size=0.2, random_state=42
)

# 训练模型
reg_model = LinearRegression()
reg_model.fit(X_train_r, y_train_r)
y_pred_r = reg_model.predict(X_test_r)

# 计算指标
mse = mean_squared_error(y_test_r, y_pred_r)
rmse = np.sqrt(mse)
mae = mean_absolute_error(y_test_r, y_pred_r)
r2 = r2_score(y_test_r, y_pred_r)
mape = mean_absolute_percentage_error(y_test_r, y_pred_r)

print("回归指标:")
print(f"MSE: {mse:.4f}")
print(f"RMSE: {rmse:.4f}")
print(f"MAE: {mae:.4f}")
print(f"R²: {r2:.4f}")
print(f"MAPE: {mape:.4f}")

# 残差分析
residuals = y_test_r - y_pred_r

fig, axes = plt.subplots(2, 2, figsize=(14, 10))

# 预测值vs实际值
axes[0, 0].scatter(y_test_r, y_pred_r, alpha=0.5)
axes[0, 0].plot([y_test_r.min(), y_test_r.max()],
                [y_test_r.min(), y_test_r.max()], 'r--', lw=2)
axes[0, 0].set_xlabel('实际值')
axes[0, 0].set_ylabel('预测值')
axes[0, 0].set_title(f'预测值 vs 实际值 (R²={r2:.4f})')

# 残差分布
axes[0, 1].hist(residuals, bins=30, edgecolor='black', alpha=0.7)
axes[0, 1].axvline(x=0, color='red', linestyle='--')
axes[0, 1].set_xlabel('残差')
axes[0, 1].set_ylabel('频数')
axes[0, 1].set_title('残差分布')

# 残差vs预测值
axes[1, 0].scatter(y_pred_r, residuals, alpha=0.5)
axes[1, 0].axhline(y=0, color='red', linestyle='--')
axes[1, 0].set_xlabel('预测值')
axes[1, 0].set_ylabel('残差')
axes[1, 0].set_title('残差 vs 预测值')

# Q-Q图
from scipy import stats
stats.probplot(residuals, dist="norm", plot=axes[1, 1])
axes[1, 1].set_title('Q-Q图')

plt.tight_layout()
plt.show()

# 多模型比较
reg_models = {
    '线性回归': LinearRegression(),
    '岭回归': Ridge(alpha=1.0),
    '随机森林': RandomForestRegressor(n_estimators=100, random_state=42)
}

results = []
for name, model in reg_models.items():
    model.fit(X_train_r, y_train_r)
    y_pred = model.predict(X_test_r)
    results.append({
        '模型': name,
        'MSE': mean_squared_error(y_test_r, y_pred),
        'RMSE': np.sqrt(mean_squared_error(y_test_r, y_pred)),
        'MAE': mean_absolute_error(y_test_r, y_pred),
        'R²': r2_score(y_test_r, y_pred)
    })

results_df = pd.DataFrame(results)
print("\n模型比较:")
print(results_df.to_string(index=False))
```

## 四、交叉验证策略

### 4.1 K折交叉验证

交叉验证是评估模型泛化能力的可靠方法：

```python
from sklearn.model_selection import cross_validate, RepeatedKFold, LeaveOneOut

# 基本K折交叉验证
kf = KFold(n_splits=5, shuffle=True, random_state=42)
cv_scores = cross_val_score(
    RandomForestClassifier(n_estimators=100, random_state=42),
    X, y, cv=kf, scoring='accuracy'
)

print(f"K折交叉验证结果:")
print(f"各折分数: {cv_scores}")
print(f"平均分数: {cv_scores.mean():.4f}")
print(f"标准差: {cv_scores.std():.4f}")

# 多指标交叉验证
scoring = ['accuracy', 'precision', 'recall', 'f1', 'roc_auc']
cv_results = cross_validate(
    RandomForestClassifier(n_estimators=100, random_state=42),
    X, y, cv=kf, scoring=scoring, return_train_score=True
)

print("\n多指标交叉验证结果:")
for metric in scoring:
    test_mean = cv_results[f'test_{metric}'].mean()
    test_std = cv_results[f'test_{metric}'].std()
    train_mean = cv_results[f'train_{metric}'].mean()
    print(f"{metric}: 测试={test_mean:.4f}(±{test_std:.4f}), 训练={train_mean:.4f}")

# 分层K折交叉验证 (适用于类别不平衡)
skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
stratified_scores = cross_val_score(
    RandomForestClassifier(n_estimators=100, random_state=42),
    X, y, cv=skf, scoring='accuracy'
)

print(f"\n分层K折交叉验证:")
print(f"平均分数: {stratified_scores.mean():.4f}")
print(f"标准差: {stratified_scores.std():.4f}")

# 重复K折交叉验证
rkf = RepeatedKFold(n_splits=5, n_repeats=10, random_state=42)
repeated_scores = cross_val_score(
    RandomForestClassifier(n_estimators=100, random_state=42),
    X, y, cv=rkf, scoring='accuracy'
)

print(f"\n重复K折交叉验证 (5折 x 10次):")
print(f"平均分数: {repeated_scores.mean():.4f}")
print(f"标准差: {repeated_scores.std():.4f}")

# 可视化交叉验证分数分布
plt.figure(figsize=(12, 6))
plt.boxplot([cv_scores, stratified_scores], labels=['K折', '分层K折'])
plt.ylabel('准确率')
plt.title('交叉验证结果比较')
plt.grid(True, alpha=0.3)
plt.show()
```

### 4.2 学习曲线

学习曲线帮助诊断模型的偏差和方差问题：

```python
# 学习曲线
train_sizes, train_scores, test_scores = learning_curve(
    RandomForestClassifier(n_estimators=100, random_state=42),
    X, y, cv=5, n_jobs=-1,
    train_sizes=np.linspace(0.1, 1.0, 10),
    scoring='accuracy'
)

train_mean = train_scores.mean(axis=1)
train_std = train_scores.std(axis=1)
test_mean = test_scores.mean(axis=1)
test_std = test_scores.std(axis=1)

plt.figure(figsize=(10, 6))
plt.plot(train_sizes, train_mean, 'o-', color='r', label='训练分数')
plt.fill_between(train_sizes, train_mean - train_std, train_mean + train_std,
                 alpha=0.1, color='r')
plt.plot(train_sizes, test_mean, 'o-', color='g', label='验证分数')
plt.fill_between(train_sizes, test_mean - test_std, test_mean + test_std,
                 alpha=0.1, color='g')
plt.xlabel('训练样本数')
plt.ylabel('准确率')
plt.title('学习曲线')
plt.legend(loc='lower right')
plt.grid(True, alpha=0.3)
plt.show()

print("学习曲线分析:")
print(f"训练集最终分数: {train_mean[-1]:.4f}")
print(f"验证集最终分数: {test_mean[-1]:.4f}")
print(f"分数差距: {train_mean[-1] - test_mean[-1]:.4f}")

if train_mean[-1] - test_mean[-1] > 0.1:
    print("诊断: 存在过拟合，考虑增加数据或正则化")
elif train_mean[-1] < 0.8 and test_mean[-1] < 0.8:
    print("诊断: 存在欠拟合，考虑增加模型复杂度")
else:
    print("诊断: 模型拟合良好")
```

### 4.3 验证曲线

验证曲线用于分析超参数对模型性能的影响：

```python
# 验证曲线 - n_estimators
param_range = [10, 50, 100, 150, 200]
train_scores, test_scores = validation_curve(
    RandomForestClassifier(random_state=42),
    X, y, param_name='n_estimators', param_range=param_range,
    cv=5, scoring='accuracy', n_jobs=-1
)

train_mean = train_scores.mean(axis=1)
train_std = train_scores.std(axis=1)
test_mean = test_scores.mean(axis=1)
test_std = test_scores.std(axis=1)

plt.figure(figsize=(10, 6))
plt.plot(param_range, train_mean, 'o-', color='r', label='训练分数')
plt.fill_between(param_range, train_mean - train_std, train_mean + train_std,
                 alpha=0.1, color='r')
plt.plot(param_range, test_mean, 'o-', color='g', label='验证分数')
plt.fill_between(param_range, test_mean - test_std, test_mean + test_std,
                 alpha=0.1, color='g')
plt.xlabel('n_estimators')
plt.ylabel('准确率')
plt.title('验证曲线 - 随机森林n_estimators')
plt.legend()
plt.grid(True, alpha=0.3)
plt.show()

# 验证曲线 - max_depth
param_range = [3, 5, 7, 10, 15, 20, None]
train_scores, test_scores = validation_curve(
    RandomForestClassifier(n_estimators=100, random_state=42),
    X, y, param_name='max_depth', param_range=param_range,
    cv=5, scoring='accuracy', n_jobs=-1
)

test_mean = test_scores.mean(axis=1)
best_idx = np.argmax(test_mean)
print(f"\n最优max_depth: {param_range[best_idx]}")
print(f"对应验证分数: {test_mean[best_idx]:.4f}")
```

## 五、模型选择与比较

### 5.1 网格搜索调参

```python
# 网格搜索
param_grid = {
    'n_estimators': [50, 100, 150],
    'max_depth': [5, 10, 15, None],
    'min_samples_split': [2, 5, 10],
    'min_samples_leaf': [1, 2, 4]
}

grid_search = GridSearchCV(
    RandomForestClassifier(random_state=42),
    param_grid, cv=5, scoring='accuracy', n_jobs=-1, verbose=1
)
grid_search.fit(X_train, y_train)

print(f"最佳参数: {grid_search.best_params_}")
print(f"最佳交叉验证分数: {grid_search.best_score_:.4f}")

# 使用最佳模型
best_model = grid_search.best_estimator_
test_accuracy = best_model.score(X_test, y_test)
print(f"测试集准确率: {test_accuracy:.4f}")

# 参数重要性
results = pd.DataFrame(grid_search.cv_results_)
print("\nTop 5 参数组合:")
print(results[['params', 'mean_test_score', 'std_test_score', 'rank_test_score']]
      .sort_values('rank_test_score').head())
```

### 5.2 模型比较框架

```python
from sklearn.model_selection import cross_val_score
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier

# 定义多个模型
models = {
    '逻辑回归': LogisticRegression(max_iter=1000),
    'K近邻': Pipeline([('scaler', StandardScaler()),
                       ('knn', KNeighborsClassifier())]),
    '决策树': DecisionTreeClassifier(random_state=42),
    '随机森林': RandomForestClassifier(n_estimators=100, random_state=42),
    'GBDT': GradientBoostingClassifier(random_state=42)
}

# 交叉验证比较
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
model_results = []

for name, model in models.items():
    scores = cross_val_score(model, X, y, cv=cv, scoring='accuracy')
    model_results.append({
        '模型': name,
        '平均分数': scores.mean(),
        '标准差': scores.std(),
        '最小值': scores.min(),
        '最大值': scores.max()
    })

results_df = pd.DataFrame(model_results).sort_values('平均分数', ascending=False)
print("模型比较结果:")
print(results_df.to_string(index=False))

# 可视化
plt.figure(figsize=(12, 6))
plt.barh(results_df['模型'], results_df['平均分数'],
         xerr=results_df['标准差'], capsize=5)
plt.xlabel('准确率')
plt.title('模型性能比较')
plt.grid(True, alpha=0.3, axis='x')
plt.tight_layout()
plt.show()
```

## 六、类别不平衡处理评估

```python
from imblearn.over_sampling import SMOTE
from imblearn.under_sampling import RandomUnderSampler
from sklearn.metrics import balanced_accuracy_score

# 创建不平衡数据
X_imb, y_imb = make_classification(
    n_samples=1000, n_features=20, n_informative=15,
    n_classes=2, weights=[0.9, 0.1], random_state=42
)
X_train_i, X_test_i, y_train_i, y_test_i = train_test_split(
    X_imb, y_imb, test_size=0.2, random_state=42, stratify=y_imb
)

print("类别分布:")
print(f"训练集: 类别0={sum(y_train_i==0)}, 类别1={sum(y_train_i==1)}")

# 原始模型
model_orig = RandomForestClassifier(n_estimators=100, random_state=42)
model_orig.fit(X_train_i, y_train_i)
y_pred_orig = model_orig.predict(X_test_i)

# 过采样 (SMOTE)
smote = SMOTE(random_state=42)
X_train_smote, y_train_smote = smote.fit_resample(X_train_i, y_train_i)
model_smote = RandomForestClassifier(n_estimators=100, random_state=42)
model_smote.fit(X_train_smote, y_train_smote)
y_pred_smote = model_smote.predict(X_test_i)

# 欠采样
rus = RandomUnderSampler(random_state=42)
X_train_rus, y_train_rus = rus.fit_resample(X_train_i, y_train_i)
model_rus = RandomForestClassifier(n_estimators=100, random_state=42)
model_rus.fit(X_train_rus, y_train_rus)
y_pred_rus = model_rus.predict(X_test_i)

# 比较
methods = ['原始', 'SMOTE', '欠采样']
predictions = [y_pred_orig, y_pred_smote, y_pred_rus]

print("\n不平衡处理方法比较:")
for method, y_pred in zip(methods, predictions):
    print(f"\n{method}:")
    print(f"  准确率: {accuracy_score(y_test_i, y_pred):.4f}")
    print(f"  平衡准确率: {balanced_accuracy_score(y_test_i, y_pred):.4f}")
    print(f"  F1分数: {f1_score(y_test_i, y_pred):.4f}")
```

## 七、总结

模型评估是机器学习项目成功的关键环节。本文系统介绍了：

1. **分类评估指标**：混淆矩阵、准确率、精确率、召回率、F1分数、ROC/AUC、PR曲线
2. **回归评估指标**：MSE、RMSE、MAE、R²、残差分析
3. **交叉验证策略**：K折、分层K折、重复K折
4. **诊断工具**：学习曲线、验证曲线
5. **模型选择**：网格搜索、模型比较框架
6. **不平衡问题**：采样方法与评估调整

实际应用中，应根据业务场景选择合适的评估指标和验证策略。关键建议：

- 使用交叉验证而非单次划分
- 关注业务相关指标而非单一指标
- 类别不平衡时使用PR曲线或平衡准确率
- 通过学习曲线诊断模型问题

掌握这些评估方法，才能准确衡量模型性能并做出正确的优化决策。