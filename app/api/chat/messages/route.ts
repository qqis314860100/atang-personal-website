import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'

// 获取聊天消息
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const roomId = searchParams.get('roomId') || 'main'

    const messages = await prisma.chatMessage.findMany({
      where: { roomId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        username: true,
        message: true,
        messageType: true,
        createdAt: true,
        isSystem: true,
      },
    })

    return NextResponse.json({
      success: true,
      messages: messages.reverse(),
    })
  } catch (error) {
    console.error('获取聊天消息失败:', error)
    return NextResponse.json(
      { success: false, error: '获取消息失败' },
      { status: 500 }
    )
  }
}

// 发送聊天消息
export async function POST(request: NextRequest) {
  try {
    const { username, message, roomId = 'main' } = await request.json()

    if (!username || !message) {
      return NextResponse.json(
        { success: false, error: '用户名和消息不能为空' },
        { status: 400 }
      )
    }

    const newMessage = await prisma.chatMessage.create({
      data: {
        roomId,
        username,
        message,
        messageType: 'text',
        isSystem: false,
      },
      select: {
        id: true,
        username: true,
        message: true,
        messageType: true,
        createdAt: true,
        isSystem: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: newMessage,
    })
  } catch (error) {
    console.error('发送消息失败:', error)
    return NextResponse.json(
      { success: false, error: '发送消息失败' },
      { status: 500 }
    )
  }
}
