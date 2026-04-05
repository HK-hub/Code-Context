---
title: PyTorch框架教程：从入门到实战
date: 2025-02-12T00:00:00.000Z
categories:
  - ai
  - deep-learning
tags:
  - PyTorch
  - 深度学习
  - 框架教程
  - 张量操作
  - 模型构建
description: 全面讲解PyTorch框架的核心功能，包括张量操作、自动求导、模型构建与训练流程
author: HK意境
---

# PyTorch框架教程：从入门到实战

PyTorch是目前最流行的深度学习框架之一，以其动态计算图和Python风格的设计而著称。本文将全面介绍PyTorch的核心功能，帮助读者掌握这一强大的工具。

## 一、PyTorch概述

### 1.1 PyTorch简介

PyTorch由Facebook AI Research团队开发，于2017年发布。它的主要特点包括：

- **动态计算图**：使用define-by-run方式，可以在运行时修改网络结构
- **Python原生**：与NumPy和Python生态系统无缝集成
- **GPU加速**：支持CUDA进行高效GPU计算
- **自动求导**：torch.autograd模块提供强大的自动微分功能
- **丰富的生态系统**：支持模型部署、分布式训练等

### 1.2 安装与配置

```python
# 安装PyTorch（根据环境选择）
# pip install torch torchvision torchaudio
# 或使用conda: conda install pytorch torchvision torchaudio

import torch
import torch.nn as nn
import torch.optim as optim
import torchvision
import torchvision.transforms as transforms
from torch.utils.data import Dataset, DataLoader
import numpy as np
import matplotlib.pyplot as plt

# 检查PyTorch版本和CUDA支持
print(f"PyTorch版本: {torch.__version__}")
print(f"CUDA可用: {torch.cuda.is_available()}")
if torch.cuda.is_available():
    print(f"CUDA版本: {torch.version.cuda}")
    print(f"GPU数量: {torch.cuda.device_count()}")
    print(f"当前GPU: {torch.cuda.current_device()}")
    print(f"GPU名称: {torch.cuda.get_device_name(0)}")
```

## 二、张量操作

### 2.1 张量创建

张量（Tensor）是PyTorch的核心数据结构，类似于NumPy的数组，但支持GPU加速和自动求导。

```python
# 从列表创建张量
t_from_list = torch.tensor([[1, 2, 3], [4, 5, 6]])
print("从列表创建:")
print(t_from_list)
print(f"形状: {t_from_list.shape}")
print(f"数据类型: {t_from_list.dtype}")

# 从NumPy数组创建
np_array = np.array([[1, 2], [3, 4]])
t_from_numpy = torch.from_numpy(np_array)
print("\n从NumPy创建:")
print(t_from_numpy)

# 创建特殊张量
zeros = torch.zeros(3, 4)
ones = torch.ones(2, 3)
rand = torch.rand(2, 3)  # 均匀分布随机数
randn = torch.randn(2, 3)  # 正态分布随机数

print("\n特殊张量:")
print(f"零张量:\n{zeros}")
print(f"一张量:\n{ones}")
print(f"随机张量(均匀):\n{rand}")
print(f"随机张量(正态):\n{randn}")

# 创建序列张量
arange = torch.arange(0, 10, 2)
linspace = torch.linspace(0, 10, 5)

print("\n序列张量:")
print(f"arange: {arange}")
print(f"linspace: {linspace}")

# 指定数据类型
t_int = torch.tensor([1, 2, 3], dtype=torch.int32)
t_float = torch.tensor([1, 2, 3], dtype=torch.float32)
t_double = torch.tensor([1, 2, 3], dtype=torch.float64)

print("\n指定数据类型:")
print(f"int32: {t_int.dtype}")
print(f"float32: {t_float.dtype}")
print(f"float64: {t_double.dtype}")

# 在GPU上创建张量
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
t_gpu = torch.randn(3, 3, device=device)
print(f"\n张量设备: {t_gpu.device}")

# 张量设备转换
t_cpu = torch.randn(3, 3)
t_to_gpu = t_cpu.to(device)
print(f"CPU张量转到GPU: {t_to_gpu.device}")
```

### 2.2 张量操作

