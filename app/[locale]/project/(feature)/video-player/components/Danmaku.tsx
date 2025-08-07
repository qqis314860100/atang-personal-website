'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface DanmakuItem {
  id: string
  text: string
  time: number
  color: string
  type: 'scroll' | 'top' | 'bottom'
  sendTime: string
}

interface DanmakuProps {
  danmakuList: DanmakuItem[]
  currentTime: number
}

export function Danmaku({ danmakuList, currentTime }: DanmakuProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeDanmaku, setActiveDanmaku] = useState<
    Array<
      DanmakuItem & {
        element: HTMLDivElement
        startTime: number
        track: number
      }
    >
  >([])
  const [processedDanmaku, setProcessedDanmaku] = useState<Set<string>>(
    new Set()
  )
  const [tracks, setTracks] = useState<boolean[]>([])

  // 初始化轨道
  useEffect(() => {
    if (containerRef.current) {
      const containerHeight = containerRef.current.clientHeight
      const trackHeight = 30 // 每个轨道高度
      const trackCount = Math.floor((containerHeight - 100) / trackHeight) // 减去顶部和底部空间
      setTracks(new Array(Math.max(5, trackCount)).fill(false))
    }
  }, [])

  // 获取可用轨道
  const getAvailableTrack = useCallback(() => {
    const availableTrack = tracks.findIndex((track) => !track)
    if (availableTrack === -1) {
      // 如果没有可用轨道，使用第一个轨道
      return 0
    }
    return availableTrack
  }, [tracks])

  // 创建弹幕元素
  const createDanmakuElement = useCallback(
    (danmaku: DanmakuItem, track: number) => {
      const element = document.createElement('div')
      element.className = `
      absolute whitespace-nowrap text-white text-sm font-bold
      px-2 py-1 rounded bg-black/50 backdrop-blur-sm
      select-none pointer-events-none
      animate-danmaku-scroll
    `
      element.style.color = danmaku.color
      element.style.textShadow = '1px 1px 2px rgba(0,0,0,0.8)'
      element.style.textShadow = `
      1px 1px 0 rgba(0, 0, 0, 0.8),
      -1px -1px 0 rgba(0, 0, 0, 0.8),
      1px -1px 0 rgba(0, 0, 0, 0.8),
      -1px 1px 0 rgba(0, 0, 0, 0.8)
    `
      element.textContent = danmaku.text

      // 设置轨道位置
      const trackHeight = 30
      const topOffset = 50 // 顶部偏移
      element.style.top = `${topOffset + track * trackHeight}px`
      element.style.left = `${containerRef.current?.clientWidth || 0}px`

      return element
    },
    []
  )

  // 添加弹幕到屏幕
  const addDanmakuToScreen = useCallback(
    (danmaku: DanmakuItem) => {
      if (!containerRef.current) return

      const track = getAvailableTrack()
      const element = createDanmakuElement(danmaku, track)
      const container = containerRef.current

      // 标记轨道为使用中
      setTracks((prev) => {
        const newTracks = [...prev]
        newTracks[track] = true
        return newTracks
      })

      container.appendChild(element)

      // 添加到活跃弹幕列表
      setActiveDanmaku((prev) => [
        ...prev,
        {
          ...danmaku,
          element,
          startTime: Date.now(),
          track,
        },
      ])

      // 动画结束后移除
      setTimeout(() => {
        if (element.parentNode) {
          element.parentNode.removeChild(element)
        }
        setActiveDanmaku((prev) => prev.filter((d) => d.id !== danmaku.id))
        // 释放轨道
        setTracks((prev) => {
          const newTracks = [...prev]
          newTracks[track] = false
          return newTracks
        })
      }, 12000) // 12秒动画时间，确保完整滚动
    },
    [getAvailableTrack, createDanmakuElement]
  )

  // 监听弹幕列表变化，避免重复显示
  useEffect(() => {
    const newDanmaku = danmakuList[danmakuList.length - 1]
    if (
      newDanmaku &&
      Math.abs(newDanmaku.time - currentTime) < 0.5 &&
      !processedDanmaku.has(newDanmaku.id)
    ) {
      // 标记为已处理
      setProcessedDanmaku((prev) => new Set([...prev, newDanmaku.id]))
      addDanmakuToScreen(newDanmaku)
    }
  }, [danmakuList, currentTime, processedDanmaku, addDanmakuToScreen])

  // 清理组件
  useEffect(() => {
    return () => {
      // 清理所有活跃弹幕
      activeDanmaku.forEach((danmaku) => {
        if (danmaku.element.parentNode) {
          danmaku.element.parentNode.removeChild(danmaku.element)
        }
      })
    }
  }, [activeDanmaku])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
    >
      {/* 弹幕元素会在这里动态添加 */}
    </div>
  )
}
