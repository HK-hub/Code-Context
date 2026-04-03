---
title: 机器学习数学基础：从概率到优化
date: 2025-03-18
categories: [ai, machine-learning]
tags: [数学基础, 概率论, 线性代数, 优化理论, 机器学习]
description: 系统讲解机器学习所需的数学基础，包括概率论、线性代数、信息论和优化理论
---

# 机器学习数学基础：从概率到优化

机器学习的本质是数学。从概率论到优化理论，数学为机器学习算法提供了坚实的理论基础。本文将系统地介绍机器学习所需的核心数学知识，帮助读者深入理解算法原理。

## 一、概率论基础

### 1.1 基本概念

概率论是机器学习最重要的数学基础。概率用于描述事件发生的不确定性，是统计推断和机器学习建模的核心工具。

**概率的定义**：对于事件A，概率 $P(A)$ 表示事件A发生的可能性，满足以下公理：

1. **非负性**：$P(A) \geq 0$
2. **规范性**：$P(\Omega) = 1$，其中 $\Omega$ 是样本空间
3. **可加性**：对于互斥事件 $A_1, A_2, ...$，有 $P(\cup_{i}A_i) = \sum_{i}P(A_i)$

**条件概率**：在事件B发生的条件下，事件A发生的概率：

$$P(A|B) = \frac{P(A \cap B)}{P(B)}$$

**贝叶斯定理**：描述条件概率之间的关系：

$$P(A|B) = \frac{P(B|A) \cdot P(A)}{P(B)}$$

贝叶斯定理在机器学习中有着广泛的应用，尤其是在贝叶斯分类器和贝叶斯推断中。

```python
import numpy as np
import matplotlib.pyplot as plt
from scipy import stats
from scipy.special import factorial, comb
import seaborn as sns

# 贝叶斯定理示例：医学诊断
# 已知：疾病发生率P(D) = 0.01
# 测试正确率：P(+|D) = 0.95 (真阳性率)
# 测试误报率：P(+|~D) = 0.05 (假阳性率)

P_D = 0.01  # 先验概率
P_pos_given_D = 0.95  # 灵敏度
P_pos_given_not_D = 0.05  # 假阳性率

# 贝叶斯定理计算
P_pos = P_pos_given_D * P_D + P_pos_given_not_D * (1 - P_D)
P_D_given_pos = (P_pos_given_D * P_D) / P_pos

print("贝叶斯定理应用示例 - 医学诊断:")
print(f"疾病发生率 P(D): {P_D}")
print(f"测试阳性时真正患病的概率 P(D|+): {P_D_given_pos:.4f}")
print(f"\n这个结果说明即使测试阳性，实际患病概率仅约{P_D_given_pos*100:.1f}%")
print("原因：低发病率导致大量假阳性样本")
```

### 1.2 常见概率分布

**伯努利分布**：描述二元随机变量，参数为 $p$：

$$P(X=1) = p, \quad P(X=0) = 1-p$$

期望：$E[X] = p$，方差：$Var(X) = p(1-p)$

**二项分布**：n次独立伯努利试验中成功的次数：

$$P(X=k) = C(n,k)p^k(1-p)^{n-k}$$

期望：$E[X] = np$，方差：$Var(X) = np(1-p)$

```python
# 二项分布可视化
n_values = [10, 20, 50]
p_values = [0.3, 0.5, 0.7]

fig, axes = plt.subplots(3, 3, figsize=(12, 10))

for i, n in enumerate(n_values):
    for j, p in enumerate(p_values):
        k = np.arange(0, n+1)
        probs = stats.binom.pmf(k, n, p)
        
        axes[i, j].bar(k, probs, alpha=0.7, edgecolor='black')
        axes[i, j].set_title(f'n={n}, p={p}')
        axes[i, j].set_xlabel('k')
        axes[i, j].set_ylabel('P(X=k)')
        
        # 标注期望和方差
        mean = n * p
        var = n * p * (1 - p)
        axes[i, j].axvline(mean, color='red', linestyle='--', label=f'E[X]={mean:.1f}')
        axes[i, j].legend()

plt.suptitle('二项分布可视化', fontsize=14)
plt.tight_layout()
plt.show()
```