```python
# 张量形状操作
t = torch.randn(4, 5)
print("原始张量形状:", t.shape)

# reshape和view
reshaped = t.reshape(2, 10)
viewed = t.view(2, 10)
print(f"reshape后: {reshaped.shape}")
print(f"view后: {viewed.shape}")

# 注意：view要求张量连续，reshape不要求
t_non_contiguous = t.transpose(0, 1)
print(f"转置后是否连续: {t_non_contiguous.is_contiguous()}")

# squeeze和unsqueeze
t_3d = torch.randn(1, 3, 1, 4)
squeezed = t_3d.squeeze()  # 移除所有大小为1的维度
squeezed_dim0 = t_3d.squeeze(0)  # 只移除第0维
print(f"原始: {t_3d.shape}")
print(f"squeeze(): {squeezed.shape}")
print(f"squeeze(0): {squeezed_dim0.shape}")

t_2d = torch.randn(3, 4)
unsqueezed = t_2d.unsqueeze(0)  # 在第0维增加维度
unsqueezed_dim2 = t_2d.unsqueeze(2)
print(f"\n原始: {t_2d.shape}")
print(f"unsqueeze(0): {unsqueezed.shape}")
print(f"unsqueeze(2): {unsqueezed_dim2.shape}")

# 张量拼接
t1 = torch.randn(2, 3)
t2 = torch.randn(2, 3)

cat_dim0 = torch.cat([t1, t2], dim=0)
cat_dim1 = torch.cat([t1, t2], dim=1)
print(f"\ncat(dim=0): {cat_dim0.shape}")
print(f"cat(dim=1): {cat_dim1.shape}")

stack = torch.stack([t1, t2], dim=0)
print(f"stack(dim=0): {stack.shape}")

# 张量索引和切片
t = torch.arange(12).reshape(3, 4)
print("\n索引和切片:")
print(f"张量:\n{t}")
print(f"第0行: {t[0]}")
print(f"第0列: {t[:, 0]}")
print(f"子矩阵: {t[1:3, 1:3]}")
print(f"条件索引: {t[t > 5]}")

# 高级索引
print(f"指定行: {t[[0, 2]]}")
indices = torch.tensor([0, 2, 1])
print(f"按索引选列: {t[:, indices]}")
```

### 2.3 张量数学运算

```python
# 基本数学运算
a = torch.tensor([1, 2, 3])
b = torch.tensor([4, 5, 6])

print("基本运算:")
print(f"a + b = {a + b}")
print(f"a - b = {a - b}")
print(f"a * b = {a * b}")
print(f"a / b = {a / b}")
print(f"a ** 2 = {a ** 2}")

# 矩阵运算
m1 = torch.randn(2, 3)
m2 = torch.randn(3, 4)

matmul = torch.matmul(m1, m2)
mm = torch.mm(m1, m2)  # 专门用于2D矩阵

print("\n矩阵运算:")
print(f"m1形状: {m1.shape}")
print(f"m2形状: {m2.shape}")
print(f"matmul结果形状: {matmul.shape}")

# 批量矩阵乘法
batch_m1 = torch.randn(5, 2, 3)
batch_m2 = torch.randn(5, 3, 4)
batch_matmul = torch.bmm(batch_m1, batch_m2)
print(f"批量矩阵乘法: {batch_matmul.shape}")

# 张量统计
t = torch.randn(3, 4)
print("\n统计运算:")
print(f"张量:\n{t}")
print(f"总和: {t.sum()}")
print(f"均值: {t.mean()}")
print(f"最大值: {t.max()}")
print(f"最小值: {t.min()}")
print(f"方差: {t.var()}")
print(f"标准差: {t.std()}")

# 按维度统计
print(f"\n按行求和: {t.sum(dim=1)}")
print(f"按列求均值: {t.mean(dim=0)}")
print(f"每行最大值: {t.max(dim=1)}")
print(f"每列最小值索引: {t.argmin(dim=0)}")

# 张量比较
print("\n比较运算:")
print(f"a > 2: {a > 2}")
print(f"a == b: {a == b}")
print(f"逻辑运算: {(a > 1) & (a < 3)}")

# 其他运算
print("\n其他运算:")
print(f"指数: {torch.exp(a.float())}")
print(f"对数: {torch.log(a.float())}")
print(f"平方根: {torch.sqrt(a.float())}")
print(f"绝对值: {torch.abs(torch.tensor([-1, -2, -3]))}")
```

