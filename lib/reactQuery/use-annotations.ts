'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/reactQuery'
import {
  getAnnotations,
  createAnnotation,
  updateAnnotation,
  deleteAnnotation,
} from '@/app/actions/annotation'
import { PDFAnnotation } from '@/types/pdf'
import { toast } from 'react-hot-toast'

// 获取注释列表
export function useAnnotations(pdfUrl?: string) {
  return useQuery({
    queryKey: queryKeys.annotations.list(pdfUrl),
    queryFn: () => getAnnotations(pdfUrl),
    enabled: !!pdfUrl, // 只有当 pdfUrl 存在时才执行查询
    staleTime: 2 * 60 * 1000, // 2分钟数据保持新鲜
  })
}

// 创建注释
export function useCreateAnnotation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createAnnotation,
    onSuccess: (data, variables) => {
      // 成功后使相关查询失效，触发重新获取
      queryClient.invalidateQueries({
        queryKey: queryKeys.annotations.list(variables.pdfUrl),
      })
      toast.success('注释创建成功')
    },
    onError: (error) => {
      console.error('创建注释失败:', error)
      toast.error('创建注释失败')
    },
  })
}

// 更新注释
export function useUpdateAnnotation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      updateAnnotation(id, updates),
    onSuccess: (data, variables) => {
      // 成功后使相关查询失效，触发重新获取
      // 注意：这里需要从其他地方获取 pdfUrl，因为 updateAnnotation 函数本身不返回 pdfUrl
      queryClient.invalidateQueries({
        queryKey: queryKeys.annotations.all,
      })
      toast.success('注释更新成功')
    },
    onError: (error) => {
      console.error('更新注释失败:', error)
      toast.error('更新注释失败')
    },
  })
}

// 删除注释
export function useDeleteAnnotation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteAnnotation,
    onSuccess: (data, variables) => {
      // 成功后使相关查询失效，触发重新获取
      queryClient.invalidateQueries({
        queryKey: queryKeys.annotations.all,
      })
      toast.success('注释删除成功')
    },
    onError: (error) => {
      console.error('删除注释失败:', error)
      toast.error('删除注释失败')
    },
  })
}

// 乐观更新注释（用于即时UI反馈）
export function useOptimisticUpdateAnnotation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      updateAnnotation(id, updates),
    onMutate: async ({ id, updates }) => {
      // 取消任何正在进行的查询
      await queryClient.cancelQueries({
        queryKey: queryKeys.annotations.all,
      })

      // 保存之前的数据
      const previousAnnotations = queryClient.getQueryData(
        queryKeys.annotations.all
      )

      // 乐观更新 - 这里需要更复杂的逻辑来处理更新
      queryClient.setQueryData(
        queryKeys.annotations.all,
        (old: PDFAnnotation[] | undefined) => {
          if (!old) return []
          return old.map((annotation) =>
            annotation.id === id ? { ...annotation, ...updates } : annotation
          )
        }
      )

      // 返回上下文对象
      return { previousAnnotations }
    },
    onError: (err, variables, context) => {
      // 如果出错，回滚到之前的状态
      if (context?.previousAnnotations) {
        queryClient.setQueryData(
          queryKeys.annotations.all,
          context.previousAnnotations
        )
      }
      toast.error('更新注释失败')
    },
    onSettled: (data, error, variables) => {
      // 无论成功还是失败，都重新获取数据确保同步
      queryClient.invalidateQueries({
        queryKey: queryKeys.annotations.all,
      })
    },
  })
}
