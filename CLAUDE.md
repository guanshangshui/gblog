# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

Gblog 是一个基于 Astro 构建的静态博客系统,使用 Tailwind CSS 进行样式设计,支持 MDX 和 Markdown 格式文章。该项目的核心理念是让用户无需编写前端代码即可快速搭建美观的博客网站。

## 开发命令

```bash
# 开发环境 - 启动带热重载的本地开发服务器
npm run dev

# 生产构建 - 将站点打包为静态文件
npm run build

# 预览构建结果
npm run preview

# 代码检查
npm run lint

# 自动修复 lint 错误
npm run lint:fix
```

## 核心架构

### 内容集合 (Content Collections)

项目使用 Astro 的内容集合系统管理所有内容,定义在 `src/content/config.ts`:

- **posts**: 博客文章 (Markdown/MDX 格式)
  - 必需字段: `title`, `description`, `banner`, `category`, `pubDate`
  - 可选字段: `banner2` (列表页显示), `ogImage`, `selected` (精选文章), `tags`, `toc` (目录)

- **categories**: 文章分类目录
  - 字段: `title`, `description`

- **friends**: 友链数据 (JSON 格式)
  - 字段: `title`, `name`, `description`, `avatar`, `avatarDark`, `social`

### 配置文件

**`src/config.ts`** - 站点全局配置:
- `SITE`: 站点基础信息 (标题、URL、描述等)
- `NavigationLinks`: 导航菜单
- `FooterLinks`: 页脚链接
- `Settings`: 功能开关
  - `GoogleAnalytics`: Google 分析配置
  - `UmamiAnalytics`: Umami 分析配置
  - `Comment`: Giscus 评论系统配置
  - `Assets`: S3/R2 资源上传配置

**`astro.config.mjs`** - Astro 框架配置:
- 集成: MDX, Tailwind, React, Sitemap, Partytown, 压缩优化
- Markdown: 使用 rehype-pretty-code 进行代码高亮,支持复制按钮
- 图片优化: 可通过 `ASTRO_IMAGE_OPTIMIZE` 环境变量控制
- 资源前缀: 支持 S3/R2 CDN (通过 `build.assetsPrefix`)

### 目录结构

```
src/
├── components/       # 可复用组件
│   ├── BaseHead.astro      # HTML head 元数据
│   ├── Header.astro        # 站点头部
│   ├── Footer.astro        # 站点页脚
│   ├── blog/              # 博客相关组件
│   ├── ui/                # UI 基础组件
│   └── support/           # 辅助组件
├── content/         # 内容集合
│   ├── posts/            # 博客文章 (Markdown/MDX)
│   ├── categories/       # 分类定义
│   └── friends/          # 友链数据
├── layouts/         # 布局模板
│   └── BaseLayout.astro  # 基础布局
├── pages/           # 页面路由
│   ├── index.astro       # 首页
│   ├── posts/            # 文章列表和详情页
│   ├── categories/       # 分类页面
│   ├── tags/             # 标签页面
│   ├── friends.astro     # 友链页面
│   ├── timeline.astro    # 时间线页面
│   └── rss.xml.ts        # RSS 订阅
├── support/         # 工具函数
│   ├── plugins.ts        # Remark 插件 (阅读时间计算)
│   ├── uploader.ts       # S3/R2 上传集成
│   ├── paths.ts          # 路径处理
│   ├── time.ts           # 时间格式化
│   └── image.ts          # 图片处理
├── config.ts        # 全局配置
└── types.ts         # TypeScript 类型定义
```

### 自定义插件

- **remarkReadingTime** (`src/support/plugins.ts`): 计算文章阅读时间,自动注入到 frontmatter 的 `minutesRead` 字段
- **uploadAssetsToS3** (`src/support/uploader.ts`): 构建后自动上传 `assets` 文件夹到 S3/R2 存储

### 环境变量

可选的环境变量 (参考 `.env.example`):
- `S3_ENABLE`: 启用 S3/R2 上传
- `S3_ENDPOINT`: S3 端点 URL
- `S3_BUCKET`: 存储桶名称
- `S3_ACCESS_KEY`: 访问密钥
- `S3_SECRET_ACCESS_KEY`: 密钥
- `ASTRO_IMAGE_OPTIMIZE`: 启用构建时图片优化
- `COMMENT_ENABLE`: 启用评论系统

**注意**: Cloudflare Pages 环境变量为字符串类型,要禁用功能需删除环境变量而非设为 `false`

## 关键技术决策

1. **静态生成**: 项目使用 `output: 'static'` 完全静态化,无服务端渲染
2. **代码高亮**: 使用 `rehype-pretty-code` + `shiki`,支持亮暗主题切换和代码复制
3. **图片优化**: 可选的 Sharp 图片优化,通过环境变量控制
4. **CDN 支持**: 构建产物可上传至 S3/R2,通过 `assetsPrefix` 自动替换资源链接
5. **压缩优化**: 使用 `@playform/compress` 压缩 HTML/CSS/JS/SVG

## 工作流程

### 添加新文章

1. 在 `src/content/posts/` 创建 `.md` 或 `.mdx` 文件
2. 添加必需的 frontmatter 字段
3. 运行 `npm run dev` 预览
4. 构建后文章会自动生成静态页面

### 修改站点配置

1. 编辑 `src/config.ts` 修改站点信息、导航菜单等
2. 如需修改构建配置,编辑 `astro.config.mjs`
3. 评论系统配置在 `src/config.ts` 的 `Settings.Comment.giscus`

### 部署

项目支持多种部署方式:
- **Zeabur**: 一键部署
- **Vercel**: 通过 Vercel 按钮部署
- **手动部署**: 运行 `npm run build` 后部署 `dist/` 目录

构建产物位于 `dist/` 目录,可部署到任何静态托管服务。
