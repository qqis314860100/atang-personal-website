'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'

interface RealTimeContextType {
  isEnabled: boolean
  setIsEnabled: (enabled: boolean) => void
  refetchInterval: number | false
  lastUpdate: Date
  updateLastUpdate: () => void
}

const RealTimeContext = createContext<RealTimeContextType | undefined>(
  undefined
)

export function RealTimeProvider({ children }: { children: ReactNode }) {
  const [isEnabled, setIsEnabled] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [isPageVisible, setIsPageVisible] = useState(true)
  const [isOnline, setIsOnline] = useState(true)

  // 监听页面可见性变化
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // 监听网络状态变化
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // 计算实际的刷新间隔
  const refetchInterval = (() => {
    if (!isEnabled) return false
    if (!isOnline) return false

    // 页面可见时 30 秒，不可见时 60 秒
    return isPageVisible ? 30 * 1000 : 60 * 1000
  })()

  // 更新最后更新时间
  const updateLastUpdate = () => {
    setLastUpdate(new Date())
  }

  return (
    <RealTimeContext.Provider
      value={{
        isEnabled,
        setIsEnabled,
        refetchInterval,
        lastUpdate,
        updateLastUpdate,
      }}
    >
      {children}
    </RealTimeContext.Provider>
  )
}

export function useRealTime() {
  const context = useContext(RealTimeContext)
  if (context === undefined) {
    throw new Error('useRealTime must be used within a RealTimeProvider')
  }
  return context
}
