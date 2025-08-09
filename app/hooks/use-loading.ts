'use client'

import { create } from 'zustand'

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
  const { showLoading, hideLoading } = useLoadingStore()

  return {
    showLoading,
    hideLoading,
  }
}
