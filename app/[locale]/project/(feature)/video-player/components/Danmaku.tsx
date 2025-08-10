'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// 弹幕类型定义
interface DanmakuItem {
  id: string
  text: string
  time: number // 弹幕出现时间（秒）
  color: string
  type: 'scroll' | 'top' | 'bottom'
  sendTime?: string
}

interface DanmakuProps {
  danmakuList: DanmakuItem[]
  currentTime: number // 视频当前播放时间（秒）
  onNewDanmaku?: (danmaku: DanmakuItem) => void
  isPlaying?: boolean // 是否正在播放
}

// 弹幕对象类 - 基于CommentCoreLibrary的设计
class CommentObject {
  public id: string
  public text: string
  public time: number
  public color: string
  public type: 'scroll' | 'top' | 'bottom'
  public element?: HTMLDivElement
  public trackIndex: number = -1
  public startTime: number = 0
  public endTime: number = 0
  public width: number = 0
  public height: number = 0
  public speed: number = 0
  public cleanupTimeout?: NodeJS.Timeout // 用于存储清理定时器

  constructor(danmaku: DanmakuItem) {
    this.id = danmaku.id
    this.text = danmaku.text
    this.time = danmaku.time
    this.color = danmaku.color
    this.type = danmaku.type
  }

  // 计算弹幕需要的空间
  calculateSpace(): { width: number; height: number; duration: number } {
    if (this.type === 'scroll') {
      return {
        width: this.width,
        height: 35,
        duration: 8000, // 8秒滚动时间
      }
    } else {
      return {
        width: this.width,
        height: 35,
        duration: 4000, // 4秒固定时间
      }
    }
  }
}

// 轨道类 - 管理单个轨道的弹幕
class Track {
  private comments: CommentObject[] = []
  private readonly index: number
  private readonly height: number

  constructor(index: number, height: number) {
    this.index = index
    this.height = height
  }

  // 检查轨道是否可用
  isAvailable(startTime: number, duration: number): boolean {
    const endTime = startTime + duration

    for (const comment of this.comments) {
      // 检查时间重叠
      if (
        this.hasTimeOverlap(
          startTime,
          endTime,
          comment.startTime,
          comment.endTime
        )
      ) {
        return false
      }
    }
    return true
  }

  // 检查时间重叠
  private hasTimeOverlap(
    start1: number,
    end1: number,
    start2: number,
    end2: number
  ): boolean {
    return start1 < end2 && start2 < end1
  }

  // 添加弹幕到轨道
  addComment(comment: CommentObject): boolean {
    if (
      this.isAvailable(comment.startTime, comment.endTime - comment.startTime)
    ) {
      this.comments.push(comment)
      comment.trackIndex = this.index
      return true
    }
    return false
  }

  // 移除弹幕
  removeComment(commentId: string): boolean {
    const index = this.comments.findIndex((c) => c.id === commentId)
    if (index !== -1) {
      this.comments.splice(index, 1)
      return true
    }
    return false
  }

  // 清理过期的弹幕
  cleanup(currentTime: number): void {
    this.comments = this.comments.filter(
      (comment) => comment.endTime > currentTime
    )
  }

  getIndex(): number {
    return this.index
  }

  getCommentCount(): number {
    return this.comments.length
  }
}

// 空间分配器 - 基于CommentCoreLibrary的算法
class CommentSpaceAllocator {
  private tracks: Track[] = []
  private readonly trackHeight: number
  private readonly maxTracks: number

  constructor(trackHeight: number, maxTracks: number) {
    this.trackHeight = trackHeight
    this.maxTracks = maxTracks
    this.initTracks()
  }

  private initTracks(): void {
    this.tracks = Array.from(
      { length: this.maxTracks },
      (_, index) => new Track(index, this.trackHeight)
    )
  }

  // 分配轨道 - 核心算法
  allocateTrack(comment: CommentObject): number {
    const space = comment.calculateSpace()
    const duration = space.duration / 1000 // 转换为秒，因为calculateSpace返回的是毫秒

    // 策略1: 寻找完全空闲的轨道
    for (let i = 0; i < this.tracks.length; i++) {
      if (this.tracks[i].isAvailable(comment.startTime, duration)) {
        if (this.tracks[i].addComment(comment)) {
          console.log(`弹幕 "${comment.text}" 分配到轨道 ${i}`)
          return i
        }
      }
    }

    // 策略2: 寻找弹幕数量最少的轨道
    let bestTrack = 0
    let minCount = Infinity
    for (let i = 0; i < this.tracks.length; i++) {
      const count = this.tracks[i].getCommentCount()
      if (count < minCount) {
        minCount = count
        bestTrack = i
      }
    }

    // 强制添加到最佳轨道
    this.tracks[bestTrack].addComment(comment)
    console.log(`弹幕 "${comment.text}" 强制分配到轨道 ${bestTrack} (轨道已满)`)
    return bestTrack
  }

  // 清理过期弹幕
  cleanup(currentTime: number): void {
    this.tracks.forEach((track) => track.cleanup(currentTime))
  }

  // 获取轨道信息
  getTrackInfo(): Array<{ index: number; count: number }> {
    return this.tracks.map((track) => ({
      index: track.getIndex(),
      count: track.getCommentCount(),
    }))
  }
}

