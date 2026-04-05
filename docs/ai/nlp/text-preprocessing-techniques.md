---
title: 文本预处理技术：从原始文本到结构化数据
date: 2025-01-25T00:00:00.000Z
categories:
  - ai
  - nlp
tags:
  - 文本预处理
  - NLP
  - 分词
  - 词向量
  - Python
description: 全面讲解自然语言处理中的文本预处理技术，包括分词、清洗、标准化和特征提取方法
author: HK意境
---

# 文本预处理技术：从原始文本到结构化数据

文本预处理是自然语言处理(NLP)项目的第一步，其质量直接影响后续任务的性能。本文将系统地介绍文本预处理的核心技术和最佳实践。

## 一、文本预处理概述

### 1.1 为什么需要文本预处理

原始文本数据通常存在以下问题：

1. **噪声数据**：HTML标签、特殊字符、表情符号等
2. **不规范表达**：大小写混用、拼写错误、缩写形式
3. **冗余信息**：重复内容、停用词过多
4. **结构差异**：不同来源的文本格式不统一

文本预处理的目标是将原始文本转换为干净、规范、结构化的数据，为后续的模型训练提供高质量的输入。

### 1.2 预处理流程

典型的文本预处理流程包括：

1. **文本清洗**：去除HTML标签、特殊字符
2. **分词**：将文本切分为词汇单元
3. **标准化**：大小写转换、拼写校正
4. **停用词处理**：去除或保留无意义词汇
5. **词干提取/词形还原**：还原词汇基本形式
6. **特征提取**：将文本转换为数值表示

```python
import re
import string
import numpy as np
import pandas as pd
from collections import Counter
import matplotlib.pyplot as plt

# 示例原始文本
raw_text = """
<html>
<body>
<div class="content">
<p>自然语言处理(NLP)是人工智能领域中最important的分支之一！！！</p>
<p>它涉及text processing、language understanding等技术...</p>
<p>NLP应用广泛，如机器翻译、情感分析、问答系统等。</p>
</div>
</body>
</html>
"""

print("原始文本示例:")
print(raw_text)
```

## 二、文本清洗

### 2.1 去除HTML标签

```python
from bs4 import BeautifulSoup

def remove_html_tags(text):
    """使用BeautifulSoup去除HTML标签"""
    soup = BeautifulSoup(text, 'html.parser')
    return soup.get_text()

def remove_html_regex(text):
    """使用正则表达式去除HTML标签"""
    clean = re.compile('<.*?>')
    return re.sub(clean, '', text)

# 清除HTML标签
cleaned_html = remove_html_tags(raw_text)
print("去除HTML标签后:")
print(cleaned_html)

# 常用清洗函数集合
class TextCleaner:
    """文本清洗工具类"""
    
    def __init__(self):
        self.html_pattern = re.compile('<.*?>')
        self.url_pattern = re.compile(r'http\S+|www\S+')
        self.email_pattern = re.compile(r'\S+@\S+')
        self.number_pattern = re.compile(r'\d+')
    
    def remove_html(self, text):
        """去除HTML标签"""
        return re.sub(self.html_pattern, '', text)
    
    def remove_urls(self, text):
        """去除URL链接"""
        return re.sub(self.url_pattern, '', text)
    
    def remove_emails(self, text):
        """去除邮箱地址"""
        return re.sub(self.email_pattern, '', text)
    
    def remove_numbers(self, text, keep_digits=False):
        """去除数字"""
        if keep_digits:
            return text
        return re.sub(self.number_pattern, '', text)
    
    def remove_special_chars(self, text, keep_punct=False):
        """去除特殊字符"""
        if keep_punct:
            # 保留标点符号
            return re.sub(r'[^\w\s.,!?;:\-\']', '', text)
        else:
            return re.sub(r'[^\w\s]', '', text)
    
    def remove_extra_whitespace(self, text):
        """去除多余空白"""
        text = re.sub(r'\s+', ' ', text)
        return text.strip()
    
    def clean_all(self, text, keep_punct=True, keep_digits=True):
        """综合清洗"""
        text = self.remove_html(text)
        text = self.remove_urls(text)
        text = self.remove_emails(text)
        text = self.remove_numbers(text, keep_digits)
        text = self.remove_special_chars(text, keep_punct)
        text = self.remove_extra_whitespace(text)
        return text

# 使用TextCleaner
cleaner = TextCleaner()
fully_cleaned = cleaner.clean_all(cleaned_html, keep_punct=True)

print("\n完全清洗后:")
print(fully_cleaned)
```

