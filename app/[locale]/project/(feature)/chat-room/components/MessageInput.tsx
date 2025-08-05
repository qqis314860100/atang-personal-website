'use client'

import { useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Smile, Paperclip, Mic } from 'lucide-react'

interface MessageInputProps {
  inputMessage: string
  onInputChange: (value: string) => void
  onSendMessage: () => void
  isConnected: boolean
  isLoading: boolean
}

export function MessageInput({
  inputMessage,
  onInputChange,
  onSendMessage,
  isConnected,
  isLoading,
}: MessageInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSendMessage()
    }
  }

  // 发送消息后重新聚焦输入框
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isLoading])

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-3">
      <div className="flex items-end gap-2">
        {/* 左侧功能按钮 */}
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 chat-button"
          >
            <Smile className="h-4 w-4" />
          </Button>
        </div>

        {/* 输入框 */}
        <div className="flex-1">
          <Input
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入消息..."
            disabled={!isConnected || isLoading}
            className="rounded-full bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 py-2 text-sm chat-input"
            style={{
              minHeight: '36px',
              fontSize: '14px',
            }}
          />
        </div>

        {/* 右侧按钮 */}
        <div className="flex gap-1">
          {inputMessage.trim() ? (
            // 发送按钮
            <Button
              onClick={onSendMessage}
              disabled={!isConnected || isLoading}
              size="icon"
              className="h-8 w-8 bg-blue-500 hover:bg-blue-600 rounded-full text-white chat-button"
            >
              <Send className="h-4 w-4" />
            </Button>
          ) : (
            // 语音按钮
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 chat-button"
            >
              <Mic className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
