'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-hook'
import { updateUser } from '@/app/actions/profile'
import { toast } from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

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
