import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// 基于 Prisma schema 生成的类型安全客户端
// 使用 Prisma 查询语言
// 自动应用 schema 中定义的规则
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
    // 添加连接池配置
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

// 只在服务器端检查数据库连接
if (process.env.NODE_ENV !== 'production' && typeof window === 'undefined') {
  // 在开发环境中检查数据库连接（仅服务器端）
  prisma
    .$connect()
    .then(() => {
      console.log('✅ 数据库连接成功')
    })
    .catch((error) => {
      console.error('❌ 数据库连接失败:', error)
    })
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
