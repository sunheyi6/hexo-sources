---
title: rbbitmq安装以及使用问题
abbrlink: 7f50ae3f
date: 2025-09-02 22:19:36
tags: 
- rabbitmq
categories:
- 技术
description:
---

<!-- more -->
记录下rabbitmq windows安装以及实际使用问题
## 安装
1. [rabbitmq](https://www.rabbitmq.com/docs/download) 直接下载
2. 到安装的sbin目录下启用控制台
```shell
D:\soft\rabbitMq\rabbitmq_server-4.1.3\sbin>

rabbitmq-plugins.bat enable rabbitmq_management
```
3. 启动即可
```shell
rabbitmq-service.bat start
```
## 实际使用
### 配置
```properties
spring.rabbitmq.listener.simple.acknowledge-mode=manual
spring.rabbitmq.listener.simple.concurrency=5
spring.rabbitmq.listener.simple.max-concurrency=10
spring.rabbitmq.listener.simple.prefetch=1
```
### 代码
```java
import com.rabbitmq.client.Channel;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class TestMessageConsumer {

    // 监听队列 test，使用手动 ack 模式
    @RabbitListener(queues = "test",ackMode = "MANUAL")
    public void receiveMessage(String message, Channel channel,
                               @Header(AmqpHeaders.DELIVERY_TAG) long deliveryTag) throws IOException {


        try {
            System.out.println("[消费者] 收到消息: " + message + "，线程: " + Thread.currentThread().getName());
            // 假设处理成功 ✅
            System.out.println("[消费者] 消息处理成功: " + message);

            // 手动确认消息（ACK）—— 告诉 MQ 这条消息我已经成功处理，可以移除了
            channel.basicAck(deliveryTag, false); // false 表示不批量 ack
            System.out.println("[消费者] 已 ACK 消息，deliveryTag: " + deliveryTag);

        } catch (Exception e) {
            System.err.println("[消费者] 消息处理失败: " + message + "，异常: " + e.getMessage());

            // 手动拒绝消息，并重新放回队列（或者进入死信队列）
            // basicNack(deliveryTag, false, true)：
            //   - false：不批量
            //   - true：重新入队（requeue = true）
            channel.basicNack(deliveryTag, false, true);
            System.out.println("[消费者] 已 NACK 消息并重新入队，deliveryTag: " + deliveryTag);
        }
    }
}
```
