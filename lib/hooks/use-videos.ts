import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  VideoService,
  VideoData,
  CreateVideoData,
  UpdateVideoData,
} from '@/lib/services/video-service'

// 查询键常量
export const videoKeys = {
  all: ['videos'] as const,
  lists: () => [...videoKeys.all, 'list'] as const,
  list: (filters: any) => [...videoKeys.lists(), filters] as const,
  details: () => [...videoKeys.all, 'detail'] as const,
  detail: (id: string) => [...videoKeys.details(), id] as const,
}

// 获取视频列表
export function useVideos(
  params: {
    page?: number
    limit?: number
    category?: string
    search?: string
    userId?: string
  } = {}
) {
  return useQuery<{
    videos: VideoData[]
    total: number
    page: number
    limit: number
    totalPages: number
  }>({
    queryKey: videoKeys.list(params),
    queryFn: () => VideoService.getVideos(params),
    staleTime: 5 * 60 * 1000, // 5分钟
  })
}

// 获取单个视频
export function useVideo(id: string) {
  return useQuery({
    queryKey: videoKeys.detail(id),
    queryFn: () => VideoService.getVideo(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10分钟
  })
}

// 获取用户视频
export function useUserVideos(userId: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: [...videoKeys.lists(), 'user', userId, page, limit],
    queryFn: () => VideoService.getUserVideos(userId, page, limit),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5分钟
  })
}

// 创建视频
export function useCreateVideo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateVideoData) => VideoService.createVideo(data),
    onSuccess: () => {
      // 使相关查询失效
      queryClient.invalidateQueries({ queryKey: videoKeys.lists() })
    },
  })
}

// 更新视频
export function useUpdateVideo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVideoData }) =>
      VideoService.updateVideo(id, data),
    onSuccess: (updatedVideo) => {
      // 更新缓存中的视频数据
      queryClient.setQueryData(videoKeys.detail(updatedVideo.id), updatedVideo)
      // 使列表查询失效
      queryClient.invalidateQueries({ queryKey: videoKeys.lists() })
    },
  })
}

// 删除视频
export function useDeleteVideo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => VideoService.deleteVideo(id),
    onSuccess: (_, deletedId) => {
      // 从缓存中移除视频
      queryClient.removeQueries({ queryKey: videoKeys.detail(deletedId) })
      // 使列表查询失效
      queryClient.invalidateQueries({ queryKey: videoKeys.lists() })
    },
  })
}

// 增加观看次数
export function useIncrementViewCount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => VideoService.incrementViewCount(id),
    onSuccess: (_, videoId) => {
      // 更新缓存中的视频数据
      queryClient.setQueryData(
        videoKeys.detail(videoId),
        (old: VideoData | undefined) => {
          if (!old) return old
          return {
            ...old,
            viewCount: old.viewCount + 1,
          }
        }
      )
    },
  })
}

// 更新弹幕数量
export function useUpdateDanmakuCount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => VideoService.updateDanmakuCount(id),
    onSuccess: (_, videoId) => {
      // 使视频详情查询失效，重新获取最新的弹幕数量
      queryClient.invalidateQueries({ queryKey: videoKeys.detail(videoId) })
    },
  })
}
