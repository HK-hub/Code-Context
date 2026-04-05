---
title: CNN架构设计：卷积神经网络原理与实战
date: 2025-02-25T00:00:00.000Z
categories:
  - ai
  - deep-learning
tags:
  - CNN
  - 卷积神经网络
  - 图像处理
  - 深度学习
  - PyTorch
description: 深入解析CNN的核心组件，包括卷积层、池化层、经典架构设计及PyTorch实现
author: HK意境
---

# CNN架构设计：卷积神经网络原理与实战

卷积神经网络（Convolutional Neural Network, CNN）是深度学习在计算机视觉领域的核心架构。本文将从原理到实践，系统地介绍CNN的设计与应用。

## 一、CNN概述

### 1.1 为什么需要CNN

传统神经网络处理图像时存在几个关键问题：

1. **参数量爆炸**：一张1000x1000像素的图像，如果用全连接网络处理，仅输入层就需要100万个参数
2. **空间结构丢失**：全连接网络将图像视为向量，忽略了像素之间的空间关系
3. **平移不变性缺失**：无法自动处理图像中物体的位置变化

CNN通过卷积操作解决了这些问题：
- **局部感受野**：每个神经元只处理局部区域
- **权值共享**：同一卷积核在整个图像上共享参数
- **空间层次**：逐层提取从低级到高级的特征

### 1.2 CNN的基本结构

典型的CNN架构包含以下层：
- **卷积层（Convolution）**：提取局部特征
- **池化层（Pooling）**：降低空间分辨率
- **激活层（Activation）**：引入非线性
- **全连接层（Fully Connected）**：进行分类决策

## 二、卷积层详解

### 2.1 卷积运算原理

卷积操作使用滤波器（kernel/filter）在输入上滑动，计算局部区域的加权求和：

$$y_{i,j} = \sum_{m}\sum_{n} x_{i+m, j+n} \cdot k_{m,n}$$

其中 $x$ 是输入，$k$ 是卷积核。

```python
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
import matplotlib.pyplot as plt
from torchvision import datasets, transforms
from torch.utils.data import DataLoader

# 手动实现卷积操作
def manual_convolution(image, kernel, stride=1, padding=0):
    """手动实现2D卷积"""
    # 添加padding
    if padding > 0:
        image = np.pad(image, padding, mode='constant')
    
    k_h, k_w = kernel.shape
    i_h, i_w = image.shape
    
    # 计算输出尺寸
    o_h = (i_h - k_h) // stride + 1
    o_w = (i_w - k_w) // stride + 1
    
    output = np.zeros((o_h, o_w))
    
    for i in range(o_h):
        for j in range(o_w):
            # 计算卷积区域
            region = image[i*stride:i*stride+k_h, j*stride:j*stride+k_w]
            # 计算点积
            output[i, j] = np.sum(region * kernel)
    
    return output

# 示例：使用不同卷积核提取特征
sample_image = np.array([
    [0, 0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0]
])

# 边缘检测卷积核
edge_kernel = np.array([
    [-1, -1, -1],
    [-1,  8, -1],
    [-1, -1, -1]
])

# 水平边缘检测
horizontal_edge_kernel = np.array([
    [-1, -1, -1],
    [ 0,  0,  0],
    [ 1,  1,  1]
])

# 垂直边缘检测
vertical_edge_kernel = np.array([
    [-1, 0, 1],
    [-1, 0, 1],
    [-1, 0, 1]
])

# 应用卷积
edge_output = manual_convolution(sample_image, edge_kernel)
h_edge_output = manual_convolution(sample_image, horizontal_edge_kernel)
v_edge_output = manual_convolution(sample_image, vertical_edge_kernel)

print("卷积核效果演示:")
print("\n原始图像:")
print(sample_image)
print("\n边缘检测结果:")
print(edge_output)
print("\n水平边缘检测结果:")
print(h_edge_output)
print("\n垂直边缘检测结果:")
print(v_edge_output)

# 可视化卷积效果
fig, axes = plt.subplots(2, 4, figsize=(14, 7))

axes[0, 0].imshow(sample_image, cmap='gray')
axes[0, 0].set_title('原始图像')
axes[0, 0].axis('off')

axes[0, 1].imshow(edge_kernel, cmap='gray')
axes[0, 1].set_title('边缘检测核')
axes[0, 1].axis('off')

axes[0, 2].imshow(edge_output, cmap='gray')
axes[0, 2].set_title('边缘检测结果')
axes[0, 2].axis('off')

axes[0, 3].imshow(h_edge_output, cmap='gray')
axes[0, 3].set_title('水平边缘结果')
axes[0, 3].axis('off')

axes[1, 0].imshow(sample_image, cmap='gray')
axes[1, 0].set_title('原始图像')
axes[1, 0].axis('off')

axes[1, 1].imshow(vertical_edge_kernel, cmap='gray')
axes[1, 1].set_title('垂直边缘核')
axes[1, 1].axis('off')

axes[1, 2].imshow(v_edge_output, cmap='gray')
axes[1, 2].set_title('垂直边缘结果')
axes[1, 2].axis('off')

# 添加一个平滑滤波器示例
smooth_kernel = np.ones((3, 3)) / 9
smooth_output = manual_convolution(sample_image, smooth_kernel)
axes[1, 3].imshow(smooth_output, cmap='gray')
axes[1, 3].set_title('平滑滤波结果')
axes[1, 3].axis('off')

plt.tight_layout()
plt.show()
```