export function Danmaku({
  danmakuList,
  currentTime,
  onNewDanmaku,
  isPlaying = true,
}: DanmakuProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)
  const currentTimeRef = useRef(currentTime)

  // 空间分配器
  const allocatorRef = useRef<CommentSpaceAllocator | null>(null)

  // 已显示的弹幕ID集合
  const displayedDanmakuRef = useRef<Set<string>>(new Set())

  // 当前活跃的弹幕对象
  const activeCommentsRef = useRef<Map<string, CommentObject>>(new Map())

  // 弹幕系统配置
  const config = {
    trackHeight: 35,
    maxTracks: 8,
    scrollDuration: 8000,
    fixedDuration: 4000,
  }

  // 组件挂载状态
  useEffect(() => {
    setIsMounted(true)
    console.log('Danmaku组件已挂载')

    // 初始化空间分配器
    allocatorRef.current = new CommentSpaceAllocator(
      config.trackHeight,
      config.maxTracks
    )

    return () => {
      setIsMounted(false)
      console.log('Danmaku组件即将卸载')
    }
  }, [])

  // 创建弹幕元素
  const createDanmakuElement = useCallback(
    (comment: CommentObject, trackIndex: number) => {
      const element = document.createElement('div')
      element.className = 'danmaku-item'
      element.textContent = comment.text
      element.style.color = comment.color
      element.style.top = `${trackIndex * config.trackHeight}px`
      element.style.left = '100vw'
      element.style.position = 'absolute'
      element.style.whiteSpace = 'nowrap'
      element.style.fontSize = '20px'
      element.style.fontWeight = 'bold'
      element.style.textShadow = '1px 1px 2px rgba(0,0,0,0.8)'
      element.style.pointerEvents = 'none' // 确保弹幕不会阻止点击
      element.setAttribute('data-danmaku-id', comment.id)

      return element
    },
    [config.trackHeight]
  )

  // 显示弹幕
  const showDanmaku = useCallback(
    (comment: CommentObject) => {
      if (!containerRef.current || !isMounted || !allocatorRef.current)
        return false

      // 检查是否已经显示过
      if (displayedDanmakuRef.current.has(comment.id)) {
        console.log(`弹幕 ${comment.id} 已经显示过，跳过`)
        return false
      }

      // 设置弹幕的时间信息 - 统一使用秒作为单位
      comment.startTime = currentTime // 使用秒
      if (comment.type === 'scroll') {
        comment.endTime = comment.startTime + config.scrollDuration / 1000 // 转换为秒
      } else {
        comment.endTime = comment.startTime + config.fixedDuration / 1000 // 转换为秒
      }

      // 分配轨道
      const trackIndex = allocatorRef.current.allocateTrack(comment)

      // 创建弹幕元素
      const element = createDanmakuElement(comment, trackIndex)
      const container = containerRef.current

      // 获取弹幕尺寸
      container.appendChild(element)
      comment.width = element.offsetWidth
      comment.height = element.offsetHeight
      comment.element = element

      // 保存弹幕对象
      activeCommentsRef.current.set(comment.id, comment)
      displayedDanmakuRef.current.add(comment.id)

      console.log(
        `🎬 弹幕 "${comment.text}" 开始显示，轨道: ${trackIndex}，时间: ${comment.time}s，当前时间: ${currentTime}s，播放状态: ${isPlaying}`
      )

      // 设置动画
      if (comment.type === 'scroll') {
        // 滚动弹幕：从右向左移动
        element.style.transition = `transform ${config.scrollDuration}ms linear`

        // 如果视频暂停，暂停弹幕动画
        if (!isPlaying) {
          element.style.transition = 'none'
          element.style.transform = 'translateX(0px)' // 记住最后一次滚动位置
          console.log(
            `⏸️ 弹幕 "${comment.text}" 因视频暂停而暂停，不设置清理定时器`
          )
          // 暂停时不设置清理定时器，防止弹幕消失

          // 将弹幕标记为暂停状态
          comment.startTime = currentTime
          comment.endTime = comment.startTime + config.scrollDuration / 1000
        } else {
          // 正常播放状态
          requestAnimationFrame(() => {
            element.style.transform = 'translateX(-100vw)'
          })

          // 动画结束后清理（只在播放状态下清理）
          const cleanupTimeout = setTimeout(() => {
            console.log(
              `🔍 弹幕 "${comment.text}" 清理定时器触发，播放状态: ${isPlaying}`
            )
            if (element.parentNode && isPlaying) {
              element.parentNode.removeChild(element)
              activeCommentsRef.current.delete(comment.id)
              displayedDanmakuRef.current.delete(comment.id)
              allocatorRef.current?.cleanup(currentTime)
              console.log(`✅ 弹幕 "${comment.text}" 滚动结束，已清理`)
            } else {
              console.log(
                `🚫 弹幕 "${comment.text}" 清理被阻止，播放状态: ${isPlaying}`
              )
            }
          }, config.scrollDuration)

          // 保存清理定时器，以便在暂停时取消
          comment.cleanupTimeout = cleanupTimeout
          console.log(
            `⏰ 弹幕 "${comment.text}" 设置清理定时器: ${config.scrollDuration}ms`
          )
        }
      } else {
        // 固定弹幕：淡入淡出效果
        element.style.transition = 'opacity 0.3s ease-in'
        element.style.opacity = '0'

        requestAnimationFrame(() => {
          element.style.opacity = '1'
        })

        // 固定弹幕持续时间后淡出
        setTimeout(() => {
          element.style.transition = 'opacity 0.3s ease-out'
          element.style.opacity = '0'

          setTimeout(() => {
            if (element.parentNode && isPlaying) {
              element.parentNode.removeChild(element)
              activeCommentsRef.current.delete(comment.id)
              displayedDanmakuRef.current.delete(comment.id)
              allocatorRef.current?.cleanup(currentTime)
              console.log(`✅ 弹幕 "${comment.text}" 固定显示结束，已清理`)
            }
          }, 300)
        }, config.fixedDuration)
      }

      return true
    },
    [isMounted, createDanmakuElement, currentTime, isPlaying]
  )

  // 自动修复弹幕位置
  useEffect(() => {
    if (!isMounted || !isPlaying) return

    // 每5秒自动检查一次弹幕位置
    const autoFixInterval = setInterval(() => {
      let fixedCount = 0

      activeCommentsRef.current.forEach((comment) => {
        if (comment.element && comment.type === 'scroll') {
          const element = comment.element
          const currentTransform = element.style.transform

          // 检查位置是否异常
          let needsFix = false

          if (!currentTransform || currentTransform === '') {
            needsFix = true
          } else if (currentTransform.includes('translateX(')) {
            const match = currentTransform.match(/translateX\(([^)]+)\)/)
            if (match) {
              const value = match[1]
              if (value.includes('vw')) {
                const vwValue = parseFloat(value.replace('vw', ''))
                if (vwValue < -100 || vwValue > 0) {
                  needsFix = true
                }
              } else if (value.includes('px')) {
                const pxValue = parseFloat(value.replace('px', ''))
                if (
                  pxValue < -window.innerWidth ||
                  pxValue > window.innerWidth
                ) {
                  needsFix = true
                }
              }
            }
          }

          if (needsFix) {
            console.log(
              `🔧 自动修复弹幕 "${comment.text}" 异常位置: ${currentTransform}`
            )
            element.style.transition = 'none'
            element.style.transform = 'translateX(0px)'
            fixedCount++
          }
        }
      })

      if (fixedCount > 0) {
        console.log(`🔧 自动修复完成，共修复 ${fixedCount} 条弹幕位置`)
      }
    }, 5000)

    return () => {
      clearInterval(autoFixInterval)
    }
  }, [isMounted, isPlaying])

  // 处理播放状态变化
  useEffect(() => {
    if (!isMounted) return

    console.log(`🔄 播放状态变化: ${isPlaying ? '播放' : '暂停'}`)

    // 当播放状态改变时，更新所有活跃弹幕的动画
    activeCommentsRef.current.forEach((comment) => {
      if (comment.element && comment.type === 'scroll') {
        if (isPlaying) {
          // 恢复播放 - 从当前位置继续滚动
          const element = comment.element
          const currentTransform = element.style.transform

          console.log(
            `▶️ 弹幕 "${comment.text}" 恢复播放，当前位置: ${currentTransform}`
          )

          // 解析当前位置，计算准确的剩余距离
          let currentTranslateX = 0
          let isValidPosition = false

          if (currentTransform.includes('translateX(')) {
            const match = currentTransform.match(/translateX\(([^)]+)\)/)
            if (match) {
              const value = match[1]
              if (value.includes('vw')) {
                // 如果是vw单位，转换为像素
                const vwValue = parseFloat(value.replace('vw', ''))
                currentTranslateX = (vwValue / 100) * window.innerWidth
                isValidPosition = true
              } else if (value.includes('px')) {
                // 如果是px单位
                currentTranslateX = parseFloat(value.replace('px', ''))
                isValidPosition = true
              }
            }
          }

          // 如果位置无效或弹幕还没有开始滚动，从头开始
          if (
            !isValidPosition ||
            currentTransform === 'translateX(0px)' ||
            currentTransform === '' ||
            Math.abs(currentTranslateX) < 10
          ) {
            // 如果位置接近起始位置，重新开始
            console.log(`🔄 弹幕 "${comment.text}" 重新开始滚动`)

            element.style.transition = `transform ${config.scrollDuration}ms linear`
            element.style.transform = 'translateX(0px)'

            requestAnimationFrame(() => {
              element.style.transform = 'translateX(-100vw)'
            })

            // 设置清理定时器
            if (comment.cleanupTimeout) {
              clearTimeout(comment.cleanupTimeout)
            }
            comment.cleanupTimeout = setTimeout(() => {
              if (element.parentNode && isPlaying) {
                element.parentNode.removeChild(element)
                activeCommentsRef.current.delete(comment.id)
                displayedDanmakuRef.current.delete(comment.id)
                allocatorRef.current?.cleanup(currentTime)
                console.log(`✅ 弹幕 "${comment.text}" 滚动结束，已清理`)
              }
            }, config.scrollDuration)
          } else {
            // 从当前位置继续滚动，计算准确的剩余距离和时间
            const remainingDistance =
              Math.abs(currentTranslateX) + window.innerWidth
            const totalDistance = window.innerWidth + comment.width // 总滚动距离
            const progress = Math.abs(currentTranslateX) / totalDistance // 当前进度
            const remainingTime = (1 - progress) * config.scrollDuration

            console.log(
              `▶️ 弹幕 "${comment.text}" 从位置 ${currentTranslateX.toFixed(
                2
              )}px 继续滚动，` +
                `总距离: ${totalDistance.toFixed(2)}px，进度: ${(
                  progress * 100
                ).toFixed(1)}%，` +
                `剩余时间: ${remainingTime.toFixed(0)}ms`
            )

            // 确保剩余时间在合理范围内
            const clampedRemainingTime = Math.max(
              100,
              Math.min(remainingTime, config.scrollDuration)
            )

            element.style.transition = `transform ${clampedRemainingTime}ms linear`
            requestAnimationFrame(() => {
              element.style.transform = 'translateX(-100vw)'
            })

            // 设置新的清理定时器
            if (comment.cleanupTimeout) {
              clearTimeout(comment.cleanupTimeout)
            }
            comment.cleanupTimeout = setTimeout(() => {
              if (element.parentNode && isPlaying) {
                element.parentNode.removeChild(element)
                activeCommentsRef.current.delete(comment.id)
                displayedDanmakuRef.current.delete(comment.id)
                allocatorRef.current?.cleanup(currentTime)
                console.log(`✅ 弹幕 "${comment.text}" 滚动结束，已清理`)
              }
            }, clampedRemainingTime)
          }
        } else {
          // 暂停播放 - 保持当前位置，取消清理定时器
          const element = comment.element
          const currentTransform = element.style.transform

          console.log(
            `⏸️ 弹幕 "${comment.text}" 暂停播放，位置: ${currentTransform}`
          )

          // 取消清理定时器，防止弹幕消失
          if (comment.cleanupTimeout) {
            clearTimeout(comment.cleanupTimeout)
            comment.cleanupTimeout = undefined
            console.log(`⏸️ 弹幕 "${comment.text}" 取消清理定时器`)
          }

          // 保存当前位置，不改变transform，但确保transition被禁用
          element.style.transition = 'none'

          // 验证当前位置是否有效，如果无效则重置到起始位置
          if (
            !currentTransform ||
            currentTransform === 'translateX(0px)' ||
            currentTransform === ''
          ) {
            element.style.transform = 'translateX(0px)'
            console.log(`🔄 弹幕 "${comment.text}" 位置无效，重置到起始位置`)
          } else {
            console.log(
              `⏸️ 弹幕 "${comment.text}" 保持当前位置: ${currentTransform}`
            )
          }
        }
      }
    })
  }, [isPlaying, isMounted, config.scrollDuration])

  // 修复弹幕位置异常
  const fixDanmakuPositions = useCallback(() => {
    if (!isMounted) return

    console.log('🔧 开始修复弹幕位置...')
    let fixedCount = 0

    activeCommentsRef.current.forEach((comment) => {
      if (comment.element && comment.type === 'scroll') {
        const element = comment.element
        const currentTransform = element.style.transform

        // 检查位置是否异常
        let needsFix = false
        let targetPosition = 'translateX(0px)'

        if (!currentTransform || currentTransform === '') {
          needsFix = true
          targetPosition = 'translateX(0px)'
        } else if (currentTransform.includes('translateX(')) {
          const match = currentTransform.match(/translateX\(([^)]+)\)/)
          if (match) {
            const value = match[1]
            if (value.includes('vw')) {
              const vwValue = parseFloat(value.replace('vw', ''))
              // 如果位置超出合理范围，需要修复
              if (vwValue < -100 || vwValue > 0) {
                needsFix = true
                targetPosition = 'translateX(0px)'
              }
            } else if (value.includes('px')) {
              const pxValue = parseFloat(value.replace('px', ''))
              // 如果位置超出合理范围，需要修复
              if (pxValue < -window.innerWidth || pxValue > window.innerWidth) {
                needsFix = true
                targetPosition = 'translateX(0px)'
              }
            }
          }
        }

        if (needsFix) {
          console.log(
            `🔧 修复弹幕 "${comment.text}" 位置: ${currentTransform} -> ${targetPosition}`
          )
          element.style.transition = 'none'
          element.style.transform = targetPosition
          fixedCount++
        }
      }
    })

    console.log(`✅ 弹幕位置修复完成，共修复 ${fixedCount} 条弹幕`)
    return fixedCount
  }, [isMounted])

  // 重置所有弹幕
  const resetAllDanmaku = useCallback(() => {
    if (!isMounted) return

    console.log('🔄 开始重置所有弹幕...')

    // 清理所有活跃弹幕
    activeCommentsRef.current.forEach((comment) => {
      if (comment.element && comment.element.parentNode) {
        comment.element.parentNode.removeChild(comment.element)
      }
      if (comment.cleanupTimeout) {
        clearTimeout(comment.cleanupTimeout)
      }
    })

    // 清空所有引用
    activeCommentsRef.current.clear()
    displayedDanmakuRef.current.clear()

    // 重新初始化空间分配器
    if (allocatorRef.current) {
      allocatorRef.current.cleanup(currentTime)
    }

    console.log('✅ 所有弹幕已重置')
  }, [isMounted, currentTime])

  // 强制清理弹幕
  const forceCleanupDanmaku = useCallback(() => {
    if (!isMounted) return

    console.log('🧹 开始强制清理弹幕...')

    // 清理过期的弹幕
    const currentTimeMs = currentTime * 1000
    const cleanupThreshold = 10000 // 10秒阈值

    let cleanedCount = 0
    activeCommentsRef.current.forEach((comment) => {
      const timeSinceStart = currentTimeMs - comment.startTime * 1000

      if (timeSinceStart > cleanupThreshold) {
        console.log(
          `🧹 清理过期弹幕: "${comment.text}" (已存在 ${(
            timeSinceStart / 1000
          ).toFixed(1)}s)`
        )

        if (comment.element && comment.element.parentNode) {
          comment.element.parentNode.removeChild(comment.element)
        }
        if (comment.cleanupTimeout) {
          clearTimeout(comment.cleanupTimeout)
        }

        activeCommentsRef.current.delete(comment.id)
        displayedDanmakuRef.current.delete(comment.id)
        cleanedCount++
      }
    })

    console.log(`✅ 强制清理完成，共清理 ${cleanedCount} 条过期弹幕`)
    return cleanedCount
  }, [isMounted, currentTime])

  // 诊断弹幕问题
  const diagnoseDanmakuIssues = useCallback(() => {
    if (!isMounted) return

    console.log('🔍 开始诊断弹幕问题...')

    const issues: string[] = []

    // 检查活跃弹幕状态
    activeCommentsRef.current.forEach((comment) => {
      if (comment.element) {
        const element = comment.element
        const currentTransform = element.style.transform
        const isVisible = element.offsetParent !== null

        if (!isVisible) {
          issues.push(`弹幕 "${comment.text}" 不可见`)
        }

        if (!currentTransform || currentTransform === '') {
          issues.push(`弹幕 "${comment.text}" 缺少位置信息`)
        }

        if (comment.cleanupTimeout && !isPlaying) {
          issues.push(`弹幕 "${comment.text}" 在暂停状态下仍有清理定时器`)
        }
      }
    })

    // 检查轨道分配
    if (allocatorRef.current) {
      const trackInfo = allocatorRef.current.getTrackInfo()
      console.log('📊 轨道信息:', trackInfo)
    }

    if (issues.length === 0) {
      console.log('✅ 弹幕系统运行正常，未发现问题')
    } else {
      console.log('⚠️ 发现以下问题:', issues)
    }

    return issues
  }, [isMounted, isPlaying])

  // 处理时间戳弹幕
  const processTimeBasedDanmaku = useCallback(() => {
    if (!isMounted || !allocatorRef.current) return

    // 清理过期弹幕 - 使用秒作为单位
    allocatorRef.current.cleanup(currentTime)

    // 按时间排序弹幕 - 使用深拷贝避免引用问题
    const sortedDanmaku = [...danmakuList].sort((a, b) => a.time - b.time)

    // 找到应该显示的弹幕（智能时间匹配）
    const shouldShowDanmaku = sortedDanmaku.filter((danmaku) => {
      // 检查是否已经显示过
      if (displayedDanmakuRef.current.has(danmaku.id)) {
        return false
      }

      // 智能时间匹配：弹幕时间必须 <= 当前时间，且差值在合理范围内
      const timeDiff = currentTime - danmaku.time

      // 对于不同时间段的弹幕使用不同的容差
      let tolerance = 2.0 // 默认2秒容差
      if (danmaku.time <= 10) {
        tolerance = 5.0 // 前10秒的弹幕使用5秒容差
      } else if (danmaku.time <= 60) {
        tolerance = 3.0 // 前1分钟的弹幕使用3秒容差
      }

      const shouldShow = timeDiff >= 0 && timeDiff <= tolerance

      if (shouldShow) {
        console.log(
          `✅ 时间匹配成功: 弹幕时间 ${
            danmaku.time
          }s, 当前时间 ${currentTime}s, 差值 ${timeDiff.toFixed(
            3
          )}s, 容差 ${tolerance}s, ID: ${danmaku.id}`
        )
      } else if (timeDiff < 0) {
        console.log(
          `⏳ 弹幕时间未到: 弹幕时间 ${
            danmaku.time
          }s, 当前时间 ${currentTime}s, 还需等待 ${Math.abs(timeDiff).toFixed(
            1
          )}s, ID: ${danmaku.id}`
        )
      } else {
        console.log(
          `❌ 弹幕时间已过: 弹幕时间 ${
            danmaku.time
          }s, 当前时间 ${currentTime}s, 已过 ${timeDiff.toFixed(
            1
          )}s, 容差 ${tolerance}s, ID: ${danmaku.id}`
        )
      }

      return shouldShow
    })

    if (shouldShowDanmaku.length === 0) return

    console.log(
      `🎯 处理时间弹幕: ${
        shouldShowDanmaku.length
      }条，当前时间: ${currentTime.toFixed(2)}s`
    )
    console.log(
      '📋 待显示弹幕:',
      shouldShowDanmaku.map((d) => `${d.time}s: "${d.text}" (ID: ${d.id})`)
    )

    // 显示弹幕，间隔100ms避免重叠
    shouldShowDanmaku.forEach((danmaku, index) => {
      setTimeout(() => {
        // 再次检查是否已经显示过（防止重复显示）
        if (displayedDanmakuRef.current.has(danmaku.id)) {
          console.log(`🚫 弹幕 ${danmaku.id} 在延迟期间已被显示，跳过`)
          return
        }

        // 创建新的CommentObject，确保数据独立
        const comment = new CommentObject({
          id: danmaku.id,
          text: danmaku.text,
          time: danmaku.time,
          color: danmaku.color,
          type: danmaku.type,
          sendTime: danmaku.sendTime,
        })

        const success = showDanmaku(comment)
        if (success) {
          console.log(
            `✅ 成功显示时间弹幕: "${danmaku.text}" at ${danmaku.time}s (ID: ${danmaku.id})`
          )
        } else {
          console.log(
            `❌ 显示时间弹幕失败: "${danmaku.text}" at ${danmaku.time}s (ID: ${danmaku.id})`
          )
        }
      }, index * 100)
    })
  }, [danmakuList, currentTime, showDanmaku, isMounted])

  // 处理新弹幕（实时发送的）
  const processNewDanmaku = useCallback(() => {
    if (!isMounted) return

    const currentCount = danmakuList.length
    const displayedCount = displayedDanmakuRef.current.size

    if (currentCount > displayedCount) {
      // 找到最新的弹幕
      const newDanmaku = danmakuList[danmakuList.length - 1]
      if (newDanmaku && !displayedDanmakuRef.current.has(newDanmaku.id)) {
        // 检查新弹幕的时间是否匹配（使用智能时间匹配）
        const timeDiff = currentTime - newDanmaku.time

        // 对于不同时间段的弹幕使用不同的容差
        let tolerance = 2.0 // 默认2秒容差
        if (newDanmaku.time <= 10) {
          tolerance = 5.0 // 前10秒的弹幕使用5秒容差
        } else if (newDanmaku.time <= 60) {
          tolerance = 3.0 // 前1分钟的弹幕使用3秒容差
        }

        const shouldShow = timeDiff >= 0 && timeDiff <= tolerance

        if (shouldShow) {
          console.log(
            `🎉 显示新弹幕: "${newDanmaku.text}" at ${newDanmaku.time}s (ID: ${newDanmaku.id})`
          )
          // 立即显示新弹幕
          const comment = new CommentObject(newDanmaku)
          showDanmaku(comment)
          if (onNewDanmaku) {
            onNewDanmaku(newDanmaku)
          }
        } else {
          console.log(
            `⏳ 新弹幕时间未到: "${newDanmaku.text}" at ${newDanmaku.time}s, 当前时间 ${currentTime}s, 容差 ${tolerance}s`
          )
        }
      }
    }
  }, [danmakuList, currentTime, showDanmaku, onNewDanmaku, isMounted])

  // 监听弹幕列表变化
  useEffect(() => {
    if (!isMounted) return

    // 添加初始化检查，避免在组件刚挂载时就显示弹幕
    if (currentTime === 0 && danmakuList.length > 0) {
      console.log('🚫 组件初始化阶段，跳过弹幕处理，当前时间:', currentTime)
      return
    }

    // 只有在视频真正开始播放后才处理弹幕
    if (currentTime > 0) {
      processTimeBasedDanmaku()
    }
  }, [danmakuList, currentTime, processTimeBasedDanmaku, isMounted])

  // 监听时间跳跃（快进/快退）
  useEffect(() => {
    if (!isMounted || !currentTimeRef.current) return

    const timeDiff = Math.abs(currentTime - currentTimeRef.current)

    // 如果时间跳跃超过5秒，清理所有弹幕并重新计算
    if (timeDiff > 5) {
      console.log(`🔄 检测到时间跳跃: ${timeDiff.toFixed(1)}s，清理所有弹幕`)

      // 清理所有弹幕元素
      activeCommentsRef.current.forEach((comment) => {
        if (comment.element?.parentNode) {
          comment.element.parentNode.removeChild(comment.element)
        }
        if (comment.cleanupTimeout) {
          clearTimeout(comment.cleanupTimeout)
        }
      })

      // 清理状态
      activeCommentsRef.current.clear()
      displayedDanmakuRef.current.clear()

      // 重新初始化分配器
      if (allocatorRef.current) {
        allocatorRef.current = new CommentSpaceAllocator(
          config.trackHeight,
          config.maxTracks
        )
      }

      console.log('✅ 弹幕系统已重置，准备重新计算')
    }

    currentTimeRef.current = currentTime
  }, [currentTime, isMounted])

  // 监听新弹幕
  useEffect(() => {
    if (!isMounted) return

    // 添加初始化检查，避免在组件刚挂载时就显示新弹幕
    if (currentTime === 0 && danmakuList.length > 0) {
      console.log('🚫 组件初始化阶段，跳过新弹幕处理，当前时间:', currentTime)
      return
    }

    // 只有在视频真正开始播放后才处理新弹幕
    if (currentTime > 0) {
      processNewDanmaku()
    }
  }, [danmakuList, processNewDanmaku, isMounted])

  // 清理组件
  useEffect(() => {
    return () => {
      console.log('Danmaku组件即将卸载，清理弹幕')

      // 清理所有弹幕元素
      activeCommentsRef.current.forEach((comment) => {
        if (comment.element?.parentNode) {
          comment.element.parentNode.removeChild(comment.element)
        }
      })

      // 清理状态
      activeCommentsRef.current.clear()
      displayedDanmakuRef.current.clear()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 1000 }}
    >
      {/* 弹幕元素会在这里动态添加 */}

      {/* 调试信息 */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 right-2 text-white text-xs bg-black/50 px-2 py-1 rounded space-y-1 max-w-xs pointer-events-auto">
          <div>
            弹幕: {danmakuList.length} | 已显示:{' '}
            {displayedDanmakuRef.current.size}
          </div>
          <div>
            时间: {currentTime.toFixed(2)}s | 活跃:{' '}
            {activeCommentsRef.current.size}
          </div>
          <div>
            轨道:{' '}
            {allocatorRef.current
              ?.getTrackInfo()
              .map((t) => `${t.index}:${t.count}`)
              .join(' ') || 'N/A'}
          </div>

          {/* 显示最近的弹幕信息 */}
          <div className="text-xs opacity-75">
            <div>最近弹幕:</div>
            {danmakuList
              .filter((d) => Math.abs(d.time - currentTime) <= 5) // 显示前后5秒的弹幕
              .slice(0, 3)
              .map((d) => (
                <div key={d.id} className="ml-2">
                  {d.time.toFixed(1)}s: "{d.text.substring(0, 10)}..."
                  {displayedDanmakuRef.current.has(d.id) ? ' ✓' : ' ⏳'}
                </div>
              ))}
          </div>

          <button
            onClick={() => {
              // 测试弹幕功能
              const testDanmaku: DanmakuItem = {
                id: `test-${Date.now()}`,
                text: `测试弹幕 ${Date.now()}`,
                time: currentTime,
                color: '#ff6b6b',
                type: 'scroll',
                sendTime: new Date().toISOString(),
              }
              const comment = new CommentObject(testDanmaku)
              showDanmaku(comment)
            }}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
          >
            测试弹幕
          </button>

          <button
            onClick={() => {
              console.log('🔧 简单测试按钮被点击了！')
              alert('按钮点击功能正常！')
            }}
            className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-xs"
          >
            测试按钮
          </button>

          <button
            onClick={() => {
              console.log('🔧 修复弹幕位置异常')
              const fixedCount = fixDanmakuPositions()
              alert(`弹幕位置修复完成！共修复 ${fixedCount} 条弹幕`)
            }}
            className="px-2 py-1 bg-pink-600 hover:bg-pink-700 rounded text-xs"
          >
            修复弹幕位置
          </button>

          <button
            onClick={() => {
              console.log('🔄 重置所有弹幕')
              resetAllDanmaku()
              alert('所有弹幕已重置！')
            }}
            className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
          >
            重置弹幕
          </button>

          <button
            onClick={() => {
              console.log('🧹 强制清理弹幕')
              const cleanedCount = forceCleanupDanmaku()
              alert(`强制清理完成！共清理 ${cleanedCount} 条过期弹幕`)
            }}
            className="px-2 py-1 bg-orange-600 hover:bg-orange-700 rounded text-xs"
          >
            强制清理
          </button>

          <button
            onClick={() => {
              console.log('🔍 诊断弹幕问题')
              const issues = diagnoseDanmakuIssues()
              if (issues && issues.length === 0) {
                alert('弹幕系统运行正常，未发现问题！')
              } else if (issues) {
                alert(`发现 ${issues.length} 个问题，请查看控制台详情！`)
              } else {
                alert('诊断功能暂时不可用')
              }
            }}
            className="px-2 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs"
          >
            诊断问题
          </button>

          <button
            onClick={() => {
              console.log('🔍 弹幕生命周期跟踪')

              // 跟踪所有弹幕的详细状态
              console.log('=== 弹幕生命周期跟踪 ===')
              console.log('当前播放状态:', isPlaying)
              console.log('活跃弹幕数量:', activeCommentsRef.current.size)
              console.log('已显示弹幕数量:', displayedDanmakuRef.current.size)

              activeCommentsRef.current.forEach((comment) => {
                console.log(`--- 弹幕 "${comment.text}" ---`)
                console.log('ID:', comment.id)
                console.log('类型:', comment.type)
                console.log('轨道:', comment.trackIndex)
                console.log('开始时间:', comment.startTime)
                console.log('结束时间:', comment.endTime)
                console.log(
                  '清理定时器:',
                  comment.cleanupTimeout ? '存在' : '不存在'
                )

                if (comment.element) {
                  const element = comment.element
                  console.log('DOM元素存在:', !!element)
                  console.log('父元素存在:', !!element.parentNode)
                  console.log('当前位置:', element.style.transform)
                  console.log('过渡效果:', element.style.transition)
                  console.log('可见性:', element.style.visibility || 'visible')
                  console.log('透明度:', element.style.opacity || '1')
                } else {
                  console.log('DOM元素不存在')
                }
              })

              // 检查DOM中的实际元素
              if (containerRef.current) {
                const danmakuElements =
                  containerRef.current.querySelectorAll('[data-danmaku-id]')
                console.log('DOM中的弹幕元素数量:', danmakuElements.length)
                danmakuElements.forEach((element, index) => {
                  const id = element.getAttribute('data-danmaku-id')
                  const text = element.textContent
                  const transform = (element as HTMLElement).style.transform
                  console.log(
                    `DOM元素 ${
                      index + 1
                    }: ID=${id}, 内容="${text}", 位置=${transform}`
                  )
                })
              }
            }}
            className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 rounded text-xs"
          >
            生命周期跟踪
          </button>

          <button
            onClick={() => {
              // 打印详细调试信息
              console.log('=== 弹幕系统调试信息 ===')
              console.log('当前时间:', currentTime)
              console.log('播放状态:', isPlaying)
              console.log('弹幕列表:', danmakuList)
              console.log(
                '已显示弹幕:',
                Array.from(displayedDanmakuRef.current)
              )
              console.log(
                '活跃弹幕:',
                Array.from(activeCommentsRef.current.keys())
              )
              console.log('轨道信息:', allocatorRef.current?.getTrackInfo())

              // 分析弹幕时间分布
              const timeDistribution = danmakuList.reduce((acc, danmaku) => {
                const timeKey = Math.floor(danmaku.time)
                acc[timeKey] = (acc[timeKey] || 0) + 1
                return acc
              }, {} as Record<number, number>)

              console.log('弹幕时间分布:', timeDistribution)

              // 检查当前时间附近的弹幕
              const nearbyDanmaku = danmakuList
                .filter((d) => Math.abs(d.time - currentTime) <= 5)
                .sort((a, b) => a.time - b.time)

              console.log(
                '当前时间附近5秒的弹幕:',
                nearbyDanmaku.map((d) => ({
                  time: d.time,
                  text: d.text,
                  displayed: displayedDanmakuRef.current.has(d.id),
                }))
              )

              // 检查弹幕ID是否重复
              const idCount = danmakuList.reduce((acc, danmaku) => {
                acc[danmaku.id] = (acc[danmaku.id] || 0) + 1
                return acc
              }, {} as Record<string, number>)

              const duplicateIds = Object.entries(idCount).filter(
                ([id, count]) => count > 1
              )
              if (duplicateIds.length > 0) {
                console.warn('⚠️ 发现重复的弹幕ID:', duplicateIds)
              } else {
                console.log('✅ 所有弹幕ID都是唯一的')
              }

              // 检查时间匹配逻辑
              const sortedDanmaku = [...danmakuList].sort(
                (a, b) => a.time - b.time
              )
              const shouldShowDanmaku = sortedDanmaku.filter((danmaku) => {
                if (displayedDanmakuRef.current.has(danmaku.id)) {
                  return false
                }
                const timeDiff = currentTime - danmaku.time
                return timeDiff >= 0 && timeDiff <= 0.1
              })

              console.log('🔍 时间匹配测试结果:')
              console.log('- 当前时间:', currentTime)
              console.log('- 应该显示的弹幕数量:', shouldShowDanmaku.length)
              console.log(
                '- 应该显示的弹幕:',
                shouldShowDanmaku.map((d) => ({
                  id: d.id,
                  time: d.time,
                  text: d.text.substring(0, 20),
                  timeDiff: (currentTime - d.time).toFixed(3),
                }))
              )

              // 检查最后一条弹幕
              const lastDanmaku = danmakuList[danmakuList.length - 1]
              if (lastDanmaku) {
                console.log('🔍 最后一条弹幕信息:')
                console.log('- ID:', lastDanmaku.id)
                console.log('- 时间:', lastDanmaku.time)
                console.log('- 内容:', lastDanmaku.text)
                console.log(
                  '- 是否已显示:',
                  displayedDanmakuRef.current.has(lastDanmaku.id)
                )
                console.log(
                  '- 时间差:',
                  (currentTime - lastDanmaku.time).toFixed(3)
                )
              }
            }}
            className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
          >
            调试信息
          </button>

          <button
            onClick={() => {
              // 重置所有弹幕状态
              console.log('=== 重置弹幕系统 ===')

              // 清理所有弹幕元素
              activeCommentsRef.current.forEach((comment) => {
                if (comment.element?.parentNode) {
                  comment.element.parentNode.removeChild(comment.element)
                }
              })

              // 清理状态
              activeCommentsRef.current.clear()
              displayedDanmakuRef.current.clear()

              // 重新初始化分配器
              if (allocatorRef.current) {
                allocatorRef.current = new CommentSpaceAllocator(
                  config.trackHeight,
                  config.maxTracks
                )
              }

              console.log('弹幕系统已重置')
            }}
            className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
          >
            重置弹幕
          </button>

          <button
            onClick={() => {
              // 强制清理所有弹幕
              console.log('=== 强制清理所有弹幕 ===')

              // 清理DOM中的所有弹幕元素
              if (containerRef.current) {
                const danmakuElements =
                  containerRef.current.querySelectorAll('[data-danmaku-id]')
                danmakuElements.forEach((element) => {
                  if (element.parentNode) {
                    element.parentNode.removeChild(element)
                  }
                })
                console.log(`清理了 ${danmakuElements.length} 个弹幕元素`)
              }

              // 清理状态
              activeCommentsRef.current.clear()
              displayedDanmakuRef.current.clear()

              // 重新初始化分配器
              if (allocatorRef.current) {
                allocatorRef.current = new CommentSpaceAllocator(
                  config.trackHeight,
                  config.maxTracks
                )
              }

              console.log('强制清理完成')
            }}
            className="px-2 py-1 bg-orange-600 hover:bg-orange-700 rounded text-xs"
          >
            强制清理
          </button>

          <button
            onClick={() => {
              console.log('=== 弹幕系统调试信息 ===')
              // 专门检查弹幕ID和时间匹配问题
              console.log('=== 🔍 弹幕ID和时间匹配问题诊断 ===')

              // 检查弹幕数据的完整性
              console.log('📊 弹幕数据统计:')
              console.log('- 总弹幕数:', danmakuList.length)
              console.log('- 当前时间:', currentTime)
              console.log('- 播放状态:', isPlaying)

              // 检查每条弹幕的详细信息
              console.log('📋 所有弹幕详细信息:')
              danmakuList.forEach((danmaku, index) => {
                const timeDiff = currentTime - danmaku.time
                const isDisplayed = displayedDanmakuRef.current.has(danmaku.id)
                const isActive = activeCommentsRef.current.has(danmaku.id)

                console.log(`${index + 1}. ID: ${danmaku.id}`)
                console.log(
                  `   时间: ${danmaku.time}s (差值: ${timeDiff.toFixed(3)}s)`
                )
                console.log(`   内容: "${danmaku.text}"`)
                console.log(`   已显示: ${isDisplayed} | 活跃: ${isActive}`)
                console.log(
                  `   状态: ${
                    timeDiff < 0
                      ? '⏳未到'
                      : timeDiff <= 0.1
                      ? '✅匹配'
                      : '❌已过'
                  }`
                )
                console.log('---')
              })

              // 检查ID重复问题
              const idMap = new Map<string, number>()
              danmakuList.forEach((danmaku) => {
                idMap.set(danmaku.id, (idMap.get(danmaku.id) || 0) + 1)
              })

              const duplicateIds = Array.from(idMap.entries()).filter(
                ([id, count]) => count > 1
              )
              if (duplicateIds.length > 0) {
                console.warn('⚠️ 发现重复ID:', duplicateIds)
              } else {
                console.log('✅ 所有ID都是唯一的')
              }

              // 检查时间匹配逻辑
              const sortedDanmaku = [...danmakuList].sort(
                (a, b) => a.time - b.time
              )
              const shouldShowDanmaku = sortedDanmaku.filter((danmaku) => {
                if (displayedDanmakuRef.current.has(danmaku.id)) {
                  return false
                }
                const timeDiff = currentTime - danmaku.time
                return timeDiff >= 0 && timeDiff <= 0.1
              })

              console.log('🎯 时间匹配结果:')
              console.log('- 当前时间:', currentTime)
              console.log('- 应该显示的弹幕数量:', shouldShowDanmaku.length)
              if (shouldShowDanmaku.length > 0) {
                console.log('- 应该显示的弹幕:')
                shouldShowDanmaku.forEach((danmaku, index) => {
                  const timeDiff = currentTime - danmaku.time
                  console.log(
                    `  ${index + 1}. "${danmaku.text}" (${
                      danmaku.time
                    }s, 差值: ${timeDiff.toFixed(3)}s)`
                  )
                })
              }

              // 检查最后一条弹幕的特殊情况
              const lastDanmaku = danmakuList[danmakuList.length - 1]
              if (lastDanmaku) {
                console.log('🔍 最后一条弹幕信息:')
                console.log('- ID:', lastDanmaku.id)
                console.log('- 时间:', lastDanmaku.time)
                console.log('- 内容:', lastDanmaku.text)
                console.log(
                  '- 是否已显示:',
                  displayedDanmakuRef.current.has(lastDanmaku.id)
                )
                console.log(
                  '- 时间差:',
                  (currentTime - lastDanmaku.time).toFixed(3)
                )

                // 检查是否有其他弹幕与最后一条弹幕有相同的时间
                const sameTimeDanmaku = danmakuList.filter(
                  (d) => d.time === lastDanmaku.time
                )
                if (sameTimeDanmaku.length > 1) {
                  console.warn(
                    '⚠️ 发现多条弹幕有相同时间:',
                    sameTimeDanmaku.map((d) => d.text)
                  )
                }
              }

              // 检查显示状态跟踪
              console.log('📈 显示状态跟踪:')
              console.log('- 已显示弹幕数量:', displayedDanmakuRef.current.size)
              console.log('- 活跃弹幕数量:', activeCommentsRef.current.size)
              console.log(
                '- 已显示弹幕ID列表:',
                Array.from(displayedDanmakuRef.current)
              )
              console.log(
                '- 活跃弹幕ID列表:',
                Array.from(activeCommentsRef.current.keys())
              )

              // 检查DOM中的弹幕元素
              if (containerRef.current) {
                const danmakuElements =
                  containerRef.current.querySelectorAll('[data-danmaku-id]')
                console.log('🔍 DOM中的弹幕元素:')
                console.log('- 元素数量:', danmakuElements.length)
                danmakuElements.forEach((element, index) => {
                  const id = element.getAttribute('data-danmaku-id')
                  const text = element.textContent
                  const transform = (element as HTMLElement).style.transform
                  console.log(
                    `  ${
                      index + 1
                    }. ID: ${id}, 内容: "${text}", 位置: ${transform}`
                  )
                })
              }
            }}
            className="px-2 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs"
          >
            诊断问题
          </button>
        </div>
      )}
    </div>
  )
}
