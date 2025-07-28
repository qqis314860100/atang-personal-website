'use client'

import { UpdateIcon } from '@radix-ui/react-icons'

export function FullscreenLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex items-center space-x-2 text-foreground">
        <UpdateIcon className="h-6 w-6 animate-spin" />
        <span className="text-lg font-medium">加载中...</span>
      </div>
    </div>
  )
}
