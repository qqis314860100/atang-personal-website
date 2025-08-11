import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TRegisterSchema } from '@/schemas/registerSchema'
import {
  EnvelopeClosedIcon,
  IdCardIcon,
  LockClosedIcon,
  PersonIcon,
  ReloadIcon,
} from '@radix-ui/react-icons'
import {
  FieldErrors,
  UseFormHandleSubmit,
  UseFormRegister,
} from 'react-hook-form'

interface RegisterFormProps {
  isDialog?: boolean
  register: UseFormRegister<TRegisterSchema>
  handleSubmit: UseFormHandleSubmit<TRegisterSchema>
  errors: FieldErrors<TRegisterSchema>
  onSubmit: (data: TRegisterSchema) => void
  isPending: boolean
  showPassword: boolean
  showConfirmPassword: boolean
  onTogglePassword: () => void
  onToggleConfirmPassword: () => void
  onLogin?: () => void
  t: any
}

export default function RegisterForm({
  isDialog = false,
  register,
  handleSubmit,
  errors,
  onSubmit,
  isPending,
  showPassword,
  showConfirmPassword,
  onTogglePassword,
  onToggleConfirmPassword,
  onLogin,
  t,
}: RegisterFormProps) {
  const btnCls =
    'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label
          htmlFor="register-name"
          className={isDialog ? 'flex items-center gap-2' : ''}
        >
          {isDialog && <PersonIcon className="h-4 w-4" />}
          {t.auth('用户名')}
        </Label>
        <Input
          id="register-name"
          type="text"
          placeholder="请输入用户名"
          autoComplete="username"
          className={
            isDialog
              ? 'transition-all duration-200 focus:ring-2 focus:ring-green-500'
              : ''
          }
          {...register('username')}
          required
        />
        {errors.username && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            {isDialog && (
              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
            )}
            {errors.username.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="register-email"
          className={isDialog ? 'flex items-center gap-2' : ''}
        >
          {isDialog && <EnvelopeClosedIcon className="h-4 w-4" />}
          {t.auth('电子邮箱')}
        </Label>
        <Input
          id="register-email"
          type="email"
          placeholder="请输入邮箱"
          autoComplete="email"
          className={
            isDialog
              ? 'transition-all duration-200 focus:ring-2 focus:ring-green-500'
              : ''
          }
          {...register('email')}
          required
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
          htmlFor="register-password"
          className={isDialog ? 'flex items-center gap-2' : ''}
        >
          {isDialog && <LockClosedIcon className="h-4 w-4" />}
          {t.auth('密码')}
        </Label>
        {isDialog ? (
          <Input
            id="register-password"
            type="password"
            placeholder="请输入密码"
            autoComplete="new-password"
            className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
            {...register('password')}
            required
            minLength={8}
          />
        ) : (
          <div className="relative">
            <Input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="请输入密码"
              {...register('password')}
              minLength={8}
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
        <p className="text-xs text-muted-foreground">
          {t.auth('密码至少包含8个字符')}
        </p>
        {errors.password && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            {isDialog && (
              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
            )}
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="register-password-confirm"
          className={isDialog ? 'flex items-center gap-2' : ''}
        >
          {isDialog && <LockClosedIcon className="h-4 w-4" />}
          {t.auth('确认密码')}
        </Label>
        {isDialog ? (
          <Input
            id="register-password-confirm"
            type="password"
            placeholder="请再次输入密码"
            autoComplete="new-password"
            className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
            {...register('confirmPassword')}
            required
          />
        ) : (
          <div className="relative">
            <Input
              id="register-password-confirm"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="请再次输入密码"
              {...register('confirmPassword')}
            />
            <button
              type="button"
              onClick={onToggleConfirmPassword}
              className="absolute inset-y-0 right-3 my-auto text-xs text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              aria-label={showConfirmPassword ? '隐藏密码' : '显示密码'}
            >
              {showConfirmPassword ? '隐藏' : '显示'}
            </button>
          </div>
        )}
        {errors.confirmPassword && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            {isDialog && (
              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
            )}
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {isDialog ? (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onLogin}
            className="flex-1"
          >
            {t.auth('已有账号? 登录')}
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white"
          >
            {isPending ? (
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
      ) : (
        <Button
          type="submit"
          className={`w-full ${btnCls}`}
          disabled={isPending}
        >
          {isPending ? (
            <>
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              注册中...
            </>
          ) : (
            '注册账号'
          )}
        </Button>
      )}
    </form>
  )
}
