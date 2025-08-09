'use client'

import { useState, ReactNode, useEffect } from 'react'
import { Maximize2, Minimize2 } from 'lucide-react'
import { useFullscreenAnimation } from '@/app/hooks/use-fullscreen-animation'

interface FullscreenCardProps {
  title: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
  header?: ReactNode
  footer?: ReactNode
}

export function FullscreenCard({
  title,
  actions,
  children,
  className = '',
  header,
  footer,
}: FullscreenCardProps) {
  const {
    isFullscreen,
    isAnimating,
    toggleFullscreen,
    getAnimationStyles,
    getSizeClasses,
    getAnimationStateClasses,
  } = useFullscreenAnimation({
    duration: 400,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    scale: 0.95,
    translateY: 10,
    opacity: 0.9,
  })

  // 全屏时禁用 body 滚动
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    // 清理函数
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isFullscreen])

  return (
    <div
      className={`${
        isFullscreen ? 'fixed inset-0 z-50 p-4 md:p-6 bg-gray-900/95' : ''
      }`}
    >
      <div
        className={`bg-gray-900/50 border border-gray-800 rounded-lg h-[400px] flex flex-col ${className} ${getSizeClasses(
          'relative'
        )}`}
        style={getAnimationStyles()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-800/50">
          <div className="flex items-center gap-3 text-lg font-semibold text-white">
            {title}
          </div>
          <div className="flex items-center gap-2">
            {actions}
            <button
              onClick={toggleFullscreen}
              className={`p-2 rounded-md bg-gray-800/60 hover:bg-gray-700/60 text-gray-200 transition-all duration-200 ${
                isAnimating ? 'scale-95' : ''
              }`}
              title={isFullscreen ? '退出全屏' : '全屏'}
              disabled={isAnimating}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {header && (
          <div className="flex-shrink-0 border-b border-gray-800/50">
            {header}
          </div>
        )}

        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto pr-2">{children}</div>
        </div>

        {footer && (
          <div className="flex-shrink-0 border-t border-gray-800/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
