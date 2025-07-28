import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { useState } from 'react'
import {
  PersonIcon,
  ReloadIcon,
  ExitIcon,
  ChevronRightIcon,
} from '@radix-ui/react-icons'
import { register, signIn, resendVerificationEmail } from '@/app/actions/auth'
import { createClient } from '@/utils/supabase/client'
import { useForm } from 'react-hook-form'
import { registerSchema, TRegisterSchema } from '@/schemas/registerSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { signInSchema, TSignInSchema } from '@/schemas/signInSchema'
import { useLocale } from 'next-intl'
import { useUserStore } from '@/lib/store/user-store'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import Link from 'next/link'

export const Logon = () => {
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const { setUser, user, isLoggedIn, logout, isLoading } = useUserStore(
    (state) => state
  )

  const locale = useLocale()

  const supabase = createClient()

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

  const handleSingIn = async (data: TSignInSchema) => {
    setIsLoggingIn(true)
    try {
      const signInResult = await signIn(data, locale)
      console.log('signInResult', signInResult)
      if (
        signInResult &&
        signInResult.status === 'success' /*  */ &&
        signInResult.user
      ) {
        setUser(signInResult.user)
        setLoginOpen(false)
        resetSignIn()
        toast.success(signInResult.message || '登录成功')
      } else {
        // 检查是否是“邮件未验证”的特定错误
        if (signInResult.message === 'Email not confirmed') {
          // 使用 toast.custom 创建一个带按钮的自定义提示
          toast.custom((t) => (
            <div
              className={`${
                t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-md w-full bg-background shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
            >
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      邮箱尚未验证
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      请检查收件箱或点击下方按钮重发邮件。
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-border">
                <button
                  onClick={async () => {
                    await resendVerificationEmail(data.email)
                    toast.dismiss(t.id)
                  }}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-primary hover:text-primary/80 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  重发邮件
                </button>
              </div>
            </div>
          ))
        } else {
          toast.error(signInResult.message || '登录失败')
        }
      }
    } catch (error) {
      console.error('登录失败:', error)
    } finally {
      setIsLoggingIn(false)
    }
  }
  const handleLogout = async () => {
    await supabase.auth.signOut()
    logout()
    toast.success('您已成功退出登录')
  }

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsProcessing(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setForgotPasswordOpen(false)
      // 可以显示一个成功提示
      alert('重置密码链接已发送到您的邮箱')
    } catch (error) {
      console.error('发送重置密码邮件失败:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRegister = async (data: TRegisterSchema) => {
    setIsProcessing(true)
    try {
      const result = await register(data)
      if (result) {
        if (result.status === 'success') {
          await supabase.auth.signOut()
          setRegisterOpen(false)
          toast.success(result.message || '注册成功,请查收验证邮件~')
          reset()
        } else {
          toast.error(result.message || '登录失败,请重试~')
        }
      }
    } catch (error) {
      const err = error as Error
      console.log(err.message)
      toast.error('注册失败:' + err.message)
    } finally {
      setIsProcessing(false)
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

  // 如果正在加载用户状态，显示加载指示器
  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" className="h-9 w-9 px-0">
        <ReloadIcon className="h-4 w-4 animate-spin" />
      </Button>
    )
  }

  if (isLoggedIn) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
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
          <DropdownMenuItem className="cursor-pointer flex w-full justify-between items-center py-2">
            <div className="flex items-center">
              <PersonIcon className="mr-2 h-4 w-4" />
              <Link href={`/${locale}/user/profile`}>个人中心</Link>
            </div>
            <ChevronRightIcon className="h-4 w-4" />
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleLogout}
            className="cursor-pointer flex w-full justify-between items-center py-2"
          >
            <div className="flex items-center">
              <ExitIcon className="mr-2 h-4 w-4" />
              <span>退出登录</span>
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
          <form onSubmit={handleSignInSubmit(handleSingIn)}>
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
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">密码</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  {...formSignIn('password')}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoggingIn}>
                {isLoggingIn ? (
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
              <Button type="submit" disabled={isProcessing}>
                {isProcessing ? (
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
              </div>
              <div className="grid gap-2">
                <Label htmlFor="register-password-confirm">确认密码</Label>
                <Input
                  id="register-password-confirm"
                  type="password"
                  {...formRegister('confirmPassword')}
                  required
                />
              </div>
            </div>
            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={openLogin}>
                已有账号? 登录
              </Button>
              <Button type="submit" disabled={isProcessing}>
                {isProcessing ? (
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