## 三、自动求导机制

### 3.1 autograd基础

PyTorch的autograd模块实现了自动求导功能，通过动态计算图自动计算梯度。

```python
# 创建需要求导的张量
x = torch.tensor(2.0, requires_grad=True)
y = torch.tensor(3.0, requires_grad=True)

# 构建计算图
z = x * y + x ** 2

print("自动求导示例:")
print(f"x = {x}")
print(f"y = {y}")
print(f"z = x*y + x^2 = {z}")

# 计算梯度
z.backward()

print(f"\n梯度:")
print(f"dz/dx = y + 2x = {x.grad}")  # 应该是 y + 2*x = 3 + 4 = 7
print(f"dz/dy = x = {y.grad}")  # 应该是 x = 2

# 更复杂的示例
a = torch.tensor([1.0, 2.0, 3.0], requires_grad=True)
b = torch.tensor([4.0, 5.0, 6.0], requires_grad=True)

c = a * b
d = c.sum()

d.backward()

print("\n向量梯度:")
print(f"dd/da = {a.grad}")  # 应该等于b
print(f"dd/db = {b.grad}")  # 应该等于a

# 禁用梯度计算
x_no_grad = torch.tensor(2.0, requires_grad=True)

with torch.no_grad():
    y_no_grad = x_no_grad * 3
    print(f"\n在no_grad中: y.requires_grad = {y_no_grad.requires_grad}")

# 梯度清零（重要！）
x_grad = torch.tensor(2.0, requires_grad=True)

for i in range(3):
    y = x_grad ** 2 + 1
    y.backward()
    print(f"第{i+1}次 backward后 x.grad = {x_grad.grad}")
    
    # 如果不清零，梯度会累加
    x_grad.grad.zero_()  # 清零梯度

print("\n梯度清零的重要性: 不清零会导致梯度累加")
```

### 3.2 计算图可视化

```python
# 多层网络的前向和反向传播
# 创建一个简单的神经网络计算图

x = torch.randn(1, 3, requires_grad=True)
w1 = torch.randn(3, 4, requires_grad=True)
b1 = torch.randn(1, 4, requires_grad=True)
w2 = torch.randn(4, 2, requires_grad=True)
b2 = torch.randn(1, 2, requires_grad=True)

# 前向传播
h = torch.relu(x @ w1 + b1)  # 隐藏层
y = torch.sigmoid(h @ w2 + b2)  # 输出层

print("多层网络计算图:")
print(f"输入 x: {x.shape}")
print(f"隐藏层 h: {h.shape}")
print(f"输出 y: {y.shape}")

# 计算损失
target = torch.tensor([[0.5, 0.8]])
loss = torch.mean((y - target) ** 2)  # MSE损失

# 反向传播
loss.backward()

print(f"\n损失值: {loss.item():.4f}")
print(f"梯度:")
print(f"x.grad: {x.grad}")
print(f"w1.grad形状: {w1.grad.shape}")
print(f"w2.grad形状: {w2.grad.shape}")

# 检查计算图
print(f"\n计算图信息:")
print(f"x的梯度函数: {x.grad_fn}")
print(f"h的梯度函数: {h.grad_fn}")
print(f"y的梯度函数: {y.grad_fn}")
print(f"loss的梯度函数: {loss.grad_fn}")
```

## 四、构建神经网络

### 4.1 使用nn.Module

