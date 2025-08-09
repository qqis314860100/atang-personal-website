import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  DanmakuService,
  DanmakuData,
  CreateDanmakuData,
  DanmakuStats,
} from '@/lib/services/danmaku-service'
import toast from 'react-hot-toast'

// 查询键常量
export const danmakuKeys = {
  all: ['danmaku'] as const,
  lists: () => [...danmakuKeys.all, 'list'] as const,
  list: (videoId: string, filters: any) =>
    [...danmakuKeys.lists(), videoId, filters] as const,
  stats: (videoId: string) => [...danmakuKeys.all, 'stats', videoId] as const,
  distribution: (videoId: string) =>
    [...danmakuKeys.all, 'distribution', videoId] as const,
  hot: (videoId: string) => [...danmakuKeys.all, 'hot', videoId] as const,
}

// 获取弹幕列表
export function useDanmakuList(
  videoId: string,
  params: {
    timeRange?: { start: number; end: number }
    type?: number
    poolType?: number
    limit?: number
  } = {}
) {
  return useQuery({
    queryKey: danmakuKeys.list(videoId, params),
    queryFn: () => DanmakuService.getDanmakuList(videoId, params),
    enabled: !!videoId,
    staleTime: 30 * 1000, // 30秒
  })
}

// 获取弹幕统计
export function useDanmakuStats(videoId: string) {
  return useQuery({
    queryKey: danmakuKeys.stats(videoId),
    queryFn: () => DanmakuService.getDanmakuStats(videoId),
    enabled: !!videoId,
    staleTime: 5 * 60 * 1000, // 5分钟
  })
}

// 获取弹幕时间分布
export function useDanmakuTimeDistribution(videoId: string, bucketSize = 60) {
  return useQuery({
    queryKey: danmakuKeys.distribution(videoId),
    queryFn: () =>
      DanmakuService.getDanmakuTimeDistribution(videoId, bucketSize),
    enabled: !!videoId,
    staleTime: 10 * 60 * 1000, // 10分钟
  })
}

// 获取热门弹幕
export function useHotDanmaku(videoId: string, limit = 10) {
  return useQuery({
    queryKey: danmakuKeys.hot(videoId),
    queryFn: () => DanmakuService.getHotDanmaku(videoId, limit),
    enabled: !!videoId,
    staleTime: 5 * 60 * 1000, // 5分钟
  })
}

// 发送弹幕
export function useSendDanmaku() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateDanmakuData) => DanmakuService.sendDanmaku(data),
    onSuccess: (newDanmaku) => {
      // 使相关查询失效
      queryClient.invalidateQueries({ queryKey: danmakuKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: danmakuKeys.stats(newDanmaku.videoId),
      })
      queryClient.invalidateQueries({
        queryKey: danmakuKeys.distribution(newDanmaku.videoId),
      })
      queryClient.invalidateQueries({
        queryKey: danmakuKeys.hot(newDanmaku.videoId),
      })

      // 更新视频的弹幕数量
      queryClient.invalidateQueries({
        queryKey: ['videos', 'detail', newDanmaku.videoId],
      })
    },
    onError: (error) => {
      toast.error(error.message)
      console.error('发送弹幕失败:', error)
    },
  })
}

// 删除弹幕
export function useDeleteDanmaku() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => DanmakuService.deleteDanmaku(id),
    onSuccess: (_, deletedId) => {
      // 使相关查询失效
      queryClient.invalidateQueries({ queryKey: danmakuKeys.lists() })
      // 注意：这里需要具体的videoId，但我们没有，所以让所有相关查询失效
      queryClient.invalidateQueries({ queryKey: danmakuKeys.all })
    },
  })
}
