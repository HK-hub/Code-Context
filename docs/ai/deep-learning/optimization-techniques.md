---
title: 深度学习优化技巧：从训练到调参
date: 2025-03-25T00:00:00.000Z
categories:
  - ai
  - deep-learning
tags:
  - 深度学习
  - 优化技巧
  - 调参
  - 正则化
  - 学习率
  - PyTorch
description: 系统讲解深度学习模型训练的优化技巧，包括正则化、学习率调度、数据增强和超参数调优
author: HK意境
---

# 深度学习优化技巧：从训练到调参

训练深度学习模型是一门艺术。除了模型架构设计，训练过程中的各种优化技巧同样决定了最终效果。本文将系统地介绍深度学习模型训练的关键优化技术。

## 一、正则化技术

### 1.1 为什么需要正则化

深度学习模型通常具有大量参数，容易在训练集上过拟合——即在训练集表现很好，但在测试集表现差。正则化技术旨在提高模型的泛化能力。

过拟合的表现：
- 训练损失持续下降，验证损失开始上升
- 训练准确率高，验证准确率低
- 模型对训练数据"记住"而非"学习"

```python
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
import matplotlib.pyplot as plt
from sklearn.datasets import make_classification, make_moons
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# 创建容易过拟合的数据集
X_overfit, y_overfit = make_moons(n_samples=200, noise=0.15, random_state=42)

# 标准化
scaler = StandardScaler()
X_overfit = scaler.fit_transform(X_overfit)

# 划分数据
X_train_ov, X_test_ov, y_train_ov, y_test_ov = train_test_split(
    X_overfit, y_overfit, test_size=0.3, random_state=42
)

# 转换为PyTorch张量
X_train_tensor = torch.FloatTensor(X_train_ov)
y_train_tensor = torch.FloatTensor(y_train_ov).unsqueeze(1)
X_test_tensor = torch.FloatTensor(X_test_ov)
y_test_tensor = torch.FloatTensor(y_test_ov).unsqueeze(1)

# 定义过拟合风险高的模型（参数量大）
class OverfitModel(nn.Module):
    """容易过拟合的模型"""
    def __init__(self):
        super(OverfitModel, self).__init__()
        self.network = nn.Sequential(
            nn.Linear(2, 256),
            nn.ReLU(),
            nn.Linear(256, 256),
            nn.ReLU(),
            nn.Linear(256, 256),
            nn.ReLU(),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Linear(128, 1),
            nn.Sigmoid()
        )
    
    def forward(self, x):
        return self.network(x)

# 定义带正则化的模型
class RegularizedModel(nn.Module):
    """带Dropout的模型"""
    def __init__(self):
        super(RegularizedModel, self).__init__()
        self.network = nn.Sequential(
            nn.Linear(2, 256),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(256, 256),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(128, 1),
            nn.Sigmoid()
        )
    
    def forward(self, x):
        return self.network(x)

# 训练两个模型并比较
def train_model(model, X_train, y_train, X_test, y_test, epochs=500, weight_decay=0):
    criterion = nn.BCELoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001, weight_decay=weight_decay)
    
    train_losses = []
    test_losses = []
    train_accs = []
    test_accs = []
    
    for epoch in range(epochs):
        # 训练
        model.train()
        optimizer.zero_grad()
        outputs = model(X_train)
        train_loss = criterion(outputs, y_train)
        train_loss.backward()
        optimizer.step()
        
        # 记录训练指标
        train_losses.append(train_loss.item())
        train_pred = (outputs > 0.5).float()
        train_acc = (train_pred == y_train).float().mean().item()
        train_accs.append(train_acc)
        
        # 测试
        model.eval()
        with torch.no_grad():
            test_outputs = model(X_test)
            test_loss = criterion(test_outputs, y_test)
            test_losses.append(test_loss.item())
            test_pred = (test_outputs > 0.5).float()
            test_acc = (test_pred == y_test).float().mean().item()
            test_accs.append(test_acc)
    
    return train_losses, test_losses, train_accs, test_accs

# 训练过拟合模型
overfit_model = OverfitModel()
train_loss_ov, test_loss_ov, train_acc_ov, test_acc_ov = train_model(
    overfit_model, X_train_tensor, y_train_tensor, X_test_tensor, y_test_tensor
)

# 训练带Dropout的模型
dropout_model = RegularizedModel()
train_loss_do, test_loss_do, train_acc_do, test_acc_do = train_model(
    dropout_model, X_train_tensor, y_train_tensor, X_test_tensor, y_test_tensor
)

# 训练带权重衰减的模型
wd_model = OverfitModel()
train_loss_wd, test_loss_wd, train_acc_wd, test_acc_wd = train_model(
    wd_model, X_train_tensor, y_train_tensor, X_test_tensor, y_test_tensor, weight_decay=0.01
)

# 可视化比较
fig, axes = plt.subplots(2, 3, figsize=(15, 10))

# 损失曲线
axes[0, 0].plot(train_loss_ov, label='Train')
axes[0, 0].plot(test_loss_ov, label='Test')
axes[0, 0].set_title('过拟合模型损失')
axes[0, 0].legend()
axes[0, 0].set_xlabel('Epoch')
axes[0, 0].set_ylabel('Loss')

axes[0, 1].plot(train_loss_do, label='Train')
axes[0, 1].plot(test_loss_do, label='Test')
axes[0, 1].set_title('Dropout模型损失')
axes[0, 1].legend()
axes[0, 1].set_xlabel('Epoch')

axes[0, 2].plot(train_loss_wd, label='Train')
axes[0, 2].plot(test_loss_wd, label='Test')
axes[0, 2].set_title('权重衰减模型损失')
axes[0, 2].legend()
axes[0, 2].set_xlabel('Epoch')

# 准确率曲线
axes[1, 0].plot(train_acc_ov, label='Train')
axes[1, 0].plot(test_acc_ov, label='Test')
axes[1, 0].set_title(f'过拟合模型 Acc: Train={train_acc_ov[-1]:.2f}, Test={test_acc_ov[-1]:.2f}')
axes[1, 0].legend()

axes[1, 1].plot(train_acc_do, label='Train')
axes[1, 1].plot(test_acc_do, label='Test')
axes[1, 1].set_title(f'Dropout模型 Acc: Train={train_acc_do[-1]:.2f}, Test={test_acc_do[-1]:.2f}')
axes[1, 1].legend()

axes[1, 2].plot(train_acc_wd, label='Train')
axes[1, 2].plot(test_acc_wd, label='Test')
axes[1, 2].set_title(f'权重衰减模型 Acc: Train={train_acc_wd[-1]:.2f}, Test={test_acc_wd[-1]:.2f}')
axes[1, 2].legend()

plt.tight_layout()
plt.show()

print("正则化效果对比:")
print(f"过拟合模型: 训练准确率={train_acc_ov[-1]:.4f}, 测试准确率={test_acc_ov[-1]:.4f}")
print(f"Dropout模型: 训练准确率={train_acc_do[-1]:.4f}, 测试准确率={test_acc_do[-1]:.4f}")
print(f"权重衰减模型: 训练准确率={train_acc_wd[-1]:.4f}, 测试准确率={test_acc_wd[-1]:.4f}")
```

