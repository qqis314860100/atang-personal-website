'use client'

import { create } from 'zustand'
import { useCallback } from 'react'

interface LoadingState {
  isLoading: boolean
  message: string
  subMessage: string
  showLoading: (message?: string, subMessage?: string) => void
  hideLoading: () => void
}

export const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: false,
  message: '正在处理',
  subMessage: '请稍候...',
  showLoading: (message = '正在处理', subMessage = '请稍候...') =>
    set({ isLoading: true, message, subMessage }),
  hideLoading: () => set({ isLoading: false }),
}))

// 便捷的hook
export function useLoading() {
  // 使用 useCallback 确保函数引用稳定，不依赖 store 实例
  const showLoading = useCallback((message?: string, subMessage?: string) => {
    useLoadingStore.getState().showLoading(message, subMessage)
  }, [])

  const hideLoading = useCallback(() => {
    useLoadingStore.getState().hideLoading()
  }, [])

  return {
    showLoading,
    hideLoading,
  }
}
