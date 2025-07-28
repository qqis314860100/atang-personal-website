'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useUserStore } from '@/lib/store/user-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/utils/supabase/client'
import toast from 'react-hot-toast'
import { UpdateIcon } from '@radix-ui/react-icons'

const settingsSchema = z
  .object({
    currentPassword: z.string().min(1, '当前密码不能为空'),
    newPassword: z.string().min(8, '新密码至少8位'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '两次密码输入不一致',
    path: ['confirmPassword'],
  })

type TSettingsForm = z.infer<typeof settingsSchema>

export default function SettingsPage() {
  const { user } = useUserStore()
  const [isUpdating, setIsUpdating] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TSettingsForm>({
    resolver: zodResolver(settingsSchema),
  })

  const handleUpdatePassword = async (data: TSettingsForm) => {
    setIsUpdating(true)
    try {
      // 模拟数据获取延迟
      await new Promise((resolve) => setTimeout(resolve, 500))
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      })

      if (error) throw error
      toast.success('密码更新成功')
    } catch (error: any) {
      toast.error(`密码更新失败: ${error.message}`)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>安全设置</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(handleUpdatePassword)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="currentPassword">当前密码</Label>
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
            <Label htmlFor="newPassword">新密码</Label>
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
            <Label htmlFor="confirmPassword">确认新密码</Label>
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
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? (
              <span className="inline-flex items-center">
                <UpdateIcon className="mr-2 h-4 w-4 animate-spin" />
                更新中...
              </span>
            ) : (
              '更新密码'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