### 1.2 Dropout详解

Dropout在训练时随机丢弃一部分神经元，迫使网络学习更鲁棒的特征：

```python
# Dropout原理演示
class DropoutDemo(nn.Module):
    def __init__(self, p=0.5):
        super(DropoutDemo, self).__init__()
        self.dropout = nn.Dropout(p)
    
    def forward(self, x):
        return self.dropout(x)

# 演示Dropout效果
dropout_demo = DropoutDemo(p=0.5)
input_demo = torch.ones(10)
print("Dropout演示:")
print(f"输入: {input_demo}")

dropout_demo.train()
output_train = dropout_demo(input_demo)
print(f"训练模式输出(部分被置零): {output_train}")

dropout_demo.eval()
output_eval = dropout_demo(input_demo)
print(f"评估模式输出(所有保留并缩放): {output_eval}")

print("\nDropout原理:")
print("- 训练时: 随机将p比例的输出置零，剩余输出乘以1/(1-p)")
print("- 评估时: 所有神经元激活，输出不变")
print("- 效果: 相当于训练了多个子网络的集成")

# 不同Dropout比例的效果
dropout_rates = [0, 0.2, 0.5, 0.7]
results_dropout = {}

for rate in dropout_rates:
    model = RegularizedModel()
    # 修改Dropout率
    for i, layer in enumerate(model.network):
        if isinstance(layer, nn.Dropout):
            model.network[i] = nn.Dropout(rate)
    
    train_l, test_l, train_a, test_a = train_model(
        model, X_train_tensor, y_train_tensor, X_test_tensor, y_test_tensor, epochs=200
    )
    results_dropout[rate] = {
        'train_loss': train_l, 'test_loss': test_l,
        'train_acc': train_a[-1], 'test_acc': test_a[-1]
    }

print("\n不同Dropout比例的效果:")
for rate, result in results_dropout.items():
    print(f"Dropout={rate}: 测试准确率={result['test_acc']:.4f}")

# 可视化
plt.figure(figsize=(12, 5))
for rate, result in results_dropout.items():
    plt.plot(result['test_loss'], label=f'Dropout={rate}')
plt.xlabel('Epoch')
plt.ylabel('Test Loss')
plt.title('不同Dropout比例的测试损失')
plt.legend()
plt.grid(True)
plt.show()
```

