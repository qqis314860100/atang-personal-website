'use client'

import dynamic from 'next/dynamic'

export const ChatRoom = dynamic(
  () => import('@/app/[locale]/project/(feature)/chat-room/page'),
  { ssr: false }
)
export const OnlineVisitors = dynamic(
  () => import('@/app/[locale]/project/components/visitors-tips'),
  { ssr: false }
)