### 2.2 处理特殊字符和编码

```python
def normalize_unicode(text):
    """统一Unicode编码"""
    import unicodedata
    return unicodedata.normalize('NFKD', text)

def remove_emojis(text):
    """去除表情符号"""
    emoji_pattern = re.compile(
        "[" 
        "\U0001F600-\U0001F64F"  # emoticons
        "\U0001F300-\U0001F5FF"  # symbols & pictographs
        "\U0001F680-\U0001F6FF"  # transport & map symbols
        "\U0001F700-\U0001F77F"  # alchemical symbols
        "\U0001F780-\U0001F7FF"  # Geometric Shapes Extended
        "\U0001F800-\U0001F8FF"  # Supplemental Arrows-C
        "\U0001F900-\U0001F9FF"  # Supplemental Symbols and Pictographs
        "\U0001FA00-\U0001FA6F"  # Chess Symbols
        "\U0001FA70-\U0001FAFF"  # Symbols and Pictographs Extended-A
        "\U00002702-\U000027B0"  # Dingbats
        "]+", flags=re.UNICODE
    )
    return emoji_pattern.sub('', text)

def expand_contractions(text, contractions_dict=None):
    """展开缩写形式"""
    if contractions_dict is None:
        contractions_dict = {
            "can't": "cannot",
            "won't": "will not",
            "n't": " not",
            "'re": " are",
            "'s": " is",
            "'d": " would",
            "'ll": " will",
            "'ve": " have",
            "'m": " am"
        }
    
    for contraction, expansion in contractions_dict.items():
        text = text.replace(contraction, expansion)
    
    return text

# 示例
sample_text = "I can't believe it's already 2025! 😊 #NLP"
print("\n处理特殊字符示例:")
print(f"原始: {sample_text}")
print(f"展开缩写: {expand_contractions(sample_text)}")
print(f"去除表情: {remove_emojis(sample_text)}")
```

## 三、分词技术

### 3.1 中文分词

中文分词是将连续的汉字序列切分为有意义的词汇单元。由于中文没有天然的分隔符，分词是一个重要且复杂的任务。

```python
# 中文分词示例（使用jieba，这里演示原理）
def simple_chinese_tokenize(text):
    """简单的中文分词（按字符切分）"""
    # 基础方案：按字符切分
    chars = list(text.replace(' ', '').replace('\n', ''))
    return chars

def rule_based_tokenize(text, word_list):
    """基于词典的分词"""
    # 最大正向匹配算法
    max_len = max(len(w) for w in word_list)
    tokens = []
    i = 0
    text = text.replace(' ', '')
    
    while i < len(text):
        # 从最长词开始尝试匹配
        matched = False
        for l in range(max_len, 0, -1):
            if i + l <= len(text):
                candidate = text[i:i+l]
                if candidate in word_list:
                    tokens.append(candidate)
                    i += l
                    matched = True
                    break
        
        if not matched:
            tokens.append(text[i])
            i += 1
    
    return tokens

# 示例词典
chinese_word_dict = [
    '自然', '语言', '处理', '人工智能', '领域', '分支',
    '技术', '应用', '广泛', '机器', '翻译', '情感', '分析',
    '问答', '系统', '深度', '学习', '神经网络', '模型'
]

sample_chinese = "自然语言处理是人工智能领域的重要分支技术"
print("\n中文分词示例:")
print(f"原始文本: {sample_chinese}")
print(f"按字符切分: {simple_chinese_tokenize(sample_chinese)}")
print(f"词典分词: {rule_based_tokenize(sample_chinese, chinese_word_dict)}")

# 分词算法对比
print("\n中文分词方法比较:")
print("1. 正向最大匹配: 从左到右匹配最长词")
print("2. 逆向最大匹配: 从右到左匹配最长词")
print("3. 双向最大匹配: 结合两种方法，选择最优结果")
print("4. 统计方法: HMM、CRF等基于序列标注")
print("5. 深度学习: BiLSTM-CRF、BERT等")
```

### 3.2 英文分词