### 1.3 Batch Normalization

Batch Normalization通过标准化每层的输入来稳定和加速训练：

```python
class BNModel(nn.Module):
    """带BatchNorm的模型"""
    def __init__(self):
        super(BNModel, self).__init__()
        self.network = nn.Sequential(
            nn.Linear(2, 256),
            nn.BatchNorm1d(256),
            nn.ReLU(),
            nn.Linear(256, 256),
            nn.BatchNorm1d(256),
            nn.ReLU(),
            nn.Linear(256, 128),
            nn.BatchNorm1d(128),
            nn.ReLU(),
            nn.Linear(128, 1),
            nn.Sigmoid()
        )
    
    def forward(self, x):
        return self.network(x)

# 比较BatchNorm的效果
bn_model = BNModel()
train_loss_bn, test_loss_bn, train_acc_bn, test_acc_bn = train_model(
    bn_model, X_train_tensor, y_train_tensor, X_test_tensor, y_test_tensor, epochs=200
)

no_bn_model = nn.Sequential(
    nn.Linear(2, 256),
    nn.ReLU(),
    nn.Linear(256, 256),
    nn.ReLU(),
    nn.Linear(256, 128),
    nn.ReLU(),
    nn.Linear(128, 1),
    nn.Sigmoid()
)

train_loss_no_bn, test_loss_no_bn, train_acc_no_bn, test_acc_no_bn = train_model(
    no_bn_model, X_train_tensor, y_train_tensor, X_test_tensor, y_test_tensor, epochs=200
)

# 可视化
fig, axes = plt.subplots(1, 2, figsize=(12, 5))

axes[0].plot(train_loss_bn, label='With BN')
axes[0].plot(train_loss_no_bn, label='Without BN')
axes[0].set_xlabel('Epoch')
axes[0].set_ylabel('Train Loss')
axes[0].set_title('BatchNorm对训练损失的影响')
axes[0].legend()
axes[0].grid(True)

axes[1].plot(test_acc_bn, label='With BN')
axes[1].plot(test_acc_no_bn, label='Without BN')
axes[1].set_xlabel('Epoch')
axes[1].set_ylabel('Test Accuracy')
axes[1].set_title('BatchNorm对准确率的影响')
axes[1].legend()
axes[1].grid(True)

plt.tight_layout()
plt.show()

print("\nBatchNorm优点:")
print("1. 加速收敛: 使每层输入分布稳定")
print("2. 减少对初始化的敏感")
print("3. 允许使用更高的学习率")
print("4. 有一定的正则化效果")

print("\nBatchNorm注意事项:")
print("- 训练时使用batch统计量")
print("- 评估时使用全局移动平均")
print("- 小batch时效果可能不稳定")
```

## 二、学习率调度

### 2.1 学习率的重要性

学习率是最重要的超参数之一：
- 太大：损失震荡，无法收敛
- 太小：收敛太慢，可能陷入局部最小

