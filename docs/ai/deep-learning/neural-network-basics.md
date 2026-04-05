---
title: 神经网络基础入门：从感知机到多层网络
date: 2025-01-20T00:00:00.000Z
categories:
  - ai
  - deep-learning
tags:
  - 神经网络
  - 深度学习
  - 感知机
  - 反向传播
  - PyTorch
description: 从零开始理解神经网络的核心原理，涵盖感知机、多层网络、激活函数和反向传播算法
author: HK意境
---

# 神经网络基础入门：从感知机到多层网络

神经网络是深度学习的核心基础。本文将从最简单的感知机开始，逐步深入到多层神经网络，帮助读者建立对神经网络的完整认知。

## 一、神经网络发展历史

### 1.1 从生物神经元到人工神经元

神经网络的概念源于对生物神经系统的模拟。生物神经元是大脑的基本处理单元，通过突触与其他神经元连接，传递电化学信号。

一个典型的生物神经元包含：
- ** dendrites (树突)**：接收信号的输入端
- ** soma (细胞体)**：整合输入信号
- ** axon (轴突)**：传递输出信号的输出端
- ** synapses (突触)**：神经元之间的连接点

人工神经元模拟了这一结构，将输入信号加权求和，然后通过激活函数产生输出。

### 1.2 神经网络发展里程碑

神经网络的发展经历了几个重要阶段：

1. **1943年**：McCulloch和Pitts提出M-P神经元模型
2. **1958年**：Rosenblatt发明感知机（Perceptron）
3. **1969年**：Minsky和Papert指出感知机的局限性（无法解决异或问题）
4. **1986年**：Rumelhart等人提出反向传播算法
5. **2006年**：Hinton提出深度学习概念
6. **2012年**：AlexNet在ImageNet大赛中取得突破性成绩

## 二、感知机模型

### 2.1 感知机原理

感知机是最简单的神经网络模型，由单个神经元组成。其数学表达式为：

$$y = f(\sum_{i=1}^{n}w_i x_i + b) = f(w^T x + b)$$

其中：
- $x_i$ 是输入特征
- $w_i$ 是对应的权重
- $b$ 是偏置项
- $f$ 是激活函数（感知机使用阶跃函数）

```python
import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import make_classification, make_circles
from sklearn.model_selection import train_test_split

class Perceptron:
    """感知机实现"""
    
    def __init__(self, learning_rate=0.1, max_iter=1000):
        self.lr = learning_rate
        self.max_iter = max_iter
        self.weights = None
        self.bias = None
    
    def fit(self, X, y):
        n_samples, n_features = X.shape
        self.weights = np.zeros(n_features)
        self.bias = 0
        
        for _ in range(self.max_iter):
            for i in range(n_samples):
                # 计算预测值
                activation = np.dot(X[i], self.weights) + self.bias
                prediction = 1 if activation >= 0 else 0
                
                # 更新权重（只在预测错误时）
                if prediction != y[i]:
                    self.weights += self.lr * (y[i] - prediction) * X[i]
                    self.bias += self.lr * (y[i] - prediction)
    
    def predict(self, X):
        activation = np.dot(X, self.weights) + self.bias
        return np.where(activation >= 0, 1, 0)

# 创建线性可分数据
X_linear, y_linear = make_classification(
    n_samples=200, n_features=2, n_redundant=0,
    n_informative=2, n_clusters_per_class=1, random_state=42
)

# 训练感知机
perceptron = Perceptron(learning_rate=0.01, max_iter=100)
perceptron.fit(X_linear, y_linear)

# 可视化
def plot_decision_boundary(X, y, model, title):
    plt.figure(figsize=(10, 8))
    
    # 绘制决策边界
    x_min, x_max = X[:, 0].min() - 1, X[:, 0].max() + 1
    y_min, y_max = X[:, 1].min() - 1, X[:, 1].max() + 1
    xx, yy = np.meshgrid(np.linspace(x_min, x_max, 100),
                         np.linspace(y_min, y_max, 100))
    
    Z = model.predict(np.c_[xx.ravel(), yy.ravel()])
    Z = Z.reshape(xx.shape)
    
    plt.contourf(xx, yy, Z, alpha=0.3, cmap='coolwarm')
    plt.scatter(X[:, 0], X[:, 1], c=y, cmap='coolwarm', edgecolors='black')
    plt.xlabel('特征1')
    plt.ylabel('特征2')
    plt.title(title)
    
    # 绘制权重向量
    if hasattr(model, 'weights') and model.weights is not None:
        w = model.weights
        b = model.bias
        slope = -w[0] / w[1]
        intercept = -b / w[1]
        plt.plot([x_min, x_max], [slope*x_min+intercept, slope*x_max+intercept],
                 'k-', linewidth=2, label='决策边界')
        plt.legend()
    
    plt.show()

plot_decision_boundary(X_linear, y_linear, perceptron, '感知机分类结果')
print(f"感知机权重: {perceptron.weights}")
print(f"感知机偏置: {perceptron.bias}")
```

