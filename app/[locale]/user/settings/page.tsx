'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ThemeCard,
  ThemeCardContent,
  ThemeCardHeader,
  ThemeCardTitle,
} from '@/components/ui/theme-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { UpdateIcon } from '@radix-ui/react-icons'
import { useI18n } from '@/app/hooks/use-i18n'
import { useUpdatePassword } from '@/lib/query-hook/use-setting'
import {
  updateClientPasswordSchema,
  TUpdateClientPasswordSchema,
} from '@/schemas/passwordSchema'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const [userEmail, setUserEmail] = useState<string>('')
  const supabase = createClient()
  const t = useI18n()
  const updatePasswordMutation = useUpdatePassword()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TUpdateClientPasswordSchema>({
    resolver: zodResolver(updateClientPasswordSchema),
  })

  // 获取当前用户邮箱
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user?.email) {
        setUserEmail(user.email)
      }
    }
    getUser()
  }, [])

  const handleUpdatePassword = async (data: TUpdateClientPasswordSchema) => {
    if (!userEmail) {
      toast.error('无法获取用户邮箱')
      return
    }

    try {
      await updatePasswordMutation.mutateAsync({
        email: userEmail,
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      })

      // 成功后重置表单
      reset()
    } catch (error) {
      // 错误处理已经在 mutation 中完成
      console.error('更新密码失败:', error)
    }
  }

  return (
    <ThemeCard variant="glass">
      <ThemeCardHeader>
        <ThemeCardTitle>{t.setting('安全设置')}</ThemeCardTitle>
      </ThemeCardHeader>
      <ThemeCardContent>
        <form
          onSubmit={handleSubmit(handleUpdatePassword)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="currentPassword">{t.setting('当前密码')}</Label>
            <Input
              id="currentPassword"
              type="password"
              {...register('currentPassword')}
            />
            {errors.currentPassword && (
              <p className="text-sm text-red-500">
                {errors.currentPassword.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">{t.setting('新密码')}</Label>
            <Input
              id="newPassword"
              type="password"
              {...register('newPassword')}
            />
            {errors.newPassword && (
              <p className="text-sm text-red-500">
                {errors.newPassword.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t.setting('确认密码')}</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          <Button type="submit" disabled={updatePasswordMutation.isPending}>
            {updatePasswordMutation.isPending ? (
              <span className="inline-flex items-center">
                <UpdateIcon className="mr-2 h-4 w-4 animate-spin" />
                {t.common('更新中...')}
              </span>
            ) : (
              t.setting('更新密码')
            )}
          </Button>
        </form>
      </ThemeCardContent>
    </ThemeCard>
  )
}