```python
# 创建数据
X_lr = torch.randn(500, 10)
y_lr = torch.randint(0, 2, (500,))

# 划分
train_dataset_lr = torch.utils.data.TensorDataset(X_lr[:400], y_lr[:400])
test_dataset_lr = torch.utils.data.TensorDataset(X_lr[400:], y_lr[400:])

train_loader_lr = torch.utils.data.DataLoader(train_dataset_lr, batch_size=32, shuffle=True)
test_loader_lr = torch.utils.data.DataLoader(test_dataset_lr, batch_size=32)

# 定义模型
class LRModel(nn.Module):
    def __init__(self):
        super(LRModel, self).__init__()
        self.network = nn.Sequential(
            nn.Linear(10, 64),
            nn.ReLU(),
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Linear(32, 2)
        )
    
    def forward(self, x):
        return self.network(x)

# 测试不同学习率
learning_rates = [0.0001, 0.001, 0.01, 0.1]
results_lr = {}

for lr in learning_rates:
    model = LRModel()
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.SGD(model.parameters(), lr=lr)
    
    losses = []
    for epoch in range(50):
        epoch_loss = 0
        for x, y in train_loader_lr:
            optimizer.zero_grad()
            output = model(x)
            loss = criterion(output, y)
            loss.backward()
            optimizer.step()
            epoch_loss += loss.item()
        losses.append(epoch_loss / len(train_loader_lr))
    
    results_lr[lr] = losses

# 可视化
plt.figure(figsize=(12, 6))
for lr, losses in results_lr.items():
    plt.plot(losses, label=f'lr={lr}')

plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.title('不同学习率对训练的影响')
plt.legend()
plt.grid(True)
plt.show()

print("学习率影响:")
for lr, losses in results_lr.items():
    print(f"lr={lr}: 最终损失={losses[-1]:.4f}")
```

### 2.2 学习率调度策略

```python
# 定义模型和基础训练函数
model_scheduler = LRModel()
criterion_scheduler = nn.CrossEntropyLoss()

# 不同学习率调度器
schedulers_info = {
    'StepLR': {'scheduler': optim.lr_scheduler.StepLR, 'params': {'step_size': 10, 'gamma': 0.5}},
    'ExponentialLR': {'scheduler': optim.lr_scheduler.ExponentialLR, 'params': {'gamma': 0.9}},
    'CosineAnnealingLR': {'scheduler': optim.lr_scheduler.CosineAnnealingLR, 'params': {'T_max': 50}},
    'ReduceLROnPlateau': {'scheduler': optim.lr_scheduler.ReduceLROnPlateau, 'params': {'mode': 'min', 'factor': 0.5}}
}

def train_with_scheduler(scheduler_type, scheduler_params, epochs=50):
    model = LRModel()
    optimizer = optim.SGD(model.parameters(), lr=0.1)
    
    if scheduler_type == 'ReduceLROnPlateau':
        scheduler = scheduler_type(optimizer, **scheduler_params)
    else:
        scheduler = scheduler_type(optimizer, **scheduler_params)
    
    losses = []
    learning_rates = []
    
    for epoch in range(epochs):
        epoch_loss = 0
        for x, y in train_loader_lr:
            optimizer.zero_grad()
            output = model(x)
            loss = criterion_scheduler(output, y)
            loss.backward()
            optimizer.step()
            epoch_loss += loss.item()
        
        avg_loss = epoch_loss / len(train_loader_lr)
        losses.append(avg_loss)
        learning_rates.append(optimizer.param_groups[0]['lr'])
        
        if scheduler_type == 'ReduceLROnPlateau':
            scheduler.step(avg_loss)
        else:
            scheduler.step()
    
    return losses, learning_rates

results_scheduler = {}

for name, info in schedulers_info.items():
    losses, lrs = train_with_scheduler(info['scheduler'], info['params'])
    results_scheduler[name] = {'losses': losses, 'learning_rates': lrs}

# 可视化学习率变化
fig, axes = plt.subplots(1, 2, figsize=(14, 5))

for name, data in results_scheduler.items():
    axes[0].plot(data['learning_rates'], label=name)
axes[0].set_xlabel('Epoch')
axes[0].set_ylabel('Learning Rate')
axes[0].set_title('不同调度器的学习率变化')
axes[0].legend()
axes[0].grid(True)

for name, data in results_scheduler.items():
    axes[1].plot(data['losses'], label=name)
axes[1].set_xlabel('Epoch')
axes[1].set_ylabel('Loss')
axes[1].set_title('不同调度器的训练损失')
axes[1].legend()
axes[1].grid(True)

plt.tight_layout()
plt.show()

print("学习率调度器说明:")
print("StepLR: 每step_size个epoch，lr乘以gamma")
print("ExponentialLR: 每个epoch，lr乘以gamma")
print("CosineAnnealingLR: lr按余弦函数变化")
print("ReduceLROnPlateau: 当损失停止下降时降低lr")

# 学习率预热 (Warmup)
class WarmupScheduler:
    """学习率预热调度器"""
    def __init__(self, optimizer, warmup_epochs, base_lr):
        self.optimizer = optimizer
        self.warmup_epochs = warmup_epochs
        self.base_lr = base_lr
        self.current_epoch = 0
    
    def step(self):
        if self.current_epoch < self.warmup_epochs:
            lr = self.base_lr * (self.current_epoch + 1) / self.warmup_epochs
        else:
            lr = self.base_lr
        
        for param_group in self.optimizer.param_groups:
            param_group['lr'] = lr
        
        self.current_epoch += 1
        return lr

# 演示预热效果
model_warmup = LRModel()
optimizer_warmup = optim.SGD(model_warmup.parameters(), lr=0.1)
warmup_scheduler = WarmupScheduler(optimizer_warmup, warmup_epochs=10, base_lr=0.1)

warmup_losses = []
warmup_lrs = []

for epoch in range(50):
    epoch_loss = 0
    for x, y in train_loader_lr:
        optimizer_warmup.zero_grad()
        output = model_warmup(x)
        loss = criterion_scheduler(output, y)
        loss.backward()
        optimizer_warmup.step()
        epoch_loss += loss.item()
    
    warmup_losses.append(epoch_loss / len(train_loader_lr))
    warmup_lrs.append(warmup_scheduler.step())

plt.figure(figsize=(12, 5))

plt.subplot(1, 2, 1)
plt.plot(warmup_lrs)
plt.xlabel('Epoch')
plt.ylabel('Learning Rate')
plt.title('学习率预热曲线')

plt.subplot(1, 2, 2)
plt.plot(warmup_losses)
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.title('预热训练损失')

plt.tight_layout()
plt.show()

print("\n学习率预热优点:")
print("- 避免训练初期的大梯度导致不稳定")
print("- 让模型在低lr下适应数据分布")
print("- 逐步提高lr到目标值")
```

