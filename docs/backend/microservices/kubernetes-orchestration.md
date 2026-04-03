---
title: Kubernetes编排入门
date: 2025-03-15
categories: [backend, microservices]
tags: [Kubernetes, K8s, 容器编排, 云原生, DevOps]
description: Kubernetes核心概念、资源对象、部署实践与生产环境运维详解
---

# Kubernetes编排入门

## 引言

Kubernetes（简称K8s）是Google开源的容器编排平台，用于自动化部署、扩展和管理容器化应用。作为云原生应用的标准编排平台，Kubernetes提供了服务发现、负载均衡、存储编排、自动滚动更新、自我修复等强大功能。

本文将从Kubernetes的核心概念出发，详细介绍各种资源对象、部署配置、服务暴露、存储管理等内容，帮助开发者掌握Kubernetes的基本使用。

## Kubernetes架构

### 集群架构

```
Kubernetes集群架构：

┌─────────────────────────────────────────────────────────────┐
│                    Master Node（控制平面）                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ API Server  │  │ Scheduler   │  │ Controller Manager  │ │
│  │ (API服务)   │  │ (调度器)    │  │ (控制器管理器)       │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                  etcd (键值存储)                       │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  Worker Node 1  │ │  Worker Node 2  │ │  Worker Node 3  │
├─────────────────┤ ├─────────────────┤ ├─────────────────┤
│ kubelet         │ │ kubelet         │ │ kubelet         │
│ kube-proxy      │ │ kube-proxy      │ │ kube-proxy      │
│ Container       │ │ Container       │ │ Container       │
│ Runtime         │ │ Runtime         │ │ Runtime         │
│ ┌─────────────┐ │ │ ┌─────────────┐ │ │ ┌─────────────┐ │
│ │   Pod       │ │ │ │   Pod       │ │ │ │   Pod       │ │
│ │  ┌───────┐  │ │ │ │  ┌───────┐  │ │ │ │  ┌───────┐  │ │
│ │  │Container│ │ │ │  │Container│ │ │ │  │Container│ │ │
│ │  └───────┘  │ │ │  └───────┘  │ │ │  └───────┘  │ │
│ └─────────────┘ │ │ └─────────────┘ │ │ └─────────────┘ │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

### 核心组件

**Master节点组件：**

- **API Server**：集群统一入口，提供RESTful API
- **Scheduler**：负责Pod调度到合适的节点
- **Controller Manager**：运行控制器，维护集群状态
- **etcd**：键值存储，保存集群状态数据

**Worker节点组件：**

- **kubelet**：与Master通信，管理本节点容器
- **kube-proxy**：维护网络规则，实现服务发现
- **Container Runtime**：容器运行时（Docker、containerd）

## 核心资源对象

### Pod

Pod是Kubernetes最小的部署单元：

```yaml
# pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp-pod
  labels:
    app: myapp
    tier: frontend
spec:
  containers:
  - name: myapp
    image: myapp:1.0
    ports:
    - containerPort: 8080
    env:
    - name: ENV
      value: "production"
    resources:
      requests:
        memory: "256Mi"
        cpu: "250m"
      limits:
        memory: "512Mi"
        cpu: "500m"
    livenessProbe:
      httpGet:
        path: /actuator/health/liveness
        port: 8080
      initialDelaySeconds: 30
      periodSeconds: 10
    readinessProbe:
      httpGet:
        path: /actuator/health/readiness
        port: 8080
      initialDelaySeconds: 10
      periodSeconds: 5
    volumeMounts:
    - name: logs
      mountPath: /app/logs
  volumes:
  - name: logs
    emptyDir: {}
```

### Deployment

Deployment管理Pod的副本和更新策略：

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-deployment
  labels:
    app: myapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: myapp
        image: myapp:1.0
        ports:
        - containerPort: 8080
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /actuator/health/liveness
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 5
        env:
        - name: SPRING_PROFILES_ACTIVE
          valueFrom:
            configMapKeyRef:
              name: myapp-config
              key: spring.profiles.active
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: myapp-secret
              key: db-password
```

### Service

Service提供稳定的服务发现和负载均衡：

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp-service
spec:
  selector:
    app: myapp
  ports:
  - port: 80
    targetPort: 8080
    protocol: TCP
  type: ClusterIP  # ClusterIP, NodePort, LoadBalancer, ExternalName

---
# NodePort服务
apiVersion: v1
kind: Service
metadata:
  name: myapp-nodeport
spec:
  selector:
    app: myapp
  ports:
  - port: 80
    targetPort: 8080
    nodePort: 30080
  type: NodePort

---
# LoadBalancer服务（云环境）
apiVersion: v1
kind: Service
metadata:
  name: myapp-lb
spec:
  selector:
    app: myapp
  ports:
  - port: 80
    targetPort: 8080
  type: LoadBalancer
```

### ConfigMap

ConfigMap存储配置数据：

```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: myapp-config
data:
  application.properties: |
    spring.datasource.url=jdbc:mysql://mysql:3306/mydb
    spring.datasource.username=root
    spring.redis.host=redis
    spring.redis.port=6379
  spring.profiles.active: "prod"
  log.level: "INFO"

