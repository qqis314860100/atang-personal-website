'use client'

import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Clock, MapPin, Monitor } from 'lucide-react'
import { useCallback } from 'react'
import toast from 'react-hot-toast'

interface ErrorLog {
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

interface ErrorLogItemProps {
  error: ErrorLog
  isExpanded: boolean
  onExpand: (errorId: string) => void
  onErrorClick: (errorId: string) => void
  getSeverityColor: (severity: string) => string
  getSeverityIcon: (severity: string) => React.ReactNode
  formatTimestamp: (timestamp: string) => string
  truncateMessage: (message: string, maxLength?: number) => string
}

export function ErrorLogItem({
  error,
  isExpanded,
  onExpand,
  onErrorClick,
  getSeverityColor,
  getSeverityIcon,
  formatTimestamp,
  truncateMessage,
}: ErrorLogItemProps) {
  const handleExpand = useCallback(() => {
    onExpand(error.id)
  }, [error.id, onExpand])

  const handleErrorClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onErrorClick(error.id)
    },
    [error.id, onErrorClick]
  )

  const handleCopyError = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      navigator.clipboard.writeText(JSON.stringify(error, null, 2))
      toast.success('错误信息已复制到剪贴板')
    },
    [error]
  )

  return (
    <div className="space-y-1">
      <div
        className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4 hover:bg-gray-700/30 transition-colors cursor-pointer"
        onClick={handleExpand}
      >
        <div className="flex items-start justify-between">
          {/* 左侧：错误信息 */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <div
                className={`p-1 rounded border ${getSeverityColor(
                  error.severity
                )}`}
              >
                {getSeverityIcon(error.severity)}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">
                  {error.type}
                </span>
                <Badge
                  variant="outline"
                  className="text-xs bg-gray-700/50 border-gray-600 text-gray-300"
                >
                  {error.count} 次
                </Badge>
              </div>
            </div>

            <div className="ml-8">
              <p className="text-sm text-gray-300 leading-relaxed">
                {truncateMessage(error.message)}
              </p>

              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{error.page}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatTimestamp(error.timestamp)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Monitor className="w-3 h-3" />
                  <span>{error.source || 'frontend'}</span>
                </div>
                {error.traceId && (
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-xs">{error.traceId}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 右侧：操作和状态 */}
          <div className="flex items-center gap-2 ml-4">
            <Badge
              variant="outline"
              className={`text-xs ${getSeverityColor(error.severity)}`}
            >
              {error.severity}
            </Badge>
          </div>
        </div>
      </div>

      {/* 展开的详细信息 */}
      {isExpanded && (
        <div className="ml-4 p-4 bg-gray-800/20 border border-gray-700/30 rounded-lg space-y-4">
          {/* 完整错误信息 */}
          <div>
            <h4 className="text-sm font-medium text-white mb-2">错误详情</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">错误类型:</span>
                <span className="text-gray-300 font-mono">{error.type}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">错误消息:</span>
                <span className="text-gray-300">{error.message}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">发生次数:</span>
                <span className="text-gray-300">{error.count} 次</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">最后发生:</span>
                <span className="text-gray-300">
                  {formatTimestamp(error.timestamp)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">严重程度:</span>
                <span className="text-gray-300 capitalize">
                  {error.severity}
                </span>
              </div>
            </div>
          </div>

          {/* 堆栈跟踪 */}
          {error.stackTrace && (
            <div>
              <h4 className="text-sm font-medium text-white mb-2">堆栈跟踪</h4>
              <pre className="text-xs text-gray-300 bg-gray-900/50 p-3 rounded border border-gray-700/50 overflow-x-auto">
                {error.stackTrace}
              </pre>
            </div>
          )}

          {/* 上下文信息 */}
          <div>
            <h4 className="text-sm font-medium text-white mb-2">上下文信息</h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-400">页面路径:</span>
                <span className="text-gray-300 ml-2">{error.page}</span>
              </div>
              <div>
                <span className="text-gray-400">错误来源:</span>
                <span className="text-gray-300 ml-2">
                  {error.source || 'frontend'}
                </span>
              </div>

              {error.traceId && (
                <div>
                  <span className="text-gray-400">追踪ID:</span>
                  <span className="text-gray-300 ml-2 font-mono">
                    {error.traceId}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 浏览器内核 */}
          {error.userAgent && (
            <div>
              <h4 className="text-sm font-medium text-white mb-2">
                浏览器内核
              </h4>
              <p className="text-xs text-gray-300 bg-gray-900/50 p-3 rounded border border-gray-700/50 break-all">
                {error.userAgent}
              </p>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-700/50">
            <button
              onClick={handleErrorClick}
              className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded hover:bg-blue-500/30 transition-colors cursor-pointer"
            >
              查看完整详情
            </button>
            <button
              onClick={handleCopyError}
              className="px-3 cursor-pointer hover:text-white py-1 bg-gray-700/50 text-gray-300 text-xs rounded hover:bg-gray-600/50 transition-colors"
            >
              复制错误信息
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
