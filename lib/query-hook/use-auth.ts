'use client'

import { register, resendVerificationEmail, signIn } from '@/app/actions/auth'
import { queryKeys } from '@/lib/query-hook'
import { createClient } from '@/lib/supabase/client'
import { TRegisterSchema } from '@/schemas/registerSchema'
import { TSignInSchema } from '@/schemas/signInSchema'
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useEffect } from 'react'
import toast from 'react-hot-toast'
// 定义用户类型
export interface TUser {
  id: string
  email: string
  username?: string
  avatar?: string | null
  bio?: string | null
  gender?: string | null
  signature?: string | null
  techStack?: string | null
  date?: string | null
  isAdmin?: boolean
  updatedAt?: string
  createdAt?: string
  resume_content?: string | null
  resume_url?: string | null
  resume_filename?: string | null
  resume_size?: number | null
}
const supabase = createClient()

// 优化后的用户认证 hook
export function useStableUser() {
  // 使用一个统一的查询
  const query = useQuery({
    queryKey: queryKeys.user.session(),
    queryFn: async (): Promise<TUser | null> => {
      try {
        // 安全检查
        const client = createClient()
        if (!client) {
          console.warn('⚠️ Supabase 客户端未初始化')
          return null
        }

        // 移除数据库健康检查，直接获取用户数据
        // 数据库健康检查可能导致不必要的错误

        // 获取当前用户会话
        const {
          data: { session },
          error: sessionError,
        } = await client.auth.getSession()

        // 处理会话错误或无会话情况
        if (sessionError || !session) {
          if (sessionError) {
            console.error('❌ 获取用户会话失败:', sessionError)
          }
          return null
        }

        // 获取用户详细信息
        const { data: profile, error: profileError } = await client
          .from('UserProfile')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profileError) {
          console.error('❌ 获取用户资料失败:', profileError, session)
          // 返回基本用户信息
          return {
            id: session.user.id,
            email: session.user.email!,
            username: session.user.user_metadata.username || 'User',
            avatar: null,
            updatedAt: session.user.created_at,
            resume_content: profile?.resume_content,
            resume_url: profile?.resume_url,
            resume_filename: profile?.resume_filename,
            resume_size: profile?.resume_size,
          }
        }

        return profile
      } catch (error) {
        // 捕获所有可能的错误
        console.error('❌ 用户数据获取失败:', error)

        // 如果是网络错误或数据库连接问题，尝试使用缓存数据
        if (error instanceof Error) {
          const errorMessage = error.message.toLowerCase()
          if (
            errorMessage.includes('network') ||
            errorMessage.includes('connection') ||
            errorMessage.includes('timeout') ||
            errorMessage.includes('fetch')
          ) {
            console.warn('⚠️ 网络连接问题，尝试使用缓存数据')
            return null // 让 React Query 使用缓存数据
          }
        }

        // 对于其他错误，也返回 null 使用缓存数据
        return null
      }
    },
    staleTime: 30 * 60 * 1000, // 30分钟数据保持新鲜
    gcTime: 24 * 60 * 60 * 1000, // 24小时垃圾回收时间
    retry: (failureCount, error) => {
      // 减少重试次数，避免过多的异步操作
      return failureCount < 1
    },
    retryDelay: 1000, // 固定重试延迟
    refetchOnWindowFocus: false, // 窗口聚焦时不重新获取
    refetchOnMount: false, // 组件挂载时不重新获取（如果数据仍然新鲜）
    refetchOnReconnect: false, // 网络重连时不重新获取，避免频繁请求
    // 性能优化
    structuralSharing: true, // 结构共享优化
    throwOnError: false, // 不抛出错误
    placeholderData: keepPreviousData, // 保持上一次数据，避免切换页面时 loading
    // Next.js 15 兼容性
    enabled: typeof window !== 'undefined', // 只在客户端执行
  })

  const { data: user, isLoading, error, refetch } = query

  // 调试：监控缓存状态
  useEffect(() => {
    // 检查组件是否仍然挂载
    let isMounted = true

    if (error && isMounted) {
      console.log('🔍 用户数据查询失败，但可能使用缓存数据')
      console.log('📊 当前缓存状态:', {
        hasData: !!user,
        isLoading,
        error: error?.message,
      })
    }

    return () => {
      isMounted = false
    }
  }, [error, user, isLoading])

  // 只返回 user，不做副作用
  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    refetch,
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
    }) => await signIn(data, locale),
    onSuccess: async (result) => {
      if (result && result.status === 'success' && result.user) {
        // 1.先同步session
        if (result.access_token && result.refresh_token) {
          // 这样会自动触发 onAuthStateChange，useStableUser 会自动 refetch
          const client = createClient()
          if (client) {
            await client.auth.setSession({
              access_token: result.access_token,
              refresh_token: result.refresh_token,
            })
          }
        }
        // 2.立即更新 react-query 缓存（可选，保险起见）
        queryClient.setQueryData(queryKeys.user.session(), result.user)
        queryClient.setQueryData(queryKeys.user.profile(), result.user)

        toast.success(result.message || '登录成功')
        return result.user
      } else {
        toast.error(result?.message || '登录失败')
      }
    },
    onError: (error) => {
      console.error('登录失败:', error)
      toast.error('登录失败，请重试')
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
