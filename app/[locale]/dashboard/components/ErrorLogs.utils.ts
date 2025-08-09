import React from 'react'
import { AlertTriangle } from 'lucide-react'

// 常量配置
export const PAGINATION_CONFIG = {
  DEFAULT_ITEMS_PER_PAGE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50] as const,
  LOADING_DELAY: 300,
} as const

export const SEVERITY_LEVELS = {
  high: { color: 'text-red-400 bg-red-500/20 border-red-500/30', priority: 3 },
  medium: {
    color: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
    priority: 2,
  },
  low: {
    color: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
    priority: 1,
  },
} as const

export interface ErrorLog {
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
}

// 工具函数
export const getSeverityColor = (severity: string): string => {
  const severityKey = severity.toLowerCase() as keyof typeof SEVERITY_LEVELS
  return (
    SEVERITY_LEVELS[severityKey]?.color ||
    'text-gray-400 bg-gray-500/20 border-gray-500/30'
  )
}

export const getSeverityIcon = (severity: string): React.ReactNode => {
  const severityKey = severity.toLowerCase() as keyof typeof SEVERITY_LEVELS
  const color =
    severityKey === 'high'
      ? 'text-red-400'
      : severityKey === 'medium'
      ? 'text-orange-400'
      : severityKey === 'low'
      ? 'text-yellow-400'
      : 'text-gray-400'

  return React.createElement(AlertTriangle, { className: `w-3 h-3 ${color}` })
}

export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export const truncateMessage = (
  message: string,
  maxLength: number = 80
): string => {
  return message.length > maxLength
    ? message.substring(0, maxLength) + '...'
    : message
}

// 高级搜索逻辑
export const performAdvancedSearch = (
  error: ErrorLog,
  term: string,
  searchField: 'all' | 'type' | 'message' | 'page' | 'userAgent',
  useRegex: boolean,
  caseSensitive: boolean
): boolean => {
  if (!term.trim()) return true

  let targetValue: string

  switch (searchField) {
    case 'type':
      targetValue = error.type
      break
    case 'message':
      targetValue = error.message
      break
    case 'page':
      targetValue = error.page
      break
    case 'userAgent':
      targetValue = error.userAgent
      break
    default:
      targetValue = `${error.type} ${error.message} ${error.page} ${error.userAgent}`
  }

  if (useRegex) {
    try {
      const flags = caseSensitive ? 'g' : 'gi'
      const regex = new RegExp(term, flags)
      return regex.test(targetValue)
    } catch {
      // 如果正则表达式无效，回退到普通搜索
      return targetValue.toLowerCase().includes(term.toLowerCase())
    }
  } else {
    if (caseSensitive) {
      return targetValue.includes(term)
    } else {
      return targetValue.toLowerCase().includes(term.toLowerCase())
    }
  }
}

// 排序逻辑
export const sortErrorLogs = (
  data: ErrorLog[],
  sortBy: 'timestamp' | 'count' | 'severity',
  sortOrder: 'asc' | 'desc'
): ErrorLog[] => {
  return [...data].sort((a, b) => {
    let aValue: any
    let bValue: any

    switch (sortBy) {
      case 'timestamp':
        aValue = new Date(a.timestamp).getTime()
        bValue = new Date(b.timestamp).getTime()
        break
      case 'count':
        aValue = a.count
        bValue = b.count
        break
      case 'severity':
        const severityOrder = { high: 3, medium: 2, low: 1 }
        aValue = severityOrder[a.severity as keyof typeof severityOrder] || 0
        bValue = severityOrder[b.severity as keyof typeof severityOrder] || 0
        break
      default:
        return 0
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })
}

// 过滤逻辑
export const filterErrorLogs = (
  data: ErrorLog[],
  searchTerm: string,
  selectedSeverity: string,
  searchField: 'all' | 'type' | 'message' | 'page' | 'userAgent',
  useRegex: boolean,
  caseSensitive: boolean
): ErrorLog[] => {
  return data.filter((error) => {
    // 高级搜索
    const matchesSearch = performAdvancedSearch(
      error,
      searchTerm,
      searchField,
      useRegex,
      caseSensitive
    )

    // 严重程度过滤
    const matchesSeverity =
      selectedSeverity === 'all' || error.severity === selectedSeverity

    return matchesSearch && matchesSeverity
  })
}

// 分页逻辑
export const paginateData = (
  data: ErrorLog[],
  currentPage: number,
  itemsPerPage: number
): {
  paginatedData: ErrorLog[]
  totalPages: number
  startIndex: number
  endIndex: number
} => {
  const totalPages = Math.ceil(data.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = data.slice(startIndex, endIndex)

  return {
    paginatedData,
    totalPages,
    startIndex,
    endIndex,
  }
}

// 热力图数据计算
export const calculateHeatmapData = (data: ErrorLog[]) => {
  if (data.length === 0) return []

  const maxCount = Math.max(...data.map((e) => e.count))
  const safeMaxCount = maxCount > 0 ? maxCount : 1

  return data.map((error) => ({
    ...error,
    intensity: error.count / safeMaxCount,
  }))
}
 