**正态分布（高斯分布）**：最重要的连续分布，由均值 $\mu$ 和方差 $\sigma^2$ 参数化：

$$f(x) = \frac{1}{\sqrt{2\pi\sigma^2}}e^{-\frac{(x-\mu)^2}{2\sigma^2}}$$

```python
# 正态分布可视化
mu_values = [0, 0, 0, -2]
sigma_values = [1, 2, 0.5, 1]

fig, ax = plt.subplots(figsize=(12, 6))

x = np.linspace(-6, 6, 200)

for mu, sigma in zip(mu_values, sigma_values):
    y = stats.norm.pdf(x, mu, sigma)
    ax.plot(x, y, linewidth=2, label=f'μ={mu}, σ={sigma}')

ax.set_xlabel('x')
ax.set_ylabel('概率密度')
ax.set_title('正态分布比较')
ax.legend()
ax.grid(True, alpha=0.3)

# 标注68-95-99.7规则
ax.fill_between(x, stats.norm.pdf(x, 0, 1), where=(x >= -1) & (x <= 1),
                alpha=0.3, color='blue', label='±1σ (68.27%)')

plt.tight_layout()
plt.show()

print("正态分布的68-95-99.7规则:")
print("- 约68%的数据落在μ±σ范围内")
print("- 约95%的数据落在μ±2σ范围内")
print("- 约99.7%的数据落在μ±3σ范围内")
```

**泊松分布**：描述单位时间内事件发生的次数：

$$P(X=k) = \frac{\lambda^k e^{-\lambda}}{k!}$$

```python
# 泊松分布可视化
lambda_values = [1, 4, 10]

fig, ax = plt.subplots(figsize=(10, 6))

for lam in lambda_values:
    k = np.arange(0, 25)
    probs = stats.poisson.pmf(k, lam)
    ax.plot(k, probs, 'o-', markersize=8, label=f'λ={lam}')

ax.set_xlabel('k')
ax.set_ylabel('P(X=k)')
ax.set_title('泊松分布')
ax.legend()
ax.grid(True, alpha=0.3)
plt.show()
```

### 1.3 大数定律与中心极限定理

**大数定律**：样本均值收敛于期望值：

$$\lim_{n \to \infty} \frac{1}{n}\sum_{i=1}^{n}X_i = E[X]$$

**中心极限定理**：大量独立随机变量之和趋向正态分布：

$$\frac{\sum_{i=1}^{n}X_i - n\mu}{\sqrt{n}\sigma} \xrightarrow{d} N(0,1)$$

```python
# 中心极限定理演示
np.random.seed(42)

# 从均匀分布抽样
population = np.random.uniform(0, 1, 100000)

# 不同样本大小的抽样均值分布
sample_sizes = [10, 30, 100, 500]
n_samples = 1000

fig, axes = plt.subplots(2, 2, figsize=(12, 10))

for i, n in enumerate(sample_sizes):
    sample_means = [np.mean(np.random.choice(population, n)) for _ in range(n_samples)]
    
    ax = axes[i//2, i%2]
    ax.hist(sample_means, bins=30, density=True, alpha=0.7, edgecolor='black')
    
    # 绘制正态分布曲线
    mu = np.mean(sample_means)
    sigma = np.std(sample_means)
    x = np.linspace(mu - 3*sigma, mu + 3*sigma, 100)
    ax.plot(x, stats.norm.pdf(x, mu, sigma), 'r-', linewidth=2, label='正态拟合')
    
    ax.set_title(f'样本大小 n={n}')
    ax.set_xlabel('样本均值')
    ax.set_ylabel('密度')
    ax.legend()

plt.suptitle('中心极限定理演示', fontsize=14)
plt.tight_layout()
plt.show()

print("中心极限定理演示:")
print("随着样本量增加，样本均值的分布越来越接近正态分布")
```

## 二、线性代数基础

### 2.1 向量与矩阵运算

线性代数是理解机器学习算法的关键。神经网络、PCA、SVD等都依赖线性代数运算。

**向量运算**：
- 加法：$\mathbf{a} + \mathbf{b} = (a_1 + b_1, ..., a_n + b_n)$
- 数乘：$c\mathbf{a} = (ca_1, ..., ca_n)$
- 内积：$\mathbf{a} \cdot \mathbf{b} = \sum_{i=1}^{n}a_i b_i$

