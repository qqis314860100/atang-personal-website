import { VideoPlayer } from './components/VideoPlayer'
import { VideoInfo } from './components/VideoInfo'
import { DanmakuList } from './components/DanmakuList'

interface VideoPlayerPageProps {
  searchParams: Promise<{
    id?: string
  }>
}

export default async function VideoPlayerPage({
  searchParams,
}: VideoPlayerPageProps) {
  const params = await searchParams
  const videoId = params.id || 'example-video-id'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl-100 mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* 主视频区域 */}
          <div className="lg:col-span-7 space-y-6">
            {/* 视频播放器 */}
            <VideoPlayer videoId={videoId} />

            {/* 视频信息 */}
            <VideoInfo videoId={videoId} />
          </div>

          {/* 侧边栏 - 弹幕列表 */}
          <div className="lg:col-span-3">
            <DanmakuList videoId={videoId} />
          </div>
        </div>
      </div>
    </div>
  )
}
