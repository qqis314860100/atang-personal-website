'use client'

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "./index"
import { 
  fetchCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from "@/app/actions/category"
import toast from 'react-hot-toast'

// 获取分类列表
export function useCategories() {
  return useQuery({
    queryKey: queryKeys.category.list(),
    queryFn: fetchCategories,
  })
}

// 创建分类
export function useCreateCategory() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createCategory,
    onSuccess: (result) => {
      if (result.success) {
        toast.success('分类创建成功')
        // 刷新分类数据
        queryClient.invalidateQueries({ queryKey: queryKeys.category.list() })
      } else {
        toast.error(result.error || '创建失败')
      }
    },
    onError: () => {
      toast.error('创建分类失败')
    }
  })
}

// 更新分类
export function useUpdateCategory() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updateCategory,
    onSuccess: (result) => {
      if (result.success) {
        toast.success('分类更新成功')
        // 刷新分类数据
        queryClient.invalidateQueries({ queryKey: queryKeys.category.list() })
      } else {
        toast.error(result.error || '更新失败')
      }
    },
    onError: () => {
      toast.error('更新分类失败')
    }
  })
}

// 删除分类
export function useDeleteCategory() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: (result) => {
      if (result.success) {
        toast.success('分类删除成功')
        // 刷新分类数据
        queryClient.invalidateQueries({ queryKey: queryKeys.category.list() })
      } else {
        toast.error(result.error || '删除失败')
      }
    },
    onError: () => {
      toast.error('删除分类失败')
    }
  })
}
