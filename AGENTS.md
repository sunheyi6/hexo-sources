# Hexo 博客项目说明

## 启动项目

```bash
hexo clean; hexo generate; hexo server
```

或者使用 npm 脚本：

```bash
npm run clean
npm run build
npm run server
```

## 常用命令

| 命令 | 说明 |
|------|------|
| `hexo clean` | 清除缓存和已生成的静态文件 |
| `hexo generate` / `hexo g` | 生成静态文件 |
| `hexo server` / `hexo s` | 启动本地服务器 |
| `hexo deploy` / `hexo d` | 部署到远程服务器 |

## 图片管理

```bash
# 整理零散图片
npm run img:organize

# 处理 Markdown 中的图片引用
npm run img:process

# 执行全部图片整理操作
npm run img:all
```

## 项目结构

- `_config.yml` - 站点配置文件
- `source/_posts/` - 博客文章目录
- `source/images/` - 图片资源目录（按年/月自动分类）
- `themes/next/` - Next 主题目录
- `scripts/` - 自定义脚本目录
