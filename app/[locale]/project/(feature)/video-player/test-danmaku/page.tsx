'use client'

import { useEffect, useRef } from 'react'
import { createDanmakuSupabaseExample } from '../lib/danmaku-supabase-example'
import { DanmakuType } from '../lib/danmaku-system'

export default function TestDanmakuPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const danmakuExampleRef = useRef<any>(null)

  useEffect(() => {
    if (videoRef.current && containerRef.current) {
      // 初始化弹幕系统
      danmakuExampleRef.current = createDanmakuSupabaseExample(
        videoRef.current,
        containerRef.current
      )
    }
  }, [])

  const sendDanmaku = async (
    content: string,
    type: DanmakuType = DanmakuType.SCROLL
  ) => {
    if (danmakuExampleRef.current) {
      await danmakuExampleRef.current.sendDanmaku(content, type)
    }
  }

  const getStats = async () => {
    if (danmakuExampleRef.current) {
      const stats = await danmakuExampleRef.current.getDanmakuStats('video-123')
      console.log('弹幕统计:', stats)
    }
  }

  const getHotDanmaku = async () => {
    if (danmakuExampleRef.current) {
      const hotDanmaku = await danmakuExampleRef.current.getHotDanmaku(
        'video-123',
        5
      )
      console.log('热门弹幕:', hotDanmaku)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          弹幕系统测试页面
        </h1>

        {/* 视频播放器 */}
        <div className="mb-8">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full aspect-video"
              src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
              controls
            />
            {/* 弹幕容器 */}
            <div
              ref={containerRef}
              className="absolute inset-0 pointer-events-none"
            />
          </div>
        </div>

        {/* 控制面板 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">弹幕控制</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 发送弹幕 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                发送弹幕
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="输入弹幕内容"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.target as HTMLInputElement
                      sendDanmaku(input.value)
                      input.value = ''
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const input = document.querySelector(
                      'input[placeholder="输入弹幕内容"]'
                    ) as HTMLInputElement
                    if (input.value) {
                      sendDanmaku(input.value)
                      input.value = ''
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  发送
                </button>
              </div>
            </div>

            {/* 弹幕类型 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                弹幕类型
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => sendDanmaku('滚动弹幕', DanmakuType.SCROLL)}
                  className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                >
                  滚动
                </button>
                <button
                  onClick={() => sendDanmaku('顶部弹幕', DanmakuType.TOP)}
                  className="px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm"
                >
                  顶部
                </button>
                <button
                  onClick={() => sendDanmaku('底部弹幕', DanmakuType.BOTTOM)}
                  className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
                >
                  底部
                </button>
                <button
                  onClick={() => sendDanmaku('逆向弹幕', DanmakuType.REVERSE)}
                  className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                >
                  逆向
                </button>
              </div>
            </div>

            {/* 快速发送 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                快速发送
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => sendDanmaku('666')}
                  className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                >
                  666
                </button>
                <button
                  onClick={() => sendDanmaku('太棒了')}
                  className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                >
                  太棒了
                </button>
                <button
                  onClick={() => sendDanmaku('学到了')}
                  className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                >
                  学到了
                </button>
                <button
                  onClick={() => sendDanmaku('支持')}
                  className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                >
                  支持
                </button>
              </div>
            </div>

            {/* 统计信息 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                统计信息
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={getStats}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  获取统计
                </button>
                <button
                  onClick={getHotDanmaku}
                  className="px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm"
                >
                  热门弹幕
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 说明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">使用说明</h3>
          <ul className="text-blue-800 space-y-1 text-sm">
            <li>• 点击视频播放，弹幕会根据视频时间自动显示</li>
            <li>• 在输入框中输入弹幕内容，按回车或点击发送按钮</li>
            <li>• 选择不同的弹幕类型：滚动、顶部、底部、逆向</li>
            <li>• 点击快速发送按钮发送预设弹幕</li>
            <li>• 点击"获取统计"查看弹幕统计信息</li>
            <li>• 点击"热门弹幕"查看热门弹幕列表</li>
            <li>• 打开浏览器控制台查看详细日志</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