```python
# 向量运算示例
import numpy as np

# 创建向量
a = np.array([1, 2, 3])
b = np.array([4, 5, 6])

print("向量运算示例:")
print(f"a + b = {a + b}")
print(f"a * 2 = {a * 2}")
print(f"a · b = {np.dot(a, b)}")

# 向量的几何意义
# 内积可以计算夹角
cos_angle = np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
angle = np.arccos(cos_angle)
print(f"\na和b的夹角: {np.degrees(angle):.2f}°")
```

**矩阵运算**：

```python
# 矩阵运算示例
A = np.array([[1, 2], [3, 4]])
B = np.array([[5, 6], [7, 8]])

print("\n矩阵运算示例:")
print(f"A =\n{A}")
print(f"B =\n{B}")
print(f"\nA + B =\n{A + B}")
print(f"\nA × B (矩阵乘法) =\n{np.dot(A, B)}")
print(f"\nAᵀ (转置) =\n{A.T}")
print(f"\ndet(A) (行列式) = {np.linalg.det(A):.2f}")
print(f"\nA⁻¹ (逆矩阵) =\n{np.linalg.inv(A)}")

# 特殊矩阵
print("\n特殊矩阵:")
print(f"单位矩阵 I₂ =\n{np.eye(2)}")
print(f"零矩阵 =\n{np.zeros((2, 2))}")
print(f"对角矩阵 diag([1,2,3]) =\n{np.diag([1, 2, 3])}")
```

### 2.2 矩阵分解

**特征值分解**：对于方阵A，若存在向量v和标量λ使得 $Av = λv$，则λ是特征值，v是特征向量。

```python
# 特征值分解
A = np.array([[4, 2], [1, 3]])

eigenvalues, eigenvectors = np.linalg.eig(A)

print("特征值分解:")
print(f"A =\n{A}")
print(f"\n特征值: {eigenvalues}")
print(f"特征向量:\n{eigenvectors}")

# 验证 Av = λv
for i in range(len(eigenvalues)):
    v = eigenvectors[:, i]
    lambda_v = eigenvalues[i]
    Av = np.dot(A, v)
    lambda_v_times_v = lambda_v * v
    print(f"\n验证特征值{lambda_v:.2f}:")
    print(f"Av = {Av}")
    print(f"λv = {lambda_v_times_v}")
    print(f"误差 = {np.linalg.norm(Av - lambda_v_times_v):.6f}")

# 可视化特征向量
fig, ax = plt.subplots(figsize=(8, 8))
ax.set_xlim(-2, 5)
ax.set_ylim(-2, 5)

# 绘制原始向量
ax.arrow(0, 0, eigenvectors[0, 0], eigenvectors[1, 0],
         head_width=0.2, head_length=0.1, fc='blue', ec='blue')
ax.arrow(0, 0, eigenvectors[0, 1], eigenvectors[1, 1],
         head_width=0.2, head_length=0.1, fc='green', ec='green')

# 绘制变换后的向量
transformed_v1 = np.dot(A, eigenvectors[:, 0])
transformed_v2 = np.dot(A, eigenvectors[:, 1])
ax.arrow(0, 0, transformed_v1[0], transformed_v1[1],
         head_width=0.2, head_length=0.1, fc='red', ec='red', alpha=0.5)
ax.arrow(0, 0, transformed_v2[0], transformed_v2[1],
         head_width=0.2, head_length=0.1, fc='orange', ec='orange', alpha=0.5)

ax.set_aspect('equal')
ax.grid(True)
ax.set_title('特征向量变换')
ax.legend(['v1', 'v2', 'Av1', 'Av2'])
plt.show()
```

**奇异值分解（SVD）**：任何矩阵都可以分解为 $A = UΣV^T$