### 2.2 卷积层参数

**卷积核大小（Kernel Size）**：常用3x3、5x5、7x7
**步长（Stride）**：控制卷积核移动的步距
**填充（Padding）**：在输入边缘添加零值，保持输出尺寸

输出尺寸计算公式：

$$output\_size = \frac{input\_size + 2 \times padding - kernel\_size}{stride} + 1$$

```python
# 使用PyTorch Conv2d演示参数效果
input_tensor = torch.randn(1, 1, 8, 8)  # [batch, channel, height, width]

print("卷积层参数演示:")

# 不同kernel_size
print("\n不同kernel_size:")
for k in [3, 5, 7]:
    conv = nn.Conv2d(1, 1, kernel_size=k)
    output = conv(input_tensor)
    print(f"kernel={k}x{k}: 输入8x8 -> 输出{output.shape[2]}x{output.shape[3]}")

# 不同stride
print("\n不同stride:")
for s in [1, 2, 3]:
    conv = nn.Conv2d(1, 1, kernel_size=3, stride=s)
    output = conv(input_tensor)
    print(f"stride={s}: 输入8x8 -> 输出{output.shape[2]}x{output.shape[3]}")

# 不同padding
print("\n不同padding:")
for p in [0, 1, 2]:
    conv = nn.Conv2d(1, 1, kernel_size=3, padding=p)
    output = conv(input_tensor)
    print(f"padding={p}: 输入8x8 -> 输出{output.shape[2]}x{output.shape[3]}")

# 多通道卷积
input_multi = torch.randn(1, 3, 8, 8)  # RGB图像
conv_multi = nn.Conv2d(3, 16, kernel_size=3)  # 3输入通道，16输出通道
output_multi = conv_multi(input_multi)

print("\n多通道卷积:")
print(f"输入: [batch=1, channel=3, H=8, W=8]")
print(f"输出: [batch=1, channel={output_multi.shape[1]}, H={output_multi.shape[2]}, W={output_multi.shape[3]}]")
print(f"参数量: {sum(p.numel() for p in conv_multi.parameters())}")

# 计算参数量
# 对于Conv2d(in=3, out=16, kernel=3):
# 参数量 = in * out * kernel_h * kernel_w + out (bias)
# = 3 * 16 * 3 * 3 + 16 = 448
print(f"手动计算: 3 * 16 * 3 * 3 + 16 = {3*16*3*3+16}")
```

### 2.3 特征可视化