### 2.2 感知机的局限性

感知机只能解决线性可分问题，无法处理异或（XOR）等非线性问题：

```python
# 演示感知机无法解决异或问题
X_xor = np.array([[0, 0], [0, 1], [1, 0], [1, 1]])
y_xor = np.array([0, 1, 1, 0])  # 异或：相同为0，不同为1

perceptron_xor = Perceptron()
perceptron_xor.fit(X_xor, y_xor)

predictions = perceptron_xor.predict(X_xor)
print("\n异或问题测试:")
print("输入 | 目标 | 预测")
for i in range(len(X_xor)):
    print(f"{X_xor[i]} | {y_xor[i]}    | {predictions[i]}")

# 可视化异或问题的非线性特性
plt.figure(figsize=(8, 6))
colors = ['red' if y == 0 else 'blue' for y in y_xor]
plt.scatter(X_xor[:, 0], X_xor[:, 1], c=colors, s=200, edgecolors='black')
plt.xlabel('x1')
plt.ylabel('x2')
plt.title('异或问题：无法用直线分开两类')
plt.grid(True)
plt.show()

print("\n结论：感知机无法解决异或问题，因为异或是非线性可分的")
```

## 三、多层神经网络

### 3.1 多层感知机（MLP）

为了解决感知机的局限性，我们引入多层神经网络。多层感知机（Multi-Layer Perceptron, MLP）通过添加隐藏层来学习非线性映射。

MLP的结构：
- **输入层**：接收原始特征
- **隐藏层**：进行非线性变换
- **输出层**：产生最终预测

对于具有一个隐藏层的MLP，输出计算为：

$$h = f(W_1 x + b_1)$$
$$y = g(W_2 h + b_2)$$

其中 $f$ 和 $g$ 是激活函数。

```python
import torch
import torch.nn as nn
import torch.optim as optim

# 定义多层感知机
class MLP(nn.Module):
    def __init__(self, input_size, hidden_size, output_size):
        super(MLP, self).__init__()
        self.hidden = nn.Linear(input_size, hidden_size)
        self.output = nn.Linear(hidden_size, output_size)
        self.activation = nn.Sigmoid()
    
    def forward(self, x):
        h = self.activation(self.hidden(x))
        y = self.output(h)
        return y

# 使用PyTorch解决异或问题
X_xor_tensor = torch.FloatTensor(X_xor)
y_xor_tensor = torch.FloatTensor(y_xor).unsqueeze(1)

# 创建MLP模型
mlp = MLP(input_size=2, hidden_size=4, output_size=1)

# 定义损失函数和优化器
criterion = nn.BCEWithLogitsLoss()
optimizer = optim.SGD(mlp.parameters(), lr=0.1)

# 训练
print("\n训练MLP解决异或问题:")
losses = []
for epoch in range(5000):
    optimizer.zero_grad()
    outputs = mlp(X_xor_tensor)
    loss = criterion(outputs, y_xor_tensor)
    loss.backward()
    optimizer.step()
    losses.append(loss.item())
    
    if (epoch + 1) % 1000 == 0:
        print(f"Epoch {epoch+1}, Loss: {loss.item():.4f}")

# 测试
predictions = (mlp(X_xor_tensor).detach().numpy() > 0).astype(int).flatten()
print("\n最终结果:")
print("输入 | 目标 | 预测")
for i in range(len(X_xor)):
    print(f"{X_xor[i]} | {y_xor[i]}    | {predictions[i]}")

# 绘制损失曲线
plt.figure(figsize=(10, 6))
plt.plot(losses)
plt.xlabel('迭代次数')
plt.ylabel('损失值')
plt.title('MLP训练损失曲线')
plt.grid(True)
plt.show()
```

