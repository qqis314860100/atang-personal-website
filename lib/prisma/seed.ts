import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('开始恢复数据...')

  // 创建用户
  const user = await prisma.userProfile.upsert({
    where: { id: 'default-user' },
    update: {},
    create: {
      id: 'default-user',
      username: 'admin',
      email: 'admin@example.com',
      avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
      bio: '系统管理员',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })

  // 创建分类
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { id: 'tech' },
      update: {},
      create: {
        id: 'tech',
        name: '技术',
        description: '技术相关文章',
        author: 'admin',
        userId: user.id,
      },
    }),
    prisma.category.upsert({
      where: { id: 'life' },
      update: {},
      create: {
        id: 'life',
        name: '生活',
        description: '生活感悟',
        author: 'admin',
        userId: user.id,
      },
    }),
    prisma.category.upsert({
      where: { id: 'tutorial' },
      update: {},
      create: {
        id: 'tutorial',
        name: '教程',
        description: '学习教程',
        author: 'admin',
        userId: user.id,
      },
    }),
  ])

  // 创建示例文章
  const posts = await Promise.all([
    prisma.post.upsert({
      where: { id: 'welcome-post' },
      update: {},
      create: {
        id: 'welcome-post',
        title: '欢迎来到我的博客',
        body: `# 欢迎来到我的博客

这是一个使用 Next.js 和 Prisma 构建的现代化博客系统。

## 功能特性

- 📝 文章管理
- 🏷️ 分类管理
- 🔍 搜索功能
- 📊 数据统计
- 📱 响应式设计

## 技术栈

- **前端**: Next.js 14, React, TypeScript
- **样式**: Tailwind CSS
- **数据库**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **部署**: Vercel

开始你的博客之旅吧！`,

        author: 'admin',
        userId: user.id,
        categoryId: categories[0].id,
        viewCount: 0,
      },
    }),
    prisma.post.upsert({
      where: { id: 'getting-started' },
      update: {},
      create: {
        id: 'getting-started',
        title: '快速开始指南',
        body: `# 快速开始指南

## 第一步：环境准备

确保你的开发环境已经安装了：

- Node.js 18+
- npm 或 yarn
- Git

## 第二步：克隆项目

\`\`\`bash
git clone <your-repo-url>
cd your-project
\`\`\`

## 第三步：安装依赖

\`\`\`bash
npm install
\`\`\`

## 第四步：配置环境变量

复制 \`.env.example\` 到 \`.env.local\` 并填写你的配置：

\`\`\`env
DATABASE_URL="your-database-url"
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
\`\`\`

## 第五步：运行开发服务器

\`\`\`bash
npm run dev
\`\`\`

现在你可以在 http://localhost:3000 访问你的应用了！`,

        author: 'admin',
        userId: user.id,
        categoryId: categories[2].id,
        viewCount: 0,
      },
    }),
    prisma.post.upsert({
      where: { id: 'features-overview' },
      update: {},
      create: {
        id: 'features-overview',
        title: '功能特性概览',
        body: `# 功能特性概览

## 🎯 核心功能

### 文章管理
- 创建、编辑、删除文章
- Markdown 支持
- 文章分类
- 阅读量统计

### 用户系统
- 用户注册和登录
- 个人资料管理
- 权限控制

### 数据统计
- 页面访问统计
- 用户行为分析
- 实时数据监控

## 🚀 高级功能

### 搜索功能
- 全文搜索
- 分类筛选
- 搜索结果高亮

### 响应式设计
- 移动端适配
- 桌面端优化
- 渐进式增强

### 性能优化
- 图片懒加载
- 代码分割
- 缓存策略

## 🔧 技术特性

- **SEO 友好**: 服务端渲染
- **类型安全**: TypeScript 支持
- **现代化**: 最新的 React 特性
- **可扩展**: 模块化架构`,

        author: 'admin',
        userId: user.id,
        categoryId: categories[0].id,
        viewCount: 0,
      },
    }),
  ])

  console.log('✅ 数据恢复完成！')
  console.log(`📊 创建了 ${categories.length} 个分类`)
  console.log(`📝 创建了 ${posts.length} 篇文章`)
  console.log(`👤 创建了 1 个用户`)
}

main()
  .catch((e) => {
    console.error('❌ 数据恢复失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
