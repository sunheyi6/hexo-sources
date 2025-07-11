---
title: mybatis常见问题
date: 2022-06-22 08:53:05
tags:
categories:
description:
---
mybatis常见问题
<!-- more -->
# 插件

## Free Mybatis plugin

主要是用于mapper和xml之间跳转

## MybatisX

mybaitsplus官方提供的插件，提供了很多的功能，需要的可以自行去查看，似乎也提供了mapper和xml之间的跳转

# @param

这个注解的意思就是 传递的参数，不管是实体类还是其他基本类型，如果用了这个参数，xml中# 对应的参数就要和这个参数名字一致
**用了这个参数，xml中就不需要parameterType了**
实体类的时候，需要注意字段的大小写

不使用@param的时候，如果传参是一个对象，就可以直接使用这个对象的属性值

## 传参为实体类

不仅写了@param注解，而且对应的xml中有parameterType，就会报下面的错误，
只需要把其中一个去掉就可以了
仅仅保留parameterType的话，可以直接使用实体类中的变量名字

# like

使用like进行左右字符串连接的时候，记得要使用concat方法，

比如concat('%',#{a},'%')，而不是直接'%#{a}%',后面这种方式是识别不了参数的，大概率会报一个参数数量超过索引的一个错误

# limit

要使用\$而不是#，#是不生效的

# oracle

```sql
在使用分页的时候，如果是直接给定的值，可以使用<或者>,
但是如果你是计算之后才去比较的，，需要注意转义字符，比如原来的<= 可以换为    <![CDATA[<=]]>
```

# 单引号

正常来说大于等于两个值的比较是下面这样使用的

```xml
<if test 'branchCom!=null and branchCom!=""'>
</if>
```

但是如果比较的是单个字符，应该使用下面格式

```xml
<if test "id==2">
</if>
```

# 注意

*   新建mapper扫描的文件夹的时候，记得要一个一个文件夹建立，否则你直接建立的是类似于 mybatis.mapper 文件名的文件夹，而不是一个mybatis文件中有一个mapper的文件夹
*   在xml中mybatis组件中不需要转换加减乘除

# 报错

## Invalid bound statement (not found):

1.  在对应的target目录下查看对应的xml文件是否生成，没有的话，删除整个target，重新运行程序
2.  也有可能是上面注意的那个问题

