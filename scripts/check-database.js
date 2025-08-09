// 检查数据库中的页面停留时间数据
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const checkDatabase = async () => {
  console.log('🔍 检查数据库中的页面停留时间数据...')

  try {
    // 检查PageView表
    console.log('\n1. 检查PageView表...')
    const pageViews = await prisma.pageView.findMany({
      take: 5,
      orderBy: { timestamp: 'desc' },
    })

    console.log(`📊 找到 ${pageViews.length} 条PageView记录:`)
    pageViews.forEach((view, index) => {
      console.log(
        `  ${index + 1}. 页面: ${view.page}, 停留时间: ${
          view.duration || 'N/A'
        }秒, 时间: ${view.timestamp}`
      )
    })

    // 检查UserSession表
    console.log('\n2. 检查UserSession表...')
    const sessions = await prisma.userSession.findMany({
      take: 5,
      orderBy: { started_at: 'desc' },
    })

    console.log(`📊 找到 ${sessions.length} 条UserSession记录:`)
    sessions.forEach((session, index) => {
      console.log(
        `  ${index + 1}. 会话时长: ${session.duration || 'N/A'}秒, 页面数: ${
          session.page_count
        }, 开始时间: ${session.started_at}`
      )
    })

    // 检查有停留时间的页面
    console.log('\n3. 检查有停留时间的页面...')
    const pagesWithDuration = await prisma.pageView.findMany({
      where: {
        duration: { not: null },
      },
      orderBy: { timestamp: 'desc' },
    })

    console.log(`📊 找到 ${pagesWithDuration.length} 条有停留时间的页面记录:`)
    pagesWithDuration.forEach((view, index) => {
      console.log(
        `  ${index + 1}. 页面: ${view.page}, 停留时间: ${view.duration}秒`
      )
    })
  } catch (error) {
    console.error('❌ 检查数据库失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase()
