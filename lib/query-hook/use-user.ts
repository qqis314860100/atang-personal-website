'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-hook'
import { updateUser } from '@/app/actions/profile'
import { toast } from 'react-hot-toast'
import { createClient } from '@/utils/supabase/client'

// 获取用户会话
export function useUserSession() {
  return useQuery({
    queryKey: queryKeys.user.session(),
    queryFn: async () => {
      console.log('🔄 useUserSession queryFn 被调用')
      const supabase = createClient()

      // 获取当前用户会话
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      console.log('📋 获取到的 session:', session)

      if (error) {
        console.error('❌ 获取用户会话失败:', error)
        throw error
      }

      if (!session) {
        console.log('👤 用户未登录')
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
        return {
          id: session.user.id,
          email: session.user.email,
          username: session.user.email?.split('@')[0] || 'User',
          avatar: null,
          created_at: session.user.created_at,
        }
      }

      console.log('✅ 获取到用户会话:', profile)
      return profile
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  })
}

// 获取用户资料
export function useUserProfile() {
  return useQuery({
    queryKey: queryKeys.user.profile(),
    queryFn: async () => {
      // 这里可以调用获取用户资料的 API
      // 暂时返回 null，实际使用时需要实现具体的获取逻辑
      return null
    },
    staleTime: 10 * 60 * 1000, // 10分钟数据保持新鲜
  })
}

// 更新用户资料
export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateUser,
    onSuccess: (data) => {
      // 成功后使相关查询失效，触发重新获取
      queryClient.invalidateQueries({
        queryKey: queryKeys.user.profile(),
      })
      toast.success('用户资料更新成功')
    },
    onError: (error) => {
      console.error('更新用户资料失败:', error)
      toast.error('更新用户资料失败')
    },
  })
}