```python
# SVD分解
A_svd = np.array([[1, 2, 3], [4, 5, 6], [7, 8, 9]])

U, S, Vt = np.linalg.svd(A_svd)

print("奇异值分解 (SVD):")
print(f"A =\n{A_svd}")
print(f"\nU =\n{U}")
print(f"\n奇异值 S = {S}")
print(f"\nVᵀ =\n{Vt}")

# 重构矩阵
Sigma = np.diag(S)
reconstructed = np.dot(U, np.dot(Sigma, Vt))
print(f"\n重构矩阵 =\n{reconstructed}")

# 低秩近似（压缩）
rank = 2
Sigma_low = np.diag(S[:rank])
U_low = U[:, :rank]
Vt_low = Vt[:rank, :]
low_rank_approx = np.dot(U_low, np.dot(Sigma_low, Vt_low))

print(f"\n秩{rank}近似矩阵 =\n{low_rank_approx}")
print(f"\n近似误差 (Frobenius范数) = {np.linalg.norm(A_svd - low_rank_approx):.4f}")

# 使用SVD进行图像压缩示例
print("\nSVD应用：图像压缩、PCA、推荐系统等")
```

## 三、信息论基础

### 3.1 熵与信息量

**熵**：衡量随机变量不确定性的度量：

$$H(X) = -\sum_{x \in X}P(x)\log P(x)$$

对于连续变量：

$$H(X) = -\int_{X}p(x)\log p(x)dx$$

```python
# 熵的计算示例
def entropy(p):
    """计算离散分布的熵"""
    p = np.array(p)
    p = p[p > 0]  # 移除零概率
    return -np.sum(p * np.log2(p))

# 不同分布的熵
distributions = {
    '均匀分布 (高熵)': [0.25, 0.25, 0.25, 0.25],
    '偏态分布 (中熵)': [0.4, 0.3, 0.2, 0.1],
    '确定性分布 (低熵)': [0.97, 0.01, 0.01, 0.01]
}

print("熵的比较:")
for name, probs in distributions.items():
    H = entropy(probs)
    print(f"  {name}: H = {H:.4f} bits")

# 可视化熵
fig, axes = plt.subplots(1, 3, figsize=(15, 4))

for i, (name, probs) in enumerate(distributions.items()):
    axes[i].bar(range(len(probs)), probs, edgecolor='black')
    axes[i].set_title(f'{name}\nH={entropy(probs):.2f} bits')
    axes[i].set_xlabel('事件')
    axes[i].set_ylabel('概率')
    axes[i].set_ylim(0, 1)

plt.tight_layout()
plt.show()
```

**交叉熵与KL散度**：

交叉熵：$H(P, Q) = -\sum_{x}P(x)\log Q(x)$

KL散度（相对熵）：$D_{KL}(P||Q) = \sum_{x}P(x)\log\frac{P(x)}{Q(x)}$

```python
def cross_entropy(p, q):
    """计算交叉熵"""
    p = np.array(p)
    q = np.array(q)
    return -np.sum(p * np.log2(q + 1e-10))

def kl_divergence(p, q):
    """计算KL散度"""
    p = np.array(p)
    q = np.array(q)
    mask = p > 0
    return np.sum(p[mask] * np.log2(p[mask] / (q[mask] + 1e-10)))

# KL散度示例
p_true = [0.3, 0.5, 0.2]
q_estimates = [
    [0.3, 0.5, 0.2],  # 完美估计
    [0.25, 0.45, 0.3],  # 较好估计
    [0.1, 0.8, 0.1]   # 较差估计
]

print("\nKL散度比较:")
for i, q in enumerate(q_estimates):
    kl = kl_divergence(p_true, q)
    ce = cross_entropy(p_true, q)
    h_p = entropy(p_true)
    print(f"估计{i+1}: KL(P||Q) = {kl:.4f}, H(P,Q) = {ce:.4f}, H(P) = {h_p:.4f}")
    print(f"       验证: KL(P||Q) = H(P,Q) - H(P) = {ce - h_p:.4f}")
```

### 3.2 信息增益

信息增益用于决策树特征选择：

$$IG(D, A) = H(D) - H(D|A)$$

