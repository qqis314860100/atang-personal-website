'use client'
import { DraggableButton } from '@/app/components/draggable'
import { FullscreenModal } from '@/app/components/modal'
import { MessageSquare } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const AIAgent = dynamic(() => import('@/app/components/ai-agent/ai-agent'), {
  ssr: false,
})

export default function AIAgentTrigger() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // 初始化
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  // 计算初始位置（右侧底部）
  const getInitialPosition = () => {
    if (typeof window !== 'undefined') {
      return {
        x: window.innerWidth - 100,
        y: window.innerHeight - 100,
      }
    }
    return { x: 0, y: 0 }
  }

  if (!mounted) return null

  return (
    <>
      {/* 浮动按钮 - 可拖动 */}
      <DraggableButton
        initialPosition={getInitialPosition()}
        onClick={handleOpen}
        onDragStart={() => {}}
        onDragEnd={() => {}}
        onDrag={() => {}}
      >
        <MessageSquare className="w-8 h-8" />
      </DraggableButton>

      {/* AI助手弹窗 - 始终保持在 DOM 中 */}
      <FullscreenModal
        isOpen={open}
        onClose={handleClose}
        title="AI助手"
        draggable={false}
        size={{
          width: 'w-[500px]',
          height: 'h-[600px]',
          maxWidth: 'max-w-[90vw]',
          maxHeight: 'max-h-[80vh]',
        }}
        animation={{
          duration: 500,
          easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          scale: 0.8,
          translateY: 20,
          opacity: 0.8,
        }}
        scrollLock={{
          enabled: true,
          selector: 'div, section, article, aside, main, nav, header, footer',
          preserveScrollPosition: true,
        }}
      >
        <AIAgent />
      </FullscreenModal>
    </>
  )
}
