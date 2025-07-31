// app/[locale]/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useStableUser } from '@/lib/query-hook/use-auth'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useLocale } from 'next-intl'

export default function DashboardPage() {
  const { user, isLoading } = useStableUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectFrom = searchParams.get('redirectFrom')
  const locale = useLocale()

  // 用户登录状态
  const [authState, setAuthState] = useState<
    'loading' | 'authenticated' | 'unauthenticated'
  >('loading')

  useEffect(() => {
    if (!isLoading) {
      setAuthState(user ? 'authenticated' : 'unauthenticated')
    }
  }, [user, isLoading])

  // 如果还在加载，显示加载状态
  if (authState === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // 如果已登录，显示仪表盘内容
  if (authState === 'authenticated') {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">仪表盘</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* 仪表盘卡片 */}
          <Card>
            <CardHeader>
              <CardTitle>个人信息</CardTitle>
              <CardDescription>查看和管理您的个人资料</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <strong>用户名:</strong> {user?.username}
                </p>
                <p>
                  <strong>邮箱:</strong> {user?.email}
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href={`/${locale}/user/profile`}>编辑资料</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* 更多仪表盘卡片 */}
        </div>
      </div>
    )
  }

  // 如果未登录，显示登录提示
  return (
    <div className="container mx-auto py-8 px-4 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>需要登录</CardTitle>
          <CardDescription>您需要登录才能访问完整功能</CardDescription>
        </CardHeader>
        <CardContent>
          {redirectFrom && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>访问受限</AlertTitle>
              <AlertDescription>
                您尝试访问的页面需要登录才能查看
              </AlertDescription>
            </Alert>
          )}
          <p className="text-muted-foreground mb-4">
            请登录您的账号以访问所有功能，或者注册一个新账号。
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Button
            className="flex-1"
            onClick={() => {
              const loginPath = `/${locale}/login`
              const url = new URL(loginPath, window.location.origin)
              if (redirectFrom) {
                url.searchParams.set('redirectTo', redirectFrom)
              }
              router.push(url.toString())
            }}
          >
            登录
          </Button>
          <Button
            className="flex-1"
            variant="outline"
            onClick={() => router.push(`/${locale}`)}
          >
            返回首页
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
