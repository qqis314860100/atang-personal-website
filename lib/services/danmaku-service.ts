export interface DanmakuData {
  id: string
  videoId: string
  userId: string
  content: string
  timeMs: number
  type: number
  fontSize: number
  color: number
  timestampMs: bigint
  poolType: number
  userHash?: string | null
  rowId?: number | null
  createdAt: Date
  updatedAt: Date
  user: {
    id: string
    username: string
    avatar?: string | null
  }
}

export interface CreateDanmakuData {
  videoId: string
  userId: string
  content: string
  timeMs: number
  type?: number
  fontSize?: number
  color?: number | string
  poolType?: number
  userHash?: string
  rowId?: number
}

export interface DanmakuStats {
  totalCount: number
  scrollCount: number
  topCount: number
  bottomCount: number
  reverseCount: number
  advancedCount: number
}

export class DanmakuService {
  // 获取视频的弹幕列表
  static async getDanmakuList(
    videoId: string,
    params: {
      timeRange?: { start: number; end: number }
      type?: number
      poolType?: number
      limit?: number
    } = {}
  ) {
    const { timeRange, type, poolType, limit = 1000 } = params

    const searchParams = new URLSearchParams()
    if (timeRange) {
      searchParams.append('start', timeRange.start.toString())
      searchParams.append('end', timeRange.end.toString())
    }
    if (type !== undefined) searchParams.append('type', type.toString())
    if (poolType !== undefined)
      searchParams.append('poolType', poolType.toString())
    if (limit) searchParams.append('limit', limit.toString())

    const response = await fetch(
      `/api/videos/${videoId}/danmaku?${searchParams.toString()}`
    )

    if (!response.ok) {
      throw new Error('获取弹幕列表失败')
    }

    const data = await response.json()
    return data.danmaku || []
  }

  // 发送弹幕
  static async sendDanmaku(data: CreateDanmakuData): Promise<DanmakuData> {
    // 处理 color 字段，确保是 number 类型
    const colorValue =
      typeof data.color === 'string'
        ? parseInt(data.color, 16) || 16777215
        : data.color || 16777215

    const response = await fetch(`/api/videos/${data.videoId}/danmaku`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        color: colorValue,
      }),
    })

    if (!response.ok) {
      throw new Error('发送弹幕失败')
    }

    const result = await response.json()
    return result.danmaku
  }

  // 删除弹幕
  static async deleteDanmaku(id: string): Promise<void> {
    const response = await fetch(`/api/danmaku/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('删除弹幕失败')
    }
  }

  // 获取弹幕统计
  static async getDanmakuStats(videoId: string): Promise<DanmakuStats> {
    const response = await fetch(`/api/videos/${videoId}/danmaku/stats`)

    if (!response.ok) {
      throw new Error('获取弹幕统计失败')
    }

    return response.json()
  }

  // 获取弹幕时间分布
  static async getDanmakuTimeDistribution(
    videoId: string,
    bucketSize = 60
  ): Promise<Array<{ timeBucket: number; danmakuCount: number }>> {
    const response = await fetch(
      `/api/videos/${videoId}/danmaku/distribution?bucketSize=${bucketSize}`
    )

    if (!response.ok) {
      throw new Error('获取弹幕时间分布失败')
    }

    return response.json()
  }

  // 获取热门弹幕
  static async getHotDanmaku(
    videoId: string,
    limit = 10
  ): Promise<DanmakuData[]> {
    const response = await fetch(
      `/api/videos/${videoId}/danmaku/hot?limit=${limit}`
    )

    if (!response.ok) {
      throw new Error('获取热门弹幕失败')
    }

    const data = await response.json()
    return data.danmaku || []
  }
}
