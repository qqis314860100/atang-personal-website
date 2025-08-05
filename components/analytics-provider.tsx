'use client'

import { createContext, useContext, useEffect, ReactNode } from 'react'
import { initializeAnalytics } from '@/lib/analytics'

interface AnalyticsContextType {
  isInitialized: boolean
}

const AnalyticsContext = createContext<AnalyticsContextType>({
  isInitialized: false,
})

export function useAnalyticsContext() {
  return useContext(AnalyticsContext)
}

interface AnalyticsProviderProps {
  children: ReactNode
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  useEffect(() => {
    // 初始化埋点系统
    initializeAnalytics().catch((error) => {
      console.error('Failed to initialize analytics:', error)
    })
  }, [])

  return (
    <AnalyticsContext.Provider value={{ isInitialized: true }}>
      {children}
    </AnalyticsContext.Provider>
  )
}
