'use client'

import { useI18n } from '@/app/hooks/use-i18n'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  useSignIn,
} from '@/lib/query-hook/use-auth'
import { registerSchema, TRegisterSchema } from '@/schemas/registerSchema'
import { signInSchema, TSignInSchema } from '@/schemas/signInSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  EnvelopeClosedIcon,
  IdCardIcon,
  LockClosedIcon,
} from '@radix-ui/react-icons'
import { useLocale } from 'next-intl'
import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import ForgotPasswordForm from './ForgotPasswordForm'
import LoginForm from './LoginForm'
import PasswordChangedAlert from './PasswordChangedAlert'
import RegisterForm from './RegisterForm'

interface AuthFormsProps {
  mode: 'dialog' | 'page'
  variant?: 'login' | 'register' | 'forgot'
  onVariantChange?: (variant: string) => void
  onSuccess?: (action: 'login' | 'register' | 'forgot') => void
  onClose?: () => void
  reason?: string
  redirectTo?: string
}

export function AuthForms({
  mode,
  variant = 'login',
  onVariantChange,
  onSuccess,
  onClose,
  reason,
  redirectTo = '/',
}: AuthFormsProps) {
  const [activeTab, setActiveTab] = useState('login')
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [mounted, setMounted] = useState(false)

  const locale = useLocale()
  const t = useI18n()

  // 使用 React Query hooks
  const signInMutation = useSignIn()
  const registerMutation = useRegister()
  const forgotPasswordMutation = useForgotPassword()

  // 防止水合不一致
  useEffect(() => {
    setMounted(true)
  }, [])

  // 登录表单
  const {
    register: formSignIn,
    handleSubmit: handleSignInSubmit,
    formState: { errors: signInErrors },
    reset: resetSignIn,
  } = useForm<TSignInSchema>({ resolver: zodResolver(signInSchema) })

  // 注册表单
  const {
    register: formRegister,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
    reset: resetRegister,
  } = useForm<TRegisterSchema>({ resolver: zodResolver(registerSchema) })

  // 处理登录
  const handleSignIn = useCallback(
    async (data: TSignInSchema) => {
      if (!mounted) return

      try {
        const result = await signInMutation.mutateAsync({ data, locale })

        if (result.status === 'success' && mounted) {
          onSuccess?.('login')
          resetSignIn()
          if (mode === 'dialog') {
            onClose?.()
          }
        }
      } catch (error) {
        console.error('登录失败:', error)
      }
    },
    [mounted, signInMutation, locale, onSuccess, resetSignIn, mode, onClose]
  )

  // 处理注册
  const handleRegister = useCallback(
    async (data: TRegisterSchema) => {
      if (!mounted) return

      try {
        const result = await registerMutation.mutateAsync(data)

        if (result.status === 'success' && mounted) {
          onSuccess?.('register')
          resetRegister()
          if (mode === 'dialog') {
            onClose?.()
          } else {
            setActiveTab('login')
          }
        }
      } catch (error) {
        console.error('注册失败:', error)
      }
    },
    [mounted, registerMutation, onSuccess, resetRegister, mode, onClose]
  )

  // 处理忘记密码
  const handleForgotPassword = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      if (!mounted) return

      e.preventDefault()
      const formData = new FormData(e.currentTarget)
      const email = formData.get('email') as string

      try {
        await forgotPasswordMutation.mutateAsync(email)
        onSuccess?.('forgot')
        if (mode === 'dialog') {
          onClose?.()
        } else {
          setActiveTab('login')
        }
      } catch (error) {
        console.error('发送重置密码邮件失败:', error)
      }
    },
    [mounted, forgotPasswordMutation, onSuccess, mode, onClose]
  )

  // Dialog 模式下的切换处理
  const openForgotPassword = () => {
    onVariantChange?.('forgot')
  }

  const openRegister = () => {
    onVariantChange?.('register')
  }

  const openLogin = () => {
    onVariantChange?.('login')
  }

  // 如果未挂载，显示加载状态
  if (!mounted) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  const iconCls =
    'mx-auto w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4'

  // Dialog 模式
  if (mode === 'dialog') {
    const isDialog = true
    return (
      <>
        {variant === 'login' && (
          <ThemeCard variant="glass" className="border-0 shadow-none">
            <ThemeCardHeader className="text-center pb-4">
              <div className={iconCls}>
                <LockClosedIcon className="h-6 w-6 text-white" />
              </div>
              <ThemeCardTitle>{t.auth('账号登录')}</ThemeCardTitle>
              <ThemeCardDescription>
                {t.auth('请输入您的账号信息以登录系统')}
              </ThemeCardDescription>
            </ThemeCardHeader>
            <ThemeCardContent>
              <LoginForm
                isDialog={isDialog}
                register={formSignIn}
                handleSubmit={handleSignInSubmit}
                errors={signInErrors}
                onSubmit={handleSignIn}
                isPending={signInMutation.isPending}
                showPassword={showLoginPassword}
                onTogglePassword={() => setShowLoginPassword((v) => !v)}
                onForgotPassword={openForgotPassword}
                onRegister={openRegister}
                t={t}
              />
            </ThemeCardContent>
          </ThemeCard>
        )}

        {variant === 'register' && (
          <ThemeCard variant="glass" className="border-0 shadow-none">
            <ThemeCardHeader className="text-center pb-4">
              <div className={iconCls}>
                <IdCardIcon className="h-6 w-6 text-white" />
              </div>
              <ThemeCardTitle>{t.auth('注册新账号')}</ThemeCardTitle>
              <ThemeCardDescription>
                {t.auth('创建一个账号以使用我们的服务')}
              </ThemeCardDescription>
            </ThemeCardHeader>
            <ThemeCardContent>
              <RegisterForm
                isDialog={isDialog}
                register={formRegister}
                handleSubmit={handleRegisterSubmit}
                errors={registerErrors}
                onSubmit={handleRegister}
                isPending={registerMutation.isPending}
                showPassword={showRegisterPassword}
                showConfirmPassword={showConfirmPassword}
                onTogglePassword={() => setShowRegisterPassword((v) => !v)}
                onToggleConfirmPassword={() =>
                  setShowConfirmPassword((v) => !v)
                }
                onLogin={openLogin}
                t={t}
              />
            </ThemeCardContent>
          </ThemeCard>
        )}

        {variant === 'forgot' && (
          <ThemeCard variant="glass" className="border-0 shadow-none">
            <ThemeCardHeader className="text-center pb-4">
              <div className={iconCls}>
                <EnvelopeClosedIcon className="h-6 w-6 text-white" />
              </div>
              <ThemeCardTitle>{t.auth('找回密码')}</ThemeCardTitle>
              <ThemeCardDescription>
                {t.auth('请输入您的电子邮箱，我们将发送重置密码链接给您')}
              </ThemeCardDescription>
            </ThemeCardHeader>
            <ThemeCardContent>
              <ForgotPasswordForm
                isDialog={isDialog}
                onSubmit={handleForgotPassword}
                isPending={forgotPasswordMutation.isPending}
                onLogin={openLogin}
                t={t}
              />
            </ThemeCardContent>
          </ThemeCard>
        )}
      </>
    )
  }

  // 页面模式
  return (
    <>
      {/* 站点标志 */}
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
          欢迎使用
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          登录您的账户以获取完整功能
        </p>
      </div>

      <PasswordChangedAlert reason={reason || ''} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">登录</TabsTrigger>
          <TabsTrigger value="register">注册</TabsTrigger>
        </TabsList>

        {/* 登录表单 */}
        <TabsContent value="login">
          <Card>
            <CardContent className="pt-6">
              <LoginForm
                register={formSignIn}
                handleSubmit={handleSignInSubmit}
                errors={signInErrors}
                onSubmit={handleSignIn}
                isPending={signInMutation.isPending}
                showPassword={showLoginPassword}
                onTogglePassword={() => setShowLoginPassword((v) => !v)}
                t={t}
              />
            </CardContent>
            <CardFooter>
              <button
                type="button"
                onClick={() => setActiveTab('forgot')}
                className="text-xs text-primary hover:underline"
              >
                忘记密码?
              </button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* 注册表单 */}
        <TabsContent value="register">
          <Card>
            <CardContent className="pt-6">
              <RegisterForm
                register={formRegister}
                handleSubmit={handleRegisterSubmit}
                errors={registerErrors}
                onSubmit={handleRegister}
                isPending={registerMutation.isPending}
                showPassword={showRegisterPassword}
                showConfirmPassword={showConfirmPassword}
                onTogglePassword={() => setShowRegisterPassword((v) => !v)}
                onToggleConfirmPassword={() =>
                  setShowConfirmPassword((v) => !v)
                }
                t={t}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 忘记密码表单 */}
        <TabsContent value="forgot">
          <Card>
            <CardContent className="pt-6">
              <ForgotPasswordForm
                onSubmit={handleForgotPassword}
                isPending={forgotPasswordMutation.isPending}
                onBackToLogin={() => setActiveTab('login')}
                t={t}
              />
            </CardContent>
            <CardFooter>
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="text-xs text-primary hover:underline"
              >
                返回登录
              </button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}