## 三、数据增强

### 3.1 图像数据增强

```python
import torchvision.transforms as transforms
from PIL import Image
import warnings
warnings.filterwarnings('ignore')

print("图像数据增强技术:")
print("="*50)

# 创建模拟图像
sim_image = np.random.rand(100, 100, 3) * 255
sim_image = sim_image.astype(np.uint8)
pil_image = Image.fromarray(sim_image)

# 定义各种增强
transformations = {
    '原图': transforms.Compose([]),
    '水平翻转': transforms.RandomHorizontalFlip(p=1),
    '旋转': transforms.RandomRotation(30),
    '颜色抖动': transforms.ColorJitter(brightness=0.2, contrast=0.2),
    '随机裁剪': transforms.RandomResizedCrop(size=100, scale=(0.8, 1.0)),
    '组合增强': transforms.Compose([
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.1, contrast=0.1)
    ])
}

# 应用增强
fig, axes = plt.subplots(2, 3, figsize=(12, 8))
axes = axes.flatten()

for i, (name, transform) in enumerate(transformations.items()):
    if name == '原图':
        augmented = pil_image
    else:
        augmented = transform(pil_image)
    
    axes[i].imshow(augmented)
    axes[i].set_title(name)
    axes[i].axis('off')

plt.tight_layout()
plt.show()

print("\n常用图像增强技术:")
print("1. 随机翻转: 水平/垂直翻转")
print("2. 随机旋转: 小角度旋转")
print("3. 随机裁剪: 裁剪后缩放回原尺寸")
print("4. 颜色抖动: 亮度、对比度、饱和度变化")
print("5. 随机噪声: 添加随机噪声")
print("6. MixUp: 两张图像混合")
print("7. CutMix: 部分区域替换")

# 标准数据增强流水线
standard_augmentation = transforms.Compose([
    transforms.RandomResizedCrop(224),
    transforms.RandomHorizontalFlip(),
    transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

print("\n标准化增强流水线:")
print(standard_augmentation)
```

### 3.2 文本数据增强

