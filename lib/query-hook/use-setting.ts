'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-hook'
import { toast } from 'react-hot-toast'
import { updatePassword } from '@/app/actions/setting'

export function useUpdatePassword() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updatePassword,
    onSuccess: (data) => {
      console.log('✅ 密码更新成功:', data)
      queryClient.invalidateQueries({
        queryKey: queryKeys.user.session(),
      })
      // 强制重新获取
      queryClient.refetchQueries({
        queryKey: queryKeys.user.session(),
      })
      toast.success(data.message || '密码更新成功')
    },
    onError: (error: any) => {
      toast.error(error.message)
    },
  })
}