```python
# 定义一个完整的神经网络
class SimpleNet(nn.Module):
    def __init__(self, input_size, hidden_size, output_size):
        super(SimpleNet, self).__init__()
        # 定义网络层
        self.fc1 = nn.Linear(input_size, hidden_size)
        self.fc2 = nn.Linear(hidden_size, hidden_size // 2)
        self.fc3 = nn.Linear(hidden_size // 2, output_size)
        
        # 定义激活函数
        self.relu = nn.ReLU()
        self.sigmoid = nn.Sigmoid()
        
        # 定义Dropout
        self.dropout = nn.Dropout(0.2)
    
    def forward(self, x):
        # 定义前向传播
        x = self.relu(self.fc1(x))
        x = self.dropout(x)
        x = self.relu(self.fc2(x))
        x = self.dropout(x)
        x = self.sigmoid(self.fc3(x))
        return x

# 创建模型实例
model = SimpleNet(input_size=10, hidden_size=64, output_size=2)

print("模型结构:")
print(model)

# 查看模型参数
print("\n模型参数:")
for name, param in model.named_parameters():
    print(f"{name}: {param.shape}")

# 计算总参数量
total_params = sum(p.numel() for p in model.parameters())
trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
print(f"\n总参数量: {total_params}")
print(f"可训练参数量: {trainable_params}")

# 使用nn.Sequential简化定义
sequential_model = nn.Sequential(
    nn.Linear(10, 64),
    nn.ReLU(),
    nn.Dropout(0.2),
    nn.Linear(64, 32),
    nn.ReLU(),
    nn.Dropout(0.2),
    nn.Linear(32, 2),
    nn.Sigmoid()
)

print("\nSequential模型:")
print(sequential_model)

# 测试模型
x_test = torch.randn(5, 10)  # 批量输入
y_pred = model(x_test)
print(f"\n输入形状: {x_test.shape}")
print(f"输出形状: {y_pred.shape}")
```

### 4.2 自定义层和模块

```python
# 自定义神经网络层
class CustomLayer(nn.Module):
    def __init__(self, in_features, out_features):
        super(CustomLayer, self).__init__()
        self.weight = nn.Parameter(torch.randn(in_features, out_features))
        self.bias = nn.Parameter(torch.zeros(out_features))
    
    def forward(self, x):
        # 自定义计算逻辑
        return torch.matmul(x, self.weight) + self.bias

# 使用自定义层的模型
class CustomNet(nn.Module):
    def __init__(self):
        super(CustomNet, self).__init__()
        self.custom1 = CustomLayer(10, 32)
        self.custom2 = CustomLayer(32, 2)
    
    def forward(self, x):
        x = torch.relu(self.custom1(x))
        x = self.custom2(x)
        return x

custom_model = CustomNet()
print("自定义层模型:")
print(custom_model)

# 自定义激活函数
class Swish(nn.Module):
    def __init__(self):
        super(Swish, self).__init__()
    
    def forward(self, x):
        return x * torch.sigmoid(x)

# 使用自定义激活函数
swish = Swish()
x_demo = torch.linspace(-5, 5, 100)
y_swish = swish(x_demo)

plt.figure(figsize=(8, 5))
plt.plot(x_demo.numpy(), y_swish.numpy(), label='Swish')
plt.plot(x_demo.numpy(), torch.relu(x_demo).numpy(), label='ReLU')
plt.legend()
plt.title('自定义激活函数Swish')
plt.grid(True)
plt.show()
```

## 五、损失函数与优化器

### 5.1 常用损失函数

