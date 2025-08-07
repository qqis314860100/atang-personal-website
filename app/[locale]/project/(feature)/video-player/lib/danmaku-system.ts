// 弹幕系统核心实现
export interface DanmakuData {
  id: string
  videoId: string
  userId: string
  content: string
  timeMs: number // 精确到毫秒的时间戳
  type: DanmakuType // 弹幕类型
  fontSize: number // 字体大小
  color: number // 颜色值
  timestamp: number // 发送时间戳
  poolType: number // 弹幕池类型
  userHash: string // 用户哈希
  rowId?: number // 弹幕行ID（用于固定弹幕）
}

export enum DanmakuType {
  SCROLL = 1, // 滚动弹幕
  BOTTOM = 4, // 底部弹幕
  TOP = 5, // 顶部弹幕
  REVERSE = 6, // 逆向弹幕
  ADVANCED = 7, // 高级弹幕
}

export class DanmakuSystem {
  private videoElement: HTMLVideoElement
  private danmakuContainer: HTMLElement
  private activeDanmaku: Map<string, HTMLElement> = new Map()
  private danmakuQueue: DanmakuData[] = []
  private fps: number = 30
  private isPlaying: boolean = false
  private lastFrameTime: number = 0

  constructor(videoElement: HTMLVideoElement, container: HTMLElement) {
    this.videoElement = videoElement
    this.danmakuContainer = container
    this.init()
  }

  private init() {
    // 监听视频事件
    this.videoElement.addEventListener('play', () => this.onPlay())
    this.videoElement.addEventListener('pause', () => this.onPause())
    this.videoElement.addEventListener('timeupdate', () => this.onTimeUpdate())
    this.videoElement.addEventListener('seeked', () => this.onSeeked())

    // 启动弹幕渲染循环
    this.startRenderLoop()
  }

  // 添加弹幕到队列
  public addDanmaku(danmaku: DanmakuData) {
    this.danmakuQueue.push(danmaku)
    // 按时间排序
    this.danmakuQueue.sort((a, b) => a.timeMs - b.timeMs)
  }

  // 批量添加弹幕
  public addDanmakuBatch(danmakuList: DanmakuData[]) {
    this.danmakuQueue.push(...danmakuList)
    this.danmakuQueue.sort((a, b) => a.timeMs - b.timeMs)
  }

  // 发送新弹幕
  public sendDanmaku(content: string, type: DanmakuType = DanmakuType.SCROLL) {
    const currentTimeMs = this.getCurrentTimeMs()
    const danmaku: DanmakuData = {
      id: this.generateId(),
      videoId: 'current-video',
      userId: 'current-user',
      content,
      timeMs: currentTimeMs,
      type,
      fontSize: 25,
      color: this.getRandomColor(),
      timestamp: Date.now(),
      poolType: 0,
      userHash: 'user-hash',
    }

    // 立即添加到队列并显示
    this.addDanmaku(danmaku)
    this.showDanmaku(danmaku)
  }

  // 获取当前时间（毫秒精度）
  private getCurrentTimeMs(): number {
    return Math.round(this.videoElement.currentTime * 1000)
  }

  // 获取当前帧时间
  private getCurrentFrameTime(): number {
    const currentTimeMs = this.getCurrentTimeMs()
    return Math.round(currentTimeMs / (1000 / this.fps))
  }

  // 视频播放事件
  private onPlay() {
    this.isPlaying = true
  }

  // 视频暂停事件
  private onPause() {
    this.isPlaying = false
  }

  // 视频时间更新事件
  private onTimeUpdate() {
    const currentFrameTime = this.getCurrentFrameTime()

    // 检查是否有新的弹幕需要显示
    this.checkAndShowDanmaku(currentFrameTime)

    // 清理过期的弹幕
    this.cleanupExpiredDanmaku()
  }

