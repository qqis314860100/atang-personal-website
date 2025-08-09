'use client'

import { Pagination } from '@/app/components/pagination/pagination'
import { AlertTriangle } from 'lucide-react'
import { useMemo } from 'react'
import { ErrorLogItem } from './ErrorLogItem'
import {
  ErrorLog,
  PAGINATION_CONFIG,
  paginateData,
  getSeverityColor,
  getSeverityIcon,
  formatTimestamp,
  truncateMessage,
} from './ErrorLogs.utils'

interface ErrorLogsListProps {
  data: ErrorLog[]
  expandedError: string | null
  isLoading?: boolean // API加载状态
  onErrorExpand: (errorId: string | null) => void
  onErrorClick: (errorId: string) => void
}

export function ErrorLogsList({
  data,
  expandedError,
  isLoading = false,
  onErrorExpand,
  onErrorClick,
}: ErrorLogsListProps) {
  return (
    <div className="space-y-0 h-full">
      {/* 日志列表 */}
      <div className="space-y-1 min-h-[400px] h-full">
        {data.length > 0 ? (
          data.map((error) => {
            const isExpanded = expandedError === error.id

            return (
              <ErrorLogItem
                key={error.id}
                error={error}
                isExpanded={isExpanded}
                onExpand={onErrorExpand}
                onErrorClick={onErrorClick}
                getSeverityColor={getSeverityColor}
                getSeverityIcon={getSeverityIcon}
                formatTimestamp={formatTimestamp}
                truncateMessage={truncateMessage}
              />
            )
          })
        ) : (
          <div className="text-center py-12 text-gray-400">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">暂无错误日志</p>
            <p className="text-sm">当前筛选条件下没有找到相关的错误日志</p>
          </div>
        )}
      </div>
    </div>
  )
}