```python
# 创建示例数据
batch_size = 8
predictions = torch.randn(batch_size, 10)
targets_class = torch.randint(0, 10, (batch_size,))  # 分类目标
targets_reg = torch.randn(batch_size, 1)  # 回归目标
targets_binary = torch.randint(0, 2, (batch_size, 1)).float()  # 二分类目标

print("常用损失函数示例:")

# 1. 交叉熵损失（分类）
ce_loss = nn.CrossEntropyLoss()
loss_ce = ce_loss(predictions, targets_class)
print(f"交叉熵损失: {loss_ce.item():.4f}")

# 2. MSE损失（回归）
mse_loss = nn.MSELoss()
predictions_reg = torch.randn(batch_size, 1)
loss_mse = mse_loss(predictions_reg, targets_reg)
print(f"MSE损失: {loss_mse.item():.4f}")

# 3. L1损失
l1_loss = nn.L1Loss()
loss_l1 = l1_loss(predictions_reg, targets_reg)
print(f"L1损失: {loss_l1.item():.4f}")

# 4. 二分类损失
bce_loss = nn.BCELoss()
predictions_binary = torch.sigmoid(torch.randn(batch_size, 1))
loss_bce = bce_loss(predictions_binary, targets_binary)
print(f"BCE损失: {loss_bce.item():.4f}")

# 5. BCE with Logits（推荐用于二分类）
bce_logits_loss = nn.BCEWithLogitsLoss()
loss_bce_logits = bce_logits_loss(torch.randn(batch_size, 1), targets_binary)
print(f"BCEWithLogits损失: {loss_bce_logits.item():.4f}")

# 6. 平滑L1损失（Huber Loss）
smooth_l1_loss = nn.SmoothL1Loss()
loss_smooth = smooth_l1_loss(predictions_reg, targets_reg)
print(f"SmoothL1损失: {loss_smooth.item():.4f}")

# 可视化不同回归损失
x_range = np.linspace(-3, 3, 100)
mse_values = x_range ** 2
l1_values = np.abs(x_range)
huber_values = np.where(np.abs(x_range) < 1, 0.5 * x_range**2, np.abs(x_range) - 0.5)

plt.figure(figsize=(10, 6))
plt.plot(x_range, mse_values, label='MSE Loss')
plt.plot(x_range, l1_values, label='L1 Loss')
plt.plot(x_range, huber_values, label='Huber Loss')
plt.xlabel('误差值')
plt.ylabel('损失值')
plt.title('回归损失函数比较')
plt.legend()
plt.grid(True)
plt.show()
```

### 5.2 优化器选择

```python
# 创建简单模型和数据
model_demo = nn.Sequential(
    nn.Linear(10, 32),
    nn.ReLU(),
    nn.Linear(32, 2)
)

# 演示数据
x_demo = torch.randn(100, 10)
y_demo = torch.randint(0, 2, (100,))
y_demo_onehot = torch.zeros(100, 2)
y_demo_onehot.scatter_(1, y_demo.unsqueeze(1), 1)

criterion = nn.CrossEntropyLoss()

print("常用优化器:")

# 1. SGD
optimizer_sgd = optim.SGD(model_demo.parameters(), lr=0.01)
print(f"SGD: 学习率=0.01")

# 2. SGD with Momentum
optimizer_sgd_momentum = optim.SGD(model_demo.parameters(), lr=0.01, momentum=0.9)
print(f"SGD with Momentum: lr=0.01, momentum=0.9")

# 3. Adam
optimizer_adam = optim.Adam(model_demo.parameters(), lr=0.001)
print(f"Adam: lr=0.001")

# 4. RMSprop
optimizer_rmsprop = optim.RMSprop(model_demo.parameters(), lr=0.01)
print(f"RMSprop: lr=0.01")

# 5. AdamW（带权重衰减的Adam）
optimizer_adamw = optim.AdamW(model_demo.parameters(), lr=0.001, weight_decay=0.01)
print(f"AdamW: lr=0.001, weight_decay=0.01")

# 比较不同优化器的训练效果
def train_with_optimizer(optimizer_class, optimizer_name, lr=0.01, **kwargs):
    model = nn.Sequential(
        nn.Linear(10, 32),
        nn.ReLU(),
        nn.Linear(32, 2)
    )
    criterion = nn.CrossEntropyLoss()
    optimizer = optimizer_class(model.parameters(), lr=lr, **kwargs)
    
    losses = []
    for epoch in range(50):
        optimizer.zero_grad()
        outputs = model(x_demo)
        loss = criterion(outputs, y_demo)
        loss.backward()
        optimizer.step()
        losses.append(loss.item())
    
    return losses

optimizers_to_compare = [
    (optim.SGD, 'SGD', 0.01, {}),
    (optim.SGD, 'SGD+Momentum', 0.01, {'momentum': 0.9}),
    (optim.Adam, 'Adam', 0.01, {}),
    (optim.RMSprop, 'RMSprop', 0.01, {})
]

plt.figure(figsize=(12, 6))
for opt_class, name, lr, kwargs in optimizers_to_compare:
    losses = train_with_optimizer(opt_class, name, lr, **kwargs)
    plt.plot(losses, label=name)

plt.xlabel('迭代次数')
plt.ylabel('损失值')
plt.title('不同优化器训练效果比较')
plt.legend()
plt.grid(True)
plt.show()
```

