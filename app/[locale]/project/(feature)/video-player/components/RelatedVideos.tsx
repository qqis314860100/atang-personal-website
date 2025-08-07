'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Play } from 'lucide-react'

export function RelatedVideos() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>相关视频</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center text-gray-500 py-8">
          <Play className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>暂无相关视频</p>
        </div>
      </CardContent>
    </Card>
  )
}
