// 弹幕系统 Prisma 服务
// 适配 Supabase PostgreSQL 数据库

import { PrismaClient } from '@prisma/client'
import { DanmakuData, DanmakuType } from './danmaku-system'

const prisma = new PrismaClient()

export class DanmakuPrismaService {
  // 保存弹幕到数据库
  async saveDanmaku(danmaku: DanmakuData): Promise<boolean> {
    try {
      await prisma.danmaku.create({
        data: {
          id: danmaku.id,
          videoId: danmaku.videoId,
          userId: danmaku.userId,
          content: danmaku.content,
          timeMs: danmaku.timeMs,
          type: danmaku.type,
          fontSize: danmaku.fontSize,
          color: danmaku.color,
          timestampMs: BigInt(danmaku.timestamp),
          poolType: danmaku.poolType,
          userHash: danmaku.userHash || '',
          rowId: danmaku.rowId || undefined,
        },
      })

      // 更新统计信息
      await this.updateDanmakuStats(danmaku.videoId, danmaku.type)

      // 更新时间分布
      await this.updateTimeDistribution(danmaku.videoId, danmaku.timeMs)

      console.log('弹幕已保存到数据库:', danmaku.id)
      return true
    } catch (error) {
      console.error('保存弹幕失败:', error)
      return false
    }
  }

  // 批量保存弹幕
  async saveDanmakuBatch(danmakuList: DanmakuData[]): Promise<boolean> {
    try {
      const danmakuData = danmakuList.map((danmaku) => ({
        id: danmaku.id,
        videoId: danmaku.videoId,
        userId: danmaku.userId,
        content: danmaku.content,
        timeMs: danmaku.timeMs,
        type: danmaku.type,
        fontSize: danmaku.fontSize,
        color: danmaku.color,
        timestampMs: BigInt(danmaku.timestamp),
        poolType: danmaku.poolType,
        userHash: danmaku.userHash || '',
        rowId: danmaku.rowId || undefined,
      }))

      await prisma.danmaku.createMany({
        data: danmakuData,
        skipDuplicates: true,
      })

      // 批量更新统计信息
      await this.batchUpdateStats(danmakuList)

      console.log(`批量保存了 ${danmakuList.length} 条弹幕`)
      return true
    } catch (error) {
      console.error('批量保存弹幕失败:', error)
      return false
    }
  }

