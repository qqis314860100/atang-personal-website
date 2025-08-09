'use client'

import { Loader2 } from 'lucide-react'

interface LoadingOverlayProps {
  isVisible: boolean
  message?: string
  subMessage?: string
}

export function LoadingOverlay({
  isVisible,
  message = '正在处理',
  subMessage = '请稍候...',
}: LoadingOverlayProps) {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900/90 border border-gray-700 rounded-lg px-8 py-6 flex items-center gap-4 shadow-2xl">
        <Loader2 className="w-6 h-6 text-blue-400 animate-spin flex-shrink-0" />
        <div className="flex flex-col">
          {message && <p className="text-white font-medium">{message}</p>}
          {subMessage && <p className="text-gray-400 text-sm">{subMessage}</p>}
        </div>
      </div>
    </div>
  )
}
