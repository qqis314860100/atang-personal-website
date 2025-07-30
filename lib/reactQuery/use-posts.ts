'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/reactQuery'
import { fetchPosts } from '@/app/actions/fetchPosts'
import { toast } from 'react-hot-toast'

// 获取博客文章列表
export function usePosts(skip: number = 0, take: number = 10) {
  return useQuery({
    queryKey: queryKeys.posts.list(),
    queryFn: () => fetchPosts(skip, take),
    staleTime: 5 * 60 * 1000, // 5分钟数据保持新鲜
  })
}

// 获取单篇博客文章
export function usePost(slug: string) {
  return useQuery({
    queryKey: queryKeys.posts.detail(slug),
    queryFn: async () => {
      // 这里可以调用获取单篇文章的 API
      // 暂时返回 null，实际使用时需要实现具体的获取逻辑
      return null
    },
    enabled: !!slug, // 只有当 slug 存在时才执行查询
    staleTime: 10 * 60 * 1000, // 10分钟数据保持新鲜
  })
}

// 创建博客文章（暂时注释掉，因为 createPost 函数不存在）
// export function useCreatePost() {
//   const queryClient = useQueryClient()

//   return useMutation({
//     mutationFn: createPost,
//     onSuccess: (data) => {
//       // 成功后使相关查询失效，触发重新获取
//       queryClient.invalidateQueries({
//         queryKey: queryKeys.posts.list(),
//       })
//       toast.success('文章创建成功')
//     },
//     onError: (error) => {
//       console.error('创建文章失败:', error)
//       toast.error('创建文章失败')
//     },
//   })
// }