  // 根据视频ID和时间范围获取弹幕
  async getDanmakuByTimeRange(
    videoId: string,
    startTimeMs: number,
    endTimeMs: number,
    poolType: number = 0
  ): Promise<DanmakuData[]> {
    try {
      const danmakuList = await prisma.danmaku.findMany({
        where: {
          videoId,
          timeMs: {
            gte: startTimeMs,
            lte: endTimeMs,
          },
          poolType,
        },
        orderBy: {
          timeMs: 'asc',
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      })

      return danmakuList.map((danmaku) => ({
        id: danmaku.id,
        videoId: danmaku.videoId,
        userId: danmaku.userId,
        content: danmaku.content,
        timeMs: danmaku.timeMs,
        type: danmaku.type as DanmakuType,
        fontSize: danmaku.fontSize,
        color: danmaku.color,
        timestamp: Number(danmaku.timestampMs),
        poolType: danmaku.poolType,
        userHash: danmaku.userHash || '',
        rowId: danmaku.rowId || undefined,
      }))
    } catch (error) {
      console.error('获取弹幕失败:', error)
      return []
    }
  }

  // 获取视频的所有弹幕
  async getAllDanmaku(
    videoId: string,
    poolType: number = 0
  ): Promise<DanmakuData[]> {
    try {
      const danmakuList = await prisma.danmaku.findMany({
        where: {
          videoId,
          poolType,
        },
        orderBy: {
          timeMs: 'asc',
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      })

      return danmakuList.map((danmaku) => ({
        id: danmaku.id,
        videoId: danmaku.videoId,
        userId: danmaku.userId,
        content: danmaku.content,
        timeMs: danmaku.timeMs,
        type: danmaku.type as DanmakuType,
        fontSize: danmaku.fontSize,
        color: danmaku.color,
        timestamp: Number(danmaku.timestampMs),
        poolType: danmaku.poolType,
        userHash: danmaku.userHash || '',
        rowId: danmaku.rowId || undefined,
      }))
    } catch (error) {
      console.error('获取所有弹幕失败:', error)
      return []
    }
  }

  // 获取弹幕统计信息
  async getDanmakuStats(videoId: string): Promise<{
    totalCount: number
    typeCount: { [key in DanmakuType]: number }
    timeDistribution: { [key: string]: number }
  }> {
    try {
      // 获取统计信息
      const stats = await prisma.danmakuStats.findUnique({
        where: { videoId },
      })

      // 获取时间分布
      const timeDistribution = await prisma.danmakuTimeDistribution.findMany({
        where: { videoId },
        orderBy: { timeBucket: 'asc' },
      })

      const timeDistributionMap: { [key: string]: number } = {}
      timeDistribution.forEach((item) => {
        const timeRange = `${item.timeBucket}-${item.timeBucket + 9}s`
        timeDistributionMap[timeRange] = item.danmakuCount
      })

      return {
        totalCount: stats?.totalCount || 0,
        typeCount: {
          [DanmakuType.SCROLL]: stats?.scrollCount || 0,
          [DanmakuType.TOP]: stats?.topCount || 0,
          [DanmakuType.BOTTOM]: stats?.bottomCount || 0,
          [DanmakuType.REVERSE]: stats?.reverseCount || 0,
          [DanmakuType.ADVANCED]: stats?.advancedCount || 0,
        },
        timeDistribution: timeDistributionMap,
      }
    } catch (error) {
      console.error('获取弹幕统计失败:', error)
      return {
        totalCount: 0,
        typeCount: {} as any,
        timeDistribution: {},
      }
    }
  }

  // 删除弹幕
  async deleteDanmaku(danmakuId: string): Promise<boolean> {
    try {
      await prisma.danmaku.delete({
        where: { id: danmakuId },
      })

      console.log('弹幕已删除:', danmakuId)
      return true
    } catch (error) {
      console.error('删除弹幕失败:', error)
      return false
    }
  }

  // 更新弹幕
  async updateDanmaku(danmaku: DanmakuData): Promise<boolean> {
    try {
      await prisma.danmaku.update({
        where: { id: danmaku.id },
        data: {
          content: danmaku.content,
          timeMs: danmaku.timeMs,
          type: danmaku.type,
          fontSize: danmaku.fontSize,
          color: danmaku.color,
        },
      })

      console.log('弹幕已更新:', danmaku.id)
      return true
    } catch (error) {
      console.error('更新弹幕失败:', error)
      return false
    }
  }

  // 获取热门弹幕（基于发送时间）
  async getHotDanmaku(
    videoId: string,
    limit: number = 10
  ): Promise<DanmakuData[]> {
    try {
      const hotDanmaku = await prisma.danmaku.findMany({
        where: { videoId },
        orderBy: {
          timestampMs: 'desc',
        },
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      })

      return hotDanmaku.map((danmaku) => ({
        id: danmaku.id,
        videoId: danmaku.videoId,
        userId: danmaku.userId,
        content: danmaku.content,
        timeMs: danmaku.timeMs,
        type: danmaku.type as DanmakuType,
        fontSize: danmaku.fontSize,
        color: danmaku.color,
        timestamp: Number(danmaku.timestampMs),
        poolType: danmaku.poolType,
        userHash: danmaku.userHash || '',
        rowId: danmaku.rowId || undefined,
      }))
    } catch (error) {
      console.error('获取热门弹幕失败:', error)
      return []
    }
  }

  // 更新弹幕统计信息
  private async updateDanmakuStats(
    videoId: string,
    type: DanmakuType
  ): Promise<void> {
    try {
      await prisma.danmakuStats.upsert({
        where: { videoId },
        update: {
          totalCount: { increment: 1 },
          scrollCount:
            type === DanmakuType.SCROLL ? { increment: 1 } : undefined,
          topCount: type === DanmakuType.TOP ? { increment: 1 } : undefined,
          bottomCount:
            type === DanmakuType.BOTTOM ? { increment: 1 } : undefined,
          reverseCount:
            type === DanmakuType.REVERSE ? { increment: 1 } : undefined,
          advancedCount:
            type === DanmakuType.ADVANCED ? { increment: 1 } : undefined,
        },
        create: {
          videoId,
          totalCount: 1,
          scrollCount: type === DanmakuType.SCROLL ? 1 : 0,
          topCount: type === DanmakuType.TOP ? 1 : 0,
          bottomCount: type === DanmakuType.BOTTOM ? 1 : 0,
          reverseCount: type === DanmakuType.REVERSE ? 1 : 0,
          advancedCount: type === DanmakuType.ADVANCED ? 1 : 0,
        },
      })
    } catch (error) {
      console.error('更新弹幕统计失败:', error)
    }
  }

  // 更新时间分布
  private async updateTimeDistribution(
    videoId: string,
    timeMs: number
  ): Promise<void> {
    try {
      const timeBucket = Math.floor(timeMs / 1000)

      await prisma.danmakuTimeDistribution.upsert({
        where: {
          videoId_timeBucket: {
            videoId,
            timeBucket,
          },
        },
        update: {
          danmakuCount: { increment: 1 },
        },
        create: {
          videoId,
          timeBucket,
          danmakuCount: 1,
        },
      })
    } catch (error) {
      console.error('更新时间分布失败:', error)
    }
  }

  // 批量更新统计信息
  private async batchUpdateStats(danmakuList: DanmakuData[]): Promise<void> {
    try {
      const videoStats = new Map<string, { [key: number]: number }>()

      // 统计每个视频的弹幕类型
      danmakuList.forEach((danmaku) => {
        if (!videoStats.has(danmaku.videoId)) {
          videoStats.set(danmaku.videoId, {})
        }
        const stats = videoStats.get(danmaku.videoId)!
        stats[danmaku.type] = (stats[danmaku.type] || 0) + 1
      })

      // 批量更新统计
      for (const [videoId, typeStats] of videoStats) {
        await prisma.danmakuStats.upsert({
          where: { videoId },
          update: {
            totalCount: {
              increment: Object.values(typeStats).reduce((a, b) => a + b, 0),
            },
            scrollCount: typeStats[DanmakuType.SCROLL]
              ? { increment: typeStats[DanmakuType.SCROLL] }
              : undefined,
            topCount: typeStats[DanmakuType.TOP]
              ? { increment: typeStats[DanmakuType.TOP] }
              : undefined,
            bottomCount: typeStats[DanmakuType.BOTTOM]
              ? { increment: typeStats[DanmakuType.BOTTOM] }
              : undefined,
            reverseCount: typeStats[DanmakuType.REVERSE]
              ? { increment: typeStats[DanmakuType.REVERSE] }
              : undefined,
            advancedCount: typeStats[DanmakuType.ADVANCED]
              ? { increment: typeStats[DanmakuType.ADVANCED] }
              : undefined,
          },
          create: {
            videoId,
            totalCount: Object.values(typeStats).reduce((a, b) => a + b, 0),
            scrollCount: typeStats[DanmakuType.SCROLL] || 0,
            topCount: typeStats[DanmakuType.TOP] || 0,
            bottomCount: typeStats[DanmakuType.BOTTOM] || 0,
            reverseCount: typeStats[DanmakuType.REVERSE] || 0,
            advancedCount: typeStats[DanmakuType.ADVANCED] || 0,
          },
        })
      }
    } catch (error) {
      console.error('批量更新统计失败:', error)
    }
  }
}
