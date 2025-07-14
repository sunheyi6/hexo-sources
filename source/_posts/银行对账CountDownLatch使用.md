---
title: 银行对账CountDownLatch使用
abbrlink: 5c822ad4
date: 2025-07-10 11:03:44
tags:
categories:
description:
---
记录下银行对账中使用CountDownLatch的场景
<!-- more -->
## 题目
使用线程池(核心线程20个)模拟存款、取款(金额不足时，取款暂停，等到余额足够时再取(重新放回线程池)，若存款结束,金额仍然不够，则终止取款)。同时存款/取款各1000次，每次由一个线程去处理，每次金额在10~100之间
## 解决方案
```java
package com.example.springbootdemo.demos.demo;

import java.util.Random;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

class BankAccount1 {
    private volatile int balance;
    //初始余额
    public BankAccount1(int initialBalance) {
        this.balance = initialBalance;
    }
    //存钱
    public synchronized void deposit(int amount) {
        balance += amount;
    }

    //取钱
    public synchronized boolean withdraw(int amount, boolean ignoreBalance) {
        if (ignoreBalance || balance >= amount) {
            balance -= amount;
            return true;
        }
        return false;
    }

    public int getBalance() {
        return balance;
    }
    //对账
    public boolean reconcile(int initial, int deposits, int withdrawals) {
        return initial + deposits - withdrawals == balance;
    }
}

public class AdvancedBankSystem1 {

    private static final int INITIAL_BALANCE = 1000;
    private static final int TOTAL_OPERATIONS = 1000;
    private static final int MAX_RETRIES = 3;

    public static void main(String[] args) throws InterruptedException {
        BankAccount1 account = new BankAccount1(INITIAL_BALANCE);
        Random rand = new Random();

        ExecutorService executor = Executors.newFixedThreadPool(20);

        CountDownLatch latch = new CountDownLatch(2 * TOTAL_OPERATIONS);

        AtomicInteger totalDeposits = new AtomicInteger(0);
        AtomicInteger totalWithdrawals = new AtomicInteger(0);

        BlockingQueue<Runnable> pendingWithdrawals = new LinkedBlockingQueue<>();

        // 提交存款任务
        for (int i = 0; i < TOTAL_OPERATIONS; i++) {
            final int amount = rand.nextInt(91) + 10; // 10~100
            executor.submit(() -> {
                account.deposit(amount);
                totalDeposits.addAndGet(amount);
                latch.countDown();
            });
        }

        // 提交取款任务到阻塞队列中
        for (int i = 0; i < TOTAL_OPERATIONS; i++) {
            final int amount = rand.nextInt(91) + 10;
            pendingWithdrawals.add(new WithdrawTask(
                    account,
                    amount,
                    latch,
                    totalWithdrawals,
                    pendingWithdrawals,
                    MAX_RETRIES
            ));
        }

        // 提交所有取款任务到线程池
        for (int i = 0; i < TOTAL_OPERATIONS; i++) {
            executor.submit(pendingWithdrawals.take());
        }

        // 再次尝试剩余未执行的取款任务（最多 MAX_RETRIES 次）
        while (!pendingWithdrawals.isEmpty()) {
            Runnable task = pendingWithdrawals.poll();
            if (task != null) {
                executor.submit(task);
            }
        }

        // 等待所有操作完成
        latch.await();
        executor.shutdown();

        // 输出结果
        System.out.println("最终余额: " + account.getBalance());
        System.out.println("初始余额: " + INITIAL_BALANCE);
        System.out.println("总存款额: " + totalDeposits.get());
        System.out.println("总取款额: " + totalWithdrawals.get());

        boolean result = account.reconcile(INITIAL_BALANCE, totalDeposits.get(), totalWithdrawals.get());
        System.out.println("对账完毕，结果：" + result);
    }

    static class WithdrawTask implements Runnable {
        private final BankAccount1 account;
        private final int amount;
        private final CountDownLatch latch;
        private final AtomicInteger totalWithdrawals;
        private final BlockingQueue<Runnable> queue;
        private final int maxRetries;
        private int retryCount = 0;

        public WithdrawTask(BankAccount1 account, int amount, CountDownLatch latch,
                            AtomicInteger totalWithdrawals,
                            BlockingQueue<Runnable> queue, int maxRetries) {
            this.account = account;
            this.amount = amount;
            this.latch = latch;
            this.totalWithdrawals = totalWithdrawals;
            this.queue = queue;
            this.maxRetries = maxRetries;
        }

        @Override
        public void run() {
            boolean success = account.withdraw(amount, false);
            if (!success && retryCount < maxRetries) {
                retryCount++;
                try {
                    queue.put(this); // 重新入队
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            } else if (success) {
                totalWithdrawals.addAndGet(amount);
            }
            latch.countDown();
        }
    }
}
```

主要学的是CountDownLatch的使用方式，以及需要重试的时候，应该先将任务放入队列中，然后再提交到线程池执行，线程池本身是不支持重试的，异步的话，需要将任务放在mq中，由mq来将任务提交到线程池中这样不仅异步还能重试