## 六、数据加载与处理

### 6.1 Dataset和DataLoader

```python
# 自定义Dataset
class CustomDataset(Dataset):
    def __init__(self, data, labels, transform=None):
        self.data = data
        self.labels = labels
        self.transform = transform
    
    def __len__(self):
        return len(self.data)
    
    def __getitem__(self, idx):
        x = self.data[idx]
        y = self.labels[idx]
        
        if self.transform:
            x = self.transform(x)
        
        return x, y

# 创建示例数据集
data_samples = torch.randn(1000, 10)
label_samples = torch.randint(0, 2, (1000,))

# 创建Dataset实例
dataset = CustomDataset(data_samples, label_samples)

print(f"数据集大小: {len(dataset)}")
print(f"第一个样本: data={dataset[0][0].shape}, label={dataset[0][1]}")

# 使用DataLoader批量加载
dataloader = DataLoader(
    dataset,
    batch_size=32,
    shuffle=True,
    num_workers=0  # Windows下建议设为0
)

print(f"\nDataLoader信息:")
print(f"批次大小: {dataloader.batch_size}")
print(f"总批次数: {len(dataloader)}")

# 使用DataLoader进行训练
model_train = nn.Sequential(
    nn.Linear(10, 32),
    nn.ReLU(),
    nn.Linear(32, 2)
)
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model_train.parameters(), lr=0.001)

print("\n使用DataLoader训练:")
epoch_losses = []
for epoch in range(5):
    batch_losses = []
    for batch_idx, (data, labels) in enumerate(dataloader):
        optimizer.zero_grad()
        outputs = model_train(data)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        batch_losses.append(loss.item())
    
    epoch_loss = np.mean(batch_losses)
    epoch_losses.append(epoch_loss)
    print(f"Epoch {epoch+1}: 平均损失 = {epoch_loss:.4f}")

plt.figure(figsize=(10, 5))
plt.plot(epoch_losses)
plt.xlabel('Epoch')
plt.ylabel('平均损失')
plt.title('训练损失曲线')
plt.grid(True)
plt.show()
```

### 6.2 torchvision数据集

```python
# 使用torchvision加载图像数据集
# MNIST数据集
transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize((0.5,), (0.5,))
])

# 加载MNIST（如果网络可用）
try:
    mnist_train = torchvision.datasets.MNIST(
        root='./data', train=True, download=True, transform=transform
    )
    
    mnist_loader = DataLoader(mnist_train, batch_size=64, shuffle=True)
    
    print(f"MNIST数据集:")
    print(f"训练集大小: {len(mnist_train)}")
    print(f"图像形状: {mnist_train[0][0].shape}")
    
    # 可视化部分样本
    images, labels = next(iter(mnist_loader))
    
    fig, axes = plt.subplots(4, 8, figsize=(12, 6))
    for i in range(32):
        ax = axes[i//8, i%8]
        ax.imshow(images[i].squeeze(), cmap='gray')
        ax.set_title(f'Label: {labels[i]}')
        ax.axis('off')
    
    plt.suptitle('MNIST样本示例')
    plt.tight_layout()
    plt.show()
    
except Exception as e:
    print(f"无法下载MNIST数据集: {e}")
    print("使用模拟数据代替")

# 模拟图像数据集
class SimulatedImageDataset(Dataset):
    def __init__(self, num_samples=1000, img_size=28, num_classes=10):
        self.data = torch.randn(num_samples, 1, img_size, img_size)
        self.labels = torch.randint(0, num_classes, (num_samples,))
    
    def __len__(self):
        return len(self.data)
    
    def __getitem__(self, idx):
        return self.data[idx], self.labels[idx]

sim_dataset = SimulatedImageDataset()
sim_loader = DataLoader(sim_dataset, batch_size=64, shuffle=True)

print(f"\n模拟数据集:")
print(f"数据集大小: {len(sim_dataset)}")
images, labels = next(iter(sim_loader))
print(f"批次图像形状: {images.shape}")
```

## 七、模型保存与加载

### 7.1 模型持久化