```python
print("文本数据增强技术:")
print("="*50)

sample_text = "深度学习是人工智能领域最重要的技术之一"

print(f"原始文本: {sample_text}")

print("\n常用文本增强方法:")

print("\n1. 随机删除:")
def random_delete(text, p=0.1):
    words = text.split()
    if len(words) == 1:
        return text
    new_words = [w for w in words if np.random.rand() > p]
    return ' '.join(new_words)

print(f"示例: {random_delete(sample_text)}")

print("\n2. 随机交换:")
def random_swap(text, n=1):
    words = text.split()
    if len(words) < 2:
        return text
    for _ in range(n):
        idx1, idx2 = np.random.choice(len(words), 2, replace=False)
        words[idx1], words[idx2] = words[idx2], words[idx1]
    return ' '.join(words)

print(f"示例: {random_swap(sample_text)}")

print("\n3. 随机插入:")
def random_insert(text, word_list=['技术', '方法', '算法'], n=1):
    words = text.split()
    for _ in range(n):
        idx = np.random.randint(len(words) + 1)
        new_word = np.random.choice(word_list)
        words.insert(idx, new_word)
    return ' '.join(words)

print(f"示例: {random_insert(sample_text)}")

print("\n4. 同义词替换 (需要词库):")
print("示例: '重要的' -> '关键的'")

print("\n5. 回译 (翻译到其他语言再翻译回来):")
print("示例: 中文 -> 英文 -> 中文")

print("\n增强效果:")
print("- 增加训练数据多样性")
print("- 减少模型对特定模式的依赖")
print("- 提高泛化能力")
```

## 四、优化器选择

### 4.1 常用优化器比较

```python
optimizers_to_test = {
    'SGD': optim.SGD,
    'SGD+Momentum': lambda params, lr: optim.SGD(params, lr=lr, momentum=0.9),
    'Nesterov': lambda params, lr: optim.SGD(params, lr=lr, momentum=0.9, nesterov=True),
    'Adam': optim.Adam,
    'AdamW': lambda params, lr: optim.AdamW(params, lr=lr, weight_decay=0.01),
    'RMSprop': optim.RMSprop
}

def train_with_optimizer(optimizer_name, optimizer_class, epochs=50):
    model = LRModel()
    criterion = nn.CrossEntropyLoss()
    optimizer = optimizer_class(model.parameters(), lr=0.01)
    
    losses = []
    accuracies = []
    
    for epoch in range(epochs):
        epoch_loss = 0
        correct = 0
        total = 0
        
        for x, y in train_loader_lr:
            optimizer.zero_grad()
            output = model(x)
            loss = criterion(output, y)
            loss.backward()
            optimizer.step()
            
            epoch_loss += loss.item()
            _, predicted = torch.max(output, 1)
            correct += (predicted == y).sum().item()
            total += y.size(0)
        
        losses.append(epoch_loss / len(train_loader_lr))
        accuracies.append(correct / total)
    
    return losses, accuracies

results_optimizers = {}

for name, opt_class in optimizers_to_test.items():
    losses, accs = train_with_optimizer(name, opt_class)
    results_optimizers[name] = {'losses': losses, 'accuracies': accs}

# 可视化
fig, axes = plt.subplots(1, 2, figsize=(14, 5))

for name, data in results_optimizers.items():
    axes[0].plot(data['losses'], label=name)
axes[0].set_xlabel('Epoch')
axes[0].set_ylabel('Loss')
axes[0].set_title('不同优化器的训练损失')
axes[0].legend()
axes[0].grid(True)

for name, data in results_optimizers.items():
    axes[1].plot(data['accuracies'], label=name)
axes[1].set_xlabel('Epoch')
axes[1].set_ylabel('Accuracy')
axes[1].set_title('不同优化器的训练准确率')
axes[1].legend()
axes[1].grid(True)

plt.tight_layout()
plt.show()

print("优化器特点:")
print("SGD: 简单稳定，但收敛慢")
print("SGD+Momentum: 加入动量，加速收敛")
print("Nesterov: 动量的改进版本")
print("Adam: 自适应学习率，收敛快")
print("AdamW: Adam的改进，更好的权重衰减")
print("RMSprop: 类似Adam，适合RNN")

print("\n优化器选择建议:")
print("- 默认选择Adam， lr=0.001")
print("- 精调时用SGD+Momentum")
print("- RNN任务可尝试RMSprop")
```

## 五、超参数调优