```python
# 创建一个简单的图像用于特征可视化
# 使用一个包含不同形状的合成图像
def create_shape_image(size=64):
    image = np.zeros((size, size))
    
    # 添加矩形
    image[10:20, 10:30] = 1
    
    # 添加圆形
    for i in range(size):
        for j in range(size):
            if (i-35)**2 + (j-35)**2 < 8**2:
                image[i, j] = 1
    
    # 添加斜线
    for i in range(10, 55):
        if 45+i-10 < size:
            image[i, 45+i-10] = 1
    
    return image

shape_image = create_shape_image()

# 使用PyTorch处理
image_tensor = torch.FloatTensor(shape_image).unsqueeze(0).unsqueeze(0)

# 定义不同的卷积核来提取不同特征
kernels = {
    'edge': torch.FloatTensor([[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]]).unsqueeze(0).unsqueeze(0),
    'horizontal': torch.FloatTensor([[-1, -1, -1], [0, 0, 0], [1, 1, 1]]).unsqueeze(0).unsqueeze(0),
    'vertical': torch.FloatTensor([[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]]).unsqueeze(0).unsqueeze(0),
    'diagonal': torch.FloatTensor([[1, 0, -1], [0, 0, 0], [-1, 0, 1]]).unsqueeze(0).unsqueeze(0),
    'blur': torch.FloatTensor([[1/9]*3]*3).unsqueeze(0).unsqueeze(0)
}

# 应用卷积并可视化
fig, axes = plt.subplots(2, 6, figsize=(15, 8))

axes[0, 0].imshow(shape_image, cmap='gray')
axes[0, 0].set_title('原始图像')
axes[0, 0].axis('off')

for i, (name, kernel) in enumerate(kernels.items()):
    # 应用卷积
    conv_output = F.conv2d(image_tensor, kernel)
    
    # 显示卷积核
    axes[0, i+1].imshow(kernel.squeeze(), cmap='gray')
    axes[0, i+1].set_title(f'{name}核')
    axes[0, i+1].axis('off')
    
    # 显示输出
    axes[1, i+1].imshow(conv_output.squeeze(), cmap='gray')
    axes[1, i+1].set_title(f'{name}输出')
    axes[1, i+1].axis('off')

axes[1, 0].axis('off')

plt.tight_layout()
plt.show()
```

## 三、池化层详解

### 3.1 池化的作用

池化（Pooling）操作降低特征图的空间分辨率，主要作用：

1. **降低计算量**：减少后续层的参数和计算
2. **扩大感受野**：使后续层能看到更大区域
3. **增强鲁棒性**：对微小平移和变形不敏感

常用池化类型：
- **最大池化（Max Pooling）**：取区域内的最大值
- **平均池化（Average Pooling）**：取区域内的平均值

```python
# 手动实现池化
def manual_max_pooling(feature_map, pool_size=2, stride=2):
    """手动实现最大池化"""
    h, w = feature_map.shape
    o_h = (h - pool_size) // stride + 1
    o_w = (w - pool_size) // stride + 1
    
    output = np.zeros((o_h, o_w))
    
    for i in range(o_h):
        for j in range(o_w):
            region = feature_map[i*stride:i*stride+pool_size, 
                                 j*stride:j*stride+pool_size]
            output[i, j] = np.max(region)
    
    return output

def manual_avg_pooling(feature_map, pool_size=2, stride=2):
    """手动实现平均池化"""
    h, w = feature_map.shape
    o_h = (h - pool_size) // stride + 1
    o_w = (w - pool_size) // stride + 1
    
    output = np.zeros((o_h, o_w))
    
    for i in range(o_h):
        for j in range(o_w):
            region = feature_map[i*stride:i*stride+pool_size, 
                                 j*stride:j*stride+pool_size]
            output[i, j] = np.mean(region)
    
    return output

# 示例特征图
feature_map = np.array([
    [1, 3, 2, 4, 5, 6],
    [2, 4, 3, 5, 6, 7],
    [3, 5, 4, 6, 7, 8],
    [4, 6, 5, 7, 8, 9],
    [5, 7, 6, 8, 9, 10],
    [6, 8, 7, 9, 10, 11]
])

max_pooled = manual_max_pooling(feature_map)
avg_pooled = manual_avg_pooling(feature_map)

print("池化操作演示:")
print("输入特征图:")
print(feature_map)
print("\n最大池化结果 (2x2):")
print(max_pooled)
print("\n平均池化结果 (2x2):")
print(avg_pooled)

# 使用PyTorch实现
feature_tensor = torch.FloatTensor(feature_map).unsqueeze(0).unsqueeze(0)

max_pool_layer = nn.MaxPool2d(kernel_size=2, stride=2)
avg_pool_layer = nn.AvgPool2d(kernel_size=2, stride=2)

torch_max_pool = max_pool_layer(feature_tensor).squeeze()
torch_avg_pool = avg_pool_layer(feature_tensor).squeeze()

print("\nPyTorch池化结果:")
print("MaxPool:", torch_max_pool)
print("AvgPool:", torch_avg_pool)

# 可视化不同池化大小的效果
pool_sizes = [2, 3, 4]

fig, axes = plt.subplots(1, len(pool_sizes)+1, figsize=(12, 3))

axes[0].imshow(feature_map, cmap='viridis')
axes[0].set_title('原始特征图')
axes[0].axis('off')

for i, ps in enumerate(pool_sizes):
    max_p = manual_max_pooling(feature_map, pool_size=ps)
    axes[i+1].imshow(max_p, cmap='viridis')
    axes[i+1].set_title(f'MaxPool {ps}x{ps}')
    axes[i+1].axis('off')

plt.tight_layout()
plt.show()
```