### 3.2 深度神经网络的优势

增加隐藏层的数量可以增强网络的表达能力：

```python
# 不同隐藏层大小的比较
hidden_sizes = [2, 4, 8, 16]
results = {}

for hidden_size in hidden_sizes:
    mlp = MLP(input_size=2, hidden_size=hidden_size, output_size=1)
    criterion = nn.BCEWithLogitsLoss()
    optimizer = optim.Adam(mlp.parameters(), lr=0.01)
    
    losses = []
    for epoch in range(2000):
        optimizer.zero_grad()
        outputs = mlp(X_xor_tensor)
        loss = criterion(outputs, y_xor_tensor)
        loss.backward()
        optimizer.step()
        losses.append(loss.item())
    
    results[hidden_size] = {
        'losses': losses,
        'final_loss': losses[-1]
    }

# 比较不同隐藏层大小
plt.figure(figsize=(12, 6))
for hidden_size, data in results.items():
    plt.plot(data['losses'], label=f'隐藏层大小={hidden_size}')

plt.xlabel('迭代次数')
plt.ylabel('损失值')
plt.title('不同隐藏层大小的训练效果')
plt.legend()
plt.grid(True)
plt.show()

print("\n隐藏层大小对性能的影响:")
for hidden_size, data in results.items():
    print(f"隐藏层大小={hidden_size}: 最终损失={data['final_loss']:.4f}")
```

## 四、激活函数

### 4.1 常见激活函数

激活函数赋予神经网络非线性能力。以下是几种常用的激活函数：

**Sigmoid函数**：
$$\sigma(x) = \frac{1}{1 + e^{-x}}$$

特点：输出范围(0,1)，适合概率输出；但存在梯度消失问题。

**ReLU函数**：
$$ReLU(x) = max(0, x)$$

特点：计算简单，缓解梯度消失；但存在"死亡ReLU"问题。

**Tanh函数**：
$$tanh(x) = \frac{e^x - e^{-x}}{e^x + e^{-x}}$$

特点：输出范围(-1,1)，零中心化。

