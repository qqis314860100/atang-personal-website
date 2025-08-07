import { VideoPlayer } from '../components/VideoPlayer'

export default function VideoPlayerTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          B站风格视频播放器测试
        </h1>

        <div className="space-y-8">
          {/* 测试视频1 */}
          <div>
            <h2 className="text-xl font-semibold mb-4">
              测试视频 1 - Big Buck Bunny
            </h2>
            <VideoPlayer
              videoUrl="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
              title="更恐怖的是,40万还不是最高的!《凡人修仙传》每日增量数据"
            />
          </div>

          {/* 测试视频2 */}
          <div>
            <h2 className="text-xl font-semibold mb-4">
              测试视频 2 - Elephants Dream
            </h2>
            <VideoPlayer
              videoUrl="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
              title="Elephants Dream - 开源动画电影"
            />
          </div>
        </div>

        {/* 功能说明 */}
        <div className="mt-12 p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">功能特性</h3>
          <ul className="space-y-2 text-gray-700">
            <li>✅ 视频播放/暂停控制</li>
            <li>✅ 音量控制和静音</li>
            <li>✅ 进度条拖拽</li>
            <li>✅ 全屏模式</li>
            <li>✅ 弹幕发送和显示</li>
            <li>✅ 键盘快捷键（空格键播放/暂停）</li>
            <li>✅ 自动隐藏控制栏</li>
            <li>✅ 响应式设计</li>
            <li>✅ 弹幕动画效果</li>
            <li>✅ 弹幕颜色随机</li>
          </ul>

          <h3 className="text-lg font-semibold mb-4 mt-6">使用说明</h3>
          <ul className="space-y-2 text-gray-700">
            <li>🎮 点击播放按钮或按空格键播放/暂停</li>
            <li>🔊 使用音量滑块调节音量</li>
            <li>📱 在弹幕输入框输入内容并发送弹幕</li>
            <li>🖱️ 拖拽进度条跳转到指定时间</li>
            <li>⛶ 点击全屏按钮进入全屏模式</li>
            <li>⌨️ 空格键：播放/暂停</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
