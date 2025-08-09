'use client'

import { LoadingOverlay } from '@/app/components/loading/loading-overlay'
import { useLoadingStore } from '@/app/hooks/use-loading'

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const { isLoading, message, subMessage } = useLoadingStore()

  return (
    <>
      {children}
      <LoadingOverlay
        isVisible={isLoading}
        message={message}
        subMessage={subMessage}
      />
    </>
  )
}