```python
# 可视化各种激活函数
def sigmoid(x):
    return 1 / (1 + np.exp(-x))

def relu(x):
    return np.maximum(0, x)

def tanh(x):
    return np.tanh(x)

def leaky_relu(x, alpha=0.01):
    return np.where(x > 0, x, alpha * x)

def elu(x, alpha=1.0):
    return np.where(x > 0, x, alpha * (np.exp(x) - 1))

def softmax(x):
    exp_x = np.exp(x - np.max(x))
    return exp_x / exp_x.sum()

# 绘制激活函数
x = np.linspace(-5, 5, 100)

activations = {
    'Sigmoid': sigmoid(x),
    'ReLU': relu(x),
    'Tanh': tanh(x),
    'Leaky ReLU': leaky_relu(x),
    'ELU': elu(x)
}

fig, axes = plt.subplots(2, 3, figsize=(15, 10))
axes = axes.flatten()

for i, (name, y) in enumerate(activations.items()):
    axes[i].plot(x, y, linewidth=2)
    axes[i].set_title(name)
    axes[i].set_xlabel('x')
    axes[i].set_ylabel('f(x)')
    axes[i].grid(True, alpha=0.3)
    axes[i].axhline(0, color='black', linewidth=0.5)
    axes[i].axvline(0, color='black', linewidth=0.5)

# Softmax单独绘制（需要多维输入）
x_softmax = np.linspace(-2, 2, 50)
softmax_2d = np.array([softmax([xi, 0]) for xi in x_softmax])
axes[5].plot(x_softmax, softmax_2d[:, 0], label='类别1', linewidth=2)
axes[5].plot(x_softmax, softmax_2d[:, 1], label='类别2', linewidth=2)
axes[5].set_title('Softmax (二分类)')
axes[5].set_xlabel('x1')
axes[5].legend()
axes[5].grid(True, alpha=0.3)

plt.tight_layout()
plt.show()

# 绘制激活函数的导数
def sigmoid_derivative(x):
    s = sigmoid(x)
    return s * (1 - s)

def relu_derivative(x):
    return np.where(x > 0, 1, 0)

def tanh_derivative(x):
    return 1 - tanh(x)**2

fig, axes = plt.subplots(1, 3, figsize=(15, 5))

axes[0].plot(x, sigmoid(x), 'b-', label='Sigmoid')
axes[0].plot(x, sigmoid_derivative(x), 'r--', label='导数')
axes[0].set_title('Sigmoid及其导数')
axes[0].legend()
axes[0].grid(True)

axes[1].plot(x, relu(x), 'b-', label='ReLU')
axes[1].plot(x, relu_derivative(x), 'r--', label='导数')
axes[1].set_title('ReLU及其导数')
axes[1].legend()
axes[1].grid(True)

axes[2].plot(x, tanh(x), 'b-', label='Tanh')
axes[2].plot(x, tanh_derivative(x), 'r--', label='导数')
axes[2].set_title('Tanh及其导数')
axes[2].legend()
axes[2].grid(True)

plt.tight_layout()
plt.show()

print("\n激活函数特点总结:")
print("Sigmoid: 输出(0,1)，导数最大0.25，容易梯度消失")
print("ReLU: 输出[0,∞)，导数为0或1，计算简单，但负区域梯度为0")
print("Tanh: 输出(-1,1)，零中心化，导数最大为1")
print("Leaky ReLU: 解决ReLU负区域梯度消失问题")
print("ELU: 输出(-α,∞)，负区域有梯度")
```

### 4.2 激活函数的选择

```python
# 不同激活函数对训练的影响
class MLPWithActivation(nn.Module):
    def __init__(self, input_size, hidden_size, output_size, activation):
        super(MLPWithActivation, self).__init__()
        self.hidden = nn.Linear(input_size, hidden_size)
        self.output = nn.Linear(hidden_size, output_size)
        self.activation = activation
    
    def forward(self, x):
        h = self.activation(self.hidden(x))
        y = self.output(h)
        return y

activations_dict = {
    'Sigmoid': nn.Sigmoid(),
    'ReLU': nn.ReLU(),
    'Tanh': nn.Tanh(),
    'LeakyReLU': nn.LeakyReLU()
}

# 创建更复杂的数据集
X_complex, y_complex = make_circles(n_samples=500, noise=0.1, factor=0.5, random_state=42)
X_train_c, X_test_c, y_train_c, y_test_c = train_test_split(X_complex, y_complex, test_size=0.2)

X_train_tensor = torch.FloatTensor(X_train_c)
y_train_tensor = torch.FloatTensor(y_train_c).unsqueeze(1)
X_test_tensor = torch.FloatTensor(X_test_c)
y_test_tensor = torch.FloatTensor(y_test_c).unsqueeze(1)

results_activation = {}

for name, activation in activations_dict.items():
    model = MLPWithActivation(2, 16, 1, activation)
    criterion = nn.BCEWithLogitsLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.01)
    
    losses = []
    for epoch in range(500):
        optimizer.zero_grad()
        outputs = model(X_train_tensor)
        loss = criterion(outputs, y_train_tensor)
        loss.backward()
        optimizer.step()
        losses.append(loss.item())
    
    # 测试准确率
    with torch.no_grad():
        test_outputs = model(X_test_tensor)
        predictions = (test_outputs > 0).float()
        accuracy = (predictions == y_test_tensor).float().mean().item()
    
    results_activation[name] = {
        'losses': losses,
        'accuracy': accuracy
    }

# 可视化比较
plt.figure(figsize=(12, 6))
for name, data in results_activation.items():
    plt.plot(data['losses'], label=f"{name} (acc={data['accuracy']:.2f})")

plt.xlabel('迭代次数')
plt.ylabel('损失值')
plt.title('不同激活函数的训练效果')
plt.legend()
plt.grid(True)
plt.show()

print("\n激活函数性能比较:")
for name, data in results_activation.items():
    print(f"{name}: 准确率={data['accuracy']:.4f}")
```

