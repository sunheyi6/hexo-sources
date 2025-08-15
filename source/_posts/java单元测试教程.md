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
    <groupId>org.mockito</groupId>
    <artifactId>mockito-core</artifactId>
    <version>5.18.0</version>
    <scope>test</scope>
</dependency>
		<!--静态方法用这个-->
<dependency>
    <groupId>org.mockito</groupId>
    <artifactId>mockito-inline</artifactId>
    <version>5.2.0</version>
    <scope>test</scope>
</dependency>
```
## 常见的几种情况
### 其他服务
当你a类中的方法调用b服务的方法的时候，需要去mockb服务方法返回的时候直接使用when then即可
1. 将b类mock一下
2. when(b.method).then(returnValue);
### 静态方法
> 如果是静态方法的mock,需要使用mockito-inline
```java
Mockito.mockStatic(StaticDemo.class);
when(StaticDemo.staticMethod()).thenReturn("mocked static method");
```
#### 链式调用
```java
//示例方法
Stirng name=StaticDemo.getUser.getUuserName();

//单元测试
Mockito.mockStatic(StaticDemo.class);
StaticDemo staticDemo=mock(StaticDemo.class);
when(StaticDemo.staticMethod()).thenReturn(staticDemo);
when(staticDemo.getUuserName()).thenReturn("userName");
```
### 多次调用
在同一个类中多次mock调用同一个类，调用同一个静态方法的情况，需要每次mock的时候，都去释放掉这个资源
> mockStatic这个方法一定要给变量名字，否则无法自动释放，当然也会直接报错，如果有多个调用直接分号隔开，加在后面即可
```java
try (MockedStatic<StaticDemo> mockedStatic = Mockito.mockStatic(StaticDemo.class);
MockedStatic<StaticDemo1> mockedStatic = Mockito.mockStatic(StaticDemo1.class)) {
when(StaticDemo.staticMethod()).thenReturn("mocked static method");
when(StaticDemo1.staticMethod()).thenReturn("mocked static method 1");
}
```
### @value
```java
import org.junit.jupiter.api.Test;
import java.lang.reflect.Field;
import static org.junit.jupiter.api.Assertions.*;

class MyServiceTest {

    @Test
    void testGetGreeting_WithReflection() throws Exception {
        // 1. 创建被测试对象
        MyService myService = new MyService();

        // 2. 使用反射，强行设置私有字段 appName 的值
        Field field = MyService.class.getDeclaredField("appName");
        field.setAccessible(true); // 允许访问私有字段
        field.set(myService, "MyApp"); // 手动赋值

        // 3. 调用方法并断言
        String greeting = myService.getGreeting();
        assertEquals("Hello, MyApp", greeting);
    }
}
```
### final
	
使用 mock(MyClass.class)然后对 final 方法 stub

✅ 必须引入 mockito-inline
### 异常
```java
//junit4
@Test(expected = 异常类.class)
//junit5
    assertThrows(
        IllegalArgumentException.class,
        () -> calculator.divide(10, 0)
    );
```
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

