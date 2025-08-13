---
title: java单元测试教程
date: 2025-08-11 09:21:45
tags:
categories:
description:
---
还是记录一下单元测试常见的例子吧，要不每次都去查太麻烦了
<!-- more -->

## 依赖
```xml
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
		<!--静态方法用这个-->
        <dependency>
            <groupId>org.mockito</groupId>
            <artifactId>mockito-inline</artifactId>
            <version>4.0.0</version>
            <scope>test</scope>
        </dependency>
```
## 常见的几种情况
### 其他服务
当你a类中的方法调用b服务的方法的时候，需要去mockb服务方法返回的时候直接使用when then即可
1. 将b类mock一下
2. when(b.method).then(returnValue);
### 静态方法
```java
package com.example.springbootdemo.demos.demo;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.mockito.Mockito;

import java.io.PrintStream;

import static org.mockito.Mockito.*;

/**
 * DemoServiceImpl类的单元测试
 */
class DemoServiceImplTest {

    // 被测对象
    private DemoServiceImpl demoService;

    // 用于mock静态方法
    private MockedStatic<StaticDemo> mockedStatic;

    @BeforeEach
    void setUp() {
        // 初始化被测对象
        demoService = new DemoServiceImpl();
        // 开始mock StaticDemo类的静态方法
        mockedStatic = Mockito.mockStatic(StaticDemo.class);
    }

    @AfterEach
    void tearDown() {
        // 清理mock对象，防止影响其他测试用例
        mockedStatic.close();
    }

    /**
     * 测试demoTest方法的基本逻辑
     * 验证StaticDemo.test方法被正确调用，并且返回值被打印
     */
    @Test
    void demoTest() {
        // 准备测试数据
        String input = "demoTest";
        String expectedOutput = "11";

        // Mock静态方法的行为
        mockedStatic.when(() -> StaticDemo.test(input)).thenReturn(expectedOutput);

        // Mock System.out以验证打印行为（可选）
        PrintStream mockPrintStream = mock(PrintStream.class);
        PrintStream originalPrintStream = System.out;
        System.setOut(mockPrintStream);

        try {
            // 执行被测方法
            demoService.demoTest();

            // 验证StaticDemo.test方法被调用了一次，并且参数正确
            mockedStatic.verify(() -> StaticDemo.test(input), times(1));

            // 验证System.out.println被调用了一次，并且参数正确
            verify(mockPrintStream, times(1)).println(expectedOutput);
        } finally {
            // 恢复原始的System.out
            System.setOut(originalPrintStream);
        }
    }
}
```
### @value
### final变量
### 调用同一个类中的一个方法
推荐使用spy来mock部分方法,被测方法
```java
public class Calculator {

    public int add(int a, int b) {
        return a + b;
    }

    public int addThenDouble(int a, int b) {
        int sum = add(a, b); // 调用了同一类的 add 方法
        return sum * 2;
    }
}
```
单元测试
```java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

public class CalculatorTest {

    @Test
    public void testAddThenDoubleWithSpy() {
        // 创建真实对象，然后用 Mockito.spy 包装它（部分 mock）
        Calculator calculator = spy(new Calculator());

        // 假设我们想 mock 内部调用的 add 方法，让它返回固定值 100，而不是真实计算
        when(calculator.add(anyInt(), anyInt())).thenReturn(100);

        int result = calculator.addThenDouble(2, 3); // 原本应该算 2+3=5，然后 5 * 2=10
        // 但由于我们 mock 了 add 方法，让它返回 100，所以结果是 100 * 2 = 200
        assertEquals(200, result);
    }
}
```