### 5.1 超参数搜索策略

```python
print("超参数调优策略:")
print("="*50)

print("\n1. 网格搜索 (Grid Search):")
print("   - 遍历所有参数组合")
print("   - 计算量大，适合小参数空间")

print("\n2. 随机搜索 (Random Search):")
print("   - 随机采样参数组合")
print("   - 效率高于网格搜索")

print("\n3. 贝叶斯优化 (Bayesian Optimization):")
print("   - 根据历史结果选择下一个参数")
print("   - 高效，适合大参数空间")

# 随机搜索示例
def random_search_demo(param_ranges, n_trials=10):
    results = []
    
    for i in range(n_trials):
        # 随机采样参数
        params = {}
        for param, range_info in param_ranges.items():
            if isinstance(range_info, list):
                params[param] = np.random.choice(range_info)
            else:
                min_val, max_val = range_info
                params[param] = np.random.uniform(min_val, max_val)
        
        # 训练并评估 (模拟)
        model = nn.Sequential(
            nn.Linear(10, int(params['hidden_size'])),
            nn.ReLU(),
            nn.Dropout(params['dropout']),
            nn.Linear(int(params['hidden_size']), 2)
        )
        
        optimizer = optim.Adam(model.parameters(), lr=params['lr'])
        
        # 简短训练
        losses = []
        for epoch in range(10):
            epoch_loss = 0
            for x, y in train_loader_lr:
                optimizer.zero_grad()
                output = model(x)
                loss = nn.CrossEntropyLoss()(output, y)
                loss.backward()
                optimizer.step()
                epoch_loss += loss.item()
            losses.append(epoch_loss / len(train_loader_lr))
        
        results.append({
            'params': params,
            'final_loss': losses[-1]
        })
    
    return results

# 参数范围
param_ranges = {
    'lr': [0.0001, 0.001, 0.01],
    'hidden_size': [32, 64, 128],
    'dropout': [0.0, 0.3, 0.5]
}

results_random = random_search_demo(param_ranges, n_trials=9)

print("\n随机搜索结果:")
for i, result in enumerate(results_random):
    print(f"Trial {i+1}: lr={result['params']['lr']}, "
          f"hidden={result['params']['hidden_size']}, "
          f"dropout={result['params']['dropout']:.2f}, "
          f"loss={result['final_loss']:.4f}")

# 找到最佳参数
best_trial = min(results_random, key=lambda x: x['final_loss'])
print(f"\n最佳参数组合:")
print(f"  lr: {best_trial['params']['lr']}")
print(f"  hidden_size: {best_trial['params']['hidden_size']}")
print(f"  dropout: {best_trial['params']['dropout']}")
```

### 5.2 早停策略

```python
class EarlyStopping:
    """早停实现"""
    def __init__(self, patience=5, min_delta=0):
        self.patience = patience
        self.min_delta = min_delta
        self.counter = 0
        self.best_loss = None
        self.early_stop = False
    
    def check(self, loss):
        if self.best_loss is None:
            self.best_loss = loss
        elif loss > self.best_loss - self.min_delta:
            self.counter += 1
            if self.counter >= self.patience:
                self.early_stop = True
        else:
            self.best_loss = loss
            self.counter = 0
        
        return self.early_stop

# 演示早停
model_es = LRModel()
criterion_es = nn.CrossEntropyLoss()
optimizer_es = optim.Adam(model_es.parameters(), lr=0.01)

early_stopping = EarlyStopping(patience=5, min_delta=0.001)

train_losses_es = []
test_losses_es = []

for epoch in range(100):
    # 训练
    model_es.train()
    train_loss = 0
    for x, y in train_loader_lr:
        optimizer_es.zero_grad()
        output = model_es(x)
        loss = criterion_es(output, y)
        loss.backward()
        optimizer_es.step()
        train_loss += loss.item()
    train_losses_es.append(train_loss / len(train_loader_lr))
    
    # 测试
    model_es.eval()
    test_loss = 0
    with torch.no_grad():
        for x, y in test_loader_lr:
            output = model_es(x)
            loss = criterion_es(output, y)
            test_loss += loss.item()
    test_loss = test_loss / len(test_loader_lr)
    test_losses_es.append(test_loss)
    
    # 检查早停
    if early_stopping.check(test_loss):
        print(f"早停触发于Epoch {epoch+1}")
        break

plt.figure(figsize=(10, 5))
plt.plot(train_losses_es, label='Train Loss')
plt.plot(test_losses_es, label='Test Loss')
plt.axvline(x=len(train_losses_es)-1, color='r', linestyle='--', label='Early Stop')
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.title('早停演示')
plt.legend()
plt.grid(True)
plt.show()

print("\n早停策略优点:")
print("- 防止过拟合")
print("- 自动确定最佳epoch数")
print("- 节省训练时间")
```