### 3.2 全局池化

```python
# 全局平均池化（常用于替代全连接层）
input_4d = torch.randn(1, 64, 7, 7)  # [batch, channels, H, W]

global_avg_pool = nn.AdaptiveAvgPool2d((1, 1))
global_max_pool = nn.AdaptiveMaxPool2d((1, 1))

avg_output = global_avg_pool(input_4d)
max_output = global_max_pool(input_4d)

print("全局池化:")
print(f"输入形状: {input_4d.shape}")
print(f"全局平均池化输出: {avg_output.shape}")  # [1, 64, 1, 1]
print(f"全局最大池化输出: {max_output.shape}")

# Adaptive池化可以输出任意尺寸
adaptive_pool = nn.AdaptiveAvgPool2d((3, 3))
adaptive_output = adaptive_pool(input_4d)
print(f"自适应池化(3x3)输出: {adaptive_output.shape}")
```

## 四、经典CNN架构

### 4.1 LeNet-5

LeNet-5是最早成功的CNN架构之一，由LeCun于1998年提出，用于手写数字识别。

```python
class LeNet5(nn.Module):
    """LeNet-5架构实现"""
    def __init__(self, num_classes=10):
        super(LeNet5, self).__init__()
        
        # 卷积层
        self.conv1 = nn.Conv2d(1, 6, kernel_size=5, padding=2)  # 28x28 -> 28x28
        self.conv2 = nn.Conv2d(6, 16, kernel_size=5)  # 14x14 -> 10x10
        
        # 池化层
        self.pool = nn.AvgPool2d(kernel_size=2, stride=2)
        
        # 全连接层
        self.fc1 = nn.Linear(16 * 5 * 5, 120)
        self.fc2 = nn.Linear(120, 84)
        self.fc3 = nn.Linear(84, num_classes)
    
    def forward(self, x):
        # C1: 卷积 + 激活
        x = torch.sigmoid(self.conv1(x))
        # S2: 池化
        x = self.pool(x)
        # C3: 卷积 + 激活
        x = torch.sigmoid(self.conv2(x))
        # S4: 池化
        x = self.pool(x)
        
        # 展平
        x = x.view(-1, 16 * 5 * 5)
        
        # 全连接层
        x = torch.sigmoid(self.fc1(x))
        x = torch.sigmoid(self.fc2(x))
        x = self.fc3(x)
        
        return x

# 创建LeNet模型
lenet = LeNet5()
print("LeNet-5架构:")
print(lenet)

# 计算参数量
total_params = sum(p.numel() for p in lenet.parameters())
print(f"\n总参数量: {total_params}")

# 测试输入输出
test_input = torch.randn(1, 1, 28, 28)
test_output = lenet(test_input)
print(f"\n输入形状: {test_input.shape}")
print(f"输出形状: {test_output.shape}")
```

### 4.2 AlexNet

AlexNet在2012年ImageNet竞赛中取得突破性成绩，开启了深度学习时代。

