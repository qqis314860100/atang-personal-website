'use client'

import { useState, useEffect } from 'react'
import { redirect, useParams } from 'next/navigation'
import { useUserStore } from '@/lib/store/user-store'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { CalendarIcon, UpdateIcon } from '@radix-ui/react-icons'
import { createClient } from '@/utils/supabase/client'
import toast from 'react-hot-toast'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { userProfileSchema, TUserProfile } from '@/schemas/userProfileSchema'
import { updateUser } from '@/app/actions/updateUser'
import { cn } from '@/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { zhCN, enUS } from 'date-fns/locale'

const localeMap = {
  zh: zhCN,
  en: enUS,
}

const UserProfile = () => {
  const { user, setUser, isLoading: userLoading } = useUserStore()
  const [isLoading, setIsLoading] = useState(false)
  const [date, setDate] = useState<Date>()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    user?.avatar || null
  )
  const { locale } = useParams()
  const supabase = createClient()
  const initData = {
    username: user?.username || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
    gender: user?.gender || '',
    signature: user?.signature || '',
    techStack: user?.techStack || [],
    bio: user?.bio || '',
  }
  const {
    register: userRegister,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    reset,
    setValue,
    control,
  } = useForm<TUserProfile>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: initData,
  })

  useEffect(() => {
    // 当user加载完成后更新表单数据
    if (user) {
      reset(initData)
      setAvatarUrl(user.avatar || null)
      setDate(user.date ? new Date(user.date) : undefined)
    }
  }, [user, reset])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e)
    try {
      setIsLoading(true)
      const file = e.target.files?.[0]
      if (!file || !user?.id) return

      // 文件验证
      const maxSizeInBytes = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSizeInBytes) {
        toast.error(`文件大小不能超过5MB`)
        return
      }

      // 仅允许图片格式
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      if (!validTypes.includes(file.type)) {
        toast.error('请上传有效的图片格式 (JPEG, PNG, GIF, WEBP)')
        return
      }

      // 创建唯一文件路径 - 使用UUID和时间戳确保唯一性
      const timestamp = Date.now()
      const fileExt = file.name.split('.').pop()
      const filePath = `avatars/${user.id}-${timestamp}.${fileExt}`

      // 上传到Supabase Storage
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('upload')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false, // 不覆盖同名文件
        })

      if (uploadError) {
        throw uploadError
      }

      // 获取公共URL
      const { data: urlData } = supabase.storage
        .from('upload')
        .getPublicUrl(filePath)

      const avatarUrl = urlData.publicUrl

      // 删除旧头像（如果有）
      if (user.avatar && user.avatar.includes('upload/')) {
        try {
          // 从URL中提取文件路径
          const oldPath = user.avatar.split('/').slice(-1)[0]
          await supabase.storage.from('upload').remove([oldPath])
          // 删除旧文件无论成功与否都继续更新头像
        } catch (deleteError) {
          console.error('删除旧头像失败:', deleteError)
          // 继续流程，不要因为删除旧文件失败而中断
        }
      }

      // 更新用户资料
      const { error: updateError } = await supabase
        .from('UserProfile')
        .update({
          avatar: avatarUrl,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (updateError) {
        // 如果更新数据库失败，则删除已上传的文件
        await supabase.storage.from('upload').remove([filePath])
        throw updateError
      }

      // 更新本地状态
      setAvatarUrl(avatarUrl)
      setUser({ ...user, avatar: avatarUrl })
      // 更新表单状态
      setValue('avatar', avatarUrl)
      toast.success('头像上传成功')
    } catch (error: any) {
      console.error('上传头像失败:', error)
      toast.error(`头像上传失败: ${error.message || '未知错误'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (data: TUserProfile) => {
    try {
      if (!user?.id) return

      setIsLoading(true)

      // 确保技术栈是数组
      const techStackArray = Array.isArray(data.techStack)
        ? data.techStack
        : typeof data.techStack === 'string' && data.techStack
        ? [data.techStack]
        : []

      // 准备要更新的数据
      const updateData = {
        ...data,
        date: date ? date.toISOString().split('T')[0] : undefined,
        techStack: techStackArray,
      }

      const updateResult = await updateUser(updateData)

      if (updateResult.success) {
        // 更新本地状态
        setUser({
          ...user,
          ...updateData,
        })
        toast.success('个人资料更新成功')
      } else {
        toast.error(updateResult.message || '更新失败，请稍后再试')
      }
    } catch (error: any) {
      console.error('更新用户资料失败:', error)
      toast.error(`更新失败: ${error.message || '未知错误'}`)
    } finally {
      setIsLoading(false)
    }
  }

  // 如果用户未登录
  if (userLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin mr-2">
          <UpdateIcon className="h-6 w-6" />
        </div>
        <span>加载中...</span>
      </div>
    )
  }

  if (!user) {
    toast.error('请您先登录~')
    return redirect(`/${locale}/dashboard`)
  }

  return (
    <div className="container py-8 px-4 max-w-3xl mx-auto">
      <Card className="overflow-hidden border-0 shadow-sm rounded-3xl bg-white">
        <div className="h-24 relative bg-white">
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
            <div className="relative">
              <Avatar className="w-28 h-28 border-[6px] border-white shadow-md">
                <AvatarImage
                  src={avatarUrl || undefined}
                  alt={user.username || 'User'}
                />
                <AvatarFallback className="text-3xl bg-gray-100 text-gray-800">
                  {user.username?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <Label
                htmlFor="avatar"
                className="absolute bottom-0 right-0 bg-white hover:bg-gray-100 text-gray-700 p-2 rounded-full cursor-pointer shadow-sm transition-all hover:scale-105 border border-gray-100"
              >
                {isLoading ? (
                  <UpdateIcon className="h-4 w-4 animate-spin" />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                )}
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isLoading}
                  onChange={handleFileUpload}
                />
              </Label>
            </div>
          </div>
        </div>
        <CardHeader className="pt-16 text-center pb-2">
          <CardTitle className="text-xl font-medium text-gray-900">
            {user.username || '未设置用户名'}
          </CardTitle>
          <CardDescription className="text-gray-500 text-sm">
            {user.email}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 py-4">
          <form onSubmit={handleFormSubmit(handleSubmit)} className="space-y-8">
            <div className="space-y-8">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-700">
                    基本信息
                  </h3>
                  <div className="h-px bg-gray-100 flex-1 ml-4"></div>
                </div>
                <div className="space-y-5">
                  <div>
                    <Label className="text-xs text-gray-500 mb-1.5 block">
                      性别
                    </Label>
                    <Controller
                      name="gender"
                      control={control}
                      render={({ field }) => (
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex gap-4"
                        >
                          <Label className="flex items-center gap-2 cursor-pointer">
                            <RadioGroupItem value="male" />男
                          </Label>
                          <Label className="flex items-center gap-2 cursor-pointer">
                            <RadioGroupItem value="female" />女
                          </Label>
                          <Label className="flex items-center gap-2 cursor-pointer">
                            <RadioGroupItem value="other" />
                            其他
                          </Label>
                        </RadioGroup>
                      )}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 mb-1.5 block">
                      出生日期
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? (
                            format(date, 'PPP', {
                              locale:
                                localeMap[locale as keyof typeof localeMap],
                            })
                          ) : (
                            <span>选择日期</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                          locale={localeMap[locale as keyof typeof localeMap]}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-700">
                    个人详情
                  </h3>
                  <div className="h-px bg-gray-100 flex-1 ml-4"></div>
                </div>
                <div className="space-y-5">
                  <div>
                    <Label htmlFor="signature">个人签名</Label>
                    <Textarea id="signature" {...userRegister('signature')} />
                  </div>
                  <div>
                    <Label htmlFor="techStack">技术栈 (逗号分隔)</Label>
                    <Input id="techStack" {...userRegister('techStack')} />
                  </div>
                  <div>
                    <Label htmlFor="bio">个人简历链接</Label>
                    <Input id="bio" {...userRegister('bio')} />
                  </div>
                </div>
              </div>
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <span className="inline-flex items-center">
                  <UpdateIcon className="mr-2 h-4 w-4 animate-spin" />
                  保存中...
                </span>
              ) : (
                '保存更改'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default UserProfile
