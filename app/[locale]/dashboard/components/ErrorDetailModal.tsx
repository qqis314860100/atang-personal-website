'use client'

import { Badge } from '@/components/ui/badge'
import { useI18n } from '@/app/hooks/use-i18n'

interface ErrorDetailModalProps {
  error: any
  isOpen: boolean
  onClose: () => void
}

export function ErrorDetailModal({
  error,
  isOpen,
  onClose,
}: ErrorDetailModalProps) {
  const t = useI18n()

  if (!isOpen || !error) return null

  return (
    <div className="fixed max-h-full inset-0 bg-black/50 backdrop-blur-sm  flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            {t.dashboard('错误详情')}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">{t.dashboard('错误类型')}</p>
              <p className="text-white font-medium">{error.error_type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">{t.dashboard('严重程度')}</p>
              <Badge
                variant={error.severity === 'high' ? 'destructive' : 'outline'}
                className={
                  error.severity === 'high'
                    ? 'bg-red-500/20 border-red-500/30 text-red-400'
                    : 'bg-gray-800 border-gray-600 text-gray-300'
                }
              >
                {error.severity}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-400">{t.dashboard('发生页面')}</p>
              <p className="text-white font-medium">{error.page || '未知'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">{t.dashboard('发生时间')}</p>
              <p className="text-white font-medium">
                {new Date(error.timestamp).toLocaleString('zh-CN')}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-2">
              {t.dashboard('错误信息')}
            </p>
            <div className="bg-gray-800 rounded-lg p-3">
              <p className="text-white text-sm">{error.error_message}</p>
            </div>
          </div>

          {error.stack_trace && (
            <div>
              <p className="text-sm text-gray-400 mb-2">
                {t.dashboard('堆栈跟踪')}
              </p>
              <div className="bg-gray-800 rounded-lg p-3">
                <pre className="text-white text-xs overflow-x-auto">
                  {error.stack_trace}
                </pre>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">{t.dashboard('用户代理')}</p>
              <p className="text-white text-xs break-all">
                {error.user_agent || '未知'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">{t.dashboard('IP地址')}</p>
              <p className="text-white text-xs">{error.ip_address || '未知'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