```python
def information_gain(y, feature_values):
    """计算信息增益"""
    # 原始熵
    n_total = len(y)
    classes = np.unique(y)
    probs = [np.sum(y == c) / n_total for c in classes]
    H_before = entropy(probs)
    
    # 条件熵
    unique_values = np.unique(feature_values)
    H_after = 0
    for val in unique_values:
        subset = y[feature_values == val]
        n_subset = len(subset)
        if n_subset > 0:
            probs_subset = [np.sum(subset == c) / n_subset for c in classes]
            H_after += (n_subset / n_total) * entropy(probs_subset)
    
    return H_before - H_after

# 示例数据
y = np.array([0, 0, 0, 1, 1, 1, 0, 0, 1, 1])
feature = np.array(['A', 'A', 'B', 'B', 'B', 'C', 'C', 'A', 'B', 'C'])

ig = information_gain(y, feature)
print(f"\n信息增益示例:")
print(f"特征值: {feature}")
print(f"标签: {y}")
print(f"信息增益: {ig:.4f} bits")
```

## 四、优化理论

### 4.1 凸优化基础

**凸函数**：满足 $f(tx + (1-t)y) \leq tf(x) + (1-t)f(y)$，其中 $t \in [0,1]$

凸优化的重要性：局部最优即全局最优，保证算法收敛。

```python
# 凸函数与非凸函数可视化
fig, axes = plt.subplots(1, 2, figsize=(12, 5))

x = np.linspace(-5, 5, 100)

# 凸函数: f(x) = x²
y_convex = x**2
axes[0].plot(x, y_convex, 'b-', linewidth=2)
axes[0].set_title('凸函数: f(x) = x²')
axes[0].set_xlabel('x')
axes[0].set_ylabel('f(x)')
axes[0].grid(True, alpha=0.3)
axes[0].scatter([0], [0], color='red', s=100, zorder=5, label='全局最小点')
axes[0].legend()

# 非凸函数: f(x) = x⁴ - 2x² + 0.5x
y_nonconvex = x**4 - 2*x**2 + 0.5*x
axes[1].plot(x, y_nonconvex, 'g-', linewidth=2)
axes[1].set_title('非凸函数: f(x) = x⁴ - 2x² + 0.5x')
axes[1].set_xlabel('x')
axes[1].set_ylabel('f(x)')
axes[1].grid(True, alpha=0.3)
# 标注多个局部最小点
axes[1].scatter([-1.2, 1.2], [y_nonconvex[50], y_nonconvex[70]], 
                color='red', s=100, zorder=5, label='局部最小点')
axes[1].legend()

plt.tight_layout()
plt.show()
```

### 4.2 梯度下降

梯度下降是最常用的优化方法：

$$x_{t+1} = x_t - \eta \nabla f(x_t)$$

其中 $\eta$ 是学习率，$\nabla f(x)$ 是梯度。

```python
def gradient_descent(f, grad_f, x0, learning_rate=0.1, max_iter=100, tol=1e-6):
    """梯度下降算法"""
    x = x0
    path = [x]
    
    for i in range(max_iter):
        gradient = grad_f(x)
        x_new = x - learning_rate * gradient
        
        if abs(x_new - x) < tol:
            break
        
        x = x_new
        path.append(x)
    
    return x, path

# 示例：优化 f(x) = x² + 2x + 1
f = lambda x: x**2 + 2*x + 1
grad_f = lambda x: 2*x + 2

x_opt, path = gradient_descent(f, grad_f, x0=3, learning_rate=0.1)

print("梯度下降示例:")
print(f"初始点: x₀ = 3")
print(f"最优解: x* = {x_opt:.6f}")
print(f"最优值: f(x*) = {f(x_opt):.6f}")
print(f"迭代次数: {len(path)}")

# 可视化优化路径
fig, ax = plt.subplots(figsize=(10, 6))

x = np.linspace(-3, 5, 100)
ax.plot(x, f(x), 'b-', linewidth=2, label='f(x)')

# 绘制优化路径
path_y = [f(p) for p in path]
ax.scatter(path, path_y, color='red', s=50, zorder=5)
ax.plot(path, path_y, 'r--', linewidth=1, label='优化路径')

ax.set_xlabel('x')
ax.set_ylabel('f(x)')
ax.set_title('梯度下降优化路径')
ax.legend()
ax.grid(True, alpha=0.3)
plt.show()
```

### 4.3 牛顿法

牛顿法利用二阶导数信息加速收敛：

