'use client'

import { Eye } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface ViewCounterProps {
  postId: string
  initialViewCount?: number
}

export default function ViewCounter({
  postId,
  initialViewCount = 0,
}: ViewCounterProps) {
  const [count, setCount] = useState<number>(initialViewCount)
  const didIncrementRef = useRef(false)

  useEffect(() => {
    if (didIncrementRef.current || !postId) return
    didIncrementRef.current = true
    ;(async () => {
      try {
        const res = await fetch('/api/posts/increment-view', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId }),
        })
        if (res.ok) {
          const data = (await res.json()) as {
            success: boolean
            viewCount?: number
          }
          if (data.success && typeof data.viewCount === 'number') {
            setCount(data.viewCount)
          }
        }
      } catch (e) {
        // 忽略失败，维持初始值
      }
    })()
  }, [postId])

  return (
    <span className="inline-flex items-center gap-1 text-gray-600">
      <Eye className="h-4 w-4" />
      <span>{count}</span>
    </span>
  )
}
