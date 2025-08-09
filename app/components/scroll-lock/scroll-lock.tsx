'use client'

import { useEffect, useRef } from 'react'

interface ScrollLockProps {
  isActive: boolean
  children: React.ReactNode
  className?: string
}

interface ScrollPosition {
  x: number
  y: number
}

interface TouchHandler {
  onTouchStart: string
  onTouchMove: string
}

export default function ScrollLock({
  isActive,
  children,
  className = '',
}: ScrollLockProps) {
  const scrollPositionRef = useRef<ScrollPosition>({ x: 0, y: 0 })
  const touchHandlersRef = useRef<Map<HTMLElement, TouchHandler>>(new Map())

  useEffect(() => {
    if (!isActive) return

    // 保存当前滚动位置
    const scrollY = window.scrollY
    const scrollX = window.scrollX
    scrollPositionRef.current = { x: scrollX, y: scrollY }

    // 禁止body滚动
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.left = `-${scrollX}px`
    document.body.style.width = '100%'

    // 禁止html滚动
    document.documentElement.style.overflow = 'hidden'

    // 禁止触摸滚动
    document.body.style.touchAction = 'none'

    // 保存滚动位置到body数据属性
    document.body.dataset.scrollY = scrollY.toString()
    document.body.dataset.scrollX = scrollX.toString()

    // 智能滚动穿透防护
    const preventScrollBleed = () => {
      const scrollableElements = document.querySelectorAll(
        'div, section, article, aside, main, nav, header, footer, ul, ol, li, table, form'
      )

      scrollableElements.forEach((element) => {
        const el = element as HTMLElement
        const style = window.getComputedStyle(el)

        // 检查是否为可滚动元素
        if (
          style.overflow === 'auto' ||
          style.overflow === 'scroll' ||
          style.overflowY === 'auto' ||
          style.overflowY === 'scroll'
        ) {
          let startY = 0
          let startScrollTop = 0

          const onTouchStart = (e: TouchEvent) => {
            if (e.targetTouches.length === 1) {
              startY = e.targetTouches[0].clientY
              startScrollTop = el.scrollTop
            }
          }

          const onTouchMove = (e: TouchEvent) => {
            if (e.targetTouches.length !== 1) return

            const touch = e.targetTouches[0]
            const deltaY = touch.clientY - startY
            const newScrollTop = startScrollTop - deltaY

            // 检查边界条件
            if (newScrollTop <= 0 && deltaY > 0) {
              // 在顶部向下滑动
              e.preventDefault()
              return
            }

            if (
              newScrollTop + el.clientHeight >= el.scrollHeight &&
              deltaY < 0
            ) {
              // 在底部向上滑动
              e.preventDefault()
              return
            }
          }

          el.addEventListener('touchstart', onTouchStart, false)
          el.addEventListener('touchmove', onTouchMove, false)

          // 保存事件监听器引用，用于清理
          if (!el.dataset.scrollPreventers) {
            el.dataset.scrollPreventers = 'true'
            el.dataset.touchHandlers = JSON.stringify({
              onTouchStart: onTouchStart.toString(),
              onTouchMove: onTouchMove.toString(),
            })

            // 保存到ref中，用于清理
            touchHandlersRef.current.set(el, {
              onTouchStart: onTouchStart.toString(),
              onTouchMove: onTouchMove.toString(),
            })
          }
        }
      })
    }

    // 执行滚动穿透防护
    preventScrollBleed()

    // 清理函数
    return () => {
      // 恢复滚动
      const { x: scrollX, y: scrollY } = scrollPositionRef.current

      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.width = ''
      document.documentElement.style.overflow = ''
      document.body.style.touchAction = ''

      // 恢复滚动位置
      window.scrollTo(scrollX, scrollY)

      // 清理触摸事件监听器
      const scrollableElements = document.querySelectorAll(
        '[data-scroll-preventers="true"]'
      )
      scrollableElements.forEach((element) => {
        const el = element as HTMLElement
        // 移除触摸事件监听器
        el.removeEventListener('touchstart', () => {}, false)
        el.removeEventListener('touchmove', () => {}, false)
        // 清理数据属性
        delete el.dataset.scrollPreventers
        delete el.dataset.touchHandlers
      })

      // 清理ref
      touchHandlersRef.current.clear()

      // 清理body数据属性
      delete document.body.dataset.scrollY
      delete document.body.dataset.scrollX
    }
  }, [isActive])

  return <div className={className}>{children}</div>
}