```python
import tempfile
import os

# 创建临时目录保存模型
temp_dir = tempfile.mkdtemp()

# 创建并训练一个模型
model_to_save = nn.Sequential(
    nn.Linear(10, 64),
    nn.ReLU(),
    nn.Linear(64, 32),
    nn.ReLU(),
    nn.Linear(32, 2)
)

# 模拟训练
optimizer_save = optim.Adam(model_to_save.parameters(), lr=0.001)
criterion_save = nn.CrossEntropyLoss()

for epoch in range(10):
    optimizer_save.zero_grad()
    outputs = model_to_save(torch.randn(32, 10))
    loss = criterion_save(outputs, torch.randint(0, 2, (32,)))
    loss.backward()
    optimizer_save.step()

print("模型保存方法:")

# 方法1：保存整个模型（不推荐）
model_path_full = os.path.join(temp_dir, 'model_full.pth')
torch.save(model_to_save, model_path_full)
print(f"保存完整模型到: {model_path_full}")

# 方法2：只保存模型参数（推荐）
model_path_params = os.path.join(temp_dir, 'model_params.pth')
torch.save(model_to_save.state_dict(), model_path_params)
print(f"保存参数到: {model_path_params}")

# 方法3：保存训练状态（包括优化器）
checkpoint_path = os.path.join(temp_dir, 'checkpoint.pth')
torch.save({
    'epoch': 10,
    'model_state_dict': model_to_save.state_dict(),
    'optimizer_state_dict': optimizer_save.state_dict(),
    'loss': loss.item()
}, checkpoint_path)
print(f"保存checkpoint到: {checkpoint_path}")

# 加载模型参数
loaded_model = nn.Sequential(
    nn.Linear(10, 64),
    nn.ReLU(),
    nn.Linear(64, 32),
    nn.ReLU(),
    nn.Linear(32, 2)
)

loaded_model.load_state_dict(torch.load(model_path_params))
print("\n模型参数加载成功")

# 加载checkpoint
checkpoint = torch.load(checkpoint_path)
print(f"\nCheckpoint信息:")
print(f"Epoch: {checkpoint['epoch']}")
print(f"Loss: {checkpoint['loss']:.4f}")

# 验证加载的模型
test_input = torch.randn(1, 10)
original_output = model_to_save(test_input)
loaded_output = loaded_model(test_input)

print(f"\n验证:")
print(f"原始模型输出: {original_output}")
print(f"加载模型输出: {loaded_output}")
print(f"差异: {(original_output - loaded_output).abs().max().item():.6f}")

# 清理临时文件
import shutil
shutil.rmtree(temp_dir)
print("\n临时文件已清理")
```

## 八、完整训练流程示例

