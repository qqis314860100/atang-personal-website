import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TSignInSchema } from '@/schemas/signInSchema'
import {
  EnvelopeClosedIcon,
  LockClosedIcon,
  PersonIcon,
  ReloadIcon,
} from '@radix-ui/react-icons'
import {
  FieldErrors,
  UseFormHandleSubmit,
  UseFormRegister,
} from 'react-hook-form'

interface LoginFormProps {
  isDialog?: boolean
  register: UseFormRegister<TSignInSchema>
  handleSubmit: UseFormHandleSubmit<TSignInSchema>
  errors: FieldErrors<TSignInSchema>
  onSubmit: (data: TSignInSchema) => void
  isPending: boolean
  showPassword: boolean
  onTogglePassword: () => void
  onForgotPassword?: () => void
  onRegister?: () => void
  t: any
}

export default function LoginForm({
  isDialog = false,
  register,
  handleSubmit,
  errors,
  onSubmit,
  isPending,
  showPassword,
  onTogglePassword,
  onForgotPassword,
  onRegister,
  t,
}: LoginFormProps) {
  const btnCls =
    'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label
          htmlFor="email"
          className={isDialog ? 'flex items-center gap-2' : ''}
        >
          {isDialog && <EnvelopeClosedIcon className="h-4 w-4" />}
          {t.auth('邮箱')}
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="请输入邮箱"
          autoComplete="email"
          required
          className={
            isDialog
              ? 'transition-all duration-200 focus:ring-2 focus:ring-blue-500'
              : ''
          }
          {...register('email')}
        />
        {errors.email && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            {isDialog && (
              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
            )}
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="password"
          className={isDialog ? 'flex items-center gap-2' : ''}
        >
          {isDialog && <LockClosedIcon className="h-4 w-4" />}
          {t.auth('密码')}
        </Label>
        {isDialog ? (
          <Input
            id="password"
            type="password"
            required
            placeholder="请输入密码"
            autoComplete="current-password"
            className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
            {...register('password')}
          />
        ) : (
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="请输入密码"
              {...register('password')}
            />
            <button
              type="button"
              onClick={onTogglePassword}
              className="absolute inset-y-0 right-3 my-auto text-xs text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              aria-label={showPassword ? '隐藏密码' : '显示密码'}
            >
              {showPassword ? '隐藏' : '显示'}
            </button>
          </div>
        )}
        {errors.password && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            {isDialog && (
              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
            )}
            {errors.password.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isPending} className={`w-full ${btnCls}`}>
        {isPending ? (
          <>
            <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
            {t.auth('登录中...')}
          </>
        ) : (
          <>
            {isDialog && <PersonIcon className="mr-2 h-4 w-4" />}
            {t.auth('登录')}
          </>
        )}
      </Button>

      {isDialog && (
        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
          >
            {t.auth('忘记密码?')}
          </button>
          <button
            type="button"
            onClick={onRegister}
            className="text-purple-600 hover:text-purple-700 hover:underline transition-colors"
          >
            {t.auth('注册账号')}
          </button>
        </div>
      )}
    </form>
  )
}