```python
class AlexNet(nn.Module):
    """简化版AlexNet架构"""
    def __init__(self, num_classes=1000):
        super(AlexNet, self).__init__()
        
        self.features = nn.Sequential(
            nn.Conv2d(3, 64, kernel_size=11, stride=4, padding=2),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=3, stride=2),
            
            nn.Conv2d(64, 192, kernel_size=5, padding=2),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=3, stride=2),
            
            nn.Conv2d(192, 384, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            
            nn.Conv2d(384, 256, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            
            nn.Conv2d(256, 256, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=3, stride=2),
        )
        
        self.classifier = nn.Sequential(
            nn.Dropout(0.5),
            nn.Linear(256 * 6 * 6, 4096),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(4096, 4096),
            nn.ReLU(inplace=True),
            nn.Linear(4096, num_classes),
        )
    
    def forward(self, x):
        x = self.features(x)
        x = x.view(x.size(0), -1)
        x = self.classifier(x)
        return x

alexnet = AlexNet(num_classes=10)
print("简化版AlexNet架构:")
print(alexnet)

# 计算参数量
params_features = sum(p.numel() for p in alexnet.features.parameters())
params_classifier = sum(p.numel() for p in alexnet.classifier.parameters())
print(f"\n特征提取层参数: {params_features}")
print(f"分类层参数: {params_classifier}")
print(f"总参数量: {params_features + params_classifier}")
```

### 4.3 VGGNet

VGGNet证明了使用更小的卷积核（3x3）构建更深的网络可以取得更好的效果。

```python
class VGGBlock(nn.Module):
    """VGG基本块：多个3x3卷积 + 池化"""
    def __init__(self, in_channels, out_channels, num_convs):
        super(VGGBlock, self).__init__()
        
        layers = []
        for i in range(num_convs):
            layers.append(nn.Conv2d(
                in_channels if i == 0 else out_channels,
                out_channels,
                kernel_size=3, padding=1
            ))
            layers.append(nn.ReLU(inplace=True))
        
        layers.append(nn.MaxPool2d(kernel_size=2, stride=2))
        
        self.block = nn.Sequential(*layers)
    
    def forward(self, x):
        return self.block(x)

class VGG16(nn.Module):
    """VGG-16架构"""
    def __init__(self, num_classes=1000):
        super(VGG16, self).__init__()
        
        self.features = nn.Sequential(
            VGGBlock(3, 64, 2),     # 64
            VGGBlock(64, 128, 2),   # 128
            VGGBlock(128, 256, 3),  # 256
            VGGBlock(256, 512, 3),  # 512
            VGGBlock(512, 512, 3),  # 512
        )
        
        self.classifier = nn.Sequential(
            nn.Linear(512 * 7 * 7, 4096),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(4096, 4096),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(4096, num_classes),
        )
    
    def forward(self, x):
        x = self.features(x)
        x = x.view(x.size(0), -1)
        x = self.classifier(x)
        return x

# 创建简化版VGG
class VGGSmall(nn.Module):
    """简化版VGG用于教学"""
    def __init__(self, num_classes=10):
        super(VGGSmall, self).__init__()
        
        self.features = nn.Sequential(
            VGGBlock(1, 32, 2),
            VGGBlock(32, 64, 2),
            VGGBlock(64, 128, 2),
        )
        
        self.classifier = nn.Sequential(
            nn.Linear(128 * 3 * 3, 512),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(512, num_classes),
        )
    
    def forward(self, x):
        x = self.features(x)
        x = x.view(x.size(0), -1)
        x = self.classifier(x)
        return x

vgg_small = VGGSmall()
print("简化版VGG架构:")
print(vgg_small)

# 计算3x3卷积的优势
print("\n为什么要用3x3卷积核?")
print("两个3x3卷积的感受野 = 一个5x5卷积的感受野")
print("但参数量: 2 * 3*3 = 18 < 5*5 = 25")
print("且非线性激活更多，特征表达更丰富")
```

### 4.4 ResNet与残差连接

ResNet通过残差连接解决了深层网络的训练难题。