  // 视频跳转事件
  private onSeeked() {
    // 跳转时清理所有弹幕并重新加载
    this.clearAllDanmaku()
    this.loadDanmakuForCurrentTime()
  }

  // 检查并显示弹幕
  private checkAndShowDanmaku(currentFrameTime: number) {
    const currentTimeMs = this.getCurrentTimeMs()

    // 查找需要显示的弹幕
    const danmakuToShow = this.danmakuQueue.filter((danmaku) => {
      return (
        danmaku.timeMs <= currentTimeMs && !this.activeDanmaku.has(danmaku.id)
      )
    })

    // 显示弹幕
    danmakuToShow.forEach((danmaku) => {
      this.showDanmaku(danmaku)
    })
  }

  // 显示单个弹幕
  private showDanmaku(danmaku: DanmakuData) {
    const element = this.createDanmakuElement(danmaku)

    if (element) {
      this.danmakuContainer.appendChild(element)
      this.activeDanmaku.set(danmaku.id, element)

      // 设置自动清理
      setTimeout(() => {
        this.removeDanmaku(danmaku.id)
      }, this.getDanmakuDuration(danmaku.type))
    }
  }

  // 创建弹幕元素
  private createDanmakuElement(danmaku: DanmakuData): HTMLElement | null {
    const element = document.createElement('div')

    // 基础样式
    element.className = 'danmaku-item'
    element.textContent = danmaku.content
    element.style.color = this.colorToString(danmaku.color)
    element.style.fontSize = `${danmaku.fontSize}px`
    element.style.fontWeight = 'bold'
    element.style.textShadow = '1px 1px 2px rgba(0,0,0,0.8)'
    element.style.whiteSpace = 'nowrap'
    element.style.position = 'absolute'
    element.style.pointerEvents = 'none'
    element.style.userSelect = 'none'
    element.style.zIndex = '1000'

    // 根据弹幕类型设置位置和动画
    switch (danmaku.type) {
      case DanmakuType.SCROLL:
        this.setupScrollDanmaku(element, danmaku)
        break
      case DanmakuType.TOP:
        this.setupTopDanmaku(element, danmaku)
        break
      case DanmakuType.BOTTOM:
        this.setupBottomDanmaku(element, danmaku)
        break
      case DanmakuType.REVERSE:
        this.setupReverseDanmaku(element, danmaku)
        break
    }

    return element
  }

  // 设置滚动弹幕
  private setupScrollDanmaku(element: HTMLElement, danmaku: DanmakuData) {
    const containerWidth = this.danmakuContainer.clientWidth
    const elementWidth = element.offsetWidth

    // 随机Y位置（避开顶部和底部）
    const maxY = this.danmakuContainer.clientHeight - 100
    const y = Math.random() * maxY + 50

    element.style.top = `${y}px`
    element.style.left = `${containerWidth}px`
    element.style.transform = 'translateX(0)'

    // 滚动动画
    element.style.transition = 'transform 8s linear'
    element.style.transform = `translateX(-${containerWidth + elementWidth}px)`
  }

  // 设置顶部弹幕
  private setupTopDanmaku(element: HTMLElement, danmaku: DanmakuData) {
    const containerWidth = this.danmakuContainer.clientWidth
    const elementWidth = element.offsetWidth

    element.style.top = '20px'
    element.style.left = `${(containerWidth - elementWidth) / 2}px`
    element.style.textAlign = 'center'

    // 淡入淡出动画
    element.style.opacity = '0'
    element.style.transition = 'opacity 0.5s ease-in-out'

    setTimeout(() => {
      element.style.opacity = '1'
    }, 100)

    setTimeout(() => {
      element.style.opacity = '0'
    }, 4000)
  }

