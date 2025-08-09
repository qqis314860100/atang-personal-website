import { useState, useRef, useCallback, useEffect } from 'react'

interface Position {
  x: number
  y: number
}

interface UseDraggableOptions {
  initialPosition?: Position
  bounds?: {
    minX?: number
    maxX?: number
    minY?: number
    maxY?: number
  }
  snapToEdges?: boolean
  snapThreshold?: number
  onDragStart?: () => void
  onDragEnd?: (position: Position) => void
  onDrag?: (position: Position) => void
}

export function useDraggable(options: UseDraggableOptions = {}) {
  const {
    initialPosition = { x: 0, y: 0 },
    bounds,
    snapToEdges = false,
    snapThreshold = 50,
    onDragStart,
    onDragEnd,
    onDrag,
  } = options

  const [position, setPosition] = useState<Position>(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const [mounted, setMounted] = useState(false)

  const isDraggingRef = useRef(false)
  const lastMousePosition = useRef<Position>({ x: 0, y: 0 })
  const dragOffset = useRef<Position>({ x: 0, y: 0 })
  const animationFrameRef = useRef<number>(0)
  const initialPositionRef = useRef(initialPosition)

  // 初始化位置 - 只在组件挂载时设置一次
  const hasInitialized = useRef(false)

  useEffect(() => {
    initialPositionRef.current = initialPosition
  })

  useEffect(() => {
    if (!hasInitialized.current && typeof window !== 'undefined') {
      setMounted(true)
      setPosition(initialPositionRef.current)
      hasInitialized.current = true
    }
  }, [])

  // 计算边界限制的位置
  const getBoundedPosition = useCallback(
    (newPosition: Position): Position => {
      let { x, y } = newPosition

      if (bounds) {
        if (bounds.minX !== undefined) x = Math.max(x, bounds.minX)
        if (bounds.maxX !== undefined) x = Math.min(x, bounds.maxX)
        if (bounds.minY !== undefined) y = Math.max(y, bounds.minY)
        if (bounds.maxY !== undefined) y = Math.min(y, bounds.maxY)
      }

      return { x, y }
    },
    [bounds?.minX, bounds?.maxX, bounds?.minY, bounds?.maxY]
  )

  // 吸附到边缘
  const getSnappedPosition = useCallback(
    (pos: Position): Position => {
      if (!snapToEdges || typeof window === 'undefined') return pos

      const centerX = window.innerWidth / 2
      const targetX = pos.x < centerX ? 20 : window.innerWidth - 84

      return {
        ...pos,
        x: targetX,
      }
    },
    [snapToEdges]
  )

  // 处理拖拽开始
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      setIsDragging(true)
      isDraggingRef.current = true
      onDragStart?.()

      lastMousePosition.current = { x: e.clientX, y: e.clientY }

      const rect = e.currentTarget.getBoundingClientRect()
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    },
    [onDragStart]
  )

  // 处理触摸开始
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (e.touches.length === 1) {
        const touch = e.touches[0]
        setIsDragging(true)
        isDraggingRef.current = true
        onDragStart?.()

        lastMousePosition.current = { x: touch.clientX, y: touch.clientY }

        const rect = e.currentTarget.getBoundingClientRect()
        dragOffset.current = {
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top,
        }
      }
    },
    [onDragStart]
  )

  // 处理鼠标移动
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingRef.current) return

      const deltaX = e.clientX - lastMousePosition.current.x
      const deltaY = e.clientY - lastMousePosition.current.y

      // 如果移动距离太小，跳过更新
      if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) return

      lastMousePosition.current = { x: e.clientX, y: e.clientY }

      // 取消之前的动画帧
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      // 使用 requestAnimationFrame 确保流畅的拖动
      animationFrameRef.current = requestAnimationFrame(() => {
        const newX = e.clientX - dragOffset.current.x
        const newY = e.clientY - dragOffset.current.y

        const boundedPosition = getBoundedPosition({ x: newX, y: newY })
        setPosition(boundedPosition)
        onDrag?.(boundedPosition)
      })
    },
    [getBoundedPosition, onDrag]
  )

  // 处理触摸移动
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return

      const touch = e.touches[0]
      const deltaX = touch.clientX - lastMousePosition.current.x
      const deltaY = touch.clientY - lastMousePosition.current.y

      if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) return

      lastMousePosition.current = { x: touch.clientX, y: touch.clientY }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        const newX = touch.clientX - dragOffset.current.x
        const newY = touch.clientY - dragOffset.current.y

        const boundedPosition = getBoundedPosition({ x: newX, y: newY })
        setPosition(boundedPosition)
        onDrag?.(boundedPosition)
      })
    },
    [getBoundedPosition, onDrag]
  )

  // 处理拖拽结束
  const handleMouseUp = useCallback(() => {
    if (!isDraggingRef.current) return

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    setIsDragging(false)
    isDraggingRef.current = false

    // 使用函数式更新来避免依赖 position
    setPosition((currentPosition) => {
      const snappedPosition = getSnappedPosition(currentPosition)
      onDragEnd?.(snappedPosition)
      return snappedPosition
    })
  }, [getSnappedPosition, onDragEnd])

  // 处理触摸结束
  const handleTouchEnd = useCallback(() => {
    if (!isDraggingRef.current) return

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    setIsDragging(false)
    isDraggingRef.current = false

    // 使用函数式更新来避免依赖 position
    setPosition((currentPosition) => {
      const snappedPosition = getSnappedPosition(currentPosition)
      onDragEnd?.(snappedPosition)
      return snappedPosition
    })
  }, [getSnappedPosition, onDragEnd])

  // 添加全局事件监听
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove, { passive: false })
    document.addEventListener('mouseup', handleMouseUp, { passive: false })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd])

  // 设置位置
  const setPositionManually = useCallback(
    (newPosition: Position) => {
      const boundedPosition = getBoundedPosition(newPosition)
      setPosition(boundedPosition)
    },
    [getBoundedPosition]
  )

  // 重置位置
  const resetPosition = useCallback(() => {
    const boundedPosition = getBoundedPosition(initialPositionRef.current)
    setPosition(boundedPosition)
  }, [getBoundedPosition])

  return {
    position,
    isDragging,
    mounted,
    setPosition: setPositionManually,
    resetPosition,
    handlers: {
      onMouseDown: handleMouseDown,
      onTouchStart: handleTouchStart,
    },
  }
}