```python
class ResidualBlock(nn.Module):
    """残差块"""
    def __init__(self, channels):
        super(ResidualBlock, self).__init__()
        
        self.conv1 = nn.Conv2d(channels, channels, kernel_size=3, padding=1)
        self.bn1 = nn.BatchNorm2d(channels)
        self.conv2 = nn.Conv2d(channels, channels, kernel_size=3, padding=1)
        self.bn2 = nn.BatchNorm2d(channels)
    
    def forward(self, x):
        residual = x
        
        out = F.relu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))
        
        # 残差连接：F(x) + x
        out += residual
        out = F.relu(out)
        
        return out

class SimpleResNet(nn.Module):
    """简化版ResNet"""
    def __init__(self, num_classes=10):
        super(SimpleResNet, self).__init__()
        
        self.conv1 = nn.Conv2d(1, 32, kernel_size=3, padding=1)
        self.bn1 = nn.BatchNorm2d(32)
        
        self.res_block1 = ResidualBlock(32)
        self.res_block2 = ResidualBlock(32)
        
        self.pool = nn.AdaptiveAvgPool2d((1, 1))
        self.fc = nn.Linear(32, num_classes)
    
    def forward(self, x):
        x = F.relu(self.bn1(self.conv1(x)))
        x = self.res_block1(x)
        x = self.res_block2(x)
        x = self.pool(x)
        x = x.view(x.size(0), -1)
        x = self.fc(x)
        return x

simple_resnet = SimpleResNet()
print("简化版ResNet架构:")
print(simple_resnet)

# 演示残差连接的重要性
print("\n残差连接的作用:")
print("普通网络: 学习 H(x)")
print("残差网络: 学习 F(x) = H(x) - x，输出 H(x) = F(x) + x")
print("优势: 当F(x)=0是最优解时，更容易学习")
print("避免了梯度消失问题")
```

## 五、完整CNN训练示例

```python
# 完整的CNN训练流程（使用模拟数据）
from sklearn.datasets import fetch_openml
import warnings
warnings.filterwarnings('ignore')

print("="*50)
print("CNN完整训练示例")
print("="*50)

# 创建模拟数据集
class SimulatedMNIST(Dataset):
    def __init__(self, num_samples=1000):
        self.data = torch.randn(num_samples, 1, 28, 28)
        self.labels = torch.randint(0, 10, (num_samples,))
    
    def __len__(self):
        return len(self.data)
    
    def __getitem__(self, idx):
        return self.data[idx], self.labels[idx]

train_dataset_sim = SimulatedMNIST(2000)
test_dataset_sim = SimulatedMNIST(400)

train_loader_sim = DataLoader(train_dataset_sim, batch_size=64, shuffle=True)
test_loader_sim = DataLoader(test_dataset_sim, batch_size=64, shuffle=False)

# 定义完整CNN模型
class FullCNN(nn.Module):
    def __init__(self, num_classes=10):
        super(FullCNN, self).__init__()
        
        self.features = nn.Sequential(
            # Block 1
            nn.Conv2d(1, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.Conv2d(32, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Dropout(0.25),
            
            # Block 2
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.Conv2d(64, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Dropout(0.25),
            
            # Block 3
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(),
            nn.MaxPool2d(2),
        )
        
        self.classifier = nn.Sequential(
            nn.Linear(128 * 3 * 3, 512),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(512, num_classes),
        )
    
    def forward(self, x):
        x = self.features(x)
        x = x.view(x.size(0), -1)
        x = self.classifier(x)
        return x

# 初始化模型
model_cnn = FullCNN()
criterion_cnn = nn.CrossEntropyLoss()
optimizer_cnn = optim.Adam(model_cnn.parameters(), lr=0.001)

print(f"\n模型结构:")
print(model_cnn)

# 训练
num_epochs = 20
train_losses_cnn = []
test_losses_cnn = []
test_accuracies_cnn = []

def evaluate_model(model, dataloader):
    correct = 0
    total = 0
    total_loss = 0
    criterion = nn.CrossEntropyLoss()
    
    with torch.no_grad():
        for data, labels in dataloader:
            outputs = model(data)
            loss = criterion(outputs, labels)
            total_loss += loss.item()
            _, predicted = torch.max(outputs, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()
    
    return total_loss / len(dataloader), correct / total

print("\n开始训练...")
for epoch in range(num_epochs):
    # 训练阶段
    model_cnn.train()
    epoch_loss = 0
    for data, labels in train_loader_sim:
        optimizer_cnn.zero_grad()
        outputs = model_cnn(data)
        loss = criterion_cnn(outputs, labels)
        loss.backward()
        optimizer_cnn.step()
        epoch_loss += loss.item()
    
    train_loss = epoch_loss / len(train_loader_sim)
    train_losses_cnn.append(train_loss)
    
    # 测试阶段
    test_loss, test_acc = evaluate_model(model_cnn, test_loader_sim)
    test_losses_cnn.append(test_loss)
    test_accuracies_cnn.append(test_acc)
    
    if (epoch + 1) % 5 == 0:
        print(f"Epoch {epoch+1}: Train Loss={train_loss:.4f}, Test Loss={test_loss:.4f}, Test Acc={test_acc:.4f}")

# 可视化训练过程
fig, axes = plt.subplots(1, 2, figsize=(12, 5))

axes[0].plot(train_losses_cnn, label='Train Loss')
axes[0].plot(test_losses_cnn, label='Test Loss')
axes[0].set_xlabel('Epoch')
axes[0].set_ylabel('Loss')
axes[0].set_title('CNN训练损失曲线')
axes[0].legend()
axes[0].grid(True)

axes[1].plot(test_accuracies_cnn)
axes[1].set_xlabel('Epoch')
axes[1].set_ylabel('Accuracy')
axes[1].set_title('测试准确率曲线')
axes[1].grid(True)

plt.tight_layout()
plt.show()

print(f"\n最终测试准确率: {test_accuracies_cnn[-1]:.4f}")
```

