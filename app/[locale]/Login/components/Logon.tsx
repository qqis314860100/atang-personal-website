'use client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState, useEffect } from 'react'
import {
  PersonIcon,
  ReloadIcon,
  ExitIcon,
  ChevronRightIcon,
} from '@radix-ui/react-icons'
import { useForm } from 'react-hook-form'
import { registerSchema, TRegisterSchema } from '@/schemas/registerSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import { signInSchema, TSignInSchema } from '@/schemas/signInSchema'
import { useLocale } from 'next-intl'
import {
  useStableUser,
  useSignIn,
  useSignOut,
  useRegister,
  useResendVerificationEmail,
  useForgotPassword,
} from '@/lib/query-hook/use-auth'
import { InlineLoading } from '@/components/ui/loading-spinner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'

export const Logon = () => {
  const [loginOpen, setLoginOpen] = useState(false)
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  const locale = useLocale()

  // 使用 React Query hooks
  const { user, isLoading } = useStableUser()
  const signInMutation = useSignIn()
  const signOutMutation = useSignOut()
  const registerMutation = useRegister()
  const resendEmailMutation = useResendVerificationEmail()
  const forgotPasswordMutation = useForgotPassword()

  // 防止水合不一致
  useEffect(() => {
    setMounted(true)
  }, [])

  const isLoggedIn = !!user
  console.log('user', user, isLoading, isLoggedIn)
  const {
    register: formRegister,
    handleSubmit: handleRegisterSubmit,
    formState: { errors },
    reset,
  } = useForm<TRegisterSchema>({ resolver: zodResolver(registerSchema) })

  const {
    register: formSignIn,
    handleSubmit: handleSignInSubmit,
    reset: resetSignIn,
    formState: { errors: signInErrors },
  } = useForm<TSignInSchema>({ resolver: zodResolver(signInSchema) })

  const handleSignIn = async (data: TSignInSchema) => {
    try {
      await signInMutation.mutateAsync({ data, locale })
      setLoginOpen(false)
      resetSignIn()
      // 错误处理已经在 mutation 中完成
    } catch (error) {
      console.error('登录失败:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await signOutMutation.mutateAsync()
    } catch (error) {
      console.error('登出失败:', error)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string

    try {
      await forgotPasswordMutation.mutateAsync(email)
      setForgotPasswordOpen(false)
    } catch (error) {
      console.error('发送重置密码邮件失败:', error)
    }
  }

  const handleRegister = async (data: TRegisterSchema) => {
    try {
      const result = await registerMutation.mutateAsync(data)

      if (result.status === 'success') {
        setRegisterOpen(false)
        reset()
      }
      // 错误处理已经在 mutation 中完成
    } catch (error) {
      console.error('注册失败:', error)
    }
  }

  const handleResendEmail = async (email: string) => {
    try {
      await resendEmailMutation.mutateAsync(email)
    } catch (error) {
      console.error('重发验证邮件失败:', error)
    }
  }

  // 处理对话框之间的切换
  const openForgotPassword = () => {
    setLoginOpen(false)
    setForgotPasswordOpen(true)
  }

  const openRegister = () => {
    setLoginOpen(false)
    setRegisterOpen(true)
  }

  const openLogin = () => {
    setForgotPasswordOpen(false)
    setRegisterOpen(false)
    setLoginOpen(true)
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
          <Button variant="ghost" className="relative h-8 w-8 rounded-full ">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={user?.avatar || undefined}
                alt={user?.username || 'User'}
              />
              <AvatarFallback>{user?.username?.charAt(0)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56"
          align="end"
          forceMount
          sideOffset={5}
        >
          <div className="flex items-center p-2 gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={user?.avatar || undefined}
                alt={user?.username || 'User'}
              />
              <AvatarFallback>{user?.username?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user?.username}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer flex w-full justify-between items-center py-2"
            asChild
          >
            <Link
              className="flex items-center"
              href={`/${locale}/user/profile`}
            >
              <div className="flex">
                <PersonIcon className="mr-2 h-4 w-4" />
                个人中心
              </div>
              <ChevronRightIcon className="h-4 w-4" />
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleLogout}
            disabled={signOutMutation.isPending}
            className="cursor-pointer flex w-full justify-between items-center py-2"
          >
            <div className="flex items-center">
              <ExitIcon className="mr-2 h-4 w-4" />
              <span>
                {signOutMutation.isPending ? '退出中...' : '退出登录'}
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
          <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
            <PersonIcon className="h-4 w-4" />
            <span>登录</span>
          </Button>
        </DialogTrigger>
        <DialogContent
          onInteractOutside={(e) => {
            e.preventDefault()
          }}
          className="sm:max-w-[425px]"
        >
          <DialogHeader>
            <DialogTitle>账号登录</DialogTitle>
            <DialogDescription>请输入您的账号信息以登录系统</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSignInSubmit(handleSignIn)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="hello@example.com"
                  required
                  {...formSignIn('email')}
                />
                {signInErrors.email && (
                  <p className="text-sm text-red-500">
                    {signInErrors.email.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">密码</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  {...formSignIn('password')}
                />
                {signInErrors.password && (
                  <p className="text-sm text-red-500">
                    {signInErrors.password.message}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={signInMutation.isPending}>
                {signInMutation.isPending ? (
                  <>
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                    登录中...
                  </>
                ) : (
                  '登录'
                )}
              </Button>
            </DialogFooter>
            <div className="mt-4 text-sm text-center">
              <button
                type="button"
                onClick={openForgotPassword}
                className="text-primary hover:underline"
              >
                忘记密码?
              </button>
              <span className="mx-2">•</span>
              <button
                type="button"
                onClick={openRegister}
                className="text-primary hover:underline"
              >
                注册账号
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 忘记密码对话框 */}
      <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
        <DialogContent
          onInteractOutside={(e) => {
            e.preventDefault()
          }}
          className="sm:max-w-[425px]"
        >
          <DialogHeader>
            <DialogTitle>找回密码</DialogTitle>
            <DialogDescription>
              请输入您的电子邮箱，我们将发送重置密码链接给您
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotPassword}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="reset-email">电子邮箱</Label>
                <Input
                  id="reset-email"
                  name="email"
                  type="email"
                  placeholder="hello@example.com"
                  required
                />
              </div>
            </div>
            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={openLogin}>
                返回登录
              </Button>
              <Button type="submit" disabled={forgotPasswordMutation.isPending}>
                {forgotPasswordMutation.isPending ? (
                  <>
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                    处理中...
                  </>
                ) : (
                  '发送重置链接'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 注册账号对话框 */}
      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent
          onInteractOutside={(e) => {
            e.preventDefault()
          }}
          className="sm:max-w-[425px]"
        >
          <DialogHeader>
            <DialogTitle>注册新账号</DialogTitle>
            <DialogDescription>创建一个账号以使用我们的服务</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRegisterSubmit(handleRegister)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="register-name">用户名</Label>
                <Input
                  id="register-name"
                  type="text"
                  placeholder="用户名"
                  {...formRegister('username')}
                  required
                />
                {errors.username && (
                  <p className="text-sm text-red-500">
                    {errors.username.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="register-email">电子邮箱</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="hello@example.com"
                  {...formRegister('email')}
                  required
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="register-password">密码</Label>
                <Input
                  id="register-password"
                  type="password"
                  {...formRegister('password')}
                  required
                  minLength={8}
                />
                <p className="text-xs text-muted-foreground">
                  密码至少包含8个字符
                </p>
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="register-password-confirm">确认密码</Label>
                <Input
                  id="register-password-confirm"
                  type="password"
                  {...formRegister('confirmPassword')}
                  required
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={openLogin}>
                已有账号? 登录
              </Button>
              <Button type="submit" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? (
                  <>
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                    注册中...
                  </>
                ) : (
                  '注册账号'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 移动端登录按钮 */}
      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9 sm:hidden">
            <PersonIcon className="h-4 w-4" />
          </Button>
        </DialogTrigger>
      </Dialog>
    </>
  )
}

export default Logon
