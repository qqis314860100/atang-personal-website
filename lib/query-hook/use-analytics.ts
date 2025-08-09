import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { useRealTime } from '@/app/components/providers/RealTimeProvider'

export {}

interface AnalyticsData {
  pageViews: number
  uniqueVisitors: number
  realTimeUsers: number
  avgSessionDuration: number
  bounceRate: number
  deviceTypes: Array<{ device: string; percentage: number }>
  performance: {
    loadTime: number
    responseTime: number
    uptime: number
    errorRate: number
  }
  errors: number
  errorLogs: Array<{
    id: string
    type: string
    message: string
    stackTrace: string
    page: string
    count: number
    lastOccurrence: string
    severity: string
    userAgent: string
    ipAddress: string
    timestamp: string
    level: string
    source: string
    traceId?: string
  }>
}

interface PageHeatmapData {
  page: string
  views: number
  avgTime: number
  intensity: number
}

interface DeviceHeatmapData {
  device: string
  count: number
  browsers: { [key: string]: number }
  intensity: number
}

// 获取基础分析数据
export function useAnalyticsData(timeRange: string = '7d') {
  return useQuery({
    queryKey: ['analytics', 'dashboard', timeRange],
    queryFn: async (): Promise<AnalyticsData> => {
      const response = await fetch(
        `/api/analytics/dashboard?timeRange=${timeRange}`
      )
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || '获取数据失败')
      }

      return result.data
    },
    staleTime: 1 * 60 * 1000, // 1分钟
    gcTime: 10 * 60 * 1000, // 10分钟
    // 移除固定的 refetchInterval，由 RealTimeProvider 控制
  })
}

// 智能的 useAnalyticsData Hook
export function useSmartAnalyticsData(timeRange: string = '7d') {
  const { refetchInterval, updateLastUpdate } = useRealTime()

  return useQuery({
    queryKey: ['analytics', 'dashboard', timeRange],
    queryFn: async (): Promise<AnalyticsData> => {
      const response = await fetch(
        `/api/analytics/dashboard?timeRange=${timeRange}`
      )
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || '获取数据失败')
      }

      // 更新最后更新时间
      updateLastUpdate()
      return result.data
    },
    staleTime: 1 * 60 * 1000, // 1分钟
    gcTime: 10 * 60 * 1000, // 10分钟
    refetchInterval: refetchInterval,
    refetchIntervalInBackground: true,
  })
}

// 获取页面热力图数据
export function usePageHeatmapData(timeRange: string = '7d') {
  return useQuery({
    queryKey: ['analytics', 'pageHeatmap', timeRange],
    queryFn: async (): Promise<PageHeatmapData[]> => {
      const response = await fetch(
        `/api/analytics/dashboard?timeRange=${timeRange}&type=pageHeatmap`
      )
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || '获取页面热力图数据失败')
      }

      return result.data
    },
    staleTime: 1 * 60 * 1000, // 5分钟
    gcTime: 10 * 60 * 1000, // 10分钟
  })
}

// 获取设备热力图数据
export function useDeviceHeatmapData(timeRange: string = '7d') {
  return useQuery({
    queryKey: ['analytics', 'deviceHeatmap', timeRange],
    queryFn: async (): Promise<DeviceHeatmapData[]> => {
      const response = await fetch(
        `/api/analytics/dashboard?timeRange=${timeRange}&type=deviceHeatmap`
      )
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || '获取设备热力图数据失败')
      }

      return result.data
    },
    staleTime: 5 * 60 * 1000, // 5分钟
    gcTime: 10 * 60 * 1000, // 10分钟
  })
}

// 新增：获取性能指标热力图数据
export interface PerformanceMetricPageStat {
  page: string
  min: number | null
  max: number | null
  avg: number | null
  count: number
}

export interface PerformanceHeatmapMetric {
  key: 'FCP' | 'LCP' | 'CLS' | 'FID' | 'INP' | 'TTFB'
  stats: {
    min: number | null
    max: number | null
    avg: number | null
    count: number
  }
  intensity: number
  thresholds?: { good: number; needs: number }
  breakdown?: {
    devices: Array<{
      name: string
      min: number | null
      max: number | null
      avg: number | null
      count: number
    }>
    browsers: Array<{
      name: string
      min: number | null
      max: number | null
      avg: number | null
      count: number
    }>
  }
  pages: PerformanceMetricPageStat[]
}

export type PerformanceHeatmapResponse = Record<
  string,
  PerformanceHeatmapMetric
>

export function usePerformanceHeatmapData(timeRange: string = '7d') {
  return useQuery({
    queryKey: ['analytics', 'performanceHeatmap', timeRange],
    queryFn: async (): Promise<PerformanceHeatmapResponse> => {
      const response = await fetch(
        `/api/analytics/dashboard?timeRange=${timeRange}&type=performanceHeatmap`
      )
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || '获取性能指标热力图数据失败')
      }

      return result.data
    },
    staleTime: 2 * 60 * 1000, // 2分钟（性能指标变化较快）
    gcTime: 10 * 60 * 1000, // 10分钟
    // 性能指标需要更频繁的更新
    refetchInterval: 20 * 1000, // 20秒
    refetchIntervalInBackground: true, // 后台也继续刷新
  })
}

// 获取错误日志详情
export function useErrorDetail(errorId: string | null) {
  return useQuery({
    queryKey: ['analytics', 'errorDetail', errorId],
    queryFn: async () => {
      if (!errorId) return null

      const response = await fetch(
        `/api/analytics/dashboard?type=errorDetail&errorId=${errorId}`
      )
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || '获取错误详情失败')
      }

      return result.data
    },
    enabled: !!errorId,
    staleTime: 1 * 60 * 1000, // 1分钟
    gcTime: 5 * 60 * 1000, // 5分钟
  })
}

// 获取错误日志（支持搜索和过滤）
export function useErrorLogs(
  options: {
    timeRange?: string
    searchTerm?: string
    searchField?: string
    severity?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    page?: number
    limit?: number
  } = {}
) {
  const {
    timeRange = '7d',
    searchTerm,
    searchField = 'all',
    severity = 'all',
    sortBy = 'timestamp',
    sortOrder = 'desc',
    page = 1,
    limit = 50,
  } = options

  return useQuery({
    queryKey: [
      'errorLogs',
      {
        timeRange,
        searchTerm,
        searchField,
        severity,
        sortBy,
        sortOrder,
        page,
        limit,
      },
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        timeRange,
        searchField,
        severity,
        sortBy,
        sortOrder,
        page: page.toString(),
        limit: limit.toString(),
      })

      // 只有当searchTerm有值时才添加到参数中
      if (searchTerm && searchTerm.trim()) {
        params.append('searchTerm', searchTerm.trim())
      }

      const response = await fetch(`/api/analytics/error-logs?${params}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || '获取错误日志失败')
      }

      return result
    },
    staleTime: 30 * 1000, // 30秒内认为数据是新鲜的
    gcTime: 5 * 60 * 1000, // 5分钟缓存时间
  })
}
