'use client'

import React, { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import {
  Send,
  Trash2,
  Download,
  Copy,
  Bot,
  User,
  X,
  Square,
} from 'lucide-react'

const API_URL = '/api'

const AIAgent: React.FC = () => {
  const [query, setQuery] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionId] = useState(`session-${Date.now()}`)
  const [chatHistory, setChatHistory] = useState<
    { role: string; content: string | object; timestamp?: Date }[]
  >([])
  const [isLoading, setIsLoading] = useState(true) // 骨架屏状态
  const chatEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    // 模拟加载完成
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, isProcessing])

  const clearHistory = async () => {
    try {
      await fetch(`${API_URL}/agent/clear-history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })
      setChatHistory([])
      setError(null)
    } catch (err) {
      setError('清除历史记录失败')
    }
  }

  const addToChatHistory = (role: string, content: string | object) => {
    setChatHistory((prev) => [
      ...prev,
      {
        role,
        content,
        timestamp: new Date(),
      },
    ])
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  const exportChat = () => {
    const chatText = chatHistory
      .map(
        (msg) =>
          `${msg.role === 'user' ? '我' : 'AI助手'}: ${
            typeof msg.content === 'string'
              ? msg.content
              : JSON.stringify(msg.content)
          }`
      )
      .join('\n\n')

    const blob = new Blob([chatText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `AI助手对话_${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const stopProcessing = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setIsProcessing(false)
    setError('查询已终止')
  }

  const processQuery = async () => {
    if (!query.trim() || isProcessing) return

    setIsProcessing(true)
    setError(null)
    addToChatHistory('user', query)

    // 创建新的AbortController
    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch(`${API_URL}/agent/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, sessionId }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`)
      if (!response.body) throw new Error('流式响应体不存在')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let assistantResponse = ''
      let isFirstChunk = true

      // 添加空的assistant消息用于流式更新
      addToChatHistory('assistant', '')

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))

              // 处理最终答案
              if (data.type === 'final_answer') {
                assistantResponse += data.value
                // 更新最后一条消息
                setChatHistory((prev) => {
                  const newHistory = [...prev]
                  const lastMessage = newHistory[newHistory.length - 1]
                  if (lastMessage && lastMessage.role === 'assistant') {
                    lastMessage.content = assistantResponse
                  }
                  return newHistory
                })
              }

              // 处理工具调用结果（不显示工具调用提示）
              if (data.type === 'tool_call_result') {
                // 工具调用结果会被渲染在assistant消息中，不需要单独显示
              }
            } catch (error) {
              console.error('解析流数据失败:', error)
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('请求已取消')
      } else {
        console.error('处理查询失败:', error)
        setError(`处理失败: ${error.message}`)
      }
    } finally {
      setIsProcessing(false)
      abortControllerRef.current = null
    }
  }

  const renderContent = (content: string | object) => {
    if (typeof content === 'object') {
      try {
        const contentStr =
          typeof content === 'string' ? content : JSON.stringify(content)
        if (
          contentStr.includes('"result"') &&
          contentStr.includes('"results"')
        ) {
          return renderSearchResults(contentStr)
        }
        if (
          contentStr.includes('"temperature"') ||
          contentStr.includes('"humidity"') ||
          contentStr.includes('"wind"')
        ) {
          return renderWeatherData(contentStr)
        }
        if (contentStr.includes('工具') && contentStr.includes('返回结果')) {
          return renderToolResult(contentStr)
        }
        return (
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
            {JSON.stringify(content, null, 2)}
          </pre>
        )
      } catch (error) {
        return (
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
            {JSON.stringify(content, null, 2)}
          </pre>
        )
      }
    }
    const contentStr = String(content)
    if (contentStr.includes('工具') && contentStr.includes('返回结果')) {
      return renderToolResult(contentStr)
    }
    return (
      <ReactMarkdown
        rehypePlugins={[rehypeRaw]}
        components={{
          p: ({ node, ...props }) => <p className="max-w-none" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    )
  }

  const renderWeatherData = (contentStr: string) => {
    try {
      const data = JSON.parse(contentStr)
      if (data.error) {
        return <div className="text-red-600">{data.error}</div>
      }

      return (
        <div className="bg-gradient-to-br from-blue-50 to-green-50 border border-green-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-6 h-6 text-yellow-500">☀️</div>
            <h3 className="font-semibold text-gray-800">{data.city}天气</h3>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-blue-600">
              {data.temperature}
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <div>天气 {data.description}</div>
              {data.humidity && <div>湿度 {data.humidity}</div>}
              {data.wind && <div>风力 {data.wind}</div>}
              {data.updateTime && <div>更新 {data.updateTime}</div>}
            </div>
          </div>
        </div>
      )
    } catch (error) {
      return <div className="text-red-600">天气数据解析失败</div>
    }
  }

  const renderSearchResults = (contentStr: string) => {
    try {
      const data = JSON.parse(contentStr)
      if (data.error) {
        return <div className="text-red-600">{data.error}</div>
      }

      return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-5 h-5 text-blue-500">🔍</div>
            <h3 className="font-semibold text-gray-800">搜索结果</h3>
          </div>
          <div className="space-y-3">
            {data.results &&
              data.results.slice(0, 3).map((result: any, index: number) => (
                <div key={index} className="border-l-4 border-blue-200 pl-3">
                  <h4 className="font-medium text-gray-800 mb-1 line-clamp-2">
                    {result.title}
                  </h4>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {cleanHtmlContent(result.content)}
                  </p>
                  {result.url && (
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 mt-1 inline-block"
                    >
                      查看详情 →
                    </a>
                  )}
                </div>
              ))}
          </div>
        </div>
      )
    } catch (error) {
      return <div className="text-red-600">搜索结果解析失败</div>
    }
  }

  const renderToolResult = (contentStr: string) => {
    try {
      // 尝试解析工具结果
      const data = JSON.parse(contentStr)
      if (data.temperature || data.humidity || data.wind) {
        return renderWeatherData(contentStr)
      }
      if (data.results && Array.isArray(data.results)) {
        return renderSearchResults(contentStr)
      }
      return <div className="text-gray-600">工具执行完成</div>
    } catch (error) {
      return <div className="text-gray-600">{contentStr}</div>
    }
  }

  const cleanHtmlContent = (content: string) => {
    return content
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim()
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // 骨架屏组件
  const SkeletonLoader = () => (
    <div className="w-full h-full flex flex-col bg-gray-50 animate-pulse">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <div className="flex justify-start">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-gray-300"></div>
            <div className="bg-gray-200 rounded-2xl px-4 py-3 w-64 h-16"></div>
          </div>
        </div>
        <div className="flex justify-end">
          <div className="flex items-start space-x-3 flex-row-reverse space-x-reverse">
            <div className="w-8 h-8 rounded-full bg-gray-300"></div>
            <div className="bg-gray-200 rounded-2xl px-4 py-3 w-48 h-12"></div>
          </div>
        </div>
        <div className="flex justify-start">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-gray-300"></div>
            <div className="bg-gray-200 rounded-2xl px-4 py-3 w-80 h-20"></div>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-200 bg-white p-4 rounded-b-2xl">
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <div className="w-full h-12 bg-gray-200 rounded-2xl"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-2xl flex-shrink-0"></div>
        </div>
      </div>
    </div>
  )

  if (isLoading) {
    return <SkeletonLoader />
  }

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      <style jsx>{`
        .typing-cursor {
          animation: blink 1s infinite;
          color: #3b82f6;
          font-weight: bold;
        }
        @keyframes blink {
          0%,
          50% {
            opacity: 1;
          }
          51%,
          100% {
            opacity: 0;
          }
        }
        .typing-animation {
          display: inline;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      {/* 聊天区域 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {chatHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <Bot className="w-16 h-16 mb-4 text-blue-500" />
            <h3 className="text-lg font-semibold mb-2">欢迎使用AI助手</h3>
            <p className="text-sm">我可以帮你解答问题、编写代码、分析数据等</p>
            <div className="mt-4 space-y-2 text-xs">
              <p>💡 试试问我：</p>
              <div className="space-y-1">
                <button
                  onClick={() => setQuery('帮我写一个React组件')}
                  className="block w-full text-left px-3 py-2 bg-white rounded-lg border hover:bg-blue-50 transition-colors"
                >
                  "帮我写一个React组件"
                </button>
                <button
                  onClick={() => setQuery('解释一下什么是TypeScript')}
                  className="block w-full text-left px-3 py-2 bg-white rounded-lg border hover:bg-blue-50 transition-colors"
                >
                  "解释一下什么是TypeScript"
                </button>
                <button
                  onClick={() => setQuery('计算 2 + 2 * 3')}
                  className="block w-full text-left px-3 py-2 bg-white rounded-lg border hover:bg-blue-50 transition-colors"
                >
                  "计算 2 + 2 * 3"
                </button>
              </div>
            </div>
          </div>
        ) : (
          chatHistory.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`flex items-start space-x-3 max-w-[80%] ${
                  msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                {/* 头像 */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>

                {/* 消息内容 */}
                <div
                  className={`rounded-2xl px-4 py-3 shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  <div className="text-sm leading-relaxed">
                    {msg.role === 'assistant' &&
                    isProcessing &&
                    msg === chatHistory[chatHistory.length - 1] ? (
                      <span className="typing-animation">
                        {renderContent(msg.content)}
                        <span className="typing-cursor">|</span>
                      </span>
                    ) : (
                      renderContent(msg.content)
                    )}
                  </div>

                  {/* 消息操作按钮 */}
                  {msg.role === 'assistant' && (
                    <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() =>
                          copyToClipboard(
                            typeof msg.content === 'string'
                              ? msg.content
                              : JSON.stringify(msg.content)
                          )
                        }
                        className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700 transition-colors"
                        title="复制"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      {msg.timestamp && (
                        <span className="text-xs text-gray-400 ml-auto">
                          {formatTime(msg.timestamp)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {/* 正在输入指示器 */}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <Bot className="w-4 h-4 text-gray-600" />
              </div>
              <div className="bg-white rounded-2xl px-4 py-3 border border-gray-200 shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="border-t border-gray-200 bg-white p-4 rounded-b-2xl">
        {error && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-red-600 text-sm">{error}</div>
          </div>
        )}

        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !isProcessing) {
                  e.preventDefault()
                  processQuery()
                }
              }}
              placeholder="有问题，尽管问，shift+enter换行..."
              disabled={isProcessing}
              rows={1}
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60 text-sm"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>

          <div className="flex items-center">
            {isProcessing ? (
              <button
                onClick={stopProcessing}
                className="p-3 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-colors flex-shrink-0"
                title="停止查询"
              >
                <Square className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={processQuery}
                disabled={!query.trim()}
                className="p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:opacity-60 transition-colors flex-shrink-0"
                title="发送消息"
              >
                <Send className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* 功能按钮 */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <button
              onClick={clearHistory}
              disabled={isProcessing}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="清除历史"
            >
              <Trash2 className="w-4 h-4" />
              <span>清除历史</span>
            </button>
            <button
              onClick={exportChat}
              disabled={chatHistory.length === 0}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="导出对话"
            >
              <Download className="w-4 h-4" />
              <span>导出</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIAgent
