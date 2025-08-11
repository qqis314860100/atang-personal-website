interface VideoPlayerSkeletonProps {
  stage?: 'id' | 'video' | 'complete'
}

export function VideoPlayerSkeleton({
  stage = 'id',
}: VideoPlayerSkeletonProps) {
  const getStageDescription = () => {
    switch (stage) {
      case 'id':
        return '从URL参数中解析视频标识符'
      case 'video':
        return '获取视频信息、URL和元数据'
      case 'complete':
        return '所有数据已准备就绪'
      default:
        return '请稍候...'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* 主视频区域骨架屏 */}
          <div className="lg:col-span-7 space-y-6">
            {/* 视频播放器骨架屏 */}
            <div className="space-y-4">
              {/* 标题骨架屏 */}
              <div className="space-y-3">
                <div className="h-7 skeleton-shimmer rounded w-3/4"></div>
                <div className="h-5 skeleton-shimmer rounded w-1/2"></div>
              </div>

              {/* 视频播放器骨架屏 */}
              <div className="relative w-full aspect-video bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-gray-600 text-lg font-medium">
                      {stage === 'id' ? '等待视频ID...' : '加载视频中...'}
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      {getStageDescription()}
                    </p>

                    {/* 阶段指示器 */}
                    <div className="mt-3 flex items-center justify-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          stage === 'id' ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                      ></div>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          stage === 'video' ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                      ></div>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          stage === 'complete' ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 视频信息骨架屏 */}
            <div className="space-y-6">
              {/* 标题和描述 */}
              <div className="space-y-3">
                <div className="h-8 skeleton-shimmer rounded w-2/3"></div>
                <div className="h-4 skeleton-shimmer rounded w-full"></div>
                <div className="h-4 skeleton-shimmer rounded w-4/5"></div>
                <div className="h-4 skeleton-shimmer rounded w-3/4"></div>
              </div>

              {/* 统计信息骨架屏 */}
              <div className="flex flex-wrap gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i}>
                    <div className="h-6 skeleton-shimmer rounded w-24"></div>
                  </div>
                ))}
              </div>

              {/* 标签骨架屏 */}
              <div className="flex flex-wrap gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i}>
                    <div className="h-7 skeleton-shimmer rounded-full w-20"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 侧边栏骨架屏 */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* 标题 */}
              <div>
                <div className="h-6 skeleton-shimmer rounded w-1/2"></div>
              </div>

              {/* 弹幕列表骨架屏 */}
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i}>
                    <div className="h-20 skeleton-shimmer rounded-lg"></div>
                  </div>
                ))}
              </div>

              {/* 加载更多按钮骨架屏 */}
              <div>
                <div className="h-10 skeleton-shimmer rounded-lg w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