---
# 使用ConfigMap
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  template:
    spec:
      containers:
      - name: myapp
        env:
        - name: SPRING_PROFILES_ACTIVE
          valueFrom:
            configMapKeyRef:
              name: myapp-config
              key: spring.profiles.active
        volumeMounts:
        - name: config
          mountPath: /app/config
      volumes:
      - name: config
        configMap:
          name: myapp-config
```

### Secret

Secret存储敏感数据：

```yaml
# secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: myapp-secret
type: Opaque
data:
  db-password: cGFzc3dvcmQxMjM=  # base64编码
  api-key: YXBpLWtleS0xMjM0NQ==

---
# 使用Secret
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  template:
    spec:
      containers:
      - name: myapp
        env:
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: myapp-secret
              key: db-password
```

### Ingress

Ingress提供HTTP路由：

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: myapp-service
            port:
              number: 80
  tls:
  - hosts:
    - myapp.example.com
    secretName: myapp-tls
```

## 存储管理

### PersistentVolume和PersistentVolumeClaim

```yaml
# pv.yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: myapp-pv
spec:
  capacity:
    storage: 10Gi
  volumeMode: Filesystem
  accessModes:
  - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  storageClassName: standard
  hostPath:
    path: /data/myapp

---
# pvc.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: myapp-pvc
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
  storageClassName: standard

---
# 使用PVC
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  template:
    spec:
      containers:
      - name: myapp
        volumeMounts:
        - name: data
          mountPath: /app/data
      volumes:
      - name: data
        persistentVolumeClaim:
          claimName: myapp-pvc
```

## kubectl命令

### 基础命令

```bash
# 查看资源
kubectl get pods
kubectl get pods -o wide
kubectl get deployments
kubectl get services
kubectl get all

# 查看详情
kubectl describe pod myapp-pod
kubectl describe deployment myapp-deployment

# 查看日志
kubectl logs myapp-pod
kubectl logs -f myapp-pod  # 实时跟踪
kubectl logs myapp-pod -c container-name  # 多容器Pod

# 进入容器
kubectl exec -it myapp-pod -- /bin/bash
kubectl exec -it myapp-pod -- /bin/sh

# 端口转发
kubectl port-forward myapp-pod 8080:8080
kubectl port-forward service/myapp-service 8080:80

# 创建资源
kubectl apply -f deployment.yaml
kubectl apply -f .  # 应用目录下所有YAML

# 删除资源
kubectl delete -f deployment.yaml
kubectl delete pod myapp-pod
kubectl delete deployment myapp-deployment

# 编辑资源
kubectl edit deployment myapp-deployment

# 查看事件
kubectl get events
kubectl get events --sort-by='.lastTimestamp'
```

### 高级命令

```bash
# 扩缩容
kubectl scale deployment myapp-deployment --replicas=5

# 自动扩缩容
kubectl autoscale deployment myapp-deployment --min=2 --max=10 --cpu-percent=80

# 滚动更新
kubectl set image deployment/myapp-deployment myapp=myapp:2.0

# 查看滚动更新状态
kubectl rollout status deployment/myapp-deployment

# 查看历史版本
kubectl rollout history deployment/myapp-deployment

# 回滚
kubectl rollout undo deployment/myapp-deployment
kubectl rollout undo deployment/myapp-deployment --to-revision=2

# 查看资源使用
kubectl top pods
kubectl top nodes

# 标签操作
kubectl label pod myapp-pod env=prod
kubectl label pod myapp-pod env-  # 删除标签

# 注解操作
kubectl annotate pod myapp-pod description="My application"

# 配置管理
kubectl create configmap my-config --from-file=config.properties
kubectl create secret generic my-secret --from-literal=password=secret
```

## 实战部署案例

### 完整应用部署

```yaml
# 完整部署示例
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: myapp

---
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: myapp-config
  namespace: myapp
data:
  SPRING_PROFILES_ACTIVE: "prod"
  DB_HOST: "mysql"
  DB_PORT: "3306"
  REDIS_HOST: "redis"

---
# secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: myapp-secret
  namespace: myapp
type: Opaque
stringData:
  DB_PASSWORD: "password123"
  REDIS_PASSWORD: "redis123"

---
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
  namespace: myapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: myapp
        image: myapp:1.0
        ports:
        - containerPort: 8080
        envFrom:
        - configMapRef:
            name: myapp-config
        - secretRef:
            name: myapp-secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /actuator/health/liveness
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 5

---
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp-service
  namespace: myapp
spec:
  selector:
    app: myapp
  ports:
  - port: 80
    targetPort: 8080
  type: ClusterIP

---
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp-ingress
  namespace: myapp
spec:
  ingressClassName: nginx
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: myapp-service
            port:
              number: 80
```

## 总结

Kubernetes是云原生应用的标准编排平台，提供了强大的容器编排和管理能力。本文介绍了Kubernetes的核心概念、资源对象、部署配置和常用命令。

掌握Kubernetes需要理解：

1. Pod、Deployment、Service等核心概念
2. ConfigMap和Secret的配置管理
3. PVC和PV的存储管理
4. Ingress的流量路由
5. kubectl命令行工具的使用

Kubernetes是现代云原生应用的基石，掌握它是成为云原生开发者的必经之路。

## 参考资料

- Kubernetes官方文档
- 《Kubernetes权威指南》
- Kubernetes最佳实践指南
- Helm包管理器文档