# atang-personal-website

我的个人网站，功能包含了博客系统、用户资料、视频管理、视频弹幕、deepseek ai助手、聊天室等功能。

## 技术栈

- **前端**: Next.js + React
- **后端**: Supabase + Prisma
- **数据库**: PostgreSQL
- **样式**: Tailwind CSS
- **AI集成**: DeepSeek AI助手

## 功能特性

- 📝 博客系统
- 👤 用户资料管理
- 🎥 视频管理
- 💬 视频弹幕系统
- 🤖 AI助手集成
- 💭 实时聊天室

## 开始使用

首先，运行开发服务器：

```bash
npm run dev
# 或者
yarn dev
# 或者
pnpm dev
# 或者
bun dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看结果。

## 环境配置

1. 复制 `.env.local.example` 为 `.env.local`
2. 配置必要的环境变量：
   - Supabase 配置
   - 数据库连接
   - API 密钥等

## 部署

推荐使用 [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) 部署 Next.js 应用。

查看 [Next.js 部署文档](https://nextjs.org/docs/deployment) 了解更多详情。
