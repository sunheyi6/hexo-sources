---
title: 从 Kimi CLI 到 Cloud Code：我在 Sun CLI 中的设计思考与实践
abbrlink: 68e667c2
date: 2026-03-22 18:59:42
tags:
categories:
description:
---
一些有意思的思考与实践，分享给其他开发者
<!-- more -->
## 设计思考
### 提示词
比如你要做一个自己的类似于openclaw的，提示应该这么分层设计
- SOUL.md（基础规则，所有场景加载）：
- AGENTS.md（身份层，普通 /heartbeat 加载）：
- TOOLS.md（技能层，仅普通会话加载）：
- 动态注入（运行时加）
#### 强约束
 MD 提示词本质是「软引导」，AI 只会 “选择性遵守”；而结构化输出（JSON Schema 强约束）才是「硬规则」比如可以用JSON Schema 做强校验

### 工具
### 设计
- 基础工具（core / foundation tools） ≈ 4–6 个左右，最常见的就是：read：读取文件内容
write：创建/覆盖写入文件
edit：针对文件内容的结构化/局部修改
exec / bash / run command：执行 shell 命令（这是最危险但也最强大的一个）
- 其他所有能力都做成可插拔的 Skill / Plugin / Tool：浏览器操作（browse、web_search、web_fetch、screenshot 等）
发送消息（Telegram、Discord、邮件等）
日历、Gmail、Obsidian、Google Docs 集成
代码相关（git、patch、lint 等）
甚至让 agent 自己去“发现并安装”新工具的能力（self-installing tools）



#### web search
一般就两种方式，一种是直接调用api，一种是爬取网页内容
