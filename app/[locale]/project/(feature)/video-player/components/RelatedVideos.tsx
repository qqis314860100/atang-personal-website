'use client'

import {
  ThemeCard,
  ThemeCardContent,
  ThemeCardHeader,
  ThemeCardTitle,
} from '@/components/ui/theme-card'
import { Play } from 'lucide-react'

export function RelatedVideos() {
  return (
    <ThemeCard variant="glass">
      <ThemeCardHeader>
        <ThemeCardTitle>相关视频</ThemeCardTitle>
      </ThemeCardHeader>
      <ThemeCardContent>
        <div className="text-center text-gray-500 py-8">
          <Play className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>暂无相关视频</p>
        </div>
      </ThemeCardContent>
    </ThemeCard>
  )
}