## 六、模型架构优化

### 6.1 模型设计原则

```python
print("模型设计原则:")
print("="*50)

print("\n1. 网络深度:")
print("   - 更深的网络表达能力强")
print("   - 但训练更难，需要BatchNorm/残差连接")
print("   - 建议从小网络开始，逐步加深")

print("\n2. 网络宽度:")
print("   - 更宽的网络容量更大")
print("   - 但参数更多，容易过拟合")
print("   - 建议根据数据复杂度调整")

print("\n3. 跳跃连接:")
print("   - ResNet的残差连接")
print("   - DenseNet的密集连接")
print("   - 改善梯度流动，支持更深网络")

# 比较不同架构
class DeepModel(nn.Module):
    def __init__(self, depth=10):
        super(DeepModel, self).__init__()
        layers = [nn.Linear(10, 64), nn.ReLU()]
        for _ in range(depth - 1):
            layers.extend([nn.Linear(64, 64), nn.ReLU()])
        layers.append(nn.Linear(64, 2))
        self.network = nn.Sequential(*layers)
    
    def forward(self, x):
        return self.network(x)

class ResidualModel(nn.Module):
    def __init__(self, depth=10):
        super(ResidualModel, self).__init__()
        self.input_layer = nn.Linear(10, 64)
        self.residual_blocks = nn.ModuleList([
            self._make_block() for _ in range(depth)
        ])
        self.output_layer = nn.Linear(64, 2)
    
    def _make_block(self):
        return nn.Sequential(
            nn.Linear(64, 64),
            nn.ReLU(),
            nn.Linear(64, 64)
        )
    
    def forward(self, x):
        x = nn.ReLU()(self.input_layer(x))
        for block in self.residual_blocks:
            residual = x
            x = nn.ReLU()(block(x) + residual)  # 残差连接
        return self.output_layer(x)

# 训练比较
def train_compare_models(models_dict, epochs=30):
    results = {}
    
    for name, model in models_dict.items():
        criterion = nn.CrossEntropyLoss()
        optimizer = optim.Adam(model.parameters(), lr=0.001)
        
        losses = []
        for epoch in range(epochs):
            epoch_loss = 0
            for x, y in train_loader_lr:
                optimizer.zero_grad()
                output = model(x)
                loss = criterion(output, y)
                loss.backward()
                optimizer.step()
                epoch_loss += loss.item()
            losses.append(epoch_loss / len(train_loader_lr))
        
        results[name] = losses
    
    return results

models_compare = {
    'Deep(10层)': DeepModel(depth=10),
    'Residual(10层)': ResidualModel(depth=10)
}

results_arch = train_compare_models(models_compare)

plt.figure(figsize=(10, 5))
for name, losses in results_arch.items():
    plt.plot(losses, label=name)
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.title('普通网络 vs 残差网络')
plt.legend()
plt.grid(True)
plt.show()

print("\n观察:")
print("残差网络训练更稳定，收敛更快")
print("跳跃连接改善了深层网络的梯度传播")
```

## 七、总结

本文系统地介绍了深度学习训练的优化技巧：

1. **正则化**：Dropout、权重衰减、BatchNorm防止过拟合
2. **学习率调度**：StepLR、CosineAnnealing、Warmup等策略
3. **数据增强**：图像和文本增强提高泛化能力
4. **优化器**：Adam、SGD+Momentum等的选择建议
5. **超参数调优**：随机搜索、早停策略

关键建议：

- 始终使用验证集监控过拟合
- 从简单模型开始，逐步增加复杂度
- BatchNorm和残差连接支持深层网络
- 数据增强是最有效的正则化手段
- 早停防止过度训练

训练优化是一门实践艺术，需要在实际项目中不断积累经验。掌握这些技巧，能够显著提升模型性能和训练效率。
