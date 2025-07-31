'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-hook'
import { signIn, register, resendVerificationEmail } from '@/app/actions/auth'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'react-hot-toast'
import { TSignInSchema } from '@/schemas/signInSchema'
import { TRegisterSchema } from '@/schemas/registerSchema'
import { useRef, useEffect } from 'react'
import { useUserStore } from '@/lib/store/user-store'

// 获取当前用户数据
export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.user.session(),
    queryFn: async () => {
      // 这个函数只有在以下情况才会执行：
      // 1. 首次调用且没有缓存数据
      // 2. 缓存数据已过期（超过 staleTime）
      // 3. 手动触发重新获取
      const supabase = createClient()
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error) {
        console.error('获取用户会话失败:', error)
        throw error
      }

      if (!user) {
        console.log('用户未登录')
        return null
      }

      // 获取用户详细信息
      const { data: profile, error: profileError } = await supabase
        .from('UserProfile')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('获取用户资料失败:', profileError)
        // 如果获取资料失败，至少返回基本信息
        return {
          id: user.id,
          email: user.email,
          username: user.email?.split('@')[0] || 'User',
          avatar: null,
          created_at: user.created_at,
        }
      }

      console.log('获取到用户资料:', profile)
      return profile
    },
    staleTime: 10 * 60 * 1000, // 10分钟数据保持新鲜
    gcTime: 30 * 60 * 1000, // 30分钟垃圾回收时间
    retry: false, // 认证失败不重试
    refetchOnWindowFocus: false, // 窗口聚焦时不重新获取
    refetchOnMount: false, // 组件挂载时不重新获取
    refetchOnReconnect: false, // 网络重连时不重新获取
    // 移除 initialData，让 React Query 正常获取数据
    // Zustand 已经处理了持久化，不需要重复逻辑
  })
}

// 第一次调用 useStableUser
// ├── useCurrentUser() 执行
// │   ├── 检查缓存 → 无缓存
// │   ├── 执行 queryFn → 网络请求获取用户数据
// │   └── 缓存数据
// ├── useEffect 执行 → 更新 Zustand
// └── 返回用户数据

// 第二次调用 useStableUser（10分钟内）
// ├── useCurrentUser() 执行
// │   ├── 检查缓存 → 有缓存且未过期
// │   ├── 直接返回缓存数据 → 无网络请求
// │   └── 保持缓存
// ├── useEffect 不执行 → user 未变化
// └── 返回缓存的用户数据

// 简化的用户状态 hook，主要使用 React Query 缓存,自动检测认证状态变化，保持与服务器同步
export function useStableUser() {
  const { data: user, isLoading, error } = useCurrentUser()
  const { setUser } = useUserStore()

  // 只在用户数据变化时更新 Zustand（用于持久化）
  useEffect(() => {
    if (user) {
      setUser(user)
    }
  }, [user, setUser])

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
  }
}

// 登录
export function useSignIn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      data,
      locale,
    }: {
      data: TSignInSchema
      locale: string
    }) => {
      return await signIn(data, locale)
    },
    onSuccess: (result) => {
      if (result && result.status === 'success' && result.user) {
        // 登录成功后更新用户数据
        queryClient.setQueryData(queryKeys.user.session(), result.user)
        queryClient.setQueryData(queryKeys.user.profile(), result.user)

        toast.success(result.message || '登录成功')
        return { success: true, user: result.user }
      } else {
        // 处理特定错误
        if (result?.message === 'Email not confirmed') {
          return {
            success: false,
            error: 'email_not_confirmed',
            message: result.message,
          }
        }

        toast.error(result?.message || '登录失败')
        return {
          success: false,
          error: 'login_failed',
          message: result?.message,
        }
      }
    },
    onError: (error) => {
      console.error('登录失败:', error)
      toast.error('登录失败，请重试')
      return { success: false, error: 'network_error' }
    },
  })
}

// 注册
export function useRegister() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: TRegisterSchema) => {
      return await register(data)
    },
    onSuccess: (result) => {
      if (result && result.status === 'success') {
        // 注册成功后清除任何现有的用户数据
        queryClient.removeQueries({ queryKey: queryKeys.user.all })

        toast.success(result.message || '注册成功，请查收验证邮件')
        return { success: true, message: result.message }
      } else {
        toast.error(result?.message || '注册失败')
        return { success: false, message: result?.message }
      }
    },
    onError: (error) => {
      console.error('注册失败:', error)
      toast.error('注册失败，请重试')
      return { success: false, error: 'network_error' }
    },
  })
}

// 登出
export function useSignOut() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      return true
    },
    onSuccess: () => {
      // 登出成功后清除所有用户相关的缓存
      queryClient.removeQueries({ queryKey: queryKeys.user.all })
      queryClient.clear() // 可选：清除所有缓存

      toast.success('您已成功退出登录')
    },
    onError: (error) => {
      console.error('登出失败:', error)
      toast.error('登出失败，请重试')
    },
  })
}

// 重发验证邮件
export function useResendVerificationEmail() {
  return useMutation({
    mutationFn: async (email: string) => {
      return await resendVerificationEmail(email)
    },
    onSuccess: () => {
      toast.success('验证邮件已重新发送，请查收')
    },
    onError: (error) => {
      console.error('重发验证邮件失败:', error)
      toast.error('重发验证邮件失败，请重试')
    },
  })
}

// 忘记密码（重置密码）
export function useForgotPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        throw error
      }

      return true
    },
    onSuccess: () => {
      toast.success('重置密码链接已发送到您的邮箱')
    },
    onError: (error) => {
      console.error('发送重置密码邮件失败:', error)
      toast.error('发送重置密码邮件失败，请重试')
    },
  })
}

// 检查用户是否已登录
export function useIsAuthenticated() {
  const { user, isLoading, isAuthenticated } = useStableUser()

  return {
    isAuthenticated,
    isLoading,
    user,
  }
}
