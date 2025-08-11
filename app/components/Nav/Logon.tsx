'use client'
import { AuthForms } from '@/app/components/auth/AuthForm'
import { useI18n } from '@/app/hooks/use-i18n'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { InlineLoading } from '@/components/ui/loading-spinner'
import { useSignOut, useStableUser } from '@/lib/query-hook/use-auth'
import { ChevronRightIcon, ExitIcon, PersonIcon } from '@radix-ui/react-icons'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export const Logon = () => {
  const [loginOpen, setLoginOpen] = useState(false)
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  const locale = useLocale()
  const t = useI18n()

  // 使用 React Query hooks
  const { user, isLoading } = useStableUser()
  const signOutMutation = useSignOut()

  // 防止水合不一致
  useEffect(() => {
    setMounted(true)
  }, [])

  const isLoggedIn = !!user

  const handleLogout = async () => {
    try {
      await signOutMutation.mutateAsync()
    } catch (error) {
      console.error(t.auth('登出失败'), error)
    }
  }

  const handleAuthSuccess = (action: 'login' | 'register' | 'forgot') => {
    if (action === 'login') {
      setLoginOpen(false)
    } else if (action === 'register') {
      setRegisterOpen(false)
    } else if (action === 'forgot') {
      setForgotPasswordOpen(false)
    }
  }

  const handleVariantChange = (variant: string) => {
    if (variant === 'forgot') {
      setLoginOpen(false)
      setForgotPasswordOpen(true)
    } else if (variant === 'register') {
      setLoginOpen(false)
      setRegisterOpen(true)
    } else if (variant === 'login') {
      setForgotPasswordOpen(false)
      setRegisterOpen(false)
      setLoginOpen(true)
    }
  }

  // 如果正在加载用户状态或未挂载，显示加载指示器
  if (!mounted || isLoading) {
    return (
      <Button variant="ghost" size="sm" className="h-9 w-9 px-0">
        <InlineLoading text="" />
      </Button>
    )
  }

  if (isLoggedIn) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={user?.avatar || undefined}
                alt={user?.username || 'User'}
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {user?.username?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56 rounded-xl border shadow-lg"
          align="end"
          forceMount
          sideOffset={5}
        >
          <div className="flex items-center p-3 gap-3 border-b">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={user?.avatar || undefined}
                alt={user?.username || 'User'}
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {user?.username?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user?.username}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
              <Badge variant="outline" className="text-xs w-fit">
                已登录
              </Badge>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer flex w-full justify-between items-center py-2 hover:bg-gray-50 dark:hover:bg-gray-800"
            asChild
          >
            <Link
              className="flex items-center"
              href={`/${locale}/user/profile`}
            >
              <div className="flex items-center">
                <PersonIcon className="mr-2 h-4 w-4" />
                {t.auth('个人中心')}
              </div>
              <ChevronRightIcon className="h-4 w-4" />
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleLogout}
            disabled={signOutMutation.isPending}
            className="cursor-pointer flex w-full justify-between items-center py-2 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <div className="flex items-center">
              <ExitIcon className="mr-2 h-4 w-4" />
              <span>
                {signOutMutation.isPending
                  ? t.auth('退出中...')
                  : t.auth('退出登录')}
              </span>
            </div>
            <ChevronRightIcon className="h-4 w-4" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <>
      {/* 登录对话框 */}
      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-800"
          >
            <PersonIcon className="h-4 w-4" />
            <span>{t.auth('登录')}</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
          <AuthForms
            mode="dialog"
            variant="login"
            onSuccess={handleAuthSuccess}
            onClose={() => setLoginOpen(false)}
            onVariantChange={handleVariantChange}
          />
        </DialogContent>
      </Dialog>

      {/* 忘记密码对话框 */}
      <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
          <AuthForms
            mode="dialog"
            variant="forgot"
            onSuccess={handleAuthSuccess}
            onClose={() => setForgotPasswordOpen(false)}
            onVariantChange={handleVariantChange}
          />
        </DialogContent>
      </Dialog>

      {/* 注册账号对话框 */}
      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
          <AuthForms
            mode="dialog"
            variant="register"
            onSuccess={handleAuthSuccess}
            onClose={() => setRegisterOpen(false)}
            onVariantChange={handleVariantChange}
          />
        </DialogContent>
      </Dialog>

      {/* 移动端登录按钮 */}
      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 sm:hidden hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            <PersonIcon className="h-4 w-4" />
          </Button>
        </DialogTrigger>
      </Dialog>
    </>
  )
}

export default Logon
