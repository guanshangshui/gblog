---
title: "深入浅出 PyTorch 第二课：多模块的设计"
description: "PyTorch 多模块设计笔记，记录 Loss 的 reduction 计算模式，以及 Optimizer 的 defaults、state、param_groups 划分。"
pubDate: "2026-09-01 17:20:00"
category: "笔记"
tags: ["PyTorch", "Optimizer", "Loss", "深度学习"]
banner: "@images/banner/d75f-hwfpcxn2958458.jpg"
---

几种不同的这个init的设计方式

我们需要知道的是，reduction参数决定了计算模式。有三种计算模式可选：none：逐个元素计算。 sum：所有元素求和，返回标量。 mean：加权平均，返回标量。 如果选择none，那么返回的结果是和输入元素相同尺寸的。

为什么还有这种三平均


Optimizer有三个属性：

defaults：存储的是优化器的超参数，例子如下：

{'lr': 0.1, 'momentum': 0.9, 'dampening': 0, 'weight_decay': 0, 'nesterov': False}
state：参数的缓存，例子如下：

defaultdict(<class 'dict'>, {tensor([[ 0.3864, -0.0131],
        [-0.1911, -0.4511]], requires_grad=True): {'momentum_buffer': tensor([[0.0052, 0.0052],
        [0.0052, 0.0052]])}})
param_groups：管理的参数组，是一个list，其中每个元素是一个字典，顺序是params，lr，momentum，dampening，weight_decay，nesterov，例子如下：
为什么这样来进行划分