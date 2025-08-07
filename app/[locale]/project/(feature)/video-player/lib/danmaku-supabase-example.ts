// 弹幕系统与 Supabase 集成示例
import { DanmakuSystem, DanmakuType } from './danmaku-system'
import { DanmakuPrismaService } from './danmaku-prisma-service'

export class DanmakuSupabaseExample {
  private danmakuSystem: DanmakuSystem
  private danmakuService: DanmakuPrismaService

  constructor(videoElement: HTMLVideoElement, container: HTMLElement) {
    // 初始化弹幕系统
    this.danmakuSystem = new DanmakuSystem(videoElement, container)

    // 初始化 Prisma 服务（连接 Supabase）
    this.danmakuService = new DanmakuPrismaService()

    this.init()
  }

  private async init() {
    // 加载视频的所有弹幕
    await this.loadVideoDanmaku('video-123')

    // 设置视频事件监听
    this.setupVideoEventListeners()
  }

  // 加载视频弹幕
  private async loadVideoDanmaku(videoId: string) {
    try {
      console.log('开始从 Supabase 加载视频弹幕...')

      // 从 Supabase 获取所有弹幕
      const allDanmaku = await this.danmakuService.getAllDanmaku(videoId)

      // 添加到弹幕系统
      this.danmakuSystem.addDanmakuBatch(allDanmaku)

      console.log(`成功从 Supabase 加载 ${allDanmaku.length} 条弹幕`)

      // 获取并显示统计信息
      const stats = await this.danmakuService.getDanmakuStats(videoId)
      console.log('弹幕统计:', stats)
    } catch (error) {
      console.error('从 Supabase 加载弹幕失败:', error)
    }
  }

  // 设置视频事件监听
  private setupVideoEventListeners() {
    const videoElement = this.danmakuSystem['videoElement']

    // 监听视频加载完成
    videoElement.addEventListener('loadedmetadata', () => {
      console.log('视频元数据加载完成')
    })

    // 监听视频播放
    videoElement.addEventListener('play', () => {
      console.log('视频开始播放')
    })

    // 监听视频暂停
    videoElement.addEventListener('pause', () => {
      console.log('视频暂停')
    })

    // 监听视频结束
    videoElement.addEventListener('ended', () => {
      console.log('视频播放结束')
    })
  }

  // 发送弹幕到 Supabase
  public async sendDanmaku(
    content: string,
    type: DanmakuType = DanmakuType.SCROLL
  ) {
    try {
      // 发送到弹幕系统
      this.danmakuSystem.sendDanmaku(content, type)

      // 保存到 Supabase
      const danmaku = {
        id: this.generateId(),
        videoId: 'video-123',
        userId: 'current-user-id', // 应该从用户认证系统获取
        content,
        timeMs: this.danmakuSystem['getCurrentTimeMs'](),
        type,
        fontSize: 25,
        color: this.getRandomColor(),
        timestamp: Date.now(),
        poolType: 0,
        userHash: 'user-hash',
      }

      const success = await this.danmakuService.saveDanmaku(danmaku)

      if (success) {
        console.log('弹幕已发送到 Supabase:', content)
      } else {
        console.error('弹幕发送到 Supabase 失败')
      }
    } catch (error) {
      console.error('发送弹幕失败:', error)
    }
  }

  // 根据时间范围加载弹幕（用于长视频分段加载）
  public async loadDanmakuByTimeRange(
    videoId: string,
    startTimeMs: number,
    endTimeMs: number
  ) {
    try {
      const danmakuList = await this.danmakuService.getDanmakuByTimeRange(
        videoId,
        startTimeMs,
        endTimeMs
      )

      this.danmakuSystem.addDanmakuBatch(danmakuList)

      console.log(
        `从 Supabase 加载了 ${danmakuList.length} 条弹幕 (${startTimeMs}-${endTimeMs}ms)`
      )
    } catch (error) {
      console.error('按时间范围从 Supabase 加载弹幕失败:', error)
    }
  }

  // 获取热门弹幕
  public async getHotDanmaku(videoId: string, limit: number = 10) {
    try {
      const hotDanmaku = await this.danmakuService.getHotDanmaku(videoId, limit)
      console.log('热门弹幕:', hotDanmaku)
      return hotDanmaku
    } catch (error) {
      console.error('获取热门弹幕失败:', error)
      return []
    }
  }

  // 获取弹幕统计
  public async getDanmakuStats(videoId: string) {
    try {
      const stats = await this.danmakuService.getDanmakuStats(videoId)
      console.log('弹幕统计:', stats)
      return stats
    } catch (error) {
      console.error('获取弹幕统计失败:', error)
      return null
    }
  }

  // 生成唯一ID
  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9)
  }

  // 获取随机颜色
  private getRandomColor(): number {
    const colors = [
      0xffffff, // 白色
      0xff0000, // 红色
      0x00ff00, // 绿色
      0x0000ff, // 蓝色
      0xffff00, // 黄色
      0xff00ff, // 紫色
      0x00ffff, // 青色
      0xffa500, // 橙色
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  // 获取当前活跃弹幕数量
  public getActiveDanmakuCount(): number {
    return this.danmakuSystem.getActiveDanmakuCount()
  }

  // 获取队列中的弹幕数量
  public getQueueDanmakuCount(): number {
    return this.danmakuSystem.getQueueDanmakuCount()
  }

  // 设置FPS
  public setFPS(fps: number) {
    this.danmakuSystem.setFPS(fps)
  }
}

// 使用示例
export function createDanmakuSupabaseExample(
  videoElement: HTMLVideoElement,
  container: HTMLElement
) {
  const example = new DanmakuSupabaseExample(videoElement, container)

  // 暴露一些方法到全局，方便测试
  ;(window as any).danmakuSupabaseExample = {
    sendDanmaku: (content: string, type?: DanmakuType) =>
      example.sendDanmaku(content, type),
    getHotDanmaku: (videoId: string, limit?: number) =>
      example.getHotDanmaku(videoId, limit),
    getDanmakuStats: (videoId: string) => example.getDanmakuStats(videoId),
    getActiveCount: () => example.getActiveDanmakuCount(),
    getQueueCount: () => example.getQueueDanmakuCount(),
    setFPS: (fps: number) => example.setFPS(fps),
  }

  return example
}