## 五、反向传播算法

### 5.1 反向传播原理

反向传播（Backpropagation）是神经网络训练的核心算法，利用链式法则计算梯度。

对于一个多层网络，损失函数对权重 $w$ 的梯度为：

$$\frac{\partial L}{\partial w} = \frac{\partial L}{\partial y} \cdot \frac{\partial y}{\partial h} \cdot \frac{\partial h}{\partial w}$$

```python
# 手动实现反向传播（仅演示原理）
def forward_pass(x, w1, b1, w2, b2):
    """前向传播"""
    h = sigmoid(np.dot(x, w1) + b1)
    y = sigmoid(np.dot(h, w2) + b2)
    return h, y

def backward_pass(x, y_true, h, y_pred, w1, w2):
    """反向传播"""
    # 计算输出层误差
    error_output = y_pred - y_true
    delta_output = error_output * y_pred * (1 - y_pred)
    
    # 计算隐藏层误差
    error_hidden = np.dot(delta_output, w2.T)
    delta_hidden = error_hidden * h * (1 - h)
    
    # 计算梯度
    grad_w2 = np.dot(h.T, delta_output)
    grad_b2 = np.sum(delta_output, axis=0)
    grad_w1 = np.dot(x.T, delta_hidden)
    grad_b1 = np.sum(delta_hidden, axis=0)
    
    return grad_w1, grad_b1, grad_w2, grad_b2

# 演示反向传播
np.random.seed(42)
x_demo = np.array([[0.5, 0.3]])
y_true_demo = np.array([[1]])

w1 = np.random.randn(2, 4)
b1 = np.zeros((1, 4))
w2 = np.random.randn(4, 1)
b2 = np.zeros((1, 1))

print("反向传播演示:")
print("输入:", x_demo)
print("目标:", y_true_demo)

# 前向传播
h, y_pred = forward_pass(x_demo, w1, b1, w2, b2)
print("隐藏层输出:", h)
print("预测输出:", y_pred)

# 反向传播
grad_w1, grad_b1, grad_w2, grad_b2 = backward_pass(
    x_demo, y_true_demo, h, y_pred, w1, w2
)

print("\n梯度计算结果:")
print("w1梯度:", grad_w1)
print("w2梯度:", grad_w2)

# 手动更新权重
learning_rate = 0.1
w1_new = w1 - learning_rate * grad_w1
w2_new = w2 - learning_rate * grad_w2

print("\n更新后的权重:")
h_new, y_pred_new = forward_pass(x_demo, w1_new, b1, w2_new, b2)
print("新预测:", y_pred_new)
print("误差减小:", abs(y_pred - y_true_demo).sum() - abs(y_pred_new - y_true_demo).sum())
```

### 5.2 梯度消失与梯度爆炸

```python
# 演示梯度消失问题
def simulate_gradient_flow(depth, activation='sigmoid'):
    """模拟深层网络的梯度传播"""
    x = 1.0
    gradient = 1.0  # 初始梯度
    
    gradients = [gradient]
    
    for i in range(depth):
        if activation == 'sigmoid':
            # sigmoid的导数最大为0.25
            act_val = sigmoid(x)
            derivative = act_val * (1 - act_val)
        elif activation == 'relu':
            derivative = 1.0 if x > 0 else 0.0
        
        gradient *= derivative
        gradients.append(gradient)
    
    return gradients

depths = [10, 20, 50]

fig, axes = plt.subplots(1, 2, figsize=(12, 5))

# Sigmoid的梯度消失
for depth in depths:
    gradients = simulate_gradient_flow(depth, 'sigmoid')
    axes[0].plot(range(depth+1), gradients, label=f'深度={depth}')

axes[0].set_xlabel('层数')
axes[0].set_ylabel('梯度值')
axes[0].set_title('Sigmoid激活函数的梯度消失')
axes[0].legend()
axes[0].grid(True)

# ReLU的梯度传播
for depth in depths:
    gradients = simulate_gradient_flow(depth, 'relu')
    axes[1].plot(range(depth+1), gradients, label=f'深度={depth}')

axes[1].set_xlabel('层数')
axes[1].set_ylabel('梯度值')
axes[1].set_title('ReLU激活函数的梯度传播')
axes[1].legend()
axes[1].grid(True)

plt.tight_layout()
plt.show()

print("\n梯度消失/爆炸问题:")
print("使用Sigmoid时，每层梯度乘以最多0.25，深层网络梯度会迅速衰减")
print("使用ReLU时，正区域梯度保持为1，缓解了梯度消失问题")
```

