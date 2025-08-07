'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import { MessageSquare, X, Minimize2, Maximize2 } from 'lucide-react'

const AIAgent = dynamic(
  () => import('@/app/[locale]/project/components/ai-agent'),
  { ssr: false }
)

export default function AIAgentTrigger() {
  const [open, setOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [key, setKey] = useState(0) // 用于强制重新渲染

  const handleClose = () => {
    setOpen(false)
    setIsMinimized(false)
    // 增加key值，确保下次打开时组件重新渲染
    setKey((prev) => prev + 1)
  }

  const handleOpen = () => {
    setOpen(true)
    setIsMinimized(false)
  }

  return (
    <>
      {/* 浮动按钮 */}
      <button
        className="fixed z-50 bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-2xl w-16 h-16 flex items-center justify-center hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-110 hover:shadow-3xl"
        onClick={handleOpen}
        title="打开AI助手"
      >
        <MessageSquare className="w-8 h-8" />
        {/* 脉冲动画 */}
        <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20"></div>
      </button>

      {/* AI助手弹窗 */}
      {open && (
        <div className="fixed z-50 inset-0 bg-black/20 backdrop-blur-sm flex items-end justify-end p-4">
          <div
            className={`bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col transition-all duration-500 ease-out transform ${
              isMinimized
                ? 'w-80 h-16'
                : 'w-[500px] h-[600px] max-w-[90vw] max-h-[80vh]'
            } ${
              open
                ? 'translate-y-0 opacity-100 scale-100'
                : 'translate-y-full opacity-0 scale-95'
            }`}
          >
            {/* 头部 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-bold text-lg text-gray-800">AI助手</span>
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                  在线
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title={isMinimized ? '展开' : '最小化'}
                >
                  {isMinimized ? (
                    <Maximize2 className="w-4 h-4 text-gray-600" />
                  ) : (
                    <Minimize2 className="w-4 h-4 text-gray-600" />
                  )}
                </button>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                  title="关闭"
                >
                  <X className="w-4 h-4 text-gray-600 group-hover:text-red-600 transition-colors" />
                </button>
              </div>
            </div>

            {/* 内容区域 */}
            {!isMinimized && (
              <div className="flex-1 overflow-hidden">
                <AIAgent key={key} />
              </div>
            )}

            {/* 最小化时的显示 */}
            {isMinimized && (
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-sm text-gray-600">AI助手已最小化</span>
                <button
                  onClick={() => setIsMinimized(false)}
                  className="text-blue-600 text-sm hover:text-blue-700"
                >
                  展开
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