```python
def english_tokenize_basic(text):
    """基础英文分词"""
    # 按空格和标点切分
    tokens = re.findall(r'\b\w+\b', text.lower())
    return tokens

def english_tokenize_with_punct(text):
    """保留标点的分词"""
    tokens = re.findall(r"\w+|[^\w\s]", text)
    return tokens

def sentence_tokenize(text):
    """句子切分"""
    # 基于标点符号的简单切分
    sentences = re.split(r'[.!?]+\s*', text)
    return [s.strip() for s in sentences if s.strip()]

# 示例
english_text = "Natural Language Processing (NLP) is a crucial field in AI. It enables computers to understand human language!"

print("\n英文分词示例:")
print(f"原始文本: {english_text}")
print(f"基础分词: {english_tokenize_basic(english_text)}")
print(f"保留标点: {english_tokenize_with_punct(english_text)}")
print(f"句子切分: {sentence_tokenize(english_text)}")
```

### 3.3 子词分词（Subword Tokenization）

```python
def byte_pair_encoding_demo(vocab, num_merges=10):
    """BPE算法演示"""
    # BPE通过合并高频字符对来构建词汇表
    pairs = Counter()
    
    # 计算相邻字符对频率
    for word, freq in vocab.items():
        chars = list(word)
        for i in range(len(chars) - 1):
            pairs[(chars[i], chars[i+1])] += freq
    
    print("初始字符对频率:")
    print(pairs.most_common(5))
    
    # 执行合并
    for i in range(num_merges):
        if not pairs:
            break
        
        # 找到最频繁的字符对
        best_pair = pairs.most_common(1)[0][0]
        new_token = best_pair[0] + best_pair[1]
        
        print(f"\n合并 {i+1}: {best_pair} -> {new_token}")
        
        # 更新词汇表
        new_vocab = {}
        for word, freq in vocab.items():
            new_word = word.replace(' '.join(best_pair), new_token)
            new_vocab[new_word] = freq
        
        vocab = new_vocab
        
        # 更新字符对频率
        pairs = Counter()
        for word, freq in vocab.items():
            chars = word.split()
            for j in range(len(chars) - 1):
                pairs[(chars[j], chars[j+1])] += freq
    
    return vocab

# 演示BPE
vocab_example = {'l o w': 5, 'l o w e r': 2, 'n e w e s t': 6, 'w i d e r': 3}
print("\nBPE算法演示:")
print("初始词汇表:", vocab_example)
result_vocab = byte_pair_encoding_demo(vocab_example, num_merges=3)
print("最终词汇表:", result_vocab)

print("\n子词分词方法:")
print("1. BPE: 合并高频字符对")
print("2. WordPiece: 类似BPE，但基于语言模型概率")
print("3. Unigram: 基于概率的词汇选择")
print("4. SentencePiece: 支持多种语言的统一分词")
```

## 四、标准化处理

### 4.1 大小写转换

```python
def case_normalization(text, mode='lower'):
    """大小写标准化"""
    if mode == 'lower':
        return text.lower()
    elif mode == 'upper':
        return text.upper()
    elif mode == 'title':
        return text.title()
    elif mode == 'capitalize':
        # 只首字母大写
        return text.capitalize()
    else:
        return text

# 示例
case_text = "Natural Language Processing is AMAZING!"
print("\n大小写标准化:")
print(f"原始: {case_text}")
print(f"小写: {case_normalization(case_text, 'lower')}")
print(f"大写: {case_normalization(case_text, 'upper')}")
print(f"标题: {case_normalization(case_text, 'title')}")

# 智能大小写处理（保留特定词汇）
def smart_case_normalization(text, keep_words=None):
    """智能大小写处理"""
    if keep_words is None:
        keep_words = ['NLP', 'AI', 'ML', 'API', 'HTTP']
    
    result = []
    for word in text.split():
        if word.upper() in keep_words:
            result.append(word.upper())
        else:
            result.append(word.lower())
    
    return ' '.join(result)

print(f"智能处理: {smart_case_normalization(case_text)}")
```

### 4.2 去除停用词

