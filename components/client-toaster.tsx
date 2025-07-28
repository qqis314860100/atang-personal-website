'use client'

import { Toaster } from 'react-hot-toast'
import { useState, useEffect } from 'react'

export function ClientToaster() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // 只在客户端渲染
  if (!mounted) {
    return null
  }

  // 客户端挂载后渲染
  return <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
}
