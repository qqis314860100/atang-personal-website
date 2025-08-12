'use client'

import { useDraggable } from '@/app/hooks/use-draggable'
import { useFullscreenAnimation } from '@/app/hooks/use-fullscreen-animation'
import { useScrollLock } from '@/app/hooks/use-scroll-lock'
import { cn } from '@/lib/utils'
import { Maximize2, Minimize2, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface FullscreenModalProps {
  isOpen: boolean
  onClose: () => void
  title?: React.ReactNode
  children: React.ReactNode
  className?: string
  header?: React.ReactNode
  footer?: React.ReactNode
  actions?: React.ReactNode
  draggable?: boolean
  initialPosition?: { x: number; y: number }
  size?: {
    width?: string
    height?: string
    maxWidth?: string
    maxHeight?: string
  }
  animation?: {
    duration?: number
    easing?: string
    scale?: number
    translateY?: number
    opacity?: number
  }
  scrollLock?: {
    enabled?: boolean
    selector?: string
    preserveScrollPosition?: boolean
  }
}

export default function FullscreenModal({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  header,
  footer,
  actions,
  draggable = false,
  initialPosition = { x: 0, y: 0 },
  size = {
    width: 'w-[500px]',
    height: 'h-[600px]',
    maxWidth: 'max-w-[90vw]',
    maxHeight: 'max-h-[80vh]',
  },
  animation = {},
  scrollLock = {},
}: FullscreenModalProps) {
  const [mounted, setMounted] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [key, setKey] = useState(0)

  // 滚动锁定
  const { lockScroll, unlockScroll } = useScrollLock({
    enabled: scrollLock.enabled ?? true,
    selector: scrollLock.selector,
    preserveScrollPosition: scrollLock.preserveScrollPosition ?? true,
  })

  // 拖拽功能
  const { position, isDragging, handlers } = useDraggable({
    initialPosition: draggable ? initialPosition : { x: 0, y: 0 },
    bounds: draggable
      ? {
          minX: 20,
          maxX: typeof window !== 'undefined' ? window.innerWidth - 84 : 0,
          minY: 20,
          maxY: typeof window !== 'undefined' ? window.innerHeight - 64 : 0,
        }
      : undefined,
    snapToEdges: draggable,
    onDragStart: () => {},
    onDragEnd: () => {},
    onDrag: () => {},
  })

  // 全屏动画
  const {
    isFullscreen,
    isAnimating,
    toggleFullscreen,
    getAnimationStyles,
    getSizeClasses,
    getAnimationStateClasses,
  } = useFullscreenAnimation(animation)

  // 初始化
  useEffect(() => {
    setMounted(true)
  }, [])

  // 滚动锁定控制
  useEffect(() => {
    if (isOpen) {
      lockScroll()
    } else {
      unlockScroll()
    }
  }, [isOpen, lockScroll, unlockScroll])

  // 处理关闭
  const handleClose = () => {
    // 延迟关闭，让动画完成
    setTimeout(() => {
      onClose()
      setIsMinimized(false)
      setKey((prev) => prev + 1)
    }, 300)
  }

  // 处理最小化
  const handleToggleMinimize = () => {
    if (isFullscreen) {
      toggleFullscreen()
    }
    setIsMinimized(!isMinimized)
  }

  // 处理全屏切换
  const handleToggleFullscreen = () => {
    if (isMinimized) {
      setIsMinimized(false)
    }
    toggleFullscreen()
  }

  // 阻止遮罩层点击事件
  const handleBackdropClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  // 计算弹窗的尺寸样式
  const getModalSizeClasses = () => {
    if (isFullscreen) {
      return 'fixed inset-4 z-[60] rounded-none w-auto h-auto'
    }

    if (isMinimized) {
      return 'w-80 h-16'
    }

    return `${size.width} ${size.height} ${size.maxWidth} ${size.maxHeight}`
  }

  // 计算弹窗的动画状态
  const getModalAnimationClasses = () => {
    if (!isOpen) return 'scale-95 opacity-0 translate-y-4'

    if (isFullscreen) {
      return 'scale-100 opacity-100 translate-y-0'
    }

    if (isMinimized) {
      return 'scale-100 opacity-100 translate-y-0'
    }

    return 'scale-100 opacity-100 translate-y-0'
  }

  if (!mounted) return null

  return (
    <>
      {/* 遮罩层 */}
      <div
        className={cn(
          'fixed z-50 inset-0 bg-black/20 backdrop-blur-sm flex items-end justify-end p-4 transition-all duration-500 ease-out',
          !isOpen && 'opacity-0 pointer-events-none'
        )}
        onClick={handleBackdropClick}
        onTouchMove={(e) => e.preventDefault()}
        onWheel={(e) => e.preventDefault()}
        onKeyDown={(e) => {
          if (e.key === 'Tab' || e.key === 'Escape') {
            e.preventDefault()
          }
        }}
        style={{ display: isOpen ? 'flex' : 'none' }}
      >
        {/* 弹窗主体 */}
        <div
          className={cn(
            'bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col',
            getModalSizeClasses(),
            getModalAnimationClasses(),
            className
          )}
          style={{
            ...getAnimationStyles(),
            ...(draggable && !isFullscreen
              ? {
                  left: `${position.x}px`,
                  top: `${position.y}px`,
                  position: 'fixed',
                  transform: isDragging ? 'scale(1.05)' : 'none',
                  transition: isDragging
                    ? 'none'
                    : 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                }
              : {}),
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 头部 */}
          <div
            className={cn(
              'flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-2xl',
              isMinimized && 'rounded-2xl'
            )}
            {...(draggable && !isFullscreen ? handlers : {})}
          >
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              {title && (
                <span className="font-bold text-lg text-gray-800">{title}</span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {actions}

              {/* 全屏/缩小按钮 */}
              <button
                onClick={handleToggleFullscreen}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-300 hover:scale-110 cursor-pointer"
                title={isFullscreen ? '退出全屏' : '全屏'}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4 text-gray-600 transition-transform duration-300" />
                ) : (
                  <Maximize2 className="w-4 h-4 text-gray-600 transition-transform duration-300" />
                )}
              </button>

              {/* 关闭按钮 */}
              <button
                onClick={handleClose}
                className="p-2 hover:bg-red-50 rounded-lg transition-all duration-300 hover:scale-110 group cursor-pointer"
                title="关闭"
              >
                <X className="w-4 h-4 text-gray-600 group-hover:text-red-600 transition-colors duration-300" />
              </button>
            </div>
          </div>

          {/* 自定义头部 */}
          {header && !isMinimized && (
            <div className="flex-shrink-0 border-b border-gray-100">
              {header}
            </div>
          )}

          {/* 内容区域 */}
          {!isMinimized && (
            <div className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto pr-2">{children}</div>
            </div>
          )}

          {/* 最小化时的显示 */}
          {isMinimized && (
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-sm text-gray-600">已最小化</span>
              <button
                onClick={() => setIsMinimized(false)}
                className="text-blue-600 text-sm hover:text-blue-700 transition-colors duration-300"
              >
                展开
              </button>
            </div>
          )}

          {/* 自定义底部 */}
          {footer && !isMinimized && (
            <div className="flex-shrink-0 border-t border-gray-100">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