```python
# 定义中英文停用词表
chinese_stopwords = set([
    '的', '了', '和', '是', '就', '都', '而', '及', '与', '着',
    '或', '一个', '没有', '我们', '你们', '他们', '它们',
    '这个', '那个', '这些', '那些', '什么', '怎么', '如何'
])

english_stopwords = set([
    'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
    'would', 'could', 'should', 'may', 'might', 'must', 'shall',
    'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in',
    'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into',
    'through', 'during', 'before', 'after', 'above', 'below',
    'between', 'under', 'again', 'further', 'then', 'once',
    'here', 'there', 'when', 'where', 'why', 'how', 'all',
    'each', 'few', 'more', 'most', 'other', 'some', 'such',
    'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than',
    'too', 'very', 'just', 'and', 'but', 'if', 'or', 'because'
])

def remove_stopwords(tokens, stopwords):
    """去除停用词"""
    return [t for t in tokens if t.lower() not in stopwords]

# 示例
tokens_cn = ['自然', '语言', '处理', '是', '人工智能', '的', '重要', '分支']
tokens_en = ['natural', 'language', 'processing', 'is', 'a', 'crucial', 'field']

print("\n停用词处理:")
print(f"中文原文: {tokens_cn}")
print(f"去停用词: {remove_stopwords(tokens_cn, chinese_stopwords)}")
print(f"英文原文: {tokens_en}")
print(f"去停用词: {remove_stopwords(tokens_en, english_stopwords)}")

# 停用词处理策略分析
print("\n停用词处理策略:")
print("1. 全部去除: 适合大多数分类任务")
print("2. 部分保留: 适合情感分析、文本生成")
print("3. 添加权重: 适合信息检索")
print("4. 动态处理: 根据任务调整停用词表")
```

### 4.3 词干提取与词形还原

```python
def simple_stemming(word):
    """简单词干提取演示"""
    # 简化的规则
    suffixes = ['ing', 'ly', 'ed', 'ous', 'ies', 'ive', 'es', 's', 'ment', 'ness']
    
    for suffix in suffixes:
        if word.endswith(suffix) and len(word) > len(suffix) + 2:
            return word[:-len(suffix)]
    
    return word

def lemmatization_rules(word):
    """简单词形还原演示"""
    lemmas = {
        'running': 'run',
        'ran': 'run',
        'runs': 'run',
        'better': 'good',
        'worse': 'bad',
        'children': 'child',
        'cats': 'cat',
        'dogs': 'dog',
        'studies': 'study',
        'studying': 'study'
    }
    
    return lemmas.get(word.lower(), word.lower())

# 示例
words_to_process = ['running', 'studies', 'better', 'children', 'cats', 'quickly']

print("\n词干提取与词形还原:")
print("词干提取(Stemming): 去除词缀，可能产生非标准词")
print("词形还原(Lemmatization): 还原到词典中的基本形式")

print("\n示例:")
for word in words_to_process:
    stem = simple_stemming(word)
    lemma = lemmatization_rules(word)
    print(f"  {word} -> stem: {stem}, lemma: {lemma}")

print("\n两者区别:")
print("- 词干提取速度快，但可能产生无意义词")
print("- 词形还原准确度高，但需要词性信息")
print("- 信息检索常用词干提取")
print("- 精确分析常用词形还原")
```

## 五、文本特征提取

### 5.1 词袋模型（Bag of Words）

