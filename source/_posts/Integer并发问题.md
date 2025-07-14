---
title: Integer并发问题
tags: 并发问题
categories: 技术
abbrlink: 17faa988
date: 2025-07-14 14:11:30
description:
---
最近在面试中遇到了一个 Integer 并发问题，记录一下。
<!-- more -->
## 题目
```java
package com.example.springbootdemo.demos.demo;

public class IntegerDemo {
    static Integer a = 0;

    public static void main(String[] args) throws InterruptedException {
        Thread thread = new Thread(() -> {
            for (int i = 0; i < 10000; i++) {
                synchronized (a) {
                    a++;
                }
            }
        });
        thread.start();
        for (int i = 0; i < 10000; i++) {
            synchronized (a) {
                a++;
            }
        }
        thread.join();
        System.out.println(a);
    }
}
```
问这个最后的值是多少，是大于20000 等于20000 还是小于20000
## 分析
我最开始的思考是，既然是出来考题了，大于应该不太可能，那就是在等于和小于中有一个是对的，如果integer有问题，那就可能是小于的，结果被我猜对了，下面来分析下具体原理
一般来说如果synchronized锁的这个对象是同一个对象的话，是会按照预期执行等于的，但是有意思的就在integer这个类型
a++的这个操作相当于是a = Integer.valueOf(a.intValue() + 1)，这创建了新对象并改变 a 的引用（例如从 Integer(0) 变为 Integer(1)）。
所以主要问题就在于锁的这个a，一直不停在变引用对象，下面这两种情况都有可能
1. 锁定过期的a
2. 基于同一旧值独立自增（如都读取101，均计算102），导致结果覆盖

## 解决方案
1. 使用AtomicInteger 来保证引用对象不变
2. 使用object来保证引用对象不变


