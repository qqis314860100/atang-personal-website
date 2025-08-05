'use client'

import { useEffect, useState } from 'react'
import { Eye } from 'lucide-react'

interface ViewCounterProps {
  postId: string
  initialViewCount?: number
}

export default function ViewCounter({
  postId,
  initialViewCount = 0,
}: ViewCounterProps) {
  const [viewCount, setViewCount] = useState(initialViewCount)
  const [hasIncremented, setHasIncremented] = useState(false)

  useEffect(() => {
    // 只在客户端执行，避免重复增加
    if (!hasIncremented) {
      const incrementView = async () => {
        try {
          const response = await fetch('/api/posts/increment-view', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ postId }),
          })

          if (response.ok) {
            const data = await response.json()
            setViewCount(data.viewCount)
            setHasIncremented(true)
          }
        } catch (error) {
          console.error('增加阅读量失败:', error)
        }
      }

      incrementView()
    }
  }, [postId, hasIncremented])

  return (
    <div className="flex items-center gap-2">
      <Eye className="h-4 w-4" />
      <span>{viewCount} 次阅读</span>
    </div>
  )
}