## 六、完整神经网络实现

```python
# 完整的神经网络训练流程
from sklearn.datasets import load_digits
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report

# 加载手写数字数据集
digits = load_digits()
X_digits = digits.data
y_digits = digits.target

# 标准化
scaler = StandardScaler()
X_digits_scaled = scaler.fit_transform(X_digits)

# 转换为PyTorch张量
X_digits_tensor = torch.FloatTensor(X_digits_scaled)
y_digits_tensor = torch.LongTensor(y_digits)

# 划分数据集
train_size = int(0.8 * len(X_digits))
X_train_d = X_digits_tensor[:train_size]
y_train_d = y_digits_tensor[:train_size]
X_test_d = X_digits_tensor[train_size:]
y_test_d = y_digits_tensor[train_size:]

# 定义完整的神经网络
class DigitClassifier(nn.Module):
    def __init__(self):
        super(DigitClassifier, self).__init__()
        self.layer1 = nn.Linear(64, 128)
        self.layer2 = nn.Linear(128, 64)
        self.layer3 = nn.Linear(64, 10)
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(0.2)
    
    def forward(self, x):
        x = self.relu(self.layer1(x))
        x = self.dropout(x)
        x = self.relu(self.layer2(x))
        x = self.dropout(x)
        x = self.layer3(x)
        return x

# 创建模型
model = DigitClassifier()
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

# 训练
print("\n训练手写数字分类器:")
train_losses = []
train_accuracies = []

for epoch in range(100):
    # 前向传播
    outputs = model(X_train_d)
    loss = criterion(outputs, y_train_d)
    
    # 反向传播
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()
    
    # 记录
    train_losses.append(loss.item())
    
    # 计算准确率
    _, predictions = torch.max(outputs, 1)
    accuracy = (predictions == y_train_d).float().mean().item()
    train_accuracies.append(accuracy)
    
    if (epoch + 1) % 20 == 0:
        print(f"Epoch {epoch+1}: Loss={loss.item():.4f}, Accuracy={accuracy:.4f}")

# 测试
with torch.no_grad():
    test_outputs = model(X_test_d)
    _, test_predictions = torch.max(test_outputs, 1)
    test_accuracy = (test_predictions == y_test_d).float().mean().item()

print(f"\n测试集准确率: {test_accuracy:.4f}")

# 可视化训练过程
fig, axes = plt.subplots(1, 2, figsize=(12, 5))

axes[0].plot(train_losses)
axes[0].set_xlabel('迭代次数')
axes[0].set_ylabel('损失值')
axes[0].set_title('训练损失曲线')
axes[0].grid(True)

axes[1].plot(train_accuracies)
axes[1].set_xlabel('迭代次数')
axes[1].set_ylabel('准确率')
axes[1].set_title('训练准确率曲线')
axes[1].grid(True)

plt.tight_layout()
plt.show()
```

## 七、总结

本文从基础到深入，系统地介绍了神经网络的核心概念：

1. **感知机**：最简单的神经网络，只能处理线性可分问题
2. **多层网络**：通过隐藏层学习非线性映射
3. **激活函数**：赋予网络非线性能力，选择合适的激活函数至关重要
4. **反向传播**：神经网络训练的核心算法
5. **梯度问题**：理解梯度消失和梯度爆炸的原因和解决方案

关键要点：

- 深度神经网络比浅层网络有更强的表达能力
- ReLU及其变体是目前最常用的激活函数
- 反向传播基于链式法则计算梯度
- 深层网络需要解决梯度消失问题

神经网络是深度学习的基础，理解这些核心概念是深入学习CNN、RNN、Transformer等复杂架构的前提。