```python
# 完整的神经网络训练流程
print("=" * 50)
print("完整训练流程示例")
print("=" * 50)

# 1. 准备数据
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# 创建分类数据
X_clf, y_clf = make_classification(
    n_samples=2000, n_features=20, n_informative=15,
    n_redundant=3, n_classes=2, random_state=42
)

# 标准化
scaler = StandardScaler()
X_clf = scaler.fit_transform(X_clf)

# 划分数据集
X_train, X_test, y_train, y_test = train_test_split(
    X_clf, y_clf, test_size=0.2, random_state=42
)

# 转换为PyTorch张量
train_dataset = CustomDataset(
    torch.FloatTensor(X_train),
    torch.LongTensor(y_train)
)
test_dataset = CustomDataset(
    torch.FloatTensor(X_test),
    torch.LongTensor(y_test)
)

train_loader = DataLoader(train_dataset, batch_size=64, shuffle=True)
test_loader = DataLoader(test_dataset, batch_size=64, shuffle=False)

print(f"训练集大小: {len(train_dataset)}")
print(f"测试集大小: {len(test_dataset)}")

# 2. 定义模型
class Classifier(nn.Module):
    def __init__(self, input_size):
        super(Classifier, self).__init__()
        self.network = nn.Sequential(
            nn.Linear(input_size, 128),
            nn.BatchNorm1d(128),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(128, 64),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Linear(32, 2)
        )
    
    def forward(self, x):
        return self.network(x)

model_full = Classifier(input_size=20)
print(f"\n模型结构:\n{model_full}")

# 3. 定义损失函数和优化器
criterion_full = nn.CrossEntropyLoss()
optimizer_full = optim.Adam(model_full.parameters(), lr=0.001, weight_decay=0.0001)

# 学习率调度器
scheduler = optim.lr_scheduler.StepLR(optimizer_full, step_size=20, gamma=0.5)

# 4. 训练循环
num_epochs = 50
train_losses = []
test_losses = []
train_accuracies = []
test_accuracies = []

def calculate_accuracy(model, dataloader):
    correct = 0
    total = 0
    with torch.no_grad():
        for data, labels in dataloader:
            outputs = model(data)
            _, predicted = torch.max(outputs, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()
    return correct / total

print("\n开始训练...")
for epoch in range(num_epochs):
    # 训练阶段
    model_full.train()
    epoch_train_loss = 0
    for data, labels in train_loader:
        optimizer_full.zero_grad()
        outputs = model_full(data)
        loss = criterion_full(outputs, labels)
        loss.backward()
        optimizer_full.step()
        epoch_train_loss += loss.item()
    
    train_loss = epoch_train_loss / len(train_loader)
    train_losses.append(train_loss)
    
    # 测试阶段
    model_full.eval()
    epoch_test_loss = 0
    with torch.no_grad():
        for data, labels in test_loader:
            outputs = model_full(data)
            loss = criterion_full(outputs, labels)
            epoch_test_loss += loss.item()
    
    test_loss = epoch_test_loss / len(test_loader)
    test_losses.append(test_loss)
    
    # 计算准确率
    train_acc = calculate_accuracy(model_full, train_loader)
    test_acc = calculate_accuracy(model_full, test_loader)
    train_accuracies.append(train_acc)
    test_accuracies.append(test_acc)
    
    # 更新学习率
    scheduler.step()
    
    if (epoch + 1) % 10 == 0:
        print(f"Epoch [{epoch+1}/{num_epochs}]")
        print(f"  Train Loss: {train_loss:.4f}, Train Acc: {train_acc:.4f}")
        print(f"  Test Loss: {test_loss:.4f}, Test Acc: {test_acc:.4f}")
        print(f"  Learning Rate: {optimizer_full.param_groups[0]['lr']:.6f}")

# 5. 可视化结果
fig, axes = plt.subplots(1, 2, figsize=(12, 5))

axes[0].plot(train_losses, label='Train Loss')
axes[0].plot(test_losses, label='Test Loss')
axes[0].set_xlabel('Epoch')
axes[0].set_ylabel('Loss')
axes[0].set_title('训练和测试损失曲线')
axes[0].legend()
axes[0].grid(True)

axes[1].plot(train_accuracies, label='Train Accuracy')
axes[1].plot(test_accuracies, label='Test Accuracy')
axes[1].set_xlabel('Epoch')
axes[1].set_ylabel('Accuracy')
axes[1].set_title('训练和测试准确率曲线')
axes[1].legend()
axes[1].grid(True)

plt.tight_layout()
plt.show()

print("\n最终结果:")
print(f"测试集准确率: {test_accuracies[-1]:.4f}")
```

## 九、总结

本文全面介绍了PyTorch框架的核心功能：

1. **张量操作**：创建、变换、数学运算和索引
2. **自动求导**：理解计算图和梯度计算机制
3. **模型构建**：使用nn.Module定义神经网络
4. **损失函数**：分类、回归等任务的常用损失
5. **优化器**：SGD、Adam等优化算法的选择
6. **数据处理**：Dataset和DataLoader的使用
7. **模型持久化**：保存和加载模型的方法
8. **完整训练流程**：从数据准备到模型评估

PyTorch的关键优势在于：

- 动态计算图便于调试和调试
- Python原生设计易于集成
- 丰富的生态系统支持各类任务

掌握PyTorch是进行深度学习研究和应用的基础。建议读者：

- 多动手实践，通过代码加深理解
- 阅读官方文档获取最新信息
- 参考开源项目学习最佳实践

PyTorch的学习是深度学习之旅的重要一步，祝你在探索中不断进步。
