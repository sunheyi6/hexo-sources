---
title: 添加waline评论系统
description: ''
tags:
  - 无标签
abbrlink: 4c9421db
date: 2023-05-16 00:00:00
---


记录下我添加这个评论系统的一些问题



<!-- more -->
# 1.安装Waline插件
```bash
npm install @waline/hexo-next --save
```
# 2. 配置 Waline
```bash
waline:
  enable: true #是否开启
  serverURL:  # Waline #服务端地址，我们这里就是上面部署的 Vercel 地址
  locale:
  placeholder: 请文明评论呀 # 评论框的默认文字
  avatar: mm # 头像风格
  meta: [nick, mail, link] # 自定义评论框上面的三个输入框的内容
  pageSize: 10 # 评论数量多少时显示分页
  lang: zh-cn # 语言, 可选值: en, zh-cn
  # Warning: 不要同时启用 `waline.visitor` 以及 `leancloud_visitors`.
  visitor: true # 文章阅读统计
  comment_count: true # 如果为 false , 评论数量只会在当前评论页面显示, 主页则不显示
  requiredFields: [] # 设置用户评论时必填的信息，[nick,mail]: [nick] | [nick, mail]
  libUrl: # Set custom library cdn url
```

# 参考链接



- [Hexo: Next 主题使用 Waline 评论系统](https://www.zuicy.party/2022/05/03/Hexo_Next_%E4%B8%BB%E9%A2%98%E4%BD%BF%E7%94%A8_Waline%E8%AF%84%E8%AE%BA%E7%B3%BB%E7%BB%9F/#%E6%9B%B4%E6%96%B0NexT%E5%88%B0v8-5-0)



# 问题



- 我一开始是使用的LeanCloud的华北的，但是有点问题，没有独立的域名，所以我又在国际版注册一下就好了。

- vercl的环境变量配置正确，基本就没啥问题了
