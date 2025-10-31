---
title: controller添加aop记录日志
categories:
  - 技术
abbrlink: dd42d340
date: 2025-09-08 09:55:29
tags:
description:
---
controller添加aop记录日志
<!-- more -->
```java
package com.example.demo.demos.demo;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.Set;

@Aspect
@Component
public class ControllerLogAspect {
    private static final Logger logger = LoggerFactory.getLogger(ControllerLogAspect.class);
    private static final ThreadLocal<Long> START_TIME = new ThreadLocal<>();
    
    private static final Set<Class<?>> SIMPLE_TYPES = Set.of(
        String.class, Integer.class, Long.class, Double.class, Float.class,
        Boolean.class, Short.class, Byte.class, Character.class
    );

    private final ObjectMapper objectMapper;

    public ControllerLogAspect(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Pointcut("execution(* com.example.demo.controller..*.*(..)) || " +
              "execution(* com.example.demo..*Controller.*(..))")
    public void controllerPointcut() {}

    @Before("controllerPointcut()")
    public void logBefore(JoinPoint joinPoint) {
        if (!logger.isInfoEnabled()) return;
        
        START_TIME.set(System.currentTimeMillis());
        
        try {
            String className = joinPoint.getTarget().getClass().getSimpleName();
            String methodName = joinPoint.getSignature().getName();
            Object[] args = joinPoint.getArgs();

            logger.info("🚀 进入方法: {}.{}()", className, methodName);
            
            if (args.length > 0) {
                logger.info("📋 参数列表:");
                for (int i = 0; i < args.length; i++) {
                    Object arg = args[i];
                    String typeName = arg != null ? arg.getClass().getSimpleName() : "null";
                    String argDisplay = convertArgToString(arg);
                    logger.info("  参数[{}]: 类型={}, 值={}", i, typeName, argDisplay);
                }
            } else {
                logger.info("📋 无参数");
            }
        } catch (Exception e) {
            logger.warn("记录入参日志时发生异常", e);
        }
    }

    @AfterReturning(pointcut = "controllerPointcut()", returning = "result")
    public void logAfterReturning(JoinPoint joinPoint, Object result) {
        if (!logger.isInfoEnabled()) return;
        
        try {
            Long startTime = START_TIME.get();
            long executionTime = startTime != null ? System.currentTimeMillis() - startTime : -1;
            
            String className = joinPoint.getTarget().getClass().getSimpleName();
            String methodName = joinPoint.getSignature().getName();

            logger.info("✅ 方法返回: {}.{}()", className, methodName);
            logger.info("⏱️ 执行时间: {}ms", executionTime);

            if (result != null) {
                String resultJson = convertArgToString(result);
                logger.info("📤 返回类型: {}, 值: {}", 
                    result.getClass().getSimpleName(), resultJson);
            } else {
                logger.info("📤 返回值为null");
            }
        } catch (Exception e) {
            logger.warn("记录出参日志时发生异常", e);
        } finally {
            START_TIME.remove();
        }
    }

    private String convertArgToString(Object arg) {
        if (arg == null) {
            return "null";
        }
        
        Class<?> clazz = arg.getClass();
        
        // 文件类型特殊处理 - 保留文件名！
        if (arg instanceof MultipartFile file) {
            return String.format("MultipartFile{filename=%s, size=%d, contentType=%s}",
                file.getOriginalFilename(), file.getSize(), file.getContentType());
        }
        
        // 文件数组处理
        if (arg instanceof MultipartFile[] files) {
            StringBuilder sb = new StringBuilder("MultipartFile[");
            for (int i = 0; i < files.length; i++) {
                if (i > 0) sb.append(", ");
                MultipartFile file = files[i];
                sb.append(String.format("{filename=%s, size=%d}", 
                    file.getOriginalFilename(), file.getSize()));
            }
            sb.append("]");
            return sb.toString();
        }
        
        // 简单类型直接toString
        if (clazz.isPrimitive() || SIMPLE_TYPES.contains(clazz)) {
            return arg.toString();
        }
        
        // 其他复杂对象使用JSON序列化
        try {
            return objectMapper.writeValueAsString(arg);
        } catch (Exception e) {
            return String.format("[序列化失败: %s - 原始值: %s]", e.getMessage(), arg.toString());
        }
    }
}
```