  // 设置底部弹幕
  private setupBottomDanmaku(element: HTMLElement, danmaku: DanmakuData) {
    const containerWidth = this.danmakuContainer.clientWidth
    const elementWidth = element.offsetWidth

    element.style.bottom = '20px'
    element.style.left = `${(containerWidth - elementWidth) / 2}px`
    element.style.textAlign = 'center'

    // 淡入淡出动画
    element.style.opacity = '0'
    element.style.transition = 'opacity 0.5s ease-in-out'

    setTimeout(() => {
      element.style.opacity = '1'
    }, 100)

    setTimeout(() => {
      element.style.opacity = '0'
    }, 4000)
  }

  // 设置逆向弹幕
  private setupReverseDanmaku(element: HTMLElement, danmaku: DanmakuData) {
    const containerWidth = this.danmakuContainer.clientWidth
    const elementWidth = element.offsetWidth

    // 随机Y位置
    const maxY = this.danmakuContainer.clientHeight - 100
    const y = Math.random() * maxY + 50

    element.style.top = `${y}px`
    element.style.left = `-${elementWidth}px`
    element.style.transform = 'translateX(0)'

    // 逆向滚动动画
    element.style.transition = 'transform 8s linear'
    element.style.transform = `translateX(${containerWidth + elementWidth}px)`
  }

  // 获取弹幕持续时间
  private getDanmakuDuration(type: DanmakuType): number {
    switch (type) {
      case DanmakuType.SCROLL:
      case DanmakuType.REVERSE:
        return 8000 // 8秒
      case DanmakuType.TOP:
      case DanmakuType.BOTTOM:
        return 4500 // 4.5秒
      default:
        return 8000
    }
  }

  // 移除弹幕
  private removeDanmaku(id: string) {
    const element = this.activeDanmaku.get(id)
    if (element && element.parentNode) {
      element.parentNode.removeChild(element)
      this.activeDanmaku.delete(id)
    }
  }

  // 清理过期弹幕
  private cleanupExpiredDanmaku() {
    const currentTimeMs = this.getCurrentTimeMs()

    this.activeDanmaku.forEach((element, id) => {
      // 检查弹幕是否已经过期
      const danmaku = this.danmakuQueue.find((d) => d.id === id)
      if (danmaku) {
        const duration = this.getDanmakuDuration(danmaku.type)
        if (currentTimeMs - danmaku.timeMs > duration) {
          this.removeDanmaku(id)
        }
      }
    })
  }

  // 清理所有弹幕
  private clearAllDanmaku() {
    this.activeDanmaku.forEach((element) => {
      if (element.parentNode) {
        element.parentNode.removeChild(element)
      }
    })
    this.activeDanmaku.clear()
  }

  // 加载当前时间的弹幕
  private loadDanmakuForCurrentTime() {
    const currentTimeMs = this.getCurrentTimeMs()
    const tolerance = 1000 // 1秒容差

    // 查找当前时间附近的弹幕
    const nearbyDanmaku = this.danmakuQueue.filter((danmaku) => {
      return Math.abs(danmaku.timeMs - currentTimeMs) <= tolerance
    })

    // 显示这些弹幕
    nearbyDanmaku.forEach((danmaku) => {
      if (!this.activeDanmaku.has(danmaku.id)) {
        this.showDanmaku(danmaku)
      }
    })
  }

  // 启动渲染循环
  private startRenderLoop() {
    const render = () => {
      if (this.isPlaying) {
        this.onTimeUpdate()
      }
      requestAnimationFrame(render)
    }
    requestAnimationFrame(render)
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

  // 颜色值转字符串
  private colorToString(color: number): string {
    const r = (color >> 16) & 255
    const g = (color >> 8) & 255
    const b = color & 255
    return `rgb(${r}, ${g}, ${b})`
  }

  // 公共方法：设置FPS
  public setFPS(fps: number) {
    this.fps = fps
  }

  // 公共方法：获取当前弹幕数量
  public getActiveDanmakuCount(): number {
    return this.activeDanmaku.size
  }

  // 公共方法：获取队列中的弹幕数量
  public getQueueDanmakuCount(): number {
    return this.danmakuQueue.length
  }
}