## 六、CNN设计最佳实践

### 6.1 设计原则

```python
print("CNN架构设计最佳实践:")
print("="*40)

print("\n1. 卷积层设计:")
print("   - 使用小卷积核(3x3)堆叠代替大卷积核")
print("   - 保持padding使特征图尺寸不减小太快")
print("   - 通道数逐层增加，空间尺寸逐层减小")

print("\n2. 池化层设计:")
print("   - 通常使用2x2最大池化，stride=2")
print("   - 池化层减少参数，扩大感受野")
print("   - 可用步长大于1的卷积替代池化")

print("\n3. 激活函数:")
print("   - ReLU是目前最常用的选择")
print("   - BatchNorm通常放在卷积后、激活前")

print("\n4. 网络深度:")
print("   - 深度网络特征表达能力强")
print("   - 使用残差连接避免梯度消失")
print("   - 配合BatchNorm稳定训练")

print("\n5. 参数优化:")
print("   - Dropout防止过拟合")
print("   - BatchNorm加速收敛")
print("   - 数据增强提升泛化能力")

# 参数计算示例
def calculate_conv_params(in_channels, out_channels, kernel_size):
    """计算卷积层参数量"""
    kernel_params = in_channels * out_channels * kernel_size**2
    bias_params = out_channels
    return kernel_params + bias_params

print("\n参数量计算示例:")
print(f"Conv2d(64, 128, kernel_size=3): {calculate_conv_params(64, 128, 3)} 参数")
print(f"Conv2d(128, 256, kernel_size=5): {calculate_conv_params(128, 256, 5)} 参数")

print("\n感受野计算:")
def calculate_receptive_field(layers):
    """计算感受野"""
    rf = 1
    for kernel_size, stride in layers:
        rf = rf + (kernel_size - 1) * stride
    return rf

layers = [(3, 1), (3, 1), (2, 2), (3, 1), (3, 1), (2, 2)]
rf = calculate_receptive_field(layers)
print(f"经过6层(卷积+池化)后的感受野: {rf}x{rf}")
```

## 七、总结

本文系统介绍了CNN的核心原理和实践：

1. **卷积层**：通过局部连接和权值共享高效提取特征
2. **池化层**：降低分辨率、扩大感受野、增强鲁棒性
3. **经典架构**：LeNet、AlexNet、VGG、ResNet的设计思想
4. **设计原则**：小卷积核、通道递增、残差连接

CNN的成功在于其设计契合了图像的本质特性：
- 局部相关性：像素间存在空间依赖
- 平移不变性：物体位置变化不应影响识别
- 层次抽象性：从边缘到形状再到语义的渐进抽象

在实际应用中，建议：
- 从经典架构开始，理解设计思想
- 根据任务需求调整网络深度和宽度
- 使用预训练模型迁移学习

CNN是计算机视觉的基础，掌握其原理对于深入学习目标检测、图像分割等高级任务至关重要。