```python
class SimpleBagOfWords:
    """简单词袋模型实现"""
    
    def __init__(self):
        self.vocabulary = {}
        self.idf = {}
    
    def fit(self, documents):
        """构建词汇表"""
        word_freq = Counter()
        doc_count = len(documents)
        
        # 统计词频和文档频率
        for doc in documents:
            words = set(doc.split())
            word_freq.update(doc.split())
            for word in words:
                self.idf[word] = self.idf.get(word, 0) + 1
        
        # 构建词汇表
        self.vocabulary = {word: idx for idx, (word, _) in enumerate(word_freq.most_common())}
        
        # 计算IDF
        for word in self.idf:
            self.idf[word] = np.log(doc_count / (self.idf[word] + 1))
        
        return self
    
    def transform(self, documents):
        """转换为词袋向量"""
        vectors = []
        
        for doc in documents:
            vector = np.zeros(len(self.vocabulary))
            for word in doc.split():
                if word in self.vocabulary:
                    vector[self.vocabulary[word]] += 1
            vectors.append(vector)
        
        return np.array(vectors)
    
    def transform_tfidf(self, documents):
        """转换为TF-IDF向量"""
        vectors = []
        
        for doc in documents:
            vector = np.zeros(len(self.vocabulary))
            word_count = Counter(doc.split())
            doc_len = len(doc.split())
            
            for word, count in word_count.items():
                if word in self.vocabulary:
                    tf = count / doc_len
                    tfidf = tf * self.idf.get(word, 0)
                    vector[self.vocabulary[word]] = tfidf
            
            vectors.append(vector)
        
        return np.array(vectors)
    
    def get_feature_names(self):
        """获取特征名称"""
        return list(self.vocabulary.keys())

# 示例
documents = [
    "自然语言处理是人工智能的重要分支",
    "深度学习推动了自然语言处理的发展",
    "人工智能和深度学习密切相关",
    "自然语言处理应用广泛"
]

bow = SimpleBagOfWords()
bow.fit(documents)

print("\n词袋模型示例:")
print("词汇表:", bow.get_feature_names()[:10])
print("词频向量:")
bow_vectors = bow.transform(documents)
for i, vec in enumerate(bow_vectors[:2]):
    print(f"  文档{i+1}: {vec[:8]}")

print("\nTF-IDF向量:")
tfidf_vectors = bow.transform_tfidf(documents)
for i, vec in enumerate(tfidf_vectors[:2]):
    print(f"  文档{i+1}: {vec[:8]}")
```

### 5.2 N-gram特征

```python
def generate_ngrams(text, n=2):
    """生成N-gram"""
    tokens = text.split()
    ngrams = []
    
    for i in range(len(tokens) - n + 1):
        ngram = ' '.join(tokens[i:i+n])
        ngrams.append(ngram)
    
    return ngrams

def generate_all_ngrams(text, max_n=3):
    """生成所有N-gram"""
    result = {}
    
    for n in range(1, max_n + 1):
        result[n] = generate_ngrams(text, n)
    
    return result

# 示例
ngram_text = "自然语言处理是人工智能的重要分支"

print("\nN-gram特征示例:")
print(f"原始文本: {ngram_text}")

all_ngrams = generate_all_ngrams(ngram_text, max_n=3)

for n, ngrams in all_ngrams.items():
    print(f"{n}-gram: {ngrams[:5]}")

print("\nN-gram的应用:")
print("1. 语言模型: 预测下一个词")
print("2. 特征提取: 捕获词序信息")
print("3. 文本生成: 基于统计生成文本")
print("4. 拼写校正: 基于上下文纠错")
```

## 六、完整预处理流水线

```python
class TextPreprocessor:
    """完整的文本预处理流水线"""
    
    def __init__(self, language='mixed', remove_stopwords=True, 
                 lowercase=True, min_word_length=2):
        self.language = language
        self.remove_stopwords = remove_stopwords
        self.lowercase = lowercase
        self.min_word_length = min_word_length
        
        self.cleaner = TextCleaner()
        self.stopwords = chinese_stopwords | english_stopwords
    
    def preprocess(self, text):
        """完整预处理流程"""
        # 1. 清洗
        text = self.cleaner.clean_all(text, keep_punct=False, keep_digits=False)
        
        # 2. 大小写标准化
        if self.lowercase:
            text = text.lower()
        
        # 3. 分词
        tokens = text.split()
        
        # 4. 去除停用词
        if self.remove_stopwords:
            tokens = [t for t in tokens if t not in self.stopwords]
        
        # 5. 长度过滤
        tokens = [t for t in tokens if len(t) >= self.min_word_length]
        
        return tokens
    
    def preprocess_batch(self, texts):
        """批量预处理"""
        return [self.preprocess(text) for text in texts]
    
    def get_statistics(self, texts):
        """获取文本统计信息"""
        all_tokens = []
        doc_lengths = []
        
        for text in texts:
            tokens = self.preprocess(text)
            all_tokens.extend(tokens)
            doc_lengths.append(len(tokens))
        
        word_freq = Counter(all_tokens)
        
        return {
            'total_docs': len(texts),
            'total_tokens': len(all_tokens),
            'unique_tokens': len(word_freq),
            'avg_doc_length': np.mean(doc_lengths),
            'top_words': word_freq.most_common(10)
        }

# 使用完整流水线
preprocessor = TextPreprocessor()

sample_texts = [
    "自然语言处理(NLP)是AI领域的核心技术！！！",
    "Deep Learning推动了NLP的发展和应用...",
    "文本预处理是NLP项目的重要第一步。"
]

print("\n完整预处理流水线:")
for i, text in enumerate(sample_texts):
    tokens = preprocessor.preprocess(text)
    print(f"原文{i+1}: {text[:30]}...")
    print(f"处理后: {tokens}")

# 统计信息
stats = preprocessor.get_statistics(sample_texts)
print("\n文本统计:")
for key, value in stats.items():
    if key == 'top_words':
        print(f"  {key}: {value[:5]}")
    else:
        print(f"  {key}: {value}")
```

