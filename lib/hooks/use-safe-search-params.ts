import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

/**
 * @description The provided callback is no longer runnable,避免了回调函数问题
 * @description 安全的搜索参数Hook，避免回调函数问题
 */
export function useSafeSearchParams() {
  const searchParams = useSearchParams()
  const [safeParams, setSafeParams] = useState<URLSearchParams | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (mounted && searchParams) {
      setSafeParams(searchParams)
    }
  }, [mounted, searchParams])

  const get = (key: string): string | null => {
    if (!safeParams || !mounted) return null
    return safeParams.get(key)
  }

  const getAll = (key: string): string[] => {
    if (!safeParams || !mounted) return []
    return safeParams.getAll(key)
  }

  const has = (key: string): boolean => {
    if (!safeParams || !mounted) return false
    return safeParams.has(key)
  }

  const toString = (): string => {
    if (!safeParams || !mounted) return ''
    return safeParams.toString()
  }

  return {
    get,
    getAll,
    has,
    toString,
    mounted,
    searchParams: safeParams,
  }
}
