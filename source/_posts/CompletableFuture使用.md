---
title: CompletableFuture使用
date: 2025-07-20 14:57:41
tags:
categories: 技术
description:
---
前几天有个群友突然问了这个问题，我一看发现，我竟然没有了解过，于是来了解一下
<!-- more -->
## why
CompletableFuture是由Java 8引入的，在Java8之前我们一般通过Future实现异步。
- Future用于表示异步计算的结果，只能通过阻塞或者轮询的方式获取结果，而且不支持设置回调方法，Java 8之前若要设置回调一般会使用guava的ListenableFuture，回调的引入又会导致臭名昭著的回调地狱
> 当然， 使用 ListenableFuture 链式编程可以避免回调地狱的问题，但是使用 CompletableFuture更为优雅
- CompletableFuture对Future进行了扩展，可以通过设置回调的方式处理计算结果，同时也支持组合操作，支持进一步的编排，同时一定程度解决了回调地狱的问题。
## 使用
## 三种方式
### supplyAsync
你可以选择默认的线程池,默认的线程池是这个
```java
    private static final Executor ASYNC_POOL = USE_COMMON_POOL ?
        ForkJoinPool.commonPool() : new ThreadPerTaskExecutor();
```
直接使用
```java
CompletableFuture<String> cf1 = CompletableFuture.supplyAsync(() -> {
  return "result1";
});
```
也可以使用自定义的线程池
```java
CompletableFuture<String> cf1 = CompletableFuture.supplyAsync(() -> {
  return "result2";
}, executor);
```
### completedFuture
```java
CompletableFuture<String> cf2 = CompletableFuture.completedFuture("result2");
```
### CompletableFuture
```java
CompletableFuture<String> cf = new CompletableFuture<>();
cf.complete("success");
```
### 总结
- 如果你有一个异步任务要执行，用 supplyAsync() / runAsync()。
- 如果你已经知道结果，直接返回 Future，用 completedFuture()。
- 如果你需要手动控制 Future 的完成时机（比如与回调、事件绑定），用 new CompletableFuture<>() 并配合 complete()
## 处理异步操作的结果
一般使用下面三种方法
### thenApply
thenApply 是用来转换当前 CompletableFuture 的结果，并生成一个新的 CompletableFuture。
### thenAccept
thenAccept 是用来消费当前 CompletableFuture 的结果，但不产生新的结果，它返回的是 CompletableFuture<Void>。
### thenCompose 
thenCompose 则是用来组合两个 CompletableFuture，通常用于当你需要基于前一个 CompletableFuture 的结果来启动另一个 CompletableFuture 时。
> 比如你要等待a和b执行完成之后再执行c可以使用thenCompose
```java
CompletableFuture<String> cf4 = cf1.thenCombine(cf2, (result1, result2) -> {
  //result1和result2分别为cf1和cf2的结果
  return "result4";
});
```
### thenCombine
有两个依赖可以使用这个
```java
CompletableFuture<String> cf4 = cf1.thenCombine(cf2, (result1, result2) -> {
  //result1和result2分别为cf1和cf2的结果
  return "result4";
});
```
### allOf
当需要多个依赖全部完成时使用allOf
### anyOf
当多个依赖中的任意一个完成即可时使用anyOf
## 参考
- [美团CompletableFuture原理与实践-外卖商家端API的异步化](https://tech.meituan.com/2022/05/12/principles-and-practices-of-completablefuture.html)
