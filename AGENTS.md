# Hexo 博客项目说明

## 启动项目

```bash
hexo clean; hexo generate; hexo server
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

## 工作准则

- **不要自动提交更改**: 当用户说"记一下"时，只需记录信息，不要自动执行 `git commit`
  - 应等待用户明确指示后再提交更改

## 文章写作风格

- 新建文章、扩写或润色时，**一律按 `blog-article` skill 的风格来写**（定义见 `.agents/skills/blog-article/SKILL.md`）：口语化、第一人称、重个人经历与真实感受，用"第一/第二/第三"或"第一步/第二步"编号小节推进，要点用 `- **关键词**：解释` 列表，结尾要有"收"（总结 / 展望 / 提问）
- 写作步骤：先按要点列结构确认 → 用 `write` 在 `source/_posts/` 新建文件（含 front matter + 点题句 + `<!-- more -->`）→ 改动用 `edit` 局部修改 → 完成后提示可本地预览
