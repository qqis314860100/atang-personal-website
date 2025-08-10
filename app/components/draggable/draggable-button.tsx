'use client'

import { useDraggable } from '@/app/hooks/use-draggable'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface DraggableButtonProps {
  children: ReactNode
  onClick?: () => void
  className?: string
  initialPosition?: { x: number; y: number }
  bounds?: {
    minX?: number
    maxX?: number
    minY?: number
    maxY?: number
  }
  snapToEdges?: boolean
  onDragStart?: () => void
  onDragEnd?: (position: { x: number; y: number }) => void
  onDrag?: (position: { x: number; y: number }) => void
}

export default function DraggableButton({
  children,
  onClick,
  className = '',
  initialPosition = { x: 0, y: 0 },
  bounds,
  snapToEdges = true,
  onDragStart,
  onDragEnd,
  onDrag,
}: DraggableButtonProps) {
  const { position, isDragging, handlers } = useDraggable({
    initialPosition,
    bounds,
    snapToEdges,
    onDragStart,
    onDragEnd,
    onDrag,
  })

  return (
    <button
      className={cn(
        'fixed z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-2xl w-16 h-16 flex items-center justify-center hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-110 hover:shadow-3xl cursor-move select-none',
        isDragging ? 'scale-105 shadow-3xl' : '',
        className
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: isDragging ? 'scale(1.05)' : 'none',
        transition: isDragging
          ? 'none'
          : 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      {...handlers}
      onClick={onClick}
      title="可拖拽按钮"
    >
      {children}
      {/* 脉冲动画 */}
      <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20"></div>
    </button>
  )
}