## 七、预处理可视化分析

```python
# 文本预处理效果可视化
def visualize_preprocessing(texts, preprocessor):
    """可视化预处理效果"""
    original_lengths = [len(text.split()) for text in texts]
    processed_lengths = [len(preprocessor.preprocess(text)) for text in texts]
    
    fig, axes = plt.subplots(1, 3, figsize=(15, 5))
    
    # 文本长度对比
    x = range(len(texts))
    axes[0].bar(x, original_lengths, alpha=0.7, label='原始')
    axes[0].bar(x, processed_lengths, alpha=0.7, label='处理后')
    axes[0].set_xlabel('文档编号')
    axes[0].set_ylabel('词数')
    axes[0].set_title('预处理前后文本长度对比')
    axes[0].legend()
    
    # 词频分布
    all_tokens = []
    for text in texts:
        all_tokens.extend(preprocessor.preprocess(text))
    
    word_freq = Counter(all_tokens)
    top_words = word_freq.most_common(15)
    
    axes[1].barh([w[0] for w in top_words], [w[1] for w in top_words])
    axes[1].set_xlabel('频率')
    axes[1].set_title('高频词分布')
    
    # 长度缩减比例
    reduction_ratios = [(o - p) / o * 100 for o, p in zip(original_lengths, processed_lengths)]
    axes[2].hist(reduction_ratios, bins=10, edgecolor='black')
    axes[2].set_xlabel('缩减比例 (%)')
    axes[2].set_ylabel('文档数')
    axes[2].set_title('预处理缩减比例分布')
    
    plt.tight_layout()
    plt.show()

# 更多示例文本
more_texts = [
    "自然语言处理技术已经广泛应用于搜索引擎、机器翻译、情感分析等领域。",
    "深度学习模型如BERT、GPT等显著提升了NLP任务的效果。",
    "文本预处理包括分词、去停用词、词向量转换等关键步骤。",
    "高质量的文本预处理是成功NLP项目的基础。",
    "中文NLP面临分词、歧义消解等独特挑战。"
]

visualize_preprocessing(more_texts, preprocessor)

print("\n预处理效果分析:")
print("- 去停用词通常减少20-40%的词汇量")
print("- 清洗和标准化提高文本一致性")
print("- 合适的预处理策略取决于具体任务")
```

## 八、最佳实践总结

```python
print("="*60)
print("文本预处理最佳实践总结")
print("="*60)

print("\n1. 根据任务选择预处理策略:")
print("   - 文本分类: 基础清洗 + 去停用词 + TF-IDF")
print("   - 情感分析: 保留情感词，不去停用词")
print("   - 机器翻译: 保留完整句子结构")
print("   - 信息检索: 词干提取 + 去停用词")

print("\n2. 中文文本特殊处理:")
print("   - 选择合适的分词工具(jieba, THULAC等)")
print("   - 处理中文标点符号")
print("   - 考虑繁简转换")

print("\n3. 常见陷阱:")
print("   - 过度清洗导致信息丢失")
print("   - 不合适的停用词表")
print("   - 忽略领域特定词汇")
print("   - 不一致的预处理流程")

print("\n4. 验证预处理效果:")
print("   - 检查处理后文本的可读性")
print("   - 分析词频分布是否合理")
print("   - 对比不同策略的模型效果")

print("\n5. 性能优化:")
print("   - 使用高效的分词库")
print("   - 批量处理代替逐条处理")
print("   - 缓存预处理结果")
print("   - 使用多进程并行处理")
```

文本预处理是NLP项目的基础工作，合理的预处理策略能够显著提升后续任务的性能。本文介绍了从文本清洗到特征提取的完整流程，读者可以根据具体任务需求选择合适的预处理方法。
