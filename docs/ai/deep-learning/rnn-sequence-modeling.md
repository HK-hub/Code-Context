---
title: RNN序列建模：循环神经网络原理与应用
date: 2025-03-10T00:00:00.000Z
categories:
  - ai
  - deep-learning
tags:
  - RNN
  - LSTM
  - GRU
  - 序列建模
  - 深度学习
  - NLP
description: 深入理解循环神经网络的核心原理，包括RNN、LSTM、GRU架构及其在序列数据处理中的应用
author: HK意境
---

# RNN序列建模：循环神经网络原理与应用

循环神经网络（Recurrent Neural Network, RNN）是处理序列数据的经典架构。本文将深入讲解RNN的核心原理、变体结构及其在自然语言处理等领域的应用。

## 一、序列数据与RNN动机

### 1.1 序列数据的特点

序列数据具有时间或顺序依赖性，当前时刻的信息与前后的状态相关。常见的序列数据包括：

- **文本序列**：单词之间存在语法和语义依赖
- **语音信号**：音频帧之间存在时间连续性
- **时间序列**：股票价格、气象数据等具有时间趋势
- **视频序列**：帧之间存在时空连续性

传统神经网络（如CNN）假设输入是独立的，无法处理序列数据中的依赖关系。RNN通过引入循环连接，使网络能够"记忆"历史信息。

### 1.2 RNN的基本思想

RNN的核心思想是在处理当前输入时，考虑之前的状态：

$$h_t = f(h_{t-1}, x_t)$$

其中：
- $h_t$ 是时刻t的隐藏状态
- $h_{t-1}$ 是上一时刻的隐藏状态
- $x_t$ 是时刻t的输入

这使得网络具备了处理序列依赖的能力。

```python
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
import matplotlib.pyplot as plt

# 手动实现简单RNN
class SimpleRNN:
    """手动实现的简单RNN"""
    def __init__(self, input_size, hidden_size, output_size):
        self.input_size = input_size
        self.hidden_size = hidden_size
        self.output_size = output_size
        
        # 初始化权重
        self.W_xh = np.random.randn(input_size, hidden_size) * 0.01
        self.W_hh = np.random.randn(hidden_size, hidden_size) * 0.01
        self.b_h = np.zeros(hidden_size)
        
        self.W_hy = np.random.randn(hidden_size, output_size) * 0.01
        self.b_y = np.zeros(output_size)
    
    def forward(self, x_sequence):
        """
        前向传播
        x_sequence: 输入序列，shape为(seq_len, input_size)
        """
        h = np.zeros(self.hidden_size)  # 初始隐藏状态
        hidden_states = []
        outputs = []
        
        for x in x_sequence:
            # 计算隐藏状态: h_t = tanh(W_xh * x_t + W_hh * h_{t-1} + b)
            h = np.tanh(np.dot(x, self.W_xh) + np.dot(h, self.W_hh) + self.b_h)
            hidden_states.append(h)
            
            # 计算输出: y_t = W_hy * h_t + b
            y = np.dot(h, self.W_hy) + self.b_y
            outputs.append(y)
        
        return hidden_states, outputs
    
    def predict(self, x_sequence):
        hidden_states, outputs = self.forward(x_sequence)
        return np.array(outputs)

# 创建示例序列数据
seq_len = 10
input_size = 3
hidden_size = 5
output_size = 2

# 生成随机输入序列
x_sequence = np.random.randn(seq_len, input_size)

# 创建RNN并运行
rnn_manual = SimpleRNN(input_size, hidden_size, output_size)
hidden_states, outputs = rnn_manual.forward(x_sequence)

print("手动实现RNN演示:")
print(f"输入序列形状: {x_sequence.shape}")
print(f"隐藏状态数量: {len(hidden_states)}")
print(f"隐藏状态形状: {hidden_states[0].shape}")
print(f"输出数量: {len(outputs)}")

# 可视化隐藏状态的演变
hidden_array = np.array(hidden_states)

plt.figure(figsize=(12, 6))
for i in range(hidden_size):
    plt.plot(range(seq_len), hidden_array[:, i], label=f'h{i}')

plt.xlabel('时间步')
plt.ylabel('隐藏状态值')
plt.title('RNN隐藏状态随时间变化')
plt.legend()
plt.grid(True)
plt.show()
```

## 二、RNN架构详解

### 2.1 标准RNN结构

标准RNN的数学表达式：

$$h_t = \tanh(W_{xh}x_t + W_{hh}h_{t-1} + b_h)$$
$$y_t = W_{hy}h_t + b_y$$

其中 $\tanh$ 是激活函数，用于控制隐藏状态的范围。

```python
# 使用PyTorch实现标准RNN
class PyTorchRNN(nn.Module):
    """PyTorch实现的简单RNN"""
    def __init__(self, input_size, hidden_size, output_size):
        super(PyTorchRNN, self).__init__()
        
        self.rnn = nn.RNN(
            input_size=input_size,
            hidden_size=hidden_size,
            batch_first=True
        )
        
        self.fc = nn.Linear(hidden_size, output_size)
    
    def forward(self, x, hidden=None):
        # RNN前向传播
        # output: 所有时间步的隐藏状态
        # hidden: 最后一个时间步的隐藏状态
        output, hidden = self.rnn(x, hidden)
        
        # 只使用最后一个时间步的输出做预测
        output = self.fc(output[:, -1, :])
        
        return output, hidden
    
    def predict_sequence(self, x, hidden=None):
        """预测整个序列"""
        output, hidden = self.rnn(x, hidden)
        output = self.fc(output)
        return output, hidden

# 创建模型
rnn_model = PyTorchRNN(input_size=3, hidden_size=16, output_size=2)

print("PyTorch RNN模型:")
print(rnn_model)

# 测试模型
batch_size = 4
seq_len = 10
input_size = 3

x_test = torch.randn(batch_size, seq_len, input_size)
output_test, hidden_test = rnn_model(x_test)

print(f"\n输入形状: {x_test.shape}")
print(f"输出形状: {output_test.shape}")
print(f"隐藏状态形状: {hidden_test.shape}")

# 预测整个序列
output_seq, hidden_seq = rnn_model.predict_sequence(x_test)
print(f"序列预测输出形状: {output_seq.shape}")
```

### 2.2 RNN的不同模式

RNN根据输入输出关系，可以分为几种模式：

```python
print("RNN的不同应用模式:")
print("="*50)

print("\n1. 一对一模式 (One-to-One):")
print("   输入: 单个向量")
print("   输出: 单个向量")
print("   应用: 传统分类问题")

print("\n2. 一对多模式 (One-to-Many):")
print("   输入: 单个向量")
print("   输出: 序列")
print("   应用: 图像描述生成")

print("\n3. 多对一模式 (Many-to-One):")
print("   输入: 序列")
print("   输出: 单个向量")
print("   应用: 文本分类、情感分析")

print("\n4. 多对多模式 (Many-to-Many):")
print("   输入: 序列")
print("   输出: 序列（可能不同长度）")
print("   应用: 机器翻译、序列标注")

# 实现不同模式的RNN
class OneToManyRNN(nn.Module):
    """一对多模式: 单个输入生成序列输出"""
    def __init__(self, input_size, hidden_size, output_size, output_len):
        super(OneToManyRNN, self).__init__()
        
        self.output_len = output_len
        self.hidden_size = hidden_size
        
        # 初始化隐藏状态的层
        self.init_hidden = nn.Linear(input_size, hidden_size)
        
        # RNN用于生成序列
        self.rnn = nn.RNN(output_size, hidden_size, batch_first=True)
        
        # 输出层
        self.fc = nn.Linear(hidden_size, output_size)
    
    def forward(self, x):
        batch_size = x.size(0)
        
        # 初始化隐藏状态
        hidden = torch.tanh(self.init_hidden(x)).unsqueeze(0)
        
        # 初始输入（可以是零向量或学习的参数）
        input_seq = torch.zeros(batch_size, 1, self.fc.out_features)
        
        outputs = []
        for i in range(self.output_len):
            output, hidden = self.rnn(input_seq, hidden)
            output = self.fc(output)
            outputs.append(output)
            input_seq = output  # 自回归
        
        return torch.cat(outputs, dim=1)

class ManyToOneRNN(nn.Module):
    """多对一模式: 序列输入产生单个输出"""
    def __init__(self, input_size, hidden_size, output_size):
        super(ManyToOneRNN, self).__init__()
        
        self.rnn = nn.RNN(input_size, hidden_size, batch_first=True)
        self.fc = nn.Linear(hidden_size, output_size)
    
    def forward(self, x):
        # 使用整个序列
        output, hidden = self.rnn(x)
        # 只取最后一个时间步
        return self.fc(hidden.squeeze(0))

class ManyToManyRNN(nn.Module):
    """多对多模式: 序列输入产生序列输出"""
    def __init__(self, input_size, hidden_size, output_size):
        super(ManyToManyRNN, self).__init__()
        
        self.rnn = nn.RNN(input_size, hidden_size, batch_first=True)
        self.fc = nn.Linear(hidden_size, output_size)
    
    def forward(self, x):
        output, hidden = self.rnn(x)
        # 对每个时间步进行预测
        output = self.fc(output)
        return output

# 演示不同模式
print("\n不同模式演示:")
many_to_one = ManyToOneRNN(3, 16, 2)
many_to_many = ManyToManyRNN(3, 16, 3)

x_seq = torch.randn(4, 10, 3)

output_one = many_to_one(x_seq)
output_many = many_to_many(x_seq)

print(f"多对一输出形状: {output_one.shape}")  # [4, 2]
print(f"多对多输出形状: {output_many.shape}")  # [4, 10, 3]
```

## 三、LSTM详解

### 3.1 LSTM原理

标准RNN存在梯度消失问题，难以学习长期依赖。LSTM（Long Short-Term Memory）通过门控机制解决了这个问题。

LSTM的核心组件：

1. **遗忘门（Forget Gate）**：决定丢弃多少历史信息
   $$f_t = \sigma(W_f \cdot [h_{t-1}, x_t] + b_f)$$

2. **输入门（Input Gate）**：决定接收多少新信息
   $$i_t = \sigma(W_i \cdot [h_{t-1}, x_t] + b_i)$$

3. **候选细胞状态**：计算新信息的候选值
   $$\tilde{C}_t = \tanh(W_C \cdot [h_{t-1}, x_t] + b_C)$$

4. **细胞状态更新**：
   $$C_t = f_t \cdot C_{t-1} + i_t \cdot \tilde{C}_t$$

5. **输出门（Output Gate）**：决定输出多少信息
   $$o_t = \sigma(W_o \cdot [h_{t-1}, x_t] + b_o)$$

6. **隐藏状态更新**：
   $$h_t = o_t \cdot \tanh(C_t)$$

```python
# 手动实现LSTM（理解原理）
class ManualLSTM:
    """手动实现LSTM用于理解原理"""
    def __init__(self, input_size, hidden_size):
        self.input_size = input_size
        self.hidden_size = hidden_size
        
        # 初始化权重
        concat_size = input_size + hidden_size
        
        # 遗忘门权重
        self.W_f = np.random.randn(concat_size, hidden_size) * 0.01
        self.b_f = np.ones(hidden_size)  # 初始偏置设为1
        
        # 输入门权重
        self.W_i = np.random.randn(concat_size, hidden_size) * 0.01
        self.b_i = np.zeros(hidden_size)
        
        # 候选细胞状态权重
        self.W_c = np.random.randn(concat_size, hidden_size) * 0.01
        self.b_c = np.zeros(hidden_size)
        
        # 输出门权重
        self.W_o = np.random.randn(concat_size, hidden_size) * 0.01
        self.b_o = np.zeros(hidden_size)
    
    def forward(self, x_sequence):
        seq_len = x_sequence.shape[0]
        
        h = np.zeros(self.hidden_size)
        c = np.zeros(self.hidden_size)
        
        hidden_states = []
        cell_states = []
        
        for x in x_sequence:
            concat = np.concatenate([h, x])
            
            # 遗忘门
            f = self.sigmoid(np.dot(concat, self.W_f) + self.b_f)
            
            # 输入门
            i = self.sigmoid(np.dot(concat, self.W_i) + self.b_i)
            
            # 候选细胞状态
            c_tilde = np.tanh(np.dot(concat, self.W_c) + self.b_c)
            
            # 更新细胞状态
            c = f * c + i * c_tilde
            
            # 输出门
            o = self.sigmoid(np.dot(concat, self.W_o) + self.b_o)
            
            # 更新隐藏状态
            h = o * np.tanh(c)
            
            hidden_states.append(h)
            cell_states.append(c)
        
        return hidden_states, cell_states
    
    def sigmoid(self, x):
        return 1 / (1 + np.exp(-x))

# 演示LSTM
x_sequence = np.random.randn(10, 3)
lstm_manual = ManualLSTM(3, 8)
h_states, c_states = lstm_manual.forward(x_sequence)

print("手动LSTM演示:")
print(f"隐藏状态演变:")
for i, h in enumerate(h_states[:5]):
    print(f"  t={i}: h={h[:3]}")

# 可视化
fig, axes = plt.subplots(1, 2, figsize=(12, 5))

h_array = np.array(h_states)
c_array = np.array(c_states)

axes[0].plot(h_array)
axes[0].set_xlabel('时间步')
axes[0].set_ylabel('隐藏状态值')
axes[0].set_title('LSTM隐藏状态')

axes[1].plot(c_array)
axes[1].set_xlabel('时间步')
axes[1].set_ylabel('细胞状态值')
axes[1].set_title('LSTM细胞状态')

plt.tight_layout()
plt.show()
```

### 3.2 PyTorch LSTM实现

```python
class PyTorchLSTM(nn.Module):
    """PyTorch LSTM实现"""
    def __init__(self, input_size, hidden_size, output_size, num_layers=1):
        super(PyTorchLSTM, self).__init__()
        
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        
        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=0 if num_layers == 1 else 0.2
        )
        
        self.fc = nn.Linear(hidden_size, output_size)
    
    def forward(self, x, hidden=None):
        # LSTM输出: (output, (h_n, c_n))
        output, (h_n, c_n) = self.lstm(x, hidden)
        
        # 使用最后一个时间步
        output = self.fc(output[:, -1, :])
        
        return output, (h_n, c_n)

# 创建LSTM模型
lstm_model = PyTorchLSTM(input_size=3, hidden_size=32, output_size=2, num_layers=2)

print("PyTorch LSTM模型:")
print(lstm_model)

# 测试
x_test_lstm = torch.randn(4, 10, 3)
output_lstm, (h_n, c_n) = lstm_model(x_test_lstm)

print(f"\n输入形状: {x_test_lstm.shape}")
print(f"输出形状: {output_lstm.shape}")
print(f"隐藏状态h_n形状: {h_n.shape}")  # [num_layers, batch, hidden]
print(f"细胞状态c_n形状: {c_n.shape}")

# 比较RNN和LSTM的参数量
rnn_single = nn.RNN(3, 32, batch_first=True)
lstm_single = nn.LSTM(3, 32, batch_first=True)

rnn_params = sum(p.numel() for p in rnn_single.parameters())
lstm_params = sum(p.numel() for p in lstm_single.parameters())

print(f"\n参数量比较:")
print(f"RNN(3->32): {rnn_params} 参数")
print(f"LSTM(3->32): {lstm_params} 参数")
print(f"LSTM参数量约为RNN的4倍（因为有4个门）")
```

## 四、GRU详解

### 4.1 GRU原理

GRU（Gated Recurrent Unit）是LSTM的简化版本，参数量更少，计算效率更高。

GRU的核心组件：

1. **更新门（Update Gate）**：决定保留多少历史信息
   $$z_t = \sigma(W_z \cdot [h_{t-1}, x_t])$$

2. **重置门（Reset Gate）**：决定遗忘多少历史信息
   $$r_t = \sigma(W_r \cdot [h_{t-1}, x_t])$$

3. **候选隐藏状态**：
   $$\tilde{h}_t = \tanh(W \cdot [r_t \cdot h_{t-1}, x_t])$$

4. **隐藏状态更新**：
   $$h_t = (1 - z_t) \cdot h_{t-1} + z_t \cdot \tilde{h}_t$$

```python
class PyTorchGRU(nn.Module):
    """PyTorch GRU实现"""
    def __init__(self, input_size, hidden_size, output_size, num_layers=1):
        super(PyTorchGRU, self).__init__()
        
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        
        self.gru = nn.GRU(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True
        )
        
        self.fc = nn.Linear(hidden_size, output_size)
    
    def forward(self, x, hidden=None):
        output, h_n = self.gru(x, hidden)
        output = self.fc(output[:, -1, :])
        return output, h_n

# 创建GRU模型
gru_model = PyTorchGRU(input_size=3, hidden_size=32, output_size=2)

print("PyTorch GRU模型:")
print(gru_model)

# 参数量比较
gru_single = nn.GRU(3, 32, batch_first=True)
gru_params = sum(p.numel() for p in gru_single.parameters())

print(f"\n参数量比较:")
print(f"RNN(3->32): {rnn_params} 参数")
print(f"LSTM(3->32): {lstm_params} 参数")
print(f"GRU(3->32): {gru_params} 参数")

print("\n总结:")
print("- LSTM最复杂，适合需要长期记忆的任务")
print("- GRU较简单，训练更快，适合中等复杂度任务")
print("- RNN最简单，适合短序列任务")
```

### 4.2 RNN、LSTM、GRU比较

```python
# 比较三种模型在长序列上的表现
seq_lengths = [20, 50, 100, 200]

def create_model(model_type, input_size, hidden_size, output_size):
    if model_type == 'RNN':
        return PyTorchRNN(input_size, hidden_size, output_size)
    elif model_type == 'LSTM':
        return PyTorchLSTM(input_size, hidden_size, output_size)
    elif model_type == 'GRU':
        return PyTorchGRU(input_size, hidden_size, output_size)

def train_model(model, x_data, y_data, epochs=100):
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=0.01)
    
    losses = []
    for epoch in range(epochs):
        optimizer.zero_grad()
        output, _ = model(x_data)
        loss = criterion(output, y_data)
        loss.backward()
        optimizer.step()
        losses.append(loss.item())
    
    return losses

# 创建模拟数据
input_size = 3
hidden_size = 16
output_size = 1

# 比较训练效果
results = {}

for seq_len in seq_lengths:
    x_data = torch.randn(32, seq_len, input_size)
    y_data = torch.randn(32, output_size)
    
    models = {
        'RNN': PyTorchRNN(input_size, hidden_size, output_size),
        'LSTM': PyTorchLSTM(input_size, hidden_size, output_size),
        'GRU': PyTorchGRU(input_size, hidden_size, output_size)
    }
    
    seq_results = {}
    for name, model in models.items():
        losses = train_model(model, x_data, y_data, epochs=50)
        seq_results[name] = losses
    
    results[seq_len] = seq_results

# 可视化比较
fig, axes = plt.subplots(2, 2, figsize=(14, 10))

for i, seq_len in enumerate(seq_lengths):
    ax = axes[i//2, i%2]
    for name in ['RNN', 'LSTM', 'GRU']:
        ax.plot(results[seq_len][name], label=name)
    
    ax.set_xlabel('Epoch')
    ax.set_ylabel('Loss')
    ax.set_title(f'序列长度={seq_len}')
    ax.legend()
    ax.grid(True)

plt.suptitle('RNN、LSTM、GRU在不同序列长度下的训练效果')
plt.tight_layout()
plt.show()

print("\n观察结论:")
print("短序列(20): 三者差异不大")
print("中等序列(50-100): LSTM和GRU优于RNN")
print("长序列(200): LSTM表现最好，GRU次之，RNN可能梯度消失")
```

## 五、双向RNN

### 5.1 BiRNN原理

双向RNN同时考虑正向和反向的序列信息：

$$\overrightarrow{h_t} = f(\overrightarrow{h_{t-1}}, x_t)$$
$$\overleftarrow{h_t} = f(\overleftarrow{h_{t+1}}, x_t)$$
$$h_t = [\overrightarrow{h_t}, \overleftarrow{h_t}]$$

```python
class BiLSTM(nn.Module):
    """双向LSTM"""
    def __init__(self, input_size, hidden_size, output_size):
        super(BiLSTM, self).__init__()
        
        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            batch_first=True,
            bidirectional=True
        )
        
        # 双向LSTM输出维度是hidden_size * 2
        self.fc = nn.Linear(hidden_size * 2, output_size)
    
    def forward(self, x):
        output, (h_n, c_n) = self.lstm(x)
        
        # 合并正向和反向的最后隐藏状态
        # h_n形状: [2, batch, hidden_size]
        h_concat = torch.cat([h_n[0], h_n[1]], dim=1)
        
        output = self.fc(h_concat)
        return output

# 创建双向LSTM
bi_lstm = BiLSTM(input_size=3, hidden_size=16, output_size=2)

print("双向LSTM模型:")
print(bi_lstm)

# 测试
x_test_bi = torch.randn(4, 10, 3)
output_bi = bi_lstm(x_test_bi)

print(f"\n输入形状: {x_test_bi.shape}")
print(f"输出形状: {output_bi.shape}")

# 参数量比较
uni_lstm = nn.LSTM(3, 16, batch_first=True)
bi_lstm_layer = nn.LSTM(3, 16, batch_first=True, bidirectional=True)

print(f"\n参数量:")
print(f"单向LSTM: {sum(p.numel() for p in uni_lstm.parameters())}")
print(f"双向LSTM: {sum(p.numel() for p in bi_lstm_layer.parameters())}")
print(f"双向约为单向的2倍")

print("\n双向RNN的应用场景:")
print("- 文本分类：考虑整个句子的上下文")
print("- 序列标注：NER、POS tagging等")
print("- 机器翻译：编码端通常使用双向")
```

## 六、序列预测实战

### 6.1 时间序列预测

```python
# 生成模拟时间序列数据
def generate_time_series(n_samples, seq_length, period=10):
    """生成周期性时间序列"""
    t = np.linspace(0, n_samples * seq_length / period, n_samples * seq_length)
    series = np.sin(t) + 0.1 * np.random.randn(n_samples * seq_length)
    series = series.reshape(n_samples, seq_length)
    return series

# 生成数据
n_samples = 1000
seq_length = 50

time_series_data = generate_time_series(n_samples, seq_length)

# 划分训练测试集
train_size = int(0.8 * n_samples)
train_data = time_series_data[:train_size]
test_data = time_series_data[train_size:]

# 创建数据集：用前seq_length-1预测最后一个值
class TimeSeriesDataset(torch.utils.data.Dataset):
    def __init__(self, data, seq_length):
        self.data = torch.FloatTensor(data)
        self.seq_length = seq_length
    
    def __len__(self):
        return len(self.data)
    
    def __getitem__(self, idx):
        # 输入: 前seq_length-1个点
        # 输出: 最后一个点
        x = self.data[idx, :-1].unsqueeze(-1)  # 添加特征维度
        y = self.data[idx, -1]
        return x, y

train_dataset_ts = TimeSeriesDataset(train_data, seq_length)
test_dataset_ts = TimeSeriesDataset(test_data, seq_length)

train_loader_ts = torch.utils.data.DataLoader(train_dataset_ts, batch_size=32, shuffle=True)
test_loader_ts = torch.utils.data.DataLoader(test_dataset_ts, batch_size=32, shuffle=False)

# 定义时间序列预测模型
class TimeSeriesPredictor(nn.Module):
    def __init__(self, input_size=1, hidden_size=64, num_layers=2):
        super(TimeSeriesPredictor, self).__init__()
        
        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=0.1
        )
        
        self.fc = nn.Linear(hidden_size, 1)
    
    def forward(self, x):
        output, _ = self.lstm(x)
        output = self.fc(output[:, -1, :])
        return output

# 训练模型
ts_model = TimeSeriesPredictor()
criterion_ts = nn.MSELoss()
optimizer_ts = optim.Adam(ts_model.parameters(), lr=0.001)

print("时间序列预测训练:")
train_losses = []

for epoch in range(30):
    epoch_loss = 0
    for x, y in train_loader_ts:
        optimizer_ts.zero_grad()
        output = ts_model(x)
        loss = criterion_ts(output.squeeze(), y)
        loss.backward()
        optimizer_ts.step()
        epoch_loss += loss.item()
    
    avg_loss = epoch_loss / len(train_loader_ts)
    train_losses.append(avg_loss)
    
    if (epoch + 1) % 10 == 0:
        print(f"Epoch {epoch+1}: Loss={avg_loss:.4f}")

# 可视化训练损失
plt.figure(figsize=(10, 5))
plt.plot(train_losses)
plt.xlabel('Epoch')
plt.ylabel('MSE Loss')
plt.title('时间序列预测训练损失')
plt.grid(True)
plt.show()

# 测试预测
ts_model.eval()
test_predictions = []
test_targets = []

with torch.no_grad():
    for x, y in test_loader_ts:
        output = ts_model(x)
        test_predictions.extend(output.squeeze().numpy())
        test_targets.extend(y.numpy())

# 可视化预测结果
fig, axes = plt.subplots(2, 1, figsize=(12, 8))

axes[0].plot(test_targets[:100], label='真实值')
axes[0].plot(test_predictions[:100], label='预测值')
axes[0].set_xlabel('样本')
axes[0].set_ylabel('值')
axes[0].set_title('时间序列预测结果（前100个测试样本）')
axes[0].legend()
axes[0].grid(True)

axes[1].scatter(test_targets, test_predictions, alpha=0.5)
min_val = min(min(test_targets), min(test_predictions))
max_val = max(max(test_targets), max(test_predictions))
axes[1].plot([min_val, max_val], [min_val, max_val], 'r--', label='理想预测')
axes[1].set_xlabel('真实值')
axes[1].set_ylabel('预测值')
axes[1].set_title('预测值 vs 真实值')
axes[1].legend()
axes[1].grid(True)

plt.tight_layout()
plt.show()

# 计算MSE
mse_test = np.mean((np.array(test_targets) - np.array(test_predictions))**2)
print(f"\n测试集MSE: {mse_test:.4f}")
```

### 6.2 文本情感分类

```python
print("="*50)
print("文本情感分类示例（简化版）")
print("="*50)

# 创建模拟文本数据（单词索引序列）
vocab_size = 1000
embedding_dim = 50
max_seq_length = 20
num_classes = 2  # 正面/负面

# 生成模拟数据
n_text_samples = 500
text_data = torch.randint(0, vocab_size, (n_text_samples, max_seq_length))
labels = torch.randint(0, 2, (n_text_samples,))

train_text = text_data[:400]
train_labels = labels[:400]
test_text = text_data[400:]
test_labels = labels[400:]

# 定义文本分类模型
class TextClassifier(nn.Module):
    def __init__(self, vocab_size, embedding_dim, hidden_size, num_classes):
        super(TextClassifier, self).__init__()
        
        # 嵌入层
        self.embedding = nn.Embedding(vocab_size, embedding_dim)
        
        # LSTM层
        self.lstm = nn.LSTM(
            input_size=embedding_dim,
            hidden_size=hidden_size,
            batch_first=True,
            bidirectional=True
        )
        
        # 分类层
        self.fc = nn.Linear(hidden_size * 2, num_classes)
        
        # Dropout
        self.dropout = nn.Dropout(0.3)
    
    def forward(self, x):
        # 嵌入
        embedded = self.embedding(x)  # [batch, seq_len, embedding_dim]
        
        # LSTM
        output, (h_n, c_n) = self.lstm(embedded)
        
        # 合并双向输出
        h_concat = torch.cat([h_n[0], h_n[1]], dim=1)
        
        # Dropout + 分类
        h_concat = self.dropout(h_concat)
        output = self.fc(h_concat)
        
        return output

# 创建模型
text_model = TextClassifier(vocab_size, embedding_dim, hidden_size=64, num_classes=2)

print("文本分类模型:")
print(text_model)

# 计算参数量
print(f"\n嵌入层参数: {vocab_size * embedding_dim}")
print(f"LSTM参数: {sum(p.numel() for p in text_model.lstm.parameters())}")
print(f"总参数: {sum(p.numel() for p in text_model.parameters())}")

# 训练
criterion_text = nn.CrossEntropyLoss()
optimizer_text = optim.Adam(text_model.parameters(), lr=0.001)

train_dataset_text = torch.utils.data.TensorDataset(train_text, train_labels)
train_loader_text = torch.utils.data.DataLoader(train_dataset_text, batch_size=32, shuffle=True)

print("\n开始训练:")
for epoch in range(20):
    epoch_loss = 0
    correct = 0
    total = 0
    
    for x, y in train_loader_text:
        optimizer_text.zero_grad()
        output = text_model(x)
        loss = criterion_text(output, y)
        loss.backward()
        optimizer_text.step()
        
        epoch_loss += loss.item()
        _, predicted = torch.max(output, 1)
        correct += (predicted == y).sum().item()
        total += y.size(0)
    
    if (epoch + 1) % 5 == 0:
        accuracy = correct / total
        print(f"Epoch {epoch+1}: Loss={epoch_loss/len(train_loader_text):.4f}, Acc={accuracy:.4f}")

# 测试
text_model.eval()
with torch.no_grad():
    test_output = text_model(test_text)
    _, test_pred = torch.max(test_output, 1)
    test_acc = (test_pred == test_labels).float().mean().item()

print(f"\n测试准确率: {test_acc:.4f}")
```

## 七、RNN最佳实践

### 6.1 训练技巧

```python
print("RNN训练最佳实践:")
print("="*50)

print("\n1. 序列处理技巧:")
print("   - 使用pack_padded_sequence处理变长序列")
print("   - 按序列长度排序提高效率")

# 演示pack_padded_sequence
from torch.nn.utils.rnn import pack_padded_sequence, pad_packed_sequence

# 创建变长序列
sequences = [
    torch.randn(5, 3),   # 长度5
    torch.randn(8, 3),   # 长度8
    torch.randn(3, 3),   # 长度3
]

lengths = [5, 8, 3]

# 填充到相同长度
max_len = max(lengths)
padded_seqs = torch.zeros(len(sequences), max_len, 3)
for i, seq in enumerate(sequences):
    padded_seqs[i, :len(seq)] = seq

print("\n填充后的序列:")
print(f"形状: {padded_seqs.shape}")

# 按长度排序（降序）
sorted_lengths = sorted(lengths, reverse=True)
sorted_indices = sorted(range(len(lengths)), key=lambda i: lengths[i], reverse=True)
sorted_seqs = padded_seqs[sorted_indices]

# 打包
packed = pack_padded_sequence(sorted_seqs, sorted_lengths, batch_first=True)

print(f"\n打包后的序列:")
print(f"Packed对象包含数据和批次尺寸信息")

# LSTM处理
lstm_pack = nn.LSTM(3, 16, batch_first=True)
packed_output, (h_n, c_n) = lstm_pack(packed)

# 解包
unpacked, unpacked_lengths = pad_packed_sequence(packed_output, batch_first=True)

print(f"\n解包后的输出:")
print(f"形状: {unpacked.shape}")

print("\n2. 权重初始化:")
print("   - LSTM/GRU偏置初始化为1有助于记忆")
print("   - 使用适当范围的随机权重")

print("\n3. 学习率设置:")
print("   - RNN训练较慢，建议较小学习率")
print("   - 可使用学习率预热")

print("\n4. 梯度裁剪:")
print("   - 防止梯度爆炸")
print("   - 常用clip_norm设为5或10")

# 演示梯度裁剪
model_clip = PyTorchLSTM(3, 16, 2)
optimizer_clip = optim.Adam(model_clip.parameters(), lr=0.01)

x_clip = torch.randn(4, 10, 3)
y_clip = torch.randn(4, 2)

output_clip, _ = model_clip(x_clip)
loss_clip = nn.MSELoss()(output_clip, y_clip)
loss_clip.backward()

print(f"\n梯度裁剪前:")
max_grad = 0
for p in model_clip.parameters():
    if p.grad is not None:
        max_grad = max(max_grad, p.grad.abs().max().item())
print(f"最大梯度值: {max_grad:.4f}")

# 梯度裁剪
torch.nn.utils.clip_grad_norm_(model_clip.parameters(), max_norm=5.0)

print("\n梯度裁剪后:")
max_grad_after = 0
for p in model_clip.parameters():
    if p.grad is not None:
        max_grad_after = max(max_grad_after, p.grad.abs().max().item())
print(f"最大梯度值: {max_grad_after:.4f}")
```

## 八、总结

本文系统介绍了循环神经网络的原理与应用：

1. **RNN基础**：序列建模的核心思想，处理时间依赖
2. **LSTM**：门控机制解决长期依赖和梯度消失问题
3. **GRU**：简化版门控网络，计算效率更高
4. **双向RNN**：同时考虑正向和反向信息
5. **实战应用**：时间序列预测、文本分类

关键要点：

- LSTM通过三个门控制信息流，适合长期依赖任务
- GRU简化为两个门，参数更少，训练更快
- 双向RNN适用于需要完整上下文的任务
- 梯度裁剪防止梯度爆炸
- pack_padded_sequence提高变长序列处理效率

RNN是序列建模的基础，理解其原理对于学习Transformer、注意力机制等现代架构至关重要。在实际应用中，建议根据任务复杂度和序列长度选择合适的RNN变体。
