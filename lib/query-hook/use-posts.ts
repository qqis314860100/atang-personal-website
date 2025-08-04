'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchBlogPosts,
  fetchBlogPost,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  fetchPopularPosts,
} from '@/app/actions/blog'
import { queryKeys } from './index'

// 获取文章列表
export function usePosts({
  page = 1,
  limit = 10,
  search,
  categoryId,
}: {
  page?: number
  limit?: number
  search?: string
  categoryId?: string
} = {}) {
  return useQuery({
    queryKey: queryKeys.posts.list({ page, limit, search, categoryId }),
    queryFn: async () => {
      const result = await fetchBlogPosts({ page, limit, search, categoryId })
      if (result.success) {
        return {
          posts: result.posts,
          total: result.total,
          totalPages: result.totalPages,
          currentPage: result.currentPage,
        }
      } else {
        throw new Error(result.error || '获取文章失败')
      }
    },
  })
}

// 获取单个文章
export function usePost(id: string) {
  return useQuery({
    queryKey: queryKeys.posts.detail(id),
    queryFn: async () => {
      const result = await fetchBlogPost(id)
      if (result.success && result.post) {
        return result.post
      } else {
        throw new Error(result.error || '获取文章失败')
      }
    },
    enabled: !!id,
  })
}

// 获取热门文章
export function usePopularPosts(limit: number = 5) {
  return useQuery({
    queryKey: queryKeys.posts.popular(limit),
    queryFn: () => fetchPopularPosts(limit),
  })
}

// 创建文章
export function useCreatePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createBlogPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all })
    },
  })
}

// 更新文章
export function useUpdatePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateBlogPost,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all })
      const id = variables.id
      if (id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(id) })
      }
    },
  })
}

// 删除文章
export function useDeletePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteBlogPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all })
    },
  })
}