$$x_{t+1} = x_t - \frac{\nabla f(x_t)}{\nabla^2 f(x_t)}$$

```python
def newton_method(f, grad_f, hess_f, x0, max_iter=20, tol=1e-10):
    """牛顿法"""
    x = x0
    path = [x]
    
    for i in range(max_iter):
        gradient = grad_f(x)
        hessian = hess_f(x)
        
        x_new = x - gradient / hessian
        
        if abs(x_new - x) < tol:
            break
        
        x = x_new
        path.append(x)
    
    return x, path

# 牛顿法示例
hess_f = lambda x: 2  # f(x) = x² + 2x + 1 的二阶导数

x_opt_newton, path_newton = newton_method(f, grad_f, hess_f, x0=3)

print("\n牛顿法示例:")
print(f"最优解: x* = {x_opt_newton:.6f}")
print(f"迭代次数: {len(path_newton)}")

# 比较梯度下降和牛顿法
print("\n两种方法的比较:")
print(f"梯度下降: {len(path)} 次迭代")
print(f"牛顿法: {len(path_newton)} 次迭代")
print("牛顿法收敛更快，但需要计算二阶导数")
```

### 4.4 正则化

正则化防止过拟合：

- **L1正则化（Lasso）**：$\min_w L(w) + \lambda\|w\|_1$
- **L2正则化（Ridge）**：$\min_w L(w) + \lambda\|w\|_2^2$

```python
from sklearn.linear_model import Ridge, Lasso
from sklearn.datasets import make_regression

# 创建数据
X_reg, y_reg = make_regression(n_samples=100, n_features=50, 
                                n_informative=10, noise=10, random_state=42)

# 不同正则化强度
alphas = [0, 0.1, 1, 10]

fig, axes = plt.subplots(1, 2, figsize=(12, 5))

# Ridge系数变化
ridge_coeffs = []
for alpha in alphas:
    ridge = Ridge(alpha=alpha)
    ridge.fit(X_reg, y_reg)
    ridge_coeffs.append(ridge.coef_)

axes[0].plot(range(len(ridge_coeffs[0])), ridge_coeffs[0], 'o', 
             label=f'α=0 (无正则化)')
for i, alpha in enumerate(alphas[1:], 1):
    axes[0].plot(range(len(ridge_coeffs[i])), ridge_coeffs[i], 'o', 
                 label=f'α={alpha}')
axes[0].set_xlabel('特征索引')
axes[0].set_ylabel('系数值')
axes[0].set_title('Ridge正则化系数')
axes[0].legend()

# Lasso系数变化
lasso_coeffs = []
for alpha in alphas:
    lasso = Lasso(alpha=alpha, max_iter=10000)
    lasso.fit(X_reg, y_reg)
    lasso_coeffs.append(lasso.coef_)

axes[1].plot(range(len(lasso_coeffs[0])), lasso_coeffs[0], 'o', 
             label=f'α=0 (无正则化)')
for i, alpha in enumerate(alphas[1:], 1):
    axes[1].plot(range(len(lasso_coeffs[i])), lasso_coeffs[i], 'o', 
                 label=f'α={alpha}')
axes[1].set_xlabel('特征索引')
axes[1].set_ylabel('系数值')
axes[1].set_title('Lasso正则化系数')
axes[1].legend()

plt.tight_layout()
plt.show()

print("\n正则化效果:")
print("Ridge: 系数收缩但不为零，保留所有特征")
print("Lasso: 系数可以收缩为零，实现特征选择")

# 统计被Lasso消除的特征数
for i, alpha in enumerate(alphas):
    zero_features = np.sum(lasso_coeffs[i] == 0)
    print(f"Lasso α={alpha}: {zero_features} 个特征被消除")
```

## 五、统计推断基础

### 5.1 最大似然估计

最大似然估计（MLE）通过最大化似然函数估计参数：

$$\hat{\theta}_{MLE} = \arg\max_\theta P(D|\theta) = \arg\max_\theta \prod_{i=1}^{n}P(x_i|\theta)$$

