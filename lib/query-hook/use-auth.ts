'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-hook'
import { signIn, register, resendVerificationEmail } from '@/app/actions/auth'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import { TSignInSchema } from '@/schemas/signInSchema'
import { TRegisterSchema } from '@/schemas/registerSchema'
import { useEffect } from 'react'
import { TUser, useUserStore } from '@/lib/store/user-store'

// 优化后的用户认证 hook
export function useStableUser() {
  // 使用一个统一的查询
  const query = useQuery({
    queryKey: queryKeys.user.session(),
    queryFn: async (): Promise<TUser | null> => {
      const supabase = createClient()
      try {
        // 添加超时控制
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('查询超时')), 5000) // 缩短超时时间
        })

        const queryPromise = (async (): Promise<TUser | null> => {
          // 获取当前用户会话
          const {
            data: { session },
            error: sessionError,
          } = await supabase.auth.getSession()

          // 处理会话错误或无会话情况
          if (sessionError || !session) {
            if (sessionError) {
              console.error('❌ 获取用户会话失败:', sessionError)
            }
            return null
          }

          // 获取用户详细信息
          const { data: profile, error: profileError } = await supabase
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
            }
          }

          return profile
        })()

        // 使用 Promise.race 实现超时控制
        return (await Promise.race([queryPromise, timeoutPromise])) as TUser
      } catch (error) {
        // 捕获所有可能的错误
        console.error('❌ 用户数据获取失败:', error)
        return null
      }
    },
    staleTime: 15 * 60 * 1000, // 15分钟数据保持新鲜
    gcTime: 60 * 60 * 1000, // 1小时垃圾回收时间
    retry: 1, // 只重试1次
    retryDelay: 1000, // 重试延迟1秒
    refetchOnWindowFocus: false, // 窗口聚焦时不重新获取
    refetchOnMount: false, // 组件挂载时不重新获取（如果数据仍然新鲜）
    refetchOnReconnect: true, // 网络重连时重新获取
    // 性能优化
    structuralSharing: true, // 结构共享优化
    throwOnError: false, // 不抛出错误
  })

  const { data: user, isLoading, error, refetch } = query
  const { setUser } = useUserStore()

  // 同步用户状态到 Zustand - 单独处理，避免循环
  useEffect(() => {
    if (user && (user as TUser).id) {
      setUser(user as TUser)
    }
  }, [(user as TUser)?.id]) // 只依赖用户ID，避免无限循环

  // 监听认证状态变化 - 修复无限循环问题
  useEffect(() => {
    // 监听 SessionProvider 发出的事件
    const handleAuthStateChange = (event: CustomEvent) => {
      const { event: authEvent, session } = event.detail

      if (authEvent === 'SIGNED_IN' || authEvent === 'TOKEN_REFRESHED') {
        // 使用 setTimeout 防抖，避免频繁调用
        setTimeout(() => {
          refetch()
        }, 100)
      } else if (authEvent === 'SIGNED_OUT') {
        setUser(null) // 清除用户数据
      }
    }

    // 添加事件监听器
    window.addEventListener(
      'authStateChanged',
      handleAuthStateChange as EventListener
    )

    // 清理函数
    return () => {
      window.removeEventListener(
        'authStateChanged',
        handleAuthStateChange as EventListener
      )
    }
  }, []) // 移除所有依赖项，只在组件挂载时执行一次

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
