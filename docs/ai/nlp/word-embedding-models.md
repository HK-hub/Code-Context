---
title: 词向量模型详解：从Word2Vec到FastText
date: 2025-02-15T00:00:00.000Z
categories:
  - ai
  - nlp
tags:
  - 词向量
  - Word2Vec
  - FastText
  - GloVe
  - 嵌入表示
description: 深入解析词向量模型的原理与实现，包括Word2Vec的CBOW和Skip-gram模型、GloVe全局向量、FastText子词嵌入
author: HK意境
---

# 词向量模型详解：从Word2Vec到FastText

词向量是将词汇映射到连续向量空间的技术，是现代NLP的基础。本文将深入讲解主流词向量模型的原理与应用。

## 一、词向量概述

### 1.1 词向量的发展历程

传统文本表示方法：
- **One-Hot编码**：每个词对应一个独热向量，维度等于词汇表大小
- **问题**：维度爆炸、无法表达词义关系、稀疏性

分布式假设："一个词的含义由它周围的词决定"——这是词向量的理论基础。

词向量的优势：
1. **低维稠密**：通常100-300维，计算高效
2. **语义相似**：相似词在向量空间距离近
3. **可计算**：支持向量运算发现词义关系

### 1.2 词向量的直观理解

```python
import numpy as np
from collections import Counter
import matplotlib.pyplot as plt

# 词向量的几何意义
def visualize_word_vectors():
    """可视化词向量空间"""
    # 模拟词向量（实际应由模型训练得到）
    word_vectors = {
        '国王': np.array([0.8, 0.9]),
        '王后': np.array([0.7, 0.8]),
        '男人': np.array([0.9, 0.3]),
        '女人': np.array([0.8, 0.2]),
        '苹果': np.array([0.2, 0.5]),
        '香蕉': np.array([0.3, 0.4]),
    }
    
    plt.figure(figsize=(10, 8))
    
    for word, vec in word_vectors.items():
        plt.scatter(vec[0], vec[1], s=100)
        plt.annotate(word, (vec[0], vec[1]), fontsize=12,
                     xytext=(5, 5), textcoords='offset points')
    
    plt.xlabel('维度1')
    plt.ylabel('维度2')
    plt.title('词向量空间可视化（简化）')
    plt.grid(True, alpha=0.3)
    plt.show()
    
    return word_vectors

word_vecs = visualize_word_vectors()

# 经典的词向量运算
def cosine_similarity(v1, v2):
    """计算余弦相似度"""
    return np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))

print("词向量语义关系:")
print(f"国王 与 王后 相似度: {cosine_similarity(word_vecs['国王'], word_vecs['王后']):.4f}")
print(f"苹果 与 香蕉 相似度: {cosine_similarity(word_vecs['苹果'], word_vecs['香蕉']):.4f}")
print(f"国王 与 苹果 相似度: {cosine_similarity(word_vecs['国王'], word_vecs['苹果']):.4f}")

print("\n经典词向量运算: 国王 - 男人 + 女人 ≈ 王后")
result = word_vecs['国王'] - word_vecs['男人'] + word_vecs['女人']
print(f"结果向量: {result}")
print(f"与王后的相似度: {cosine_similarity(result, word_vecs['王后']):.4f}")
```

## 二、Word2Vec模型

### 2.1 CBOW模型

连续词袋模型（Continuous Bag of Words）通过上下文预测目标词：

给定上下文词 $w_{t-2}, w_{t-1}, w_{t+1}, w_{t+2}$，预测中心词 $w_t$。

```python
class SimpleCBOW:
    """简化的CBOW模型实现"""
    
    def __init__(self, vocab_size, embedding_dim):
        self.vocab_size = vocab_size
        self.embedding_dim = embedding_dim
        
        # 初始化词向量矩阵
        np.random.seed(42)
        self.W_in = np.random.randn(vocab_size, embedding_dim) * 0.01
        self.W_out = np.random.randn(embedding_dim, vocab_size) * 0.01
    
    def forward(self, context_indices):
        """前向传播"""
        # 获取上下文词向量
        context_vectors = self.W_in[context_indices]
        
        # 取平均
        hidden = np.mean(context_vectors, axis=0)
        
        # 输出层
        output = np.dot(hidden, self.W_out)
        
        # Softmax
        exp_output = np.exp(output - np.max(output))
        probs = exp_output / exp_output.sum()
        
        return hidden, probs
    
    def backward(self, context_indices, target_idx, lr=0.01):
        """反向传播更新参数"""
        hidden, probs = self.forward(context_indices)
        
        # 计算梯度
        grad_out = probs.copy()
        grad_out[target_idx] -= 1
        
        # 更新输出权重
        grad_W_out = np.outer(hidden, grad_out)
        self.W_out -= lr * grad_W_out
        
        # 更新输入权重
        grad_hidden = np.dot(self.W_out, grad_out)
        for idx in context_indices:
            self.W_in[idx] -= lr * grad_hidden / len(context_indices)
        
        return -np.log(probs[target_idx] + 1e-10)

# 演示CBOW
vocab_example = ['自然', '语言', '处理', '深度', '学习', '人工', '智能']
vocab_size = len(vocab_example)
word_to_idx = {w: i for i, w in enumerate(vocab_example)}

cbow = SimpleCBOW(vocab_size, embedding_dim=10)

# 训练数据: 上下文 -> 目标词
training_data = [
    (['自然', '处理'], '语言'),  # 自然 [语言] 处理
    (['语言', '深度'], '处理'),  # 语言 [处理] 深度
    (['处理', '学习'], '深度'),  # 处理 [深度] 学习
    (['深度', '智能'], '学习'),  # 深度 [学习] 智能
]

print("CBOW模型训练演示:")
losses = []
for epoch in range(100):
    epoch_loss = 0
    for context, target in training_data:
        context_idx = [word_to_idx[w] for w in context]
        target_idx = word_to_idx[target]
        loss = cbow.backward(context_idx, target_idx, lr=0.1)
        epoch_loss += loss
    losses.append(epoch_loss / len(training_data))
    
    if (epoch + 1) % 20 == 0:
        print(f"Epoch {epoch+1}, Loss: {losses[-1]:.4f}")

# 测试
context_test = [word_to_idx['自然'], word_to_idx['处理']]
hidden, probs = cbow.forward(context_test)
predicted_idx = np.argmax(probs)
print(f"\n测试: 上下文['自然', '处理'] -> 预测: {vocab_example[predicted_idx]}")
```

### 2.2 Skip-gram模型

Skip-gram通过中心词预测上下文，与CBOW相反：

给定中心词 $w_t$，预测上下文词 $w_{t-2}, w_{t-1}, w_{t+1}, w_{t+2}$。

```python
class SimpleSkipGram:
    """简化的Skip-gram模型实现"""
    
    def __init__(self, vocab_size, embedding_dim):
        self.vocab_size = vocab_size
        self.embedding_dim = embedding_dim
        
        np.random.seed(42)
        self.W_in = np.random.randn(vocab_size, embedding_dim) * 0.01
        self.W_out = np.random.randn(embedding_dim, vocab_size) * 0.01
    
    def forward(self, center_idx):
        """前向传播"""
        hidden = self.W_in[center_idx]
        output = np.dot(hidden, self.W_out)
        
        exp_output = np.exp(output - np.max(output))
        probs = exp_output / exp_output.sum()
        
        return hidden, probs
    
    def train_step(self, center_idx, context_idx, lr=0.01):
        """单个训练步骤"""
        hidden, probs = self.forward(center_idx)
        
        loss = -np.log(probs[context_idx] + 1e-10)
        
        grad_out = probs.copy()
        grad_out[context_idx] -= 1
        
        self.W_out -= lr * np.outer(hidden, grad_out)
        
        grad_hidden = np.dot(self.W_out, grad_out)
        self.W_in[center_idx] -= lr * grad_hidden
        
        return loss

# 训练Skip-gram
skipgram = SimpleSkipGram(vocab_size, embedding_dim=10)

print("\nSkip-gram模型训练演示:")
skip_losses = []

for epoch in range(100):
    epoch_loss = 0
    count = 0
    for context, target in training_data:
        center_idx = word_to_idx[target]
        for ctx_word in context:
            context_idx = word_to_idx[ctx_word]
            loss = skipgram.train_step(center_idx, context_idx, lr=0.1)
            epoch_loss += loss
            count += 1
    skip_losses.append(epoch_loss / count)
    
    if (epoch + 1) % 20 == 0:
        print(f"Epoch {epoch+1}, Loss: {skip_losses[-1]:.4f}")

# 比较两个模型
plt.figure(figsize=(10, 5))
plt.plot(losses, label='CBOW')
plt.plot(skip_losses, label='Skip-gram')
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.title('CBOW vs Skip-gram 训练损失')
plt.legend()
plt.grid(True)
plt.show()

print("\nCBOW vs Skip-gram 比较:")
print("CBOW: 上下文 -> 中心词，训练快，适合大数据")
print("Skip-gram: 中心词 -> 上下文，对生僻词效果好，适合小数据")
```

### 2.3 负采样优化

```python
class NegativeSampling:
    """负采样实现"""
    
    def __init__(self, vocab_size, embedding_dim, num_negative=5):
        self.vocab_size = vocab_size
        self.embedding_dim = embedding_dim
        self.num_negative = num_negative
        
        np.random.seed(42)
        self.W_in = np.random.randn(vocab_size, embedding_dim) * 0.01
        self.W_out = np.random.randn(vocab_size, embedding_dim) * 0.01
    
    def sigmoid(self, x):
        return 1 / (1 + np.exp(-np.clip(x, -500, 500)))
    
    def sample_negatives(self, exclude_idx):
        """采样负样本"""
        negatives = []
        while len(negatives) < self.num_negative:
            idx = np.random.randint(self.vocab_size)
            if idx != exclude_idx:
                negatives.append(idx)
        return negatives
    
    def train_step(self, center_idx, context_idx, lr=0.01):
        """使用负采样的训练步骤"""
        center_vec = self.W_in[center_idx]
        
        # 正样本
        context_vec = self.W_out[context_idx]
        score = np.dot(center_vec, context_vec)
        loss = -np.log(self.sigmoid(score) + 1e-10)
        
        grad_context = (self.sigmoid(score) - 1) * center_vec
        grad_center = (self.sigmoid(score) - 1) * context_vec
        
        self.W_out[context_idx] -= lr * grad_context
        
        # 负样本
        negatives = self.sample_negatives(context_idx)
        for neg_idx in negatives:
            neg_vec = self.W_out[neg_idx]
            score = np.dot(center_vec, neg_vec)
            loss -= np.log(self.sigmoid(-score) + 1e-10)
            
            grad_neg = self.sigmoid(score) * center_vec
            grad_center += self.sigmoid(score) * neg_vec
            
            self.W_out[neg_idx] -= lr * grad_neg
        
        self.W_in[center_idx] -= lr * grad_center
        
        return loss

print("\n负采样优化:")
print("原始Softmax: 计算量O(V)，V为词汇表大小")
print("负采样: 计算量O(k)，k为负样本数")
print("典型k=5，大幅降低计算量")
```

## 三、GloVe模型

### 3.1 GloVe原理

GloVe（Global Vectors）结合了全局统计信息和局部上下文信息。

核心思想：词向量应该编码词共现概率的比值：

$$F(w_i, w_j, \tilde{w}_k) = \frac{P_{ik}}{P_{jk}}$$

其中 $P_{ik} = \frac{X_{ik}}{X_i}$ 是词 $i$ 和词 $k$ 的共现概率。

```python
class SimpleGloVe:
    """简化的GloVe模型实现"""
    
    def __init__(self, vocab_size, embedding_dim):
        self.vocab_size = vocab_size
        self.embedding_dim = embedding_dim
        
        np.random.seed(42)
        self.W = np.random.randn(vocab_size, embedding_dim) * 0.01
        self.W_tilde = np.random.randn(vocab_size, embedding_dim) * 0.01
        self.b = np.zeros(vocab_size)
        self.b_tilde = np.zeros(vocab_size)
    
    def compute_cooccurrence(self, corpus, window_size=2):
        """计算共现矩阵"""
        cooccur = np.zeros((self.vocab_size, self.vocab_size))
        
        for i, center_idx in enumerate(corpus):
            start = max(0, i - window_size)
            end = min(len(corpus), i + window_size + 1)
            
            for j in range(start, end):
                if i != j:
                    distance = abs(i - j)
                    cooccur[center_idx, corpus[j]] += 1.0 / distance
        
        return cooccur
    
    def train(self, cooccur, epochs=100, lr=0.01, x_max=100, alpha=0.75):
        """训练GloVe"""
        nonzero = np.nonzero(cooccur)
        
        for epoch in range(epochs):
            total_loss = 0
            
            for i, j in zip(nonzero[0], nonzero[1]):
                x_ij = cooccur[i, j]
                
                # 权重函数
                if x_ij < x_max:
                    weight = (x_ij / x_max) ** alpha
                else:
                    weight = 1.0
                
                # 计算损失
                diff = np.dot(self.W[i], self.W_tilde[j]) + self.b[i] + self.b_tilde[j] - np.log(x_ij)
                loss = weight * diff ** 2
                total_loss += loss
                
                # 更新参数
                grad_W = weight * diff * self.W_tilde[j]
                grad_W_tilde = weight * diff * self.W[i]
                grad_b = weight * diff
                grad_b_tilde = weight * diff
                
                self.W[i] -= lr * grad_W
                self.W_tilde[j] -= lr * grad_W_tilde
                self.b[i] -= lr * grad_b
                self.b_tilde[j] -= lr * grad_b_tilde
            
            if (epoch + 1) % 20 == 0:
                print(f"Epoch {epoch+1}, Loss: {total_loss:.4f}")
    
    def get_embeddings(self):
        """获取最终词向量"""
        return self.W + self.W_tilde

# 演示GloVe
glove = SimpleGloVe(vocab_size, embedding_dim=10)

# 构建语料
corpus_example = []
for context, target in training_data:
    corpus_example.append(word_to_idx[context[0]])
    corpus_example.append(word_to_idx[target])
    corpus_example.append(word_to_idx[context[1]])

cooccur_matrix = glove.compute_cooccurrence(corpus_example)

print("\nGloVe模型训练:")
glove.train(cooccur_matrix, epochs=100, lr=0.1)

embeddings = glove.get_embeddings()
print(f"\n词向量形状: {embeddings.shape}")
```

## 四、FastText模型

### 4.1 子词嵌入原理

FastText在Word2Vec基础上引入子词（subword）嵌入，解决了未登录词（OOV）问题。

核心思想：将词分解为字符n-gram，词向量是其所有n-gram向量的和。

```python
class SimpleFastText:
    """简化的FastText模型实现"""
    
    def __init__(self, vocab, embedding_dim, min_n=3, max_n=6):
        self.vocab = vocab
        self.embedding_dim = embedding_dim
        self.min_n = min_n
        self.max_n = max_n
        
        # 构建子词词汇表
        self.subword_to_idx = {}
        idx = 0
        
        # 添加边界标记
        for word in vocab:
            word_with_bounds = '<' + word + '>'
            ngrams = self._get_ngrams(word_with_bounds)
            for ngram in ngrams:
                if ngram not in self.subword_to_idx:
                    self.subword_to_idx[ngram] = idx
                    idx += 1
            # 添加完整词
            if word not in self.subword_to_idx:
                self.subword_to_idx[word] = idx
                idx += 1
        
        self.num_subwords = len(self.subword_to_idx)
        
        np.random.seed(42)
        self.embeddings = np.random.randn(self.num_subwords, embedding_dim) * 0.01
    
    def _get_ngrams(self, word):
        """获取词的n-gram"""
        ngrams = []
        for n in range(self.min_n, self.max_n + 1):
            for i in range(len(word) - n + 1):
                ngrams.append(word[i:i+n])
        return ngrams
    
    def get_word_vector(self, word):
        """获取词向量"""
        word_with_bounds = '<' + word + '>'
        ngrams = self._get_ngrams(word_with_bounds)
        
        # 获取子词索引
        indices = []
        for ngram in ngrams:
            if ngram in self.subword_to_idx:
                indices.append(self.subword_to_idx[ngram])
        if word in self.subword_to_idx:
            indices.append(self.subword_to_idx[word])
        
        if not indices:
            return np.zeros(self.embedding_dim)
        
        return np.mean(self.embeddings[indices], axis=0)
    
    def get_oov_vector(self, oov_word):
        """处理未登录词"""
        return self.get_word_vector(oov_word)

# 演示FastText
fasttext_vocab = ['自然', '语言', '处理', '智能', '学习']
fasttext = SimpleFastText(fasttext_vocab, embedding_dim=10)

print("\nFastText子词嵌入:")
print(f"词汇表大小: {len(fasttext_vocab)}")
print(f"子词表大小: {fasttext.num_subwords}")

# 测试未登录词
oov_word = '自然语言'
oov_vector = fasttext.get_oov_vector(oov_word)
print(f"\n未登录词 '{oov_word}' 的向量: {oov_vector[:5]}...")

print("\nFastText优势:")
print("1. 处理未登录词(OOV): 通过子词组合")
print("2. 捕获形态信息: 相似形态的词有相似向量")
print("3. 更好的小数据表现: 子词提供额外信息")
```

### 4.2 模型比较与应用

```python
# 综合比较各种词向量模型
def compare_models():
    """比较不同词向量模型"""
    comparison = {
        'Word2Vec-CBOW': {
            '优点': ['训练速度快', '适合大数据', '实现简单'],
            '缺点': ['对生僻词效果差', '忽略词序'],
            '适用场景': '大规模语料、通用任务'
        },
        'Word2Vec-Skip-gram': {
            '优点': ['对生僻词效果好', '语义关系更准确'],
            '缺点': ['训练较慢', '需要更多数据'],
            '适用场景': '小规模语料、精确语义任务'
        },
        'GloVe': {
            '优点': ['利用全局统计', '训练效率高', '语义关系好'],
            '缺点': ['需要构建共现矩阵', '内存消耗大'],
            '适用场景': '中等规模语料、关系推理任务'
        },
        'FastText': {
            '优点': ['处理OOV', '捕获形态信息', '支持子词'],
            '缺点': ['模型更大', '计算复杂度高'],
            '适用场景': '形态丰富的语言、专业领域'
        }
    }
    
    return comparison

model_comparison = compare_models()

print("\n词向量模型综合比较:")
print("="*60)
for model, info in model_comparison.items():
    print(f"\n{model}:")
    print(f"  优点: {', '.join(info['优点'])}")
    print(f"  缺点: {', '.join(info['缺点'])}")
    print(f"  适用: {info['适用场景']}")

print("\n\n选择建议:")
print("1. 快速原型: Word2Vec CBOW")
print("2. 精确语义: Word2Vec Skip-gram 或 GloVe")
print("3. 未登录词多: FastText")
print("4. 形态丰富语言(如德语、俄语): FastText")
print("5. 资源受限: 预训练词向量")
```

## 五、词向量评估

```python
def evaluate_word_vectors(embeddings, word_to_idx):
    """评估词向量质量"""
    
    def analogy_test(a, b, c, expected):
        """类比测试: a - b + c ≈ expected"""
        if not all(w in word_to_idx for w in [a, b, c, expected]):
            return None
        
        va = embeddings[word_to_idx[a]]
        vb = embeddings[word_to_idx[b]]
        vc = embeddings[word_to_idx[c]]
        
        result = va - vb + vc
        result = result / np.linalg.norm(result)
        
        # 找最相似的词
        best_word = None
        best_sim = -1
        
        for word, idx in word_to_idx.items():
            if word in [a, b, c]:
                continue
            vec = embeddings[idx]
            vec = vec / np.linalg.norm(vec)
            sim = np.dot(result, vec)
            if sim > best_sim:
                best_sim = sim
                best_word = word
        
        return best_word == expected
    
    def similarity_test(word_pairs):
        """相似度测试"""
        scores = []
        for w1, w2, score in word_pairs:
            if w1 in word_to_idx and w2 in word_to_idx:
                v1 = embeddings[word_to_idx[w1]]
                v2 = embeddings[word_to_idx[w2]]
                sim = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))
                scores.append((w1, w2, sim, score))
        return scores
    
    return analogy_test, similarity_test

print("\n词向量评估方法:")
print("1. 内在评估:")
print("   - 类比测试: king - man + woman = queen")
print("   - 相似度测试: 与人工标注对比")
print("   - 分类测试: 情感词分类等")

print("\n2. 外在评估:")
print("   - 下游任务性能: NER、情感分析等")
print("   - 与基线模型对比")

print("\n3. 词向量质量指标:")
print("   - 捕获语义关系的能力")
print("   - 处理未登录词的能力")
print("   - 向量空间的结构性")
```

## 六、预训练词向量使用

```python
# 模拟加载预训练词向量
class PretrainedEmbeddings:
    """预训练词向量加载器"""
    
    def __init__(self):
        self.word_vectors = {}
        self.embedding_dim = 0
    
    def load_from_file(self, filepath, vocab_limit=None):
        """从文件加载词向量"""
        # 模拟加载过程
        print(f"加载词向量: {filepath}")
        # 实际实现读取GloVe/Word2Vec格式文件
        pass
    
    def get_vector(self, word):
        """获取词向量"""
        return self.word_vectors.get(word, None)
    
    def get_embedding_matrix(self, vocab, unk_token='<UNK>'):
        """构建词嵌入矩阵"""
        vocab_size = len(vocab)
        embedding_matrix = np.zeros((vocab_size, self.embedding_dim))
        
        found = 0
        for word, idx in vocab.items():
            vec = self.get_vector(word.lower())
            if vec is not None:
                embedding_matrix[idx] = vec
                found += 1
            else:
                # 随机初始化未找到的词
                embedding_matrix[idx] = np.random.randn(self.embedding_dim) * 0.1
        
        print(f"词汇覆盖率: {found}/{vocab_size} ({100*found/vocab_size:.1f}%)")
        return embedding_matrix

print("\n预训练词向量使用建议:")
print("1. 优先使用大规模预训练词向量")
print("2. 对于领域任务，可以在领域语料上微调")
print("3. 未找到的词可以随机初始化或使用特殊标记")
print("4. 考虑使用上下文相关的词向量(如BERT)")
```

## 七、总结

本文系统介绍了主流词向量模型：

1. **Word2Vec**: CBOW和Skip-gram两种架构，高效但忽略全局统计
2. **GloVe**: 结合全局共现统计，语义关系更丰富
3. **FastText**: 子词嵌入，解决未登录词问题

词向量是NLP的基础组件，理解其原理有助于更好地使用和改进模型。在实际应用中，建议根据任务特点选择合适的模型，并关注预训练词向量的使用。