```python
# 最大似然估计示例：估计正态分布参数
np.random.seed(42)
true_mu, true_sigma = 5, 2
samples = np.random.normal(true_mu, true_sigma, 100)

# MLE估计
mu_mle = np.mean(samples)
sigma_mle = np.std(samples, ddof=0)  # MLE使用ddof=0

print("最大似然估计示例:")
print(f"真实参数: μ={true_mu}, σ={true_sigma}")
print(f"MLE估计: μ={mu_mle:.4f}, σ={sigma_mle:.4f}")

# 可视化
fig, ax = plt.subplots(figsize=(10, 6))

ax.hist(samples, bins=30, density=True, alpha=0.7, edgecolor='black')

x = np.linspace(mu_mle - 4*sigma_mle, mu_mle + 4*sigma_mle, 100)
y_true = stats.norm.pdf(x, true_mu, true_sigma)
y_mle = stats.norm.pdf(x, mu_mle, sigma_mle)

ax.plot(x, y_true, 'b-', linewidth=2, label='真实分布')
ax.plot(x, y_mle, 'r-', linewidth=2, label='MLE估计分布')

ax.legend()
ax.set_xlabel('值')
ax.set_ylabel('密度')
ax.set_title('最大似然估计拟合')
plt.show()
```

### 5.2 贝叶斯估计

贝叶斯估计结合先验和似然：

$$P(\theta|D) = \frac{P(D|\theta)P(\theta)}{P(D)}$$

```python
# 贝叶斯估计示例：估计硬币正面概率
# 先验: Beta(α, β)
# 观测: n次实验，k次正面
# 后验: Beta(α+k, β+n-k)

alpha_prior, beta_prior = 2, 2  # 假设先验为Beta(2,2)
n_obs, k_obs = 100, 60  # 观测数据

# 后验分布参数
alpha_post = alpha_prior + k_obs
beta_post = beta_prior + n_obs - k_obs

# 计算后验均值（贝叶斯估计）
p_bayesian = alpha_post / (alpha_post + beta_post)

# MLE估计
p_mle = k_obs / n_obs

print("\n贝叶斯估计示例:")
print(f"先验: Beta({alpha_prior}, {beta_prior})")
print(f"观测: {k_obs}次正面，{n_obs-k_obs}次反面")
print(f"后验: Beta({alpha_post}, {beta_post})")
print(f"\nMLE估计: p = {p_mle:.4f}")
print(f"贝叶斯估计: p = {p_bayesian:.4f}")

# 可视化先验和后验
fig, ax = plt.subplots(figsize=(10, 6))

x = np.linspace(0, 1, 100)
prior_pdf = stats.beta.pdf(x, alpha_prior, beta_prior)
posterior_pdf = stats.beta.pdf(x, alpha_post, beta_post)

ax.plot(x, prior_pdf, 'b-', linewidth=2, label='先验分布')
ax.plot(x, posterior_pdf, 'r-', linewidth=2, label='后验分布')
ax.axvline(p_mle, color='green', linestyle='--', label=f'MLE={p_mle:.2f}')
ax.axvline(p_bayesian, color='purple', linestyle='--', label=f'贝叶斯={p_bayesian:.2f}')

ax.legend()
ax.set_xlabel('p')
ax.set_ylabel('密度')
ax.set_title('贝叶斯估计先验与后验')
plt.show()
```

## 六、总结

本文系统地介绍了机器学习所需的数学基础：

1. **概率论**：概率分布、贝叶斯定理、大数定律、中心极限定理
2. **线性代数**：向量矩阵运算、特征值分解、奇异值分解
3. **信息论**：熵、交叉熵、KL散度、信息增益
4. **优化理论**：凸优化、梯度下降、牛顿法、正则化
5. **统计推断**：最大似然估计、贝叶斯估计

这些数学知识是理解机器学习算法原理的关键：

- 概率论支撑贝叶斯分类器、概率图模型
- 纯性代数是神经网络、PCA、SVD的基础
- 信息论用于决策树、特征选择
- 优化理论驱动模型训练
- 统计推断提供参数估计方法

建议读者：

- 深入理解核心概念而非机械记忆公式
- 结合代码实现理解数学原理
- 在实际项目中体会数学的应用价值

掌握扎实的数学基础，将帮助你深入理解机器学习算法本质，成为更优秀的机器学习工程师。