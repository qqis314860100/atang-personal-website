// app/[locale]/login/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signInSchema, TSignInSchema } from '@/schemas/signInSchema'
import {
  useSignIn,
  useRegister,
  useForgotPassword,
  useStableUser,
} from '@/lib/query-hook/use-auth'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ReloadIcon, ArrowLeftIcon } from '@radix-ui/react-icons'
import { registerSchema, TRegisterSchema } from '@/schemas/registerSchema'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('login')
  const router = useRouter()
  const searchParams = useSearchParams()
  const locale = useLocale()
  const reason = searchParams.get('reason')

  const redirectTo = searchParams.get('redirectTo') || '/'
  const { user, isLoading } = useStableUser()

  // 使用 React Query hooks
  const signInMutation = useSignIn()
  const registerMutation = useRegister()
  const forgotPasswordMutation = useForgotPassword()

  // 登录表单
  const {
    register: formSignIn,
    handleSubmit: handleSignInSubmit,
    formState: { errors: signInErrors },
  } = useForm<TSignInSchema>({ resolver: zodResolver(signInSchema) })

  // 注册表单
  const {
    register: formRegister,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
  } = useForm<TRegisterSchema>({ resolver: zodResolver(registerSchema) })

  // 处理登录
  const handleSignIn = async (data: TSignInSchema) => {
    try {
      const result = await signInMutation.mutateAsync({ data, locale })

      if (result.status === 'success') {
        // 登录成功后重定向到之前尝试访问的页面
        router.push(redirectTo)
      }
    } catch (error) {
      console.error('登录失败:', error)
    }
  }

  // 处理注册
  const handleRegister = async (data: TRegisterSchema) => {
    try {
      const result = await registerMutation.mutateAsync(data)

      if (result.status === 'success') {
        setActiveTab('login')
      }
    } catch (error) {
      console.error('注册失败:', error)
    }
  }

  // 处理忘记密码
  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string

    try {
      await forgotPasswordMutation.mutateAsync(email)
    } catch (error) {
      console.error('发送重置密码邮件失败:', error)
    }
  }

  // 如果正在加载，显示加载状态
  if (isLoading) {
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* 返回首页链接 */}
        <div className="flex justify-start">
          <Link
            href="/"
            className="flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            返回首页
          </Link>
        </div>

        {/* 站点标志 */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            欢迎使用
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            登录您的账户以获取完整功能
          </p>
        </div>

        {/* 密码更改提示 */}
        {reason === 'password_changed' && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-900/20">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle>密码已更新</AlertTitle>
            <AlertDescription>
              您的密码已成功更新，请使用新密码登录。
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">登录</TabsTrigger>
            <TabsTrigger value="register">注册</TabsTrigger>
          </TabsList>

          {/* 登录表单 */}
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>账号登录</CardTitle>
                <CardDescription>请输入您的账号信息以登录系统</CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  id="login-form"
                  onSubmit={handleSignInSubmit(handleSignIn)}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="email">邮箱</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="hello@example.com"
                      {...formSignIn('email')}
                    />
                    {signInErrors.email && (
                      <p className="text-sm text-red-500">
                        {signInErrors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">密码</Label>
                      <button
                        type="button"
                        onClick={() => setActiveTab('forgot')}
                        className="text-xs text-primary hover:underline"
                      >
                        忘记密码?
                      </button>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      {...formSignIn('password')}
                    />
                    {signInErrors.password && (
                      <p className="text-sm text-red-500">
                        {signInErrors.password.message}
                      </p>
                    )}
                  </div>
                </form>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  form="login-form"
                  className="w-full"
                  disabled={signInMutation.isPending}
                >
                  {signInMutation.isPending ? (
                    <>
                      <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                      登录中...
                    </>
                  ) : (
                    '登录'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* 注册表单 */}
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>注册新账号</CardTitle>
                <CardDescription>创建一个账号以使用我们的服务</CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  id="register-form"
                  onSubmit={handleRegisterSubmit(handleRegister)}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="register-name">用户名</Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="用户名"
                      {...formRegister('username')}
                    />
                    {registerErrors.username && (
                      <p className="text-sm text-red-500">
                        {registerErrors.username.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">电子邮箱</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="hello@example.com"
                      {...formRegister('email')}
                    />
                    {registerErrors.email && (
                      <p className="text-sm text-red-500">
                        {registerErrors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">密码</Label>
                    <Input
                      id="register-password"
                      type="password"
                      {...formRegister('password')}
                      minLength={8}
                    />
                    <p className="text-xs text-muted-foreground">
                      密码至少包含8个字符
                    </p>
                    {registerErrors.password && (
                      <p className="text-sm text-red-500">
                        {registerErrors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password-confirm">确认密码</Label>
                    <Input
                      id="register-password-confirm"
                      type="password"
                      {...formRegister('confirmPassword')}
                    />
                    {registerErrors.confirmPassword && (
                      <p className="text-sm text-red-500">
                        {registerErrors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </form>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  form="register-form"
                  className="w-full"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    <>
                      <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                      注册中...
                    </>
                  ) : (
                    '注册账号'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* 忘记密码表单 */}
          <TabsContent value="forgot">
            <Card>
              <CardHeader>
                <CardTitle>找回密码</CardTitle>
                <CardDescription>
                  请输入您的电子邮箱，我们将发送重置密码链接给您
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  id="forgot-form"
                  onSubmit={handleForgotPassword}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">电子邮箱</Label>
                    <Input
                      id="reset-email"
                      name="email"
                      type="email"
                      placeholder="hello@example.com"
                      required
                    />
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <Button
                  type="submit"
                  form="forgot-form"
                  className="w-full"
                  disabled={forgotPasswordMutation.isPending}
                >
                  {forgotPasswordMutation.isPending ? (
                    <>
                      <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                      处理中...
                    </>
                  ) : (
                    '发送重置链接'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setActiveTab('login')}
                >
                  返回登录
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
