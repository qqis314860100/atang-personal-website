'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-hook'
import { signIn, register, resendVerificationEmail } from '@/app/actions/auth'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'react-hot-toast'
import { TSignInSchema } from '@/schemas/signInSchema'
import { TRegisterSchema } from '@/schemas/registerSchema'
import { useEffect } from 'react'
import { useUserStore } from '@/lib/store/user-store'

// 优化后的用户认证 hook
export function useStableUser() {
  // 使用一个统一的查询
  const query = useQuery({
    queryKey: queryKeys.user.session(),
    queryFn: async () => {
      console.log('🔄 useUser queryFn 被调用')
      const supabase = createClient()

      try {
        // 获取当前用户会话
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        console.log('📋 获取到的 session:', session)

        // 处理会话错误或无会话情况
        if (sessionError || !session) {
          if (sessionError) {
            console.error('❌ 获取用户会话失败:', sessionError)
          } else {
            console.log('👤 用户未登录')
          }
          return null
        }

        // 获取用户详细信息
        const { data: profile, error: profileError } = await supabase
          .from('UserProfile')
          .select('*')
          .eq('id', session.user.id)
          .single()

        console.log('📊 获取到的 profile:', profile)

        if (profileError) {
          console.error('❌ 获取用户资料失败:', profileError)
          // 返回基本用户信息
          return {
            id: session.user.id,
            email: session.user.email,
            username: session.user.email?.split('@')[0] || 'User',
            avatar: null,
            created_at: session.user.created_at,
          }
        }

        console.log('✅ 获取到用户资料:', profile)
        return profile
      } catch (error) {
        // 捕获所有可能的错误
        console.error('❌ 用户数据获取失败:', error)
        return null
      }
    },
    staleTime: 5 * 60 * 1000, // 5分钟数据保持新鲜
    gcTime: 30 * 60 * 1000, // 30分钟垃圾回收时间
    retry: false, // 认证失败不重试
    refetchOnWindowFocus: false, // 窗口聚焦时不重新获取
  })

  const { data: user, isLoading, error, refetch } = query
  const { setUser } = useUserStore()

  // 监听认证状态变化
  useEffect(() => {
    const supabase = createClient()

    // 同步到 Zustand 存储
    if (user) {
      setUser(user)
    }

    // 设置认证状态监听器
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        refetch() // 重新获取用户数据
      } else if (event === 'SIGNED_OUT') {
        setUser(null) // 清除用户数据
      }
    })

    // 清理函数
    return () => {
      subscription.unsubscribe()
    }
  }, [user, setUser, refetch])

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
