// app/[locale]/login/page.tsx

'use client'

import { AuthForms } from '@/app/components/auth/AuthForm'
import { useRouter } from '@/i18n/navigation'
import { useSafeSearchParams } from '@/lib/hooks/use-safe-search-params'
import { useStableUser } from '@/lib/query-hook/use-auth'
import { useLocale } from 'next-intl'
import {
  useCallback,
  useEffect as useClientEffect,
  useEffect,
  useState,
} from 'react'

export default function Login() {
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { get: getSearchParam, mounted: paramsMounted } = useSafeSearchParams()
  const locale = useLocale()

  // 安全地获取搜索参数
  const reason = getSearchParam('reason')
  const redirectTo = getSearchParam('redirectTo') || '/'

  const { user, isLoading } = useStableUser()

  // 防止水合不一致
  useEffect(() => {
    setMounted(true)
    return () => {
      setMounted(false)
    }
  }, [])

  // 告知布局/头部：登录页应隐藏 Header
  useClientEffect(() => {
    document.documentElement.setAttribute('data-hide-header', 'true')
    return () => {
      document.documentElement.removeAttribute('data-hide-header')
    }
  }, [])

  // 处理认证成功
  const handleAuthSuccess = useCallback(
    (action: 'login' | 'register' | 'forgot') => {
      if (action === 'login' && mounted) {
        // 登录成功后重定向到之前尝试访问的页面
        router.push(redirectTo)
      }
    },
    [mounted, router, redirectTo]
  )

  // 如果未挂载或正在加载，显示加载状态
  if (!mounted || !paramsMounted || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // 如果已登录，不显示任何内容（将被重定向）
  if (user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center">
          <div className="max-w-md w-full space-y-8">
            {/* 使用共享的认证表单组件 */}
            <AuthForms
              mode="page"
              onSuccess={handleAuthSuccess}
              reason={reason || undefined}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
