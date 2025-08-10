'use client'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { InlineLoading } from '@/components/ui/loading-spinner'
import {
  ThemeCard,
  ThemeCardContent,
  ThemeCardDescription,
  ThemeCardHeader,
  ThemeCardTitle,
} from '@/components/ui/theme-card'
import {
  useForgotPassword,
  useRegister,
  useResendVerificationEmail,
  useSignIn,
  useSignOut,
  useStableUser,
} from '@/lib/query-hook/use-auth'
import { registerSchema, TRegisterSchema } from '@/schemas/registerSchema'
import { signInSchema, TSignInSchema } from '@/schemas/signInSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ChevronRightIcon,
  EnvelopeClosedIcon,
  ExitIcon,
  IdCardIcon,
  LockClosedIcon,
  PersonIcon,
  ReloadIcon,
} from '@radix-ui/react-icons'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

export const Logon = () => {
  const [loginOpen, setLoginOpen] = useState(false)
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  const locale = useLocale()
  const t = useI18n()

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
      console.error(t.auth('登录失败'), error)
    }
  }

  const handleLogout = async () => {
    try {
      await signOutMutation.mutateAsync()
    } catch (error) {
      console.error(t.auth('登出失败'), error)
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
          <ThemeCard variant="glass" className="border-0 shadow-none">
            <ThemeCardHeader className="text-center pb-4">
              <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                <LockClosedIcon className="h-6 w-6 text-white" />
              </div>
              <ThemeCardTitle>{t.auth('账号登录')}</ThemeCardTitle>
              <ThemeCardDescription>
                {t.auth('请输入您的账号信息以登录系统')}
              </ThemeCardDescription>
            </ThemeCardHeader>
            <ThemeCardContent>
              <form
                onSubmit={handleSignInSubmit(handleSignIn)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <EnvelopeClosedIcon className="h-4 w-4" />
                    {t.auth('邮箱')}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="hello@example.com"
                    required
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    {...formSignIn('email')}
                  />
                  {signInErrors.email && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {signInErrors.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <LockClosedIcon className="h-4 w-4" />
                    {t.auth('密码')}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    {...formSignIn('password')}
                  />
                  {signInErrors.password && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {signInErrors.password.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={signInMutation.isPending}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                >
                  {signInMutation.isPending ? (
                    <>
                      <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                      {t.auth('登录中...')}
                    </>
                  ) : (
                    <>
                      <PersonIcon className="mr-2 h-4 w-4" />
                      {t.auth('登录')}
                    </>
                  )}
                </Button>
                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={openForgotPassword}
                    className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  >
                    {t.auth('忘记密码?')}
                  </button>
                  <button
                    type="button"
                    onClick={openRegister}
                    className="text-purple-600 hover:text-purple-700 hover:underline transition-colors"
                  >
                    {t.auth('注册账号')}
                  </button>
                </div>
              </form>
            </ThemeCardContent>
          </ThemeCard>
        </DialogContent>
      </Dialog>

      {/* 忘记密码对话框 */}
      <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
          <ThemeCard variant="glass" className="border-0 shadow-none">
            <ThemeCardHeader className="text-center pb-4">
              <div className="mx-auto w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mb-4">
                <EnvelopeClosedIcon className="h-6 w-6 text-white" />
              </div>
              <ThemeCardTitle>{t.auth('找回密码')}</ThemeCardTitle>
              <ThemeCardDescription>
                {t.auth('请输入您的电子邮箱，我们将发送重置密码链接给您')}
              </ThemeCardDescription>
            </ThemeCardHeader>
            <ThemeCardContent>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="reset-email"
                    className="flex items-center gap-2"
                  >
                    <EnvelopeClosedIcon className="h-4 w-4" />
                    {t.auth('电子邮箱')}
                  </Label>
                  <Input
                    id="reset-email"
                    name="email"
                    type="email"
                    placeholder="hello@example.com"
                    required
                    className="transition-all duration-200 focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={openLogin}
                    className="flex-1"
                  >
                    {t.auth('返回登录')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={forgotPasswordMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
                  >
                    {forgotPasswordMutation.isPending ? (
                      <>
                        <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                        {t.auth('处理中...')}
                      </>
                    ) : (
                      <>
                        <EnvelopeClosedIcon className="mr-2 h-4 w-4" />
                        {t.auth('发送重置链接')}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </ThemeCardContent>
          </ThemeCard>
        </DialogContent>
      </Dialog>

      {/* 注册账号对话框 */}
      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
          <ThemeCard variant="glass" className="border-0 shadow-none">
            <ThemeCardHeader className="text-center pb-4">
              <div className="mx-auto w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
                <IdCardIcon className="h-6 w-6 text-white" />
              </div>
              <ThemeCardTitle>{t.auth('注册新账号')}</ThemeCardTitle>
              <ThemeCardDescription>
                {t.auth('创建一个账号以使用我们的服务')}
              </ThemeCardDescription>
            </ThemeCardHeader>
            <ThemeCardContent>
              <form
                onSubmit={handleRegisterSubmit(handleRegister)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label
                    htmlFor="register-name"
                    className="flex items-center gap-2"
                  >
                    <PersonIcon className="h-4 w-4" />
                    {t.auth('用户名')}
                  </Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder={t.auth('用户名')}
                    className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
                    {...formRegister('username')}
                    required
                  />
                  {errors.username && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.username.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="register-email"
                    className="flex items-center gap-2"
                  >
                    <EnvelopeClosedIcon className="h-4 w-4" />
                    {t.auth('电子邮箱')}
                  </Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="hello@example.com"
                    className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
                    {...formRegister('email')}
                    required
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="register-password"
                    className="flex items-center gap-2"
                  >
                    <LockClosedIcon className="h-4 w-4" />
                    {t.auth('密码')}
                  </Label>
                  <Input
                    id="register-password"
                    type="password"
                    className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
                    {...formRegister('password')}
                    required
                    minLength={8}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t.auth('密码至少包含8个字符')}
                  </p>
                  {errors.password && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.password.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="register-password-confirm"
                    className="flex items-center gap-2"
                  >
                    <LockClosedIcon className="h-4 w-4" />
                    {t.auth('确认密码')}
                  </Label>
                  <Input
                    id="register-password-confirm"
                    type="password"
                    className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
                    {...formRegister('confirmPassword')}
                    required
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={openLogin}
                    className="flex-1"
                  >
                    {t.auth('已有账号? 登录')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={registerMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white"
                  >
                    {registerMutation.isPending ? (
                      <>
                        <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                        {t.auth('注册中...')}
                      </>
                    ) : (
                      <>
                        <IdCardIcon className="mr-2 h-4 w-4" />
                        {t.auth('注册账号')}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </ThemeCardContent>
          </ThemeCard>
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
